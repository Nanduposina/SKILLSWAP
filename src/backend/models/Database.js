const database = require('../connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getCurrentSwedishTimeISO, getSwedishTimeForDB } = require('../utils/timeUtils');

class DatabaseService {
  constructor() {
    this.db = database;
  }

  async initialize() {
    try {
      await this.db.initialize();
    } catch (error) {
      throw error;
    }
  }

  // User Management
  async createUser(userData) {
    const { name, email, password, location, bio } = userData;
    const id = uuidv4();
    const userID = 'SSL' + Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await this.db.run(
      `INSERT INTO users (id, userID, name, email, password, location, bio, pointsBalance) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userID, name, email, hashedPassword, location || '', bio || '', 100]
    );

    return { id, userID, ...userData, pointsBalance: 100 };
  }

  async findUserByEmail(email) {
    return await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async findUserById(id) {
    return await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async findUserByUserID(userID) {
    return await this.db.get('SELECT * FROM users WHERE userID = ?', [userID]);
  }

  async updateUser(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    await this.db.run(sql, values);
    return await this.findUserById(id);
  }

  async getAllUsers(limit = 50, offset = 0) {
    return await this.db.query(
      'SELECT id, userID, name, email, location, bio, profilePicture, pointsBalance, averageRating, createdAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  async searchUsers(searchTerm, filters = {}) {
    let sql = `
      SELECT DISTINCT u.id, u.userID, u.name, u.email, u.location, u.bio, 
             u.profilePicture, u.pointsBalance, u.averageRating, u.createdAt
      FROM users u
      LEFT JOIN user_skills_offered uso ON u.id = uso.userID
      LEFT JOIN skills s ON uso.skillID = s.id
      WHERE 1=1
    `;
    const params = [];

    if (searchTerm) {
      sql += ` AND (u.name LIKE ? OR u.bio LIKE ? OR s.name LIKE ?)`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.location) {
      sql += ` AND u.location LIKE ?`;
      params.push(`%${filters.location}%`);
    }

    if (filters.skill) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${filters.skill}%`);
    }

    if (filters.minRating) {
      sql += ` AND u.averageRating >= ?`;
      params.push(filters.minRating);
    }

    sql += ` ORDER BY u.averageRating DESC, u.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit || 20, filters.offset || 0);

    return await this.db.query(sql, params);
  }

  // Skills Management
  async createSkill(skillData) {
    const { name, category, skillLevel, hourlyRate } = skillData;
    const id = uuidv4();
    const skillID = name.toLowerCase().replace(/\s+/g, '-') + '_' + Date.now();

    const result = await this.db.run(
      `INSERT INTO skills (id, skillID, name, category, skillLevel, hourlyRate) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, skillID, name, category, skillLevel, hourlyRate || 0]
    );

    return { id, skillID, ...skillData };
  }

  async getAllSkills() {
    return await this.db.query('SELECT * FROM skills ORDER BY name');
  }

  async getSkillsByCategory(category) {
    return await this.db.query('SELECT * FROM skills WHERE category = ? ORDER BY name', [category]);
  }

  async getSkillCategories() {
    return await this.db.query('SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category');
  }

  // User Skills Management
  async addUserSkillOffered(userID, skillID, skillLevel, hourlyRate, description) {
    const id = uuidv4();
    await this.db.run(
      `INSERT OR REPLACE INTO user_skills_offered (id, userID, skillID, skillLevel, hourlyRate, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userID, skillID, skillLevel, hourlyRate, description]
    );
    return { id, userID, skillID, skillLevel, hourlyRate, description };
  }


  async getUserSkillsOffered(userID) {
    return await this.db.query(`
      SELECT uso.*, s.name as skillName, s.category 
      FROM user_skills_offered uso 
      JOIN skills s ON uso.skillID = s.id 
      WHERE uso.userID = ?
    `, [userID]);
  }


  // Exchange Management
  async createExchange(exchangeData) {
    const {
      requesterID, providerID, skillID, skill, skillLevel, description,
      sessionType, hourlyRate, scheduledDate, durationHours, isMutualExchange
    } = exchangeData;

    const id = uuidv4();

    const result = await this.db.run(
      `INSERT INTO exchanges (id, requesterID, providerID, skillID, skill, skillLevel, description, 
       sessionType, hourlyRate, scheduledDate, durationHours, isMutualExchange) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, requesterID, providerID, skillID, skill, skillLevel, description,
        sessionType, hourlyRate, scheduledDate, durationHours, isMutualExchange]
    );

    return { id, ...exchangeData, status: 'Pending', createdAt: new Date().toISOString() };
  }

  async findExchangeById(id) {
    return await this.db.get('SELECT * FROM exchanges WHERE id = ?', [id]);
  }

  async findExchangesByUserId(userID) {
    return await this.db.query(`
      SELECT e.*, 
             requester.name as requesterName, requester.email as requesterEmail,
             provider.name as providerName, provider.email as providerEmail
      FROM exchanges e
      LEFT JOIN users requester ON e.requesterID = requester.id
      LEFT JOIN users provider ON e.providerID = provider.id
      WHERE e.requesterID = ? OR e.providerID = ?
      ORDER BY e.createdAt DESC
    `, [userID, userID]);
  }

  async updateExchangeStatus(id, status) {
    await this.db.run(
      'UPDATE exchanges SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return await this.findExchangeById(id);
  }

  async acceptExchange(id) {
    return await this.updateExchangeStatus(id, 'Accepted');
  }

  async declineExchange(id) {
    return await this.updateExchangeStatus(id, 'Cancelled');
  }

  async completeExchange(id) {
    return await this.updateExchangeStatus(id, 'Completed');
  }

  // Messaging
  async addMessage(messageData) {
    const { exchangeID, senderID, content, messageType } = messageData;
    const id = uuidv4();
    const swedishTime = getSwedishTimeForDB();

    await this.db.run(
      `INSERT INTO messages (id, exchangeID, senderID, content, messageType, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, exchangeID, senderID, content, messageType || 'text', swedishTime]
    );

    return { id, ...messageData, createdAt: getCurrentSwedishTimeISO() };
  }

  async getExchangeMessages(exchangeID) {
    return await this.db.query(`
      SELECT m.*, u.name as senderName, u.profilePicture as senderPicture
      FROM messages m
      JOIN users u ON m.senderID = u.id
      WHERE m.exchangeID = ?
      ORDER BY m.createdAt ASC
    `, [exchangeID]);
  }

  // Ratings
  async createRating(ratingData) {
    const { exchangeID, raterID, ratedUserID, reviewText, score } = ratingData;
    const id = uuidv4();

    await this.db.run(
      `INSERT OR REPLACE INTO ratings (id, exchangeID, raterID, ratedUserID, reviewText, score) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, exchangeID, raterID, ratedUserID, reviewText, score]
    );

    // Update user's average rating
    await this.updateUserAverageRating(ratedUserID);

    return { id, ...ratingData, createdAt: new Date().toISOString() };
  }

  async getExchangeRatings(exchangeID) {
    return await this.db.query(`
      SELECT r.*, u.name as raterName, u.profilePicture as raterPicture
      FROM ratings r
      JOIN users u ON r.raterID = u.id
      WHERE r.exchangeID = ?
      ORDER BY r.createdAt DESC
    `, [exchangeID]);
  }

  async getUserRatings(userID) {
    return await this.db.query(`
      SELECT r.*, u.name as raterName, u.profilePicture as raterPicture
      FROM ratings r
      JOIN users u ON r.raterID = u.id
      WHERE r.ratedUserID = ?
      ORDER BY r.createdAt DESC
    `, [userID]);
  }

  async updateUserAverageRating(userID) {
    const ratings = await this.db.query(
      'SELECT AVG(score) as avgScore FROM ratings WHERE ratedUserID = ?',
      [userID]
    );

    const averageRating = ratings[0]?.avgScore || 0;
    await this.db.run(
      'UPDATE users SET averageRating = ? WHERE id = ?',
      [averageRating, userID]
    );
  }

  // Transactions
  async createTransaction(transactionData) {
    const { userID, amount, transactionType, description, exchangeID } = transactionData;
    const id = uuidv4();

    await this.db.run(
      `INSERT INTO transactions (id, userID, amount, transactionType, description, exchangeID) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userID, amount, transactionType, description, exchangeID]
    );

    // Update user's points balance
    await this.updateUserPointsBalance(userID, amount);

    return { id, ...transactionData, createdAt: new Date().toISOString() };
  }


  async updateUserPointsBalance(userID, amount) {
    await this.db.run(
      'UPDATE users SET pointsBalance = pointsBalance + ? WHERE id = ?',
      [amount, userID]
    );
  }

  async deductPoints(userID, amount, transactionType, description, exchangeID = null) {
    // First deduct from user's balance
    await this.db.run(
      'UPDATE users SET pointsBalance = pointsBalance - ? WHERE id = ?',
      [amount, userID]
    );

    // Create transaction record
    const transactionId = uuidv4();
    await this.db.run(
      `INSERT INTO transactions (id, userID, amount, transactionType, description, exchangeID) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transactionId, userID, -amount, transactionType, description, exchangeID]
    );

    return { id: transactionId, userID, amount: -amount, transactionType, description, exchangeID };
  }

  async awardPoints(userID, amount, transactionType, description, exchangeID = null) {
    // First add to user's balance
    await this.db.run(
      'UPDATE users SET pointsBalance = pointsBalance + ? WHERE id = ?',
      [amount, userID]
    );

    // Create transaction record
    const transactionId = uuidv4();
    await this.db.run(
      `INSERT INTO transactions (id, userID, amount, transactionType, description, exchangeID) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transactionId, userID, amount, transactionType, description, exchangeID]
    );

    return { id: transactionId, userID, amount, transactionType, description, exchangeID };
  }

  async findTransactionByExchangeAndType(exchangeID, transactionType) {
    const result = await this.db.query(
      'SELECT * FROM transactions WHERE exchangeID = ? AND transactionType = ? LIMIT 1',
      [exchangeID, transactionType]
    );
    return result.length > 0 ? result[0] : null;
  }

  // Notifications
  async createNotification(notificationData) {
    const { userId, type, title, message, data } = notificationData;
    const id = uuidv4();

    await this.db.run(
      `INSERT INTO notifications (id, userId, type, title, message, data) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, type, title, message, JSON.stringify(data || {})]
    );

    return { id, ...notificationData, isRead: false, createdAt: new Date().toISOString() };
  }

  async getUserNotifications(userID, limit = 50) {
    return await this.db.query(`
      SELECT * FROM notifications 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ?
    `, [userID, limit]);
  }

  async markNotificationAsRead(notificationID) {
    await this.db.run(
      'UPDATE notifications SET isRead = TRUE, readAt = CURRENT_TIMESTAMP WHERE id = ?',
      [notificationID]
    );
  }

  async markAllNotificationsAsRead(userID) {
    await this.db.run(
      'UPDATE notifications SET isRead = TRUE, readAt = CURRENT_TIMESTAMP WHERE userId = ?',
      [userID]
    );
  }

  // Search and Filtering
  async searchTeachers(filters = {}) {
    let sql = `
      SELECT DISTINCT u.id, u.userID, u.name, u.email, u.location, u.bio, 
             u.profilePicture, u.pointsBalance, u.averageRating, u.createdAt,
             uso.skillLevel, uso.hourlyRate, uso.description as skillDescription,
             s.name as skillName, s.category as skillCategory
      FROM users u
      JOIN user_skills_offered uso ON u.id = uso.userID
      JOIN skills s ON uso.skillID = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.skill) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${filters.skill}%`);
    }

    if (filters.category) {
      sql += ` AND s.category = ?`;
      params.push(filters.category);
    }

    if (filters.location) {
      sql += ` AND u.location LIKE ?`;
      params.push(`%${filters.location}%`);
    }

    if (filters.skillLevel) {
      sql += ` AND uso.skillLevel = ?`;
      params.push(filters.skillLevel);
    }

    if (filters.minRating) {
      sql += ` AND u.averageRating >= ?`;
      params.push(filters.minRating);
    }

    if (filters.maxHourlyRate) {
      sql += ` AND uso.hourlyRate <= ?`;
      params.push(filters.maxHourlyRate);
    }

    sql += ` ORDER BY u.averageRating DESC, u.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit || 20, filters.offset || 0);

    return await this.db.query(sql, params);
  }

  async getSearchFilters() {
    const categories = await this.getSkillCategories();
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    return {
      categories: categories.map(c => c.category),
      skillLevels,
      maxHourlyRate: 100 // This could be calculated from actual data
    };
  }

  // Transaction history methods
  async getUserTransactions(userID, limit = 50, offset = 0) {
    return await this.db.query(`
      SELECT 
        t.*,
        e.skill,
        e.status as exchangeStatus,
        e.hourlyRate,
        e.durationHours
      FROM transactions t
      LEFT JOIN exchanges e ON t.exchangeID = e.id
      WHERE t.userID = ?
      ORDER BY t.createdAt DESC
      LIMIT ? OFFSET ?
    `, [userID, limit, offset]);
  }

  async getUserTransactionCount(userID) {
    const result = await this.db.query(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE userID = ?
    `, [userID]);
    return result[0].count;
  }
}

module.exports = new DatabaseService();
