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

// ── Admin Auth ──────────────────────────────────────────────────────────────
export const signup      = (data) => api.post('/auth/signup', data);
export const login       = (data) => api.post('/auth/login', data);
export const getMe       = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ── Airline Auth ────────────────────────────────────────────────────────────
export const airlineSignup     = (data) => api.post('/auth/airline/signup', data);
export const airlineLogin      = (data) => api.post('/auth/airline/login', data);
export const uploadAirlineLogo = (file) => {
  const fd = new FormData();
  fd.append('logo', file);
  return api.post('/auth/airline/upload-logo', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Participants ────────────────────────────────────────────────────────────
export const getParticipantsByAirline = () => api.get('/participants/by-airline');
export const getAirlinesList         = () => api.get('/participants/airlines');
export const getParticipants    = (params) => api.get('/participants', { params });
export const getParticipant     = (id)     => api.get(`/participants/${id}`);
export const createParticipant       = (data)   => api.post('/participants', data);
export const bulkCreateParticipants  = (rows)   => api.post('/participants/bulk', rows);
export const updateParticipant  = (id, data) => api.put(`/participants/${id}`, data);
export const deleteParticipant      = (id)          => api.delete(`/participants/${id}`);
export const deleteAirlineData      = (airlineName) => api.delete(`/participants/airline/${encodeURIComponent(airlineName)}`);
export const deleteAirlineById      = (airlineId)   => api.delete(`/participants/airline-by-id/${airlineId}`);
export const updateCertSequence     = (id, cert_sequence) => api.patch(`/participants/${id}/cert-sequence`, { cert_sequence });
export const updateFullCertId       = (id, cert_sequence, cert_year) => api.patch(`/participants/${id}/full-cert-id`, { cert_sequence, cert_year });
export const updateNdgScore         = (id, ndg_score) => api.patch(`/participants/${id}/ndg-score`, { ndg_score });
export const sendSubmissionConfirmation = (data) => api.post('/participants/send-confirmation', data);
export const getCertCounters        = () => api.get('/certificates/counters');
export const resetCertCounter       = (training_type, startFrom = 0) => api.post('/certificates/counters/reset', { training_type, startFrom, mode: 'hard' });
export const resetAllCertCounters   = (startFrom = 0) => api.post('/certificates/counters/reset', { all: true, startFrom, mode: 'hard' });

// ── Certificates ────────────────────────────────────────────────────────────
export const getModulesList     = ()     => api.get('/certificates/modules');
export const generateCertificateUrl = (id) => `${API_BASE}/certificates/generate/${id}`;
export const previewCertificateUrl  = (id) => `${API_BASE}/certificates/preview/${id}`;
export const generateCertificateWithModules = (id, modules, variant = 'default') =>
  api.post(`/certificates/generate/${id}`, { modules, templateVariant: variant }, { responseType: 'blob' });
// Generate cert and return blob (no auto-download — caller decides what to do)
export const generateCertificateBlob = (id, variant = 'default') =>
  api.get(`/certificates/generate/${id}`, { params: { variant }, responseType: 'blob' });

export default api;
