const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
}, { timestamps: true });

// Create model unconditionally, but handle missing DB gracefully
module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
