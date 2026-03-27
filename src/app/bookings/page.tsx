'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw, CalendarDays } from 'lucide-react'
import BookingTable from '@/components/bookings/BookingTable'
import type { Booking, BookingStatus } from '@/types'

const statusFilters: { value: string; label: string; color?: string }[] = [
  { value: '',            label: 'ทั้งหมด' },
  { value: 'confirmed',   label: 'ยืนยันแล้ว',     color: '#2B7EC9' },
  { value: 'checked_in',  label: 'เช็คอินแล้ว',     color: '#1DAF6E' },
  { value: 'checked_out', label: 'เช็คเอาท์แล้ว',   color: '#6B7280' },
  { value: 'cancelled',   label: 'ยกเลิกแล้ว',      color: '#E5503A' },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/bookings?${params}`)
      const { data, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setBookings(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.guest?.name?.toLowerCase().includes(q) ||
      b.guest?.phone?.toLowerCase().includes(q) ||
      b.room?.room_number?.toLowerCase().includes(q)
    )
  })

  const handleDelete = (id: string) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' as BookingStatus, payment_status: 'cancelled' } : b))

  const handleStatusChange = (id: string, status: BookingStatus) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))

  const stats = {
    total:       bookings.length,
    confirmed:   bookings.filter((b) => b.status === 'confirmed').length,
    checked_in:  bookings.filter((b) => b.status === 'checked_in').length,
    checked_out: bookings.filter((b) => b.status === 'checked_out').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Trirong, serif' }}>
            การจอง
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">รายการจองทั้งหมด {bookings.length} รายการ</p>
        </div>
        <Link href="/bookings/new" className="btn-primary">
          <Plus size={16} />
          สร้างการจองใหม่
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ทั้งหมด',         value: stats.total,       color: '#C9882A', bg: '#FFF8E7' },
          { label: 'ยืนยันแล้ว',       value: stats.confirmed,   color: '#2B7EC9', bg: '#EFF6FF' },
          { label: 'เช็คอินแล้ว',      value: stats.checked_in,  color: '#1DAF6E', bg: '#EDFAF3' },
          { label: 'เช็คเอาท์แล้ว',   value: stats.checked_out, color: '#6B7280', bg: '#F7F2EA' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border-2 p-4 flex items-center gap-3 shadow-warm"
            style={{ borderColor: s.color + '40', backgroundColor: s.bg }}
          >
            <CalendarDays size={20} style={{ color: s.color }} />
            <div>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="page-card">
        <div className="card-header flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อแขก หรือเบอร์โทร..."
              className="form-input pl-9 w-60"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 active:scale-95"
                style={
                  statusFilter === f.value
                    ? { backgroundColor: f.color ?? '#C9882A', color: '#FFF' }
                    : { backgroundColor: '#F7F2EA', color: '#6B7280' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <button onClick={fetchBookings} className="btn-secondary ml-auto" title="รีเฟรช">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            รีเฟรช
          </button>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> กำลังโหลด...
          </div>
        ) : (
          <BookingTable bookings={filtered} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  )
}
