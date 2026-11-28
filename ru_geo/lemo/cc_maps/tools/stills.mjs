// Quick stills at given clip times: node tools/stills.mjs <clip> <outdir> <t1,t2,...> [query]   (run from the library root)
import fs from 'fs'; import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const [dir, out, ts, q = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, { q });
page.setDefaultTimeout(600000);
for (const t of ts.split(',').map(Number)) {
  const t0 = Date.now();
  const tx = await page.evaluate(t => { const r = window.TEXTS(t); return new Promise(res => requestAnimationFrame(() => res(r))); }, t);
  fs.writeFileSync(path.join(out, `s_${t.toFixed(2)}.jpg`), await page.screenshot({ type: 'jpeg', quality: 90, timeout: 600000 }));
  console.log(t, Date.now() - t0, 'ms', JSON.stringify(tx.map(o => [o.text, Math.round(o.x0), Math.round(o.y0), Math.round(o.x1), Math.round(o.y1)])));
}
await browser.close(); closeServer(); process.exit(0);
