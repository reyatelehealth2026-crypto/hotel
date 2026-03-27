import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'amber'
}

const colorMap = {
  gold:   { icon: '#C9882A', bg: '#FFF0C2', bar: '#C9882A' },
  green:  { icon: '#1DAF6E', bg: '#D0F3E3', bar: '#1DAF6E' },
  red:    { icon: '#E5503A', bg: '#FFE4E0', bar: '#E5503A' },
  blue:   { icon: '#2B7EC9', bg: '#DBEEFF', bar: '#2B7EC9' },
  purple: { icon: '#8B5CF6', bg: '#EDE9FE', bar: '#8B5CF6' },
  amber:  { icon: '#D08700', bg: '#FFF3C4', bar: '#D08700' },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'gold' }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="stat-card hover:shadow-warm-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 leading-tight">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-gray-900 leading-none">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0 ml-3"
          style={{ backgroundColor: c.bg }}
        >
          <Icon size={24} style={{ color: c.icon }} />
        </div>
      </div>
      <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-warm-muted">
        <div className="h-full rounded-full w-full opacity-50" style={{ backgroundColor: c.bar }} />
      </div>
    </div>
  )
}
