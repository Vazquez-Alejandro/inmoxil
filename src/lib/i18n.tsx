'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Locale = 'es' | 'en' | 'pt'

const messages: Record<Locale, Record<string, any>> = {
  es: {
    common: { save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', search: 'Buscar', loading: 'Cargando...' },
    nav: { dashboard: 'Panel', pipeline: 'Clientes', calendar: 'Calendario', contracts: 'Contratos', properties: 'Propiedades', settings: 'Configuracion', analytics: 'Estadisticas', reports: 'Reportes', payments: 'Cobranza', expensas: 'Expensas' }
  },
  en: {
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', search: 'Search', loading: 'Loading...' },
    nav: { dashboard: 'Dashboard', pipeline: 'Pipeline', calendar: 'Calendar', contracts: 'Contracts', properties: 'Properties', settings: 'Settings', analytics: 'Analytics', reports: 'Reports', payments: 'Payments', expensas: 'Expenses' }
  },
  pt: {
    common: { save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', search: 'Pesquisar', loading: 'Carregando...' },
    nav: { dashboard: 'Painel', pipeline: 'Pipeline', calendar: 'Calendario', contracts: 'Contratos', properties: 'Propriedades', settings: 'Configuracoes', analytics: 'Analises', reports: 'Relatorios', payments: 'Pagamentos', expensas: 'Despesas' }
  }
}

const I18nContext = createContext<{ locale: Locale; t: (key: string) => string; changeLocale: (l: Locale) => void }>({
  locale: 'es',
  t: (key) => key,
  changeLocale: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es')

  useEffect(() => {
    const saved = localStorage.getItem('inmoxil-locale') as Locale
    if (saved && ['es', 'en', 'pt'].includes(saved)) {
      setLocale(saved)
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('inmoxil-locale', newLocale)
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let result: any = messages[locale]
    for (const k of keys) {
      result = result?.[k]
    }
    return result || key
  }

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useLocale() {
  return useContext(I18nContext)
}
