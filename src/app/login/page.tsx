'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-corporate relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="logo-mark w-16 h-16 mb-8">Ix</div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            La plataforma SaaS<br />
            <span className="text-gold-400">para inmobiliarias</span>
          </h1>
          <p className="text-navy-300 text-lg max-w-md leading-relaxed">
            Scraping multi-portal, generación de ads con tu marca, 
            billing por créditos y todo lo que necesitás para escalar 
            tu negocio inmobiliario.
          </p>
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-gold-400">8+</p>
              <p className="text-navy-400 text-sm">Portales soportados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">6</p>
              <p className="text-navy-400 text-sm">Templates de ads</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">24/7</p>
              <p className="text-navy-400 text-sm">Scraping automático</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="logo-mark">Ix</div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Inmoxil</h1>
              <p className="text-navy-500 text-[10px] uppercase tracking-widest">Plataforma SaaS</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-navy-900 mb-2">Iniciar sesión</h2>
          <p className="text-navy-500 mb-8">Accedé a tu panel de control</p>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Contraseña</label>
                <span className="text-xs text-navy-400">
                  <a href="/forgot-password" className="hover:text-gold-600">¿Olvidaste tu contraseña?</a>
                </span>
              </div>
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
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="divider my-8" />

          <p className="text-center text-sm text-navy-500">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-gold-600 hover:text-gold-700 font-semibold">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
