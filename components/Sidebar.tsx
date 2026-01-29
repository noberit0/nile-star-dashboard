'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  Wallet,
  Ticket,
  Route,
  Bus,
  Settings,
  HelpCircle,
  LogOut,
  BarChart3,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Operator } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  section?: string;
}

const navItems: NavItem[] = [
  // REPORT Section
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'REPORT',
  },
  {
    label: 'Bookings',
    href: '/dashboard/bookings',
    icon: Ticket,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Finance',
    href: '/dashboard/finance',
    icon: Wallet,
  },

  // OPERATIONS Section
  {
    label: 'Routes',
    href: '/dashboard/routes',
    icon: Route,
    section: 'OPERATIONS',
  },
  {
    label: 'Bus Units',
    href: '/dashboard/buses',
    icon: Bus,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    label: 'Help Center',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const operatorData = localStorage.getItem('operator');
    if (operatorData) {
      setOperator(JSON.parse(operatorData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('operator');
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Get initials from operator name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col fixed left-0 top-0 border-r border-gray-100">
      {/* Logo Section */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#8a6ae8] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Nile Star</h1>
            <p className="text-xs text-gray-500">Coaches</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showSection = item.section && (index === 0 || navItems[index - 1]?.section !== item.section);

          return (
            <div key={item.href}>
              {showSection && (
                <div className="mt-5 mb-2 px-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {item.section}
                  </p>
                </div>
              )}
              <Link
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
                  active
                    ? 'bg-[#8a6ae8] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-[#8a6ae8]/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? 'bg-white/20'
                    : 'bg-gray-100 group-hover:bg-[#8a6ae8]/10'
                }`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500 group-hover:text-[#8a6ae8]'}`} />
                </div>
                <span className={`text-sm flex-1 ${active ? 'font-medium' : 'font-normal'}`}>{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 text-white/70" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="mb-2 px-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            SETTINGS
          </p>
        </div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
                active
                  ? 'bg-[#8a6ae8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#8a6ae8]/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                active
                  ? 'bg-white/20'
                  : 'bg-gray-100 group-hover:bg-[#8a6ae8]/10'
              }`}>
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500 group-hover:text-[#8a6ae8]'}`} />
              </div>
              <span className={`text-sm flex-1 ${active ? 'font-medium' : 'font-normal'}`}>{item.label}</span>
              {active && (
                <ChevronRight className="w-4 h-4 text-white/70" />
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setShowLogoutModal(true)}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-gray-600 hover:bg-red-50 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
          </div>
          <span className="text-sm font-normal group-hover:text-red-600">Logout</span>
        </button>
      </div>

      {/* User Profile Section */}
      {operator && (
        <div className="p-3">
          <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8a6ae8] to-[#6b4fcf] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">{getInitials(operator.fullName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{operator.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{operator.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal - Rendered via Portal */}
      {mounted && showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to log out? You will need to sign in again to access your dashboard.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
