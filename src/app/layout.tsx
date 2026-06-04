import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inmoxil — Scraping y Marketing para Inmobiliarias',
  description:
    'Plataforma SaaS para inmobiliarias. Scraping multi-portal, generación de ads con tu marca, billing por créditos.',
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
    title: 'Inmoxil — Scraping y Marketing para Inmobiliarias',
    description:
      'Plataforma SaaS para inmobiliarias. Scraping multi-portal, generación de ads con tu marca, billing por créditos.',
    url: 'https://inmoxil.com',
    siteName: 'Inmoxil',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inmoxil — Scraping y Marketing para Inmobiliarias',
    description:
      'Plataforma SaaS para inmobiliarias. Scraping multi-portal, generación de ads con tu marca, billing por créditos.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
