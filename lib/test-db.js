require('dotenv').config({ path: '.env.test' });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function resetDatabase() {
  await prisma.post.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
}

module.exports = { prisma, resetDatabase };