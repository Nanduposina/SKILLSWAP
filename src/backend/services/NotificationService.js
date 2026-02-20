const database = require('../models/Database');

class NotificationService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await database.createNotification({
        userId,
        type,
        title,
        message,
        data
      });

      // Send real-time notification via Socket.io
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async notifyNewExchangeRequest(providerId, exchangeData) {
    const { exchangeId, requesterName, skill, description } = exchangeData;
    
    return await this.createNotification(
      providerId,
      'exchange_request',
      'New Exchange Request',
      `${requesterName} wants to learn ${skill} from you`,
      {
        exchangeId,
        requesterName,
        skill,
        description,
        action: 'view_exchange'
      }
    );
  }

  async notifyExchangeAccepted(requesterId, exchangeData) {
    const { exchangeId, providerName, skill } = exchangeData;
    
    return await this.createNotification(
      requesterId,
      'exchange_accepted',
      'Exchange Accepted!',
      `${providerName} accepted your request to learn ${skill}`,
      {
        exchangeId,
        providerName,
        skill,
        action: 'view_exchange'
      }
    );
  }

  async notifyExchangeDeclined(requesterId, exchangeData) {
    const { exchangeId, providerName, skill } = exchangeData;
    
    return await this.createNotification(
      requesterId,
      'exchange_declined',
      'Exchange Declined',
      `${providerName} declined your request to learn ${skill}`,
      {
        exchangeId,
        providerName,
        skill,
        action: 'view_exchange'
      }
    );
  }

  async notifyExchangeStatusChange(userId, statusData) {
    const { exchangeId, status, updatedBy } = statusData;
    
    const statusMessages = {
      'Accepted': 'has been accepted',
      'In Progress': 'is now in progress',
      'Completed': 'has been completed',
      'Cancelled': 'has been cancelled'
    };

    const message = statusMessages[status] || `status changed to ${status}`;
    
    return await this.createNotification(
      userId,
      'exchange_status_change',
      'Exchange Status Update',
      `Your exchange ${message} by ${updatedBy}`,
      {
        exchangeId,
        status,
        updatedBy,
        action: 'view_exchange'
      }
    );
  }

  async notifyNewMessage(userId, messageData) {
    const { exchangeId, senderName, skill, messagePreview } = messageData;
    
    return await this.createNotification(
      userId,
      'new_message',
      'New Message',
      `${senderName} sent a message about ${skill}`,
      {
        exchangeId,
        senderName,
        skill,
        messagePreview,
        action: 'view_messages'
      }
    );
  }

  async notifyNewRating(userId, ratingData) {
    const { exchangeId, raterName, score, skill } = ratingData;
    
    return await this.createNotification(
      userId,
      'new_rating',
      'New Rating Received',
      `${raterName} rated you ${score}/5 stars for ${skill}`,
      {
        exchangeId,
        raterName,
        score,
        skill,
        action: 'view_profile'
      }
    );
  }

  async notifyPointsAwarded(userId, pointsData) {
    const { amount, reason, exchangeId } = pointsData;
    
    return await this.createNotification(
      userId,
      'points_awarded',
      'Points Awarded!',
      `You earned ${amount} points for ${reason}`,
      {
        amount,
        reason,
        exchangeId,
        action: 'view_transactions'
      }
    );
  }

  async notifyPointsDeducted(userId, pointsData) {
    const { amount, reason, exchangeId } = pointsData;
    
    return await this.createNotification(
      userId,
      'points_deducted',
      'Points Deducted',
      `${amount} points deducted for ${reason}`,
      {
        amount,
        reason,
        exchangeId,
        action: 'view_transactions'
      }
    );
  }

  async notifySkillMatch(userId, matchData) {
    const { skillName, teacherName, teacherId } = matchData;
    
    return await this.createNotification(
      userId,
      'skill_match',
      'New Skill Match!',
      `${teacherName} offers ${skillName} that you want to learn`,
      {
        skillName,
        teacherName,
        teacherId,
        action: 'view_teacher'
      }
    );
  }

  async notifyExchangeReminder(userId, reminderData) {
    const { exchangeId, skill, scheduledDate, partnerName } = reminderData;
    
    return await this.createNotification(
      userId,
      'exchange_reminder',
      'Exchange Reminder',
      `Your ${skill} session with ${partnerName} is scheduled for ${scheduledDate}`,
      {
        exchangeId,
        skill,
        scheduledDate,
        partnerName,
        action: 'view_exchange'
      }
    );
  }

  // Bulk notification methods
  async notifyAllUsers(type, title, message, data = {}) {
    try {
      const users = await database.getAllUsers(1000, 0); // Get all users
      
      const notifications = await Promise.all(
        users.map(user => 
          this.createNotification(user.id, type, title, message, data)
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  async notifyUsersByLocation(location, type, title, message, data = {}) {
    try {
      const users = await database.db.query(
        'SELECT id FROM users WHERE location LIKE ?',
        [`%${location}%`]
      );
      
      const notifications = await Promise.all(
        users.map(user => 
          this.createNotification(user.id, type, title, message, data)
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error sending location-based notifications:', error);
      throw error;
    }
  }

}

module.exports = new NotificationService();

