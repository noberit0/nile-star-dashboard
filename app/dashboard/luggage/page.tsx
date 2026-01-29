'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Edit, Save, X, Package, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Bus {
  id: string;
  registrationNumber: string;
  fleetNumber: string | null;
  type: string;
  make: string | null;
  model: string | null;
  luggagePrice: number;
  maxExtraLuggage: number;
  status: string;
}

export default function LuggagePage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(60000);
  const [editMaxLuggage, setEditMaxLuggage] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  const fetchBuses = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Get operator ID from localStorage
      const operatorId = localStorage.getItem('operatorId') || 'default-operator-id';
      const response = await api.get(`/luggage/operators/${operatorId}/buses`);
      setBuses(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch buses luggage error:', err);
      setError(err.response?.data?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleEdit = (bus: Bus) => {
    setEditingBusId(bus.id);
    setEditPrice(bus.luggagePrice);
    setEditMaxLuggage(bus.maxExtraLuggage);
  };

  const handleCancel = () => {
    setEditingBusId(null);
    setEditPrice(60000);
    setEditMaxLuggage(5);
  };

  const handleSave = async (busId: string) => {
    setSaving(true);
    try {
      await api.put(`/luggage/buses/${busId}`, {
        luggagePrice: editPrice,
        maxExtraLuggage: editMaxLuggage,
      });

      // Update local state
      setBuses(buses.map(bus =>
        bus.id === busId
          ? { ...bus, luggagePrice: editPrice, maxExtraLuggage: editMaxLuggage }
          : bus
      ));

      setEditingBusId(null);
      setError(null);
    } catch (err: any) {
      console.error('Update luggage config error:', err);
      setError(err.response?.data?.message || 'Failed to update luggage configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Luggage Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure extra luggage pricing and limits for each bus
          </p>
        </div>
        <button
          onClick={() => fetchBuses(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Luggage Configuration</h3>
            <p className="text-sm text-blue-700 mt-1">
              Set the price for extra luggage (beyond the included allowance) and maximum number of extra luggage items per passenger. Changes will be reflected immediately in the customer app.
            </p>
          </div>
        </div>
      </div>

      {/* Buses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Luggage Price (UGX)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Extra Luggage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No buses found</p>
                  <p className="text-sm text-gray-400 mt-1">Add buses in the Buses section first</p>
                </td>
              </tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bus.registrationNumber}
                      </div>
                      {bus.fleetNumber && (
                        <div className="text-sm text-gray-500">
                          Fleet: {bus.fleetNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bus.type}</div>
                    {bus.make && bus.model && (
                      <div className="text-sm text-gray-500">
                        {bus.make} {bus.model}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingBusId === bus.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        min="0"
                        step="1000"
                        className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {bus.luggagePrice.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingBusId === bus.id ? (
                      <input
                        type="number"
                        value={editMaxLuggage}
                        onChange={(e) => setEditMaxLuggage(Number(e.target.value))}
                        min="0"
                        max="10"
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {bus.maxExtraLuggage} items
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingBusId === bus.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSave(bus.id)}
                          disabled={saving}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(bus)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
