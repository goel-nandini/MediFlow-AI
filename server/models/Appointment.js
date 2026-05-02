const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    // Reference to patient
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: false,
    },
    // Reference to doctor
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false,
    },
    // For AI triage bookings (no ObjectId available)
patientName: { type: String, default: '' },
doctorName:  { type: String, default: '' },
specialization: { type: String, default: '' },
dateTime:    { type: String, default: '' },
    // Appointment datetime
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,  // e.g. "09:00", "14:30"
      required: true,
    },
    // Type of visit
    type: {
      type: String,
      enum: ['New Patient', 'Follow-up', 'Consultation', 'Lab Review', 'Emergency', 'Routine Check'],
      default: 'Consultation',
    },
    // Department
    department: {
      type: String,
      default: '',
    },
    // Triage priority (from AI triage)
    priority: {
      type: String,
      enum: ['emergency', 'warning', 'success'],
      default: 'success',
    },
    // Appointment status
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    // Reason for visit
    reason: {
      type: String,
      default: '',
    },
    // Doctor notes after appointment
    notes: {
      type: String,
      default: '',
    },
    // Follow-up required?
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    // Booked by which staff user
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
