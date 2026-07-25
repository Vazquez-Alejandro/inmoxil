import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe no está configurado. Usá MercadoPago para pagos.' }, { status: 503 })
    }

    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, paymentId, successUrl, cancelUrl } = body
    if (!workspaceId || !paymentId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const payment = await queryOne('SELECT * FROM payments WHERE id=$1 AND workspace_id=$2', [paymentId, workspaceId])
    if (!payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

    try {
      const ws = await queryOne('SELECT stripe_customer_id, name FROM workspaces WHERE id=$1', [workspaceId])
      let customerId = ws?.stripe_customer_id
      if (!customerId) {
        const customer = await stripe.customers.create({ name: ws?.name || 'Workspace', metadata: { workspaceId } })
        customerId = customer.id
        await queryOne('UPDATE workspaces SET stripe_customer_id=$1 WHERE id=$2', [customerId, workspaceId])
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: (payment.currency || 'ARS').toLowerCase(),
            product_data: { name: `Pago: ${payment.concept || 'Alquiler'}`, description: payment.notes || '' },
            unit_amount: Math.round(parseFloat(payment.amount) * 100),
          },
          quantity: 1,
        }],
        metadata: { workspaceId, paymentId, type: 'payment' },
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://inmoxil.vercel.app'}/dashboard/pagos?paid=${paymentId}`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://inmoxil.vercel.app'}/dashboard/pagos?cancelled=${paymentId}`,
      })

      await queryOne(
        'UPDATE payments SET checkout_url=$1, stripe_session_id=$2 WHERE id=$3',
        [session.url, session.id, paymentId]
      )

      return NextResponse.json({ success: true, url: session.url, checkoutUrl: session.url })
    } catch {
      return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
