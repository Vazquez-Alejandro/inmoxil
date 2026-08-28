const cheerio = require('cheerio');
const API_KEY = process.env.SCRAPINGBEE_API_KEY || '';

async function test(url, name) {
  const start = Date.now();
  try {
    const params = new URLSearchParams({
      api_key: API_KEY, url, render_js: 'true', premium_proxy: 'true',
      country_code: 'ar', wait: '10000',
    });
    const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(45000) });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text().slice(0, 60);
    
    // Quick card count
    let cards = 0;
    const allEls = $('*');
    allEls.each((_, el) => {
      const cls = $(el).attr('class') || '';
      if (cls.includes('Card') || cls.includes('card') || cls.includes('posting') || cls.includes('slide-property') || cls.includes('listing')) {
        if ($(el).find('a[href]').length > 0 && $(el).find('img').length > 0) cards++;
      }
    });
    
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`${name}: ${res.status} | ${html.length} bytes | cards: ~${cards} | title: ${title} | ${elapsed}s`);
  } catch(e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`${name}: ERROR | ${e.message?.slice(0, 80)} | ${elapsed}s`);
  }
}

(async () => {
  await test('https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html', 'ZonaProp');
  await test('https://www.argenprop.com/venta/departamento-capital-federal', 'Argenprop');
  await test('https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/', 'ML');
  await test('https://www.zillow.com/for_sale/New-York-NY/', 'Zillow');
  await test('https://www.realtor.com/realestateandhomes-for-sale', 'Realtor');
})();
