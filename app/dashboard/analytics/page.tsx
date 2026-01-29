'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Calendar,
  Bus,
  Route as RouteIcon,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Clock,
  Users,
} from 'lucide-react';
import api from '@/lib/api';

interface OverviewStats {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    todayBookings: number;
    activeRoutes: number;
    activeBuses: number;
    activeSchedules: number;
  };
  growth: {
    bookings: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    revenue: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  paymentStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
  bookingStatus: {
    confirmed: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
}

interface RoutePerformance {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  totalBookings: number;
  paidBookings: number;
  revenue: number;
  averageOccupancy: number;
  totalSeats: number;
  bookedSeats: number;
}

interface BookingPattern {
  byDayOfWeek: Array<{ day: string; count: number }>;
  byHourOfDay: Array<{ hour: number; count: number }>;
  peak: {
    hour: { hour: number; count: number };
    day: { day: string; count: number };
  };
}

interface OccupancyStats {
  totalCapacity: number;
  bookedSeats: number;
  emptySeats: number;
  occupancyRate: number;
  utilization: {
    excellent: boolean;
    good: boolean;
    fair: boolean;
    poor: boolean;
  };
}

export default function AnalyticsPage() {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [routePerformance, setRoutePerformance] = useState<RoutePerformance[]>([]);
  const [bookingPatterns, setBookingPatterns] = useState<BookingPattern | null>(null);
  const [occupancyStats, setOccupancyStats] = useState<OccupancyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overview, performance, patterns, occupancy] = await Promise.all([
        api.get('/operator/analytics/overview'),
        api.get('/operator/analytics/route-performance'),
        api.get('/operator/analytics/booking-patterns'),
        api.get('/operator/analytics/occupancy'),
      ]);

      setOverviewStats(overview.data.data);
      setRoutePerformance(performance.data.data);
      setBookingPatterns(patterns.data.data);
      setOccupancyStats(occupancy.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading || !overviewStats) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded-xl w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Analytics & Reports</h1>
              <p className="text-sm text-gray-500">Comprehensive business insights</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            {overviewStats.growth.bookings.growth !== 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  overviewStats.growth.bookings.growth >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {overviewStats.growth.bookings.growth >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {formatPercentage(Math.abs(overviewStats.growth.bookings.growth))}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{overviewStats.overview.totalBookings}</p>
          <p className="text-sm text-gray-500 mb-2">Total Bookings</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Today: {overviewStats.overview.todayBookings}</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            {overviewStats.growth.revenue.growth !== 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  overviewStats.growth.revenue.growth >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {overviewStats.growth.revenue.growth >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {formatPercentage(Math.abs(overviewStats.growth.revenue.growth))}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(overviewStats.overview.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">This month: {formatCurrency(overviewStats.growth.revenue.thisMonth)}</p>
          </div>
        </div>

        {/* Active Routes */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <RouteIcon className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{overviewStats.overview.activeRoutes}</p>
          <p className="text-sm text-gray-500 mb-2">Active Routes</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">{overviewStats.overview.activeSchedules} schedules</p>
          </div>
        </div>

        {/* Active Buses */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{overviewStats.overview.activeBuses}</p>
          <p className="text-sm text-gray-500 mb-2">Active Buses</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Fleet operational</p>
          </div>
        </div>
      </div>

      {/* Payment & Booking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Payment Status */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Payment Status</h3>
              <p className="text-xs text-gray-500">Payment distribution overview</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#c4f464]" />
                <span className="text-sm text-gray-600">Paid</span>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900">{overviewStats.paymentStatus.paid}</p>
                <p className="text-xs text-gray-500">
                  {overviewStats.overview.totalBookings > 0
                    ? ((overviewStats.paymentStatus.paid / overviewStats.overview.totalBookings) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#67e8f9]" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900">{overviewStats.paymentStatus.pending}</p>
                <p className="text-xs text-gray-500">
                  {overviewStats.overview.totalBookings > 0
                    ? ((overviewStats.paymentStatus.pending / overviewStats.overview.totalBookings) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#e5e7eb]" />
                <span className="text-sm text-gray-600">Failed</span>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900">{overviewStats.paymentStatus.failed}</p>
                <p className="text-xs text-gray-500">
                  {overviewStats.overview.totalBookings > 0
                    ? ((overviewStats.paymentStatus.failed / overviewStats.overview.totalBookings) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Booking Status</h3>
              <p className="text-xs text-gray-500">Booking state breakdown</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#8a6ae8]" />
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{overviewStats.bookingStatus.confirmed}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#67e8f9]" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{overviewStats.bookingStatus.pending}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#c4f464]" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{overviewStats.bookingStatus.completed}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-[#e5e7eb]" />
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{overviewStats.bookingStatus.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Stats */}
      {occupancyStats && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
                <p className="text-sm text-gray-500">Seat utilization metrics</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{occupancyStats.occupancyRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
                <span className="text-xs text-gray-400">Current rate</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{occupancyStats.totalCapacity}</p>
            </div>
            <div className="bg-[#8a6ae8]/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Booked Seats</p>
              <p className="text-2xl font-bold text-[#8a6ae8]">{occupancyStats.bookedSeats}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Empty Seats</p>
              <p className="text-2xl font-bold text-gray-500">{occupancyStats.emptySeats}</p>
            </div>
            <div className="bg-[#8a6ae8]/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Occupancy Rate</p>
              <p className="text-2xl font-bold text-[#8a6ae8]">{occupancyStats.occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-[#8a6ae8]"
              style={{ width: `${occupancyStats.occupancyRate}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">
              {occupancyStats.utilization.excellent
                ? 'Excellent utilization'
                : occupancyStats.utilization.good
                ? 'Good utilization'
                : occupancyStats.utilization.fair
                ? 'Fair utilization'
                : 'Poor utilization'}
            </p>
          </div>
        </div>
      )}

      {/* Route Performance Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <RouteIcon className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Route Performance</h3>
              <p className="text-sm text-gray-500">Top performing routes</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#8a6ae8] hover:bg-[#8a6ae8]/5 transition-colors group">
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a6ae8] transition-colors" />
          </button>
        </div>
        {routePerformance.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <RouteIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No route performance data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {routePerformance.slice(0, 10).map((route) => (
                  <tr key={route.routeId} className="hover:bg-[#8a6ae8]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{route.routeName}</div>
                      <div className="text-xs text-gray-500">{route.origin} → {route.destination}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{route.totalBookings}</div>
                      <div className="text-xs text-gray-500">{route.paidBookings} paid</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(route.revenue)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{route.bookedSeats} / {route.totalSeats}</div>
                      <div className="text-xs text-gray-500">seats</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-20">
                          <div
                            className={`h-2 rounded-full ${
                              route.averageOccupancy >= 80
                                ? 'bg-green-500'
                                : route.averageOccupancy >= 60
                                ? 'bg-blue-500'
                                : route.averageOccupancy >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${route.averageOccupancy}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{route.averageOccupancy.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Patterns */}
      {bookingPatterns && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak Booking Days */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Bookings by Day</h3>
                <p className="text-xs text-gray-500">Weekly distribution</p>
              </div>
            </div>
            <div className="space-y-3">
              {bookingPatterns.byDayOfWeek.map((day, index) => {
                const maxCount = Math.max(...bookingPatterns.byDayOfWeek.map((d) => d.count));
                const widthPercentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 w-20">{day.day}</span>
                      <span className="text-xs font-medium text-gray-700">{day.count}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8a6ae8] rounded-full"
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 p-4 bg-[#8a6ae8]/10 rounded-2xl">
              <p className="text-xs font-medium text-[#8a6ae8] mb-1">Peak Day</p>
              <p className="text-lg font-bold text-[#8a6ae8]">{bookingPatterns.peak.day.day}</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
                <p className="text-xs text-[#8a6ae8]/70">{bookingPatterns.peak.day.count} bookings</p>
              </div>
            </div>
          </div>

          {/* Peak Booking Hours */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Bookings by Hour</h3>
                <p className="text-xs text-gray-500">Hourly distribution</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {bookingPatterns.byHourOfDay
                .filter((hour) => hour.count > 0)
                .map((hour, index) => {
                  const maxCount = Math.max(...bookingPatterns.byHourOfDay.map((h) => h.count));
                  const widthPercentage = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 w-16">{hour.hour.toString().padStart(2, '0')}:00</span>
                        <span className="text-xs font-medium text-gray-700">{hour.count}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8a6ae8] rounded-full"
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-5 p-4 bg-[#8a6ae8]/10 rounded-2xl">
              <p className="text-xs font-medium text-[#8a6ae8] mb-1">Peak Hour</p>
              <p className="text-lg font-bold text-[#8a6ae8]">{bookingPatterns.peak.hour.hour.toString().padStart(2, '0')}:00</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
                <p className="text-xs text-[#8a6ae8]/70">{bookingPatterns.peak.hour.count} bookings</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
