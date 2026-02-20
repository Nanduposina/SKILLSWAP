const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/me', authenticateToken, authController.getMe);

// Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

// Logout (client-side token removal)
router.post('/logout', authController.logout);

// Test endpoint
router.get('/test', authController.testAuth);

module.exports = router;