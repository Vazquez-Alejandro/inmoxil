import puppeteer from 'puppeteer'

interface BrandConfig {
  name?: string
  primaryColor?: string
  secondaryColor?: string
  logo?: string
}

interface PropertyData {
  title?: string
  address?: string
  neighborhood?: string
  city?: string
  price?: number | null
  currency?: string
  beds?: number | null
  baths?: number | null
  sqm?: number | null
  description?: string
  features?: string[]
  photos?: string[]
  portal?: string
  url?: string
  yearBuilt?: number | null
  propertyType?: string
}

function formatPrice(price: number | null | undefined, currency: string | undefined) {
  if (!price) return 'Consultar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

function renderFeature(feature: string): string {
  return `<div style="display:inline-block;background:#F4F6F8;border-radius:8px;padding:8px 14px;margin:4px;font-size:13px;color:#0F2B46;">${feature}</div>`
}

function buildPropertyHTML(property: PropertyData, brand: BrandConfig): string {
  const primary = brand.primaryColor || '#0F2B46'
  const secondary = brand.secondaryColor || '#D4A843'
  const brandName = brand.name || 'Ix'
  const photoUrl =
    property.photos?.[0] ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop'
  const features = property.features?.length
    ? property.features.map(renderFeature).join('')
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 0; }
    .header { background: ${primary}; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { color: ${secondary}; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .header .portal { color: rgba(255,255,255,0.7); font-size: 13px; }
    .hero { position: relative; width: 100%; height: 400px; overflow: hidden; }
    .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hero .overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 40px; background: linear-gradient(transparent, rgba(15,43,70,0.9)); }
    .hero .price { color: ${secondary}; font-size: 32px; font-weight: 800; }
    .hero .type { color: #fff; font-size: 14px; opacity: 0.8; }
    .content { padding: 32px 40px; }
    .title { font-size: 24px; font-weight: 700; color: ${primary}; margin-bottom: 8px; }
    .address { font-size: 14px; color: #6B7280; margin-bottom: 24px; }
    .stats { display: flex; gap: 32px; margin-bottom: 28px; padding: 20px 24px; background: #F4F6F8; border-radius: 12px; }
    .stat-label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 20px; font-weight: 700; color: ${primary}; }
    .section-title { font-size: 16px; font-weight: 700; color: ${primary}; margin-bottom: 12px; border-bottom: 2px solid ${secondary}; display: inline-block; padding-bottom: 4px; }
    .description { font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 28px; }
    .features { margin-bottom: 28px; }
    .footer { background: #F4F6F8; padding: 24px 40px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer strong { color: ${primary}; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>${brandName}</h1>
      <div class="portal">${property.portal || ''}</div>
    </div>
    <div class="hero">
      <img src="${photoUrl}" alt="${property.title || ''}" />
      <div class="overlay">
        <div class="price">${formatPrice(property.price, property.currency)}</div>
        <div class="type">${property.propertyType || 'Propiedad'}</div>
      </div>
    </div>
    <div class="content">
      <h2 class="title">${property.title || 'Propiedad'}</h2>
      <p class="address">${[property.address, property.neighborhood, property.city].filter(Boolean).join(', ')}</p>
      <div class="stats">
        ${property.beds ? `<div><div class="stat-label">Ambientes</div><div class="stat-value">${property.beds}</div></div>` : ''}
        ${property.baths ? `<div><div class="stat-label">Baños</div><div class="stat-value">${property.baths}</div></div>` : ''}
        ${property.sqm ? `<div><div class="stat-label">Superficie</div><div class="stat-value">${property.sqm} m²</div></div>` : ''}
        ${property.yearBuilt ? `<div><div class="stat-label">Año</div><div class="stat-value">${property.yearBuilt}</div></div>` : ''}
      </div>
      ${property.description ? `<h3 class="section-title">Descripción</h3><p class="description">${property.description}</p>` : ''}
      ${features ? `<h3 class="section-title">Características</h3><div class="features">${features}</div>` : ''}
    </div>
    <div class="footer">
      <strong>Inmoxil</strong> &mdash; Plataforma para agencias inmobiliarias<br/>
      Generado el ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
      ${property.url ? ` &bull; <a href="${property.url}" style="color:${secondary};text-decoration:none;">Ver en portal</a>` : ''}
    </div>
  </div>
</body>
</html>`
}

export async function generatePropertyPDF(
  property: PropertyData,
  brand: BrandConfig = {}
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  try {
    const page = await browser.newPage()
    const html = buildPropertyHTML(property, brand)
    await page.setContent(html, { waitUntil: 'domcontentloaded' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
