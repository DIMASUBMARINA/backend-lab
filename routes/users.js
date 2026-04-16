const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', userController.getAll);
router.get('/:id', requireAuth, userController.getById);
router.post('/', userController.create);
router.put('/:id', (req, res, next) => {
  console.log('>>> PUT /:id hit', req.params.id);
  next();
}, requireAuth, userController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'moderator'), userController.remove);

const prisma = require('../lib/prisma');

// SECURE: Parameterized query via Prisma
router.get('/secure/users/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.length > 50) {
      return res.status(400).json({ error: 'Invalid search term' });
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: name,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        role: true
        // NEVER select passwordHash
      }
    });

    res.json({ count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;