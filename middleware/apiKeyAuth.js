const crypto = require('crypto');
const prisma = require('../lib/prisma');

async function requireApiKey(req, res, next) {
  const apiKeyHeader = req.headers['x-api-key'];

  if (!apiKeyHeader) {
    return res.status(401).json({
      error: 'X-API-Key header required'
    }); 
  }

  // Hash incoming key
  const keyHash = crypto.createHash('sha256')
    .update(apiKeyHeader)
    .digest('hex');

  // Find key
  const key = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      status: 'active'
    }
  });

  if (!key) {
    return res.status(401).json({
      error: 'Invalid or revoked API key'
    });
  }

  // Check quota
  if (key.requestsThisMonth >= key.monthlyQuota) {
    return res.status(429).json({
      error: `Quota exceeded: ${key.monthlyQuota}/month. Upgrade your plan.`
    });
  }

  // Increment usage
  const updatedKey = await prisma.apiKey.update({
    where: { id: key.id },
    data: {
      requestsThisMonth: key.requestsThisMonth + 1,
      lastUsedAt: new Date()
    }
  });

  // Attach UPDATED key to request
  req.apiKey = updatedKey;  // было: req.apiKey = key
  req.user = { id: key.userId };

  next();
}

module.exports = { requireApiKey };
