// v2 — closer to the reference look: scratchy crosshatch wall, line-drawn bob hair,
// striped knit turtleneck, mesh chair, X-leg grid table, Pangolin caps captions.
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn} = require('child_process');
const fs = require('fs');
const W = 1080, H = 1920, FPS = 30;
const F = __dirname + '/node_modules/@fontsource/';
GlobalFonts.registerFromPath(F + 'pangolin/files/pangolin-cyrillic-400-normal.woff2', 'Cap');
GlobalFonts.registerFromPath(F + 'pangolin/files/pangolin-latin-400-normal.woff2', 'Cap');

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let g;

// ---------------- textures ----------------
function mk() { const c = createCanvas(W, H); return [c, c.getContext('2d')]; }
function hatchTex(seed, clusters, light, dark, len = [50, 130], spread = 70, lw = 2.2) {
  const [c, x] = mk(), r = rng(seed); x.lineCap = 'round';
  for (let i = 0; i < clusters; i++) {
    const cx = r() * W, cy = r() * H, a = r() * Math.PI, n = 6 + r() * 12, L = len[0] + r() * (len[1] - len[0]);
    x.strokeStyle = r() < .55 ? light : dark; x.lineWidth = lw * (.5 + r());
    for (let k = 0; k < n; k++) {
      const off = (k - n / 2) * (spread / n), ox = cx + Math.cos(a + Math.PI / 2) * off + (r() - .5) * 10, oy = cy + Math.sin(a + Math.PI / 2) * off + (r() - .5) * 10;
      const l = L * (.6 + r() * .5);
      x.beginPath(); x.moveTo(ox - Math.cos(a) * l / 2, oy - Math.sin(a) * l / 2);
      x.quadraticCurveTo(ox + (r() - .5) * 10, oy + (r() - .5) * 10, ox + Math.cos(a) * l / 2, oy + Math.sin(a) * l / 2); x.stroke();
    }
  }
  return c;
}
function dirTex(seed, n, len, lw, light, dark, ang, jit = .25) {
  const [c, x] = mk(), r = rng(seed); x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const px = r() * W, py = r() * H, a = ang + (r() - .5) * jit, l = len * (.4 + r());
    x.strokeStyle = r() < .5 ? light : dark; x.lineWidth = lw * (.4 + r());
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
function stripeTex(seed) { // knit: wavy pale horizontal lines + grain
  const [c, x] = mk(), r = rng(seed);
  x.drawImage(dirTex(seed + 1, 7000, 14, 2, 'rgba(255,255,190,0.18)', 'rgba(90,90,0,0.16)', 0, .6), 0, 0);
  x.strokeStyle = 'rgba(250,250,190,0.55)'; x.lineWidth = 2.2;
  for (let y = 0; y < H; y += 34 + r() * 8) {
    x.beginPath(); for (let px = 0; px <= W; px += 30) { const yy = y + Math.sin(px / 90 + y) * 4 + (r() - .5) * 3; px ? x.lineTo(px, yy) : x.moveTo(px, yy); }
    x.stroke();
  }
  return c;
}
function meshTex() { const [c, x] = mk(); x.strokeStyle = 'rgba(160,120,90,0.45)'; x.lineWidth = 1.6;
  for (let i = -H; i < W + H; i += 9) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); } return c; }
function grainTex(seed, a = 26) { const [c, x] = mk(), r = rng(seed); const im = x.createImageData(W, H);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = a; } x.putImageData(im, 0, 0); return c; }
console.time('tex');
const T = {
  wall: hatchTex(1, 4200, 'rgba(110,160,255,0.16)', 'rgba(5,20,90,0.2)', [40, 110], 45, 1.4),
  curtain: dirTex(2, 4000, 160, 2.2, 'rgba(120,175,255,0.28)', 'rgba(10,40,140,0.28)', Math.PI / 2, .12),
  knit: stripeTex(3),
  pants: dirTex(4, 9000, 90, 2.4, 'rgba(255,150,90,0.35)', 'rgba(110,30,0,0.35)', Math.PI / 2, .18),
  skin: grainTex(5, 16),
  wood: dirTex(6, 5000, 60, 2, 'rgba(255,190,120,0.3)', 'rgba(90,40,0,0.35)', Math.PI / 2, .1),
  mesh: meshTex(),
  floor: dirTex(7, 3000, 40, 1.5, 'rgba(255,255,255,0.35)', 'rgba(90,110,140,0.18)', 0.3, 1.5),
  paper: grainTex(8, 14),
  grain: grainTex(9, 18),
};
console.timeEnd('tex');

// ---------------- helpers ----------------
function wob(pts, seed, amt = 2.5) { const r = rng(seed); return pts.map(([x, y]) => [x + (r() - .5) * amt, y + (r() - .5) * amt]); }
function smoothPath(pts) { g.beginPath(); const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.moveTo(...mid(pts[n - 1], pts[0])); for (let i = 0; i < n; i++) g.quadraticCurveTo(...pts[i], ...mid(pts[i], pts[(i + 1) % n])); g.closePath(); }
function sharp(pts, r = 22) { const o = [], n = pts.length; for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
  const da = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, dc = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, ra = Math.min(r, da / 2.2), rc = Math.min(r, dc / 2.2);
  o.push([b[0] + (a[0] - b[0]) / da * ra, b[1] + (a[1] - b[1]) / da * ra], b, [b[0] + (c[0] - b[0]) / dc * rc, b[1] + (c[1] - b[1]) / dc * rc]); } return o; }
const P = (pts, seed = 1, amt = 3, r = 22) => { const w = wob(pts, seed, amt); return () => smoothPath(sharp(w, r)); };
const S = (pts, seed = 1, amt = 3) => { const w = wob(pts, seed, amt); return () => smoothPath(w); }; // fully smooth
function ell(cx, cy, rx, ry, n = 18, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; }
function rr(x, y, w, h, r) { return [[x + r, y], [x + w - r, y], [x + w, y], [x + w, y + r], [x + w, y + h - r], [x + w, y + h], [x + w - r, y + h], [x + r, y + h], [x, y + h], [x, y + h - r], [x, y + r], [x, y]]; }
function paint(build, color, tex, a = 1, line = null, lw = 5) {
  build(); g.fillStyle = color; g.fill();
  if (tex) { const m = g.getTransform(); g.save(); build(); g.clip(); g.globalAlpha = a; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tex, 0, 0); g.restore(); g.setTransform(m); }
  if (line) { build(); g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
function ln(pts, color, w, close = false) { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); if (close) g.closePath(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function curve(a, c, b, color, w) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }

const C = { blue: '#1d45ad', blueL: '#2a62d6', lime: '#c8c536', limeD: '#a8a520', rust: '#c24d1b', skin: '#e2a089', skinD: '#c98068',
  red: '#d8442a', ink: '#141414', white: '#eef0f3', floor: '#c3ccd8', floorL: '#8f9db0', chair: '#3a2a22', wood: '#9a5c22', yellow: '#f4ef62', steel: '#737c88' };

// ---------------- background & props ----------------
function wall() {
  paint(() => { g.beginPath(); g.rect(-60, -60, W + 120, H + 120); }, C.blue, T.wall);
  // light curtain band right with soft edge
  const gr = g.createLinearGradient(820, 0, 1000, 0); gr.addColorStop(0, 'rgba(42,98,214,0)'); gr.addColorStop(1, 'rgba(42,98,214,0.95)');
  g.fillStyle = gr; g.fillRect(820, -60, 320, H);
  g.save(); g.beginPath(); g.rect(930, -60, 300, H); g.clip(); g.globalAlpha = .7; g.drawImage(T.curtain, 0, 0); g.restore();
  // vignette top
  const v = g.createLinearGradient(0, 0, 0, 700); v.addColorStop(0, 'rgba(5,15,60,0.35)'); v.addColorStop(1, 'rgba(5,15,60,0)'); g.fillStyle = v; g.fillRect(-60, -60, W + 120, 760);
}
function floor(y0 = 1545) {
  paint(() => { g.beginPath(); g.rect(-60, y0, W + 120, H - y0 + 60); }, C.floor, T.floor);
  const segs = []; for (let i = -8; i < 14; i++) segs.push([[i * 150, y0], [i * 150 - 330, H + 40]]);
  for (let j = 1; j < 5; j++) { const y = y0 + j * j * 22 + j * 40; segs.push([[-60, y], [W + 60, y]]); }
  for (const s of segs) ln(s, C.floorL, 4);
  // darker tiles checker hint
  g.save(); g.globalAlpha = .18; g.fillStyle = '#5d6f88';
  for (let j = 0; j < 4; j++) for (let i = -6; i < 12; i++) if ((i + j) % 2) {
    const yA = y0 + j * j * 22 + j * 40, yB = y0 + (j + 1) * (j + 1) * 22 + (j + 1) * 40, k = (y) => (y - y0) / (H + 40 - y0) * 330;
    g.beginPath(); g.moveTo(i * 150 - k(yA), yA); g.lineTo((i + 1) * 150 - k(yA), yA); g.lineTo((i + 1) * 150 - k(yB), yB); g.lineTo(i * 150 - k(yB), yB); g.fill();
  }
  g.restore();
}
function chair() {
  // back legs/posts
  paint(P([[770, 1060], [800, 1060], [830, 1900], [800, 1900]], 31, 2, 6), C.wood, T.wood);
  paint(P([[1010, 1010], [1040, 1010], [1075, 1800], [1045, 1800]], 32, 2, 6), C.wood, T.wood);
  paint(P([[800, 1090], [1010, 1090], [1010, 1110], [800, 1120]], 33, 2, 4), C.wood, T.wood);
  for (const x of [850, 900, 950]) paint(P([[x, 1120], [x + 18, 1120], [x + 22, 1300], [x + 4, 1300]], x, 2, 4), C.wood, T.wood);
  // back rest (mesh fabric)
  paint(P([[760, 930], [1080, 915], [1090, 1100], [770, 1120]], 34, 3, 30), C.chair, T.mesh, 1);
  // seat (behind legs)
  paint(P([[780, 1300], [980, 1290], [1000, 1460], [800, 1480]], 35, 3, 28), C.chair, T.mesh, 1);
  paint(P([[960, 1450], [990, 1450], [1010, 1900], [980, 1900]], 36, 2, 6), C.wood, T.wood);
}
function table(st) {
  // legs X
  paint(P([[440, 1330], [490, 1330], [760, 1930], [710, 1930]], 41, 2, 4), C.steel, T.skin, .8);
  paint(P([[470, 1330], [520, 1330], [250, 1930], [200, 1930]], 42, 2, 4), '#5f6772', T.skin, .8);
  const tb = S(ell(465, 1235, 430, 165, 28), 43, 6);
  paint(tb, C.white, T.paper);
  g.save(); tb(); g.clip(); const r = rng(44);
  for (let x = 60; x < 900; x += 86) ln([[x + (r() - .5) * 6, 1060], [x + (x - 465) * .06 + (r() - .5) * 8, 1410]], C.ink, 4);
  for (let y = 1095; y < 1410; y += 78) ln([[20, y + (r() - .5) * 6], [920, y + (r() - .5) * 6]], C.ink, 4);
  g.restore();
  // rim shading
  g.save(); tb(); g.clip(); const sh = g.createLinearGradient(0, 1300, 0, 1400); sh.addColorStop(0, 'rgba(120,130,150,0)'); sh.addColorStop(1, 'rgba(120,130,150,0.35)'); g.fillStyle = sh; g.fillRect(0, 1300, W, 120); g.restore();
  // mug
  const mx = 760, my = 1150;
  paint(P([[mx - 48, my - 70], [mx + 48, my - 70], [mx + 42, my + 30], [mx - 42, my + 30]], 45, 2, 10), '#e9e4d8', T.paper, 1, C.ink, 4);
  g.beginPath(); g.ellipse(mx + 56, my - 22, 22, 28, 0, -1.3, 1.3); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
  g.beginPath(); g.ellipse(mx, my - 70, 48, 10, 0, 0, 7); g.fillStyle = st.tea === 'hot' ? '#7a3f1d' : '#5a3a26'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
  // little red heart on mug
  g.fillStyle = C.red; g.beginPath(); g.arc(mx - 9, my - 22, 9, 0, 7); g.arc(mx + 9, my - 22, 9, 0, 7); g.moveTo(mx - 18, my - 19); g.lineTo(mx, my); g.lineTo(mx + 18, my - 19); g.fill();
  if (st.tea === 'hot') for (let k = 0; k < 2; k++) { const ph = st.t * 2.4 + k * 2; g.beginPath();
    for (let y = 0; y < 110; y += 6) { const x = mx - 14 + k * 28 + Math.sin(y / 16 + ph) * 9; y ? g.lineTo(x, my - 85 - y) : g.moveTo(x, my - 85 - y); }
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); }
}
function clock(hh, mm) {
  const cx = 860, cy = 560;
  paint(S(ell(cx, cy, 88, 88, 20), 51, 3), C.white, T.paper, 1, C.ink, 7);
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.2832; ln([[cx + Math.cos(a) * 66, cy + Math.sin(a) * 66], [cx + Math.cos(a) * 76, cy + Math.sin(a) * 76]], C.ink, 4); }
  const ah = ((hh % 12) + mm / 60) / 12 * 6.2832 - 1.5708, am = mm / 60 * 6.2832 - 1.5708;
  ln([[cx, cy], [cx + Math.cos(ah) * 40, cy + Math.sin(ah) * 40]], C.ink, 9);
  ln([[cx, cy], [cx + Math.cos(am) * 62, cy + Math.sin(am) * 62]], C.ink, 5);
}

// ---------------- character ----------------
function hair(x, y, seed, front) {
  // bob: dome + straight sides, jagged bottom at y+190
  const r = rng(seed);
  const shape = [[x - 215, y + 150], [x - 190, y - 20], [x - 150, y - 150], [x - 60, y - 205], [x + 60, y - 205], [x + 150, y - 150], [x + 195, y - 20], [x + 228, y + 150], [x + 235, y + 175], [x + 150, y + 160], [x - 150, y + 160], [x - 225, y + 175]];
  if (!front) {
    paint(S(shape, seed, 6), '#121214', null);
    // strands from crown, scratchy ends past the edge
    g.lineCap = 'round';
    for (let i = 0; i < 520; i++) {
      const a = Math.PI * (0.02 + .96 * r()), sx = x + (r() - .5) * 40, sy = y - 160;
      const ex = x - Math.cos(a) * (190 + r() * 40), ey = y + 120 + r() * 85 - Math.abs(Math.cos(a)) * 30;
      g.strokeStyle = r() < .5 ? 'rgba(70,75,95,0.55)' : 'rgba(0,0,0,0.75)'; g.lineWidth = .8 + r() * 1.8;
      g.beginPath(); g.moveTo(sx, sy); g.bezierCurveTo(x - Math.cos(a) * 220, y - 140, x - Math.cos(a) * 215, y + 20, ex, ey); g.stroke();
    }
  } else {
    // fringe over forehead: from crown to brow line, uneven
    g.save(); g.beginPath(); g.moveTo(x - 180, y + 10); g.quadraticCurveTo(x - 160, y - 185, x, y - 200); g.quadraticCurveTo(x + 160, y - 185, x + 182, y + 20);
    g.quadraticCurveTo(x + 150, y - 70, x + 60, y - 92); g.quadraticCurveTo(x - 40, y - 110, x - 100, y - 70); g.quadraticCurveTo(x - 140, y - 40, x - 150, y + 10);
    g.closePath(); g.fillStyle = '#121214'; g.fill(); g.clip();
    for (let i = 0; i < 260; i++) { const px = x - 190 + r() * 380; g.strokeStyle = r() < .5 ? 'rgba(70,75,95,0.6)' : 'rgba(0,0,0,0.8)'; g.lineWidth = .8 + r() * 1.6;
      g.beginPath(); g.moveTo(x - 40 + (px - x) * .2, y - 200); g.quadraticCurveTo(px + 40, y - 150, px + 60 + (r() - .5) * 10, y + 20); g.stroke(); }
    g.restore();
    // a few stray strands
    for (let i = 0; i < 0; i++) { const px = x - 170 + r() * 340; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, y - 70); g.lineTo(px + (r() - .5) * 8, y - 52 + r() * 12); g.stroke(); }
  }
}
function face(x, y, st) {
  paint(S(ell(x, y + 20, 112, 138, 20), 61, 3), C.skin, T.skin, 1);
  // ears
  // blush
  for (const s of [-1, 1]) { const bx = x + s * 70, by = y + 62; const rg = g.createRadialGradient(bx, by, 2, bx, by, 42); rg.addColorStop(0, 'rgba(225,95,95,0.65)'); rg.addColorStop(1, 'rgba(225,95,95,0)'); g.fillStyle = rg; g.fillRect(bx - 50, by - 50, 100, 100); }
  const ey = y + 8, ex = [x - 52, x + 50];
  for (let i = 0; i < 2; i++) {
    const e = ex[i];
    if (st.eyes === 'blink') { curve([e - 30, ey], [e, ey + 16], [e + 30, ey], C.ink, 6); continue; }
    if (st.eyes === 'wide') {
      g.beginPath(); g.ellipse(e, ey, 36, 34, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke();
      const jx = Math.sin(st.t * 7) * 1.5; g.beginPath(); g.arc(e + 2 + jx, ey + 1, 10, 0, 7); g.fillStyle = C.ink; g.fill();
    } else { // smug, looking down at phone: almond eye with heavy lid
      g.save(); g.beginPath(); g.moveTo(e - 36, ey + 4); g.quadraticCurveTo(e, ey - 22, e + 36, ey + 2); g.quadraticCurveTo(e, ey + 24, e - 36, ey + 4); g.closePath();
      g.fillStyle = '#fff'; g.fill(); g.clip(); g.beginPath(); g.arc(e - 6, ey + 6, 14, 0, 7); g.fillStyle = C.ink; g.fill(); g.restore();
      curve([e - 40, ey + 2], [e, ey - 26], [e + 40, ey], C.ink, 7);
      curve([e - 32, ey + 8], [e, ey + 22], [e + 32, ey + 6], C.ink, 3);
    }
  }
  // brows
  if (st.eyes === 'wide') { ln([[x - 92, y - 46], [x - 22, y - 52]], C.ink, 9); ln([[x + 18, y - 54], [x + 90, y - 50]], C.ink, 9); }
  else { ln([[x - 92, y - 26], [x - 20, y - 34]], C.ink, 9); ln([[x + 18, y - 38], [x + 88, y - 26]], C.ink, 9); }
  // nose
  g.beginPath(); g.moveTo(x - 2, y + 18); g.lineTo(x - 12, y + 70); g.quadraticCurveTo(x - 2, y + 78, x + 8, y + 72); g.strokeStyle = C.ink; g.lineWidth = 4; g.lineCap = 'round'; g.stroke();
  // mouth
  if (st.eyes === 'wide') { g.beginPath(); g.moveTo(x + 6, y + 102); g.quadraticCurveTo(x + 12, y + 114, x + 18, y + 104); g.quadraticCurveTo(x + 24, y + 114, x + 30, y + 102); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke(); }
  else curve([x - 20, y + 102], [x + 4, y + 114], [x + 26, y + 98], C.ink, 5);
}
function girl(st) {
  const x = 480, y = 610 + Math.sin(st.t * 2) * 2.5;
  hair(x, y, 70, false);
  // neck
  paint(P([[x - 38, y + 130], [x + 38, y + 130], [x + 42, y + 220], [x - 42, y + 220]], 62, 2, 8), C.skinD, T.skin);
  // torso turtleneck
  paint(P([[x - 120, y + 245], [x + 120, y + 245], [x + 230, y + 290], [x + 250, y + 640], [x - 260, y + 640], [x - 240, y + 290]], 63, 4, 70), C.lime, T.knit);
  // collar
  paint(P([[x - 70, y + 190], [x + 70, y + 190], [x + 80, y + 262], [x - 80, y + 262]], 64, 3, 14), C.lime, T.knit, 1, 'rgba(120,120,10,0.5)', 3);
  face(x, y, st);
  hair(x, y, 75, true);
  // left arm (her right) bent, forearm on table toward phone
  paint(P([[x - 240, y + 290], [x - 300, y + 520], [x - 270, y + 640], [x - 110, y + 560], [x - 120, y + 490], [x - 220, y + 520], [x - 190, y + 360]], 65, 4, 40), C.lime, T.knit, 1, 'rgba(120,115,10,0.55)', 3);
  // phone
  g.save(); g.translate(x - 80, y + 410); g.rotate(-0.12);
  paint(() => smoothPath(rr(-58, -105, 116, 210, 22)), C.red, T.skin, 1);
  paint(() => smoothPath(rr(-44, -90, 54, 60, 12)), '#a8331f', null); // camera island
  for (const [cx, cy] of [[-30, -76], [-4, -76], [-17, -50]]) { g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fillStyle = '#2a2a2a'; g.fill(); g.strokeStyle = '#ddd'; g.lineWidth = 2; g.stroke(); }
  g.restore();
  // hands holding phone
  paint(S([[x - 140, y + 470], [x - 110, y + 440], [x - 75, y + 470], [x - 70, y + 520], [x - 110, y + 545], [x - 145, y + 520]], 66, 3), C.skin, T.skin);
  paint(S([[x - 30, y + 420], [x + 10, y + 400], [x + 40, y + 440], [x + 30, y + 520], [x - 20, y + 530], [x - 50, y + 480]], 67, 3), C.skin, T.skin);
  for (let k = 0; k < 3; k++) curve([x - 40, y + 430 + k * 24], [x - 10, y + 440 + k * 24], [x + 20, y + 436 + k * 24], 'rgba(150,80,60,0.6)', 3);
  // right arm crossing to phone
  paint(P([[x + 230, y + 290], [x + 300, y + 520], [x + 260, y + 650], [x + 20, y + 560], [x + 40, y + 470], [x + 190, y + 520], [x + 180, y + 360]], 68, 4, 40), C.lime, T.knit, 1, 'rgba(120,115,10,0.55)', 3);
}
function pants() {
  paint(P([[190, 1300], [420, 1300], [400, 1930], [180, 1930]], 81, 3, 30), C.rust, T.pants);
  paint(P([[530, 1300], [770, 1300], [790, 1930], [590, 1930]], 82, 3, 30), C.rust, T.pants);
}

// ---------------- scenes ----------------
function wide(st) {
  wall(); clock(...st.clock); floor(); chair(); pants(); girl(st); table(st);
  if (st.q > 0) for (const [x, y, rot, d] of [[200, 520, -0.25, 0], [300, 400, 0.12, .25], [720, 470, 0.3, .5]]) {
    const a = Math.max(0, Math.min(1, (st.q - d) * 4)); if (!a) continue;
    g.save(); g.translate(x, y - (1 - a) * 30); g.rotate(rot + Math.sin(st.t * 3 + x) * .07); g.globalAlpha = a;
    g.font = '150px Cap'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('?', 0, 0); g.restore();
  }
}
function closeup(st) {
  wall();
  const tb = () => { g.beginPath(); g.moveTo(-60, 470); g.quadraticCurveTo(540, 300, 1140, 470); g.lineTo(1140, 1980); g.lineTo(-60, 1980); g.closePath(); };
  paint(tb, C.white, T.paper);
  g.save(); tb(); g.clip();
  for (let i = -3; i <= 3; i++) { const x = 540 + i * 230; g.beginPath(); g.moveTo(x + i * 40, 300); g.quadraticCurveTo(x - i * 40, 1150, x + i * 80, 1980); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke(); }
  for (let j = 0; j < 8; j++) { const y = 520 + j * 220; g.beginPath(); g.moveTo(-60, y + 40); g.quadraticCurveTo(540, y - 50, 1140, y + 40); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke(); }
  g.restore();
  // phone (tilted)
  g.save(); g.translate(560, 1050); g.rotate(0.07); g.translate(-560, -1050);
  const px = 250, py = 470, pw = 600, ph = 1120;
  paint(() => smoothPath(wob(rr(px, py, pw, ph, 80), 91, 5)), C.red, T.skin, 1, null);
  const sx = px + 32, sy = py + 38, sw = pw - 64, sh = ph - 76, scr = () => smoothPath(rr(sx, sy, sw, sh, 52));
  paint(scr, '#f6eaa6', T.paper);
  g.save(); scr(); g.clip();
  const pal = ['#f7c3b2', '#b9d3f2', '#cfe6ae', '#e9d0f4'];
  for (let k = 0; k < 10; k++) {
    const cy = sy + 130 + k * 420 - st.scroll; if (cy < sy - 430 || cy > sy + sh) continue;
    // post header
    g.beginPath(); g.arc(sx + 60, cy + 28, 24, 0, 7); g.fillStyle = ['#e2702c', '#5a8f3a', '#6a5acd', '#cc3355'][k % 4]; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke();
    g.font = '36px Cap'; g.fillStyle = C.ink; g.textAlign = 'left'; g.fillText(['котики_24', 'мурзик', 'пушистик', 'кот.дня'][k % 4], sx + 98, cy + 40);
    paint(() => smoothPath(rr(sx + 26, cy + 64, sw - 52, 320, 26)), pal[k % 4], null, 1, C.ink, 4);
    cat(sx + sw / 2, cy + 240, k);
  }
  g.fillStyle = '#f6eaa6'; g.fillRect(sx, sy, sw, 104);
  g.font = '54px Cap'; g.fillStyle = C.ink; g.textAlign = 'left'; g.fillText(st.time, sx + 50, sy + 76);
  g.restore();
  paint(() => smoothPath(rr(px + pw / 2 - 95, py + 30, 190, 46, 23)), C.ink, null);
  g.restore();
  // left hand holding phone edge + sleeve
  paint(S([[-80, 1200], [140, 1060], [250, 1020], [290, 1250], [230, 1640], [-80, 1760]], 92, 6), C.skin, T.skin);
  for (let k = 0; k < 3; k++) paint(S(ell(268 + k * 6, 1040 + k * 80, 46, 30, 12, -0.15), 96 + k, 3), C.skin, T.skin, 1, 'rgba(150,80,60,0.5)', 3);
  paint(P([[-80, 1600], [170, 1560], [300, 1980], [-80, 1980]], 93, 6, 50), C.lime, T.knit);
  // right thumb scrolling
  const ty = 1360 - st.thumb * 190;
  paint(S([[1160, 1560], [900, 1520], [740, ty + 50], [690, ty], [720, ty - 45], [790, ty - 30], [960, 1330], [1160, 1290]], 94, 6), C.skin, T.skin);
  g.beginPath(); g.ellipse(716, ty - 6, 28, 19, -0.5, 0, 7); g.fillStyle = 'rgba(255,225,215,0.7)'; g.fill();
  paint(P([[1160, 1590], [930, 1600], [1000, 1980], [1160, 1980]], 95, 6, 50), C.lime, T.knit);
}
function cat(x, y, k) {
  const col = ['#2f2f33', '#e0883a', '#f4f4f4', '#9a9a9a'][k % 4];
  paint(S(ell(x, y + 50, 130, 85, 14), 200 + k, 8), col, T.skin, 1, C.ink, 4);
  paint(S([[x - 90, y], [x - 100, y - 130], [x - 45, y - 80], [x + 45, y - 80], [x + 100, y - 130], [x + 90, y], [x + 70, y + 45], [x - 70, y + 45]], 300 + k, 6), col, T.skin, 1, C.ink, 4);
  g.fillStyle = k % 4 === 0 ? C.yellow : C.ink; g.beginPath(); g.arc(x - 34, y - 18, 10, 0, 7); g.arc(x + 34, y - 18, 10, 0, 7); g.fill();
  g.beginPath(); g.moveTo(x - 9, y + 8); g.lineTo(x + 9, y + 8); g.lineTo(x, y + 17); g.closePath(); g.fillStyle = '#e8706a'; g.fill();
}
function caption(lines) {
  g.font = '66px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.yellow; g.strokeStyle = C.yellow; g.lineWidth = 5; g.lineJoin = 'round';
  lines.forEach((l, i) => { const y = 290 + i * 80 - (lines.length - 1) * 40; g.strokeText(l, W / 2, y); g.fillText(l, W / 2, y); });
}

// ---------------- timeline (12 s) ----------------
const DUR = 12;
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  let sc, s0;
  if (t < 3.4) [sc, s0] = ['w1', 0]; else if (t < 7.0) [sc, s0] = ['cu', 3.4]; else [sc, s0] = ['w2', 7.0];
  const lt = t - s0, z = 1 + lt * 0.006;
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  let cap;
  if (sc === 'w1') {
    const blink = (lt > 1.3 && lt < 1.43) || (lt > 2.8 && lt < 2.93);
    wide({eyes: blink ? 'blink' : 'down', clock: [23, lt * .4], tea: 'hot', q: 0, t: lt});
    cap = ['ДОПЬЮ ЧАЙ', 'И ЛЯГУ СПАТЬ'];
  } else if (sc === 'cu') {
    const cyc = .75, k = Math.floor(lt / cyc), f = (lt % cyc) / cyc, sw = f < .4 ? (1 - Math.cos(f / .4 * Math.PI)) / 2 : 1;
    const ts = ['23:01', '23:01', '23:24', '23:52', '00:31', '01:07', '01:46', '02:28', '03:02', '03:39'];
    closeup({scroll: (k + sw) * 420, thumb: f < .4 ? sw : Math.max(0, 1 - (f - .4) / .25), time: ts[Math.min(9, Math.floor(lt / 0.38))]});
    cap = ['ПОСМОТРЮ', 'ОДНО ВИДЕО...'];
  } else {
    const blink = lt > 3.4 && lt < 3.52;
    wide({eyes: blink ? 'blink' : 'wide', clock: [3, 40], tea: 'cold', q: lt > 2.2 ? (lt - 2.2) / 1.2 : 0, t: lt});
    cap = lt < 2.2 ? ['А СКОЛЬКО', 'СЕЙЧАС ВРЕМЕНИ?'] : ['ЛАДНО,', 'ЕЩЁ ОДНО ВИДЕО'];
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(T.grain, 0, 0);
  caption(cap);
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const out = process.argv[2] || 'out.mp4', still = process.argv[3];
if (still) { for (const t of still.split(',').map(Number)) { frame(t); fs.writeFileSync(`v2_${t}.png`, cv.toBuffer('image/png')); } process.exit(0); }
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-movflags', '+faststart', out], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => { for (let i = 0; i < DUR * FPS; i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
