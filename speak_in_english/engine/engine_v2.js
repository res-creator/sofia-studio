// Shared engine bits for v2 episodes: camera spring, shake, render loop
const fs = require('fs'); const { spawn } = require('child_process');
const H = require('./hq');
function simulateCamera(TL, target, opts = {}) {
  const FPS = TL.fps, CAM = [];
  let g0 = target(0); let x = g0.x, y = g0.y, z = g0.z, r = g0.r || 0, vx = 0, vy = 0, vz = 0, vr = 0;
  const dt = 1 / 240, k = opts.k || 160, c = opts.c || 21; let f = 0;
  for (let t = 0; t <= TL.dur + 1; t += dt) {
    const g = target(t);
    if (g.cut) { x = g.x; y = g.y; z = g.z; r = g.r || 0; vx = vy = vz = vr = 0; }
    else { vx += (k * (g.x - x) - c * vx) * dt; vy += (k * (g.y - y) - c * vy) * dt; vz += (k * (g.z - z) - c * vz) * dt; vr += (k * ((g.r || 0) - r) - c * vr) * dt; x += vx * dt; y += vy * dt; z += vz * dt; r += vr * dt; }
    while (f / FPS <= t) { CAM[f] = { x, y, z, r }; f++; }
  }
  LAST = { TL, CAM };
  return CAM;
}
let LAST = null, ASSISTED = false;
// LAYOUT v2 (new episodes): let the camera assist nudge the directed camera before any frame is drawn
function prepare(EPN, renderFrame) { if (ASSISTED || H.LAYOUT !== 'v2' || !LAST) return; ASSISTED = true; require('./camassist')(EPN, LAST.TL, LAST.CAM, renderFrame, H); }
function makeShake(TL, names = ['impact', 'stamp', 'impact_soft', 'clank', 'drop']) {
  const imp = TL.sfx.filter(s => names.includes(s.n)).map(s => ({ t: s.t + 0.02, g: s.n === 'impact_soft' ? 0.4 : s.n === 'clank' ? 0.6 : 1 }));
  return t => { let a = 0; for (const im of imp) { const d = t - im.t; if (d >= 0 && d < 0.5) a += im.g * 20 * Math.exp(-d * 9); } return { x: H.noise1(t * 38) * a, y: H.noise1(t * 41 + 9) * a, r: H.noise1(t * 30 + 3) * a * 0.0015 }; };
}
function run(EPN, NF, renderFrame, W = 1080, Hh = 1920) {
  prepare(EPN, renderFrame);
  const [a0, a1, out] = process.argv.slice(2);
  const canvas = H.createCanvas(W, Hh); const ctx = canvas.getContext('2d');
  if (out.startsWith('--png')) {
    (async () => { for (const fr of out.split('=')[1].split(',').map(Number)) { renderFrame(ctx, fr / 30, canvas); fs.writeFileSync(`preview2/${EPN}_${String(fr).padStart(5, '0')}.png`, await canvas.encode('png')); } })();
    return;
  }
  const start = +a0, end = Math.min(+a1, NF);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${Hh}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  let f = start; const t0 = Date.now();
  (function pump() { while (f < end) { renderFrame(ctx, f / 30, canvas); const buf = Buffer.from(ctx.getImageData(0, 0, W, Hh).data.buffer); f++; if (f % 150 === 0) console.error(`frame ${f}/${end} ${((Date.now() - t0) / 1000).toFixed(0)}s`); if (!ff.stdin.write(buf)) { ff.stdin.once('drain', pump); return; } } ff.stdin.end(); })();
}
module.exports = { simulateCamera, makeShake, run, prepare };
