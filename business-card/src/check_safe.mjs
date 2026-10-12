// Verify every text/logo element sits inside the 4 mm safe zone (trim coords).
import { chromium } from 'playwright'; import path from 'node:path';
const b = await chromium.launch(); const p = await b.newPage();
for (const side of ['front', 'back']) {
  await p.goto('file://' + path.resolve(`artwork/flowwtech-card-${side}-bleed.svg`));
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => [...document.querySelectorAll('#card > text, #card > g:not([id^=motif])')].map(e => {
    const bb = e.getBBox(); const m = e.getCTM(); const card = document.getElementById('card').getCTM();
    const s = m.a / card.a; // relative scale
    const x = (m.e - card.e) / card.a + bb.x * s, y = (m.f - card.f) / card.d + bb.y * s;
    return { el: e.id || e.textContent.slice(0, 22), x0: +x.toFixed(2), y0: +y.toFixed(2), x1: +(x + bb.width * s).toFixed(2), y1: +(y + bb.height * s).toFixed(2), txt: e.tagName === 'text' ? e.textContent : null };
  }));
  for (const e of r) { const ok = e.x0 >= 4 && e.y0 >= 4 && e.x1 <= 86 && e.y1 <= 50; console.log(side, ok ? 'OK ' : 'OUT', JSON.stringify(e)); }
}
await b.close();
