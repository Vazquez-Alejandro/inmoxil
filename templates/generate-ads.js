const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const AD_DIR = __dirname
const OUT_DIR = path.join(__dirname, '..', 'assets', 'ads')

const ads = [
  { file: 'feed-cuadrado.html', out: '01-feed-cuadrado-1080x1080.png', w: 1080, h: 1080 },
  { file: 'story-1.html', out: '02-story-vertical-1080x1920-01.png', w: 1080, h: 1920 },
  { file: 'story-2.html', out: '03-story-vertical-1080x1920-02.png', w: 1080, h: 1920 },
  { file: 'story-3.html', out: '04-story-vertical-1080x1920-03.png', w: 1080, h: 1920 },
  { file: 'reel-cover.html', out: '05-reel-cover-1080x1920.png', w: 1080, h: 1920 },
  { file: 'meta-ad.html', out: '06-meta-ad-1080x1080.png', w: 1080, h: 1080 },
]

;(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  for (const ad of ads) {
    const page = await browser.newPage()
    await page.setViewport({ width: ad.w, height: ad.h, deviceScaleFactor: 1 })

    const htmlPath = path.join(AD_DIR, ad.file)
    const html = fs.readFileSync(htmlPath, 'utf8')
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const outPath = path.join(OUT_DIR, ad.out)
    await page.screenshot({ path: outPath, type: 'png' })
    console.log(`✅ ${ad.out}`)
    await page.close()
  }

  await browser.close()
  console.log('\n🚀 6 ads generados en assets/ads/')
})()
