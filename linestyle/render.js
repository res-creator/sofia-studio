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

// ---------- Ирина Павловна — rig v4: viseme mouth, coupled face, whole neck ----------
// st: time, t, mo {open,width,round,smile,press,bite}, talk, nod, browUp, smile, blink, lid, look, tilt, pen, writing, push
function irina(st) {
  const x = 540, y = 1000, T = st.time, talk = st.talk || 0, mo = st.mo || {open: 0, width: 1, round: 0, smile: 0, press: 0, bite: 0};
  const sm = Math.max(st.smile || 0, mo.smile * 0.6), op = mo.open;
  const breath = Math.sin(T * 1.25);
  const rot = 0.02 * Math.sin(T * 0.8) + (st.tilt || 0) + talk * 0.012 * Math.sin(T * 2.1 + 1) - (st.nod || 0) * 0.01 + (st.walk || 0) * 0.03 * Math.sin(st.phase || 0);
  const nodY = (st.nod || 0) * 7 + breath * 1.2;
  const piv = [x, y + 175];
  const head = (fn) => { g.save(); g.translate(piv[0], piv[1] + nodY); g.rotate(rot); g.translate(-piv[0], -piv[1]); fn(); g.restore(); };
  const sway = (pts, k = 1) => pts.map(([px, py]) => { const w = clamp((py - (y - 60)) / 220); return [px + w * k * (4 * Math.sin(T * 1.1 + .6) - rot * 140), py]; });

  head(() => shape(sway([[x - 205, y + 160], [x - 236, y + 30], [x - 240, y - 90], [x - 205, y - 195], [x - 120, y - 262], [x, y - 284], [x + 128, y - 262], [x + 214, y - 192], [x + 244, y - 80], [x + 240, y + 40], [x + 214, y + 162], [x + 150, y + 182], [x - 150, y + 180]]), C.hairP));

  // body: neck and chest are ONE shape (no seam line)
  g.save(); g.translate(0, breath * 1.6);
  shape([[x - 84, y + 100], [x + 84, y + 100], [x + 96, y + 196], [x + 222, y + 214], [x + 256, y + 320], [x + 60, y + 455], [x, y + 475], [x - 60, y + 455], [x - 256, y + 320], [x - 222, y + 214], [x - 96, y + 196]], C.skin);
  g.strokeStyle = 'rgba(214,140,110,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 150, y + 252); g.quadraticCurveTo(x + s * 110, y + 262, x + s * 82, y + 258); g.stroke(); }
  const top = [[x - 292, y + 330], [x - 238, y + 272], [x - 60, y + 438], [x, y + 482], [x + 60, y + 438], [x + 238, y + 272], [x + 292, y + 330]];
  if (st.full) { // legs + shoes (behind the skirt), weight shifts a little
    const wk = st.walk || 0;
    for (const s of [-1, 1]) {
      const ph = (st.phase || 0) + (s > 0 ? Math.PI : 0), lift = Math.max(0, Math.sin(ph)) * 30 * wk, fx = Math.cos(ph) * 16 * wk;
      const sw = Math.sin(T * 0.7) * 4 * (1 - wk) + fx, kn = lift * .45;
      shape(tubePts([[x + s * 92, y + 1000], [x + s * 104 + sw * .6, y + 1190 - kn], [x + s * 86 + sw, y + 1342 - lift]], 128, 64), C.skin);
      line([[x + s * 70 + sw * .6, y + 1120 - kn], [x + s * 82 + sw * .6, y + 1150 - kn]], 2.5);
      shape([[x + s * 50 + sw, y + 1336 - lift], [x + s * 122 + sw, y + 1330 - lift], [x + s * 150 + sw, y + 1362 - lift * .8], [x + s * 140 + sw, y + 1384 - lift * .8], [x + s * 40 + sw, y + 1386 - lift], [x + s * 36 + sw, y + 1356 - lift]], '#d8304a');
      line([[x + s * 58 + sw, y + 1344 - lift], [x + s * 120 + sw, y + 1340 - lift]], 3);
    }
  }
  const dress = st.full ? [[x - 300, y + 1060], [x - 330, y + 840], [x - 312, y + 620], ...top, [x + 312, y + 620], [x + 330, y + 840], [x + 300, y + 1060], [x + 150, y + 1080], [x, y + 1068], [x - 150, y + 1082]]
                        : [[x - 305, 1620], ...top, [x + 305, 1620]];
  shape(dress, C.dress);
  g.save(); crPath(dress); g.clip(); g.fillStyle = C.dot; for (let i = 0; i < 18; i++) for (let k = 0; k < 22; k++) { g.beginPath(); g.arc(x - 340 + i * 42 + (k % 2) * 21, y + 280 + k * 40, 6, 0, 7); g.fill(); } g.restore();
  crPath(dress); g.strokeStyle = C.ink; g.lineWidth = LW; g.stroke();
  line(st.full ? [[x - 238, y + 272], [x + 40, y + 520], [x + 170, y + 700], [x + 230, y + 1068]] : [[x - 238, y + 272], [x + 40, y + 520], [x + 150, y + 600]], 3.5);
  if (st.full) { line([[x + 60, y + 640], [x + 120, y + 900], [x + 110, y + 1066]], 2.5); line([[x - 80, y + 700], [x - 120, y + 1070]], 2.5); }
  line([[x - 2, y + 418], [x + 2, y + 470]], 3);
  line([[x - 255, y + 420], [x - 200, y + 525], [x - 105, y + 548], [x - 14, y + 505]], 3.5);
  line([[x + 255, y + 420], [x + 200, y + 525], [x + 105, y + 548], [x + 14, y + 505]], 3.5);
  for (let i = 0; i <= 11; i++) { const u = i / 11, px = x - 150 + u * 300, py = y + 238 + Math.sin(u * Math.PI) * 92 + Math.sin(T * 1.25 + u) * 1.5; oval(px, py, 17, 17, C.bead, 3.5); oval(px - 5, py - 5, 4, 4, 'rgba(255,255,255,0.8)', 0); }
  g.restore();

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

  // arms, shawl, notebook, hands
  const pen = st.pen || 0, wn = st.writing ? [5 * Math.sin(st.t * 2.3) + 3 * Math.sin(st.t * 3.7 + 1), 3 * Math.sin(st.t * 2.9 + .5)] : [0, 0];
  const gest = (st.nod || 0) * 14 + talk * 4 * Math.sin(T * 1.9);
  const L = [x - 215, y + 470 + breath * 1.6], R0 = [x + 30 + pen * 145 + wn[0], y + 470 - pen * 118 + wn[1] - gest * pen], rc = st.reach || 0, R = [R0[0] + (x + 440 - R0[0]) * rc, R0[1] + (y + 560 - R0[1]) * rc];
  shape(tubePts([[x - 255, y + 320], [x - 300, y + 520], L], 112, 82), C.skin); line([[x - 300, y + 505], [x - 270, y + 520]], 2.5);
  shape(tubePts([[x + 255, y + 320], [x + 302 + rc * 50, y + 520 - pen * 20 - rc * 40], [R[0] + 60 * (1 - rc) - 30 * rc, R[1] + 30 * (1 - rc)]], 112, 82), C.skin); line([[x + 300, y + 505 - pen * 20], [x + 270, y + 520 - pen * 20]], 2.5);
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
  hand(R[0], R[1], (Math.PI + 0.35 - pen * 0.4 + wn[0] * 0.004) * (1 - rc) + 0.35 * rc, 'hold', -1, () => { shape([[16, -140], [30, -140], [30, 60], [23, 80], [16, 60]], C.pen, 3); oval(23, -140, 8, 6, '#e8e8f2', 2.5); }, false);
}

// ---------- full-body set ----------
function officeFull(st) {
  shape([[-700, 2200], [1800, 2200], [1800, 3000], [-700, 3000]], '#d9a36d'); line([[-700, 2236], [1800, 2236]], 3);
  oval(540, 2392, 330, 46, '#c98ad8', 0);
  // diploma on the wall
  shape([[930, 820], [1250, 812], [1256, 1060], [936, 1068]], '#c9963f'); shape([[952, 840], [1232, 834], [1236, 1042], [956, 1048]], '#fffaf0', 3);
  g.font = '34px HL, HC'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ДИПЛОМ', 1094, 900); g.font = '24px HL, HC'; g.fillText('психолог', 1094, 945); g.fillText('(онлайн-курс, 2 недели)', 1094, 985);
  // ficus
  shape([[-130, 2080], [130, 2080], [100, 2390], [-100, 2390]], '#ff7a59'); line([[-130, 2120], [130, 2120]], 3);
  line([[0, 2080], [10, 1700], [-10, 1420]], 7);
  for (let k = 0; k < 11; k++) { const a = -2.6 + k * .42, cx = Math.cos(a) * (120 + (k % 3) * 40), cy = 1640 + Math.sin(a) * 260 + k * 22;
    g.save(); g.translate(cx, cy); g.rotate(a + 1.57 + Math.sin(st.time * .9 + k) * .03); shape([[0, -70], [34, -10], [0, 70], [-34, -10]], k % 2 ? '#2fae5a' : '#3cc46a', 3.5); line([[0, -60], [0, 60]], 2); g.restore(); }
  // side table with tissues + water
  shape([[1010, 1880], [1330, 1880], [1330, 1920], [1010, 1920]], '#b9814c'); line([[1050, 1920], [1040, 2380]], 9); line([[1290, 1920], [1300, 2380]], 9);
  shape([[1060, 1780], [1130, 1780], [1124, 1880], [1066, 1880]], C.glass); oval(1095, 1780, 35, 9, 'rgba(230,245,255,0.8)', 3);
  const tx = 1230 - (st.push || 0) * 110, ty = 1790;
  shape([[tx - 80, ty], [tx + 80, ty], [tx + 80, ty + 90], [tx - 80, ty + 90]], C.tissueBox); oval(tx, ty + 5, 40, 9, '#5aa9d6', 3);
  shape([[tx - 24, ty + 3], [tx - 30, ty - 46], [tx - 2, ty - 30], [tx + 16, ty - 60], [tx + 26, ty + 3]], '#ffffff', 3.5);
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
const VIS = {A: {open: .95, width: 1.0, round: 0, smile: .1, press: 0, bite: 0}, O: {open: .62, width: .72, round: 1, smile: 0, press: 0, bite: 0},
  U: {open: .32, width: .6, round: 1, smile: 0, press: 0, bite: 0}, E: {open: .52, width: 1.12, round: 0, smile: .35, press: 0, bite: 0},
  I: {open: .3, width: 1.18, round: 0, smile: .55, press: 0, bite: 0}, M: {open: 0, width: .96, round: 0, smile: 0, press: 1, bite: 0},
  F: {open: .1, width: 1.0, round: 0, smile: 0, press: 0, bite: 1}, R: {open: .2, width: 1.0, round: 0, smile: .1, press: 0, bite: 0}, X: {open: 0, width: 1.0, round: 0, smile: 0, press: 0, bite: 0}};
const VMAP = {'а': 'A', 'я': 'A', 'о': 'O', 'ё': 'O', 'у': 'U', 'ю': 'U', 'е': 'E', 'э': 'E', 'и': 'I', 'ы': 'I'};
const cons = (cl) => /[мбп]/.test(cl) ? 'M' : /[фв]/.test(cl) ? 'F' : cl.length ? 'R' : null;
VO.forEach((v, i) => {
  const txt = TEXTS[i].toLowerCase().replace(/[^а-яё]/g, ''), syl = []; let cl = '';
  for (const ch of txt) { if (VMAP[ch]) { syl.push({v: VMAP[ch], c: cons(cl)}); cl = ''; } else cl += ch; }
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
const jawAt = (i, t) => { const v = VO[i], f = (t - LEAD) * FPS, k = Math.floor(f); if (k < 0) return 0; if (k >= v.jaw.length - 1) { const last = v.jaw[v.jaw.length - 1] || 0; return last * clamp(1 - (f - v.jaw.length) / 4); } return v.jaw[k] + (v.jaw[k + 1] - v.jaw[k]) * (f - k); };
const talkAt = (i, t) => clamp((t - LEAD + 0.15) / 0.3) * clamp((LEAD + VO[i].dur + 0.35 - t) / 0.35);
const blinkV = (t, at) => Math.max(0, ...at.map(a => 1 - Math.abs(t - a) / 0.09));

// ---------- shots (durations follow the voice) ----------
const MED = {z: 1.3, cx: 540, cy: 960}, CLOSE = {z: 1.8, cx: 540, cy: 900}, FULLC = {z: 0.62, cx: 540, cy: 1280};
const FULL = process.env.MODE === 'full';
const SHOTS = [
  {i: 0, tail: 0.6, cam: MED, st: t => ({writing: true, look: 0.2, lid: .35, tilt: .025}), say: ['Я ОЧЕНЬ ВНИМАТЕЛЬНО', 'ВАС ВЫСЛУШАЛА'], sfx: []},
  {i: 1, tail: 0.5, cam: MED, st: t => ({pen: ease(t / 0.5), look: 0, lid: .12, brow: 8, tilt: -.015}), say: ['И КАК СПЕЦИАЛИСТ', 'МОГУ СКАЗАТЬ…'], sfx: []},
  {i: 2, tail: 0.9, cam: CLOSE, st: t => ({pen: 1, look: 0, lid: .25, after: 'smile', tilt: .03}), say: ['…НАШЕ ВРЕМЯ ВЫШЛО.', 'С ВАС ПЯТЬ ТЫСЯЧ'], sfx: [['end', 'coin', 0.7]]},
  {i: 3, tail: 1.5, cam: MED, st: t => ({pen: 1, push: ease((t - 0.2) / 0.6), look: 0.3, lid: .3, after: 'smile', tilt: -.03, brow: 4}), say: ['САЛФЕТКИ — ОТДЕЛЬНО'], sfx: [['end', 'sad', 0.6]]},
];
if (FULL) {
  SHOTS.forEach(s => { if (s.cam === MED) s.cam = FULLC; });
  // shot 0: walks in from the left;  shot 1: small step + gesture;  shot 3: steps right and points the pen at the tissues
  const walkSeg = (t, t0, t1, x0, x1) => { const u = clamp((t - t0) / (t1 - t0)); const k = ease(u); return {rootX: x0 + (x1 - x0) * k, walk: u > 0 && u < 1 ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0, phase: (x0 + (x1 - x0) * k) / 70}; };
  const s0 = SHOTS[0].st, s1 = SHOTS[1].st, s3 = SHOTS[3].st;
  SHOTS[0].st = t => Object.assign(s0(t), walkSeg(t, 0, 1.7, -560, 0), {writing: t > 1.7});
  SHOTS[1].st = t => Object.assign(s1(t), walkSeg(t, 0.1, 0.7, 0, 40));
  SHOTS[3].st = t => Object.assign(s3(t), walkSeg(t, 0, 0.9, 40, 190), {reach: ease((t - 0.8) / 0.5) * (1 - ease((t - 2.6) / 0.6)), push: ease((t - 1.0) / 0.6)});
}
SHOTS.forEach(s => { s.dur = LEAD + VO[s.i].dur + s.tail; });
const TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0);

function frame(time) {
  let s0 = 0, shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) { if (time < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
  const t = time - s0, cam = shot.cam;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  const st = Object.assign({t}, shot.st(t));
  st.time = time; st.talk = talkAt(shot.i, t); st.mo = moAt(shot.i, t); const bump = Math.min(1, bellSum(shot.i, t));
  st.nod = bump * st.talk; st.browUp = (st.brow || 0) + 7 * bump;
  st.smile = st.after === 'smile' ? ease((t - LEAD - VO[shot.i].dur - 0.05) / 0.45) : 0;
  st.blink = Math.max(blinkV(t, [LEAD + VO[shot.i].dur + 0.25]), blinkV(time, [1.7, 5.4, 9.3, 12.6]));
  st.tilt = (st.tilt || 0) * ease(t / 0.6);
  st.look = (st.look || 0) * ease(t / 0.6);
  if (FULL && shot.cam === FULLC) { st.full = true; officeFull(st); const bob = -Math.abs(Math.sin(st.phase || 0)) * 10 * (st.walk || 0); g.save(); g.translate(st.rootX || 0, bob); irina(st); g.restore(); } else if (FULL) { st.full = true; irina(st); } else { chair(); irina(st); table(st); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
  watermark(); bubble(t >= LEAD ? shot.say : null, t - LEAD);
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'); fs.mkdirSync(outDir, {recursive: true});
if (process.argv[2]) { for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `${FULL ? 'full_' : ''}still_${s}.png`), cv.toBuffer('image/png')); } process.exit(0); }
const out = path.join(outDir, FULL ? 'psiholog_full.mp4' : 'psiholog.mp4'), silent = path.join(tmp, 'silent.mp4');
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
