import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL - points to beacon_api
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage - in production, use secure storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      setAuthToken(null);
      // Navigation to login will be handled by the auth store
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
    me: () => apiClient.get('/auth/me'),
  },

  // Events
  events: {
    list: (params?: { status?: string; page?: number; limit?: number }) =>
      apiClient.get('/events', { params }),
    get: (id: string) => apiClient.get(`/events/${id}`),
    create: (data: any) => apiClient.post('/events', data),
    update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
    delete: (id: string) => apiClient.delete(`/events/${id}`),
  },

  // Units/Resources
  units: {
    list: (params?: { status?: string }) =>
      apiClient.get('/units', { params }),
    get: (id: string) => apiClient.get(`/units/${id}`),
    updateStatus: (id: string, status: string) =>
      apiClient.patch(`/units/${id}/status`, { status }),
    updateLocation: (id: string, lat: number, lng: number) =>
      apiClient.patch(`/units/${id}/location`, { lat, lng }),
  },

  // Alerts
  alerts: {
    list: (params?: { active?: boolean }) =>
      apiClient.get('/alerts', { params }),
    acknowledge: (id: string) => apiClient.post(`/alerts/${id}/acknowledge`),
  },

  // Status updates
  status: {
    getSystemStatus: () => apiClient.get('/status'),
    getUnitStatuses: () => apiClient.get('/status/units'),
  },
};

export default api;
