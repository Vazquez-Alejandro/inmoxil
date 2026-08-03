import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

interface FollowUpRule {
  daysInactive: number
  message: string
  priority: 'low' | 'medium' | 'high'
}

const DEFAULT_RULES: FollowUpRule[] = [
  {
    daysInactive: 3,
    message: 'Hola {nombre}! Te escribimos de {inmobiliaria}. ¿Te interesa la propiedad {propiedad}? ¿Tenés alguna consulta?',
    priority: 'low',
  },
  {
    daysInactive: 7,
    message: 'Hola {nombre}! Pasamos a consultar si seguís interesado/a en {propiedad}. Tenemos otras opciones similares si querés verlas.',
    priority: 'medium',
  },
  {
    daysInactive: 14,
    message: 'Hola {nombre}! Último mensaje sobre {propiedad}. Si tu interés cambió, no dudes en contactarnos. ¡Saludos!',
    priority: 'high',
  },
]

function replaceVariables(template: string, data: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, leadId, ruleIndex } = body

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    // Get workspace info
    const workspace = await queryOne('SELECT * FROM workspaces WHERE id=$1', [workspaceId])
    if (!workspace) return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })

    // Get leads that need follow-up
    let leads
    if (leadId) {
      // Single lead
      leads = await query(
        `SELECT pl.*, 
          (SELECT MAX(created_at) FROM pipeline_activities WHERE lead_id=pl.id) as last_activity,
          EXTRACT(DAY FROM NOW() - COALESCE(
            (SELECT MAX(created_at) FROM pipeline_activities WHERE lead_id=pl.id),
            pl.created_at
          )) as days_inactive
         FROM pipeline_leads pl
         WHERE pl.id=$1 AND pl.workspace_id=$2 AND pl.status NOT IN ('convertido', 'perdido')`,
        [leadId, workspaceId]
      )
    } else {
      // All leads needing follow-up
      leads = await query(
        `SELECT pl.*,
          (SELECT MAX(created_at) FROM pipeline_activities WHERE lead_id=pl.id) as last_activity,
          EXTRACT(DAY FROM NOW() - COALESCE(
            (SELECT MAX(created_at) FROM pipeline_activities WHERE lead_id=pl.id),
            pl.created_at
          )) as days_inactive
         FROM pipeline_leads pl
         WHERE pl.workspace_id=$1 
         AND pl.status NOT IN ('convertido', 'perdido')
         AND pl.phone IS NOT NULL
         AND EXTRACT(DAY FROM NOW() - COALESCE(
           (SELECT MAX(created_at) FROM pipeline_activities WHERE lead_id=pl.id),
           pl.created_at
         )) >= 3`,
        [workspaceId]
      )
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay leads para follow-up', sent: 0 })
    }

    let sent = 0
    const results = []

    for (const lead of leads) {
      const daysInactive = Math.floor(lead.days_inactive || 0)

      // Find matching rule
      let matchedRule: FollowUpRule | null = null
      let ruleIdx = 0
      for (let i = DEFAULT_RULES.length - 1; i >= 0; i--) {
        if (daysInactive >= DEFAULT_RULES[i].daysInactive) {
          matchedRule = DEFAULT_RULES[i]
          ruleIdx = i
          break
        }
      }

      if (!matchedRule) continue

      // Check if already sent this rule (simplified - check by content)
      const alreadySent = await queryOne(
        `SELECT id FROM whatsapp_messages
         WHERE workspace_id=$1 AND lead_id=$2 AND direction='followup'
         AND sent_at > NOW() - INTERVAL '7 days'`,
        [workspaceId, lead.id]
      )

      if (alreadySent) continue

      // Get property info if available
      let propertyName = 'nuestras propiedades'
      if (lead.property_id) {
        const prop = await queryOne('SELECT title FROM properties WHERE id=$1', [lead.property_id])
        if (prop) propertyName = prop.title
      }

      // Replace variables in message
      const message = replaceVariables(matchedRule.message, {
        nombre: lead.full_name || 'estimado/a',
        inmobiliaria: workspace.name || 'nuestra inmobiliaria',
        propiedad: propertyName,
      })

      // Save follow-up message
      await query(
        `INSERT INTO whatsapp_messages (workspace_id, lead_id, direction, content, status)
         VALUES ($1, $2, 'followup', $3, 'sent')`,
        [workspaceId, lead.id, message]
      )

      // Create activity
      await query(
        `INSERT INTO pipeline_activities (workspace_id, lead_id, type, description)
         VALUES ($1, $2, 'mensaje', $3)`,
        [workspaceId, lead.id, `Follow-up automático (${matchedRule.priority}): ${matchedRule.daysInactive} días sin contacto`]
      )

      sent++
      results.push({
        leadId: lead.id,
        leadName: lead.full_name,
        phone: lead.phone,
        daysInactive,
        rule: ruleIdx,
        priority: matchedRule.priority,
      })
    }

    return NextResponse.json({
      success: true,
      sent,
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    // Get follow-up stats
    const stats = await queryOne(
      `SELECT
        COUNT(*) FILTER (WHERE direction='followup')::int as total_followups,
        COUNT(*) FILTER (WHERE direction='followup')::int as sent_followups
       FROM whatsapp_messages
       WHERE workspace_id=$1`,
      [workspaceId]
    )

    // Get leads needing follow-up
    const needsFollowUp = await query(
      `SELECT pl.id, pl.full_name, pl.phone, pl.created_at
       FROM pipeline_leads pl
       WHERE pl.workspace_id=$1
       AND pl.status NOT IN ('convertido', 'perdido')
       AND pl.phone IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM pipeline_activities pa WHERE pa.lead_id = pl.id AND pa.created_at > NOW() - INTERVAL '3 days'
       )
       ORDER BY pl.created_at ASC
       LIMIT 20`,
      [workspaceId]
    )

    return NextResponse.json({
      stats: stats || {},
      needsFollowUp: needsFollowUp || [],
      rules: DEFAULT_RULES,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
