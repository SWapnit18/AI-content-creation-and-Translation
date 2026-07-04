import axios from 'axios';

const isProduction = typeof window !== 'undefined' && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract server-side error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the backend message if available, else fallback to Axios default message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

// ─── AI Content Generation APIs ──────────────────────────────────────────
export const translateText = async (text, targetLanguage) => {
  const response = await api.post('/ai/translate', { text, targetLanguage });
  return response.data;
};

export const generateCreativeContent = async (text, language) => {
  const response = await api.post('/ai/creative', { text, language });
  return response.data;
};

export const improveWriting = async (text) => {
  const response = await api.post('/ai/improve', { text });
  return response.data;
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

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgotpassword', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/resetpassword/${token}`, { password });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify/${token}`);
  return response.data;
};

export const resendVerification = async () => {
  const response = await api.post('/auth/resend-verification');
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
