const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const REFRESH_SECRET = process.env.REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

const JWT_EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN = '7d';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS512',
      issuer: 'backend-lab',
      audience: 'api-users'
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN, algorithm: 'HS512' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS512'],
    issuer: 'backend-lab',
    audience: 'api-users'
  });
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken };