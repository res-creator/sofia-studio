// Every 0.1 s: source px per screen px of every print in frame (must stay >= 1). usage: node tools/rescheck.mjs <film>
import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(process.argv[2], { gl: false });
const r = await page.evaluate(() => { const out = {}; for (let t = 0; t <= window.DUR; t += 0.05) for (const q of window.RESCHECK(t)) { if (!out[q.id] || q.ratio < out[q.id].ratio) out[q.id] = { ratio: +q.ratio.toFixed(3), t: +t.toFixed(2) }; } return out; });
console.log(JSON.stringify(r)); let bad = Object.values(r).some(v => v.ratio < 1); console.log(bad ? 'FAIL' : 'ok');
await browser.close(); closeServer(); process.exit(0);
