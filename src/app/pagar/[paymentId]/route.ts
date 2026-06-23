import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const payment = await queryOne(
      `SELECT p.*, c.title as contract_title, c.number as contract_number,
              pr.title as property_title, w.name as workspace_name
       FROM payments p
       LEFT JOIN contracts c ON c.id = p.contract_id
       LEFT JOIN properties pr ON pr.id = p.property_id
       LEFT JOIN workspaces w ON w.id = p.workspace_id
       WHERE p.id=$1`,
      [params.paymentId]
    )
    if (!payment) return new NextResponse('Pago no encontrado', { status: 404 })

    const amount = parseFloat(payment.amount).toLocaleString('es-AR', { style: 'currency', currency: payment.currency || 'ARS', maximumFractionDigits: 0 })

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagar - ${payment.concept || 'Alquiler'} | ${payment.workspace_name || 'Inmoxil'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#f8fafc; color:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:40px; max-width:480px; width:100%; text-align:center; }
    .logo { width:56px; height:56px; border-radius:16px; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; margin:0 auto 24px; }
    h1 { font-size:24px; font-weight:700; margin-bottom:4px; }
    .subtitle { font-size:14px; color:#64748b; margin-bottom:24px; }
    .amount { font-size:48px; font-weight:800; color:#0f172a; margin-bottom:8px; }
    .concept { font-size:14px; color:#64748b; margin-bottom:32px; text-transform:capitalize; }
    .detail { text-align:left; background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:24px; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0; font-size:14px; }
    .detail-row .label { color:#64748b; }
    .detail-row .value { font-weight:600; color:#0f172a; }
    .pay-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:16px; background:#0f172a; color:#fff; border:none; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; text-decoration:none; transition:background .2s; }
    .pay-btn:hover { background:#1e293b; }
    .pay-btn:disabled { opacity:.5; cursor:not-allowed; }
    .status-badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; margin-bottom:16px; }
    .status-paid { background:#d1fae5; color:#065f46; }
    .status-pending { background:#fef3c7; color:#92400e; }
    .status-failed { background:#fee2e2; color:#991b1b; }
    .footer { font-size:12px; color:#94a3b8; margin-top:24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Ix</div>
    <h1>${payment.workspace_name || 'Inmoxil'}</h1>
    <p class="subtitle">${payment.contract_title || 'Pago'}</p>

    ${payment.status === 'paid' ? '<div class="status-badge status-paid">Pagado</div>' :
      payment.status === 'failed' ? '<div class="status-badge status-failed">Fallido</div>' :
      '<div class="status-badge status-pending">Pendiente</div>'}

    <div class="amount">${amount}</div>
    <div class="concept">${payment.concept === 'rent' ? 'Alquiler' : payment.concept === 'deposit' ? 'Depósito' : payment.concept === 'commission' ? 'Comisión' : payment.concept}</div>

    <div class="detail">
      <div class="detail-row"><span class="label">Contrato</span><span class="value">${payment.contract_number || '-'}</span></div>
      <div class="detail-row"><span class="label">Propiedad</span><span class="value">${payment.property_title || '-'}</span></div>
      ${payment.due_date ? `<div class="detail-row"><span class="label">Vencimiento</span><span class="value">${new Date(payment.due_date).toLocaleDateString('es-AR')}</span></div>` : ''}
    </div>

    ${payment.status !== 'paid' && payment.checkout_url ? `
      <a class="pay-btn" href="${payment.checkout_url}" target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        Pagar ahora
      </a>
    ` : payment.status === 'paid' ? `
      <div style="padding:16px;background:#d1fae5;border-radius:12px;color:#065f46;font-weight:600;">
        Pago realizado exitosamente
      </div>
    ` : `
      <div style="padding:16px;background:#fef3c7;border-radius:12px;color:#92400e;font-size:14px;">
        Sin link de pago disponible. Contactá a la inmobiliaria.
      </div>
    `}

    <div class="footer">Powered by Inmoxil</div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch {
    return new NextResponse('Error interno', { status: 500 })
  }
}
