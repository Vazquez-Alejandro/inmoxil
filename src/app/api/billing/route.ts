import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createPortalSession, PLANS, PlanType } from '@/lib/stripe'
import { getWorkspace, setStripeIds } from '@/lib/workspace'

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, plan, action } = await request.json()

    if (!workspaceId || !action) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId y action' },
        { status: 400 }
      )
    }

    const workspace = await getWorkspace(workspaceId)

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace no encontrado' },
        { status: 404 }
      )
    }

    if (action === 'checkout') {
      const selectedPlan = (plan || workspace.plan) as PlanType
      const planConfig = PLANS[selectedPlan]

      if (!planConfig?.priceId) {
        return NextResponse.json(
          { error: 'Plan inválido o priceId no configurado' },
          { status: 400 }
        )
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const session = await createCheckoutSession(
        workspace.stripe_customer_id!,
        planConfig.priceId,
        workspaceId,
        `${baseUrl}/dashboard?upgraded=true`,
        `${baseUrl}/dashboard/billing`
      )

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
      })
    }

    if (action === 'portal') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const session = await createPortalSession(
        workspace.stripe_customer_id!,
        `${baseUrl}/dashboard`
      )

      return NextResponse.json({
        success: true,
        portalUrl: session.url,
      })
    }

    return NextResponse.json(
      { error: 'Acción inválida. Usa "checkout" o "portal".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Billing] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en billing' },
      { status: 500 }
    )
  }
}
