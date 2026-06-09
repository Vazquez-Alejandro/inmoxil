import { NextRequest, NextResponse } from 'next/server'
import { checkCredits, getCreditHistory, deductCredit } from '@/lib/workspace'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Se requiere workspaceId' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const credits = await checkCredits(workspaceId)
    const history = await getCreditHistory(workspaceId, 20)
    return NextResponse.json({ success: true, credits, history })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, adId } = await request.json()
    if (!workspaceId || !adId) return NextResponse.json({ error: 'Se requiere workspaceId y adId' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const credits = await checkCredits(workspaceId)
    if (credits <= 0) return NextResponse.json({ error: 'Sin créditos', credits: 0 }, { status: 402 })

    const success = await deductCredit(workspaceId, adId)
    if (!success) return NextResponse.json({ error: 'Error descontando crédito' }, { status: 500 })

    const newCredits = await checkCredits(workspaceId)
    return NextResponse.json({ success: true, creditsRemaining: newCredits })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
