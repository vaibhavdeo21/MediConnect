const express = require('express');
const router = express.Router();
const { getWalletDashboard, getTransactionHistory, processConsultationPayment } = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, getWalletDashboard);
router.get('/transactions', authMiddleware, getTransactionHistory);
router.post('/consultation-payment', authMiddleware, processConsultationPayment);

module.exports = router;
