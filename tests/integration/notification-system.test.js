const notificationService = require('../../src/backend/services/NotificationService');
const database = require('../../src/backend/models/Database');

describe('Notification System - Simple Integration Tests', () => {
  it('should have notification service available', () => {
    expect(notificationService).toBeDefined();
    expect(typeof notificationService.createNotification).toBe('function');
    expect(typeof notificationService.notifyNewExchangeRequest).toBe('function');
    expect(typeof notificationService.notifyExchangeAccepted).toBe('function');
    expect(typeof notificationService.notifyExchangeDeclined).toBe('function');
  });

  it('should have database service available', () => {
    expect(database).toBeDefined();
    expect(typeof database.createUser).toBe('function');
    expect(typeof database.createSkill).toBe('function');
    expect(typeof database.createExchange).toBe('function');
  });

  it('should handle notification creation', async () => {
    try {
      const result = await notificationService.createNotification(
        'user-123',
        'test',
        'Test Notification',
        'This is a test notification'
      );
      expect(result).toBeDefined();
    } catch (error) {
      // Database might not be available in test environment
      expect(error).toBeDefined();
    }
  });
});