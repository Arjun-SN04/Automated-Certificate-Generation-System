const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ifoa-certificate-system-secret-key';

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, admin: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, admin: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me — get current admin profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    res.json(admin.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/auth/profile — update name and/or password
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    const { name, currentPassword, newPassword } = req.body;

    // Update name if provided
    if (name && name.trim()) {
      admin.name = name.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      admin.password = newPassword;
    }

    await admin.save();

    // Issue a new token with updated name
    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, admin: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

module.exports = { router, authMiddleware };
