const HealthHistory = require('../models/HealthHistory');

// @desc    Get health history for a specific patient
// @route   GET /api/health-history?patientId=...
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const history = await HealthHistory.find({ patient: patientId }).sort({ date: -1 });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new health history record
// @route   POST /api/health-history
// @access  Private
const createHistory = async (req, res, next) => {
  try {
    const record = await HealthHistory.create(req.body);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a health history record
// @route   PUT /api/health-history/:id
// @access  Private
const updateHistory = async (req, res, next) => {
  try {
    const record = await HealthHistory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Health history record not found' });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  createHistory,
  updateHistory,
};
