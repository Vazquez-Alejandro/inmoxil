# Inmoxil — TODO de Produccion

## Bugs corregidos (Audit 2026-08-01)
- [x] `mercadopago.ts`: Fix env var `MERCADOPAGO_ACCESS_TOKEN` → `MP_ACCESS_TOKEN` (pagos rotos)
- [x] `mercadopago.ts`: Fix env var `MERCADOPAGO_WEBHOOK_SECRET` → `MP_WEBHOOK_SECRET`
- [x] `sw.js`: Remove TypeScript `: any` annotations (service worker no parseaba)
- [x] `sw.js`: Fix URL `/manifest` → `/manifest.json`
- [x] `cron/scrape/route.ts`: Switch from Bearer auth to query param secret (Vercel crons no envían headers)
- [x] `vercel.json`: Add secret query param to cron URL
- [x] `page.tsx`: Fix landing page prices ($29/$79/$199 → $15/$39/$99 to match plans.ts)
- [x] `email.ts`: Fix sender from `onboarding@resend.dev` → `onboarding@inmoxil.com`
- [x] `.env.local`: Strengthen NEXTAUTH_SECRET
- [x] `.env.example`: Created

## Pendiente
- [ ] **Neon DB reset** — DB pausada, se auto-resetea el 1ro del mes. Correr las 5 migraciones de `supabase/migrations/` contra Neon
- [ ] **Verificar email domain** — Configurar `inmoxil.com` en Resend para que los emails no vengan de `resend.dev`
- [ ] **MP_WEBHOOK_SECRET** — Completar para verificación HMAC de webhooks
- [ ] **Upstash Redis** — Configurar para rate limiting (sin Redis, no hay rate limit)
- [ ] **NEXTAUTH_URL** — Cambiar de `localhost:3000` a URL de producción en Vercel
- [ ] **NEXT_PUBLIC_APP_URL** — Cambiar a URL de producción
- [ ] **WhatsApp** — Verificar número registrado en Meta Business
- [ ] **Domain** — Verificar DNS records
- [ ] **PWA manifest.json** — Funciona con SVG icons (ok)

## Marketing
- [ ] Crear post de lanzamiento para redes sociales
- [ ] Configurar Google Analytics / Umami
- [ ] Crear demo video walkthrough

## Technical improvements
- [ ] Move .env to Vercel env vars only (remove from repo)
- [ ] Add error tracking (Sentry)
- [ ] Add request logging
- [ ] Add health check dashboard
- [ ] Consider adding Stripe subscription management
- [ ] Add input validation/sanitization to insertOne/updateOne (SQL injection prevention)
