'use client'

import { useLocale } from '@/lib/i18n'

const LANGUAGES = [
  { code: 'es', name: 'Espanol', flag: 'AR' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'pt', name: 'Portugues', flag: 'BR' },
]

export default function LocaleSelector() {
  const { locale, changeLocale } = useLocale()

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value as 'es' | 'en' | 'pt')}
      className="input w-auto text-sm"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  )
}
