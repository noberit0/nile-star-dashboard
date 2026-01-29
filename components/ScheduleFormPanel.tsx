'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

export interface ScheduleFormData {
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: string[];
  busCapacity: number;
  busNumber: string;
  active: boolean;
}

interface ScheduleFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleData: ScheduleFormData) => Promise<void>;
  routeId: string;
  mode?: 'create' | 'edit';
  initialData?: ScheduleFormData & { id?: string };
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function ScheduleFormPanel({
  isOpen,
  onClose,
  onSubmit,
  routeId,
  mode = 'create',
  initialData,
}: ScheduleFormPanelProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    routeId,
    departureTime: '',
    arrivalTime: '',
    daysOfWeek: [],
    busCapacity: 67,
    busNumber: '',
    active: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data when opening in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        routeId: initialData.routeId,
        departureTime: initialData.departureTime,
        arrivalTime: initialData.arrivalTime,
        daysOfWeek: initialData.daysOfWeek,
        busCapacity: initialData.busCapacity,
        busNumber: initialData.busNumber,
        active: initialData.active,
      });
    } else if (isOpen && mode === 'create') {
      // Reset for create mode
      setFormData({
        routeId,
        departureTime: '',
        arrivalTime: '',
        daysOfWeek: [],
        busCapacity: 67,
        busNumber: '',
        active: true,
      });
    }
    setErrors({});
  }, [isOpen, mode, initialData, routeId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required';
    }

    if (!formData.arrivalTime) {
      newErrors.arrivalTime = 'Arrival time is required';
    }

    if (formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Select at least one day';
    }

    if (!formData.busNumber || formData.busNumber.trim() === '') {
      newErrors.busNumber = 'Bus number is required';
    }

    if (formData.busCapacity < 1 || formData.busCapacity > 100) {
      newErrors.busCapacity = 'Bus capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save schedule';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const newDays = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day];
      return { ...prev, daysOfWeek: newDays };
    });
  };

  const selectAllDays = () => {
    setFormData((prev) => ({ ...prev, daysOfWeek: [...DAYS_OF_WEEK] }));
  };

  const selectWeekdays = () => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }));
  };

  const selectWeekends = () => {
    setFormData((prev) => ({ ...prev, daysOfWeek: ['Saturday', 'Sunday'] }));
  };

  const clearDays = () => {
    setFormData((prev) => ({ ...prev, daysOfWeek: [] }));
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {mode === 'edit' ? 'Edit Schedule' : 'Create New Schedule'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Departure Time *
                </label>
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.departureTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.departureTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.departureTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Arrival Time *
                </label>
                <input
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.arrivalTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.arrivalTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.arrivalTime}</p>
                )}
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <CalendarIcon className="inline w-4 h-4 mr-1" />
                Days of Operation *
              </label>

              {/* Quick Select Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={selectWeekends}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Weekends
                </button>
                <button
                  type="button"
                  onClick={clearDays}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-red-600"
                >
                  Clear
                </button>
              </div>

              {/* Day Checkboxes */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.daysOfWeek.includes(day)
                        ? 'bg-purple-50 border-purple-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {day.substring(0, 3)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="text-sm text-red-600 mt-2">{errors.daysOfWeek}</p>
              )}
            </div>

            {/* Bus Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bus Number / Plate *
                </label>
                <input
                  type="text"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  placeholder="e.g., UAH 123A"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.busNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.busNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.busNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bus Capacity (Seats) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.busCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, busCapacity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.busCapacity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.busCapacity && (
                  <p className="text-sm text-red-600 mt-1">{errors.busCapacity}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Uganda Coaches standard: 67 seats</p>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active (accepting bookings)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
