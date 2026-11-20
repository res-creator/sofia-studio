// Hand-drawn kit extracted from shusha/render_hand.js (brush outlines, potato shapes, watercolor, paper). Used to draw our cast in that style.
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, SR = 44100;
const F = path.join(__dirname, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
const FONT = 'HL, HC';
let g;
function setG(x) { g = x; }
const C = {ink: '#251c1a', wall: '#ffdc8a', wallS: '#f5c35e', floor: '#cf7a3c', floorD: '#a85a22', fridge: '#ffffff', fridgeIn: '#d6f6ff', night: '#26409a', nightD: '#182a6e',
  skin: '#ffc9a1', skinS: '#f39d74', blush: 'rgba(255,80,110,0.5)', hair: '#2fd35a', hairS: '#13a33a', hoodie: '#ff7417', hoodieS: '#de5300', tights: '#ff3434',
  kskin: '#ffc292', kskinS: '#eb955f', beanie: '#8b35ff', beanieS: '#661bd8', khood: '#3f8bf0', khoodS: '#2466c9', table: '#ee9437', tableS: '#c46d18', mustard: '#ffcc12', lamp: '#ffd83a'};

// ---------------- noise / geometry ----------------
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function noise1(seed, closed) { const r = rng(seed); const terms = [1, 2, 3, 5].map((f, k) => ({f: closed ? f : f + r() * .7, a: (1 / (k + 1)) * (.6 + r() * .8), p: r() * 6.28})); return (u) => terms.reduce((s, q) => s + q.a * Math.sin(u * 6.2832 * q.f + q.p), 0) / 1.6; }
function resample(pts, step, closed) {
  const P = closed ? pts.concat([pts[0]]) : pts, out = [];
  for (let i = 0; i < P.length - 1; i++) { const [a, b] = [P[i], P[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)); for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  if (!closed) out.push(P[P.length - 1]); return out;
}
function smoothPts(pts, closed, it = 2) { let p = pts; for (let k = 0; k < it; k++) p = p.map((q, i) => { const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length]; if (!closed && (i === 0 || i === p.length - 1)) return q; return [(a[0] + 2 * q[0] + b[0]) / 4, (a[1] + 2 * q[1] + b[1]) / 4]; }); return p; }
function normals(p, closed) { return p.map((q, i) => { const a = p[Math.max(0, i - 1)] , b = p[Math.min(p.length - 1, i + 1)]; const A = closed ? p[(i - 1 + p.length) % p.length] : a, B = closed ? p[(i + 1) % p.length] : b; const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }); }
function wobble(pts, closed, seed, amp) { const n = noise1(seed, closed), N = normals(pts, closed); return pts.map((q, i) => { const u = i / pts.length, d = amp * n(u); return [q[0] + N[i][0] * d, q[1] + N[i][1] * d]; }); }
// shape generators (return point loops)
const ell = (cx, cy, rx, ry, rot = 0) => { const p = [], n = Math.max(24, Math.round((rx + ry) / 4)); for (let i = 0; i < n; i++) { const a = i / n * 6.2832, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; };
const potato = (cx, cy, rx, ry, seed, irr = .08) => { const n = noise1(seed, true); return ell(cx, cy, rx, ry).map(([x, y], i, a) => { const k = 1 + irr * n(i / a.length); return [cx + (x - cx) * k, cy + (y - cy) * k]; }); };
const rr = (x, y, w, h, r) => { const p = [], seg = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + k / 6 * 1.5708; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }; seg(x + w - r, y + r, -1.5708); seg(x + w - r, y + h - r, 0); seg(x + r, y + h - r, 1.5708); seg(x + r, y + r, 3.1416); return p; };
function tube(path_, w0, w1 = w0) { // thick limb outline with round caps
  const p = smoothPts(resample(path_, 8, false), false, 3), N = normals(p, false), L = [], R = [];
  p.forEach((q, i) => { const w = (w0 + (w1 - w0) * i / (p.length - 1)) / 2; L.push([q[0] + N[i][0] * w, q[1] + N[i][1] * w]); R.push([q[0] - N[i][0] * w, q[1] - N[i][1] * w]); });
  const cap = (c, n, w, dir) => { const out = [], a0 = Math.atan2(n[1], n[0]); for (let k = 1; k < 8; k++) { const a = a0 + dir * k / 8 * Math.PI; out.push([c[0] + Math.cos(a) * w / 2, c[1] + Math.sin(a) * w / 2]); } return out; };
  return L.concat(cap(p[p.length - 1], N[N.length - 1], w1, -1), R.reverse(), cap(p[0], N[0].map(v => -v), w0, -1));
}

// ---------------- textures ----------------
function mk() { const c = createCanvas(W, H); return [c, c.getContext('2d')]; }
const WASH = (() => { const [c, x] = mk(), r = rng(11); for (let i = 0; i < 260; i++) { const px = r() * W, py = r() * H, rad = 40 + r() * 180, gr = x.createRadialGradient(px, py, 0, px, py, rad), dark = r() < .55;
  gr.addColorStop(0, dark ? 'rgba(120,60,20,0.04)' : 'rgba(255,255,245,0.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
  // fine pigment edges
  for (let i = 0; i < 4000; i++) { x.fillStyle = r() < .5 ? 'rgba(90,60,30,0.035)' : 'rgba(255,255,255,0.06)'; x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); } return c; })();
const PAPER = (() => { const [c, x] = mk(), r = rng(12), im = x.createImageData(W, H);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 90; im.data[i] = v; im.data[i + 1] = v * .98; im.data[i + 2] = v * .93; im.data[i + 3] = 10; } x.putImageData(im, 0, 0);
  x.strokeStyle = 'rgba(120,100,70,0.05)'; for (let i = 0; i < 1800; i++) { const px = r() * W, py = r() * H; x.lineWidth = .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 30, py + (r() - .5) * 30); x.stroke(); } return c; })();

// ---------------- hand-drawn primitives ----------------
function pathOf(p) { g.beginPath(); g.moveTo(...p[0]); for (let i = 1; i < p.length; i++) g.lineTo(...p[i]); g.closePath(); }
function brush(p, closed, seed, w, col = C.ink) { // tapered strokes, broken into 2–3 pieces with tiny gaps/overshoots
  const r = rng(seed), n = p.length; if (n < 3) return;
  let cuts = closed ? [Math.floor(r() * n)] : [0];
  if (closed) { const k = 1 + Math.floor(r() * 2); for (let j = 0; j < k; j++) cuts.push(Math.floor(cuts[0] + (j + 1) * n / (k + 1) + (r() - .5) * n * .1)); }
  const segs = closed ? cuts.map((c, j) => [c, (cuts[(j + 1) % cuts.length] + (j === cuts.length - 1 ? n : 0)) + (r() < .6 ? 2 : -1)]) : [[0, n - 1]];
  for (const [a, b0] of segs) {
    const b = Math.max(a + 2, b0), pts = []; for (let i = a; i <= b; i++) pts.push(p[((i % n) + n) % n]);
    const N = normals(pts, false), L = [], R = [], m = pts.length - 1, wv = noise1(seed + a, false);
    pts.forEach((q, i) => { const u = i / m, ww = w * (0.25 + 0.75 * Math.pow(Math.sin(Math.PI * u), 0.5)) * (1 + .18 * wv(u)) / 2; L.push([q[0] + N[i][0] * ww, q[1] + N[i][1] * ww]); R.push([q[0] - N[i][0] * ww, q[1] - N[i][1] * ww]); });
    g.beginPath(); g.moveTo(...L[0]); for (const q of L.slice(1)) g.lineTo(...q); for (const q of R.reverse()) g.lineTo(...q); g.closePath(); g.fillStyle = col; g.fill();
  }
}
// main drawing call
function draw(shapePts, o = {}) {
  const seed = o.seed || 1, closed = o.closed !== false;
  const base = smoothPts(resample(shapePts, 7, closed), closed, 1);
  if (o.fill) {
    const r = rng(seed + 7), off = o.offset ?? 4, fp = wobble(base, closed, seed + 3, o.amp ?? 2.2).map(([x, y]) => [x + (r() - .5) * off, y + (r() - .5) * off]);
    pathOf(fp); g.fillStyle = o.fill; g.fill();
    g.save(); pathOf(fp); g.clip();
    if (o.shade) { const [sx, sy] = o.shadeDir || [16, 12]; g.fillStyle = o.shade; g.globalAlpha = .5; g.fillRect(-2000, -2000, 6000, 6000); g.globalAlpha = 1; g.translate(-sx, -sy); pathOf(fp); g.fillStyle = o.fill; g.fill(); g.translate(sx, sy); }
    const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.washA ?? 1; g.drawImage(WASH, 0, 0); g.globalAlpha = 1; g.setTransform(m);
    g.restore();
  }
  if (o.line !== false) brush(wobble(base, closed, seed, o.amp ?? 2.2), closed, seed, o.lw || 7, o.col);
}
const stroke = (pts, lw = 6, seed = 5, amp = 1.5) => draw(pts, {closed: false, lw, seed, amp});
function curve(a, c, b, lw = 6, seed = 5) { const p = []; for (let k = 0; k <= 16; k++) { const u = k / 16; p.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]); } stroke(p, lw, seed); }
function spot(x, y, rx, ry, col) { const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore(); }
function hand(text, x, y, size, col = C.ink, align = 'center', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px ${FONT}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(text, 0, 0); g.restore(); }

// ---------------- set ----------------
function room(time) {
  draw(rr(-300, -300, W + 600, 1870, 1), {fill: '#8fe6c3', line: false, seed: 3, amp: 0, offset: 0});
  for (let x = -40, k = 0; x < W + 60; x += 110, k++) draw([[x, -50], [x + 6, 1560]], {closed: false, lw: 14, seed: 120 + k, amp: 3, col: 'rgba(255,255,245,0.35)'});
  spot(560, 300, 520, 420, 'rgba(255,230,160,0.35)');
  stroke([[560, -40], [562, 170]], 5, 21);
  draw([[470, 270], [650, 270], [600, 170], [520, 170]], {fill: '#ff6a52', shade: '#e04a32', seed: 22, lw: 7});
  draw(potato(560, 282, 34, 16, 23), {fill: '#fff6cf', seed: 24, lw: 5});
  // window (night)
  draw(rr(600, 470, 380, 340, 14), {fill: C.night, shade: C.nightD, shadeDir: [-20, -14], seed: 131, lw: 9});
  draw(potato(900, 540, 30, 30, 132), {fill: '#f7e7a6', seed: 133, lw: 5});
  g.fillStyle = '#f5d66a'; for (const [x, y] of [[640, 700], [700, 660], [760, 720], [880, 690], [930, 740]]) g.fillRect(x, y, 15, 19);
  stroke([[790, 476], [792, 806]], 8, 134); stroke([[606, 640], [976, 636]], 8, 135);
  // poster «БЕГИ!»
  draw([[70, 400], [330, 392], [338, 760], [76, 768]], {fill: '#fff2c9', shade: '#ead79c', seed: 136, lw: 7});
  hand('HELLO!', 204, 470, 74, '#e0503f', 'center', -0.04);
  draw(potato(204, 620, 46, 46, 137), {fill: '#7fc4e8', seed: 138, lw: 5}); stroke([[170, 700], [204, 650], [240, 700]], 6, 139); stroke([[150, 640], [204, 610], [260, 660]], 6, 140);
  // plant
  draw([[90, 1420], [230, 1420], [212, 1560], [108, 1560]], {fill: '#f2643a', shade: '#cc4718', seed: 141, lw: 7});
  for (let k = 0; k < 6; k++) { const a = -2.4 + k * .32; draw(potato(160 + Math.cos(a) * 90, 1360 + Math.sin(a) * 110, 30, 70, 142 + k, .1).map(([px, py]) => [px, py]), {fill: '#3cc24a', shade: '#1e9a30', seed: 150 + k, lw: 6}); }
  // floor + rug
  draw([[-300, 1560], [W + 300, 1556], [W + 300, 2300], [-300, 2300]], {fill: C.floor, shade: C.floorD, shadeDir: [0, -40], seed: 51, lw: 8});
  for (let x = -200, k = 0; x < W + 200; x += 130, k++) draw([[x, 1575], [x - 90, 2000]], {closed: false, lw: 5, seed: 200 + k, amp: 2, col: 'rgba(110,70,40,0.6)'});
  draw(potato(470, 1730, 330, 90, 160, .05), {fill: '#ff6f9f', shade: '#e44d80', shadeDir: [0, -16], seed: 161, lw: 7});
}
function handF(x, y, ang, type, skin, skinS, seed, flip = 1) {
  const dir = [Math.cos(ang), Math.sin(ang)], nrm = [-dir[1] * flip, dir[0] * flip];
  const at = (f, s) => [x + dir[0] * f + nrm[0] * s, y + dir[1] * f + nrm[1] * s];
  const finger = (s, len, bend, w, k) => { const a = at(14, s), m = at(14 + len * .55, s + bend * .5), b = at(14 + len, s + bend); draw(tube([a, m, b], w, w * .85), {fill: skin, seed: seed + k, lw: 4.5, amp: 1}); };
  const curl = (s, k) => draw(potato(...at(24, s), 11, 10, seed + 20 + k, .15), {fill: skin, shade: skinS, seed: seed + 30 + k, lw: 4.5, amp: 1});
  if (type === 'open') { finger(-15, 34, -8, 15, 1); finger(-4, 40, -2, 15, 2); finger(7, 38, 3, 15, 3); finger(17, 30, 8, 13, 4); }
  else if (type === 'point') { curl(-12, 1); curl(0, 2); curl(11, 3); finger(-16, 46, -4, 15, 4); }
  else { curl(-15, 1); curl(-4, 2); curl(7, 3); curl(17, 4); }
  draw(potato(x, y, 27, 24, seed + 40, .12).map(([px, py]) => [x + (px - x) * Math.abs(dir[0]) + (px - x) * .2, py]), {fill: skin, shade: skinS, seed: seed + 41, lw: 5.5, amp: 1.2});
  const th = type === 'open' || type === 'point' ? [at(2, -26), at(18, -40)] : [at(4, -24), at(20, -18)];
  draw(tube([at(-4, -16), ...th], 15, 13), {fill: skin, seed: seed + 42, lw: 4.5, amp: 1});
}

module.exports = { setG, get g() { return g; }, C, W, H, FONT, rng, noise1, resample, smoothPts, normals, wobble, ell, potato, rr, tube, mk, WASH, PAPER, pathOf, brush, draw, stroke, curve, spot, hand, room, handF, createCanvas };