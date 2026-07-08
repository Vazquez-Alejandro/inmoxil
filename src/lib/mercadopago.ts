import { query, queryOne } from '@/lib/db'

const MP_BASE_URL = 'https://api.mercadopago.com/v1'
const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET

export interface PaymentPreference {
  contractId: string
  amount: number
  currency: string
  description: string
  payerEmail: string
  payerName: string
  dueDate: string
}

export interface PaymentResult {
  preferenceId: string
  checkoutUrl: string
  paymentId: string
}

export async function createPaymentPreference(preference: PaymentPreference): Promise<PaymentResult> {
  if (!MP_TOKEN) throw new Error('MercadoPago access token no configurado')

  const contract = await queryOne(
    'SELECT workspace_id FROM contracts WHERE id=$1',
    [preference.contractId]
  )
  if (!contract) throw new Error('Contrato no encontrado')

  const response = await fetch(`${MP_BASE_URL}/preferences?access_token=${MP_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        id: preference.contractId,
        title: preference.description,
        quantity: 1,
        unit_price: preference.amount,
        currency_id: preference.currency === 'USD' ? 'USD' : 'ARS',
      }],
      payer: {
        name: preference.payerName,
        email: preference.payerEmail,
      },
      external_reference: preference.contractId,
      expiration_date_to: new Date(preference.dueDate).toISOString(),
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://inmoxil.vercel.app'}/api/webhooks/mercadopago`,
      metadata: {
        contract_id: preference.contractId,
        workspace_id: contract.workspace_id,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error al crear preferencia de pago')
  }

  const data = await response.json()

  // Save payment record
  const payment = await queryOne(
    `INSERT INTO payments (workspace_id, contract_id, amount, currency, concept, status, due_date, checkout_url)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7) RETURNING id`,
    [
      contract.workspace_id,
      preference.contractId,
      preference.amount,
      preference.currency,
      preference.description,
      preference.dueDate,
      data.init_point,
    ]
  )

  return {
    preferenceId: data.id,
    checkoutUrl: data.init_point,
    paymentId: payment.id,
  }
}

export async function getPaymentStatus(paymentId: string): Promise<string> {
  if (!MP_TOKEN) throw new Error('MercadoPago access token no configurado')

  const response = await fetch(`${MP_BASE_URL}/payments/${paymentId}?access_token=${MP_TOKEN}`)
  if (!response.ok) throw new Error('Error al consultar pago')

  const data = await response.json()
  return data.status
}

export async function processWebhookNotification(body: any, headers: any): Promise<void> {
  const { type, data } = body

  if (type !== 'payment') return

  // Get payment details from MercadoPago
  const payment = await getPaymentDetails(data.id)
  if (!payment) return

  const contractId = payment.external_reference
  if (!contractId) return

  // Update payment status in database
  const mpStatus = payment.status
  let dbStatus = 'pending'
  if (mpStatus === 'approved') dbStatus = 'paid'
  else if (mpStatus === 'rejected' || mpStatus === 'cancelled') dbStatus = 'failed'

  await query(
    `UPDATE payments SET status=$1, paid_at=$2, payment_method=$3, notes=$4
     WHERE contract_id=$5 AND status='pending'
     ORDER BY created_at DESC LIMIT 1`,
    [
      dbStatus,
      mpStatus === 'approved' ? new Date().toISOString() : null,
      'mercadopago',
      `MP ID: ${payment.id} | Status: ${mpStatus}`,
      contractId,
    ]
  )

  // If payment approved, notify workspace
  if (dbStatus === 'paid') {
    const contract = await queryOne(
      'SELECT workspace_id, lessee_name FROM contracts WHERE id=$1',
      [contractId]
    )
    if (contract) {
      const { createNotification } = await import('@/lib/notifications/db')
      await createNotification({
        workspaceId: contract.workspace_id,
        type: 'pago_recibido',
        title: `Pago recibido - ${contract.lessee_name}`,
        message: `El pago del alquiler fue acreditado correctamente`,
        link: `/dashboard/pagos`,
      })
    }
  }
}

async function getPaymentDetails(paymentId: string): Promise<any> {
  if (!MP_TOKEN) return null

  const response = await fetch(`${MP_BASE_URL}/payments/${paymentId}?access_token=${MP_TOKEN}`)
  if (!response.ok) return null

  return response.json()
}

export async function generatePaymentLink(
  contractId: string,
  amount: number,
  currency: string,
  description: string
): Promise<string> {
  const contract = await queryOne(
    'SELECT lessee_name, lessee_email FROM contracts WHERE id=$1',
    [contractId]
  )
  if (!contract) throw new Error('Contrato no encontrado')

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 5)

  const result = await createPaymentPreference({
    contractId,
    amount,
    currency,
    description,
    payerEmail: contract.lessee_email,
    payerName: contract.lessee_name,
    dueDate: dueDate.toISOString(),
  })

  return result.checkoutUrl
}
