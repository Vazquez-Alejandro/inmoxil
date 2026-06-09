import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const [properties, ads, credits, transactions] = await Promise.all([
      query('SELECT id, portal, created_at FROM properties WHERE workspace_id=$1', [workspaceId]),
      query('SELECT id, created_at FROM generated_ads WHERE workspace_id=$1', [workspaceId]),
      queryOne('SELECT credits_remaining, credits_used, plan FROM workspaces WHERE id=$1', [workspaceId]),
      query('SELECT * FROM credit_transactions WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 10', [workspaceId]),
    ])

    const propertiesArr = properties || []
    const adsArr = ads || []
    const creditsRow = credits || { credits_remaining: 0, credits_used: 0 }
    const transactionsArr = transactions || []

    const propertiesByPortal: Record<string, number> = {}
    propertiesArr.forEach((p: any) => { propertiesByPortal[p.portal || 'unknown'] = (propertiesByPortal[p.portal || 'unknown'] || 0) + 1 })
    const portalStats = Object.entries(propertiesByPortal).map(([portal, count]) => ({ portal, count })).sort((a, b) => b.count - a.count)

    return NextResponse.json({
      stats: { totalProperties: propertiesArr.length, totalAds: adsArr.length, creditsUsed: creditsRow.credits_used || 0, creditsRemaining: creditsRow.credits_remaining || 0 },
      portalStats,
      transactions: transactionsArr.map((t: any) => ({ id: t.id, type: t.type, amount: t.amount, description: t.description, created_at: t.created_at })),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
