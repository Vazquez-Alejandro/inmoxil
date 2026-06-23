'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        router.replace('/owner/dashboard')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="logo-mark w-16 h-16 mb-8">Ix</div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Portal del<br />
            <span className="text-gold-400">Propietario</span>
          </h1>
          <p className="text-navy-300 text-lg max-w-md leading-relaxed">
            Accedé a tus propiedades, contratos y tickets de mantenimiento
            en un solo lugar, con toda la información actualizada.
          </p>
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-gold-400">Mis</p>
              <p className="text-navy-400 text-sm">Propiedades</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">Contratos</p>
              <p className="text-navy-400 text-sm">Activos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">Tickets</p>
              <p className="text-navy-400 text-sm">Mantenimiento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="logo-mark">Ix</div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Inmoxil</h1>
              <p className="text-navy-500 text-[10px] uppercase tracking-widest">Portal del Propietario</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-navy-900 mb-2">Iniciar sesión</h2>
          <p className="text-navy-500 mb-8">Accedé a tu panel de propietario</p>

          <Link href="/" className="inline-flex items-center gap-1 text-sm text-navy-400 hover:text-navy-600 transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al inicio
          </Link>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar al portal'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
