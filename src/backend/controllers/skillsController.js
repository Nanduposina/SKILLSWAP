const database = require('../models/Database');

class SkillsController {
  // Get all available skills
  async getAvailableSkills(req, res) {
    try {
      const skills = await database.getAllSkills();
      
      res.json({
        success: true,
        data: skills
      });

    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get skill categories
  async getSkillCategories(req, res) {
    try {
      const categories = await database.getSkillCategories();
      
      res.json({
        success: true,
        data: categories.map(c => c.category)
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get search filters
  async getSearchFilters(req, res) {
    try {
      const filters = await database.getSearchFilters();
      
      res.json({
        success: true,
        data: filters
      });

    } catch (error) {
      console.error('Get filters error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search teachers by skill criteria
  async searchTeachers(req, res) {
    try {
      const {
        skill,
        category,
        location,
        skillLevel,
        minRating,
        maxHourlyRate,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        skill,
        category,
        location,
        skillLevel,
        minRating: minRating ? parseFloat(minRating) : undefined,
        maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const teachers = await database.searchTeachers(filters);

      res.json({
        success: true,
        data: teachers,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: teachers.length
        }
      });

    } catch (error) {
      console.error('Search teachers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get detailed reviews for a specific teacher
  async getTeacherReviews(req, res) {
    try {
      const { teacherId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const reviews = await database.getUserRatings(teacherId);
      
      // Apply pagination
      const paginatedReviews = reviews.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      res.json({
        success: true,
        data: paginatedReviews,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: reviews.length
        }
      });

    } catch (error) {
      console.error('Get teacher reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new skill (admin function)
  async createSkill(req, res) {
    try {
      const { name, category, skillLevel, hourlyRate } = req.body;

      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required'
        });
      }

      const skill = await database.createSkill({
        name,
        category,
        skillLevel: skillLevel || 'Beginner',
        hourlyRate: hourlyRate || 0
      });

      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: skill
      });

    } catch (error) {
      console.error('Create skill error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get skills by category
  async getSkillsByCategory(req, res) {
    try {
      const { category } = req.params;
      const skills = await database.getSkillsByCategory(category);
      
      res.json({
        success: true,
        data: skills
      });

    } catch (error) {
      console.error('Get skills by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new SkillsController();
