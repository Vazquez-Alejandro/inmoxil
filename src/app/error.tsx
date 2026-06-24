'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-400">Error</h1>
        <p className="mb-6 text-slate-400">Algo salió mal. Intentalo de nuevo.</p>
        <button
          onClick={reset}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition hover:bg-indigo-500"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
