import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { createLead, createActivity } from '@/lib/pipeline/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceSlug, propertyId, fullName, phone, email, message, preferredDate } = body

    if (!workspaceSlug || !fullName || !phone) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Find workspace by slug
    const ws = await queryOne(
      'SELECT id FROM workspaces WHERE pub_catalog_slug=$1',
      [workspaceSlug]
    )
    if (!ws) return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })

    // Find the first "Nuevo" stage for this workspace
    const stages = await query(
      'SELECT id FROM pipeline_stages WHERE workspace_id=$1 ORDER BY "order" ASC LIMIT 1',
      [ws.id]
    )
    const stageId = stages[0]?.id

    // Get property info
    let propertyTitle = ''
    if (propertyId) {
      const prop = await queryOne('SELECT title FROM properties WHERE id=$1', [propertyId])
      propertyTitle = prop?.title || ''
    }

    // Create the lead
    const lead = await createLead({
      workspaceId: ws.id,
      stageId: stageId,
      propertyId: propertyId || null,
      fullName,
      phone,
      email: email || null,
      documentType: 'DNI',
      source: 'web',
      status: 'activo',
      notes: message || (propertyTitle ? `Interesado en: ${propertyTitle}` : ''),
      currency: 'ARS',
      stageOrder: 0,
    } as any)

    // Create a visit activity
    if (lead.id && preferredDate) {
      await createActivity({
        leadId: lead.id,
        type: 'visita',
        description: message || `Solicitud de visita para ${propertyTitle}`,
        outcome: 'Pendiente de confirmación',
        scheduledAt: preferredDate || null,
        completedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al procesar solicitud' }, { status: 500 })
  }
}
