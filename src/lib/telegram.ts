/**
 * Funciones para enviar notificaciones por Telegram.
 */

const TELEGRAM_NOTIFIER_URL = process.env.TELEGRAM_NOTIFIER_URL || 'https://telegram-notifier.onrender.com'

interface NotifyPayload {
  app: string
  event: string
  message: string
  details?: Record<string, string>
}

async function notifyTelegram(payload: NotifyPayload): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_NOTIFIER_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function notifyUserRegistered(app: string, email: string, name?: string): Promise<boolean> {
  return notifyTelegram({
    app,
    event: '👤 Nuevo registro',
    message: `Email: ${email}` + (name ? `\nNombre: ${name}` : ''),
  })
}

export async function notifyUserVisit(app: string, page: string = '/'): Promise<boolean> {
  return notifyTelegram({
    app,
    event: '👀 Nueva visita',
    message: `Página: ${page}`,
  })
}

export async function notifyPayment(app: string, amount: number, currency: string = 'USD'): Promise<boolean> {
  return notifyTelegram({
    app,
    event: '💰 Pago recibido',
    message: `Monto: ${currency} ${amount}`,
  })
}
