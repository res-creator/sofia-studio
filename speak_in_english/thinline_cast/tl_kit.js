// Line-art caricature style (thin even outline, flat colors, paper grain, translucent speech bubble).
// Detailed own character: psychologist «Ирина Павловна». Voice: fish.audio (free model).
// node linestyle/render.js [stills t1,t2]  -> linestyle/out/psiholog.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, D = __dirname;
const F = path.join(D, '..', '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-900-normal.woff2', 'NC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-900-normal.woff2', 'NL');
let g; function setG(x) { g = x; } function setShaded(s) { SHADED = s; }

const C = {
  ink: '#1e1a1a', bg: '#e6d2f5', chair: '#2f8a7c', chairD: '#236c61',
  skin: '#f8d7bb', cheek: '#f6ad9c', nose: '#f2a39a', lipT: '#b8325f', lipB: '#d84a75',
  hairA: '#a79fd6', hairB: '#d9d3f2', shadow: '#9d6fe0', brow: '#7b6a9a',
  cardigan: '#f0b532', blouse: '#fffaf2', pearl: '#fff8ee', gold: '#d8a12a',
  table: '#d9a36d', tableD: '#b9814c', tissueBox: '#8fd0f0', note: '#fffdf6', glass: 'rgba(200,235,255,0.55)',
};
const LW = 4.5;
C.chairD = '#236c61';

// ---------- paper grain ----------
const PAPER = (() => { const c = createCanvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); let s = 3;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < im.data.length; i += 4) { const v = 150 + (r() - .5) * 120; im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v; im.data[i + 3] = 14; }
  x.putImageData(im, 0, 0); x.strokeStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 2500; i++) { const px = r() * W, py = r() * H, a = r() * 6.28, l = 4 + r() * 14; x.lineWidth = .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c; })();

// ---------- smooth shapes (Catmull-Rom through points) ----------
function crPath(pts, closed = true, tension = 0.5, begin = true) {
  const n = pts.length, P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  if (begin) g.beginPath(); g.moveTo(...pts[0]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3, p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  if (closed) g.closePath();
}
// cel shading: light from the window (upper-left) -> soft shadow crescent bottom-right, light rim top-left
let SHADED = new Set();
function shadeOver(pts) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [px, py] of pts) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  const k = Math.min(1, Math.min(x1 - x0, y1 - y0) / 140), ox = 22 * k, oy = 16 * k; if (k < .15) return;
  g.save(); crPath(pts); g.clip();
  g.beginPath(); g.rect(-6000, -6000, 14000, 14000); g.translate(-ox, -oy); crPath(pts, true, .5, false); g.translate(ox, oy); g.fillStyle = 'rgba(86,34,110,0.19)'; g.fill('evenodd');
  g.beginPath(); g.rect(-6000, -6000, 14000, 14000); g.translate(ox * .45, oy * .45); crPath(pts, true, .5, false); g.translate(-ox * .45, -oy * .45); g.fillStyle = 'rgba(255,250,235,0.20)'; g.fill('evenodd');
  g.restore();
}
function shape(pts, fill, lw = LW, closed = true) { crPath(pts, closed); if (fill && closed) { g.fillStyle = fill; g.fill(); if (SHADED.has(fill)) { shadeOver(pts); crPath(pts, closed); } } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const line = (pts, lw = LW) => shape(pts, null, lw, false);
function oval(x, y, rx, ry, fill, lw = LW, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); } }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };

// ---------- set ----------
function chair() {
  shape([[250, 1560], [235, 1120], [300, 960], [540, 920], [780, 960], [845, 1120], [830, 1560]], C.chair);
  line([[300, 1000], [540, 965], [780, 1000]], 3);
}
function table(st) {
  shape([[-20, 1560], [1100, 1560], [1100, 1960], [-20, 1960]], C.table);
  line([[-20, 1600], [1100, 1600]], 3);
  // glass of water
  shape([[150, 1440], [240, 1440], [232, 1580], [158, 1580]], C.glass);
  shape([[156, 1500], [234, 1500], [232, 1580], [158, 1580]], 'rgba(120,190,240,0.45)', 0);
  oval(195, 1440, 45, 11, 'rgba(230,245,255,0.8)', 3);
  // tissue box (pushed forward in the last shot)
  const tx = 760 - (st.push || 0) * 220, ty = 1470 + (st.push || 0) * 30;
  shape([[tx - 120, ty], [tx + 120, ty], [tx + 120, ty + 110], [tx - 120, ty + 110]], C.tissueBox);
  oval(tx, ty + 6, 60, 12, '#5aa9d6', 3);
  shape([[tx - 34, ty + 4], [tx - 40, ty - 60], [tx - 4, ty - 40], [tx + 20, ty - 80], [tx + 36, ty + 4]], '#ffffff', 3.5);
  for (const k of [-70, 0, 70]) oval(tx + k, ty + 60, 14, 14, '#ffffff', 0);
}

// ---------- palette for the detailed character ----------
Object.assign(C, {skin: '#fbd6b8', skinL: '#ffe4cc', cheek: '#f4a596', nose: '#f39c94', lip: '#e2303f', lipD: '#b81f30', mouthIn: '#6b1b25', tongue: '#ff7d86',
  hairP: '#5a2150', hairM: '#cf4a86', brow: '#5a2150', shadow: '#8f5be0', dress: '#f3b51e', dot: '#fff3c9', shawl: '#178a85', shawlD: '#0f6762',
  bead: '#ff7a59', gold: '#e6a922', nail: '#e2303f', note: '#fffdf6', pen: '#3b3bd6'});

// tube outline (arm) as point loop
function tubePts(path_, w0, w1) {
  const P = [], n = 24; // sample quadratic-ish path through points
  for (let i = 0; i <= n; i++) { const u = i / n, seg = u * (path_.length - 1), k = Math.min(path_.length - 2, Math.floor(seg)), f = seg - k; const a = path_[k], b = path_[k + 1]; P.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
  for (let it = 0; it < 3; it++) for (let i = 1; i < P.length - 1; i++) P[i] = [(P[i - 1][0] + 2 * P[i][0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * P[i][1] + P[i + 1][1]) / 4];
  const L = [], R = [];
  P.forEach((q, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * i / (P.length - 1)) / 2;
    L.push([q[0] - dy / l * w, q[1] + dx / l * w]); R.push([q[0] + dy / l * w, q[1] - dx / l * w]); });
  return L.filter((_, i) => i % 3 === 0 || i === L.length - 1).concat(R.reverse().filter((_, i) => i % 3 === 0 || i === R.length - 1));
}

// detailed hand: fingers point along +x in local space. mode: 'hold' (fist around an object) | 'open'
function hand(x, y, ang, mode, flip = 1, obj = null, ring = true) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(1, flip);
  shape([[-74, -36], [-24, -50], [26, -44], [42, -8], [38, 34], [0, 50], [-50, 44], [-80, 8]], C.skin, 4);
  line([[-40, 10], [-10, 22], [16, 18]], 2.5); // palm crease
  if (obj) obj();
  if (mode === 'hold') {
    for (let i = 0; i < 4; i++) {
      const fy = -32 + i * 23, len = 72 - i * 7 - (i === 3 ? 6 : 0);
      shape([[-4, fy - 11], [len - 12, fy - 12], [len, fy], [len - 12, fy + 12], [-4, fy + 11]], C.skin, 4);
      oval(len - 10, fy, 6, 7.5, C.nail, 2);
      line([[len * 0.45, fy - 7], [len * 0.45 + 3, fy + 7]], 2);
      if (ring && i === 2) { g.fillStyle = C.gold; g.fillRect(len * 0.22, fy - 11, 9, 22); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(len * 0.22, fy - 11, 9, 22); }
    }
    shape([[-34, -44], [8, -66], [38, -64], [46, -50], [16, -40], [-18, -28]], C.skin, 4); oval(38, -58, 6, 7, C.nail, 2);
  } else {
    const fa = [-0.42, -0.14, 0.12, 0.38], fl = [62, 74, 70, 56];
    for (let i = 0; i < 4; i++) { g.save(); g.translate(30, -24 + i * 16); g.rotate(fa[i] * .6);
      shape([[-6, -11], [fl[i] - 11, -11], [fl[i], 0], [fl[i] - 11, 11], [-6, 11]], C.skin, 4); oval(fl[i] - 9, 0, 6, 7, C.nail, 2); line([[fl[i] * .5, -7], [fl[i] * .5 + 2, 7]], 2);
      if (ring && i === 2) { g.fillStyle = C.gold; g.fillRect(fl[i] * .2, -11, 9, 22); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(fl[i] * .2, -11, 9, 22); }
      g.restore(); }
    shape([[-30, -40], [4, -74], [30, -84], [40, -72], [16, -46], [-10, -26]], C.skin, 4); oval(32, -76, 6, 7, C.nail, 2, -1);
  }
  g.restore();
}

// ---------- Ирина Павловна — rig v5: poses (stand/sit), waddle walk, two-arm gestures, cel shading ----------
// extra st: full, sit 0..1, walk 0..1, phase, armA/armB/armK (pose blend), noteOnLap
const ARMS = {
  notebook: (x, y, wn, pen, gest) => ({L: {e: [x - 300, y + 520], h: [x - 215, y + 470], mode: 'hold', ang: -0.15, flip: 1},
    R: {e: [x + 302, y + 520 - pen * 20], h: [x + 30 + pen * 145 + wn[0], y + 470 - pen * 118 + wn[1] - gest * pen], mode: 'hold', ang: Math.PI + 0.35 - pen * 0.4, flip: -1}}),
  hips: (x, y) => ({L: {e: [x - 410, y + 480], h: [x - 300, y + 648], mode: 'hold', ang: 0.95, flip: 1}, R: {e: [x + 410, y + 480], h: [x + 300, y + 648], mode: 'hold', ang: Math.PI - 0.95, flip: -1}}),
  spread: (x, y) => ({L: {e: [x - 360, y + 520], h: [x - 470, y + 420], mode: 'open', ang: Math.PI + 0.5, flip: -1}, R: {e: [x + 360, y + 520], h: [x + 470, y + 420], mode: 'open', ang: -0.5, flip: 1}}),
  point: (x, y) => ({L: {e: [x - 410, y + 480], h: [x - 300, y + 648], mode: 'hold', ang: 0.95, flip: 1}, R: {e: [x + 352, y + 480], h: [x + 450, y + 560], mode: 'hold', ang: 0.35, flip: -1}}),
  armrest: (x, y) => ({L: {e: [x - 330, y + 560], h: [x - 320, y + 700], mode: 'open', ang: 1.75, flip: 1}, R: {e: [x + 330, y + 560], h: [x + 320, y + 700], mode: 'open', ang: 1.39, flip: -1}}),
};
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
module.exports = { W, H, FPS, C, LW, PAPER, setG, setShaded, get g() { return g; }, crPath, shadeOver, shape, line, oval, tubePts, hand, ARMS, clamp, ease, lerp2, createCanvas };
