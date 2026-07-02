'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'

type Locale = 'es' | 'en' | 'pt'

const messages: Record<Locale, any> = {
  es: require('@/messages/es.json'),
  en: require('@/messages/en.json'),
  pt: require('@/messages/pt.json'),
}

export function I18nProvider({ children, locale = 'es' }: { children: React.ReactNode; locale?: Locale }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}

export function useLocale() {
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

  return { locale, changeLocale }
}
