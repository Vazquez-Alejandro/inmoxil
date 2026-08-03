import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, type, email, scheduleId } = body
    if (!workspaceId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const reportType = type || 'monthly'
    const ws = await queryOne('SELECT name, contact_email FROM workspaces WHERE id=$1', [workspaceId])

    // Build report data
    const totalProperties = await queryOne('SELECT COUNT(*) as count FROM properties WHERE workspace_id=$1', [workspaceId])
    const activeContracts = await queryOne('SELECT COUNT(*) as count FROM contracts WHERE workspace_id=$1 AND (status=$2 OR status=$3)', [workspaceId, 'activo', 'vigente'])
    const totalLeads = await queryOne('SELECT COUNT(*) as count FROM pipeline_leads WHERE workspace_id=$1', [workspaceId])
    const recentPayments = await query("SELECT * FROM payments WHERE workspace_id=$1 AND created_at > NOW() - INTERVAL '30 days' ORDER BY created_at DESC", [workspaceId])

    const totalAmount = recentPayments.reduce((sum: number, p: any) => {
      return p.status === 'paid' ? sum + parseFloat(p.amount || '0') : sum
    }, 0)

    const reportData = {
      workspaceName: ws?.name || 'Workspace',
      date: new Date().toLocaleDateString('es-AR'),
      reportType: reportType === 'monthly' ? 'Reporte Mensual' : 'Reporte Semanal',
      stats: {
        propiedades: Number(totalProperties?.count || 0),
        contratosActivos: Number(activeContracts?.count || 0),
        leads: Number(totalLeads?.count || 0),
        cobros: recentPayments.filter((p: any) => p.status === 'paid').length,
        totalCobrado: totalAmount,
        currency: recentPayments[0]?.currency || 'ARS',
      },
      payments: recentPayments.slice(0, 10).map((p: any) => ({
        id: p.id, concept: p.concept, amount: p.amount, status: p.status,
        date: p.created_at, currency: p.currency,
      })),
    }

    // Generate HTML report
    const html = generateReportHtml(reportData)

    // Send via Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY!)
      const recipient = email || ws?.contact_email || user.email

      await resend.emails.send({
        from: 'Inmoxil <noreply@traceless.com.ar>',
        to: [recipient],
        subject: `${reportData.reportType} - ${reportData.workspaceName} - ${reportData.date}`,
        html,
      })

      await queryOne(
        `INSERT INTO report_logs (workspace_id, type, recipient, summary, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [workspaceId, reportType, recipient,
         `Enviado: ${reportData.stats.propiedades} propiedades, ${reportData.stats.contratosActivos} contratos, $${reportData.stats.totalCobrado} cobrado`]
      )

      return NextResponse.json({ success: true, message: 'Reporte enviado', recipient })
    } catch {
      return NextResponse.json({ error: 'Error al enviar reporte' }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const logs = await query(
      'SELECT * FROM report_logs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 20',
      [workspaceId]
    )

    const schedules = await query(
      'SELECT * FROM report_schedules WHERE workspace_id=$1 ORDER BY created_at DESC',
      [workspaceId]
    )

    return NextResponse.json({ logs, schedules })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function generateReportHtml(data: any) {
  const s = data.stats
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:Inter,sans-serif;background:#f8fafc;padding:32px;color:#0f172a;}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;}
h1{font-size:24px;font-weight:700;margin:0 0 4px;}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.stat{padding:16px;background:#f8fafc;border-radius:8px;text-align:center;}
.stat .value{font-size:28px;font-weight:800;color:#0f172a;}
.stat .label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;}
table{width:100%;border-collapse:collapse;font-size:14px;}
th{text-align:left;padding:8px 12px;border-bottom:2px solid #e2e8f0;color:#64748b;font-weight:600;}
td{padding:8px 12px;border-bottom:1px solid #f1f5f9;}
.badge{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;}
.bg-green{background:#d1fae5;color:#065f46;}
.bg-yellow{background:#fef3c7;color:#92400e;}
.footer{text-align:center;font-size:12px;color:#94a3b8;margin-top:32px;}
</style></head>
<body>
<div class="card">
<h1>${data.workspaceName}</h1>
<p style="color:#64748b;margin:0;">${data.reportType} · ${data.date}</p>
</div>
<div class="card">
<div class="stats">
<div class="stat"><div class="value">${s.propiedades}</div><div class="label">Propiedades</div></div>
<div class="stat"><div class="value">${s.contratosActivos}</div><div class="label">Contratos activos</div></div>
<div class="stat"><div class="value">${s.leads}</div><div class="label">Leads totales</div></div>
<div class="stat"><div class="value">${new Intl.NumberFormat('es-AR',{style:'currency',currency:s.currency||'ARS',maximumFractionDigits:0}).format(s.totalCobrado)}</div><div class="label">Cobrado (30 días)</div></div>
</div>
</div>
${data.payments.length ? `
<div class="card">
<h3 style="margin:0 0 12px;">Últimos cobros</h3>
<table>
<tr><th>Concepto</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
${data.payments.map((p:any) => `
<tr>
<td>${p.concept || 'Alquiler'}</td>
<td>${new Intl.NumberFormat('es-AR',{style:'currency',currency:p.currency||'ARS',maximumFractionDigits:0}).format(p.amount)}</td>
<td><span class="badge ${p.status==='paid'?'bg-green':'bg-yellow'}">${p.status==='paid'?'Pagado':'Pendiente'}</span></td>
<td>${p.date ? new Date(p.date).toLocaleDateString('es-AR') : '-'}</td>
</tr>`).join('')}
</table>
</div>` : ''}
<div class="footer">Generado por Inmoxil · ${data.date}</div>
</body></html>`
}
