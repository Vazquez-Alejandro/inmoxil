import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ properties: data || [] })
  } catch (error) {
    console.error('[Properties] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, properties } = body

    if (!workspaceId || !properties?.length) {
      return NextResponse.json({ error: 'workspaceId and properties required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const inserts = properties.map((p: any) => ({
      workspace_id: workspaceId,
      portal: p.portal || 'unknown',
      title: p.title || '',
      price: p.price || null,
      currency: p.currency || 'USD',
      address: p.address || '',
      neighborhood: p.neighborhood || '',
      city: p.city || '',
      state: p.state || '',
      country: p.country || '',
      beds: p.features?.beds || null,
      baths: p.features?.baths || null,
      sqm: p.features?.area || null,
      property_type: p.propertyType || 'apartment',
      status: 'active',
      url: p.url || '',
      photos: p.photos || [],
      description: p.description || '',
      features: p.features ? Object.values(p.features).filter(Boolean).map(String) : [],
      source_url: p.url || '',
    }))

    const { data, error } = await supabase
      .from('properties')
      .insert(inserts)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (error) {
    console.error('[Properties] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
