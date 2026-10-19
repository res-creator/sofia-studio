// Full pilot renderer. node render.js video out.mp4 [from to] | still t1,t2,... out.png | qa [from to]
// No burned-in captions (subtitles ship as out/pilot_full.srt).
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const L = require('./lib'), TL = require('./timeline.json');
const SCN = Object.assign({}, require('./scenes_pilot').S, require('./scenes_b'), require('./scenes_c'), require('./scenes_d'));
const W = 1920, H = 1080, FPS = TL.fps, TD = 0.2;
const CUTS = new Set(['deck', 'door', 'mess', 'run', 'radio', 'engine', 'crawler', 'bridge']);   // hard cuts; the rest cross-fade
const cA = createCanvas(W, H), xA = cA.getContext('2d'), cB = createCanvas(W, H), xB = cB.getContext('2d');
const vig = createCanvas(W, H); { const x = vig.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
const grain = createCanvas(W, H); { const x = grain.getContext('2d'); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${L.hash(i) * 0.05})`; x.fillRect(L.hash(i + 1) * W, L.hash(i + 2) * H, 2, 2); } }
function draw(ctx, id, t) { ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); if (!SCN[id]) throw new Error('no scene ' + id); SCN[id].draw(ctx, t); ctx.restore(); }
function frame(ctx, t) {
  let i = 0; TL.scenes.forEach((s, j) => { if (t >= s.t0) i = j; });
  const S = TL.scenes[i], next = TL.scenes[i + 1];
  if (next && t > next.t0 - TD && !CUTS.has(next.id)) { draw(xA, S.id, t); draw(xB, next.id, Math.max(t, next.t0)); ctx.drawImage(cA, 0, 0); ctx.globalAlpha = L.clamp((t - next.t0 + TD) / TD); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1; }
  else draw(ctx, S.id, t);
  ctx.drawImage(vig, 0, 0);
  ctx.save(); ctx.translate((Math.floor(t * 24) % 5) * 37, (Math.floor(t * 24) % 3) * 23); ctx.drawImage(grain, -200, -100); ctx.restore();
  if (t < 0.4) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; ctx.fillRect(0, 0, W, H); }
}
const [mode, a, b, c] = process.argv.slice(2);
const span = (x, y) => { const f = s => isNaN(+s) ? TL.scenes.find(q => q.id === s) : null; const A = x == null ? 0 : f(x) ? f(x).t0 : +x, Bt = y == null ? (x != null && f(x) ? f(x).t1 : TL.T) : f(y) ? f(y).t1 : +y; return [A, Bt]; };
if (mode === 'still') {   // times may be "scene:+sec" relative to a scene start
  const ts = a.split(',').map(s => s.includes(':') ? TL.scenes.find(q => q.id === s.split(':')[0]).t0 + +s.split(':')[1] : +s), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sw = 640, sh = 360;
  const out = createCanvas(cols * sw, rows * sh), ox = out.getContext('2d'), cv = createCanvas(W, H), x = cv.getContext('2d');
  ts.forEach((t, k) => { frame(x, t); ox.drawImage(cv, (k % cols) * sw, Math.floor(k / cols) * sh, sw, sh); ox.fillStyle = '#ff0'; ox.font = '22px Nunito'; ox.fillText(a.split(',')[k], (k % cols) * sw + 8, Math.floor(k / cols) * sh + 24); });
  require('fs').writeFileSync(b, out.toBuffer('image/png')); console.log([...new Set(L.QA)].join('\n') || 'QA ok');
} else if (mode === 'qa') {
  const [A, Bt] = span(a, b), x = createCanvas(W, H).getContext('2d'); let n = 0;
  for (let f = Math.round(A * FPS); f < Math.round(Bt * FPS); f += (+process.env.STEP || 3)) { frame(x, f / FPS); const add = L.QA.slice(n); n = L.QA.length; if (add.length) console.log((f / FPS).toFixed(2), [...new Set(add)].join(' | ')); }
} else {
  const [A, Bt] = span(b, c), cv = createCanvas(W, H), x = cv.getContext('2d'), F0 = Math.round(A * FPS), N = Math.round(Bt * FPS) - F0;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => { for (let f = 0; f < N; f++) { frame(x, (F0 + f) / FPS); const buf = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(buf.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 600 === 0) process.stderr.write(`${a} ${f}/${N}\n`); } ff.stdin.end(); })();
  ff.on('close', () => console.log(a, 'frames', N, [...new Set(L.QA)].length ? 'QA: ' + [...new Set(L.QA)].join(' | ') : 'QA ok'));
}
