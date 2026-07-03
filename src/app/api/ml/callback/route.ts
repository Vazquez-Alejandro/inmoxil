import { NextRequest, NextResponse } from 'next/server'
import { saveMLToken, getMLToken } from '@/lib/ml/db'
import { exchangeCode, refreshToken } from '@/lib/ml/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json({ error: `ML auth error: ${error}` }, { status: 400 })
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state', code: !!code, state: !!state, params: Object.fromEntries(searchParams.entries()) }, { status: 400 })
  }

  const CLIENT_ID = process.env.ML_CLIENT_ID || ''
  const CLIENT_SECRET = process.env.ML_CLIENT_SECRET || ''
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inmoxil.vercel.app'}/api/ml/callback`

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'ML credentials not configured', clientId: !!CLIENT_ID, clientSecret: !!CLIENT_SECRET }, { status: 500 })
  }

  try {
    const token = await exchangeCode(CLIENT_ID, CLIENT_SECRET, code, REDIRECT_URI)
    await saveMLToken(state, token)
    return NextResponse.redirect(new URL('/dashboard/ml?success=connected', request.url))
  } catch (err: any) {
    return NextResponse.json({ error: err.message, clientId: CLIENT_ID.substring(0, 5) + '...', redirectUri: REDIRECT_URI }, { status: 500 })
  }
}