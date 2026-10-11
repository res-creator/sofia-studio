// Usage: node ep/render.js video <start> <end> <out.mp4>   |   node ep/render.js still <t1,t2,...> <out.png>
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const { TL, lineAt, clamp, ease, lerp } = require('./engine');
const SCN = require('./scenes');
const U = require('../lib/ui');
const W = 1920, H = 1080, FPS = TL.fps;

const order = TL.scenes.map(s => s.id);
const TRANS = { wake: 'flash', getup: 'whip', teeth: 'zoom', shower: 'whip', quiz: 'iris', dress: 'flash', toast: 'whip', coffee: 'zoom', leave: 'whip', recap: 'fade', outro: 'whip' };
const TD = 0.2; // half transition duration

const cA = createCanvas(W, H), xA = cA.getContext('2d');
const cB = createCanvas(W, H), xB = cB.getContext('2d');
const vig = createCanvas(W, H); { const x = vig.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.32)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }

function drawScene(ctx, id, t) { ctx.save(); ctx.fillStyle = '#FFF6E6'; ctx.fillRect(0, 0, W, H); SCN[id].draw(ctx, t); ctx.restore(); }

function sceneAt(t) { let i = 0; for (let j = 0; j < TL.scenes.length; j++) if (t >= TL.scenes[j].t0) i = j; return i; }

function frame(ctx, t) {
  const i = sceneAt(t), S = TL.scenes[i];
  // transition windows: [t0 - TD, t0 + TD] of scene i, or approaching next scene
  let done = false;
  const next = TL.scenes[i + 1];
  const inStart = i > 0 && t < S.t0 + TD, inEnd = next && t > next.t0 - TD;
  if (inStart || inEnd) {
    const a = inStart ? TL.scenes[i - 1] : S, b = inStart ? S : next;
    const type = TRANS[b.id] || 'whip';
    const u = clamp((t - (b.t0 - TD)) / (2 * TD));
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
      ctx.fillStyle = `rgba(255,255,255,${0.7 * Math.sin(u * Math.PI)})`; ctx.fillRect(0, 0, W, H);
    } else if (type === 'iris') {
      ctx.drawImage(cA, 0, 0);
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, ease.inOut(u) * 1150 + 1, 0, 7); ctx.clip(); ctx.drawImage(cB, 0, 0); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, ease.inOut(u) * 1150 + 1, 0, 7); ctx.lineWidth = 18; ctx.strokeStyle = '#3a221d'; ctx.stroke(); ctx.restore();
    } else if (type === 'flash') {
      ctx.drawImage(u < 0.5 ? cA : cB, 0, 0); ctx.fillStyle = `rgba(255,255,255,${Math.sin(u * Math.PI)})`; ctx.fillRect(0, 0, W, H);
    } else { // fade
      ctx.drawImage(cA, 0, 0); ctx.globalAlpha = ease.inOut(u); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1;
    }
    done = true;
  }
  if (!done) drawScene(ctx, S.id, t);
  ctx.drawImage(vig, 0, 0);
  overlays(ctx, t, S);
}

function overlays(ctx, t, S) {
  // progress tracker during the routine scenes
  const sc = SCN[S.id];
  const first = TL.scenes.find(s => s.id === 'wake'), last = TL.scenes.find(s => s.id === 'leave');
  if (t > first.t0 && t < last.t1) {
    let p = sc.progress ?? 0; const cm = S.marks.card;
    if (cm !== undefined && t < cm) p -= 1 / 8;
    if (S.id === 'quiz') p = 4 / 8;
    if (S.id === 'leave' && t < (S.marks.run ?? 0)) p = 7 / 8;
    const a = clamp((t - first.t0) / 0.4) * clamp((last.t1 - t) / 0.4);
    U.progress(ctx, Math.max(0, p), t, a);
  }
  // vocab card
  const cd = TL.cards[S.id];
  if (cd && S.marks.card !== undefined) {
    const k = (t - S.marks.card) / 0.4; const tEnd = (S.marks.turn ?? S.marks.card + 5) + 2.4;
    U.card(ctx, cd, k, (t - tEnd + 0.3) / 0.3, t);
  }
  // your turn
  for (const tr of TL.turns) if (t >= tr.t0 && t < tr.t1) U.yourTurn(ctx, tr.phrase, (t - tr.t0) / (tr.t1 - tr.t0), t);
  // captions (not for recap phrases: the list shows them)
  const L = lineAt(t);
  if (L && !/^r\d/.test(L.id)) U.caption(ctx, L.words, t, 975, L.who);
}

async function video(a, b, out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) process.stderr.write(`[${out}] ${f - f0}/${f1 - f0} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out) {
  const n = ts.length, cols = Math.min(4, n), rows = Math.ceil(n / cols), s = 0.25;
  const sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d');
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s); sx.fillStyle = '#000'; sx.font = '20px sans-serif'; sx.fillText(t.toFixed(1), (i % cols) * W * s + 6, Math.floor(i / cols) * H * s + 22); });
  require('fs').writeFileSync(out, sheet.toBuffer('image/png'));
}
const [mode, A, B, O] = process.argv.slice(2);
if (mode === 'video') video(+A, +B, O);
else if (mode === 'still') stills(A.split(',').map(Number), B);
else if (mode === 'one') { const c = createCanvas(W, H), x = c.getContext('2d'); frame(x, +A); require('fs').writeFileSync(B, c.toBuffer('image/png')); }
