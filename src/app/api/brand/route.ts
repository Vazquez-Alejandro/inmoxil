import { NextRequest, NextResponse } from 'next/server'
import { updateWorkspaceBrand, getWorkspace } from '@/lib/workspace'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId' },
        { status: 400 }
      )
    }

    const workspace = await getWorkspace(workspaceId)

    return NextResponse.json({
      success: true,
      brand: {
        name: workspace.name,
        logo_url: workspace.logo_url,
        primary_color: workspace.primary_color,
        secondary_color: workspace.secondary_color,
        accent_color: workspace.accent_color,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo brand' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { workspaceId, logo_url, primary_color, secondary_color, accent_color } =
      await request.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId' },
        { status: 400 }
      )
    }

    const workspace = await updateWorkspaceBrand(workspaceId, {
      logo_url,
      primary_color,
      secondary_color,
      accent_color,
    })

    return NextResponse.json({
      success: true,
      brand: {
        name: workspace.name,
        logo_url: workspace.logo_url,
        primary_color: workspace.primary_color,
        secondary_color: workspace.secondary_color,
        accent_color: workspace.accent_color,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando brand' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, file } = await request.json()

    if (!workspaceId || !file) {
      return NextResponse.json(
        { error: 'Se requiere workspaceId y file' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const fileName = `${workspaceId}/logo-${Date.now()}.png`
    const fileBuffer = Buffer.from(file, 'base64')

    const { data, error } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(fileName)

    await updateWorkspaceBrand(workspaceId, { logo_url: urlData.publicUrl })

    return NextResponse.json({
      success: true,
      logo_url: urlData.publicUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error subiendo logo' },
      { status: 500 }
    )
  }
}
