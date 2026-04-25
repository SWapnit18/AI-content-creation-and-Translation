const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
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
});

router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Contact route accessible' });
});

module.exports = router;
