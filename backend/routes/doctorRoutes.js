const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
// Import both functions from your existing controller
const { getAllDoctors, setAvailability } = require('../controllers/doctorController');
router.put('/profile', authMiddleware, updateProfile);
router.get('/', getAllDoctors); 
// We will use this one later for the doctor dashboard
router.post('/availability', setAvailability); 

module.exports = router;