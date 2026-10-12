// Render SVG/HTML files with Chromium. Usage:
//   node render.mjs png <in.svg|html> <out.png> <widthPx> <heightPx> [scale]
//   node render.mjs pdf <in.svg|html> <out.pdf> <widthMm> <heightMm>
import { chromium } from 'playwright';
import path from 'node:path';
const [mode, input, out, w, h, scale = '1'] = process.argv.slice(2);
const browser = await chromium.launch();
const url = 'file://' + path.resolve(input);
if (mode === 'png') {
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: false });
} else {
  const page = await browser.newPage();
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, width: w + 'mm', height: h + 'mm', printBackground: true,
                   margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
}
await browser.close();
