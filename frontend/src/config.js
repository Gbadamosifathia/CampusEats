// Automatically switch between local development and production backend URLs
export const API_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000' 
  : 'https://campuseats-cf7d.onrender.com';
