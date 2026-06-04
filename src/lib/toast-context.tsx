'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface ToastContextType {
  toast: (opts: { type: Toast['type']; message: string }) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [counter, setCounter] = useState(0)

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(({ type, message }: { type: Toast['type']; message: string }) => {
    setCounter(prev => {
      const id = prev + 1
      setToasts(current => {
        const next = [...current, { id, type, message }]
        return next.slice(-3)
      })
      setTimeout(() => removeToast(id), 4000)
      return id
    })
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-navy-50 border-navy-200',
      icon: (
        <svg className="w-5 h-5 text-navy-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  }

  const s = styles[toast.type]

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${s.bg} animate-toast-in max-w-sm w-full`}
    >
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <p className="text-sm font-medium text-navy-800 flex-1">{toast.message}</p>
      <button onClick={onClose} className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors">
        <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
