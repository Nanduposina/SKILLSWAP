const request = require('supertest');
const express = require('express');
const authController = require('../../src/backend/controllers/authController');
const exchangesController = require('../../src/backend/controllers/exchangesController');

const app = express();
app.use(express.json());
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.getMe);
app.post('/api/exchanges', exchangesController.createExchange);
app.get('/api/exchanges', exchangesController.getAllExchanges);

describe('Error Handling - Simple Integration Tests', () => {
  it('should have error handling components available', () => {
    expect(authController).toBeDefined();
    expect(exchangesController).toBeDefined();
  });

  it('should handle missing authorization header', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    // Should return an error since no authentication
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle invalid email format', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Should return an error for invalid email
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle exchange creation with invalid data', async () => {
    const exchangeData = {
      skillId: 'invalid-skill-id',
      durationHours: 2,
      message: 'Test message'
    };

    const response = await request(app)
      .post('/api/exchanges')
      .send(exchangeData);

    // Should return an error for invalid data
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});