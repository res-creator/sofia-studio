// «Ася и взрослая жизнь» — render engine.
// Flat "Procreate" look: blue hatched wall, knit textures, grain, Pangolin caps captions.
// Usage: node asya/render.js ep1 [stills t1,t2,...]
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const W = 1080, H = 1920, FPS = 30;
const F = path.join(__dirname, '..', 'node_modules', '@fontsource');
// separate aliases per subset (same alias twice is unreliable); Nunito as fallback for ₽ − etc.
GlobalFonts.registerFromPath(F + '/pangolin/files/pangolin-latin-400-normal.woff2', 'CapL');
GlobalFonts.registerFromPath(F + '/pangolin/files/pangolin-cyrillic-400-normal.woff2', 'CapC');
GlobalFonts.registerFromPath(F + '/pangolin/files/pangolin-latin-ext-400-normal.woff2', 'CapX');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-700-normal.woff2', 'NunL');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-700-normal.woff2', 'NunC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-ext-700-normal.woff2', 'NunX');
const FONT = 'CapL, CapC, CapX, NunL, NunC, NunX';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let g;

// ---------------- palette (character bible) ----------------
const C = {
  blue: '#1d45ad', blueL: '#2a62d6', ink: '#141414', white: '#eef0f3', yellow: '#f4ef62',
  skin: '#e2a089', skinD: '#c98068',
  hair: '#b9461c', hairD: '#7c2a0c', hairL: '#e07a3c',
  sweater: '#ee7d98', sweaterD: '#c95a76',
  pants: '#d9a02a',
  phone: '#4fbf9f', phoneD: '#2f8f74',
  cat: '#8e939d', catD: '#6c717b', catL: '#b7bcc5',
  floor: '#c3ccd8', floorL: '#8f9db0', chair: '#3a2a22', wood: '#9a5c22', steel: '#737c88',
  screen: '#fbf6e9', mint: '#4fbf9f', red: '#e0412a',
};

// ---------------- textures ----------------
function mk() { const c = createCanvas(W, H); return [c, c.getContext('2d')]; }
function hatchTex(seed, clusters, light, dark, len, spread, lw) {
  const [c, x] = mk(), r = rng(seed); x.lineCap = 'round';
  for (let i = 0; i < clusters; i++) {
    const cx = r() * W, cy = r() * H, a = r() * Math.PI, n = 6 + r() * 12, L = len[0] + r() * (len[1] - len[0]);
    x.strokeStyle = r() < .55 ? light : dark; x.lineWidth = lw * (.5 + r());
    for (let k = 0; k < n; k++) {
      const off = (k - n / 2) * (spread / n), ox = cx + Math.cos(a + 1.5708) * off + (r() - .5) * 10, oy = cy + Math.sin(a + 1.5708) * off + (r() - .5) * 10, l = L * (.6 + r() * .5);
      x.beginPath(); x.moveTo(ox - Math.cos(a) * l / 2, oy - Math.sin(a) * l / 2);
      x.quadraticCurveTo(ox + (r() - .5) * 10, oy + (r() - .5) * 10, ox + Math.cos(a) * l / 2, oy + Math.sin(a) * l / 2); x.stroke();
    }
  }
  return c;
}
function dirTex(seed, n, len, lw, light, dark, ang, jit = .25) {
  const [c, x] = mk(), r = rng(seed); x.lineCap = 'round';
  for (let i = 0; i < n; i++) { const px = r() * W, py = r() * H, a = ang + (r() - .5) * jit, l = len * (.4 + r());
    x.strokeStyle = r() < .5 ? light : dark; x.lineWidth = lw * (.4 + r()); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c;
}
function knitTex(seed) {
  const [c, x] = mk(), r = rng(seed);
  x.drawImage(dirTex(seed + 1, 7000, 14, 2, 'rgba(255,255,230,0.18)', 'rgba(110,20,50,0.14)', 0, .6), 0, 0);
  x.strokeStyle = 'rgba(255,240,245,0.5)'; x.lineWidth = 2.2;
  for (let y = 0; y < H; y += 34 + r() * 8) { x.beginPath(); for (let px = 0; px <= W; px += 30) { const yy = y + Math.sin(px / 90 + y) * 4 + (r() - .5) * 3; px ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.stroke(); }
  return c;
}
function meshTex() { const [c, x] = mk(); x.strokeStyle = 'rgba(160,120,90,0.45)'; x.lineWidth = 1.6;
  for (let i = -H; i < W + H; i += 9) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); } return c; }
function grainTex(seed, a) { const [c, x] = mk(), r = rng(seed); const im = x.createImageData(W, H);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = a; } x.putImageData(im, 0, 0); return c; }
const T = {
  wall: hatchTex(1, 4200, 'rgba(110,160,255,0.16)', 'rgba(5,20,90,0.2)', [40, 110], 45, 1.4),
  curtain: dirTex(2, 4000, 160, 2.2, 'rgba(120,175,255,0.28)', 'rgba(10,40,140,0.28)', 1.5708, .12),
  knit: knitTex(3),
  pants: dirTex(4, 9000, 90, 2.4, 'rgba(255,230,140,0.35)', 'rgba(120,70,0,0.3)', 1.5708, .18),
  skin: grainTex(5, 16),
  wood: dirTex(6, 5000, 60, 2, 'rgba(255,190,120,0.3)', 'rgba(90,40,0,0.35)', 1.5708, .1),
  mesh: meshTex(),
  floor: dirTex(7, 3000, 40, 1.5, 'rgba(255,255,255,0.35)', 'rgba(90,110,140,0.18)', 0.3, 1.5),
  fur: dirTex(10, 9000, 16, 1.6, 'rgba(230,235,245,0.35)', 'rgba(50,55,65,0.3)', 1.2, 1.2),
  paper: grainTex(8, 14),
  grain: grainTex(9, 18),
};

// ---------------- helpers ----------------
function wob(pts, seed, amt = 2.5) { const r = rng(seed); return pts.map(([x, y]) => [x + (r() - .5) * amt, y + (r() - .5) * amt]); }
function smoothPath(pts) { g.beginPath(); const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.moveTo(...mid(pts[n - 1], pts[0])); for (let i = 0; i < n; i++) g.quadraticCurveTo(...pts[i], ...mid(pts[i], pts[(i + 1) % n])); g.closePath(); }
function sharp(pts, r = 22) { const o = [], n = pts.length; for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
  const da = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, dc = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, ra = Math.min(r, da / 2.2), rc = Math.min(r, dc / 2.2);
  o.push([b[0] + (a[0] - b[0]) / da * ra, b[1] + (a[1] - b[1]) / da * ra], b, [b[0] + (c[0] - b[0]) / dc * rc, b[1] + (c[1] - b[1]) / dc * rc]); } return o; }
const P = (pts, seed = 1, amt = 3, r = 22) => { const w = wob(pts, seed, amt); return () => smoothPath(sharp(w, r)); };
const S = (pts, seed = 1, amt = 3) => { const w = wob(pts, seed, amt); return () => smoothPath(w); };
function ell(cx, cy, rx, ry, n = 18, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; }
function rr(x, y, w, h, r) { return [[x + r, y], [x + w - r, y], [x + w, y], [x + w, y + r], [x + w, y + h - r], [x + w, y + h], [x + w - r, y + h], [x + r, y + h], [x, y + h], [x, y + h - r], [x, y + r], [x, y]]; }
function paint(build, color, tex, a = 1, line = null, lw = 5) {
  build(); g.fillStyle = color; g.fill();
  if (tex) { const m = g.getTransform(); g.save(); build(); g.clip(); g.globalAlpha = a; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tex, 0, 0); g.restore(); g.setTransform(m); }
  if (line) { build(); g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
function ln(pts, color, w) { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function curve(a, c, b, color, w) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const rub = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';

// ---------------- set ----------------
function wall() {
  paint(() => { g.beginPath(); g.rect(-400, -400, W + 800, H + 800); }, C.blue, T.wall);
  const gr = g.createLinearGradient(820, 0, 1000, 0); gr.addColorStop(0, 'rgba(42,98,214,0)'); gr.addColorStop(1, 'rgba(42,98,214,0.95)');
  g.fillStyle = gr; g.fillRect(820, -400, 700, H + 800);
  g.save(); g.beginPath(); g.rect(930, -400, 700, H + 800); g.clip(); g.globalAlpha = .7; g.drawImage(T.curtain, 0, 0); g.restore();
  const v = g.createLinearGradient(0, 0, 0, 700); v.addColorStop(0, 'rgba(5,15,60,0.35)'); v.addColorStop(1, 'rgba(5,15,60,0)'); g.fillStyle = v; g.fillRect(-400, -400, W + 800, 1100);
}
function floor(y0 = 1545) {
  paint(() => { g.beginPath(); g.rect(-400, y0, W + 800, H - y0 + 400); }, C.floor, T.floor);
  for (let i = -8; i < 14; i++) ln([[i * 150, y0], [i * 150 - 330, H + 40]], C.floorL, 4);
  for (let j = 1; j < 5; j++) { const y = y0 + j * j * 22 + j * 40; ln([[-400, y], [W + 400, y]], C.floorL, 4); }
}
function chair() {
  paint(P([[770, 1060], [800, 1060], [830, 1900], [800, 1900]], 31, 2, 6), C.wood, T.wood);
  paint(P([[1010, 1010], [1040, 1010], [1075, 1800], [1045, 1800]], 32, 2, 6), C.wood, T.wood);
  for (const x of [850, 900, 950]) paint(P([[x, 1120], [x + 18, 1120], [x + 22, 1300], [x + 4, 1300]], x, 2, 4), C.wood, T.wood);
  paint(P([[760, 930], [1080, 915], [1090, 1100], [770, 1120]], 34, 3, 30), C.chair, T.mesh);
  paint(P([[780, 1300], [980, 1290], [1000, 1460], [800, 1480]], 35, 3, 28), C.chair, T.mesh);
  paint(P([[960, 1450], [990, 1450], [1010, 1900], [980, 1900]], 36, 2, 6), C.wood, T.wood);
}
function table(st) {
  paint(P([[440, 1330], [490, 1330], [760, 1930], [710, 1930]], 41, 2, 4), C.steel, T.skin, .8);
  paint(P([[470, 1330], [520, 1330], [250, 1930], [200, 1930]], 42, 2, 4), '#5f6772', T.skin, .8);
  const tb = S(ell(465, 1235, 430, 165, 28), 43, 6);
  paint(tb, C.white, T.paper);
  g.save(); tb(); g.clip(); const r = rng(44);
  for (let x = 60; x < 900; x += 86) ln([[x + (r() - .5) * 6, 1060], [x + (x - 465) * .06 + (r() - .5) * 8, 1410]], C.ink, 4);
  for (let y = 1095; y < 1410; y += 78) ln([[20, y + (r() - .5) * 6], [920, y + (r() - .5) * 6]], C.ink, 4);
  const sh = g.createLinearGradient(0, 1300, 0, 1400); sh.addColorStop(0, 'rgba(120,130,150,0)'); sh.addColorStop(1, 'rgba(120,130,150,0.35)'); g.fillStyle = sh; g.fillRect(0, 1300, W, 120);
  g.restore();
  // mug (left)
  const mx = 170, my = 1200;
  paint(P([[mx - 46, my - 70], [mx + 46, my - 70], [mx + 40, my + 28], [mx - 40, my + 28]], 45, 2, 10), '#f6e7a8', T.paper, 1, C.ink, 4);
  g.beginPath(); g.ellipse(mx - 54, my - 22, 20, 26, 0, Math.PI - 1.3, Math.PI + 1.3); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
  g.beginPath(); g.ellipse(mx, my - 70, 46, 10, 0, 0, 7); g.fillStyle = '#7a3f1d'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
  g.fillStyle = C.red; g.beginPath(); g.arc(mx - 9, my - 24, 9, 0, 7); g.arc(mx + 9, my - 24, 9, 0, 7); g.moveTo(mx - 18, my - 21); g.lineTo(mx, my - 2); g.lineTo(mx + 18, my - 21); g.fill();
  if (st.steam) for (let k = 0; k < 2; k++) { const ph = st.t * 2.4 + k * 2; g.beginPath();
    for (let y = 0; y < 100; y += 6) { const x = mx - 14 + k * 28 + Math.sin(y / 16 + ph) * 9; y ? g.lineTo(x, my - 85 - y) : g.moveTo(x, my - 85 - y); }
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); }
}
function clock(hh, mm) {
  const cx = 860, cy = 560;
  paint(S(ell(cx, cy, 88, 88, 20), 51, 3), C.white, T.paper, 1, C.ink, 7);
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.2832; ln([[cx + Math.cos(a) * 66, cy + Math.sin(a) * 66], [cx + Math.cos(a) * 76, cy + Math.sin(a) * 76]], C.ink, 4); }
  const ah = ((hh % 12) + mm / 60) / 12 * 6.2832 - 1.5708, am = mm / 60 * 6.2832 - 1.5708;
  ln([[cx, cy], [cx + Math.cos(ah) * 40, cy + Math.sin(ah) * 40]], C.ink, 9); ln([[cx, cy], [cx + Math.cos(am) * 62, cy + Math.sin(am) * 62]], C.ink, 5);
}

// ---------------- Ася ----------------
function curls(x, y, seed, front) {
  const r = rng(seed), blobs = [];
  if (!front) {
    // big curly cloud: top puff + sides to the jaw
    for (let i = 0; i < 34; i++) { const a = Math.PI * (1.02 + r() * .96), rad = 175 + r() * 35; blobs.push([x + Math.cos(a) * rad * 1.05, y - 30 + Math.sin(a) * rad * .95, 52 + r() * 22]); }
    for (let i = 0; i < 16; i++) { const s = i % 2 ? 1 : -1, yy = y - 40 + r() * 220; blobs.push([x + s * (165 + r() * 40), yy, 48 + r() * 18]); }
    blobs.push([x, y - 60, 170]);
  } else {
    for (let i = 0; i < 9; i++) blobs.push([x - 130 + i * 32 + (r() - .5) * 10, y - 118 + Math.sin(i * 1.3) * 12 + r() * 8, 34 + r() * 10]);
  }
  for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx, by, br, 0, 7); g.fillStyle = C.hair; g.fill(); }
  // curl strokes (spirals) + highlights
  g.lineCap = 'round';
  for (const [bx, by, br] of blobs) { if (br > 100) continue;
    const k = 2 + Math.floor(r() * 2);
    for (let j = 0; j < k; j++) { const cx = bx + (r() - .5) * br, cy = by + (r() - .5) * br, rad = 10 + r() * 16, a0 = r() * 6;
      g.beginPath(); g.arc(cx, cy, rad, a0, a0 + 4 + r() * 1.5); g.strokeStyle = r() < .6 ? C.hairD : C.hairL; g.lineWidth = 2.5 + r() * 2; g.stroke(); } }
}
function face(x, y, st) {
  paint(S(ell(x, y + 20, 112, 138, 20), 61, 3), C.skin, T.skin);
  for (const s of [-1, 1]) { const bx = x + s * 72, by = y + 66, rg = g.createRadialGradient(bx, by, 2, bx, by, 42); rg.addColorStop(0, 'rgba(225,95,95,0.6)'); rg.addColorStop(1, 'rgba(225,95,95,0)'); g.fillStyle = rg; g.fillRect(bx - 50, by - 50, 100, 100); }
  // freckles
  const fr = rng(62); g.fillStyle = 'rgba(150,70,40,0.55)'; for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1; g.beginPath(); g.arc(x + s * (30 + fr() * 50), y + 50 + fr() * 26, 2.6, 0, 7); g.fill(); }
  const ey = y + 10, ex = [x - 50, x + 50], ev = st.eyes;
  for (const e of ex) {
    if (ev === 'blink' || ev === 'happy') { curve([e - 26, ey + (ev === 'happy' ? 6 : 0)], [e, ey + (ev === 'happy' ? -14 : 16)], [e + 26, ey + (ev === 'happy' ? 6 : 0)], C.ink, 6); }
    else if (ev === 'wide') { g.beginPath(); g.ellipse(e, ey, 32, 31, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
      g.beginPath(); g.arc(e + 2 + Math.sin(st.t * 7) * 1.5, ey + 1, 9, 0, 7); g.fillStyle = C.ink; g.fill(); }
    else { // 'down' smug / looking at phone
      g.save(); g.beginPath(); g.moveTo(e - 30, ey + 4); g.quadraticCurveTo(e, ey - 18, e + 30, ey + 2); g.quadraticCurveTo(e, ey + 20, e - 30, ey + 4); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.clip();
      g.beginPath(); g.arc(e - 4, ey + 7, 12, 0, 7); g.fillStyle = C.ink; g.fill(); g.restore();
      curve([e - 33, ey + 2], [e, ey - 22], [e + 33, ey], C.ink, 6); }
  }
  // round glasses
  for (const e of ex) { g.beginPath(); g.arc(e, ey, 46, 0, 7); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke(); g.beginPath(); g.arc(e - 14, ey - 18, 12, 3.6, 4.6); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 4; g.stroke(); }
  curve([x - 6, ey - 4], [x, ey - 12], [x + 6, ey - 4], C.ink, 5);
  ln([[x - 96, ey - 6], [x - 112, ey - 12]], C.ink, 5); ln([[x + 96, ey - 6], [x + 112, ey - 12]], C.ink, 5);
  // brows
  if (ev === 'wide') { ln([[x - 84, y - 62], [x - 22, y - 68]], C.hairD, 9); ln([[x + 20, y - 70], [x + 84, y - 64]], C.hairD, 9); }
  else if (ev === 'down') { ln([[x - 84, y - 44], [x - 20, y - 50]], C.hairD, 9); ln([[x + 18, y - 54], [x + 82, y - 42]], C.hairD, 9); }
  else { curve([x - 84, y - 50], [x - 52, y - 64], [x - 20, y - 54], C.hairD, 9); curve([x + 20, y - 54], [x + 52, y - 64], [x + 84, y - 50], C.hairD, 9); }
  // nose
  g.beginPath(); g.moveTo(x - 2, y + 30); g.lineTo(x - 10, y + 72); g.quadraticCurveTo(x, y + 80, x + 8, y + 74); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
  // mouth
  const m = st.mouth || (ev === 'wide' ? 'w' : 'smile');
  if (m === 'w') { g.beginPath(); g.moveTo(x - 6, y + 104); g.quadraticCurveTo(x, y + 116, x + 6, y + 106); g.quadraticCurveTo(x + 12, y + 116, x + 18, y + 104); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
  else if (m === 'o') { g.beginPath(); g.ellipse(x + 4, y + 108, 11, 14, 0, 0, 7); g.fillStyle = '#7a2a2a'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
  else if (m === 'grin') { g.beginPath(); g.moveTo(x - 34, y + 96); g.quadraticCurveTo(x, y + 140, x + 36, y + 94); g.closePath(); g.fillStyle = '#7a2a2a'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
  else if (m === 'flat') ln([[x - 20, y + 106], [x + 22, y + 104]], C.ink, 5);
  else curve([x - 22, y + 100], [x + 4, y + 116], [x + 28, y + 96], C.ink, 5);
}
function asya(st) {
  const x = 480, y = 610 + Math.sin(st.t * 2) * 2.5;
  curls(x, y, 70, false);
  paint(P([[x - 40, y + 120], [x + 40, y + 120], [x + 46, y + 300], [x - 46, y + 300]], 62, 2, 8), C.skinD, T.skin); // neck runs under the sweater
  paint(P([[x - 120, y + 245], [x + 120, y + 245], [x + 230, y + 290], [x + 250, y + 640], [x - 260, y + 640], [x - 240, y + 290]], 63, 4, 70), C.sweater, T.knit);
  // crew neckline
  g.beginPath(); g.moveTo(x - 90, y + 248); g.quadraticCurveTo(x, y + 320, x + 90, y + 248); g.quadraticCurveTo(x, y + 290, x - 90, y + 248); g.fillStyle = C.skinD; g.fill();
  curve([x - 96, y + 246], [x, y + 330], [x + 96, y + 246], C.sweaterD, 10);
  face(x, y, st);
  curls(x, y, 75, true);
  paint(P([[x - 240, y + 290], [x - 300, y + 520], [x - 270, y + 640], [x - 110, y + 560], [x - 120, y + 490], [x - 220, y + 520], [x - 190, y + 360]], 65, 4, 40), C.sweater, T.knit, 1, C.sweaterD, 3);
  if (st.phone !== false) {
    g.save(); g.translate(x - 80, y + 410); g.rotate(-0.12);
    paint(() => smoothPath(rr(-58, -105, 116, 210, 22)), C.phone, T.skin);
    paint(() => smoothPath(rr(-44, -90, 54, 60, 12)), C.phoneD, null);
    for (const [cx, cy] of [[-30, -76], [-4, -76], [-17, -50]]) { g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fillStyle = '#2a2a2a'; g.fill(); g.strokeStyle = '#ddd'; g.lineWidth = 2; g.stroke(); }
    g.restore();
    paint(S([[x - 140, y + 470], [x - 110, y + 440], [x - 75, y + 470], [x - 70, y + 520], [x - 110, y + 545], [x - 145, y + 520]], 66, 3), C.skin, T.skin);
    paint(S([[x - 30, y + 420], [x + 10, y + 400], [x + 40, y + 440], [x + 30, y + 520], [x - 20, y + 530], [x - 50, y + 480]], 67, 3), C.skin, T.skin);
  }
  paint(P([[x + 230, y + 290], [x + 300, y + 520], [x + 260, y + 650], [x + 20, y + 560], [x + 40, y + 470], [x + 190, y + 520], [x + 180, y + 360]], 68, 4, 40), C.sweater, T.knit, 1, C.sweaterD, 3);
}
function pants() {
  paint(P([[190, 1300], [420, 1300], [400, 1930], [180, 1930]], 81, 3, 30), C.pants, T.pants);
  paint(P([[530, 1300], [770, 1300], [790, 1930], [590, 1930]], 82, 3, 30), C.pants, T.pants);
}

// ---------------- Бублик (cat) ----------------
function bublik(st) {
  const x = 760, y = 1095 + Math.sin(st.t * 2.6) * 3, mood = st.cat || 'idle';
  // tail
  g.beginPath(); g.moveTo(x + 70, y + 90); g.bezierCurveTo(x + 170, y + 110, x + 170 + Math.sin(st.t * 3) * 14, y + 10, x + 130, y - 10);
  g.strokeStyle = C.catD; g.lineWidth = 30; g.lineCap = 'round'; g.stroke();
  paint(S(ell(x, y + 40, 105, 92, 18), 401, 5), C.cat, T.fur, 1, C.ink, 4);
  paint(S(ell(x - 4, y + 60, 55, 60, 14), 402, 3), C.catL, T.fur, .6);
  // head
  const hy = y - 70;
  paint(S([[x - 80, hy + 10], [x - 88, hy - 85], [x - 40, hy - 52], [x + 40, hy - 52], [x + 88, hy - 85], [x + 80, hy + 10], [x + 70, hy + 55], [x - 70, hy + 55]], 403, 4), C.cat, T.fur, 1, C.ink, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 76, hy - 70); g.lineTo(x + s * 56, hy - 46); g.lineTo(x + s * 74, hy - 40); g.closePath(); g.fillStyle = '#e8a0a8'; g.fill(); }
  for (const s of [-1, 1]) { const ex = x + s * 32, ey = hy;
    if (mood === 'wide') { g.beginPath(); g.arc(ex, ey, 19, 0, 7); g.fillStyle = '#f2e06a'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(ex, ey, 6, 0, 7); g.fillStyle = C.ink; g.fill(); }
    else if (mood === 'judge') { g.save(); g.beginPath(); g.arc(ex, ey, 17, 0, 7); g.clip(); g.fillStyle = '#f2e06a'; g.fillRect(ex - 20, ey - 20, 40, 40); g.beginPath(); g.ellipse(ex + 7, ey + 3, 4, 10, 0, 0, 7); g.fillStyle = C.ink; g.fill(); g.fillStyle = C.cat; g.fillRect(ex - 20, ey - 20, 40, 19); g.restore();
      ln([[ex - 18, ey - 1], [ex + 18, ey - 1]], C.ink, 5); }
    else { curve([ex - 14, ey], [ex, ey + 8], [ex + 14, ey], C.ink, 5); } }
  g.beginPath(); g.moveTo(x - 9, hy + 18); g.lineTo(x + 9, hy + 18); g.lineTo(x, hy + 27); g.closePath(); g.fillStyle = '#e8706a'; g.fill();
  if (mood === 'judge') ln([[x - 12, hy + 38], [x + 12, hy + 38]], C.ink, 4);
  else { curve([x - 14, hy + 34], [x - 7, hy + 40], [x, hy + 32], C.ink, 3.5); curve([x, hy + 32], [x + 7, hy + 40], [x + 14, hy + 34], C.ink, 3.5); }
  for (const s of [-1, 1]) for (const k of [-1, 1]) ln([[x + s * 30, hy + 26 + k * 6], [x + s * 78, hy + 20 + k * 14]], 'rgba(20,20,20,0.6)', 2.5);
  // paws
  for (const s of [-1, 1]) paint(S(ell(x + s * 40, y + 125, 30, 18, 10), 404 + s, 2), C.catL, T.fur, .5, C.ink, 3);
}

// ---------------- shots ----------------
function wide(st) {
  wall(); if (st.clock) clock(...st.clock); floor(); chair(); pants(); asya(st); table(st); if (st.cat !== 'none') bublik(st);
  if (st.q > 0) for (const [x, y, rot, d] of [[200, 520, -0.25, 0], [790, 700, 0.12, .25], [700, 520, 0.3, .5]]) {
    const a = clamp((st.q - d) * 4); if (!a) continue;
    g.save(); g.translate(x, y - (1 - a) * 30); g.rotate(rot + Math.sin(st.t * 3 + x) * .07); g.globalAlpha = a; g.font = '150px ' + FONT; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('?', 0, 0); g.restore();
  }
}
// phone close-up; st.screen(sx, sy, sw, sh, t) draws the app; st.thumb 0..1
function phone(st) {
  wall();
  const tb = () => { g.beginPath(); g.moveTo(-60, 470); g.quadraticCurveTo(540, 300, 1140, 470); g.lineTo(1140, 1980); g.lineTo(-60, 1980); g.closePath(); };
  paint(tb, C.white, T.paper);
  g.save(); tb(); g.clip();
  for (let i = -3; i <= 3; i++) { const x = 540 + i * 230; g.beginPath(); g.moveTo(x + i * 40, 300); g.quadraticCurveTo(x - i * 40, 1150, x + i * 80, 1980); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke(); }
  for (let j = 0; j < 8; j++) { const y = 520 + j * 220; g.beginPath(); g.moveTo(-60, y + 40); g.quadraticCurveTo(540, y - 50, 1140, y + 40); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke(); }
  g.restore();
  g.save(); g.translate(560, 1050); g.rotate(0.06); g.translate(-560, -1050);
  const px = 250, py = 470, pw = 600, ph = 1120;
  paint(() => smoothPath(wob(rr(px, py, pw, ph, 80), 91, 5)), C.phone, T.skin);
  const sx = px + 32, sy = py + 38, sw = pw - 64, sh = ph - 76, scr = () => smoothPath(rr(sx, sy, sw, sh, 52));
  paint(scr, st.bg || C.screen, T.paper);
  g.save(); scr(); g.clip(); st.screen(sx, sy, sw, sh, st.t); g.restore();
  paint(() => smoothPath(rr(px + pw / 2 - 95, py + 30, 190, 46, 23)), C.ink, null);
  g.restore();
  // hands
  paint(S([[-80, 1200], [140, 1060], [250, 1020], [290, 1250], [230, 1640], [-80, 1760]], 92, 6), C.skin, T.skin);
  for (let k = 0; k < 3; k++) paint(S(ell(268 + k * 6, 1040 + k * 80, 46, 30, 12, -0.15), 96 + k, 3), C.skin, T.skin, 1, 'rgba(150,80,60,0.5)', 3);
  paint(P([[-80, 1600], [170, 1560], [300, 1980], [-80, 1980]], 93, 6, 50), C.sweater, T.knit);
  const ty = 1480 - (st.thumb || 0) * 260; // rests low, swipes up
  paint(S([[1160, 1560], [900, 1520], [740, ty + 50], [690, ty], [720, ty - 45], [790, ty - 30], [960, 1330], [1160, 1290]], 94, 6), C.skin, T.skin);
  g.beginPath(); g.ellipse(716, ty - 6, 28, 19, -0.5, 0, 7); g.fillStyle = 'rgba(255,225,215,0.7)'; g.fill();
  paint(P([[1160, 1590], [930, 1600], [1000, 1980], [1160, 1980]], 95, 6, 50), C.sweater, T.knit);
}

// ---------------- app screens (fictional apps — brand slot for future ads) ----------------
function txt(s, x, y, size, color = C.ink, align = 'left', maxW = 0) { g.font = `${size}px ${FONT}`;
  while (maxW && size > 18 && g.measureText(s).width > maxW) { size -= 1; g.font = `${size}px ${FONT}`; } g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); }
function statusBar(sx, sy, sw, time = '19:42', battery = 76) {
  txt(time, sx + 50, sy + 72, 44);
  const bx = sx + sw - 120, by = sy + 44; g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(bx, by, 64, 30); g.fillStyle = C.ink; g.fillRect(bx + 66, by + 9, 6, 12);
  g.fillStyle = battery < 10 ? C.red : C.ink; g.fillRect(bx + 4, by + 4, Math.max(3, 56 * battery / 100), 22);
}
const SCREENS = {
  bank({balance, ops = [], label = 'Мой банк'}) {
    return (sx, sy, sw, sh) => {
      statusBar(sx, sy, sw);
      txt(label, sx + 50, sy + 170, 52);
      paint(() => smoothPath(rr(sx + 40, sy + 210, sw - 80, 300, 34)), '#ee7d98', null, 1, C.ink, 4);
      txt('Баланс', sx + 80, sy + 290, 40, '#fff');
      txt(rub(balance), sx + 80, sy + 410, 92, '#fff');
      ops.forEach((o, i) => { const y = sy + 600 + i * 120; if (o.a !== undefined && o.a <= 0) return; g.save(); g.globalAlpha = o.a ?? 1;
        g.beginPath(); g.arc(sx + 80, y, 34, 0, 7); g.fillStyle = o.c || C.mint; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke();
        g.font = `40px ${FONT}`; const sumW = g.measureText(o.sum).width; txt(o.sum, sx + sw - 40, y + 14, 40, o.sum.startsWith('+') ? '#1d8a5a' : C.ink, 'right'); txt(o.name, sx + 135, y + 14, 38, C.ink, 'left', sw - 40 - 135 - sumW - 24); g.restore(); });
    };
  },
  list({title, items, totalLabel = 'Итого', button = 'Оформить', shown = 99, scroll = 0}) {
    return (sx, sy, sw, sh) => {
      statusBar(sx, sy, sw);
      let total = 0;
      items.forEach((it, i) => { const y = sy + 210 + i * 118 - scroll; const a = clamp(shown - i); if (a <= 0) return; total += it.price * a;
        g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 30);
        paint(() => smoothPath(rr(sx + 34, y, 92, 92, 18)), it.c, null, 1, C.ink, 3);
        txt(it.name[0], sx + 80, y + 64, 50, '#fff', 'center');
        g.font = `32px ${FONT}`; const pw = g.measureText(rub(it.price)).width; txt(rub(it.price), sx + sw - 30, y + 58, 32, C.ink, 'right'); txt(it.name, sx + 142, y + 58, 32, C.ink, 'left', sw - 30 - 142 - pw - 22); g.restore(); });
      g.fillStyle = st_bg; g.fillRect(sx, sy + 100, sw, 90); txt(title, sx + 50, sy + 170, 54);
      g.fillStyle = '#fff'; g.fillRect(sx, sy + sh - 220, sw, 220); ln([[sx, sy + sh - 220], [sx + sw, sy + sh - 220]], C.ink, 3);
      txt(totalLabel, sx + 50, sy + sh - 150, 40); txt(rub(total), sx + sw - 40, sy + sh - 150, 50, C.ink, 'right');
      if (button) { paint(() => smoothPath(rr(sx + 40, sy + sh - 110, sw - 80, 80, 40)), C.mint, null, 1, C.ink, 3); txt(button, sx + sw / 2, sy + sh - 55, 42, '#fff', 'center'); }
    };
  },
  done({title, sub}) {
    return (sx, sy, sw, sh, t) => {
      statusBar(sx, sy, sw);
      const k = ease(t * 2.5), cx = sx + sw / 2, cy = sy + 420;
      g.beginPath(); g.arc(cx, cy, 130 * k, 0, 7); g.fillStyle = C.mint; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke();
      if (k > .9) ln([[cx - 60, cy], [cx - 15, cy + 50], [cx + 65, cy - 50]], '#fff', 22);
      txt(title, cx, sy + 680, 60, C.ink, 'center'); sub.forEach((s, i) => txt(s, cx, sy + 770 + i * 64, 40, '#555', 'center'));
    };
  },
  lowBattery() {
    return (sx, sy, sw, sh, t) => {
      const cx = sx + sw / 2, blink = Math.sin(t * 8) > 0;
      txt('22:17', cx, sy + 300, 130, '#fff', 'center');
      g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(cx - 120, sy + 460, 220, 110); g.fillStyle = '#fff'; g.fillRect(cx + 104, sy + 495, 18, 40);
      if (blink) { g.fillStyle = C.red; g.fillRect(cx - 108, sy + 472, 12, 86); }
      txt('1%', cx, sy + 720, 110, C.red, 'center'); txt('Подключите зарядку', cx, sy + 820, 44, '#ddd', 'center');
    };
  },
};
let st_bg = C.screen;

// ---------------- captions ----------------
function caption(lines) {
  g.font = '66px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.yellow; g.strokeStyle = C.yellow; g.lineWidth = 5; g.lineJoin = 'round';
  g.shadowColor = 'rgba(10,20,70,0.55)'; g.shadowBlur = 14;
  lines.forEach((l, i) => { const y = 290 + i * 80 - (lines.length - 1) * 40; g.strokeText(l, W / 2, y); g.fillText(l, W / 2, y); });
  g.shadowBlur = 0; g.shadowColor = 'transparent';
}

// ---------------- render ----------------
// episode = {shots:[{dur, kind:'wide'|'phone', cam?:{z,cx,cy}, st:(lt)=>state, cap:[...]|(lt)=>[...]}]}
function render(ep, out, stillTimes) {
  const total = ep.shots.reduce((a, s) => a + s.dur, 0);
  const cv = createCanvas(W, H); g = cv.getContext('2d');
  function frame(t) {
    let s0 = 0, shot = ep.shots[ep.shots.length - 1];
    for (const s of ep.shots) { if (t < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
    const lt = t - s0, cam = shot.cam || {z: 1, cx: W / 2, cy: H / 2}, z = (cam.z || 1) * (1 + lt * 0.006);
    g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cam.cx, -cam.cy);
    const st = Object.assign({t: lt}, shot.st(lt));
    st_bg = st.bg || C.screen;
    (shot.kind === 'phone' ? phone : wide)(st);
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(T.grain, 0, 0);
    const cap = typeof shot.cap === 'function' ? shot.cap(lt) : shot.cap; if (cap && cap.length) caption(cap);
  }
  if (stillTimes) { const outs = []; for (const t of stillTimes) { frame(t); const f = out.replace(/\.mp4$/, `_${t}.png`); fs.writeFileSync(f, cv.toBuffer('image/png')); outs.push(f); } return Promise.resolve(outs); }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out + '.silent.mp4'], {stdio: ['pipe', 'inherit', 'inherit']});
  return (async () => { for (let i = 0; i < Math.round(total * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); mixAudio(ep, out, total); fs.unlinkSync(out + '.silent.mp4'); return [out]; })();
}

// ---------------- audio ----------------
// music bed (series theme) + SFX. shot.sfx = [[timeInShot, name, volume]]; cuts get a soft whoosh;
// music ducks under the last shot (punchline) where ep.sting plays.
const AUD = path.join(__dirname, 'audio');
function mixAudio(ep, out, total) {
  const ev = []; let s0 = 0;
  ep.shots.forEach((sh, i) => { if (i) ev.push([s0, 'whoosh', 0.35]); for (const [t, n, v] of (sh.sfx || [])) ev.push([s0 + t, n, v ?? 0.8]); s0 += sh.dur; });
  const lastStart = total - ep.shots[ep.shots.length - 1].dur;
  const args = ['-y', '-v', 'error', '-i', out + '.silent.mp4', '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')];
  ev.forEach(([, n]) => args.push('-i', path.join(AUD, n + '.mp3')));
  const duck = ep.duck ?? lastStart;
  let fc = `[1:a]atrim=0:${total},asetpts=N/SR/TB,volume='if(gt(t,${duck}),0.10,0.32)':eval=frame,afade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8[m]`;
  const labels = ['[m]'];
  ev.forEach(([t, , v], i) => { const ms = Math.max(0, Math.round(t * 1000)); fc += `;[${i + 2}:a]volume=${v},adelay=${ms}|${ms}[s${i}]`; labels.push(`[s${i}]`); });
  fc += `;${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(total), '-movflags', '+faststart', out);
  const r = require('child_process').spawnSync('ffmpeg', args, {stdio: 'inherit'}); if (r.status) throw new Error('audio mix failed');
}

const FACE = {z: 1.55, cx: 560, cy: 720}; // reaction close-up camera
module.exports = {render, SCREENS, FACE, C, clamp, ease, rub};
