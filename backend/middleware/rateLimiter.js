const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit per IP for interactive application use
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  message: { success: false, message: 'Too many AI requests from this IP, please try again in a moment.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many contact requests from this IP, please try again later.' }
});

module.exports = { apiLimiter, aiLimiter, contactLimiter };
