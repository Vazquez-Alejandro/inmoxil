import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getLead } from '@/lib/pipeline/db'
import { getActivities, createActivity } from '@/lib/pipeline/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    if (!leadId) return NextResponse.json({ error: 'leadId requerido' }, { status: 400 })

    const lead = await getLead(leadId)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    const activities = await getActivities(leadId)
    return NextResponse.json({ activities })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, type, description, outcome, scheduledAt } = body
    if (!leadId || !type || !description) {
      return NextResponse.json({ error: 'leadId, type y description requeridos' }, { status: 400 })
    }

    const lead = await getLead(leadId)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    const user = await requireAuth()
    const activity = await createActivity({
      leadId,
      type,
      description,
      outcome: outcome || null,
      scheduledAt: scheduledAt || null,
      completedAt: new Date().toISOString(),
      createdBy: user?.id,
    })

    if (scheduledAt) {
      await import('@/lib/pipeline/db').then(m => m.updateLead(leadId, { lastContactAt: new Date().toISOString() } as any))
    }

    return NextResponse.json({ success: true, activity })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}