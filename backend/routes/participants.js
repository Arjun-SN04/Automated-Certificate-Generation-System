const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Airline = require('../models/Airline');
const { authMiddleware } = require('./auth');

// All participant routes require a valid token
router.use(authMiddleware);

// ─── GET all participants ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, training_type, company } = req.query;
    const filter = {};

    // Airlines only see their own submissions
    if (req.admin.role === 'airline') {
      filter.airline_name = req.admin.airlineName;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { participant_name: regex },
        { first_name: regex },
        { last_name: regex },
        { company: regex },
        { department: regex },
      ];
    }
    if (training_type) filter.training_type = training_type;
    if (company) filter.company = company;

    const participants = await Participant.find(filter).sort({ created_at: -1 });
    res.json(participants);
  } catch (err) {
    console.error('GET /participants error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET all airlines with their participants (admin only) ────────────────────
router.get('/by-airline', async (req, res) => {
  try {
    if (req.admin.role === 'airline') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const airlines      = await Airline.find({}).sort({ airlineName: 1 });
    const participants  = await Participant.find({}).sort({ created_at: -1 });

    const result = airlines.map((a) => ({
      airline: a.toJSON(),
      participants: participants.filter(
        (p) => p.company === a.airlineName || p.airline_name === a.airlineName
      ),
    }));

    // Orphaned participants not matched to any registered airline
    const known = new Set(airlines.map((a) => a.airlineName));
    const orphaned = participants.filter(
      (p) => !known.has(p.company) && !known.has(p.airline_name)
    );
    if (orphaned.length) {
      result.push({
        airline: { airlineName: 'Other / Unassigned', email: '' },
        participants: orphaned,
      });
    }

    res.json(result);
  } catch (err) {
    console.error('GET /by-airline error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET single participant ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    if (req.admin.role === 'airline' && participant.airline_name !== req.admin.airlineName) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(participant);
  } catch (err) {
    console.error('GET /participants/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── CREATE participant ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    console.log('POST /participants body:', JSON.stringify(req.body));
    console.log('POST /participants user:', req.admin?.role, req.admin?.airlineName);

    const {
      first_name, last_name,
      participant_name,          // fallback for legacy callers
      company, department,
      training_type, training_date,
      end_date, location, modules,
    } = req.body;

    // Resolve names — prefer split fields, fall back to full name
    const fName = (first_name || '').trim()
      || (participant_name ? participant_name.trim().split(' ')[0] : '');
    const lName = (last_name || '').trim()
      || (participant_name ? participant_name.trim().split(' ').slice(1).join(' ') : '');

    // Manual validation with clear messages
    const missing = [];
    if (!fName)          missing.push('First name');
    if (!lName)          missing.push('Last name');
    if (!company)        missing.push('Airline name');
    if (!department)     missing.push('Department');
    if (!training_type)  missing.push('Training type');
    if (!training_date)  missing.push('Training date');

    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const modulesStr = Array.isArray(modules) ? modules.join(',') : (modules || null);

    const doc = new Participant({
      first_name:       fName,
      last_name:        lName,
      participant_name: `${fName} ${lName}`.trim(),
      company,
      department,
      training_type,
      training_date,
      end_date:     end_date  || null,
      location:     location  || null,
      modules:      modulesStr,
      cert_sequence: null,
      airline_name: req.admin.role === 'airline'
        ? (req.admin.airlineName || company)
        : company,
      submitted_by: req.admin.role === 'airline' ? req.admin.id : null,
      locked: true,
    });

    await doc.save();
    console.log('Created participant:', doc.participant_name);
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /participants error:', err.message, err.errors || '');
    res.status(500).json({ error: err.message });
  }
});

// ─── BULK CREATE participants ─────────────────────────────────────────────────
router.post('/bulk', async (req, res) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Expected a non-empty array of participants' });
    }

    const results = [];
    for (const item of rows) {
      try {
        const {
          first_name, last_name, participant_name,
          company, department, training_type, training_date,
          end_date, location, modules,
        } = item;

        const fName = (first_name || '').trim()
          || (participant_name ? participant_name.trim().split(' ')[0] : '');
        const lName = (last_name || '').trim()
          || (participant_name ? participant_name.trim().split(' ').slice(1).join(' ') : '');

        const missing = [];
        if (!fName)         missing.push('First name');
        if (!lName)         missing.push('Last name');
        if (!company)       missing.push('Airline name');
        if (!department)    missing.push('Department');
        if (!training_type) missing.push('Training type');
        if (!training_date) missing.push('Training date');

        if (missing.length) {
          results.push({ success: false, error: `Missing: ${missing.join(', ')}` });
          continue;
        }

        const modulesStr = Array.isArray(modules) ? modules.join(',') : (modules || null);

        const doc = new Participant({
          first_name:       fName,
          last_name:        lName,
          participant_name: `${fName} ${lName}`.trim(),
          company,
          department,
          training_type,
          training_date,
          end_date:     end_date  || null,
          location:     location  || null,
          modules:      modulesStr,
          cert_sequence: null,
          airline_name: req.admin.role === 'airline'
            ? (req.admin.airlineName || company)
            : company,
          submitted_by: req.admin.role === 'airline' ? req.admin.id : null,
          locked: true,
        });

        await doc.save();
        results.push({ success: true, id: doc._id, participant_name: doc.participant_name });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    res.status(207).json({ results, successCount, failCount: rows.length - successCount });
  } catch (err) {
    console.error('POST /participants/bulk error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE participant (admin only) ─────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    if (req.admin.role === 'airline') {
      return res.status(403).json({ error: 'Submitted records are locked. Only admins can edit.' });
    }

    const {
      first_name, last_name,
      participant_name,
      company, department,
      training_type, training_date,
      end_date, location, modules,
    } = req.body;

    const doc = await Participant.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Participant not found' });

    if (first_name !== undefined) doc.first_name = first_name.trim();
    if (last_name  !== undefined) doc.last_name  = last_name.trim();

    if (!first_name && !last_name && participant_name) {
      const parts = participant_name.trim().split(' ');
      doc.first_name = parts[0] || doc.first_name;
      doc.last_name  = parts.slice(1).join(' ') || doc.last_name;
    }

    doc.participant_name = `${doc.first_name} ${doc.last_name}`.trim();

    if (company)       doc.company       = company;
    if (department)    doc.department    = department;
    if (training_type) doc.training_type = training_type;
    if (training_date) doc.training_date = training_date;
    if (end_date  !== undefined) doc.end_date  = end_date  || null;
    if (location  !== undefined) doc.location  = location  || null;
    doc.modules = Array.isArray(modules) ? modules.join(',') : (modules || null);

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error('PUT /participants/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE all participants for an airline (admin only) ──────────────────────
// IMPORTANT: This route must be defined BEFORE /:id to avoid Express matching
// "airline" as an :id parameter.
router.delete('/airline/:airlineName', async (req, res) => {
  try {
    if (req.admin.role === 'airline') {
      return res.status(403).json({ error: 'Only admins can perform bulk deletions.' });
    }
    const name = decodeURIComponent(req.params.airlineName);
    const result = await Participant.deleteMany({
      $or: [{ airline_name: name }, { company: name }],
    });
    res.json({
      message: `Deleted ${result.deletedCount} participant(s) for "${name}"`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error('DELETE /participants/airline error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE single participant (admin only) ───────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    if (req.admin.role === 'airline') {
      return res.status(403).json({ error: 'Only admins can delete records.' });
    }

    const deleted = await Participant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Participant not found' });

    res.json({ message: 'Participant deleted successfully' });
  } catch (err) {
    console.error('DELETE /participants/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
