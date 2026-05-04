const express = require('express');
const router = express.Router();
const {
  getHistory,
  createHistory,
  updateHistory,
} = require('../controllers/healthHistoryController');

// All health history routes
router.route('/')
  .get(getHistory)
  .post(createHistory);

router.route('/:id')
  .put(updateHistory);

module.exports = router;
