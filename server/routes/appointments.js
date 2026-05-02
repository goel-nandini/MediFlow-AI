const express = require('express');
const router  = express.Router();
const {
  getAppointments, getTodayAppointments, getAppointment,
  createAppointment, updateAppointment, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// router.use(protect); // Removed global protect to allow guest chatbot booking

router.get('/today',  protect, getTodayAppointments);
router.get('/',       protect, getAppointments);
router.get('/:id',    protect, getAppointment);
router.post('/',      createAppointment); // Unprotected for chatbot
router.put('/:id',    protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
