const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware'); // Protected route
const { chatWithGemini } = require('../controllers/aiController');
const isPremium = require('../middleware/premiumMiddleware');

router.post('/chat', authorize, isPremium, chatWithGemini);

module.exports = router;