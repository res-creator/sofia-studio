// node src/render.mjs still 1.0 4.2 ...   -> out/still_XX.png
// node src/render.mjs video [fps]          -> raw/video.mp4 (frames piped to ffmpeg, no frames on disk)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[err]', e.message));
await page.goto(`http://localhost:${port}/src/index.html`); await page.waitForFunction(() => window.READY).catch(() => {});
await page.evaluate(() => window.READY);
const mode = process.argv[2];
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true }); fs.mkdirSync(path.join(ROOT, 'raw'), { recursive: true });
const shot = () => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
if (mode === 'still') {
  for (const t of process.argv.slice(3)) {
    const t0 = Date.now(); await page.evaluate(t => window.renderAt(+t), t);
    fs.writeFileSync(path.join(ROOT, 'out', `still_${String(t).replace('.', '_')}.png`), await shot()); console.log('still', t, Date.now() - t0, 'ms');
  }
} else {
  const fps = +(process.argv[3] || 30), DUR = await page.evaluate(() => window.SCENE_EVENTS.DUR), N = Math.round(DUR * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-tune', 'grain', '-threads', '1', path.join(ROOT, 'raw', 'video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate(([t, fps]) => window.renderAt(t, fps), [f / fps, fps]);
    const buf = await shot(); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log('frame', f, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', N, 'frames');
}
await browser.close(); srv.close();
