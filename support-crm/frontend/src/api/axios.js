import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketService = {
  create: (data) => api.post('/tickets', data),
  list: (params) => api.get('/tickets', { params }),
  get: (ticketId) => api.get(`/tickets/${ticketId}`),
  update: (ticketId, data) => api.put(`/tickets/${ticketId}`, data),
  delete: (ticketId) => api.delete(`/tickets/${ticketId}`),
  aiAssist: (ticketId) => api.post(`/tickets/${ticketId}/ai-assist`),
};
