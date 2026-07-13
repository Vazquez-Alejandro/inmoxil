'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import type { Notification } from '@/lib/notifications/db'

const ICONS: Record<string, React.ReactNode> = {}

const TYPE_STYLES: Record<string, { bg: string; icon: string; color: string }> = {
  ajuste_proximo: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', color: 'text-emerald-600 dark:text-emerald-400' },
  contrato_vencimiento: { bg: 'bg-amber-100 dark:bg-amber-900/20', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', color: 'text-amber-600 dark:text-amber-400' },
  lead_nuevo: { bg: 'bg-blue-100 dark:bg-blue-900/20', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', color: 'text-blue-600 dark:text-blue-400' },
  scraping_completado: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253', color: 'text-indigo-600 dark:text-indigo-400' },
  scraping_error: { bg: 'bg-red-100 dark:bg-red-900/20', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z', color: 'text-red-600 dark:text-red-400' },
  creditos_bajos: { bg: 'bg-red-100 dark:bg-red-900/20', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75', color: 'text-red-600 dark:text-red-400' },
  ajuste_completado: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600 dark:text-emerald-400' },
  pago_exitoso: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z', color: 'text-emerald-600 dark:text-emerald-400' },
}

export default function NotificationsPage() {
  const { workspace } = useWorkspace()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const unreadOnly = filter === 'unread'
    const res = await fetch(`/api/notifications?workspaceId=${workspace.id}&limit=50&unreadOnly=${unreadOnly}`)
    const data = await res.json()
    setNotifications(data.notifications || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [workspace?.id, filter])

  const markRead = async (id: string) => {
    if (!workspace?.id) return
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, notificationId: id, action: 'read' }),
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = async () => {
    if (!workspace?.id) return
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, action: 'readAll' }),
    })
    setNotifications([])
  }

  return (
    <>
      <Header title="Notificaciones" subtitle="Historial de eventos y alertas" />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex bg-navy-100 rounded-lg p-0.5">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm' : 'text-navy-500 hover:text-navy-700 dark:text-navy-300'}`}>Todas</button>
          <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'unread' ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm' : 'text-navy-500 hover:text-navy-700 dark:text-navy-300'}`}>No leídas</button>
        </div>
        {notifications.length > 0 && filter === 'unread' && (
          <button onClick={markAllRead} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium ml-auto">Marcar todas leídas</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400 dark:text-navy-300 dark:text-navy-100">Cargando...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 text-navy-300 mx-auto mb-3 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-navy-500 font-medium dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Sin notificaciones</p>
          <p className="text-navy-400 text-sm mt-1 dark:text-navy-300 dark:text-navy-100">Las alertas aparecerán aquí automáticamente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className="card p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${TYPE_STYLES[n.type]?.bg || 'bg-gray-100'} flex items-center justify-center shrink-0`}>
                <svg className={`w-5 h-5 ${TYPE_STYLES[n.type]?.color || 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_STYLES[n.type]?.icon || 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{n.title}</p>
                    {n.message && <p className="text-sm text-navy-500 mt-0.5 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{n.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-navy-400 whitespace-nowrap dark:text-navy-300 dark:text-navy-100">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    <button onClick={() => markRead(n.id!)} className="p-1 rounded text-navy-300 hover:text-navy-600 hover:bg-navy-100 transition-colors dark:text-navy-400 dark:text-navy-300 dark:text-navy-100" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                {n.link && (
                  <a href={n.link} className="inline-block mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">Ver detalles →</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}