const mongoose = require('mongoose');

const HealthHistorySchema = new mongoose.Schema(
  {
    patient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Patient', 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['assessment', 'report'], 
      required: true 
    },
    
    // ── AI Assessment Fields ──
    riskLevel: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    aiSummary: { type: String, default: '' },
    severity: { type: String, default: '' },
    specialist: { type: String, default: '' },
    suggestions: { type: [String], default: [] },
    symptoms: { type: String, default: '' },
    
    appointmentBooked: { type: Boolean, default: false },
    bookedDoctor: { type: String, default: '' },
    bookedSpecialization: { type: String, default: '' },
    bookedTime: { type: String, default: '' },
    
    assignedDoctor: {
      id: { type: String },
      name: { type: String },
      specialization: { type: String },
      rating: { type: Number },
      phone: { type: String },
      isAvailable: { type: Boolean }
    },
    
    appointmentSource: { type: String, default: '' },
    appointmentDate: { type: Date, default: null },

    // ── Uploaded Report Fields ──
    fileName: { type: String, default: '' },
    reportType: { type: String, default: '' },
    // Base64 string for the uploaded file
    fileBase64: { type: String, default: '' }, 
    
    date: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthHistory', HealthHistorySchema);
