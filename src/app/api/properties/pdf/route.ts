import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { generatePropertyPDF } from '@/lib/pdf-generator'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, workspaceId } = await request.json()
    if (!propertyId || !workspaceId) return NextResponse.json({ error: 'Se requiere propertyId y workspaceId' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const property = await queryOne('SELECT * FROM properties WHERE id=$1 AND workspace_id=$2', [propertyId, workspaceId])
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const brand = await queryOne('SELECT name, primary_color, secondary_color FROM workspaces WHERE id=$1', [workspaceId])
    const brandConfig = { name: brand?.name || 'Ix', primaryColor: brand?.primary_color || '#0f172a', secondaryColor: brand?.secondary_color || '#6366f1' }

    const pdfBuffer = await generatePropertyPDF(property, brandConfig)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${property.title || 'propiedad'}.pdf"` },
    })
  } catch {
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}
