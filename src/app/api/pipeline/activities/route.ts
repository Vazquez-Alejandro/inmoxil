import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getLead } from '@/lib/pipeline/db'
import { getActivities, createActivity } from '@/lib/pipeline/db'
import { requireAuth } from '@/lib/api-auth'
import { queryOne } from '@/lib/db'

const RESEND_API_KEY = process.env.RESEND_API_KEY

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

async function sendVisitEmail(lead: any, activity: any, workspaceName: string) {
  if (!RESEND_API_KEY) return

  const visitDate = activity.scheduledAt
    ? new Date(activity.scheduledAt).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Sin fecha específica'

  try {
    const mod = await import('resend')
    const resend = new mod.Resend(RESEND_API_KEY)
    await resend.emails.send({
      from: 'Inmoxil <noreply@traceless.com.ar>',
      to: ['alejandrovazquez.dev@gmail.com'],
      subject: `📅 Visita agendada - ${lead.fullName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:linear-gradient(135deg,#a78bfa,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <h1 style="color:#fff;margin:0;font-size:20px">📅 Visita Agendada</h1>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
            <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
              Se registró una nueva visita para <strong>${lead.fullName}</strong> en <strong>${workspaceName}</strong>.
            </p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Cliente</td><td style="padding:8px 0;font-size:13px;font-weight:600">${lead.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Teléfono</td><td style="padding:8px 0;font-size:13px">${lead.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Fecha/Hora</td><td style="padding:8px 0;font-size:13px;font-weight:600">${visitDate}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Descripción</td><td style="padding:8px 0;font-size:13px">${activity.description}</td></tr>
              ${activity.outcome ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Resultado</td><td style="padding:8px 0;font-size:13px">${activity.outcome}</td></tr>` : ''}
            </table>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px">Inmoxil — Plataforma SaaS para Inmobiliarias</p>
        </div>
      `,
    })
  } catch {}
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

    if (type === 'visita') {
      const ws = await queryOne('SELECT name FROM workspaces WHERE id=$1', [lead.workspaceId])
      sendVisitEmail(lead, activity, ws?.name || 'Inmoxil')
    }

    return NextResponse.json({ success: true, activity })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}