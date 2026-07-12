// Frontend API / Backend URL configuration

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://ai-medical-voice-agent-ygc5.onrender.com';
export const API_URL = `${BACKEND_URL}/api`;

export default {
  BACKEND_URL,
  API_URL,
};
