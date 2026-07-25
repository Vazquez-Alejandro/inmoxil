import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = '/tmp/inmoxil-uploads'

export async function GET(_request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filename = params.path.join('/')
    const filepath = path.join(UPLOAD_DIR, filename)
    const resolvedUploadDir = path.resolve(UPLOAD_DIR)
    const resolvedFilepath = path.resolve(filepath)

    if (!resolvedFilepath.startsWith(resolvedUploadDir + '/') && resolvedFilepath !== resolvedUploadDir) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    if (!existsSync(resolvedFilepath)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const buffer = await readFile(filepath)
    const ext = filename.split('.').pop()?.toLowerCase()
    const mime: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime[ext || ''] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
