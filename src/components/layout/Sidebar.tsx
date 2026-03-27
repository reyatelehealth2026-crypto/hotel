'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Hotel,
  BedDouble,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  label: string
  sublabel: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'หน้าหลัก',    sublabel: 'Dashboard',   href: '/dashboard', icon: LayoutDashboard },
  { label: 'การจอง',       sublabel: 'Bookings',    href: '/bookings',  icon: CalendarDays },
  { label: 'จัดการห้อง',  sublabel: 'Rooms',       href: '/rooms',     icon: BedDouble },
  { label: 'ผู้เข้าพัก',  sublabel: 'Guests',      href: '/guests',    icon: Users },
  { label: 'รายงาน',      sublabel: 'Analytics',   href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col"
      style={{ backgroundColor: '#0B2D1E' }}
    >
      {/* ── Logo ────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: '#1A3D27' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shadow-warm-md"
          style={{ background: 'linear-gradient(135deg,#C9882A,#855410)' }}
        >
          <Hotel size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-wide"
             style={{ fontFamily: 'Trirong, serif' }}>
            SmartHotel
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6B9E7E' }}>
            ระบบจัดการโรงแรม
          </p>
        </div>
      </div>

      {/* ── Today date strip ────────────────── */}
      <div className="px-5 py-3" style={{ backgroundColor: '#0D3321' }}>
        <TodayDate />
      </div>

      {/* ── Navigation ──────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
           style={{ color: '#4A7A5E' }}>
          เมนูหลัก
        </p>

        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={
                active
                  ? {
                      backgroundColor: '#1B5236',
                      color: '#FFFFFF',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
                    }
                  : { color: '#A8C4B4' }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#143D2A'
                  ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = ''
                  ;(e.currentTarget as HTMLElement).style.color = '#A8C4B4'
                }
              }}
            >
              {/* Active indicator bar */}
              <span
                className="absolute left-0 w-1 h-7 rounded-r-full transition-all"
                style={active ? { backgroundColor: '#C9882A' } : { backgroundColor: 'transparent' }}
              />

              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={
                  active
                    ? { backgroundColor: 'rgba(201,136,42,0.25)' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)' }
                }
              >
                <Icon
                  size={17}
                  style={active ? { color: '#F5A800' } : { color: '#6B9E7E' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="leading-tight font-semibold text-sm">{item.label}</p>
                <p className="text-xs leading-tight" style={{ color: active ? '#A8C4B4' : '#4A7A5E' }}>
                  {item.sublabel}
                </p>
              </div>

              {active && (
                <span
                  className="w-1.5 h-1.5 rounded-full dot-pulse"
                  style={{ backgroundColor: '#C9882A' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ──────────────────────────── */}
      <div className="px-3 pb-5 pt-3 border-t" style={{ borderColor: '#1A3D27' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ backgroundColor: '#0D3321' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#C9882A,#855410)' }}
          >
            รร
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-tight truncate">ผู้จัดการโรงแรม</p>
            <p className="text-xs leading-tight truncate" style={{ color: '#4A7A5E' }}>admin</p>
          </div>
        </div>
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: '#A8C4B4' }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.12)'
            ;(e.currentTarget as HTMLElement).style.color = '#FCA5A5'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.backgroundColor = ''
            ;(e.currentTarget as HTMLElement).style.color = '#A8C4B4'
          }}
        >
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

function TodayDate() {
  const now = new Date()
  const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  const dayName = days[now.getDay()]
  const date = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear() + 543 // พ.ศ.

  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full dot-pulse" style={{ backgroundColor: '#4CAF82' }} />
      <p className="text-xs" style={{ color: '#6B9E7E' }}>
        วัน{dayName} {date} {month} {year}
      </p>
    </div>
  )
}
