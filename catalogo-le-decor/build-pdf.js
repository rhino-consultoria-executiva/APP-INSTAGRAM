// Gera o PDF (14 páginas, 1080x1350 px) e uma prévia PNG de cada página.
// Uso: node catalogo-le-decor/build-pdf.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: path.join(dir, 'LE-DECOR-Catalogo-2026.pdf'),
    width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true,
  });

  if (process.argv.includes('--previews')) {
    const out = path.join(dir, 'previews');
    fs.mkdirSync(out, { recursive: true });
    const pages = await page.$$('.page');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: path.join(out, `pagina-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  await browser.close();
})();
