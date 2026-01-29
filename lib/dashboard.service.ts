import api from './api';

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    today: {
      revenue: number;
      bookings: number;
      confirmedBookings: number;
      pendingPayments: number;
    };
    totals: {
      activeRoutes: number;
      totalBuses: number;
      activeBuses: number;
      totalDrivers: number;
    };
    recentBookings: Array<{
      id: string;
      bookingReference: string;
      passengerName: string;
      passengerPhone: string;
      route: {
        name: string;
        origin: string;
        destination: string;
      };
      schedule: {
        departureTime: string;
        travelDate: string;
      };
      seatNumbers: number[];
      totalPrice: number;
      paymentStatus: string;
      bookingStatus: string;
      validated: boolean;
      createdAt: string;
    }>;
  };
}

/**
 * Fetch dashboard statistics from backend
 *
 * API Endpoint: GET /api/v1/operator/dashboard/summary
 *
 * Returns:
 * - Today's revenue and bookings
 * - Active routes and buses count
 * - Recent bookings list
 *
 * @returns Promise<DashboardStatsResponse>
 * @throws Error if API call fails
 */
export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  try {
    console.log('📊 [Dashboard Service] Fetching dashboard statistics...');

    const response = await api.get<DashboardStatsResponse>('/operator/dashboard/summary');

    console.log('✅ [Dashboard Service] Stats fetched successfully');
    console.log('📊 Dashboard Data:', {
      todayRevenue: response.data.data?.today?.revenue,
      todayBookings: response.data.data?.today?.bookings,
      confirmedBookings: response.data.data?.today?.confirmedBookings,
      pendingPayments: response.data.data?.today?.pendingPayments,
      activeRoutes: response.data.data?.totals?.activeRoutes,
      totalBuses: response.data.data?.totals?.totalBuses,
      activeBuses: response.data.data?.totals?.activeBuses,
      recentBookingsCount: response.data.data?.recentBookings?.length,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Dashboard Service] Failed to fetch dashboard stats:', error);

    if (error.response) {
      // Server responded with error status
      console.error('Server Error:', {
        status: error.response.status,
        message: error.response.data?.message,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response from server');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }

    throw error;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-UG')} UGX`;
}

/**
 * Format date for display
 */
export function formatDate(date?: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return (date || new Date()).toLocaleDateString('en-US', options);
}
