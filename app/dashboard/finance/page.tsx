'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Wallet,
  Eye,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  XCircle,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '@/lib/api';

interface FinancialOverview {
  overview: {
    totalRevenue: number;
    netRevenue: number;
    totalTransactions: number;
    expectedSettlement: number;
  };
  byProvider: {
    mtn: {
      revenue: number;
      transactions: number;
      fees: number;
      feePercentage: number;
      netSettlement: number;
    };
    airtel: {
      revenue: number;
      transactions: number;
      fees: number;
      feePercentage: number;
      netSettlement: number;
    };
  };
  refunds: {
    total: number;
    pending: number;
    completed: number;
    count: number;
  };
  fees: {
    total: number;
    mtn: number;
    airtel: number;
  };
}

interface Transaction {
  id: string;
  bookingReference: string;
  passengerName: string;
  passengerPhone: string;
  route: string;
  amount: number;
  paymentStatus: string;
  provider: string;
  transactionId: string;
  transactionDate: string;
  completedAt: string | null;
}

interface DailyRevenue {
  date: string;
  totalRevenue: number;
  mtnRevenue: number;
  airtelRevenue: number;
  transactionCount: number;
  mtnCount: number;
  airtelCount: number;
}

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

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'refunds'>('overview');
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [refundStats, setRefundStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [providerFilter, setProviderFilter] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState('');

  const fetchOverview = async () => {
    try {
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get('/operator/finance/overview', { params });
      setOverview(response.data.data);
    } catch (err: any) {
      console.error('Fetch overview error:', err);
      setError(err.response?.data?.message || 'Failed to load financial overview');
    }
  };

  const fetchTransactions = async () => {
    try {
      const params: any = { page: 1, limit: 100 };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (providerFilter) params.provider = providerFilter;

      const response = await api.get('/operator/finance/transactions', { params });
      setTransactions(response.data.data.transactions);
    } catch (err: any) {
      console.error('Fetch transactions error:', err);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get('/operator/finance/daily-revenue', { params });
      setDailyRevenue(response.data.data);
    } catch (err: any) {
      console.error('Fetch daily revenue error:', err);
    }
  };

  const fetchRefunds = async () => {
    try {
      const params: any = { limit: 50, offset: 0 };
      if (refundStatusFilter) params.status = refundStatusFilter;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [refundsResponse, statsResponse] = await Promise.all([
        api.get('/operator/refunds', { params }),
        api.get('/operator/refunds/stats'),
      ]);

      setRefunds(refundsResponse.data.data.refunds);
      setRefundStats(statsResponse.data.data);
    } catch (err: any) {
      console.error('Fetch refunds error:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchOverview(),
        fetchDailyRevenue(),
        activeTab === 'transactions' && fetchTransactions(),
        activeTab === 'refunds' && fetchRefunds(),
      ]);
      setToast({ message: 'Financial data updated', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Refresh failed:', err);
      setToast({ message: 'Failed to refresh data', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchDailyRevenue(),
        fetchTransactions(),
        fetchRefunds(),
      ]);
      setLoading(false);
    };

    fetchData();
  }, [dateRange.startDate, dateRange.endDate, providerFilter, refundStatusFilter]);

  // Refund actions
  const handleApprove = async (refundId: string) => {
    if (!confirm('Are you sure you want to approve this refund?')) return;

    setProcessingRefund(refundId);
    try {
      await api.put(`/operator/refunds/${refundId}/approve`, {
        approvedBy: 'operator',
        notes: 'Approved for processing',
      });

      await fetchRefunds();
      setToast({ message: 'Refund approved successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Approve error:', err);
      setToast({ message: err.response?.data?.message || 'Failed to approve refund', type: 'error' });
      setTimeout(() => setToast(null), 5000);
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
        rejectedBy: 'operator',
        reason,
      });

      await fetchRefunds();
      setToast({ message: 'Refund rejected', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Reject error:', err);
      setToast({ message: err.response?.data?.message || 'Failed to reject refund', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setProcessingRefund(null);
    }
  };

  const handleProcess = async (refundId: string) => {
    if (!confirm('Are you sure you want to process this refund? Money will be sent to the customer.')) return;

    setProcessingRefund(refundId);
    try {
      const response = await api.post(`/operator/refunds/${refundId}/process`, {
        processedBy: 'operator',
        notes: 'Processed via Mobile Money',
      });

      await fetchRefunds();
      await fetchOverview();
      setToast({ message: response.data.message || 'Refund processed successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Process error:', err);
      setToast({ message: err.response?.data?.message || 'Failed to process refund', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setProcessingRefund(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M UGX`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K UGX`;
    }
    return `${amount.toLocaleString('en-UG')} UGX`;
  };

  const formatFullCurrency = (amount: number) => {
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

  const formatChartDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-UG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    if (activeTab === 'transactions' && transactions.length > 0) {
      const headers = ['Ref', 'Passenger', 'Route', 'Amount', 'Provider', 'Transaction ID', 'Status', 'Date'];
      const rows = transactions.map(t => [
        t.bookingReference,
        t.passengerName,
        t.route,
        t.amount,
        t.provider,
        t.transactionId,
        t.paymentStatus,
        formatDate(t.transactionDate),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const getRefundStatusBadge = (status: string) => {
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

  // Chart data for revenue trends
  const chartData = dailyRevenue.slice(-14).map(day => ({
    date: formatChartDate(day.date),
    revenue: day.totalRevenue,
    mtn: day.mtnRevenue,
    airtel: day.airtelRevenue,
  }));

  // Pie chart data for payment providers
  const providerPieData = overview ? [
    { name: 'MTN Money', value: overview.byProvider.mtn.revenue, color: '#8a6ae8' },
    { name: 'Airtel Money', value: overview.byProvider.airtel.revenue, color: '#c4f464' },
  ].filter(item => item.value > 0) : [];

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Finance Data</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading || !overview) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-100 rounded-3xl" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-3xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-100 rounded-3xl" />
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
          <span className="text-sm font-medium">Back to Finance</span>
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
              {getRefundStatusBadge(selectedRefund.status)}
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
                <p className="text-2xl font-bold text-[#8a6ae8]">{formatFullCurrency(selectedRefund.amount)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-base font-semibold text-gray-900">{selectedRefund.reason}</p>
              </div>
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
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1">Route</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedRefund.booking.schedule.route.origin} → {selectedRefund.booking.schedule.route.destination}
              </p>
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
              {selectedRefund.completedAt && (
                <div className="bg-[#c4f464]/20 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-base font-semibold text-green-700">{formatDateTime(selectedRefund.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-green-50 border-green-200 text-green-900'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Finance & Revenue</h1>
              <p className="text-sm text-gray-500">Track revenue, transactions & refunds</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(overview.overview.totalRevenue)}
          </p>
          <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8a6ae8]" />
            <p className="text-xs text-gray-400">{overview.overview.totalTransactions} transactions</p>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(overview.overview.netRevenue)}
          </p>
          <p className="text-sm text-gray-500 mb-2">Net Revenue</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs text-gray-400">After {formatCurrency(overview.refunds.completed)} refunds</p>
          </div>
        </div>

        {/* Total Refunds */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-gray-600" />
            </div>
            {refundStats && refundStats.totalPending > 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#67e8f9]/20 text-cyan-700">
                {refundStats.totalPending} pending
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(overview.refunds.completed)}
          </p>
          <p className="text-sm text-gray-500 mb-2">Completed Refunds</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <p className="text-xs text-gray-400">{overview.refunds.count} total requests</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart & Provider Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Last 14 days</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8a6ae8]" />
                <span className="text-gray-500">Total Revenue</span>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8a6ae8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8a6ae8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [formatFullCurrency(value), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8a6ae8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p className="text-sm">No revenue data available</p>
            </div>
          )}
        </div>

        {/* Payment Provider Pie Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">By Provider</h3>
              <p className="text-sm text-gray-500">Revenue split</p>
            </div>
          </div>

          {providerPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={providerPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {providerPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatFullCurrency(value), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8a6ae8]" />
                    <span className="text-sm text-gray-600">MTN Money</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(overview.byProvider.mtn.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#c4f464]" />
                    <span className="text-sm text-gray-600">Airtel Money</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(overview.byProvider.airtel.revenue)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p className="text-sm">No payment data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-4 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-[#8a6ae8] border-b-2 border-[#8a6ae8]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Provider Details
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-5 py-4 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-[#8a6ae8] border-b-2 border-[#8a6ae8]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Transactions
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-5 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'refunds'
                  ? 'text-[#8a6ae8] border-b-2 border-[#8a6ae8]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Refunds
              {refundStats && refundStats.totalPending > 0 && (
                <span className="px-2 py-0.5 bg-[#67e8f9]/20 text-cyan-700 text-xs font-medium rounded-full">
                  {refundStats.totalPending}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Provider Details Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MTN Money */}
              <div className="bg-[#8a6ae8]/5 rounded-2xl border border-[#8a6ae8]/20 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">MTN Money</h4>
                  <span className="text-xs font-medium text-[#8a6ae8] bg-[#8a6ae8]/10 px-3 py-1 rounded-full">
                    {overview.byProvider.mtn.feePercentage}% Fee
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Revenue</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatFullCurrency(overview.byProvider.mtn.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overview.byProvider.mtn.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Fees</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatFullCurrency(overview.byProvider.mtn.fees)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#8a6ae8]/20">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Net Settlement</span>
                      <span className="text-base font-bold text-[#8a6ae8]">
                        {formatFullCurrency(overview.byProvider.mtn.netSettlement)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Airtel Money */}
              <div className="bg-[#c4f464]/10 rounded-2xl border border-[#c4f464]/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">Airtel Money</h4>
                  <span className="text-xs font-medium text-green-700 bg-[#c4f464]/30 px-3 py-1 rounded-full">
                    {overview.byProvider.airtel.feePercentage}% Fee
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Revenue</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatFullCurrency(overview.byProvider.airtel.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overview.byProvider.airtel.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Fees</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatFullCurrency(overview.byProvider.airtel.fees)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#c4f464]/30">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Net Settlement</span>
                      <span className="text-base font-bold text-green-700">
                        {formatFullCurrency(overview.byProvider.airtel.netSettlement)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
                >
                  <option value="">All Providers</option>
                  <option value="mtn">MTN Money</option>
                  <option value="airtel">Airtel Money</option>
                </select>
                <div className="flex items-center gap-2 text-xs text-[#8a6ae8] bg-[#8a6ae8]/10 px-4 py-2 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Showing successful payments only</span>
                </div>
              </div>

              {/* Transactions Table */}
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.slice(0, 10).map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-[#8a6ae8]/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-[#8a6ae8]">
                            {transaction.bookingReference}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {transaction.passengerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {transaction.route}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#8a6ae8]/10 text-[#8a6ae8]">
                              {transaction.provider}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(transaction.transactionDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Refunds Tab */}
          {activeTab === 'refunds' && (
            <div>
              {/* Refund Stats */}
              {refundStats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{refundStats.totalPending}</p>
                    <p className="text-xs text-gray-500 mt-1">Pending</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{refundStats.totalApproved}</p>
                    <p className="text-xs text-gray-500 mt-1">Approved</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{refundStats.totalCompleted}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-[#8a6ae8]">{formatCurrency(refundStats.completedAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Refunded</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${
                    showFilters ? 'bg-[#8a6ae8]/10 text-[#8a6ae8]' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                {refundStatusFilter && (
                  <button
                    onClick={() => setRefundStatusFilter('')}
                    className="text-sm text-gray-500 hover:text-[#8a6ae8] transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  <select
                    value={refundStatusFilter}
                    onChange={(e) => setRefundStatusFilter(e.target.value)}
                    className="px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {/* Refunds Table */}
              {refunds.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowUpRight className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No refunds found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                            {getRefundStatusBadge(refund.status)}
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRefund(refund);
                                }}
                                className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center hover:bg-[#8a6ae8]/20 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4 text-[#8a6ae8]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
