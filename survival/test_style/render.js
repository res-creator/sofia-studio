// Usage: node render.js <A|D> video <out.mp4> | node render.js <A|D> still <t1,t2,..> <out.png>
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const { spawn } = require('child_process');
const R = require('./rig'), SC = require('./scene');
const { W, H, VO, SH } = SC, FPS = 30;
const S = Object.assign({}, R.SKINS[process.argv[2]], { garyVar: process.env.GARY || '20' }), V2 = !!S.v2, T = SC.endT(S);
// captions from the voice alignments (tags like [whispers] removed)
const SPK = { d2b: ['D2', 'A2'].includes(process.argv[2]) ? '#d9c4ff' : '#c9a7ff', d2c: '#ffffff', d2d: '#ffd23f' };
const CH = [];
for (const id of Object.keys(VO)) {
  const a = require(`./vo/${id}.align.json`); let cur = '', ws = 0, we = 0, depth = 0; const words = [];
  a.characters.forEach((c, i) => { if (c === '[') { depth++; return; } if (c === ']') { depth--; return; } if (depth) return;
    if (c === ' ') { if (cur) words.push({ w: cur, t0: VO[id] + ws, t1: VO[id] + we }); cur = ''; return; } if (!cur) ws = a.character_start_times_seconds[i]; cur += c; we = a.character_end_times_seconds[i]; });
  if (cur) words.push({ w: cur, t0: VO[id] + ws, t1: VO[id] + we });
  let g = []; words.forEach((w, i) => { g.push(w); if (/[.!?,]$/.test(w.w) || g.length === 3 || i === words.length - 1) { CH.push(Object.assign(g, { col: SPK[id] })); g = []; } });
}
CH.forEach((c, i) => { c.t0 = c[0].t0 - 0.05; c.t1 = i + 1 < CH.length ? Math.min(CH[i + 1][0].t0 - 0.05, c[c.length - 1].t1 + 0.6) : c[c.length - 1].t1 + 0.6; });
// v2 captions: phrase-sized chunks (merged short sentences), up to two balanced lines, bigger text, kept away from the action
const C2 = [];
for (const id of Object.keys(VO)) {
  const words = CH.filter(c => c.col === SPK[id]).flat(); let sent = [], groups = [];
  words.forEach((w, i) => { sent.push(w); if (/([.!?]|\.\.\.)$/.test(w.w) || i === words.length - 1) { groups.push(sent); sent = []; } });
  const out = []; for (const g of groups) { const last = out[out.length - 1], txt = a => a.map(w => w.w).join(' ');
    if (last && (txt(last) + ' ' + txt(g)).length <= 30) last.push(...g); else out.push([...g]); }
  for (const g of out) C2.push(Object.assign(g, { col: SPK[id] }));
}
C2.forEach((c, i) => { c.t0 = c[0].t0 - 0.05; c.t1 = i + 1 < C2.length ? Math.min(C2[i + 1][0].t0 - 0.05, c[c.length - 1].t1 + 0.7) : c[c.length - 1].t1 + 0.7;
  const L = c.map(w => w.w).join(' ').length; let best = c.length, diff = 1e9;
  if (L > 18) for (let k = 1; k < c.length; k++) { const a = c.slice(0, k).map(w => w.w).join(' ').length, d = Math.abs(a - (L - a - 1)) - (/[.!?,]$/.test(c[k - 1].w) ? 8 : 0); if (d < diff) { diff = d; best = k; } }
  c.lines = best < c.length ? [c.slice(0, best), c.slice(best)] : [c]; });
function captionV2(ctx, t) {
  const c = C2.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const top = t >= SH.s5, n = c.lines.length, lh = 112, size = 100;
  const y0 = top ? 100 : 975 - (n - 1) * lh;
  const pop = Math.min(1, 1.15 - 0.15 * R.clamp((t - c.t0) / 0.12));
  ctx.save(); ctx.font = `${size}px Anton`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  c.lines.forEach((ln, li) => {
    const words = ln.map(w => w.w.toUpperCase()), sp = 26, ws = words.map(w => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = W / 2 - tot / 2;
    words.forEach((w, i) => { const on = t >= ln[i].t0 - 0.03; ctx.save(); ctx.translate(x + ws[i] / 2, y0 + li * lh); ctx.scale(pop, pop); ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5; ctx.lineWidth = 20; ctx.strokeStyle = '#0b0c0f'; ctx.strokeText(w, 0, 0);
      ctx.shadowColor = 'transparent'; ctx.fillStyle = on ? c.col : 'rgba(235,235,235,0.9)'; ctx.fillText(w, 0, 0); ctx.restore(); x += ws[i] + sp; });
  });
  ctx.restore();
}
function caption(ctx, t) {
  if (V2) return captionV2(ctx, t);
  const c = CH.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const words = c.map(w => w.w.toUpperCase());
  ctx.save(); ctx.font = '88px Anton'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const sp = 24, ws = words.map(w => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const k = Math.min(1, 1.25 - 0.25 * R.clamp((t - c.t0) / 0.12)); let x = W / 2 - tot / 2;
  words.forEach((w, i) => { const on = t >= c[i].t0 - 0.03; ctx.save(); ctx.translate(x + ws[i] / 2, 960); ctx.scale(k, k); ctx.textAlign = 'center';
    ctx.lineWidth = 16; ctx.strokeStyle = '#0d0e11'; ctx.strokeText(w, 0, 0); ctx.fillStyle = on ? c.col : 'rgba(210,210,210,0.7)'; ctx.fillText(w, 0, 0); ctx.restore(); x += ws[i] + sp; });
  ctx.restore();
}
const grain = createCanvas(W + 300, H + 200); { const x = grain.getContext('2d'); for (let i = 0; i < 9000; i++) { const h = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }; x.fillStyle = `rgba(255,255,255,${h(i) * 0.04})`; x.fillRect(h(i + 1) * (W + 300), h(i + 2) * (H + 200), 2, 2); } }
function frame(ctx, t) {
  SC.frame(ctx, S, t);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(grain, -(Math.floor(t * 24) % 4) * 41, -(Math.floor(t * 24) % 3) * 29);
  // humour beat at the end
  const lt0 = V2 ? 15.3 : 15.2;
  if (t > lt0 && (!V2 || t < SC.G2.knock)) { const u = R.clamp((t - lt0) / 0.2), k = 1 + (1 - u) * 0.8; ctx.save(); if (V2) ctx.translate(470, 420); else ctx.translate(1500, 130); ctx.rotate(V2 ? -0.05 : 0.05); ctx.scale(k, k); ctx.globalAlpha = u;
    ctx.font = '62px Anton'; const tw = ctx.measureText('HOME SECURITY: MAXIMUM').width + 50; if (V2) { ctx.fillStyle = 'rgba(246,242,228,0.95)'; ctx.fillRect(-tw / 2, -52, tw, 100); } ctx.lineWidth = 9; ctx.strokeStyle = '#3fae63'; ctx.strokeRect(-tw / 2, -52, tw, 100); ctx.fillStyle = '#3fae63'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOME SECURITY: MAXIMUM', 0, 2); ctx.restore(); }
  caption(ctx, t);
  if (t < 0.25) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.25})`; ctx.fillRect(0, 0, W, H); }
  if (t > T - 0.35) { ctx.fillStyle = `rgba(0,0,0,${R.clamp((t - (T - 0.35)) / 0.35)})`; ctx.fillRect(0, 0, W, H); }
}
const mode = process.argv[3];
if (mode === 'still') {
  const ts = process.argv[4].split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sw = 640, sh = 360;
  const out = createCanvas(cols * sw, rows * sh), ox = out.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
  ts.forEach((t, k) => { frame(x, t); ox.drawImage(c, (k % cols) * sw, Math.floor(k / cols) * sh, sw, sh); ox.fillStyle = '#ff0'; ox.font = '22px Nunito'; ox.fillText(t.toFixed(2), (k % cols) * sw + 8, Math.floor(k / cols) * sh + 24); });
  require('fs').writeFileSync(process.argv[5], out.toBuffer('image/png'));
  const qa = [...new Set(R.QA)]; console.log(qa.length ? 'QA:\n' + qa.join('\n') : 'QA ok');
} else if (mode === 'one') {
  const c = createCanvas(W, H), x = c.getContext('2d'); frame(x, +process.argv[4]); require('fs').writeFileSync(process.argv[5], c.toBuffer('image/png'));
} else {
  const c = createCanvas(W, H), x = c.getContext('2d'), N = Math.ceil(T * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', process.argv[4]], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => { for (let f = 0; f < N; f++) { frame(x, f / FPS); const b = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(b.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end();
    const qa = [...new Set(R.QA)]; console.log(qa.length ? 'QA:\n' + qa.slice(0, 20).join('\n') : 'QA ok'); })();
}
