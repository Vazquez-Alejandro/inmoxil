import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const [properties, leads, contracts, tickets, paymentsRes] = await Promise.all([
      query('SELECT COUNT(*) as total, COALESCE(SUM(price),0) as portfolio_value FROM properties WHERE workspace_id=$1', [workspaceId]),
      query('SELECT COUNT(*) as total FROM pipeline_leads WHERE workspace_id=$1 AND status=$2', [workspaceId, 'activo']),
      query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ($1,$2)) as active FROM contracts WHERE workspace_id=$3', ['activo', 'vigente', workspaceId]),
      query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status=$1) as open FROM maintenance_tickets WHERE workspace_id=$2', ['pendiente', workspaceId]),
      query('SELECT COALESCE(SUM(amount),0) as collected, COUNT(*) as total_payments FROM payments WHERE workspace_id=$1 AND status=$2', [workspaceId, 'paid']),
    ])

    const propertiesByType = await query(
      'SELECT property_type, COUNT(*) as count FROM properties WHERE workspace_id=$1 GROUP BY property_type ORDER BY count DESC',
      [workspaceId]
    )

    const leadsBySource = await query(
      'SELECT source, COUNT(*) as count FROM pipeline_leads WHERE workspace_id=$1 GROUP BY source ORDER BY count DESC',
      [workspaceId]
    )

    const contractsByStatus = await query(
      'SELECT status, COUNT(*) as count FROM contracts WHERE workspace_id=$1 GROUP BY status',
      [workspaceId]
    )

    const monthlyLeads = await query(
      `SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*) as count
       FROM pipeline_leads WHERE workspace_id=$1 AND created_at > NOW() - INTERVAL '12 months'
       GROUP BY month ORDER BY month`,
      [workspaceId]
    )

    const recentPayments = await query(
      `SELECT p.*, c.title as contract_title
       FROM payments p LEFT JOIN contracts c ON c.id = p.contract_id
       WHERE p.workspace_id=$1 ORDER BY p.created_at DESC LIMIT 20`,
      [workspaceId]
    )

    return NextResponse.json({
      stats: {
        totalProperties: parseInt(properties[0]?.total || '0'),
        portfolioValue: parseFloat(properties[0]?.portfolio_value || '0'),
        activeLeads: parseInt(leads[0]?.total || '0'),
        totalContracts: parseInt(contracts[0]?.total || '0'),
        activeContracts: parseInt(contracts[0]?.active || '0'),
        openTickets: parseInt(tickets[0]?.open || '0'),
        totalCollected: parseFloat(paymentsRes[0]?.collected || '0'),
        totalPayments: parseInt(paymentsRes[0]?.total_payments || '0'),
      },
      propertiesByType,
      leadsBySource,
      contractsByStatus,
      monthlyLeads,
      recentPayments,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
