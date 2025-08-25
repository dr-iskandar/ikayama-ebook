const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Semua route di sini perlu otentikasi admin
router.use(isAdmin);

// Dashboard stats
router.get('/stats', dashboardController.getStats);

// Laporan
router.get('/report', dashboardController.getReport);

module.exports = router; 