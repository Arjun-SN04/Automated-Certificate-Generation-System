const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const { generateCertificate, MODULES_LIST } = require('../services/certificateGenerator');

// Generate certificate PDF for a participant
router.get('/generate/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const pdfBuffer = await generateCertificate(participant.toObject());

    const sanitizedName = participant.participant_name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${sanitizedName}_${participant.training_type.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Preview certificate PDF (inline)
router.get('/preview/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const data = participant.toObject();

    // If modules are passed as query params (for recurrent), override
    if (req.query.modules) {
      data.modules = req.query.modules;
    }

    const pdfBuffer = await generateCertificate(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate preview error:', error);
    res.status(500).json({ error: 'Failed to preview certificate' });
  }
});

// Generate certificate with custom modules (for recurrent training)
router.post('/generate/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const data = participant.toObject();

    // Override modules if provided in body
    if (req.body.modules) {
      const modules = Array.isArray(req.body.modules) ? req.body.modules.join(',') : req.body.modules;
      data.modules = modules;

      // Also update the database record
      participant.modules = modules;
      await participant.save();
    }

    const pdfBuffer = await generateCertificate(data);

    const sanitizedName = participant.participant_name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Certificate_${sanitizedName}_${participant.training_type.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Get available modules list
router.get('/modules', (req, res) => {
  res.json(MODULES_LIST);
});

module.exports = router;
