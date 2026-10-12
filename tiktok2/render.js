// TikTok pilot renderer 1080x1920.  node tiktok2/render.js video 0 T out.mp4 | still t1,t2.. out.png [scale]
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const { TL, clamp, ease } = require('./engine');
const SCN = require('./scenes');
const W = 1080, H = 1920, FPS = TL.fps, TD = 0.18;
const TRANS = { a1: 'cut', b1: 'whip', c2: 'whip', outro: 'fade' };
const cA = createCanvas(W, H), xA = cA.getContext('2d'), cB = createCanvas(W, H), xB = cB.getContext('2d');
function drawScene(ctx, id, t) { ctx.save(); ctx.fillStyle = '#FBE6EC'; ctx.fillRect(0, 0, W, H); SCN[id].draw(ctx, t); ctx.restore(); }
function sceneAt(t) { let i = 0; for (let j = 0; j < TL.scenes.length; j++) if (t >= TL.scenes[j].t0) i = j; return i; }
function frame(ctx, t) {
  const i = sceneAt(t), S = TL.scenes[i], next = TL.scenes[i + 1];
  const inStart = i > 0 && t < S.t0 + TD && TRANS[S.id] !== 'cut', inEnd = next && t > next.t0 - TD && TRANS[next.id] !== 'cut';
  if (inStart || inEnd) {
    const a = inStart ? TL.scenes[i - 1] : S, b = inStart ? S : next, u = clamp((t - (b.t0 - TD)) / (2 * TD)), type = TRANS[b.id] || 'whip';
    drawScene(xA, a.id, Math.min(t, a.t1 - 0.001)); drawScene(xB, b.id, Math.max(t, b.t0)); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    if (type === 'whip') { const e = ease.inOut(u); for (let k = 0; k < 3; k++) { ctx.globalAlpha = k ? 0.25 : 1; ctx.drawImage(cA, 0, -e * H - k * 40 * Math.sin(u * Math.PI)); ctx.drawImage(cB, 0, (1 - e) * H - k * 40 * Math.sin(u * Math.PI)); } ctx.globalAlpha = 1; }
    else { ctx.drawImage(cA, 0, 0); ctx.globalAlpha = ease.inOut(u); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1; }
    return;
  }
  drawScene(ctx, S.id, t);
}
async function video(a, b, out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS), T0 = Date.now();
  for (let f = f0; f < f1; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 150 === 0) process.stderr.write(`${f - f0}/${f1 - f0} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out, s = 0.3) {
  const n = ts.length, cols = Math.min(5, n), rows = Math.ceil(n / cols), sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d'), c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s); sx.fillStyle = '#000'; sx.fillRect((i % cols) * W * s, Math.floor(i / cols) * H * s, 60, 22); sx.fillStyle = '#fff'; sx.font = '18px sans-serif'; sx.fillText(t.toFixed(1), (i % cols) * W * s + 4, Math.floor(i / cols) * H * s + 17); });
  require('fs').writeFileSync(out, sheet.toBuffer('image/png'));
}
const [mode, A, B, O] = process.argv.slice(2);
if (mode === 'video') video(+A, +B, O); else if (mode === 'still') stills(A.split(',').map(Number), B, O ? +O : 0.3);
