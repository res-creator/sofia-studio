// Ep 1 renderer. Usage: node render.js video <out.mp4> | still <t1,t2,...> <out.png>
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const L = require('../lib'); const SCN = require('./scenes'); const TL = require('./timeline.json');
const W = 1920, H = 1080, FPS = TL.fps;
// day title cards: from just before "Day N" until the words "Day N." are spoken
const DAYS = [['d1a', 1, 'PANIC'], ['d2a', 2, 'TRUST NO ONE'], ['d3a', 3, 'THE ANIMALS'], ['d4a', 4, 'GO HIGHER'], ['d5a', 5, 'THE BITE']].map(([id, n, sub]) => {
  const l = TL.lines.find(x => x.id === id); return { n, sub, t0: l.t0 - 0.75, t1: l.words[1].t1 + 0.15 };
});
const SPK = { N: '#ffffff', H: '#ffd23f', G: '#c9a7ff', S: '#8fe3c0' };
function chunks() {
  const out = [];
  for (const l of TL.lines) { let cur = []; l.words.forEach((w, i) => { cur.push(w); if (/[.,!?…:]$/.test(w.w) || cur.length === 3 || i === l.words.length - 1) { out.push(Object.assign(cur, { who: l.who })); cur = []; } }); }
  out.forEach((c, i) => { c.t0 = c[0].t0 - 0.05; c.t1 = i + 1 < out.length ? Math.min(out[i + 1][0].t0 - 0.05, c[c.length - 1].t1 + 0.6) : c[c.length - 1].t1 + 0.6; });
  return out;
}
const CH = chunks();
function caption(ctx, t) {
  const c = CH.find(c => t >= c.t0 && t < c.t1); if (!c || DAYS.some(d => c.t0 >= d.t0 && c.t0 < d.t1)) return;
  const words = c.map(w => w.w.replace(/\.\.\.$/, '…').toUpperCase());
  ctx.save(); ctx.font = '96px Anton'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const sp = 26, ws = words.map(w => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const pop = L.ease.back(L.clamp((t - c.t0) / 0.12)); let x = W / 2 - tot / 2 * pop;
  ctx.translate(0, 950);
  words.forEach((w, i) => { const on = t >= c[i].t0 - 0.03; ctx.save(); ctx.translate(x + ws[i] / 2 * pop, on && t < c[i].t0 + 0.1 ? -6 : 0); ctx.scale(pop, pop); ctx.textAlign = 'center';
    ctx.lineWidth = 18; ctx.strokeStyle = '#0d0e11'; ctx.strokeText(w, 0, 0); ctx.fillStyle = on ? SPK[c.who] : 'rgba(200,200,200,0.75)'; ctx.fillText(w, 0, 0); ctx.restore(); x += (ws[i] + sp) * pop; });
  ctx.restore();
}
function dayCard(ctx, t, d) {
  const u = (t - d.t0); ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const k = 1 + Math.max(0, 0.35 - u) * 1.4; ctx.translate(W / 2, 470); ctx.scale(k, k); ctx.rotate(-0.03);
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(-330, -150, 660, 300); ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 10; i++) ctx.fillRect(-330 + i * 66, -150, 2, 300);
  ctx.fillStyle = '#1e2026'; ctx.font = '220px Anton'; ctx.fillText('DAY ' + d.n, 0, 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = L.clamp((u - 0.25) / 0.2); ctx.textAlign = 'center'; ctx.fillStyle = '#e0a530'; ctx.font = '900 52px Nunito'; ctx.fillText(d.sub, W / 2, 720);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i < d.n ? '#e0a530' : 'rgba(239,230,207,0.25)'; ctx.fillRect(W / 2 - 150 + i * 64, 780, 44, 16); } ctx.restore();
}
const vig = createCanvas(W, H); { const x = vig.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
const grain = createCanvas(W + 400, H + 200); { const x = grain.getContext('2d'); for (let i = 0; i < 12000; i++) { x.fillStyle = `rgba(255,255,255,${L.hash(i) * 0.045})`; x.fillRect(L.hash(i + 1) * (W + 400), L.hash(i + 2) * (H + 200), 2, 2); } }
function frame(ctx, t) {
  let i = 0; TL.scenes.forEach((s, j) => { if (t >= s.t0) i = j; });
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); SCN[TL.scenes[i].id].draw(ctx, t); ctx.restore();
  const d = DAYS.find(d => t >= d.t0 && t < d.t1);
  if (d) dayCard(ctx, t, d);
  ctx.drawImage(vig, 0, 0);
  ctx.drawImage(grain, -(Math.floor(t * 24) % 5) * 37, -(Math.floor(t * 24) % 3) * 23);
  if (!d) caption(ctx, t);
  if (t < 0.3) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; ctx.fillRect(0, 0, W, H); }
}
module.exports = { DAYS };
if (require.main === module) {
  const [mode, a, b] = process.argv.slice(2);
  if (mode === 'still') {
    const ts = a.split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sw = 640, sh = 360;
    const out = createCanvas(cols * sw, rows * sh), ox = out.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
    ts.forEach((t, k) => { frame(x, t); ox.drawImage(c, (k % cols) * sw, Math.floor(k / cols) * sh, sw, sh); ox.fillStyle = '#ff0'; ox.font = '22px Nunito'; ox.fillText(t.toFixed(1), (k % cols) * sw + 8, Math.floor(k / cols) * sh + 24); });
    require('fs').writeFileSync(b, out.toBuffer('image/png'));
  } else {
    const c = createCanvas(W, H), x = c.getContext('2d'), N = Math.ceil(TL.T * FPS);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = 0; f < N; f++) { frame(x, f / FPS); const buf = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(buf.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 600 === 0) process.stderr.write(`${f}/${N}\n`); } ff.stdin.end(); })();
  }
}
