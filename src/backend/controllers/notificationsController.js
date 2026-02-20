const database = require('../models/Database');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notifications = await database.getUserNotifications(req.user.userId, parseInt(limit));
    
    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify notification belongs to user
    const notification = await database.db.get(
      'SELECT * FROM notifications WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await database.markNotificationAsRead(id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await database.markAllNotificationsAsRead(req.user.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const result = await database.db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE',
      [req.user.userId]
    );

    res.json({
      success: true,
      data: {
        unreadCount: result.count
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify notification belongs to user
    const notification = await database.db.get(
      'SELECT * FROM notifications WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await database.db.run(
      'DELETE FROM notifications WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification
};
