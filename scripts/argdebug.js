const cheerio = require('cheerio');
const API_KEY = process.env.SCRAPINGBEE_API_KEY || '';

(async () => {
  const params = new URLSearchParams({
    api_key: API_KEY, url: 'https://www.argenprop.com/venta/departamento-capital-federal',
    render_js: 'true', premium_proxy: 'true', country_code: 'ar', wait: '10000',
  });
  const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(50000) });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Look at elements that have "property" in class, href, or data attributes
  console.log('=== Elements with "propiedad" in href ===');
  $('a[href*="propiedad"], a[href*="inmueble"], a[href*="property"]').slice(0, 5).each((i, el) => {
    const href = $(el).attr('href');
    const parent = $(el).parent();
    const grandparent = parent.parent();
    console.log(`Link: ${href?.slice(0, 80)}`);
    console.log(`  Parent tag: ${parent.prop('tagName')} class: ${(parent.attr('class')||'').slice(0, 60)}`);
    console.log(`  Grandparent tag: ${grandparent.prop('tagName')} class: ${(grandparent.attr('class')||'').slice(0, 60)}`);
  });

  console.log('\n=== Slide-property elements ===');
  const slideEls = $('[class*="slide-property"]');
  console.log('Count:', slideEls.length);
  slideEls.slice(0, 3).each((i, el) => {
    const cls = $(el).attr('class');
    const tag = $(el).prop('tagName');
    console.log(`\n[${i}] <${tag}> class="${cls}"`);
    console.log('  HTML:', $(el).html()?.slice(0, 400));
  });

  console.log('\n=== Container divs with many children ===');
  $('div').each((i, el) => {
    const cls = ($(el).attr('class') || '').split(' ')[0];
    const children = $(el).children().length;
    const hasImg = $(el).find('img').length > 0;
    if (children >= 3 && children <= 50 && hasImg && cls.length > 3) {
      const priceEl = $(el).find('[class*="price"], [class*="Price"], h2, h3');
      const priceText = priceEl.first().text().trim().slice(0, 40);
      if (priceText.includes('USD') || priceText.includes('$')) {
        console.log(`  <div class="${cls}"> children=${children} price="${priceText}"`);
      }
    }
  });
})();
