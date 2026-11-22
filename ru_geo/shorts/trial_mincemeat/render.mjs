// node render.mjs <outdir> <"a-b" | "1,2,3"> [step]
import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));
const [,, outdir, spec, step = '1'] = process.argv; fs.mkdirSync(outdir, { recursive: true });
const frames = []; for (const p of spec.split(',')) { if (p.includes('-')) { const [a, b] = p.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+p); }
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/page.html')); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.json') ? 'application/json' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/`); await pg.waitForFunction(() => window.ready, null, { timeout: 60000 });
for (const f of frames) { const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, f); fs.writeFileSync(path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64')); }
console.log('done', frames.length); await b.close(); srv.close();
