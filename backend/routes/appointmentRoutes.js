const express = require('express');
const router = express.Router();
// 1. IMPORT MIDDLEWARE
const authorize = require('../middleware/authMiddleware');// 2. IMPORT CONTROLLERS
const { bookAppointment, getMyAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
// Debugging: If these log "undefined", the server will crash
if (!authorize) console.error("CRITICAL ERROR: 'authorize' middleware is missing!");
if (!bookAppointment) console.error("CRITICAL ERROR: 'bookAppointment' function is missing!");
if (!getMyAppointments) console.error("CRITICAL ERROR: 'getMyAppointments' function is missing!");

// Route 1: Book
router.post('/book', authorize, bookAppointment);
router.put('/status/:id', authorize, updateAppointmentStatus);
// Route 2: Get List
router.get('/my-appointments', authorize, getMyAppointments);

module.exports = router;