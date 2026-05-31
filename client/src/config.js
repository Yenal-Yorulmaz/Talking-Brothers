// API Configuration
// This file centralizes all API endpoints to make them easy to update for different environments

const API_BASE = (() => {
  // In production (Railway), use the Railway backend URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://server-production-1755.up.railway.app/api';
  }
  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
})();

export default API_BASE;
