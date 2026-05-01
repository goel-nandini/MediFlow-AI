const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema(
  {
    // Reference to patient
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    // Reference to doctor who created the record
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    // Reference to appointment (optional)
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    // Type of record
    type: {
      type: String,
      enum: ['Lab', 'Prescription', 'Imaging', 'Vitals', 'Diagnostic', 'Discharge Summary', 'Consultation Note'],
      required: true,
    },
    // Record title
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },
    // Description / notes
    description: {
      type: String,
      default: '',
    },
    // Diagnosis
    diagnosis: {
      type: String,
      default: '',
    },
    // Prescription details (for Rx type)
    medications: [
      {
        name:      { type: String },
        dosage:    { type: String },
        frequency: { type: String },
        duration:  { type: String },
        notes:     { type: String },
      },
    ],
    // Lab results (key-value pairs)
    labResults: [
      {
        testName: { type: String },
        value:    { type: String },
        unit:     { type: String },
        normalRange: { type: String },
        isAbnormal: { type: Boolean, default: false },
      },
    ],
    // Vitals snapshot
    vitals: {
      bloodPressure: { type: String },
      heartRate:     { type: Number },
      temperature:   { type: Number },
      spo2:          { type: Number },
      weight:        { type: Number },
      height:        { type: Number },
    },
    // File attachments (URLs/paths)
    attachments: [
      {
        fileName: String,
        fileUrl:  String,
        fileType: String,
      },
    ],
    // Record date (can differ from createdAt)
    recordDate: {
      type: Date,
      default: Date.now,
    },
    isConfidential: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
