const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Rute autentikasi
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin);
router.get('/validate', authenticate, authController.validateToken);

module.exports = router; 