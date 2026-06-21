import { NextRequest, NextResponse } from 'next/server'
import { saveMLToken, getMLToken } from '@/lib/ml/db'
import { exchangeCode, refreshToken } from '@/lib/ml/api'

const CLIENT_ID = process.env.ML_CLIENT_ID || ''
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET || ''
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inmoxil.vercel.app'}/api/ml/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // workspaceId
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/ml?error=${error}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard/ml?error=missing_params', request.url))
  }

  try {
    const token = await exchangeCode(CLIENT_ID, CLIENT_SECRET, code, REDIRECT_URI)
    await saveMLToken(state, token)
    return NextResponse.redirect(new URL('/dashboard/ml?success=connected', request.url))
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/dashboard/ml?error=${encodeURIComponent(err.message)}`, request.url))
  }
}