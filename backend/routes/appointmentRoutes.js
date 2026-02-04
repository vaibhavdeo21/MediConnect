const express = require('express');
const router = express.Router();
// 1. IMPORT MIDDLEWARE
const authorize = require('../middleware/authMiddleware');

// 2. IMPORT CONTROLLERS
const { 
    bookAppointment, 
    getMyAppointments, 
    updateAppointmentStatus, 
    getActiveCall,
    deleteAppointment // Added this
} = require('../controllers/appointmentController');

// Debugging: If these log "undefined", the server will crash
if (!authorize) console.error("CRITICAL ERROR: 'authorize' middleware is missing!");
if (!bookAppointment) console.error("CRITICAL ERROR: 'bookAppointment' function is missing!");
if (!getMyAppointments) console.error("CRITICAL ERROR: 'getMyAppointments' function is missing!");
if (!getActiveCall) console.error("CRITICAL ERROR: 'getActiveCall' function is missing!");
if (!deleteAppointment) console.error("CRITICAL ERROR: 'deleteAppointment' function is missing!");

// Route: Dashboard Priority Check
router.get('/active-call', authorize, getActiveCall);

// Route 1: Book
router.post('/book', authorize, bookAppointment);

// Route 2: Update Status (Accept/Decline/Reschedule)
router.put('/status/:id', authorize, updateAppointmentStatus);

// Route 3: Delete Appointment (Doctor Cancel)
router.delete('/:id', authorize, deleteAppointment);

// Route 4: Get List
router.get('/my-appointments', authorize, getMyAppointments);

module.exports = router;