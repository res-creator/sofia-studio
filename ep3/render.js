// Episode 3 renderer (ep2 renderer: bigger captions, phrase cards, 6-step phrase tracker).
// Usage: node ep3/render.js video <start> <end> <out.mp4> | still <t1,t2,...> <out.png> | one <t> <out.png>
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const { TL, lineAt, clamp, ease } = require('./engine');
const SCN = require('./scenes');
const U = require('../lib/ui');
const U2 = require('./ui3');
const W = 1920, H = 1080, FPS = TL.fps;

// scene-to-scene transitions (ep1 style). 'cut' = straight cut (title slam lands on a cut)
const TRANS = require('./trans');

const TD = 0.2;

const cA = createCanvas(W, H), xA = cA.getContext('2d');
const cB = createCanvas(W, H), xB = cB.getContext('2d');
const vig = createCanvas(W, H); { const x = vig.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.32)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }

function drawScene(ctx, id, t) { ctx.save(); ctx.fillStyle = '#FFF6E6'; ctx.fillRect(0, 0, W, H); SCN[id].draw(ctx, t); ctx.restore(); }
function sceneAt(t) { let i = 0; for (let j = 0; j < TL.scenes.length; j++) if (t >= TL.scenes[j].t0) i = j; return i; }

function frame(ctx, t) {
  const i = sceneAt(t), S = TL.scenes[i], next = TL.scenes[i + 1];
  let done = false;
  const inStart = i > 0 && t < S.t0 + TD && TRANS[S.id] !== 'cut', inEnd = next && t > next.t0 - TD && TRANS[next.id] !== 'cut';
  if (inStart || inEnd) {
    const a = inStart ? TL.scenes[i - 1] : S, b = inStart ? S : next;
    const type = TRANS[b.id] || 'whip', u = clamp((t - (b.t0 - TD)) / (2 * TD));
    drawScene(xA, a.id, Math.min(t, a.t1 - 0.001)); drawScene(xB, b.id, Math.max(t, b.t0));
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    if (type === 'whip') {
      const e = ease.inOut(u);
      for (let k = 0; k < 4; k++) { ctx.globalAlpha = k ? 0.25 : 1; ctx.drawImage(cA, -e * W - k * 40 * Math.sin(u * Math.PI), 0); ctx.drawImage(cB, (1 - e) * W - k * 40 * Math.sin(u * Math.PI), 0); }
      ctx.globalAlpha = 1;
      ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(u * Math.PI); ctx.fillStyle = '#fff'; for (let k = 0; k < 14; k++) ctx.fillRect(0, (k * 97) % H, W, 6 + (k % 3) * 4); ctx.restore();
    } else if (type === 'zoom') {
      if (u < 0.5) { const s = 1 + ease.in(u * 2) * 0.6; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.drawImage(cA, -W / 2, -H / 2); ctx.restore(); }
      else { const s = 1.4 - ease.out((u - 0.5) * 2) * 0.4; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.drawImage(cB, -W / 2, -H / 2); ctx.restore(); }
    } else if (type === 'iris') {
      ctx.drawImage(cA, 0, 0);
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, ease.inOut(u) * 1150 + 1, 0, 7); ctx.clip(); ctx.drawImage(cB, 0, 0); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, ease.inOut(u) * 1150 + 1, 0, 7); ctx.lineWidth = 18; ctx.strokeStyle = '#3a221d'; ctx.stroke(); ctx.restore();
    } else { ctx.drawImage(cA, 0, 0); ctx.globalAlpha = ease.inOut(u); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1; }
    done = true;
  }
  if (!done) drawScene(ctx, S.id, t);
  ctx.drawImage(vig, 0, 0);
  overlays(ctx, t, S);
}

const PH = TL.phrases.map(p => { const Ln = TL.lines.find(l => l.id === p.line); const w = Ln.words[Math.min(p.word, Ln.words.length - 1)]; return Object.assign({}, p, { t0: w ? w.t0 : Ln.t0 }); });
function overlays(ctx, t, S) {
  // phrase tracker from the exam room on (4 phrases in the episode)
  const ex = TL.scenes.find(s => s.id === 'checkin'), ou = TL.scenes.find(s => s.id === 'baggage');
  if (ex && t > ex.t0 && (!ou || t < ou.t1)) {
    const done = PH.filter(p => t >= p.t0 + 0.3).length;
    U2.tracker(ctx, done, t, clamp((t - ex.t0) / 0.4) * (ou ? clamp((ou.t1 - t) / 0.4) : 1));
  }
  for (const p of PH) if (t >= p.t0 - 0.01 && t < p.t0 + p.dur + 0.4) U2.phraseCard(ctx, p, (t - p.t0) / 0.35, (t - p.t0 - p.dur) / 0.3, t, p.side);
  for (const tr of TL.turns) if (t >= tr.t0 && t < tr.t1) U.yourTurn(ctx, tr.phrase, (t - tr.t0) / (tr.t1 - tr.t0), t);
  const L = lineAt(t);
  if (L && !/^r\d/.test(L.id) && !TL.turns.some(tr => t >= tr.t0 && t < tr.t1)) U2.caption(ctx, L.words, t, L.who);
}

async function video(a, b, out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS), T0 = Date.now();
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) process.stderr.write(`[${out}] ${f - f0}/${f1 - f0} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out, s = 0.25) {
  const n = ts.length, cols = Math.min(4, n), rows = Math.ceil(n / cols);
  const sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d');
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s); sx.fillStyle = '#000'; sx.fillRect((i % cols) * W * s, Math.floor(i / cols) * H * s, 70, 26); sx.fillStyle = '#fff'; sx.font = '20px sans-serif'; sx.fillText(t.toFixed(1), (i % cols) * W * s + 6, Math.floor(i / cols) * H * s + 20); });
  require('fs').writeFileSync(out, sheet.toBuffer('image/png'));
}
module.exports.frame = frame;
if (require.main === module) {
  const [mode, A, B, O] = process.argv.slice(2);
  if (mode === 'video') video(+A, +B, O);
  else if (mode === 'still') stills(A.split(',').map(Number), B, O ? +O : 0.25);
  else if (mode === 'one') { const c = createCanvas(W, H), x = c.getContext('2d'); frame(x, +A); require('fs').writeFileSync(B, c.toBuffer('image/png')); }
}
