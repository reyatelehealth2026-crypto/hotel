import { TrendingUp, DollarSign, Percent, BarChart2 } from 'lucide-react'
import RevenueChart from '@/components/analytics/RevenueChart'
import OccupancyChart from '@/components/analytics/OccupancyChart'
import type { AnalyticsData, RevenueByRoomType } from '@/types'

export const dynamic = 'force-dynamic'

async function getAnalytics(): Promise<AnalyticsData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/analytics`, { cache: 'no-store' })
    const { data } = await res.json()
    return data
  } catch {
    return null
  }
}

const typeColors: Record<string, string> = {
  standard: '#2B7EC9',
  deluxe:   '#8B5CF6',
  suite:    '#C9882A',
}
const typeTh: Record<string, string> = {
  standard: 'มาตรฐาน',
  deluxe:   'ดีลักซ์',
  suite:    'สวีท',
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="page-card py-16 text-center text-gray-400 text-sm">
          โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า
        </div>
      </div>
    )
  }

  const totalRevenue = analytics.monthly_revenue.reduce((s, m) => s + m.revenue, 0)
  const totalBookings = analytics.monthly_revenue.reduce((s, m) => s + m.bookings, 0)
  const avgOccupancy =
    analytics.occupancy_by_month.length > 0
      ? Math.round(analytics.occupancy_by_month.reduce((s, m) => s + m.occupancy_rate, 0) / analytics.occupancy_by_month.length)
      : 0

  const maxType = analytics.revenue_by_room_type.reduce(
    (max, r) => r.revenue > max.revenue ? r : max,
    analytics.revenue_by_room_type[0] ?? { type: 'standard', revenue: 0, bookings: 0 }
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Trirong, serif' }}>รายงาน</h1>
        <p className="text-sm text-gray-500 mt-0.5">ภาพรวมรายได้และอัตราการเข้าพัก 12 เดือนล่าสุด</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'รายได้รวม',         value: `฿${totalRevenue.toLocaleString()}`, sub: '12 เดือนล่าสุด',     icon: DollarSign, color: '#C9882A', bg: '#FFF8E7' },
          { label: 'ADR (ราคาเฉลี่ย)',   value: `฿${analytics.adr.toFixed(0)}`,     sub: 'ราคาเฉลี่ยต่อคืน',   icon: TrendingUp, color: '#1DAF6E', bg: '#EDFAF3' },
          { label: 'RevPAR',             value: `฿${analytics.revpar.toFixed(0)}`,   sub: 'รายได้ต่อห้องว่าง',  icon: BarChart2,  color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'อัตราเข้าพักเฉลี่ย', value: `${avgOccupancy}%`,                sub: 'เฉลี่ย 12 เดือน',     icon: Percent,    color: '#2B7EC9', bg: '#EFF6FF' },
        ].map((k) => (
          <div key={k.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{k.label}</p>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: k.bg }}>
                <k.icon size={20} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={analytics.monthly_revenue} />
        <OccupancyChart data={analytics.occupancy_by_month} />
      </div>

      {/* Revenue by room type */}
      <div className="page-card">
        <div className="card-header">
          <div>
            <h2 className="font-bold text-gray-900">รายได้แยกตามประเภทห้อง</h2>
            <p className="text-xs text-gray-400 mt-0.5">เปรียบเทียบรายได้จากห้องแต่ละประเภท</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {analytics.revenue_by_room_type.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข้อมูล</p>
          ) : (
            analytics.revenue_by_room_type
              .sort((a, b) => b.revenue - a.revenue)
              .map((item: RevenueByRoomType) => {
                const maxRev = Math.max(...analytics.revenue_by_room_type.map((r) => r.revenue), 1)
                const pct = Math.round((item.revenue / maxRev) * 100)
                const color = typeColors[item.type] ?? '#6B7280'
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-semibold text-gray-800">{typeTh[item.type] ?? item.type}</span>
                        <span className="text-xs text-gray-400">{item.bookings} การจอง</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">฿{item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-warm-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'การจองทั้งหมด (12 เดือน)', value: totalBookings, color: '#C9882A' },
          { label: 'รายได้เฉลี่ยต่อการจอง', value: totalBookings > 0 ? `฿${Math.round(totalRevenue / totalBookings).toLocaleString()}` : '฿0', color: '#1DAF6E' },
          { label: 'ประเภทห้องที่รายได้สูงสุด', value: typeTh[maxType.type] ?? maxType.type, color: '#8B5CF6' },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
