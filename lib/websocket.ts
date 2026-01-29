'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketEvent {
  type: string;
  timestamp: string;
  data: any;
}

interface UseWebSocketOptions {
  onNewBooking?: (data: any) => void;
  onBookingCancelled?: (data: any) => void;
  onPaymentSuccess?: (data: any) => void;
  onPaymentStatusChanged?: (data: any) => void;
  onDashboardRefresh?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Prevent multiple connections
    if (socketRef.current) {
      return;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      console.warn('No authentication token found, skipping WebSocket connection');
      return;
    }

    // Get backend URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    console.log('🔌 Initializing WebSocket connection to:', backendUrl);

    // Create socket connection
    const socket = io(backendUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      optionsRef.current.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionError(error.message);
      optionsRef.current.onError?.(error);
    });

    // Booking events
    socket.on('booking:new', (event: WebSocketEvent) => {
      console.log('📢 New booking received:', event.data);
      optionsRef.current.onNewBooking?.(event.data);
    });

    socket.on('booking:cancelled', (event: WebSocketEvent) => {
      console.log('📢 Booking cancelled:', event.data);
      optionsRef.current.onBookingCancelled?.(event.data);
    });

    // Payment events
    socket.on('payment:success', (event: WebSocketEvent) => {
      console.log('📢 Payment successful:', event.data);
      optionsRef.current.onPaymentSuccess?.(event.data);
    });

    socket.on('payment:status_changed', (event: WebSocketEvent) => {
      console.log('📢 Payment status changed:', event.data);
      optionsRef.current.onPaymentStatusChanged?.(event.data);
    });

    // Dashboard events
    socket.on('dashboard:refresh', (event: WebSocketEvent) => {
      console.log('📢 Dashboard refresh triggered');
      optionsRef.current.onDashboardRefresh?.();
    });

    // Heartbeat
    socket.on('pong', () => {
      // console.log('💓 Pong received');
    });

    // Send periodic ping
    pingIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
}

// Notification sound utility
export function playNotificationSound() {
  if (typeof window !== 'undefined' && window.Audio) {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
}

// Browser notification utility
export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}
