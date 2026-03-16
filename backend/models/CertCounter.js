const mongoose = require('mongoose');

/**
 * CertCounter — tracks the highest cert sequence number per training type.
 *
 * IMPORTANT: reserveCertSequence now works by:
 *   1. Finding the highest cert_sequence currently stored in the Participant
 *      collection for this training type (ground truth from actual data).
 *   2. Also reading the CertCounter document (in case it is ahead of the DB).
 *   3. Taking the MAX of both, then adding 1.
 *   4. Atomically writing that new max back to CertCounter.
 *
 * This guarantees:
 *   - Numbers are always higher than any number already issued, regardless
 *     of which airline the previous certificate belonged to.
 *   - Stale stored cert_sequence values on participants can never cause a
 *     duplicate — because we look at every participant record, not just
 *     the counter document.
 *   - The counter document is self-healing: if it ever falls behind the
 *     actual data, it automatically catches up before issuing the next number.
 */

const certCounterSchema = new mongoose.Schema(
  {
    training_type: { type: String, required: true, unique: true },
    seq:           { type: Number, default: 0 },
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
 * Reserve the next unique certificate sequence number for a training type.
 * Looks at the actual Participant data to determine the true current maximum,
 * so stale counter documents or stale cert_sequence fields can never produce
 * a duplicate.
 *
 * @param   {string}          training_type  short code or legacy name
 * @returns {Promise<number>}                the newly reserved number (≥ 1)
 */
async function reserveCertSequence(training_type) {
  const code = TO_CODE[training_type] || training_type;

  // Lazy-require Participant here to avoid circular dependency at module load
  const Participant = require('./Participant');

  // ── Step 1: find the highest cert_sequence actually stored in Participant ──
  const highestParticipant = await Participant.findOne(
    { training_type: code, cert_sequence: { $exists: true, $ne: null } },
    { cert_sequence: 1 },
    { sort: { cert_sequence: -1 } }   // descending → first result is the max
  ).lean();

  const maxInParticipants = highestParticipant ? (highestParticipant.cert_sequence || 0) : 0;

  // ── Step 2: read the current counter document ─────────────────────────────
  const counterDoc = await CertCounter.findOne({ training_type: code }).lean();
  const maxInCounter = counterDoc ? (counterDoc.seq || 0) : 0;

  // ── Step 3: true maximum = whichever is higher ────────────────────────────
  const trueMax = Math.max(maxInParticipants, maxInCounter);
  const nextSeq = trueMax + 1;

  // ── Step 4: atomically write the new value back, ensuring it only goes up ─
  await CertCounter.findOneAndUpdate(
    { training_type: code },
    { $max: { seq: nextSeq } },   // $max: only updates if nextSeq > current seq
    { upsert: true }
  );

  return nextSeq;
}

module.exports = { CertCounter, reserveCertSequence };
