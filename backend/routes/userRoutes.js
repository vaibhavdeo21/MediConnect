const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    getDashboardStats,
    getReferralData,
    getWalletBalance,
    getActivityLogs,
    updateEmergencyStatus,
} = require('../controllers/userController');

// --- PROTECTED (Requires authorize) ---

// Used in Profile.jsx
router.get('/profile', authorize, getUserProfile);
router.put('/profile', authorize, updateUserProfile);

// Used in Dashboard.jsx
router.get('/dashboard-stats', authorize, getDashboardStats);
router.get('/activity-logs', authorize, getActivityLogs);

// Emergency Active Switch (Doctor only)
router.put('/emergency-status', authorize, updateEmergencyStatus);

// Used in PremiumPerks.jsx
router.get('/referral-data', authorize, getReferralData);

// Used in EliteWallet.jsx
router.get('/wallet', authorize, getWalletBalance);

module.exports = router;