const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const airlineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },           // person's name
  airlineName: { type: String, required: true, trim: true },    // e.g. "Emirates Airlines"
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'airline' },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

airlineSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

airlineSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

airlineSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Airline', airlineSchema);
