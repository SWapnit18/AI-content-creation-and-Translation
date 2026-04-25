const mongoose = require('mongoose');

const contentGenerationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['translation', 'creative', 'improve', 'quote'],
      required: true,
    },
    inputText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    outputText: {
      type: String,
      required: true,
    },
    metadata: {
      targetLanguage: { type: String },       // for translation
      contentLanguage: { type: String },      // for creative writing
      wordCount: { type: Number },            // for quote
      pricePerWord: { type: Number },         // for quote
      estimatedCost: { type: Number },        // for quote
      deliveryDays: { type: String },         // for quote
    },
    ipAddress: { type: String },
    processingTimeMs: { type: Number },
  },
  { timestamps: true }
);

// Index for querying by type and date
contentGenerationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('ContentGeneration', contentGenerationSchema);
