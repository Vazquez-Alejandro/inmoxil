import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const schedules = await query(
      'SELECT * FROM report_schedules WHERE workspace_id=$1 ORDER BY created_at DESC',
      [workspaceId]
    )

    return NextResponse.json({ schedules })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, type, email, active } = body
    if (!workspaceId || !type) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const existing = await queryOne(
      'SELECT id FROM report_schedules WHERE workspace_id=$1 AND type=$2 AND active=true',
      [workspaceId, type]
    )

    if (existing) {
      await queryOne(
        'UPDATE report_schedules SET email=$1, active=$2 WHERE id=$3',
        [email || null, active !== false, existing.id]
      )
      return NextResponse.json({ success: true, scheduleId: existing.id })
    }

    const schedule = await insertOne('report_schedules', {
      workspace_id: workspaceId,
      type,
      email: email || null,
      active: active !== false,
    })

    return NextResponse.json({ success: true, scheduleId: schedule.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { scheduleId } = body
    if (!scheduleId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    await queryOne('DELETE FROM report_schedules WHERE id=$1', [scheduleId])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
