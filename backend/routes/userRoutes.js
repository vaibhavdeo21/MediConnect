const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { 
    getUserProfile, 
    updateUserProfile,
    getDashboardStats, 
    getReferralData,
    registerUser, 
    getWalletBalance 
} = require('../controllers/userController');

// --- PUBLIC ---
// Used in Register.jsx
router.post('/register', registerUser);

// --- PROTECTED (Requires authorize) ---

// Used in Profile.jsx
router.get('/profile', authorize, getUserProfile);
router.put('/profile', authorize, updateUserProfile);

// Used in Dashboard.jsx
router.get('/dashboard-stats', authorize, getDashboardStats);

// Used in PremiumPerks.jsx
router.get('/referral-data', authorize, getReferralData);

// Used in EliteWallet.jsx
router.get('/wallet', authorize, getWalletBalance);

module.exports = router;