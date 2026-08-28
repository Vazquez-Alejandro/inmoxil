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
  
  // Look at the parent of card__details-box
  const firstCard = $('div.card__details-box').first();
  if (firstCard.length) {
    const parent = firstCard.parent();
    console.log('Card parent:', parent.prop('tagName'), (parent.attr('class') || '').slice(0, 80));
    console.log('Grandparent:', parent.parent().prop('tagName'), (parent.parent().attr('class') || '').slice(0, 80));
    console.log('\nFirst card HTML:');
    console.log(parent.html()?.slice(0, 800));
  }
})();
