const router = require('express').Router();
const authorize = require('../middleware/authMiddleware');
const { isPremiumOrLimited } = require('../middleware/premiumMiddleware');
const ai = require('../controllers/aiController');

router.post('/chat', authorize, isPremiumOrLimited, ai.chatWithGemini);
router.get('/conversations', authorize, ai.getConversations);
router.get('/conversations/:id', authorize, ai.getConversationMessages);
router.post('/conversations', authorize, ai.createConversation);
router.delete('/conversations/:id', authorize, ai.deleteConversation);
router.put('/conversations/:id', authorize, ai.renameConversation);
router.put('/conversations/:id/pin', authorize, ai.pinConversation);
router.get('/usage', authorize, ai.getAIUsage);

module.exports = router;