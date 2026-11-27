// node render.mjs scenes/x.js out.mp4 [fps] [t0 t1]  -> немое видео + events.json рядом
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const [scene, out, fpsS = '30', a0, a1] = process.argv.slice(2); const fps = +fpsS;
const dir = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(dir + '/index.html', 'utf8').replace('SCENE_FILE', scene);
fs.writeFileSync(dir + '/_run.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + dir + '/_run.html'); await p.evaluate(() => window.ready);
const meta = await p.evaluate(() => ({ dur: SCENE.dur, ev: BOARD.events() }));
fs.writeFileSync(out.replace(/\.mp4$/, '.events.json'), JSON.stringify(meta));
const t0 = a0 ? +a0 : 0, t1 = a1 ? +a1 : meta.dur; const N = Math.round((t1 - t0) * fps);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let i = 0; i < N; i++) {
  const t = t0 + i / fps;
  const d = await p.evaluate(t => { BOARD.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, t);
  const buf = Buffer.from(d.split(',')[1], 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log('frame', i, '/', N);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
