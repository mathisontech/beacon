import { create } from 'zustand';

// User types
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

// Auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
      };
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      const mockUser: User = {
        id: '1',
        email,
        name,
      };
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // TODO: Check for stored auth token
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));

// Alert types
interface Alert {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'tornado' | 'general';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

// Alerts store
interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Alert) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  isLoading: false,

  fetchAlerts: async () => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      set({ alerts: [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addAlert: (alert: Alert) => {
    set((state) => ({ alerts: [alert, ...state.alerts] }));
  },
}));

// User status types
type UserStatus = 'safe' | 'need_help' | 'evacuating' | 'unknown';

interface StatusState {
  currentStatus: UserStatus;
  lastUpdated: Date | null;
  updateStatus: (status: UserStatus) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set) => ({
  currentStatus: 'unknown',
  lastUpdated: null,

  updateStatus: async (status: UserStatus) => {
    try {
      // TODO: Implement actual API call
      set({ currentStatus: status, lastUpdated: new Date() });
    } catch (error) {
      throw error;
    }
  },
}));

// Community feed types
interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  type: 'story' | 'report';
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  likes: number;
  comments: number;
}

interface CommunityState {
  posts: Post[];
  isLoading: boolean;
  fetchPosts: () => Promise<void>;
  createPost: (content: string, type: 'story' | 'report', imageUrl?: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      // TODO: Implement actual API call
      set({ posts: [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createPost: async (content: string, type: 'story' | 'report', imageUrl?: string) => {
    try {
      // TODO: Implement actual API call
      const newPost: Post = {
        id: Date.now().toString(),
        userId: '1',
        userName: 'Demo User',
        content,
        type,
        imageUrl,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
      };
      set((state) => ({ posts: [newPost, ...state.posts] }));
    } catch (error) {
      throw error;
    }
  },
}));
