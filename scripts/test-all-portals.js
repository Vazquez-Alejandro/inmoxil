const cheerio = require('cheerio');
const API_KEY = process.env.SCRAPINGBEE_API_KEY || '';

async function analyzePortal(url, name) {
  console.log('\n=== ' + name + ' ===');
  try {
    const params = new URLSearchParams({
      api_key: API_KEY, url, render_js: 'true', premium_proxy: 'true',
      country_code: 'ar', wait: '8000',
    });
    const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) { console.log('HTTP', res.status); return; }
    const html = await res.text();
    console.log('HTML:', html.length);
    const $ = cheerio.load(html);
    console.log('Title:', $('title').text().slice(0, 80));

    // Find h2 with prices
    const prices = $('h2').filter((i, el) => $(el).text().match(/USD|U\$S|AR\$|\$/)).map((i, el) => $(el).text().trim()).get();
    console.log('Price h2s:', prices.length, prices.slice(0, 3));

    // For each price h2, walk up to find card container
    if (prices.length > 0) {
      const $firstPrice = $('h2').filter((i, el) => $(el).text().match(/USD|U\$S|AR\$|\$/)).first();
      let $p = $firstPrice.parent();
      for (let j = 0; j < 10; j++) {
        const cls = ($p.attr('class') || '').split(' ')[0];
        const hasImg = $p.find('img').length > 0;
        const hasLink = $p.find('a[href]').length > 0;
        if (hasImg && hasLink && $p.find('h2').length > 0) {
          const cards = $('div.' + cls);
          console.log('Card class:', cls, '| Cards:', cards.length);
          cards.first().each((k, card) => {
            const $c = $(card);
            console.log('  h2:', $c.find('h2').first().text().trim().slice(0, 50));
            console.log('  h3:', $c.find('h3').first().text().trim().slice(0, 50));
            console.log('  link:', $c.find('a[href]').first().attr('href')?.slice(0, 80));
            console.log('  img:', $c.find('img').first().attr('src')?.slice(0, 80));
          });
          break;
        }
        $p = $p.parent();
      }
    }
  } catch(e) {
    console.log('ERROR:', e.message?.slice(0, 150));
  }
}

(async () => {
  await analyzePortal('https://www.argenprop.com/venta/departamento-capital-federal', 'Argenprop');
  await analyzePortal('https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/', 'MercadoLibre');
  await analyzePortal('https://www.zillow.com/for_sale/New-York-NY/', 'Zillow');
})();
