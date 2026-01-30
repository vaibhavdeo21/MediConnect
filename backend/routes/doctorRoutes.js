const express = require('express');
const router = express.Router();
const { getAllDoctors, setAvailability } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Public route to see doctors
router.get('/', getAllDoctors);

// Protected route (Only logged in doctors can set availability)
router.post('/availability', authMiddleware, setAvailability);

module.exports = router;