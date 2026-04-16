import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

// Socket.io server URL
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

type EventCallback = (data: any) => void;

class RealtimeService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  // Connect to the socket server
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = getAuthToken();

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Setup default event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    // Forward all events to registered listeners
    this.socket.onAny((eventName, data) => {
      const callbacks = this.listeners.get(eventName);
      if (callbacks) {
        callbacks.forEach((callback) => callback(data));
      }
    });
  }

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Emit an event to the server
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Join a room (e.g., for event-specific updates)
  joinRoom(room: string): void {
    this.emit('join_room', { room });
  }

  // Leave a room
  leaveRoom(room: string): void {
    this.emit('leave_room', { room });
  }
}

// Event types for type safety
export const RealtimeEvents = {
  // Event-related
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_CLOSED: 'event:closed',

  // Unit-related
  UNIT_STATUS_CHANGED: 'unit:status_changed',
  UNIT_LOCATION_UPDATED: 'unit:location_updated',
  UNIT_ASSIGNED: 'unit:assigned',

  // Alert-related
  ALERT_NEW: 'alert:new',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',

  // System-related
  SYSTEM_STATUS: 'system:status',
} as const;

// Export singleton instance
export const realtimeService = new RealtimeService();

export default realtimeService;
