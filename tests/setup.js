// Global test setup
const path = require('path');

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '5002';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Mock user data for testing
  mockUser: {
    id: 'test-user-id-123',
    userID: 'SSL123456',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
    location: 'Test City',
    bio: 'Test bio',
    pointsBalance: 100,
    averageRating: 4.5,
    createdAt: new Date().toISOString()
  },

  // Mock exchange data
  mockExchange: {
    id: 'test-exchange-id-123',
    requesterID: 'test-user-id-123',
    providerID: 'test-provider-id-456',
    skillID: 'javascript-basics',
    skill: 'JavaScript',
    skillLevel: 'Beginner',
    description: 'Learn JavaScript basics',
    sessionType: 'Exchange',
    hourlyRate: 10,
    scheduledDate: new Date().toISOString(),
    durationHours: 2,
    isMutualExchange: false,
    status: 'Pending',
    createdAt: new Date().toISOString()
  },

  // Mock skill data
  mockSkill: {
    id: 'test-skill-id-123',
    skillID: 'javascript-basics',
    name: 'JavaScript',
    category: 'Programming',
    skillLevel: 'Beginner',
    hourlyRate: 10
  },

  // Mock notification data
  mockNotification: {
    id: 'test-notification-id-123',
    userId: 'test-user-id-123',
    type: 'exchange_request',
    title: 'New Exchange Request',
    message: 'Test User wants to learn JavaScript from you',
    data: JSON.stringify({
      exchangeId: 'test-exchange-id-123',
      requesterName: 'Test User',
      skill: 'JavaScript'
    }),
    isRead: false,
    createdAt: new Date().toISOString()
  },

  // Helper function to create mock request object
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    user: global.testUtils.mockUser,
    ...overrides
  }),

  // Helper function to create mock response object
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res;
  },

  // Helper function to create mock database
  createMockDatabase: () => ({
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    createExchange: jest.fn(),
    findExchangeById: jest.fn(),
    findExchangesByUserId: jest.fn(),
    updateExchangeStatus: jest.fn(),
    acceptExchange: jest.fn(),
    declineExchange: jest.fn(),
    createRating: jest.fn(),
    getUserRatings: jest.fn(),
    addMessage: jest.fn(),
    getExchangeMessages: jest.fn(),
    createNotification: jest.fn(),
    getUserNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    getAllSkills: jest.fn(),
    getSkillCategories: jest.fn(),
    searchTeachers: jest.fn(),
    deductPoints: jest.fn(),
    awardPoints: jest.fn(),
    findTransactionByExchangeAndType: jest.fn()
  })
};

// Console override to reduce noise during tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
