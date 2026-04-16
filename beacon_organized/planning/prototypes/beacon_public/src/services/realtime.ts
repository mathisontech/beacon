import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Event types
export interface AlertEvent {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'tornado' | 'general';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export interface StatusUpdateEvent {
  userId: string;
  userName: string;
  status: 'safe' | 'need_help' | 'evacuating';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

export interface CommunityPostEvent {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'story' | 'report';
  imageUrl?: string;
  createdAt: string;
}

// Realtime service class
class RealtimeService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  // Event listeners
  private alertListeners: ((alert: AlertEvent) => void)[] = [];
  private statusListeners: ((update: StatusUpdateEvent) => void)[] = [];
  private postListeners: ((post: CommunityPostEvent) => void)[] = [];

  connect(authToken?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: authToken ? { token: authToken } : undefined,
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Realtime: Connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Realtime: Disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Realtime: Connection error', error);
    });

    // Listen for alerts
    this.socket.on('alert:new', (alert: AlertEvent) => {
      this.alertListeners.forEach((listener) => listener(alert));
    });

    // Listen for status updates from community
    this.socket.on('status:update', (update: StatusUpdateEvent) => {
      this.statusListeners.forEach((listener) => listener(update));
    });

    // Listen for new community posts
    this.socket.on('community:post', (post: CommunityPostEvent) => {
      this.postListeners.forEach((listener) => listener(post));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to location-based alerts
  subscribeToLocation(latitude: number, longitude: number, radius: number = 50): void {
    this.socket?.emit('subscribe:location', { latitude, longitude, radius });
  }

  // Unsubscribe from location
  unsubscribeFromLocation(): void {
    this.socket?.emit('unsubscribe:location');
  }

  // Broadcast status update
  broadcastStatus(status: string, location?: { latitude: number; longitude: number }): void {
    this.socket?.emit('status:broadcast', { status, location });
  }

  // Add event listeners
  onAlert(listener: (alert: AlertEvent) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter((l) => l !== listener);
    };
  }

  onStatusUpdate(listener: (update: StatusUpdateEvent) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  onCommunityPost(listener: (post: CommunityPostEvent) => void): () => void {
    this.postListeners.push(listener);
    return () => {
      this.postListeners = this.postListeners.filter((l) => l !== listener);
    };
  }

  // Check connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
