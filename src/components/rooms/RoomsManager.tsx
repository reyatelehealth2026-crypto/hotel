'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, BedDouble } from 'lucide-react'
import type { Room } from '@/types'

interface RoomsManagerProps {
  initialRooms: Room[]
}

const ROOM_TYPES = [
  { value: 'standard', label: 'มาตรฐาน (Standard)' },
  { value: 'deluxe',   label: 'ดีลักซ์ (Deluxe)' },
  { value: 'suite',    label: 'สวีท (Suite)' },
]
const STATUS_OPTIONS = [
  { value: 'available',    label: 'ว่าง',         color: '#1DAF6E', bg: '#EDFAF3' },
  { value: 'occupied',     label: 'มีผู้พัก',     color: '#E5503A', bg: '#FFF1F0' },
  { value: 'maintenance',  label: 'ซ่อมบำรุง',   color: '#D08700', bg: '#FFFBEB' },
]

const statusCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available:   { label: 'ว่าง',        color: '#1DAF6E', bg: '#EDFAF3', border: '#86EFAD' },
  occupied:    { label: 'มีผู้พัก',    color: '#E5503A', bg: '#FFF1F0', border: '#FCA5A5' },
  maintenance: { label: 'ซ่อมบำรุง',  color: '#D08700', bg: '#FFFBEB', border: '#FCD34D' },
}

const typeLabel: Record<string, string> = { standard: 'มาตรฐาน', deluxe: 'ดีลักซ์', suite: 'สวีท' }
const typeShort: Record<string, string> = { standard: 'STD', deluxe: 'DLX', suite: 'STE' }

interface RoomFormData {
  room_number: string
  type: string
  base_price: string
  floor: string
  capacity: string
  status: string
}

const emptyForm: RoomFormData = {
  room_number: '',
  type: 'standard',
  base_price: '',
  floor: '',
  capacity: '2',
  status: 'available',
}

export default function RoomsManager({ initialRooms }: RoomsManagerProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomFormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setError(null); setShowForm(true) }

  const openEdit = (room: Room) => {
    setEditingId(room.id)
    setForm({
      room_number: room.room_number,
      type:        room.type,
      base_price:  String(room.base_price),
      floor:       String(room.floor ?? ''),
      capacity:    String(room.capacity ?? 2),
      status:      room.status ?? 'available',
    })
    setError(null)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.room_number || !form.base_price) {
      setError('กรุณากรอกหมายเลขห้องและราคา')
      return
    }
    setLoading(true)
    setError(null)
    const payload = {
      room_number: form.room_number.trim(),
      type:        form.type,
      base_price:  parseFloat(form.base_price),
      floor:       form.floor ? parseInt(form.floor) : null,
      capacity:    parseInt(form.capacity) || 2,
      status:      form.status,
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/rooms/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const { data, error: err } = await res.json()
        if (err) throw new Error(err)
        setRooms((prev) => prev.map((r) => r.id === editingId ? data : r))
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const { data, error: err } = await res.json()
        if (err) throw new Error(err)
        setRooms((prev) => [...prev, data].sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true })))
      }
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบห้องนี้? ไม่สามารถกู้คืนได้')) return
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      const { error: err } = await res.json()
      if (err) throw new Error(err)
      setRooms((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ลบไม่สำเร็จ')
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{rooms.length} ห้องทั้งหมด</p>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} />
          เพิ่มห้องใหม่
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-warm-lg w-full max-w-lg mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Trirong, serif' }}>
                  {editingId ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องพักใหม่'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">กรอกรายละเอียดห้องพัก</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-warm-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠ {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">หมายเลขห้อง *</label>
                <input type="text" value={form.room_number}
                  onChange={(e) => setForm((p) => ({ ...p, room_number: e.target.value }))}
                  className="form-input" placeholder="เช่น 101, 201A" />
              </div>
              <div>
                <label className="form-label">ประเภทห้อง</label>
                <select value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="form-input">
                  {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">ราคาต่อคืน (฿) *</label>
                <input type="number" value={form.base_price}
                  onChange={(e) => setForm((p) => ({ ...p, base_price: e.target.value }))}
                  className="form-input" placeholder="1500" min="0" />
              </div>
              <div>
                <label className="form-label">ชั้น</label>
                <input type="number" value={form.floor}
                  onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                  className="form-input" placeholder="1" min="1" />
              </div>
              <div>
                <label className="form-label">จำนวนผู้พักสูงสุด</label>
                <input type="number" value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  className="form-input" placeholder="2" min="1" max="10" />
              </div>
              <div>
                <label className="form-label">สถานะ</label>
                <select value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="form-input">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">ยกเลิก</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
                <Check size={16} />
                {loading ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มห้องพัก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room cards / empty state */}
      {rooms.length === 0 ? (
        <div className="page-card py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-warm-muted flex items-center justify-center">
            <BedDouble size={32} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-500">ยังไม่มีห้องพัก</p>
            <p className="text-sm text-gray-400 mt-1">กด &ldquo;เพิ่มห้องใหม่&rdquo; เพื่อเริ่มต้น</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> เพิ่มห้องแรก</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map((room) => {
            const cfg = statusCfg[room.status ?? 'available'] ?? statusCfg.available
            return (
              <div
                key={room.id}
                className="rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-warm hover:shadow-warm-md transition-all duration-200"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
              >
                {/* Room number + type */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900 leading-none">{room.room_number}</p>
                    <p className="text-xs text-gray-500 mt-1">{typeLabel[room.type] ?? room.type}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                  >
                    {typeShort[room.type] ?? room.type.toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">ราคา/คืน</span>
                    <span className="font-bold text-gray-900">฿{Number(room.base_price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">ชั้น</span>
                    <span className="font-medium text-gray-700">{room.floor ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">รองรับ</span>
                    <span className="font-medium text-gray-700">{room.capacity ?? 2} คน</span>
                  </div>
                </div>

                {/* Status chip */}
                <div
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: cfg.color + '18', color: cfg.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(room)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-white border border-warm-border text-gray-700 hover:bg-warm-muted transition-colors"
                  >
                    <Pencil size={12} /> แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-warm-border text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
