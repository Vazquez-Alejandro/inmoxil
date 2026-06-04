import puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

export type AdType = 'feed' | 'story' | 'reel' | 'meta_ad'

export type TemplateId = 'modern' | 'minimal' | 'luxury' | 'bold' | 'elegant' | 'tropical'

interface BrandConfig {
  primary_color: string
  secondary_color: string
  accent_color: string
  name: string
  logo_url: string | null
}

interface Property {
  id: string
  title: string
  price: number | null
  currency: string
  address: string
  beds: number | null
  baths: number | null
  sqm: number | null
  property_type: string
  photos: string[]
  description: string
  neighborhood?: string
  city?: string
}

const AD_DIMENSIONS: Record<AdType, { width: number; height: number }> = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  reel: { width: 1080, height: 1920 },
  meta_ad: { width: 1200, height: 628 },
}

const TEMPLATE_NAMES: Record<TemplateId, string> = {
  modern: 'Moderno',
  minimal: 'Minimalista',
  luxury: 'Lujo',
  bold: 'Audaz',
  elegant: 'Elegante',
  tropical: 'Tropical',
}

function formatPrice(price: number | null, currency: string): string {
  if (!price) return 'Consultar precio'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Departamento',
    house: 'Casa',
    condo: 'Condominio',
    land: 'Terreno',
    office: 'Oficina',
    commercial: 'Local comercial',
    warehouse: 'Depósito',
    studio: 'Monoambiente',
    penthouse: 'Ph',
    duplex: 'Dúplex',
  }
  return labels[type?.toLowerCase()] || type || 'Propiedad'
}

function getPlaceholderImage(brand: BrandConfig): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${brand.primary_color}"/><stop offset="100%" stop-color="${brand.secondary_color}"/></linearGradient></defs><rect fill="url(#g)" width="1080" height="1080"/><text x="540" y="480" text-anchor="middle" fill="white" font-family="Inter,Arial,sans-serif" font-size="48" font-weight="700">Sin imagen</text><text x="540" y="540" text-anchor="middle" fill="white" font-family="Inter,Arial,sans-serif" font-size="24" opacity="0.7">Agregá fotos a tu propiedad</text></svg>`)}`
}

function buildModernTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)
  const specs = [property.beds, property.baths, property.sqm].filter(Boolean)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:#000}
.ad{position:relative;width:100%;height:100%;overflow:hidden}
.photo{width:100%;height:${isVertical ? '100%' : '72%'};object-fit:cover;position:absolute;top:0;left:0}
.overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,0.85) 100%)}
.content{position:absolute;bottom:0;left:0;width:100%;padding:${isVertical ? '60px 48px 80px' : '40px 48px 40px'};color:white}
.brand-row{display:flex;align-items:center;gap:16px;margin-bottom:${isVertical ? '32px' : '20px'}}
.logo-circle{width:56px;height:56px;border-radius:50%;background:${brand.secondary_color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;color:${brand.primary_color}}
.brand-name{font-size:18px;font-weight:600;letter-spacing:-0.02em}
.brand-sub{font-size:13px;opacity:0.7;margin-top:2px}
.price{font-size:${isVertical ? '52px' : '42px'};font-weight:800;letter-spacing:-0.03em;margin-bottom:${isVertical ? '24px' : '16px'};color:${brand.secondary_color}}
.title{font-size:${isVertical ? '28px' : '22px'};font-weight:600;margin-bottom:${isVertical ? '16px' : '8px'};line-height:1.2}
.specs{display:flex;gap:24px;margin-bottom:${isVertical ? '24px' : '12px'};font-size:15px;opacity:0.85}
.spec-item{display:flex;align-items:center;gap:6px}
.address{font-size:15px;opacity:0.7;display:flex;align-items:center;gap:6px}
.cta{position:absolute;${isVertical ? 'bottom:40px' : 'bottom:40px'};right:48px;background:${brand.secondary_color};color:${brand.primary_color};padding:16px 36px;border-radius:12px;font-weight:700;font-size:16px;letter-spacing:-0.01em}
.accent-bar{position:absolute;${isVertical ? 'top:0;left:0;width:8px;height:100%' : 'top:0;left:0;width:100%;height:8px'};background:${brand.secondary_color}}
</style>
</head>
<body>
<div class="ad">
  <div class="accent-bar"></div>
  <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
  <div class="overlay"></div>
  <div class="content">
    <div class="brand-row">
      <div class="logo-circle">${brand.name[0] || 'I'}</div>
      <div>
        <div class="brand-name">${brand.name}</div>
        <div class="brand-sub">${TEMPLATE_NAMES.modern}</div>
      </div>
    </div>
    <div class="price">${price}</div>
    <div class="title">${property.title}</div>
    <div class="specs">
      ${specs.map((s, i) => `<span class="spec-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>${[property.beds ? property.beds + ' amb' : '', property.baths ? property.baths + ' baños' : '', property.sqm ? property.sqm + ' m²' : ''][i] || ''}</span>`).join('')}
    </div>
    <div class="address"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>${property.address || property.neighborhood || property.city || ''}</div>
  </div>
  <div class="cta">Ver más</div>
</div>
</body>
</html>`
}

function buildMinimalTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)
  const specs = [property.beds, property.baths, property.sqm].filter(Boolean)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:#FAFAFA}
.ad{position:relative;width:100%;height:100%;display:flex;${isVertical ? 'flex-direction:column' : 'flex-direction:row'}}
.photo-section{${isVertical ? 'height:55%;width:100%' : 'width:50%;height:100%'};position:relative;overflow:hidden}
.photo{width:100%;height:100%;object-fit:cover}
.info-section{${isVertical ? 'height:45%;width:100%;padding:40px 48px' : 'width:50%;height:100%;padding:48px;display:flex;flex-direction:column;justify-content:center'};background:#FAFAFA;display:flex;flex-direction:column;justify-content:center}
.brand-mark{width:48px;height:48px;border-radius:12px;background:${brand.primary_color};color:${brand.secondary_color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;margin-bottom:24px}
.price{font-size:${isVertical ? '44px' : '40px'};font-weight:800;color:${brand.primary_color};letter-spacing:-0.03em;margin-bottom:8px}
.type{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${brand.secondary_color};margin-bottom:16px}
.title{font-size:${isVertical ? '26px' : '24px'};font-weight:600;color:#1a1a2e;margin-bottom:16px;line-height:1.2}
.specs{display:flex;gap:20px;margin-bottom:20px;font-size:14px;color:#666}
.spec{padding:8px 16px;background:${brand.primary_color}0a;border-radius:8px;color:${brand.primary_color};font-weight:600}
.address{font-size:14px;color:#888;margin-bottom:24px}
.line{width:48px;height:3px;background:${brand.secondary_color};margin-bottom:24px;border-radius:2px}
.cta-btn{display:inline-flex;align-items:center;gap:8px;background:${brand.primary_color};color:white;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;width:fit-content}
.divider{position:absolute;${isVertical ? 'top:0;left:48px;right:48px;height:1px;background:#eee' : 'top:48px;left:0;right:0;height:1px;background:#eee'};display:none}
</style>
</head>
<body>
<div class="ad">
  <div class="photo-section">
    <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
  </div>
  <div class="info-section">
    <div class="brand-mark">${brand.name[0] || 'I'}</div>
    <div class="type">${getPropertyTypeLabel(property.property_type)}</div>
    <div class="price">${price}</div>
    <div class="title">${property.title}</div>
    <div class="specs">
      ${property.beds ? `<span class="spec">${property.beds} amb</span>` : ''}
      ${property.baths ? `<span class="spec">${property.baths} baños</span>` : ''}
      ${property.sqm ? `<span class="spec">${property.sqm} m²</span>` : ''}
    </div>
    <div class="address">${property.address || property.neighborhood || ''}</div>
    <div class="line"></div>
    <div class="cta-btn">Ver propiedad →</div>
  </div>
</div>
</body>
</html>`
}

function buildLuxuryTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:#0a0a0a}
.ad{position:relative;width:100%;height:100%;overflow:hidden}
.photo{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;opacity:0.6}
.vignette{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.8) 100%)}
.gold-frame{position:absolute;top:${isVertical ? '40px' : '32px'};left:${isVertical ? '40px' : '32px'};right:${isVertical ? '40px' : '32px'};bottom:${isVertical ? '40px' : '32px'};border:2px solid ${brand.secondary_color}40;border-radius:4px}
.content{position:absolute;bottom:0;left:0;width:100%;padding:${isVertical ? '60px 56px 80px' : '48px 56px 48px'};color:white}
.brand-lux{display:flex;align-items:center;gap:14px;margin-bottom:${isVertical ? '40px' : '24px'}}
.logo-diamond{width:48px;height:48px;background:${brand.secondary_color};clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:${brand.primary_color}}
.brand-text{font-size:16px;font-weight:300;letter-spacing:0.15em;text-transform:uppercase;color:${brand.secondary_color}}
.divider-gold{width:60px;height:1px;background:${brand.secondary_color};margin-bottom:${isVertical ? '32px' : '20px'}}
.price{font-size:${isVertical ? '56px' : '48px'};font-weight:200;letter-spacing:-0.02em;margin-bottom:${isVertical ? '24px' : '16px'};color:white}
.price span{font-weight:800;color:${brand.secondary_color}}
.title{font-size:${isVertical ? '28px' : '22px'};font-weight:300;letter-spacing:0.02em;margin-bottom:${isVertical ? '20px' : '12px'};line-height:1.3}
.specs{display:flex;gap:32px;margin-bottom:${isVertical ? '28px' : '16px'};font-size:14px;font-weight:300;letter-spacing:0.05em;text-transform:uppercase}
.spec{display:flex;align-items:center;gap:8px}
.dot{width:4px;height:4px;border-radius:50%;background:${brand.secondary_color}}
.cta{display:inline-flex;align-items:center;gap:12px;border:1px solid ${brand.secondary_color};color:${brand.secondary_color};padding:14px 32px;font-size:14px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase}
</style>
</head>
<body>
<div class="ad">
  <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
  <div class="vignette"></div>
  <div class="gold-frame"></div>
  <div class="content">
    <div class="brand-lux">
      <div class="logo-diamond">${brand.name[0] || 'I'}</div>
      <div class="brand-text">${brand.name}</div>
    </div>
    <div class="divider-gold"></div>
    <div class="price"><span>${price.split(' ')[0]}</span> ${price.split(' ').slice(1).join(' ')}</div>
    <div class="title">${property.title}</div>
    <div class="specs">
      ${property.beds ? `<span class="spec"><span class="dot"></span>${property.beds} amb</span>` : ''}
      ${property.baths ? `<span class="spec"><span class="dot"></span>${property.baths} baños</span>` : ''}
      ${property.sqm ? `<span class="spec"><span class="dot"></span>${property.sqm} m²</span>` : ''}
    </div>
    <div class="cta">Descubrir →</div>
  </div>
</div>
</body>
</html>`
}

function buildBoldTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:${brand.primary_color}}
.ad{position:relative;width:100%;height:100%;overflow:hidden}
.photo{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;opacity:0.35}
.content{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:${isVertical ? '48px 40px 56px' : '36px 40px 36px'};color:white}
.top{display:flex;align-items:center;justify-content:space-between}
.brand-bold{display:flex;align-items:center;gap:12px}
.logo-bold{width:44px;height:44px;border-radius:8px;background:${brand.secondary_color};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:${brand.primary_color}}
.brand-name{font-weight:700;font-size:16px}
.badge-type{background:${brand.secondary_color};color:${brand.primary_color};padding:8px 16px;border-radius:6px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em}
.center{text-align:center}
.price-big{font-size:${isVertical ? '72px' : '56px'};font-weight:900;letter-spacing:-0.04em;line-height:1;margin-bottom:${isVertical ? '20px' : '12px'};text-shadow:0 4px 24px rgba(0,0,0,0.3)}
.title-big{font-size:${isVertical ? '32px' : '26px'};font-weight:700;margin-bottom:${isVertical ? '24px' : '12px'};letter-spacing:-0.02em}
.location{font-size:16px;opacity:0.8;display:flex;align-items:center;justify-content:center;gap:8px}
.bottom{display:flex;align-items:center;justify-content:space-between}
.specs-row{display:flex;gap:16px}
.spec-pill{background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);padding:10px 20px;border-radius:100px;font-size:14px;font-weight:600}
.cta-bold{background:${brand.secondary_color};color:${brand.primary_color};padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;letter-spacing:-0.01em}
.stripe{position:absolute;${isVertical ? 'left:0;top:30%;width:100%;height:4px' : 'left:30%;top:0;height:100%;width:4px'};background:${brand.secondary_color};opacity:0.3}
</style>
</head>
<body>
<div class="ad">
  <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
  <div class="stripe"></div>
  <div class="content">
    <div class="top">
      <div class="brand-bold">
        <div class="logo-bold">${brand.name[0] || 'I'}</div>
        <div class="brand-name">${brand.name}</div>
      </div>
      <div class="badge-type">${getPropertyTypeLabel(property.property_type)}</div>
    </div>
    <div class="center">
      <div class="price-big">${price}</div>
      <div class="title-big">${property.title}</div>
      <div class="location"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${property.address || property.neighborhood || ''}</div>
    </div>
    <div class="bottom">
      <div class="specs-row">
        ${property.beds ? `<span class="spec-pill">${property.beds} amb</span>` : ''}
        ${property.baths ? `<span class="spec-pill">${property.baths} bños</span>` : ''}
        ${property.sqm ? `<span class="spec-pill">${property.sqm} m²</span>` : ''}
      </div>
      <div class="cta-bold">Ver más →</div>
    </div>
  </div>
</div>
</body>
</html>`
}

function buildElegantTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:#FEFCF9}
.ad{position:relative;width:100%;height:100%;overflow:hidden}
.photo-section{position:absolute;top:0;left:0;width:100%;height:${isVertical ? '55%' : '60%'}}
.photo{width:100%;height:100%;object-fit:cover}
.photo-fade{position:absolute;bottom:0;left:0;width:100%;height:120px;background:linear-gradient(transparent,#FEFCF9)}
.info{position:absolute;${isVertical ? 'bottom:0;left:0;width:100%;padding:0 48px 64px' : 'top:0;right:0;width:48%;height:100%;padding:48px 48px 48px 0;display:flex;flex-direction:column;justify-content:center'};padding-top:24px}
.brand-elegant{display:flex;align-items:center;gap:12px;margin-bottom:24px}
.logo-elegant{width:40px;height:40px;border-radius:50%;border:2px solid ${brand.secondary_color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:${brand.secondary_color}}
.brand-label{font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${brand.primary_color}}
.elegant-line{width:100%;height:1px;background:linear-gradient(90deg,${brand.secondary_color},transparent);margin-bottom:24px}
.price-wrap{margin-bottom:8px}
.currency{font-size:14px;font-weight:500;color:${brand.secondary_color};letter-spacing:0.05em;text-transform:uppercase}
.amount{font-size:${isVertical ? '48px' : '42px'};font-weight:300;color:${brand.primary_color};letter-spacing:-0.02em}
.title{font-size:${isVertical ? '24px' : '22px'};font-weight:600;color:${brand.primary_color};margin-bottom:12px;line-height:1.3}
.specs{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.spec-item{display:flex;align-items:center;gap:6px;font-size:14px;color:#666}
.spec-dot{width:5px;height:5px;border-radius:50%;background:${brand.secondary_color}}
.address{font-size:14px;color:#999;display:flex;align-items:center;gap:6px}
.cta-elegant{display:inline-flex;align-items:center;gap:10px;margin-top:24px;padding:12px 0;font-size:14px;font-weight:600;color:${brand.secondary_color};letter-spacing:0.02em;border-bottom:2px solid ${brand.secondary_color}}
</style>
</head>
<body>
<div class="ad">
  <div class="photo-section">
    <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
    <div class="photo-fade"></div>
  </div>
  <div class="info">
    <div class="brand-elegant">
      <div class="logo-elegant">${brand.name[0] || 'I'}</div>
      <div class="brand-label">${brand.name}</div>
    </div>
    <div class="elegant-line"></div>
    <div class="price-wrap">
      <div class="currency">${property.currency}</div>
      <div class="amount">${property.price ? property.price.toLocaleString('es-AR') : 'Consultar'}</div>
    </div>
    <div class="title">${property.title}</div>
    <div class="specs">
      ${property.beds ? `<span class="spec-item"><span class="spec-dot"></span>${property.beds} amb</span>` : ''}
      ${property.baths ? `<span class="spec-item"><span class="spec-dot"></span>${property.baths} baños</span>` : ''}
      ${property.sqm ? `<span class="spec-item"><span class="spec-dot"></span>${property.sqm} m²</span>` : ''}
    </div>
    <div class="address"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${brand.secondary_color}" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/></svg>${property.address || property.neighborhood || ''}</div>
    <div class="cta-elegant">Ver propiedad <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
  </div>
</div>
</body>
</html>`
}

function buildTropicalTemplate(property: Property, brand: BrandConfig, adType: AdType): string {
  const isVertical = adType === 'story' || adType === 'reel'
  const photo = property.photos?.[0] || getPlaceholderImage(brand)
  const price = formatPrice(property.price, property.currency)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100%;height:100%;font-family:'Inter',sans-serif;background:#F0F7F4}
.ad{position:relative;width:100%;height:100%;overflow:hidden}
.photo{width:100%;height:${isVertical ? '60%' : '65%'};object-fit:cover;position:absolute;top:0;left:0}
.wave{position:absolute;${isVertical ? 'bottom:38%' : 'bottom:32%'};left:0;width:100%;height:80px}
.info{position:absolute;bottom:0;left:0;width:100%;padding:${isVertical ? '32px 40px 56px' : '24px 40px 32px'};${isVertical ? '' : 'height:38%'};display:flex;flex-direction:column;justify-content:center}
.brand-tropical{display:flex;align-items:center;gap:12px;margin-bottom:${isVertical ? '24px' : '12px'}}
.logo-tropical{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,${brand.secondary_color},${brand.accent_color || brand.secondary_color});display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:white}
.brand-text{font-weight:700;font-size:15px;color:${brand.primary_color}}
.tagline{font-size:12px;color:#888;margin-top:2px}
.price-tropical{font-size:${isVertical ? '44px' : '36px'};font-weight:800;color:${brand.primary_color};letter-spacing:-0.03em;margin-bottom:${isVertical ? '16px' : '8px'}}
.title-tropical{font-size:${isVertical ? '24px' : '20px'};font-weight:600;color:${brand.primary_color};margin-bottom:${isVertical ? '16px' : '8px'};line-height:1.2}
.specs-tropical{display:flex;gap:12px;margin-bottom:${isVertical ? '20px' : '12px'}}
.spec-chip{background:white;border:1.5px solid ${brand.primary_color}15;padding:8px 16px;border-radius:100px;font-size:13px;font-weight:600;color:${brand.primary_color};box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.address-tropical{font-size:14px;color:#777;display:flex;align-items:center;gap:6px}
.cta-tropical{position:absolute;${isVertical ? 'bottom:40px;right:40px' : 'bottom:32px;right:40px'};background:linear-gradient(135deg,${brand.secondary_color},${brand.accent_color || brand.secondary_color});color:white;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;box-shadow:0 4px 20px ${brand.secondary_color}40}
.leaf-deco{position:absolute;top:0;right:0;width:200px;height:200px;background:radial-gradient(circle at 100% 0%,${brand.secondary_color}15 0%,transparent 70%)}
</style>
</head>
<body>
<div class="ad">
  <img class="photo" src="${photo}" alt="${property.title}" crossorigin="anonymous"/>
  <svg class="wave" viewBox="0 0 1080 80" preserveAspectRatio="none"><path d="M0,40 C360,80 720,0 1080,40 L1080,80 L0,80 Z" fill="#F0F7F4"/></svg>
  <div class="leaf-deco"></div>
  <div class="info">
    <div class="brand-tropical">
      <div class="logo-tropical">${brand.name[0] || 'I'}</div>
      <div>
        <div class="brand-text">${brand.name}</div>
        <div class="tagline">Propiedades destacadas</div>
      </div>
    </div>
    <div class="price-tropical">${price}</div>
    <div class="title-tropical">${property.title}</div>
    <div class="specs-tropical">
      ${property.beds ? `<span class="spec-chip">${property.beds} amb</span>` : ''}
      ${property.baths ? `<span class="spec-chip">${property.baths} bños</span>` : ''}
      ${property.sqm ? `<span class="spec-chip">${property.sqm} m²</span>` : ''}
    </div>
  </div>
  <div class="cta-tropical">Ver más →</div>
</div>
</body>
</html>`
}

function buildTemplate(templateId: TemplateId, property: Property, brand: BrandConfig, adType: AdType): string {
  const builders: Record<TemplateId, (p: Property, b: BrandConfig, t: AdType) => string> = {
    modern: buildModernTemplate,
    minimal: buildMinimalTemplate,
    luxury: buildLuxuryTemplate,
    bold: buildBoldTemplate,
    elegant: buildElegantTemplate,
    tropical: buildTropicalTemplate,
  }
  return builders[templateId](property, brand, adType)
}

export async function generateAd(
  property: Property,
  brand: BrandConfig,
  templateId: TemplateId,
  adType: AdType
): Promise<string> {
  const dims = AD_DIMENSIONS[adType]
  const html = buildTemplate(templateId, property, brand, adType)

  const outputDir = '/tmp/inmoxil-ads'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const timestamp = Date.now()
  const filename = `ad-${property.id}-${templateId}-${adType}-${timestamp}.png`
  const outputPath = path.join(outputDir, filename)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: dims.width, height: dims.height, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 1500))
    await page.screenshot({ path: outputPath, type: 'png' })
  } finally {
    await browser.close()
  }

  return outputPath
}

export function getTemplateList(): Array<{ id: TemplateId; name: string; description: string; preview: string }> {
  return [
    { id: 'modern', name: 'Moderno', description: 'Limpio y profesional con acentos de color', preview: 'gradient' },
    { id: 'minimal', name: 'Minimalista', description: 'Diseño limpio con mucho espacio en blanco', preview: 'minimal' },
    { id: 'luxury', name: 'Lujo', description: 'Elegante con dorado y marcos sutiles', preview: 'luxury' },
    { id: 'bold', name: 'Audaz', description: 'Impactante con colores fuertes y tipografía grande', preview: 'bold' },
    { id: 'elegant', name: 'Elegante', description: 'Sofisticado con líneas finas y tonos suaves', preview: 'elegant' },
    { id: 'tropical', name: 'Tropical', description: 'Fresco y vibrante con degradados coloridos', preview: 'tropical' },
  ]
}
