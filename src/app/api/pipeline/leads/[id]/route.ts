import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { requireAuth } from '@/lib/api-auth'
import { createLead, getLead, updateLead, deleteLead } from '@/lib/pipeline/db'
import { createActivity } from '@/lib/pipeline/db'
import { getStages } from '@/lib/pipeline/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, ...leadData } = body
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const user = await requireAuth()
    const stages = await getStages(workspaceId)
    const firstStage = stages[0]
    if (!firstStage) return NextResponse.json({ error: 'No hay etapas configuradas' }, { status: 400 })

    const lead = await createLead({
      ...leadData,
      workspaceId,
      stageId: leadData.stageId || firstStage.id!,
      stageOrder: leadData.stageOrder || 0,
      status: 'activo',
      source: leadData.source || 'manual',
      documentType: leadData.documentType || 'DNI',
      currency: leadData.currency || 'ARS',
    })

    await createActivity({
      leadId: lead.id!,
      type: leadData.source === 'whatsapp' ? 'mensaje' : 'otro',
      description: leadData.source === 'whatsapp'
        ? 'Lead capturado automáticamente vía WhatsApp'
        : `Lead creado manualmente${leadData.source ? ` desde ${leadData.source}` : ''}`,
      createdBy: user?.id,
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, lead })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    return NextResponse.json({ lead })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    const body = await request.json()
    const updated = await updateLead(params.id, body)
    return NextResponse.json({ success: true, lead: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    await deleteLead(params.id)
    await createActivity({ leadId: params.id, type: 'otro', description: 'Lead descartado' })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}