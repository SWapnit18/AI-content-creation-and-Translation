const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Enforce JWT_SECRET configuration in production environments
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL ERROR: JWT_SECRET environment variable is not defined.');
    process.exit(1);
  } else {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is not defined. Using temporary insecure fallback key.');
  }
}

process.env.MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const { apiLimiter, aiLimiter, contactLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for Vercel rate limiting (prevents shared global 429)
app.set('trust proxy', 1);

// Middleware to restore original request URL path if rewritten by Vercel
app.use((req, res, next) => {
  if (req.query && req.query.path) {
    const originalPath = '/api/' + req.query.path;
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      urlObj.pathname = originalPath;
      urlObj.searchParams.delete('path');
      req.url = urlObj.pathname + urlObj.search;
    } catch (e) {
      req.url = originalPath;
    }
  }
  next();
});

// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'https://ai-content-creation-and-translation.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    // Secure CORS settings: Only allow specific preview environments matching the project domain.
    // Let general .vercel.app domain through in non-production environments to avoid blockages.
    const isAllowedVercel = origin && (
      origin === 'https://ai-content-creation-and-translation.vercel.app' ||
      /^https:\/\/ai-content-creation-and-translation-[a-z0-9-]+-swapnit18s-projects\.vercel\.app$/.test(origin)
    );

    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      isAllowedVercel ||
      (process.env.NODE_ENV !== 'production' && (origin.endsWith('.vercel.app') || origin.includes('vercel.app')))
    ) {
      return callback(null, true);
    }
    callback(new Error('CORS policy does not allow access from this origin'));
  },
  credentials: true,
}));

// ─── General Middleware ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/contact', contactLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Creative Content API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
