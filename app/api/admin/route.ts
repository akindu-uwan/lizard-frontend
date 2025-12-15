'use client';

import axios from 'axios';
import { apiGet, apiPost } from "@/app/api/directory/route";


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
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
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
// Token Admin API (unchanged)
// ------------------------------------
export const tokenAdminApi = {
  getRequests: () => api.get('/api/tokenrequests'),
  updateRequest: (id: number | string, status: string) =>
    api.put(`/api/tokenrequests/${id}`, { status }),
};

// ------------------------------------
// Service Admin API (FIXED + EXTENDED)
// ------------------------------------
export const serviceAdminApi = {
  // 🔹 Service requests
  getServices: () => api.get('/api/servicerequests'),

  getRequestServiceById: (id: number | string) =>
    api.get(`/api/servicerequests/${id}`),

  updateServices: (
    id: number | string,
    data: Partial<{ verificationStatus: string }>
  ) =>
    api.put(`/api/servicerequests/${id}`, data),

  // 🔹 Confirmed services (published)

  getServiceById: (id: number | string) =>
    api.get(`/api/servicerequests/${id}`),

  createConfirmedService: (data: any) =>
    api.post('/api/services', data),

  getConfirmedServices: () =>
    api.get('/api/services'),

  updateConfirmedService: (id: number | string, data: any) =>
    api.put(`/api/services/${id}`, data),
};



// ------------------------------------
// Partner Admin API (EXTENDED for publish flow)
// ------------------------------------
export const partnerAdminApi = {
  // Requests (applications)
  getApplications: () => api.get("/api/partnerrequests"),
  updateApplication: (id: number | string, status: string) =>
    api.put(`/api/partnerrequests/${id}`, { status }),

  // Confirmed / Published partners
  getConfirmedPartners: () => api.get("/api/partners"),
  createConfirmedPartner: (data: any) => 
    api.post("/api/partners/apply", data),
  updateConfirmedPartner: (id: number | string, data: any) =>
    api.put(`/api/partners/${id}`, data),
};

export const keyAuthApi = {
  // Signup: generates login key ONCE + sets cookie
  register: (label?: string) =>
    apiPost("/api/auth/key/register", { label }),

  // Login: paste key + sets cookie
  login: (loginKey: string) =>
    apiPost("/api/auth/key/login", { loginKey }),

  // Who am I (session check)
  me: () => apiGet("/api/auth/me"),

  // Logout
  logout: () => apiPost("/api/auth/logout", {}),
};


export default api;
