const prisma = require('../lib/prisma');

async function findAll() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function create(data) {
  return prisma.user.create({ data });
}

async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = { findAll, findById, findByEmail, create, update, remove };