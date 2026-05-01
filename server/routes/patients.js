const express = require('express');
const router  = express.Router();
const {
  getPatients, getPatient, createPatient,
  updatePatient, deletePatient, getStats,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

// All routes require login
router.use(protect);

router.get('/stats',  getStats);     // GET /api/patients/stats
router.get('/',       getPatients);  // GET /api/patients
router.get('/:id',    getPatient);   // GET /api/patients/:id
router.post('/',      createPatient);// POST /api/patients
router.put('/:id',    updatePatient);// PUT /api/patients/:id
router.delete('/:id', authorize('admin'), deletePatient); // DELETE — admin only

module.exports = router;
