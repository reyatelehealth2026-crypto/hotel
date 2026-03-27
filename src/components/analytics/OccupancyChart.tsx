'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { OccupancyByMonth } from '@/types'

interface OccupancyChartProps {
  data: OccupancyByMonth[]
}

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-emerald-600 font-medium">Occupancy: {payload[0].value}%</p>
    </div>
  )
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  const avgOccupancy =
    data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.occupancy_rate, 0) / data.length)
      : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Occupancy Rate</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monthly occupancy over 12 months</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{avgOccupancy}%</p>
          <p className="text-xs text-gray-400">12-month avg</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.split(' ')[0]}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgOccupancy}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="occupancy_rate"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
