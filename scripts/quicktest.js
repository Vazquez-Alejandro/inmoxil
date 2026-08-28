const cheerio = require('cheerio');
const API_KEY = process.env.SCRAPINGBEE_API_KEY || '';

async function test(url, name) {
  console.log('---', name, '---');
  try {
    const params = new URLSearchParams({
      api_key: API_KEY, url, render_js: 'true', premium_proxy: 'true', country_code: 'ar', wait: '10000',
    });
    const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(50000) });
    console.log('Status:', res.status);
    if (!res.ok) { console.log('Error:', (await res.text()).slice(0, 300)); return; }
    const html = await res.text();
    console.log('HTML:', html.length);
    const $ = cheerio.load(html);
    console.log('Title:', $('title').text().slice(0, 80));
    
    // Count elements that look like cards
    const allDivs = $('div').length;
    const allAs = $('a').length;
    console.log('Divs:', allDivs, 'Links:', allAs);
    
    // Sample text
    const body = $('body').text().replace(/\s+/g, ' ').slice(0, 400);
    console.log('Body preview:', body);
  } catch(e) { console.log('ERR:', e.message?.slice(0, 150)); }
}

(async () => {
  await test('https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html', 'ZonaProp');
})();
