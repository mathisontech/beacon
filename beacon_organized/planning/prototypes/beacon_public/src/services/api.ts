import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Get token from secure storage
    const token = null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized - clear auth state and redirect to login
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),
};

// Alerts endpoints
export const alertsAPI = {
  getAll: () => api.get('/alerts'),

  getById: (id: string) => api.get(`/alerts/${id}`),

  getByLocation: (lat: number, lng: number, radius: number) =>
    api.get('/alerts/nearby', { params: { lat, lng, radius } }),
};

// User status endpoints
export const statusAPI = {
  getCurrent: () => api.get('/status'),

  update: (status: string, location?: { lat: number; lng: number }) =>
    api.post('/status', { status, location }),

  getHistory: () => api.get('/status/history'),
};

// Community endpoints
export const communityAPI = {
  getPosts: (page: number = 1, limit: number = 20) =>
    api.get('/community/posts', { params: { page, limit } }),

  createPost: (content: string, type: string, imageUrl?: string) =>
    api.post('/community/posts', { content, type, imageUrl }),

  likePost: (postId: string) =>
    api.post(`/community/posts/${postId}/like`),

  commentOnPost: (postId: string, content: string) =>
    api.post(`/community/posts/${postId}/comments`, { content }),
};

// User profile endpoints
export const profileAPI = {
  get: () => api.get('/profile'),

  update: (data: { name?: string; phone?: string; avatarUrl?: string }) =>
    api.patch('/profile', data),

  updateNotificationSettings: (settings: Record<string, boolean>) =>
    api.patch('/profile/notifications', settings),
};

export default api;
