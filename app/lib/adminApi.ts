'use client';

import axios from 'axios';
import { apiGet, apiPost } from "@/app/lib/http";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// ------------------------------------
// Auth interceptor
// ------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ------------------------------------
// Auth API
// ------------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/admin/auth/login', { email, password }),

  logout: () => api.post('/api/admin/auth/logout'),

  checkStatus: () => api.get('/api/admin/auth/status'),
};

// ------------------------------------
// Token Admin API
// ------------------------------------
export const tokenAdminApi = {
  getRequests: () => api.get('/api/tokenrequests'),
  updateRequest: (id: number | string, status: string) =>
    api.put(`/api/tokenrequests/${id}`, { status }),
};

// ------------------------------------
// Service Admin API
// ------------------------------------
export const serviceAdminApi = {
  getServices: () => api.get('/api/servicerequests'),
  getRequestServiceById: (id: number | string) =>
    api.get(`/api/servicerequests/${id}`),
  updateServices: (id: number | string, data: any) =>
    api.put(`/api/servicerequests/${id}`, data),

  createConfirmedService: (data: any) =>
    api.post('/api/services', data),
};

// ------------------------------------
// Partner Admin API
// ------------------------------------
export const partnerAdminApi = {
  getApplications: () => api.get("/api/partnerrequests"),
  updateApplication: (id: number | string, status: string) =>
    api.put(`/api/partnerrequests/${id}`, { status }),
};

// ------------------------------------
// Key Auth API
// ------------------------------------
export const keyAuthApi = {
  register: (label?: string) =>
    apiPost("/api/auth/key/register", { label }),

  login: (loginKey: string) =>
    apiPost("/api/auth/key/login", { loginKey }),

  me: () => apiGet("/api/auth/me"),

  logout: () => apiPost("/api/auth/logout", {}),
};

export default api;
