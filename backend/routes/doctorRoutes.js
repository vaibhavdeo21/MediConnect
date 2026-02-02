const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getDoctorProfile, 
  updateDoctorProfile, 
  getAllDoctors 
} = require('../controllers/doctorController');

// Public Route: Get all doctors (for Find Doctors page)
router.get('/', getAllDoctors);

// Protected Routes (Doctor Only)
// Note: We use 'authMiddleware' to ensure only logged-in users access this
router.get('/profile', authMiddleware, getDoctorProfile);
router.put('/profile', authMiddleware, updateDoctorProfile);

module.exports = router;