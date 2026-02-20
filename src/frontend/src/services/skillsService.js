import axios from '../config/axios';

export const skillsService = {
  // Get all available skills
  getAllSkills: async () => {
    const response = await axios.get('/api/skills/available');
    return response.data;
  },

  // Get skill categories
  getSkillCategories: async () => {
    const response = await axios.get('/api/skills/categories');
    return response.data;
  },

  // Get search filters
  getSearchFilters: async () => {
    const response = await axios.get('/api/skills/filters');
    return response.data;
  },

  // Search teachers
  searchTeachers: async (searchParams) => {
    const response = await axios.get('/api/skills/search', { params: searchParams });
    return response.data;
  },

  // Get teacher reviews
  getTeacherReviews: async (teacherId, limit = 10, offset = 0) => {
    const response = await axios.get(`/api/skills/teacher/${teacherId}/reviews`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Create new skill
  createSkill: async (skillData) => {
    const response = await axios.post('/api/skills/', skillData);
    return response.data;
  },

  // Get skills by category
  getSkillsByCategory: async (category) => {
    const response = await axios.get(`/api/skills/category/${category}`);
    return response.data;
  }
};
