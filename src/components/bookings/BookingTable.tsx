'use client'

import { useState } from 'react'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { Trash2, ChevronUp, ChevronDown, LogIn, LogOut } from 'lucide-react'
import type { Booking, BookingStatus, PaymentStatus } from '@/types'

interface BookingTableProps {
  bookings: Booking[]
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: BookingStatus) => void
}

const statusTh: Record<BookingStatus, string> = {
  confirmed:   'ยืนยันแล้ว',
  checked_in:  'เช็คอินแล้ว',
  checked_out: 'เช็คเอาท์แล้ว',
  cancelled:   'ยกเลิกแล้ว',
}
const payTh: Record<PaymentStatus, string> = {
  pending:  'รอชำระ',
  paid:     'ชำระแล้ว',
  cancelled:'ยกเลิก',
  refunded: 'คืนเงิน',
}
const statusChip: Record<BookingStatus, string> = {
  confirmed:   'chip-confirmed',
  checked_in:  'chip-checked_in',
  checked_out: 'chip-checked_out',
  cancelled:   'chip-cancelled',
}
const payChip: Record<PaymentStatus, string> = {
  pending:  'chip-pending',
  paid:     'chip-paid',
  cancelled:'chip-cancelled',
  refunded: 'chip-refunded',
}

type SortField = 'check_in' | 'check_out' | 'total_price'

export default function BookingTable({ bookings, onDelete, onStatusChange }: BookingTableProps) {
  const [sortField, setSortField] = useState<SortField>('check_in')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...bookings].sort((a, b) => {
    const aVal = sortField === 'total_price' ? Number(a.total_price) : String(a[sortField])
    const bVal = sortField === 'total_price' ? Number(b.total_price) : String(b[sortField])
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const patchStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok && onStatusChange) onStatusChange(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการยกเลิกการจองนี้?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (res.ok && onDelete) onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const SortBtn = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />
      : <ChevronUp size={13} className="text-gray-300" />

  if (bookings.length === 0) {
    return <div className="py-16 text-center text-gray-400 text-sm">ไม่พบรายการจอง</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warm-border bg-warm-muted text-xs font-semibold text-gray-500">
            <th className="px-4 py-3 text-left">ผู้เข้าพัก</th>
            <th className="px-4 py-3 text-left">ห้อง</th>
            <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('check_in')}>
              <div className="flex items-center gap-1">เช็คอิน <SortBtn field="check_in" /></div>
            </th>
            <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('check_out')}>
              <div className="flex items-center gap-1">เช็คเอาท์ <SortBtn field="check_out" /></div>
            </th>
            <th className="px-4 py-3 text-center">คืน</th>
            <th className="px-4 py-3 text-left">สถานะ</th>
            <th className="px-4 py-3 text-left">ชำระเงิน</th>
            <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('total_price')}>
              <div className="flex items-center justify-end gap-1">ยอดรวม <SortBtn field="total_price" /></div>
            </th>
            <th className="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-border">
          {sorted.map((booking) => {
            const nights = differenceInCalendarDays(parseISO(booking.check_out), parseISO(booking.check_in))
            const status = booking.status as BookingStatus
            const pay = booking.payment_status as PaymentStatus
            const isUpdating = updatingId === booking.id

            return (
              <tr key={booking.id} className="hover:bg-warm-muted transition-colors">
                {/* Guest */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#C9882A,#855410)' }}
                    >
                      {booking.guest?.name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.guest?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{booking.guest?.phone ?? booking.guest?.email ?? ''}</p>
                    </div>
                  </div>
                </td>

                {/* Room badge */}
                <td className="px-4 py-3">
                  <div
                    className="inline-flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 text-center"
                    style={{ backgroundColor: '#FFF8E7', borderColor: '#FFE08A' }}
                  >
                    <span className="text-sm font-extrabold text-gray-800 leading-none">{booking.room?.room_number ?? '—'}</span>
                    <span className="text-xs text-gray-500 leading-tight">
                      {booking.room?.type === 'standard' ? 'STD' : booking.room?.type === 'deluxe' ? 'DLX' : 'STE'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                  {format(parseISO(booking.check_in), 'd MMM yy')}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                  {format(parseISO(booking.check_out), 'd MMM yy')}
                </td>

                {/* Nights */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-warm-muted text-xs font-bold text-gray-700">
                    {nights}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className={`badge ${statusChip[status] ?? ''}`}>{statusTh[status] ?? status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${payChip[pay] ?? ''}`}>{payTh[pay] ?? pay}</span>
                </td>

                <td className="px-4 py-3 text-right font-bold text-gray-900 whitespace-nowrap">
                  ฿{Number(booking.total_price).toLocaleString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {status === 'confirmed' && (
                      <button
                        onClick={() => patchStatus(booking.id, 'checked_in')}
                        disabled={isUpdating}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: '#1DAF6E' }}
                      >
                        <LogIn size={12} /> เช็คอิน
                      </button>
                    )}
                    {status === 'checked_in' && (
                      <button
                        onClick={() => patchStatus(booking.id, 'checked_out')}
                        disabled={isUpdating}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: '#2B7EC9' }}
                      >
                        <LogOut size={12} /> เช็คเอาท์
                      </button>
                    )}
                    {status !== 'cancelled' && status !== 'checked_out' && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        disabled={deletingId === booking.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
