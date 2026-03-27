'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import type { HousekeepingLog, Room, HousekeepingStatus } from '@/types'

interface HousekeepingStatusProps {
  logs: HousekeepingLog[]
  rooms: Room[]
}

const statusCfg = {
  clean:       { icon: CheckCircle2, thLabel: 'สะอาด',              color: '#1DAF6E', bg: '#EDFAF3', border: '#86EFAD' },
  dirty:       { icon: AlertCircle,  thLabel: 'ต้องทำความสะอาด',    color: '#E5503A', bg: '#FFF1F0', border: '#FCA5A5' },
  in_progress: { icon: Clock,        thLabel: 'กำลังทำความสะอาด',   color: '#2B7EC9', bg: '#EFF6FF', border: '#93C5FD' },
} as const

const statusCycle: Record<HousekeepingStatus, HousekeepingStatus> = {
  dirty: 'in_progress',
  in_progress: 'clean',
  clean: 'dirty',
}

const nextLabel: Record<HousekeepingStatus, string> = {
  dirty: 'เริ่มทำความสะอาด',
  in_progress: 'ทำเสร็จแล้ว',
  clean: 'ต้องทำความสะอาด',
}

export default function HousekeepingStatus({ logs, rooms }: HousekeepingStatusProps) {
  const [localLogs, setLocalLogs] = useState<HousekeepingLog[]>(logs)
  const [updating, setUpdating] = useState<string | null>(null)

  const latestByRoom = rooms.map((room) => {
    const roomLogs = localLogs
      .filter((l) => l.room_id === room.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { room, log: roomLogs[0] ?? null }
  })

  const counts = {
    clean: latestByRoom.filter((r) => r.log?.status === 'clean').length,
    dirty: latestByRoom.filter((r) => !r.log || r.log.status === 'dirty').length,
    in_progress: latestByRoom.filter((r) => r.log?.status === 'in_progress').length,
  }

  const handleToggle = async (roomId: string, currentStatus: HousekeepingStatus) => {
    const nextStatus = statusCycle[currentStatus]
    setUpdating(roomId)
    try {
      const res = await fetch(`/api/rooms/${roomId}/housekeeping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const { data } = await res.json()
      setLocalLogs((prev) => [data, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="page-card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h2 className="font-bold text-gray-900 text-base">สถานะแม่บ้าน</h2>
          <p className="text-xs text-gray-400 mt-0.5">อัปเดตสถานะความสะอาดของห้อง</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600">สะอาด</span>
            <span className="font-bold text-emerald-600">{counts.clean}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-600">ต้องทำ</span>
            <span className="font-bold text-red-600">{counts.dirty}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dot-pulse" />
            <span className="text-gray-600">กำลังทำ</span>
            <span className="font-bold text-blue-600">{counts.in_progress}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {latestByRoom.map(({ room, log }) => {
          const status: HousekeepingStatus = (log?.status as HousekeepingStatus) ?? 'dirty'
          const cfg = statusCfg[status]
          const Icon = cfg.icon
          const isUpdating = updating === room.id

          return (
            <div
              key={room.id}
              className="rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:shadow-warm-md"
              style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
            >
              {/* Status icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: cfg.color + '20' }}
              >
                <Icon size={22} style={{ color: cfg.color }} />
              </div>

              {/* Room number */}
              <div className="text-center">
                <p className="text-xl font-extrabold text-gray-900 leading-none">
                  {room.room_number}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {room.type === 'standard' ? 'มาตรฐาน' : room.type === 'deluxe' ? 'ดีลักซ์' : 'สวีท'}
                </p>
              </div>

              {/* Status label */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-center"
                style={{ backgroundColor: cfg.color + '18', color: cfg.color }}
              >
                {cfg.thLabel}
              </span>

              {/* Last updated */}
              {log && (
                <p className="text-xs text-gray-400 text-center leading-tight">
                  {format(parseISO(log.created_at), 'HH:mm')} น.
                </p>
              )}

              {/* Toggle button */}
              <button
                onClick={() => handleToggle(room.id, status)}
                disabled={isUpdating}
                className="w-full py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
                style={{
                  backgroundColor: cfg.color,
                  color: '#FFF',
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                <RefreshCw size={11} className={isUpdating ? 'animate-spin' : ''} />
                {isUpdating ? 'กำลังบันทึก...' : nextLabel[status]}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
