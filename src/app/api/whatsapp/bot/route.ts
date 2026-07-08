import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

interface BotResponse {
  message: string
  action?: 'qualify' | 'schedule_visit' | 'send_info' | 'transfer_agent'
  confidence: number
}

const PROPERTY_KEYWORDS = ['propiedad', 'departamento', 'casa', 'ph', 'local', 'oficina', 'terreno', 'lote']
const PRICE_KEYWORDS = ['precio', 'cuanto', 'cuánto', 'vale', 'costo', 'importe']
const VISIT_KEYWORDS = ['visita', 'visitar', 'ver', 'conocer', 'recorrer', 'agendar']
const FEATURES_KEYWORDS = ['pileta', 'jardin', 'jardín', 'cochera', 'estacionamiento', 'gimnasio', 'seguridad', 'amoblado', 'terraza', 'quincho', 'parrilla']
const CONTACT_KEYWORDS = ['llamar', 'teléfono', 'teléfono', 'celular', 'whatsapp', 'contacto', 'hablar']

function detectIntent(message: string): { intent: string; confidence: number } {
  const msg = message.toLowerCase()

  // Price inquiry
  if (PRICE_KEYWORDS.some(k => msg.includes(k))) {
    return { intent: 'price_inquiry', confidence: 0.9 }
  }

  // Visit scheduling
  if (VISIT_KEYWORDS.some(k => msg.includes(k))) {
    return { intent: 'schedule_visit', confidence: 0.85 }
  }

  // Property features
  if (FEATURES_KEYWORDS.some(k => msg.includes(k))) {
    return { intent: 'feature_inquiry', confidence: 0.8 }
  }

  // Property type
  if (PROPERTY_KEYWORDS.some(k => msg.includes(k))) {
    return { intent: 'property_inquiry', confidence: 0.75 }
  }

  // Contact request
  if (CONTACT_KEYWORDS.some(k => msg.includes(k))) {
    return { intent: 'contact_request', confidence: 0.7 }
  }

  // Greeting
  if (['hola', 'buenos', 'buenas', 'hey', 'hi', 'hello'].some(k => msg.includes(k))) {
    return { intent: 'greeting', confidence: 0.95 }
  }

  return { intent: 'unknown', confidence: 0.3 }
}

function generateResponse(
  intent: string,
  property: any | null,
  lead: any | null
): BotResponse {
  const propertyName = property?.title || 'la propiedad'
  const propertyPrice = property?.price ? `$${new Intl.NumberFormat('es-AR').format(property.price)}` : 'consultar precio'
  const propertyAddress = property?.address || ''

  switch (intent) {
    case 'greeting':
      return {
        message: `Hola! Soy el asistente de ${property?.workspace_name || 'nuestra inmobiliaria'}. ¿En qué te puedo ayudar? Preguntame sobre propiedades, precios o agendar una visita.`,
        confidence: 0.95,
      }

    case 'price_inquiry':
      return {
        message: property
          ? `El precio de ${propertyName} es ${propertyPrice} (${property.currency || 'ARS'}). ¿Te interesa? Puedo agendarte una visita para que la conozcas.`
          : '¿De qué propiedad querés saber el precio? Puedo enviarte opciones que se ajusten a tu presupuesto.',
        action: 'send_info',
        confidence: 0.9,
      }

    case 'schedule_visit':
      return {
        message: property
          ? `Perfecto! Para agendar una visita a ${propertyName} (${propertyAddress}), necesito: \n1. Tu nombre completo \n2. Un día y horario que te sirva \n\n¿Cuándo te gustaría visitarla?`
          : 'Me encanta que quieras visitar una propiedad! ¿Cuál te interesa? Puedo enviarte opciones.',
        action: 'schedule_visit',
        confidence: 0.85,
      }

    case 'feature_inquiry':
      if (property) {
        const features = typeof property.features === 'string' ? JSON.parse(property.features) : property.features
        const featureList = Array.isArray(features) ? features.join(', ') : 'consultar disponibilidad'
        return {
          message: `${propertyName} cuenta con: ${featureList}. ¿Querés agendar una visita para conocerla en persona?`,
          confidence: 0.8,
        }
      }
      return {
        message: '¿Qué características estás buscando? Tenemos propiedades con pileta, jardín, cochera, gimnasio y más.',
        confidence: 0.75,
      }

    case 'property_inquiry':
      return {
        message: property
          ? `${propertyName} está en ${propertyAddress}. Precio: ${propertyPrice}. ¿Querés más detalles o agendar una visita?`
          : '¿Qué tipo de propiedad buscás? Departamento, casa, ph, local? Te puedo enviar opciones.',
        action: 'send_info',
        confidence: 0.75,
      }

    case 'contact_request':
      return {
        message: 'Un momento, te comunico con un agente. ¿Podés dejarme tu nombre y número? Te van a contactar a la brevedad.',
        action: 'transfer_agent',
        confidence: 0.7,
      }

    default:
      return {
        message: 'Gracias por tu mensaje! ¿En qué te puedo ayudar? Preguntame sobre propiedades, precios, o si querés agendar una visita.',
        confidence: 0.5,
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, phone, message, propertyId } = body

    if (!workspaceId || !phone || !message) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Detect intent
    const { intent, confidence } = detectIntent(message)

    // Get property if ID provided
    let property = null
    if (propertyId) {
      property = await queryOne(
        `SELECT p.*, w.name as workspace_name FROM properties p
         JOIN workspaces w ON w.id = p.workspace_id
         WHERE p.id=$1 AND p.workspace_id=$2`,
        [propertyId, workspaceId]
      )
    }

    // Find lead by phone
    const lead = await queryOne(
      'SELECT * FROM pipeline_leads WHERE workspace_id=$1 AND phone LIKE $2',
      [workspaceId, `%${phone}%`]
    )

    // Generate response
    const response = generateResponse(intent, property, lead)

    // Save conversation log
    await query(
      `INSERT INTO whatsapp_messages (workspace_id, lead_id, direction, content, status)
       VALUES ($1, $2, 'bot_incoming', $3, 'sent')`,
      [workspaceId, lead?.id || null, message]
    )

    // Save bot response
    await query(
      `INSERT INTO whatsapp_messages (workspace_id, lead_id, direction, content, status)
       VALUES ($1, $2, 'bot_outgoing', $3, 'sent')`,
      [workspaceId, lead?.id || null, response.message]
    )

    // If schedule_visit intent, create activity
    if (response.action === 'schedule_visit' && lead) {
      await query(
        `INSERT INTO pipeline_activities (workspace_id, lead_id, type, description)
         VALUES ($1, $2, 'visita', 'Solicitud de visita por WhatsApp Bot')`,
        [workspaceId, lead.id]
      )
    }

    // If transfer_agent, notify workspace
    if (response.action === 'transfer_agent') {
      const { createNotification } = await import('@/lib/notifications/db')
      await createNotification({
        workspaceId,
        type: 'lead_nuevo',
        title: 'WhatsApp: Solicitud de contacto',
        message: `${phone} solicita hablar con un agente`,
        link: `/dashboard/whatsapp`,
      })
    }

    return NextResponse.json({
      success: true,
      response: response.message,
      intent,
      confidence,
      action: response.action,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const propertyId = searchParams.get('propertyId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    let property = null
    if (propertyId) {
      property = await queryOne(
        `SELECT p.*, w.name as workspace_name FROM properties p
         JOIN workspaces w ON w.id = p.workspace_id
         WHERE p.id=$1 AND p.workspace_id=$2`,
        [propertyId, workspaceId]
      )
    }

    // Get bot stats
    const stats = await queryOne(
      `SELECT
        COUNT(*) FILTER (WHERE direction='bot_incoming')::int as total_messages,
        COUNT(*) FILTER (WHERE direction='bot_outgoing')::int as bot_responses
       FROM whatsapp_messages
       WHERE workspace_id=$1 AND direction LIKE 'bot_%'`,
      [workspaceId]
    )

    return NextResponse.json({ property, stats: stats || {} })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
