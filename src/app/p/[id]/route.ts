import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE id=$1', [params.id])
    if (!property) {
      return new NextResponse('Propiedad no encontrada', { status: 404 })
    }

    const photos = property.photos || []
    const price = property.price ? new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: property.currency || 'ARS', maximumFractionDigits: 0,
    }).format(property.price) : 'Consultar'
    const hasCoords = property.lat && property.lng

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(property.title || 'Propiedad')} | Inmoxil</title>
  <meta property="og:title" content="${escapeHtml(property.title || 'Propiedad en venta/alquiler')}">
  <meta property="og:description" content="${escapeHtml((property.description || '').slice(0, 200))} - ${escapeHtml(price)}">
  <meta property="og:image" content="${escapeHtml(photos[0] || '')}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; }
    .gallery { position: relative; width: 100%; height: 50vh; min-height: 320px; overflow: hidden; background: #e2e8f0; }
    .gallery img { width: 100%; height: 100%; object-fit: cover; }
    .gallery .nav { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.9); border: none; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
    .gallery .prev { left: 16px; } .gallery .next { right: 16px; }
    .gallery .dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
    .gallery .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.5); border: none; cursor: pointer; }
    .gallery .dot.active { background: #fff; width: 24px; border-radius: 4px; }
    .content { max-width: 720px; margin: 0 auto; padding: 24px; }
    .price { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .address { font-size: 14px; color: #64748b; margin-bottom: 20px; }
    .features { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .feature { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; text-align: center; min-width: 80px; }
    .feature .value { font-size: 18px; font-weight: 700; color: #0f172a; }
    .feature .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
    .desc { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .desc h3 { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
    .desc p { font-size: 14px; color: #475569; line-height: 1.6; }
    .whatsapp { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #25D366; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background .2s; }
    .whatsapp:hover { background: #1da851; }
    .btn-report { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #0f172a; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; transition: background .2s; margin-top: 12px; }
    .btn-report:hover { background: #1e293b; }
    .btn-report.active { background: #475569; }
    .ticket-form { display: none; margin-top: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .ticket-form.open { display: block; }
    .ticket-form h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .ticket-form .field { margin-bottom: 14px; }
    .ticket-form label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .5px; }
    .ticket-form input, .ticket-form textarea { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #0f172a; outline: none; transition: border-color .2s; }
    .ticket-form input:focus, .ticket-form textarea:focus { border-color: #0f172a; }
    .ticket-form textarea { min-height: 100px; resize: vertical; }
    .ticket-form .submit-btn { width: 100%; padding: 12px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; }
    .ticket-form .submit-btn:hover { background: #1e293b; }
    .ticket-form .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .ticket-success { display: none; margin-top: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; }
    .ticket-success.open { display: block; }
    .ticket-success h3 { font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 4px; }
    .ticket-success p { font-size: 14px; color: #047857; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="gallery" id="gallery">
    <img id="mainImage" src="${photos[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'}" alt="">
    ${photos.length > 1 ? '<button class="nav prev" onclick="changeImage(-1)">‹</button><button class="nav next" onclick="changeImage(1)">›</button><div class="dots" id="dots"></div>' : ''}
  </div>
  <div class="content">
    <div class="price">${price}</div>
    <div class="address">${[property.address, property.neighborhood, property.city].filter(Boolean).map(escapeHtml).join(', ') || 'Dirección no disponible'}</div>
    <div class="features">
      ${property.beds ? '<div class="feature"><div class="value">'+property.beds+'</div><div class="label">Ambientes</div></div>' : ''}
      ${property.baths ? '<div class="feature"><div class="value">'+property.baths+'</div><div class="label">Baños</div></div>' : ''}
      ${property.sqm ? '<div class="feature"><div class="value">'+property.sqm+'</div><div class="label">m²</div></div>' : ''}
      ${property.property_type ? '<div class="feature"><div class="value" style="font-size:14px;text-transform:capitalize">'+escapeHtml(property.property_type)+'</div><div class="label">Tipo</div></div>' : ''}
    </div>
    ${property.description ? '<div class="desc"><h3>Descripción</h3><p>'+escapeHtml(property.description)+'</p></div>' : ''}
    ${hasCoords ? '<div style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0"><iframe width="100%" height="250" style="border:0" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox='+(parseFloat(property.lng)-0.01)+','+(parseFloat(property.lat)-0.01)+','+(parseFloat(property.lng)+0.01)+','+(parseFloat(property.lat)+0.01)+'&amp;layer=mapnik&amp;marker='+property.lat+','+property.lng+'"></iframe></div>' : ''}
    <a class="whatsapp" href="https://wa.me/?text=${encodeURIComponent('Hola, vi esta propiedad y me interesa:\n\n' + (property.title || '') + '\n' + price + '\n' + (property.address || '') + '\n\nPodés ver más info acá: https://inmoxil.vercel.app/p/' + params.id)}" target="_blank" rel="noopener">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
      Consultar por WhatsApp
    </a>
    <button class="btn-report" id="reportBtn" onclick="toggleForm()">Reportar un problema</button>
    <div class="ticket-form" id="ticketForm">
      <h3>Reportar un problema de mantenimiento</h3>
      <div class="field">
        <label>Nombre *</label>
        <input id="tktName" placeholder="Tu nombre" />
      </div>
      <div class="field">
        <label>Teléfono</label>
        <input id="tktPhone" placeholder="+54 11 1234-5678" />
      </div>
      <div class="field">
        <label>Email</label>
        <input id="tktEmail" type="email" placeholder="tu@email.com" />
      </div>
      <div class="field">
        <label>Descripción del problema *</label>
        <textarea id="tktDesc" placeholder="Describí el problema..."></textarea>
      </div>
      <button class="submit-btn" id="tktSubmit" onclick="submitTicket()">Enviar reporte</button>
    </div>
    <div class="ticket-success" id="ticketSuccess">
      <h3>¡Reporte enviado!</h3>
      <p>Nos pondremos en contacto a la brevedad para resolver el problema.</p>
    </div>
  </div>
  <div class="footer">Publicado por Inmoxil © ${new Date().getFullYear()}</div>
  <script>
    const propertyId = ${JSON.stringify(params.id)};
    function toggleForm() {
      const form = document.getElementById('ticketForm');
      const btn = document.getElementById('reportBtn');
      form.classList.toggle('open');
      btn.classList.toggle('active');
    }
    async function submitTicket() {
      const name = document.getElementById('tktName').value.trim();
      const phone = document.getElementById('tktPhone').value.trim();
      const email = document.getElementById('tktEmail').value.trim();
      const desc = document.getElementById('tktDesc').value.trim();
      const btn = document.getElementById('tktSubmit');
      if (!name || !desc) { alert('Completá nombre y descripción'); return; }
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        const res = await fetch('/api/public/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId, tenantName: name, tenantPhone: phone, tenantEmail: email, description: desc }),
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('ticketForm').classList.remove('open');
          document.getElementById('ticketSuccess').classList.add('open');
          document.getElementById('reportBtn').style.display = 'none';
        } else {
          alert('Error: ' + (data.error || 'No se pudo enviar'));
        }
      } catch(e) {
        alert('Error de conexión');
      }
      btn.disabled = false;
      btn.textContent = 'Enviar reporte';
    }
  </script>
  ${photos.length > 1 ? `
  <script>
    const photos = ${JSON.stringify(photos)};
    let current = 0;
    const img = document.getElementById('mainImage');
    const dots = document.getElementById('dots');
    photos.forEach((_, i) => { const d = document.createElement('button'); d.className='dot'+(i===0?' active':''); d.onclick=()=>show(i); dots.appendChild(d); });
    function show(i) { current = i; img.src = photos[i]; document.querySelectorAll('.dot').forEach((d,j)=>d.className='dot'+(j===i?' active':'')); }
    function changeImage(d) { show((current + d + photos.length) % photos.length); }
    document.addEventListener('keydown', e => { if(e.key==='ArrowLeft')changeImage(-1); if(e.key==='ArrowRight')changeImage(1); });
  </script>` : ''}
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    return new NextResponse('Error interno', { status: 500 })
  }
}