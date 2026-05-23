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
    deleteAppointment,
    completeAppointment,
} = require('../controllers/appointmentController');

router.get('/active-call', authorize, getActiveCall);
router.post('/book', authorize, bookAppointment);
router.put('/status/:id', authorize, updateAppointmentStatus);
router.put('/complete/:id', authorize, completeAppointment);
router.delete('/:id', authorize, deleteAppointment);
router.get('/my-appointments', authorize, getMyAppointments);

module.exports = router;