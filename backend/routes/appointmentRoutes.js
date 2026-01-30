const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, bookAppointment);
router.get('/my-appointments', authMiddleware, getMyAppointments);

module.exports = router;