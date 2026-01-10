const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @desc    Get current user's profile
// @route   GET /api/users/me
router.get('/me', authMiddleware, userController.getUserProfile);

// @desc    Update current user's profile
// @route   PUT /api/users/me
router.put('/me', authMiddleware, userController.updateUserProfile);

// @desc    Search for users
// @route   GET /api/users/search
router.get('/search', authMiddleware, userController.searchUsers);

// @desc    Send friend request
// @route   POST /api/users/friend-request/:recipientId
router.post('/friend-request/:recipientId', authMiddleware, userController.sendFriendRequest);

// @desc    Accept friend request
// @route   PUT /api/users/friend-request/:requestId/accept
router.put('/friend-request/:requestId/accept', authMiddleware, userController.acceptFriendRequest);

// @desc    Reject friend request
// @route   PUT /api/users/friend-request/:requestId/reject
router.put('/friend-request/:requestId/reject', authMiddleware, userController.rejectFriendRequest);

// @desc    Get notifications
// @route   GET /api/users/notifications
router.get('/notifications', authMiddleware, userController.getNotifications);

// @desc    Get friends list
// @route   GET /api/users/friends
router.get('/friends', authMiddleware, userController.getFriends);

module.exports = router;