const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const { 
  createCheckoutSession, 
  verifyPayment, 
  getSubscriptionStatus, 
  cancelSubscription, 
  getPaymentHistory 
} = require('../controllers/paymentController');

router.post('/create-checkout-session', authorize, createCheckoutSession);
router.post('/success', authorize, verifyPayment);
router.get('/subscription-status', authorize, getSubscriptionStatus);
router.post('/cancel-subscription', authorize, cancelSubscription);
router.get('/payment-history', authorize, getPaymentHistory);

module.exports = router;