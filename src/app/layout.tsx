import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inmoxil — Importación y Marketing para Inmobiliarias',
  other: {
    'theme-color': '#0f172a',
  },
  description:
    'Plataforma en la nube para inmobiliarias. Importación multi-portal, generación de anuncios con tu marca, pago por créditos.',
  keywords: [
    'inmobiliaria',
    'scraping inmobiliario',
    'propiedades',
    'marketing digital',
    'generación de ads',
    'ZonaProp',
    'Argenprop',
    'SaaS',
    'billing',
    'créditos',
    'inmuebles',
    'real estate',
    'Argentina',
  ],
  openGraph: {
    title: 'Inmoxil — Importación y Marketing para Inmobiliarias',
    description:
      'Plataforma en la nube para inmobiliarias. Importación multi-portal, generación de anuncios con tu marca, pago por créditos.',
    url: 'https://inmoxil.com',
    siteName: 'Inmoxil',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inmoxil — Importación y Marketing para Inmobiliarias',
    description:
      'Plataforma en la nube para inmobiliarias. Importación multi-portal, generación de anuncios con tu marca, pago por créditos.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Inmoxil" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-navy-950 dark:text-navy-100">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
