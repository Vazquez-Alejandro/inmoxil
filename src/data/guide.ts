export interface GuideSection {
  id: string
  title: string
  description: string
  details: string[]
}

export interface FAQItem {
  q: string
  r: string
}

export interface FAQCategory {
  category: string
  icon: string
  items: FAQItem[]
}

export const guideSections: GuideSection[] = [
  {
    id: 'dashboard',
    title: 'Panel',
    description: 'Visión general de tu actividad inmobiliaria',
    details: [
      'Métricas clave: propiedades, leads, contratos activos y comisiones del mes.',
      'Acceso rápido a las secciones más importantes del panel.',
      'Widgets informativos con datos actualizados en tiempo real.',
    ],
  },
  {
    id: 'pipeline',
    title: 'Clientes (Pipeline)',
    description: 'Gestioná el embudo de ventas de tus propiedades',
    details: [
      'Organizá tus leads en etapas: nuevo, contacto, visita, negociación, cerrado.',
      'Agregá leads manualmente o importalos desde portales.',
      'Registrá actividades como llamadas, emails y visitas programadas.',
      'Visualizá el historial completo de cada lead.',
    ],
  },
  {
    id: 'calendar',
    title: 'Calendario',
    description: 'Agendá y gestioná visitas a propiedades',
    details: [
      'Visualizá todas tus visitas en un calendario mensual.',
      'Agendá visitas desde la ficha del lead en el pipeline.',
      'Cambiá el estado de las visitas: pendiente, confirmada, realizada, cancelada.',
      'Accedé a los datos del contacto y la propiedad desde cada evento.',
    ],
  },
  {
    id: 'contracts',
    title: 'Contratos',
    description: 'Creación y gestión de contratos digitales',
    details: [
      'Creá contratos de alquiler y compraventa con plantillas predefinidas.',
      'Asigná inquilinos, propietarios y propiedades automáticamente.',
      'Firma digital: enviá el contrato al inquilino para que lo firme online.',
      'Historial de estados: borrador, pendiente de firma, vigente, finalizado.',
    ],
  },
  {
    id: 'commissions',
    title: 'Comisiones',
    description: 'Control de comisiones generadas por tus operaciones',
    details: [
      'Resumen de comisiones del mes actual y meses anteriores.',
      'Desglose por propiedad y por contrato.',
      'Seguimiento de pagos pendientes y cobrados.',
      'Exportá reportes para tu contabilidad.',
    ],
  },
  {
    id: 'team',
    title: 'Equipo',
    description: 'Invitá y gestioná los miembros de tu inmobiliaria',
    details: [
      'Agregá agentes, admins y colaboradores a tu equipo.',
      'Asigná roles y permisos específicos para cada miembro.',
      'Cada miembro tiene su propio acceso con credenciales individuales.',
    ],
  },
  {
    id: 'settings',
    title: 'Configuración',
    description: 'Personalizá los datos de tu inmobiliaria',
    details: [
      'Información general: nombre, dirección, contacto de la inmobiliaria.',
      'Catálogo público: activá una página web pública con tus propiedades.',
      'Redes sociales: vinculá tus perfiles de Instagram, Facebook, etc.',
      'Zona horaria y preferencias regionales.',
    ],
  },
  {
    id: 'scrape',
    title: 'Importar',
    description: 'Importá propiedades desde portales web',
    details: [
      'Pegá enlaces de propiedades desde MercadoLibre, ZonaProp, Argenprop y más.',
      'Subí un archivo CSV o Excel con múltiples propiedades.',
      'Los datos se extraen automáticamente y se guardan en tu panel.',
      'Historial de importaciones con estado de cada propiedad.',
    ],
  },
  {
    id: 'properties',
    title: 'Propiedades',
    description: 'Administrá tu catálogo de propiedades',
    details: [
      'Listado completo con fotos, precio, ubicación y tipo.',
      'Filtros avanzados: tipo, precio, ubicación, estado.',
      'Agregá propiedades manualmente con formulario detallado.',
      'Editá, Publicá o desactivá propiedades desde el panel.',
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Comunicate con clientes desde la plataforma',
    details: [
      'Enviá mensajes de WhatsApp directamente a tus contactos.',
      'Usá plantillas predefinidas para consultas comunes.',
      'Historial de conversaciones vinculado a cada lead.',
      'Apertura rápida con un clic desde la ficha del cliente.',
    ],
  },
  {
    id: 'publish',
    title: 'Publicaciones',
    description: 'Publicá propiedades en portales inmobiliarios',
    details: [
      'Conectá con MercadoLibre, ZonaProp, Argenprop y más.',
      'Publicá tus propiedades directamente desde la plataforma.',
      'Gestioná el estado de cada publicación en cada portal.',
      'Sincronización automática de cambios y disponibilidad.',
    ],
  },
  {
    id: 'schedule',
    title: 'Importación Automática',
    description: 'Programá importaciones periódicas de propiedades',
    details: [
      'Configurá importaciones automáticas diarias o semanales.',
      'Definí portales y palabras clave para la búsqueda.',
      'Recibí nuevas propiedades en tu panel sin intervención manual.',
      'Alertas cuando se detecten propiedades que coincidan con tus criterios.',
    ],
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Central de alertas y novedades del sistema',
    details: [
      'Notificaciones de nuevos leads, mensajes y actividades.',
      'Alertas de vencimientos de contratos y pagos.',
      'Marcá como leídas o eliminá notificaciones viejas.',
      'Filtro rápido: todas, no leídas, importantes.',
    ],
  },
  {
    id: 'mantenimiento',
    title: 'Mantenimiento',
    description: 'Gestión de reclamos y solicitudes de mantenimiento',
    details: [
      'Registrá tickets de mantenimiento para tus propiedades.',
      'Asigná prioridad y categoría a cada solicitud.',
      'Seguimiento del estado: pendiente, en progreso, resuelto.',
      'Historial completo de cada ticket con fechas y notas.',
    ],
  },
  {
    id: 'expensas',
    title: 'Expensas',
    description: 'Cálculo y distribución de expensas para consorcios',
    details: [
      'Cargá datos de consorcios: unidades funcionales, coeficientes y gastos comunes.',
      'Calculá automáticamente la parte proporcional de cada unidad.',
      'Generá liquidaciones mensuales con desglose por unidad.',
      'Plantillas reutilizables para ahorrar tiempo en cargas repetitivas.',
    ],
  },
  {
    id: 'matching',
    title: 'Matching IA',
    description: 'Inteligencia artificial para emparejar propiedades con clientes',
    details: [
      'El sistema analiza las preferencias de cada lead automáticamente.',
      'Matching por precio, zona, tipo de propiedad y amenities.',
      'Score de confianza: alta, media o baja según el nivel de coincidencia.',
      'Fuzzy matching para encontrar propiedades similares aunque no sean idénticas.',
    ],
  },
  {
    id: 'ml',
    title: 'MercadoLibre',
    description: 'Integración con MercadoLibre para importación',
    details: [
      'Conectá tu cuenta de MercadoLibre para importar publicaciones.',
      'Visualizá y gestioná tus publicaciones existentes.',
      'Sincronización de precios, estados y disponibilidad.',
      'Configuración de la conexión con tu cuenta de ML.',
    ],
  },
  {
    id: 'ads',
    title: 'Ads',
    description: 'Generador de anuncios publicitarios con IA',
    details: [
      'Seleccioná una propiedad y elegí un tipo de anuncio (Feed, Story, Reel, Meta Ad).',
      'Elegí una plantilla visual: Moderno, Minimalista, Lujo, Audaz, Elegante o Tropical.',
      'Generá imágenes publicitarias profesionales automáticamente.',
      'Cada anuncio consume 1 crédito de tu plan.',
    ],
  },
  {
    id: 'analytics',
    title: 'Estadísticas',
    description: 'Métricas detalladas de tu negocio inmobiliario',
    details: [
      'Gráficos de actividad: propiedades, leads y contratos por período.',
      'Distribución de propiedades por portal de origen.',
      'Evolución mensual de leads generados.',
      'Créditos consumidos y restantes en tu plan.',
    ],
  },
  {
    id: 'reports',
    title: 'Reportes',
    description: 'Informes descargables de tu actividad',
    details: [
      'Propiedades por tipo: cantidad y distribución.',
      'Leads por origen: pipeline, importación, manual.',
      'Evolución mensual de leads en los últimos 12 meses.',
      'Datos exportables para análisis externo.',
    ],
  },
  {
    id: 'pagos',
    title: 'Cobranza',
    description: 'Control de pagos de alquileres y comisiones',
    details: [
      'Registrá cobros de alquileres y comisiones.',
      'Resumen por estado: pendientes, cobrados, fallidos, reembolsados.',
      'Historial de pagos por inquilino y por propiedad.',
      'Reportes financieros para tu gestión contable.',
    ],
  },
  {
    id: 'billing',
    title: 'Facturación',
    description: 'Gestión de tu suscripción y plan contratado',
    details: [
      'Visualizá tu plan actual (Inicial, Profesional o Empresarial).',
      'Comparativa de características entre planes.',
      'Actualizá o cambiá tu plan de suscripción.',
      'Historial de pagos y facturación.',
    ],
  },
  {
    id: 'brand',
    title: 'Mi Marca',
    description: 'Personalizá la identidad visual de tu inmobiliaria',
    details: [
      'Colores de marca: seleccioná colores primario, secundario y de acento.',
      'Logo: subí el logo de tu inmobiliaria.',
      'Vista previa en vivo de cómo se ven tus propiedades con tu marca.',
      'Los colores se aplican automáticamente en toda la plataforma.',
    ],
  },
  {
    id: 'api-docs',
    title: 'API Docs',
    description: 'Documentación técnica para desarrolladores',
    details: [
      'Endpoints disponibles: scrape, properties, ads, billing.',
      'Autenticación mediante API key.',
      'Ejemplos de requests y responses en JSON.',
      'Límites de tasa (rate limits) para cada endpoint.',
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Panel de administración general del sistema',
    details: [
      'Estadísticas globales: usuarios, workspaces y suscripciones.',
      'Gestión de créditos por workspace.',
      'Distribución de planes contratados.',
      'Listado de usuarios del sistema.',
    ],
  },
]

export const faqData: FAQCategory[] = [
  {
    category: 'Primeros pasos',
    icon: '🚀',
    items: [
      { q: '¿Cómo empiezo a usar la plataforma?', r: 'Completá el onboarding inicial donde configurás tu inmobiliaria, colores de marca y plan. Luego podés empezar importando propiedades desde la sección Importar.' },
      { q: '¿Qué plan me recomiendan?', r: 'El plan Inicial es ideal para empezar con hasta 50 créditos. Si necesitás más capacidad, el plan Profesional (200 créditos) o Empresarial (1000 créditos) se ajustan mejor.' },
      { q: '¿Cómo invito a mi equipo?', r: 'Andá a la sección Equipo y usá el formulario para invitar agentes. Cada uno recibe un email con sus credenciales de acceso.' },
      { q: '¿Puedo cambiar de plan después?', r: 'Sí, podés cambiar tu plan en cualquier momento desde Facturación. El cambio se prorratea según el tiempo restante del ciclo.' },
    ],
  },
  {
    category: 'Propiedades',
    icon: '🏠',
    items: [
      { q: '¿Cómo importo propiedades?', r: 'Usá la sección Importar: pegá enlaces de portales como MercadoLibre o ZonaProp, o subí un archivo CSV/Excel con los datos.' },
      { q: '¿Puedo publicar en MercadoLibre desde acá?', r: 'Sí, la sección Publicaciones te permite conectar con MercadoLibre, ZonaProp y otros portales para publicar directamente.' },
      { q: '¿Cómo edito una propiedad existente?', r: 'Andá a Propiedades, encontrá la propiedad que querés editar y hacé clic en el botón de edición (lápiz).' },
      { q: '¿Qué tipos de propiedades puedo cargar?', r: 'Departamentos, casas, locales, oficinas, terrenos y ph. Cada tipo tiene campos específicos como metraje, ambientes y antigüedad.' },
    ],
  },
  {
    category: 'Matching IA',
    icon: '🤖',
    items: [
      { q: '¿Cómo funciona el matching automático?', r: 'La IA analiza las preferencias del cliente (precio, zona, tipo) y encuentra propiedades que coincidan. Recibirás un ranking con score de confianza.' },
      { q: '¿Qué significa el score de confianza?', r: 'Alta = coincidencia casi perfecta. Media = buena opción pero con diferencias. Baja = puede interesarle aunque no es ideal. Se actualiza según la información del lead.' },
      { q: '¿Puedo configurar las reglas de matching?', r: 'Sí, podés definir zonas preferidas, amenities deseados y rangos de precio. El sistema aprende de tus ajustes.' },
    ],
  },
  {
    category: 'Expensas',
    icon: '🏢',
    items: [
      { q: '¿Cómo calculo las expensas?', r: 'Creá un consorcio, cargá las unidades con sus coeficientes, agregá gastos comunes y generá la liquidación. El sistema calcula automáticamente la parte de cada unidad.' },
      { q: '¿Puedo usar plantillas?', r: 'Sí, creá plantillas de expensas con gastos recurrentes y reutilizalas cada mes para ahorrar tiempo.' },
      { q: '¿Cómo comparto la liquidación con los propietarios?', r: 'Exportá la liquidación como PDF y compartila por WhatsApp o email directamente desde la plataforma.' },
    ],
  },
  {
    category: 'Clientes y Ventas',
    icon: '🤝',
    items: [
      { q: '¿Cómo agrego un nuevo cliente?', r: 'En la sección Clientes (Pipeline), hacé clic en "Nuevo lead" y completá los datos del contacto. Se asignará automáticamente a la etapa "Nuevo".' },
      { q: '¿Cómo programo una visita?', r: 'Desde la ficha del lead, seleccioná la actividad "Visita" y elegí fecha y hora. Se creará automáticamente en el Calendario.' },
      { q: '¿Qué pasa cuando cierro una venta?', r: 'Mové el lead a la etapa "Cerrado" en el pipeline. A partir de ahí podés crear un contrato desde la sección Contratos.' },
      { q: '¿Puedo agregar notas a un lead?', r: 'Sí, desde la ficha del lead podés agregar notas internas, historial de llamadas y actividad reciente.' },
    ],
  },
  {
    category: 'Contratos y Firma',
    icon: '📄',
    items: [
      { q: '¿Cómo creo un contrato de alquiler?', r: 'En Contratos, hacé clic en "Nuevo contrato". Seleccioná tipo "Alquiler", completá los datos de propiedad, inquilino y propietario.' },
      { q: '¿Cómo funciona la firma digital?', r: 'Una vez creado el contrato, enviáselo al inquilino. Recibirá un enlace para firmar digitalmente desde cualquier dispositivo.' },
      { q: '¿El contrato tiene validez legal?', r: 'La firma electrónica tiene validez legal en Argentina según la Ley 25.506. Recomendamos consultar con un asesor legal.' },
      { q: '¿Qué tipos de contrato puedo crear?', r: 'Alquiler, compraventa y cesión. Cada tipo tiene campos específicos y plantillas predefinidas.' },
    ],
  },
  {
    category: 'Facturación y Créditos',
    icon: '💰',
    items: [
      { q: '¿Cómo compro más créditos?', r: 'Los créditos se renuevan cada mes según tu plan. Si necesitás más, podés cambiar a un plan superior desde Facturación.' },
      { q: '¿Qué consume créditos?', r: 'Cada ad generado en la sección Ads consume 1 crédito. Las importaciones y publicaciones no consumen créditos.' },
      { q: '¿Cómo cambio mi plan?', r: 'Andá a Facturación, seleccioná el plan que querés y confirmá el cambio. Se prorratea según el tiempo restante del ciclo actual.' },
      { q: '¿Cómo veo mi historial de pagos?', r: 'En la sección Facturación encontrás el historial completo de facturas y pagos realizados.' },
    ],
  },
  {
    category: 'Soporte Técnico',
    icon: '🔧',
    items: [
      { q: '¿Cómo reporto un error?', r: 'Si encontrás algún problema, escribinos a soporte@inmoxil.com.ar o usá el botón de ayuda en la plataforma.' },
      { q: '¿La plataforma tiene app móvil?', r: 'Por ahora la plataforma es web responsive. Funciona perfectamente en el navegador de tu celular.' },
      { q: '¿Cómo exporto mis datos?', r: 'Las secciones de Reportes y Comisiones permiten exportar datos. Si necesitás una exportación completa, contactanos.' },
      { q: '¿Mis datos están seguros?', r: 'Sí, utilizamos Supabase con encriptación SSL, autenticación JWT y políticas RLS para proteger toda tu información.' },
    ],
  },
]

export const tourSteps = [
  {
    targetId: 'sidebar',
    title: 'Bienvenido/a a Inmoxil',
    description: 'Este es el menú lateral. Desde acé podés acceder a todas las secciones de la plataforma. Cada ícono representa una funcionalidad distinta.',
    position: 'right' as const,
  },
  {
    targetId: 'step-panel',
    title: 'Panel',
    description: 'Acé ves un resumen de tu actividad: propiedades, leads, contratos y comisiones del mes. Es tu vista rápida de negocio.',
    position: 'right' as const,
  },
  {
    targetId: 'step-pipeline',
    title: 'Clientes',
    description: 'Gestioná tu embudo de ventas. Seguí cada lead desde el primer contacto hasta el cierre, registrando llamadas, visitas y más.',
    position: 'right' as const,
  },
  {
    targetId: 'step-calendar',
    title: 'Calendario',
    description: 'Agendá y gestioná visitas a propiedades. Todo lo que programes en el pipeline aparece automáticamente acé.',
    position: 'right' as const,
  },
  {
    targetId: 'step-import',
    title: 'Importar',
    description: 'La puerta de entrada de propiedades. Pegá enlaces de portales o subí archivos para cargar propiedades automáticamente.',
    position: 'right' as const,
  },
  {
    targetId: 'step-header',
    title: 'Barra superior',
    description: 'Acé tenés el título de la sección actual, el centro de notificaciones, el botón de modo oscuro y tu perfil de usuario.',
    position: 'bottom' as const,
  },
]
