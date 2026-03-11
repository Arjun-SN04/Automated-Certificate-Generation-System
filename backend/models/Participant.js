const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    participant_name: { type: String, required: true },
    company: { type: String, required: true },
    department: { type: String, required: true },
    training_type: { type: String, required: true, enum: ['Dispatch Graduate', 'Human Factors', 'Recurrent'] },
    training_date: { type: String, required: true },
    modules: { type: String, default: null },
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

module.exports = mongoose.model('Participant', participantSchema);
