// Stills of the film at given LOCAL times: node tools/stills.mjs <film> <outdir> t1 t2 …   (run from the library root)
import fs from 'fs'; import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const [dir, out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, {}); page.setDefaultTimeout(600000);
for (const t of ts) {
  await page.evaluate(t => { window.render(t); return new Promise(r => requestAnimationFrame(() => r())); }, +t);
  fs.writeFileSync(path.join(out, `s_${(+t).toFixed(2)}.jpg`), await page.screenshot({ type: 'jpeg', quality: 85 }));
}
await browser.close(); closeServer(); process.exit(0);
