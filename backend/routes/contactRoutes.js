const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('email').trim().isEmail().withMessage('Please enter a valid email address'),
    body('subject').optional().trim().isLength({ max: 150 }).withMessage('Subject cannot exceed 150 characters'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (process.env.MONGO_URI) {
        const contact = new Contact({ name, email, subject, message });
        await contact.save();
      }
      
      res.status(201).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Contact route accessible' });
});

module.exports = router;
