import axios from '../config/axios';

export const usersService = {
  // Get user profile by ID
  getUserById: async (userId) => {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    const response = await axios.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Get user transactions
  getMyTransactions: async (page = 1, limit = 50) => {
    const response = await axios.get(`/api/users/my-transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search users
  searchUsers: async (searchParams) => {
    const response = await axios.get('/api/users/search', { params: searchParams });
    return response.data;
  },

  // Add skill offered
  addSkillOffered: async (userId, skillData) => {
    const response = await axios.post(`/api/users/${userId}/skills/offered`, skillData);
    return response.data;
  },

};
