import { create } from 'zustand';
import { api, setAuthToken } from '../services/api';
import { realtimeService } from '../services/realtime';

// User type
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login(email, password);
      const { token, user } = response.data;
      setAuthToken(token);
      realtimeService.connect();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setAuthToken(null);
      realtimeService.disconnect();
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.auth.me();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      realtimeService.connect();
    } catch (error) {
      setAuthToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Event type
interface Event {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Events store
interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (params?: { status?: string }) => Promise<void>;
  selectEvent: (event: Event | null) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.events.list(params);
      set({ events: response.data.events, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch events';
      set({ error: message, isLoading: false });
    }
  },

  selectEvent: (event) => set({ selectedEvent: event }),

  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events] })),

  updateEvent: (event) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
      selectedEvent:
        state.selectedEvent?.id === event.id ? event : state.selectedEvent,
    })),

  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
      selectedEvent:
        state.selectedEvent?.id === eventId ? null : state.selectedEvent,
    })),
}));

// Unit type
interface Unit {
  id: string;
  callSign: string;
  type: string;
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'unavailable';
  location?: {
    lat: number;
    lng: number;
  };
}

// Units store
interface UnitsState {
  units: Unit[];
  isLoading: boolean;
  error: string | null;
  fetchUnits: (params?: { status?: string }) => Promise<void>;
  updateUnitStatus: (unitId: string, status: string) => void;
  updateUnitLocation: (unitId: string, lat: number, lng: number) => void;
}

export const useUnitsStore = create<UnitsState>((set) => ({
  units: [],
  isLoading: false,
  error: null,

  fetchUnits: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.units.list(params);
      set({ units: response.data.units, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch units';
      set({ error: message, isLoading: false });
    }
  },

  updateUnitStatus: (unitId, status) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === unitId ? { ...u, status: status as Unit['status'] } : u
      ),
    })),

  updateUnitLocation: (unitId, lat, lng) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === unitId ? { ...u, location: { lat, lng } } : u
      ),
    })),
}));

// Alert type
interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
  createdAt: string;
}

// Alerts store
interface AlertsState {
  alerts: Alert[];
  unacknowledgedCount: number;
  fetchAlerts: () => Promise<void>;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unacknowledgedCount: 0,

  fetchAlerts: async () => {
    try {
      const response = await api.alerts.list({ active: true });
      const alerts = response.data.alerts;
      set({
        alerts,
        unacknowledgedCount: alerts.filter((a: Alert) => !a.acknowledged).length,
      });
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  },

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unacknowledgedCount: alert.acknowledged
        ? state.unacknowledgedCount
        : state.unacknowledgedCount + 1,
    })),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
      unacknowledgedCount: Math.max(0, state.unacknowledgedCount - 1),
    })),
}));
