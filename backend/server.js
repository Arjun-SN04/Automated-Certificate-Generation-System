require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ── Auto-fix: ensure Dispatch_graduate.pdf and HumanFactors.pdf exist ──────────
// If they were deleted or are missing, copy from recurrent (same green design)
(function ensureGreenTemplates() {
  const root = path.join(__dirname, '..');
  const src  = path.join(root, 'recurrent_training_with_modules.pdf');
  const targets = ['Dispatch_graduate.pdf', 'HumanFactors.pdf'];
  if (!fs.existsSync(src)) return;
  targets.forEach(name => {
    const dst = path.join(root, name);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      console.log(`[startup] Created missing template: ${name}`);
    }
  });
})();

// Clear any cached models so nodemon restarts start completely fresh
// This prevents stale pre-save hook stacking across hot reloads
delete mongoose.models.Participant;
delete mongoose.models.Admin;
delete mongoose.models.Airline;
delete mongoose.models.CertCounter;

// Register all models fresh
require('./models/Admin');
require('./models/Airline');
require('./models/Participant');
require('./models/CertCounter');

const { initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDB().then(() => {
  const participantsRouter = require('./routes/participants');
  const certificatesRouter = require('./routes/certificates');
  const { router: authRouter } = require('./routes/auth');

  app.use('/api/auth', authRouter);
  app.use('/api/participants', participantsRouter);
  app.use('/api/certificates', certificatesRouter);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
