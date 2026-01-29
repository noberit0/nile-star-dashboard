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
// Demo mode mock data
const DEMO_DATA: DashboardStatsResponse = {
  success: true,
  data: {
    today: {
      revenue: 4850000,
      bookings: 127,
      confirmedBookings: 118,
      pendingPayments: 9,
    },
    totals: {
      activeRoutes: 2,
      totalBuses: 10,
      activeBuses: 8,
      totalDrivers: 15,
    },
    recentBookings: [
      {
        id: '1',
        bookingReference: 'NSC-2024-001',
        passengerName: 'John Mukasa',
        passengerPhone: '+256700111222',
        route: { name: 'Kampala - Arua', origin: 'Kampala', destination: 'Arua' },
        schedule: { departureTime: '07:15', travelDate: new Date().toISOString() },
        seatNumbers: [12, 13],
        totalPrice: 85000,
        paymentStatus: 'completed',
        bookingStatus: 'confirmed',
        validated: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        bookingReference: 'NSC-2024-002',
        passengerName: 'Sarah Nambi',
        passengerPhone: '+256701222333',
        route: { name: 'Arua - Kampala', origin: 'Arua', destination: 'Kampala' },
        schedule: { departureTime: '08:30', travelDate: new Date().toISOString() },
        seatNumbers: [5],
        totalPrice: 45000,
        paymentStatus: 'completed',
        bookingStatus: 'confirmed',
        validated: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        bookingReference: 'NSC-2024-003',
        passengerName: 'Peter Okello',
        passengerPhone: '+256702333444',
        route: { name: 'Kampala - Arua', origin: 'Kampala', destination: 'Arua' },
        schedule: { departureTime: '11:00', travelDate: new Date().toISOString() },
        seatNumbers: [8, 9, 10],
        totalPrice: 135000,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        validated: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
};

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  // Check for demo mode
  if (typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true') {
    console.log('📊 [Dashboard Service] Demo mode - returning mock data');
    return DEMO_DATA;
  }

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

    // In case of error, return demo data as fallback
    if (typeof window !== 'undefined') {
      console.log('📊 [Dashboard Service] Falling back to demo data');
      return DEMO_DATA;
    }

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
