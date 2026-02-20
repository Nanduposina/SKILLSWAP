const express = require('express');
const notificationsController = require('../controllers/notificationsController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, notificationsController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', authenticateToken, notificationsController.markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, notificationsController.markAllNotificationsAsRead);

// Get unread notification count
router.get('/unread-count', authenticateToken, notificationsController.getUnreadCount);

// Delete notification
router.delete('/:id', authenticateToken, notificationsController.deleteNotification);

module.exports = router;