import { Search, UserPlus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import GuestCard from '@/components/guests/GuestCard'
import type { Guest, Booking } from '@/types'

export const dynamic = 'force-dynamic'

async function getGuests() {
  const supabase = createServiceClient()

  const [guestsRes, bookingsRes] = await Promise.all([
    supabase.from('guests').select('*').order('name'),
    supabase
      .from('bookings')
      .select('guest_id, total_price, status, payment_status')
      .neq('status', 'cancelled'),
  ])

  const guests: Guest[] = guestsRes.data ?? []
  const bookings: Pick<Booking, 'guest_id' | 'total_price' | 'status' | 'payment_status'>[] =
    bookingsRes.data ?? []

  return { guests, bookings }
}

export default async function GuestsPage() {
  const { guests, bookings } = await getGuests()

  const getGuestStats = (guestId: string) => {
    const guestBookings = bookings.filter((b) => b.guest_id === guestId)
    const totalSpend = guestBookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + Number(b.total_price), 0)
    return { bookingCount: guestBookings.length, totalSpend }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-sm text-gray-500 mt-0.5">{guests.length} registered guests</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={16} />
          Add Guest
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search guests..."
          className="form-input pl-9"
        />
      </div>

      {/* Guest Grid */}
      {guests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No guests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {guests.map((guest) => {
            const { bookingCount, totalSpend } = getGuestStats(guest.id)
            return (
              <GuestCard
                key={guest.id}
                guest={guest}
                bookingCount={bookingCount}
                totalSpend={totalSpend}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
