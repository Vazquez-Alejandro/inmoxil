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
  
  $('div.listing__item a.card').slice(0, 3).each((i, el) => {
    const card = $(el);
    console.log(`=== Card ${i} ===`);
    
    const priceEl = card.find('[class*="price"]').first();
    console.log('Price text:', JSON.stringify(priceEl.text().trim()));
    console.log('Price class:', priceEl.attr('class'));
    
    const titleEl = card.find('h2, h3').first();
    console.log('Title text:', JSON.stringify(titleEl.text().trim()));
    
    const detailsBox = card.find('.card__details-box');
    console.log('Details children:', detailsBox.children().length);
    detailsBox.children().each((j, child) => {
      console.log(`  child ${j}: <${$(child).prop('tagName')} class="${$(child).attr('class')}"> "${$(child).text().trim().slice(0, 60)}"`);
    });
    
    const img = card.find('img').first();
    console.log('Img alt:', img.attr('alt')?.slice(0, 60));
    console.log('Img src:', img.attr('src')?.slice(0, 80));
    
    const link = card.attr('href');
    console.log('Link:', link?.slice(0, 80));
    console.log('');
  });
})();
