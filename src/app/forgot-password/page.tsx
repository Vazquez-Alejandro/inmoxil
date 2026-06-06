'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.error || 'Error al procesar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="logo-mark">Ix</div>
          <div>
            <h1 className="text-xl font-bold text-navy-900">Inmoxil</h1>
            <p className="text-navy-500 text-[10px] uppercase tracking-widest">Plataforma SaaS</p>
          </div>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Email enviado</h2>
              <p className="text-navy-500 text-sm mb-6">
                Si existe una cuenta con ese email, recibíste un enlace para restablecer tu contraseña.
              </p>
              <Link href="/login" className="btn-primary">
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-navy-900 mb-2 text-center">¿Olvidaste tu contraseña?</h2>
              <p className="text-navy-500 text-sm mb-6 text-center">
                Ingresá tu email y te enviaremos un enlace para restablecerla.
              </p>

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
                    placeholder="tu@inmobiliaria.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <div className="divider my-6" />

              <p className="text-center text-sm text-navy-500">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
                  Iniciá sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
