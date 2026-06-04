import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Inmoxil - Plataforma SaaS para Inmobiliarias',
  description: 'Scraping multi-portal, generación de ads con tu marca, billing por créditos y todo lo que necesitás para escalar tu negocio inmobiliario.',
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
