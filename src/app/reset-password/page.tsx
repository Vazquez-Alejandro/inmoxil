'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-navy-900 mb-2">Enlace inválido</h2>
          <p className="text-navy-500 text-sm mb-6">El enlace de recuperación no es válido o ya expiró.</p>
          <Link href="/forgot-password" className="btn-primary">Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Error al restablecer contraseña')
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
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Contraseña restablecida</h2>
              <p className="text-navy-500 text-sm mb-6">Ya podés iniciar sesión con tu nueva contraseña.</p>
              <Link href="/login" className="btn-gold">Iniciar sesión</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-navy-900 mb-2 text-center">Nueva contraseña</h2>
              <p className="text-navy-500 text-sm mb-6 text-center">Ingresá tu nueva contraseña.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="label">Confirmar contraseña</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Repetí tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
                  {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="logo-mark w-12 h-12">Ix</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
