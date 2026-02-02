const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// Route 1: Get Profile (Protected)
router.get('/profile', authorize, getUserProfile);

// Route 2: Update Profile (Protected)
router.put('/profile', authorize, updateUserProfile);

module.exports = router;