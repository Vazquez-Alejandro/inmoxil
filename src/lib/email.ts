import {
  welcomeEmailTemplate,
  paymentConfirmationTemplate,
  lowCreditsTemplate,
  passwordResetTemplate,
} from './email-templates'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'Inmoxil <onboarding@resend.dev>'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email')
    return
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[Email] Failed to send:', res.status, error)
    }
  } catch (error) {
    console.error('[Email] Error sending:', error)
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(to, 'Bienvenido/a a Inmoxil 🎉', welcomeEmailTemplate(name))
}

export async function sendPaymentConfirmation(
  to: string,
  name: string,
  plan: string,
  amount: number
) {
  await sendEmail(
    to,
    `Pago confirmado - Plan ${plan}`,
    paymentConfirmationTemplate(name, plan, amount)
  )
}

export async function sendLowCredits(to: string, name: string, creditsRemaining: number) {
  await sendEmail(
    to,
    'Créditos bajos en tu cuenta Inmoxil',
    lowCreditsTemplate(name, creditsRemaining)
  )
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await sendEmail(
    to,
    'Restablecer tu contraseña - Inmoxil',
    passwordResetTemplate(name, resetUrl)
  )
}
