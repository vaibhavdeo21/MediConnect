const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware'); // Protected route
const { chatWithGemini } = require('../controllers/aiController');

router.post('/chat', authorize, chatWithGemini);

module.exports = router;