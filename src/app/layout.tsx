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
    images: [
      {
        url: 'https://inmoxil.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inmoxil - Importación y Marketing para Inmobiliarias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inmoxil — Importación y Marketing para Inmobiliarias',
    description:
      'Plataforma en la nube para inmobiliarias. Importación multi-portal, generación de anuncios con tu marca, pago por créditos.',
    images: ['https://inmoxil.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://inmoxil.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Inmoxil',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Plataforma en la nube para inmobiliarias. Importación multi-portal, generación de anuncios con tu marca, pago por créditos.',
    url: 'https://inmoxil.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Plan gratuito disponible',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    author: {
      '@type': 'Organization',
      name: 'Inmoxil',
      url: 'https://inmoxil.com',
    },
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Inmoxil" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-navy-950 dark:text-navy-100">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
