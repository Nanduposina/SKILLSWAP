const express = require('express');
const skillsController = require('../controllers/skillsController');
const router = express.Router();

// Get all available skills
router.get('/available', skillsController.getAvailableSkills);

// Get skill categories
router.get('/categories', skillsController.getSkillCategories);

// Get search filters
router.get('/filters', skillsController.getSearchFilters);

// Search teachers by skill criteria
router.get('/search', skillsController.searchTeachers);

// Get detailed reviews for a specific teacher
router.get('/teacher/:teacherId/reviews', skillsController.getTeacherReviews);

// Create new skill (admin function)
router.post('/', skillsController.createSkill);

// Get skills by category
router.get('/category/:category', skillsController.getSkillsByCategory);

module.exports = router;