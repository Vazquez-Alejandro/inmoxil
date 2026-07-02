import { defineConfig } from 'next-intl/config'

export default defineConfig({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localeDetection: false,
})
