const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
