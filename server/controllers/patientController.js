const Patient = require('../models/Patient');

// @desc    Get all patients (with search & filter)
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
  try {
    const { search, priority, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (priority) filter.priority = priority;
    if (status)   filter.status   = status;
    if (search) {
      filter.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
        { condition: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(filter);

    const patients = await Patient
      .find(filter)
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      data:       patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient
      .findById(req.params.id)
      .populate('assignedDoctor', 'name specialization phone email');

    if (!patient || !patient.isActive) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDoctor', 'name specialization');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({ success: true, message: 'Patient record deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/patients/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const [total, emergency, high, normal, admitted] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true, priority: 'emergency' }),
      Patient.countDocuments({ isActive: true, priority: 'warning' }),
      Patient.countDocuments({ isActive: true, priority: 'success' }),
      Patient.countDocuments({ isActive: true, status: 'Admitted' }),
    ]);

    res.json({
      success: true,
      data: { total, emergency, high, normal, admitted },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient, getStats };
