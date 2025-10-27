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

module.exports = router;