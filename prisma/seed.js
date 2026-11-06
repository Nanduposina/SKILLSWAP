const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  ['demo-user', 'Demo User', 'demo@example.com', 'Stockholm', 'JavaScript and product development'],
  ['elin-lindberg', 'Elin Lindberg', 'elin@example.com', 'Gothenburg', 'UX researcher and accessibility advocate'],
  ['oskar-berg', 'Oskar Berg', 'oskar@example.com', 'Malmö', 'Cloud engineer and open-source contributor'],
  ['sara-nilsson', 'Sara Nilsson', 'sara@example.com', 'Uppsala', 'Swedish language teacher and career coach'],
  ['noah-karlsson', 'Noah Karlsson', 'noah@example.com', 'Stockholm', 'Data analyst who enjoys mentoring beginners']
];

const skills = [
  ['typescript', 'TypeScript', 'Technology', 55, 'Advanced'],
  ['react', 'React', 'Technology', 55, 'Advanced'],
  ['nodejs', 'Node.js', 'Technology', 60, 'Advanced'],
  ['cloud-architecture', 'Cloud Architecture', 'Technology', 75, 'Expert'],
  ['ux-research', 'UX Research', 'Design', 45, 'Advanced'],
  ['accessibility', 'Digital Accessibility', 'Design', 45, 'Intermediate'],
  ['swedish', 'Swedish Language', 'Languages', 30, 'Expert'],
  ['data-analysis', 'Data Analysis', 'Business', 50, 'Advanced'],
  ['public-speaking', 'Public Speaking', 'Career', 35, 'Advanced']
];

async function main() {
  const password = await bcrypt.hash('password123', 12);
  const userRecords = {};
  for (const [userID, name, email, location, bio] of users) {
    userRecords[userID] = await prisma.user.upsert({
      where: { email },
      update: { name, location, bio },
      create: { userID, name, email, password, location: `${location}, Sweden`, bio }
    });
  }

  const skillRecords = {};
  for (const [skillID, name, category, hourlyRate, skillLevel] of skills) {
    skillRecords[skillID] = await prisma.skill.upsert({
      where: { skillID },
      update: { name, category, hourlyRate, skillLevel },
      create: { skillID, name, category, hourlyRate, skillLevel }
    });
  }

  const offers = [
    ['demo-user', 'typescript', 'Advanced', 'Production TypeScript, testing, and API design'],
    ['demo-user', 'react', 'Advanced', 'Accessible React interfaces with modern state patterns'],
    ['elin-lindberg', 'ux-research', 'Advanced', 'User interviews, discovery, and service design'],
    ['elin-lindberg', 'accessibility', 'Intermediate', 'WCAG reviews and inclusive product design'],
    ['oskar-berg', 'nodejs', 'Advanced', 'Node.js APIs, observability, and deployment'],
    ['oskar-berg', 'cloud-architecture', 'Expert', 'Cloud architecture and infrastructure decisions'],
    ['sara-nilsson', 'swedish', 'Expert', 'Practical Swedish for work and everyday life'],
    ['sara-nilsson', 'public-speaking', 'Advanced', 'Interview preparation and presentation coaching'],
    ['noah-karlsson', 'data-analysis', 'Advanced', 'SQL, dashboards, and data storytelling']
  ];
  for (const [userID, skillID, skillLevel, description] of offers) {
    await prisma.userSkillOffered.upsert({
      where: { userID_skillID: { userID: userRecords[userID].id, skillID: skillRecords[skillID].id } },
      update: { skillLevel, description, hourlyRate: skillRecords[skillID].hourlyRate },
      create: {
        userID: userRecords[userID].id,
        skillID: skillRecords[skillID].id,
        skillLevel,
        description,
        hourlyRate: skillRecords[skillID].hourlyRate
      }
    });
  }

  let exchange = await prisma.exchange.findFirst({
    where: { requesterID: userRecords['demo-user'].id, providerID: userRecords['oskar-berg'].id, skillID: skillRecords.nodejs.id }
  });
  if (!exchange) {
    exchange = await prisma.exchange.create({
      data: {
        requesterID: userRecords['demo-user'].id,
        providerID: userRecords['oskar-berg'].id,
        skillID: skillRecords.nodejs.id,
        skill: 'Node.js',
        skillLevel: 'Intermediate',
        description: 'Build a production-ready API with Node.js and Prisma.',
        status: 'Accepted',
        hourlyRate: 60,
        scheduledDate: new Date('2026-11-12T18:00:00.000Z'),
        durationHours: 1.5
      }
    });
  }

  if (!(await prisma.message.findFirst({ where: { exchangeID: exchange.id } }))) {
    await prisma.message.createMany({
      data: [
        { exchangeID: exchange.id, senderID: userRecords['demo-user'].id, content: 'Hi Oskar, I would like to focus on REST APIs and Prisma.', messageType: 'text' },
        { exchangeID: exchange.id, senderID: userRecords['oskar-berg'].id, content: 'Great! Please bring a small API idea and we will build it together.', messageType: 'text' }
      ]
    });
  }

  if (!(await prisma.transaction.findFirst({ where: { userID: userRecords['demo-user'].id } }))) {
    await prisma.transaction.create({
      data: {
        userID: userRecords['demo-user'].id,
        amount: 100,
        transactionType: 'Award',
        description: 'Welcome points'
      }
    });
  }

  if (!(await prisma.notification.findFirst({ where: { userId: userRecords['demo-user'].id } }))) {
    await prisma.notification.create({
      data: {
        userId: userRecords['demo-user'].id,
        type: 'exchange_accepted',
        title: 'Exchange accepted',
        message: 'Your Node.js session with Oskar Berg is ready.',
        data: { exchangeId: exchange.id }
      }
    });
  }

  await prisma.$disconnect();
}

main().catch(async error => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
