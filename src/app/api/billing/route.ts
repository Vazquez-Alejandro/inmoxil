import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createPortalSession, createCustomer, PLANS, type PlanType } from '@/lib/stripe'
import { getWorkspace } from '@/lib/workspace'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, plan, action } = await request.json()

    if (!workspaceId || !action) {
      return NextResponse.json({ error: 'Se requiere workspaceId y action' }, { status: 400 })
    }

    const workspace = await getWorkspace(workspaceId)
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })
    }

    const supabase = createServiceClient()

    if (action === 'checkout') {
      const selectedPlan = (plan || workspace.plan) as PlanType
      const planConfig = PLANS[selectedPlan]

      if (!planConfig?.priceId) {
        return NextResponse.json({ error: 'Plan inválido o priceId no configurado' }, { status: 400 })
      }

      let customerId = workspace.stripe_customer_id
      if (!customerId) {
        const customer = await createCustomer(workspace.name, workspace.name)
        customerId = customer.id
        await supabase.from('workspaces').update({ stripe_customer_id: customerId }).eq('id', workspaceId)
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const session = await createCheckoutSession(
        customerId,
        planConfig.priceId,
        workspaceId,
        `${baseUrl}/dashboard?upgraded=true`,
        `${baseUrl}/dashboard/billing`
      )

      return NextResponse.json({ success: true, url: session.url })
    }

    if (action === 'portal') {
      if (!workspace.stripe_customer_id) {
        return NextResponse.json({ error: 'No tenés una suscripción activa' }, { status: 400 })
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const session = await createPortalSession(workspace.stripe_customer_id, `${baseUrl}/dashboard`)
      return NextResponse.json({ success: true, url: session.url })
    }

    return NextResponse.json({ error: 'Acción inválida. Usa "checkout" o "portal".' }, { status: 400 })
  } catch (error) {
    console.error('[Billing] Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error en billing' }, { status: 500 })
  }
}
