const cheerio = require('cheerio');
const API_KEY = 'ZWDG32N1IUJHAK15ROIMSIK8ZYB86YUAQSJ6ZHB3G9FINACGFWL2BK1P6P2ECY5IRAJAPCFYIFE6FL6N';

(async () => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    url: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html',
    render_js: 'true',
    premium_proxy: 'true',
    country_code: 'ar',
    wait_for: 'div[class*="aviso"], div[class*="card"], div[class*="Card"], article',
    wait: '8000',
  });
  console.log('Fetching with wait...');
  const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(60000) });
  console.log('Status:', res.status);
  const html = await res.text();
  console.log('HTML length:', html.length);
  const $ = cheerio.load(html);
  console.log('Title:', $('title').text().slice(0, 80));

  // Search for price patterns
  const bodyText = $('body').text();
  const priceMatches = bodyText.match(/\$[\s]*[0-9.,]+/g);
  console.log('Price matches:', priceMatches?.slice(0, 5));

  // Look for specific patterns
  const h2s = $('h2').map((i, el) => $(el).text().trim().slice(0, 80)).get();
  console.log('H2 count:', h2s.length, 'samples:', h2s.slice(0, 3));
  
  const h3s = $('h3').map((i, el) => $(el).text().trim().slice(0, 80)).get();
  console.log('H3 count:', h3s.length, 'samples:', h3s.slice(0, 3));

  // Dump some of the HTML structure
  const divs = $('div').length;
  console.log('Total divs:', divs);
  
  // Check for images that look like property photos
  const imgs = $('img[src*="httpbin"], img[src*="zona"], img[src*="photos"]').length;
  console.log('Property-like images:', imgs);
})();
