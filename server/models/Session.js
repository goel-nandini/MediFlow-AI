const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  symptoms:            { type: String, required: true },
  conversationHistory: [{ role: String, content: String }],
  questionCount:       { type: Number, default: 0 },
  triageResult:        { type: Object },
  decisionResult:      { type: Object },
  status:              { type: String, default: 'active' },
  patientName:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);