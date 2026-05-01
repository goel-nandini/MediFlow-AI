const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
    },
    // Current condition / diagnosis
    condition: {
      type: String,
      default: '',
    },
    // Triage priority
    priority: {
      type: String,
      enum: ['emergency', 'warning', 'success'],
      default: 'success',
    },
    // Current status
    status: {
      type: String,
      enum: ['Critical', 'Stable', 'Recovering', 'Monitored', 'Surgery', 'Discharged', 'Admitted'],
      default: 'Stable',
    },
    // Assigned doctor
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    // Medical history summary
    medicalHistory: {
      type: String,
      default: '',
    },
    // Vitals (latest)
    vitals: {
      bloodPressure: { type: String, default: '' },
      heartRate:     { type: Number, default: null },
      temperature:   { type: Number, default: null },
      spo2:          { type: Number, default: null },
      weight:        { type: Number, default: null },
      height:        { type: Number, default: null },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate patientId before saving
PatientSchema.pre('save', async function () {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `P-${String(count + 1).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
