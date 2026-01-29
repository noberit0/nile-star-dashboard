'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Filter, CheckCircle, XCircle, DollarSign, Clock, AlertCircle, ArrowLeft, ArrowUpRight, User, MapPin, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  refundTransactionId: string | null;
  notes: string | null;
  requestedBy: string;
  processedBy: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  booking: {
    bookingReference: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string | null;
    schedule: {
      route: {
        name: string;
        origin: string;
        destination: string;
      };
    };
  };
}

interface RefundStats {
  totalPending: number;
  totalApproved: number;
  totalCompleted: number;
  totalRejected: number;
  totalFailed: number;
  pendingAmount: number;
  completedAmount: number;
  completedToday: number;
}

interface Filters {
  status: string;
  startDate: string;
  endDate: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    startDate: '',
    endDate: '',
  });

  const fetchRefunds = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params: any = {
        limit: 50,
        offset: 0,
      };

      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [refundsResponse, statsResponse] = await Promise.all([
        api.get('/operator/refunds', { params }),
        api.get('/operator/refunds/stats'),
      ]);

      setRefunds(refundsResponse.data.data.refunds);
      setStats(statsResponse.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch refunds error:', err);
      setError(err.response?.data?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [filters.status, filters.startDate, filters.endDate]);

  const handleApprove = async (refundId: string) => {
    if (!confirm('Are you sure you want to approve this refund?')) return;

    setProcessingRefund(refundId);
    try {
      await api.put(`/operator/refunds/${refundId}/approve`, {
        approvedBy: 'operator@jambobus.com',
        notes: 'Approved for processing',
      });

      await fetchRefunds(true);
      alert('Refund approved successfully!');
    } catch (err: any) {
      console.error('Approve error:', err);
      alert(err.response?.data?.message || 'Failed to approve refund');
    } finally {
      setProcessingRefund(null);
    }
  };

  const handleReject = async (refundId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessingRefund(refundId);
    try {
      await api.put(`/operator/refunds/${refundId}/reject`, {
        rejectedBy: 'operator@jambobus.com',
        reason,
      });

      await fetchRefunds(true);
      alert('Refund rejected successfully!');
    } catch (err: any) {
      console.error('Reject error:', err);
      alert(err.response?.data?.message || 'Failed to reject refund');
    } finally {
      setProcessingRefund(null);
    }
  };

  const handleProcess = async (refundId: string) => {
    if (!confirm('Are you sure you want to process this refund? Money will be sent to the customer.')) return;

    setProcessingRefund(refundId);
    try {
      const response = await api.post(`/operator/refunds/${refundId}/process`, {
        processedBy: 'operator@jambobus.com',
        notes: 'Processed via Mobile Money',
      });

      await fetchRefunds(true);
      alert(response.data.message || 'Refund processed successfully!');
    } catch (err: any) {
      console.error('Process error:', err);
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessingRefund(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-[#67e8f9]/20 text-cyan-700 text-xs font-medium rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2.5 py-1 bg-[#8a6ae8]/10 text-[#8a6ae8] text-xs font-medium rounded-full">Approved</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-[#c4f464]/20 text-green-700 text-xs font-medium rounded-full">Completed</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Rejected</span>;
      case 'failed':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Failed</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Refunds</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => fetchRefunds()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Refund detail view
  if (selectedRefund) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setSelectedRefund(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8a6ae8] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Refunds</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-[#8a6ae8]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Refund Details</h1>
                <p className="text-sm text-gray-500">Booking: <span className="text-[#8a6ae8] font-medium">{selectedRefund.booking.bookingReference}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(selectedRefund.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Refund Amount */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Refund Amount</h3>
                <p className="text-xs text-gray-500">Amount to be refunded</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#8a6ae8]/10 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#8a6ae8]">{formatCurrency(selectedRefund.amount)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-base font-semibold text-gray-900">{selectedRefund.reason}</p>
              </div>
              {selectedRefund.refundTransactionId && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{selectedRefund.refundTransactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Passenger Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Passenger Information</h3>
                <p className="text-xs text-gray-500">Contact details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-base font-semibold text-gray-900">{selectedRefund.booking.passengerName}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-base font-semibold text-gray-900">{selectedRefund.booking.passengerPhone}</p>
              </div>
              {selectedRefund.booking.passengerEmail && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-base font-semibold text-gray-900">{selectedRefund.booking.passengerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Route Information</h3>
                <p className="text-xs text-gray-500">Journey details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Route</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedRefund.booking.schedule.route.origin} → {selectedRefund.booking.schedule.route.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Timeline</h3>
                <p className="text-xs text-gray-500">Request history</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Requested</p>
                <p className="text-base font-semibold text-gray-900">{formatDateTime(selectedRefund.createdAt)}</p>
              </div>
              {selectedRefund.processedAt && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Processed</p>
                  <p className="text-base font-semibold text-gray-900">{formatDateTime(selectedRefund.processedAt)}</p>
                </div>
              )}
              {selectedRefund.completedAt && (
                <div className="bg-[#c4f464]/20 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-base font-semibold text-green-700">{formatDateTime(selectedRefund.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {selectedRefund.notes && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Notes</h3>
                  <p className="text-xs text-gray-500">Additional information</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-700">{selectedRefund.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedRefund.status === 'pending' && (
            <div className="lg:col-span-2 flex gap-4">
              <button
                onClick={() => handleApprove(selectedRefund.id)}
                disabled={processingRefund === selectedRefund.id}
                className="flex-1 px-6 py-3 bg-[#c4f464] text-gray-900 rounded-full hover:bg-[#b4e454] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Refund
              </button>
              <button
                onClick={() => handleReject(selectedRefund.id)}
                disabled={processingRefund === selectedRefund.id}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <XCircle className="w-5 h-5" />
                Reject Refund
              </button>
            </div>
          )}

          {selectedRefund.status === 'approved' && (
            <div className="lg:col-span-2">
              <button
                onClick={() => handleProcess(selectedRefund.id)}
                disabled={processingRefund === selectedRefund.id}
                className="w-full px-6 py-3 bg-[#8a6ae8] text-white rounded-full hover:bg-[#7a5ad8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <DollarSign className="w-5 h-5" />
                Process Refund (Send Money)
              </button>
            </div>
          )}
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
              <ArrowUpRight className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Refunds Management</h1>
              <p className="text-sm text-gray-500">Manage refund requests and processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRefunds(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8a6ae8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalPending}</p>
            <p className="text-sm text-gray-500 mb-2">Pending Refunds</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
              <p className="text-xs text-gray-400">{formatCurrency(stats.pendingAmount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#8a6ae8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalApproved}</p>
            <p className="text-sm text-gray-500 mb-2">Approved</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
              <p className="text-xs text-gray-400">Ready to process</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCompleted}</p>
            <p className="text-sm text-gray-500 mb-2">Completed</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
              <p className="text-xs text-gray-400">{formatCurrency(stats.completedAmount)}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8a6ae8]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.completedToday}</p>
            <p className="text-sm text-gray-500 mb-2">Completed Today</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
              <p className="text-xs text-gray-400">Today&apos;s progress</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${
              showFilters ? 'bg-[#8a6ae8]/10 text-[#8a6ae8]' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {(filters.status || filters.startDate || filters.endDate) && (
            <button
              onClick={() => setFilters({ status: '', startDate: '', endDate: '' })}
              className="text-sm text-gray-500 hover:text-[#8a6ae8] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-[#8a6ae8]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-[#8a6ae8] animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading refunds...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No refunds found</h3>
            <p className="text-sm text-gray-500">No refunds match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {refunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="hover:bg-[#8a6ae8]/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedRefund(refund)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#8a6ae8]">
                        {refund.booking.bookingReference}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {refund.booking.passengerName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {refund.booking.passengerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {refund.booking.schedule.route.origin} → {refund.booking.schedule.route.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(refund.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(refund.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(refund.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {refund.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(refund.id);
                              }}
                              disabled={processingRefund === refund.id}
                              className="w-8 h-8 rounded-full bg-[#c4f464]/20 flex items-center justify-center hover:bg-[#c4f464]/40 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(refund.id);
                              }}
                              disabled={processingRefund === refund.id}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-gray-600" />
                            </button>
                          </>
                        )}
                        {refund.status === 'approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcess(refund.id);
                            }}
                            disabled={processingRefund === refund.id}
                            className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center hover:bg-[#8a6ae8]/20 transition-colors disabled:opacity-50"
                            title="Process"
                          >
                            <DollarSign className="w-4 h-4 text-[#8a6ae8]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
