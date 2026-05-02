const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema(
  {
    // ── Auth fields ───────────────────────────────────────────────
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      default: 'patient',
    },

    // ── Personal info ─────────────────────────────────────────────
    patientId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age:        { type: String, default: '' },
    gender:     { type: String, default: '' },
    phone:      { type: String, default: '' },
    address:    { type: String, default: '' },
    bloodGroup: { type: String, default: '' },

    // ── Health profile ────────────────────────────────────────────
    height:     { type: String, default: '' },
    weight:     { type: String, default: '' },
    conditions: { type: [String], default: [] },
    medications:{ type: String, default: '' },
    allergies:  { type: String, default: '' },

    // ── Clinical fields (set by doctors) ──────────────────────────
    condition:    { type: String, default: '' },
    medicalHistory:{ type: String, default: '' },
    priority: {
      type: String,
      enum: ['emergency', 'warning', 'success'],
      default: 'success',
    },
    status: {
      type: String,
      default: 'Stable',
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
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
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Auto-generate a unique patientId using timestamp + random suffix
  if (!this.patientId) {
    let unique = false;
    while (!unique) {
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const candidate = `P-${Date.now().toString(36).toUpperCase()}-${suffix}`;
      const exists = await mongoose.model('Patient').findOne({ patientId: candidate });
      if (!exists) {
        this.patientId = candidate;
        unique = true;
      }
    }
  }
});

// Compare password
PatientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Patient', PatientSchema);
