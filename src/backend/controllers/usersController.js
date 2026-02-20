const database = require('../models/Database');

class UsersController {
  // Get user's transaction history
  async getMyTransactions(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const transactions = await database.getUserTransactions(userId, limit, offset);
      const totalTransactions = await database.getUserTransactionCount(userId);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalTransactions,
            pages: Math.ceil(totalTransactions / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { 
        search, 
        location, 
        skill, 
        minRating, 
        limit = 20, 
        offset = 0 
      } = req.query;

      const filters = {
        searchTerm: search,
        location,
        skill,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const users = await database.searchUsers(search, filters);

      res.json({
        success: true,
        data: users,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: users.length
        }
      });

    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user profile by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await database.findUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's offered skills
      const skillsOffered = await database.getUserSkillsOffered(id);
      
      // Get user's ratings
      const ratings = await database.getUserRatings(id);
      
      // Calculate average rating
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length 
        : 0;
      
      // Update user's average rating in database
      if (avgRating !== user.averageRating) {
        await database.updateUser(id, { averageRating: avgRating });
        user.averageRating = avgRating;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          ...userWithoutPassword,
          skillsOffered,
          ratings
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user is updating their own profile
      if (req.user.userId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this profile'
        });
      }

      const updateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.userID;
      delete updateData.password;
      delete updateData.pointsBalance;
      delete updateData.averageRating;
      delete updateData.createdAt;

      const updatedUser = await database.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add skill offered by user
  async addSkillOffered(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user is adding to their own profile
      if (req.user.userId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add skills to this profile'
        });
      }

      const { skillID, skillLevel, hourlyRate, description } = req.body;

      if (!skillID || !skillLevel) {
        return res.status(400).json({
          success: false,
          message: 'Skill ID and skill level are required'
        });
      }

      const skill = await database.addUserSkillOffered(
        id, 
        skillID, 
        skillLevel, 
        hourlyRate || 0, 
        description
      );

      res.status(201).json({
        success: true,
        message: 'Skill added successfully',
        data: skill
      });

    } catch (error) {
      console.error('Add skill offered error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }


  // Get user's transactions
  async getUserTransactions(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user is viewing their own transactions
      if (req.user.userId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these transactions'
        });
      }

      const transactions = await database.getUserTransactions(id, 50, 0);

      res.json({
        success: true,
        data: transactions
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = {
  getMyTransactions: (req, res) => new UsersController().getMyTransactions(req, res),
  searchUsers: (req, res) => new UsersController().searchUsers(req, res),
  getUserProfileById: (req, res) => new UsersController().getUserById(req, res),
  updateUserProfile: (req, res) => new UsersController().updateUser(req, res),
  addUserSkillOffered: (req, res) => new UsersController().addSkillOffered(req, res),
  getUserTransactions: (req, res) => new UsersController().getUserTransactions(req, res)
};
