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

// ---------- paper grain ----------
const PAPER = (() => { const c = createCanvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); let s = 3;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < im.data.length; i += 4) { const v = 150 + (r() - .5) * 120; im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v; im.data[i + 3] = 14; }
  x.putImageData(im, 0, 0); x.strokeStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 2500; i++) { const px = r() * W, py = r() * H, a = r() * 6.28, l = 4 + r() * 14; x.lineWidth = .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c; })();

// ---------- smooth shapes (Catmull-Rom through points) ----------
function crPath(pts, closed = true, tension = 0.5) {
  const n = pts.length, P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  g.beginPath(); g.moveTo(...pts[0]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3, p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  if (closed) g.closePath();
}
function shape(pts, fill, lw = LW, closed = true) { crPath(pts, closed); if (fill && closed) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
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

// ---------- Ирина Павловна — rigged (head group, jaw, secondary motion) ----------
// st: time, t, jaw 0..1 (smoothed voice), talk 0..1, smile 0..1, blink 0..1, lid, look, brow, pen 0..1, writing, push
function irina(st) {
  const x = 540, y = 1000, j = st.jaw || 0, sm = st.smile || 0, talk = st.talk || 0, T = st.time;
  const breath = Math.sin(T * 1.25);
  // head motion: slow idle sway + talking accents + small nod that follows the jaw
  const rot = 0.022 * Math.sin(T * 0.8) + talk * (0.018 * Math.sin(T * 2.3 + 1) + 0.012 * Math.sin(T * 3.7)) - sm * 0.03;
  const nod = talk * (1.5 + 5 * j) + breath * 1.2;
  const piv = [x, y + 175];
  const head = (fn) => { g.save(); g.translate(piv[0], piv[1] + nod); g.rotate(rot); g.translate(-piv[0], -piv[1]); fn(); g.restore(); };
  const sway = (pts, k = 1) => pts.map(([px, py]) => { const w = clamp((py - (y - 60)) / 220); return [px + w * k * (4 * Math.sin(T * 1.1 + .6) - rot * 140), py]; });

  // 1) back hair (part of the head group)
  head(() => {
    shape(sway([[x - 205, y + 160], [x - 236, y + 30], [x - 240, y - 90], [x - 205, y - 195], [x - 120, y - 262], [x, y - 284], [x + 128, y - 262], [x + 214, y - 192], [x + 244, y - 80], [x + 240, y + 40], [x + 214, y + 162], [x + 150, y + 182], [x - 150, y + 180]]), C.hairP);
  });

  // 2) body (breathes)
  g.save(); g.translate(0, breath * 1.6);
  shape([[x - 86, y + 110], [x + 86, y + 110], [x + 102, y + 240], [x - 102, y + 240]], C.skin);
  shape([[x - 220, y + 210], [x + 220, y + 210], [x + 255, y + 320], [x + 60, y + 455], [x, y + 475], [x - 60, y + 455], [x - 255, y + 320]], C.skin);
  line([[x - 160, y + 250], [x - 80, y + 262]], 3); line([[x + 160, y + 250], [x + 80, y + 262]], 3);
  const dress = [[x - 305, 1620], [x - 292, y + 330], [x - 238, y + 272], [x - 60, y + 438], [x, y + 482], [x + 60, y + 438], [x + 238, y + 272], [x + 292, y + 330], [x + 305, 1620]];
  shape(dress, C.dress);
  g.save(); crPath(dress); g.clip(); g.fillStyle = C.dot; for (let i = 0; i < 16; i++) for (let k = 0; k < 10; k++) { g.beginPath(); g.arc(x - 300 + i * 42 + (k % 2) * 21, y + 280 + k * 40, 6, 0, 7); g.fill(); } g.restore();
  crPath(dress); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke();
  line([[x - 238, y + 272], [x + 40, y + 520], [x + 150, y + 600]], 3.5);
  line([[x - 2, y + 418], [x + 2, y + 470]], 3);
  line([[x - 255, y + 420], [x - 200, y + 525], [x - 105, y + 548], [x - 14, y + 505]], 3.5);
  line([[x + 255, y + 420], [x + 200, y + 525], [x + 105, y + 548], [x + 14, y + 505]], 3.5);
  for (let i = 0; i <= 11; i++) { const u = i / 11, px = x - 150 + u * 300, py = y + 238 + Math.sin(u * Math.PI) * 92 + Math.sin(T * 1.25 + u) * 1.5; oval(px, py, 17, 17, C.bead, 3.5); oval(px - 5, py - 5, 4, 4, 'rgba(255,255,255,0.8)', 0); }
  g.restore();

  // 3) face + features + front hair (head group, jaw deforms the lower face)
  head(() => {
    const D = j * 24; // jaw drop
    const F = [[-186, -60, 0], [-160, -150, 0], [-80, -192, 0], [80, -192, 0], [160, -150, 0], [186, -60, 0], [184, 40, .12], [146, 126, .5], [66, 178, .88], [0, 186, 1], [-66, 178, .88], [-146, 126, .5], [-184, 40, .12]];
    shape(F.map(([dx, dy, w]) => [x + dx * (1 - w * j * .04), y + dy + w * D]), C.skin);
    line([[x - 66, y + 202 + D * .9], [x, y + 216 + D], [x + 66, y + 202 + D * .9]], 3); // double chin follows the jaw
    oval(x - 115, y + 76 - sm * 9, 54, 44, C.cheek, 0); oval(x + 115, y + 76 - sm * 9, 54, 44, C.cheek, 0);
    // eyes
    const lid = Math.max(st.lid || 0, st.blink || 0), br = (st.brow || 0) + talk * j * 6;
    for (const s of [-1, 1]) {
      const ex = x + s * 76, ey = y + 6, almond = [[ex - 44, ey], [ex - 16, ey - 20], [ex + 18, ey - 20], [ex + 44, ey + 2], [ex + 16, ey + 22], [ex - 18, ey + 22]];
      shape([[ex - 54, ey - 2], [ex - 22, ey - 38 - br * .5], [ex + 24, ey - 38 - br * .5], [ex + 56, ey - 2], [ex + 26, ey - 22], [ex - 22, ey - 22]], C.shadow, 3.5);
      shape(almond, '#ffffff', 0);
      g.save(); crPath(almond); g.clip();
      oval(ex + (st.look || 0) * 10, ey + 4, 23, 23, C.ink, 0); oval(ex + (st.look || 0) * 10 + 8, ey - 4, 6, 6, '#ffffff', 0);
      const lc = ey - 22 + 46 * lid; g.fillStyle = C.skin; g.beginPath(); g.moveTo(ex - 50, ey - 40); g.lineTo(ex + 50, ey - 40); g.lineTo(ex + 50, lc); g.quadraticCurveTo(ex, lc + 10 * (1 - lid), ex - 50, lc); g.fill();
      if (sm > 0) { const ly2 = ey + 24 - sm * 12; g.beginPath(); g.moveTo(ex - 50, ey + 40); g.lineTo(ex + 50, ey + 40); g.lineTo(ex + 50, ly2); g.quadraticCurveTo(ex, ly2 - 8, ex - 50, ly2); g.fill(); }
      g.restore();
      if (lid < 0.95) { crPath(almond); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.stroke(); }
      const ly = ey - 21 + 44 * lid; line([[ex - 46, ey + 1], [ex - 14, ly], [ex + 18, ly], [ex + 46, ey + 2]], 5.5);
      for (let k = 0; k < 6; k++) { const lx = ex - 40 + k * 16, a = Math.sin(k / 5 * Math.PI); line([[lx, ly - 2 - a * 6], [lx + s * 3, ly - 10 - a * 8]], 2); }
      for (const k of [-24, -10, 6]) line([[ex + k, ey + 27 - sm * 6], [ex + k - 3, ey + 36 - sm * 6]], 2);
      shape([[ex - 52, ey - 72 - br], [ex - 10, ey - 90 - br], [ex + 42, ey - 80 - br], [ex + 46, ey - 66 - br], [ex - 8, ey - 74 - br], [ex - 50, ey - 58 - br]].map(([px, py]) => [s > 0 ? 2 * ex - px : px, py]), C.brow, 3);
    }
    shape([[x - 8, y + 22], [x + 8, y + 22], [x + 15, y + 72], [x, y + 80], [x - 15, y + 72]], C.nose, 0);
    for (const s of [-1, 1]) line([[x + s * (62 + sm * 8), y + 84], [x + s * (76 + sm * 10), y + 112 + D * .3], [x + s * (72 + sm * 8), y + 138 + D * .6]], 3);
    oval(x + 64 + sm * 6, y + 104 - sm * 3, 5, 5, C.ink, 0);
    // mouth: upper lip anchored to the skull, lower lip rides on the jaw
    const my = y + 124, Dm = j * 30, w = 44 + sm * 16 - j * 8, cy = my + 2 + Dm * .3 - sm * 9;
    const upper = [[x - w, cy], [x - w * .5, my - 14], [x, my - 8], [x + w * .5, my - 14], [x + w, cy], [x + w * .45, my + 3], [x, my + 4], [x - w * .45, my + 3]];
    const lowerTop = [[x - w * .45, my + 4 + Dm], [x, my + 6 + Dm], [x + w * .45, my + 4 + Dm]];
    if (Dm > 3) {
      const inner = [[x - w + 4, cy], [x - w * .45, my + 3], [x, my + 4], [x + w * .45, my + 3], [x + w - 4, cy], ...lowerTop.slice().reverse()];
      shape(inner, C.mouthIn, 3);
      g.save(); crPath(inner); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(x - w, my, w * 2, Math.min(12, Dm * .45)); oval(x, my + 8 + Dm, w * .45, Dm * .38 + 2, C.tongue, 0); g.restore();
    }
    shape(upper, C.lip, 3.5);
    shape([[x - w + 2, cy + 1], ...lowerTop, [x + w - 2, cy + 1], [x + w * .4, my + 24 + Dm], [x, my + 28 + Dm], [x - w * .4, my + 24 + Dm]], C.lip, 3.5);
    if (Dm <= 3) line([[x - w, cy], [x, my + 4], [x + w, cy]], 3);
    if (sm > .3) { line([[x - w - 8, cy - 8], [x - w - 2, cy + 4]], 2.5); line([[x + w + 8, cy - 8], [x + w + 2, cy + 4]], 2.5); }
    line([[x - 18, my + 46 + D], [x, my + 50 + D], [x + 18, my + 46 + D]], 2.5); // chin crease under the lip
    // earrings swing with the head
    for (const s of [-1, 1]) {
      const ex = x + s * 206, ey = y + 150, a = 0.22 * Math.sin(T * 2.6 + s) * (0.3 + talk * .7) - rot * 2.5;
      g.save(); g.translate(ex, ey); g.rotate(a); oval(0, 0, 13, 13, C.gold, 3.5); shape([[0, 12], [14, 42], [0, 58], [-14, 42]], C.gold, 3.5); g.restore();
    }
    // front hair: side part, locks framing the face, strands follow the flow, tips curl in
    const left = sway([[x - 72, y - 262], [x - 160, y - 236], [x - 216, y - 150], [x - 226, y - 30], [x - 214, y + 92], [x - 192, y + 156], [x - 166, y + 116], [x - 172, y - 20], [x - 152, y - 120], [x - 98, y - 190]]);
    const right = sway([[x - 72, y - 262], [x + 60, y - 272], [x + 182, y - 216], [x + 236, y - 100], [x + 234, y + 40], [x + 212, y + 158], [x + 172, y + 128], [x + 178, y + 0], [x + 160, y - 82], [x + 92, y - 152], [x - 10, y - 172], [x - 60, y - 196]]);
    shape(left, C.hairP); shape(right, C.hairP);
    shape(sway([[x - 44, y - 246], [x + 62, y - 256], [x + 156, y - 204], [x + 198, y - 112], [x + 186, y - 30], [x + 158, y - 96], [x + 76, y - 168], [x - 20, y - 206]]), C.hairM);
    for (const p of [[[x - 60, y - 252], [x + 40, y - 240], [x + 150, y - 190], [x + 205, y - 70], [x + 208, y + 70], [x + 192, y + 140]],
      [[x - 50, y - 232], [x + 30, y - 212], [x + 118, y - 156], [x + 160, y - 60]], [[x + 20, y - 200], [x + 110, y - 180], [x + 176, y - 110]],
      [[x - 84, y - 248], [x - 165, y - 205], [x - 202, y - 100], [x - 204, y + 50], [x - 188, y + 130]], [[x - 96, y - 226], [x - 150, y - 180], [x - 176, y - 60]]]) line(sway(p), 2.6);
  });

  // 4) arms, shawl, notebook, hands (smooth, organic motion)
  const pen = st.pen || 0, wn = st.writing ? [5 * Math.sin(st.t * 2.3) + 3 * Math.sin(st.t * 3.7 + 1), 3 * Math.sin(st.t * 2.9 + .5)] : [0, 0];
  const gest = talk * (6 * Math.sin(T * 1.9) + 10 * j);
  const L = [x - 215, y + 470 + breath * 1.6], R = [x + 30 + pen * 145 + wn[0], y + 470 - pen * 118 + wn[1] - gest * pen];
  shape(tubePts([[x - 255, y + 320], [x - 300, y + 520], L], 112, 82), C.skin); line([[x - 300, y + 505], [x - 270, y + 520]], 2.5);
  shape(tubePts([[x + 255, y + 320], [x + 302, y + 520 - pen * 20], [R[0] + 60, R[1] + 30]], 112, 82), C.skin); line([[x + 300, y + 505 - pen * 20], [x + 270, y + 520 - pen * 20]], 2.5);
  for (const s of [-1, 1]) {
    shape([[x + s * 320, y + 290], [x + s * 252, y + 236], [x + s * 190, y + 262], [x + s * 240, y + 380], [x + s * 300, y + 470], [x + s * 352, y + 500]].map(([px, py]) => [px, py + breath * 1.6]), C.shawl);
    line([[x + s * 240, y + 270], [x + s * 280, y + 380]], 2.5); line([[x + s * 280, y + 280], [x + s * 320, y + 420]], 2.5);
    for (let k = 0; k < 6; k++) line([[x + s * (300 + k * 9), y + 470 + k * 5], [x + s * (296 + k * 9) + Math.sin(T * 1.7 + k) * 2, y + 500 + k * 5]], 2.5);
  }
  g.save(); g.translate(x - 110, y + 470 + breath * 1.6); g.rotate(-0.05);
  shape([[-140, -100], [120, -100], [118, 100], [-142, 100]], C.note);
  for (let k = 0; k < 8; k++) oval(-120 + k * 32, -100, 8, 13, null, 3);
  for (let k = 0; k < 5; k++) line([[-110, -55 + k * 30], [100, -55 + k * 30]], 2);
  line([[-80, 70], [-40, 58], [-10, 74], [30 + wn[0] * .5, 60 + wn[1]]], 2.5);
  g.restore();
  hand(L[0], L[1], -0.15, 'hold', 1, null, true);
  hand(R[0], R[1], Math.PI + 0.35 - pen * 0.4 + wn[0] * 0.004, 'hold', -1, () => { shape([[16, -140], [30, -140], [30, 60], [23, 80], [16, 60]], C.pen, 3); oval(23, -140, 8, 6, '#e8e8f2', 2.5); }, false);
}

// ---------- bubble + watermark ----------
function bubble(text, k) {
  if (!text) return;
  const a = ease(k / 0.18), s = 0.85 + 0.15 * a;
  g.save(); g.globalAlpha = a; g.translate(W / 2, 420); g.scale(s, s); g.translate(-W / 2, -420);
  g.font = '50px HL, HC'; g.letterSpacing = '7px';
  const lines = text, tw = Math.max(...lines.map(l => g.measureText(l).width)), rx = Math.max(300, tw / 2 + 110), ry = 70 + lines.length * 32;
  g.beginPath(); g.ellipse(W / 2, 420, rx, ry, 0, 0, 7); g.moveTo(W / 2 + rx * 0.45, 420 + ry * 0.75); g.lineTo(W / 2 + rx * 0.5, 420 + ry + 60); g.lineTo(W / 2 + rx * 0.68, 420 + ry * 0.62); g.closePath();
  g.fillStyle = 'rgba(255,250,252,0.72)'; g.fill();
  g.fillStyle = '#2b2424'; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, W / 2, 420 + (i - (lines.length - 1) / 2) * 68));
  g.letterSpacing = '0px'; g.restore();
}
function watermark() { g.font = '44px NL, NC'; g.letterSpacing = '3px'; g.fillStyle = 'rgba(255,255,255,0.95)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('@SHUSHA.ART', W / 2, 245); g.letterSpacing = '0px'; }


// ---------- voice (fish.audio, free model): trim, loudness envelope per frame ----------
const SR = 44100, tmp = path.join(D, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
const TEXTS = JSON.parse(fs.readFileSync(path.join(D, 'voice', 'lines.json'), 'utf8'));
const VO = TEXTS.map((_, i) => {
  const wav = path.join(tmp, `v${i}.wav`);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(D, 'voice', `l${i}.mp3`), '-af', trim + ',loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', wav]);
  const b = fs.readFileSync(wav), pcm = new Int16Array(b.buffer, b.byteOffset + 44, (b.length - 44) >> 1), spf = SR / FPS, env = [];
  for (let f = 0; f * spf < pcm.length; f++) { let s = 0, n = 0; for (let k = Math.floor(f * spf); k < Math.min(pcm.length, (f + 1) * spf); k++) { s += pcm[k] * pcm[k]; n++; } env.push(Math.sqrt(s / Math.max(1, n)) / 32768); }
  const mx = Math.max(...env) || 1; let jv = 0; const jaw = env.map(v => { const tg = Math.pow(clamp((v / mx - 0.08) / 0.75), 0.8); jv += (tg - jv) * (tg > jv ? 0.55 : 0.22); return jv; });
  return {wav, dur: pcm.length / SR, env: env.map(v => v / mx), jaw};
});
const LEAD = 0.25; // voice starts this long after the cut
const jawAt = (i, t) => { const v = VO[i], f = (t - LEAD) * FPS, k = Math.floor(f); if (k < 0) return 0; if (k >= v.jaw.length - 1) { const last = v.jaw[v.jaw.length - 1] || 0; return last * clamp(1 - (f - v.jaw.length) / 4); } return v.jaw[k] + (v.jaw[k + 1] - v.jaw[k]) * (f - k); };
const talkAt = (i, t) => clamp((t - LEAD + 0.15) / 0.3) * clamp((LEAD + VO[i].dur + 0.35 - t) / 0.35);
const blinkV = (t, at) => Math.max(0, ...at.map(a => 1 - Math.abs(t - a) / 0.09));

// ---------- shots (durations follow the voice) ----------
const MED = {z: 1.3, cx: 540, cy: 960}, CLOSE = {z: 1.8, cx: 540, cy: 900};
const SHOTS = [
  {i: 0, tail: 0.6, cam: MED, st: t => ({writing: true, look: 0.2, lid: .35}), say: ['Я ОЧЕНЬ ВНИМАТЕЛЬНО', 'ВАС ВЫСЛУШАЛА'], sfx: []},
  {i: 1, tail: 0.5, cam: MED, st: t => ({pen: ease(t / 0.5), look: 0, lid: .2, brow: 10}), say: ['И КАК СПЕЦИАЛИСТ', 'МОГУ СКАЗАТЬ…'], sfx: []},
  {i: 2, tail: 0.9, cam: CLOSE, st: t => ({pen: 1, look: 0, lid: .3, after: 'smile'}), say: ['…НАШЕ ВРЕМЯ ВЫШЛО.', 'С ВАС ПЯТЬ ТЫСЯЧ'], sfx: [['end', 'coin', 0.7]]},
  {i: 3, tail: 1.5, cam: MED, st: t => ({pen: 1, push: ease((t - 0.2) / 0.6), look: 0.3, lid: .35, after: 'smile'}), say: ['САЛФЕТКИ — ОТДЕЛЬНО'], sfx: [['end', 'sad', 0.6]]},
];
SHOTS.forEach(s => { s.dur = LEAD + VO[s.i].dur + s.tail; });
const TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0);

function frame(time) {
  let s0 = 0, shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) { if (time < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
  const t = time - s0, cam = shot.cam;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  const st = Object.assign({t}, shot.st(t));
  st.time = time; st.jaw = jawAt(shot.i, t); st.talk = talkAt(shot.i, t);
  st.smile = st.after === 'smile' ? ease((t - LEAD - VO[shot.i].dur - 0.05) / 0.45) : 0;
  st.blink = Math.max(blinkV(t, [LEAD + VO[shot.i].dur + 0.25]), blinkV(time, [1.7, 5.4, 9.3, 12.6]));
  st.look = (st.look || 0) * ease(t / 0.6);
  chair(); irina(st); table(st);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
  watermark(); bubble(t >= LEAD ? shot.say : null, t - LEAD);
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'); fs.mkdirSync(outDir, {recursive: true});
if (process.argv[2]) { for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } process.exit(0); }
const out = path.join(outDir, 'psiholog.mp4'), silent = path.join(tmp, 'silent.mp4');
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const AUD = path.join(D, '..', 'asya', 'audio'), ev = []; let s0 = 0;
  for (const s of SHOTS) { ev.push([s0 + LEAD, VO[s.i].wav, 1.0]); ev.push([s0 + LEAD - 0.05, path.join(AUD, 'pop.mp3'), 0.35]);
    for (const [when, n, v] of s.sfx) ev.push([s0 + LEAD + VO[s.i].dur + 0.15, path.join(AUD, n + '.mp3'), v]); s0 += s.dur; }
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')]; ev.forEach(([, f]) => args.push('-i', f));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.14,afade=t=out:st=${(TOTAL - 0.7).toFixed(2)}:d=0.7[m]`; const lab = ['[m]'];
  ev.forEach(([t, , v], i) => { const ms = Math.round(t * 1000); fc += `;[${i + 2}:a]aresample=48000,volume=${v},adelay=${ms}|${ms}[s${i}]`; lab.push(`[s${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, {stdio: 'inherit'}).status) throw new Error('mix failed');
  fs.rmSync(tmp, {recursive: true, force: true}); console.log(out, TOTAL.toFixed(1));
})();
