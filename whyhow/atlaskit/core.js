// atlaskit core: canvas, fonts, palette, easing, text, photos, grade. 1920x1080 documentary look (How It's Run "Field Atlas").
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const NM = path.join(__dirname, '../../node_modules/@fontsource/');
GlobalFonts.registerFromPath(NM + 'anton/files/anton-latin-400-normal.woff2', 'Anton');
GlobalFonts.registerFromPath(NM + 'jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', 'JBMono');
GlobalFonts.registerFromPath(NM + 'jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2', 'JBMonoB');
const IF = '/usr/share/fonts/opentype/inter/';
for (const [f, n] of [['Inter-Regular.otf', 'InterR'], ['Inter-SemiBold.otf', 'InterSB'], ['Inter-Bold.otf', 'InterB'], ['InterDisplay-Black.otf', 'InterBlack']])
  try { GlobalFonts.registerFromPath(IF + f, n); } catch (e) {}
const F = { head: 'Anton, InterBlack', body: 'InterSB', bold: 'InterB', reg: 'InterR', black: 'InterBlack', mono: 'JBMono', monoB: 'JBMonoB' };
const W = 1920, H = 1080, FPS = 30;
const C = {
  navy: '#0B1426', navy2: '#13213B', navy3: '#1C2E50', grid: '#24395F', ice: '#4D8DFF', iceL: '#9CC3FF', frost: '#D6E7FF',
  yellow: '#FFC857', cream: '#F7F5F0', ink: '#171717', red: '#E63946', orange: '#FF8A3D',
  soil: '#7A5538', soilL: '#9C7150', soilD: '#4E3524', perma: '#2F63B5', permaD: '#163764', permaL: '#5C8FDB',
  snow: '#EEF4FB', concrete: '#B9B4AA', concreteD: '#8E897F', wall: '#D9CFC0', wallD: '#B8AC99', window: '#FFD98A',
  land: '#26406B', landL: '#335489', sea: '#0B1426', border: '#4E6E9F',
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
const E = {
  in: u => u * u * u, out: u => 1 - Math.pow(1 - u, 3), inOut: u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  sine: u => 0.5 - 0.5 * Math.cos(Math.PI * u), back: (u, s = 1.6) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2),
};
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// keyframes: [[t,v],[t,v]...] eased (sine) between keys
function key(ks, t, ease = E.inOut) {
  if (!Array.isArray(ks)) return ks;
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1] = ks[i]; return lerp(v0, v1, ease(seg(t, t0, t1))); }
  return ks[ks.length - 1][1];
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function lerpCol(a, b, u) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------- text ----------
function text(ctx, s, x, y, o = {}) {
  const size = o.size || 48; ctx.save();
  ctx.font = `${size}px ${o.font || F.body}`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  if (o.ls) ctx.letterSpacing = o.ls + 'px';
  let sc = 1; if (o.maxW) { const w = ctx.measureText(s).width; if (w > o.maxW) sc = o.maxW / w; }
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = o.shadow; ctx.shadowOffsetY = o.shadow / 4; }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || C.ink; ctx.strokeText(s, 0, 0); ctx.shadowColor = 'transparent'; }
  ctx.fillStyle = o.color || C.cream; ctx.fillText(s, 0, 0); ctx.restore();
  ctx.save(); ctx.font = `${size}px ${o.font || F.body}`; if (o.ls) ctx.letterSpacing = o.ls + 'px'; const w = ctx.measureText(s).width * sc; ctx.restore(); return w;
}
function measure(ctx, s, size, font, ls) { ctx.save(); ctx.font = `${size}px ${font}`; if (ls) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }
// word-wrap into lines of max width
function wrap(ctx, s, size, font, maxW) {
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (measure(ctx, t, size, font) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
// label chip: yellow strip with dark text (key words)
function chip(ctx, s, x, y, o = {}) {
  const size = o.size || 40, pad = size * 0.35, font = o.font || F.head; const w = measure(ctx, s, size, font, o.ls) + pad * 2; const h = size * 1.3;
  const ax = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.fillStyle = o.bg || C.yellow; rr(ctx, ax, y - h * 0.78, w, h, 4); ctx.fill();
  text(ctx, s, ax + pad, y, { size, font, color: o.color || C.ink, ls: o.ls }); ctx.restore(); return w;
}

// ---------- images ----------
const IMG = {};
async function preload(map) { for (const [k, f] of Object.entries(map)) if (!IMG[k]) IMG[k] = await loadImage(f); return IMG; }
// draw image to cover the frame with zoom z (>=1) around focus point fx,fy (0..1 of image)
function cover(ctx, img, z = 1, fx = 0.5, fy = 0.5, box = [0, 0, W, H]) {
  const [bx, by, bw, bh] = box; const s = Math.max(bw / img.width, bh / img.height) * z;
  const dw = img.width * s, dh = img.height * s;
  let x = bx + bw / 2 - fx * dw, y = by + bh / 2 - fy * dh;
  x = Math.min(bx, Math.max(bx + bw - dw, x)); y = Math.min(by, Math.max(by + bh - dh, y));
  ctx.drawImage(img, x, y, dw, dh);
}
// Ken Burns: kb = {z:[z0,z1], x:[fx0,fx1], y:[fy0,fy1]}
function kenBurns(ctx, img, t, d, kb = {}, box) {
  const u = E.sine(clamp(t / Math.max(d, 0.01)));
  const z = kb.z || [1.04, 1.2], x = kb.x || [0.5, 0.5], y = kb.y || [0.5, 0.5];
  cover(ctx, img, lerp(z[0], z[1], u), lerp(x[0], x[1], u), lerp(y[0], y[1], u), box);
}
// ---------- grade ----------
function vignette(ctx, a = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function darken(ctx, a) { ctx.fillStyle = `rgba(6,12,24,${a})`; ctx.fillRect(0, 0, W, H); }
function coldGrade(ctx, a = 0.12) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = hexA('#3D6FD0', a * 2); ctx.fillRect(0, 0, W, H); ctx.restore(); }
// photo credit (bottom-right, small) — CC BY / BY-SA attribution on screen
function credit(ctx, s, alpha = 1) { text(ctx, s, W - 28, H - 24, { size: 17, font: F.reg, color: 'rgba(255,255,255,0.72)', align: 'right', alpha, shadow: 6 }); }
// coordinates tag (series identity)
function coordTag(ctx, s, x = 48, y = H - 44, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = 'rgba(11,20,38,0.72)'; const w = measure(ctx, s, 22, F.monoB) + 54; rr(ctx, x, y - 30, w, 42, 4); ctx.fill();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(x + 20, y - 9, 6, 0, 7); ctx.fill(); text(ctx, s, x + 38, y, { size: 22, font: F.monoB, color: C.cream }); ctx.restore();
}
function navyBg(ctx, t = 0, grid = true) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.navy2); g.addColorStop(1, C.navy); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (grid) { ctx.save(); ctx.strokeStyle = hexA(C.grid, 0.55); ctx.lineWidth = 1; const o = (t * 6) % 80;
    for (let x = -80 + o; x < W + 80; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = -80 + o * 0.5; y < H + 80; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore(); }
  vignette(ctx, 0.5);
}
// drifting snow particles (deterministic)
function snow(ctx, t, n = 90, a = 0.7, wind = 40) {
  ctx.save(); ctx.fillStyle = `rgba(255,255,255,${a})`;
  for (let i = 0; i < n; i++) { const sp = 30 + hash(i) * 70, r = 1 + hash(i + 7) * 2.6;
    const x = ((hash(i + 3) * W + t * wind * (0.5 + hash(i + 9)) + Math.sin(t * 0.8 + i) * 18) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((hash(i + 5) * H + t * sp) % (H + 20)) - 10; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function grain(ctx, t, a = 0.035) {
  ctx.save(); ctx.globalAlpha = a; const f = Math.floor(t * 12);
  for (let i = 0; i < 700; i++) { ctx.fillStyle = hash(i + f * 31) > 0.5 ? '#fff' : '#000'; ctx.fillRect(hash(i * 3 + f) * W, hash(i * 7 + f * 3) * H, 2, 2); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, o = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0), hl = o.head || 18; ctx.save(); ctx.strokeStyle = ctx.fillStyle = o.color || C.yellow; ctx.lineWidth = o.w || 5; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * hl * 0.6, y1 - Math.sin(a) * hl * 0.6); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * hl, y1 - Math.sin(a - 0.45) * hl); ctx.lineTo(x1 - Math.cos(a + 0.45) * hl, y1 - Math.sin(a + 0.45) * hl); ctx.closePath(); ctx.fill(); ctx.restore();
}
function fmtNum(v, dec = 0) { return v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
module.exports = { createCanvas, loadImage, W, H, FPS, C, F, clamp, lerp, seg, E, hash, key, hexA, lerpCol, rr, text, measure, wrap, chip,
  IMG, preload, cover, kenBurns, vignette, darken, coldGrade, credit, coordTag, navyBg, snow, grain, arrow, fmtNum };
