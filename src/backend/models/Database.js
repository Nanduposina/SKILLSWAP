const bcrypt = require('bcryptjs');
const { prisma } = require('../connection');

const publicUser = {
  id: true,
  userID: true,
  name: true,
  email: true,
  location: true,
  bio: true,
  profilePicture: true,
  pointsBalance: true,
  averageRating: true,
  learningPreferences: true,
  createdAt: true,
  updatedAt: true
};

const toStatus = status => status === 'In Progress' ? 'InProgress' : status;
const fromStatus = status => status === 'InProgress' ? 'In Progress' : status;

class DatabaseService {
  async initialize() {
    await prisma.$connect();
  }

  async findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findUserByUserID(userID) {
    return prisma.user.findUnique({ where: { userID } });
  }

  async createUser({ name, email, password, location, bio }) {
    const user = await prisma.user.create({
      data: {
        userID: `SSL${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email,
        password: await bcrypt.hash(password, 12),
        location: location || '',
        bio: bio || ''
      }
    });
    return user;
  }

  async updateUser(id, updateData) {
    const allowed = ['name', 'email', 'location', 'bio', 'profilePicture', 'pointsBalance', 'averageRating', 'learningPreferences'];
    const data = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => allowed.includes(key) && value !== undefined)
    );
    if (!Object.keys(data).length) return this.findUserById(id);
    return prisma.user.update({ where: { id }, data });
  }

  async getAllUsers(take = 50, skip = 0) {
    return prisma.user.findMany({ select: publicUser, orderBy: { createdAt: 'desc' }, take, skip });
  }

  async searchUsers(searchTerm, filters = {}) {
    const term = searchTerm ? { contains: searchTerm, mode: 'insensitive' } : undefined;
    return prisma.user.findMany({
      select: publicUser,
      where: {
        ...(term ? { OR: [{ name: term }, { bio: term }, { offeredSkills: { some: { skill: { name: term } } } }] } : {}),
        ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
        ...(filters.skill ? { offeredSkills: { some: { skill: { name: { contains: filters.skill, mode: 'insensitive' } } } } } : {}),
        ...(filters.minRating ? { averageRating: { gte: Number(filters.minRating) } } : {})
      },
      orderBy: [{ averageRating: 'desc' }, { createdAt: 'desc' }],
      take: Number(filters.limit || 20),
      skip: Number(filters.offset || 0)
    });
  }

  async createSkill({ name, category, skillLevel, hourlyRate }) {
    return prisma.skill.create({
      data: {
        skillID: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        category,
        skillLevel,
        hourlyRate: Number(hourlyRate || 0)
      }
    });
  }

  async getAllSkills() {
    return prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }

  async getSkillsByCategory(category) {
    return prisma.skill.findMany({ where: { category }, orderBy: { name: 'asc' } });
  }

  async getSkillCategories() {
    return prisma.skill.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } });
  }

  async addUserSkillOffered(userID, skillID, skillLevel, hourlyRate, description) {
    return prisma.userSkillOffered.upsert({
      where: { userID_skillID: { userID, skillID } },
      update: { skillLevel, hourlyRate: Number(hourlyRate || 0), description },
      create: { userID, skillID, skillLevel, hourlyRate: Number(hourlyRate || 0), description }
    });
  }

  async getUserSkillsOffered(userID) {
    const records = await prisma.userSkillOffered.findMany({ where: { userID }, include: { skill: true } });
    return records.map(record => ({ ...record, skillName: record.skill.name, category: record.skill.category, skill: undefined }));
  }

  async createExchange(data) {
    return prisma.exchange.create({
      data: {
        requesterID: data.requesterID,
        providerID: data.providerID,
        skillID: data.skillID,
        skill: data.skill,
        skillLevel: data.skillLevel,
        description: data.description,
        sessionType: data.sessionType || 'Exchange',
        hourlyRate: Number(data.hourlyRate || 0),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        durationHours: Number(data.durationHours || 1),
        isMutualExchange: Boolean(data.isMutualExchange)
      }
    });
  }

  async findExchangeById(id) {
    const exchange = await prisma.exchange.findUnique({ where: { id } });
    return exchange && { ...exchange, status: fromStatus(exchange.status) };
  }

  async findExchangesByUserId(userID) {
    const exchanges = await prisma.exchange.findMany({
      where: { OR: [{ requesterID: userID }, { providerID: userID }] },
      include: { requester: { select: { name: true, email: true } }, provider: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return exchanges.map(exchange => ({
      ...exchange,
      status: fromStatus(exchange.status),
      requesterName: exchange.requester.name,
      requesterEmail: exchange.requester.email,
      providerName: exchange.provider.name,
      providerEmail: exchange.provider.email,
      requester: undefined,
      provider: undefined
    }));
  }

  async updateExchangeStatus(id, status) {
    const exchange = await prisma.exchange.update({ where: { id }, data: { status: toStatus(status) } });
    return { ...exchange, status: fromStatus(exchange.status) };
  }

  async acceptExchange(id) { return this.updateExchangeStatus(id, 'Accepted'); }
  async declineExchange(id) { return this.updateExchangeStatus(id, 'Cancelled'); }
  async completeExchange(id) { return this.updateExchangeStatus(id, 'Completed'); }

  async addMessage({ exchangeID, senderID, content, messageType = 'text' }) {
    return prisma.message.create({ data: { exchangeID, senderID, content, messageType } });
  }

  async getExchangeMessages(exchangeID) {
    const messages = await prisma.message.findMany({
      where: { exchangeID },
      include: { sender: { select: { name: true, profilePicture: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return messages.map(message => ({ ...message, senderName: message.sender.name, senderPicture: message.sender.profilePicture, sender: undefined }));
  }

  async createRating({ exchangeID, raterID, ratedUserID, reviewText, score }) {
    const rating = await prisma.rating.upsert({
      where: { exchangeID_raterID: { exchangeID, raterID } },
      update: { ratedUserID, reviewText, score },
      create: { exchangeID, raterID, ratedUserID, reviewText, score }
    });
    await this.updateUserAverageRating(ratedUserID);
    return rating;
  }

  async getExchangeRatings(exchangeID) {
    const ratings = await prisma.rating.findMany({ where: { exchangeID }, include: { rater: { select: { name: true, profilePicture: true } } }, orderBy: { createdAt: 'desc' } });
    return ratings.map(rating => ({ ...rating, raterName: rating.rater.name, raterPicture: rating.rater.profilePicture, rater: undefined }));
  }

  async getUserRatings(ratedUserID) {
    const ratings = await prisma.rating.findMany({ where: { ratedUserID }, include: { rater: { select: { name: true, profilePicture: true } } }, orderBy: { createdAt: 'desc' } });
    return ratings.map(rating => ({ ...rating, raterName: rating.rater.name, raterPicture: rating.rater.profilePicture, rater: undefined }));
  }

  async updateUserAverageRating(userID) {
    const aggregate = await prisma.rating.aggregate({ where: { ratedUserID: userID }, _avg: { score: true } });
    await prisma.user.update({ where: { id: userID }, data: { averageRating: aggregate._avg.score || 0 } });
  }

  async createTransaction({ userID, amount, transactionType, description, exchangeID }) {
    const transaction = await prisma.transaction.create({ data: { userID, amount, transactionType, description, exchangeID } });
    await this.updateUserPointsBalance(userID, amount);
    return transaction;
  }

  async updateUserPointsBalance(userID, amount) {
    return prisma.user.update({ where: { id: userID }, data: { pointsBalance: { increment: amount } } });
  }

  async deductPoints(userID, amount, transactionType, description, exchangeID = null) {
    await prisma.user.update({ where: { id: userID }, data: { pointsBalance: { decrement: amount } } });
    return prisma.transaction.create({ data: { userID, amount: -amount, transactionType, description, exchangeID } });
  }

  async awardPoints(userID, amount, transactionType, description, exchangeID = null) {
    await this.updateUserPointsBalance(userID, amount);
    return prisma.transaction.create({ data: { userID, amount, transactionType, description, exchangeID } });
  }

  async findTransactionByExchangeAndType(exchangeID, transactionType) {
    return prisma.transaction.findFirst({ where: { exchangeID, transactionType } });
  }

  async createNotification({ userId, type, title, message, data = {} }) {
    return prisma.notification.create({ data: { userId, type, title, message, data } });
  }

  async getUserNotifications(userId, take = 50) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take });
  }

  async getNotification(id, userId) {
    return prisma.notification.findFirst({ where: { id, userId } });
  }

  async getUnreadNotificationCount(userId) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markNotificationAsRead(id) {
    return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
  }

  async markAllNotificationsAsRead(userId) {
    return prisma.notification.updateMany({ where: { userId }, data: { isRead: true, readAt: new Date() } });
  }

  async deleteNotification(id, userId) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  }

  async searchTeachers(filters = {}) {
    const records = await prisma.userSkillOffered.findMany({
      where: {
        ...(filters.skill ? { skill: { name: { contains: filters.skill, mode: 'insensitive' } } } : {}),
        ...(filters.category ? { skill: { category: filters.category } } : {}),
        ...(filters.location ? { user: { location: { contains: filters.location, mode: 'insensitive' } } } : {}),
        ...(filters.skillLevel ? { skillLevel: filters.skillLevel } : {}),
        ...(filters.minRating ? { user: { averageRating: { gte: Number(filters.minRating) } } } : {}),
        ...(filters.maxHourlyRate ? { hourlyRate: { lte: Number(filters.maxHourlyRate) } } : {})
      },
      include: { user: { select: publicUser }, skill: true },
      orderBy: [{ user: { averageRating: 'desc' } }, { user: { createdAt: 'desc' } }],
      take: Number(filters.limit || 20),
      skip: Number(filters.offset || 0)
    });
    return records.map(record => ({
      ...record.user,
      skillLevel: record.skillLevel,
      hourlyRate: record.hourlyRate,
      skillDescription: record.description,
      skillName: record.skill.name,
      skillCategory: record.skill.category
    }));
  }

  async getSearchFilters() {
    const categories = await this.getSkillCategories();
    return { categories: categories.map(item => item.category), skillLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], maxHourlyRate: 100 };
  }

  async getUserTransactions(userID, take = 50, skip = 0) {
    const transactions = await prisma.transaction.findMany({
      where: { userID },
      include: { exchange: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    });
    return transactions.map(transaction => ({
      ...transaction,
      skill: transaction.exchange?.skill,
      exchangeStatus: transaction.exchange?.status && fromStatus(transaction.exchange.status),
      hourlyRate: transaction.exchange?.hourlyRate,
      durationHours: transaction.exchange?.durationHours,
      exchange: undefined
    }));
  }

  async getUserTransactionCount(userID) {
    return prisma.transaction.count({ where: { userID } });
  }

  async getUsersByLocation(location) {
    return prisma.user.findMany({ where: { location: { contains: location, mode: 'insensitive' } }, select: { id: true } });
  }
}

module.exports = new DatabaseService();
