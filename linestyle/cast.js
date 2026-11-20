// Line-art caricature style (thin even outline, flat colors, paper grain, translucent speech bubble).
// Detailed own character: psychologist «Ирина Павловна». Voice: fish.audio (free model).
// node linestyle/render.js [stills t1,t2]  -> linestyle/out/psiholog.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, D = __dirname;
const F = path.join(D, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-900-normal.woff2', 'NC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-900-normal.woff2', 'NL');
let g;

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
function irina(st) {
  const x = 540, y = 1000, T = st.time, talk = st.talk || 0, mo = st.mo || {open: 0, width: 1, round: 0, smile: 0, press: 0, bite: 0};
  const sm = Math.max(st.smile || 0, mo.smile * 0.6), op = mo.open;
  const breath = Math.sin(T * 1.25), sit = st.sit || 0, wk = st.walk || 0, ph = st.phase || 0;
  // waddle: pelvis rocks, torso counter-rotates and shifts over the stance leg, body bobs on each contact
  const hipRot = wk * 0.075 * Math.sin(ph), torsoRot = -wk * 0.03 * Math.sin(ph), lat = wk * 12 * Math.sin(ph), bob = -wk * 9 * Math.abs(Math.cos(ph));
  const upDy = sit * 200 + breath * 1.6 + bob;
  const rot = 0.02 * Math.sin(T * 0.8) + (st.tilt || 0) + talk * 0.012 * Math.sin(T * 2.1 + 1) - (st.nod || 0) * 0.01 + wk * 0.02 * Math.sin(ph);
  const nodY = (st.nod || 0) * 7 + breath * 1.2;
  const piv = [x, y + 175];
  const upper = (fn) => { g.save(); g.translate(lat, upDy); g.translate(x, y + 640); g.rotate(torsoRot); g.translate(-x, -(y + 640)); fn(); g.restore(); };
  const head = (fn) => upper(() => { g.save(); g.translate(piv[0], piv[1] + nodY); g.rotate(rot); g.translate(-piv[0], -piv[1]); fn(); g.restore(); });
  const sway = (pts, k = 1) => pts.map(([px, py]) => { const w = clamp((py - (y - 60)) / 220); return [px + w * k * (4 * Math.sin(T * 1.1 + .6) - rot * 140 - torsoRot * 120), py]; });

  head(() => shape(sway([[x - 205, y + 160], [x - 236, y + 30], [x - 240, y - 90], [x - 205, y - 195], [x - 120, y - 262], [x, y - 284], [x + 128, y - 262], [x + 214, y - 192], [x + 244, y - 80], [x + 240, y + 40], [x + 214, y + 162], [x + 150, y + 182], [x - 150, y + 180]]), C.hairP));

  // ---- lower body: legs + skirt (rocks with the pelvis) ----
  if (st.full) {
    for (const s of [-1, 1]) {
      const lp = ph + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(lp)) * 30 * wk, fx = Math.cos(lp) * 18 * wk, idle = Math.sin(T * 0.7) * 4 * (1 - wk) * (1 - sit);
      const hip = lerp2([x + s * 92, y + 1000], [x + s * 100, y + 1190], sit), knee = lerp2([x + s * 104 + fx * .6 + idle, y + 1190 - lift * .45], [x + s * 128, y + 1222], sit);
      const foot = lerp2([x + s * 86 + fx + idle, y + 1342 - lift], [x + s * 112, y + 1342], sit);
      shape(tubePts([hip, knee, foot], 128, 64), C.skin);
      if (sit > .5) oval(knee[0], knee[1] - 4, 70, 46 * sit, C.skin);
      line([[knee[0] - s * 30, knee[1] - 50 + sit * 40], [knee[0] - s * 20, knee[1] - 20 + sit * 40]], 2.5);
      const fy = foot[1];
      shape([[foot[0] - s * 36, fy - 6], [foot[0] + s * 36, fy - 12], [foot[0] + s * 64, fy + 20], [foot[0] + s * 54, fy + 42], [foot[0] - s * 46, fy + 44], [foot[0] - s * 50, fy + 14]], '#d8304a');
      line([[foot[0] - s * 28, fy + 2], [foot[0] + s * 34, fy - 2]], 3);
    }
    g.save(); g.translate(lat * .4, bob * .5); g.translate(x, y + 760 + sit * 200); g.rotate(hipRot); g.translate(-x, -(y + 760 + sit * 200));
    const hem = y + 1060 + sit * 110, wv = Math.sin(ph) * 14 * wk;
    const skirt = [[x - 300 - sit * 30 + wv, hem], [x - 330, y + 840 + sit * 150], [x - 300, y + 640], [x + 300, y + 640], [x + 330, y + 840 + sit * 150], [x + 300 + sit * 30 + wv, hem], [x + 150 + wv, hem + 22], [x + wv * .5, hem + 8], [x - 150 + wv, hem + 24]];
    shape(skirt, C.dress);
    g.save(); crPath(skirt); g.clip(); g.fillStyle = C.dot; for (let i = 0; i < 18; i++) for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(x - 340 + i * 42 + (k % 2) * 21, y + 620 + k * 40, 6, 0, 7); g.fill(); } g.restore();
    shadeOver(skirt); crPath(skirt); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke();
    line([[x + 170, y + 650], [x + 200, y + 860], [x + 230 + wv, hem + 6]], 3.5);
    line([[x + 60, y + 660], [x + 110, y + 900], [x + 100 + wv, hem + 4]], 2.5); line([[x - 90, y + 680], [x - 120 + wv, hem + 10]], 2.5);
    g.restore();
  }

  // ---- upper body (moves with sit / bob / lateral weight shift) ----
  upper(() => {
    shape([[x - 84, y + 100], [x + 84, y + 100], [x + 96, y + 196], [x + 222, y + 214], [x + 256, y + 320], [x + 60, y + 455], [x, y + 475], [x - 60, y + 455], [x - 256, y + 320], [x - 222, y + 214], [x - 96, y + 196]], C.skin);
    // soft shadow under the chin on the neck
    g.save(); crPath([[x - 84, y + 100], [x + 84, y + 100], [x + 96, y + 196], [x - 96, y + 196]]); g.clip(); oval(x + 10, y + 120, 120, 60, 'rgba(190,100,90,0.28)', 0); g.restore();
    g.strokeStyle = 'rgba(214,140,110,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 150, y + 252); g.quadraticCurveTo(x + s * 110, y + 262, x + s * 82, y + 258); g.stroke(); }
    const top = [[x - 292, y + 330], [x - 238, y + 272], [x - 60, y + 438], [x, y + 482], [x + 60, y + 438], [x + 238, y + 272], [x + 292, y + 330]];
    const bodice = st.full ? [[x - 300, y + 660], ...top, [x + 300, y + 660]] : [[x - 305, 1620], ...top, [x + 305, 1620]];
    shape(bodice, C.dress);
    g.save(); crPath(bodice); g.clip(); g.fillStyle = C.dot; for (let i = 0; i < 18; i++) for (let k = 0; k < 22; k++) { g.beginPath(); g.arc(x - 340 + i * 42 + (k % 2) * 21, y + 280 + k * 40, 6, 0, 7); g.fill(); } g.restore();
    shadeOver(bodice); crPath(bodice); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke();
    line([[x - 238, y + 272], [x + 40, y + 520], [x + 170, y + 640]], 3.5);
    if (st.full) { shape([[x - 302, y + 628], [x + 302, y + 622], [x + 300, y + 668], [x - 300, y + 674]], '#c9461c', 3.5); // sash
      shape([[x + 150, y + 640], [x + 196, y + 690], [x + 186, y + 780], [x + 160, y + 700]], '#c9461c', 3); shape([[x + 170, y + 642], [x + 232, y + 700], [x + 236, y + 760], [x + 196, y + 690]], '#c9461c', 3); }
    line([[x - 2, y + 418], [x + 2, y + 470]], 3);
    line([[x - 255, y + 420], [x - 200, y + 525], [x - 105, y + 548], [x - 14, y + 505]], 3.5);
    line([[x + 255, y + 420], [x + 200, y + 525], [x + 105, y + 548], [x + 14, y + 505]], 3.5);
    for (let i = 0; i <= 11; i++) { const u = i / 11, px = x - 150 + u * 300, py = y + 238 + Math.sin(u * Math.PI) * 92 + Math.sin(T * 1.25 + u) * 1.5; oval(px, py, 17, 17, C.bead, 3.5); oval(px - 5, py - 5, 4, 4, 'rgba(255,255,255,0.8)', 0); oval(px + 4, py + 6, 9, 6, 'rgba(150,40,20,0.25)', 0); }
  });

  head(() => {
    // face: only the chin region follows the jaw, softly (stays a closed outline, nothing floats outside it)
    const D = op * 16;
    const F = [[-186, -60, 0], [-160, -150, 0], [-80, -192, 0], [80, -192, 0], [160, -150, 0], [186, -60, 0], [184, 40, .05], [148, 124, .35], [70, 176, .8], [0, 186, 1], [-70, 176, .8], [-148, 124, .35], [-184, 40, .05]];
    shape(F.map(([dx, dy, w]) => [x + dx * (1 - w * op * .05), y + dy + w * D]), C.skin);
    // cheeks lift with smile and with wide vowels
    const ch = sm * 12 + mo.width * 2 - 2;
    oval(x - 115, y + 78 - ch, 54, 44 - sm * 4, C.cheek, 0); oval(x + 115, y + 78 - ch, 54, 44 - sm * 4, C.cheek, 0);
    // eyes: upper lid + lower lid are the eye shape itself (lashes ride on the upper lid, lower lid rises with smile)
    const br = (st.browUp || 0), lidBase = st.lid || 0, bl = st.blink || 0;
    for (const s of [-1, 1]) {
      const ex = x + s * 76, ey = y + 6;
      const lowY = ey + 21 - sm * 13;                          // lower lid (squints up when smiling)
      let topY = ey - 21 + 40 * lidBase + sm * 4;               // upper lid
      topY = topY + (lowY - 3 - topY) * bl;                     // blink closes onto the lower lid
      const up = (k) => [[ex - 44, ey + 1], [ex - 15, topY], [ex + 17, topY], [ex + 44, ey + 2]][k];
      const eyePath = () => { g.beginPath(); g.moveTo(ex - 44, ey + 1); g.bezierCurveTo(ex - 28, topY - 2, ex + 28, topY - 2, ex + 44, ey + 2); g.bezierCurveTo(ex + 26, lowY + 2, ex - 26, lowY + 2, ex - 44, ey + 1); g.closePath(); };
      { const bt = Math.min(topY - 15, ey - 34 + (topY - (ey - 21)) * .9) - br * .3; shape([[ex - 54, ey - 2], [ex - 22, bt], [ex + 24, bt], [ex + 56, ey - 2], [ex + 26, topY - 2], [ex - 22, topY - 2]], C.shadow, 3.5); }
      if (lowY - topY > 4) {
        eyePath(); g.fillStyle = '#fff'; g.fill();
        g.save(); eyePath(); g.clip(); oval(ex + (st.look || 0) * 10, ey + 3, 23, 23, C.ink, 0); oval(ex + (st.look || 0) * 10 + 8, ey - 5, 6, 6, '#fff', 0); g.restore();
        g.beginPath(); g.moveTo(ex - 44, ey + 1); g.bezierCurveTo(ex - 26, lowY + 2, ex + 26, lowY + 2, ex + 44, ey + 2); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.stroke();
      }
      g.beginPath(); g.moveTo(ex - 46, ey + 1); g.bezierCurveTo(ex - 28, topY - 2, ex + 28, topY - 2, ex + 46, ey + 2); g.strokeStyle = C.ink; g.lineWidth = 5.5; g.lineCap = 'round'; g.stroke();
      for (let k = 0; k < 6; k++) { const u = (k + .5) / 6, lx = ex - 40 + u * 80, ly = ey + 1 + (topY - 2 - ey) * Math.sin(u * Math.PI) * .98; line([[lx, ly - 1], [lx + s * 3 + (u - .5) * 6, ly - 9 - Math.sin(u * Math.PI) * 3]], 2); }
      for (const k of [-24, -10, 6]) { const u = (k + 44) / 88, ly = ey + 1 + (lowY + 2 - ey) * Math.sin(u * Math.PI) * .98; line([[ex + k, ly + 4], [ex + k - 3, ly + 12]], 2); }
      const bY = -br - sm * 4 + (st.frown || 0) * (s * 0 + 6);
      shape([[ex - 52, ey - 72 + bY], [ex - 10, ey - 90 + bY], [ex + 42, ey - 80 + bY + (st.frown || 0) * 8], [ex + 46, ey - 66 + bY + (st.frown || 0) * 8], [ex - 8, ey - 74 + bY], [ex - 50, ey - 58 + bY]].map(([px, py]) => [s > 0 ? 2 * ex - px : px, py]), C.brow, 3);
    }
    shape([[x - 8, y + 22], [x + 8, y + 22], [x + 15 + sm * 2, y + 72], [x, y + 80 - sm * 2], [x - 15 - sm * 2, y + 72]], C.nose, 0);
    for (const s of [-1, 1]) line([[x + s * (62 + sm * 10 + mo.width * 2), y + 84 - sm * 4], [x + s * (76 + sm * 12 + (mo.width - 1) * 10), y + 112 + D * .3], [x + s * (72 + sm * 10 + (mo.width - 1) * 8), y + 136 + D * .55]], 3);
    oval(x + 64 + sm * 6, y + 104 - sm * 3, 5, 5, C.ink, 0);
    // mouth from viseme params
    const my = y + 124, Dm = op * 30, w = 44 * mo.width + sm * 14, rnd = mo.round, pr = mo.press;
    const cy = my + 2 + Dm * .28 - sm * 10 + rnd * 4;           // corners
    const upT = my - 14 - op * 3 - rnd * 3 + pr * 3;             // top of upper lip (lifts a little when speaking)
    const upB = my + 3 - op * 2;                                 // bottom edge of upper lip
    const loT = my + 4 + Dm, loB = my + 26 + Dm + rnd * 4 - pr * 6 - mo.bite * 8;
    const upper = [[x - w, cy], [x - w * .5, upT], [x, upT + 6 - rnd * 2], [x + w * .5, upT], [x + w, cy], [x + w * .45, upB], [x, upB + 1], [x - w * .45, upB]];
    if (Dm > 3) {
      const inner = [[x - w + 4 + rnd * 8, cy], [x - w * .45, upB], [x, upB + 1], [x + w * .45, upB], [x + w - 4 - rnd * 8, cy], [x + w * .45, loT], [x, loT + 2], [x - w * .45, loT]];
      shape(inner, C.mouthIn, 3);
      g.save(); crPath(inner); g.clip(); g.fillStyle = '#fff'; g.fillRect(x - w, upB - 2, w * 2, Math.min(11, Dm * .4) * (1 - rnd * .6)); oval(x, loT + 4, w * .42, Dm * .32 + 2, C.tongue, 0); g.restore();
    }
    if (mo.bite > .3) { g.fillStyle = '#fff'; g.fillRect(x - w * .5, upB - 1, w, 8); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x - w * .5, upB - 1, w, 8); }
    shape(upper, C.lip, 3.5);
    shape([[x - w + 2, cy + 1], [x - w * .45, loT], [x, loT + 2], [x + w * .45, loT], [x + w - 2, cy + 1], [x + w * .4, loB], [x, loB + 3], [x - w * .4, loB]], C.lip, 3.5);
    if (Dm <= 3) line([[x - w, cy], [x - w * .4, upB + 1], [x, upB + 2], [x + w * .4, upB + 1], [x + w, cy]], 3);
    if (sm > .3) for (const s of [-1, 1]) line([[x + s * (w + 9), cy - 9], [x + s * (w + 3), cy + 3]], 2.5);
    // earrings
    for (const s of [-1, 1]) {
      const ex = x + s * 206, ey = y + 150, a = 0.22 * Math.sin(T * 2.6 + s) * (0.3 + talk * .7) - rot * 2.5;
      g.save(); g.translate(ex, ey); g.rotate(a); oval(0, 0, 13, 13, C.gold, 3.5); shape([[0, 12], [14, 42], [0, 58], [-14, 42]], C.gold, 3.5); g.restore();
    }
    // front hair
    const left = sway([[x - 72, y - 262], [x - 160, y - 236], [x - 216, y - 150], [x - 226, y - 30], [x - 214, y + 92], [x - 192, y + 156], [x - 166, y + 116], [x - 172, y - 20], [x - 152, y - 120], [x - 98, y - 190]]);
    const right = sway([[x - 72, y - 262], [x + 60, y - 272], [x + 182, y - 216], [x + 236, y - 100], [x + 234, y + 40], [x + 212, y + 158], [x + 172, y + 128], [x + 178, y + 0], [x + 160, y - 82], [x + 92, y - 152], [x - 10, y - 172], [x - 60, y - 196]]);
    shape(left, C.hairP); shape(right, C.hairP);
    shape(sway([[x - 44, y - 246], [x + 62, y - 256], [x + 156, y - 204], [x + 198, y - 112], [x + 186, y - 30], [x + 158, y - 96], [x + 76, y - 168], [x - 20, y - 206]]), C.hairM);
    for (const p of [[[x - 60, y - 252], [x + 40, y - 240], [x + 150, y - 190], [x + 205, y - 70], [x + 208, y + 70], [x + 192, y + 140]],
      [[x - 50, y - 232], [x + 30, y - 212], [x + 118, y - 156], [x + 160, y - 60]], [[x + 20, y - 200], [x + 110, y - 180], [x + 176, y - 110]],
      [[x - 84, y - 248], [x - 165, y - 205], [x - 202, y - 100], [x - 204, y + 50], [x - 188, y + 130]], [[x - 96, y - 226], [x - 150, y - 180], [x - 176, y - 60]]]) line(sway(p), 2.6);
  });

  // ---- arms (pose blend), shawl, notebook, hands ----
  upper(() => {
    const pen = st.pen || 0, wn = st.writing ? [5 * Math.sin(st.t * 2.3) + 3 * Math.sin(st.t * 3.7 + 1), 3 * Math.sin(st.t * 2.9 + .5)] : [0, 0];
    const gest = (st.nod || 0) * 14 + talk * 4 * Math.sin(T * 1.9);
    const A = ARMS[st.armA || 'notebook'](x, y, wn, pen, gest), B = ARMS[st.armB || st.armA || 'notebook'](x, y, wn, pen, gest), k = st.armK ?? 1;
    const arm = {};
    for (const side of ['L', 'R']) {
      const a = A[side], b = B[side], kk = ease(k);
      const e = lerp2(a.e, b.e, kk), h = lerp2(a.h, b.h, kk);
      if (talk && (st.armB === 'spread' || st.armB === 'hips')) { h[1] += gest * .6 * (side === 'L' ? 1 : -1) * .3; }
      arm[side] = {e, h, ang: a.ang + (b.ang - a.ang) * kk, mode: kk < .5 ? a.mode : b.mode, flip: kk < .5 ? a.flip : b.flip};
      const sh = [x + (side === 'L' ? -255 : 255), y + 320], d = Math.hypot(e[0] - h[0], e[1] - h[1]) || 1, wr = [h[0] + (e[0] - h[0]) / d * 40, h[1] + (e[1] - h[1]) / d * 40];
      const pts = tubePts([sh, e, wr], 112, 80); shape(pts, C.skin);
      line([[e[0] + (side === 'L' ? 6 : -6), e[1] - 12], [e[0] + (side === 'L' ? 20 : -20), e[1] + 4]], 2.5);
    }
    for (const s of [-1, 1]) {
      shape([[x + s * 320, y + 290], [x + s * 252, y + 236], [x + s * 190, y + 262], [x + s * 240, y + 380], [x + s * 300, y + 470], [x + s * 352, y + 500]], C.shawl);
      line([[x + s * 240, y + 270], [x + s * 280, y + 380]], 2.5); line([[x + s * 280, y + 280], [x + s * 320, y + 420]], 2.5);
      for (let q = 0; q < 6; q++) line([[x + s * (300 + q * 9), y + 470 + q * 5], [x + s * (296 + q * 9) + Math.sin(T * 1.7 + q) * 2, y + 500 + q * 5]], 2.5);
    }
    const dom = ease(k) < .5 ? (st.armA || 'notebook') : (st.armB || st.armA || 'notebook');
    if (dom === 'notebook') {
      g.save(); g.translate(x - 110, y + 470); g.rotate(-0.05);
      shape([[-140, -100], [120, -100], [118, 100], [-142, 100]], C.note);
      for (let q = 0; q < 8; q++) oval(-120 + q * 32, -100, 8, 13, null, 3);
      for (let q = 0; q < 5; q++) line([[-110, -55 + q * 30], [100, -55 + q * 30]], 2);
      line([[-80, 70], [-40, 58], [-10, 74], [30 + wn[0] * .5, 60 + wn[1]]], 2.5);
      g.restore();
    }
    const penObj = () => { shape([[16, -140], [30, -140], [30, 60], [23, 80], [16, 60]], C.pen, 3); oval(23, -140, 8, 6, '#e8e8f2', 2.5); };
    hand(arm.L.h[0], arm.L.h[1], arm.L.ang, arm.L.mode, arm.L.flip, null, true);
    hand(arm.R.h[0], arm.R.h[1], arm.R.ang, arm.R.mode, arm.R.flip, arm.R.mode === 'hold' ? penObj : null, false);
  });
}

// ---------- full-body set: depth (back -> front), window light, contact shadows ----------
function contact(cx, cy, rx, ry, a = .28) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rx); gr.addColorStop(0, `rgba(60,20,70,${a})`); gr.addColorStop(1, 'rgba(60,20,70,0)'); g.save(); g.translate(cx, cy); g.scale(1, ry / rx); g.translate(-cx, -cy); g.fillStyle = gr; g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2); g.restore(); }
const CH = {x: 420, seat: 2165};
function officeFull(st) {
  const wg = g.createLinearGradient(-300, 700, 1500, 2200); wg.addColorStop(0, '#f3e6ff'); wg.addColorStop(1, '#c7acdf'); g.fillStyle = wg; g.fillRect(-900, -300, 3000, 2600);
  // window (light source)
  shape([[-340, 620], [80, 612], [86, 1260], [-334, 1268]], '#fffaf0', 6);
  const sky = g.createLinearGradient(0, 640, 0, 1240); sky.addColorStop(0, '#9fd8ff'); sky.addColorStop(1, '#ffe9c8'); g.save(); crPath([[-316, 640], [60, 634], [64, 1240], [-312, 1246]]); g.fillStyle = sky; g.fill(); g.restore();
  line([[-126, 636], [-124, 1244]], 6); line([[-314, 940], [62, 936]], 6);
  shape([[60, 590], [150, 600], [170, 1300], [120, 1330], [90, 1290]], '#f07aa8'); line([[100, 640], [130, 1280]], 2.5);
  // wall light falloff from the window
  const wl = g.createRadialGradient(-100, 950, 50, -100, 950, 1300); wl.addColorStop(0, 'rgba(255,248,225,0.35)'); wl.addColorStop(1, 'rgba(255,248,225,0)'); g.fillStyle = wl; g.fillRect(-900, -300, 3000, 2600);
  // diploma (with its own shadow on the wall)
  shape([[940, 832], [1260, 824], [1266, 1072], [946, 1080]].map(([px, py]) => [px + 12, py + 14]), 'rgba(70,30,90,0.16)', 0);
  shape([[930, 820], [1250, 812], [1256, 1060], [936, 1068]], '#c9963f'); shape([[952, 840], [1232, 834], [1236, 1042], [956, 1048]], '#fffaf0', 3);
  g.font = '34px HL, HC'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ДИПЛОМ', 1094, 900); g.font = '24px HL, HC'; g.fillText('психолог', 1094, 945); g.fillText('(онлайн-курс, 2 недели)', 1094, 985);
  // baseboard + floor with perspective planks
  shape([[-900, 2150], [2100, 2150], [2100, 2196], [-900, 2196]], '#fff3e4', 3.5);
  const fl = g.createLinearGradient(0, 2196, 0, 2900); fl.addColorStop(0, '#d29a62'); fl.addColorStop(1, '#b97a45'); g.fillStyle = fl; g.fillRect(-900, 2196, 3000, 900); line([[-900, 2196], [2100, 2196]], 3.5);
  g.strokeStyle = 'rgba(120,70,30,0.35)'; g.lineWidth = 3; for (let k = -10; k <= 10; k++) { g.beginPath(); g.moveTo(540 + k * 130, 2196); g.lineTo(540 + k * 330, 2900); g.stroke(); }
  // sunlight patch on the floor from the window
  g.fillStyle = 'rgba(255,240,200,0.28)'; g.beginPath(); g.moveTo(-320, 2200); g.lineTo(80, 2200); g.lineTo(520, 2700); g.lineTo(-60, 2700); g.closePath(); g.fill();
  // rug
  oval(470, 2400, 470, 70, '#c47ed6', 0); oval(470, 2400, 430, 58, '#d79ae6', 0); oval(470, 2400, 470, 70, null, 3.5);
  // ficus — further back (base higher on the floor, smaller)
  g.save(); g.translate(-20, 2236); g.scale(.82, .82);
  contact(0, 6, 150, 22, .3);
  shape([[-130, -310], [130, -310], [100, 0], [-100, 0]], '#ff7a59'); line([[-130, -270], [130, -270]], 3);
  line([[0, -310], [10, -690], [-10, -970]], 7);
  for (let k = 0; k < 11; k++) { const a = -2.6 + k * .42, cx = Math.cos(a) * (120 + (k % 3) * 40), cy = -750 + Math.sin(a) * 260 + k * 22;
    g.save(); g.translate(cx, cy); g.rotate(a + 1.57 + Math.sin(st.time * .9 + k) * .03); shape([[0, -70], [34, -10], [0, 70], [-34, -10]], k % 2 ? '#2fae5a' : '#3cc46a', 3.5); line([[0, -60], [0, 60]], 2); g.restore(); }
  g.restore();
  // side table — behind the character's floor line
  contact(1180, 2300, 200, 24, .3);
  shape([[1030, 1870], [1330, 1870], [1330, 1910], [1030, 1910]], '#b9814c'); line([[1066, 1910], [1060, 2296]], 10); line([[1296, 1910], [1302, 2296]], 10);
  shape([[1070, 1770], [1140, 1770], [1134, 1870], [1076, 1870]], C.glass); oval(1105, 1770, 35, 9, 'rgba(230,245,255,0.8)', 3);
  const tx = 1240 - (st.push || 0) * 120, ty = 1780;
  shape([[tx - 80, ty], [tx + 80, ty], [tx + 80, ty + 90], [tx - 80, ty + 90]], C.tissueBox); oval(tx, ty + 5, 40, 9, '#5aa9d6', 3);
  shape([[tx - 24, ty + 3], [tx - 30, ty - 46], [tx - 2, ty - 30], [tx + 16, ty - 60], [tx + 26, ty + 3]], '#ffffff', 3.5);
}
function armchair(part, st) {
  const cx = CH.x, sy = CH.seat;
  if (part === 'back') {
    contact(cx, 2392, 360, 30, .35);
    shape([[cx - 300, sy + 60], [cx - 310, 1640], [cx - 230, 1500], [cx, 1470], [cx + 230, 1500], [cx + 310, 1640], [cx + 300, sy + 60]], C.chair);
    line([[cx - 200, 1560], [cx - 210, sy - 20]], 3); line([[cx + 200, 1560], [cx + 210, sy - 20]], 3); line([[cx, 1500], [cx, sy - 20]], 3);
    shape([[cx - 260, sy - 20], [cx + 260, sy - 20], [cx + 270, sy + 100], [cx - 270, sy + 100]], C.chairD);
    for (const s of [-1, 1]) line([[cx + s * 250, sy + 100], [cx + s * 246, 2390]], 12);
  } else {
    for (const s of [-1, 1]) shape([[cx + s * 236, sy - 140], [cx + s * 340, sy - 160], [cx + s * 350, sy + 140], [cx + s * 240, sy + 150]], C.chair);
    if (st.noteOnArm) { g.save(); g.translate(cx + 290, sy - 170); g.rotate(-0.08); shape([[-70, -12], [70, -12], [70, 12], [-70, 12]], C.note, 3.5); g.restore(); }
  }
}

// =====================================================================================
// CAST SHEET — 10 characters in the thin-line style, standing and sitting (front view)
// node linestyle/cast.js  -> linestyle/out/cast_stand.png, cast_sit.png, cast_all.png
// =====================================================================================
const CAST = [
  {name: 'Девушка', pose: 'hip', sitPose: 'mug', sex: 'f', age: 'adult', Ht: 1060, fat: 1, skin: '#fbd8bf', hair: {style: 'long', c: '#8a3b23', c2: '#c4602f'}, top: {c: '#f2c14e', type: 'sweater'}, bottom: {type: 'skirt', c: '#4b6fd1', len: 0.95}, shoes: '#3a2f3a', lips: '#e0334a', shadow: '#c58be8', lashes: true},
  {name: 'Парень', pose: 'pocket', sitPose: 'lap', sex: 'm', age: 'adult', Ht: 1110, fat: 1, skin: '#f0c4a0', hair: {style: 'short', c: '#2f2420'}, top: {c: '#3fa77a', type: 'hoodie'}, bottom: {type: 'pants', c: '#3b4f86'}, shoes: '#ffffff', stubble: true},
  {name: 'Девочка', pose: 'wave', sitPose: 'lap', sex: 'f', age: 'kid', Ht: 700, fat: 1, skin: '#ffdcc4', hair: {style: 'pigtails', c: '#e0a33a', c2: '#f2c45a'}, top: {c: '#ff7aa8', type: 'dress'}, bottom: {type: 'dress', c: '#ff7aa8', len: 0.75}, shoes: '#d8304a', freckles: true, socks: '#ffffff'},
  {name: 'Подросток', pose: 'straps', sitPose: 'lap', sex: 'm', age: 'teen', Ht: 930, fat: .92, skin: '#e9b48e', hair: {style: 'messy', c: '#5b3322'}, top: {c: '#ff8a3a', type: 'tshirt'}, bottom: {type: 'pants', c: '#6d7a86'}, shoes: '#2f8a7c', backpack: '#3b6fd1'},
  {name: 'Мама', pose: 'hips', sitPose: 'mug', sex: 'f', age: 'adult', Ht: 1030, fat: 1.35, skin: '#fbd6b8', hair: {style: 'bob', c: '#5a2150', c2: '#cf4a86'}, top: {c: '#f3b51e', type: 'wrap', dot: '#fff3c9'}, bottom: {type: 'dress', c: '#f3b51e', dot: '#fff3c9', len: 1.0}, shoes: '#d8304a', lips: '#e2303f', shadow: '#8f5be0', lashes: true, beads: '#ff7a59', mole: true},
  {name: 'Папа', pose: 'down', sitPose: 'lap', sex: 'm', age: 'adult', Ht: 1100, fat: 1.25, skin: '#f2c6a2', hair: {style: 'side', c: '#4a3426'}, top: {c: '#bfe0f5', type: 'shirt', tie: '#d8344a'}, bottom: {type: 'pants', c: '#3a3f55'}, shoes: '#5a3a22', glasses: '#2b2b33', mustache: '#4a3426', belly: true},
  {name: 'Бабушка', pose: 'folded', sitPose: 'lap', sex: 'f', age: 'old', Ht: 960, fat: 1.2, skin: '#f6d2b8', hair: {style: 'bun', c: '#d9d6df', c2: '#ffffff'}, top: {c: '#b06ab8', type: 'cardigan', under: '#fff6e8'}, bottom: {type: 'skirt', c: '#5b4a7a', len: 1.15}, shoes: '#4a3a3a', glasses: '#c9963f', beads: '#fff8ee', lips: '#d86a7a'},
  {name: 'Дедушка', pose: 'cane', sitPose: 'lap', sex: 'm', age: 'old', Ht: 1000, fat: 1.05, skin: '#efc6a6', hair: {style: 'bald', c: '#e4e2ea'}, top: {c: '#f4efe4', type: 'vest', vest: '#7a8f5a'}, bottom: {type: 'pants', c: '#7a6a5a'}, shoes: '#3a2a22', glasses: '#2b2b33', beard: '#eceaf0', cane: true},
  {name: 'Продавщица', pose: 'folded', sitPose: 'mug', sex: 'f', age: 'adult', Ht: 1050, fat: 1.1, skin: '#f9d2b2', hair: {style: 'pony', c: '#c2382c', c2: '#e2603c'}, top: {c: '#7ac8e8', type: 'tshirt'}, bottom: {type: 'pants', c: '#2f3a55'}, shoes: '#ffffff', apron: '#2fae5a', lips: '#e2303f', lashes: true, shadow: '#5ab0e0'},
  {name: 'Врач', pose: 'down', sitPose: 'lap', sex: 'm', age: 'adult', Ht: 1090, fat: 1, skin: '#d9a07a', hair: {style: 'short', c: '#1e1a1a'}, top: {c: '#9fd8e8', type: 'scrubs'}, bottom: {type: 'pants', c: '#9fd8e8'}, shoes: '#ffffff', coat: true, steth: true, glasses: '#3b6fd1'},
];

function roundPoly(pts, r = 14) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], v = pts[i], b = pts[(i + 1) % n];
    const la = Math.hypot(a[0] - v[0], a[1] - v[1]) || 1, lb = Math.hypot(b[0] - v[0], b[1] - v[1]) || 1, ra = Math.min(r, la / 2.5), rb = Math.min(r, lb / 2.5);
    const p1 = [v[0] + (a[0] - v[0]) * ra / la, v[1] + (a[1] - v[1]) * ra / la], p2 = [v[0] + (b[0] - v[0]) * rb / lb, v[1] + (b[1] - v[1]) * rb / lb];
    for (let k = 0; k <= 4; k++) { const u = k / 4; out.push([(1 - u) * (1 - u) * p1[0] + 2 * (1 - u) * u * v[0] + u * u * p2[0], (1 - u) * (1 - u) * p1[1] + 2 * (1 - u) * u * v[1] + u * u * p2[1]]); }
    const L = Math.hypot(b[0] - p2[0], b[1] - p2[1]) - rb, steps = Math.floor(L / 18);
    for (let k = 1; k < steps; k++) { const u = k / steps; const q2 = [b[0] + (v[0] - b[0]) * rb / lb, b[1] + (v[1] - b[1]) * rb / lb]; out.push([p2[0] + (q2[0] - p2[0]) * u, p2[1] + (q2[1] - p2[1]) * u]); }
  }
  return out;
}
const fillP = (pts, col, lw = LW) => fillS(roundPoly(pts), col, lw);
function fillS(pts, col, lw = LW) { shape(pts, col, lw); shadeOver(pts); crPath(pts); g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); }
function tube(path_, w0, w1, col) { fillS(tubePts(path_, w0, w1), col); }
function circ(x, y, r, col, lw = 3) { oval(x, y, r, r, col, lw); }

function person(P, X, Gy, sit) {
  const old = P.age === 'old', kid = P.age === 'kid', teen = P.age === 'teen', m = P.sex === 'm', fat = P.fat;
  const heads = kid ? 4.6 : teen ? 6.3 : old ? 6.4 : 7, hh = P.Ht / heads, HH = P.Ht / (kid ? 3.6 : teen ? 5.0 : old ? 5.1 : 5.3);
  Object.assign(C, {skin: P.skin, nail: P.lips && !kid ? P.lips : '#efb5a0'});
  // proportions (standing)
  const top0 = Gy - P.Ht, fw = HH * (kid ? .92 : .8) * (fat > 1.15 ? 1.08 : 1), chin0 = top0 + HH;
  const shW = hh * (kid ? .66 : m ? .9 : .76) * Math.pow(fat, .8), waW = hh * (kid ? .62 : m ? .74 : .6) * Math.pow(fat, 1.3) * (P.belly ? 1.18 : 1), hiW = hh * (kid ? .64 : m ? .74 : .88) * fat;
  const shY0 = chin0 + hh * (kid ? .2 : .3), wy0 = shY0 + hh * (kid ? 1.05 : 1.4), hy0 = wy0 + hh * (kid ? .45 : .55);
  const seatY = Gy - hh * (kid ? 1.6 : 1.85), dy = sit ? (seatY - hh * .05) - hy0 : 0;
  const top = top0 + dy, chin = chin0 + dy, shY = shY0 + dy, wy = wy0 + dy, hy = hy0 + dy, fc = top + HH * .52;
  const ank = Gy - hh * .14, legW = hh * .42 * Math.pow(fat, .9) * (kid ? 1.05 : 1), calf = hh * .25 * Math.pow(fat, .7);
  const lowerCol = P.bottom.type === 'pants' ? P.bottom.c : P.skin;
  // ---- chair (sitting) ----
  if (sit) {
    const cw = hiW * 1.45 + 30;
    g.beginPath(); g.roundRect(X - cw, seatY - hh * 2.4, cw * 2, hh * 2.4 + 20, 50); g.fillStyle = '#e8a85a'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke();
    g.beginPath(); g.roundRect(X - cw - 10, seatY - 10, cw * 2 + 20, 40, 16); g.fillStyle = '#c98a44'; g.fill(); g.stroke();
    line([[X - cw + 30, seatY - hh * 2.1], [X + cw - 30, seatY - hh * 2.1]], 3);
    for (const s of [-1, 1]) line([[X + s * (cw - 20), seatY], [X + s * (cw - 10), Gy]], 12);
  }
  // ---- back hair ----
  hairBack(P, X, fc, HH, fw, top);
  // ---- backpack behind ----
  if (P.backpack) fillP([[X - shW * .95, shY + hh * .1], [X + shW * .95, shY + hh * .1], [X + shW, wy + hh * .4], [X - shW, wy + hh * .4]], P.backpack);
  // ---- legs ----
  for (const s of [-1, 1]) {
    const hip = [X + s * hiW * .48, hy + hh * .12];
    let knee, foot;
    if (!sit) { knee = [X + s * hiW * .46, hy + (ank - hy) * .5]; foot = [X + s * hiW * .44, ank]; }
    else { knee = [X + s * hiW * .62, seatY + hh * .08]; foot = [X + s * hiW * .6, ank]; }
    const legC = P.bottom.type === 'pants' ? P.bottom.c : P.skin, w0 = P.bottom.type === 'pants' ? legW : legW * .8, w1 = P.bottom.type === 'pants' ? calf * 1.15 : calf;
    if (sit) { tube([knee, [knee[0], (knee[1] + foot[1]) / 2], foot], w0 * .9, w1, legC); fillP([[hip[0] - s * 10, hip[1] - 20], [knee[0] - w0 * .55, knee[1] - w0 * .3], [knee[0], knee[1] + w0 * .35], [knee[0] + w0 * .55, knee[1] - w0 * .3]], legC); }
    else tube([hip, knee, foot], w0, w1, legC);
    if (P.socks && !sit) fillP([[foot[0] - w1 * .55, foot[1] - hh * .25], [foot[0] + w1 * .55, foot[1] - hh * .25], [foot[0] + w1 * .55, foot[1]], [foot[0] - w1 * .55, foot[1]]], P.socks, 3);
    const sw = hh * (kid ? .2 : .22);
    fillP([[foot[0] - sw * .8, foot[1] - hh * .06], [foot[0] + sw * .8, foot[1] - hh * .07], [foot[0] + s * sw * .2 + sw * 1.1, Gy - 18], [foot[0] + s * sw * .2 + sw, Gy], [foot[0] + s * sw * .2 - sw, Gy], [foot[0] + s * sw * .2 - sw * 1.1, Gy - 18]], P.shoes);
  }
  // ---- hips / crotch (pants) ----
  if (P.bottom.type === 'pants') { const cy = sit ? seatY + hh * .1 : hy + hh * .38; fillP([[X - hiW * .97, hy - hh * .15], [X + hiW * .97, hy - hh * .15], [X + hiW * .95, cy], [X, cy + 4], [X - hiW * .95, cy]], P.bottom.c); line([[X, hy + hh * .05], [X, cy]], 2.5); }
  // ---- skirt / dress lower ----
  if (P.bottom.type !== 'pants') {
    const L = P.bottom.len || 1, end = sit ? seatY + hh * .35 * L : hy + hh * 1.25 * L, fl = sit ? 1.25 : 1.04 + (P.bottom.type === 'dress' ? .05 : 0);
    const sk = roundPoly([[X - waW, wy], [X + waW, wy], [X + hiW * 1.02, hy], [X + hiW * fl, end], [X + hiW * .4, end + 12], [X, end + 4], [X - hiW * .4, end + 12], [X - hiW * fl, end], [X - hiW * 1.02, hy]], 22);
    fillS(sk, P.bottom.c); if (P.bottom.dot) dots(sk, P.bottom.dot);
    line([[X - hiW * .4, hy + hh * .1], [X - hiW * .5, end]], 2.5); line([[X + hiW * .35, hy + hh * .15], [X + hiW * .45, end + 4]], 2.5);
  }
  // ---- doctor coat (behind arms, over body) ----
  // ---- arms: noodle arms that grow out of a sloped shoulder (behind the torso unless crossing the body) ----
  const ARMSET = makeArms(P, X, hh, shW, shY, wy, hy, hiW, seatY, sit, Gy, waW);
  for (const a of ARMSET.filter(a => !a.front)) drawArm(a);
  // ---- neck + torso ----
  tube([[X, chin - HH * .15], [X, shY + hh * .12]], hh * (kid ? .32 : m ? .42 : .34) * Math.pow(fat, .6), hh * (m ? .46 : .38) * Math.pow(fat, .6), P.skin);
  const hem = P.bottom.type === 'pants' ? hy + hh * (P.coat ? 1.1 : .22) : wy + 6, vNeck = P.top.type === 'wrap' || P.top.type === 'cardigan' || P.coat ? .7 : P.top.type === 'shirt' ? .32 : .14;
  const torso = roundPoly([[X - shW, shY + hh * .5], [X - shW * .9, shY + hh * .2], [X - shW * .6, shY + hh * .05], [X - hh * .24, shY - hh * .02], [X, shY + hh * vNeck], [X + hh * .24, shY - hh * .02], [X + shW * .6, shY + hh * .05], [X + shW * .9, shY + hh * .2], [X + shW, shY + hh * .5], [X + shW * .98, shY + hh * .8], [X + waW, wy], ...(P.bottom.type === 'pants' ? [[X + hiW, Math.max(wy, hem - hh * .1)], [X + hiW, hem], [X - hiW, hem], [X - hiW, Math.max(wy, hem - hh * .1)]] : [[X + waW, hem], [X - waW, hem]]), [X - waW, wy], [X - shW * .98, shY + hh * .8]], 18);
  const topCol = P.coat ? '#fbfbf8' : P.top.type === 'cardigan' ? P.top.c : P.top.c;
  if (P.top.type === 'cardigan') fillP([[X - hh * .3, shY], [X + hh * .3, shY], [X + waW * .5, hem], [X - waW * .5, hem]], P.top.under);
  if (P.top.type === 'shirt' || P.coat) fillP([[X - hh * .3, shY - hh * .02], [X + hh * .3, shY - hh * .02], [X + hh * .2, shY + hh * .7], [X - hh * .2, shY + hh * .7]], P.coat ? P.top.c : P.top.c);
  if (P.top.type === 'cardigan' || P.coat) { const bw = P.bottom.type === 'pants' ? hiW : waW; for (const s of [-1, 1]) fillP([[X, shY + hh * vNeck], [X + s * hh * .24, shY - hh * .02], [X + s * shW * .6, shY + hh * .05], [X + s * shW * .9, shY + hh * .2], [X + s * shW, shY + hh * .5], [X + s * shW * .98, shY + hh * .8], [X + s * waW, wy], [X + s * bw, Math.max(wy, hem - hh * .1)], [X + s * bw, hem], [X + s * hh * .05, hem]], topCol); }
  else { fillS(torso, topCol); if (P.top.dot) dots(torso, P.top.dot); }
  // torso details
  if (P.top.type === 'wrap') { line([[X - shW * .8, shY + hh * .2], [X + hh * .1, wy + 4]], 3); line([[X - waW, wy + 4], [X + waW, wy + 4]], 3); }
  if (P.top.type === 'hoodie') { fillP([[X - hh * .45, shY + hh * .02], [X - hh * .5, shY - hh * .25], [X, shY - hh * .1], [X + hh * .5, shY - hh * .25], [X + hh * .45, shY + hh * .02], [X, shY + hh * .2]], P.top.c); line([[X - hh * .12, shY + hh * .2], [X - hh * .14, shY + hh * .6]], 3); line([[X + hh * .12, shY + hh * .2], [X + hh * .14, shY + hh * .6]], 3); fillP([[X - waW * .8, wy - hh * .15], [X + waW * .8, wy - hh * .15], [X + waW * .95, wy + hh * .25], [X - waW * .95, wy + hh * .25]], P.top.c, 3); }
  if (P.top.type === 'sweater') { { const bw = P.bottom.type === 'pants' ? hiW : waW; line([[X - bw, hem - 14], [X + bw, hem - 14]], 2.5); } for (let q = 0; q < 3; q++) line([[X - waW * .6 + q * waW * .6, shY + hh * .5], [X - waW * .6 + q * waW * .6, wy - 10]], 2); }
  if (P.top.type === 'shirt' && !P.coat) { for (let q = 0; q < 4; q++) circ(X, shY + hh * (.75 + q * .3), 4, '#ffffff', 2); if (P.top.tie) fillP([[X - 14, shY + hh * .18], [X + 14, shY + hh * .18], [X + 22, shY + hh * 1.1], [X, shY + hh * 1.25], [X - 22, shY + hh * 1.1]], P.top.tie, 3.5); }
  if (P.belly) line([[X - waW * .9, wy + hh * .1], [X, wy + hh * .25], [X + waW * .9, wy + hh * .1]], 3);
  if (P.top.type === 'cardigan') for (let q = 0; q < 4; q++) circ(X - hh * .02, shY + hh * (.9 + q * .3), 6, '#fff6e8', 2.5);
  if (P.top.type === 'vest') { const vh = wy + hh * .3; fillP([[X - shW * .78, shY + hh * .12], [X - hh * .2, shY + hh * .1], [X - 4, shY + hh * .9], [X - 4, vh], [X - waW * 1.02, vh], [X - waW, wy]], P.top.vest); fillP([[X + shW * .78, shY + hh * .12], [X + hh * .2, shY + hh * .1], [X + 4, shY + hh * .9], [X + 4, vh], [X + waW * 1.02, vh], [X + waW, wy]], P.top.vest); for (let q = 0; q < 3; q++) circ(X + 18, shY + hh * (1.05 + q * .28), 5, '#c9963f', 2); }
  if (P.coat) { line([[X - hh * .26, shY - hh * .04], [X - hh * .5, shY + hh * .6], [X - hh * .05, shY + hh * .9]], 3); line([[X + hh * .26, shY - hh * .04], [X + hh * .5, shY + hh * .6], [X + hh * .05, shY + hh * .9]], 3); fillP([[X - shW * .7, wy + hh * .1], [X - shW * .25, wy + hh * .1], [X - shW * .25, wy + hh * .5], [X - shW * .7, wy + hh * .5]], '#fbfbf8', 3); line([[X + shW * .35, shY + hh * .6], [X + shW * .7, shY + hh * .6]], 3); g.fillStyle = '#3b6fd1'; g.fillRect(X + shW * .42, shY + hh * .45, 6, hh * .17); }
  if (P.apron) { const at = shY + hh * .55; fillP([[X - waW * .62, at], [X + waW * .62, at], [X + hiW * .78, hy + hh * (sit ? .4 : .95)], [X - hiW * .78, hy + hh * (sit ? .4 : .95)]], P.apron); line([[X - waW * .75, at], [X - hh * .26, shY - hh * .03]], 6); line([[X + waW * .75, at], [X + hh * .26, shY - hh * .03]], 6);
    fillP([[X - hh * .3, wy + hh * .15], [X + hh * .3, wy + hh * .15], [X + hh * .3, wy + hh * .45], [X - hh * .3, wy + hh * .45]], P.apron, 3); fillP([[X + waW * .1, at + hh * .15], [X + waW * .65, at + hh * .15], [X + waW * .65, at + hh * .35], [X + waW * .1, at + hh * .35]], '#ffffff', 3);
    g.fillStyle = C.ink; g.font = `${Math.round(hh * .1)}px HL, HC`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ОЛЯ', X + waW * .375, at + hh * .25); }
  if (P.backpack) for (const s of [-1, 1]) fillP([[X + s * shW * .55, shY + hh * .02], [X + s * shW * .78, shY + hh * .05], [X + s * shW * .72, wy], [X + s * shW * .52, wy]], P.backpack, 3.5);
  if (P.beads) { const n = 11; for (let i = 0; i <= n; i++) { const u = i / n; circ(X - hh * .3 + u * hh * .6, shY + Math.sin(u * Math.PI) * hh * .3, hh * .045, P.beads, 2.5); } }
  // ---- arms in front of the body ----
  if (sit && P.sitPose === 'mug') { const mx = X, my = wy - hh * .5; fillP([[mx - hh * .28, my - hh * .3], [mx + hh * .28, my - hh * .3], [mx + hh * .25, my + hh * .2], [mx - hh * .25, my + hh * .2]], '#ffd84a'); oval(mx, my - hh * .3, hh * .28, hh * .07, '#fff6d0', 3); }
  for (const a of ARMSET.filter(a => a.front)) drawArm(a);
  if (P.steth) { g.beginPath(); g.moveTo(X - hh * .3, shY); g.quadraticCurveTo(X - hh * .3, shY + hh * .9, X - hh * .05, shY + hh * 1.1); g.strokeStyle = '#2b2b33'; g.lineWidth = 7; g.stroke(); g.beginPath(); g.moveTo(X + hh * .3, shY); g.quadraticCurveTo(X + hh * .3, shY + hh * .7, X + hh * .1, shY + hh * .85); g.stroke(); circ(X - hh * .05, shY + hh * 1.12, hh * .07, '#c9ced6', 3.5); }
  // ---- head ----
  head2(P, X, fc, HH, fw, top);
}
function dots(pts, col) { g.save(); crPath(pts); g.clip(); g.fillStyle = col; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [px, py] of pts) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } for (let y = y0; y < y1; y += 34) for (let x = x0 + ((y / 34) % 2) * 17; x < x1; x += 34) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } g.restore(); crPath(pts); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke(); }

function hairBack(P, X, fc, hh, fw, top) {
  const h = P.hair, c = h.c, r = fw * .5;
  if (h.style === 'long') fillS([[X - r * 1.15, fc - hh * .1], [X - r * 1.05, fc - hh * .45], [X, fc - hh * .62], [X + r * 1.05, fc - hh * .45], [X + r * 1.15, fc - hh * .1], [X + r * 1.3, fc + hh * 1.2], [X + r * .6, fc + hh * 1.32], [X - r * .6, fc + hh * 1.32], [X - r * 1.3, fc + hh * 1.2]], c);
  if (h.style === 'bob') fillS([[X - r * 1.22, fc + hh * .45], [X - r * 1.28, fc - hh * .1], [X - r * 1.1, fc - hh * .5], [X, fc - hh * .66], [X + r * 1.1, fc - hh * .5], [X + r * 1.28, fc - hh * .1], [X + r * 1.22, fc + hh * .45], [X + r * .8, fc + hh * .5], [X - r * .8, fc + hh * .5]], c);
  if (h.style === 'pony') { fillS([[X + r * .7, fc - hh * .45], [X + r * 1.6, fc - hh * .3], [X + r * 1.7, fc + hh * .5], [X + r * 1.3, fc + hh * .9], [X + r * 1.15, fc + hh * .2]], c); }
  if (h.style === 'pigtails') for (const s of [-1, 1]) { fillS([[X + s * r * .95, fc - hh * .25], [X + s * r * 1.6, fc - hh * .15], [X + s * r * 1.8, fc + hh * .45], [X + s * r * 1.5, fc + hh * .75], [X + s * r * 1.2, fc + hh * .3]], c); circ(X + s * r * 1.05, fc - hh * .22, hh * .07, '#ff4f7a', 3); }
  if (h.style === 'bun') { fillS([[X - r * .45, fc - hh * .62], [X - r * .5, fc - hh * .9], [X, fc - hh * 1.0], [X + r * .5, fc - hh * .9], [X + r * .45, fc - hh * .62]], c); line([[X - r * .3, fc - hh * .85], [X + r * .2, fc - hh * .78]], 2.5); }
}
function head2(P, X, fc, hh, fw, top) {
  const m = P.sex === 'm', kid = P.age === 'kid', old = P.age === 'old', r = fw * .5, fat = P.fat;
  // ears
  for (const s of [-1, 1]) { fillS([[X + s * r * .92, fc - hh * .02], [X + s * r * 1.12, fc - hh * .08], [X + s * r * 1.15, fc + hh * .14], [X + s * r * .95, fc + hh * .2]], P.skin, 3.5); line([[X + s * r * 1.0, fc + hh * .0], [X + s * r * 1.06, fc + hh * .12]], 2); }
  // face
  const jw = fat > 1.15 || old ? 1.06 : 1;
  const F = [[-.98, -.25], [-.86, -.66], [-.45, -.95], [.45, -.95], [.86, -.66], [.98, -.25], [.96 * jw, .22], [.72 * jw, .62], [.34, .9], [0, .96], [-.34, .9], [-.72 * jw, .62], [-.96 * jw, .22]].map(([a, b]) => [X + a * r, fc + b * hh * .5]);
  fillS(F, P.skin);
  if (P.stubble || P.beard) { g.save(); crPath(F); g.clip(); g.fillStyle = 'rgba(60,40,30,0.12)'; g.fillRect(X - r, fc + hh * .2, r * 2, hh * .4); g.restore(); }
  // blush
  oval(X - r * .55, fc + hh * .15, r * .26, r * .2, 'rgba(244,140,140,0.55)', 0); oval(X + r * .55, fc + hh * .15, r * .26, r * .2, 'rgba(244,140,140,0.55)', 0);
  // eyes
  const ey = fc + hh * .02, ex = r * .42, es = hh * (kid ? .1 : .075);
  for (const s of [-1, 1]) {
    const x = X + s * ex;
    if (P.shadow) shape([[x - es * 1.55, ey], [x - es * .6, ey - es * 1.2], [x + es * .7, ey - es * 1.2], [x + es * 1.6, ey], [x + es * .7, ey - es * .65], [x - es * .6, ey - es * .65]], P.shadow, 2.5);
    const al = kid ? null : [[x - es * 1.4, ey], [x - es * .5, ey - es * .7], [x + es * .55, ey - es * .7], [x + es * 1.4, ey + 2], [x + es * .5, ey + es * .65], [x - es * .5, ey + es * .65]];
    if (kid) { oval(x, ey, es * .95, es * 1.05, '#ffffff', 3); oval(x, ey + 2, es * .62, es * .7, C.ink, 0); oval(x + es * .25, ey - es * .25, es * .2, es * .2, '#ffffff', 0); }
    else { shape(al, '#ffffff', 2.5); g.save(); crPath(al); g.clip(); oval(x, ey + 1, es * .62, es * .62, C.ink, 0); oval(x + es * .22, ey - es * .22, es * .18, es * .18, '#ffffff', 0); if (old) { g.fillStyle = P.skin; g.fillRect(x - es * 2, ey - es * 2, es * 4, es * 1.65); } g.restore();
      line([[x - es * 1.45, ey + 1], [x - es * .5, ey - es * (old ? .32 : .72)], [x + es * .55, ey - es * (old ? .32 : .72)], [x + es * 1.45, ey + 2]], 4.5); }
    if (P.lashes) for (let q = 0; q < 4; q++) line([[x - es * .9 + q * es * .6, ey - es * .65], [x - es * .9 + q * es * .6 + s * 3, ey - es * 1.0]], 2);
    if (old) { line([[x - es * 1.0, ey + es * .95], [x, ey + es * 1.15], [x + es * .9, ey + es * .95]], 2); line([[x + s * es * 1.6, ey - es * .3], [x + s * es * 1.95, ey - es * .5]], 2); line([[x + s * es * 1.6, ey + es * .1], [x + s * es * 1.95, ey + es * .1]], 2); }
    // brow
    const bc = old ? '#b9b6c2' : P.hair.c, by = ey - es * (kid ? 1.7 : 2.0);
    shape([[x - s * es * 1.3, by + es * .2], [x, by - es * .25], [x + s * es * 1.3, by + es * .05], [x + s * es * 1.25, by + es * .4], [x, by + es * .12], [x - s * es * 1.25, by + es * .5]], bc, 2.5);
  }
  // glasses
  if (P.glasses) { g.strokeStyle = P.glasses; g.lineWidth = 5; for (const s of [-1, 1]) { g.beginPath(); g.arc(X + s * ex, ey, es * 2.0, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(X - ex + es * 2, ey); g.quadraticCurveTo(X, ey - es * .6, X + ex - es * 2, ey); g.stroke(); }
  // nose
  if (m && !kid) { shape([[X - es * .3, ey + es * .6], [X + es * .5, ey + es * .7], [X + es * .7, ey + es * 2.0], [X, ey + es * 2.3], [X - es * .6, ey + es * 2.0]], '#e9a07e', 0); line([[X - es * .5, ey + es * 2.2], [X, ey + es * 2.4], [X + es * .5, ey + es * 2.2]], 2.5); }
  else oval(X, ey + es * (kid ? 1.4 : 1.7), es * .35, es * .5, '#f39c94', 0);
  if (P.freckles) { g.fillStyle = 'rgba(190,110,70,0.7)'; for (const [a, b] of [[-.62, .1], [-.5, .18], [-.68, .2], [.62, .1], [.5, .18], [.68, .2]]) { g.beginPath(); g.arc(X + a * r, fc + b * hh, 3, 0, 7); g.fill(); } }
  if (P.mole) oval(X + r * .38, fc + hh * .24, 4, 4, C.ink, 0);
  // mouth
  const my = fc + hh * (kid ? .27 : .3), mw = hh * (kid ? .12 : .13);
  if (P.mustache) shape([[X - mw * 1.5, my - hh * .02], [X - mw * .3, my - hh * .09], [X, my - hh * .06], [X + mw * .3, my - hh * .09], [X + mw * 1.5, my - hh * .02], [X + mw * .6, my - hh * .01], [X, my - hh * .03], [X - mw * .6, my - hh * .01]], P.mustache, 3);
  if (kid) { shape([[X - mw, my - 4], [X + mw, my - 4], [X + mw * .55, my + mw * .8], [X - mw * .55, my + mw * .8]], '#a32a3a', 3); oval(X, my + mw * .5, mw * .45, mw * .2, '#ff8a96', 0); }
  else if (P.lips) { shape([[X - mw, my], [X - mw * .45, my - mw * .35], [X, my - mw * .2], [X + mw * .45, my - mw * .35], [X + mw, my], [X, my + mw * .05]], P.lips, 2.5); shape([[X - mw * .95, my + 1], [X, my + mw * .05], [X + mw * .95, my + 1], [X + mw * .45, my + mw * .55], [X - mw * .45, my + mw * .55]], P.lips, 2.5); line([[X - mw, my], [X, my + mw * .12], [X + mw, my]], 2.5); }
  else line([[X - mw, my - 2], [X - mw * .3, my + mw * .3], [X + mw * .3, my + mw * .3], [X + mw, my - 2]], 3.5);
  if (old) { line([[X - r * .62, fc + hh * .22], [X - r * .7, fc + hh * .34]], 2); line([[X + r * .62, fc + hh * .22], [X + r * .7, fc + hh * .34]], 2); }
  if (P.beard) fillS([[X - r * .95, fc + hh * .08], [X - r * .55, fc + hh * .32], [X - mw, my + mw * .3], [X + mw, my + mw * .3], [X + r * .55, fc + hh * .32], [X + r * .95, fc + hh * .08], [X + r * .85, fc + hh * .45], [X + r * .4, fc + hh * .68], [X, fc + hh * .74], [X - r * .4, fc + hh * .68], [X - r * .85, fc + hh * .45]], P.beard);
  if (P.beard) line([[X - mw * .8, my + 2], [X, my + mw * .3], [X + mw * .8, my + 2]], 3);
  // front hair
  const h = P.hair, c = h.c, c2 = h.c2 || h.c;
  if (h.style === 'long' || h.style === 'bob' || h.style === 'pony') {
    fillS([[X - r * 1.08, fc + (h.style === 'pony' ? -hh * .05 : hh * .35)], [X - r * 1.1, fc - hh * .3], [X - r * .7, fc - hh * .55], [X, fc - hh * .62], [X + r * .75, fc - hh * .55], [X + r * 1.1, fc - hh * .3], [X + r * 1.08, fc + (h.style === 'pony' ? -hh * .05 : hh * .35)], [X + r * .85, fc - hh * .05], [X + r * .6, fc - hh * .3], [X - r * .2, fc - hh * .35], [X - r * .7, fc - hh * .22], [X - r * .85, fc]], c);
    fillS([[X - r * .2, fc - hh * .58], [X + r * .6, fc - hh * .52], [X + r * 1.0, fc - hh * .25], [X + r * .85, fc - hh * .1], [X + r * .55, fc - hh * .3], [X - r * .25, fc - hh * .4]], c2, 3);
    line([[X - r * .6, fc - hh * .48], [X - r * .95, fc - hh * .1], [X - r * 1.0, fc + hh * .25]], 2.5);
  } else if (h.style === 'short' || h.style === 'side') {
    fillS([[X - r * 1.0, fc - hh * .08], [X - r * 1.02, fc - hh * .38], [X - r * .6, fc - hh * .6], [X + r * .2, fc - hh * .66], [X + r * .8, fc - hh * .55], [X + r * 1.02, fc - hh * .3], [X + r * .98, fc - hh * .05], [X + r * .85, fc - hh * .22], [X + r * (h.style === 'side' ? .1 : .3), fc - hh * .32], [X - r * .4, fc - hh * .3], [X - r * .85, fc - hh * .2]], c);
    line([[X - r * .3, fc - hh * .58], [X + r * .1, fc - hh * .4]], 2.5); if (h.style === 'side') line([[X - r * .35, fc - hh * .62], [X - r * .4, fc - hh * .36]], 3);
  } else if (h.style === 'messy') {
    const pts = []; for (let q = 0; q <= 10; q++) { const a = Math.PI + q / 10 * Math.PI, rr = (q % 2 ? 1.0 : 1.18); pts.push([X + Math.cos(a) * r * 1.05 * rr, fc - hh * .12 + Math.sin(a) * hh * .55 * rr]); }
    fillS(pts.concat([[X + r * .9, fc - hh * .15], [X + r * .4, fc - hh * .3], [X - r * .1, fc - hh * .22], [X - r * .6, fc - hh * .32], [X - r * .95, fc - hh * .12]]), c);
  } else if (h.style === 'pigtails') {
    fillS([[X - r * 1.0, fc - hh * .1], [X - r * 1.0, fc - hh * .4], [X - r * .5, fc - hh * .62], [X + r * .5, fc - hh * .62], [X + r * 1.0, fc - hh * .4], [X + r * 1.0, fc - hh * .1], [X + r * .6, fc - hh * .28], [X + r * .2, fc - hh * .22], [X - r * .2, fc - hh * .3], [X - r * .6, fc - hh * .22]], c);
    line([[X, fc - hh * .6], [X, fc - hh * .3]], 2.5);
  } else if (h.style === 'bun') {
    fillS([[X - r * 1.02, fc + hh * .02], [X - r * 1.0, fc - hh * .35], [X - r * .5, fc - hh * .62], [X + r * .5, fc - hh * .62], [X + r * 1.0, fc - hh * .35], [X + r * 1.02, fc + hh * .02], [X + r * .82, fc - hh * .22], [X, fc - hh * .4], [X - r * .82, fc - hh * .22]], c);
    for (const s of [-1, 1]) line([[X + s * r * .2, fc - hh * .58], [X + s * r * .7, fc - hh * .3]], 2.5);
  } else if (h.style === 'bald') {
    for (const s of [-1, 1]) fillS([[X + s * r * .85, fc - hh * .32], [X + s * r * 1.12, fc - hh * .22], [X + s * r * 1.08, fc + hh * .0], [X + s * r * .92, fc + hh * .02]], c, 3);
    oval(X - r * .3, fc - hh * .4, r * .25, hh * .05, 'rgba(255,255,255,0.55)', 0);
  }
}

// ---------- arms & hands (reference: thin noodle arms, no elbow bump, small mitten hands) ----------
function makeArms(P, X, hh, shW, shY, wy, hy, hiW, seatY, sit, Gy, waW) {
  const w = hh * .24 * Math.pow(P.fat, .6), out = [];
  const sleeveLong = !['tshirt', 'scrubs', 'wrap', 'dress'].includes(P.top.type) || P.coat;
  const sc = P.coat ? '#fbfbf8' : P.top.c;
  const pose = sit ? (P.sitPose || 'lap') : (P.pose || 'down');
  for (const s of [-1, 1]) {
    const S = [X + s * (shW - w * .55), shY + hh * .32];              // shoulder joint, inside the sloped shoulder
    let E, H, hand = 'mitt', front = false, ang = Math.PI / 2;
    const one = {hip: -1, wave: 1, cane: 1}; const side = pose === 'hips' ? 'hip' : one[pose] ? (one[pose] === s ? pose : 'down') : pose;
    if (sit) {
      if (pose === 'mug') { E = [X + s * (shW + hh * .05), wy - hh * .1]; H = [X + s * hh * .35, wy - hh * .35]; hand = 'hold'; front = true; ang = -s * .3 + (s > 0 ? Math.PI : 0); }
      else { E = [X + s * (shW + hh * .08), wy + hh * .1]; H = [X + s * hiW * .55, seatY + hh * .05]; front = true; ang = Math.PI / 2 + s * .35; }
    } else if (side === 'hip') { E = [X + s * (shW + hh * .55), wy - hh * .15]; H = [X + s * (hiW * .95), hy - hh * .1]; hand = 'fist'; front = true; ang = s > 0 ? Math.PI * .85 : Math.PI * .15; }
    else if (side === 'wave') { E = [X + s * (shW + hh * .45), shY + hh * .25]; H = [X + s * (shW + hh * .55), shY - hh * .6]; hand = 'wave'; ang = -Math.PI / 2; }
    else if (side === 'pocket') { E = [X + s * (shW + hh * .12), wy - hh * .1]; H = [X + s * hh * .35, wy + hh * .12]; hand = 'none'; front = true; }
    else if (side === 'folded') { E = [X + s * (shW + hh * .1), wy - hh * .2]; H = [X + s * hh * .12, wy + hh * .05]; hand = 'fist'; front = true; ang = s > 0 ? Math.PI : 0; }
    else if (side === 'straps') { E = [X + s * (shW + hh * .1), shY + hh * 1.0]; H = [X + s * shW * .55, shY + hh * .55]; hand = 'fist'; front = true; ang = -Math.PI / 2; }
    else if (side === 'cane') { E = [X + s * (shW + hh * .3), shY + hh * 1.0]; H = [X + s * (shW + hh * .45), wy + hh * .3]; hand = 'fist'; ang = Math.PI / 2; }
    else { const bw = Math.max(shW, waW, hiW * .92); E = [X + s * (Math.max(shW, waW * .95) + hh * .1), shY + hh * 1.2]; H = [X + s * (bw + hh * .1), hy + hh * .2]; ang = Math.PI / 2 - s * .12; }
    out.push({s, S, E, H, w, hand, front, ang, sleeveLong, sc, skin: P.skin, cane: side === 'cane' ? Gy : 0});
  }
  return out;
}
function drawArm(a) {
  const {S, E, H, w} = a;
  if (a.cane) { line([[H[0] + 6, H[1] - 10], [H[0] + 10, a.cane]], 9); g.beginPath(); g.arc(H[0] - w * .6, H[1] - 10, w * .65, Math.PI, 0); g.strokeStyle = C.ink; g.lineWidth = 9; g.stroke(); }
  // one smooth tapered noodle (no elbow bump)
  const path_ = [S, E, H];
  fillS(tubePts(path_, w * 1.08, w * .82), a.sleeveLong ? a.sc : a.skin);
  if (!a.sleeveLong) { const m = [S[0] + (E[0] - S[0]) * .55, S[1] + (E[1] - S[1]) * .55]; fillS(tubePts([S, m], w * 1.35, w * 1.25), a.sc); }
  else { // cuff
    const d = Math.hypot(E[0] - H[0], E[1] - H[1]) || 1, c = [H[0] + (E[0] - H[0]) / d * w * .7, H[1] + (E[1] - H[1]) / d * w * .7];
    line([[c[0] - (E[1] - H[1]) / d * w * .45, c[1] + (E[0] - H[0]) / d * w * .45], [c[0] + (E[1] - H[1]) / d * w * .45, c[1] - (E[0] - H[0]) / d * w * .45]], 2.5);
  }
  mitt(H[0], H[1], a.ang, a.hand, w, a.skin, a.s);
}
function mitt(x, y, ang, kind, w, skin, s) {
  if (kind === 'none') return;
  const r = w * .75;
  g.save(); g.translate(x, y); g.rotate(ang);
  if (kind === 'fist' || kind === 'hold') {
    fillS([[-r * .2, -r * .9], [r * 1.1, -r * .85], [r * 1.35, -r * .2], [r * 1.3, r * .7], [r * .4, r * .95], [-r * .2, r * .8]], skin, 3.5);
    for (const k of [-.35, .2]) line([[r * .9, r * k], [r * 1.3, r * k + 2]], 2);
    fillS([[r * .1, -r * .95], [r * .9, -r * 1.25], [r * 1.15, -r * .95], [r * .6, -r * .6]], skin, 3);
  } else if (kind === 'wave') {
    fillS([[-r * .2, -r * .8], [r * .9, -r * .9], [r * 1.1, r * .9], [-r * .2, r * .85]], skin, 3.5);
    const fa = [-.5, -.17, .17, .5]; for (let q = 0; q < 4; q++) { g.save(); g.translate(r * .95, fa[q] * r * 1.4); g.rotate(fa[q] * .5); fillS([[0, -r * .2], [r * .8, -r * .17], [r * .9, 0], [r * .8, r * .17], [0, r * .2]], skin, 3); g.restore(); }
    g.save(); g.translate(r * .3, -r * .9 * (s || 1)); g.rotate(-.9 * (s || 1)); fillS([[0, -r * .2], [r * .7, -r * .16], [r * .78, 0], [r * .7, r * .16], [0, r * .2]], skin, 3); g.restore();
  } else { // relaxed mitten, fingers together, small thumb
    fillS([[-r * .25, -r * .75], [r * 1.0, -r * .7], [r * 1.5, -r * .25], [r * 1.55, r * .25], [r * 1.05, r * .72], [-r * .25, r * .72]], skin, 3.5);
    for (const k of [-.25, .2]) line([[r * 1.05, r * k], [r * 1.45, r * k]], 2);
    fillS([[r * .1, -r * .7 * (s || 1)], [r * .75, -r * 1.05 * (s || 1)], [r * .95, -r * .82 * (s || 1)], [r * .55, -r * .45 * (s || 1)]], skin, 3);
  }
  g.restore();
}

// ---------- sheets ----------
function sheet(sit, file, label) {
  const cw = 620, ch = 1380, cols = 5, Wd = cw * cols, Hd = ch * 2 + 200;
  const cv = createCanvas(Wd, Hd); g = cv.getContext('2d');
  g.fillStyle = '#f6eefc'; g.fillRect(0, 0, Wd, Hd);
  g.fillStyle = '#2b2424'; g.font = '84px HL, HC'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, Wd / 2, 100);
  CAST.forEach((P, i) => {
    const cx = (i % cols) * cw + cw / 2, gy = 200 + Math.floor(i / cols) * ch + ch - 170;
    g.fillStyle = i % 2 ? '#fde6ef' : '#e6f1fd'; g.beginPath(); g.roundRect((i % cols) * cw + 20, 200 + Math.floor(i / cols) * ch + 20, cw - 40, ch - 40, 40); g.fill();
    const gr = g.createRadialGradient(cx, gy + 4, 0, cx, gy + 4, 240); gr.addColorStop(0, 'rgba(60,20,70,0.25)'); gr.addColorStop(1, 'rgba(60,20,70,0)'); g.save(); g.translate(cx, gy + 4); g.scale(1, .12); g.translate(-cx, -(gy + 4)); g.fillStyle = gr; g.fillRect(cx - 240, gy - 236, 480, 480); g.restore();
    person(P, cx, gy, sit);
    g.fillStyle = '#2b2424'; g.font = '64px HL, HC'; g.textAlign = 'center'; g.fillText(P.name, cx, gy + 95);
  });
  const PG = PAPER; for (let y = 0; y < Hd; y += H) for (let x = 0; x < Wd; x += W) g.drawImage(PG, x, y);
  fs.writeFileSync(path.join(D, 'out', file), cv.toBuffer('image/png')); return path.join(D, 'out', file);
}
fs.mkdirSync(path.join(D, 'out'), {recursive: true});
console.log(sheet(false, 'cast_stand.png', 'Персонажи — стоя'));
console.log(sheet(true, 'cast_sit.png', 'Персонажи — сидя'));
