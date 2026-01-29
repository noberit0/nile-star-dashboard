import Link from 'next/link';
import { format } from 'date-fns';
import { RecentBooking } from '@/types';
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react';

interface RecentBookingsTableProps {
  bookings: RecentBooking[];
  loading?: boolean;
}

export default function RecentBookingsTable({
  bookings,
  loading = false,
}: RecentBookingsTableProps) {
  const getStatusColor = (paymentStatus: string, bookingStatus: string) => {
    if (paymentStatus === 'paid' && bookingStatus === 'confirmed') {
      return 'bg-green-100 text-green-700';
    }
    if (paymentStatus === 'pending') {
      return 'bg-amber-100 text-amber-700';
    }
    if (bookingStatus === 'cancelled') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-[#8a6ae8]/10 text-[#8a6ae8]';
  };

  const getStatusText = (paymentStatus: string, bookingStatus: string, validated: boolean) => {
    if (validated) return 'Validated';
    if (paymentStatus === 'paid') return 'Paid';
    if (paymentStatus === 'pending') return 'Pending';
    if (bookingStatus === 'cancelled') return 'Cancelled';
    return bookingStatus;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-UG')} UGX`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded-lg w-36 animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-100 rounded-lg w-24" />
                <div className="h-4 bg-gray-100 rounded-lg w-32" />
                <div className="h-4 bg-gray-100 rounded-lg w-40" />
                <div className="h-4 bg-gray-100 rounded-lg w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#8a6ae8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-[#8a6ae8]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-sm text-gray-500 mb-5">
            Customers will see your routes once you set them up. Start by creating your first route.
          </p>
          <Link
            href="/dashboard/routes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8a6ae8] text-white text-sm font-medium rounded-full hover:bg-[#7a5ad8] transition-colors"
          >
            Create Route
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#8a6ae8]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#8a6ae8]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-xs text-gray-500">Latest booking activity</p>
          </div>
        </div>
        <Link
          href="/dashboard/bookings"
          className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#8a6ae8] hover:bg-[#8a6ae8]/5 transition-colors group"
        >
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a6ae8] transition-colors" />
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Ref
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passenger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-[#8a6ae8]/5 cursor-pointer transition-colors"
                onClick={() => window.location.href = `/dashboard/bookings/${booking.id}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-[#8a6ae8]">
                    {booking.bookingReference}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.passengerName}</div>
                  <div className="text-xs text-gray-500">{booking.passengerPhone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.route.origin} → {booking.route.destination}
                  </div>
                  <div className="text-xs text-gray-500">{booking.route.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(booking.schedule.travelDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">{booking.schedule.departureTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">
                    {booking.seatNumbers.join(', ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      booking.paymentStatus,
                      booking.bookingStatus
                    )}`}
                  >
                    {getStatusText(booking.paymentStatus, booking.bookingStatus, booking.validated)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-50">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/dashboard/bookings/${booking.id}`}
            className="block px-5 py-4 hover:bg-[#8a6ae8]/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-[#8a6ae8]">
                {booking.bookingReference}
              </span>
              <span
                className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  booking.paymentStatus,
                  booking.bookingStatus
                )}`}
              >
                {getStatusText(booking.paymentStatus, booking.bookingStatus, booking.validated)}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {booking.passengerName}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {booking.route.origin} → {booking.route.destination}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {format(new Date(booking.schedule.travelDate), 'MMM dd')} • {booking.schedule.departureTime}
              </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
