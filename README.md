# 🎓 SkillSwap - Peer-to-Peer Skill Exchange Platform

A modern, full-stack web application that enables peer-to-peer skill sharing and learning. Connect with learners and teachers across Sweden to exchange knowledge and build a strong community of lifelong learners.

![Node.js](https://img.shields.io/badge/Node.js-v24.13.1-green)
![React](https://img.shields.io/badge/React-v18.2.0-blue)
![Express](https://img.shields.io/badge/Express-v4.18.2-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-v5.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

SkillSwap is a comprehensive platform designed to facilitate peer-to-peer skill exchanges. Whether you want to teach programming, learn cooking, share photography expertise, or find a yoga instructor, SkillSwap connects you with the right people.

### Key Highlights

- **🔐 Secure Authentication** - JWT-based authentication with bcrypt password hashing
- ⚡ **Real-time Communication** - Socket.io powered instant messaging and notifications
- 💰 **Points System** - Gamified currency for fair skill value exchange
- ⭐ **Rating System** - Build reputation through user reviews and ratings
- 🔍 **Smart Search** - Find skill providers/learners by skills, location, and level
- 📱 **Responsive UI** - Beautiful Material-UI design that works on all devices
- 📊 **Transaction History** - Track all points and exchanges
- 🌐 **Real-time Notifications** - Instant updates for all activities

---

## ✨ Features

### 👤 User Management
- User registration and authentication
- Comprehensive user profiles with bio and location
- Skills offered/wanted management
- Profile picture support
- User search and filtering

### 🎯 Skill Exchange
- Create skill exchange requests
- Accept/decline/complete exchanges
- Flexible skill level system (Beginner, Intermediate, Advanced, Expert)
- Hourly rate negotiation
- Exchange status tracking (Pending, Accepted, In Progress, Completed, Cancelled)

### 💬 Real-time Messaging
- Live chat via Socket.io
- Message history per exchange
- Real-time message delivery
- Typing indicators support
- Media message support (text, links, attachments)

### 🔔 Notifications
- Real-time push notifications
- Multiple notification types (exchange requests, messages, ratings, etc.)
- Mark as read/unread functionality
- Notification history

### ⭐ Ratings & Reviews
- Rate teachers/students after exchange completion
- Review system with 1-5 star ratings
- Comment/feedback support
- Average rating calculation
- Reputation building

### 💎 Points System
- Starting balance: 100 points for new users
- Earn points by teaching
- Spend points by learning
- Flexible point exchange rates
- Transaction history logging

### 🔍 Discovery
- Advanced skill search with filters
- Filter by skill level, category, location, rating
- Teacher/student profiles with full details
- Price range filtering
- Pagination and sorting

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v24.13.1
- **Framework**: Express.js v4.18.2
- **Real-time**: Socket.io v4.7.2
- **Database**: SQLite3 v5.1.7
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet.js, express-rate-limit, CORS
- **ORM**: Custom Database service layer

### Frontend
- **Framework**: React v18.2.0
- **UI Library**: Material-UI (MUI) v5.14.5
- **Routing**: React Router v6.15.0 / v7.9.4
- **HTTP Client**: Axios v1.5.0
- **Real-time**: Socket.io-client v4.7.2
- **Icons**: Material-UI Icons v5.14.3
- **Styling**: Emotion v11.11.0

### Testing & Development
- **Testing**: Jest v30.2.0
- **Testing Library**: @testing-library/react v16.3.0
- **Dev Server**: Nodemon v3.0.1
- **Transpiler**: Babel v7.28.3
- **Build Tool**: Webpack (via Create React App)

---

## 📁 Project Structure

```
SKILLSWAP/
├── src/
│   ├── backend/
│   │   ├── server.js                 # Express app entry point
│   │   ├── connection.js             # SQLite connection
│   │   ├── migrations.js             # Database migrations & seeding
│   │   ├── schema.sql                # Database schema
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── usersController.js    # User management
│   │   │   ├── skillsController.js   # Skills management
│   │   │   ├── exchangesController.js# Exchanges/agreements
│   │   │   └── notificationsController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── skills.js
│   │   │   ├── exchanges.js
│   │   │   └── notifications.js
│   │   ├── services/
│   │   │   ├── NotificationService.js   # Real-time notifications
│   │   │   ├── pointsService.js         # Points calculation
│   │   │   ├── ratingsService.js        # Rating management
│   │   │   └── emailService.js          # Email (mock)
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT verification
│   │   ├── models/
│   │   │   └── Database.js              # ORM/Database service
│   │   └── utils/
│   │       ├── helpers.js               # Utility functions
│   │       ├── validators.js            # Input validation
│   │       ├── security.js              # Security utilities
│   │       └── timeUtils.js             # Time formatting (Swedish TZ)
│   └── frontend/
│       ├── public/
│       │   ├── index.html
│       │   └── manifest.json
│       └── src/
│           ├── App.js                   # Main app component
│           ├── index.js
│           ├── setupTests.js
│           ├── pages/
│           │   ├── Home.js              # Landing page
│           │   ├── Login.js             # Login page
│           │   ├── Register.js          # Registration page
│           │   ├── Dashboard.js         # User dashboard
│           │   ├── Profile.js           # User profile
│           │   ├── SkillSearch.js       # Search/discovery
│           │   ├── ExchangeDetails.js   # Exchange details & chat
│           │   ├── Messages.js          # Messaging center
│           │   ├── TransactionHistory.js# Points history
│           │   └── NotFound.js          # 404 page
│           ├── components/
│           │   ├── Navbar.js            # Navigation bar
│           │   ├── ProtectedRoute.js    # Route protection
│           │   └── various UI components
│           ├── contexts/
│           │   ├── AuthContext.js       # Auth state management
│           │   └── SocketContext.js     # Socket.io integration
│           ├── services/
│           │   ├── authService.js
│           │   ├── usersService.js
│           │   ├── skillsService.js
│           │   ├── exchangesService.js
│           │   └── notificationsService.js
│           ├── config/
│           │   ├── axios.js             # HTTP client config
│           │   └── constants.js
│           └── utils/
│               ├── timeUtils.js
│               ├── validators.js
│               └── helpers.js
├── tests/
│   ├── setup.js                      # Test setup
│   ├── unit/
│   │   ├── backend/                  # Backend unit tests
│   │   └── frontend/                 # Frontend component tests
│   ├── integration/                  # Integration tests
│   │   ├── auth-flow.test.js
│   │   ├── skill-exchange-flow.test.js
│   │   ├── notification-system.test.js
│   │   └── ...
│   └── acceptance/                   # Acceptance tests
├── database/
│   └── skillswap.db                  # SQLite database file
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── babel.config.js                   # Babel transpiler config
├── jest.config.js                    # Jest testing config
├── package.json                      # Root dependencies
├── server.js                         # Entry point
├── SKILLSWAP.code-workspace          # VS Code workspace
├── APP_STATUS.md                     # Application status report
├── CLEANUP_REPORT.md                 # Code cleanup summary
└── README.md                         # This file
```

---

## 📦 Prerequisites

- **Node.js**: v14.0.0 or higher (v24.13.1 recommended)
- **npm**: v6.0.0 or higher (v11.8.0 installed)
- **Git**: For version control
- **SQLite3**: Included with SQLite3 npm package

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 2GB minimum
- **Disk Space**: 1GB for dependencies + database

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/skillswap/skillswap.git
cd SKILLSWAP
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd src/frontend
npm install
cd ../..
```

### 3. Set Up Environment Variables
```bash
# Create .env file in root directory
echo NODE_ENV=development > .env
echo PORT=5002 >> .env
echo JWT_SECRET=your-secret-key-here >> .env
echo DB_PATH=./database/skillswap.db >> .env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5002 >> .env
```

**Or manually create `.env`:**
```
NODE_ENV=development
PORT=5002
JWT_SECRET=skillswap-jwt-secret-key-development-2026
DB_PATH=./database/skillswap.db
CORS_ORIGIN=http://localhost:3000,http://localhost:5002
```

### 4. Initialize Database
```bash
# Run migrations to create tables
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed

# Or reset database completely
npm run db:reset
```

---

## 🎮 Running the Application

### Option 1: Full Stack (Recommended)
```bash
# Terminal 1: Start Backend Server
npm run dev

# Terminal 2: Start Frontend Server (from root or src/frontend)
npm run client
# OR
cd src/frontend && npm start
```

### Option 2: Production Mode
```bash
# Build frontend
npm run build

# Start production server (serves both backend API and built frontend)
npm start
```

### Option 3: Individual Servers
```bash
# Backend only
npm run dev

# Frontend only
cd src/frontend && npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002/api
- **Health Check**: http://localhost:5002/api/health

### Test Credentials
- **Email**: demo@example.com
- **Password**: password123

---

## 📡 API Documentation

### Base URL
```
http://localhost:5002/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "location": "Stockholm, Sweden",
  "bio": "Passionate learner"
}
Response: { success, data: { user, token } }
```

#### Login
```
POST /auth/login
Body: {
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { success, data: { user, token } }
```

#### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { success, data: user }
```

### User Endpoints

#### Get User Profile
```
GET /users/:id
Response: { success, data: user }
```

#### Update Profile
```
PATCH /users/:id
Headers: Authorization: Bearer <token>
Body: { name, bio, location, profilePicture }
Response: { success, data: user }
```

#### Search Users
```
GET /users/search?term=keyword&location=&skillLevel=
Response: { success, data: users[] }
```

### Skills Endpoints

#### Get All Skills
```
GET /skills
Response: { success, data: skills[] }
```

#### Create Skill
```
POST /skills
Headers: Authorization: Bearer <token>
Body: { name, category, skillLevel, hourlyRate }
Response: { success, data: skill }
```

#### Add Skill to Profile
```
POST /users/:id/skills
Headers: Authorization: Bearer <token>
Body: { skillID, skillLevel, hourlyRate/maxHourlyRate, description }
Response: { success }
```

### Exchanges Endpoints

#### Create Exchange
```
POST /exchanges
Headers: Authorization: Bearer <token>
Body: { skillID, requesterID, providerID, description, scheduledDate }
Response: { success, data: exchange }
```

#### Get User Exchanges
```
GET /exchanges/user/:userID
Headers: Authorization: Bearer <token>
Response: { success, data: exchanges[] }
```

#### Update Exchange Status
```
PATCH /exchanges/:id
Headers: Authorization: Bearer <token>
Body: { status: "Accepted|In Progress|Completed|Cancelled" }
Response: { success, data: exchange }
```

### Notifications Endpoints

#### Get Notifications
```
GET /notifications
Headers: Authorization: Bearer <token>
Response: { success, data: notifications[] }
```

#### Mark as Read
```
PUT /notifications/:id/read
Headers: Authorization: Bearer <token>
Response: { success }
```

#### Get Unread Count
```
GET /notifications/unread/count
Headers: Authorization: Bearer <token>
Response: { success, data: { count } }
```

### Real-time Socket Events

#### Join User Room
```javascript
socket.emit('join', userId);
```

#### Join Exchange Room
```javascript
socket.emit('join_exchange', exchangeId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  exchangeId,
  senderId,
  content,
  messageType: 'text',
  senderName,
  senderPicture
});
```

#### Receive Message
```javascript
socket.on('receive_message', (message) => {
  // Handle incoming message
});
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
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
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Skills Table
```sql
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  skillID TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  skillLevel TEXT,
  hourlyRate REAL DEFAULT 0.0,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Exchanges Table
```sql
CREATE TABLE exchanges (
  id TEXT PRIMARY KEY,
  requesterID TEXT NOT NULL,
  providerID TEXT NOT NULL,
  skillID TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  description TEXT,
  scheduledDate DATETIME,
  completedAt DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (requesterID) REFERENCES users(id),
  FOREIGN KEY (providerID) REFERENCES users(id),
  FOREIGN KEY (skillID) REFERENCES skills(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  exchangeID TEXT NOT NULL,
  senderID TEXT NOT NULL,
  content TEXT NOT NULL,
  messageType TEXT DEFAULT 'text',
  createdAt DATETIME,
  FOREIGN KEY (exchangeID) REFERENCES exchanges(id),
  FOREIGN KEY (senderID) REFERENCES users(id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  data TEXT,
  isRead BOOLEAN DEFAULT 0,
  readAt DATETIME,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  raterID TEXT NOT NULL,
  rateeID TEXT NOT NULL,
  exchangeID TEXT NOT NULL,
  skillID TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt DATETIME,
  FOREIGN KEY (raterID) REFERENCES users(id),
  FOREIGN KEY (rateeID) REFERENCES users(id),
  FOREIGN KEY (exchangeID) REFERENCES exchanges(id),
  FOREIGN KEY (skillID) REFERENCES skills(id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  userID TEXT NOT NULL,
  exchangeID TEXT,
  amount INTEGER NOT NULL,
  type TEXT,
  description TEXT,
  createdAt DATETIME,
  FOREIGN KEY (userID) REFERENCES users(id),
  FOREIGN KEY (exchangeID) REFERENCES exchanges(id)
);
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites

#### Unit Tests Only
```bash
npm run test:unit
```

#### Integration Tests Only
```bash
npm run test:integration
```

#### Frontend Tests
```bash
npm run test:frontend
```

#### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm run test:coverage
```

### Test Statistics
- **Total Test Suites**: 10+ files
- **Total Tests**: 50+ test cases
- **Coverage**: Unit, Integration, and Acceptance tests
- **Framework**: Jest with @testing-library

### Test Categories

**Unit Tests:**
- Backend controllers and services
- Frontend components and utilities
- Database operations
- Authentication logic

**Integration Tests:**
- Complete authentication flow
- Skill exchange workflow
- Notification system
- Data persistence
- Error handling

**Acceptance Tests:**
- End-to-end skill exchange flow
- User management
- Real-time messaging
- Points system

---

## ⚙️ Environment Variables

### Required Variables
```
NODE_ENV=development|production
PORT=5002
JWT_SECRET=your-strong-secret-key
DB_PATH=./database/skillswap.db
CORS_ORIGIN=http://localhost:3000,http://localhost:5002
```

### Optional Variables
```
SOCKET_CORS_ORIGIN=http://localhost:3000
EMAIL_PROVIDER=mock|sendgrid|mailgun
EMAIL_API_KEY=your-email-service-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based sessions  
✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **CORS Protection** - Restricted origin access  
✅ **Helmet.js** - Security headers  
✅ **Input Validation** - Sanitize all inputs  
✅ **SQL Injection Prevention** - Parameterized queries  
✅ **XSS Protection** - Safe rendering  

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check which process is using the port
lsof -i :5002        # macOS/Linux
netstat -ano | grep :5002  # Windows

# Kill the process or use a different port
export PORT=5003
npm run dev
```

### Database Connection Error
```bash
# Reset database
npm run db:reset

# Or initialize fresh
npm run db:migrate
npm run db:seed
```

### Frontend Connection Error
```bash
# Ensure backend is running
npm run dev

# Check backend health
curl http://localhost:5002/api/health

# Try frontend separately
cd src/frontend && npm start
```

### JWT Secret Missing
```bash
# Ensure .env file exists with JWT_SECRET
cat .env
# If missing, add it:
echo JWT_SECRET=your-secret >> .env

# Restart backend
npm run dev
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Also for frontend
cd src/frontend && npm install
cd ../..
```

### CORS Issues
```bash
# Update .env with correct frontend URL
CORS_ORIGIN=http://your-frontend-url:3000

# Restart backend
npm run dev
```

---

## 📝 npm Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run client` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run install-client` | Install frontend dependencies |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database completely |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

---

## 🌐 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create skillswap-app

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS/DigitalOcean Deployment
1. Set up Node.js environment
2. Clone repository
3. Install dependencies: `npm install`
4. Configure environment variables
5. Run database migrations: `npm run db:migrate`
6. Start server: `npm start`

### Docker Deployment
```dockerfile
FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN cd src/frontend && npm install && npm run build

EXPOSE 5002
CMD ["npm", "start"]
```

```bash
docker build -t skillswap .
docker run -p 5002:5002 -e JWT_SECRET=secret skillswap
```

---

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Socket.io Documentation](https://socket.io/)
- [Jest Testing](https://jestjs.io/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow existing code patterns
- Write tests for new features
- Update documentation accordingly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 SkillSwap Learning Network

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 👥 Authors

- **SkillSwap Team** - Initial development
- See [LICENSE](LICENSE) for more details

---

## 📞 Support

For support, please:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [APP_STATUS.md](APP_STATUS.md) for system status
3. Check [CLEANUP_REPORT.md](CLEANUP_REPORT.md) for code quality info
4. Open an issue on GitHub

---

## 🎉 Acknowledgments

- React and Material-UI communities for excellent documentation
- Express.js for the robust backend framework
- Socket.io for real-time communication
- All contributors and testers

---

## 📊 Project Status

✅ **Status**: Production Ready  
✅ **Latest Version**: 1.0.0  
✅ **Last Updated**: February 20, 2026  
✅ **Test Coverage**: Comprehensive (Unit, Integration, Acceptance)  
✅ **Features**: All core features implemented  
✅ **Security**: Industry-standard practices  

---

**Happy Learning! 🚀**

For more information, visit the [project repository](https://github.com/skillswap/skillswap).
