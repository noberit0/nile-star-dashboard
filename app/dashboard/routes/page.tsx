'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle, ArrowLeft, MapPin, Clock, DollarSign, Calendar } from 'lucide-react';
import api from '@/lib/api';
import RouteFormPanel, { RouteFormData } from '@/components/RouteFormPanel';

interface RouteStop {
  name: string;
  order: number;
  fareFromOrigin: number;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: RouteStop[];
  baseFare: number;
  estimatedDuration: number;
  active: boolean;
  schedulesCount: number;
  createdAt: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const fetchRoutes = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/operator/routes');
      setRoutes(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch routes error:', err);
      setError(err.response?.data?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateRoute = async (routeData: RouteFormData) => {
    try {
      if (editingRoute) {
        await api.put(`/operator/routes/${editingRoute.id}`, routeData);
      } else {
        await api.post('/operator/routes', routeData);
      }
      await fetchRoutes(true);
      setShowModal(false);
      setEditingRoute(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
  };

  const handleDeleteRoute = async (id: string, routeName: string, schedulesCount: number) => {
    if (schedulesCount > 0) {
      alert(`Cannot delete route "${routeName}" with ${schedulesCount} active schedule(s). Please delete schedules first.`);
      return;
    }

    if (!confirm(`Delete route "${routeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/operator/routes/${id}`);
      await fetchRoutes(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete route');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate stats
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(r => r.active).length;
  const inactiveRoutes = routes.filter(r => !r.active).length;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Routes</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => fetchRoutes()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If form is open, show only the form
  if (showModal) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleCloseModal}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8a6ae8] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Routes</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {editingRoute ? 'Edit Route' : 'Create New Route'}
              </h1>
              <p className="text-sm text-gray-500">
                {editingRoute ? `Editing: ${editingRoute.name}` : 'Add a new route to your network'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <RouteFormPanel
            isOpen={showModal}
            onClose={handleCloseModal}
            onSubmit={handleCreateRoute}
            mode={editingRoute ? 'edit' : 'create'}
            initialData={editingRoute ? {
              id: editingRoute.id,
              name: editingRoute.name,
              origin: editingRoute.origin,
              destination: editingRoute.destination,
              stops: editingRoute.stops,
              baseFare: editingRoute.baseFare,
              estimatedDuration: editingRoute.estimatedDuration,
              active: editingRoute.active,
            } : undefined}
          />
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
              <MapPin className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Routes Management</h1>
              <p className="text-sm text-gray-500">Manage your bus routes and schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRoutes(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Route
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalRoutes}</p>
          <p className="text-sm text-gray-500 mb-2">Total Routes</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">All routes</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{activeRoutes}</p>
          <p className="text-sm text-gray-500 mb-2">Active Routes</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Currently operating</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{inactiveRoutes}</p>
          <p className="text-sm text-gray-500 mb-2">Inactive Routes</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">Not operating</p>
          </div>
        </div>
      </div>

      {/* Routes List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-8 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-xl w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded-xl w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded-xl w-2/3" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                  <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#8a6ae8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-[#8a6ae8]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No routes yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first route to start accepting bookings.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8a6ae8] text-white rounded-xl hover:bg-[#7a5ad8] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create First Route
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-8 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => window.location.href = `/dashboard/routes/${route.id}`}
            >
              {/* Header Row - Route Name & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#8a6ae8]">
                    {route.name || `${route.origin} → ${route.destination}`}
                  </h3>
                  {route.active ? (
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 text-gray-600">Inactive</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEditRoute(route)}
                    className="p-2 text-gray-600 hover:bg-[#8a6ae8]/10 hover:text-[#8a6ae8] rounded-xl transition-all duration-200"
                    title="Edit route"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.location.href = `/dashboard/routes/${route.id}/schedules`}
                    className="p-2 text-gray-600 hover:bg-[#8a6ae8]/10 hover:text-[#8a6ae8] rounded-xl transition-all duration-200"
                    title="View schedules"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoute(route.id, route.name, route.schedulesCount)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="Delete route"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Route Path */}
              <div className="text-base font-medium text-gray-700 mb-6">
                {route.origin}
                <span className="text-gray-400 mx-2">→</span>
                {route.destination}
              </div>

              {/* Details Grid - Two Columns */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Base Fare</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">{formatCurrency(route.baseFare)}</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Duration</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">{formatDuration(route.estimatedDuration)}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Stops</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">{route.stops.length} stops</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Schedules</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">
                      {route.schedulesCount} {route.schedulesCount === 1 ? 'schedule' : 'schedules'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stops Preview */}
              {route.stops.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#8a6ae8]/10 text-[#8a6ae8] text-xs font-semibold rounded-xl">
                        {stop.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
