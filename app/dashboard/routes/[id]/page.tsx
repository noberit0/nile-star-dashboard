'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, AlertCircle, RefreshCw, Plus, Clock, MapPin, DollarSign, Calendar, Bus } from 'lucide-react';
import api from '@/lib/api';

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: string[];
  busNumber: string;
  busCapacity: number;
  active: boolean;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: Array<{ name: string; order: number; fareFromOrigin: number }>;
  baseFare: number;
  estimatedDuration: number;
  active: boolean;
}

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRouteDetails = async () => {
    setLoading(true);
    try {
      const routeResponse = await api.get(`/operator/routes/${routeId}`);
      setRoute(routeResponse.data.data);

      const schedulesResponse = await api.get(`/operator/routes/${routeId}/schedules`);
      setSchedules(schedulesResponse.data.data);

      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteDetails();
  }, [routeId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
      return 'Weekends';
    }
    const dayMap: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun',
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Route</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={fetchRouteDetails}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-100 rounded-3xl" />
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

  if (!route) return null;

  const totalSchedules = schedules.length;
  const activeSchedules = schedules.filter(s => s.active).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/routes')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8a6ae8] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Routes</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{route.name}</h1>
              <p className="text-sm text-gray-500">{route.origin} → {route.destination}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {route.active ? (
              <span className="px-2.5 py-1 bg-[#c4f464]/20 text-green-700 text-xs font-medium rounded-full">Active</span>
            ) : (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Inactive</span>
            )}
            <button
              onClick={() => router.push(`/dashboard/routes/${routeId}/schedules`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Manage Schedules
            </button>
            <button
              onClick={() => router.push('/dashboard/routes')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Route
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalSchedules}</p>
          <p className="text-sm text-gray-500 mb-2">Total Schedules</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">All schedules</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{activeSchedules}</p>
          <p className="text-sm text-gray-500 mb-2">Active Schedules</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Currently running</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{route.stops.length}</p>
          <p className="text-sm text-gray-500 mb-2">Stops</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Along route</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(route.baseFare)}</p>
          <p className="text-sm text-gray-500 mb-2">Base Fare</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Full route</p>
          </div>
        </div>
      </div>

      {/* Schedules Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Schedule Details</h2>
              <p className="text-xs text-gray-500">Departure times and bus assignments</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/routes/${routeId}/schedules`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No schedules yet</h3>
            <p className="text-sm text-gray-500 mb-5">Create your first schedule for this route.</p>
            <button
              onClick={() => router.push(`/dashboard/routes/${routeId}/schedules`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-[#8a6ae8]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-[#8a6ae8]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#8a6ae8]">
                            {schedule.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatTime(schedule.departureTime)} departure
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {route.origin} → {route.destination}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {route.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.busNumber}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatDays(schedule.daysOfWeek)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.busCapacity} seats
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {schedule.active ? (
                        <span className="px-2.5 py-1 bg-[#c4f464]/20 text-green-700 text-xs font-medium rounded-full">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stops Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Route Stops & Fares</h2>
              <p className="text-xs text-gray-500">Boarding points and fare structure</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fare from Origin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {route.stops.map((stop, index) => (
                <tr key={index} className="hover:bg-[#8a6ae8]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8a6ae8]/10 text-[#8a6ae8] font-semibold text-sm">
                      {stop.order}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{stop.name}</span>
                      {index === 0 && (
                        <span className="px-2.5 py-1 bg-[#c4f464]/20 text-green-700 text-xs font-medium rounded-full">
                          Origin
                        </span>
                      )}
                      {index === route.stops.length - 1 && (
                        <span className="px-2.5 py-1 bg-[#8a6ae8]/10 text-[#8a6ae8] text-xs font-medium rounded-full">
                          Destination
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(stop.fareFromOrigin)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">
                      {index === 0 ? 'Boarding point' : index === route.stops.length - 1 ? 'Final stop' : 'Transit point'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
