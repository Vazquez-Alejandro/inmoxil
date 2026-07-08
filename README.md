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

## 📋 Funcionalidades (29 módulos)

### 1. 🏠 Gestión de Propiedades
CRUD completo de propiedades con fotos, precios y estados.
- **Alta/baja/edición** — formulario completo con todos los campos
- **Subida de fotos** — arrastrar y soltar, eliminación individual
- **Estados** — activa, vendida, alquilada, inactiva
- **Coordenadas** — latitud/longitud para mapa
- **Filtros** — por tipo, precio, moneda, barrio, operación

### 2. 👥 Pipeline CRM (Kanban)
CRM visual para gestionar todo el ciclo de venta de clientes.
- **7 etapas** — Nuevo → Contactado → Agendó visita → Visitó → Negociación → Ganado / Perdido
- **Drag & drop** — mové leads entre etapas con arrastrar y soltar
- **Actividades** — registrá llamadas, visitas, mensajes, emails, reuniones
- **Filtro por nombre/teléfono** — buscá leads al instante
- **Asignación automática** — cada agente ve solo sus leads asignados

### 3. 🎯 Matching Automático
El sistema encuentra automáticamente propiedades compatibles con cada lead.
- **Trigger automático** — se ejecuta al crear nueva propiedad o nuevo lead
- **Scoring** — presupuesto (30pts), palabras clave (40pts), ambientes (20pts), tipo (20pts), barrio (15pts), features (15pts)
- **Confianza** — Alta ≥60, Media ≥30, Baja <30
- **Notificaciones** — alerta cuando se encuentran matches compatibles
- **Bidireccional** — propiedades buscan leads y leads buscan propiedades

### 4. 🤖 Matching IA Mejorado
Algoritmo de matching avanzado con sugerencias inteligentes.
- **Compatibility %** — porcentaje de compatibilidad entre propiedad y lead
- **Sugerencias IA** — recomendaciones personalizadas ("Excelente match", "Supera presupuesto en 15%")
- **Análisis multidimensional** — presupuesto, ubicación, tipo, features, tamaño
- **Comparación inteligente** — detecta diferencias y sugiere acciones

### 5. 📄 Contratos Inteligentes
Creá y gestioná contratos de alquiler con ajuste automático.
- **5 tipos de contrato** — Alquiler vivienda, Garantía Propietaria, Seguro de Caución, Cesión de Derechos, Comodato Precario
- **Ajuste IPC/ICL** — cálculo automático con índice real de INDEC y BCRA
- **PDF profesional** — generación con Puppeteer, formato A4, header/footer
- **Próximos ajustes** — dashboard de ajustes pendientes a 30 días vista
- **Notificaciones** — alerta 30 días antes de cada ajuste
- **Wizard de creación** — formulario paso a paso de 4 pantallas
- **Garantías** — gestión de garantes con ingresos y propiedades

### 6. 🏘 Portal del Inquilino
Portal self-service para que inquilinos accedan a su información.
- **Acceso por token** — link único `/tenant?token=xxx` sin login
- **Resumen** — próximo pago, alquiler mensual, contrato hasta
- **Historial de pagos** — todos los pagos con estado y fechas
- **Mantenimiento** — crear y ver pedidos de reparación
- **Datos del contrato** — propiedad, fechas, monto, estado
- **Branding** — colores de la inmobiliaria

### 7. 💰 Cobro Automático (MercadoPago)
Integración con MercadoPago para cobros automatizados.
- **Links de pago** — generar link de checkout para cada pago
- **Webhook** — recibe notificaciones de pago automático
- **Estados** — pending, approved, rejected, cancelled
- **Notificaciones** — alerta cuando se recibe un pago
- **Historial** — todos los pagos con ID de MercadoPago

### 8. 🔧 Mantenimiento
Sistema de tickets para gestionar reparaciones y reclamos.
- **Dashboard de tickets** — panel completo con filtros por estado y prioridad
- **Estados** — Pendiente → En proceso → Resuelto → Cerrado
- **Prioridades** — Baja, Normal, Alta, Urgente
- **Asignación** — asignar técnicos o responsables a cada ticket
- **Formulario público** — los inquilinos reportan problemas desde la ficha de la propiedad

### 9. 📊 Reportes de Performance
Analytics detallados del negocio inmobiliario.
- **Embudo de conversión** — visualiza cada etapa del funnel
- **Tendencias mensuales** — leads, contratos, ingresos
- **Fuentes de leads** — qué canales generan más clientes
- **Barrios con mayor actividad** — propiedades, precio promedio, vendidos
- **Rendimiento del equipo** — leads, conversiones, tasa, ingresos por agente
- **Filtros por período** — mes, trimestre, año

### 10. 📊 Analytics y Dashboard
Vista completa del negocio en un solo vistazo.
- **Stats en dashboard** — propiedades, leads activos, contratos, ajustes, notificaciones, créditos
- **Accesos directos** — scraping, pipeline, contratos, propiedades
- **Historial de scraping** — log de ejecuciones automáticas

### 11. 🔍 Scraping Multi-Portal
Importá propiedades automáticamente desde los principales portales inmobiliarios.
- **ZonaProp** — scraping completo con extracción de precio, dirección, ambientes, fotos
- **Argenprop** — scraping completo con normalización de datos
- **MercadoLibre** — soporte parcial (clasificados inmobiliarios)
- **Importación CSV/JSON** — detección automática de columnas, carga masiva
- **Scraping Automático** — programá scraping recurrente por cron (cada 1h a 7 días)
- **Historial de scraping** — log de cada ejecución con resultados

### 12. 📤 Publicación Multicanal
Publicá tus propiedades desde un solo lugar.
- **MercadoLibre** — OAuth, publicación con fotos, descripción, atributos
- **Arquitectura extensible** — agregá nuevos canales creando solo un archivo
- **Historial de publicaciones** — log con estado, ID externo, URL
- **Canales configurables** — activá/desactivá cada canal desde la UI

### 13. 🌐 Catálogo Público de Propiedades
Vidriera online para que los clientes naveguen tus propiedades sin llamar al agente.
- **Página pública** — `/propiedades` con buscador, filtros por tipo/precio/ambientes
- **Ficha individual** — cada propiedad tiene su URL: `/p/[id]` con galería, mapa y datos
- **Mapa embebido** — OpenStreetMap en cada ficha cuando hay coordenadas
- **Solicitud de visita online** — el cliente elige fecha y se crea automáticamente un lead
- **WhatsApp directo** — botón "Consultar por WhatsApp" pre-armado en cada propiedad
- **Open Graph** — preview en redes sociales y WhatsApp

### 14. 💰 Comisiones y Cobranzas
Controlá tus ingresos por operaciones cerradas.
- **Dashboard financiero** — total pendiente, cobrado, cobrado este mes
- **Creación automática** — cuando un lead pasa a "Ganado" se crea una comisión pendiente
- **Seguimiento** — marcá como cobrada, anulada, con fecha de vencimiento
- **Multi-moneda** — soporte ARS y USD

### 15. 💬 WhatsApp Center
Mensajería integrada para comunicación con leads y clientes.
- **Enviar mensajes** — redactá y abrí WhatsApp directo con leads y números manuales
- **Plantillas** — creá plantillas reutilizables con variables (nombre, propiedad, etc.)
- **Historial** — registro de todos los mensajes enviados y recibidos
- **Integración con leads** — seleccioná un lead y su teléfono se completa automáticamente

### 16. 📅 Calendario de Visitas
Todas las visitas agendadas del pipeline en un solo lugar.
- **Vista agrupada por fecha** — todas las actividades tipo "visita" del pipeline
- **Lead asociado** — nombre, teléfono, etapa actual
- **Detalles** — descripción, resultado, horario
- **Link en sidebar** — acceso directo desde el menú principal

### 17. 📝 Firma Digital
Solicitá y gestioná firmas de contratos online.
- **Solicitud de firma** — enviá link de firma al locador o locatario desde el detalle del contrato
- **Página pública** — el firmante accede a `/firmar/[token]` con resumen del contrato
- **Estados** — Pendiente → Enviado → Firmado → Rechazado
- **Validez legal** — la firma tiene validez digital según legislación vigente

### 18. 💲 Expensas
Liquidación y gestión de expensas para consorcios.
- **Cálculo automático** — generación de expensas por período
- **Detalle por unidad** — monto por propietario/inquilino
- **Estados** — Pendiente, Pagado, Vencido
- **Reportes** — resumen de recaudación

### 19. 🏷 Brand Kit
Personalizá la marca de tu inmobiliaria.
- **Colores** — primario, secundario, acento
- **Logo** — upload y preview
- **Ads** — 6 templates de diseño con colores de tu marca

### 20. 👥 Multi-Agente
Trabajá en equipo dentro de la misma inmobiliaria.
- **Roles** — Dueño, Admin, Agente
- **Leads por agente** — cada agente ve solo sus clientes asignados
- **Invitación por email** — enviá acceso temporal por email
- **Gestión de equipo** — panel para administrar miembros y roles

### 21. 🔐 Roles y Permisos
Control granular de acceso para cada miembro del equipo.
- **3 roles** — Owner (acceso total), Admin (gestión), Agent (operativo)
- **Permisos granular** — cada rol tiene permisos específicos sobre propiedades, leads, contratos, pagos, etc.
- **Seed automático** — los permisos se crean automáticamente al migrar

### 22. 🔔 Notificaciones Inteligentes
Alertas automáticas en toda la app.
- **Nuevo lead** — cuando se registra un cliente
- **Ajuste próximo** — 30 días antes del ajuste de contrato
- **Matching encontrado** — cuando se detectan propiedades compatibles
- **Pago recibido** — cuando se acredita un pago
- **Scraping completado** — resultados de scraping automático
- **Errores** — fallos en scraping, créditos bajos
- **Bell en header** — dropdown con últimas 5, acceso a página completa

### 23. 📱 Portal del Propietario
Acceso exclusivo para dueños de propiedades con toda la información de sus inmuebles.
- **Dashboard del dueño** — resumen con cantidad de propiedades, contratos activos, tickets abiertos
- **Login propio** — ingreso con email y contraseña, completamente separado del panel del agente
- **Mis propiedades** — listado de propiedades del dueño con fotos, precio y estado
- **Contratos** — contratos activos con inquilino, precio, fechas y estado
- **Mantenimiento** — tickets de reparación de sus propiedades con estado actual

### 24. 🎨 Modo Oscuro
Interfaz adaptable a la preferencia del usuario.
- **Toggle sol/luna** — en el header de la aplicación
- **Persistencia** — la preferencia se guarda en localStorage
- **Auto-detección** — sigue la preferencia del sistema operativo
- **Diseño completo** — todas las pantallas y componentes con variante oscura

### 25. 📱 PWA (Progressive Web App)
Instalable como aplicación nativa en cualquier dispositivo.
- **Manifest** — icono SVG, nombre, descripción, colores de marca
- **Service Worker** — caché de recursos para funcionamiento offline parcial
- **Instalable** — los usuarios pueden agregar Inmoxil a su pantalla de inicio
- **Meta tags** — theme-color, apple-mobile-web-app

### 26. 💲 Billing con Stripe
Facturación y gestión de planes.
- **3 planes** — Starter ($0), Pro ($29), Enterprise ($99)
- **Stripe Checkout** — pago seguro con tarjeta
- **Portal de clientes** — gestión de facturas y métodos de pago
- **Webhooks** — sincronización automática de estados

### 27. ⚙️ Configuración del Workspace
Personalizá toda la configuración de tu inmobiliaria.
- **Información general** — nombre, slug, catálogo público
- **Contacto** — email, teléfono, dirección, WhatsApp
- **Redes sociales** — Instagram, Facebook, Twitter/X, LinkedIn
- **Branding** — colores primario, secundario y de acento

### 28. 🔗 API Documentada
API REST completa para integraciones externas.
- **Swagger/OpenAPI** — documentación interactiva en `/api-docs`
- **Endpoints** — propiedades, leads, contratos, pagos, matching
- **Autenticación** — tokens por workspace
- **Rate limiting** — protección contra abusos

### 29. 🛡 Infraestructura
Base sólida para escalar sin problemas.
- **Auth** — registro, login, recuperación de contraseña (NextAuth.js)
- **Onboarding** — wizard de 5 pasos al registrarse
- **Términos y privacidad** — modal obligatorio en primer login
- **Workspace multi-tenant** — aislamiento completo entre inmobiliarias
- **Email transaccionales** — bienvenida, pagos, créditos bajos, recuperación (Resend)
- **Cron jobs** — scraping automático, ajustes, recordatorios

---

## 🛠 Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS |
| **Base de datos** | Neon PostgreSQL (serverless) |
| **Autenticación** | NextAuth.js v4 (JWT + Credentials) |
| **Pagos** | Stripe + MercadoPago |
| **Scraping** | ScrapingBee + Cheerio |
| **PDF / Imágenes** | Puppeteer + Chromium |
| **Emails** | Resend |
| **Deploy** | Vercel |

## 🗄 Base de Datos (Neon PostgreSQL)

**32 tablas:**
- `workspaces` — cuentas multi-tenant con plan, créditos, marca, catálogo público
- `users` — autenticación, roles (owner/admin/agent), workspace
- `property_owners` — dueños de propiedades con acceso al portal
- `properties` — propiedades importadas con fotos, precios, ubicación, owner_id
- `pipeline_stages` — etapas del Kanban configurables
- `pipeline_leads` — leads con asignación, presupuesto, requisitos
- `pipeline_activities` — historial de actividades por lead (llamadas, visitas, etc.)
- `contracts` — contratos con partes, propiedad, condiciones financieras
- `guarantors` — garantes vinculados a contratos
- `adjustments` — histórico de ajustes IPC/ICL
- `alerts` — alertas configurables por contrato
- `index_snapshots` — snapshot de índices INDEC/BCRA
- `commissions` — comisiones por operación cerrada
- `maintenance_tickets` — órdenes de mantenimiento con prioridad y estado
- `notifications` — notificaciones in-app por workspace
- `publish_channels` — configuración de canales de publicación
- `publish_logs` — historial de publicaciones
- `scrape_schedules` — configuración de scraping automático
- `scrape_logs` — historial de ejecuciones de scraping
- `ml_tokens` — tokens OAuth de MercadoLibre
- `role_permissions` — permisos granulares por rol en cada workspace
- `whatsapp_templates` — plantillas de mensajes reutilizables
- `whatsapp_messages` — historial de mensajes enviados/recibidos
- `signature_requests` — solicitudes de firma digital con token único
- `payments` — cobros con monto, concepto, estado y método de pago
- `tenant_access_tokens` — tokens de acceso para portal de inquilinos
- `report_schedules` — programación de reportes automáticos
- `report_logs` — historial de reportes enviados
- `expensas` — liquidación de expensas por consorcio
- `billing_invoices` — facturas generadas por Stripe
- `matching_cache` — caché de resultados de matching para performance
- `ml_listings` — publicaciones activas en MercadoLibre

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
ML_CLIENT_ID           # MercadoLibre App ID
ML_CLIENT_SECRET       # MercadoLibre App Secret
MERCADOPAGO_ACCESS_TOKEN  # MercadoPago token
MERCADOPAGO_WEBHOOK_SECRET # MercadoPago webhook
CRON_SECRET            # Secret para endpoints de cron
```

## 📄 Licencia

Privado — uso exclusivo del propietario del workspace.
