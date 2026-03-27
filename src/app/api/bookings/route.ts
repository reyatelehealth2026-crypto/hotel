import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { CreateBookingPayload } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const guestId = searchParams.get('guest_id')

    const supabase = createServiceClient()
    let query = supabase
      .from('bookings')
      .select('*, guest:guests(*), room:rooms(*)')
      .order('check_in', { ascending: false })

    if (status) query = query.eq('status', status)
    if (from) query = query.gte('check_in', from)
    if (to) query = query.lte('check_out', to)
    if (guestId) query = query.eq('guest_id', guestId)

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingPayload

    // Validate required fields
    if (!body.guest_id || !body.room_id || !body.check_in || !body.check_out) {
      return NextResponse.json(
        { data: null, error: 'Missing required fields: guest_id, room_id, check_in, check_out' },
        { status: 400 }
      )
    }

    if (new Date(body.check_out) <= new Date(body.check_in)) {
      return NextResponse.json(
        { data: null, error: 'check_out must be after check_in' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check room availability for the date range
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', body.room_id)
      .neq('status', 'cancelled')
      .lt('check_in', body.check_out)
      .gt('check_out', body.check_in)

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json(
        { data: null, error: 'Room is not available for the selected dates' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        guest_id: body.guest_id,
        room_id: body.room_id,
        check_in: body.check_in,
        check_out: body.check_out,
        total_price: body.total_price,
        booking_source: body.booking_source ?? 'direct',
        special_requests: body.special_requests ?? null,
        status: 'confirmed',
        payment_status: 'pending',
      })
      .select('*, guest:guests(*), room:rooms(*)')
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
