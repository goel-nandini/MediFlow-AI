const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get all records (with filters)
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res, next) => {
  try {
    const { patientId, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (patientId) filter.patient = patientId;
    if (type)      filter.type    = type;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await MedicalRecord.countDocuments(filter);

    const records = await MedicalRecord
      .find(filter)
      .populate('patient', 'name patientId')
      .populate('doctor',  'name specialization')
      .sort({ recordDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      data:       records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
const getRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord
      .findById(req.params.id)
      .populate('patient', 'name patientId age gender')
      .populate('doctor',  'name specialization');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create medical record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create({ ...req.body, createdBy: req.user._id });

    const populated = await MedicalRecord
      .findById(record._id)
      .populate('patient', 'name patientId')
      .populate('doctor',  'name specialization');

    res.status(201).json({
      success: true,
      message: 'Medical record created.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    .populate('patient', 'name patientId')
    .populate('doctor',  'name specialization');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.json({ success: true, message: 'Record updated.', data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private (Admin / Doctor)
const deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    res.json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent records (for dashboard)
// @route   GET /api/records/recent
// @access  Private
const getRecentRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord
      .find()
      .populate('patient', 'name patientId')
      .populate('doctor',  'name')
      .sort({ recordDate: -1 })
      .limit(10);

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, deleteRecord, getRecentRecords };
