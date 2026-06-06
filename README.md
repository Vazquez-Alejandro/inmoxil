# Inmoxil

Plataforma SaaS para inmobiliarias. Scraping multi-portal, generación de ads con IA, billing por créditos.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Runtime:** Node.js 20

## APIs y Servicios

- **Base de datos:** [Neon PostgreSQL](https://neon.tech) — base de datos serverless
- **Auth:** [NextAuth.js](https://next-auth.js.org) v4 — autenticación con JWT + Credentials
- **Pagos:** [Stripe](https://stripe.com) — checkout, portal de facturación, webhooks, suscripciones
- **Scraping:** [Apify](https://apify.com) — scraping de propiedades inmobiliarias (Zillow, Realtor, ZonaProp, Argenprop, MercadoLibre, VivaReal, OLX)
- **Email:** [Resend](https://resend.com) — envío de emails transaccionales
- **PDFs:** [Puppeteer](https://pptr.dev) — generación de flyers y anuncios gráficos
- **Hashing:** [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) — hashing de contraseñas

## Variables de entorno

```
DATABASE_URL=postgresql://...         # Neon PostgreSQL
NEXTAUTH_SECRET=...                   # NextAuth secret (generar con: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000    # URL del sitio (producción: https://inmoxil.vercel.app)
NEXT_PUBLIC_APP_URL=...               # URL pública de la app
STRIPE_SECRET_KEY=sk_test_...         # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...       # Stripe webhook signing secret
STRIPE_PRICE_STARTER=price_...        # Stripe price ID - Plan Starter
STRIPE_PRICE_PRO=price_...            # Stripe price ID - Plan Pro
STRIPE_PRICE_ENTERPRISE=price_...     # Stripe price ID - Plan Enterprise
APIFY_TOKEN=apify_api_...             # Apify API token
RESEND_API_KEY=re_...                 # Resend API key
```

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local  # Configurar variables de entorno
npm run dev
```

## Base de datos

Tablas (Neon PostgreSQL):
- `workspaces` — cuentas de inmobiliarias
- `users` — usuarios con auth
- `properties` — propiedades scrapeadas
- `generated_ads` — anuncios generados
- `credit_transactions` — historial de créditos
- `password_resets` — tokens de recuperación de contraseña

## Portales soportados (Scraping)

| Portal | País | Actor Apify |
|---|---|---|
| Zillow | US | aknahin/zillow-property-info-scraper |
| Realtor | US | epctex/realtor-scraper |
| VivaReal | BR | gio21/vivareal-zap-scraper |
| ZAP Imóveis | BR | gio21/vivareal-zap-scraper |
| ZonaProp | AR | solidcode/zonaprop-scraper |
| Argenprop | AR | whitewalk/real-estate-scraper |
| MercadoLibre | AR | whitewalk/real-estate-scraper |
| OLX | Global | whitewalk/real-estate-scraper |

## Despliegue

```bash
npx vercel deploy --yes --prod
```

## Licencia

Privado
