const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout,
  refreshToken,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  updatePreferences
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/preferences', protect, updatePreferences);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/logout', protect, logout);

module.exports = router;