'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { useToast } from '@/lib/toast-context'
import { PLANS, getPlan, isUnlimited, type PlanConfig } from '@/lib/plans'

const LIMIT_LABELS: Record<string, { label: string; color: string }> = {
  properties: { label: 'Propiedades', color: 'bg-blue-500' },
  pipelineLeads: { label: 'Clientes en pipeline', color: 'bg-purple-500' },
  contracts: { label: 'Contratos activos', color: 'bg-indigo-500' },
  users: { label: 'Usuarios', color: 'bg-emerald-500' },
  importPortals: { label: 'Portales de importación', color: 'bg-amber-500' },
  publishPortals: { label: 'Portales de publicación', color: 'bg-rose-500' },
  adTemplates: { label: 'Plantillas de anuncios', color: 'bg-cyan-500' },
  whatsappMessages: { label: 'Mensajes WhatsApp', color: 'bg-green-500' },
}

export default function BillingPage() {
  const { workspace, refresh } = useWorkspace()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [usage, setUsage] = useState<Record<string, number>>({})

  const currentPlan = workspace?.plan || 'starter'
  const planConfig = getPlan(currentPlan)

  useEffect(() => {
    if (!workspace?.id) return
      fetch(`/api/usage?workspaceId=${workspace.id}`)
      .then(r => r.json())
      .then(data => setUsage(data))
      .catch(() => {})
  }, [workspace?.id])

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return
    setLoading(planId)
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', plan: planId, workspaceId: workspace?.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', message: data.error || 'Error al crear sesión de checkout' })
      }
    } catch {
      toast({ type: 'error', message: 'Error al procesar el pago' })
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal', workspaceId: workspace?.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', message: data.error || 'Error al abrir portal de billing' })
      }
    } catch {
      toast({ type: 'error', message: 'Error al abrir portal de billing' })
    }
  }

  const trialEnd = workspace?.trial_ends_at ? new Date(workspace.trial_ends_at) : null
  const isTrialActive = trialEnd && trialEnd > new Date() && !workspace?.stripe_subscription_id
  const trialDaysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  const limitKeys = ['properties', 'pipelineLeads', 'contracts', 'users', 'importPortals', 'publishPortals', 'adTemplates', 'whatsappMessages'] as const

  return (
    <>
      <Header
        title="Facturación"
        subtitle="Gestioná tu plan y límites"
      />

      {isTrialActive && (
        <div className="card p-5 mb-6 border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">Prueba gratis activa</p>
                <p className="text-sm text-navy-500 dark:text-navy-400">Te quedan <span className="font-semibold text-emerald-600">{trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</span> de prueba gratis. Después elegí un plan para seguir.</p>
              </div>
            </div>
            <span className="badge-gold text-xs whitespace-nowrap">14 días gratis</span>
          </div>
        </div>
      )}

      {/* Current Plan Summary */}
      <div className="card p-6 mb-8 border-l-4 border-emerald-400">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Plan {planConfig.nameEs}</h3>
              <span className="badge-gold">Activo</span>
            </div>
            <p className="text-sm text-navy-500 dark:text-navy-400">{planConfig.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-navy-900 dark:text-white">${planConfig.price}</p>
            <p className="text-sm text-navy-500 dark:text-navy-400">/mes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {limitKeys.map(key => {
            const max = planConfig.limits[key]
            const current = usage[key] ?? 0
            const pct = isUnlimited(max) ? 0 : Math.min((current / max) * 100, 100)
            const info = LIMIT_LABELS[key]
            return (
              <div key={key} className="bg-navy-50 dark:bg-navy-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">{info.label}</span>
                  <span className="text-sm font-bold text-navy-900 dark:text-white">
                    {isUnlimited(max) ? '∞' : `${max}`}
                  </span>
                </div>
                <div className="w-full bg-navy-200 dark:bg-navy-700 rounded-full h-1.5">
                  <div className={`${info.color} h-1.5 rounded-full transition-all ${isUnlimited(max) ? 'w-0' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                {!isUnlimited(max) && (
                  <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">{current} usados</p>
                )}
              </div>
            )
          })}
        </div>

        {workspace?.stripe_subscription_id && (
          <div className="mt-4">
            <button onClick={handleManageBilling} className="btn-ghost text-sm">
              Gestionar suscripción →
            </button>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Planes disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([PLANS.starter, PLANS.pro, PLANS.enterprise] as PlanConfig[]).map((plan) => (
            <div
              key={plan.id}
              className={`card p-6 relative flex flex-col ${
                currentPlan === plan.id
                  ? 'border-emerald-400 ring-1 ring-emerald-400'
                  : plan.id === 'pro'
                  ? 'border-navy-900 dark:border-navy-600'
                  : ''
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-navy-900 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{plan.nameEs}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy-900 dark:text-white">${plan.price}</span>
                  <span className="text-navy-500 dark:text-navy-400">/mes</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {limitKeys.map(key => {
                  const max = plan.limits[key]
                  const val = isUnlimited(max) ? '∞' : `${max}`
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-300">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="font-semibold">{val}</span> {LIMIT_LABELS[key]?.label || key}
                    </li>
                  )
                })}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={currentPlan === plan.id || loading === plan.id}
                className={`w-full mt-auto ${
                  currentPlan === plan.id
                    ? 'btn-outline opacity-50 cursor-not-allowed'
                    : plan.id === 'pro'
                    ? 'btn-gold'
                    : 'btn-primary'
                }`}
              >
                {currentPlan === plan.id ? 'Plan actual' : loading === plan.id ? 'Procesando...' : 'Actualizar plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
