import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getContract } from '@/lib/contracts/db'
import { getAdjustments } from '@/lib/contracts/db'
import { createAdjustment } from '@/lib/contracts/db'
import { calculateIPCAdjustment, calculateICLAdjustment } from '@/lib/ipc-icl/formulas'
import { fetchLatestIPC, fetchLatestICL } from '@/lib/ipc-icl/fetcher'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')
    const workspaceId = searchParams.get('workspaceId')
    const pending = searchParams.get('pending') === 'true'

    if (workspaceId && pending) {
      const { workspace, error } = await requireWorkspaceAuth(workspaceId)
      if (error) return error
      const { getPendingAdjustments } = await import('@/lib/contracts/db')
      const contracts = await getPendingAdjustments(workspaceId, 30)
      return NextResponse.json({ pending: contracts.length, contracts })
    }

    if (!contractId) return NextResponse.json({ error: 'contractId requerido' }, { status: 400 })

    const contract = await getContract(contractId)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    const adjustments = await getAdjustments(contractId)
    return NextResponse.json({ adjustments })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractId } = body
    if (!contractId) return NextResponse.json({ error: 'contractId requerido' }, { status: 400 })

    const contract = await getContract(contractId)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    if (contract.financial.adjustmentIndex === 'NONE') {
      return NextResponse.json({ error: 'Este contrato no tiene ajuste configurado' }, { status: 400 })
    }

    const indexType = contract.financial.adjustmentIndex
    const indexData = indexType === 'IPC'
      ? await fetchLatestIPC()
      : await fetchLatestICL()

    if (!indexData) {
      return NextResponse.json({ error: `No se pudo obtener el ${indexType} actual` }, { status: 502 })
    }

    const previousAmount = contract.financial.amount
    const baseIndex = contract.lastAdjustmentValue || indexData.value
    const currentIndex = indexData.value

    const result = indexType === 'IPC'
      ? calculateIPCAdjustment(previousAmount, baseIndex, currentIndex)
      : calculateICLAdjustment(previousAmount, baseIndex, currentIndex)

    const adjustment = await createAdjustment({
      contractId,
      previousAmount: result.previousAmount,
      newAmount: result.newAmount,
      previousIndex: result.previousIndex,
      currentIndex: result.currentIndex,
      variation: result.variation,
      indexType: result.indexType,
      adjustmentDate: result.adjustmentDate,
    })

    const { calculateNextAdjustment } = await import('@/lib/contracts/utils')
    const nextDate = calculateNextAdjustment(
      result.adjustmentDate, contract.startDate, contract.financial.adjustmentFrequencyMonths
    )

    const { updateContract } = await import('@/lib/contracts/db')
    await updateContract(contractId, {
      lastAdjustmentDate: result.adjustmentDate,
      lastAdjustmentValue: currentIndex,
      nextAdjustmentDate: nextDate,
    } as any)

    return NextResponse.json({ success: true, adjustment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}