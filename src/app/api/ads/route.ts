import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateAd, getTemplateList, type AdType, type TemplateId } from '@/lib/ad-generator'
import { checkCredits } from '@/lib/workspace'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, templateId, workspaceId, adType = 'feed' } = await request.json()

    if (!propertyId || !templateId || !workspaceId) {
      return NextResponse.json(
        { error: 'Se requiere propertyId, templateId y workspaceId' },
        { status: 400 }
      )
    }

    const validTemplates = getTemplateList().map(t => t.id)
    if (!validTemplates.includes(templateId as TemplateId)) {
      return NextResponse.json({ error: 'Template inválido' }, { status: 400 })
    }

    const validTypes: AdType[] = ['feed', 'story', 'reel', 'meta_ad']
    if (!validTypes.includes(adType as AdType)) {
      return NextResponse.json({ error: 'Tipo de ad inválido' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const credits = await checkCredits(workspaceId)
    if (credits <= 0) {
      return NextResponse.json(
        { error: 'Sin créditos disponibles. Actualizá tu plan.', credits: 0 },
        { status: 402 }
      )
    }

    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })
    }

    const brandConfig = {
      primary_color: workspace.primary_color || '#0F2B46',
      secondary_color: workspace.secondary_color || '#D4A843',
      accent_color: workspace.accent_color || '#E85D3A',
      name: workspace.name || 'Inmoxil',
      logo_url: workspace.logo_url || null,
    }

    const { data: adRecord, error: adError } = await supabase
      .from('generated_ads')
      .insert({
        workspace_id: workspaceId,
        property_id: propertyId,
        type: adType as AdType,
        image_url: '',
        template_id: templateId,
        credits_used: 1,
      })
      .select()
      .single()

    if (adError || !adRecord) {
      return NextResponse.json({ error: 'Error creando registro del ad' }, { status: 500 })
    }

    let imagePath: string
    try {
      imagePath = await generateAd(
        {
          id: property.id,
          title: property.title,
          price: property.price,
          currency: property.currency,
          address: property.address,
          beds: property.beds,
          baths: property.baths,
          sqm: property.sqm,
          property_type: property.property_type,
          photos: property.photos || [],
          description: property.description || '',
          neighborhood: property.neighborhood,
          city: property.city,
        },
        brandConfig,
        templateId as TemplateId,
        adType as AdType
      )
    } catch (genError) {
      console.error('[Ads] Generation error:', genError)
      await supabase.from('generated_ads').delete().eq('id', adRecord.id)
      return NextResponse.json(
        { error: 'Error generando la imagen del ad' },
        { status: 500 }
      )
    }

    const imageUrl = `/api/ads/image?path=${encodeURIComponent(imagePath)}`

    await supabase
      .from('generated_ads')
      .update({ image_url: imageUrl })
      .eq('id', adRecord.id)

    const { error: deductError } = await supabase.rpc('deduct_credit', {
      p_workspace_id: workspaceId,
      p_ad_id: adRecord.id,
    })

    if (deductError) {
      console.error('[Ads] Credit deduction error:', deductError)
    }

    const newCredits = await checkCredits(workspaceId)

    return NextResponse.json({
      success: true,
      ad: {
        id: adRecord.id,
        image_url: imageUrl,
        template_id: templateId,
        type: adType,
        property_id: propertyId,
        created_at: adRecord.created_at,
      },
      creditsRemaining: newCredits,
    })
  } catch (error) {
    console.error('[Ads] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId es requerido' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('generated_ads')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ ads: data || [] })
  } catch (error) {
    console.error('[Ads] Error listing ads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
