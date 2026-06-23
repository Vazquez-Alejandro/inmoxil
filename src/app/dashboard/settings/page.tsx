'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

export default function SettingsPage() {
  const { workspace, refresh } = useWorkspace()
  const [form, setForm] = useState({
    name: '', slug: '',
    contact_email: '', contact_phone: '', contact_address: '',
    social_instagram: '', social_facebook: '', social_twitter: '', social_linkedin: '',
    whatsapp_number: '',
    public_catalog_enabled: false,
    pub_catalog_slug: '',
    primary_color: '#0F2B46', secondary_color: '#D4A843', accent_color: '#E85D3A',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!workspace) return
    setForm({
      name: workspace.name || '',
      slug: workspace.slug || '',
      contact_email: workspace.contact_email || '',
      contact_phone: workspace.contact_phone || '',
      contact_address: workspace.contact_address || '',
      social_instagram: workspace.social_instagram || '',
      social_facebook: workspace.social_facebook || '',
      social_twitter: workspace.social_twitter || '',
      social_linkedin: workspace.social_linkedin || '',
      whatsapp_number: workspace.whatsapp_number || '',
      public_catalog_enabled: workspace.public_catalog_enabled || false,
      pub_catalog_slug: workspace.pub_catalog_slug || '',
      primary_color: workspace.primary_color || '#0F2B46',
      secondary_color: workspace.secondary_color || '#D4A843',
      accent_color: workspace.accent_color || '#E85D3A',
    })
  }, [workspace])

  const handleSave = async () => {
    if (!workspace?.id) return
    setSaving(true)
    try {
      const res = await fetch('/api/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id, ...form }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSaved(true)
      refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="Configuración" subtitle="Personalizá tu workspace" />
      <div className="space-y-6">
        {/* General */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Información general</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nombre del workspace</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Slug (URL)</label>
              <input className="input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="mi-inmobiliaria" />
            </div>
            <div>
              <label className="label">Slug catálogo público</label>
              <input className="input" value={form.pub_catalog_slug} onChange={e => setForm({ ...form, pub_catalog_slug: e.target.value })} placeholder="inmoxil" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="catalogEnabled" className="w-4 h-4 rounded border-navy-300 text-gold-500 focus:ring-gold-500" checked={form.public_catalog_enabled} onChange={e => setForm({ ...form, public_catalog_enabled: e.target.checked })} />
              <label htmlFor="catalogEnabled" className="text-sm text-navy-700">Catálogo público habilitado</label>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Información de contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email de contacto</label>
              <input className="input" type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} placeholder="info@inmobiliaria.com" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} placeholder="+54 11 1234-5678" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Dirección</label>
              <input className="input" value={form.contact_address} onChange={e => setForm({ ...form, contact_address: e.target.value })} placeholder="Av. Corrientes 1234, CABA" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={form.whatsapp_number} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="541112345678" />
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Redes sociales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Instagram</label>
              <input className="input" value={form.social_instagram} onChange={e => setForm({ ...form, social_instagram: e.target.value })} placeholder="@inmobiliaria" />
            </div>
            <div>
              <label className="label">Facebook</label>
              <input className="input" value={form.social_facebook} onChange={e => setForm({ ...form, social_facebook: e.target.value })} placeholder="facebook.com/inmobiliaria" />
            </div>
            <div>
              <label className="label">Twitter / X</label>
              <input className="input" value={form.social_twitter} onChange={e => setForm({ ...form, social_twitter: e.target.value })} placeholder="@inmobiliaria" />
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <input className="input" value={form.social_linkedin} onChange={e => setForm({ ...form, social_linkedin: e.target.value })} placeholder="linkedin.com/company/inmobiliaria" />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Personalización visual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Color primario</label>
              <div className="flex gap-2 items-center">
                <input type="color" className="w-10 h-10 rounded border border-navy-200 cursor-pointer" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} />
                <input className="input flex-1 font-mono text-sm" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Color secundario</label>
              <div className="flex gap-2 items-center">
                <input type="color" className="w-10 h-10 rounded border border-navy-200 cursor-pointer" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} />
                <input className="input flex-1 font-mono text-sm" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Color de acento</label>
              <div className="flex gap-2 items-center">
                <input type="color" className="w-10 h-10 rounded border border-navy-200 cursor-pointer" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} />
                <input className="input flex-1 font-mono text-sm" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">✓ Cambios guardados</span>}
        </div>
      </div>
    </>
  )
}
