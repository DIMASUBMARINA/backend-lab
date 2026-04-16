const prisma = require('../lib/prisma');

async function findAll() {
  return prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { name: 'asc' }
  });
}

async function findById(id) {
  return prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true }
  });
}

async function findBySlug(slug) {
  return prisma.category.findUnique({ where: { slug } });
}

async function create(data) {
  return prisma.category.create({ data });
}

async function update(id, data) {
  return prisma.category.update({ where: { id }, data });
}

module.exports = { findAll, findById, findBySlug, create, update };