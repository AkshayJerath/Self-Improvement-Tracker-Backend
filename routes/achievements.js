const express = require('express');
const { 
  checkAchievements, 
  getAchievements 
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAchievements);
router.post('/check', protect, checkAchievements);

module.exports = router;