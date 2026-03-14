const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const { generateCertificate, MODULES_LIST } = require('../services/certificateGenerator');
const { authMiddleware } = require('./auth');
const { reserveCertSequence } = require('../models/CertCounter');

// Certificate routes accept token via Authorization header OR ?token= query param
// (needed for iframe/anchor direct URL access that can't set custom headers)
function certAuth(req, res, next) {
  // Allow token from query string for iframe/direct URL access
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return authMiddleware(req, res, next);
}

router.use(certAuth);

// ── Helper: set PDF response headers ─────────────────────────────────────────
function setPdfHeaders(res, filename, disposition = 'attachment') {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
  // Allow cross-origin reads (needed when frontend and API are on different ports)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
}

// ── GET /generate/:id — download PDF ─────────────────────────────────────────
router.get('/generate/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    // ── Assign cert_sequence NOW (first generate only) — never on preview ──────
    if (!participant.cert_sequence) {
      participant.cert_sequence = await reserveCertSequence(participant.training_type);
      await participant.save();
    }

    const pdfBuffer = await generateCertificate(participant.toObject());

    const sanitizedName = participant.participant_name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${sanitizedName}_${participant.training_type.replace(/\s+/g, '_')}.pdf`;

    setPdfHeaders(res, filename, 'attachment');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// ── GET /preview/:id — inline preview ────────────────────────────────────────
router.get('/preview/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    const data = participant.toObject();

    // Allow overriding modules via query param (for recurrent preview before saving)
    if (req.query.modules) {
      data.modules = req.query.modules;
    }

    const pdfBuffer = await generateCertificate(data);

    const sanitizedName = participant.participant_name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${sanitizedName}_Preview.pdf`;

    setPdfHeaders(res, filename, 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate preview error:', error);
    res.status(500).json({ error: 'Failed to preview certificate' });
  }
});

// ── POST /generate/:id — generate with custom modules (recurrent) ─────────────
router.post('/generate/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    // ── Assign cert_sequence NOW (first generate only) — never on preview ──────
    if (!participant.cert_sequence) {
      participant.cert_sequence = await reserveCertSequence(participant.training_type);
    }

    // Override modules if provided in body
    if (req.body.modules) {
      const modules = Array.isArray(req.body.modules)
        ? req.body.modules.join(',')
        : req.body.modules;
      participant.modules = modules;
    }

    // Single save — persists both cert_sequence and modules atomically
    await participant.save();

    const pdfBuffer = await generateCertificate(participant.toObject());

    const sanitizedName = participant.participant_name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${sanitizedName}_${participant.training_type.replace(/\s+/g, '_')}.pdf`;

    setPdfHeaders(res, filename, 'attachment');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error (POST):', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// ── GET /modules — list available modules ─────────────────────────────────────
router.get('/modules', (req, res) => {
  res.json(MODULES_LIST);
});

// ── GET /counters — current cert sequence counters per training type ───────────
router.get('/counters', async (req, res) => {
  try {
    const { CertCounter } = require('../models/CertCounter');
    const counters = await CertCounter.find({}).sort({ training_type: 1 }).lean();
    res.json(counters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
