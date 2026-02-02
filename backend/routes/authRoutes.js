const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  googleLogin, 
  forgotPassword, 
  verifyOtp, 
  resetPassword 
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

console.log("DEBUG: Loading Auth Routes..."); // <--- This proves the file loaded

// --- REGISTER & LOGIN ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// --- PASSWORD RESET ROUTES ---
// Make sure this matches the URL exactly: /api/auth/forgot-password
router.post('/forgot-password', forgotPassword); 

router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;