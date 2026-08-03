import { NextRequest, NextResponse } from 'next/server'
import { getDueSchedules, updateLastRun, createLog } from '@/lib/schedule/db'
import { scrapeUrls } from '@/lib/scrapingbee'
import { createNotification } from '@/lib/notifications/db'
import { upsertProperty } from '@/lib/properties'

const CRON_SECRET = process.env.CRON_SECRET
if (!CRON_SECRET) throw new Error('CRON_SECRET environment variable is required')

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const due = await getDueSchedules()
    const results: any[] = []

    for (const schedule of due) {
      const log = await createLog({
        workspaceId: schedule.workspaceId,
        scheduleId: schedule.id,
        portal: schedule.portal,
        status: 'running',
        itemsScraped: 0,
        itemsImported: 0,
      })

      try {
        if (!schedule.urls.length) {
          await createLog({
            workspaceId: schedule.workspaceId, portal: schedule.portal,
            status: 'error', itemsScraped: 0, itemsImported: 0,
            error: 'Sin URLs configuradas',
          })
          continue
        }

        const result = await scrapeUrls(schedule.urls, schedule.maxItems, schedule.portal)

        let imported = 0
        if (result.properties.length > 0) {
          for (const prop of result.properties) {
            try {
              await upsertProperty(prop, schedule.workspaceId)
              imported++
            } catch {}
          }
        }

        await updateLastRun(schedule.id!)
        await createLog({
          workspaceId: schedule.workspaceId, portal: schedule.portal,
          scheduleId: schedule.id, status: 'success',
          itemsScraped: result.properties.length, itemsImported: imported,
        })

        try {
          await createNotification({
            workspaceId: schedule.workspaceId, type: 'scraping_completado',
            title: `Scraping completado: ${schedule.portal}`,
            message: `Se importaron ${imported} propiedades de ${schedule.portal}`,
            link: '/dashboard/properties',
          })
        } catch {}

        results.push({ portal: schedule.portal, status: 'success', scraped: result.properties.length, imported })
      } catch (err: any) {
        await createLog({
          workspaceId: schedule.workspaceId, portal: schedule.portal,
          scheduleId: schedule.id, status: 'error',
          itemsScraped: 0, itemsImported: 0, error: err.message,
        })
        try {
          await createNotification({
            workspaceId: schedule.workspaceId, type: 'scraping_error',
            title: `Error en scraping: ${schedule.portal}`,
            message: err.message?.slice(0, 200),
            link: '/dashboard/scrape',
          })
        } catch {}
        results.push({ portal: schedule.portal, status: 'error', error: err.message })
      }
    }

    return NextResponse.json({ executed: due.length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}