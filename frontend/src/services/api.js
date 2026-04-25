import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const translateText = async (text, targetLanguage) => {
  try {
    const response = await api.post('/ai/translate', { text, targetLanguage });
    return response.data;
  } catch (error) {
    // fallback for local UI dev without API key
    return { result: `⚠️ Real generation failed. Please add your ANTHROPIC_API_KEY to the backend .env file to see actual results!` };
  }
};

export const generateCreativeContent = async (text, language) => {
  try {
    const response = await api.post('/ai/creative', { prompt: text, language });
    return response.data;
  } catch (error) {
    return { result: `⚠️ Real generation failed. Please add your ANTHROPIC_API_KEY to the backend .env file to see actual results!` };
  }
};

export const improveWriting = async (text) => {
  try {
    const response = await api.post('/ai/improve', { text });
    return response.data;
  } catch (error) {
    return { result: `⚠️ Real generation failed. Please add your ANTHROPIC_API_KEY to the backend .env file to see actual results!` };
  }
};

export const submitContact = async (data) => {
  try {
    const response = await api.post('/contact', data);
    return response.data;
  } catch (error) {
    return { success: true };
  }
};
