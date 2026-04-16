const { verifyAccessToken } = require('../lib/jwt');
const prisma = require('../lib/prisma');

async function requireAuth(req, res, next) {
  console.log('>>> requireAuth called', req.method, req.path, req.headers['authorization']?.slice(0, 20));
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid Authorization header. Format: Bearer <token>',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists', code: 'UNAUTHORIZED' });
    }

    req.user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      ...user
    };

    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
    }
    res.status(500).json({ error: 'Authentication failed', code: 'INTERNAL_ERROR' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };