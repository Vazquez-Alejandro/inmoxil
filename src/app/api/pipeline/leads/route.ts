import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireWorkspaceAuth, requireAuth } from '@/lib/api-auth'
import { getPlan, checkLimit } from '@/lib/plans'
import { getLeads, createLead } from '@/lib/pipeline/db'
import { createActivity } from '@/lib/pipeline/db'
import { getStages } from '@/lib/pipeline/db'
import { matchLeadToProperties } from '@/lib/matching/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, ...leadData } = body
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const plan = getPlan(workspace.plan)
    const leadCount = (await queryOne('SELECT COUNT(*)::int as c FROM pipeline_leads WHERE workspace_id=$1', [workspaceId]))?.c ?? 0
    const { allowed } = checkLimit(leadCount, plan.limits.pipelineLeads)
    if (!allowed) return NextResponse.json({ error: `Límite de ${plan.limits.pipelineLeads} clientes alcanzado. Actualizá tu plan para agregar más.` }, { status: 402 })

    const user = await requireAuth()
    const userRole = user?.role_in_workspace || 'owner'
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
      assignedTo: userRole === 'agent' ? user!.id : (leadData.assignedTo || null),
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

    try { await (await import('@/lib/notifications/db')).createNotification({
      workspaceId, type: 'lead_nuevo', title: `Nuevo lead: ${lead.fullName}`,
      message: `Cliente ${lead.source === 'whatsapp' ? 'de WhatsApp' : lead.source === 'portal' ? 'de portal' : 'manual'} registrado en ${firstStage.name}`,
      link: '/dashboard/pipeline',
    }) } catch {}

    // Auto-match new lead against existing properties
    try {
      const matchResult = await matchLeadToProperties(workspaceId, lead.id!)
      if (matchResult && matchResult.properties.length > 0) {
        const altaCount = matchResult.properties.filter(p => p.confidence === 'alta').length
        if (altaCount > 0) {
          const { createNotification } = await import('@/lib/notifications/db')
          const topMatches = matchResult.properties.slice(0, 3)
          const matchList = topMatches.map(p => `${p.title} (${p.confidence})`).join(', ')
          await createNotification({
            workspaceId, type: 'matching_encontrado',
            title: `Matches para: ${lead.fullName}`,
            message: `${matchResult.properties.length} propiedades compatibles. Alta confianza: ${altaCount}. Principales: ${matchList}`,
            link: '/dashboard/pipeline',
          })
        }
      }
    } catch (matchError) {
      console.error('Auto-matching failed for new lead:', matchError)
    }

    return NextResponse.json({ success: true, lead })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const stageId = searchParams.get('stageId') || undefined
    const search = searchParams.get('search') || undefined
    const user = await requireAuth()

    const userRole = user?.role_in_workspace || 'owner'
    const assignedTo = userRole === 'agent' ? user!.id : undefined

    const leads = await getLeads(workspaceId, stageId, search, assignedTo)

    return NextResponse.json({ leads })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}