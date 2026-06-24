'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { useToast } from '@/lib/toast-context'

export default function BrandPage() {
  const { workspace, refresh } = useWorkspace()
  const { toast } = useToast()
  const [brand, setBrand] = useState({
    primaryColor: '#0f172a',
    secondaryColor: '#6366f1',
    accentColor: '#10b981',
    companyName: 'Mi Inmobiliaria',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    if (workspace) {
      setBrand({
        primaryColor: workspace.primary_color || '#0f172a',
        secondaryColor: workspace.secondary_color || '#6366f1',
        accentColor: workspace.accent_color || '#10b981',
        companyName: workspace.name || 'Mi Inmobiliaria',
      })
      if (workspace.logo_url) setLogoPreview(workspace.logo_url)
    }
  }, [workspace])

  const handleSave = async () => {
    if (!workspace?.id) return
    setSaving(true)
    try {
      if (logoFile) {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(logoFile!)
        })
        const logoRes = await fetch('/api/brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: workspace.id, file: base64 }),
        })
        const logoData = await logoRes.json()
        if (logoData.logo_url) setLogoPreview(logoData.logo_url)
      }
      const res = await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          primary_color: brand.primaryColor,
          secondary_color: brand.secondaryColor,
          accent_color: brand.accentColor,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setLogoFile(null)
        await refresh()
        toast({ type: 'success', message: 'Brand guardado correctamente' })
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast({ type: 'error', message: data.error || 'Error al guardar' })
      }
    } catch {
      toast({ type: 'error', message: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const handleRestore = () => {
    setBrand({
      primaryColor: '#0f172a',
      secondaryColor: '#6366f1',
      accentColor: '#10b981',
      companyName: workspace?.name || 'Mi Inmobiliaria',
    })
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
    }
  }

  return (
    <>
      <Header
        title="Mi Marca"
        subtitle="Personalizá los colores y la marca de tu inmobiliaria"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-6">Colores de marca</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Color principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    className="input flex-1"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Color secundario</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    className="input flex-1"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Color de acento</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.accentColor}
                    onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    className="input flex-1"
                    value={brand.accentColor}
                    onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-6">Logo</h3>
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-dashed border-gray-300 overflow-hidden"
                style={{ backgroundColor: brand.primaryColor, color: brand.secondaryColor }}
              >
                {logoFile ? (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  brand.companyName[0] || 'I'
                )}
              </div>
              <div>
                <label className="btn-outline mb-2 cursor-pointer inline-flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Subir logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-navy-400">PNG, SVG o JPG. Máx 2MB.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving} className="btn-gold">
              {saving ? 'Guardando...' : saved ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Guardado
                </span>
              ) : (
                'Guardar cambios'
              )}
            </button>
            <button onClick={handleRestore} className="btn-ghost">Restaurar defaults</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Vista previa</h3>
            <p className="text-sm text-navy-500 mb-6">Así se verán tus ads con tu marca</p>

            <div className="rounded-xl overflow-hidden shadow-corporate-lg mb-4">
              <div
                className="p-6 text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                    style={{ backgroundColor: brand.secondaryColor, color: brand.primaryColor }}
                  >
                    {brand.companyName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{brand.companyName}</p>
                    <p className="text-xs opacity-70">Propiedades destacadas</p>
                  </div>
                </div>
                <div
                  className="h-32 rounded-lg mb-4"
                  style={{ backgroundColor: `${brand.secondaryColor}30` }}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">Desde</p>
                    <p className="text-xl font-bold">$195.000 USD</p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-bold"
                    style={{ backgroundColor: brand.secondaryColor, color: brand.primaryColor }}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-corporate-lg aspect-[9/16] max-h-[300px]">
              <div
                className="h-full p-4 text-white flex flex-col justify-between"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ backgroundColor: brand.secondaryColor, color: brand.primaryColor }}
                  >
                    {brand.companyName[0]}
                  </div>
                  <p className="text-sm font-bold">{brand.companyName}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs opacity-70 mb-1">Desde</p>
                  <p className="text-2xl font-bold">$195.000 USD</p>
                  <p className="text-xs opacity-70 mt-1">3 amb • Palermo • 85m²</p>
                </div>
                <button
                  className="w-full py-3 rounded-lg text-sm font-bold text-center"
                  style={{ backgroundColor: brand.secondaryColor, color: brand.primaryColor }}
                >
                  Deslizá para ver más
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-3">Paleta de colores</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brand.primaryColor }} />
                <span className="text-sm text-navy-600">{brand.primaryColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brand.secondaryColor }} />
                <span className="text-sm text-navy-600">{brand.secondaryColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: brand.accentColor }} />
                <span className="text-sm text-navy-600">{brand.accentColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
