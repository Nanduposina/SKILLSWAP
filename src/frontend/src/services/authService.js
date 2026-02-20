import axios from '../config/axios';

export const authService = {
  // Get current user profile
  getMe: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await axios.post('/api/auth/refresh');
    return response.data;
  }
};
