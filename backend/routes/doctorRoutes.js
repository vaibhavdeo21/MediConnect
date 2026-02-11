const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addReview, getDoctorReviews } = require('../controllers/reviewController');
const authorize = require('../middleware/authMiddleware'); // Ensure authorize is imported
const { 
  getDoctorProfile, 
  updateDoctorProfile, 
  getAllDoctors,
  getDoctorWallet 
} = require('../controllers/doctorController');

// Public Route: Get all doctors (for Find Doctors page)
router.get('/', getAllDoctors);

// Protected Routes (Doctor Only)
// Note: We use 'authMiddleware' to ensure only logged-in users access this
router.get('/profile', authMiddleware, getDoctorProfile);
router.put('/profile', authMiddleware, updateDoctorProfile);

router.post('/review', authorize, addReview);
router.get('/:doctorId/reviews', getDoctorReviews);
router.get('/wallet', authMiddleware, getDoctorWallet);

module.exports = router;