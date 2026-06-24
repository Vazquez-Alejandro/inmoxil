'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!formData.acceptTerms) {
      setError('Debés aceptar los Términos y Condiciones para registrarte')
      return
    }

    setLoading(true)

    const result = await signUp(formData.email, formData.password, formData.companyName, formData.name)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.href = '/onboarding'
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-corporate relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="logo-mark w-16 h-16 mb-8">Ix</div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Creá tu cuenta<br />
            <span className="text-gold-400">en minutos</span>
          </h1>
          <p className="text-navy-300 text-lg max-w-md leading-relaxed">
            Empezá gratis con 50 créditos incluidos. Sin tarjeta de crédito.
            Escalá cuando necesites más potencia.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-navy-200 text-sm">50 créditos gratis al registrarte</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-navy-200 text-sm">Importación multi-portal incluida</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-navy-200 text-sm">Marca personalizada con tu identidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="logo-mark">Ix</div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Inmoxil</h1>
              <p className="text-navy-500 text-[10px] uppercase tracking-widest">Plataforma en la nube</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-navy-900 mb-2">Crear cuenta</h2>
          <p className="text-navy-500 mb-2">Registrate para empezar a usar Inmoxil</p>
          <p className="text-xs text-emerald-600 font-medium mb-6 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            14 días de prueba gratis. Sin tarjeta de crédito.
          </p>

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
              <label className="label">Nombre de la inmobiliaria</label>
              <input
                type="text"
                className="input"
                placeholder="Mi Inmobiliaria SRL"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Tu nombre</label>
              <input
                type="text"
                className="input"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@inmobiliaria.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-50 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta gratis — 14 días de prueba'
              )}
            </button>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                required
              />
              <span className="text-xs text-navy-500 leading-relaxed">
                Acepto los{' '}
                <Link href="/terminos" target="_blank" className="text-gold-600 hover:text-gold-700 underline">Términos de Servicio</Link>
                {' '}y la{' '}
                <Link href="/privacidad" target="_blank" className="text-gold-600 hover:text-gold-700 underline">Política de Privacidad</Link>.
                Entiendo que el scraping debe usarse de forma lícita y responsable.
              </span>
            </label>
          </form>

          <div className="divider my-8" />

          <p className="text-center text-sm text-navy-500">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
