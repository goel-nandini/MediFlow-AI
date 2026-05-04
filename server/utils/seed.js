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
    name:  'Admin User',
    email: 'admin@mediflow.com',
    password: 'admin123',
    role:  'admin',
    phone: '9876543210',
  });
  console.log('✅ Admin user created → admin@mediflow.com / admin123');

  // ── 2. Create Doctors (10 Doctors) ─────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const hashedDoctorPwd = await bcrypt.hash('password123', salt);

  const doctorsData = [
    { name: 'Dr. Anil Mehta',   specialization: 'Cardiologist',       email: 'anil@mediflow.com',  password: hashedDoctorPwd, phone: '9876543211', department: 'Cardiology',    experience: 15, consultationFee: 800,  isAvailable: true  },
    { name: 'Dr. Sarah Khan',   specialization: 'General Physician',   email: 'sarah@mediflow.com', password: hashedDoctorPwd, phone: '9876543212', department: 'General',       experience: 10, consultationFee: 500,  isAvailable: true, userId: admin._id },
    { name: 'Dr. Rohit Nair',   specialization: 'Orthopedic',          email: 'rohit@mediflow.com', password: hashedDoctorPwd, phone: '9876543213', department: 'Orthopedics',   experience: 12, consultationFee: 700,  isAvailable: false },
    { name: 'Dr. Priya Joshi',  specialization: 'General Surgery',     email: 'priya@mediflow.com', password: hashedDoctorPwd, phone: '9876543214', department: 'Surgery',       experience: 8,  consultationFee: 600,  isAvailable: true  },
    { name: 'Dr. Vinod Kumar',  specialization: 'Neurologist',         email: 'vinod@mediflow.com', password: hashedDoctorPwd, phone: '9876543215', department: 'Neurology',     experience: 18, consultationFee: 1000, isAvailable: false },
    { name: 'Dr. Ritu Sharma',  specialization: 'Pediatrician',        email: 'ritu@mediflow.com',  password: hashedDoctorPwd, phone: '9876543216', department: 'Pediatrics',    experience: 7,  consultationFee: 450,  isAvailable: true  },
    { name: 'Dr. Amit Patel',   specialization: 'Dermatologist',       email: 'amit@mediflow.com',  password: hashedDoctorPwd, phone: '9876543217', department: 'Dermatology',   experience: 9,  consultationFee: 550,  isAvailable: true  },
    { name: 'Dr. Sunita Iyer',  specialization: 'Gynecologist',        email: 'sunita@mediflow.com',password: hashedDoctorPwd, phone: '9876543218', department: 'Gynecology',    experience: 14, consultationFee: 800,  isAvailable: true  },
    { name: 'Dr. Rajesh Singh', specialization: 'ENT Specialist',      email: 'rajesh@mediflow.com',password: hashedDoctorPwd, phone: '9876543219', department: 'ENT',           experience: 11, consultationFee: 600,  isAvailable: true  },
    { name: 'Dr. Neha Verma',   specialization: 'Psychiatrist',        email: 'neha@mediflow.com',  password: hashedDoctorPwd, phone: '9876543220', department: 'Psychiatry',    experience: 6,  consultationFee: 900,  isAvailable: true  },
  ];
  const doctors = await Doctor.insertMany(doctorsData);
  console.log(`✅ ${doctors.length} doctors created`);

  // ── 3. Create Patients (15 Patients) ────────────────────────────
  const hashedPatientPwd = await bcrypt.hash('password123', salt);

  const patientsData = [
    { patientId: 'P-001', name: 'Ravi Shankar', email: 'p1@mediflow.com', password: hashedPatientPwd, age: 62, gender: 'Male',   phone: '9111111111', bloodGroup: 'B+', condition: 'Cardiac Arrest',         priority: 'emergency', status: 'Critical',   assignedDoctor: doctors[0]._id },
    { patientId: 'P-002', name: 'Meena Gupta',  email: 'p2@mediflow.com', password: hashedPatientPwd, age: 45, gender: 'Female', phone: '9111111112', bloodGroup: 'A+', condition: 'Type 2 Diabetes',         priority: 'warning',   status: 'Stable',     assignedDoctor: doctors[1]._id },
    { patientId: 'P-003', name: 'Arjun Patil',  email: 'p3@mediflow.com', password: hashedPatientPwd, age: 28, gender: 'Male',   phone: '9111111113', bloodGroup: 'O+', condition: 'Fractured Wrist',         priority: 'success',   status: 'Recovering', assignedDoctor: doctors[2]._id },
    { patientId: 'P-004', name: 'Sunita Rao',   email: 'p4@mediflow.com', password: hashedPatientPwd, age: 55, gender: 'Female', phone: '9111111114', bloodGroup: 'AB+',condition: 'Hypertension',            priority: 'warning',   status: 'Monitored',  assignedDoctor: doctors[0]._id },
    { patientId: 'P-005', name: 'Imran Sheikh', email: 'p5@mediflow.com', password: hashedPatientPwd, age: 35, gender: 'Male',   phone: '9111111115', bloodGroup: 'B-', condition: 'Appendicitis',            priority: 'emergency', status: 'Surgery',    assignedDoctor: doctors[3]._id },
    { patientId: 'P-006', name: 'Lakshmi Devi', email: 'p6@mediflow.com', password: hashedPatientPwd, age: 70, gender: 'Female', phone: '9111111116', bloodGroup: 'O-', condition: 'Knee Osteoarthritis',     priority: 'success',   status: 'Stable',     assignedDoctor: doctors[1]._id },
    { patientId: 'P-007', name: 'Karan Malhotra',email:'p7@mediflow.com', password: hashedPatientPwd, age: 40, gender: 'Male',   phone: '9111111117', bloodGroup: 'A-', condition: 'Migraine',                priority: 'success',   status: 'Discharged', assignedDoctor: doctors[4]._id },
    { patientId: 'P-008', name: 'Deepa Singh',  email: 'p8@mediflow.com', password: hashedPatientPwd, age: 32, gender: 'Female', phone: '9111111118', bloodGroup: 'B+', condition: 'Pregnancy Checkup',       priority: 'success',   status: 'Stable',     assignedDoctor: doctors[7]._id },
    { patientId: 'P-009', name: 'Ramesh Verma', email: 'p9@mediflow.com', password: hashedPatientPwd, age: 58, gender: 'Male',   phone: '9111111119', bloodGroup: 'O+', condition: 'Chronic Kidney Disease',  priority: 'warning',   status: 'Admitted',   assignedDoctor: doctors[0]._id },
    { patientId: 'P-010', name: 'Anjali Tiwari',email: 'p10@mediflow.com',password: hashedPatientPwd, age: 8,  gender: 'Female', phone: '9111111120', bloodGroup: 'A+', condition: 'Viral Fever',             priority: 'success',   status: 'Recovering', assignedDoctor: doctors[5]._id },
    { patientId: 'P-011', name: 'Vikram Joshi', email: 'p11@mediflow.com',password: hashedPatientPwd, age: 29, gender: 'Male',   phone: '9111111121', bloodGroup: 'B+', condition: 'Severe Acne',             priority: 'success',   status: 'Stable',     assignedDoctor: doctors[6]._id },
    { patientId: 'P-012', name: 'Sonal Desai',  email: 'p12@mediflow.com',password: hashedPatientPwd, age: 42, gender: 'Female', phone: '9111111122', bloodGroup: 'AB-',condition: 'Sinus Infection',         priority: 'warning',   status: 'Stable',     assignedDoctor: doctors[8]._id },
    { patientId: 'P-013', name: 'Manoj Kumar',  email: 'p13@mediflow.com',password: hashedPatientPwd, age: 38, gender: 'Male',   phone: '9111111123', bloodGroup: 'O+', condition: 'Anxiety Attack',          priority: 'emergency', status: 'Stable',     assignedDoctor: doctors[9]._id },
    { patientId: 'P-014', name: 'Pooja Reddy',  email: 'p14@mediflow.com',password: hashedPatientPwd, age: 25, gender: 'Female', phone: '9111111124', bloodGroup: 'A+', condition: 'Tonsillitis',             priority: 'warning',   status: 'Recovering', assignedDoctor: doctors[8]._id },
    { patientId: 'P-015', name: 'Harish Babu',  email: 'p15@mediflow.com',password: hashedPatientPwd, age: 65, gender: 'Male',   phone: '9111111125', bloodGroup: 'O-', condition: 'Cataract',                priority: 'success',   status: 'Stable',     assignedDoctor: doctors[1]._id },
  ];
  const patients = await Patient.insertMany(patientsData);
  console.log(`✅ ${patients.length} patients created`);

  // ── 4. Create Today's Appointments ───────────────
  const today = new Date();
  
  // Create 15 appointments exactly for today
  const appointmentsData = [
    { patient: patients[0]._id, doctor: doctors[0]._id, date: today, timeSlot: '09:00', type: 'Follow-up',   department: 'Cardiology', priority: 'emergency', status: 'Scheduled', reason: 'Post-cardiac arrest follow-up' },
    { patient: patients[1]._id, doctor: doctors[1]._id, date: today, timeSlot: '10:30', type: 'Follow-up',   department: 'General',    priority: 'warning',   status: 'Scheduled', reason: 'Diabetes medication review'    },
    { patient: patients[7]._id, doctor: doctors[7]._id, date: today, timeSlot: '11:00', type: 'New Patient', department: 'Gynecology', priority: 'success',   status: 'Scheduled', reason: 'Pregnancy checkup'             },
    { patient: patients[2]._id, doctor: doctors[2]._id, date: today, timeSlot: '12:15', type: 'Follow-up',   department: 'Orthopedics',priority: 'success',   status: 'Confirmed', reason: 'Wrist fracture review'          },
    { patient: patients[3]._id, doctor: doctors[0]._id, date: today, timeSlot: '14:00', type: 'Routine Check',department: 'Cardiology',priority: 'warning',   status: 'Scheduled', reason: 'BP monitoring'                 },
    { patient: patients[8]._id, doctor: doctors[3]._id, date: today, timeSlot: '15:30', type: 'Consultation',department: 'Surgery',    priority: 'warning',   status: 'Scheduled', reason: 'Kidney disease consultation'   },
    { patient: patients[10]._id,doctor: doctors[6]._id, date: today, timeSlot: '09:30', type: 'Consultation',department: 'Dermatology',priority: 'success',   status: 'Scheduled', reason: 'Skin infection check'          },
    { patient: patients[11]._id,doctor: doctors[8]._id, date: today, timeSlot: '10:00', type: 'Follow-up',   department: 'ENT',        priority: 'warning',   status: 'Scheduled', reason: 'Sinus cleaning'                },
    { patient: patients[12]._id,doctor: doctors[9]._id, date: today, timeSlot: '11:30', type: 'Emergency',   department: 'Psychiatry', priority: 'emergency', status: 'In Progress', reason: 'Severe anxiety attack'     },
    { patient: patients[13]._id,doctor: doctors[8]._id, date: today, timeSlot: '12:00', type: 'New Patient', department: 'ENT',        priority: 'warning',   status: 'Scheduled', reason: 'Throat pain'                   },
    { patient: patients[4]._id, doctor: doctors[3]._id, date: today, timeSlot: '13:00', type: 'Emergency',   department: 'Surgery',    priority: 'emergency', status: 'In Progress', reason: 'Appendicitis surgery prep' },
    { patient: patients[5]._id, doctor: doctors[1]._id, date: today, timeSlot: '14:30', type: 'Routine Check',department: 'General',    priority: 'success',   status: 'Scheduled', reason: 'Knee pain checkup'             },
    { patient: patients[6]._id, doctor: doctors[4]._id, date: today, timeSlot: '15:00', type: 'Follow-up',   department: 'Neurology',  priority: 'success',   status: 'Scheduled', reason: 'Migraine follow-up'            },
    { patient: patients[9]._id, doctor: doctors[5]._id, date: today, timeSlot: '16:00', type: 'Consultation',department: 'Pediatrics', priority: 'success',   status: 'Scheduled', reason: 'Viral fever checkup'           },
    { patient: patients[14]._id,doctor: doctors[1]._id, date: today, timeSlot: '16:30', type: 'Follow-up',   department: 'General',    priority: 'success',   status: 'Scheduled', reason: 'Eye check referral'            },
  ];
  const appointments = await Appointment.insertMany(appointmentsData);
  console.log(`✅ ${appointments.length} appointments created for TODAY`);

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
      patient: patients[1]._id, doctor: doctors[1]._id,
      type: 'Prescription', title: 'Prescription — Metformin',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '3 months', notes: 'Take with meals' },
      ],
      recordDate: new Date(Date.now() - 86400000), createdBy: admin._id,
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
