import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { queryOne } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const property = await queryOne(
      'SELECT * FROM properties WHERE id=$1 AND workspace_id=$2',
      [params.id, workspaceId]
    )
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const body = await request.json()
    const channelType = body.channelType
    if (!channelType) return NextResponse.json({ error: 'channelType requerido' }, { status: 400 })

    const { getChannel, createPublishLog, updatePublishLog } = await import('@/lib/publish/db')
    const channel = await getChannel(workspaceId, channelType)
    if (!channel) return NextResponse.json({ error: `Canal "${channelType}" no configurado` }, { status: 400 })
    if (!channel.active) return NextResponse.json({ error: 'Canal desactivado' }, { status: 400 })

    const log = await createPublishLog({
      workspaceId, propertyId: params.id,
      channelId: channel.id, channelType,
      propertyTitle: property.title || '',
      status: 'publishing',
    })

    try {
      if (channelType === 'mercadolibre') {
        const { publishToML } = await import('@/lib/publish/channels/ml')
        const result = await publishToML(property, channel)
        if (result.success) {
          await updatePublishLog(log.id!, {
            status: 'success', result, externalId: result.externalId, externalUrl: result.externalUrl,
          })
          return NextResponse.json({ success: true, log: { ...log, status: 'success', result } })
        } else {
          await updatePublishLog(log.id!, { status: 'error', error: result.error })
          return NextResponse.json({ success: false, error: result.error, log: { ...log, status: 'error' } })
        }
      } else {
        await updatePublishLog(log.id!, { status: 'error', error: `Canal "${channelType}" no implementado` })
        return NextResponse.json({ success: false, error: `Canal "${channelType}" no implementado` })
      }
    } catch (err: any) {
      await updatePublishLog(log.id!, { status: 'error', error: err.message })
      return NextResponse.json({ success: false, error: err.message, log: { ...log, status: 'error' } })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}