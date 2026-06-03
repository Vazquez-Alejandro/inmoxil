import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, PLANS } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { addCredits } from '@/lib/workspace'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const event = await constructWebhookEvent(Buffer.from(body), signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const workspaceId = session.metadata?.workspaceId

        if (workspaceId && session.subscription) {
          await supabase
            .from('workspaces')
            .update({
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', workspaceId)

          const subscription = await import('@/lib/stripe').then((m) =>
            m.stripe.subscriptions.retrieve(session.subscription as string)
          )

          const priceId = subscription.items.data[0]?.price.id
          const planEntry = Object.entries(PLANS).find(
            ([, p]) => p.priceId === priceId
          )

          if (planEntry) {
            const [planName, planConfig] = planEntry
            await supabase
              .from('workspaces')
              .update({
                plan: planName,
                credits_remaining: planConfig.credits,
                credits_used: 0,
              })
              .eq('id', workspaceId)

            await addCredits(
              workspaceId,
              planConfig.credits,
              `Membresía ${planConfig.name} activada`
            )
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string

        if (subscriptionId) {
          const { data: workspace } = await supabase
            .from('workspaces')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (workspace) {
            const subscription = await import('@/lib/stripe').then((m) =>
              m.stripe.subscriptions.retrieve(subscriptionId)
            )

            const priceId = subscription.items.data[0]?.price.id
            const planEntry = Object.entries(PLANS).find(
              ([, p]) => p.priceId === priceId
            )

            if (planEntry) {
              const [planName, planConfig] = planEntry
              await supabase
                .from('workspaces')
                .update({ plan: planName })
                .eq('id', workspace.id)

              await addCredits(
                workspace.id,
                planConfig.credits,
                `Créditos mensuales ${planConfig.name}`
              )
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object

        await supabase
          .from('workspaces')
          .update({
            plan: 'starter',
            credits_remaining: 0,
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}
