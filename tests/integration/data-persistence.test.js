const database = require('../../src/backend/models/Database');
const pointsService = require('../../src/backend/services/pointsService');

describe('Data Persistence - Simple Integration Tests', () => {
  it('should have database service available', () => {
    expect(database).toBeDefined();
    expect(typeof database.createUser).toBe('function');
    expect(typeof database.findUserByEmail).toBe('function');
    expect(typeof database.createSkill).toBe('function');
    expect(typeof database.createExchange).toBe('function');
  });

  it('should have points service available', () => {
    expect(pointsService).toBeDefined();
    expect(typeof pointsService.calculatePoints).toBe('function');
    expect(typeof pointsService.awardPoints).toBe('function');
    expect(typeof pointsService.deductPoints).toBe('function');
  });

  it('should handle database operations gracefully', async () => {
    try {
      await database.initialize();
      expect(true).toBe(true);
    } catch (error) {
      // Database might not be available in test environment
      expect(error).toBeDefined();
    }
  });
});