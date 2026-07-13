import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
    _stripe = new Stripe(key, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 29,
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 79,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    price: 199,
  },
} as const

export type PlanType = keyof typeof PLANS

export async function createCustomer(email: string, name: string) {
  return getStripe().customers.create({ email, name })
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  workspaceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { workspaceId },
    subscription_data: {
      metadata: { workspaceId },
    },
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId)
}

export async function constructWebhookEvent(
  payload: Buffer,
  signature: string
) {
  return getStripe().webhooks.constructEventAsync(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
