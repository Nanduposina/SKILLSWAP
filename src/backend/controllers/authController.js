const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../models/Database');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, location, bio } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await database.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await database.createUser({
        name,
        email,
        password,
        location,
        bio
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          userID: user.userID, 
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await database.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          userID: user.userID, 
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await database.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's offered skills
      const skillsOffered = await database.getUserSkillsOffered(req.user.userId);
      
      // Get user's ratings
      const ratings = await database.getUserRatings(req.user.userId);

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
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const user = await database.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          userID: user.userID, 
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Logout (client-side token removal)
  logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }

  // Test endpoint
  test(req, res) {
    res.json({
      success: true,
      message: 'Authentication service is working',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  register: (req, res) => new AuthController().register(req, res),
  login: (req, res) => new AuthController().login(req, res),
  getMe: (req, res) => new AuthController().getProfile(req, res),
  refreshToken: (req, res) => new AuthController().refreshToken(req, res),
  logout: (req, res) => new AuthController().logout(req, res),
  testAuth: (req, res) => new AuthController().test(req, res)
};
