import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'path es requerido' }, { status: 400 })
    }

    if (!filePath.startsWith('/tmp/inmoxil-ads/')) {
      return NextResponse.json({ error: 'Ruta no permitida' }, { status: 403 })
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    const buffer = fs.readFileSync(filePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('[Ads Image] Error:', error)
    return NextResponse.json({ error: 'Error sirviendo imagen' }, { status: 500 })
  }
}
