'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Bus,
  Users,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import RecentBookingsTable from '@/components/RecentBookingsTable';
import { DashboardStats, SetupStatus, Operator, TodaysTripsData } from '@/types';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [todaysTrips, setTodaysTrips] = useState<TodaysTripsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch dashboard summary, setup status, and today's trips in parallel
      const [summaryResponse, setupResponse, tripsResponse] = await Promise.all([
        api.get('/operator/dashboard/summary'),
        api.get('/operator/dashboard/setup-status'),
        api.get('/operator/dashboard/todays-trips').catch(() => ({ data: { data: null } })),
      ]);

      setDashboardData(summaryResponse.data.data);
      setSetupStatus(setupResponse.data.data);
      setTodaysTrips(tripsResponse.data?.data || null);
      setError(null);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);

      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('operator');
        router.push('/login');
        return;
      } else {
        setToast({
          message: err.response?.data?.message || 'Failed to load dashboard data',
          type: 'error'
        });
        setTimeout(() => setToast(null), 5000);
      }

      if (!dashboardData && !isRefresh) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const operatorData = localStorage.getItem('operator');
    if (operatorData) {
      setOperator(JSON.parse(operatorData));
    }

    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const value = amount ?? 0;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K UGX`;
    }
    return `${value.toLocaleString('en-UG')} UGX`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/dashboard/bookings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50/80 backdrop-blur-sm rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-8 text-center max-w-md mx-auto mt-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-green-50 border-green-200 text-green-900'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left - Branding & Date */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8a6ae8] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Nile Star Coaches</h1>
                <p className="text-sm text-gray-500">Today&apos;s Overview</p>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-200" />

            <div className="hidden md:flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{new Date().getDate()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-200" />

            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                Welcome back, {operator?.fullName?.split(' ')[0] || 'Operator'}!
              </p>
            </div>
          </div>

          {/* Right - Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] focus:bg-white w-48"
              />
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a6ae8] to-[#6b4fcf] flex items-center justify-center text-white font-semibold">
                {operator?.companyName?.charAt(0) || operator?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{operator?.companyName || operator?.fullName || 'Operator'}</p>
                <p className="text-xs text-gray-500">{operator?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Section - Show only if setup incomplete */}
      {setupStatus && !setupStatus.setupComplete && (
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <AlertCircle className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-2">Complete Your Setup</h3>
              <p className="text-blue-700 mb-6">
                Get started by completing these steps to make your dashboard fully functional.
              </p>
              <div className="space-y-3">
                {!setupStatus.hasRoutes && (
                  <Link
                    href="/dashboard/routes/create"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Create your first route</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 ml-auto" />
                  </Link>
                )}
                {!setupStatus.hasSchedules && setupStatus.hasRoutes && (
                  <Link
                    href="/dashboard/schedules/create"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Add schedules to your routes</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 ml-auto" />
                  </Link>
                )}
                {setupStatus.hasRoutes && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Routes created ({setupStatus.routesCount})</span>
                  </div>
                )}
                {setupStatus.hasSchedules && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Schedules added ({setupStatus.schedulesCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Today's Revenue"
          value={dashboardData ? formatCurrency(dashboardData.today.revenue) : '0 UGX'}
          icon={DollarSign}
          iconColor="text-[#8a6ae8]"
          subtext={dashboardData ? `${dashboardData.today.confirmedBookings} paid bookings` : undefined}
          href="/dashboard/finance"
          loading={loading}
        />
        <StatsCard
          title="Today's Bookings"
          value={dashboardData?.today.bookings || 0}
          icon={Calendar}
          iconColor="text-[#8a6ae8]"
          subtext={dashboardData ? `${dashboardData.today.pendingPayments} pending payment` : undefined}
          href="/dashboard/bookings"
          loading={loading}
        />
        <StatsCard
          title="Today's Trips"
          value={todaysTrips?.summary.totalTrips || 0}
          icon={Bus}
          iconColor="text-[#8a6ae8]"
          subtext={todaysTrips ? `${todaysTrips.summary.fullTrips} full` : 'Active schedules'}
          href="/dashboard/schedules"
          loading={loading}
        />
        <StatsCard
          title="Seat Occupancy"
          value={`${todaysTrips?.summary.overallOccupancy || 0}%`}
          icon={Users}
          iconColor="text-[#8a6ae8]"
          subtext={todaysTrips ? `${todaysTrips.summary.totalBooked}/${todaysTrips.summary.totalCapacity} seats` : undefined}
          loading={loading}
        />
      </div>

      {/* Today's Trips Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Trips</h3>
              <p className="text-sm text-gray-500">Departures scheduled for today</p>
            </div>
          </div>
          <Link
            href="/dashboard/schedules"
            className="text-sm text-[#8a6ae8] hover:text-[#7a5ad8] font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : todaysTrips && todaysTrips.trips.length > 0 ? (
          <div className="space-y-3">
            {todaysTrips.trips.slice(0, 5).map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <p className="text-lg font-bold text-gray-900">{trip.departureTime}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {trip.route.origin} → {trip.route.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.bus?.plateNumber || 'No bus assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.bookedSeats}/{trip.capacity} seats
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            trip.occupancyPercent >= 90
                              ? 'bg-green-500'
                              : trip.occupancyPercent >= 60
                              ? 'bg-[#8a6ae8]'
                              : trip.occupancyPercent >= 30
                              ? 'bg-yellow-500'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${trip.occupancyPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{trip.occupancyPercent}%</span>
                    </div>
                  </div>
                  {trip.isFull && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      FULL
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-gray-400">
            <Bus className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No trips scheduled for today</p>
            <Link
              href="/dashboard/schedules/create"
              className="mt-3 text-sm text-[#8a6ae8] hover:text-[#7a5ad8] font-medium"
            >
              Create a schedule
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          href="/dashboard/bookings"
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#8a6ae8]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
            <p className="text-sm text-gray-500">View all bookings & passengers</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          href="/dashboard/finance"
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#8a6ae8]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Finance & Revenue</h3>
            <p className="text-sm text-gray-500">Track earnings & payments</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link
          href="/dashboard/routes"
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <Bus className="w-5 h-5 text-[#8a6ae8]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Routes & Schedules</h3>
            <p className="text-sm text-gray-500">Manage your bus routes</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Recent Bookings */}
      <RecentBookingsTable
        bookings={dashboardData?.recentBookings || []}
        loading={loading}
      />
    </div>
  );
}
