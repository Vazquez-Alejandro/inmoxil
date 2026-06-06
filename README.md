# Inmoxil

Plataforma SaaS para inmobiliarias. Scraping multi-portal, importación de propiedades, generación de flyers/anuncios, facturación por créditos con Stripe.

**Deploy:** https://inmoxil.vercel.app

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
| [ScrapingBee](https://scrapingbee.com) | Scraping de portales inmobiliarios con proxy premium | Free (1000 créditos/mes) |
| [Resend](https://resend.com) | Emails transaccionales (bienvenida, pagos, reseteo de contraseña) | Free (100 emails/día) |
| [Puppeteer](https://pptr.dev) | Generación de flyers y anuncios gráficos | Local |
| [Cheerio](https://cheerio.js.org) | Parsing de HTML para extracción de datos | Open source |
| [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) | Hashing de contraseñas | Open source |

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
RESEND_API_KEY=re_...                 # Resend API key (emails)
```

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Base de datos

Tablas (Neon PostgreSQL):
- `workspaces` — cuentas de inmobiliarias (plan, créditos, marca, Stripe)
- `users` — usuarios con auth, rol (owner/admin/member)
- `properties` — propiedades scrapeadas o importadas
- `generated_ads` — anuncios gráficos generados
- `credit_transactions` — historial de créditos y pagos
- `password_resets` — tokens de recuperación de contraseña

## Portales soportados

| Portal | País | Método | Estado |
|---|---|---|---|
| ZonaProp | AR | ScrapingBee + Cheerio | Activo |
| Argenprop | AR | ScrapingBee + Cheerio | Activo |
| MercadoLibre | AR | ScrapingBee | Parcial (timeout en algunos casos) |
| Zillow | US | — | No disponible desde AR |
| Realtor | US | — | No disponible desde AR |
| VivaReal | BR | — | Pendiente |

Importación manual via CSV/JSON siempre disponible como alternativa.

## Funcionalidades

### Scraping Multi-Portal
- Scraping rápido con un click por portal (ZonaProp, Argenprop)
- Scraping por URLs específicas
- Importación masiva de CSV/JSON con detección automática de columnas
- Extracción de: precio, dirección, ambientes, baños, m², URL, fotos

### Generación de Anuncios (Ads)
- 6 templates de diseño: moderno, minimalista, lujoso, bold, elegante, tropical
- 4 formatos: feed, story, reel, meta ad
- Generados con Puppeteer en el servidor
- Galería de anuncios generados

### Facturación
- 3 planes: Starter ($19), Pro ($49), Enterprise ($99)
- Checkout con Stripe
- Portal de auto-servicio para facturación
- Webhooks para confirmación automática de pagos

### Marca (Brand Kit)
- Colores personalizados (primario, secundario, acento)
- Logo upload
- Preview en tiempo real

### Dashboard
- Estadísticas de propiedades
- Gráficos de actividad
- Panel de admin para gestión de usuarios
- Documentación de API interna

### Email
- Emails transaccionales con diseño profesional
- Bienvenida, confirmación de pago, créditos bajos, recuperación de contraseña

### Legal
- Términos y condiciones
- Política de privacidad

## Despliegue

```bash
npx vercel deploy --yes --prod
```

## Licencia

Privado
