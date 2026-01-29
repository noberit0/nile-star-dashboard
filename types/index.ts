export interface Operator {
  id: string;
  email: string;
  fullName: string;
  role: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: string;
  active: boolean;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    operator: Operator;
  };
}

export interface Stats {
  todayRevenue: number;
  todayBookings: number;
  activeRoutes: number;
  totalBuses: number;
}

export interface DashboardStats {
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
  recentBookings: RecentBooking[];
}

export interface RecentBooking {
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
    travelDate: Date;
  };
  seatNumbers: number[];
  totalPrice: number;
  paymentStatus: string;
  bookingStatus: string;
  validated: boolean;
  createdAt: string;
}

export interface SetupStatus {
  hasRoutes: boolean;
  hasSchedules: boolean;
  hasBuses: boolean;
  setupComplete: boolean;
  routesCount: number;
  schedulesCount: number;
  busesCount: number;
}

// Analytics Types
export interface AnalyticsOverview {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    todayBookings: number;
    todaysTrips: number;
    activeRoutes: number;
    activeBuses: number;
    activeSchedules: number;
  };
  growth: {
    bookings: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    revenue: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
  paymentStatus: {
    paid: number;
    pending: number;
    failed: number;
  };
  bookingStatus: {
    confirmed: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  count: number;
}

export interface RoutePerformance {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  totalBookings: number;
  paidBookings: number;
  revenue: number;
  averageOccupancy: number;
  totalSeats: number;
  bookedSeats: number;
}

export interface BookingPatterns {
  byDayOfWeek: {
    day: string;
    count: number;
  }[];
  byHourOfDay: {
    hour: number;
    count: number;
  }[];
  peak: {
    hour: { hour: number; count: number };
    day: { day: string; count: number };
  };
}

export interface WeeklyBookingsDay {
  date: string;
  dayName: string;
  bookings: number;
  cancelled: number;
  revenue: number;
}

export interface WeeklyBookings {
  weekStart: string;
  weekEnd: string;
  dailyBookings: WeeklyBookingsDay[];
  summary: {
    totalBookings: number;
    totalCancelled: number;
    totalRevenue: number;
    averagePerDay: number;
    busiestDay: string;
    slowestDay: string;
  };
}

export interface TodaysTrip {
  id: string;
  departureTime: string;
  route: {
    id: string;
    name: string;
    origin: string;
    destination: string;
  };
  bus: {
    id: string;
    plateNumber: string;
  } | null;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  occupancyPercent: number;
  isFull: boolean;
  totalBookings: number;
  paidBookings: number;
}

export interface TodaysTripsData {
  trips: TodaysTrip[];
  summary: {
    totalTrips: number;
    totalCapacity: number;
    totalBooked: number;
    totalAvailable: number;
    overallOccupancy: number;
    fullTrips: number;
  };
}
