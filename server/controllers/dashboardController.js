const Patient     = require('../models/Patient');
const Doctor      = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const mongoose = require('mongoose');

// @desc    Get full dashboard summary (one API call)
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { doctorId } = req.query;

    const basePatientFilter = { isActive: true };
    const baseApptFilter = { date: { $gte: today, $lte: todayEnd } };
    const baseRecordFilter = {};

    let patientIds = [];
    if (doctorId) {
      const appts = await Appointment.find({ doctor: doctorId }).distinct('patient');
      basePatientFilter.$or = [
        { assignedDoctor: doctorId },
        { _id: { $in: appts } }
      ];
      baseApptFilter.doctor = doctorId;
      baseRecordFilter.doctor = doctorId;
    }

    // Run all queries in parallel for performance
    const [
      totalPatients,
      emergencyPatients,
      highPatients,
      normalPatients,
      todayAppointments,
      totalDoctors,
      availableDoctors,
      recentPatients,
      recentRecords,
      todayApptList,
    ] = await Promise.all([
      // Patient counts
      Patient.countDocuments(basePatientFilter),
      Patient.countDocuments({ ...basePatientFilter, priority: 'emergency' }),
      Patient.countDocuments({ ...basePatientFilter, priority: 'warning' }),
      Patient.countDocuments({ ...basePatientFilter, priority: 'success' }),

      // Today's appointment count
      Appointment.countDocuments(baseApptFilter),

      // Doctor counts (always global for now, but maybe we don't care if it's doctor mode)
      Doctor.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true, isAvailable: true }),

      // Recent 7 patients
      Patient.find(basePatientFilter)
        .populate('assignedDoctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(7)
        .select('name patientId age condition priority status assignedDoctor createdAt'),

      // Recent 5 medical records
      MedicalRecord.find(baseRecordFilter)
        .populate('patient', 'name patientId')
        .populate('doctor', 'name')
        .sort({ recordDate: -1 })
        .limit(5)
        .select('title type patient doctor recordDate'),

      // Today's appointments with patient & doctor info
      Appointment.find(baseApptFilter)
        .populate('patient', 'name patientId age priority')
        .populate('doctor', 'name specialization')
        .sort({ timeSlot: 1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          emergencyPatients,
          highPatients,
          normalPatients,
          todayAppointments,
          totalDoctors,
          availableDoctors,
        },
        recentPatients,
        recentRecords,
        todayAppointments: todayApptList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly patient visit data (for chart)
// @route   GET /api/dashboard/monthly-visits
// @access  Private
const getMonthlyVisits = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { doctorId } = req.query;

    const matchFilter = { date: { $gte: sixMonthsAgo } };
    if (doctorId) matchFilter.doctor = mongoose.Types.ObjectId(doctorId);

    // Aggregate appointments by month
    const monthlyData = await Appointment.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$date' },
            month: { $month: '$date' },
          },
          total:     { $sum: 1 },
          emergency: {
            $sum: { $cond: [{ $eq: ['$priority', 'emergency'] }, 1, 0] },
          },
          high: {
            $sum: { $cond: [{ $eq: ['$priority', 'warning'] }, 1, 0] },
          },
          normal: {
            $sum: { $cond: [{ $eq: ['$priority', 'success'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format into readable month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatted = monthlyData.map(m => ({
      month:     monthNames[m._id.month - 1],
      year:      m._id.year,
      visits:    m.total,
      emergency: m.emergency,
      high:      m.high,
      normal:    m.normal,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get case priority distribution (for pie chart)
// @route   GET /api/dashboard/case-distribution
// @access  Private
const getCaseDistribution = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    const matchFilter = { isActive: true };
    if (doctorId) matchFilter.assignedDoctor = mongoose.Types.ObjectId(doctorId);

    const distribution = await Patient.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id:   '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = distribution.reduce((sum, d) => sum + d.count, 0);

    const formatted = distribution.map(d => ({
      name:  d._id === 'emergency' ? 'Emergency'
           : d._id === 'warning'   ? 'High'
           : 'Normal',
      value: d.count,
      percent: total > 0 ? Math.round((d.count / total) * 100) : 0,
      color:
        d._id === 'emergency' ? '#DC2626' :
        d._id === 'warning'   ? '#F59E0B' : '#16A34A',
    }));

    res.json({ success: true, total, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor-wise patient load
// @route   GET /api/dashboard/doctor-load
// @access  Private
const getDoctorLoad = async (req, res, next) => {
  try {
    const load = await Patient.aggregate([
      { $match: { isActive: true, assignedDoctor: { $ne: null } } },
      {
        $group: {
          _id:      '$assignedDoctor',
          patients: { $sum: 1 },
          emergency: { $sum: { $cond: [{ $eq: ['$priority', 'emergency'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from:         'doctors',
          localField:   '_id',
          foreignField: '_id',
          as:           'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          doctorName:     '$doctor.name',
          specialization: '$doctor.specialization',
          isAvailable:    '$doctor.isAvailable',
          patients:       1,
          emergency:      1,
        },
      },
      { $sort: { patients: -1 } },
    ]);

    res.json({ success: true, data: load });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyVisits,
  getCaseDistribution,
  getDoctorLoad,
};
