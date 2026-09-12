import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined. Set it in your environment or .env file.');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status || 'no response';
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${url} -> ${status}`, {
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const ticketService = {
  create: (data) => api.post('/api/tickets/', data),
  list: (params) => api.get('/api/tickets/', { params }),
  get: (ticketId) => api.get(`/api/tickets/${ticketId}`),
  update: (ticketId, data) => api.put(`/api/tickets/${ticketId}`, data),
  delete: (ticketId) => api.delete(`/api/tickets/${ticketId}`),
  aiAssist: (ticketId) => api.post(`/api/tickets/${ticketId}/ai-assist`),
  getSimilar: (ticketId) => api.get(`/api/tickets/${ticketId}/similar`),
  getAnalytics: () => api.get('/api/analytics/summary'),
};
