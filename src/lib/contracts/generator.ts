import type { ContractData } from './types'
import { renderContractHtml } from './templates'

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  const html = renderContractHtml(data)

  let browser
  try {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%;font-size:8pt;color:#94a3b8;text-align:center;padding:5px 20px;border-top:1px solid #e2e8f0;">
          <span style="float:left">${data.number}</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          <span style="float:right">${new Date().toLocaleDateString('es-AR')}</span>
        </div>`,
    })
    return Buffer.from(pdf)
  } finally {
    if (browser) await browser.close()
  }
}

export async function generateContractPreview(data: ContractData): Promise<string> {
  const html = renderContractHtml(data)
  return html
}