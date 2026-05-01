const Doctor = require('../models/Doctor');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, isAvailable } = req.query;

    const filter = { isActive: true };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (search) {
      filter.$or = [
        { name:           { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department:     { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter).sort({ name: 1 });

    res.json({ success: true, total: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Doctor profile created.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, message: 'Doctor updated.', data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle doctor availability
// @route   PATCH /api/doctors/:id/availability
// @access  Private
const toggleAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();
    res.json({
      success: true,
      message: `Doctor is now ${doctor.isAvailable ? 'available' : 'unavailable'}.`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor (soft delete)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res, next) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Doctor removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, toggleAvailability, deleteDoctor };
