// «Давай замуж!» — character sketch sheet in our toon v4 style.   node sheet.js -> sketch.png
const fs = require('fs'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 2400, H = 2660, cv = createCanvas(W, H); let g = cv.getContext('2d'), INK = '#2a2230';
const P = () => g.beginPath();
function fsx(fill, lw = 7) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const ell = (x, y, rx, ry, fill, lw = 7, rot = 0) => { P(); g.ellipse(x, y, rx, ry, rot, 0, 7); fsx(fill, lw); };
const rr = (x, y, w, h, r, fill, lw = 7) => { P(); g.roundRect(x, y, w, h, r); fsx(fill, lw); };
const ln = (pts, w, col = INK) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };

// ---------- cast ----------
const ZH = {outfit: 'emerald', hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, nails: '#d63a8a', pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}};
const towerFx = c => (gg, HY) => { P(); gg.moveTo(-120, HY - 150); gg.bezierCurveTo(-170, HY - 330, -90, HY - 470, 0, HY - 470); gg.bezierCurveTo(90, HY - 470, 170, HY - 330, 120, HY - 150); gg.quadraticCurveTo(0, HY - 190, -120, HY - 150); gg.closePath(); fsx(c.hair);
  g.save(); P(); g.moveTo(-120, HY - 150); g.bezierCurveTo(-170, HY - 330, -90, HY - 470, 0, HY - 470); g.bezierCurveTo(90, HY - 470, 170, HY - 330, 120, HY - 150); g.closePath(); g.clip(); g.fillStyle = c.hairS; g.fillRect(50, HY - 480, 140, 340); g.restore();
  for (const [a, b] of [[HY - 200, HY - 260], [HY - 280, HY - 340], [HY - 360, HY - 410]]) { P(); g.moveTo(-110, a); g.quadraticCurveTo(0, b - 30, 110, a); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  for (let k = 0; k < 7; k++) ell(-96 + k * 32, HY - 168 - Math.sin(k / 6 * Math.PI) * 14, 9, 9, '#fbf6ea', 4); };   // pearl hair band
const EL = {outfit: 'gown', hair: 'bun', lashes: true, earrings: '#fbf6ea', nails: '#9a2040', pal: {skin: '#efc4a4', skinS: '#dba886', hair: '#5a2e22', hairS: '#3f1f17', brow: '#3a2018', lip: '#9a2040'}};
EL.hairFx = towerFx(EL.pal);
const turbanFx = (gg, HY) => { P(); gg.moveTo(-178, HY - 40); gg.bezierCurveTo(-210, HY - 230, -80, HY - 300, 0, HY - 300); gg.bezierCurveTo(80, HY - 300, 210, HY - 230, 178, HY - 40); gg.quadraticCurveTo(0, HY - 110, -178, HY - 40); gg.closePath(); fsx('#7a3ad0');
  g.save(); P(); g.moveTo(-178, HY - 40); g.bezierCurveTo(-210, HY - 230, -80, HY - 300, 0, HY - 300); g.bezierCurveTo(80, HY - 300, 210, HY - 230, 178, HY - 40); g.closePath(); g.clip(); g.fillStyle = '#5e28a8'; g.fillRect(70, HY - 320, 160, 300); g.restore();
  for (const [a, b, c2] of [[[-170, HY - 80], [-40, HY - 250], [150, HY - 200]], [[-150, HY - 180], [20, HY - 160], [170, HY - 70]]]) { P(); g.moveTo(...a); g.quadraticCurveTo(...b, ...c2); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  P(); g.moveTo(0, HY - 220); g.quadraticCurveTo(30, HY - 330, 70, HY - 360); g.quadraticCurveTo(40, HY - 300, 20, HY - 210); g.closePath(); fsx('#f2c820', 5);   // feather
  ell(0, HY - 150, 26, 30, '#3ac8d8', 6); ell(-6, HY - 160, 7, 9, 'rgba(255,255,255,.8)', 0); };
const ZV = {outfit: 'mystic', hair: 'long', lashes: true, earrings: '#f2c820', nails: '#7a3ad0', hairFx: turbanFx, pal: {skin: '#e8b48e', skinS: '#d39a74', hair: '#2a1f2a', hairS: '#1a141a', brow: '#2a1f2a', lip: '#a03a7a'}};
const BR = {outfit: 'pinkblazer', hair: 'long', lashes: true, earrings: '#f2c820', skirt: true, nails: '#ff2a8a', pal: {skin: '#f6d0b8', skinS: '#e4b39a', hair: '#3a2418', hairS: '#2a1a10', brow: '#3a2418', lip: '#e0306a', shoe: '#ffffff', sole: '#f27ab0'}};
const hoodFx = c => (gg, HY) => { P(); gg.moveTo(-200, HY + 190); gg.bezierCurveTo(-250, HY - 60, -150, HY - 230, 0, HY - 230); gg.bezierCurveTo(150, HY - 230, 250, HY - 60, 200, HY + 190); gg.closePath(); fsx(c.topS); };
const MK = {outfit: 'hoodie', hair: 'curly', pal: {skin: '#f2c9a8', skinS: '#ddaa88', hair: '#7a5030', hairS: '#5a3a20', brow: '#5a3a20', lip: '#c48070', top: '#8a93a0', topS: '#6f7884'}};
MK.backFx = hoodFx(MK.pal);
const bunFx = (gg, HY) => { ell(0, HY - 196, 50, 44, '#8a6a3a'); ln([[-30, HY - 160], [30, HY - 160]], 10, '#3a8a4a'); P(); g.moveTo(-20, HY - 220); g.quadraticCurveTo(0, HY - 236, 24, HY - 214); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); };
const beardFx = (gg, HY) => { g.save(); g.globalAlpha = .32; P(); g.moveTo(-140, HY + 40); g.quadraticCurveTo(-120, HY + 150, 0, HY + 158); g.quadraticCurveTo(120, HY + 150, 140, HY + 40); g.quadraticCurveTo(80, HY + 130, 0, HY + 130); g.quadraticCurveTo(-80, HY + 130, -140, HY + 40); g.closePath(); g.fillStyle = '#6a4a2a'; g.fill(); g.restore(); };
const JS = {outfit: 'linen', hair: 'short', hairFx: bunFx, faceFx: beardFx, pal: {skin: '#e9bd98', skinS: '#d4a07c', hair: '#8a6a3a', hairS: '#6a4e2a', brow: '#6a4e2a', lip: '#c47a6a'}};
const slickFx = (gg, HY) => { P(); g.moveTo(-90, HY - 160); g.quadraticCurveTo(0, HY - 200, 100, HY - 150); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 8; g.stroke(); };
const RY = {outfit: 'suit', hair: 'short', hairFx: slickFx, pal: {skin: '#f1c6a2', skinS: '#dca784', hair: '#2a1f1a', hairS: '#1a1410', brow: '#2a1f1a', lip: '#c47870'}};

// ---------- helpers ----------
const armPts = (fn, s) => { const f = fn(s); return T.solveArm(f[0], f[2], f[1], s, 0); };
const wpt = (x, y, sc, p) => [x + p[0] * sc, y + p[1] * sc];
const fa = (pts) => Math.atan2(pts[2][1] - pts[1][1], pts[2][0] - pts[1][0]);
function ch(def, x, y, sc, o = {}) { T.draw(g, {...def, x, y, s: sc, ...o}); }
function body(x, y, sc, fn) { g.save(); g.translate(x, y); g.scale(sc, sc); fn(); g.restore(); }
function pill(str, cx, cy, maxW = 280) { g.save(); let size = 28; g.font = `${size}px NBL, NBC`; while (g.measureText(str).width > maxW - 28 && size > 14) { size--; g.font = `${size}px NBL, NBC`; }
  const w = g.measureText(str).width + 28; rr(cx - w / 2, cy - size * .8, w, size * 1.6, size * .8, '#fffaf0', 3); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, cx, cy + 1); g.restore(); }
function rings(x, y, ang, sc, side) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc * side); for (const yy of [-15, -5, 5, 15]) { P(); g.ellipse(44, yy, 4, 7, 0, 0, 7); g.fillStyle = '#f2c820'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); } g.restore(); }
// props (world coords, sc = character scale)
function crystalBall(x, y, sc) { const r = 74 * sc; ell(x, y + r * .9, r * .8, r * .3, '#d4a82a', 7 * sc); ell(x, y, r, r, '#b9e6ff', 7 * sc); ell(x - r * .2, y - r * .1, r * .55, r * .55, '#d8c4ff', 0); ell(x - r * .35, y - r * .4, r * .18, r * .12, 'rgba(255,255,255,.9)', 0); for (const [a, b] of [[.3, -.3], [-.4, .3], [.1, .4]]) ell(x + a * r, y + b * r, 4 * sc, 4 * sc, '#ffffff', 0); }
function tarot(x, y, sc, label, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); const w = 120 * sc, h = 190 * sc; rr(-w / 2, -h / 2, w, h, 10 * sc, '#2a1a4a', 6 * sc); rr(-w / 2 + 8 * sc, -h / 2 + 8 * sc, w - 16 * sc, h - 16 * sc, 6 * sc, '#f6e8c0', 3 * sc);
  ell(0, -h * .12, 26 * sc, 26 * sc, '#f2c820', 4 * sc); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ln([[Math.cos(a) * 32 * sc, -h * .12 + Math.sin(a) * 32 * sc], [Math.cos(a) * 44 * sc, -h * .12 + Math.sin(a) * 44 * sc]], 4 * sc, '#d4a82a'); }
  T.fitText(g, label, {x: -w / 2 + 12 * sc, y: h * .18, w: w - 24 * sc, h: 46 * sc}, {maxSize: 40 * sc, minSize: 6, pad: 2, color: '#2a1a4a'}); g.restore(); }
function laptop(x, y, sc) { const w = 230 * sc, h = 150 * sc; // screen faces the viewer (we see the back? no: front, the joke is solitaire on screen)
  rr(x - w / 2, y - h, w, h, 10 * sc, '#3a3f4a', 7 * sc); rr(x - w / 2 + 12 * sc, y - h + 12 * sc, w - 24 * sc, h - 24 * sc, 4 * sc, '#2a8a4a', 0);
  for (let k = 0; k < 4; k++) { rr(x - w / 2 + 26 * sc + k * 46 * sc, y - h + 26 * sc, 34 * sc, 48 * sc, 4 * sc, '#ffffff', 3 * sc); ell(x - w / 2 + 43 * sc + k * 46 * sc, y - h + 50 * sc, 7 * sc, 7 * sc, k % 2 ? '#d02a3a' : INK, 0); }
  rr(x - w / 2 - 14 * sc, y - 6 * sc, w + 28 * sc, 22 * sc, 8 * sc, '#9aa2ae', 6 * sc); }
function kale(x, y, sc) { for (let k = 0; k < 3; k++) ln([[x, y], [x + (k - 1) * 30 * sc, y - 110 * sc]], 10 * sc, '#6a9a3a');
  for (const [dx, dy, r, c] of [[-50, -130, 52, '#3f8a3a'], [48, -136, 50, '#4f9e3f'], [0, -170, 58, '#5fb04a'], [-20, -110, 40, '#3f8a3a'], [30, -100, 38, '#4f9e3f']]) { P(); const cx = x + dx * sc, cy = y + dy * sc, R = r * sc; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2, rad = R * (i % 2 ? .82 : 1); i ? g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad) : g.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.closePath(); fsx(c, 6 * sc); ln([[cx, cy + R * .7], [cx, cy - R * .5]], 3 * sc, '#2f6a2a'); }
  P(); g.moveTo(x - 46 * sc, y - 40 * sc); g.lineTo(x + 46 * sc, y - 40 * sc); g.lineTo(x + 30 * sc, y + 40 * sc); g.lineTo(x - 30 * sc, y + 40 * sc); g.closePath(); fsx('#e9d8b0', 6 * sc); }
function phone(x, y, sc, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); const w = 90 * sc, h = 160 * sc; rr(-w / 2, -h / 2, w, h, 14 * sc, '#1a1a22', 6 * sc); rr(-w / 2 + 7 * sc, -h / 2 + 12 * sc, w - 14 * sc, h - 24 * sc, 6 * sc, '#ffffff', 0);
  const bx = -w / 2 + 12 * sc, by = -h / 2 + 50 * sc; ln([[bx, by], [bx + 18 * sc, by - 14 * sc], [bx + 34 * sc, by + 6 * sc], [bx + 46 * sc, by + 50 * sc], [bx + 64 * sc, by + 82 * sc]], 6 * sc, '#e0303a');
  T.fitText(g, '-99%', {x: -w / 2 + 8 * sc, y: -h / 2 + 14 * sc, w: w - 16 * sc, h: 30 * sc}, {maxSize: 28 * sc, minSize: 6, pad: 2, color: '#e0303a'}); g.restore(); }
function watch(x, y, sc, ang) { g.save(); g.translate(x, y); g.rotate(ang); rr(-12 * sc, -18 * sc, 24 * sc, 36 * sc, 6 * sc, '#f2c820', 4 * sc); ell(0, 0, 9 * sc, 9 * sc, '#fff6d0', 3 * sc); g.restore(); }
function pearls(x, y, sc) { for (let k = 0; k <= 8; k++) { const u = k / 8, px = -52 + u * 104, py = -878 + Math.sin(u * Math.PI) * 40; ell(x + px * sc, y + py * sc, 9 * sc, 9 * sc, '#fbf6ea', 3 * sc); } }
function shawl(x, y, sc) { body(x, y, sc, () => { P(); g.moveTo(-104, -880); g.quadraticCurveTo(0, -840, 104, -880); g.lineTo(128, -700); g.quadraticCurveTo(0, -640, -128, -700); g.closePath(); fsx('#d4a82a');
  g.save(); g.clip(); for (let k = 0; k < 9; k++) ell(-110 + k * 28, -760 + (k % 2) * 30, 8, 8, '#a8721a', 0); g.restore(); for (let k = 0; k < 11; k++) { const u = k / 10, px = -126 + u * 252, py = -700 + Math.sin(u * Math.PI) * 58; ln([[px, py], [px, py + 26]], 5, '#a8721a'); } }); }
// ---------- seating (front view): chair behind -> seated body (no legs) -> bent legs at the seat edge ----------
// Floor at y. The seat top is 420 units above the floor; the body is lowered so its hips (-560) sit on the seat.
const SEAT_H = 420, HIP = 560;
function chair(x, y, sc, w, col, kind = 'arm') { body(x, y, sc, () => { const cs = shade(col, .82);
  rr(-w / 2, -SEAT_H - 420, w, 470, kind === 'sofa' ? 70 : 90, col); g.save(); P(); g.roundRect(-w / 2, -SEAT_H - 420, w, 470, kind === 'sofa' ? 70 : 90); g.clip(); g.fillStyle = cs; g.fillRect(w / 2 - 70, -SEAT_H - 440, 80, 520); g.restore(); rr(-w / 2, -SEAT_H - 420, w, 470, kind === 'sofa' ? 70 : 90, null);   // back
  rr(-w / 2 + 10, -SEAT_H - 20, w - 20, 90, 30, shade(col, 1.08));   // seat cushion
  rr(-w / 2 - 46, -SEAT_H - 150, 92, 260, 40, col); rr(w / 2 - 46, -SEAT_H - 150, 92, 260, 40, cs);   // armrests
  rr(-w / 2 + 6, -SEAT_H + 60, w - 12, 50, 14, cs);   // base
  for (const s of [-1, 1]) rr(s * (w / 2 - 30) - 14, -SEAT_H + 104, 28, SEAT_H - 104, 8, '#3a2a30', 5); }); }   // feet
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
// legs of a seated person, front view: short foreshortened thighs from the hip to the knee at the seat edge, shins down to the floor
function seatedLegs(x, y, sc, c, o = {}) { body(x, y, sc, () => { const hem = o.hem; // floor-coord y of the skirt hem (null = trousers)
  for (const s of [-1, 1]) { const kx = s * (o.spread || 58), legCol = c.legs || c.bottom, top = hem != null ? hem - 10 : -SEAT_H - 30;
    if (hem == null) { ln([[s * 44, -SEAT_H - 30], [kx, -SEAT_H + 6]], 52 + 14, INK); ln([[s * 44, -SEAT_H - 30], [kx, -SEAT_H + 6]], 52, legCol); }   // thigh coming toward us
    const y0 = hem == null ? -SEAT_H + 6 : top; if (y0 < -70) { ln([[kx, y0], [kx + s * 4, -60]], 44 + 14, INK); ln([[kx, y0], [kx + s * 4, -60]], 44, legCol); }
    if (hem == null) ell(kx, -SEAT_H + 6, 30, 22, legCol, 0);   // knee cap blends thigh into shin
    const fx = kx + s * 4; P(); g.moveTo(fx - 46, -16); g.bezierCurveTo(fx - 46, -80, fx + 52, -90, fx + 56, -24); g.lineTo(fx + 56, 0); g.lineTo(fx - 46, 0); g.closePath(); fsx(c.shoe || '#ffffff'); ln([[fx - 46, -10], [fx + 56, -10]], 6, c.sole || INK); } }); }
// seat a character: chair (optional) is drawn by the caller first; this draws the body and the legs
function seat(def, x, y, sc, o = {}) { const c = T.palOf(def), k = T.kindOf(def.outfit), by = y + (HIP - SEAT_H) * sc;   // body origin so hips land on the seat
  ch(def, x, by, sc, {seated: true, ...o});
  const skirted = k === 'gown' ? -10 : (def.skirt && c.skirt) ? -380 + (HIP - SEAT_H) : null;   // hem in floor coords (body -380 shifted)
  seatedLegs(x, y, sc, c, {hem: skirted, spread: o.spread}); }
const LAP = s => [[s * 86, -860], [s * 130, -720], [s * 64, -585]];   // hands resting on the lap
// ---------- people seen from behind (spectators); Petrovich uses the same body at the same scale ----------
function backPerson(x, y, sc, o = {}) { body(x, y, sc, () => { const top = o.top || '#6a4a8a', skin = o.skin || '#e8b896';
  P(); g.moveTo(-170, -300); g.quadraticCurveTo(-180, -420, -110, -440); g.lineTo(110, -440); g.quadraticCurveTo(180, -420, 170, -300); g.lineTo(170, 0); g.lineTo(-170, 0); g.closePath(); fsx(top);
  g.save(); g.clip(); g.fillStyle = shade(top, .82); g.fillRect(90, -460, 100, 470); g.restore(); P(); g.moveTo(-170, -300); g.quadraticCurveTo(-180, -420, -110, -440); g.lineTo(110, -440); g.quadraticCurveTo(180, -420, 170, -300); g.lineTo(170, 0); g.lineTo(-170, 0); g.closePath(); fsx(null);
  if (o.stripes) for (const s of [-1, 1]) { ln([[s * 140, -400], [s * 160, -40]], 10, '#f4f1ea'); ln([[s * 118, -404], [s * 138, -40]], 10, '#f4f1ea'); }
  for (const s of [-1, 1]) ell(s * 96, -500, 20, 30, skin, 6);
  ell(0, -520, 96, 104, o.bald ? skin : (o.hair || '#3a2a20')); g.save(); P(); g.ellipse(0, -520, 96, 104, 0, 0, 7); g.clip(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(40, -640, 80, 240);
  if (o.bald) { P(); g.moveTo(-100, -500); g.quadraticCurveTo(0, -470, 100, -500); g.lineTo(100, -400); g.lineTo(-100, -400); g.closePath(); g.fillStyle = '#b8b0a8'; g.fill(); }
  if (o.bun) { } g.restore(); ell(0, -520, 96, 104, null, 7);
  if (o.bald) for (let k = -3; k <= 3; k++) ln([[k * 22, -478], [k * 23, -440]], 3, '#8a8278');
  if (o.bun) ell(0, -626, 44, 38, o.hair || '#3a2a20');
  if (o.long) { P(); g.moveTo(-96, -520); g.lineTo(-100, -380); g.quadraticCurveTo(0, -360, 100, -380); g.lineTo(96, -520); g.closePath(); fsx(o.hair); } }); }
function petrovich(x, y, sc, paperUp = true) { if (paperUp) body(x, y, sc, () => { rr(-230, -770, 460, 270, 8, '#efe9d8'); ln([[0, -770], [0, -500]], 5); T.fitText(g, 'BRIGHTON POST', {x: -220, y: -758, w: 210, h: 50}, {maxSize: 34, pad: 4}); for (let k = 0; k < 5; k++) { ln([[-200, -680 + k * 30], [-24, -680 + k * 30]], 4, '#9a9488'); ln([[24, -680 + k * 30], [200, -680 + k * 30]], 4, '#9a9488'); } rr(30, -756, 160, 60, 4, '#c9d6e6', 4); });
  backPerson(x, y, sc, {top: '#2c3f8f', stripes: true, bald: true}); }
// ---------- layout ----------
g.fillStyle = '#fbf3f6'; g.fillRect(0, 0, W, H);
g.fillStyle = '#f3dfe8'; g.fillRect(0, 0, W, 96); g.font = '50px NBL, NBC'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('«ДАВАЙ ЗАМУЖ!» — эскиз персонажей (наш стиль, toon v4)', W / 2, 50);
const ROW1 = 800, S1 = .36, COL = i => 150 + i * 300;
// 1. Zhanna on the sofa (seated), troll smirk
{ const x = COL(0), y = ROW1, sc = S1; chair(x, y, sc, 470, '#c8325a', 'sofa'); seat(ZH, x, y, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'neutral'}); pill('Жанна — сваха', x, ROW1 + 40); }
// 2. Эльвира, neutral, hands folded
{ const x = COL(1), y = ROW1, sc = S1; ch(EL, x, y, sc, {pose: 'hold', hands: {1: 'open', '-1': 'open'}, mood: 'proud'}); pearls(x, y, sc); pill('Ведущая Эльвира', x, ROW1 + 40); }
// 3. Звездана with the crystal ball
{ const x = COL(2), y = ROW1, sc = S1, fn = s => [[s * 86, -860], [s * 150, -740], [s * 66, -660]];
  ch(ZV, x, y, sc, {arms: fn, front: true, hands: {1: 'none', '-1': 'none'}, mood: 'dreamy'}); shawl(x, y, sc); crystalBall(x, y - 720 * sc, sc);
  for (const s of [-1, 1]) { const p = armPts(fn, s), h = wpt(x, y, sc, p[2]), a = fa(p); T.drawHand(g, 'open', h[0], h[1], a, sc, ZV.pal.skin, ZV.nails, s, 22); rings(h[0], h[1], a, sc, s); } pill('Астролог Звездана', x, ROW1 + 40); }
// 4. Бриттани
{ const x = COL(3), y = ROW1, sc = S1; ch(BR, x, y, sc, {pose: 'hips', hands: {1: 'fist', '-1': 'fist'}, mood: 'proud'}); pill('Невеста Бриттани', x, ROW1 + 40); }
// 5. Майк with laptop
{ const x = COL(4), y = ROW1, sc = S1, fn = s => [[s * 86, -860], [s * 160, -720], [s * 112, -640]];
  ch(MK, x, y, sc, {arms: fn, front: true, hands: {1: 'none', '-1': 'none'}, mood: 'smug'}); laptop(x, y - 650 * sc, sc);
  for (const s of [-1, 1]) { const p = armPts(fn, s), h = wpt(x, y, sc, p[2]); T.drawHand(g, 'fist', h[0], h[1], fa(p), sc, MK.pal.skin, null, s, 22); } pill('Майк — фрилансер', x, ROW1 + 40); }
// 6. Джош with kale
{ const x = COL(5), y = ROW1, sc = S1, fn = s => s > 0 ? [[86, -860], [250, -760], [300, -800]] : [[-86, -860], [-102, -720], [-110, -580]];
  ch(JS, x, y, sc, {arms: fn, front: false, hands: {1: 'none', '-1': 'open'}, mood: 'kind'}); const p = armPts(fn, 1), h = wpt(x, y, sc, p[2]); kale(h[0], h[1] - 10 * sc, sc); T.drawHand(g, 'fist', h[0], h[1], fa(p), sc, JS.pal.skin, null, 1, 22); pill('Джош — веган', x, ROW1 + 40); }
// 7. Райан with phone
{ const x = COL(6), y = ROW1, sc = S1, fn = s => s > 0 ? [[86, -860], [250, -780], [280, -880]] : [[-86, -860], [-160, -740], [-86, -640]];
  ch(RY, x, y, sc, {arms: fn, front: false, hands: {1: 'none', '-1': 'fist'}, mood: 'smug'}); const p = armPts(fn, 1), h = wpt(x, y, sc, p[2]); phone(h[0] + 6 * sc, h[1] - 60 * sc, sc, .1); T.drawHand(g, 'fist', h[0], h[1], fa(p), sc, RY.pal.skin, null, 1, 22);
  const pw = armPts(fn, 1), wr = wpt(x, y, sc, [pw[1][0] + (pw[2][0] - pw[1][0]) * .78, pw[1][1] + (pw[2][1] - pw[1][1]) * .78]); watch(wr[0], wr[1], sc, fa(pw) + Math.PI / 2); pill('Райан — крипто', x, ROW1 + 40); }
// 8. Петрович from behind
{ const x = COL(7), y = ROW1 - 40, sc = .5; petrovich(x, y, sc); pill('Петрович — со спины', x, ROW1 + 40); }

// ---------- row 2: key expressions (close-ups) ----------
const R2 = 900, BW = 286, BH = 330, BX = i => 22 + i * 297;
function box(i, title, fn) { const x0 = BX(i), y0 = R2; rr(x0, y0, BW, BH, 24, '#ffffff', 4); g.save(); P(); g.roundRect(x0 + 2, y0 + 2, BW - 4, BH - 4, 22); g.clip(); fn(x0 + BW / 2, y0 + BH / 2); g.restore(); pill(title, x0 + BW / 2, y0 + BH + 30, BW); }
const SC2 = .5, hc = (cx, cy, sc = SC2) => [cx, cy + 1062 * sc];   // head centre -> feet position
box(0, 'Жанна: троллит', (cx, cy) => { const [x, y] = hc(cx, cy + 30); ch(ZH, x, y, SC2, {pose: 'down', hands: {1: 'none', '-1': 'none'}, mood: 'smugside'}); });
box(1, 'Эльвира: в шоке', (cx, cy) => { const [x, y] = hc(cx, cy + 60, .42); ch(EL, x, y, .42, {pose: 'down', hands: {1: 'none', '-1': 'none'}, mood: 'shocked', mouth: .7}); pearls(x, y, .42); });
box(2, 'Звездана: «Звёзды говорят…»', (cx, cy) => { const sc = .42, [x, y] = hc(cx - 20, cy + 50, .42), fn = s => s > 0 ? [[86, -860], [230, -820], [240, -960]] : [[-86, -860], [-102, -720], [-110, -580]];
  ch(ZV, x, y, sc, {arms: fn, front: false, hands: {1: 'none', '-1': 'none'}, mood: 'dreamy'}); shawl(x, y, sc); const p = armPts(fn, 1), h = wpt(x, y, sc, p[2]); tarot(h[0] + 6 * sc, h[1] - 150 * sc, sc * 1.1, 'THE LOVERS', .08); T.drawHand(g, 'fist', h[0], h[1], fa(p), sc, ZV.pal.skin, ZV.nails, 1, 22); });
box(3, 'Бриттани: ногти', (cx, cy) => { const [x, y] = hc(cx - 30, cy + 30, .46); const fn = s => s > 0 ? [[86, -860], [220, -880], [215, -1020]] : [[-86, -860], [-102, -720], [-110, -580]];
  ch(BR, x, y, .46, {arms: fn, front: false, hands: {1: 'open', '-1': 'none'}, mood: 'flirty'}); });
box(4, 'Майк: «It depends»', (cx, cy) => { const [x, y] = hc(cx, cy + 40); ch(MK, x, y, SC2, {pose: 'shrug', hands: {1: 'open', '-1': 'open'}, mood: 'worried'}); });
box(5, 'Джош: «I brought you kale!»', (cx, cy) => { const [x, y] = hc(cx - 50, cy + 60, .42); const SC2 = .42, fn = s => s > 0 ? [[86, -860], [250, -760], [300, -800]] : [[-86, -860], [-102, -720], [-110, -580]];
  ch(JS, x, y, SC2, {arms: fn, front: false, hands: {1: 'none', '-1': 'none'}, mood: 'grin'}); const p = armPts(fn, 1), h = wpt(x, y, SC2, p[2]); kale(h[0], h[1] - 10 * SC2, SC2); T.drawHand(g, 'fist', h[0], h[1], fa(p), SC2, JS.pal.skin, null, 1, 22); });
box(6, 'Райан: график падает', (cx, cy) => { const [x, y] = hc(cx - 40, cy + 40, .44); const SC2 = .44, fn = s => s > 0 ? [[86, -860], [250, -780], [280, -880]] : [[-86, -860], [-102, -720], [-110, -580]];
  ch(RY, x, y, SC2, {arms: fn, front: false, hands: {1: 'none', '-1': 'none'}, mood: 'shocked', mouth: .6, sweat: true}); const p = armPts(fn, 1), h = wpt(x, y, SC2, p[2]); phone(h[0] + 4 * SC2, h[1] - 60 * SC2, SC2, .12); T.drawHand(g, 'fist', h[0], h[1], fa(p), SC2, RY.pal.skin, null, 1, 22); });
box(7, 'Петрович: «Угу.»', (cx, cy) => { petrovich(cx, cy + 170, .5); });

// ---------- row 3: the studio set (its own panel) ----------
// scene(x0, y0, w, h, L): back wall, sign, door, stage; hero group left, hosts' sofa right (they face each other); audience row in front
function scene(x0, y0, w, h, L) { g.save(); P(); g.roundRect(x0, y0, w, h, 26); g.clip(); const fy = y0 + L.floor;
  g.fillStyle = '#5a2a6a'; g.fillRect(x0, y0, w, h); g.fillStyle = '#7a3a8a'; g.fillRect(x0, y0 + L.wallTop, w, L.floor - L.wallTop); for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(x0 + k * w / 12, y0 + L.wallTop, w / 12, L.floor - L.wallTop); }
  for (let k = 0; k < 5; k++) { g.save(); g.globalAlpha = .1; P(); const bx = x0 + w * (.1 + k * .2); g.moveTo(bx, y0); g.lineTo(bx - w * .08, fy); g.lineTo(bx + w * .08, fy); g.closePath(); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  g.fillStyle = '#e88ab0'; g.fillRect(x0, fy, w, h - L.floor); g.fillStyle = '#d9739e'; g.fillRect(x0, fy, w, 14 * L.k);
  // sign with bulbs + door with a heart, centre back
  const sw = L.signW, sx = x0 + w / 2 - sw / 2, sy = y0 + L.signY, sh = sw * .2; rr(sx, sy, sw, sh, sh / 2.4, '#ff4f8f', 6); for (let k = 0; k < 16; k++) ell(sx + sw * .06 + k * sw * .88 / 15, sy + 7 * L.k, 5 * L.k, 5 * L.k, '#fff3a0', 2); T.fitText(g, 'ДАВАЙ ЗАМУЖ!', {x: sx + sw * .05, y: sy + sh * .16, w: sw * .9, h: sh * .78}, {maxSize: 200, pad: 4, color: '#ffffff'});
  const dw = L.doorW, dh = dw * 1.6, dx = x0 + w / 2 - dw / 2, dy = fy - dh; rr(dx - 12 * L.k, dy - 12 * L.k, dw + 24 * L.k, dh + 12 * L.k, 16 * L.k, '#f2d06a'); rr(dx, dy, dw, dh, 10 * L.k, '#3a1a4a', 4); const hx = dx + dw / 2, hy = dy - 34 * L.k, hk = L.k * 1.3; P(); g.moveTo(hx, hy + 22 * hk); g.bezierCurveTo(hx - 40 * hk, hy - 6 * hk, hx - 20 * hk, hy - 34 * hk, hx, hy - 14 * hk); g.bezierCurveTo(hx + 20 * hk, hy - 34 * hk, hx + 40 * hk, hy - 6 * hk, hx, hy + 22 * hk); fsx('#ff4f8f', 4);
  // hero group (left): bride armchair + grooms' sofa right next to her; everyone looks towards the hosts (look +)
  const sc = L.sc, by = fy + L.seatDrop;
  const bX = x0 + L.bride, gX = x0 + L.grooms, hX = x0 + L.hosts;
  chair(bX, by, sc, 400, '#f2a0c0'); seat(BR, bX, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'proud', look: .8});
  const gp = 420; chair(gX, by, sc, 1320, '#3a6aa8', 'sofa');
  seat(MK, gX - gp * sc, by, sc, {arms: LAP, hands: {1: 'fist', '-1': 'fist'}, front: true, mood: 'smug', look: .8});
  seat(JS, gX, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'kind', look: .8});
  seat(RY, gX + gp * sc, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'smug', look: .8});
  // hosts' sofa (right), facing the heroes (look −)
  const hp = 450; chair(hX, by, sc, 1400, '#c8325a', 'sofa');
  seat(EL, hX - hp * sc, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'proud', look: -.8}); pearls(hX - hp * sc, by + (HIP - SEAT_H) * sc, sc);
  seat(ZH, hX, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'smugside', look: -.8});
  seat(ZV, hX + hp * sc, by, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: 'dreamy', look: -.8}); shawl(hX + hp * sc, by + (HIP - SEAT_H) * sc, sc);
  // audience row in the foreground, from behind; Petrovich is one of them, same scale
  const as = L.aud, ay = y0 + h + 30 * L.k, cols = [['#6a4a8a', '#3a2a20'], ['#3a6a8a', '#7a5030', 'long'], ['#8a4a5a', '#2a1f1a'], ['#4a7a5a', '#c9a060', 'bun'], ['#6a5a8a', '#5a3a2a'], ['#8a6a3a', '#2a2a2a', 'long'], ['#3a5a7a', '#8a6a4a']];
  const n = L.audN, step = w / (n - .2);
  for (let k = 0; k < n; k++) { const ax = x0 + step * (k + .4); if (k === L.petro) { petrovich(ax, ay, as); continue; } const cc = cols[k % cols.length]; backPerson(ax, ay, as, {top: cc[0], hair: cc[1], long: cc[2] === 'long', bun: cc[2] === 'bun'}); }
  g.restore(); rr(x0, y0, w, h, 26, null, 5); }
const SY = 1380;
pill('Студия «Давай замуж!»: невеста и женихи рядом, ведущие напротив, зрители и Петрович в зале', 1200, SY - 30, 1500);
scene(40, SY, 2320, 1000, {floor: 560, wallTop: 40, signY: 30, signW: 520, doorW: 150, k: 1.2, sc: .32, seatDrop: 190, bride: 190, grooms: 640, hosts: 1830, aud: .4, audN: 11, petro: 5});
// palette strip
{ const cols = [['#f3d27a', 'Жанна'], ['#18a07a', 'Жанна'], ['#7a1838', 'Эльвира'], ['#5b3a9a', 'Звездана'], ['#d4a82a', 'Звездана'], ['#f27ab0', 'Бриттани'], ['#8a93a0', 'Майк'], ['#efe3c8', 'Джош'], ['#26315e', 'Райан'], ['#2c3f8f', 'Петрович'], ['#c8325a', 'диван ведущих'], ['#3a6aa8', 'диван женихов']];
  const py = SY + 1040; cols.forEach(([c, nm], i) => { const x = 60 + (i % 6) * 390, y = py + Math.floor(i / 6) * 90; rr(x, y, 64, 64, 12, c, 5); g.font = '26px NBL, NBC'; g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(nm, x + 80, y + 32); });
  g.font = '24px NBL, NBC'; g.fillStyle = '#6a5a70'; g.textAlign = 'center'; g.fillText('Своё шоу и свои персонажи: реальных ведущих не рисуем. Лицо Петровича никогда не показываем.', W / 2, py + 210); }
fs.writeFileSync(`${__dirname}/sketch.png`, cv.toBuffer('image/png'));
// ---------- vertical 1080x1920 wide shot, as in the video ----------
{ const vc = createCanvas(1080, 1920), g0 = g; g = vc.getContext('2d');
  scene(0, 0, 1080, 1920, {floor: 930, wallTop: 0, signY: 230, signW: 820, doorW: 190, k: 1.5, sc: .25, seatDrop: 290, bride: 90, grooms: 345, hosts: 860, aud: .5, audN: 5, petro: 3});
  fs.writeFileSync(`${__dirname}/studio_vertical.png`, vc.toBuffer('image/png')); g = g0; }
console.log('ok');
