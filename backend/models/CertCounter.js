const mongoose = require('mongoose');

/**
 * CertCounter — one document per training-type short code.
 * The `seq` field is atomically incremented each time a certificate
 * number is reserved, guaranteeing a unique, ever-increasing sequence.
 *
 * Documents are keyed by short code (e.g. "FDI", "FDR", "HF", …).
 * Legacy long names are normalised to short codes before lookup.
 *
 * Usage:
 *   const { reserveCertSequence } = require('./CertCounter');
 *   const num = await reserveCertSequence('FDI');  // → 1, 2, 3, …
 */

const certCounterSchema = new mongoose.Schema(
  {
    // training-type short code: FDI | FDR | FDA | FTL | NDG | HF | GD | TCD
    training_type: { type: String, required: true, unique: true },
    // current highest assigned sequence number (starts at 0; first cert gets 1)
    seq: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const CertCounter = mongoose.model('CertCounter', certCounterSchema);

// Map legacy long names → canonical short code
const TO_CODE = {
  'Dispatch Graduate': 'FDI',
  'Human Factors':     'HF',
  'Recurrent':         'FDR',
};

/**
 * Atomically reserves the next sequence number for the given training type.
 * Safe under concurrent writes — MongoDB guarantees uniqueness via findOneAndUpdate.
 *
 * @param {string} training_type  raw training type (short code or legacy name)
 * @returns {Promise<number>}     the reserved sequence number (≥ 1)
 */
async function reserveCertSequence(training_type) {
  const code = TO_CODE[training_type] || training_type;

  const counter = await CertCounter.findOneAndUpdate(
    { training_type: code },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

module.exports = { CertCounter, reserveCertSequence };
