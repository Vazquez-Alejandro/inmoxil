# Inmoxil — Roadmap & Estado

## Stack
- Next.js 14.2.18, TypeScript, Tailwind CSS
- Supabase (auth + DB + RLS + storage)
- Stripe (billing + webhooks)
- Apify (scraping multi-portal)
- Puppeteer (ad generation)
- Vercel (deploy)
- Repo: https://github.com/Vazquez-Alejandro/inmoxil

## Brand
- Navy #0F2B46, Gold #D4A843, Coral #E85D3A
- Font: Inter
- Logo mark: "Ix"

---

## COMPLETADO ✅

### UI & Frontend
- [x] Landing page (hero, social proof, features, pricing, testimonials, FAQ, CTA, footer)
- [x] Login / Register con validación
- [x] Dashboard layout (sidebar, mobile toggle, auth guard)
- [x] Dashboard page (stats, workspace data)
- [x] Scraping page (URL input, portal detection, results grid, export JSON)
- [x] Billing page (3 planes, checkout, credit history, manage subscription)
- [x] Brand Kit page (color pickers, logo upload, live preview)
- [x] Properties page (grid, filtros, búsqueda, empty states)
- [x] Ads page (property selector, template picker, generate, gallery)
- [x] Admin page (stats, workspaces table, users table, role-based)
- [x] Onboarding wizard (5 pasos: bienvenida → nombre → colores → plan → listo)
- [x] Skeleton loaders (cards, tables, text)
- [x] Toast notifications (success/error/info/warning, auto-dismiss)
- [x] Error boundary (UI amigable + retry)

### API Routes
- [x] POST /api/scrape — Scraping via Apify
- [x] GET/POST /api/properties — CRUD propiedades
- [x] GET/POST /api/credits — Créditos + historial
- [x] POST /api/billing — Checkout + portal Stripe
- [x] POST /api/webhook — Stripe webhooks
- [x] GET/PUT/POST /api/brand — Brand config + logo upload
- [x] GET/POST /api/workspace — CRUD workspace
- [x] GET/POST /api/ads — Generación de ads + gallery
- [x] GET /api/ads/image — Servir imágenes de ads
- [x] GET /api/admin — Stats admin

### Backend Logic
- [x] Multi-tenant Supabase client (lazy init, build-safe)
- [x] Stripe client (lazy init, v22 API)
- [x] Apify scraper (8 portales, normalización, deduplicación)
- [x] Puppeteer ad generator (6 templates, 4 formatos)
- [x] Auth context (AuthProvider, useAuth hook)
- [x] Workspace context (WorkspaceProvider, useWorkspace hook)
- [x] Credit management (check, deduct, add, history)

### Legal & SEO
- [x] Términos y condiciones (/terminos)
- [x] Política de privacidad (/privacidad)
- [x] Sitemap XML (/sitemap.xml)
- [x] Robots.txt (/robots.txt)
- [x] OpenGraph metadata
- [x] SEO title + description

### DevOps
- [x] Vercel deploy → https://inmoxil.vercel.app
- [x] vercel.json config
- [x] All Supabase type errors fixed (as any casts)
- [x] Build passes clean
- [x] tsconfig target es2017

---

## PENDIENTE — Sprint 1 (Mañana)

### 1. Supabase Setup 🔴 CRÍTICO
- [ ] Crear proyecto en Supabase (https://supabase.com)
- [ ] Crear tablas: workspaces, users, properties, generated_ads, credit_transactions
- [ ] Ejecutar SQL migrations
- [ ] Crear RPC functions: deduct_credit(), add_credits()
- [ ] Configurar RLS policies (multi-tenant)
- [ ] Crear bucket 'brand-logos' en Storage
- [ ] Copiar URL + anon key para env vars

### 2. Stripe Setup 🔴 CRÍTICO
- [ ] Crear cuenta en Stripe (https://stripe.com)
- [ ] Crear producto "Inmoxil Starter" — $29/mes → copiar price_id
- [ ] Crear producto "Inmoxil Pro" — $79/mes → copiar price_id
- [ ] Crear producto "Inmoxil Enterprise" — $199/mes → copiar price_id
- [ ] Configurar webhook endpoint → https://inmoxil.vercel.app/api/webhook
- [ ] Webhook events: checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted
- [ ] Copiar webhook secret (whsec_...) para env vars
- [ ] Copiar secret key (sk_...) para env vars

### 3. Environment Variables en Vercel 🔴 CRÍTICO
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://inmoxil.vercel.app
APIFY_TOKEN=tu-token-de-apify
```

### 4. Testing End-to-End 🟡
- [ ] Test registro → onboarding → dashboard
- [ ] Test login → dashboard
- [ ] Test scraping con URL real de ZonaProp
- [ ] Test generación de ads con Puppeteer
- [ ] Test checkout Stripe (modo test con tarjetas de prueba)
- [ ] Test webhook de Stripe
- [ ] Test admin panel
- [ ] Test brand kit save/load

### 5. Fix menores 🟡
- [ ] Marca de agua "en desarrollo" en landing → quitar
- [ ] Copyright footer: actualizar año dinámicamente
- [ ] Sidebar: mostrar plan real y créditos reales del workspace
- [ ] Brand page: guardar colores en DB (no solo estado local)
- [ ] Properties page: wired a DB real (no solo mock)
- [ ] Onboarding: guardar preferencias en Supabase correctamente

---

## PENDIENTE — Sprint 2

### 6. Email Transaccional 🟠
- [ ] Email de bienvenida post-registro
- [ ] Email de confirmación de pago
- [ ] Email de alerta de créditos bajos
- [ ] Integrar con Resend o SendGrid

### 7. Export CSV/PDF 🟠
- [ ] Export propiedades a CSV
- [ ] Export reporte de scraping a PDF
- [ ] Usar Puppeteer para PDF generation

### 8. Analytics 🟠
- [ ] Dashboard de analytics (propiedades scrapingadas, ads generados, conversiones)
- [ ] Charts con CSS puros (sin librería)

### 9. Multi-idioma 🟡
- [ ] Inglés + Portugués
- [ ] Next.js i18n routing

### 10. API Pública 🟡
- [ ] Documentación OpenAPI
- [ ] API keys management
- [ ] Rate limiting

---

## PENDIENTE — Sprint 3

### 11. WhatsApp Business Integration
- [ ] Enviar avisos por WhatsApp
- [ ] Template messages

### 12. CRM Integration
- [ ] Sync con CRM inmobiliarios
- [ ] Webhooks outbound

### 13. Custom Domain
- [ ] inmoxil.com configurado en Vercel
- [ ] SSL automático

---

## ARCHIVOS CLAVE

```
src/
├── app/
│   ├── page.tsx              — Landing page
│   ├── layout.tsx            — Root layout + SEO
│   ├── login/page.tsx        — Login
│   ├── register/page.tsx     — Register
│   ├── onboarding/page.tsx   — Onboarding wizard
│   ├── terminos/page.tsx     — Términos
│   ├── privacidad/page.tsx   — Privacidad
│   ├── sitemap.ts            — Sitemap
│   ├── robots.ts             — Robots.txt
│   └── dashboard/
│       ├── layout.tsx        — Dashboard layout (auth, sidebar, toast, error boundary)
│       ├── page.tsx          — Dashboard home
│       ├── scrape/page.tsx   — Scraping UI
│       ├── properties/page.tsx — Properties grid
│       ├── ads/page.tsx      — Ad generation
│       ├── billing/page.tsx  — Billing & plans
│       ├── brand/page.tsx    — Brand Kit
│       └── admin/page.tsx    — Admin panel
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ErrorBoundary.tsx
│   └── Skeleton.tsx
├── lib/
│   ├── auth.tsx              — AuthProvider + useAuth
│   ├── workspace-context.tsx — WorkspaceProvider + useWorkspace
│   ├── supabase-browser.ts   — Browser Supabase client
│   ├── supabase.ts           — Server Supabase client
│   ├── stripe.ts             — Stripe client + PLANS config
│   ├── workspace.ts          — Workspace CRUD helpers
│   ├── apify.ts              — Apify scraper (8 portals)
│   ├── ad-generator.ts       — Puppeteer ad generator (6 templates)
│   ├── toast-context.tsx     — Toast provider + useToast
│   └── middleware.ts         — Supabase SSR middleware
├── types/
│   ├── database.ts           — Supabase types
│   └── property.ts           — Property types
└── app/api/
    ├── scrape/route.ts
    ├── properties/route.ts
    ├── credits/route.ts
    ├── billing/route.ts
    ├── webhook/route.ts
    ├── brand/route.ts
    ├── workspace/route.ts
    ├── ads/route.ts
    ├── ads/image/route.ts
    └── admin/route.ts
```

---

## NOTAS
- Supabase client usa Proxy pattern para lazy init (build-safe)
- Stripe client usa Proxy pattern para lazy init (build-safe)
- Middleware graceful skip cuando no hay env vars de Supabase
- Puppeteer usa `/usr/bin/google-chrome`
- Chrome headless necesario para ad generation en Vercel (verificar soporte)
- APIFY_TOKEN ya configurado en .env.local
