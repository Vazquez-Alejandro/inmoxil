'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const STEPS = [
  'Bienvenido',
  'Tu inmobiliaria',
  'Tu marca',
  'Tu plan',
  'Listo',
]

const PRESET_COLORS = {
  primary: ['#0f172a', '#1e3a5f', '#2d1b69', '#1a4731', '#7c2d12'],
  secondary: ['#6366f1', '#fbbf24', '#60a5fa', '#34d399', '#f97316'],
  accent: ['#10b981', '#ef4444', '#a855f7', '#14b8a6', '#3b82f6'],
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    features: ['200 propiedades', 'Scraping básico', '1 usuario', 'Soporte email'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    features: ['1000 propiedades', 'Scraping avanzado', '5 usuarios', 'Soporte prioritario', 'Brand kit personalizado'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    features: ['Ilimitado', 'Scraping multi-portal', 'Usuarios ilimitados', 'Soporte 24/7', 'API acceso', 'Integración MLS'],
  },
]

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [companyName, setCompanyName] = useState('Mi Inmobiliaria')
  const [colors, setColors] = useState({ primary: '#0f172a', secondary: '#6366f1', accent: '#10b981' })
  const [selectedPlan, setSelectedPlan] = useState('starter')
  const [saving, setSaving] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/user/workspace?userId=${user.id}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.workspace?.id) setWorkspaceId(data.workspace.id)
      })
  }, [user])

  const goTo = useCallback((target: number) => {
    if (target === step || transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setStep(target)
      setTimeout(() => setTransitioning(false), 50)
    }, 200)
  }, [step, transitioning])

  const next = () => {
    if (step === 4) return
    goTo(step + 1)
  }

  const back = () => {
    if (step === 0 || step === 4) return
    goTo(step - 1)
  }

  const handleFinish = async () => {
    if (!user || !workspaceId) return
    setSaving(true)
    try {
      await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          primary_color: colors.primary,
          secondary_color: colors.secondary,
          accent_color: colors.accent,
        }),
      })
      await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, name: companyName }),
      })
      goTo(4)
    } catch (e) {
      console.error(e)
      goTo(4)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="logo-mark w-12 h-12">Ix</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-navy-900' : 'text-navy-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`w-full max-w-2xl transition-all duration-200 ${
            transitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
          }`}
        >
          {step === 0 && <StepWelcome onNext={next} />}
          {step === 1 && (
            <StepCompany
              name={companyName}
              onChange={setCompanyName}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && (
            <StepBrand
              colors={colors}
              onChange={setColors}
              companyName={companyName}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepPlan
              selected={selectedPlan}
              onSelect={setSelectedPlan}
              onNext={handleFinish}
              onBack={back}
              saving={saving}
            />
          )}
          {step === 4 && <StepDone />}
        </div>
      </div>
    </div>
  )
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-gold-500 flex items-center justify-center text-white font-black text-3xl tracking-tighter mx-auto mb-8 shadow-gold-glow">
        Ix
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
        Bienvenido a <span className="text-gold-400">Inmoxil</span>
      </h1>
      <p className="text-navy-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
        Configurá tu inmobiliaria en menos de 2 minutos. Personalizá tu marca,
        elegí tu plan y empezá a generar propiedades profesionales.
      </p>
      <button onClick={onNext} className="btn-gold text-base px-10 py-4">
        Comenzar configuración
      </button>
    </div>
  )
}

function StepCompany({
  name,
  onChange,
  onNext,
  onBack,
}: {
  name: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-lg shadow-gold-500/20">
          Ix
        </div>
        <h2 className="text-3xl font-bold text-navy-900 mb-3 tracking-tight">
          ¿Cómo se llama tu <span className="text-gold-500">inmobiliaria</span>?
        </h2>
        <p className="text-navy-400 text-base leading-relaxed">
          Este nombre lo van a ver tus clientes en propiedades, publicaciones y más.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-navy-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-navy-200 bg-white text-navy-900 font-medium placeholder:text-navy-300 focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all duration-200"
            placeholder="Ej: Inmobiliaria del Sol"
            value={name}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

          <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl border border-navy-100 p-6 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
                Vista previa en el dashboard
              </p>
            </div>
            <div className="bg-white rounded-xl border border-navy-100 shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                  Ix
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy-900 text-sm truncate">{name.trim() || 'Tu inmobiliaria'}</p>
                  <p className="text-[10px] text-navy-400">Plataforma Inmoxil</p>
                </div>
              </div>
            </div>
          </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="flex-1 px-6 py-3 rounded-xl border-2 border-navy-300 text-navy-900 font-semibold text-sm hover:border-navy-400 hover:bg-navy-50 transition-all duration-200 active:scale-[0.98]">
            <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Atrás
          </button>
          <button onClick={onNext} className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold text-sm hover:from-gold-600 hover:to-gold-700 shadow-lg shadow-gold-500/20 transition-all duration-200 active:scale-[0.98]">
            Continuar
            <svg className="w-4 h-4 ml-1.5 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function StepBrand({
  colors,
  onChange,
  companyName,
  onNext,
  onBack,
}: {
  colors: { primary: string; secondary: string; accent: string }
  onChange: (c: { primary: string; secondary: string; accent: string }) => void
  companyName: string
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">
        Elegí tu marca
      </h2>
      <p className="text-navy-500 text-center mb-8">
        Personalizá los colores de tu inmobiliaria.
      </p>
      <div className="grid sm:grid-cols-2 gap-8 items-start">
        {/* Color pickers */}
        <div className="space-y-6">
          {(['primary', 'secondary', 'accent'] as const).map((role) => (
            <div key={role}>
              <label className="label capitalize">{role === 'primary' ? 'Primario' : role === 'secondary' ? 'Secundario' : 'Acento'}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors[role]}
                  onChange={(e) => onChange({ ...colors, [role]: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
                />
                <input
                  type="text"
                  value={colors[role]}
                  onChange={(e) => onChange({ ...colors, [role]: e.target.value })}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {PRESET_COLORS[role].map((c) => (
                  <button
                    key={c}
                    onClick={() => onChange({ ...colors, [role]: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      colors[role] === c ? 'border-navy-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Live preview */}
        <div className="card overflow-hidden shadow-corporate-lg">
          <div className="p-1" style={{ backgroundColor: colors.primary }}>
            <div className="bg-white rounded-t-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                  style={{ backgroundColor: colors.secondary, color: colors.primary }}
                >
                  Ix
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.primary }}>
                    {companyName}
                  </p>
                  <p className="text-[10px] text-gray-400">Propiedades disponibles</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg h-32 mb-3" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400">Casa en venta</p>
                  <p className="text-lg font-bold" style={{ color: colors.primary }}>
                    USD 285.000
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  Ver más
                </button>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 flex gap-2" style={{ backgroundColor: colors.primary }}>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white/90 bg-white/15">
              3 Dormitorios
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white/90 bg-white/15">
              2 Baños
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/15" style={{ color: colors.secondary }}>
              150 m²
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-8 max-w-md mx-auto">
        <button onClick={onBack} className="btn-outline flex-1">
          Atrás
        </button>
        <button onClick={onNext} className="btn-gold flex-1">
          Continuar
        </button>
      </div>
    </div>
  )
}

function StepPlan({
  selected,
  onSelect,
  onNext,
  onBack,
  saving,
}: {
  selected: string
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
  saving: boolean
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">
        Elegí tu plan
      </h2>
      <p className="text-navy-500 text-center mb-8">
        Empezá gratis con Starter. Cambiá cuando necesites más.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`card p-6 text-left transition-all duration-200 ${
              selected === plan.id
                ? 'border-gold-400 ring-2 ring-gold-400/30 -translate-y-1'
                : 'hover:border-gray-300'
            } ${plan.id === 'pro' ? 'relative' : ''}`}
          >
            {plan.id === 'pro' && (
              <span className="absolute -top-3 right-4 badge bg-gold-500 text-white text-[10px] font-bold">
                Popular
              </span>
            )}
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-1">
              {plan.name}
            </p>
            <p className="price-tag mb-4">
              {plan.price}
              <span className="text-sm font-normal text-navy-400">/mes</span>
            </p>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-navy-600">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <div className="flex gap-3 max-w-md mx-auto">
        <button onClick={onBack} className="btn-outline flex-1">
          Atrás
        </button>
        <button onClick={onNext} disabled={saving} className="btn-gold flex-1">
          {saving ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : (
            'Empezar con Starter'
          )}
        </button>
      </div>
    </div>
  )
}

function StepDone() {
  const router = useRouter()
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; delay: number; size: number }[]>([])

  useEffect(() => {
    const colors = ['#6366f1', '#10b981', '#0f172a', '#34d399', '#a855f7', '#fbbf24']
    const items = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * -20 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 6 + 4,
    }))
    setParticles(items)
  }, [])

  return (
    <div className="text-center relative overflow-hidden py-8">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: `confetti-fall 2.5s ease-in forwards`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-navy-900 mb-3 relative z-10">
        ¡Todo listo!
      </h2>
      <p className="text-navy-500 mb-8 relative z-10">
        Tu inmobiliaria está configurada. ¡Empezá a crear propiedades profesionales!
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="btn-gold text-base px-10 py-4 relative z-10"
      >
        Ir al Dashboard
      </button>
    </div>
  )
}
