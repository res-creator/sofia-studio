// Mood-style test: "One night on Mars" — quiet ink-and-grain illustration, 1080x1920, 30 fps.
// Usage: node whatif/mars_mood/render.js video A B out.mp4 | still t1,t2,... out.png
require('../../lib/fonts');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
GlobalFonts.registerFromPath(__dirname + '/../../node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff2', 'CaveatL');
const { spawn } = require('child_process');
const fs = require('fs');
const { paint, line, ease, clamp, lerp, hash, noise1 } = require('../../lib/draw');
const { drawDummyFx } = require('../../lib/dummy');
const TL = require('./timeline.json');
const W = 1080, H = 1920, FPS = TL.fps, XF = 0.7; // crossfade length
const INK = '#15181b', CREAM = '#EDE6D6', OCHRE = '#E2A84B';
const LN = Object.fromEntries(TL.lines.map(l => [l.scene, l]));
const k = (t, a, d) => clamp((t - a) / d);
const wordT = (sc, re) => LN[sc].words.find(w => re.test(w.w)).t0;
function talk(t) { for (const L of TL.lines) if (t >= L.t0 && t < L.t1) return clamp((L.env[Math.floor((t - L.t0) * FPS)] || 0)); return 0; }
const ink = (fn, fill, lw = 6) => (ctx) => paint(ctx, fn, fill, { lw, ol: INK });

// ---------------------------------------------------------------- shared pieces
function grad(ctx, stops, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillRect(-200, y0, W + 400, y1 - y0); }
function ridge(ctx, y, amp, seed, fill, lw = 6, x0 = -300, x1 = W + 300) {
  paint(ctx, c => { c.moveTo(x0, H + 50); c.lineTo(x0, y); for (let x = x0; x <= x1; x += 30) c.lineTo(x, y - amp * (0.55 * Math.sin(x / 260 + seed) + 0.3 * Math.sin(x / 97 + seed * 3) + 0.15 * Math.sin(x / 41 + seed * 7))); c.lineTo(x1, H + 50); c.closePath(); }, fill, { lw, ol: INK });
}
function dust(ctx, t, n, col, alpha) {
  ctx.save(); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const x = ((hash(i) * W + t * (20 + hash(i * 3) * 40)) % (W + 100)) - 50, y = hash(i * 7) * H + Math.sin(t * 0.7 + i) * 20; ctx.globalAlpha = alpha * (0.4 + 0.6 * hash(i * 5)); ctx.beginPath(); ctx.arc(x, y, 1.5 + hash(i * 11) * 3, 0, 7); ctx.fill(); }
  ctx.restore();
}
function stars(ctx, n, t, a = 1) { for (let i = 0; i < n; i++) { ctx.globalAlpha = a * (0.35 + 0.65 * hash(i * 9)) * (0.75 + 0.25 * Math.sin(t * 2 + i)); ctx.fillStyle = '#EAF2F2'; ctx.beginPath(); ctx.arc(hash(i) * W, hash(i * 3) * H * 0.62, 0.8 + hash(i * 5) * 2.2, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
function blueSun(ctx, x, y, r) { // Martian sunset: small white sun in a blue halo
  const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 7); g.addColorStop(0, 'rgba(190,225,255,0.95)'); g.addColorStop(0.25, 'rgba(110,160,210,0.55)'); g.addColorStop(1, 'rgba(70,110,150,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#F6FAFF'; ctx.fill();
}
function dummy(ctx, x, y, s, p, tint) { drawDummyFx(ctx, x, y, s, Object.assign({ tint }, p)); }
function sticky(ctx, x, y, rot, text, u) { // hand-written note, like the reference
  if (u <= 0) return; ctx.save(); ctx.globalAlpha = clamp(u * 1.5); ctx.translate(x, y + (1 - ease.out(u)) * 30); ctx.rotate(rot);
  paint(ctx, c => c.rect(-110, -70, 220, 140), '#E7D27A', { lw: 4, ol: INK });
  ctx.font = `600 46px CaveatL`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a3320'; ctx.fillText(text, 0, 2);
  ctx.restore();
}

// ---------------------------------------------------------------- scenes
const S = {};
S.hab = (ctx, t, u) => { // inside the habitat, looking past the dummy at the porthole
  const z = 1 + u * 0.012; ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  grad(ctx, [[0, '#1E2F31'], [1, '#2D4446']]);
  for (let i = -1; i < 7; i++) line(ctx, [[i * 190 + 40, 0], [i * 190 + 80, 1400]], 5, 'rgba(10,15,16,0.55)'); // wall panels
  for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(10,15,16,0.5)'; ctx.beginPath(); ctx.arc((i % 7) * 190 + 60 + Math.floor(i / 7) * 6, 120 + Math.floor(i / 7) * 220, 5, 0, 7); ctx.fill(); }
  // porthole with the dusk landscape
  const cx = 600, cy = 650, R = 330;
  paint(ctx, c => c.arc(cx, cy, R + 46, 0, 7), '#4A5A58', { lw: 8, ol: INK });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  grad(ctx, [[0, '#2A3B4A'], [0.55, '#8C7A64'], [1, '#B98E5E']], cy - R, cy + R);
  blueSun(ctx, cx + 70, cy + 70, 16);
  ridge(ctx, cy + 120, 40, 1, '#8A5A3A', 5); ridge(ctx, cy + 210, 30, 4, '#5E3B28', 5);
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R + 24), cy + Math.sin(a) * (R + 24), 7, 0, 7); ctx.fillStyle = INK; ctx.fill(); }
  // glass glint
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx - 140, cy - 160, 60, 160, 0.7, 0, 7); ctx.fill(); ctx.restore();
  // floor + desk + lamp
  paint(ctx, c => c.rect(-50, 1380, W + 100, 600), '#2A2622', { lw: 8, ol: INK });
  for (let i = 0; i < 9; i++) line(ctx, [[i * 140 - 40, 1380], [i * 180 - 200, 1920]], 4, 'rgba(0,0,0,0.35)');
  paint(ctx, c => c.rect(40, 1150, 420, 30), '#5A4634', { lw: 6, ol: INK });
  for (const x of [70, 420]) paint(ctx, c => c.rect(x, 1180, 22, 260), '#4A3A2C', { lw: 5, ol: INK });
  const lg = ctx.createRadialGradient(170, 1120, 10, 170, 1120, 420); lg.addColorStop(0, 'rgba(255,200,120,0.35)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = lg; ctx.fillRect(-300, 700, 900, 900);
  paint(ctx, c => { c.moveTo(120, 1060); c.lineTo(220, 1060); c.lineTo(190, 1000); c.lineTo(150, 1000); c.closePath(); }, '#C9A36A', { lw: 5, ol: INK });
  line(ctx, [[170, 1060], [170, 1150]], 8, INK);
  paint(ctx, c => c.rect(330, 1100, 60, 50), '#7B8C8A', { lw: 5, ol: INK }); // mug
  // the dummy on a stool, looking up at the window
  paint(ctx, c => c.ellipse(760, 1440, 90, 22, 0, 0, 7), '#3B3028', { lw: 6, ol: INK });
  line(ctx, [[700, 1450], [690, 1640]], 14, INK); line(ctx, [[820, 1450], [830, 1640]], 14, INK);
  dummy(ctx, 760, 1430, 0.95, { legs: 'sit', look: [-0.6, -1], headTilt: -0.12, eyes: 'open', blink: (t % 4.2) < 0.15 ? 1 : 0, mouth: { open: talk(t) * 0.25, smile: 0.1 }, armL: [-60, 40], armR: [60, 40] }, ['#1E3A3E', 0.42]);
};
S.dunes = (ctx, t, u) => {
  const px = -u * 18; ctx.translate(px, 0);
  grad(ctx, [[0, '#1B2A35'], [0.45, '#55606A'], [0.7, '#A98F6E'], [1, '#C79B66']]);
  blueSun(ctx, 360, 980, 20);
  dust(ctx, t, 50, '#E9D6B8', 0.35);
  ridge(ctx, 1080, 60, 2, '#9B6A45'); ridge(ctx, 1250, 90, 5, '#7A4C31'); ridge(ctx, 1480, 70, 8, '#55331F');
  // foreground rock + dummy sitting, small, looking at the sun
  paint(ctx, c => { c.moveTo(640, 1700); c.quadraticCurveTo(700, 1560, 860, 1570); c.quadraticCurveTo(980, 1590, 1000, 1700); c.closePath(); }, '#3E2A1E', { lw: 7, ol: INK });
  dummy(ctx, 820, 1590, 0.62, { legs: 'sit', look: [-1, -0.4], headTilt: -0.08, eyes: 'open', mouth: { smile: 0.15 }, armL: [-40, 40], armR: [60, 30] }, ['#4A2E1E', 0.4]);
  ridge(ctx, 1760, 40, 11, '#2B1C14', 7);
  dust(ctx, t + 10, 30, '#F3E4CC', 0.5);
};
S.night = (ctx, t, u) => {
  const L = LN.night, e = wordT('night', /^Earth/), ev = wordT('night', /^Everyone/);
  const ex = 700, ey = 520;
  const z = 1 + ease.inOut(k(t, ev, 4)) * 0.2; ctx.translate(ex, ey); ctx.scale(z, z); ctx.translate(-ex, -ey);
  grad(ctx, [[0, '#070D14'], [0.6, '#12212A'], [1, '#1D2A2C']]);
  stars(ctx, 220, t);
  // Phobos (lumpy) and Deimos
  paint(ctx, c => { c.moveTo(250, 380); c.bezierCurveTo(280, 330, 360, 335, 375, 375); c.bezierCurveTo(390, 420, 320, 445, 280, 430); c.bezierCurveTo(245, 418, 238, 400, 250, 380); }, '#8E8578', { lw: 5, ol: INK, shade: '#5C554B', sx: 10, sy: 8 });
  paint(ctx, c => c.arc(880, 260, 12, 0, 7), '#A79F92', { lw: 3, ol: INK });
  // Earth: one small blue star
  const g = ctx.createRadialGradient(ex, ey, 1, ex, ey, 40); g.addColorStop(0, 'rgba(170,215,255,0.9)'); g.addColorStop(1, 'rgba(170,215,255,0)'); ctx.fillStyle = g; ctx.fillRect(ex - 40, ey - 40, 80, 80);
  ctx.beginPath(); ctx.arc(ex, ey, 5 + Math.sin(t * 3) * 0.6, 0, 7); ctx.fillStyle = '#DDF0FF'; ctx.fill();
  const a = k(t, e - 0.1, 0.6);
  if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([10, 10]); line(ctx, [[ex - 14, ey + 14], [ex - 110, ey + 120]], 3, CREAM); ctx.restore(); sticky(ctx, ex - 190, ey + 200, -0.06, 'Earth', a); }
  ridge(ctx, 1380, 70, 3, '#1A2426', 7); ridge(ctx, 1560, 60, 9, '#111819', 7);
  dummy(ctx, 330, 1420, 0.5, { legs: 'sit', look: [1, -1], headTilt: 0.15, eyes: 'open', mouth: { smile: 0.05 }, armL: [-50, 40], armR: [50, 40] }, ['#0F2228', 0.62]);
};

// ---------------------------------------------------------------- post: grain + vignette + captions
const GRAIN = [0, 1, 2].map(s => { const c = createCanvas(540, 960), x = c.getContext('2d'), d = x.createImageData(540, 960); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hash(i * 0.37 + s * 999) - 0.5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
const VIG = (() => { const c = createCanvas(W, H), x = c.getContext('2d'); const g = x.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = g; x.fillRect(0, 0, W, H); return c; })();
const CH = []; for (const L of TL.lines) { let cur = []; L.words.forEach((w, i) => { cur.push(w); if (cur.length >= 6 || /[.,!?]$/.test(w.w) && cur.length >= 3 || i === L.words.length - 1) { CH.push({ words: cur, t0: cur[0].t0, t1: (L.words[i + 1] || {}).t0 || L.t1 + 0.6 }); cur = []; } }); }
const KEY = /^(blue|Sun|Earth|star|known|scatters)/i;
function captions(ctx, t) {
  const c = CH.find(c => t >= c.t0 - 0.05 && t < c.t1); if (!c) return;
  ctx.save(); ctx.font = `600 78px CaveatL`; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14;
  let x = 90, y = 1700; const sp = ctx.measureText(' ').width;
  const rows = []; let row = [];
  for (const w of c.words) { const ww = ctx.measureText(w.w).width; if (x + ww > 990) { rows.push(row); row = []; x = 90; } row.push([w, x]); x += ww + sp; }
  rows.push(row); y -= (rows.length - 1) * 84;
  rows.forEach((r, ri) => r.forEach(([w, wx]) => { const a = k(t, w.t0 - 0.05, 0.25); if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = KEY.test(w.w) ? OCHRE : CREAM; ctx.fillText(w.w, wx, y + ri * 84); }));
  ctx.restore();
}
function sceneDraw(ctx, id, t) { const s = TL.scenes.find(x => x.id === id); ctx.save(); S[id](ctx, t, t - s.t0); ctx.restore(); }
const BUF = createCanvas(W, H), BX = BUF.getContext('2d');
function frame(ctx, t) {
  let i = 0; TL.scenes.forEach((s, j) => { if (t >= s.t0) i = j; }); const s = TL.scenes[i], nx = TL.scenes[i + 1];
  sceneDraw(ctx, s.id, t);
  if (nx && t > nx.t0 - XF) { BX.clearRect(0, 0, W, H); sceneDraw(BX, nx.id, t); ctx.globalAlpha = ease.inOut(k(t, nx.t0 - XF, XF)); ctx.drawImage(BUF, 0, 0); ctx.globalAlpha = 1; }
  ctx.drawImage(VIG, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16; ctx.drawImage(GRAIN[Math.floor(t * 12) % 3], 0, 0, W, H); ctx.restore();
  const fi = k(t, 0, 0.8), fo = 1 - k(t, TL.T - 0.8, 0.8); if (fi < 1 || fo < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - Math.min(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
  captions(ctx, t);
}
async function video(a, b, out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = Math.round(a * FPS); f < Math.round(b * FPS); f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out, s = 0.3) {
  const cols = Math.min(5, ts.length), rows = Math.ceil(ts.length / cols), sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d'), c = createCanvas(W, H), ctx = c.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s); });
  fs.writeFileSync(out, sheet.toBuffer('image/png'));
}
if (require.main === module) { const [m, A, B, O] = process.argv.slice(2); if (m === 'video') video(+A, +B, O); else stills(A.split(',').map(Number), B, O ? +O : 0.3); }
