import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="logo-mark">Ix</div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">Inmoxil</h1>
            <p className="text-navy-400 text-[10px] uppercase tracking-widest font-medium">Plataforma SaaS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn-ghost text-navy-300 hover:text-white">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-gold">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-navy-300">Plataforma en desarrollo activo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            La plataforma SaaS<br />
            <span className="text-gold-400">para inmobiliarias</span>
          </h1>
          <p className="text-xl text-navy-300 max-w-2xl mx-auto leading-relaxed">
            Scraping multi-portal, generación de ads con tu marca, 
            billing por créditos y todo lo que necesitás para escalar 
            tu negocio inmobiliario.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link href="/register" className="btn-gold text-lg px-8 py-4">
              Empezar gratis
            </Link>
            <Link href="/login" className="btn-outline border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4">
              Ver demo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          <div className="text-center">
            <p className="text-4xl font-bold text-gold-400 mb-2">8+</p>
            <p className="text-navy-400 text-sm">Portales soportados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gold-400 mb-2">6</p>
            <p className="text-navy-400 text-sm">Templates de ads</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gold-400 mb-2">24/7</p>
            <p className="text-navy-400 text-sm">Scraping automático</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gold-400 mb-2">$29</p>
            <p className="text-navy-400 text-sm">Plan starter mensual</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-white/5 border-white/10 p-8">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Scraping Multi-Portal</h3>
            <p className="text-navy-400 leading-relaxed">
              ZonaProp, Argenprop, MercadoLibre, Zillow, Realtor y más. 
              Datos normalizados y deduplicados automáticamente.
            </p>
          </div>

          <div className="card bg-white/5 border-white/10 p-8">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Brand Kit Personalizado</h3>
            <p className="text-navy-400 leading-relaxed">
              Generá ads profesionales con tu marca, colores y logo. 
              6 templates listos para usar en redes sociales.
            </p>
          </div>

          <div className="card bg-white/5 border-white/10 p-8">
            <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Billing por Créditos</h3>
            <p className="text-navy-400 leading-relaxed">
              Pagá solo lo que uses. Planes desde $29/mes con 50 créditos. 
              Stripe integration para pagos seguros.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <p className="text-navy-500 text-sm">© 2024 Inmoxil. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-navy-400 hover:text-white text-sm transition-colors">Términos</a>
            <a href="#" className="text-navy-400 hover:text-white text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-navy-400 hover:text-white text-sm transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
