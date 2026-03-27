import Link from 'next/link'
import { Mail, Phone, Globe, Star } from 'lucide-react'
import type { Guest } from '@/types'

interface GuestCardProps {
  guest: Guest
  bookingCount?: number
  totalSpend?: number
}

export default function GuestCard({ guest, bookingCount = 0, totalSpend = 0 }: GuestCardProps) {
  const initials = guest.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link href={`/guests/${guest.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer">
        {/* Avatar and name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-500 text-white font-semibold text-base flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{guest.name}</h3>
            {guest.nationality && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Globe size={11} />
                {guest.nationality}
              </p>
            )}
          </div>
          {bookingCount > 2 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-medium">VIP</span>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={12} className="flex-shrink-0" />
            <span className="truncate">{guest.email}</span>
          </div>
          {guest.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone size={12} className="flex-shrink-0" />
              <span>{guest.phone}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{bookingCount}</p>
            <p className="text-xs text-gray-400">Stays</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">${totalSpend.toFixed(0)}</p>
            <p className="text-xs text-gray-400">Total Spend</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xs font-medium text-brand-600 px-2 py-1 bg-brand-50 rounded-full">
              View Profile
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
