const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { validateUserCreate } = require('../validators/userValidator');

async function getAllUsers() {
  return userRepository.findAll();
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
  return user;
}

async function createUser(data) {
  const errors = validateUserCreate(data);
  if (errors.length > 0) throw { status: 422, message: errors.join(', '), code: 'VALIDATION_ERROR' };

  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw { status: 409, message: 'Email already exists', code: 'EMAIL_DUPLICATE' };

  const passwordHash = await bcrypt.hash(data.password, 10);
  return userRepository.create({
    email: data.email,
    passwordHash,
    role: data.role || 'author'
  });
}

async function updateUser(id, data) {
  await getUserById(id);
  return userRepository.update(id, data);
}

async function deleteUser(id) {
  await getUserById(id);
  return userRepository.remove(id);
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };