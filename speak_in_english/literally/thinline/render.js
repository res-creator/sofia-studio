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
    if (st.shades) for (const s of [-1, 1]) { const ex = x + s * 76, ey = y + 8; shape([[ex - 66, ey - 34], [ex + 66, ey - 38], [ex + 60, ey + 22], [ex + 20, ey + 42], [ex - 30, ey + 40], [ex - 64, ey + 14]], '#141418', 4); g.save(); g.globalAlpha = .55; line([[ex - 40, ey - 18], [ex - 10, ey - 24]], 6); g.restore(); if (s > 0) line([[x - 12, y - 18], [x + 12, y - 18]], 6); }
    if (st.specs) { g.strokeStyle = '#e0457a'; g.lineWidth = 6; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 76, y + 6, 60, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(x - 16, y); g.quadraticCurveTo(x, y - 10, x + 16, y); g.stroke(); }
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
    hand(arm.R.h[0], arm.R.h[1], arm.R.ang, arm.R.mode, arm.R.flip, arm.R.mode === 'hold' ? (st.prop ? PROPS[st.prop] : (st.prop === null ? null : penObj)) : null, false);
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
// Speak in English — «4 типа мам» (should / must / have to / had better)
// Mum: EN voice (fish.audio free), lip-synced. Narrator: RU voice (fish.audio free) with karaoke.
// =====================================================================================
const SR = 44100, tmp = path.join(D, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
const SCRIPT = JSON.parse(fs.readFileSync(path.join(D, 'voice', 'script.json'), 'utf8'));
const RU = SCRIPT.ru;
function loadVoice(file, key) {
  const wav = path.join(tmp, key + '.wav');
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(D, 'voice', file), '-af', trim + ',loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', wav]);
  const b = fs.readFileSync(wav), pcm = new Int16Array(b.buffer, b.byteOffset + 44, (b.length - 44) >> 1), spf = SR / FPS, env = [];
  for (let f = 0; f * spf < pcm.length; f++) { let s = 0, n = 0; for (let k = Math.floor(f * spf); k < Math.min(pcm.length, (f + 1) * spf); k++) { s += pcm[k] * pcm[k]; n++; } env.push(Math.sqrt(s / Math.max(1, n)) / 32768); }
  const mx = Math.max(...env) || 1; return {wav, dur: pcm.length / SR, env: env.map(v => v / mx)};
}
const VO = SCRIPT.mum.map((_, i) => loadVoice(`mum${i}.mp3`, 'm' + i));
const NAR = SCRIPT.nar.map((_, i) => loadVoice(`nar${i}.mp3`, 'n' + i));
const TEXTS = SCRIPT.mum;

// ---- visemes (English letters) ----
const VIS = {A: {open: .95, width: 1.0, round: 0, smile: .1, press: 0, bite: 0}, O: {open: .62, width: .72, round: 1, smile: 0, press: 0, bite: 0},
  U: {open: .32, width: .6, round: 1, smile: 0, press: 0, bite: 0}, E: {open: .52, width: 1.12, round: 0, smile: .35, press: 0, bite: 0},
  I: {open: .3, width: 1.18, round: 0, smile: .55, press: 0, bite: 0}, M: {open: 0, width: .96, round: 0, smile: 0, press: 1, bite: 0},
  F: {open: .1, width: 1.0, round: 0, smile: 0, press: 0, bite: 1}, R: {open: .2, width: 1.0, round: 0, smile: .1, press: 0, bite: 0}, X: {open: 0, width: 1.0, round: 0, smile: 0, press: 0, bite: 0}};
const VMAP = {a: 'A', o: 'O', u: 'U', e: 'E', i: 'I', y: 'I'};
const cons = (cl) => /[mbp]/.test(cl) ? 'M' : /[fv]/.test(cl) ? 'F' : cl.length ? 'R' : null;
const LEAD = 0.25;
VO.forEach((v, i) => {
  // vowel groups ("ou", "ea") count as one syllable
  const txt = TEXTS[i].toLowerCase().replace(/[^a-z]/g, ''), syl = []; let cl = '', prevV = false;
  for (const ch of txt) { if (VMAP[ch]) { if (!prevV) syl.push({v: VMAP[ch], c: cons(cl)}); cl = ''; prevV = true; } else { cl += ch; prevV = false; } }
  const e = v.env.map((q, f, a) => ((a[f - 1] ?? q) + q + (a[f + 1] ?? q)) / 3);
  let pk = []; for (let f = 1; f < e.length - 1; f++) if (e[f] >= e[f - 1] && e[f] > e[f + 1] && e[f] > 0.2) { if (pk.length && f - pk[pk.length - 1] < 3) { if (e[f] > e[pk[pk.length - 1]]) pk[pk.length - 1] = f; } else pk.push(f); }
  if (pk.length > syl.length) pk = pk.map(f => [f, e[f]]).sort((a, b) => b[1] - a[1]).slice(0, syl.length).map(q => q[0]).sort((a, b) => a - b);
  const keys = [[0, syl[0] && syl[0].c === 'M' ? 'M' : 'X']];
  pk.forEach((f, k) => {
    const sy = syl[Math.min(syl.length - 1, Math.floor(k * syl.length / pk.length))];
    if (k > 0) { let lo = pk[k - 1], mn = 9; for (let q = pk[k - 1]; q < f; q++) if (e[q] < mn) { mn = e[q]; lo = q; } if (sy.c && mn < .55 && f - pk[k - 1] > 3) keys.push([lo, sy.c]); }
    keys.push([f, sy.v]);
  });
  keys.push([Math.min(e.length - 1, pk[pk.length - 1] + 5), 'X'], [e.length + 6, 'X']);
  v.keys = keys; v.esm = e;
  const hs = pk.map(f => e[f]).sort((a, b) => b - a), thr = hs[Math.floor(hs.length * .3)] || 1; v.stress = pk.filter(f => e[f] >= thr);
});
const moAt = (i, t) => {
  const v = VO[i], f = (t - LEAD) * FPS; if (f <= 0) return VIS.X;
  let k = 0; while (k < v.keys.length - 2 && v.keys[k + 1][0] <= f) k++;
  const [f0, a] = v.keys[k], [f1, b] = v.keys[Math.min(k + 1, v.keys.length - 1)], u = f1 > f0 ? ease((f - f0) / (f1 - f0)) : 1, A = VIS[a], B = VIS[b], o = {};
  for (const key in A) o[key] = A[key] + (B[key] - A[key]) * u;
  const env = v.esm[Math.min(v.esm.length - 1, Math.max(0, Math.round(f)))] || 0; o.open *= clamp(0.5 + 0.7 * env, 0, 1.1); return o;
};
const bellSum = (i, t) => VO[i].stress.reduce((a, f) => a + Math.exp(-Math.pow((t - LEAD - f / FPS - 0.04) / 0.13, 2)), 0);
const talkAt = (i, t) => clamp((t - LEAD + 0.15) / 0.3) * clamp((LEAD + VO[i].dur + 0.35 - t) / 0.35);
const blinkV = (t, at) => Math.max(0, ...at.map(a => 1 - Math.abs(t - a) / 0.09));

// ---- the four mums ----
const TYPES = [
  {num: '01', word: 'UNDER THE WEATHER', name: 'ПРИБОЛЕТЬ', col: '#2f9a5a', bg: 'kitchen', arm: 'advise', prop: null, fx: 'cloud', look: {dress: '#f0628f', dot: '#ffd3e0', shawl: '#ffc0d3', bead: '#fff4e8', shadow: '#f39ac0'}, st: {lid: .2, tilt: .03}},
  {num: '02', word: 'ALL EARS', name: 'ВСЯ ВНИМАНИЕ', col: '#d8344a', bg: 'beige', arm: 'spread', prop: null, fx: 'ears', look: {dress: '#5d97d8', dot: '#d3e5fb', shawl: '#2f5f9a', bead: '#ffffff', shadow: '#6aaee8'}, st: {lid: .05, brow: 6}},
  {num: '03', word: 'RAINING CATS AND DOGS', name: 'ЛЬЁТ КАК ИЗ ВЕДРА', col: '#e8a21c', bg: 'stripes', arm: 'advise', prop: null, fx: 'rain', look: {dress: '#2f6b45', dot: '#2f6b45', shawl: '#1f4d33', bead: '#e2b84a', shadow: '#4f9a6a'}, st: {lid: .1, tilt: -.02}},
  {num: '04', word: "MUM'S THE WORD", name: 'Я МОГИЛА, НИКОМУ НИ СЛОВА', col: '#2b3048', bg: 'pink', arm: 'phone', prop: 'phone', fx: 'call', look: {dress: '#f0628f', dot: '#ffd3e0', shawl: '#ffc0d3', bead: '#fff4e8', shadow: '#f39ac0'}, st: {lid: .15, tilt: .02}},
];
Object.assign(C, {hairP: '#5b3322', hairM: '#c26a38'});
Object.assign(ARMS, {
  advise: (x, y) => ({L: {e: [x - 410, y + 480], h: [x - 300, y + 648], mode: 'hold', ang: 0.95, flip: 1}, R: {e: [x + 370, y + 500], h: [x + 420, y + 330], mode: 'open', ang: -1.35, flip: 1}}),
  ladle: (x, y) => ({L: {e: [x - 410, y + 480], h: [x - 300, y + 648], mode: 'hold', ang: 0.95, flip: 1}, R: {e: [x + 360, y + 520], h: [x + 290, y + 380], mode: 'hold', ang: Math.PI + 0.35, flip: -1}}),
  phone: (x, y) => ({L: {e: [x - 410, y + 480], h: [x - 300, y + 648], mode: 'hold', ang: 0.95, flip: 1}, R: {e: [x + 340, y + 520], h: [x + 270, y + 400], mode: 'hold', ang: -2.1, flip: -1}}),
});
const PROPS = {
  ladle: () => { shape([[14, -250], [30, -250], [30, 40], [14, 40]], '#c9ced6', 3); shape([[-30, -330], [74, -330], [60, -262], [22, -246], [-16, -262]], '#c9ced6', 3.5); },
  phone: () => { shape([[-20, -150], [70, -150], [70, 10], [-20, 10]], '#1c1c24', 3.5); shape([[-10, -138], [60, -138], [60, -4], [-10, -4]], '#9fe6b8', 0); oval(25, -90, 16, 16, '#f6c8a8', 2.5); },
};
const HAIR0 = {hairP: C.hairP, hairM: C.hairM};

// ---- backgrounds ----
function bgType(kind) {
  const b = (c) => { g.fillStyle = c; g.fillRect(0, 0, W, H); };
  if (kind === 'kitchen') { b('#f7efe2'); g.strokeStyle = 'rgba(180,160,130,0.35)'; g.lineWidth = 3; for (let x = 0; x <= W; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
  else if (kind === 'beige') { b('#efe3cc'); const gr = g.createRadialGradient(540, 700, 100, 540, 700, 1100); gr.addColorStop(0, 'rgba(255,250,235,0.6)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  else if (kind === 'stripes') { b('#e4f4ea'); g.fillStyle = '#d0ecdb'; for (let x = 0; x < W; x += 120) g.fillRect(x, 0, 60, H); }
  else if (kind === 'dark') { b('#22242e'); g.save(); g.rotate(-0.5); g.fillStyle = '#2b2e3a'; for (let x = -2000; x < 2000; x += 140) g.fillRect(x, -400, 70, 3200); g.restore(); }
  else if (kind === 'pink') { b('#f9d3e2'); g.save(); g.rotate(-0.5); g.fillStyle = '#f6c1d6'; for (let x = -2000; x < 2000; x += 140) g.fillRect(x, -400, 70, 3200); g.restore(); }
}

// ---- UI: badge, bilingual bubble, karaoke, watermark ----
const FB = 'NL, NC';
function rrect(x, y, w, h, r, fill, stroke = C.ink, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function badge(tp, k = 1) {
  if (!tp) return; const a = ease(k / .2);
  g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * -30);
  let wf = 64; g.font = `${wf}px ${FB}`; let ww = g.measureText(tp.word).width; if (ww > 760) { wf = Math.floor(64 * 760 / ww); g.font = `${wf}px ${FB}`; ww = g.measureText(tp.word).width; } g.font = `30px ${FB}`; g.letterSpacing = '2px'; ww = Math.max(ww, g.measureText(tp.name).width + 6); g.letterSpacing = '0px'; const w = 150 + ww + 50, x0 = (W - w) / 2;
  rrect(x0, 110, w, 130, 26, '#fffdf6', '#24432c', 5);
  rrect(x0 + 18, 130, 104, 90, 20, tp.col, null);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `56px ${FB}`; g.fillText(tp.num, x0 + 70, 177);
  g.fillStyle = '#24432c'; g.font = `${wf}px ${FB}`; g.textAlign = 'left'; g.fillText(tp.word, x0 + 150, 160);
  g.fillStyle = tp.col === '#2b3048' ? '#5a6080' : tp.col; g.font = `30px ${FB}`; g.letterSpacing = '2px'; g.fillText(tp.name, x0 + 152, 212); g.letterSpacing = '0px';
  g.restore();
}
function wrap(text, font, maxW) { g.font = font; const out = []; let l = ''; for (const w of text.split(' ')) { const t = l ? l + ' ' + w : w; if (g.measureText(t).width > maxW && l) { out.push(l); l = w; } else l = t; } out.push(l); return out; }
function bubble2(en, ru, k) {
  const a = ease(k / .18); if (a <= 0) return;
  const fe = `50px ${FB}`, fr = `34px ${FB}`, le = wrap(en, fe, 820), lr = wrap(ru, fr, 820), h = 50 + le.length * 60 + 26 + lr.length * 42 + 30, y0 = 290;
  g.save(); g.globalAlpha = a; g.translate(540, y0 + h / 2); g.scale(.9 + .1 * a, .9 + .1 * a); g.translate(-540, -(y0 + h / 2));
  rrect(70, y0, 940, h, 34, '#fffdf6', '#24432c', 5);
  g.beginPath(); g.moveTo(560, y0 + h - 2); g.lineTo(530, y0 + h + 46); g.lineTo(610, y0 + h - 2); g.closePath(); g.fillStyle = '#fffdf6'; g.fill(); g.strokeStyle = '#24432c'; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fffdf6'; g.fillRect(556, y0 + h - 8, 50, 10);
  rrect(840, y0 - 18, 120, 40, 20, '#d8344a', null); g.fillStyle = '#fff'; g.font = `26px ${FB}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MUM', 900, y0 + 2);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#24432c'; g.font = fe; le.forEach((l, q) => g.fillText(l, 110, y0 + 82 + q * 60));
  const yr = y0 + 82 + le.length * 60; g.strokeStyle = 'rgba(216,52,74,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(110, yr - 30); g.lineTo(970, yr - 30); g.stroke();
  g.fillStyle = '#d23a6e'; g.font = fr; lr.forEach((l, q) => g.fillText(l, 110, yr + 16 + q * 42));
  g.restore();
}
function karaoke(text, u) { // u = 0..1 progress through the line
  const words = text.split(' '), wts = words.map(w => w.replace(/[^\p{L}]/gu, '').length + 1), tot = wts.reduce((a, b) => a + b, 0);
  let acc = 0, cur = 0; for (let q = 0; q < words.length; q++) { if (u * tot >= acc) cur = q; acc += wts[q]; }
  const font = `62px ${FB}`, lines = []; g.font = font; let l = [];
  words.forEach((w, q) => { const t = [...l.map(i => words[i]), w].join(' ').toUpperCase(); if (g.measureText(t).width > 940 && l.length) { lines.push(l); l = [q]; } else l.push(q); }); lines.push(l);
  lines.forEach((ln, r) => {
    const txt = ln.map(i => words[i].toUpperCase()), widths = txt.map(t => g.measureText(t + ' ').width), tw = widths.reduce((a, b) => a + b, 0); let x = (W - tw) / 2; const y = 1560 + r * 76 - (lines.length - 1) * 38;
    txt.forEach((t, j) => { const i = ln[j]; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#1e2a20'; g.strokeText(t, x, y); g.fillStyle = i === cur ? '#ffd23a' : (i < cur ? '#ffffff' : 'rgba(255,255,255,0.75)'); g.fillText(t, x, y); x += widths[j]; });
  });
}
function watermark() { g.font = `30px ${FB}`; const t = '@speak_in_english', w = g.measureText(t).width + 50; rrect((W - w) / 2, 1772, w, 50, 25, 'rgba(36,67,44,0.75)', null); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, W / 2, 1798); }

// ---- cutaway cards ----
function phoneCard(lines, ring, t) {
  const sh = ring ? Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0 ? 1 : 0) : 0;
  g.save(); g.translate(540 + sh, 1000); g.rotate(sh * .004);
  rrect(-230, -420, 460, 840, 60, '#1c1c24', C.ink, 6); rrect(-200, -390, 400, 780, 40, '#f4f1ea', null);
  oval(0, -170, 90, 90, '#ffd9e6', 5); oval(0, -190, 34, 34, C.skin, 3.5); shape([[-60, -120], [60, -120], [50, -150], [0, -160], [-50, -150]], '#f0628f', 3);
  shape([[-40, -232], [40, -232], [52, -200], [-52, -200]], C.hairP, 3);
  g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach(([txt, sz, col], q) => { g.font = `${sz}px ${FB}`; g.fillStyle = col; g.fillText(txt, 0, -10 + q * 80); });
  g.restore();
  if (ring) { for (const s of [-1, 1]) for (let q = 1; q <= 2; q++) { g.beginPath(); g.arc(540, 1000, 270 + q * 40, s > 0 ? -.4 : Math.PI - .4, s > 0 ? .4 : Math.PI + .4); g.strokeStyle = 'rgba(36,67,44,0.5)'; g.lineWidth = 6; g.stroke(); } }
}
// ---- literal effects drawn over the mum (world coordinates, Irina at x=540, y=1000) ----
function cloudShape(cx, cy, k) { const P = [[-80, 0, 80, 62], [70, 0, 80, 60], [-5, -40, 95, 78], [0, 30, 140, 40]];
  g.save(); g.translate(cx, cy); g.scale(k, k); P.forEach(([x, y, rx, ry]) => oval(x, y, rx, ry, null, 10)); P.forEach(([x, y, rx, ry]) => oval(x, y, rx, ry, '#eef2f8', 0)); g.restore(); }
function ear(x, y, ang, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(ang); g.scale(k, k); shape([[-30, -62], [10, -74], [44, -40], [42, 10], [24, 50], [-4, 70], [-26, 52], [-12, 20], [-34, -10]], C.skin); shape([[-8, -44], [18, -48], [26, -16], [16, 18], [0, 34], [-6, 12], [-16, -12]], '#f3b2a4', 3); g.restore(); }
function cat(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); shape([[-40, -18], [-32, -64], [-8, -34]], '#9aa3b5', 4); shape([[40, -18], [32, -64], [8, -34]], '#9aa3b5', 4); oval(0, 0, 48, 40, '#9aa3b5'); oval(-16, -6, 6, 8, C.ink, 0); oval(16, -6, 6, 8, C.ink, 0); oval(0, 8, 6, 4, '#f29aa8', 0);
  for (const s of [-1, 1]) { line([[s * 14, 12], [s * 60, 4]], 2.5); line([[s * 14, 16], [s * 58, 22]], 2.5); } g.restore(); }
function dog(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); oval(-46, 6, 17, 32, '#8a5a33'); oval(46, 6, 17, 32, '#8a5a33'); oval(0, 0, 48, 42, '#d59a5c'); oval(-16, -8, 6, 8, C.ink, 0); oval(16, -8, 6, 8, C.ink, 0); oval(0, 12, 12, 8, C.ink, 0); g.restore(); }
function bucket(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.arc(0, -36, 46, Math.PI, 0); g.strokeStyle = C.ink; g.lineWidth = 4.5; g.stroke(); shape([[-52, -36], [52, -36], [40, 40], [-40, 40]], '#a9bed4'); oval(0, -36, 52, 12, '#7f98b3'); g.restore(); }
function rainDrops(x0, x1, y0, y1, t, n, seed = 1) { g.strokeStyle = '#4aa3e8'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = x0 + ((i * 97 + seed * 31) % (x1 - x0)), y = y0 + ((t * 900 + i * 137) % (y1 - y0)); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 34); g.stroke(); } }
const FX = {
  cloud: (k, t) => { if (k <= 0) return; g.save(); g.beginPath(); g.rect(360, 690, 360, 520); g.clip(); g.globalAlpha = k; rainDrops(380, 700, 690, 1210, t, 12); g.restore(); cloudShape(540, 640, k); },
  ears: (k, t) => { const P = [[-300, -100, -0.5], [300, -100, 0.5], [-260, -290, -0.8], [260, -290, 0.8], [-110, -390, -0.2], [110, -390, 0.2], [-330, 90, -0.3], [330, 90, 0.3]];
    P.forEach(([dx, dy, a], i) => ear(540 + dx, 980 + dy, a + Math.sin(t * 6 + i) * 0.08, clamp((k * 1.6 - i * 0.08)) * (1 + 0.15 * Math.sin(Math.PI * clamp(k * 1.6 - i * 0.08))))); },
  rain: (k, t) => { if (k <= 0) return; g.save(); g.globalAlpha = Math.min(1, k * 2); rainDrops(140, 940, 200, 1700, t, 18, 3);
    const items = [[cat, 230, 0], [dog, 820, 400], [cat, 690, 800], [dog, 330, 1150], [bucket, 520, 600], [cat, 880, 1300], [dog, 160, 700]];
    items.forEach(([fn, x, off], i) => { const y = 150 + ((t * 620 + off) % 1600); fn(x, y, Math.sin(t * 3 + i) * 0.5); }); g.restore(); },
  call: (k, t) => { if (k <= 0) return; const sh = Math.sin(t * 40) * 5 * (Math.sin(t * 3) > 0 ? 1 : 0); g.save(); g.translate(640 + sh, 1180); g.scale(k, k);
    rrect(-120, -70, 240, 120, 30, '#fffdf6', '#24432c', 5); g.fillStyle = '#24432c'; g.font = `56px ${FB}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MUM', 0, -18); g.fillStyle = '#2f9a5a'; g.font = `26px ${FB}`; g.fillText('incoming call', 0, 26);
    for (const s of [-1, 1]) for (let q = 1; q <= 2; q++) { g.beginPath(); g.arc(0, 0, 130 + q * 30, s > 0 ? -.35 : Math.PI - .35, s > 0 ? .35 : Math.PI + .35); g.strokeStyle = 'rgba(36,67,44,0.6)'; g.lineWidth = 6; g.stroke(); } g.restore(); },
};
function idiomCard(i, t, icon) {
  const tp = TYPES[i]; rrect(110, 560, 860, 520, 40, '#fffdf6', '#24432c', 6);
  g.textAlign = 'center'; g.textBaseline = 'middle'; const le = wrap(tp.word, `92px ${FB}`, 760); g.font = `92px ${FB}`; g.fillStyle = '#24432c'; le.forEach((l, q) => g.fillText(l, 540, 680 + q * 100));
  const y1 = 680 + le.length * 100 + 10; line([[300, y1 - 30], [780, y1 - 30]], 3); g.font = `58px ${FB}`; g.fillStyle = '#d23a6e'; wrap('= ' + tp.name.toLowerCase(), `58px ${FB}`, 780).forEach((l, q) => g.fillText(l, 540, y1 + 40 + q * 66));
  if (icon) { g.save(); g.translate(0, 0); icon(t); g.restore(); } }
const CARDS = {
  intro: (t) => { bgType('pink');
    g.save(); g.translate(540, 1000); g.rotate(-0.06); rrect(-250, -320, 500, 640, 24, '#2f9a5a', C.ink, 6); rrect(-215, -285, 430, 570, 16, '#fffdf6', null);
    g.fillStyle = '#24432c'; g.font = `70px ${FB}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ENGLISH', 0, -140); g.fillText('IDIOMS', 0, -60); g.fillStyle = '#d8344a'; g.font = `44px ${FB}`; g.fillText('1000 фраз', 0, 30);
    cloudShape(-60, 160, .45); dog(80, 170, 0.2); g.restore();
    rrect(130, 170, 820, 240, 34, '#fffdf6', '#24432c', 5); g.fillStyle = '#24432c'; g.font = `72px ${FB}`; g.textAlign = 'center'; g.fillText('МАМА И ИДИОМЫ', 540, 250); g.fillStyle = '#d8344a'; g.font = `50px ${FB}`; g.fillText('ПОНИМАЕТ БУКВАЛЬНО', 540, 340); },
  0: (t) => { bgType('kitchen'); idiomCard(0, t, (tt) => cloudShape(540, 1260, .7)); },
  1: (t) => { bgType('beige'); idiomCard(1, t, (tt) => { ear(450, 1270, -0.3, 1); ear(630, 1270, 0.3, 1); }); },
  2: (t) => { bgType('stripes'); idiomCard(2, t, (tt) => { cat(400, 1280, -0.2); dog(560, 1300, 0.15); bucket(730, 1300, 0.1); });
    g.fillStyle = '#24432c'; g.font = `40px ${FB}`; g.textAlign = 'center'; g.fillText('у них кошки и собаки — у нас ведро', 540, 1440); },
  3: (t) => { bgType('dark'); phoneCard([['MUM', 92, '#24432c'], ['incoming call', 40, '#2f9a5a']], true, t); },
  end: (t) => { bgType('pink'); rrect(110, 230, 860, 300, 34, '#fffdf6', '#24432c', 5);
    g.fillStyle = '#24432c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `66px ${FB}`; g.fillText('КАКУЮ ИДИОМУ', 540, 315); g.fillText('ПОКАЗАТЬ БУКВАЛЬНО?', 540, 395); g.font = `34px ${FB}`; g.fillStyle = '#d8344a'; g.fillText('НАПИШИ В КОММЕНТАХ', 540, 470);
    TYPES.forEach((tp, q) => { const k = ease((t - .2 - q * .15) / .3); if (k <= 0) return; const y = 600 + q * 140;
      g.save(); g.globalAlpha = k; rrect(140, y, 800, 116, 26, tp.col, C.ink, 5); g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `64px ${FB}`; g.fillText(String(q + 1), 175, y + 60); let f = 46; g.font = `${f}px ${FB}`; while (g.measureText(tp.word).width > 680) { f -= 2; g.font = `${f}px ${FB}`; } g.fillText(tp.word, 250, y + 60); g.restore(); });
    const k2 = ease((t - 1) / .3); g.save(); g.globalAlpha = k2; rrect(300, 1200, 480, 100, 50, '#ffd23a', C.ink, 5); g.fillStyle = '#24432c'; g.font = `46px ${FB}`; g.textAlign = 'center'; g.fillText('СОХРАНИ', 540, 1252); g.restore(); },
};

// ---- timeline ----
const SHOTS = [];
SHOTS.push({kind: 'card', card: 'intro', nar: 0, lead: .3, tail: .5});
TYPES.forEach((tp, i) => {
  SHOTS.push({kind: 'mum', i, tp, lead: .45, tail: 1.5});
  SHOTS.push({kind: 'card', card: i, tp, nar: i + 1, lead: .2, tail: .45});
});
SHOTS.push({kind: 'card', card: 'end', nar: 5, lead: .4, tail: 1.6});
SHOTS.forEach(s => { s.dur = s.lead + (s.kind === 'mum' ? VO[s.i].dur : NAR[s.nar].dur) + s.tail; });
const TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0);
const MED = {z: 1.3, cx: 540, cy: 960};

function frame(time) {
  let s0 = 0, shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) { if (time < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
  const t = time - s0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (shot.kind === 'mum') {
    const tp = shot.tp, tv = t - shot.lead + LEAD;
    Object.assign(C, HAIR0, tp.look); SHADED = new Set([C.skin, C.hairP, C.hairM, C.shawl, '#c9ced6', '#1c1c24']);
    bgType(tp.bg);
    g.translate(W / 2, H / 2); const z = MED.z * (1 + t * .01); g.scale(z, z); g.translate(-MED.cx, -MED.cy);
    const st = Object.assign({t, time}, tp.st);
    st.talk = talkAt(shot.i, tv); st.mo = moAt(shot.i, tv); const bump = Math.min(1, bellSum(shot.i, tv));
    st.nod = bump * st.talk; st.browUp = (st.brow || 0) + 7 * bump;
    st.smile = st.after === 'smile' ? ease((tv - LEAD - VO[shot.i].dur - 0.05) / 0.45) : 0;
    st.blink = Math.max(blinkV(tv, [LEAD + VO[shot.i].dur + 0.2]), blinkV(t, [.18]));
    st.tilt = (st.tilt || 0) * ease(t / .6); st.look = 0;
    st.armA = 'hips'; st.armB = tp.arm; st.armK = clamp((t - .1) / .45); st.prop = tp.prop;
    const fxK = clamp((tv - LEAD - VO[shot.i].dur * 0.85) / 0.4); st.browUp += 14 * fxK; if (fxK > 0) st.lid = (st.lid || 0) * (1 - fxK);
    if (tp.fx === 'rain') { FX.rain(fxK, t); irina(st); } else { irina(st); FX[tp.fx](fxK, t); }
    if (tp.fx === 'rain') FX.rain(fxK, t + 0.37);
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
    badge(tp, 1); const bk = tv - LEAD, bend = VO[shot.i].dur + 0.05; if (bk < bend + 0.2) { g.save(); g.globalAlpha = clamp((bend + 0.2 - bk) / 0.2); bubble2(TEXTS[shot.i], RU[shot.i], bk); g.restore(); }
  } else {
    CARDS[shot.card](t); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
    if (shot.tp) badge(shot.tp, 1);
    const u = clamp((t - shot.lead) / NAR[shot.nar].dur); if (t >= shot.lead - .05) karaoke(SCRIPT.nar[shot.nar], u);
  }
  watermark();
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'); fs.mkdirSync(outDir, {recursive: true});
if (process.argv[2]) { { let a = 0; console.log(SHOTS.map(s => { const r = `${s.kind}${s.kind === 'mum' ? s.i : ':' + s.card}@${a.toFixed(2)}+${s.dur.toFixed(2)}`; a += s.dur; return r; }).join(' ')); } for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(1)); process.exit(0); }
const out = path.join(outDir, 'literally_tl.mp4'), silent = path.join(tmp, 'silent.mp4');
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const AUD = path.join(D, '..', '..', 'asya', 'audio'), ev = []; let s0 = 0;
  for (const s of SHOTS) {
    ev.push([s0 + s.lead, s.kind === 'mum' ? VO[s.i].wav : NAR[s.nar].wav, 1.0]);
    if (s.kind === 'mum') ev.push([s0 + .05, path.join(AUD, 'pop.mp3'), .35]);
    if (s.card === 'intro') ev.push([s0 + .05, path.join(AUD, 'beep.mp3'), .5]);
    if (s.card === 'end') ev.push([s0 + .1, path.join(AUD, 'ding.mp3'), .5]);
    s0 += s.dur;
  }
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')]; ev.forEach(([, f]) => args.push('-i', f));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.12,afade=t=out:st=${(TOTAL - 0.8).toFixed(2)}:d=0.8[m]`; const lab = ['[m]'];
  ev.forEach(([t, , v], i) => { const ms = Math.round(t * 1000); fc += `;[${i + 2}:a]aresample=48000,volume=${v},adelay=${ms}|${ms}[s${i}]`; lab.push(`[s${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, {stdio: 'inherit'}).status) throw new Error('mix failed');
  fs.rmSync(tmp, {recursive: true, force: true}); console.log(out, TOTAL.toFixed(1));
})();
