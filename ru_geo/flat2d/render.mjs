// node render.mjs <film> <outdir> <"a-b"|"1,2,3"> [step]   (RESUME=1 пропускает готовые кадры; сервер отдаёт папку ru_geo)
import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [,, film, outdir, spec, step = '1'] = process.argv; fs.mkdirSync(outdir, { recursive: true });
const mime = { '.json': 'application/json', '.ttf': 'font/ttf', '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('pageerror', (e) => console.log('ERR', e.message)); pg.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || t.startsWith('NO SB') || t.startsWith('ERR')) console.log('PAGE', t); });
await pg.goto(`http://localhost:${srv.address().port}/flat2d/index.html?film=${film}&grade=${process.env.GRADE || ''}`); await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 60000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
const total = await pg.evaluate(() => window.TOTAL); const frames = [];
for (const p of spec.split(',')) { if (p === 'all') { for (let f = 0; f < total; f += +step) frames.push(f); } else if (p.includes('-')) { const [a, b2] = p.split('-').map(Number); for (let f = a; f <= b2; f += +step) frames.push(f); } else frames.push(+p); }
const t0 = Date.now(); let done = 0;
for (const f of frames) { const fn = path.join(outdir, `f${String(f).padStart(5, '0')}.jpg`); if (process.env.RESUME && fs.existsSync(fn)) continue; const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.86); }, f); fs.writeFileSync(fn, Buffer.from(d.split(',')[1], 'base64')); done++; }
console.log('done', done, 'frames', ((Date.now() - t0) / 1000 / Math.max(1, done)).toFixed(3), 's/frame; total', total); await b.close(); srv.close();
