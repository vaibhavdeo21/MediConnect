const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { 
    getUserProfile, 
    updateUserProfile,
    getDashboardStats, 
    getReferralData,
    registerUser, 
    getWalletBalance,
    getActivityLogs 
} = require('../controllers/userController');

// --- PUBLIC ---
router.post('/register', registerUser);

// --- PROTECTED (Requires authorize) ---

// Used in Profile.jsx
router.get('/profile', authorize, getUserProfile);
router.put('/profile', authorize, updateUserProfile);

// Used in Dashboard.jsx
router.get('/dashboard-stats', authorize, getDashboardStats);
router.get('/activity-logs', authorize, getActivityLogs); // New Endpoint

// Used in PremiumPerks.jsx
router.get('/referral-data', authorize, getReferralData);

// Used in EliteWallet.jsx
router.get('/wallet', authorize, getWalletBalance);

module.exports = router;