const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { createCheckoutSession, handlePaymentSuccess } = require('../controllers/paymentController');

router.post('/create-checkout-session', authorize, createCheckoutSession);
router.post('/success', authorize, handlePaymentSuccess);

module.exports = router;