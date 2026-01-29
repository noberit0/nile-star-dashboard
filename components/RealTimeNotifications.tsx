'use client';

import { useEffect, useState } from 'react';
import { X, DollarSign, Ban } from 'lucide-react';
import { useWebSocket, playNotificationSound, showBrowserNotification } from '@/lib/websocket';

interface Notification {
  id: string;
  type: 'new_booking' | 'cancelled_booking' | 'payment_success';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

interface RealTimeNotificationsProps {
  onRefreshData?: () => void;
  onNewNotification?: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

export default function RealTimeNotifications({ onRefreshData, onNewNotification }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Keep max 10

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification
    showBrowserNotification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.type,
    });

    // Add to persistent notifications in header
    onNewNotification?.(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
    }, 10000);
  };

  const { isConnected } = useWebSocket({
    onNewBooking: (data) => {
      addNotification({
        type: 'new_booking',
        title: 'New Booking',
        message: `${data.passengerName} booked ${data.numberOfSeats} seat(s) on ${data.route}`,
        data,
      });
      onRefreshData?.();
    },
    onBookingCancelled: (data) => {
      addNotification({
        type: 'cancelled_booking',
        title: 'Booking Cancelled',
        message: `${data.passengerName} cancelled booking for ${data.route}`,
        data,
      });
      onRefreshData?.();
    },
    onPaymentSuccess: (data) => {
      addNotification({
        type: 'payment_success',
        title: 'Payment Received',
        message: `Payment confirmed for ${data.bookingReference} - UGX ${data.amount.toLocaleString()}`,
        data,
      });
      onRefreshData?.();
    },
    onDashboardRefresh: () => {
      onRefreshData?.();
    },
  });

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_booking':
        return <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>;
      case 'cancelled_booking':
        return <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Ban className="w-5 h-5 text-red-600" />
        </div>;
      case 'payment_success':
        return <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3 max-w-md">
      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 min-w-[320px] max-w-md animate-slide-in backdrop-blur-lg border border-gray-100"
        >
          <div className="flex items-start gap-3">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-gray-900">{notification.title}</h4>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
              <p className="text-xs text-gray-400">{formatTime(notification.timestamp)}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Sound Toggle (hidden for now, can be enabled later) */}
      {/* <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="px-3 py-2 bg-white rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {soundEnabled ? '🔔' : '🔕'} Sound {soundEnabled ? 'On' : 'Off'}
      </button> */}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
