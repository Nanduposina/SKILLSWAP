import axios from '../config/axios';

export const exchangesService = {
  // Get user's exchanges
  getMyExchanges: async () => {
    const response = await axios.get('/api/exchanges/my-exchanges');
    return response.data;
  },

  // Get exchange by ID
  getExchangeById: async (id) => {
    const response = await axios.get(`/api/exchanges/${id}`);
    return response.data;
  },

  // Create exchange request
  createExchange: async (exchangeData) => {
    const response = await axios.post('/api/exchanges/create', exchangeData);
    return response.data;
  },

  // Create teacher request
  createTeacherRequest: async (exchangeData) => {
    const response = await axios.post('/api/exchanges/create-teacher-request', exchangeData);
    return response.data;
  },

  // Accept exchange
  acceptExchange: async (id) => {
    const response = await axios.put(`/api/exchanges/${id}/accept`);
    return response.data;
  },

  // Decline exchange
  declineExchange: async (id) => {
    const response = await axios.put(`/api/exchanges/${id}/decline`);
    return response.data;
  },

  // Revoke exchange
  revokeExchange: async (id) => {
    const response = await axios.put(`/api/exchanges/${id}/revoke`);
    return response.data;
  },

  // Update exchange status
  updateExchangeStatus: async (id, status) => {
    const response = await axios.put(`/api/exchanges/${id}/status`, { status });
    return response.data;
  },

  // Send message in exchange
  sendMessage: async (id, content, messageType = 'text') => {
    const response = await axios.post(`/api/exchanges/${id}/message`, {
      content,
      messageType
    });
    return response.data;
  },

  // Rate exchange
  rateExchange: async (id, ratedUserID, score, reviewText) => {
    const response = await axios.post(`/api/exchanges/${id}/rate`, {
      ratedUserID,
      score,
      reviewText
    });
    return response.data;
  }
};
