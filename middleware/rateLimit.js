const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many attempts. Try again in 15 minutes.'
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded. Slow down.' }
});

module.exports = { authLimiter, apiLimiter };