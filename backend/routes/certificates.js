const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const { generateCertificate, MODULES_LIST } = require('../services/certificateGenerator');
const { authMiddleware } = require('./auth');
const { CertCounter, reserveCertSequence } = require('../models/CertCounter');

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
    const counters = await CertCounter.find({}).sort({ training_type: 1 }).lean();
    res.json(counters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /counters/reset — reset counter for one or all training types ────────
//
// Body params:
//   training_type    {string}  — the type to reset (required unless `all` is set)
//   all              {bool}    — reset every training type
//   startFrom        {number}  — next NEW cert number (default: 1)
//   mode             {string}  — 'hard' or 'soft' (default: 'soft')
//
// MODES:
//   soft (default) — existing participants KEEP their current cert_sequence.
//                    Only participants without a number get numbers from startFrom.
//                    Counter is set so new numbers begin at startFrom, but if any
//                    existing number is >= startFrom the counter steps above them
//                    automatically to avoid collisions.
//
//   hard           — ALL participants of this type have cert_sequence wiped to null.
//                    Every participant (old and new) gets a brand new number starting
//                    from startFrom on next certificate generation.
//                    Use this when you want to completely renumber everything.
//
router.post('/counters/reset', async (req, res) => {
  try {
    if (req.admin?.role === 'airline') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const startFrom = Math.max(1, Number(req.body.startFrom) || 1);
    const mode      = req.body.mode === 'hard' ? 'hard' : 'soft';
    const types     = [];

    if (req.body.all) {
      // Collect all known training types from the counter collection + participants
      const counters     = await CertCounter.find({}).lean();
      const ptypes       = await Participant.distinct('training_type');
      const allTypes     = new Set([...counters.map(c => c.training_type), ...ptypes]);
      types.push(...allTypes);
    } else {
      if (!req.body.training_type) {
        return res.status(400).json({ error: 'training_type or all:true is required' });
      }
      types.push(req.body.training_type);
    }

    const results = [];

    for (const type of types) {
      if (mode === 'hard') {
        // ── HARD RESET ──────────────────────────────────────────────────────────
        // Wipe cert_sequence on ALL participants of this type.
        // They will all get brand new numbers (from startFrom upward) the next
        // time a certificate is generated for each of them.
        await Participant.updateMany(
          { training_type: type },
          { $set: { cert_sequence: null } }
        );

        // Set counter: seq = startFrom-1 so first reserve() returns startFrom.
        // floor = startFrom so reserveCertSequence skips the participant scan
        // (all nulled out anyway) and issues from startFrom cleanly.
        await CertCounter.findOneAndUpdate(
          { training_type: type },
          { $set: { seq: startFrom - 1, floor: startFrom } },
          { upsert: true }
        );

        results.push({
          type,
          mode: 'hard',
          message: `All participant cert numbers wiped. Next number: ${startFrom}.`,
        });

      } else {
        // ── SOFT RESET ──────────────────────────────────────────────────────────
        // Existing participants KEEP their numbers — their physical certificates
        // remain valid. Only participants currently without a number will receive
        // new ones starting from startFrom.
        //
        // Safety: if any existing participant already has a number >= startFrom,
        // we must start above them to avoid a collision. Find the real max among
        // participants that still have a cert_sequence.
        const highest = await Participant.findOne(
          { training_type: type, cert_sequence: { $exists: true, $ne: null } },
          { cert_sequence: 1 },
          { sort: { cert_sequence: -1 } }
        ).lean();

        const existingMax = highest ? (highest.cert_sequence || 0) : 0;

        // The effective start is whichever is higher: what admin requested, or
        // one above the highest already-issued number (to prevent duplicates).
        const effectiveStart = Math.max(startFrom, existingMax + 1);

        await CertCounter.findOneAndUpdate(
          { training_type: type },
          { $set: { seq: effectiveStart - 1, floor: effectiveStart } },
          { upsert: true }
        );

        const warning = effectiveStart > startFrom
          ? ` (adjusted to ${effectiveStart} to avoid collision with existing #${existingMax})`
          : '';

        results.push({
          type,
          mode: 'soft',
          effectiveStart,
          message: `Existing numbers preserved. Next new number: ${effectiveStart}${warning}.`,
        });
      }
    }

    res.json({
      startFrom,
      mode,
      results,
    });
  } catch (err) {
    console.error('POST /counters/reset error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
