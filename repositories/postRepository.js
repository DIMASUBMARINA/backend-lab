const prisma = require('../lib/prisma');

async function findAll(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.authorId) where.authorId = parseInt(filters.authorId);

  return prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, email: true, role: true } },
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function findBySlug(slug) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, email: true, role: true, createdAt: true } },
      tags: { include: { tag: true } },
      categories: {
        include: {
          category: {
            include: { parent: true }
          }
        }
      },
      comments: {
        where: { status: 'APPROVED', parentId: null, deletedAt: null },
        include: {
          user: { select: { id: true, email: true } },
          replies: {
            where: { status: 'APPROVED', deletedAt: null },
            include: {
              user: { select: { id: true, email: true } }
            }
          }
        }
      },
      _count: { select: { comments: true } }
    }
  });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.post.create({ data });
}

async function update(id, data) {
  return prisma.post.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.post.delete({ where: { id } });
}

module.exports = { findAll, findBySlug, findById, create, update, remove };