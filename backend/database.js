const mongoose = require('mongoose');
const Participant = require('./models/Participant');

async function initDB() {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL environment variable is required');
  }

  await mongoose.connect(mongoUrl, { dbName: 'certificateSystem' });

  // Seed data if collection is empty
  const count = await Participant.countDocuments();
  if (count === 0) {
    await seedData();
  }

  console.log('Connected to MongoDB Atlas');
}

async function seedData() {
  const rows = [
    { participant_name: 'John Smith', company: 'Emirates Airlines', department: 'Flight Operations', training_type: 'Dispatch Graduate', training_date: '2025-06-15', modules: null },
    { participant_name: 'Sarah Johnson', company: 'Qatar Airways', department: 'Safety Department', training_type: 'Human Factors', training_date: '2025-07-20', modules: null },
    { participant_name: 'Ahmed Al-Rashid', company: 'Etihad Airways', department: 'Flight Dispatch', training_type: 'Recurrent', training_date: '2025-08-10', modules: 'Air Law,Aircraft Systems,Navigation,Meteorology' },
    { participant_name: 'Maria Garcia', company: 'Oman Air', department: 'Operations Control', training_type: 'Dispatch Graduate', training_date: '2025-09-05', modules: null },
    { participant_name: 'James Wilson', company: 'Gulf Air', department: 'Flight Operations', training_type: 'Human Factors', training_date: '2025-10-12', modules: null },
    { participant_name: 'Fatima Al-Hassan', company: 'Saudi Airlines', department: 'Flight Dispatch', training_type: 'Recurrent', training_date: '2025-11-01', modules: 'Air Law,Navigation,Meteorology,Flight Planning' },
  ];
  await Participant.insertMany(rows);
}

module.exports = { initDB, Participant };
