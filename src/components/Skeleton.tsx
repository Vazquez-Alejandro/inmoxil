'use client'

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200/80 bg-white p-6 ${className}`}>
      <div className="animate-pulse flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-navy-100" />
          <div className="w-16 h-4 rounded bg-navy-100" />
        </div>
        <div className="w-24 h-8 rounded bg-navy-200" />
        <div className="w-32 h-4 rounded bg-navy-100" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="w-48 h-5 rounded bg-navy-200 animate-pulse" />
      </div>
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className={`flex items-center gap-4 px-6 py-4 ${
              row < rows - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {Array.from({ length: cols }).map((_, col) => (
              <div
                key={col}
                className="h-4 rounded bg-navy-100"
                style={{ width: `${60 + Math.random() * 40}%`, maxWidth: 200 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse flex flex-col gap-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-navy-100"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
