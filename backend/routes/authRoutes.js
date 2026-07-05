const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not configured in production environment');
  }
  return jwt.sign({ id }, secret || 'fallback_secret_wordflow', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  handleValidation,
  async (req, res) => {
    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(20).toString('hex');

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        verificationToken,
      });

      // Generate token
      const token = generateToken(user._id);

      // Determine client URL dynamically
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5173';
      const clientUrl = `${protocol}://${host}`;
      const verifyUrl = `${clientUrl}?verifyToken=${verificationToken}`;

      // Email message details
      const subject = 'Verify Your Email - WordFlow Global';
      const message = `Welcome to WordFlow Global!\n\nPlease verify your email address by clicking on the link below, or pasting it into your browser:\n\n${verifyUrl}\n`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Welcome to WordFlow Global!</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #64748b; font-size: 0.85rem; word-break: break-all;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
          <p style="color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">If you did not sign up for this account, you can safely ignore this email.</p>
        </div>
      `;

      // Send email
      const emailResult = await sendEmail({
        email: user.email,
        subject,
        message,
        html,
      });

      const response = {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: false,
        },
        message: 'Account created. Verification link sent.',
      };

      if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
        response.message = 'Account created. SMTP not configured, verification link logged to console.';
        response.verifyToken = verificationToken;
        response.verifyUrl = verifyUrl;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      // Check for user (must explicitly select password since select: false in schema)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified || false,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified || false,
      },
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

// @route   POST /api/auth/forgotpassword
// @desc    Generate password reset token and send email
// @access  Public
router.post(
  '/forgotpassword',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  handleValidation,
  async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'No user registered with that email' });
      }

      // Generate random crypto token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and save to User model
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expiration: 10 minutes from now
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

      await user.save();

      // Determine client URL dynamically
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5173';
      const clientUrl = `${protocol}://${host}`;
      const resetUrl = `${clientUrl}?resetToken=${resetToken}`;

      // Email message details
      const subject = 'Password Reset Request - WordFlow Global';
      const message = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click on the following link, or paste it into your browser, to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">WordFlow Global</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your WordFlow Global account. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 0.85rem; word-break: break-all;">If the button doesn't work, copy and paste this link into your browser:<br>${resetUrl}</p>
          <p style="color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">This request expires in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `;

      // Send email
      const emailResult = await sendEmail({
        email: user.email,
        subject,
        message,
        html,
      });

      const response = {
        success: true,
        message: 'Password reset link sent successfully.',
      };

      // In development or when using mock fallback, return the token in the response for easy API testing
      if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
        response.message = 'SMTP not configured. Reset link logged to console.';
        response.resetToken = resetToken;
        response.resetUrl = resetUrl;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Server error requesting password reset' });
    }
  }
);

// @route   PUT /api/auth/resetpassword/:token
// @desc    Reset user password using token
// @access  Public
router.post(
  '/resetpassword/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      // Hash incoming token
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      // Find user with active token and check expiration
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      // Update password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Auto login user after reset by returning new token
      const jwtToken = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Logged in successfully.',
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified || false,
        },
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Server error resetting password' });
    }
  }
);

// @route   GET /api/auth/verify/:token
// @desc    Verify user email using token
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification link email
// @access  Private
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Determine client URL dynamically
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5173';
    const clientUrl = `${protocol}://${host}`;
    const verifyUrl = `${clientUrl}?verifyToken=${verificationToken}`;

    // Email message details
    const subject = 'Verify Your Email - WordFlow Global';
    const message = `Please verify your email address by clicking on the link below, or pasting it into your browser:\n\n${verifyUrl}\n`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Verify Your Email</h2>
        <p>Hello ${user.name},</p>
        <p>Please verify your email address by clicking the button below to secure your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #64748b; font-size: 0.85rem; word-break: break-all;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
      </div>
    `;

    // Send email
    const emailResult = await sendEmail({
      email: user.email,
      subject,
      message,
      html,
    });

    const response = {
      success: true,
      message: 'Verification link resent successfully.',
    };

    if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
      response.message = 'Verification email logged. SMTP not configured, link logged to console.';
      response.verifyToken = verificationToken;
      response.verifyUrl = verifyUrl;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error resending verification link' });
  }
});

// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth consent page
// @access  Public
router.get('/google', (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  if (!client_id) {
    console.error('GOOGLE_CLIENT_ID is not configured');
    return res.status(500).send('Server configuration error: Google client ID is missing.');
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5000';
  const redirect_uri = `${protocol}://${host}/api/auth/google/callback`;

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&scope=${encodeURIComponent('profile email')}&prompt=select_account`;

  res.redirect(oauthUrl);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback endpoint
// @access  Public
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('OAuth callback error: authorization code is missing.');
  }

  try {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    if (!client_id || !client_secret) {
      console.error('Google credentials not configured');
      return res.status(500).send('Server configuration error: Google credentials are missing.');
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5000';
    const redirect_uri = `${protocol}://${host}/api/auth/google/callback`;

    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', tokenData);
      return res.status(400).send(`Google OAuth error: ${tokenData.error_description || 'Failed to exchange code.'}`);
    }

    const { access_token } = tokenData;

    // 2. Retrieve user profile using the access token
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      console.error('Failed to fetch user profile:', profileData);
      return res.status(400).send('Google OAuth error: Failed to retrieve user profile.');
    }

    const { email, name } = profileData;
    if (!email) {
      return res.status(400).send('Google OAuth error: Google did not return email address.');
    }

    // 3. Find or create user in MongoDB
    let user = await User.findOne({ email });
    if (user) {
      // User exists. Set isVerified to true since Google verified their email.
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Create new user with random hashed password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || 'Google User',
        email,
        password: randomPassword,
        isVerified: true,
      });
    }

    // 4. Generate local JWT token for user session
    const localToken = generateToken(user._id);

    // 5. Redirect back to frontend
    // Use CLIENT_URL env var or fall back to localhost:5174 (development) or relative protocol root.
    let frontendUrl = process.env.CLIENT_URL;
    if (!frontendUrl) {
      const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
      frontendUrl = isLocalHost ? 'http://localhost:5174' : `${protocol}://${req.headers['x-forwarded-host'] || host}`;
    }

    res.redirect(`${frontendUrl}?googleToken=${localToken}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).send('Server error during Google OAuth callback.');
  }
});

module.exports = router;
