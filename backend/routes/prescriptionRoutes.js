const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { addPrescription, getPrescription } = require('../controllers/prescriptionController');

// Save Prescription
router.post('/', authorize, addPrescription);

// Get Prescription by Appointment ID
router.get('/:appointmentId', authorize, getPrescription);

module.exports = router;