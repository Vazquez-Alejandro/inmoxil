import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function updateSession(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/api/auth')

  const isPublicPage = request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/terminos' ||
    request.nextUrl.pathname === '/privacidad' ||
    request.nextUrl.pathname.startsWith('/propiedades') ||
    request.nextUrl.pathname.startsWith('/p/') ||
    request.nextUrl.pathname.startsWith('/owner') ||
    request.nextUrl.pathname.startsWith('/firmar') ||
    request.nextUrl.pathname.startsWith('/inquilino') ||
    request.nextUrl.pathname.startsWith('/pagar')

  if (!token && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (token && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
