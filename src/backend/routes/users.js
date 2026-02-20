const express = require('express');
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get user's transaction history
router.get('/my-transactions', authenticateToken, usersController.getMyTransactions);

// Search users
router.get('/search', usersController.searchUsers);

// Get user profile by ID
router.get('/:id', usersController.getUserProfileById);

// Update user profile
router.put('/:id', authenticateToken, usersController.updateUserProfile);

// Add skill offered by user
router.post('/:id/skills/offered', authenticateToken, usersController.addUserSkillOffered);


// Get user's transactions
router.get('/:id/transactions', authenticateToken, usersController.getUserTransactions);

module.exports = router;