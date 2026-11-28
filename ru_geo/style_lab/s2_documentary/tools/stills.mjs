// stills at given times: node tools/stills.mjs <dir> <outdir> t1,t2,...
import fs from 'fs'; import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const [dir, out, ts] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, {});
page.setDefaultTimeout(600000);
for (const t of ts.split(',').map(Number)) {
  const t0 = Date.now();
  await page.evaluate(t => { window.render(t); return new Promise(r => requestAnimationFrame(() => r())); }, t);
  fs.writeFileSync(path.join(out, `s_${t.toFixed(2)}.jpg`), await page.screenshot({ type: 'jpeg', quality: 92 }));
  console.log(t, Date.now() - t0, 'ms');
}
await browser.close(); closeServer(); process.exit(0);
