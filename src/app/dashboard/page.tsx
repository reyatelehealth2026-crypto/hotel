import { format } from 'date-fns'
import { BedDouble, Users, CheckCircle2, TrendingUp, DoorOpen, DoorClosed } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import RoomGrid from '@/components/dashboard/RoomGrid'
import HousekeepingStatus from '@/components/dashboard/HousekeepingStatus'
import type { Room, Booking, HousekeepingLog } from '@/types'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const supabase = createServiceClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [roomsRes, bookingsRes, logsRes] = await Promise.all([
    supabase.from('rooms').select('*').order('room_number'),
    supabase.from('bookings').select('*, guest:guests(*), room:rooms(*)').neq('status', 'cancelled').order('check_in'),
    supabase.from('housekeeping_logs').select('*, room:rooms(*)').order('created_at', { ascending: false }),
  ])

  const rooms: Room[] = roomsRes.data ?? []
  const bookings: Booking[] = (bookingsRes.data as Booking[]) ?? []
  const logs: HousekeepingLog[] = (logsRes.data as HousekeepingLog[]) ?? []

  const totalRooms = rooms.length
  const occupiedToday = bookings.filter(
    (b) => (b.status === 'checked_in' || b.status === 'confirmed') && b.check_in <= today && b.check_out > today
  ).length
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length
  const availableToday = totalRooms - occupiedToday - maintenanceCount
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedToday / totalRooms) * 100) : 0
  const checkinsToday = bookings.filter((b) => b.check_in === today).length
  const checkoutsToday = bookings.filter((b) => b.check_out === today).length

  return { rooms, bookings, logs, stats: { totalRooms, occupiedToday, availableToday, occupancyRate, checkinsToday, checkoutsToday } }
}

export default async function DashboardPage() {
  const { rooms, bookings, logs, stats } = await getDashboardData()

  const now = new Date()
  const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const thDays = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์']
  const dateStr = `${thDays[now.getDay()]} ${now.getDate()} ${thMonths[now.getMonth()]} ${now.getFullYear() + 543}`

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Trirong, serif' }}>
            หน้าหลัก
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">ผู้จัดการโรงแรม</p>
            <p className="text-xs text-gray-400">ระบบจัดการโรงแรม SmartHotel</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-warm-md"
            style={{ background: 'linear-gradient(135deg,#C9882A,#855410)' }}
          >
            รร
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="ห้องทั้งหมด"    value={stats.totalRooms}       subtitle="ทุกประเภท"        icon={BedDouble}    color="gold"   />
        <StatsCard title="มีผู้เข้าพัก"   value={stats.occupiedToday}    subtitle="ห้องวันนี้"       icon={Users}        color="red"    />
        <StatsCard title="ว่าง"            value={stats.availableToday}   subtitle="พร้อมรับแขก"      icon={CheckCircle2} color="green"  />
        <StatsCard title="อัตราเข้าพัก"   value={`${stats.occupancyRate}%`} subtitle="วันนี้"        icon={TrendingUp}   color="purple" />
        <StatsCard title="เช็คอินวันนี้"  value={stats.checkinsToday}    subtitle="รายการ"           icon={DoorOpen}     color="amber"  />
        <StatsCard title="เช็คเอาท์วันนี้" value={stats.checkoutsToday}  subtitle="รายการ"           icon={DoorClosed}   color="blue"   />
      </div>

      {/* ── Quick actions ───────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/bookings/new', label: '+ สร้างการจองใหม่', color: '#C9882A' },
          { href: '/rooms',        label: '🛏 จัดการห้องพัก',   color: '#1A7A4A' },
          { href: '/guests',       label: '👤 ดูรายชื่อแขก',    color: '#2B7EC9' },
        ].map((a) => (
          <a
            key={a.href}
            href={a.href}
            className="flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-warm"
            style={{ backgroundColor: a.color }}
          >
            {a.label}
          </a>
        ))}
      </div>

      {/* ── Room Grid ──────────────────────────── */}
      <RoomGrid rooms={rooms} bookings={bookings} housekeepingLogs={logs} />

      {/* ── Housekeeping ───────────────────────── */}
      <HousekeepingStatus logs={logs} rooms={rooms} />
    </div>
  )
}
