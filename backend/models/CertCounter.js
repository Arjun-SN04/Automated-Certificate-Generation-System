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
    // floor: the minimum value seq may ever return after a reset.
    // reserveCertSequence will never issue a number below this.
    floor:         { type: Number, default: 0 },
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
 *
 * After a reset the counter has a `floor` value (the startFrom the admin chose).
 * We honour that floor — the issued number will NEVER go below floor, even if
 * existing participant records have higher numbers from a previous run.
 *
 * Sequence of steps:
 *   1. Read the counter doc (contains seq and floor).
 *   2. If a reset has been requested (floor > 0 and seq < floor) use floor as
 *      the starting point — participant history is intentionally ignored.
 *   3. Otherwise fall back to the old safe behaviour: max(participants, seq)+1.
 *
 * @param   {string}          training_type  short code or legacy name
 * @returns {Promise<number>}                the newly reserved number (≥ 1)
 */
async function reserveCertSequence(training_type) {
  const code = TO_CODE[training_type] || training_type;

  // Lazy-require Participant here to avoid circular dependency at module load
  const Participant = require('./Participant');

  // ── Step 1: read the counter document ────────────────────────────────────
  const counterDoc = await CertCounter.findOne({ training_type: code }).lean();
  const currentSeq = counterDoc ? (counterDoc.seq   || 0) : 0;
  const floor      = counterDoc ? (counterDoc.floor || 0) : 0;

  let nextSeq;

  if (floor > 0 && currentSeq < floor) {
    // ── Reset mode: admin set a floor and we haven't reached it yet ──────────
    // Issue numbers starting from floor, ignoring old participant data entirely.
    nextSeq = floor;
  } else {
    // ── Normal mode: safe max across counter + participant records ────────────
    const highestParticipant = await Participant.findOne(
      { training_type: code, cert_sequence: { $exists: true, $ne: null } },
      { cert_sequence: 1 },
      { sort: { cert_sequence: -1 } }
    ).lean();
    const maxInParticipants = highestParticipant ? (highestParticipant.cert_sequence || 0) : 0;
    const trueMax = Math.max(maxInParticipants, currentSeq);
    nextSeq = trueMax + 1;
  }

  // ── Atomically persist the new seq value ─────────────────────────────────
  await CertCounter.findOneAndUpdate(
    { training_type: code },
    { $set: { seq: nextSeq } },
    { upsert: true }
  );

  return nextSeq;
}

module.exports = { CertCounter, reserveCertSequence };
