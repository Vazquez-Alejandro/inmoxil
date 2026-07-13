import { NextRequest, NextResponse } from 'next/server'
import { generateAd, getTemplateList, type AdType, type TemplateId } from '@/lib/ad-generator'
import { queryOne, insertOne, query } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, templateId, workspaceId, adType = 'feed' } = await request.json()
    if (!propertyId || !templateId || !workspaceId) return NextResponse.json({ error: 'Se requiere propertyId, templateId y workspaceId' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const validTemplates = getTemplateList().map(t => t.id)
    if (!validTemplates.includes(templateId as TemplateId)) return NextResponse.json({ error: 'Template inválido' }, { status: 400 })
    const validTypes: AdType[] = ['feed', 'story', 'reel', 'meta_ad']
    if (!validTypes.includes(adType as AdType)) return NextResponse.json({ error: 'Tipo de ad inválido' }, { status: 400 })

    const property = await queryOne('SELECT * FROM properties WHERE id=$1 AND workspace_id=$2', [propertyId, workspaceId])
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const brandConfig = {
      primary_color: workspace.primary_color || '#0f172a',
      secondary_color: workspace.secondary_color || '#6366f1',
      accent_color: workspace.accent_color || '#10b981',
      name: workspace.name || 'Inmoxil',
      logo_url: workspace.logo_url || null,
    }

    const adRecord = await insertOne('generated_ads', {
      workspace_id: workspaceId, property_id: propertyId, type: adType,
      image_url: '', template_id: templateId,
    })
    if (!adRecord) return NextResponse.json({ error: 'Error creando registro del ad' }, { status: 500 })

    let imagePath: string
    try {
      imagePath = await generateAd({
        id: property.id, title: property.title, price: property.price, currency: property.currency,
        address: property.address, beds: property.beds, baths: property.baths, sqm: property.sqm,
        property_type: property.property_type,
        photos: typeof property.photos === 'string' ? JSON.parse(property.photos) : (property.photos || []),
        description: property.description || '', neighborhood: property.neighborhood, city: property.city,
      }, brandConfig, templateId as TemplateId, adType as AdType)
    } catch {
      await query('DELETE FROM generated_ads WHERE id=$1', [adRecord.id])
      return NextResponse.json({ error: 'Error generando la imagen del ad' }, { status: 500 })
    }

    const imageUrl = `/api/ads/image?path=${encodeURIComponent(imagePath)}`
    await query('UPDATE generated_ads SET image_url=$1 WHERE id=$2', [imageUrl, adRecord.id])

    return NextResponse.json({ success: true, ad: { id: adRecord.id, image_url: imageUrl, template_id: templateId, type: adType, property_id: propertyId, created_at: adRecord.created_at } })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId es requerido' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const data = await query('SELECT * FROM generated_ads WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 50', [workspaceId])
    return NextResponse.json({ ads: data || [] })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
