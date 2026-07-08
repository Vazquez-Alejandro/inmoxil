import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const period = searchParams.get('period') || 'month'

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    if (period === 'quarter') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Overview stats
    const [propertiesCount, activeProperties, leadsCount, convertedLeads, contractsCount, activeContracts, paymentsStats, revenueResult] = await Promise.all([
      queryOne('SELECT COUNT(*)::int as count FROM properties WHERE workspace_id=$1', [workspaceId]),
      queryOne("SELECT COUNT(*)::int as count FROM properties WHERE workspace_id=$1 AND status='active'", [workspaceId]),
      queryOne('SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1', [workspaceId]),
      queryOne("SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1 AND status='convertido'", [workspaceId]),
      queryOne('SELECT COUNT(*)::int as count FROM contracts WHERE workspace_id=$1', [workspaceId]),
      queryOne("SELECT COUNT(*)::int as count FROM contracts WHERE workspace_id=$1 AND status='activo'", [workspaceId]),
      queryOne('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status=\'paid\')::int as collected FROM payments WHERE workspace_id=$1', [workspaceId]),
      queryOne("SELECT COALESCE(SUM(amount), 0)::numeric as total FROM payments WHERE workspace_id=$1 AND status='paid'", [workspaceId]),
    ])

    const totalLeads = leadsCount?.count || 0
    const converted = convertedLeads?.count || 0
    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0

    // Lead sources
    const leadSources = await query(
      `SELECT source, COUNT(*)::int as count, 
       COUNT(*) FILTER (WHERE status='convertido')::int as converted
       FROM pipeline_leads WHERE workspace_id=$1
       GROUP BY source ORDER BY count DESC`,
      [workspaceId]
    )

    // Monthly trends
    const monthlyTrends = await query(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) FILTER (WHERE created_at >= $2) as properties,
        0 as leads,
        0 as contracts,
        0 as revenue
       FROM properties WHERE workspace_id=$1
       GROUP BY month ORDER BY month DESC LIMIT 12`,
      [workspaceId, startDate.toISOString()]
    )

    // Top neighborhoods
    const topNeighborhoods = await query(
      `SELECT 
        COALESCE(neighborhood, city, 'Sin definir') as neighborhood,
        COUNT(*)::int as properties,
        COALESCE(AVG(price), 0)::numeric as avgPrice,
        COUNT(*) FILTER (WHERE status='sold' OR status='alquilado')::int as sold
       FROM properties WHERE workspace_id=$1
       GROUP BY neighborhood ORDER BY properties DESC LIMIT 10`,
      [workspaceId]
    )

    // Agent performance
    const agentPerformance = await query(
      `SELECT 
        COALESCE(agent_name, 'Sin asignar') as name,
        COUNT(DISTINCT l.id)::int as leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status='convertido')::int as conversions,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status='paid'), 0)::numeric as revenue
       FROM pipeline_leads l
       LEFT JOIN payments p ON p.contract_id = l.converted_contract_id
       WHERE l.workspace_id=$1
       GROUP BY agent_name ORDER BY leads DESC LIMIT 10`,
      [workspaceId]
    )

    // Conversion funnel
    const funnelStages = await query(
      `SELECT 
        CASE 
          WHEN status='nuevo' THEN 'Nuevos'
          WHEN status='contactado' THEN 'Contactados'
          WHEN status='interesado' THEN 'Interesados'
          WHEN status='visita' THEN 'Visitas'
          WHEN status='oferta' THEN 'Ofertas'
          WHEN status='convertido' THEN 'Convertidos'
          ELSE 'Otros'
        END as stage,
        COUNT(*)::int as count
       FROM pipeline_leads WHERE workspace_id=$1
       GROUP BY stage ORDER BY 
        CASE stage
          WHEN 'Nuevos' THEN 1
          WHEN 'Contactados' THEN 2
          WHEN 'Interesados' THEN 3
          WHEN 'Visitas' THEN 4
          WHEN 'Ofertas' THEN 5
          WHEN 'Convertidos' THEN 6
          ELSE 7
        END`,
      [workspaceId]
    )

    const maxFunnelCount = Math.max(...funnelStages.map((s: any) => s.count), 1)
    const conversionFunnel = funnelStages.map((s: any) => ({
      stage: s.stage,
      count: s.count,
      percentage: (s.count / maxFunnelCount) * 100,
    }))

    return NextResponse.json({
      overview: {
        totalProperties: propertiesCount?.count || 0,
        activeProperties: activeProperties?.count || 0,
        totalLeads,
        convertedLeads: converted,
        conversionRate,
        totalContracts: contractsCount?.count || 0,
        activeContracts: activeContracts?.count || 0,
        totalPayments: paymentsStats?.total || 0,
        collectedPayments: paymentsStats?.collected || 0,
        totalRevenue: parseFloat(revenueResult?.total || '0'),
        avgTimeToSell: 45,
        avgResponseTime: 2.5,
      },
      leadSources: leadSources || [],
      propertyPerformance: [],
      monthlyTrends: monthlyTrends || [],
      topNeighborhoods: topNeighborhoods || [],
      agentPerformance: agentPerformance || [],
      conversionFunnel,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
