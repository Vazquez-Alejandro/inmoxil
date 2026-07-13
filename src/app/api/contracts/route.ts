import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getPlan, checkLimit } from '@/lib/plans'
import { createContract, getContracts } from '@/lib/contracts/db'
import { generateContractNumber } from '@/lib/contracts/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const status = searchParams.get('status') as import('@/lib/contracts/types').ContractStatus | undefined
    const type = searchParams.get('type') as import('@/lib/contracts/types').ContractType | undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getContracts(workspaceId, { status, type, search, limit, offset })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, ...contractData } = body
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const plan = getPlan(workspace.plan)
    const contractCount = (await queryOne('SELECT COUNT(*)::int as c FROM contracts WHERE workspace_id=$1', [workspaceId]))?.c ?? 0
    const { allowed } = checkLimit(contractCount, plan.limits.contracts)
    if (!allowed) return NextResponse.json({ error: `Límite de ${plan.limits.contracts} contratos alcanzado. Actualizá tu plan para agregar más.` }, { status: 402 })

    const contract = await createContract({
      ...contractData,
      workspaceId,
      number: contractData.number || generateContractNumber(),
      status: contractData.status || 'borrador',
    })

    try {
      const daysUntil = contract.nextAdjustmentDate
        ? Math.ceil((new Date(contract.nextAdjustmentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
      if (daysUntil && daysUntil > 0 && daysUntil <= 60) {
        await (await import('@/lib/notifications/db')).createNotification({
          workspaceId, type: 'ajuste_proximo',
          title: 'Próximo ajuste de contrato',
          message: `El contrato "${contract.title}" tiene un ajuste en ${daysUntil} días (${contract.nextAdjustmentDate})`,
          link: `/dashboard/contracts/${contract.id}`,
        })
      }
    } catch {}

    return NextResponse.json({ success: true, contract })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}