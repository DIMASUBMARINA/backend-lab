require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

app.use((req, res, next) => {
  console.log('>>> REQUEST:', req.method, req.url);
  next();
});


// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// CORS whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400
}));

// Routes
const oauthRoutes = require('./routes/oauth');
const apiKeyRoutes = require('./routes/apiKeys');
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const path = require('path');

const vulnerableRoutes = require('./routes/vulnerable');
const { sanitizeMongo, sanitizeXSS } = require('./middleware/sanitize');

// File: app.js (add temporarily for lab)
app.use('/api/vulnerable', vulnerableRoutes);
// app.use(sanitizeMongo);
// app.use(sanitizeXSS);

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', oauthRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/v1', dataRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});;

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});