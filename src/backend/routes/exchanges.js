const express = require('express');
const exchangesController = require('../controllers/exchangesController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Create new exchange request (student to teacher)
router.post('/create', authenticateToken, exchangesController.createExchange);

// Create new exchange request (teacher to student)
router.post('/create-teacher-request', authenticateToken, exchangesController.createTeacherRequest);

// Get all exchanges (for admin or general listing)
router.get('/', authenticateToken, exchangesController.getAllExchanges);

// Get all exchanges for current user
router.get('/my-exchanges', authenticateToken, exchangesController.getMyExchanges);

// Get exchange details with messages
router.get('/:id', authenticateToken, exchangesController.getExchangeById);

// Accept exchange request
router.put('/:id/accept', authenticateToken, exchangesController.acceptExchange);

// Decline exchange request
router.put('/:id/decline', authenticateToken, exchangesController.declineExchange);

// Send message in exchange
router.post('/:id/message', authenticateToken, exchangesController.sendMessage);

// Update exchange status
router.put('/:id/status', authenticateToken, exchangesController.updateExchangeStatus);

// Rate an exchange
router.post('/:id/rate', authenticateToken, exchangesController.rateExchange);

// Revoke exchange request
router.put('/:id/revoke', authenticateToken, exchangesController.revokeExchange);

module.exports = router;