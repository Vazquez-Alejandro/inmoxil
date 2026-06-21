import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = '/tmp/inmoxil-uploads'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo no enviado' }, { status: 400 })

    const ext = file.name?.split('.').pop() || 'jpg'
    const filename = `${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, filename), buffer)

    const url = `/api/uploads/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al subir' }, { status: 500 })
  }
}
