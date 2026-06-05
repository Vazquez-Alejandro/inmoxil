import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, PLANS } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendPaymentConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase: any = createServiceClient()
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = await constructWebhookEvent(Buffer.from(body), signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const workspaceId = session.metadata?.workspaceId

        if (workspaceId && session.subscription) {
          await supabase.from('workspaces').update({
            stripe_subscription_id: session.subscription as string,
          }).eq('id', workspaceId)

          const subscription = await import('@/lib/stripe').then((m) =>
            m.stripe.subscriptions.retrieve(session.subscription as string)
          )

          const priceId = subscription.items.data[0]?.price.id
          const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId)

          if (planEntry) {
            const [planName, planConfig] = planEntry
            await supabase.from('workspaces').update({
              plan: planName,
              credits_remaining: planConfig.credits,
              credits_used: 0,
            }).eq('id', workspaceId)

            await supabase.from('credit_transactions').insert({
              workspace_id: workspaceId,
              amount: planConfig.credits,
              type: 'purchase',
              description: `Membresía ${planConfig.name} activada`,
            })

            const { data: ws } = await supabase
              .from('workspaces')
              .select('name')
              .eq('id', workspaceId)
              .single()
            try {
              await sendPaymentConfirmation(
                session.customer_details?.email || session.customer_email || '',
                ws?.name || '',
                planConfig.name,
                planConfig.price
              )
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
          const { data: workspace } = await supabase
            .from('workspaces').select('*')
            .eq('stripe_subscription_id', subscriptionId).single()

          if (workspace) {
            const subscription = await import('@/lib/stripe').then((m) =>
              m.stripe.subscriptions.retrieve(subscriptionId)
            )

            const priceId = subscription.items.data[0]?.price.id
            const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId)

            if (planEntry) {
              const [planName, planConfig] = planEntry
              await supabase.from('workspaces').update({ plan: planName }).eq('id', workspace.id)

              await supabase.from('credit_transactions').insert({
                workspace_id: workspace.id,
                amount: planConfig.credits,
                type: 'purchase',
                description: `Créditos mensuales ${planConfig.name}`,
              })
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await supabase.from('workspaces').update({
          plan: 'starter',
          credits_remaining: 0,
          stripe_subscription_id: null,
        }).eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
