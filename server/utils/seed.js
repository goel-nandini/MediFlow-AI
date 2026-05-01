/**
 * Seed Script — Populates the database with sample data
 * Run with: node utils/seed.js
 */

require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const connectDB = require('../config/db');

const User          = require('../models/User');
const Doctor        = require('../models/Doctor');
const Patient       = require('../models/Patient');
const Appointment   = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Doctor.deleteMany(),
    Patient.deleteMany(),
    Appointment.deleteMany(),
    MedicalRecord.deleteMany(),
  ]);
  console.log('✅ Cleared existing data');

  // ── 1. Create Admin User ──────────────────────────
  const admin = await User.create({
    name:  'Dr. Sarah Khan',
    email: 'admin@mediflow.com',
    password: 'admin123',
    role:  'admin',
    specialization: 'General Physician',
    phone: '9876543210',
  });
  console.log('✅ Admin user created → admin@mediflow.com / admin123');

  // ── 2. Create Doctors ─────────────────────────────
  const doctorsData = [
    { name: 'Dr. Anil Mehta',   specialization: 'Cardiologist',       email: 'anil@mediflow.com',  phone: '9876543211', department: 'Cardiology',    experience: 15, consultationFee: 800,  isAvailable: true  },
    { name: 'Dr. Sarah Khan',   specialization: 'General Physician',   email: 'sarah@mediflow.com', phone: '9876543212', department: 'General',       experience: 10, consultationFee: 500,  isAvailable: true, userId: admin._id },
    { name: 'Dr. Rohit Nair',   specialization: 'Orthopedic',          email: 'rohit@mediflow.com', phone: '9876543213', department: 'Orthopedics',   experience: 12, consultationFee: 700,  isAvailable: false },
    { name: 'Dr. Priya Joshi',  specialization: 'General Surgery',     email: 'priya@mediflow.com', phone: '9876543214', department: 'Surgery',       experience: 8,  consultationFee: 600,  isAvailable: true  },
    { name: 'Dr. Vinod Kumar',  specialization: 'Neurologist',         email: 'vinod@mediflow.com', phone: '9876543215', department: 'Neurology',     experience: 18, consultationFee: 1000, isAvailable: false },
    { name: 'Dr. Ritu Sharma',  specialization: 'Pediatrician',        email: 'ritu@mediflow.com',  phone: '9876543216', department: 'Pediatrics',    experience: 7,  consultationFee: 450,  isAvailable: true  },
  ];
  const doctors = await Doctor.insertMany(doctorsData);
  console.log(`✅ ${doctors.length} doctors created`);

  // ── 3. Create Patients ────────────────────────────
  const patientsData = [
    { patientId: 'P-001', name: 'Ravi Shankar',   age: 62, gender: 'Male',   phone: '9111111111', bloodGroup: 'B+', condition: 'Cardiac Arrest',         priority: 'emergency', status: 'Critical',   assignedDoctor: doctors[0]._id },
    { patientId: 'P-002', name: 'Meena Gupta',    age: 45, gender: 'Female', phone: '9111111112', bloodGroup: 'A+', condition: 'Type 2 Diabetes',         priority: 'warning',   status: 'Stable',     assignedDoctor: doctors[1]._id },
    { patientId: 'P-003', name: 'Arjun Patil',    age: 28, gender: 'Male',   phone: '9111111113', bloodGroup: 'O+', condition: 'Fractured Wrist',         priority: 'success',   status: 'Recovering', assignedDoctor: doctors[2]._id },
    { patientId: 'P-004', name: 'Sunita Rao',     age: 55, gender: 'Female', phone: '9111111114', bloodGroup: 'AB+',condition: 'Hypertension',            priority: 'warning',   status: 'Monitored',  assignedDoctor: doctors[0]._id },
    { patientId: 'P-005', name: 'Imran Sheikh',   age: 35, gender: 'Male',   phone: '9111111115', bloodGroup: 'B-', condition: 'Appendicitis',            priority: 'emergency', status: 'Surgery',    assignedDoctor: doctors[3]._id },
    { patientId: 'P-006', name: 'Lakshmi Devi',   age: 70, gender: 'Female', phone: '9111111116', bloodGroup: 'O-', condition: 'Knee Osteoarthritis',     priority: 'success',   status: 'Stable',     assignedDoctor: doctors[1]._id },
    { patientId: 'P-007', name: 'Karan Malhotra', age: 40, gender: 'Male',   phone: '9111111117', bloodGroup: 'A-', condition: 'Migraine',                priority: 'success',   status: 'Discharged', assignedDoctor: doctors[4]._id },
    { patientId: 'P-008', name: 'Deepa Singh',    age: 32, gender: 'Female', phone: '9111111118', bloodGroup: 'B+', condition: 'Pregnancy Checkup',       priority: 'success',   status: 'Stable',     assignedDoctor: doctors[1]._id },
    { patientId: 'P-009', name: 'Ramesh Verma',   age: 58, gender: 'Male',   phone: '9111111119', bloodGroup: 'O+', condition: 'Chronic Kidney Disease',  priority: 'warning',   status: 'Admitted',   assignedDoctor: doctors[0]._id },
    { patientId: 'P-010', name: 'Anjali Tiwari',  age: 8,  gender: 'Female', phone: '9111111120', bloodGroup: 'A+', condition: 'Viral Fever',             priority: 'success',   status: 'Recovering', assignedDoctor: doctors[5]._id },
  ];
  const patients = await Patient.insertMany(patientsData);
  console.log(`✅ ${patients.length} patients created`);

  // ── 4. Create Today's Appointments ───────────────
  const today = new Date();
  const appointmentsData = [
    { patient: patients[0]._id, doctor: doctors[0]._id, date: today, timeSlot: '09:00', type: 'Follow-up',   department: 'Cardiology', priority: 'emergency', status: 'Scheduled', reason: 'Post-cardiac arrest follow-up' },
    { patient: patients[1]._id, doctor: doctors[1]._id, date: today, timeSlot: '10:30', type: 'Follow-up',   department: 'General',    priority: 'warning',   status: 'Scheduled', reason: 'Diabetes medication review'    },
    { patient: patients[7]._id, doctor: doctors[1]._id, date: today, timeSlot: '11:00', type: 'New Patient', department: 'General',    priority: 'success',   status: 'Scheduled', reason: 'Pregnancy checkup'             },
    { patient: patients[2]._id, doctor: doctors[2]._id, date: today, timeSlot: '12:15', type: 'Follow-up',   department: 'Orthopedics',priority: 'success',   status: 'Confirmed', reason: 'Wrist fracture review'          },
    { patient: patients[3]._id, doctor: doctors[0]._id, date: today, timeSlot: '14:00', type: 'Routine Check',department: 'Cardiology',priority: 'warning',   status: 'Scheduled', reason: 'BP monitoring'                 },
    { patient: patients[8]._id, doctor: doctors[3]._id, date: today, timeSlot: '15:30', type: 'Consultation',department: 'Surgery',    priority: 'warning',   status: 'Scheduled', reason: 'Kidney disease consultation'   },
  ];
  const appointments = await Appointment.insertMany(appointmentsData);
  console.log(`✅ ${appointments.length} appointments created`);

  // ── 5. Create Medical Records ─────────────────────
  const recordsData = [
    {
      patient: patients[0]._id, doctor: doctors[0]._id,
      type: 'Lab', title: 'Blood Report — CBC',
      description: 'Complete Blood Count panel',
      labResults: [
        { testName: 'Hemoglobin', value: '10.2', unit: 'g/dL', normalRange: '13-17', isAbnormal: true },
        { testName: 'WBC', value: '12000', unit: '/µL', normalRange: '4000-11000', isAbnormal: true },
        { testName: 'Platelets', value: '1.5 L', unit: '/µL', normalRange: '1.5-4 L', isAbnormal: false },
      ],
      recordDate: new Date(), createdBy: admin._id,
    },
    {
      patient: patients[0]._id, doctor: doctors[0]._id,
      type: 'Diagnostic', title: 'ECG Report',
      description: '12-lead ECG showing ST elevation in V1-V4',
      diagnosis: 'STEMI (ST-Elevation Myocardial Infarction)',
      recordDate: new Date(), createdBy: admin._id,
    },
    {
      patient: patients[1]._id, doctor: doctors[1]._id,
      type: 'Prescription', title: 'Prescription — Metformin',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '3 months', notes: 'Take with meals' },
        { name: 'Glipizide', dosage: '5mg',   frequency: 'Once daily',  duration: '3 months', notes: 'Before breakfast' },
      ],
      recordDate: new Date(Date.now() - 86400000), createdBy: admin._id,
    },
    {
      patient: patients[2]._id, doctor: doctors[2]._id,
      type: 'Imaging', title: 'X-Ray Wrist (Right)',
      description: 'X-Ray showing fracture in distal radius',
      diagnosis: 'Colles fracture — right wrist',
      recordDate: new Date(Date.now() - 2 * 86400000), createdBy: admin._id,
    },
    {
      patient: patients[3]._id, doctor: doctors[0]._id,
      type: 'Vitals', title: 'BP Monitoring Log',
      vitals: { bloodPressure: '158/96', heartRate: 88, temperature: 37.1, spo2: 97 },
      recordDate: new Date(Date.now() - 3 * 86400000), createdBy: admin._id,
    },
  ];
  const records = await MedicalRecord.insertMany(recordsData);
  console.log(`✅ ${records.length} medical records created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Email:    admin@mediflow.com');
  console.log('  Password: admin123');
  console.log('─────────────────────────────────────\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
