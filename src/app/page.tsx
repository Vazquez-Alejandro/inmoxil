import Link from 'next/link'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Importación Multi-Portal',
    description: 'ZonaProp, Argenprop, MercadoLibre y más. Datos normalizados, deduplicados y actualizados automáticamente las 24 horas.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'Tu Marca',
    description: 'Subí tu logo, elegí tus colores y generá anuncios profesionales con identidad propia en segundos.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a1.625 1.625 0 00-.755.654c-.157.35-.35.69-.56 1.014m0 0l.18.18m0 0l.18.18M12 21a8.966 8.966 0 005.982-2.275M12 21a8.966 8.966 0 01-5.982-2.275M15.982 13.18c.385.89.717 1.82.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a1.625 1.625 0 01-.755.654c-.157.35-.35.69-.56 1.014M7.982 13.18a11.953 11.953 0 01-4.465.582" />
      </svg>
    ),
    title: 'Generación de Ads',
    description: '6 plantillas optimizadas para Instagram, Facebook y Google Ads. Publicá con un clic.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Pago por Créditos',
    description: 'Pagá solo lo que uses. Planes desde $29/mes con 50 créditos. Integración con sistema de pagos seguros.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Estadísticas',
    description: 'Paneles con métricas de importación, rendimiento de anuncios y retorno de inversión por campaña. Todo en un solo lugar.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: 'Soporte 24/7',
    description: 'Equipo de soporte en español disponible todo el día. Chat en vivo, email y llamadas.',
  },
]

const plans = [
  {
    name: 'Inicial',
    price: 29,
    description: 'Para inmobiliarias que están empezando',
    features: ['50 créditos/mes', 'Importación de 2 portales', '3 plantillas de anuncios', 'Marca básica', 'Soporte por email'],
    cta: 'Comenzar ahora',
    popular: false,
  },
  {
    name: 'Profesional',
    price: 79,
    description: 'Para inmobiliarias en crecimiento',
    features: ['200 créditos/mes', 'Importación de todos los portales', '6 plantillas de anuncios', 'Marca completa', 'Estadísticas avanzadas', 'Soporte prioritario'],
    cta: 'Elegir plan',
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 199,
    description: 'Para grandes inmobiliarias y grupos',
    features: ['Créditos ilimitados', 'Importación personalizada', 'Plantillas personalizadas', 'Acceso para desarrolladores', 'Account manager dedicado', 'Disponibilidad 99.9%'],
    cta: 'Contactar ventas',
    popular: false,
  },
]

const faqs = [
  {
    question: '¿Qué portales soporta la importación?',
    answer: 'Actualmente soportamos ZonaProp, Argenprop, MercadoLibre, Zillow, Realtor.com, Redfin, Idealista y Housing.com. Estamos agregando nuevos portales continuamente.',
  },
  {
    question: '¿Cómo funcionan los créditos?',
    answer: 'Cada crédito equivale a una acción en la plataforma: importar una propiedad, generar un anuncio, o hacer una publicación. Los créditos se renuevan mensualmente según tu plan.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí, podés cancelar tu suscripción en cualquier momento desde tu panel. No hay permanencia ni penalidades. Tu acceso se mantiene hasta el final del período facturado.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Absolutamente. Usamos encriptación AES-256, servidores en AWS con certificación SOC 2, y nunca compartimos tus datos con terceros. Cumplimos con la Ley de Protección de Datos personales de Argentina.',
  },
  {
    question: '¿Ofrecen prueba gratuita?',
    answer: 'Sí, todos los planes incluyen 14 días de prueba gratuita con acceso completo. No se requiere tarjeta de crédito para empezar.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="logo-mark">Ix</div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">Inmoxil</h1>
            <p className="text-navy-400 text-[10px] uppercase tracking-widest font-medium">Plataforma en la nube</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="inline-flex items-center gap-2 text-navy-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium px-5 py-2 rounded-lg border border-white/10 hover:border-white/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16 md:pb-20 relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500/20 to-gold-500/5 backdrop-blur-sm border border-gold-500/10 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gold-300">Plataforma en la nube para inmobiliarias</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Automatizá la captación de<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300">propiedades para tu inmobiliaria</span>
          </h1>
          <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Importación multi-portal, generación de anuncios con tu marca y pago por créditos.
            Probá gratis 14 días sin tarjeta de crédito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-lg px-10 py-4 rounded-xl shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              14 días de prueba
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#precios"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 text-lg px-10 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Ver precios
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitás, en un solo lugar</h2>
          <p className="text-navy-400 text-lg max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para inmobiliarias que quieren crecer sin aumentar su equipo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="card bg-white/5 border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center mb-5 text-gold-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-navy-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes simples, precios transparentes</h2>
          <p className="text-navy-400 text-lg max-w-2xl mx-auto">
            Elegí el plan que mejor se adapte a tu inmobiliaria. Todos incluyen 14 días gratis sin riesgo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
                plan.popular
                  ? 'bg-white ring-2 ring-gold-500 shadow-xl shadow-gold-500/10 scale-105 md:scale-110 z-10'
                  : 'bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                  Más popular
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-navy-900' : 'text-white'}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-navy-500' : 'text-navy-400'}`}>{plan.description}</p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-navy-900' : 'text-white'}`}>${plan.price}</span>
                <span className={`text-sm ml-1 ${plan.popular ? 'text-navy-500' : 'text-navy-400'}`}>/mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-gold-500' : 'text-gold-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={`text-sm ${plan.popular ? 'text-navy-700' : 'text-navy-300'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5'
                    : 'border border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Preguntas frecuentes</h2>
          <p className="text-navy-400 text-lg">Resolvemos tus dudas.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="card bg-white/5 border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-navy-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          ¿Listo para escalar tu inmobiliaria?
        </h2>
        <p className="text-navy-400 text-lg mb-10 max-w-2xl mx-auto">
            Unite a las inmobiliarias que ya automatizaron su captación de propiedades.
            Probá 14 días gratis, sin tarjeta de crédito.
          </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-lg px-10 py-4 rounded-xl shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          Empezar gratis
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="logo-mark">Ix</div>
              <span className="text-white font-bold">Inmoxil</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/terminos" className="text-navy-400 hover:text-white text-sm transition-colors">Términos</Link>
              <Link href="/privacidad" className="text-navy-400 hover:text-white text-sm transition-colors">Privacidad</Link>
              <a href="mailto:hola@inmoxil.com" className="text-navy-400 hover:text-white text-sm transition-colors">Contacto</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-navy-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="text-navy-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="text-navy-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-navy-500 text-sm">© {new Date().getFullYear()} Inmoxil. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
