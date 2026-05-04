const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Helper: format patient response (all health fields)
const formatPatient = (p) => ({
  id:           p._id,
  patientId:    p.patientId,
  name:         p.name,
  email:        p.email,
  role:         'patient',
  phone:        p.phone,
  age:          p.age,
  height:       p.height,
  weight:       p.weight,
  bloodGroup:   p.bloodGroup,
  gender:       p.gender,
  conditions:   p.conditions,
  medications:  p.medications,
  allergies:    p.allergies,
  address:      p.address,
  priority:     p.priority,
  status:       p.status,
});

// Helper: format doctor response
const formatDoctor = (d) => ({
  id:              d._id,
  doctorId:        d.doctorId,
  name:            d.name,
  email:           d.email,
  role:            d.role || 'doctor',
  specialization:  d.specialization,
  phone:           d.phone,
  qualification:   d.qualification,
  experience:      d.experience,
  department:      d.department,
  consultationFee: d.consultationFee,
  bio:             d.bio,
  rating:          d.rating,
});

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name, email, password,
      age, height, weight, bloodGroup, gender,
      conditions, medications, allergies, address, phone,
    } = req.body;

    // Check if patient already exists
    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create patient in patients collection
    const patient = await Patient.create({
      name, email, password,
      age:         age         || '',
      height:      height      || '',
      weight:      weight      || '',
      bloodGroup:  bloodGroup  || '',
      gender:      gender      || '',
      conditions:  conditions  || [],
      medications: medications || '',
      allergies:   allergies   || '',
      address:     address     || '',
      phone:       phone       || '',
    });

    const token = generateToken(patient._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: formatPatient(patient),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new doctor
// @route   POST /api/auth/register-doctor
// @access  Public
const registerDoctor = async (req, res, next) => {
  try {
    const {
      name, email, password, phone,
      specialization, qualification, experience, department, consultationFee
    } = req.body;

    // Check if doctor already exists
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create doctor in doctors collection
    const doctor = await Doctor.create({
      name, email, password, phone,
      specialization,
      qualification:   qualification || '',
      experience:      experience || 0,
      department:      department || '',
      consultationFee: consultationFee || 500,
    });

    const token = generateToken(doctor._id);

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      token,
      user: formatDoctor(doctor),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login (Patient or Doctor)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // ── Check Patient ──────────────────────────────────────────────────
    const patient = await Patient.findOne({ email }).select('+password');
    if (patient) {
      const isMatch = await patient.matchPassword(password);
      if (isMatch) {
        if (!patient.isActive) {
          return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
        }
        const token = generateToken(patient._id);
        return res.json({
          success: true,
          message: 'Login successful.',
          token,
          user: formatPatient(patient),
        });
      }
    }

    // ── Check Doctor ───────────────────────────────────────────────────
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (doctor) {
      const isMatch = await doctor.matchPassword(password);
      if (isMatch) {
        if (!doctor.isActive) {
          return res.status(401).json({ success: false, message: 'Doctor account deactivated.' });
        }
        const token = generateToken(doctor._id);
        return res.json({
          success: true,
          message: 'Login successful (Doctor Access).',
          token,
          user: formatDoctor(doctor),
        });
      }
    }

    // ── Check Admin / System User ──────────────────────────────────────
    const systemUser = await User.findOne({ email }).select('+password');
    if (systemUser) {
      const isMatch = await systemUser.matchPassword(password);
      if (isMatch) {
        const token = generateToken(systemUser._id);
        return res.json({
          success: true,
          message: 'Login successful (Admin Access).',
          token,
          user: {
            id: systemUser._id,
            name: systemUser.name,
            email: systemUser.email,
            role: systemUser.role || 'admin',
          },
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const u = req.user;
  
  if (u.role === 'doctor') {
    return res.json({
      success: true,
      user: formatDoctor(u)
    });
  }

  res.json({
    success: true,
    user: formatPatient(u)
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let userModel = req.user.role === 'doctor' ? Doctor : Patient;

    const user = await userModel.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, registerDoctor, login, getMe, changePassword };
