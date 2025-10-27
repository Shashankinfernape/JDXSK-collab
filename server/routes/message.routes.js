const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Note: Sending text messages is handled by Socket.IO.
// This route is primarily for things that require HTTP, like file uploads.

// @desc    Upload an image message
// @route   POST /api/messages/image-upload
// router.post('/image-upload', authMiddleware, upload.single('image'), messageController.uploadImageMessage);

module.exports = router;