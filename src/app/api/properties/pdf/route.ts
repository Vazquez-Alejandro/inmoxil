import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { generatePropertyPDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, workspaceId } = await request.json()

    if (!propertyId || !workspaceId) {
      return NextResponse.json({ error: 'Se requiere propertyId y workspaceId' }, { status: 400 })
    }

    const property = await queryOne(
      'SELECT * FROM properties WHERE id=$1 AND workspace_id=$2',
      [propertyId, workspaceId]
    )

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const brand = await queryOne(
      'SELECT name, primary_color, secondary_color FROM workspaces WHERE id=$1',
      [workspaceId]
    )

    const brandConfig = {
      name: brand?.name || 'Ix',
      primaryColor: brand?.primary_color || '#0F2B46',
      secondaryColor: brand?.secondary_color || '#D4A843',
    }

    const pdfBuffer = await generatePropertyPDF(property, brandConfig)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${property.title || 'propiedad'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[PDF] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generando PDF' },
      { status: 500 }
    )
  }
}
