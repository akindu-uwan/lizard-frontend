'use client'
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Add auth check interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/admin/auth/login', { email, password }),
  
  logout: () => api.post('/api/admin/auth/logout'),
  
  checkStatus: () => api.get('/api/admin/auth/status'),
};

export const tokenAdminApi = {
  getRequests: () => api.get('/api/tokens/request'),
  updateRequest: (id: number, status: string) =>
    api.put(`/api/tokens/request/${id}`, { status }),
};

export const serviceAdminApi = {
  getServices: () => api.get('/api/services/request'),
  updateServices: (id: number, status: string) =>
    api.put(`/api/services/request/${id}`, { status }),
};

export const partnerAdminApi = {
  getApplications: () => api.get('/api/admin/partners/applications'),
};

export default api;