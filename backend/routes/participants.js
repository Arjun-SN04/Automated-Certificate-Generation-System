const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');

// Get all participants
router.get('/', async (req, res) => {
  try {
    const { search, training_type, company } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { participant_name: regex },
        { company: regex },
        { department: regex },
      ];
    }
    if (training_type) filter.training_type = training_type;
    if (company) filter.company = company;

    const participants = await Participant.find(filter).sort({ created_at: -1 });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single participant
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create participant
router.post('/', async (req, res) => {
  try {
    const { participant_name, company, department, training_type, training_date, modules } = req.body;

    if (!participant_name || !company || !department || !training_type || !training_date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const modulesStr = Array.isArray(modules) ? modules.join(',') : modules || null;

    const newParticipant = await Participant.create({
      participant_name, company, department, training_type, training_date, modules: modulesStr,
    });
    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update participant
router.put('/:id', async (req, res) => {
  try {
    const { participant_name, company, department, training_type, training_date, modules } = req.body;
    const modulesStr = Array.isArray(modules) ? modules.join(',') : modules || null;

    const updated = await Participant.findByIdAndUpdate(
      req.params.id,
      { participant_name, company, department, training_type, training_date, modules: modulesStr },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete participant
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Participant.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
