import { format, parseISO } from 'date-fns'
import { Mail, Phone, Globe, StickyNote, Heart, Calendar, DollarSign } from 'lucide-react'
import type { Guest, Booking } from '@/types'

interface GuestProfileProps {
  guest: Guest
  bookings: Booking[]
}

const bookingStatusBadge: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-emerald-100 text-emerald-700',
  checked_out: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

export default function GuestProfile({ guest, bookings }: GuestProfileProps) {
  const totalSpend = bookings
    .filter((b) => b.status !== 'cancelled' && b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_price), 0)

  const completedStays = bookings.filter((b) => b.status === 'checked_out').length
  const upcomingStays = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked_in'
  ).length

  const initials = guest.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-500 text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{guest.name}</h1>
            {guest.nationality && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Globe size={14} />
                {guest.nationality}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Guest since {format(parseISO(guest.created_at), 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedStays}</p>
              <p className="text-xs text-gray-400">Completed Stays</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-600">${totalSpend.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Total Spend</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{upcomingStays}</p>
              <p className="text-xs text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                <Mail size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-800">{guest.email}</p>
              </div>
            </div>
            {guest.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                  <Phone size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{guest.phone}</p>
                </div>
              </div>
            )}
            {guest.nationality && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                  <Globe size={14} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nationality</p>
                  <p className="font-medium text-gray-800">{guest.nationality}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Preferences</h2>
          {guest.preferences ? (
            <div className="flex items-start gap-2 text-sm">
              <Heart size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{guest.preferences}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No preferences recorded</p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Notes</h2>
          {guest.notes ? (
            <div className="flex items-start gap-2 text-sm">
              <StickyNote size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{guest.notes}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No notes</p>
          )}
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-brand-500" />
            Booking History
          </h2>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No bookings found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="text-center w-12">
                    <p className="text-xs font-bold text-brand-500 uppercase">
                      {format(parseISO(booking.check_in), 'MMM')}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {format(parseISO(booking.check_in), 'd')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(booking.check_in), 'yyyy')}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Room {booking.room?.room_number ?? '—'}
                      <span className="ml-2 text-xs text-gray-400 capitalize font-normal">
                        {booking.room?.type}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(booking.check_in), 'MMM d')} –{' '}
                      {format(parseISO(booking.check_out), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`badge ${bookingStatusBadge[booking.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <DollarSign size={14} className="text-gray-400" />
                    {Number(booking.total_price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
