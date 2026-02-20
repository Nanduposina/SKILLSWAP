-- Active: 1757629417529@@127.0.0.1@3306
-- SkillSwap Learning Network Database Schema
-- SQLite Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    userID TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    profilePicture TEXT,
    pointsBalance INTEGER DEFAULT 100,
    averageRating REAL DEFAULT 0.0,
    learningPreferences TEXT DEFAULT '{"mode": "both", "maxDistance": 10}',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    skillID TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    hourlyRate REAL DEFAULT 0.0,
    skillLevel TEXT CHECK (
        skillLevel IN (
            'Beginner',
            'Intermediate',
            'Advanced',
            'Expert'
        )
    ) DEFAULT 'Beginner',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Skills Offered (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_skills_offered (
    id TEXT PRIMARY KEY,
    userID TEXT NOT NULL,
    skillID TEXT NOT NULL,
    skillLevel TEXT CHECK (
        skillLevel IN (
            'Beginner',
            'Intermediate',
            'Advanced',
            'Expert'
        )
    ) DEFAULT 'Beginner',
    hourlyRate REAL DEFAULT 0.0,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES skills (id) ON DELETE CASCADE,
    UNIQUE (userID, skillID)
);

-- Exchanges Table
CREATE TABLE IF NOT EXISTS exchanges (
    id TEXT PRIMARY KEY,
    requesterID TEXT NOT NULL,
    providerID TEXT NOT NULL,
    skillID TEXT NOT NULL,
    skill TEXT NOT NULL,
    skillLevel TEXT CHECK (
        skillLevel IN (
            'Beginner',
            'Intermediate',
            'Advanced',
            'Expert'
        )
    ) DEFAULT 'Beginner',
    description TEXT,
    status TEXT CHECK (
        status IN (
            'Pending',
            'Accepted',
            'In Progress',
            'Completed',
            'Cancelled'
        )
    ) DEFAULT 'Pending',
    sessionType TEXT DEFAULT 'Exchange',
    hourlyRate REAL DEFAULT 0.0,
    scheduledDate DATETIME,
    durationHours REAL DEFAULT 1.0,
    isMutualExchange BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requesterID) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (providerID) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES skills (id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    exchangeID TEXT NOT NULL,
    senderID TEXT NOT NULL,
    content TEXT NOT NULL,
    messageType TEXT DEFAULT 'text',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exchangeID) REFERENCES exchanges (id) ON DELETE CASCADE,
    FOREIGN KEY (senderID) REFERENCES users (id) ON DELETE CASCADE
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    exchangeID TEXT NOT NULL,
    raterID TEXT NOT NULL,
    ratedUserID TEXT NOT NULL,
    reviewText TEXT,
    score INTEGER CHECK (
        score >= 1
        AND score <= 5
    ) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exchangeID) REFERENCES exchanges (id) ON DELETE CASCADE,
    FOREIGN KEY (raterID) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (ratedUserID) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (exchangeID, raterID)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userID TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transactionType TEXT CHECK (
        transactionType IN (
            'Award',
            'Deduction',
            'Payment'
        )
    ) NOT NULL,
    description TEXT,
    exchangeID TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (exchangeID) REFERENCES exchanges (id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT DEFAULT '{}',
    isRead BOOLEAN DEFAULT FALSE,
    readAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_userID ON users (userID);

CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges (status);

CREATE INDEX IF NOT EXISTS idx_exchanges_requester ON exchanges (requesterID);

CREATE INDEX IF NOT EXISTS idx_exchanges_provider ON exchanges (providerID);

CREATE INDEX IF NOT EXISTS idx_messages_exchange ON messages (exchangeID);

CREATE INDEX IF NOT EXISTS idx_ratings_exchange ON ratings (exchangeID);

CREATE INDEX IF NOT EXISTS idx_ratings_rated_user ON ratings (ratedUserID);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (userID);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (userId);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (isRead);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);

CREATE INDEX IF NOT EXISTS idx_user_skills_offered_user ON user_skills_offered (userID);