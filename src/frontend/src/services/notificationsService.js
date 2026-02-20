import axios from '../config/axios';

export const notificationsService = {
  // Get user notifications
  getNotifications: async (limit = 50) => {
    const response = await axios.get('/api/notifications', {
      params: { limit }
    });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axios.put('/api/notifications/mark-all-read');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }
};
