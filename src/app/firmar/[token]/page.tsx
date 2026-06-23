'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function SignPage() {
  const params = useParams()
  const token = params?.token as string
  const [sig, setSig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/signature/verify?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.signature) setSig(data.signature)
        else setError(data.error || 'Error al cargar')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [token])

  const handleAction = async (action: 'sign' | 'decline') => {
    setActing(true)
    try {
      const res = await fetch('/api/signature/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg(data.message)
      } else {
        alert(data.error || 'Error')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setActing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white">
      <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white">
      <div className="card p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-navy-900 mb-2">Error</h2>
        <p className="text-sm text-navy-500">{error}</p>
      </div>
    </div>
  )

  if (actionMsg) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white">
      <div className="card p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-navy-900 mb-2">¡Listo!</h2>
        <p className="text-sm text-navy-500">{actionMsg}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="logo-mark inline-flex mx-auto mb-3">Ix</div>
          <h1 className="text-2xl font-bold text-navy-900">Firma digital de contrato</h1>
          <p className="text-sm text-navy-500">{sig?.workspace_name}</p>
        </div>

        <div className="card p-8 space-y-6">
          <div className="text-center pb-4 border-b border-navy-100">
            <h2 className="text-xl font-bold text-navy-900">{sig?.contract_title}</h2>
            <p className="text-sm text-navy-500">Contrato N° {sig?.contract_number}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Locador</p>
              <p className="font-medium text-navy-900">{sig?.lessor_name}</p>
              <p className="text-navy-500">{sig?.lessor_document_type}: {sig?.lessor_document_number}</p>
            </div>
            <div>
              <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Locatario (firmante)</p>
              <p className="font-medium text-navy-900">{sig?.lessee_name}</p>
              <p className="text-navy-500">{sig?.lessee_document_type}: {sig?.lessee_document_number}</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Inmueble</p>
            <p className="font-medium text-navy-900">{sig?.property_address}</p>
          </div>

          <div className="text-sm">
            <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Monto</p>
            <p className="text-xl font-bold text-navy-900">
              {sig?.amount ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: sig.currency || 'ARS', maximumFractionDigits: 0 }).format(sig.amount) : '-'}
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Al firmar este documento, aceptás los términos y condiciones del contrato de alquiler.
              Esta firma tiene validez digital según la legislación vigente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => handleAction('sign')}
              disabled={acting}
              className="flex-1 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50"
            >
              {acting ? 'Procesando...' : 'Firmar documento'}
            </button>
            <button
              onClick={() => handleAction('decline')}
              disabled={acting}
              className="flex-1 px-6 py-3 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-navy-400 mt-6">Powered by Inmoxil - Plataforma SaaS para inmobiliarias</p>
      </div>
    </div>
  )
}
