// node tools/check.mjs <a> <b> [step]: ink in the bottom 250 px (must be 0), and texts cut by the frame edge
import { openDemo, closeServer } from '/root/lemo-opuscar/core/render/page.mjs';   // run from /root/lemo-opuscar
const [a, b, st] = process.argv.slice(2).map(Number);
const { browser, page } = await openDemo('/home/user/sofia-studio/ru_geo/lemo/bh_marker', {});
for (let t = a; t <= b + 1e-9; t += st || .2) {
  const r = await page.evaluate(t => { const n = window.LOWINK(t); const cut = window.TEXTS(t).filter(x => !(x.x1 < 0 || x.x0 > 1920 || x.y1 < 0 || x.y0 > 1080) && (x.x0 < -2 || x.x1 > 1922 || x.y0 < -2 || x.y1 > 1082)).map(x => x.text); return { n, cut }; }, t);
  if (r.n > 0 || r.cut.length) console.log(t.toFixed(2), 'low', r.n, 'cut', r.cut.join(' | '));
}
await browser.close(); closeServer();
