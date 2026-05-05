import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token and normalize URLs
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ethara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Remove leading slash from url to ensure it appends to baseURL path correctly
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    // If the response is HTML (likely a 404/SPA redirect), treat as error
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('API Error: Received HTML instead of JSON. Check your VITE_API_URL.');
      return Promise.reject(new Error('Received HTML response from API'));
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('ethara_token');
      localStorage.removeItem('ethara_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
