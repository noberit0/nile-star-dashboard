'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertCircle, MapPin, Clock, DollarSign } from 'lucide-react';

interface RouteStop {
  name: string;
  order: number;
  fareFromOrigin: number;
  time?: string; // Estimated arrival/pickup time at this stop (HH:MM format)
}

interface RouteFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: RouteFormData) => Promise<void>;
  mode?: 'create' | 'edit';
  initialData?: RouteFormData & { id?: string };
}

export interface RouteFormData {
  name?: string;
  origin: string;
  destination: string;
  stops: RouteStop[];
  baseFare: number;
  estimatedDuration: number;
  active?: boolean;
}

export default function RouteFormPanel({ isOpen, onClose, onSubmit, mode = 'create', initialData }: RouteFormPanelProps) {
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

  // Load initial data when opening in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        origin: initialData.origin,
        destination: initialData.destination,
        stops: initialData.stops,
        baseFare: initialData.baseFare,
        estimatedDuration: initialData.estimatedDuration,
        active: initialData.active,
      });
      setStops(initialData.stops);
    } else if (isOpen && mode === 'create') {
      // Reset for create mode
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
    }
  }, [isOpen, mode, initialData]);

  // Reset form when panel closes
  useEffect(() => {
    if (!isOpen) {
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

    const updatedStops = [
      ...stops.slice(0, -1),
      { name: '', order: newOrder - 1, fareFromOrigin: 0 },
      { ...lastStop, order: newOrder },
    ];

    setStops(updatedStops);
  };

  const handleRemoveStop = (index: number) => {
    if (index === 0 || index === stops.length - 1) {
      return;
    }

    const updatedStops = stops
      .filter((_, i) => i !== index)
      .map((stop, i) => ({ ...stop, order: i }));

    setStops(updatedStops);
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (index === 0 || index === stops.length - 1) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex === 0 || newIndex === stops.length - 1) {
      return;
    }

    const updatedStops = [...stops];
    [updatedStops[index], updatedStops[newIndex]] = [updatedStops[newIndex], updatedStops[index]];

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

    stops.forEach((stop, index) => {
      if (!stop.name.trim()) {
        newErrors[`stop_${index}_name`] = 'Stop name is required';
      }

      if (stop.fareFromOrigin < 0) {
        newErrors[`stop_${index}_fare`] = 'Fare cannot be negative';
      }

      if (index > 0 && stop.fareFromOrigin < stops[index - 1].fareFromOrigin) {
        newErrors[`stop_${index}_fare`] = 'Fare must be greater than previous stop';
      }

      // Validate time field
      if (!stop.time || !stop.time.trim()) {
        newErrors[`stop_${index}_time`] = 'Time is required';
      }

      // Validate time is later than previous stop
      if (index > 0 && stop.time && stops[index - 1]?.time) {
        const currentTime = stop.time.split(':').map(Number);
        const previousTime = stops[index - 1].time!.split(':').map(Number);
        const currentMinutes = currentTime[0] * 60 + currentTime[1];
        const previousMinutes = previousTime[0] * 60 + previousTime[1];

        if (currentMinutes <= previousMinutes) {
          newErrors[`stop_${index}_time`] = 'Time must be later than previous stop';
        }
      }
    });

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
    <div className="bg-white h-full flex flex-col">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 bg-red-50 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 pt-2">
                <h4 className="font-semibold text-red-900 text-sm">Error</h4>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="space-y-4">
              {/* Route Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kampala Express"
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2 ml-4">
                  Leave empty to auto-generate from origin and destination
                </p>
              </div>

              {/* Origin & Destination Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.origin
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                    required
                  />
                  {errors.origin && (
                    <p className="text-xs text-red-600 mt-2 ml-4">{errors.origin}</p>
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
                    className={`w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.destination
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                    required
                  />
                  {errors.destination && (
                    <p className="text-xs text-red-600 mt-2 ml-4">{errors.destination}</p>
                  )}
                </div>
              </div>

              {/* Fare & Duration Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base Fare */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Fare (UGX) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.baseFare || ''}
                      onChange={(e) => setFormData({ ...formData, baseFare: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 25000"
                      min="0"
                      step="1000"
                      className={`w-full pl-10 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.baseFare
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                      }`}
                      required
                    />
                  </div>
                  {errors.baseFare && (
                    <p className="text-xs text-red-600 mt-2 ml-4">{errors.baseFare}</p>
                  )}
                </div>

                {/* Estimated Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.estimatedDuration || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 180"
                      min="0"
                      step="15"
                      className={`w-full pl-10 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.estimatedDuration
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                      }`}
                    />
                  </div>
                  {errors.estimatedDuration && (
                    <p className="text-xs text-red-600 mt-2 ml-4">{errors.estimatedDuration}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Stops Management Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Route Stops</h3>
              </div>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#8a6ae8]/10 text-[#8a6ae8] rounded-full hover:bg-[#8a6ae8]/20 transition-colors text-sm font-medium"
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
                    className={`rounded-2xl p-4 ${
                      isFirst
                        ? 'bg-[#c4f464]/10 border border-[#c4f464]/30'
                        : isLast
                          ? 'bg-[#8a6ae8]/5 border border-[#8a6ae8]/20'
                          : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Order Badge */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          isFirst
                            ? 'bg-[#c4f464] text-green-800'
                            : isLast
                              ? 'bg-[#8a6ae8] text-white'
                              : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        {isMiddle && (
                          <div className="flex flex-col gap-0.5 mt-2">
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'up')}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                              disabled={index === 1}
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'down')}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                              disabled={index === stops.length - 2}
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stop Fields */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            isFirst
                              ? 'bg-[#c4f464]/30 text-green-800'
                              : isLast
                                ? 'bg-[#8a6ae8]/20 text-[#8a6ae8]'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isFirst ? 'Origin' : isLast ? 'Destination' : `Stop ${index}`}
                          </span>
                        </div>

                        {/* Stop Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Stop Name
                          </label>
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                            placeholder={isFirst ? 'Origin location' : isLast ? 'Destination location' : 'e.g., Masaka'}
                            disabled={isFirst || isLast}
                            className={`w-full px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 transition-colors ${
                              errors[`stop_${index}_name`]
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                            } ${(isFirst || isLast) ? 'bg-white/50 text-gray-500' : 'bg-white'}`}
                            required
                          />
                          {errors[`stop_${index}_name`] && (
                            <p className="text-xs text-red-600 mt-1.5 ml-4">{errors[`stop_${index}_name`]}</p>
                          )}
                        </div>

                        {/* Fare & Time Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Fare from Origin */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              Fare from Origin (UGX)
                            </label>
                            <input
                              type="number"
                              value={stop.fareFromOrigin || ''}
                              onChange={(e) => handleStopChange(index, 'fareFromOrigin', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              step="1000"
                              disabled={isFirst}
                              className={`w-full px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 transition-colors ${
                                errors[`stop_${index}_fare`]
                                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                  : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                              } ${isFirst ? 'bg-white/50 text-gray-500' : 'bg-white'}`}
                              required
                            />
                            {errors[`stop_${index}_fare`] && (
                              <p className="text-xs text-red-600 mt-1.5 ml-4">{errors[`stop_${index}_fare`]}</p>
                            )}
                          </div>

                          {/* Estimated Arrival/Pickup Time */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              {isFirst ? 'Departure Time' : 'Arrival Time'} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={stop.time || ''}
                              onChange={(e) => handleStopChange(index, 'time', e.target.value)}
                              className={`w-full px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 transition-colors bg-white ${
                                errors[`stop_${index}_time`]
                                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                  : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                              }`}
                              required
                            />
                            {errors[`stop_${index}_time`] && (
                              <p className="text-xs text-red-600 mt-1.5 ml-4">{errors[`stop_${index}_time`]}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      {isMiddle && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(index)}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors mt-7"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips Card */}
            <div className="mt-4 bg-[#67e8f9]/10 rounded-2xl p-4 border border-[#67e8f9]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#67e8f9]/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-cyan-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-cyan-800 mb-1">Tips for setting up stops</p>
                  <p className="text-xs text-cyan-700">
                    In Uganda, passengers pay the full fare before boarding. The origin stop fare is always 0 UGX.
                    Fares must increase for each subsequent stop, and the final stop fare must equal the base fare.
                    Each stop must have a pickup time later than the previous stop.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? mode === 'edit' ? 'Updating...' : 'Creating...'
                : mode === 'edit' ? 'Update Route' : 'Create Route'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
