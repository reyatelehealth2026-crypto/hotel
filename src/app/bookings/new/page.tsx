import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BookingForm from '@/components/bookings/BookingForm'

export default function NewBookingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/bookings"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Booking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new room reservation</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <BookingForm />
      </div>
    </div>
  )
}
