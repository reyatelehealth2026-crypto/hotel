import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { HousekeepingStatus } from '@/types'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, updated_by } = body as {
      status: HousekeepingStatus
      notes?: string
      updated_by?: string
    }

    const validStatuses: HousekeepingStatus[] = ['clean', 'dirty', 'in_progress']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { data: null, error: 'Invalid status. Must be clean, dirty, or in_progress' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('housekeeping_logs')
      .insert({
        room_id: id,
        status,
        notes: notes ?? null,
        updated_by: updated_by ?? 'Staff',
      })
      .select('*, room:rooms(*)')
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
