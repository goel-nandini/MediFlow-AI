const express = require('express');
const router  = express.Router();
const {
  getDoctors, getDoctor, createDoctor,
  updateDoctor, toggleAvailability, deleteDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',                         getDoctors);
router.get('/:id',                      getDoctor);
router.post('/',    authorize('admin'), createDoctor);
router.put('/:id',  authorize('admin'), updateDoctor);
router.patch('/:id/availability',       toggleAvailability);
router.delete('/:id', authorize('admin'), deleteDoctor);

module.exports = router;
