'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Bus, Settings, Calendar, Users, CheckCircle, Package, DollarSign } from 'lucide-react';

export interface BusFormData {
  registrationNumber: string;
  fleetNumber?: string | null;
  type: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  capacity: number;
  status: string;
  condition?: string | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  features?: string[] | null;
  notes?: string | null;
  active?: boolean;
  luggagePrice?: number;
  maxExtraLuggage?: number;
}

interface BusFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (busData: BusFormData) => Promise<void>;
  mode?: 'create' | 'edit';
  initialData?: BusFormData & { id?: string };
}

const BUS_TYPES = ['Standard', 'Luxury Coach', 'VIP', 'Semi-Luxury', 'Express'];
const BUS_STATUSES = ['active', 'maintenance', 'inactive', 'retired'];
const BUS_CONDITIONS = ['good', 'fair', 'needs_service'];
const COMMON_FEATURES = ['AC', 'WiFi', 'TV', 'USB Charging', 'Reclining Seats', 'Restroom', 'Entertainment System'];

export default function BusFormPanel({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData,
}: BusFormPanelProps) {
  const [formData, setFormData] = useState<BusFormData>({
    registrationNumber: '',
    fleetNumber: '',
    type: 'Standard',
    make: '',
    model: '',
    year: null,
    capacity: 67,
    status: 'active',
    condition: 'good',
    lastServiceDate: null,
    nextServiceDate: null,
    features: [],
    notes: '',
    active: true,
    luggagePrice: 60000,
    maxExtraLuggage: 5,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data when opening in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        registrationNumber: initialData.registrationNumber,
        fleetNumber: initialData.fleetNumber || '',
        type: initialData.type,
        make: initialData.make || '',
        model: initialData.model || '',
        year: initialData.year,
        capacity: initialData.capacity,
        status: initialData.status,
        condition: initialData.condition || 'good',
        lastServiceDate: initialData.lastServiceDate,
        nextServiceDate: initialData.nextServiceDate,
        features: initialData.features || [],
        notes: initialData.notes || '',
        active: initialData.active !== undefined ? initialData.active : true,
        luggagePrice: initialData.luggagePrice ?? 60000,
        maxExtraLuggage: initialData.maxExtraLuggage ?? 5,
      });
    } else if (isOpen && mode === 'create') {
      // Reset for create mode
      setFormData({
        registrationNumber: '',
        fleetNumber: '',
        type: 'Standard',
        make: '',
        model: '',
        year: null,
        capacity: 67,
        status: 'active',
        condition: 'good',
        lastServiceDate: null,
        nextServiceDate: null,
        features: [],
        notes: '',
        active: true,
        luggagePrice: 60000,
        maxExtraLuggage: 5,
      });
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.registrationNumber || formData.registrationNumber.trim() === '') {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!formData.type || formData.type.trim() === '') {
      newErrors.type = 'Bus type is required';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    if (formData.luggagePrice !== undefined && formData.luggagePrice < 0) {
      newErrors.luggagePrice = 'Luggage price cannot be negative';
    }

    if (formData.maxExtraLuggage !== undefined && (formData.maxExtraLuggage < 0 || formData.maxExtraLuggage > 10)) {
      newErrors.maxExtraLuggage = 'Max extra luggage must be between 0 and 10';
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
      // Clean up data before submitting
      const submitData: BusFormData = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        fleetNumber: formData.fleetNumber?.trim() || null,
        type: formData.type.trim(),
        make: formData.make?.trim() || null,
        model: formData.model?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save bus';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const currentFeatures = prev.features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Content - Scrollable */}
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
                <Bus className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="space-y-4">
              {/* Registration & Fleet Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g., UAH 123A"
                    className={`w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.registrationNumber
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                    required
                  />
                  {errors.registrationNumber && (
                    <p className="text-xs text-red-600 mt-2 ml-4">{errors.registrationNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fleet Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fleetNumber || ''}
                    onChange={(e) => setFormData({ ...formData, fleetNumber: e.target.value })}
                    placeholder="e.g., BUS-001"
                    className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                  />
                </div>
              </div>

              {/* Bus Type & Capacity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors appearance-none bg-white ${
                      errors.type
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                    required
                  >
                    {BUS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="text-xs text-red-600 mt-2 ml-4">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Seats) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                        errors.capacity
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                      }`}
                      required
                    />
                  </div>
                  {errors.capacity && <p className="text-xs text-red-600 mt-2 ml-4">{errors.capacity}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Bus Details Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Bus Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <input
                  type="text"
                  value={formData.make || ''}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="e.g., Scania"
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., K360"
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || null })}
                  placeholder="2023"
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Luggage Configuration Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Luggage Configuration</h3>
                <p className="text-xs text-gray-500">Set pricing for extra luggage on this bus</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extra Luggage Price (UGX)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.luggagePrice || ''}
                    onChange={(e) => setFormData({ ...formData, luggagePrice: parseInt(e.target.value) || 0 })}
                    placeholder="60000"
                    className={`w-full pl-10 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.luggagePrice
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                  />
                </div>
                {errors.luggagePrice && (
                  <p className="text-xs text-red-600 mt-2 ml-4">{errors.luggagePrice}</p>
                )}
                <p className="text-xs text-gray-500 mt-2 ml-4">
                  Price charged per extra luggage item
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Extra Luggage
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxExtraLuggage || ''}
                    onChange={(e) => setFormData({ ...formData, maxExtraLuggage: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                    className={`w-full pl-10 pr-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.maxExtraLuggage
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#8a6ae8] focus:ring-[#8a6ae8]/20'
                    }`}
                  />
                </div>
                {errors.maxExtraLuggage && (
                  <p className="text-xs text-red-600 mt-2 ml-4">{errors.maxExtraLuggage}</p>
                )}
                <p className="text-xs text-gray-500 mt-2 ml-4">
                  Max items per passenger (0-10)
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Status & Condition Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Status & Condition</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors capitalize appearance-none bg-white"
                  required
                >
                  {BUS_STATUSES.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={formData.condition || ''}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors capitalize appearance-none bg-white"
                >
                  <option value="">Not specified</option>
                  {BUS_CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Service Dates Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Service Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Service Date</label>
                <input
                  type="date"
                  value={formData.lastServiceDate ? formData.lastServiceDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Service Date</label>
                <input
                  type="date"
                  value={formData.nextServiceDate ? formData.nextServiceDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Features Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Features</h3>
                <p className="text-xs text-gray-500">Select all features available in this bus</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {COMMON_FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`flex items-center justify-center px-4 py-2.5 border rounded-full text-sm font-medium transition-all ${
                    formData.features?.includes(feature)
                      ? 'bg-[#8a6ae8] text-white border-[#8a6ae8]'
                      : 'border-gray-200 text-gray-700 hover:bg-[#8a6ae8]/5 hover:border-[#8a6ae8]/30'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6"></div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes about this bus..."
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#8a6ae8] focus:ring-2 focus:ring-[#8a6ae8]/20 transition-colors resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.active ? 'bg-[#8a6ae8]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${formData.active ? 'left-6' : 'left-1'}`}></div>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Active (available for scheduling)</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Bus' : 'Add Bus'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
