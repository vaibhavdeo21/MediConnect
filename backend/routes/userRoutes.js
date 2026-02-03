const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, getDashboardStats } = require('../controllers/userController');

// Route 1: Get Profile (Protected)
router.get('/profile', authorize, getUserProfile);

router.get('/dashboard-stats', authorize, getDashboardStats);

// Route 2: Update Profile (Protected)
router.put('/profile', authorize, updateUserProfile);


module.exports = router;