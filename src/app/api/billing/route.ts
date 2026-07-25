import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createPortalSession, createCustomer, PLANS, isStripeConfigured, type PlanType } from '@/lib/stripe'
import { getWorkspace } from '@/lib/workspace'
import { query } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe no está configurado. Los pagos están deshabilitados.' }, { status: 503 })
    }

    const { workspaceId, plan, action } = await request.json()
    if (!workspaceId || !action) return NextResponse.json({ error: 'Se requiere workspaceId y action' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    if (action === 'checkout') {
      const selectedPlan = (plan || workspace.plan) as PlanType
      const planConfig = PLANS[selectedPlan]
      if (!planConfig?.priceId) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

      let customerId = workspace.stripe_customer_id
      if (!customerId) {
        const customer = await createCustomer(workspace.name, workspace.name)
        customerId = customer.id
        await query('UPDATE workspaces SET stripe_customer_id=$1 WHERE id=$2', [customerId, workspaceId])
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const session = await createCheckoutSession(customerId, planConfig.priceId, workspaceId, `${baseUrl}/dashboard?upgraded=true`, `${baseUrl}/dashboard/billing`)
      return NextResponse.json({ success: true, url: session.url })
    }

    if (action === 'portal') {
      if (!workspace.stripe_customer_id) return NextResponse.json({ error: 'No tenés suscripción activa' }, { status: 400 })
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const session = await createPortalSession(workspace.stripe_customer_id, `${baseUrl}/dashboard`)
      return NextResponse.json({ success: true, url: session.url })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error en billing' }, { status: 500 })
  }
}
