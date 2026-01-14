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

// @desc    Follow User
// @route   POST /api/users/follow/:recipientId
router.post('/follow/:recipientId', authMiddleware, userController.followUser);

// @desc    Unfollow User
// @route   DELETE /api/users/follow/:recipientId
router.delete('/follow/:recipientId', authMiddleware, userController.unfollowUser);

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

// @desc    Get social connections
// @route   GET /api/users/social/:userId?
router.get('/social/:userId?', authMiddleware, userController.getSocialConnections);

// @desc    Get friends list
// @route   GET /api/users/friends
router.get('/friends', authMiddleware, userController.getFriends);

// @desc    Get user by ID
// @route   GET /api/users/:id
router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;