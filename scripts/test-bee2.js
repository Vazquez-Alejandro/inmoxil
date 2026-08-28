const cheerio = require('cheerio');
const API_KEY = process.env.SCRAPINGBEE_API_KEY || '';

(async () => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    url: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html',
    render_js: 'true',
    premium_proxy: 'true',
    country_code: 'ar',
    wait_for: 'h2, h3',
    wait: '8000',
  });
  const res = await fetch('https://app.scrapingbee.com/api/v1/?' + params, { signal: AbortSignal.timeout(60000) });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find the container that holds each property listing
  // Look at the parent of price h2s
  $('h2').slice(0, 3).each((i, el) => {
    const $el = $(el);
    const price = $el.text().trim();
    if (!price.includes('USD') && !price.includes('AR$')) return;
    
    // Walk up to find the card container
    let $parent = $el.parent();
    for (let j = 0; j < 8; j++) {
      const tag = $parent.prop('tagName');
      const cls = ($parent.attr('class') || '').slice(0, 80);
      const childCount = $parent.children().length;
      console.log(`Level ${j}: <${tag}> class="${cls}" children=${childCount}`);
      
      // Check if this looks like a card container (has image + price + link)
      const hasImg = $parent.find('img').length > 0;
      const hasLink = $parent.find('a[href]').length > 0;
      const hasPrice = $parent.find('h2').length > 0;
      
      if (hasImg && hasLink && hasPrice && childCount >= 2) {
        console.log('  >>> FOUND CARD CONTAINER!');
        console.log('  Tag:', tag);
        console.log('  Class:', cls);
        console.log('  HTML preview:', $parent.html()?.slice(0, 500));
        
        // Now extract all properties using this container pattern
        const containerTag = tag;
        const containerClass = cls.split(' ')[0];
        console.log('\nUsing selector:', containerTag + '.' + containerClass);
        const cards = $(containerTag + '.' + containerClass);
        console.log('Total cards found:', cards.length);
        
        cards.slice(0, 2).each((k, card) => {
          const $card = $(card);
          const h2 = $card.find('h2').first().text().trim();
          const h3 = $card.find('h3').first().text().trim();
          const link = $card.find('a[href]').first().attr('href');
          const img = $card.find('img').first().attr('src');
          console.log(`\nCard ${k}:`);
          console.log('  Price:', h2);
          console.log('  Specs:', h3);
          console.log('  Link:', link?.slice(0, 80));
          console.log('  Image:', img?.slice(0, 80));
        });
        return false;
      }
      $parent = $parent.parent();
    }
  });
})();
