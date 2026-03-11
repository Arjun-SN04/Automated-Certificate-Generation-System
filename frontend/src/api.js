import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Participants
export const getParticipants = (params) => api.get('/participants', { params });
export const getParticipant = (id) => api.get(`/participants/${id}`);
export const createParticipant = (data) => api.post('/participants', data);
export const updateParticipant = (id, data) => api.put(`/participants/${id}`, data);
export const deleteParticipant = (id) => api.delete(`/participants/${id}`);

// Certificates
export const getModulesList = () => api.get('/certificates/modules');
export const generateCertificateUrl = (id) => `${API_BASE}/certificates/generate/${id}`;
export const previewCertificateUrl = (id) => `${API_BASE}/certificates/preview/${id}`;
export const generateCertificateWithModules = (id, modules) =>
  api.post(`/certificates/generate/${id}`, { modules }, { responseType: 'blob' });

export default api;
