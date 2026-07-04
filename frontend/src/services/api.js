import axios from 'axios';

const isProduction = typeof window !== 'undefined' && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── AI Content Generation APIs ──────────────────────────────────────────
export const translateText = async (text, targetLanguage) => {
  try {
    const response = await api.post('/ai/translate', { text, targetLanguage });
    return response.data;
  } catch (error) {
    console.error('Translation error:', error);
    throw error.response?.data || { message: 'Translation generation failed.' };
  }
};

export const generateCreativeContent = async (text, language) => {
  try {
    const response = await api.post('/ai/creative', { text, language });
    return response.data;
  } catch (error) {
    console.error('Creative content error:', error);
    throw error.response?.data || { message: 'Creative generation failed.' };
  }
};

export const improveWriting = async (text) => {
  try {
    const response = await api.post('/ai/improve', { text });
    return response.data;
  } catch (error) {
    console.error('Improve writing error:', error);
    throw error.response?.data || { message: 'Improve writing failed.' };
  }
};

export const submitContact = async (data) => {
  try {
    const response = await api.post('/contact', data);
    return response.data;
  } catch (error) {
    console.error('Contact submission error:', error);
    return { success: true }; // Keep existing fallback behavior
  }
};

// ─── Authentication APIs ──────────────────────────────────────────────────
export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ─── History & Content Management APIs ──────────────────────────────────
export const getHistory = async ({ type, limit = 10, page = 1, search } = {}) => {
  const params = {};
  if (type) params.type = type;
  if (limit) params.limit = limit;
  if (page) params.page = page;
  if (search) params.search = search;
  
  const response = await api.get('/ai/history', { params });
  return response.data;
};

export const updateHistory = async (id, updates) => {
  const response = await api.put(`/ai/history/${id}`, updates);
  return response.data;
};

export const deleteHistory = async (id) => {
  const response = await api.delete(`/ai/history/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/ai/analytics');
  return response.data;
};
