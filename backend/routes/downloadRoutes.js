const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.post('/create', downloadController.createDownloadLink);
router.get('/download/:token', downloadController.processDownload);
router.post('/resend', downloadController.resendDownloadLink);
router.get('/history/:email', downloadController.getDownloadHistory);

// Admin routes
router.get('/stats', isAdmin, downloadController.getDownloadStats);

module.exports = router; 