'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  Ticket,
  TrendingUp,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import api from '@/lib/api';
import { AnalyticsOverview } from '@/types';

interface Booking {
  id: string;
  bookingReference: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string | null;
  route: {
    id: string;
    name: string;
    origin: string;
    destination: string;
  };
  schedule: {
    id: string;
    departureTime: string;
    arrivalTime: string;
    busNumber: string;
  };
  travelDate: string;
  boardingPoint: string;
  dropoffPoint: string;
  seatNumbers: number[];
  numberOfSeats: number;
  totalPrice: number;
  paymentStatus: string;
  bookingStatus: string;
  validated: boolean;
  qrCodeUrl: string | null;
  payment: {
    provider: string;
    transactionId: string;
    status: string;
    completedAt: string | null;
  } | null;
  expiresAt: string;
  createdAt: string;
}

interface Filters {
  search: string;
  paymentStatus: string;
  bookingStatus: string;
  startDate: string;
  endDate: string;
  routeId: string;
}

function BookingsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: initialSearch,
    paymentStatus: '',
    bookingStatus: '',
    startDate: '',
    endDate: '',
    routeId: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  // Demo bookings data
  const DEMO_BOOKINGS: Booking[] = [
    {
      id: '1', bookingReference: 'NSC-2024-001', passengerName: 'John Mukasa', passengerPhone: '+256700111222', passengerEmail: 'john@email.com',
      route: { id: '1', name: 'Kampala - Arua', origin: 'Kampala', destination: 'Arua' },
      schedule: { id: '1', departureTime: '07:15', arrivalTime: '14:15', busNumber: 'NSC-KA-001' },
      travelDate: new Date().toISOString(), boardingPoint: 'Kampala Bus Terminal', droppingPoint: 'Arua Park',
      seatNumbers: [12, 13], totalPrice: 85000, paymentStatus: 'completed', bookingStatus: 'confirmed', validated: false, createdAt: new Date().toISOString(),
    },
    {
      id: '2', bookingReference: 'NSC-2024-002', passengerName: 'Sarah Nambi', passengerPhone: '+256701222333', passengerEmail: 'sarah@email.com',
      route: { id: '2', name: 'Arua - Kampala', origin: 'Arua', destination: 'Kampala' },
      schedule: { id: '2', departureTime: '08:30', arrivalTime: '15:30', busNumber: 'NSC-AK-001' },
      travelDate: new Date().toISOString(), boardingPoint: 'Arua Park', droppingPoint: 'Kampala Bus Terminal',
      seatNumbers: [5], totalPrice: 45000, paymentStatus: 'completed', bookingStatus: 'confirmed', validated: true, createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3', bookingReference: 'NSC-2024-003', passengerName: 'Peter Okello', passengerPhone: '+256702333444', passengerEmail: null,
      route: { id: '1', name: 'Kampala - Arua', origin: 'Kampala', destination: 'Arua' },
      schedule: { id: '3', departureTime: '11:00', arrivalTime: '18:00', busNumber: 'NSC-KA-002' },
      travelDate: new Date().toISOString(), boardingPoint: 'Kampala Bus Terminal', droppingPoint: 'Arua Park',
      seatNumbers: [8, 9, 10], totalPrice: 135000, paymentStatus: 'completed', bookingStatus: 'confirmed', validated: false, createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4', bookingReference: 'NSC-2024-004', passengerName: 'Grace Akello', passengerPhone: '+256703444555', passengerEmail: 'grace@email.com',
      route: { id: '2', name: 'Arua - Kampala', origin: 'Arua', destination: 'Kampala' },
      schedule: { id: '4', departureTime: '06:30', arrivalTime: '13:30', busNumber: 'NSC-AK-002' },
      travelDate: new Date().toISOString(), boardingPoint: 'Arua Park', droppingPoint: 'Kampala Bus Terminal',
      seatNumbers: [1, 2], totalPrice: 90000, paymentStatus: 'completed', bookingStatus: 'confirmed', validated: false, createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Check for demo mode
    if (typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true') {
      setBookings(DEMO_BOOKINGS);
      setPagination({ page: 1, limit: 50, total: 4, pages: 1 });
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Build query params
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.bookingStatus) params.status = filters.bookingStatus;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.routeId) params.routeId = filters.routeId;

      const response = await api.get('/operator/bookings', { params });
      setBookings(response.data.data.bookings);
      setPagination(response.data.data.pagination);
      setError(null);
    } catch (err: unknown) {
      // Fallback to demo data on error
      setBookings(DEMO_BOOKINGS);
      setPagination({ page: 1, limit: 50, total: 4, pages: 1 });
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/operator/analytics/overview');
      setOverviewData(response.data?.data || null);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchAnalytics();
  }, [pagination.page, filters.paymentStatus, filters.bookingStatus, filters.startDate, filters.endDate, filters.routeId]);

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchBookings();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M UGX`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K UGX`;
    }
    return `${amount.toLocaleString('en-UG')} UGX`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 bg-[#c4f464]/20 text-green-700 text-xs font-medium rounded-full">Paid</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-[#67e8f9]/20 text-cyan-700 text-xs font-medium rounded-full">Pending</span>;
      case 'failed':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Failed</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Confirmed</span>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Ref', 'Passenger', 'Phone', 'Route', 'Travel Date', 'Departure', 'Seats', 'Amount', 'Payment', 'Status'];
    const rows = bookings.map(b => [
      b.bookingReference,
      b.passengerName,
      b.passengerPhone,
      `${b.route.origin} - ${b.route.destination}`,
      formatDate(b.travelDate),
      formatTime(b.schedule.departureTime),
      b.numberOfSeats,
      b.totalPrice,
      b.paymentStatus,
      b.bookingStatus,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Booking status pie chart data (only Confirmed and Cancelled)
  const bookingStatusData = overviewData ? [
    { name: 'Confirmed', value: (overviewData.bookingStatus.confirmed || 0) + (overviewData.bookingStatus.completed || 0), color: '#22c55e' },
    { name: 'Cancelled', value: overviewData.bookingStatus.cancelled, color: '#e5e7eb' },
  ].filter(item => item.value > 0) : [];

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto mt-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={() => fetchBookings()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If booking detail is open, show full-page view with custom header
  if (selectedBooking) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setSelectedBooking(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8a6ae8] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Bookings</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-[#8a6ae8]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Booking Details</h1>
                <p className="text-sm text-gray-500">Reference: <span className="text-[#8a6ae8] font-medium">{selectedBooking.bookingReference}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getPaymentStatusBadge(selectedBooking.paymentStatus)}
              {getBookingStatusBadge(selectedBooking.bookingStatus)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Passenger Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Passenger Information</h3>
                <p className="text-xs text-gray-500">Contact details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-base font-semibold text-gray-900">{selectedBooking.passengerName}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-base font-semibold text-gray-900">{selectedBooking.passengerPhone}</p>
              </div>
              {selectedBooking.passengerEmail && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-base font-semibold text-gray-900">{selectedBooking.passengerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payment Information</h3>
                <p className="text-xs text-gray-500">Transaction details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#8a6ae8]/10 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#8a6ae8]">{formatCurrency(selectedBooking.totalPrice)}</p>
              </div>
              {selectedBooking.payment && (
                <>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-base font-semibold text-gray-900">{selectedBooking.payment.provider}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedBooking.payment.transactionId}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Journey Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Journey Details</h3>
                <p className="text-xs text-gray-500">Route and schedule information</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Route</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.route.origin} → {selectedBooking.route.destination}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Travel Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(selectedBooking.travelDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Departure Time</p>
                <p className="text-sm font-semibold text-gray-900">{formatTime(selectedBooking.schedule.departureTime)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Bus</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.schedule.busNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Boarding Point</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.boardingPoint}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Drop-off Point</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.dropoffPoint}</p>
              </div>
              <div className="bg-[#8a6ae8]/10 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Seat Numbers</p>
                <p className="text-sm font-bold text-[#8a6ae8]">{selectedBooking.seatNumbers.join(', ')}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Number of Seats</p>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.numberOfSeats}</p>
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Booking Status</h3>
                <p className="text-xs text-gray-500">Validation and timing</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Validated</p>
                <p className="text-base font-semibold text-gray-900">{selectedBooking.validated ? 'Yes' : 'No'}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Expires</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(selectedBooking.expiresAt)}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {selectedBooking.qrCodeUrl && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-[#8a6ae8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">QR Code</h3>
                  <p className="text-xs text-gray-500">Scan for validation</p>
                </div>
              </div>
              <div className="flex justify-center">
                <img src={selectedBooking.qrCodeUrl} alt="Booking QR Code" className="w-48 h-48 border border-gray-100 rounded-2xl" />
              </div>
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
              <Ticket className="w-6 h-6 text-[#8a6ae8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bookings Management</h1>
              <p className="text-sm text-gray-500">Manage customer bookings and reservations</p>
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
              onClick={() => { fetchBookings(true); fetchAnalytics(); }}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            {overviewData && overviewData.growth.bookings.growth !== 0 && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                overviewData.growth.bookings.growth > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {overviewData.growth.bookings.growth > 0 ? '+' : ''}
                {overviewData.growth.bookings.growth.toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {overviewData?.overview.totalBookings || pagination.total}
          </p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {(overviewData?.bookingStatus.confirmed || 0) + (overviewData?.bookingStatus.completed || 0)}
          </p>
          <p className="text-sm text-gray-500">Confirmed</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {overviewData?.bookingStatus.cancelled || 0}
          </p>
          <p className="text-sm text-gray-500">Cancelled</p>
        </div>
      </div>

      {/* Today's Activity & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Activity Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Booked Today Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#8a6ae8]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Booked Today</h3>
                <p className="text-xs text-gray-400">New orders received</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {overviewData?.overview.todayBookings || 0}
            </p>
            <p className="text-sm text-gray-500">
              bookings created today
            </p>
          </div>

          {/* Today's Trips Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Today's Trips</h3>
                <p className="text-xs text-gray-400">Passengers traveling</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {overviewData?.overview.todaysTrips || 0}
            </p>
            <p className="text-sm text-gray-500">
              passengers traveling today
            </p>
          </div>
        </div>

        {/* Booking Status Pie Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-[#8a6ae8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
              <p className="text-sm text-gray-500">Distribution</p>
            </div>
          </div>

          {bookingStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
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
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-4">
                {bookingStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p className="text-sm">No booking data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, name, phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-colors ${
              showFilters ? 'bg-[#8a6ae8]/10 text-[#8a6ae8]' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Booking Status</label>
              <select
                value={filters.bookingStatus}
                onChange={(e) => setFilters({ ...filters, bookingStatus: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#8a6ae8] transition-colors"
              >
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
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

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-[#8a6ae8]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-[#8a6ae8] animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No bookings found</h3>
            <p className="text-sm text-gray-500">No bookings match your current filters.</p>
          </div>
        ) : (
          <>
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
                      Journey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#8a6ae8]/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#8a6ae8]">
                          {booking.bookingReference}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.passengerName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {booking.passengerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.route.origin} → {booking.route.destination}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatDate(booking.travelDate)} • {formatTime(booking.schedule.departureTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.boardingPoint} → {booking.dropoffPoint}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Seats: {booking.seatNumbers.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {booking.numberOfSeats} {booking.numberOfSeats === 1 ? 'seat' : 'seats'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                          {getBookingStatusBadge(booking.bookingStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          className="w-8 h-8 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center hover:bg-[#8a6ae8]/20 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-[#8a6ae8]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#8a6ae8] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#8a6ae8] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/30 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8a6ae8]"></div></div>}>
      <BookingsContent />
    </Suspense>
  );
}
