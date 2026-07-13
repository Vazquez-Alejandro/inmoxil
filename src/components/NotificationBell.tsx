'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorkspace } from '@/lib/workspace-context'
import Link from 'next/link'
import type { Notification } from '@/lib/notifications/db'

const ICON_MAP: Record<string, React.ReactNode> = {}

export default function NotificationBell() {
  const { workspace } = useWorkspace()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!workspace?.id) return
    fetch(`/api/notifications?workspaceId=${workspace.id}&limit=5&unreadOnly=true`)
      .then(r => r.json()).then(d => setNotifications(d.notifications || []))
    fetch(`/api/notifications?workspaceId=${workspace.id}&count=true`)
      .then(r => r.json()).then(d => setUnreadCount(d.count || 0))
    const interval = setInterval(() => {
      fetch(`/api/notifications?workspaceId=${workspace.id}&count=true`)
        .then(r => r.json()).then(d => setUnreadCount(d.count || 0))
    }, 30000)
    return () => clearInterval(interval)
  }, [workspace?.id])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAsRead = async (id: string) => {
    if (!workspace?.id) return
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, notificationId: id, action: 'read' }),
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    if (!workspace?.id) return
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, action: 'readAll' }),
    })
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-navy-400 hover:text-navy-600 transition-colors rounded-lg hover:bg-navy-100 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Marcar todas leídas</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-navy-400 dark:text-navy-300 dark:text-navy-100">Sin notificaciones</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-navy-50 border-b border-navy-50 last:border-0 cursor-pointer" onClick={() => markAsRead(n.id!)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'ajuste_proximo' || n.type === 'ajuste_completado' ? 'bg-emerald-100' :
                    n.type === 'contrato_vencimiento' ? 'bg-amber-100' :
                    n.type === 'lead_nuevo' ? 'bg-blue-100' :
                    n.type === 'scraping_error' || n.type === 'creditos_bajos' ? 'bg-red-100' :
                    n.type === 'scraping_completado' ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      n.type === 'ajuste_proximo' || n.type === 'ajuste_completado' ? 'text-emerald-600' :
                      n.type === 'contrato_vencimiento' ? 'text-amber-600' :
                      n.type === 'lead_nuevo' ? 'text-blue-600' :
                      n.type === 'scraping_error' || n.type === 'creditos_bajos' ? 'text-red-600' :
                      n.type === 'scraping_completado' ? 'text-indigo-600' : 'text-gray-600'
                    }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {n.type === 'ajuste_proximo' || n.type === 'ajuste_completado' ? <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> :
                      n.type === 'contrato_vencimiento' ? <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> :
                      n.type === 'lead_nuevo' ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> :
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    }</svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-800 dark:text-navy-200">{n.title}</p>
                    {n.message && <p className="text-xs text-navy-500 mt-0.5 line-clamp-2 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{n.message}</p>}
                    <p className="text-[10px] text-navy-400 mt-1 dark:text-navy-300 dark:text-navy-100">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/notifications" className="block text-center text-xs font-medium text-indigo-600 py-3 hover:bg-indigo-50 border-t border-navy-100" onClick={() => setOpen(false)}>
            Ver todas las notificaciones
          </Link>
        </div>
      )}
    </div>
  )
}