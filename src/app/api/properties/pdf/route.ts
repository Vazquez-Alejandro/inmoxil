import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generatePropertyPDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, workspaceId } = await request.json()

    if (!propertyId || !workspaceId) {
      return NextResponse.json({ error: 'Se requiere propertyId y workspaceId' }, { status: 400 })
    }

    const supabase: any = createServiceClient()
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('workspace_id', workspaceId)
      .single()

    if (error || !property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const { data: brand } = await supabase
      .from('workspaces')
      .select('brand_name, brand_primary, brand_secondary')
      .eq('id', workspaceId)
      .single()

    const brandConfig = {
      name: brand?.brand_name || 'Ix',
      primaryColor: brand?.brand_primary || '#0F2B46',
      secondaryColor: brand?.brand_secondary || '#D4A843',
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
