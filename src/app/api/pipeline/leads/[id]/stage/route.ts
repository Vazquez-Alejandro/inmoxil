import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getLead } from '@/lib/pipeline/db'
import { moveLeadStage } from '@/lib/pipeline/db'
import { createActivity } from '@/lib/pipeline/db'
import { requireAuth } from '@/lib/api-auth'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, stageId, stageOrder } = body
    if (!leadId || !stageId) return NextResponse.json({ error: 'leadId y stageId requeridos' }, { status: 400 })

    const lead = await getLead(leadId)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    const user = await requireAuth()
    const oldStageName = (lead as any).stageName || 'anterior'
    const result = await moveLeadStage(leadId, stageId, stageOrder || 0)

    const stageRows = await import('@/lib/pipeline/db').then(m => m.getStages(lead.workspaceId))
    const newStage = stageRows.find(s => s.id === stageId)
    const oldStage = stageRows.find(s => s.id === lead.stageId)

    await createActivity({
      leadId,
      type: 'otro',
      description: `Lead movido de "${oldStage?.name || oldStageName}" a "${newStage?.name || stageId}"`,
      createdBy: user?.id,
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, lead: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}