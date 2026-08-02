import { NextRequest, NextResponse } from 'next/server'
import { processWebhookNotification } from '@/lib/mercadopago'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MP_WEBHOOK_SECRET
    if (webhookSecret) {
      const xSignature = request.headers.get('x-signature') || ''
      if (!xSignature) {
        console.warn('MP webhook: missing X-Signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      const parts: Record<string, string> = {}
      for (const pair of xSignature.split(',')) {
        const [k, v] = pair.split('=', 1)
        if (k && v) parts[k.trim()] = v.trim()
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
      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))) {
        console.warn('MP webhook: invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      // Re-parse body for downstream processing
      const parsedBody = JSON.parse(body)
      const headers = Object.fromEntries(request.headers.entries())
      await processWebhookNotification(parsedBody, headers)
    } else {
      const body = await request.json()
      const headers = Object.fromEntries(request.headers.entries())
      await processWebhookNotification(body, headers)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('MercadoPago webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
