export type RoomType = 'standard' | 'deluxe' | 'suite'
export type RoomStatus = 'available' | 'occupied' | 'maintenance'
export type HousekeepingStatus = 'clean' | 'dirty' | 'in_progress'
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'
export type BookingSource = 'direct' | 'booking.com' | 'airbnb'
export type PaymentGatewayStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Room {
  id: string
  room_number: string
  type: RoomType
  base_price: number
  status: RoomStatus
  floor: number | null
  capacity: number
  created_at: string
}

export interface Guest {
  id: string
  name: string
  email: string
  phone: string | null
  nationality: string | null
  preferences: string | null
  notes: string | null
  created_at: string
}

export interface Booking {
  id: string
  guest_id: string
  room_id: string
  check_in: string
  check_out: string
  total_price: number
  payment_status: PaymentStatus
  booking_source: BookingSource
  status: BookingStatus
  special_requests: string | null
  created_at: string
  // Joined fields
  guest?: Guest
  room?: Room
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  status: PaymentGatewayStatus
  gateway_reference: string | null
  payment_method: string | null
  created_at: string
}

export interface HousekeepingLog {
  id: string
  room_id: string
  status: HousekeepingStatus
  updated_by: string | null
  notes: string | null
  created_at: string
  room?: Room
}

export interface RoomWithHousekeeping extends Room {
  latest_housekeeping?: HousekeepingLog
  current_booking?: Booking
}

export interface DashboardStats {
  total_rooms: number
  occupied_today: number
  available_today: number
  occupancy_rate: number
  revenue_today: number
  checkins_today: number
  checkouts_today: number
}

export interface AnalyticsData {
  monthly_revenue: MonthlyRevenue[]
  occupancy_by_month: OccupancyByMonth[]
  adr: number
  revpar: number
  revenue_by_room_type: RevenueByRoomType[]
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  bookings: number
}

export interface OccupancyByMonth {
  month: string
  occupancy_rate: number
}

export interface RevenueByRoomType {
  type: RoomType
  revenue: number
  bookings: number
}

export interface CreateBookingPayload {
  guest_id: string
  room_id: string
  check_in: string
  check_out: string
  total_price: number
  booking_source: BookingSource
  special_requests?: string
}

export interface CreateGuestPayload {
  name: string
  email: string
  phone?: string
  nationality?: string
  preferences?: string
  notes?: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
