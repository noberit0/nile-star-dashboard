'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

interface RouteStop {
  name: string;
  order: number;
  fareFromOrigin: number;
}

interface RouteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: RouteFormData) => Promise<void>;
}

export interface RouteFormData {
  name?: string;
  origin: string;
  destination: string;
  stops: RouteStop[];
  baseFare: number;
  estimatedDuration: number;
}

export default function RouteFormModal({ isOpen, onClose, onSubmit }: RouteFormModalProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    origin: '',
    destination: '',
    stops: [],
    baseFare: 0,
    estimatedDuration: 0,
  });

  const [stops, setStops] = useState<RouteStop[]>([
    { name: '', order: 0, fareFromOrigin: 0 },
    { name: '', order: 1, fareFromOrigin: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        origin: '',
        destination: '',
        stops: [],
        baseFare: 0,
        estimatedDuration: 0,
      });
      setStops([
        { name: '', order: 0, fareFromOrigin: 0 },
        { name: '', order: 1, fareFromOrigin: 0 },
      ]);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  // Auto-populate first and last stop names from origin/destination
  useEffect(() => {
    if (formData.origin && stops.length > 0) {
      setStops(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], name: formData.origin };
        return updated;
      });
    }
  }, [formData.origin]);

  useEffect(() => {
    if (formData.destination && stops.length > 0) {
      setStops(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], name: formData.destination };
        return updated;
      });
    }
  }, [formData.destination]);

  const handleAddStop = () => {
    const newOrder = stops.length;
    const lastStop = stops[stops.length - 1];

    // Insert new stop before the last one (destination)
    const updatedStops = [
      ...stops.slice(0, -1),
      { name: '', order: newOrder - 1, fareFromOrigin: 0 },
      { ...lastStop, order: newOrder },
    ];

    setStops(updatedStops);
  };

  const handleRemoveStop = (index: number) => {
    // Don't allow removing first or last stop
    if (index === 0 || index === stops.length - 1) {
      return;
    }

    const updatedStops = stops
      .filter((_, i) => i !== index)
      .map((stop, i) => ({ ...stop, order: i }));

    setStops(updatedStops);
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    // Don't allow moving first or last stop
    if (index === 0 || index === stops.length - 1) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Don't move into first or last position
    if (newIndex === 0 || newIndex === stops.length - 1) {
      return;
    }

    const updatedStops = [...stops];
    [updatedStops[index], updatedStops[newIndex]] = [updatedStops[newIndex], updatedStops[index]];

    // Update order
    updatedStops.forEach((stop, i) => {
      stop.order = i;
    });

    setStops(updatedStops);
  };

  const handleStopChange = (index: number, field: keyof RouteStop, value: string | number) => {
    const updatedStops = [...stops];
    updatedStops[index] = {
      ...updatedStops[index],
      [field]: value,
    };
    setStops(updatedStops);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (formData.baseFare <= 0) {
      newErrors.baseFare = 'Base fare must be greater than 0';
    }

    if (formData.estimatedDuration < 0) {
      newErrors.estimatedDuration = 'Duration cannot be negative';
    }

    // Validate stops
    stops.forEach((stop, index) => {
      if (!stop.name.trim()) {
        newErrors[`stop_${index}_name`] = 'Stop name is required';
      }

      if (stop.fareFromOrigin < 0) {
        newErrors[`stop_${index}_fare`] = 'Fare cannot be negative';
      }

      // Check if fares are in increasing order
      if (index > 0 && stop.fareFromOrigin < stops[index - 1].fareFromOrigin) {
        newErrors[`stop_${index}_fare`] = 'Fare must be greater than previous stop';
      }
    });

    // Check if last stop fare matches base fare
    const lastStop = stops[stops.length - 1];
    if (lastStop.fareFromOrigin !== formData.baseFare) {
      newErrors.baseFare = 'Base fare must equal final stop fare';
      newErrors[`stop_${stops.length - 1}_fare`] = 'Final stop fare must equal base fare';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        stops,
      });
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to create route',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Route</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Route Name (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kampala Express"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from origin and destination
                </p>
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="e.g., Kampala"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.origin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.origin && (
                  <p className="text-xs text-red-600 mt-1">{errors.origin}</p>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Mbarara"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.destination && (
                  <p className="text-xs text-red-600 mt-1">{errors.destination}</p>
                )}
              </div>

              {/* Base Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Fare (UGX) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.baseFare || ''}
                  onChange={(e) => setFormData({ ...formData, baseFare: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25000"
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.baseFare ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.baseFare && (
                  <p className="text-xs text-red-600 mt-1">{errors.baseFare}</p>
                )}
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 180"
                  min="0"
                  step="15"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.estimatedDuration && (
                  <p className="text-xs text-red-600 mt-1">{errors.estimatedDuration}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stops Management */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Route Stops</h3>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Stop
              </button>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === stops.length - 1;
                const isMiddle = !isFirst && !isLast;

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      isFirst || isLast ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Order Badge */}
                      <div className="flex flex-col items-center gap-1 pt-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isFirst ? 'bg-green-500 text-white' : isLast ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        {isMiddle && (
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'up')}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={index === 1}
                            >
                              <ArrowUp className="w-3 h-3 text-gray-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'down')}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={index === stops.length - 2}
                            >
                              <ArrowDown className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stop Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Stop Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Stop Name {isFirst && '(Origin)'} {isLast && '(Destination)'}
                          </label>
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                            placeholder={isFirst ? 'Origin' : isLast ? 'Destination' : 'e.g., Masaka'}
                            disabled={isFirst || isLast}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`stop_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                            } ${(isFirst || isLast) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            required
                          />
                          {errors[`stop_${index}_name`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`stop_${index}_name`]}</p>
                          )}
                        </div>

                        {/* Fare from Origin */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Fare from Origin (UGX)
                          </label>
                          <input
                            type="number"
                            value={stop.fareFromOrigin || ''}
                            onChange={(e) => handleStopChange(index, 'fareFromOrigin', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="1000"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`stop_${index}_fare`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors[`stop_${index}_fare`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`stop_${index}_fare`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      {isMiddle && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>💡 Tips:</strong> Fares must increase from origin to destination.
                The first stop (origin) typically has fare 0, and the last stop fare must equal the base fare.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Route...' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
