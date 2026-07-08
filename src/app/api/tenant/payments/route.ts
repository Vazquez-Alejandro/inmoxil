import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    // Validate token
    const access = await queryOne(
      `SELECT ta.*, c.id as contract_id
       FROM tenant_access_tokens ta
       JOIN contracts c ON c.id = ta.contract_id
       WHERE ta.token=$1 AND ta.created_at > NOW() - INTERVAL '365 days'`,
      [token]
    )
    if (!access) return NextResponse.json({ error: 'Acceso no válido' }, { status: 404 })

    // Get payments
    const payments = await query(
      `SELECT id, amount, currency, concept, status, due_date, paid_at, payment_method
       FROM payments
       WHERE contract_id=$1
       ORDER BY created_at DESC`,
      [access.contract_id]
    )

    return NextResponse.json({ payments: payments || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, paymentId } = body

    if (!token || !paymentId) {
      return NextResponse.json({ error: 'Token y paymentId requeridos' }, { status: 400 })
    }

    // Validate token
    const access = await queryOne(
      `SELECT ta.*, c.id as contract_id
       FROM tenant_access_tokens ta
       JOIN contracts c ON c.id = ta.contract_id
       WHERE ta.token=$1 AND ta.created_at > NOW() - INTERVAL '365 days'`,
      [token]
    )
    if (!access) return NextResponse.json({ error: 'Acceso no válido' }, { status: 404 })

    // Verify payment belongs to contract
    const payment = await queryOne(
      'SELECT id, checkout_url FROM payments WHERE id=$1 AND contract_id=$2',
      [paymentId, access.contract_id]
    )
    if (!payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

    return NextResponse.json({ checkoutUrl: payment.checkout_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
