'use client';

import { useState, useEffect } from 'react';
import { Building2, User, Lock, Bell, Mail, Phone, Shield, Calendar, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

interface OperatorData {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: string;
  active: boolean;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface SettingsData {
  operator: OperatorData;
  user: UserData;
}

type TabType = 'company' | 'profile' | 'password' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/operators/settings');

      if (response.data.success) {
        setSettings(response.data.data);
        setCompanyForm({
          companyName: response.data.data.operator.companyName,
          contactEmail: response.data.data.operator.contactEmail,
          contactPhone: response.data.data.operator.contactPhone,
        });
        setProfileForm({
          fullName: response.data.data.user.fullName,
          email: response.data.data.user.email,
        });
      } else {
        showNotification('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.patch('/operators/settings/company', companyForm);

      if (response.data.success) {
        showNotification('success', 'Company information updated successfully');
        fetchSettings();
      } else {
        showNotification('error', response.data.message || 'Failed to update company information');
      }
    } catch (error: any) {
      console.error('Error updating company:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.patch('/operators/settings/profile', profileForm);

      if (response.data.success) {
        showNotification('success', 'Profile updated successfully');
        // Update localStorage with new name
        const operatorData = localStorage.getItem('operator');
        if (operatorData) {
          const operator = JSON.parse(operatorData);
          operator.fullName = profileForm.fullName;
          operator.email = profileForm.email;
          localStorage.setItem('operator', JSON.stringify(operator));
        }
        fetchSettings();
      } else {
        showNotification('error', response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    try {
      const response = await api.post('/operators/settings/change-password', passwordForm);

      if (response.data.success) {
        showNotification('success', 'Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showNotification('error', response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showNotification('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div>
              <div className="h-7 bg-gray-200 rounded-xl w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded-xl w-48" />
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-pulse">
          <div className="flex gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded-full" />
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-14 bg-gray-200 rounded-full w-full" />
            <div className="h-14 bg-gray-200 rounded-full w-full" />
            <div className="h-14 bg-gray-200 rounded-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'company' as TabType, label: 'Company', icon: Building2 },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'password' as TabType, label: 'Security', icon: Lock },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-[#8a6ae8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${
            notification.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-8 pt-6 pb-0 border-b border-gray-100">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#8a6ae8] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Company Tab */}
          {activeTab === 'company' && (
            <form onSubmit={handleUpdateCompany} className="max-w-2xl">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Company Information</h3>
                  <p className="text-xs text-gray-500">Update your company details</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="company@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="+256 XXX XXX XXX"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Status Card */}
              {settings && (
                <div className="mt-8 bg-gradient-to-br from-[#8a6ae8]/5 to-[#67e8f9]/5 rounded-2xl p-6 border border-[#8a6ae8]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#8a6ae8]" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Account Status</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Verification</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{settings.operator.verificationStatus}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className={`text-sm font-semibold ${settings.operator.active ? 'text-green-600' : 'text-red-600'}`}>
                        {settings.operator.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Member Since</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(settings.operator.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl text-sm"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="max-w-2xl">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-xs text-gray-500">Update your personal details</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              {settings && (
                <div className="mt-8 bg-gradient-to-br from-[#8a6ae8]/5 to-[#67e8f9]/5 rounded-2xl p-6 border border-[#8a6ae8]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#8a6ae8]" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Account Details</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{settings.user.role}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Last Login</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {settings.user.lastLoginAt ? new Date(settings.user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(settings.user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl text-sm"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-2xl">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-4">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8a6ae8] focus:border-transparent transition-all text-sm"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="mt-8 bg-gradient-to-br from-[#8a6ae8]/5 to-[#67e8f9]/5 rounded-2xl p-6 border border-[#8a6ae8]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#8a6ae8]" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Security Tips</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Use a mix of letters, numbers, and symbols
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Avoid using personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Don&apos;t reuse passwords from other accounts
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl text-sm"
                >
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-xs text-gray-500">Manage how you receive notifications</p>
                </div>
              </div>

              {/* Coming Soon Card */}
              <div className="bg-gradient-to-br from-[#8a6ae8]/5 to-[#67e8f9]/5 rounded-2xl p-12 text-center border border-[#8a6ae8]/10">
                <div className="w-16 h-16 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-[#8a6ae8]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h4>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Notification preferences will be available in a future update. You&apos;ll be able to customize email alerts, push notifications, and more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
