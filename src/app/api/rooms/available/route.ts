import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkIn = searchParams.get('check_in')
    const checkOut = searchParams.get('check_out')

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { data: null, error: 'check_in and check_out are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Find rooms that have overlapping bookings
    const { data: conflictingRooms } = await supabase
      .from('bookings')
      .select('room_id')
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    const unavailableRoomIds = (conflictingRooms ?? []).map((b: { room_id: string }) => b.room_id)

    let query = supabase
      .from('rooms')
      .select('*')
      .neq('status', 'maintenance')
      .order('room_number')

    if (unavailableRoomIds.length > 0) {
      query = query.not('id', 'in', `(${unavailableRoomIds.join(',')})`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
