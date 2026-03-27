import { createServiceClient } from '@/lib/supabase/server'
import RoomsManager from '@/components/rooms/RoomsManager'
import type { Room } from '@/types'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('rooms').select('*').order('room_number')
  const rooms: Room[] = data ?? []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Trirong, serif' }}>จัดการห้องพัก</h1>
        <p className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข หรือลบห้องพักในโรงแรม</p>
      </div>
      <RoomsManager initialRooms={rooms} />
    </div>
  )
}
