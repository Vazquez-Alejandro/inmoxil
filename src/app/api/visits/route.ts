import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, leadId, propertyId, date, time, notes } = body

    if (!workspaceId || !leadId || !propertyId || !date || !time) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Create visit
    const visit = await queryOne(
      `INSERT INTO pipeline_activities (workspace_id, lead_id, type, description, scheduled_at)
       VALUES ($1, $2, 'visita', $3, $4) RETURNING id, created_at`,
      [workspaceId, leadId, notes || `Visita programada`, `${date}T${time}:00`]
    )

    // Get lead info
    const lead = await queryOne('SELECT * FROM pipeline_leads WHERE id=$1', [leadId])
    const property = await queryOne('SELECT * FROM properties WHERE id=$1', [propertyId])
    const workspace = await queryOne('SELECT * FROM workspaces WHERE id=$1', [workspaceId])

    // Generate WhatsApp confirmation link
    const propertyName = property?.title || 'la propiedad'
    const visitDate = new Date(`${date}T${time}`).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const visitTime = time

    const confirmationMessage = encodeURIComponent(
      `Hola! Te confirmo tu visita a ${propertyName} el ${visitDate} a las ${visitTime}. ¿Confirmás asistencia? Respondé SI o NO.`
    )
    const waLink = `https://wa.me/${lead?.phone?.replace(/\D/g, '')}?text=${confirmationMessage}`

    // Send confirmation via WhatsApp
    if (lead?.phone) {
      await query(
        `INSERT INTO whatsapp_messages (workspace_id, lead_id, direction, content, phone, metadata)
         VALUES ($1, $2, 'outgoing', $3, $4, $5)`,
        [
          workspaceId,
          leadId,
          `Visit confirmada: ${propertyName} - ${visitDate} ${visitTime}`,
          lead.phone,
          JSON.stringify({ visitId: visit?.id, type: 'confirmation_request' }),
        ]
      )
    }

    // Create notification
    const { createNotification } = await import('@/lib/notifications/db')
    await createNotification({
      workspaceId,
      type: 'lead_nuevo',
      title: 'Visita agendada',
      message: `Visita a ${propertyName} con ${lead?.full_name || 'cliente'} el ${visitDate} a las ${visitTime}`,
      link: `/dashboard/calendar`,
    })

    return NextResponse.json({
      success: true,
      visit,
      waLink,
      confirmationMessage: `Visita agendada para ${visitDate} a las ${visitTime}. Se envió confirmación por WhatsApp.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const date = searchParams.get('date')
    const leadId = searchParams.get('leadId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    let queryStr = `
      SELECT pa.*, pl.full_name as lead_name, pl.phone as lead_phone,
             p.title as property_title, p.address as property_address
      FROM pipeline_activities pa
      LEFT JOIN pipeline_leads pl ON pl.id = pa.lead_id
      LEFT JOIN properties p ON p.id = (SELECT property_id FROM pipeline_leads WHERE id = pa.lead_id)
      WHERE pa.workspace_id=$1 AND pa.type='visita'
    `
    const params: any[] = [workspaceId]

    if (date) {
      queryStr += ` AND DATE(pa.scheduled_at) = $${params.length + 1}`
      params.push(date)
    }

    if (leadId) {
      queryStr += ` AND pa.lead_id = $${params.length + 1}`
      params.push(leadId)
    }

    queryStr += ' ORDER BY pa.scheduled_at DESC LIMIT 50'

    const visits = await query(queryStr, params)

    // Get upcoming visits (next 7 days)
    const upcoming = await query(
      `SELECT pa.*, pl.full_name as lead_name, pl.phone as lead_phone,
              p.title as property_title, p.address as property_address
       FROM pipeline_activities pa
       LEFT JOIN pipeline_leads pl ON pl.id = pa.lead_id
       LEFT JOIN properties p ON p.id = (SELECT property_id FROM pipeline_leads WHERE id = pa.lead_id)
       WHERE pa.workspace_id=$1 AND pa.type='visita'
       AND pa.scheduled_at >= NOW()
       AND pa.scheduled_at <= NOW() + INTERVAL '7 days'
       ORDER BY pa.scheduled_at ASC`,
      [workspaceId]
    )

    // Get confirmation status
    const confirmations = await query(
      `SELECT metadata->>'visitId' as visit_id,
              COUNT(*) as responses,
              COUNT(*) FILTER (WHERE content ILIKE '%si%' OR content ILIKE '%confirmo%') as confirmed,
              COUNT(*) FILTER (WHERE content ILIKE '%no%' OR content ILIKE '%cancelo%') as cancelled
       FROM whatsapp_messages
       WHERE workspace_id=$1 AND direction='incoming'
       AND metadata->>'type'='confirmation_response'
       GROUP BY metadata->>'visitId'`,
      [workspaceId]
    )

    return NextResponse.json({
      visits: visits || [],
      upcoming: upcoming || [],
      confirmations: confirmations || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
