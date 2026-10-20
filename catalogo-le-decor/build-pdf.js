// Gera o PDF (1080x1350 px) e um HTML único com as fotos embutidas, a partir de index.html.
// Uso: node catalogo-le-decor/build-pdf.js [--previews]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const dir = __dirname;
const NAME = 'LE-DECOR-Catalogo-2026';

// HTML autônomo: troca "fotos/arquivo" pelo conteúdo da imagem em base64
function standalone() {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  return html.replace(/src="(fotos\/[^"]+)"/g, (_, rel) => {
    const ext = path.extname(rel).slice(1).replace('jpg', 'jpeg');
    const b64 = fs.readFileSync(path.join(dir, rel)).toString('base64');
    return `src="data:image/${ext};base64,${b64}"`;
  });
}

(async () => {
  fs.writeFileSync(path.join(dir, `${NAME}.html`), standalone());

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
  await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: path.join(dir, `${NAME}.pdf`),
    width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true,
  });

  if (process.argv.includes('--previews')) {
    const out = path.join(dir, 'previews');
    fs.mkdirSync(out, { recursive: true });
    await page.emulateMedia({ media: 'print' });
    const pages = await page.$$('.page');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: path.join(out, `pagina-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  await browser.close();
})();
