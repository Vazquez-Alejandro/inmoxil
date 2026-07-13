import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, PLANS } from '@/lib/stripe'
import { query, queryOne } from '@/lib/db'
import { sendPaymentConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = await constructWebhookEvent(Buffer.from(body), signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const workspaceId = session.metadata?.workspaceId

        if (workspaceId && session.metadata?.type === 'payment') {
          const paymentId = session.metadata.paymentId
          if (paymentId) {
            await queryOne(
              `UPDATE payments SET status='paid', paid_at=NOW(), payment_method='stripe' WHERE id=$1`,
              [paymentId]
            )
          }
        } else if (workspaceId && session.subscription) {
          await query(
            'UPDATE workspaces SET stripe_subscription_id=$1 WHERE id=$2',
            [session.subscription as string, workspaceId]
          )

          const subscription = await import('@/lib/stripe').then((m) =>
            m.stripe.subscriptions.retrieve(session.subscription as string)
          )

          const priceId = subscription.items.data[0]?.price.id
          const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId)

          if (planEntry) {
            const [planName, planConfig] = planEntry
            await query('UPDATE workspaces SET plan=$1 WHERE id=$2', [planName, workspaceId])

            const ws = await queryOne('SELECT name FROM workspaces WHERE id=$1', [workspaceId])
            try {
              await sendPaymentConfirmation(
                session.customer_details?.email || session.customer_email || '',
                ws?.name || '',
                planConfig.name,
                planConfig.price
              ).catch(() => {})
            } catch (e) {
              console.error('[Webhook] Failed to send payment email:', e)
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const workspace = await queryOne(
            'SELECT * FROM workspaces WHERE stripe_subscription_id=$1',
            [subscriptionId]
          )

          if (workspace) {
            const subscription = await import('@/lib/stripe').then((m) =>
              m.stripe.subscriptions.retrieve(subscriptionId)
            )

            const priceId = subscription.items.data[0]?.price.id
            const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId)

            if (planEntry) {
              const [planName] = planEntry
              await query('UPDATE workspaces SET plan=$1 WHERE id=$2', [planName, workspace.id])
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await query(
          `UPDATE workspaces SET plan='starter', stripe_subscription_id=NULL WHERE stripe_subscription_id=$1`,
          [subscription.id]
        )
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
