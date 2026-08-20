const express = require('express');
const router = express.Router();
const {
  getAdminDashboard, getAllDoctorMetrics, getDoctorPenaltyHistory,
  reversePenalty, getFinancialAnalytics, getAllUsers, getPremiumAnalytics,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getAdminDashboard);
router.get('/doctors/metrics', getAllDoctorMetrics);
router.get('/doctors/:doctorId/penalties', getDoctorPenaltyHistory);
router.put('/penalties/:transactionId/reverse', reversePenalty);
router.get('/analytics/financial', getFinancialAnalytics);
router.get('/analytics/premium', getPremiumAnalytics);
router.get('/users', getAllUsers);

module.exports = router;
