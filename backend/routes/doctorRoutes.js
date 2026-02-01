const express = require('express');
const router = express.Router();

// FIX: Add 'updateProfile' to this list ⬇️
const { getAllDoctors, setAvailability, updateProfile } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getAllDoctors);
router.post('/availability', authMiddleware, setAvailability);
router.put('/profile', authMiddleware, updateProfile); 

module.exports = router;