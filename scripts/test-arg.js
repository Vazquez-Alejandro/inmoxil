const cheerio = require('cheerio');
const API_KEY = 'ZWDG32N1IUJHAK15ROIMSIK8ZYB86YUAQSJ6ZHB3G9FINACGFWL2BK1P6P2ECY5IRAJAPCFYIFE6FL6N';

(async () => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    url: 'https://www.argenprop.com/venta/departamento-capital-federal',
    render_js: 'true', premium_proxy: 'true', country_code: 'ar', wait: '8000',
  });
  const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(60000) });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log('Title:', $('title').text().slice(0, 80));

  // Find all elements with USD or price
  const allText = $('body').text();
  const usdMatches = allText.match(/USD\s*[\d.,]+/g);
  console.log('USD matches:', usdMatches?.slice(0, 5));

  // Check h2, h3
  console.log('H2s:', $('h2').map((i, el) => $(el).text().trim().slice(0, 50)).get().filter(t => t.length > 2).slice(0, 10));
  console.log('H3s:', $('h3').map((i, el) => $(el).text().trim().slice(0, 50)).get().filter(t => t.length > 2).slice(0, 10));
  
  // Find elements with "card" in class
  const cardClasses = [];
  $('[class]').each((i, el) => {
    const cls = $(el).attr('class') || '';
    if (cls.toLowerCase().includes('card') || cls.toLowerCase().includes('listing') || cls.toLowerCase().includes('property') || cls.toLowerCase().includes('aviso')) {
      const count = $('.' + cls.split(' ')[0]).length;
      if (count >= 3 && count <= 100 && !cardClasses.find(c => c[0] === cls.split(' ')[0])) {
        cardClasses.push([cls.split(' ')[0], count]);
      }
    }
  });
  console.log('Card-like classes:', cardClasses.slice(0, 10));

  // Check links
  const propLinks = $('a[href]').filter((i, el) => {
    const h = $(el).attr('href') || '';
    return h.includes('/propiedad') || h.includes('/inmueble');
  }).map((i, el) => ({
    href: $(el).attr('href')?.slice(0, 80),
    text: $(el).text().trim().slice(0, 60),
  })).get();
  console.log('Property links:', propLinks.length, propLinks.slice(0, 3));
})();
