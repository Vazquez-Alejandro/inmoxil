import { NextRequest, NextResponse } from 'next/server'
import { processWebhookNotification } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    await processWebhookNotification(body, headers)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('MercadoPago webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
