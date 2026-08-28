import { NextRequest, NextResponse } from 'next/server'
import { processWebhookNotification } from '@/lib/mercadopago'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (fail-closed: rechazar si no hay secret o firma)
    const webhookSecret = process.env.MP_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('MP webhook: MP_WEBHOOK_SECRET no configurado; rechazando webhook sin firma')
      return NextResponse.json({ error: 'Webhook deshabilitado: secreto no configurado' }, { status: 401 })
    }
    const xSignature = request.headers.get('x-signature') || ''
    if (!xSignature) {
      console.warn('MP webhook: missing X-Signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    const parts: Record<string, string> = {}
    for (const pair of xSignature.split(',')) {
      const eq = pair.indexOf('=')
      if (eq > 0) {
        const k = pair.slice(0, eq).trim()
        const v = pair.slice(eq + 1).trim()
        if (k && v) parts[k] = v
      }
    }
    const ts = parts.ts || ''
    const v1 = parts.v1 || ''
    if (!ts || !v1) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 })
    }
    const body = await request.text()
    const dataId = new URL(request.url).searchParams.get('data.id') || ''
    const requestId = new URL(request.url).searchParams.get('data.request_id') || ''
    const verificationStr = `id:${dataId};request-id:${requestId};ts:${ts};`
    const expected = crypto.createHmac('sha256', webhookSecret).update(verificationStr).digest('hex')
    const expectedBuf = Buffer.from(expected)
    const v1Buf = Buffer.from(v1)
    if (expectedBuf.length !== v1Buf.length || !crypto.timingSafeEqual(expectedBuf, v1Buf)) {
      console.warn('MP webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    // Re-parse body for downstream processing
    const parsedBody = JSON.parse(body)
    const headers = Object.fromEntries(request.headers.entries())
    await processWebhookNotification(parsedBody, headers)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('MercadoPago webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
