const database = require('./connection');
const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor() {
    this.db = database;
  }

  async reset() {
    try {
      await this.db.connect();

      const tables = [
        'notifications', 'transactions', 'ratings', 'messages',
        'exchanges', 'user_skills_offered',
        'skills', 'users'
      ];

      for (const table of tables) {
        try {
          await this.db.run(`DROP TABLE IF EXISTS ${table}`);
        } catch (error) {
          // Table may not exist, continue
        }
      }

      await this.db.createTables();
      await this.seed();
    } catch (error) {
      console.error('Database reset error:', error);
      throw error;
    }
  }

  async migrate() {
    try {
      await this.db.connect();
      await this.db.createTables();
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
}

  async seed() {
  try {
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');

    // 1. Insert sample users
    const users = [
      {
        id: uuidv4(),
        userID: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        password: await bcrypt.hash('password123', 10),
        location: 'Stockholm, Sweden',
        bio: 'Passionate about technology and learning new skills!',
        pointsBalance: 150,
        averageRating: 4.5
      },
      {
        id: uuidv4(),
        userID: 'test-user',
        name: 'Test User',
        email: 'test@test.com',
        password: await bcrypt.hash('password123', 10),
        location: 'Gothenburg, Sweden',
        bio: 'Love cooking and photography. Always eager to share knowledge.',
        pointsBalance: 200,
        averageRating: 4.8
      },
      {
        id: uuidv4(),
        userID: 'alice-smith',
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
        location: 'Malmö, Sweden',
        bio: 'Professional photographer and guitar enthusiast.',
        pointsBalance: 120,
        averageRating: 4.6
      },
      {
        id: uuidv4(),
        userID: 'bob-jones',
        name: 'Bob Jones',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
        location: 'Uppsala, Sweden',
        bio: 'Web designer by day, yoga instructor by evening.',
        pointsBalance: 180,
        averageRating: 4.7
      },
      {
        id: uuidv4(),
        userID: 'emma-wilson',
        name: 'Emma Wilson',
        email: 'emma@example.com',
        password: await bcrypt.hash('password123', 10),
        location: 'Stockholm, Sweden',
        bio: 'Language teacher and gardening lover.',
        pointsBalance: 95,
        averageRating: 4.9
      }
    ];

    for (const user of users) {
      await this.db.run(
        `INSERT OR IGNORE INTO users (id, userID, name, email, password, location, bio, pointsBalance, averageRating) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.userID, user.name, user.email, user.password, user.location, user.bio, user.pointsBalance, user.averageRating]
      );
    }

    // 2. Insert sample skills
    const skills = [
      { id: uuidv4(), skillID: 'programming', name: 'Programming', category: 'Technology', skillLevel: 'Intermediate', hourlyRate: 50 },
      { id: uuidv4(), skillID: 'cooking', name: 'Cooking', category: 'Lifestyle', skillLevel: 'Beginner', hourlyRate: 20 },
      { id: uuidv4(), skillID: 'photography', name: 'Photography', category: 'Arts', skillLevel: 'Advanced', hourlyRate: 40 },
      { id: uuidv4(), skillID: 'guitar', name: 'Guitar', category: 'Music', skillLevel: 'Intermediate', hourlyRate: 30 },
      { id: uuidv4(), skillID: 'spanish', name: 'Spanish Language', category: 'Language', skillLevel: 'Beginner', hourlyRate: 25 },
      { id: uuidv4(), skillID: 'yoga', name: 'Yoga', category: 'Fitness', skillLevel: 'Intermediate', hourlyRate: 35 },
      { id: uuidv4(), skillID: 'web-design', name: 'Web Design', category: 'Technology', skillLevel: 'Advanced', hourlyRate: 55 },
      { id: uuidv4(), skillID: 'gardening', name: 'Gardening', category: 'Lifestyle', skillLevel: 'Beginner', hourlyRate: 15 },
      { id: uuidv4(), skillID: 'python', name: 'Python Programming', category: 'Technology', skillLevel: 'Advanced', hourlyRate: 60 },
      { id: uuidv4(), skillID: 'painting', name: 'Painting', category: 'Arts', skillLevel: 'Intermediate', hourlyRate: 30 }
    ];

    for (const skill of skills) {
      await this.db.run(
        `INSERT OR IGNORE INTO skills (id, skillID, name, category, skillLevel, hourlyRate) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        [skill.id, skill.skillID, skill.name, skill.category, skill.skillLevel, skill.hourlyRate]
      );
    }

    // Get inserted IDs for relationships
    const dbUsers = await this.db.query('SELECT * FROM users');
    const dbSkills = await this.db.query('SELECT * FROM skills');

    // 3. Insert user_skills_offered
    const skillsOffered = [
      { userID: dbUsers[0].id, skillID: dbSkills[0].id, skillLevel: 'Intermediate', hourlyRate: 50, description: 'I can teach JavaScript, React, and Node.js' },
      { userID: dbUsers[1].id, skillID: dbSkills[1].id, skillLevel: 'Advanced', hourlyRate: 30, description: 'Traditional Swedish cooking and baking' },
      { userID: dbUsers[1].id, skillID: dbSkills[2].id, skillLevel: 'Beginner', hourlyRate: 25, description: 'Basic photography for beginners' },
      { userID: dbUsers[2].id, skillID: dbSkills[2].id, skillLevel: 'Advanced', hourlyRate: 45, description: 'Professional portrait and landscape photography' },
      { userID: dbUsers[2].id, skillID: dbSkills[3].id, skillLevel: 'Intermediate', hourlyRate: 30, description: 'Acoustic guitar lessons for beginners and intermediate' },
      { userID: dbUsers[3].id, skillID: dbSkills[6].id, skillLevel: 'Advanced', hourlyRate: 55, description: 'UI/UX design and responsive web design' },
      { userID: dbUsers[3].id, skillID: dbSkills[5].id, skillLevel: 'Expert', hourlyRate: 40, description: 'Hatha and Vinyasa yoga for all levels' },
      { userID: dbUsers[4].id, skillID: dbSkills[4].id, skillLevel: 'Expert', hourlyRate: 35, description: 'Spanish conversation and grammar' },
      { userID: dbUsers[4].id, skillID: dbSkills[7].id, skillLevel: 'Intermediate', hourlyRate: 20, description: 'Organic gardening and composting' }
    ];

    for (const offered of skillsOffered) {
      await this.db.run(
        `INSERT OR IGNORE INTO user_skills_offered (id, userID, skillID, skillLevel, hourlyRate, description) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), offered.userID, offered.skillID, offered.skillLevel, offered.hourlyRate, offered.description]
      );
    }


    // 5. Insert exchanges
    const exchanges = [
      {
        id: uuidv4(),
        requesterID: dbUsers[0].id,
        providerID: dbUsers[1].id,
        skillID: dbSkills[1].id,
        skill: 'Cooking',
        skillLevel: 'Beginner',
        description: 'Learn Swedish cooking basics',
        status: 'Completed',
        hourlyRate: 30,
        scheduledDate: new Date('2025-10-01T14:00:00').toISOString(),
        durationHours: 2.0,
        isMutualExchange: false
      },
      {
        id: uuidv4(),
        requesterID: dbUsers[1].id,
        providerID: dbUsers[0].id,
        skillID: dbSkills[0].id,
        skill: 'Programming',
        skillLevel: 'Beginner',
        description: 'Introduction to web development',
        status: 'In Progress',
        hourlyRate: 50,
        scheduledDate: new Date('2025-10-15T10:00:00').toISOString(),
        durationHours: 3.0,
        isMutualExchange: true
      },
      {
        id: uuidv4(),
        requesterID: dbUsers[2].id,
        providerID: dbUsers[3].id,
        skillID: dbSkills[5].id,
        skill: 'Yoga',
        skillLevel: 'Beginner',
        description: 'Beginner yoga session',
        status: 'Accepted',
        hourlyRate: 40,
        scheduledDate: new Date('2025-10-16T18:00:00').toISOString(),
        durationHours: 1.5,
        isMutualExchange: false
      },
      {
        id: uuidv4(),
        requesterID: dbUsers[3].id,
        providerID: dbUsers[2].id,
        skillID: dbSkills[3].id,
        skill: 'Guitar',
        skillLevel: 'Beginner',
        description: 'Learn basic guitar chords',
        status: 'Pending',
        hourlyRate: 30,
        scheduledDate: new Date('2025-10-20T16:00:00').toISOString(),
        durationHours: 2.0,
        isMutualExchange: false
      },
      {
        id: uuidv4(),
        requesterID: dbUsers[4].id,
        providerID: dbUsers[3].id,
        skillID: dbSkills[6].id,
        skill: 'Web Design',
        skillLevel: 'Intermediate',
        description: 'Advanced CSS and responsive design',
        status: 'Completed',
        hourlyRate: 55,
        scheduledDate: new Date('2025-09-25T13:00:00').toISOString(),
        durationHours: 2.5,
        isMutualExchange: false
      }
    ];

    for (const exchange of exchanges) {
      await this.db.run(
        `INSERT OR IGNORE INTO exchanges (id, requesterID, providerID, skillID, skill, skillLevel, description, status, hourlyRate, scheduledDate, durationHours, isMutualExchange) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exchange.id, exchange.requesterID, exchange.providerID, exchange.skillID, exchange.skill, exchange.skillLevel, exchange.description, exchange.status, exchange.hourlyRate, exchange.scheduledDate, exchange.durationHours, exchange.isMutualExchange ? 1 : 0]
      );
    }

    const dbExchanges = await this.db.query('SELECT * FROM exchanges');

    // 6. Insert messages
    const messages = [
      { id: uuidv4(), exchangeID: dbExchanges[0].id, senderID: dbUsers[0].id, content: 'Hi! Looking forward to learning Swedish cooking!', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[0].id, senderID: dbUsers[1].id, content: 'Great! I\'ll bring some traditional recipes.', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[0].id, senderID: dbUsers[0].id, content: 'Perfect! See you on Tuesday at 2 PM.', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[1].id, senderID: dbUsers[1].id, content: 'Can we focus on React in our next session?', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[1].id, senderID: dbUsers[0].id, content: 'Absolutely! We\'ll build a small project together.', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[2].id, senderID: dbUsers[2].id, content: 'Is this suitable for complete beginners?', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[2].id, senderID: dbUsers[3].id, content: 'Yes! We\'ll start with basic poses and breathing.', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[3].id, senderID: dbUsers[3].id, content: 'I have my own guitar. Should I bring it?', messageType: 'text' },
      { id: uuidv4(), exchangeID: dbExchanges[3].id, senderID: dbUsers[2].id, content: 'Yes, please bring your guitar!', messageType: 'text' }
    ];

    for (const message of messages) {
      await this.db.run(
        `INSERT OR IGNORE INTO messages (id, exchangeID, senderID, content, messageType) 
           VALUES (?, ?, ?, ?, ?)`,
        [message.id, message.exchangeID, message.senderID, message.content, message.messageType]
      );
    }

    // 7. Insert ratings (only for completed exchanges)
    const ratings = [
      {
        id: uuidv4(),
        exchangeID: dbExchanges[0].id,
        raterID: dbUsers[0].id,
        ratedUserID: dbUsers[1].id,
        score: 5,
        reviewText: 'Amazing teacher! Learned so much about Swedish cooking.'
      },
      {
        id: uuidv4(),
        exchangeID: dbExchanges[4].id,
        raterID: dbUsers[4].id,
        ratedUserID: dbUsers[3].id,
        score: 5,
        reviewText: 'Excellent web design instructor. Very patient and knowledgeable.'
      }
    ];

    for (const rating of ratings) {
      await this.db.run(
        `INSERT OR IGNORE INTO ratings (id, exchangeID, raterID, ratedUserID, score, reviewText) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        [rating.id, rating.exchangeID, rating.raterID, rating.ratedUserID, rating.score, rating.reviewText]
      );
    }

    // 8. Insert transactions
    const transactions = [
      { id: uuidv4(), userID: dbUsers[0].id, amount: 100, transactionType: 'Award', description: 'Welcome bonus', exchangeID: null },
      { id: uuidv4(), userID: dbUsers[1].id, amount: 100, transactionType: 'Award', description: 'Welcome bonus', exchangeID: null },
      { id: uuidv4(), userID: dbUsers[2].id, amount: 100, transactionType: 'Award', description: 'Welcome bonus', exchangeID: null },
      { id: uuidv4(), userID: dbUsers[3].id, amount: 100, transactionType: 'Award', description: 'Welcome bonus', exchangeID: null },
      { id: uuidv4(), userID: dbUsers[4].id, amount: 100, transactionType: 'Award', description: 'Welcome bonus', exchangeID: null },
      { id: uuidv4(), userID: dbUsers[0].id, amount: -60, transactionType: 'Payment', description: 'Payment for Cooking lesson', exchangeID: dbExchanges[0].id },
      { id: uuidv4(), userID: dbUsers[1].id, amount: 60, transactionType: 'Award', description: 'Earned from Cooking lesson', exchangeID: dbExchanges[0].id },
      { id: uuidv4(), userID: dbUsers[4].id, amount: -137, transactionType: 'Payment', description: 'Payment for Web Design session', exchangeID: dbExchanges[4].id },
      { id: uuidv4(), userID: dbUsers[3].id, amount: 137, transactionType: 'Award', description: 'Earned from Web Design session', exchangeID: dbExchanges[4].id },
      { id: uuidv4(), userID: dbUsers[0].id, amount: 10, transactionType: 'Award', description: 'Bonus for completing first exchange', exchangeID: dbExchanges[0].id }
    ];

    for (const transaction of transactions) {
      await this.db.run(
        `INSERT OR IGNORE INTO transactions (id, userID, amount, transactionType, description, exchangeID) 
           VALUES (?, ?, ?, ?, ?, ?)`,
        [transaction.id, transaction.userID, transaction.amount, transaction.transactionType, transaction.description, transaction.exchangeID]
      );
    }

    // 9. Insert notifications
    const notifications = [
      {
        id: uuidv4(),
        userId: dbUsers[0].id,
        type: 'exchange_accepted',
        title: 'Exchange Accepted!',
        message: 'Your cooking lesson request has been accepted.',
        data: JSON.stringify({ exchangeId: dbExchanges[0].id }),
        isRead: true,
        readAt: new Date('2025-10-01T12:00:00').toISOString()
      },
      {
        id: uuidv4(),
        userId: dbUsers[1].id,
        type: 'new_message',
        title: 'New Message',
        message: 'You have a new message in your exchange.',
        data: JSON.stringify({ exchangeId: dbExchanges[1].id }),
        isRead: false,
        readAt: null
      },
      {
        id: uuidv4(),
        userId: dbUsers[2].id,
        type: 'exchange_request',
        title: 'New Exchange Request',
        message: 'Someone wants to learn Yoga from you!',
        data: JSON.stringify({ exchangeId: dbExchanges[2].id }),
        isRead: false,
        readAt: null
      },
      {
        id: uuidv4(),
        userId: dbUsers[3].id,
        type: 'rating_received',
        title: 'New Rating Received',
        message: 'You received a 5-star rating!',
        data: JSON.stringify({ ratingId: ratings[1].id }),
        isRead: true,
        readAt: new Date('2025-09-26T10:00:00').toISOString()
      },
      {
        id: uuidv4(),
        userId: dbUsers[4].id,
        type: 'points_awarded',
        title: 'Points Deducted',
        message: 'Points deducted for Web Design session.',
        data: JSON.stringify({ amount: -137 }),
        isRead: true,
        readAt: new Date('2025-09-25T15:00:00').toISOString()
      },
      {
        id: uuidv4(),
        userId: dbUsers[1].id,
        type: 'exchange_completed',
        title: 'Exchange Completed',
        message: 'Your Cooking lesson has been completed. Please rate your student!',
        data: JSON.stringify({ exchangeId: dbExchanges[0].id }),
        isRead: false,
        readAt: null
      }
    ];

    for (const notification of notifications) {
      await this.db.run(
        `INSERT OR IGNORE INTO notifications (id, userId, type, title, message, data, isRead, readAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [notification.id, notification.userId, notification.type, notification.title, notification.message, notification.data, notification.isRead ? 1 : 0, notification.readAt]
      );
    }

    console.log('✅ Database seeded successfully with comprehensive sample data!');
    console.log('📊 Data summary:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${skills.length} skills`);
    console.log(`   - ${skillsOffered.length} skills offered`);
    console.log(`   - ${skillsWanted.length} skills wanted`);
    console.log(`   - ${exchanges.length} exchanges`);
    console.log(`   - ${messages.length} messages`);
    console.log(`   - ${ratings.length} ratings`);
    console.log(`   - ${transactions.length} transactions`);
    console.log(`   - ${notifications.length} notifications`);
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const migrationManager = new MigrationManager();

  switch (command) {
    case 'reset':
      migrationManager.reset().then(() => process.exit(0));
      break;
    case 'migrate':
      migrationManager.migrate().then(() => process.exit(0));
      break;
    case 'seed':
      migrationManager.seed().then(() => process.exit(0));
      break;
    default:
      console.log('Usage: node migrations.js [reset|migrate|seed]');
      process.exit(1);
  }
}

module.exports = MigrationManager;

