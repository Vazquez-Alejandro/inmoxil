'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-navy-950 text-navy-900 dark:text-white">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-500 dark:text-red-400">Error</h1>
        <p className="mb-6 text-navy-500 dark:text-navy-400">Algo salió mal. Intentalo de nuevo.</p>
        <button
          onClick={reset}
          className="rounded-lg bg-gold-500 px-6 py-2 font-medium text-white transition hover:bg-gold-600"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
