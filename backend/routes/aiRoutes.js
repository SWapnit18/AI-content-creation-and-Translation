const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const { body, validationResult } = require('express-validator');
const ContentGeneration = require('../models/ContentGeneration');
const { protect, optionalAuth } = require('../middleware/auth');

const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiMaxOutputTokens = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10);

// Helper to get or create GoogleGenAI instance dynamically
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add it to your environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

// ─── Helper: call Gemini API ───────────────────────────────────────────────
async function callGemini(userPrompt, systemPrompt, maxTokens) {
  const aiInstance = getAI();
  const response = await aiInstance.models.generateContent({
    model: geminiModel,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: maxTokens || geminiMaxOutputTokens,
    }
  });
  return response.text;
}

// ─── Helper: Generate descriptive titles for saved content ────────────────
const generateTitle = (type, text, metadata = {}) => {
  const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
  const snippet = cleanText.substring(0, 30) + (cleanText.length > 30 ? '...' : '');
  switch (type) {
    case 'translation':
      return `Translate to ${metadata.targetLanguage || 'Unknown'}: "${snippet}"`;
    case 'creative':
      return `Creative (${metadata.contentLanguage || 'English'}): "${snippet}"`;
    case 'improve':
      return `Refine: "${snippet}"`;
    case 'quote':
      return `Quote: "${snippet}"`;
    default:
      return `AI Generation: "${snippet}"`;
  }
};

// ─── Validation middleware ─────────────────────────────────────────────────
const validateText = [
  body('text')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ max: 3000 }).withMessage('Text must be under 3000 characters'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── POST /api/ai/translate ────────────────────────────────────────────────
router.post(
  '/translate',
  optionalAuth,
  [
    ...validateText,
    body('targetLanguage').trim().notEmpty().withMessage('Target language is required'),
  ],
  handleValidation,
  async (req, res) => {
    const { text, targetLanguage } = req.body;
    const start = Date.now();
    try {
      const result = await callGemini(
        `Translate the following text into ${targetLanguage}:\n\n"${text}"`,
        'You are a professional translation assistant. Provide direct, accurate translations without any commentary or explanations. Return only the translated text.',
        1024
      );

      if (mongoose.connection.readyState === 1) {
        ContentGeneration.create({
          userId: req.user ? req.user._id : undefined,
          title: generateTitle('translation', text, { targetLanguage }),
          type: 'translation',
          inputText: text,
          outputText: result,
          metadata: { targetLanguage },
          ipAddress: req.ip,
          processingTimeMs: Date.now() - start,
        }).catch(err => console.error('Failed to save translation log:', err));
      } else {
        console.warn('MongoDB not connected; skipping translation save.');
      }

      res.json({ success: true, result });
    } catch (err) {
      console.error('Translation error:', err.message);
      res.json({
        success: false,
        result: `⚠️ Real generation failed. Please add your GEMINI_API_KEY to the backend .env file to see actual results! (${err.message})`
      });
    }
  }
);

// ─── POST /api/ai/creative ─────────────────────────────────────────────────
router.post(
  '/creative',
  optionalAuth,
  [
    ...validateText,
    body('language').trim().notEmpty().withMessage('Language is required'),
  ],
  handleValidation,
  async (req, res) => {
    const { text, language } = req.body;
    const start = Date.now();
    try {
      const result = await callGemini(
        `Write an engaging creative piece in ${language} based on the following idea:\n\n"${text}". The output should be approximately 300 to 500 words, detailed, and divided into clear paragraphs. Use natural, fluent language and avoid adding any commentary or labels beyond the content itself.`,
        'You are a creative writing assistant. Write engaging, imaginative, and family-friendly content. Structure your response with clear paragraphs and provide a narrative or explanation that is approximately 300 to 500 words. Do not include any markup or extraneous commentary.',
        1024
      );

      if (mongoose.connection.readyState === 1) {
        ContentGeneration.create({
          userId: req.user ? req.user._id : undefined,
          title: generateTitle('creative', text, { contentLanguage: language }),
          type: 'creative',
          inputText: text,
          outputText: result,
          metadata: { contentLanguage: language },
          ipAddress: req.ip,
          processingTimeMs: Date.now() - start,
        }).catch(err => console.error('Failed to save creative log:', err));
      } else {
        console.warn('MongoDB not connected; skipping creative save.');
      }

      res.json({ success: true, result });
    } catch (err) {
      console.error('Creative generation error:', err.message);
      res.json({
        success: false,
        result: `⚠️ Real generation failed. Please add your GEMINI_API_KEY to the backend .env file to see actual results! (${err.message})`
      });
    }
  }
);

// ─── POST /api/ai/improve ──────────────────────────────────────────────────
router.post('/improve', optionalAuth, validateText, handleValidation, async (req, res) => {
  const { text } = req.body;
  const start = Date.now();
  try {
    const result = await callGemini(
      `Improve the following text for clarity, grammar, and professionalism:\n\n"${text}"`,
      'You are an expert editor. Return only the improved text without any commentary, explanations, or labels.',
      1024
    );

    if (mongoose.connection.readyState === 1) {
      ContentGeneration.create({
        userId: req.user ? req.user._id : undefined,
        title: generateTitle('improve', text),
        type: 'improve',
        inputText: text,
        outputText: result,
        ipAddress: req.ip,
        processingTimeMs: Date.now() - start,
      }).catch(err => console.error('Failed to save improve log:', err));
    } else {
      console.warn('MongoDB not connected; skipping improve save.');
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error('Improve error:', err.message);
    res.json({
      success: false,
      result: `⚠️ Real generation failed. Please add your GEMINI_API_KEY to the backend .env file to see actual results! (${err.message})`
    });
  }
});

// ─── POST /api/ai/quote ────────────────────────────────────────────────────
router.post('/quote', optionalAuth, validateText, handleValidation, async (req, res) => {
  const { text } = req.body;
  const start = Date.now();
  try {
    const result = await callGemini(
      `Analyze the following text for a translation project quote. Consider its complexity (technical, legal, or casual), subject matter, and word count. Return ONLY a valid JSON object with keys "pricePerWord" (number between 0.10 and 0.25) and "deliveryDays" (string like "2-3 business days"). No markdown, no extra text.\n\nText: "${text}"`,
      'You are a project analysis bot. You only respond in valid JSON format with no markdown or extra text.',
      512
    );

    // Parse JSON from Gemini response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from AI');
    const parsed = JSON.parse(jsonMatch[0]);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const estimatedCost = parseFloat((wordCount * parsed.pricePerWord).toFixed(2));

    if (mongoose.connection.readyState === 1) {
      ContentGeneration.create({
        userId: req.user ? req.user._id : undefined,
        title: generateTitle('quote', text),
        type: 'quote',
        inputText: text,
        outputText: JSON.stringify(parsed),
        metadata: {
          wordCount,
          pricePerWord: parsed.pricePerWord,
          estimatedCost,
          deliveryDays: parsed.deliveryDays,
        },
        ipAddress: req.ip,
        processingTimeMs: Date.now() - start,
      }).catch(err => console.error('Failed to save quote log:', err));
    } else {
      console.warn('MongoDB not connected; skipping quote save.');
    }

    res.json({
      success: true,
      wordCount,
      pricePerWord: parsed.pricePerWord,
      estimatedCost,
      deliveryDays: parsed.deliveryDays,
    });
  } catch (err) {
    console.error('Quote error:', err.message);
    res.json({ success: false, message: `Quote analysis failed: ${err.message}` });
  }
});

// ─── GET /api/ai/history ───────────────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const { type, limit = 10, page = 1, search } = req.query;
    
    // Filter history specifically by authenticated user
    const filter = { userId: req.user._id };
    if (type) {
      filter.type = type;
    }
    
    // Add text search capabilities
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { inputText: { $regex: search, $options: 'i' } },
        { outputText: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      ContentGeneration.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-ipAddress'),
      ContentGeneration.countDocuments(filter),
    ]);

    res.json({
      success: true,
      records,
      pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / limit) 
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Failed to fetch history: ${err.message}` });
  }
});

// ─── PUT /api/ai/history/:id ───────────────────────────────────────────────
router.put('/history/:id', protect, async (req, res) => {
  try {
    const { title, inputText, outputText } = req.body;
    
    // Find record by ID and confirm it belongs to the user
    const record = await ContentGeneration.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
    }

    if (title !== undefined) record.title = title;
    if (inputText !== undefined) record.inputText = inputText;
    if (outputText !== undefined) record.outputText = outputText;

    await record.save();
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: `Failed to update record: ${err.message}` });
  }
});

// ─── DELETE /api/ai/history/:id ────────────────────────────────────────────
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const result = await ContentGeneration.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: `Failed to delete record: ${err.message}` });
  }
});

// ─── GET /api/ai/analytics ─────────────────────────────────────────────────
router.get('/analytics', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. General Metrics
    const totalGenerations = await ContentGeneration.countDocuments({ userId });

    const stats = await ContentGeneration.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgProcessingTimeMs: { $avg: '$processingTimeMs' },
          totalEstimatedCost: { $sum: '$metadata.estimatedCost' }
        }
      }
    ]);

    const avgProcessingTimeMs = stats.length > 0 ? Math.round(stats[0].avgProcessingTimeMs) : 0;
    const totalEstimatedCost = stats.length > 0 ? parseFloat((stats[0].totalEstimatedCost || 0).toFixed(2)) : 0;

    // 2. Count by Generation Type
    const countByType = await ContentGeneration.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const typesBreakdown = {
      translation: 0,
      creative: 0,
      improve: 0,
      quote: 0
    };
    countByType.forEach(item => {
      typesBreakdown[item._id] = item.count;
    });

    // 3. Output Words generated
    const allRecords = await ContentGeneration.find({ userId }).select('outputText type');
    let totalWordCount = 0;
    allRecords.forEach(rec => {
      if (rec.type === 'quote') return; // Quote output is structured JSON
      if (rec.outputText) {
        const words = rec.outputText.trim().split(/\s+/).filter(Boolean).length;
        totalWordCount += words;
      }
    });

    // 4. Activity breakdown over past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityTimeline = await ContentGeneration.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalGenerations,
        totalWordCount,
        avgProcessingTimeMs,
        totalEstimatedCost,
        typesBreakdown,
        activityTimeline
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: `Failed to fetch analytics: ${err.message}` });
  }
});

module.exports = router;
