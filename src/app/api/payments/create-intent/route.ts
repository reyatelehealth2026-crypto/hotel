import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Manual payment recording — no payment gateway
export async function POST(request: NextRequest) {
  try {
    const { booking_id, payment_method, amount } = await request.json() as {
      booking_id: string
      payment_method: string
      amount: number
    }

    if (!booking_id || !payment_method || !amount) {
      return NextResponse.json(
        { data: null, error: 'booking_id, payment_method, and amount are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        amount,
        status: 'completed',
        payment_method,
        gateway_reference: null,
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ data: null, error: paymentError.message }, { status: 500 })
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', booking_id)

    return NextResponse.json({ data: payment, error: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
