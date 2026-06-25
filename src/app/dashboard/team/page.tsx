'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { useAuth } from '@/lib/auth'

export default function TeamPage() {
  const { workspace } = useWorkspace()
  const { user } = useAuth()
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', role: 'agent' })
  const [saving, setSaving] = useState(false)
  const [tempPass, setTempPass] = useState<string | null>(null)

  const isOwner = (user as any)?.role_in_workspace === 'owner' || (user as any)?.role === 'owner'

  useEffect(() => {
    if (!workspace?.id) return
    loadTeam()
  }, [workspace?.id])

  const loadTeam = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const res = await fetch(`/api/team?workspaceId=${workspace.id}`)
    const data = await res.json()
    setTeam(data.team || [])
    setLoading(false)
  }

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id) return
    setSaving(true)
    setTempPass(null)
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, ...form }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setTempPass(data.tempPassword)
      setForm({ email: '', name: '', role: 'agent' })
      loadTeam()
    } else {
      alert('Error: ' + (data.error || 'Error al invitar'))
    }
  }

  const changeRole = async (userId: string, role: string) => {
    if (!workspace?.id) return
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, userId, role }),
    })
    loadTeam()
  }

  const remove = async (userId: string) => {
    if (!workspace?.id || !confirm('¿Eliminar este miembro del equipo?')) return
    await fetch(`/api/team?workspaceId=${workspace.id}&userId=${userId}`, { method: 'DELETE' })
    loadTeam()
  }

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; color: string }> = {
      owner: { label: 'Dueño', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
      admin: { label: 'Admin', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' },
      agent: { label: 'Agente', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    }
    const m = map[role] || { label: role, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.color}`}>{m.label}</span>
  }

  return (
    <>
      <Header title="Equipo" subtitle="Gestioná los miembros de tu inmobiliaria" />

      {!isOwner ? (
        <div className="card p-12 text-center">
          <p className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Solo el dueño del workspace puede gestionar el equipo.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{team.length} miembro{team.length !== 1 ? 's' : ''}</p>
            <button onClick={() => { setShowForm(!showForm); setTempPass(null) }} className="btn-primary text-sm">
              + Invitar miembro
            </button>
          </div>

          {/* Invite form */}
          {showForm && (
            <div className="card p-5 mb-6 border-2 border-indigo-200">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Invitar nuevo miembro</h3>
              <form onSubmit={invite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Nombre completo" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="label">Rol</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="agent">Agente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enviando...' : 'Invitar'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancelar</button>
                </div>
              </form>
              {tempPass && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-medium text-amber-800">Contraseña temporal para {form.name}:</p>
                  <p className="text-amber-900 font-bold text-lg mt-1">{tempPass}</p>
                  <p className="text-xs text-amber-700 mt-1">Se envió por email. También podés copiarla ahora.</p>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-sm text-navy-400 dark:text-navy-300 dark:text-navy-100">Cargando...</div>
          ) : (
            <div className="space-y-2">
              {team.map(m => (
                <div key={m.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-sm">
                    {(m.name || m.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 dark:text-white">{m.name || 'Sin nombre'}</p>
                    <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {roleBadge(m.role_in_workspace || 'agent')}
                    {m.id !== user?.id && (
                      <>
                        <select value={m.role_in_workspace || 'agent'} onChange={e => changeRole(m.id, e.target.value)} className="text-xs bg-navy-50 border border-navy-200 rounded px-1.5 py-1">
                          <option value="agent">Agente</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Dueño</option>
                        </select>
                        <button onClick={() => remove(m.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Eliminar</button>
                      </>
                    )}
                    {m.id === user?.id && <span className="text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">(vos)</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}