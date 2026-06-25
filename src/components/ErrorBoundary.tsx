'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="logo-mark w-16 h-16 mx-auto mb-6 text-2xl">Ix</div>
            <h2 className="text-xl font-bold text-navy-900 mb-2 dark:text-white">Algo salió mal</h2>
            <p className="text-sm text-navy-500 mb-8 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
              Ocurrió un error inesperado. Por favor, intentá de nuevo.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-primary"
              >
                Reintentar
              </button>
              <a href="/dashboard" className="btn-outline">
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
