import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { enhancedMatchLeadToProperties, enhancedMatchPropertyToLeads } from '@/lib/matching/enhanced'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const leadId = searchParams.get('leadId')
    const propertyId = searchParams.get('propertyId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    if (leadId) {
      const result = await enhancedMatchLeadToProperties(workspaceId, leadId)
      return NextResponse.json({ matches: result })
    }

    if (propertyId) {
      const result = await enhancedMatchPropertyToLeads(workspaceId, propertyId)
      return NextResponse.json({ matches: result })
    }

    return NextResponse.json({ error: 'leadId o propertyId requerido' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
