import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    // 1. Check for complete Network failures
    if (!error.response) {
      const netError = new Error('Network error. Please check your internet connection or server status.');
      netError.status = 0;
      return Promise.reject(netError);
    }

    // 2. Extract custom backend message or express-validator errors array
    let message = error.response.data?.message;
    if (!message && Array.isArray(error.response.data?.errors)) {
      message = error.response.data.errors.map((e) => e.msg).join(', ');
    }

    // 3. Detect Vercel Security Checkpoint or raw HTML error responses
    if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      if (error.response.data.includes('Vercel Security Checkpoint')) {
        message = 'Vercel Security Checkpoint protection is enabled on your deployment. Please disable Attack Mode / Security Checkpoint in Vercel Dashboard Settings.';
      } else {
        message = `Server error (${error.response.status}). Please try again later.`;
      }
    }

    if (!message) {
      message = error.message || 'An unexpected error occurred';
    }

    const customError = new Error(message);
    customError.status = error.response.status;
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

// ─── Admin APIs ─────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await api.get('/admin/users', { params: { page, limit, search } });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminContacts = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await api.get('/admin/contacts', { params: { page, limit, search } });
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/admin/contacts/${id}`);
  return response.data;
};
