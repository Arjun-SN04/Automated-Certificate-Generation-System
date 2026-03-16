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

// ── Helper: ensure a participant has a guaranteed-unique cert_sequence ────────
//
// reserveCertSequence() now scans the entire Participant collection for the
// true highest number ever issued for this training type (across ALL airlines)
// and returns max + 1. So we simply:
//   • If the participant has no cert_sequence yet → reserve one and save.
//   • If the participant already has a cert_sequence → check whether any
//     OTHER participant holds the same number. If a collision exists, reserve
//     a fresh number (which will be higher than every existing one).
async function ensureUniqueCertSequence(participant) {
  if (!participant.cert_sequence) {
    participant.cert_sequence = await reserveCertSequence(participant.training_type);
    await participant.save();
    return;
  }

  // Collision check — does any other participant share this number?
  const collision = await Participant.findOne({
    _id:           { $ne: participant._id },
    training_type: participant.training_type,
    cert_sequence: participant.cert_sequence,
  });

  if (collision) {
    // reserveCertSequence looks at the real DB max, so this is always safe
    participant.cert_sequence = await reserveCertSequence(participant.training_type);
    await participant.save();
  }
}

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

    // Assign cert_sequence — reserve fresh if missing OR if a duplicate exists
    const incomingVariant = req.query.variant || 'default';
    await ensureUniqueCertSequence(participant);
    if (participant.templateVariant !== incomingVariant) {
      participant.templateVariant = incomingVariant;
      await participant.save();
    }

    const data = participant.toObject();
    data.templateVariant = incomingVariant;

    const pdfBuffer = await generateCertificate(data);

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

    // Use saved templateVariant (set when cert was generated), or query param override
    data.templateVariant = req.query.variant || participant.templateVariant || 'default';

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

    // Assign cert_sequence — reserve fresh if missing OR if a duplicate exists
    await ensureUniqueCertSequence(participant);

    // Override modules if provided in body
    if (req.body.modules) {
      const modules = Array.isArray(req.body.modules)
        ? req.body.modules.join(',')
        : req.body.modules;
      participant.modules = modules;
    }

    // Save templateVariant too
    const postVariant = req.body.templateVariant || req.query.variant || 'default';
    participant.templateVariant = postVariant;

    // Single save — persists cert_sequence, modules, and templateVariant atomically
    await participant.save();

    const data = participant.toObject();
    data.templateVariant = postVariant;

    const pdfBuffer = await generateCertificate(data);

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

// ── POST /counters/reset — reset counter for one or all training types ───────────
router.post('/counters/reset', async (req, res) => {
  try {
    const { CertCounter } = require('../models/CertCounter');
    if (req.body.all) {
      await CertCounter.updateMany({}, { $set: { seq: 0 } });
      return res.json({ message: 'All counters reset to 0' });
    }
    if (!req.body.training_type) {
      return res.status(400).json({ error: 'training_type or all required' });
    }
    await CertCounter.findOneAndUpdate(
      { training_type: req.body.training_type },
      { $set: { seq: 0 } },
      { upsert: true }
    );
    res.json({ message: `Counter for ${req.body.training_type} reset to 0` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
