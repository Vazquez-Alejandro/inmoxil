import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, leadId, propertyId, phone, content, templateId } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)

    let messageContent = content

    if (templateId) {
      const tmpl = await queryOne('SELECT * FROM whatsapp_templates WHERE id=$1 AND workspace_id=$2', [templateId, wsId])
      if (tmpl) {
        messageContent = tmpl.content
        if (body.variables) {
          const vars = body.variables
          const names = tmpl.variables || []
          names.forEach((name: string, i: number) => {
            messageContent = messageContent.replace(`{{${name}}}`, vars[i] || '')
          })
        }
      }
    }

    const msg = await queryOne(
      `INSERT INTO whatsapp_messages (workspace_id, lead_id, property_id, direction, content)
       VALUES ($1, $2, $3, 'sent', $4) RETURNING *`,
      [wsId, leadId || null, propertyId || null, messageContent]
    )

    const encoded = encodeURIComponent(messageContent)
    const waLink = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encoded}` : null

    return NextResponse.json({ success: true, message: msg, waLink })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
