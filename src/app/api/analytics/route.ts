import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import type { AnalyticsData, MonthlyRevenue, OccupancyByMonth, RevenueByRoomType } from '@/types'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get all bookings with room data for the last 12 months
    const twelveMonthsAgo = format(subMonths(new Date(), 11), 'yyyy-MM-dd')

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(type, base_price)')
      .neq('status', 'cancelled')
      .gte('check_in', twelveMonthsAgo)
      .order('check_in')

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    const { data: rooms } = await supabase.from('rooms').select('id')
    const totalRooms = rooms?.length ?? 1

    // Build monthly revenue and occupancy
    const monthlyMap = new Map<string, { revenue: number; bookings: number; occupiedDays: number; totalDays: number }>()

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const key = format(monthDate, 'yyyy-MM')
      const daysInMonth = endOfMonth(monthDate).getDate()
      monthlyMap.set(key, {
        revenue: 0,
        bookings: 0,
        occupiedDays: 0,
        totalDays: daysInMonth * totalRooms,
      })
    }

    const revenueByType = new Map<string, { revenue: number; bookings: number }>()

    for (const booking of bookings ?? []) {
      const month = booking.check_in.substring(0, 7) // 'yyyy-MM'
      const entry = monthlyMap.get(month)
      if (entry) {
        entry.revenue += Number(booking.total_price)
        entry.bookings += 1
        // Approximate occupied days
        const nights = Math.ceil(
          (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        entry.occupiedDays += nights
      }

      // Revenue by room type
      const roomType = (booking.room as { type: string } | null)?.type ?? 'standard'
      const typeEntry = revenueByType.get(roomType) ?? { revenue: 0, bookings: 0 }
      typeEntry.revenue += Number(booking.total_price)
      typeEntry.bookings += 1
      revenueByType.set(roomType, typeEntry)
    }

    const monthlyRevenue: MonthlyRevenue[] = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        revenue: Math.round(data.revenue * 100) / 100,
        bookings: data.bookings,
      })
    )

    const occupancyByMonth: OccupancyByMonth[] = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        occupancy_rate:
          data.totalDays > 0
            ? Math.round((data.occupiedDays / data.totalDays) * 100)
            : 0,
      })
    )

    const revenueByRoomType: RevenueByRoomType[] = Array.from(revenueByType.entries()).map(
      ([type, data]) => ({
        type: type as RevenueByRoomType['type'],
        revenue: Math.round(data.revenue * 100) / 100,
        bookings: data.bookings,
      })
    )

    // Calculate ADR and RevPAR for current month
    const currentMonth = format(new Date(), 'yyyy-MM')
    const currentMonthData = monthlyMap.get(currentMonth)
    const adr =
      currentMonthData && currentMonthData.bookings > 0
        ? Math.round((currentMonthData.revenue / currentMonthData.bookings) * 100) / 100
        : 0
    const revpar =
      currentMonthData && currentMonthData.totalDays > 0
        ? Math.round((currentMonthData.revenue / currentMonthData.totalDays) * 100) / 100
        : 0

    const analytics: AnalyticsData = {
      monthly_revenue: monthlyRevenue,
      occupancy_by_month: occupancyByMonth,
      adr,
      revpar,
      revenue_by_room_type: revenueByRoomType,
    }

    return NextResponse.json({ data: analytics, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
