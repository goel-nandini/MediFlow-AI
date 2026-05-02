const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Get all appointments (with filters)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { date, doctorId, patientId, status, priority, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (doctorId) filter.doctor   = doctorId;
    if (patientId) filter.patient = patientId;

    // Filter by date (today, specific day)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment
      .find(filter)
      .populate('patient', 'name patientId phone age priority conditions medicalHistory medications allergies')
      .populate('doctor',  'name specialization')
      .sort({ date: 1, timeSlot: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private
const getTodayAppointments = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment
      .find({ date: { $gte: start, $lte: end } })
      .populate('patient', 'name patientId age priority conditions medicalHistory medications allergies')
      .populate('doctor',  'name specialization')
      .sort({ timeSlot: 1 });

    res.json({ success: true, total: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment
      .findById(req.params.id)
      .populate('patient', 'name patientId phone age gender bloodGroup conditions medicalHistory medications allergies')
      .populate('doctor',  'name specialization phone');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.json({ success: true, data: appt });
  } catch (error) {
    next(error);
  }
};

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
  try {
    const body = { ...req.body };
    
    if (body.priority === undefined) {
      const risk = (body.risk || "").toLowerCase();
      if (risk.includes("emergency")) {
        body.priority = "emergency";
      } else if (risk.includes("high")) {
        body.priority = "warning";
      } else {
        body.priority = "success";
      }
    }

    const appointment = await Appointment.create(body);

    if (appointment.doctor) {
      await Doctor.findByIdAndUpdate(
        appointment.doctor,
        { $inc: { totalPatients: 1 } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment (reschedule / add notes / change status)
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    .populate('patient', 'name patientId')
    .populate('doctor',  'name specialization');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.json({ success: true, message: 'Appointment updated.', data: appt });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments, getTodayAppointments, getAppointment,
  createAppointment, updateAppointment, cancelAppointment,
};
