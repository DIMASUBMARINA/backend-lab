const prisma = require('../lib/prisma');

async function findByPost(postId) {
  return prisma.comment.findMany({
    where: { postId, deletedAt: null },
    include: {
      user: { select: { id: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function findById(id) {
  return prisma.comment.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.comment.create({ data });
}

async function update(id, data) {
  return prisma.comment.update({ where: { id }, data });
}

async function softDelete(id) {
  return prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

module.exports = { findByPost, findById, create, update, softDelete };