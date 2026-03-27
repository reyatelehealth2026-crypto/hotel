import { NextResponse } from 'next/server'

// Webhook route removed — no payment gateway in use
export async function POST() {
  return NextResponse.json({ message: 'No payment gateway configured' }, { status: 200 })
}
