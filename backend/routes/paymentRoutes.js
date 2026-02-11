const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
// Change handlePaymentSuccess to verifyPayment here:
const { createCheckoutSession, verifyPayment } = require('../controllers/paymentController');

router.post('/create-checkout-session', authorize, createCheckoutSession);

// Change handlePaymentSuccess to verifyPayment here:
router.post('/success', authorize, verifyPayment);

module.exports = router;