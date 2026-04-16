const userService = require('../services/userService');
const prisma = require('../lib/prisma'); 


async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ count: users.length, data: users });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    res.json(user);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

const ALLOWED_UPDATE_FIELDS = ['email', 'avatar'];

const update = async (req, res) => {
  console.log('>>> update called', req.body, req.user);
  try {
    const targetId = parseInt(req.params.id);
    const currentUserId = req.user.sub;
    const currentRole = req.user.role;

    if (currentUserId !== targetId && currentRole !== 'admin') {
      return res.status(403).json({ error: 'Can only update own profile' });
    }

    // WHITELIST: only accept specific fields
    const updateData = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Admin-only fields
    if (currentRole === 'admin' && req.body.role) {
      updateData.role = req.body.role;
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, email: true, role: true, avatar: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

async function remove(req, res, next) {
  try {
    await userService.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };