/**
 * seed-appointment.js
 * Run once: node seed-appointment.js
 * Inserts a dummy upcoming appointment so the Appointments page has data to show.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mediflow');
  console.log('✅ Connected to MongoDB');

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const dummy = await Appointment.create({
    patientName: 'Demo Patient',
    doctorName:  'Dr. Arjun Mehta',
    specialization: 'General Physician',
    dateTime:   tomorrow.toISOString(),
    date:       tomorrow,
    timeSlot:   '10:00',
    status:     'upcoming',
    reason:     'Routine check-up and follow-up on fever symptoms',
    priority:   'success',
  });

  console.log('✅ Dummy appointment created:', dummy._id.toString());
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
