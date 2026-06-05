import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const supabase = createServiceClient() as any

    const [propertiesResult, adsResult, creditsResult, workspaceResult, transactionsResult] = await Promise.all([
      supabase
        .from('properties')
        .select('id, portal, created_at')
        .eq('workspace_id', workspaceId),
      supabase
        .from('generated_ads')
        .select('id, created_at')
        .eq('workspace_id', workspaceId),
      supabase
        .from('workspaces')
        .select('credits_remaining, credits_used, plan')
        .eq('id', workspaceId)
        .single(),
      supabase
        .from('workspaces')
        .select('plan')
        .eq('id', workspaceId)
        .single(),
      supabase
        .from('credit_transactions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const properties = propertiesResult.data || []
    const ads = adsResult.data || []
    const credits = creditsResult.data || { credits_remaining: 0, credits_used: 0 }
    const transactions = transactionsResult.data || []

    const propertiesByPortal: Record<string, number> = {}
    properties.forEach((p: any) => {
      const portal = p.portal || 'unknown'
      propertiesByPortal[portal] = (propertiesByPortal[portal] || 0) + 1
    })

    const portalStats = Object.entries(propertiesByPortal)
      .map(([portal, count]) => ({ portal, count }))
      .sort((a, b) => b.count - a.count)

    const topProperties = properties.slice(0, 10).map((p: any) => ({
      id: p.id,
      portal: p.portal,
      created_at: p.created_at,
    }))

    return NextResponse.json({
      stats: {
        totalProperties: properties.length,
        totalAds: ads.length,
        creditsUsed: credits.credits_used || 0,
        creditsRemaining: credits.credits_remaining || 0,
      },
      portalStats,
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        created_at: t.created_at,
      })),
      topProperties,
    })
  } catch (error) {
    console.error('[Analytics] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
