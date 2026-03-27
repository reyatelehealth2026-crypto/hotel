import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import GuestProfile from '@/components/guests/GuestProfile'
import type { Guest, Booking } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getGuestData(id: string) {
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const [guestRes, bookingsRes] = await Promise.all([
    supabaseAny.from('guests').select('*').eq('id', id).single(),
    supabaseAny
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('guest_id', id)
      .order('check_in', { ascending: false }),
  ])

  if (guestRes.error || !guestRes.data) return null

  return {
    guest: guestRes.data as Guest,
    bookings: (bookingsRes.data as Booking[]) ?? [],
  }
}

export default async function GuestDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getGuestData(id)

  if (!result) {
    return notFound()
  }

  const { guest, bookings } = result

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/guests"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">{guest.name}</p>
        </div>
      </div>

      <GuestProfile guest={guest} bookings={bookings} />
    </div>
  )
}
