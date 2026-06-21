<div align="center">
  <h1>🏢 Inmoxil</h1>
  <h3>Plataforma SaaS integral para inmobiliarias</h3>
  <p>Gestioná propiedades, clientes, contratos, comisiones y publicaciones en un solo lugar.</p>
  <p>
    <a href="https://inmoxil.vercel.app"><strong>inmoxil.vercel.app »</strong></a>
  </p>
  <br>
</div>

---

## 📋 Funcionalidades

### 🔍 Scraping Multi-Portal
Importá propiedades automáticamente desde los principales portales inmobiliarios.

- **ZonaProp** — scraping completo con extracción de precio, dirección, ambientes, fotos
- **Argenprop** — scraping completo con normalización de datos
- **MercadoLibre** — soporte parcial (clasificados inmobiliarios)
- **Importación CSV/JSON** — detección automática de columnas, carga masiva
- **Scraping Automático** — programá scraping recurrente por cron (cada 1h a 7 días)
- **Historial de scraping** — log de cada ejecución con resultados

### 👥 Pipeline CRM (Kanban)
Gestioná todo el ciclo de venta de tus clientes.

- **7 etapas** — Nuevo → Contactado → Agendó visita → Visitó → Negociación → Ganado / Perdido
- **Drag & drop** — mové leads entre etapas con arrastrar y soltar
- **Actividades** — registrá llamadas, visitas, mensajes, emails, reuniones
- **Filtro por nombre/teléfono** — buscá leads al instante
- **Property Matching** — el sistema te muestra propiedades que coinciden con el presupuesto y requisitos del lead
- **Asignación automática** — cada agente ve solo sus leads asignados
- **Notificaciones** — alerta cuando entra un nuevo lead

### 📄 Contratos Inteligentes
Creá y gestioná contratos de alquiler con ajuste automático.

- **5 tipos de contrato** — Alquiler vivienda, Garantía Propietaria, Seguro de Caución, Cesión de Derechos, Comodato Precario
- **Ajuste IPC/ICL** — cálculo automático con índice real de INDEC y BCRA
- **PDF profesional** — generación con Puppeteer, formato A4, header/footer
- **Próximos ajustes** — dashboard de ajustes pendientes a 30 días vista
- **Notificaciones** — alerta 30 días antes de cada ajuste
- **Wizard de creación** — formulario paso a paso de 4 pantallas
- **Garantías** — gestión de garantes con ingresos y propiedades

### 💰 Comisiones y Cobranzas
Controlá tus ingresos por operaciones cerradas.

- **Dashboard financiero** — total pendiente, cobrado, cobrado este mes
- **Creación automática** — cuando un lead pasa a "Ganado" se crea una comisión pendiente
- **Seguimiento** — marcá como cobrada, anulada, con fecha de vencimiento
- **Multi-moneda** — soporte ARS y USD

### 📤 Publicación Multicanal
Publicá tus propiedades desde un solo lugar.

- **MercadoLibre** — OAuth, publicación con fotos, descripción, atributos
- **Arquitectura extensible** — agregá nuevos canales (ZonaProp, Argenprop, WhatsApp, Properati) creando solo un archivo
- **Historial de publicaciones** — log con estado, ID externo, URL
- **Canales configurables** — activá/desactivá cada canal desde la UI

### 📱 Páginas Públicas por Propiedad
Compartí propiedades con tus clientes al instante.

- **Link público** — cada propiedad tiene su URL: `inmoxil.vercel.app/p/[id]`
- **Ficha profesional** — galería de fotos, precio, ambientes, descripción
- **WhatsApp directo** — botón "Consultar por WhatsApp" pre-armado
- **Open Graph** — preview en redes sociales y WhatsApp
- **Sin necesidad de portal** — reemplazá ZonaProp para compartir

### 🔔 Notificaciones Inteligentes
Alertas automáticas en toda la app.

- **Nuevo lead** — cuando se registra un cliente
- **Ajuste próximo** — 30 días antes del ajuste de contrato
- **Scraping completado** — resultados de scraping automático
- **Errores** — fallos en scraping, créditos bajos
- **Operación cerrada** — cuando un lead se marca como ganado
- **Bell en header** — dropdown con últimas 5, acceso a página completa

### 👥 Multi-Agente
Trabajá en equipo dentro de la misma inmobiliaria.

- **Roles** — Dueño, Admin, Agente
- **Leads por agente** — cada agente ve solo sus clientes asignados
- **Invitación por email** — enviá acceso temporal por email
- **Gestión de equipo** — panel para administrar miembros y roles

### 🎨 Brand Kit
Personalizá la marca de tu inmobiliaria.

- **Colores** — primario, secundario, acento
- **Logo** — upload y preview
- **Ads** — 6 templates de diseño con colores de tu marca

### 📊 Analytics y Dashboard
Vista completa del negocio en un solo vistazo.

- **Stats en dashboard** — propiedades, leads activos, contratos, ajustes, notificaciones, créditos
- **Accesos directos** — scraping, pipeline, contratos, propiedades
- **Historial de scraping** — log de ejecuciones automáticas

### ⚙️ Infraestructura
- **Auth** — registro, login, recuperación de contraseña
- **Onboarding** — wizard de 5 pasos al registrarse
- **Términos y privacidad** — modal obligatorio en primer login
- **Rate limiting** — protección contra abusos
- **Workspace multi-tenant** — aislamiento completo entre inmobiliarias
- **Billing con Stripe** — 3 planes (Starter, Pro, Enterprise)
- **Email transaccionales** — bienvenida, pagos, créditos bajos, recuperación

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS |
| **Base de datos** | Neon PostgreSQL (serverless) |
| **Autenticación** | NextAuth.js v4 (JWT + Credentials) |
| **Pagos** | Stripe (Checkout, Portal, Webhooks) |
| **Scraping** | ScrapingBee + Cheerio |
| **PDF / Imágenes** | Puppeteer + Chromium |
| **Emails** | Resend |
| **Deploy** | Vercel |

## 🗄 Base de Datos (Neon PostgreSQL)

**18 tablas:**
- `workspaces` — cuentas multi-tenant con plan, créditos, marca
- `users` — autenticación, roles (owner/admin/agent), workspace
- `properties` — propiedades importadas con fotos, precios, ubicación
- `pipeline_stages` — etapas del Kanban configurables
- `pipeline_leads` — leads con asignación, presupuesto, requisitos
- `pipeline_activities` — historial de actividades por lead
- `contracts` — contratos con partes, propiedad, condiciones financieras
- `guarantors` — garantes vinculados a contratos
- `adjustments` — histórico de ajustes IPC/ICL
- `alerts` — alertas configurables por contrato
- `index_snapshots` — snapshot de índices INDEC/BCRA
- `commissions` — comisiones por operación cerrada
- `notifications` — notificaciones in-app por workspace
- `publish_channels` — configuración de canales de publicación
- `publish_logs` — historial de publicaciones
- `scrape_schedules` — configuración de scraping automático
- `scrape_logs` — historial de ejecuciones de scraping
- `ml_tokens` — tokens OAuth de MercadoLibre

## 🚀 Inicio Rápido

```bash
npm install
cp .env.local.example .env.local
# Configurar DATABASE_URL, NEXTAUTH_SECRET, STRIPE_*, SCRAPINGBEE_API_KEY, RESEND_API_KEY
npm run dev
```

## 🌐 Deploy

```bash
npx vercel --prod --yes
```

## 🔐 Variables de Entorno

```
DATABASE_URL           # Neon PostgreSQL
NEXTAUTH_SECRET        # NextAuth secret
NEXTAUTH_URL           # URL del sitio
NEXT_PUBLIC_APP_URL    # URL pública
STRIPE_SECRET_KEY      # Stripe secret
STRIPE_WEBHOOK_SECRET  # Stripe webhook
STRIPE_PRICE_STARTER   # Price ID Starter
STRIPE_PRICE_PRO       # Price ID Pro
STRIPE_PRICE_ENTERPRISE# Price ID Enterprise
SCRAPINGBEE_API_KEY    # ScrapingBee
RESEND_API_KEY         # Resend emails
ML_CLIENT_ID           # MercadoLibre App ID (para publicación)
ML_CLIENT_SECRET       # MercadoLibre App Secret
CRON_SECRET            # Secret para endpoints de cron
```

## 📄 Licencia

Privado — uso exclusivo del propietario del workspace.
