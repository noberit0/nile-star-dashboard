'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RealTimeNotifications from '@/components/RealTimeNotifications';
import CompleteProfileModal from '@/components/CompleteProfileModal';
import type { NotificationItem } from '@/components/NotificationDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [refreshKey, setRefreshKey] = useState(0);
  const [persistentNotifications, setPersistentNotifications] = useState<NotificationItem[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if operator profile is complete (has fullName)
    const operatorData = localStorage.getItem('operator');
    if (operatorData) {
      try {
        const operator = JSON.parse(operatorData);
        if (!operator.fullName || operator.fullName.trim() === '') {
          setShowProfileModal(true);
        }
      } catch (e) {
        console.error('Failed to parse operator data:', e);
      }
    }

    // Load notifications from localStorage on mount
    const saved = localStorage.getItem('dashboard_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPersistentNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }, [router]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (persistentNotifications.length > 0) {
      localStorage.setItem('dashboard_notifications', JSON.stringify(persistentNotifications));
    }
  }, [persistentNotifications]);

  const handleRefreshData = useCallback(() => {
    // Trigger a re-render by updating the key
    setRefreshKey((prev) => prev + 1);

    // Dispatch custom event that pages can listen to
    window.dispatchEvent(new CustomEvent('refresh-dashboard-data'));
  }, []);

  const handleNewNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setPersistentNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    setPersistentNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setPersistentNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setPersistentNotifications([]);
    localStorage.removeItem('dashboard_notifications');
  }, []);

  const handleProfileComplete = useCallback((name: string) => {
    setShowProfileModal(false);
    // Trigger a refresh to update the sidebar with the new name
    window.dispatchEvent(new CustomEvent('profile-updated'));
    // Force page reload to ensure sidebar picks up the new name
    window.location.reload();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 bg-[#f5f6fa]" key={refreshKey}>
          {children}
        </main>
      </div>

      {/* Real-time notifications overlay */}
      <RealTimeNotifications
        onRefreshData={handleRefreshData}
        onNewNotification={handleNewNotification}
      />

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={showProfileModal}
        onComplete={handleProfileComplete}
      />
    </div>
  );
}
