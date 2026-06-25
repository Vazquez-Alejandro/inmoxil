'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { useToast } from '@/lib/toast-context'

const plans = [
  {
    id: 'starter',
    name: 'Inicial',
    price: 29,
    credits: 50,
    features: [
      '50 créditos/mes',
      'Importación multi-portal',
      'Marca básica',
      'Soporte email',
    ],
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: 79,
    credits: 200,
    features: [
      '200 créditos/mes',
      'Todo del Inicial',
      'Acceso para desarrolladores',
      'Soporte prioritario',
      'Estadísticas avanzadas',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 199,
    credits: 1000,
    features: [
      '1.000 créditos/mes',
      'Todo del Profesional',
      'Multi-usuario',
      'Marca personalizada',
      'Disponibilidad 99.9%',
      'Account manager dedicado',
    ],
  },
]

export default function BillingPage() {
  const { workspace, refresh } = useWorkspace()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [creditHistory, setCreditHistory] = useState<any[]>([])

  const currentPlan = workspace?.plan || 'starter'
  const creditsUsed = workspace?.credits_used ?? 0
  const creditsTotal = plans.find(p => p.id === currentPlan)?.credits ?? 50

  useEffect(() => {
    if (workspace) {
      fetch(`/api/credits?workspaceId=${workspace.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.history) setCreditHistory(data.history)
        })
        .catch(() => {})
    }
  }, [workspace])

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
    } catch (err) {
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
    } catch (err) {
      toast({ type: 'error', message: 'Error al abrir portal de billing' })
    }
  }

  const trialEnd = workspace?.trial_ends_at ? new Date(workspace.trial_ends_at) : null
  const isTrialActive = trialEnd && trialEnd > new Date() && !workspace?.stripe_subscription_id
  const trialDaysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <>
      <Header
        title="Facturación"
        subtitle="Gestioná tu plan y créditos"
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
                <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Te quedan <span className="font-semibold text-emerald-600">{trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</span> de prueba gratis. Después elegí un plan para seguir.</p>
              </div>
            </div>
            <span className="badge-gold text-xs whitespace-nowrap">14 días gratis</span>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="card p-6 mb-8 border-l-4 border-gold-400">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white capitalize">Plan {currentPlan}</h3>
              <span className="badge-gold">Activo</span>
            </div>
            <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
              {creditsTotal} créditos incluidos • Se renuevan el 1 de cada mes
            </p>
          </div>
          <div className="text-right">
                <p className="text-3xl font-bold text-navy-900 dark:text-white">${plans.find(p => p.id === currentPlan)?.price || 29}</p>
            <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">/mes</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-navy-600 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Créditos utilizados</span>
            <span className="font-medium text-navy-900 dark:text-white">{creditsUsed} / {creditsTotal}</span>
          </div>
          <div className="w-full bg-navy-100 rounded-full h-2">
            <div
              className="bg-gold-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((creditsUsed / creditsTotal) * 100, 100)}%` }}
            />
          </div>
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
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card p-6 relative flex flex-col ${
                currentPlan === plan.id
                  ? 'border-gold-400 shadow-gold-glow'
                  : plan.popular
                  ? 'border-navy-900'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-navy-900 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy-900 dark:text-white">${plan.price}</span>
                  <span className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">/mes</span>
                </div>
                <p className="text-sm text-navy-500 mt-2 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{plan.credits} créditos/mes</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-300 dark:text-navy-100">
                    <svg className="w-4 h-4 text-gold-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={currentPlan === plan.id || loading === plan.id}
                className={`w-full mt-auto ${
                  currentPlan === plan.id
                    ? 'btn-outline opacity-50 cursor-not-allowed'
                    : plan.popular
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

      {/* Credit History */}
      {creditHistory.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Historial de créditos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header text-right">Créditos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {creditHistory.slice(0, 10).map((tx: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="table-cell">{new Date(tx.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="table-cell font-medium">{tx.description}</td>
                    <td className="table-cell text-right">
                      <span className={`font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-navy-900 dark:text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
