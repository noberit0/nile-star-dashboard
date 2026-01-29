'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, RefreshCw, Edit, Trash2, AlertCircle, ArrowLeft, Clock, Calendar as CalendarIcon, Bell } from 'lucide-react';
import api from '@/lib/api';
import ScheduleFormPanel, { ScheduleFormData } from '@/components/ScheduleFormPanel';

interface Schedule {
  id: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: string[];
  busCapacity: number;
  busNumber: string;
  active: boolean;
  createdAt: string;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

const DAYS_MAP: { [key: string]: string } = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun',
};

export default function SchedulesPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const fetchRouteAndSchedules = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch route details
      const routeResponse = await api.get(`/operator/routes/${routeId}`);
      setRoute(routeResponse.data.data);

      // Fetch schedules for this route
      const schedulesResponse = await api.get(`/operator/routes/${routeId}/schedules`);
      setSchedules(schedulesResponse.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRouteAndSchedules();
  }, [routeId]);

  const handleCreateSchedule = async (scheduleData: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        // Update existing schedule
        await api.put(`/operator/schedules/${editingSchedule.id}`, scheduleData);
      } else {
        // Create new schedule
        await api.post('/operator/schedules', scheduleData);
      }
      await fetchRouteAndSchedules(true);
      setShowModal(false);
      setEditingSchedule(null);
    } catch (err: any) {
      throw err; // Re-throw to let form handle the error
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async (id: string, departureTime: string) => {
    if (!confirm(`Delete schedule departing at ${departureTime}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/operator/schedules/${id}`);
      await fetchRouteAndSchedules(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const formatTime = (time: string) => {
    // Convert 24h format to 12h with AM/PM
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
    return days.map(day => DAYS_MAP[day] || day).join(', ');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Schedules</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => fetchRouteAndSchedules()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If form is open, show only the form (full-page view with custom header)
  if (showModal) {
    return (
      <div className="fixed inset-0 left-64 z-50 bg-white flex flex-col">
        {/* Custom header for form view with back button */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Schedules</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{new Date().getFullYear()}</span>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-hidden">
          <ScheduleFormPanel
            isOpen={showModal}
            onClose={handleCloseModal}
            onSubmit={handleCreateSchedule}
            routeId={routeId}
            mode={editingSchedule ? 'edit' : 'create'}
            initialData={editingSchedule ? {
              id: editingSchedule.id,
              routeId: editingSchedule.routeId,
              departureTime: editingSchedule.departureTime,
              arrivalTime: editingSchedule.arrivalTime,
              daysOfWeek: editingSchedule.daysOfWeek,
              busCapacity: editingSchedule.busCapacity,
              busNumber: editingSchedule.busNumber,
              active: editingSchedule.active,
            } : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/dashboard/routes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : route?.name || 'Route Schedules'}
          </h1>
          {route && (
            <p className="text-sm text-gray-500 mt-1">
              {route.origin} → {route.destination}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRouteAndSchedules(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-20 bg-gray-200 rounded" />
                  <div className="h-10 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first schedule to define departure times for this route.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatTime(schedule.departureTime)}
                      </h3>
                    </div>
                    {schedule.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDays(schedule.daysOfWeek)}
                    </span>
                    <span className="flex items-center gap-1">
                      🚌 Bus {schedule.busNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      💺 {schedule.busCapacity} seats
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ Arrives {formatTime(schedule.arrivalTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit schedule"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id, schedule.departureTime)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
