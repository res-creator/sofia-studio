// node tools/cover.mjs <film> <out.png>   -> 1280x720
import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'); const [,, film, out] = process.argv;
const mime = { '.json': 'application/json', '.ttf': 'font/ttf', '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('pageerror', (e) => console.log('ERR', e.message)); await pg.goto(`http://localhost:${srv.address().port}/flat2d/cover.html?film=${film}`); await pg.waitForFunction(() => window.ready, null, { timeout: 30000 });
const d = await pg.evaluate(() => { const c = document.createElement('canvas'); c.width = 1280; c.height = 720; c.getContext('2d').drawImage(document.getElementById('c'), 0, 0, 1280, 720); return c.toDataURL('image/png'); });
fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await b.close(); srv.close(); console.log('ok', out);
