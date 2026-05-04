const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check patients collection first (patient portal users)
    let user = await Patient.findById(decoded.id).select('-password');

    // Fall back to Doctor
    if (!user) {
      const Doctor = require('../models/Doctor');
      user = await Doctor.findById(decoded.id).select('-password');
      if (user) {
        user.role = 'doctor'; // Doctors act as 'doctor' role
      }
    }

    // Fall back to System User (Admin)
    if (!user) {
      const User = require('../models/User');
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role || 'patient';
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized for this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
