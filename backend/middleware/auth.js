const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT Secret is not configured' });
    }
    const decoded = jwt.verify(token, secret || 'fallback_secret_wordflow');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      return next();
    }
    const decoded = jwt.verify(token, secret || 'fallback_secret_wordflow');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    // Continue as anonymous user if token is invalid/expired
    next();
  }
};

module.exports = { protect, optionalAuth };
