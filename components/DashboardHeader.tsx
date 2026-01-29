'use client';

import { Calendar, ArrowLeft } from 'lucide-react';
import NotificationDropdown, { NotificationItem } from './NotificationDropdown';

interface DashboardHeaderProps {
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export default function DashboardHeader({
  showBackButton = false,
  backButtonLabel = 'Back',
  onBackClick,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearAll = () => {},
}: DashboardHeaderProps) {
  const currentYear = new Date().getFullYear();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-6">
      {/* Left Side - Back Button or Empty Space */}
      <div>
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{backButtonLabel}</span>
          </button>
        )}
      </div>

      {/* Right Side - Calendar/Year and Notification */}
      <div className="flex items-center gap-6">
        {/* Calendar/Year Display */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">{currentYear}</span>
        </div>

        {/* Notification Dropdown */}
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onClearAll={onClearAll}
        />
      </div>
    </header>
  );
}
