// Resumable frame renderer (the container restarts often): renders clip frames [a, b) at FPS into <out>/f_00000.jpg,
// skipping frames already on disk. usage (library root): node <film>/tools/frames.mjs <film> <out> <fps> <a> <b> [query]
import fs from 'fs'; import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const [dir, out, fps, a, b, q = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, { q });
page.setDefaultTimeout(600000);
for (let f = +a; f < +b; f++) {
  const file = path.join(out, `f_${String(f).padStart(5, '0')}.jpg`);
  if (fs.existsSync(file)) continue;
  const t0 = Date.now();
  await page.evaluate(t => { window.render(t); return new Promise(r => requestAnimationFrame(() => r())); }, f / +fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 93, timeout: 600000 });
  fs.writeFileSync(file + '.tmp', buf); fs.renameSync(file + '.tmp', file);
  console.log(f, Date.now() - t0, 'ms');
}
await browser.close(); closeServer(); process.exit(0);
