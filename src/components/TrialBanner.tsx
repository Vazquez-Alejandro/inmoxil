'use client'

import Link from 'next/link'
import { useWorkspace } from '@/lib/workspace-context'

export default function TrialBanner() {
  const { workspace } = useWorkspace()

  if (!workspace?.trial_ends_at) return null

  const trialEnd = new Date(workspace.trial_ends_at)
  const now = new Date()
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Already expired and no subscription
  if (daysLeft <= 0 && !workspace.stripe_subscription_id) {
    return (
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-0">
        <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Período de prueba finalizado</p>
              <p className="text-xs text-rose-500/70 dark:text-rose-400/70">Elegí un plan para seguir usando todas las funciones.</p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Ver planes
          </Link>
        </div>
      </div>
    )
  }

  // Active trial (regardless of subscription status)
  if (daysLeft > 0) {
    return (
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-0">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span> de prueba gratuita restantes.
              {!workspace.stripe_subscription_id && ' Elegí un plan para no perder el acceso.'}
            </p>
          </div>
          {!workspace.stripe_subscription_id && (
            <Link
              href="/dashboard/billing"
              className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Ver planes
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Has subscription, trial expired — nothing to show
  return null
}
