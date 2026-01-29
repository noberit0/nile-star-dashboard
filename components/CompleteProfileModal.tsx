'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onComplete: (name: string) => void;
}

export default function CompleteProfileModal({ isOpen, onComplete }: CompleteProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Update the profile on the backend
      await api.put('/operators/profile', { fullName: fullName.trim() });

      // Update localStorage
      const operatorData = localStorage.getItem('operator');
      if (operatorData) {
        const operator = JSON.parse(operatorData);
        operator.fullName = fullName.trim();
        localStorage.setItem('operator', JSON.stringify(operator));
      }

      onComplete(fullName.trim());
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop - no click to close since this is required */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-[#8a6ae8]" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
          <p className="text-sm text-gray-500">
            Please enter your name to personalize your dashboard experience.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all"
                autoFocus
                disabled={saving}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !fullName.trim()}
            className="w-full px-6 py-3 bg-[#8a6ae8] text-white rounded-full font-semibold text-sm hover:bg-[#7a5ad8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            You can update this later in Settings
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}
