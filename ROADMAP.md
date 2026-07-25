# Inmoxil — Roadmap

## Completado

- [x] Landing page (hero, features, pricing, FAQ)
- [x] Autenticacion (NextAuth + credentials + bcrypt)
- [x] Middleware (rutas publicas vs protegidas)
- [x] Dashboard layout (sidebar, header, dark mode)
- [x] Propiedades (CRUD, filtros, vista grid/detalle)
- [x] Scraping ZonaProp, Argenprop, MercadoLibre
- [x] Pipeline CRM (kanban, leads, actividades, matching)
- [x] Contratos (5 tipos, PDF, ajuste IPC/ICL)
- [x] Firma digital
- [x] Pagos / Cobranza + Stripe Checkout
- [x] Publicaciones multi-canal
- [x] MercadoLibre OAuth + publish
- [x] Monitoreo de propiedades (suscripcion)
- [x] Portal del propietario
- [x] Portal del inquilino (token-based)
- [x] Catalogo publico de propiedades
- [x] Pagina de pago online
- [x] WhatsApp Center (templates, mensajes)
- [x] Comisiones
- [x] Mantenimiento (tickets publicos + internos)
- [x] Notificaciones in-app
- [x] Reportes y estadisticas con Recharts
- [x] Brand Kit (color, logo)
- [x] Facturacion / plan billing
- [x] Guia interactiva / tour
- [x] PWA (manifest, service worker) + dark mode
- [x] Multi-tenant (workspaces, roles)
- [x] Migraciones de base de datos consolidadas
- [x] Tipos de DB completos (30 tablas)
- [x] Paleta de colores corregida (gold/coral)
- [x] Sidebar (iconos sin duplicados)
- [x] Expensas (calculadora, plantillas, CRUD)
- [x] Multi-idioma (ES/EN/PT con next-intl)
- [x] Matching IA mejorado (fuzzy matching, barrios preferidos, amenities, nivel de confianza)
- [x] Seguridad: path traversal, owner auth HMAC, SQL injection, auth checks
- [x] Stripe opcional (funciona sin STRIPE_SECRET_KEY configurado)
- [x] MercadoPago integration (preferencias, webhooks, pagos)
- [x] Modo claro mejorado (loading, error, owner layout)
- [x] Sidebar reorganizada (secciones más intuitivas)
- [x] Limpieza de dependencias (@stripe/stripe-js removido, puppeteer en deps)

## Pendiente — REQUIERE ACCION DEL USUARIO

### Base de datos (Neon)
- [ ] Ejecutar migrations en Neon: `supabase/migrations/001_initial_schema.sql`, `002_trial_ends_at.sql`, `003_complete_schema.sql`, `004_expensas_tables.sql`, `005_onboarding_completed.sql`
- [ ] Configurar `DATABASE_URL` en Vercel

### MercadoPago (pagos principal)
- [ ] Configurar webhook en MercadoPago → `https://inmoxil.vercel.app/api/webhooks/mercadopago`
- [ ] Agregar `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` a Vercel

### Env vars en Vercel
- [ ] `NEXTAUTH_SECRET` (generar secreto aleatorio)
- [ ] `NEXTAUTH_URL` (https://inmoxil.vercel.app)
- [ ] `OWNER_TOKEN_SECRET` (generar secreto aleatorio)
- [ ] `APIFY_TOKEN`
- [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] `CHROME_PATH`
- [ ] `CRON_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (https://inmoxil.vercel.app)
- [ ] `TELEGRAM_NOTIFIER_URL`

### Scraping
- [ ] Verificar scraping de Argenprop (reportado con issues en TEST_PLAN)
- [ ] Configurar Apify / ScrapingBee con API keys reales

### WhatsApp Business API
- [ ] Crear cuenta en Meta Business Suite
- [ ] Obtener numero de telefono verificado
- [ ] Configurar `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` en Vercel

### Facturacion electronica (AFIP)
- [ ] Obtener certificado digital de AFIP (CAE)
- [ ] Configurar `AFIP_CERT_PATH`, `AFIP_CUIT` en Vercel

### Firma digital
- [ ] Crear cuenta en Doculign o Autentia
- [ ] Configurar `DOCULIGN_API_KEY` en Vercel

### Screening de inquilinos
- [ ] Obtener acceso a Veraz o Nosis
- [ ] Configurar `VERAZ_API_KEY` o `NOSIS_API_KEY` en Vercel

## A futuro

### Testing manual
- [ ] Ejecutar TEST_PLAN.txt (~297 puntos visuales pendientes)

### SEO y Posicionamiento
- [x] Meta tags optimizados (título, descripción, keywords)
- [x] Open Graph para redes sociales (Facebook, LinkedIn)
- [x] Twitter Cards
- [x] JSON-LD structured data
- [x] sitemap.xml
- [x] robots.txt
- [ ] Google Search Console verificado (requiere dominio propio)
- [ ] Sitemap enviado a Google (requiere dominio propio)
- [x] Imagen OG para compartir en redes

### Mejoras
- [ ] Importacion CSV/JSON de propiedades
- [ ] Webhooks de salida (integracion con sistemas externos)
- [ ] App mobile (React Native)
- [ ] Marketplace de plantillas de anuncios
- [ ] Dashboard de analytics con graficos reales (ya completado)
