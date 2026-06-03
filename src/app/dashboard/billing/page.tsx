'use client'

import { useState } from 'react'
import Header from '@/components/Header'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 50,
    features: [
      '50 créditos/mes',
      'Scraping multi-portal',
      'Brand kit básico',
      'Soporte email',
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 200,
    features: [
      '200 créditos/mes',
      'Todo del Starter',
      'API acceso',
      'Soporte prioritario',
      'Analytics avanzados',
    ],
    current: false,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    credits: 1000,
    features: [
      '1.000 créditos/mes',
      'Todo del Pro',
      'Multi-usuario',
      'Custom branding',
      'SLA 99.9%',
      'Account manager dedicado',
    ],
    current: false,
  },
]

const creditHistory = [
  { date: '2024-01-15', description: 'Scraping ZonaProp - 10 propiedades', amount: -1, type: 'consumption' },
  { date: '2024-01-15', description: 'Scraping Argenprop - 5 propiedades', amount: -1, type: 'consumption' },
  { date: '2024-01-14', description: 'Membresía Starter activada', amount: 50, type: 'purchase' },
  { date: '2024-01-14', description: 'Bono de registro', amount: 10, type: 'bonus' },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setLoading(planId)
    // TODO: integrate with Stripe checkout
    setTimeout(() => setLoading(null), 2000)
  }

  return (
    <>
      <Header
        title="Billing & Suscripción"
        subtitle="Gestioná tu plan y créditos"
      />

      {/* Current Plan */}
      <div className="card p-6 mb-8 border-l-4 border-gold-400">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-navy-900">Plan Starter</h3>
              <span className="badge-gold">Activo</span>
            </div>
            <p className="text-sm text-navy-500">
              50 créditos incluidos • Se renuevan el 1 de cada mes
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-navy-900">$29</p>
            <p className="text-sm text-navy-500">/mes</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-navy-600">Créditos utilizados</span>
            <span className="font-medium text-navy-900">18 / 50</span>
          </div>
          <div className="w-full bg-navy-100 rounded-full h-2">
            <div className="bg-gold-400 h-2 rounded-full transition-all" style={{ width: '36%' }} />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-navy-900 mb-4">Planes disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card p-6 relative flex flex-col ${
                plan.current
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
                <h4 className="text-xl font-bold text-navy-900 mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy-900">${plan.price}</span>
                  <span className="text-navy-500">/mes</span>
                </div>
                <p className="text-sm text-navy-500 mt-2">{plan.credits} créditos/mes</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-navy-700">
                    <svg className="w-4 h-4 text-gold-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.current || loading === plan.id}
                className={`w-full mt-auto ${
                  plan.current
                    ? 'btn-outline opacity-50 cursor-not-allowed'
                    : plan.popular
                    ? 'btn-gold'
                    : 'btn-primary'
                }`}
              >
                {plan.current ? 'Plan actual' : loading === plan.id ? 'Procesando...' : 'Actualizar plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit History */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-900">Historial de créditos</h3>
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
              {creditHistory.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="table-cell">{tx.date}</td>
                  <td className="table-cell font-medium">{tx.description}</td>
                  <td className="table-cell text-right">
                    <span className={`font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-navy-900'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
