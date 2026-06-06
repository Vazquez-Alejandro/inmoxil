const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const TEST_URLS = [
  { name: 'ZonaProp', url: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html' },
  { name: 'Argenprop', url: 'https://www.argenprop.com/venta/departamento-capital-federal' },
  { name: 'MercadoLibre', url: 'https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/' },
  { name: 'Zillow', url: 'https://www.zillow.com/for_sale/New-York-NY/' },
  { name: 'Realtor', url: 'https://www.realtor.com/realestateandhomes-for-sale' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  for (const test of TEST_URLS) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
      console.log(`\n--- ${test.name} ---`);
      await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise(r => setTimeout(r, 5000));
      
      const title = await page.title();
      console.log(`Title: ${title.slice(0, 80)}`);
      
      const result = await page.evaluate(() => {
        const selectors = [
          '.card-container', '.posting', '.aviso', 'article[data-id]',
          '[class*="Card"]', '.search-result', '.ui-search-layout__item',
          '.property-card', '.results article', 'li.result',
        ];
        for (const sel of selectors) {
          const els = document.querySelectorAll(sel);
          if (els.length > 0) return { found: true, selector: sel, count: els.length };
        }
        const links = [...document.querySelectorAll('a[href]')].filter(a => {
          const h = a.href.toLowerCase();
          return h.includes('/propiedad') || h.includes('/property') || h.includes('/listing') || h.includes('/imovel');
        });
        if (links.length > 0) return { found: true, selector: 'links', count: links.length };
        return { found: false, selector: 'none', count: 0, bodyLen: document.body.innerHTML.length };
      });
      
      console.log(`Result: ${result.found ? 'OK' : 'BLOCKED'} | Selector: ${result.selector} | Count: ${result.count}`);
    } catch (e) {
      console.log(`ERROR: ${e.message?.slice(0, 100)}`);
    }
    await page.close();
  }
  
  await browser.close();
  console.log('\nDone!');
})();
