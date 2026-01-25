const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Upload Audio or Image
router.post('/upload', authMiddleware, upload.single('file'), messageController.uploadMessage);

module.exports = router;