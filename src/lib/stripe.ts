import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 29,
    credits: 50,
    features: ['50 créditos/mes', 'Scraping multi-portal', 'Brand kit básico', 'Soporte email'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 79,
    credits: 200,
    features: ['200 créditos/mes', 'Todo del Starter', 'API acceso', 'Soporte prioritario', 'Analytics'],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    price: 199,
    credits: 1000,
    features: ['1000 créditos/mes', 'Todo del Pro', 'Multi-usuario', 'Custom branding', 'SLA 99.9%', 'Account manager'],
  },
} as const

export type PlanType = keyof typeof PLANS

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  workspaceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
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
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}

export async function constructWebhookEvent(
  payload: Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
