// Usage: node render.js video <out.mp4> | still <t1,t2,...> <out.png>
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const L = require('./lib'); const SCN = require('./scenes'); const TL = require('./timeline.json');
const W = 1920, H = 1080, FPS = TL.fps, TD = 0.18;
const CUTS = { deck: 'cut', door: 'fade', end: 'fade' };
const CH = L.chunks(TL.lines);
const cA = createCanvas(W, H), xA = cA.getContext('2d'), cB = createCanvas(W, H), xB = cB.getContext('2d');
const vig = createCanvas(W, H); { const x = vig.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
const grain = createCanvas(W, H); { const x = grain.getContext('2d'); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${L.hash(i) * 0.05})`; x.fillRect(L.hash(i + 1) * W, L.hash(i + 2) * H, 2, 2); } }
function draw(ctx, id, t) { ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); SCN[id].draw(ctx, t); ctx.restore(); }
function frame(ctx, t) {
  let i = 0; TL.scenes.forEach((s, j) => { if (t >= s.t0) i = j; });
  const S = TL.scenes[i], next = TL.scenes[i + 1];
  if (next && t > next.t0 - TD && CUTS[next.id] !== 'cut') { draw(xA, S.id, t); draw(xB, next.id, Math.max(t, next.t0)); ctx.drawImage(cA, 0, 0); ctx.globalAlpha = L.clamp((t - next.t0 + TD) / TD); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1; }
  else draw(ctx, S.id, t);
  ctx.drawImage(vig, 0, 0);
  ctx.save(); ctx.translate((Math.floor(t * 24) % 5) * 37, (Math.floor(t * 24) % 3) * 23); ctx.drawImage(grain, -200, -100); ctx.restore();
  if (t < 0.4) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; ctx.fillRect(0, 0, W, H); }
  L.caption(ctx, CH, t, W, 940);
}
const [mode, a, b] = process.argv.slice(2);
if (mode === 'still') {
  const ts = a.split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sw = 640, sh = 360;
  const out = createCanvas(cols * sw, rows * sh), ox = out.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
  ts.forEach((t, k) => { frame(x, t); ox.drawImage(c, (k % cols) * sw, Math.floor(k / cols) * sh, sw, sh); ox.fillStyle = '#fff'; ox.font = '20px Nunito'; ox.fillText(t.toFixed(1), (k % cols) * sw + 8, Math.floor(k / cols) * sh + 24); });
  require('fs').writeFileSync(b, out.toBuffer('image/png'));
} else {
  const c = createCanvas(W, H), x = c.getContext('2d'), N = Math.ceil(TL.T * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => { for (let f = 0; f < N; f++) { frame(x, f / FPS); const buf = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(buf.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${N}\n`); } ff.stdin.end(); })();
}
