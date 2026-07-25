export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        <p className="text-sm text-navy-500 dark:text-navy-400">Cargando...</p>
      </div>
    </div>
  )
}
