const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const { body, validationResult } = require('express-validator');
const ContentGeneration = require('../models/ContentGeneration');

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is missing. Add it to backend/.env before starting the server.');
}

const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiMaxOutputTokens = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10);
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// ─── Helper: call Gemini API ───────────────────────────────────────────────
async function callGemini(userPrompt, systemPrompt, maxTokens) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: maxTokens || geminiMaxOutputTokens,
    }
  });
  return response.text;
}

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
        await ContentGeneration.create({
          type: 'translation',
          inputText: text,
          outputText: result,
          metadata: { targetLanguage },
          ipAddress: req.ip,
          processingTimeMs: Date.now() - start,
        });
      } else {
        console.warn('MongoDB not connected; skipping translation save.');
      }

      res.json({ success: true, result });
    } catch (err) {
      console.error('Translation error:', err.message);
      res.status(500).json({ success: false, message: 'Translation failed. Please try again.' });
    }
  }
);

// ─── POST /api/ai/creative ─────────────────────────────────────────────────
router.post(
  '/creative',
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
        `Write a long-form creative piece in ${language} based on the following idea:\n\n"${text}". The output should be approximately 3000 words, richly detailed, and divided into clear paragraphs. Use natural, fluent language and avoid adding any commentary or labels beyond the content itself.`,
        'You are a creative writing assistant. Write engaging, imaginative, and family-friendly content in a long-form format. Structure your response with clear paragraphs and provide a rich narrative or explanation that reaches approximately three thousand words. Do not include any markup or extraneous commentary.'
      );

      if (mongoose.connection.readyState === 1) {
        await ContentGeneration.create({
          type: 'creative',
          inputText: text,
          outputText: result,
          metadata: { contentLanguage: language },
          ipAddress: req.ip,
          processingTimeMs: Date.now() - start,
        });
      } else {
        console.warn('MongoDB not connected; skipping creative save.');
      }

      res.json({ success: true, result });
    } catch (err) {
      console.error('Creative generation error:', err.message);
      res.status(500).json({ success: false, message: 'Content generation failed. Please try again.' });
    }
  }
);

// ─── POST /api/ai/improve ──────────────────────────────────────────────────
router.post('/improve', validateText, handleValidation, async (req, res) => {
  const { text } = req.body;
  const start = Date.now();
  try {
    const result = await callGemini(
      `Improve the following text for clarity, grammar, and professionalism:\n\n"${text}"`,
      'You are an expert editor. Return only the improved text without any commentary, explanations, or labels.',
      2048
    );

    if (mongoose.connection.readyState === 1) {
      await ContentGeneration.create({
        type: 'improve',
        inputText: text,
        outputText: result,
        ipAddress: req.ip,
        processingTimeMs: Date.now() - start,
      });
    } else {
      console.warn('MongoDB not connected; skipping improve save.');
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error('Improve error:', err.message);
    res.status(500).json({ success: false, message: 'Writing improvement failed. Please try again.' });
  }
});

// ─── POST /api/ai/quote ────────────────────────────────────────────────────
router.post('/quote', validateText, handleValidation, async (req, res) => {
  const { text } = req.body;
  const start = Date.now();
  try {
    const result = await callGemini(
      `Analyze the following text for a translation project quote. Consider its complexity (technical, legal, or casual), subject matter, and word count. Return ONLY a valid JSON object with keys "pricePerWord" (number between 0.10 and 0.25) and "deliveryDays" (string like "2-3 business days"). No markdown, no extra text.\n\nText: "${text}"`,
      'You are a project analysis bot. You only respond in valid JSON format with no markdown or extra text.'
    );

    // Parse JSON from Claude response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from AI');
    const parsed = JSON.parse(jsonMatch[0]);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const estimatedCost = parseFloat((wordCount * parsed.pricePerWord).toFixed(2));

    if (mongoose.connection.readyState === 1) {
      await ContentGeneration.create({
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
      });
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
    res.status(500).json({ success: false, message: 'Quote analysis failed. Please try again.' });
  }
});

// ─── GET /api/ai/history ───────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    const filter = type ? { type } : {};
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
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

module.exports = router;
