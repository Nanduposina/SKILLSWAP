const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

module.exports = {
  prisma,
  async initialize() {
    await prisma.$connect();
  },
  async close() {
    await prisma.$disconnect();
  }
};
