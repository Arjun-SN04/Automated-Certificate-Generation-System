const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    first_name:       { type: String, default: '', trim: true },
    last_name:        { type: String, default: '', trim: true },
    participant_name: { type: String, default: '' },
    company:          { type: String, required: true },
    department:       { type: String, required: true },
    training_type: {
      type: String,
      required: true,
      enum: [
        'Dispatch Graduate', 'Human Factors', 'Recurrent',
        'FDI', 'FDR', 'FDA', 'FTL', 'NDG', 'HF', 'GD', 'TCD'
      ]
    },
    airline_name: { type: String, default: null },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', default: null },
    locked:       { type: Boolean, default: true },
    training_date: { type: String, required: true },
    end_date:      { type: String, default: null },
    location:      { type: String, default: null },   // ← NEW: training location
    modules:       { type: String, default: null },

    // ── Certificate sequence number ────────────────────────────────────────────
    // Stores the per-training-type sequential number used in the cert ID,
    // e.g. FDI-00003-2025. Assigned once on creation, never changes.
    cert_sequence: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// NO pre-save hook — participant_name is set explicitly in the route
module.exports = mongoose.model('Participant', participantSchema);
