import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getMLToken, saveMLToken, deleteMLToken, isMLConnected } from '@/lib/ml/db'
import { exchangeCode, refreshToken, getAuthUrl, getMyItems, createItem, getSiteCategories } from '@/lib/ml/api'

const CLIENT_ID = process.env.ML_CLIENT_ID || ''
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET || ''
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inmoxil.vercel.app'}/api/ml/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspaceId')
  const action = searchParams.get('action')

  if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })
  const { workspace, error } = await requireWorkspaceAuth(workspaceId)
  if (error) return error

  try {
    if (action === 'authUrl') {
      if (!CLIENT_ID) return NextResponse.json({ error: 'ML_CLIENT_ID no configurado' }, { status: 400 })
      const url = getAuthUrl(CLIENT_ID, REDIRECT_URI, workspaceId)
      return NextResponse.json({ url })
    }

    if (action === 'status') {
      const connected = await isMLConnected(workspaceId)
      const token = await getMLToken(workspaceId)
      return NextResponse.json({ connected, sellerId: token?.sellerId || null })
    }

    if (action === 'items') {
      const token = await getMLToken(workspaceId)
      if (!token) return NextResponse.json({ error: 'No conectado a MercadoLibre' }, { status: 400 })

      if (new Date(token.expiresAt) < new Date()) {
        if (!CLIENT_ID || !CLIENT_SECRET) return NextResponse.json({ error: 'ML credenciales no configuradas' }, { status: 400 })
        const refreshed = await refreshToken(CLIENT_ID, CLIENT_SECRET, token.refreshToken)
        await saveMLToken(workspaceId, refreshed)
        token.accessToken = refreshed.accessToken
        token.userId = refreshed.userId
      }

      const items = await getMyItems(token.accessToken, token.userId)
      return NextResponse.json({ items })
    }

    if (action === 'categories') {
      const categories = await getSiteCategories()
      return NextResponse.json({ categories })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, action } = body

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    if (action === 'disconnect') {
      await deleteMLToken(workspaceId)
      return NextResponse.json({ success: true })
    }

    if (action === 'publish') {
      const token = await getMLToken(workspaceId)
      if (!token) return NextResponse.json({ error: 'No conectado a MercadoLibre' }, { status: 400 })

      if (new Date(token.expiresAt) < new Date()) {
        if (!CLIENT_ID || !CLIENT_SECRET) return NextResponse.json({ error: 'ML credenciales no configuradas' }, { status: 400 })
        const refreshed = await refreshToken(CLIENT_ID, CLIENT_SECRET, token.refreshToken)
        await saveMLToken(workspaceId, refreshed)
        token.accessToken = refreshed.accessToken
      }

      const result = await createItem(token.accessToken, body.item)
      return NextResponse.json({ item: result })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}