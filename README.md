# Inmoxil

Plataforma SaaS para inmobiliarias. Scraping multi-portal, generación de ads con IA, billing por créditos.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Runtime:** Node.js 20
- **Deploy:** Vercel

## APIs y Servicios

| Servicio | Uso | Plan |
|---|---|---|
| [Neon PostgreSQL](https://neon.tech) | Base de datos serverless | Free |
| [NextAuth.js](https://next-auth.js.org) v4 | Autenticación JWT + Credentials | Open source |
| [Stripe](https://stripe.com) | Checkout, billing, webhooks, suscripciones | Test mode |
| [ScrapingBee](https://scrapingbee.com) | Scraping de portales inmobiliarios con proxy | Free (4000 créditos/mes) |
| [Resend](https://resend.com) | Emails transaccionales | Free (100 emails/día) |
| [Puppeteer](https://pptr.dev) | Generación de flyers y anuncios gráficos | Local |
| [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) | Hashing de contraseñas | Open source |
| [Apify](https://apify.com) | Backup de scraping (requiere plan pago) | Free tier |
| [Cheerio](https://cheerio.js.org) | Parsing de HTML para extracción de datos | Open source |

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
SCRAPINGBEE_API_KEY=...               # ScrapingBee API key (scraping principal)
APIFY_TOKEN=apify_api_...             # Apify token (backup de scraping)
RESEND_API_KEY=re_...                 # Resend API key (emails)
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
- `properties` — propiedades scrapeadas o importadas
- `generated_ads` — anuncios generados
- `credit_transactions` — historial de créditos
- `password_resets` — tokens de recuperación de contraseña

## Portales soportados

| Portal | País | Método | Estado |
|---|---|---|---|
| ZonaProp | AR | ScrapingBee | Activo |
| Argenprop | AR | ScrapingBee | Activo |
| MercadoLibre | AR | ScrapingBee | Activo |
| Zillow | US | ScrapingBee | Activo |
| Realtor | US | ScrapingBee | Activo |
| VivaReal | BR | ScrapingBee | Activo |

También se soporta importación manual de propiedades via CSV/JSON.

## Despliegue

```bash
npx vercel deploy --yes --prod
```

## Licencia

Privado
