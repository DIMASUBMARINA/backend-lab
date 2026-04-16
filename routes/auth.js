const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const zxcvbn = require('zxcvbn');
const prisma = require('../lib/prisma');
const { signAccessToken, signRefreshToken } = require('../lib/jwt');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const SALT_ROUNDS = 10;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required', code: 'VALIDATION_ERROR' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format', code: 'VALIDATION_ERROR' });
    }

    // Task 1: zxcvbn password strength check
    const strength = zxcvbn(password);
    if (strength.score < 3) {
      return res.status(400).json({
        error: 'Password too weak',
        code: 'WEAK_PASSWORD',
        score: strength.score,
        crackTime: strength.crack_times_display.offline_slow_hashing_1e4_per_second,
        warning: strength.feedback.warning || 'Password is too easy to guess',
        suggestions: strength.feedback.suggestions
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_DUPLICATE' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash, role: role || 'author' },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // await prisma.refreshToken.create({
    //   data: {
    //     token: hashToken(refreshToken),
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //   }
    // });
    // Вместо prisma.refreshToken.create({ data: { ... } })
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.refreshToken.create({
          data: {
            token: hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

    res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
// router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required', code: 'VALIDATION_ERROR' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Task 3: check lockout before anything else
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil) - new Date();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        error: 'Account locked due to too many failed attempts',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.lockedUntil,
        retryAfter: `${remainingMin} minutes`,
        attemptsRemaining: 0
      });
    }

    const isValidPassword = user?.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !isValidPassword) {
      if (user) {
        const newCount = (user.failedLoginCount || 0) + 1;
        if (newCount >= 5) {
          await prisma.user.updateMany({
            where: { email },
            data: {
              failedLoginCount: newCount,
              lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
            }
          });
          return res.status(423).json({
            error: 'Account locked due to too many failed attempts',
            code: 'ACCOUNT_LOCKED',
            retryAfter: '15 minutes',
            attemptsRemaining: 0
          });
        }
        await prisma.user.updateMany({
          where: { email },
          data: { failedLoginCount: newCount }
        });
        return res.status(401).json({
          error: 'Invalid credentials',
          code: 'UNAUTHORIZED',
          attemptsRemaining: 5 - newCount
        });
      }
      return res.status(401).json({ error: 'Invalid credentials', code: 'UNAUTHORIZED' });
    }

    // Success: reset lockout counters
    await prisma.user.updateMany({
      where: { email },
      data: { failedLoginCount: 0, lockedUntil: null }
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // await prisma.refreshToken.create({
    //   data: {
    //     token: hashToken(refreshToken),
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //   }
    // });

    // Вместо prisma.refreshToken.create({ data: { ... } })
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.refreshToken.create({
          data: {
            token: hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required', code: 'VALIDATION_ERROR' });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashToken(refreshToken) }
    });

    if (!stored || new Date(stored.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Token has been revoked or expired', code: 'UNAUTHORIZED' });
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found', code: 'UNAUTHORIZED' });
    }

    const newAccessToken = signAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: hashToken(refreshToken) }
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/auth/logout-all (bonus)
router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.sub } });
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout-all error:', error);
    res.status(500).json({ error: 'Failed to logout', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;