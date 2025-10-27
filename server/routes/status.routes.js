const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @desc    Create a new status
// @route   POST /api/status
router.post('/', authMiddleware, statusController.createStatus);

// @desc    Get statuses from contacts
// @route   GET /api/status
router.get('/', authMiddleware, statusController.getStatuses);

module.exports = router;