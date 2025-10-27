const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @desc    Trigger a new backup
// @route   POST /api/backup/create
router.post('/create', authMiddleware, backupController.createBackup);

// @desc    Get list of available backups
// @route   GET /api/backup/list
router.get('/list', authMiddleware, backupController.getBackups);

// @desc    Trigger a restore
// @route   POST /api/backup/restore/:backupId
router.post('/restore/:backupId', authMiddleware, backupController.restoreBackup);

module.exports = router;