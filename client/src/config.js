// API Configuration
// This file centralizes all API endpoints to make them easy to update for different environments

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
