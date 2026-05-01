const express = require('express');
const router  = express.Router();
const {
  getRecords, getRecord, createRecord,
  updateRecord, deleteRecord, getRecentRecords,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/recent', getRecentRecords);  // GET /api/records/recent
router.get('/',       getRecords);
router.get('/:id',    getRecord);
router.post('/',      createRecord);
router.put('/:id',    updateRecord);
router.delete('/:id', authorize('admin', 'doctor'), deleteRecord);

module.exports = router;
