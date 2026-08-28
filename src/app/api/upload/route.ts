import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = '/tmp/inmoxil-uploads'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo no enviado' }, { status: 400 })

    const mimeType = (file as any).type || ''
    const ext = ALLOWED_MIME[mimeType]
    if (!ext) return NextResponse.json({ error: 'Tipo de archivo no permitido (solo imágenes)' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length === 0 || buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 5MB)' }, { status: 400 })
    }

    const filename = `${crypto.randomUUID()}.${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, filename), buffer)

    const url = `/api/uploads/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al subir' }, { status: 500 })
  }
}
