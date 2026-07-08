import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { generatePaymentLink } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, contractId, amount, currency, description } = body

    if (!workspaceId || !contractId || !amount || !description) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const checkoutUrl = await generatePaymentLink(
      contractId,
      amount,
      currency || 'ARS',
      description
    )

    return NextResponse.json({ success: true, checkoutUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
