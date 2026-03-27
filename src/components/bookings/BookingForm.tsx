'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, differenceInCalendarDays, parseISO } from 'date-fns'
import { Search, User, BedDouble, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Guest, Room, BookingSource, CreateBookingPayload, CreateGuestPayload } from '@/types'

interface BookingFormProps {
  onSuccess?: (bookingId: string) => void
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'guest' | 'room' | 'details' | 'confirm'>('guest')

  // Guest state
  const [guestSearch, setGuestSearch] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isNewGuest, setIsNewGuest] = useState(false)
  const [newGuestData, setNewGuestData] = useState<Partial<CreateGuestPayload>>({})
  const [searchLoading, setSearchLoading] = useState(false)

  // Room state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [roomsLoading, setRoomsLoading] = useState(false)

  // Booking state
  const [source, setSource] = useState<BookingSource>('direct')
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)))
      : 0
  const totalPrice = selectedRoom ? nights * selectedRoom.base_price : 0

  // Search guests
  const searchGuests = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setGuests([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/guests?search=${encodeURIComponent(query)}`)
      const { data } = await res.json()
      setGuests(data ?? [])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchGuests(guestSearch), 300)
    return () => clearTimeout(timer)
  }, [guestSearch, searchGuests])

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    if (!checkIn || !checkOut) return
    setRoomsLoading(true)
    try {
      const res = await fetch(`/api/rooms/available?check_in=${checkIn}&check_out=${checkOut}`)
      const { data } = await res.json()
      setAvailableRooms(data ?? [])
    } finally {
      setRoomsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)

    try {
      let guestId = selectedGuest?.id

      // Create new guest if needed
      if (isNewGuest && newGuestData.name && newGuestData.email) {
        const guestRes = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGuestData),
        })
        const { data: createdGuest, error: guestError } = await guestRes.json()
        if (guestError) throw new Error(guestError)
        guestId = createdGuest.id
      }

      if (!guestId || !selectedRoom) {
        throw new Error('Guest and room are required')
      }

      const payload: CreateBookingPayload = {
        guest_id: guestId,
        room_id: selectedRoom.id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        booking_source: source,
        special_requests: specialRequests || undefined,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const { data, error: bookingError } = await res.json()
      if (bookingError) throw new Error(bookingError)

      if (onSuccess) {
        onSuccess(data.id)
      } else {
        router.push('/bookings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['guest', 'room', 'details', 'confirm']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(['Guest', 'Room', 'Details', 'Confirm'] as const).map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                i < stepIndex
                  ? 'bg-brand-500 text-white'
                  : i === stepIndex
                  ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                i === stepIndex ? 'text-brand-600' : i < stepIndex ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
            {i < 3 && <div className={`flex-1 h-px ${i < stepIndex ? 'bg-brand-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Step 1: Guest */}
      {step === 'guest' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User size={20} className="text-brand-500" />
            Select Guest
          </h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsNewGuest(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                !isNewGuest
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Existing Guest
            </button>
            <button
              onClick={() => setIsNewGuest(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                isNewGuest
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              New Guest
            </button>
          </div>

          {!isNewGuest ? (
            <div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="form-input pl-9"
                />
              </div>
              {searchLoading && (
                <p className="text-sm text-gray-400 mt-2 px-1">Searching...</p>
              )}
              {guests.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {guests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => {
                        setSelectedGuest(guest)
                        setGuestSearch(guest.name)
                        setGuests([])
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        selectedGuest?.id === guest.id ? 'bg-brand-50 border-l-2 border-brand-500' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                        <p className="text-xs text-gray-400">{guest.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedGuest && (
                <div className="mt-3 p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                    {selectedGuest.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedGuest.name}</p>
                    <p className="text-xs text-gray-500">{selectedGuest.email} · {selectedGuest.nationality ?? 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={newGuestData.name ?? ''}
                    onChange={(e) => setNewGuestData((p) => ({ ...p, name: e.target.value }))}
                    className="form-input"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={newGuestData.email ?? ''}
                    onChange={(e) => setNewGuestData((p) => ({ ...p, email: e.target.value }))}
                    className="form-input"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={newGuestData.phone ?? ''}
                    onChange={(e) => setNewGuestData((p) => ({ ...p, phone: e.target.value }))}
                    className="form-input"
                    placeholder="+1-555-0100"
                  />
                </div>
                <div>
                  <label className="form-label">Nationality</label>
                  <input
                    type="text"
                    value={newGuestData.nationality ?? ''}
                    onChange={(e) => setNewGuestData((p) => ({ ...p, nationality: e.target.value }))}
                    className="form-input"
                    placeholder="American"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep('room')}
              disabled={!isNewGuest ? !selectedGuest : !newGuestData.name || !newGuestData.email}
              className="btn-primary"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Room */}
      {step === 'room' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BedDouble size={20} className="text-brand-500" />
            Select Room & Dates
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Check-in Date *</label>
              <input
                type="date"
                value={checkIn}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckIn(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Check-out Date *</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCheckOut(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button
            onClick={fetchAvailableRooms}
            disabled={!checkIn || !checkOut || roomsLoading}
            className="btn-secondary w-full"
          >
            {roomsLoading ? 'Checking...' : 'Check Availability'}
          </button>

          {availableRooms.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {availableRooms.length} rooms available for {nights} night{nights !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {availableRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-brand-50 border-brand-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Room {room.room_number}
                        <span className="ml-2 text-xs font-normal text-gray-500 capitalize">{room.type}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Floor {room.floor ?? 'N/A'} · {room.capacity} guests
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${room.base_price}/night</p>
                      <p className="text-xs text-brand-600">Total: ${(nights * room.base_price).toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('guest')} className="btn-secondary">
              Back
            </button>
            <button
              onClick={() => setStep('details')}
              disabled={!selectedRoom}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-500" />
            Booking Details
          </h2>

          <div>
            <label className="form-label">Booking Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as BookingSource)}
              className="form-input"
            >
              <option value="direct">Direct</option>
              <option value="booking.com">Booking.com</option>
              <option value="airbnb">Airbnb</option>
            </select>
          </div>

          <div>
            <label className="form-label">Special Requests</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className="form-input resize-none"
              placeholder="Any special requests or notes for this booking..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('room')} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep('confirm')} className="btn-primary flex-1">
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-brand-500" />
            Confirm Booking
          </h2>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-500">Guest</span>
              <span className="font-medium text-gray-900">
                {selectedGuest?.name ?? newGuestData.name}
              </span>

              <span className="text-gray-500">Room</span>
              <span className="font-medium text-gray-900">
                Room {selectedRoom?.room_number} ({selectedRoom?.type})
              </span>

              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-gray-900">
                {checkIn ? format(parseISO(checkIn), 'MMMM d, yyyy') : '—'}
              </span>

              <span className="text-gray-500">Check-out</span>
              <span className="font-medium text-gray-900">
                {checkOut ? format(parseISO(checkOut), 'MMMM d, yyyy') : '—'}
              </span>

              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>

              <span className="text-gray-500">Rate</span>
              <span className="font-medium text-gray-900">${selectedRoom?.base_price}/night</span>

              <span className="text-gray-500">Source</span>
              <span className="font-medium text-gray-900 capitalize">{source}</span>

              {specialRequests && (
                <>
                  <span className="text-gray-500">Requests</span>
                  <span className="font-medium text-gray-900">{specialRequests}</span>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-brand-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('details')} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Creating booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
