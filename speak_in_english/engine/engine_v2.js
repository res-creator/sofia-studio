// Shared engine bits for v2 episodes: camera spring, shake, render loop
const fs = require('fs'); const { spawn } = require('child_process');
const H = require('./hq');
// Camera mode: 'smooth' (spring camera, all episodes made before Oct 22 2026) or 'hard_cut' (new episodes: EP[...]["camera"]).
// env CAMERA overrides it (e.g. CAMERA=smooth for a before/after comparison).
const cameraMode = (TL, opts = {}) => process.env.CAMERA || opts.mode || (TL.cfg && TL.cfg.camera) || 'smooth';
function simulateCamera(TL, target, opts = {}) {
  if (cameraMode(TL, opts) === 'hard_cut') return hardCutCamera(TL, target, opts);
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
// hard_cut: every shot is held perfectly still and replaced instantly (no travel between shots).
// A shot lasts at least minHold s (unless the new target has force: true), so quick back-and-forth lines don't flicker.
// The spring is used only while the director's target says move: true (a rare, deliberate camera move for a gag).
function hardCutCamera(TL, target, opts = {}) {
  const FPS = TL.fps, CAM = [], minHold = opts.minHold ?? 0.5, k = opts.k || 160, c = opts.c || 21, n = Math.ceil((TL.dur + 1) * FPS);
  const same = (a, b) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.z - b.z) < 0.001 && Math.abs((a.r || 0) - (b.r || 0)) < 0.01;
  let shot = target(0), since = 0, cur = { x: shot.x, y: shot.y, z: shot.z, r: shot.r || 0 }, v = { x: 0, y: 0, z: 0, r: 0 };
  for (let f = 0; f <= n; f++) {
    const t = f / FPS, g = target(t);
    if (g.move) { const dt = 1 / (FPS * 8); for (let i = 0; i < 8; i++) for (const q of ['x', 'y', 'z', 'r']) { v[q] += (k * ((g[q] || 0) - cur[q]) - c * v[q]) * dt; cur[q] += v[q] * dt; } shot = g; }
    else if (!same(g, shot) && (t - since >= minHold || g.force || f === 0)) { shot = g; since = t; cur = { x: g.x, y: g.y, z: g.z, r: g.r || 0 }; v = { x: 0, y: 0, z: 0, r: 0 }; }
    CAM[f] = { ...cur, tag: shot.tag };   // tag: the director's label for the shot (e.g. who a single is on), passed to the renderer
  }
  LAST = { TL, CAM };
  return CAM;
}
let LAST = null, ASSISTED = false;
// LAYOUT v2 (new episodes): let the camera assist nudge the directed camera before any frame is drawn
// (landscape projects frame every hard_cut shot by hand and are checked with qa_frames.js; the assist is tuned for the 9:16 frame)
function prepare(EPN, renderFrame) { if (ASSISTED || H.LAYOUT !== 'v2' || !LAST || (LAST.TL.cfg || {}).format === 'landscape') return; ASSISTED = true; require('./camassist')(EPN, LAST.TL, LAST.CAM, renderFrame, H); }
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
module.exports = { simulateCamera, makeShake, run, prepare, cameraMode };
