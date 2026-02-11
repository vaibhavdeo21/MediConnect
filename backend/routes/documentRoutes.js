const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadDocument, getDocuments, deleteDocument, updateRemarks } = require('../controllers/documentController');

// 1. Upload
router.post('/upload', authorize, upload.single('report'), uploadDocument);

// 2. Get List
router.get('/:appointmentId', authorize, getDocuments);

// 3. Delete Document (New)
router.delete('/:id', authorize, deleteDocument);

// 4. Update Remarks (New)
router.put('/remarks/:id', authorize, updateRemarks);

module.exports = router;