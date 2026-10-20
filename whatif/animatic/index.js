// Jupiter animatic — 6-scene visual style prototype, 1080x1920 @ 30 fps, no voice.
// Usage: node whatif/animatic/index.js video out.mp4 | still t1,t2,... out.png | cues (sound cue list for audio.py)
require('../../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { clamp, ease } = require('../../lib/draw');
const { W, H } = require('./camera');
const SCENES = ['01_approach', '02_fall', '03_turbulence', '04_pressure', '05_heat', '06_reveal'].map(f => require('./scenes/' + f));
// how each scene comes in: cut | white (from a white-out) | fade (cross-dissolve) | flash
const TRANS = { approach: 'cut', fall: 'cut', turbulence: 'white', pressure: 'fade', heat: 'fade', reveal: 'flash' };
const XF = 0.45, FPS = 30;
let acc = 0; const SEQ = SCENES.map(s => { const o = { s, t0: acc }; acc += s.dur; return o; }); const T = acc;

const BUF = createCanvas(W, H), BX = BUF.getContext('2d'), WARP = createCanvas(W, H), WX = WARP.getContext('2d');
function drawScene(ctx, sc, u, t) {
  if (!sc.shimmer) { ctx.save(); sc.draw(ctx, u, t); ctx.restore(); return; }
  WX.save(); sc.draw(WX, u, t); WX.restore(); // heat shimmer: re-draw the frame in thin strips with a sine offset
  const amp = sc.shimmer(u);
  for (let y = 0; y < H; y += 8) ctx.drawImage(WARP, 0, y, W, 8, Math.sin(y / 46 + t * 9) * amp + Math.sin(y / 13 - t * 5) * amp * 0.3, y, W, 8);
}
function frame(ctx, t) {
  let i = 0; SEQ.forEach((q, j) => { if (t >= q.t0) i = j; });
  const { s, t0 } = SEQ[i], u = t - t0, tr = TRANS[s.id];
  if (tr === 'fade' && i > 0 && u < XF) {
    const p = SEQ[i - 1]; drawScene(ctx, p.s, t - p.t0, t);
    BX.clearRect(0, 0, W, H); drawScene(BX, s, u, t); ctx.globalAlpha = ease.inOut(u / XF); ctx.drawImage(BUF, 0, 0); ctx.globalAlpha = 1;
  } else drawScene(ctx, s, u, t);
  if (tr === 'white' && u < 0.35) { ctx.fillStyle = `rgba(251,243,226,${1 - u / 0.35})`; ctx.fillRect(0, 0, W, H); }
  if (tr === 'flash' && u < 0.25) { ctx.fillStyle = `rgba(255,250,235,${0.9 * (1 - u / 0.25)})`; ctx.fillRect(0, 0, W, H); }
  const fo = clamp((T - t) / 0.5); if (fo < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fo})`; ctx.fillRect(0, 0, W, H); }
}
async function video(out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out, sc = 0.25) {
  const cols = Math.min(6, ts.length), rows = Math.ceil(ts.length / cols), sh = createCanvas(W * sc * cols, H * sc * rows), sx = sh.getContext('2d'), c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sx.drawImage(c, (i % cols) * W * sc, Math.floor(i / cols) * H * sc, W * sc, H * sc); });
  fs.writeFileSync(out, sh.toBuffer('image/png'));
}
const cues = () => SEQ.flatMap(({ s, t0 }) => (s.sfx || []).map(([u, n]) => ({ t: +(t0 + u).toFixed(3), n })));
module.exports = { frame, T, SEQ, cues };
if (require.main === module) {
  const [m, a, b] = process.argv.slice(2);
  if (m === 'video') video(a); else if (m === 'still') stills(a.split(',').map(Number), b); else if (m === 'cues') fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ T, cues: cues() }, null, 1));
}
