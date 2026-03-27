'use client'

import { format, addDays, isWithinInterval, parseISO } from 'date-fns'
import type { Room, Booking, HousekeepingLog } from '@/types'

interface RoomGridProps {
  rooms: Room[]
  bookings: Booking[]
  housekeepingLogs: HousekeepingLog[]
}

type DisplayStatus = 'available' | 'occupied' | 'maintenance' | 'housekeeping'

function getRoomStatus(room: Room, bookings: Booking[], logs: HousekeepingLog[]): DisplayStatus {
  if (room.status === 'maintenance') return 'maintenance'
  const today = new Date()
  const active = bookings.find(
    (b) =>
      b.room_id === room.id &&
      (b.status === 'checked_in' || b.status === 'confirmed') &&
      isWithinInterval(today, { start: parseISO(b.check_in), end: parseISO(b.check_out) })
  )
  if (active) return 'occupied'
  const latest = logs
    .filter((l) => l.room_id === room.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  if (latest?.status === 'in_progress') return 'housekeeping'
  return 'available'
}

function getCurrentBooking(room: Room, bookings: Booking[]) {
  const today = new Date()
  return bookings.find(
    (b) =>
      b.room_id === room.id &&
      (b.status === 'checked_in' || b.status === 'confirmed') &&
      isWithinInterval(today, { start: parseISO(b.check_in), end: parseISO(b.check_out) })
  )
}

const statusCfg: Record<DisplayStatus, { bg: string; border: string; text: string; dot: string; label: string; thLabel: string }> = {
  available:    { bg: '#F0FDF6', border: '#86EFAD', text: '#15803D', dot: '#22C55E', label: 'Available',    thLabel: 'ว่าง' },
  occupied:     { bg: '#FFF1F0', border: '#FCA5A5', text: '#B91C1C', dot: '#EF4444', label: 'Occupied',     thLabel: 'มีผู้พัก' },
  maintenance:  { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', dot: '#F59E0B', label: 'Maintenance',  thLabel: 'ซ่อมบำรุง' },
  housekeeping: { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8', dot: '#3B82F6', label: 'Housekeeping', thLabel: 'กำลังทำความสะอาด' },
}

const typeLabels: Record<string, string> = {
  standard: 'มาตรฐาน',
  deluxe:   'ดีลักซ์',
  suite:    'สวีท',
}

const typeShort: Record<string, string> = {
  standard: 'STD',
  deluxe:   'DLX',
  suite:    'STE',
}

export default function RoomGrid({ rooms, bookings, housekeepingLogs }: RoomGridProps) {
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i))
  const thDays = ['อา','จ','อ','พ','พฤ','ศ','ส']

  if (rooms.length === 0) {
    return (
      <div className="page-card">
        <div className="card-header">
          <h2 className="font-bold text-gray-900 text-base">สถานะห้องพัก</h2>
        </div>
        <div className="py-16 text-center text-gray-400 text-sm">
          ยังไม่มีข้อมูลห้องพัก — ไปที่ <strong>จัดการห้อง</strong> เพื่อเพิ่มห้อง
        </div>
      </div>
    )
  }

  const counts = {
    available:    rooms.filter((r) => getRoomStatus(r, bookings, housekeepingLogs) === 'available').length,
    occupied:     rooms.filter((r) => getRoomStatus(r, bookings, housekeepingLogs) === 'occupied').length,
    maintenance:  rooms.filter((r) => getRoomStatus(r, bookings, housekeepingLogs) === 'maintenance').length,
    housekeeping: rooms.filter((r) => getRoomStatus(r, bookings, housekeepingLogs) === 'housekeeping').length,
  }

  return (
    <div className="page-card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h2 className="font-bold text-gray-900 text-base">แผนผังห้องพัก</h2>
          <p className="text-xs text-gray-400 mt-0.5">สถานะวันนี้ · {rooms.length} ห้องทั้งหมด</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {(Object.keys(statusCfg) as DisplayStatus[]).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusCfg[key].dot }} />
              <span className="text-xs text-gray-600">{statusCfg[key].thLabel}</span>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: statusCfg[key].bg, color: statusCfg[key].text }}
              >
                {counts[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Week timeline header */}
      <div className="grid grid-cols-[160px_1fr_140px] items-center gap-2 px-4 py-2 bg-warm-muted border-b border-warm-border text-xs font-semibold text-gray-500">
        <span>ห้อง</span>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
          {weekDays.map((day, i) => {
            const isToday = i === 0
            return (
              <div
                key={day.toISOString()}
                className="text-center py-1 rounded-lg"
                style={isToday ? { backgroundColor: '#C9882A', color: '#FFF' } : {}}
              >
                <div className="text-xs">{thDays[day.getDay()]}</div>
                <div className="font-bold text-sm leading-tight">{format(day, 'd')}</div>
              </div>
            )
          })}
        </div>
        <span className="text-right">ผู้เข้าพัก</span>
      </div>

      {/* Room rows */}
      <div className="divide-y divide-warm-border">
        {rooms.map((room) => {
          const status = getRoomStatus(room, bookings, housekeepingLogs)
          const cfg = statusCfg[status]
          const currentBooking = getCurrentBooking(room, bookings)

          return (
            <div
              key={room.id}
              className="grid grid-cols-[160px_1fr_140px] items-center gap-2 px-4 py-3 hover:bg-warm-muted transition-colors"
            >
              {/* Room cell */}
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  <span className="text-lg font-extrabold leading-none" style={{ color: cfg.text }}>
                    {room.room_number}
                  </span>
                  <span className="text-xs font-semibold mt-0.5" style={{ color: cfg.text, opacity: 0.7 }}>
                    {typeShort[room.type] ?? room.type.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-0.5"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    {cfg.thLabel}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {typeLabels[room.type] ?? room.type} · ฿{Number(room.base_price).toLocaleString()}/คืน
                  </p>
                </div>
              </div>

              {/* Timeline cells */}
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                {weekDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd')
                  const dayBooking = bookings.find(
                    (b) =>
                      b.room_id === room.id &&
                      b.status !== 'cancelled' &&
                      dayStr >= b.check_in &&
                      dayStr < b.check_out
                  )
                  const isCheckIn = dayBooking && dayStr === dayBooking.check_in

                  return (
                    <div
                      key={dayStr}
                      className="h-10 rounded-lg text-xs flex items-center justify-center font-medium transition-colors"
                      style={
                        dayBooking
                          ? { backgroundColor: '#FFE4E0', border: '1px solid #FCA5A5', color: '#B91C1C' }
                          : { backgroundColor: '#F0FDF6', border: '1px solid #BBF7D0', color: '#15803D' }
                      }
                      title={dayBooking ? `${dayBooking.guest?.name ?? 'ผู้เข้าพัก'} (${dayBooking.check_in}–${dayBooking.check_out})` : 'ว่าง'}
                    >
                      {isCheckIn && (
                        <span className="truncate px-1 text-xs">
                          {dayBooking?.guest?.name?.split(' ')[0] ?? 'CI'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Guest info */}
              <div className="text-right">
                {currentBooking ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {currentBooking.guest?.name ?? 'ผู้เข้าพัก'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      เช็คเอาท์ {format(parseISO(currentBooking.check_out), 'd MMM')}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
