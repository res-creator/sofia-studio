// bandcheck with every time listed, skipping the windows covered by other clips (local time). usage: node tools/bandcheck2.mjs <film>
import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(process.argv[2], { gl: false });
const COVER = [[1.0, 19.89]];
const r = await page.evaluate((COVER) => { const out = {};
  for (let t = 1; t <= window.DUR; t += 0.1) { if (window.SPEED(t) > 4) continue; if (COVER.some(([a, b]) => t > a && t < b)) continue;
    for (const b of window.TEXTS(t)) { if (b.x1 < 0 || b.x0 > 1920 || b.y1 < 0 || b.y0 > 1080) continue;
      const why = b.y1 > 830 ? 'band' : (b.x0 < 0 || b.x1 > 1920 || b.y0 < 0) ? 'cut' : null; if (!why) continue;
      const k = b.text + ' ' + why; (out[k] ||= []).push(+t.toFixed(1)); } }
  return Object.entries(out).map(([k, v]) => k + ': ' + v.join(',')); }, COVER);
console.log(r.join('\n') || 'no text in the band'); await browser.close(); closeServer(); process.exit(0);
