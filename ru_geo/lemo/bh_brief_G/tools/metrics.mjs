// Per-character advance widths (at 1000 px) of the marker font and the tag font, for layout in _gen_film.py.
// usage: node tools/metrics.mjs <film>   → scenes/metrics.json
import path from 'path'; import fs from 'fs';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(process.argv[2], { gl: false });
const r = await page.evaluate(() => {
  const chars = [...(Array.from({ length: 64 }, (_, i) => String.fromCharCode(0x410 + i)).join('') + 'Ёё' + Array.from({ length: 94 }, (_, i) => String.fromCharCode(0x21 + i)).join('') + ' ·×÷–—−≈→←↑↓«»“”„°²³½…№')];
  const x = document.createElement('canvas').getContext('2d'); const out = {};
  for (const [k, f] of [['marker', '400 1000px "Pangolin"'], ['tag', '700 1000px "Fira Sans Condensed"'], ['stamp', '900 1000px "Fira Sans Condensed"']]) {
    x.font = f; out[k] = {}; for (const c of chars) out[k][c] = x.measureText(c).width; }
  return out; });
fs.writeFileSync(path.join(process.argv[2], 'scenes/metrics.json'), JSON.stringify(r)); console.log('ok');
await browser.close(); closeServer(); process.exit(0);
