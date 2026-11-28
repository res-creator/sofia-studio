// Text that sits in the subtitle band (screen y > 830) or is cut by the frame edge while the camera is (nearly) at rest.
// usage: node tools/bandcheck.mjs <film>
import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(process.argv[2], { gl: false });
const r = await page.evaluate(() => { const out = {};
  for (let t = 1; t <= window.DUR; t += 0.1) { if (window.SPEED(t) > 4) continue;
    for (const b of window.TEXTS(t)) { if (b.x1 < 0 || b.x0 > 1920 || b.y1 < 0 || b.y0 > 1080) continue;
      const why = b.y1 > 830 ? 'band' : (b.x0 < 0 || b.x1 > 1920 || b.y0 < 0) ? 'cut' : null; if (!why) continue;
      const k = (+t.toFixed(0)) + " " + why; (out[k] ||= new Set()).add(b.text); } }
  return Object.entries(out).map(([k, v]) => k + ": " + [...v].join(" | ")); });
console.log(r.join('\n') || 'no text in the band'); await browser.close(); closeServer(); process.exit(0);
