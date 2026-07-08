import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId } = body

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    // Find visits happening in the next 24-48 hours that haven't been reminded
    const visits = await query(
      `SELECT pa.*, pl.full_name as lead_name, pl.phone as lead_phone,
              p.title as property_title, p.address as property_address
       FROM pipeline_activities pa
       LEFT JOIN pipeline_leads pl ON pl.id = pa.lead_id
       LEFT JOIN properties p ON p.id = (SELECT property_id FROM pipeline_leads WHERE id = pa.lead_id)
       WHERE pa.workspace_id=$1
       AND pa.type='visita'
       AND pa.scheduled_at >= NOW() + INTERVAL '23 hours'
       AND pa.scheduled_at <= NOW() + INTERVAL '25 hours'
       AND NOT EXISTS (
         SELECT 1 FROM whatsapp_messages wm
         WHERE wm.lead_id = pa.lead_id
         AND wm.metadata->>'type' = 'reminder'
         AND wm.metadata->>'visitDate' = DATE(pa.scheduled_at)::text
       )`,
      [workspaceId]
    )

    if (!visits || visits.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay visitas para recordar', sent: 0 })
    }

    let sent = 0
    const results = []

    for (const visit of visits) {
      if (!visit.lead_phone) continue

      const visitDate = new Date(visit.scheduled_at).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      const visitTime = new Date(visit.scheduled_at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const message = encodeURIComponent(
        `Hola ${visit.lead_name}! Te recordamos tu visita a ${visit.property_title} mañana ${visitDate} a las ${visitTime}. ¿Confirmás asistencia?`
      )

      const waLink = `https://wa.me/${visit.lead_phone.replace(/\D/g, '')}?text=${message}`

      // Save reminder
      await query(
        `INSERT INTO whatsapp_messages (workspace_id, lead_id, direction, content, phone, metadata)
         VALUES ($1, $2, 'reminder', $3, $4, $5)`,
        [
          workspaceId,
          visit.lead_id,
          `Recordatorio de visita: ${visit.property_title} - ${visitDate} ${visitTime}`,
          visit.lead_phone,
          JSON.stringify({
            type: 'reminder',
            visitDate: new Date(visit.scheduled_at).toISOString().split('T')[0],
            visitTime,
          }),
        ]
      )

      sent++
      results.push({
        visitId: visit.id,
        leadName: visit.lead_name,
        phone: visit.lead_phone,
        property: visit.property_title,
        date: visitDate,
        time: visitTime,
        waLink,
      })
    }

    return NextResponse.json({
      success: true,
      sent,
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    // Get upcoming visits needing reminders
    const upcomingVisits = await query(
      `SELECT pa.*, pl.full_name as lead_name, pl.phone as lead_phone,
              p.title as property_title
       FROM pipeline_activities pa
       LEFT JOIN pipeline_leads pl ON pl.id = pa.lead_id
       LEFT JOIN properties p ON p.id = (SELECT property_id FROM pipeline_leads WHERE id = pa.lead_id)
       WHERE pa.workspace_id=$1
       AND pa.type='visita'
       AND pa.scheduled_at >= NOW()
       AND pa.scheduled_at <= NOW() + INTERVAL '48 hours'
       ORDER BY pa.scheduled_at ASC`,
      [workspaceId]
    )

    return NextResponse.json({ upcomingVisits: upcomingVisits || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
