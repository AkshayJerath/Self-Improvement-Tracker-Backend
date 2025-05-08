const express = require('express');
const { 
  getUserStats, 
  getBehaviorStats, 
  getStreakData 
} = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getUserStats);
router.get('/behaviors/:id', protect, getBehaviorStats);
router.get('/streak', protect, getStreakData);

module.exports = router;