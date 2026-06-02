import { NextRequest, NextResponse } from 'next/server'
import { checkCredits, getCreditHistory, deductCredit } from '@/lib/workspace'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId' },
        { status: 400 }
      )
    }

    const credits = await checkCredits(workspaceId)
    const history = await getCreditHistory(workspaceId, 20)

    return NextResponse.json({
      success: true,
      credits,
      history,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo créditos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, adId } = await request.json()

    if (!workspaceId || !adId) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId y adId' },
        { status: 400 }
      )
    }

    const credits = await checkCredits(workspaceId)

    if (credits <= 0) {
      return NextResponse.json(
        { error: 'Sin créditos disponibles. Actualizá tu plan.', credits: 0 },
        { status: 402 }
      )
    }

    const success = await deductCredit(workspaceId, adId)

    if (!success) {
      return NextResponse.json(
        { error: 'Error descontando crédito' },
        { status: 500 }
      )
    }

    const newCredits = await checkCredits(workspaceId)

    return NextResponse.json({
      success: true,
      creditsRemaining: newCredits,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error procesando crédito' },
      { status: 500 }
    )
  }
}
