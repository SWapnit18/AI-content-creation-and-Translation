const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ContentGeneration = require('../models/ContentGeneration');
const Contact = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get overall system stats & analytics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalGenerations, totalContacts] = await Promise.all([
      User.countDocuments(),
      ContentGeneration.countDocuments(),
      Contact.countDocuments(),
    ]);

    // AI Generation Breakdown by type across all users
    const typeBreakdownRaw = await ContentGeneration.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const typeBreakdown = { translation: 0, creative: 0, improve: 0, quote: 0 };
    typeBreakdownRaw.forEach(item => {
      if (item._id && typeBreakdown[item._id] !== undefined) {
        typeBreakdown[item._id] = item.count;
      }
    });

    // Recent 5 registered users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    // Recent 5 contact entries
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalGenerations,
        totalContacts,
        typeBreakdown,
        recentUsers,
        recentContacts,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin statistics' });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all users with search and pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (user <-> admin)
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot modify your own admin role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account and their content history
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user and clean up their content generations
    await Promise.all([
      User.deleteOne({ _id: user._id }),
      ContentGeneration.deleteMany({ userId: user._id }),
    ]);

    res.json({ success: true, message: 'User account and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get submitted contact messages
// @access  Admin
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { subject: { $regex: safeSearch, $options: 'i' } },
        { message: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      contacts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin fetch contacts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching contact messages' });
  }
});

// @route   DELETE /api/admin/contacts/:id
// @desc    Delete a contact message
// @access  Admin
router.delete('/contacts/:id', async (req, res) => {
  try {
    const result = await Contact.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Admin delete contact error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting contact message' });
  }
});

module.exports = router;
