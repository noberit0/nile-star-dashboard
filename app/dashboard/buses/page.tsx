'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, AlertCircle, ArrowLeft, Bus, Users, Calendar, Settings, CheckCircle, Package } from 'lucide-react';
import api from '@/lib/api';
import BusFormPanel, { BusFormData } from '@/components/BusFormPanel';

interface Bus {
  id: string;
  registrationNumber: string;
  fleetNumber: string | null;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  capacity: number;
  status: string;
  condition: string | null;
  lastServiceDate: string | null;
  nextServiceDate: string | null;
  features: string[] | null;
  notes: string | null;
  active: boolean;
  luggagePrice: number;
  maxExtraLuggage: number;
  createdAt: string;
  _count?: {
    schedules: number;
  };
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  const fetchBuses = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/operator/buses');
      setBuses(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch buses error:', err);
      setError(err.response?.data?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleCreateBus = async (busData: BusFormData) => {
    try {
      if (editingBus) {
        await api.put(`/operator/buses/${editingBus.id}`, busData);
      } else {
        await api.post('/operator/buses', busData);
      }
      await fetchBuses(true);
      setShowModal(false);
      setEditingBus(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBus(null);
  };

  const handleDeleteBus = async (id: string, registrationNumber: string, schedulesCount: number) => {
    if (schedulesCount > 0) {
      alert(`Cannot delete bus "${registrationNumber}" with ${schedulesCount} assigned schedule(s). Please remove bus from schedules first.`);
      return;
    }

    if (!confirm(`Delete bus "${registrationNumber}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/operator/buses/${id}`);
      await fetchBuses(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete bus');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#c4f464]/20 text-green-700">Active</span>;
      case 'maintenance':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#67e8f9]/20 text-cyan-700">Maintenance</span>;
      case 'inactive':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Inactive</span>;
      case 'retired':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Retired</span>;
      default:
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  // Calculate stats
  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => b.status === 'active').length;
  const maintenanceBuses = buses.filter(b => b.status === 'maintenance').length;

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Buses</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => fetchBuses()}
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
          <span className="text-sm font-medium">Back to Buses</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Bus className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h1>
              <p className="text-sm text-gray-500">
                {editingBus ? `Editing: ${editingBus.registrationNumber}` : 'Add a new bus to your fleet'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <BusFormPanel
            isOpen={showModal}
            onClose={handleCloseModal}
            onSubmit={handleCreateBus}
            mode={editingBus ? 'edit' : 'create'}
            initialData={editingBus ? {
              id: editingBus.id,
              registrationNumber: editingBus.registrationNumber,
              fleetNumber: editingBus.fleetNumber,
              type: editingBus.type,
              make: editingBus.make,
              model: editingBus.model,
              year: editingBus.year,
              capacity: editingBus.capacity,
              status: editingBus.status,
              condition: editingBus.condition,
              lastServiceDate: editingBus.lastServiceDate,
              nextServiceDate: editingBus.nextServiceDate,
              features: editingBus.features,
              notes: editingBus.notes,
              active: editingBus.active,
              luggagePrice: editingBus.luggagePrice,
              maxExtraLuggage: editingBus.maxExtraLuggage,
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
              <Bus className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bus Units</h1>
              <p className="text-sm text-gray-500">Manage your fleet of buses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBuses(true)}
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
              Add Bus
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalBuses}</p>
          <p className="text-sm text-gray-500 mb-2">Total Buses</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">All fleet</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#c4f464]/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{activeBuses}</p>
          <p className="text-sm text-gray-500 mb-2">Active Buses</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs text-gray-400">In operation</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#67e8f9]/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{maintenanceBuses}</p>
          <p className="text-sm text-gray-500 mb-2">Under Maintenance</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <p className="text-xs text-gray-400">Being serviced</p>
          </div>
        </div>
      </div>

      {/* Buses List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-full w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : buses.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#8a6ae8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="w-10 h-10 text-[#8a6ae8]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No buses yet</h3>
            <p className="text-gray-500 mb-6">
              Add your first bus to start managing your fleet.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Bus
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#8a6ae8]/20 transition-all duration-200"
            >
              {/* Header Row - Bus Number & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#8a6ae8]">
                    {bus.registrationNumber}
                  </h3>
                  {getStatusBadge(bus.status)}
                  {bus.fleetNumber && (
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#8a6ae8]/10 text-[#8a6ae8]">
                      {bus.fleetNumber}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBus(bus)}
                    className="w-9 h-9 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center hover:bg-[#8a6ae8]/20 transition-colors"
                    title="Edit bus"
                  >
                    <Edit className="w-4 h-4 text-[#8a6ae8]" />
                  </button>
                  <button
                    onClick={() => handleDeleteBus(bus.id, bus.registrationNumber, bus._count?.schedules || 0)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"
                    title="Delete bus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bus Type & Model */}
              <div className="text-base font-medium text-gray-700 mb-6">
                {bus.type}
                {(bus.make || bus.model) && (
                  <span className="text-gray-400">
                    {' '}- {[bus.make, bus.model, bus.year].filter(Boolean).join(' ')}
                  </span>
                )}
              </div>

              {/* Details Grid - Two Columns */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Capacity</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold">{bus.capacity} seats</div>
                  </div>

                  {bus.condition && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Condition</span>
                      </div>
                      <div className="text-sm text-gray-900 capitalize">{bus.condition.replace('_', ' ')}</div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {bus._count && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Schedules</span>
                      </div>
                      <div className="text-sm text-gray-900 font-semibold">
                        {bus._count.schedules} {bus._count.schedules === 1 ? 'schedule' : 'schedules'}
                      </div>
                    </div>
                  )}

                  {bus.nextServiceDate && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Settings className="w-4 h-4" />
                        <span className="font-medium">Next Service</span>
                      </div>
                      <div className="text-sm text-gray-900">
                        {new Date(bus.nextServiceDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Luggage Info */}
              {bus.luggagePrice > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs text-gray-500">Extra Luggage:</span>
                      <span className="text-xs font-semibold text-gray-700">
                        UGX {bus.luggagePrice.toLocaleString()} / item
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Max: <span className="font-semibold text-gray-700">{bus.maxExtraLuggage} items</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              {bus.features && bus.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {bus.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#8a6ae8]/10 text-[#8a6ae8] text-xs font-semibold rounded-full">
                        {feature}
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
