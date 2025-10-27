const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @desc    Get all chats for a user
// @route   GET /api/chats
router.get('/', authMiddleware, chatController.getChatsForUser);

// @desc    Create a new 1-on-1 chat
// @route   POST /api/chats
router.post('/', authMiddleware, chatController.createChat);

// @desc    Create a new group chat
// @route   POST /api/chats/group
router.post('/group', authMiddleware, chatController.createGroupChat);

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:chatId/messages
router.get('/:chatId/messages', authMiddleware, chatController.getMessagesForChat);


module.exports = router;