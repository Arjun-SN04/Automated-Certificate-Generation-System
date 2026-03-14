require('dotenv').config();
const mongoose = require('mongoose');
// Models are required here so they register with mongoose before routes load
const Participant = require('./models/Participant');
const Admin       = require('./models/Admin');
const Airline     = require('./models/Airline');
const { CertCounter, reserveCertSequence } = require('./models/CertCounter');

async function initDB() {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL environment variable is required');
  }

  await mongoose.connect(mongoUrl, { dbName: 'certificateSystem' });
  console.log('Connected to MongoDB Atlas');

  // Seed default admin if none exists
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      name: 'IFOA Administrator',
      email: 'admin@ifoa.com',
      password: 'admin123',
      role: 'Administrator',
      organization: 'IFOA - International Flight Operations Academy',
    });
    console.log('✅ Default admin seeded: admin@ifoa.com / admin123');
  }

  // Seed demo airline account if none exists
  const airlineCount = await Airline.countDocuments();
  if (airlineCount === 0) {
    await Airline.create({
      name: 'Emirates Operations',
      airlineName: 'Emirates Airlines',
      email: 'ops@emirates.com',
      password: 'airline123',
    });
    console.log('✅ Demo airline seeded: ops@emirates.com / airline123');
  }

  // Seed participants if collection is empty
  const count = await Participant.countDocuments();
  if (count === 0) {
    await seedParticipants();
  }

  // Backfill cert_sequence for any existing participants that are missing it.
  // This handles records created before the CertCounter model was introduced.
  await backfillCertSequences();
}

async function seedParticipants() {
  const rows = [
    { first_name: 'John',   last_name: 'Smith',       participant_name: 'John Smith',       company: 'Emirates Airlines', department: 'Flight Operations',  training_type: 'FDI', training_date: '2025-06-15', modules: null,                                                  airline_name: 'Emirates Airlines', locked: true },
    { first_name: 'Sarah',  last_name: 'Johnson',     participant_name: 'Sarah Johnson',    company: 'Qatar Airways',     department: 'Safety Department',  training_type: 'HF',  training_date: '2025-07-20', modules: null,                                                  airline_name: 'Qatar Airways',     locked: true },
    { first_name: 'Ahmed',  last_name: 'Al-Rashid',   participant_name: 'Ahmed Al-Rashid',  company: 'Etihad Airways',    department: 'Flight Dispatch',    training_type: 'FDR', training_date: '2025-08-10', modules: 'Air Law,Aircraft Systems,Navigation,Meteorology',    airline_name: 'Etihad Airways',    locked: true },
    { first_name: 'Maria',  last_name: 'Garcia',      participant_name: 'Maria Garcia',     company: 'Oman Air',          department: 'Operations Control', training_type: 'FDA', training_date: '2025-09-05', modules: null,                                                  airline_name: 'Oman Air',          locked: true },
    { first_name: 'James',  last_name: 'Wilson',      participant_name: 'James Wilson',     company: 'Gulf Air',          department: 'Flight Operations',  training_type: 'FTL', training_date: '2025-10-12', modules: null,                                                  airline_name: 'Gulf Air',          locked: true },
    { first_name: 'Fatima', last_name: 'Al-Hassan',   participant_name: 'Fatima Al-Hassan', company: 'Saudi Airlines',    department: 'Flight Dispatch',    training_type: 'NDG', training_date: '2025-11-01', modules: null,                                                  airline_name: 'Saudi Airlines',    locked: true },
  ];

  // Assign cert_sequence to each seed row before inserting
  for (const row of rows) {
    row.cert_sequence = await reserveCertSequence(row.training_type);
  }

  await Participant.insertMany(rows);
  console.log('✅ Participant seed data inserted with cert sequences');
}

/**
 * Backfill cert_sequence for any participants that were created before
 * the CertCounter model existed. Processes them in creation order so
 * the sequence numbers are assigned chronologically.
 */
async function backfillCertSequences() {
  const unsequenced = await Participant.find(
    { cert_sequence: null },
    null,
    { sort: { created_at: 1 } }   // oldest first → sequences are chronological
  );

  if (unsequenced.length === 0) return;

  console.log(`⏳ Backfilling cert_sequence for ${unsequenced.length} participant(s)…`);

  for (const doc of unsequenced) {
    doc.cert_sequence = await reserveCertSequence(doc.training_type);
    await doc.save();
  }

  console.log(`✅ Backfill complete`);
}

module.exports = { initDB, Participant };
