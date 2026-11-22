// node render.mjs <outdir> <"a-b" | "1,2,3"> [step] [quality]; WEB=<папка web>
import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const [,, outdir, spec, step = '1', qual = '0.94'] = process.argv; fs.mkdirSync(outdir, { recursive: true });
const frames = []; for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const root = process.env.WEB || path.join(path.dirname(fileURLToPath(import.meta.url)), 'web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', (m) => { const t = m.text(); if (!t.includes('GPU stall') && !t.includes('404')) console.log('PAGE', t); }); pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
const t0 = Date.now();
for (const f of frames) {
  if (process.env.RESUME && fs.existsSync(path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`))) continue;
  const d = await pg.evaluate(([f, q]) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, +qual]);
  fs.writeFileSync(path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
}
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
