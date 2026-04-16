function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUserCreate(data) {
  const errors = [];

  if (!data.email) errors.push('Email is required');
  else if (!validateEmail(data.email)) errors.push('Invalid email format');

  if (!data.password) errors.push('Password is required');
  else if (data.password.length < 6) errors.push('Password must be at least 6 characters');

  if (data.role && !['author', 'admin', 'moderator'].includes(data.role)) {
    errors.push('Role must be author, admin or moderator');
  }

  return errors;
}

module.exports = { validateUserCreate, validateEmail };