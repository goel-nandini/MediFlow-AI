const express = require('express');
const router  = express.Router();
const {
  getAppointments, getTodayAppointments, getAppointment,
  createAppointment, updateAppointment, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today',  getTodayAppointments);  // GET /api/appointments/today
router.get('/',       getAppointments);        // GET /api/appointments
router.get('/:id',    getAppointment);
router.post('/',      createAppointment);
router.put('/:id',    updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
