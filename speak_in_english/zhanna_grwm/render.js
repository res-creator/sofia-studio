// «Тётя Жанна с Брайтона» — «Жанна — бьюти-блогер: GRWM» — flat 2D, engine from ep7.
// node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | info | frame   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const bgCv = createCanvas(W, H), GB = bgCv.getContext('2d'), clCv = createCanvas(W, H), GC = clCv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7, stroke = INK) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * r2, y + Math.sin(a) * r2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1, col = '#fff6c0') { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], col, 3); g.restore(); }
const at = (id, u) => BY[id].at + (BY[id].end - BY[id].at) * u;

// ---------- characters ----------
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 540, s: .86};
const WET = {...ZH.pal, hair: '#ecc867', hairS: '#d2ad4f'};
const KY = {hair: 'ponytail', lashes: true, earrings: '#f4f4ff', skirt: true, pal: {skin: '#f6d4bc', skinS: '#e6b89c', hair: '#6a3e2a', brow: '#4a2a1a', lip: '#e0607a', top: '#c9b6f2', topS: '#ad98dc', collar: '#c9b6f2', bottom: '#8a7ab8', skirt: '#8a7ab8', legs: '#f6d4bc', shoe: '#ffffff', sole: '#ffffff'}};
const SEAT = 1900, TABLE = 1400;

// ---------- Zhanna's face state (layers build up) ----------
const MAYO = at('z3', .6), CREAM = at('z9', .14), BAGS = at('z6', .25), CUKES = at('z6', .78), WETT = TL.POUR + .5;
const CUK1 = TL.GRAB1 + .5, CUK2 = TL.GRAB2 + .5;   // right (screen) cucumber taken at CUK1, left at CUK2
let COVER = false;
function faceState(t) { if (COVER) return {mayo: 0, cream: 1, bags: 1, cR: 1, cL: 1, wet: 1};
  return {mayo: ease((t - MAYO) / .5), cream: ease((t - CREAM) / .25), bags: t >= BAGS ? 1 : 0, cR: t >= CUKES && t < CUK1 ? 1 : 0, cL: t >= CUKES + .25 && t < CUK2 ? 1 : 0, wet: ease((t - WETT) / .8)}; }
function skinFx(fsx) { return (gg, HY) => { const pg = g; g = gg;
  if (fsx.mayo > 0 && fsx.cream < 1) { g.save(); g.globalAlpha = fsx.mayo; for (const P of [[[-70, -118], [0, -128], [70, -112]], [[60, 20], [100, 40], [118, 80]], [[-60, 20], [-100, 40], [-118, 80]], [[-24, 136], [24, 136]]]) { const Q = P.map(([px, py]) => [px, HY + py]); ln(Q, 44, '#e0cc88'); ln(Q, 36, '#fff1bf'); ell(Q[0][0] + 6, Q[0][1] - 6, 6, 4, '#ffffff', 0); } g.restore(); }
  if (fsx.cream > 0) { g.save(); g.globalAlpha = fsx.cream; g.beginPath(); g.moveTo(-170, HY + 40); for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 - i / 12); g.lineTo(Math.cos(a) * 170, HY - 10 - Math.sin(a) * 175 + (i % 2) * 12); }
    g.lineTo(170, HY + 200); g.lineTo(-170, HY + 200); g.closePath(); g.fillStyle = '#fbfaf2'; g.fill();
    for (const [x, y] of [[-70, -100], [80, 60], [-90, 80], [30, 140]]) { g.beginPath(); g.arc(x, HY + y, 22, .3, 3.6); g.strokeStyle = '#e4e0d0'; g.lineWidth = 5; g.stroke(); } g.restore(); }
  g = pg; }; }
function faceFx(fsx, t) { return (gg, HY) => { const pg = g; g = gg;
  if (fsx.bags) for (const s of [-1, 1]) { g.save(); g.translate(s * 54, HY + 58); g.rotate(s * .08); rr(-34, -22, 68, 44, 8, '#c99a5c', 5); ln([[-20, -6], [20, -6]], 3, '#a87a40'); g.restore(); ln([[s * 80, HY + 50], [s * 112, HY + 120]], 3, '#f3f0e8'); g.save(); g.translate(s * 112, HY + 132); rr(-14, -12, 28, 24, 4, '#f3e6c4', 4); g.restore(); }
  for (const [s, on] of [[1, fsx.cR], [-1, fsx.cL]]) if (on) { const x = s * 50, y = HY - 30; ell(x, y, 60, 60, '#3d8b3d', 6); ell(x, y, 50, 50, '#d7ecaa', 0); ell(x, y, 22, 22, '#c4df8c', 0); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + .3; ell(x + Math.cos(a) * 18, y + Math.sin(a) * 18, 4, 7, '#f4f8de', 0); } }
  g = pg; }; }
function hairFx(fsx, t) { return (gg, HY) => { if (fsx.wet <= 0) return; const pg = g; g = gg; g.save(); g.globalAlpha = fsx.wet;
  for (const x0 of [-120, -60, 0, 60, 120]) { g.beginPath(); g.moveTo(x0, HY - 225 + Math.abs(x0) * .25); g.quadraticCurveTo(x0 + 18, HY - 160, x0 + 4, HY - 95 - Math.abs(x0) * .2); g.strokeStyle = '#b8953e'; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); }   // wet clumps
  for (const [cx, cy, r] of [[-70, -170, 70], [80, -160, 60]]) { g.beginPath(); g.arc(cx, HY + cy, r, 3.75, 4.7); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 9; g.stroke(); }   // shine
  for (const [x, y] of [[-112, -88], [22, -96], [128, -80]]) { const u = (t * 1.1 + hash(x)) % 1; g.beginPath(); g.moveTo(x, HY + y + u * 30); g.quadraticCurveTo(x + 9, HY + y + 16 + u * 30, x, HY + y + 22 + u * 30); g.quadraticCurveTo(x - 9, HY + y + 16 + u * 30, x, HY + y + u * 30); g.fillStyle = '#9fd8ff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); }
  for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1, u = (t * .8 + hash(i)) % 1, x = sd * (205 + (i > 1 ? 14 : 0)), y0 = HY + 30 + (i > 1 ? 60 : 0) + u * 140;
    g.save(); g.globalAlpha *= 1 - u * .6; g.beginPath(); g.moveTo(x, y0 - 22); g.quadraticCurveTo(x + 13, y0, x, y0 + 8); g.quadraticCurveTo(x - 13, y0, x, y0 - 22); g.fillStyle = '#9fd8ff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.restore(); }
  g.restore(); g = pg; }; }

// ---------- room (blurred background) ----------
function room(t) {
  g.fillStyle = '#f3d6dc'; g.fillRect(-1200, -1200, 3480, 3000); g.fillStyle = '#ecc6d0';
  for (let x = -1200; x < 2300; x += 90) for (let y = -1200; y < 1500; y += 90) { g.save(); g.translate(x + ((y / 90) % 2) * 45, y); g.rotate(.785); g.fillRect(-12, -12, 24, 24); g.restore(); }
  // the wall carpet behind Zhanna
  rr(240, 180, 600, 700, 14, '#a8283a', 9); rr(270, 210, 540, 640, 8, '#c8343e', 5); g.save(); g.translate(540, 530);
  for (const [r, c] of [[230, '#e8a23a'], [180, '#2a4a8a'], [130, '#c8343e'], [80, '#e8a23a'], [36, '#2a4a8a']]) { g.save(); g.rotate(.785); rr(-r / 1.414, -r / 1.414, r * 1.414, r * 1.414, 6, c, 5); g.restore(); }
  g.restore(); for (let k = 0; k < 6; k++) { rr(282 + k * 90, 230, 30, 30, 6, '#e8a23a', 3); rr(282 + k * 90, 800, 30, 30, 6, '#e8a23a', 3); }
  // door to the corridor (right), ajar
  rr(880, 240, 300, 1300, 8, '#b98a62', 9); rr(900, 260, 90, 1270, 4, '#2a2230', 0); rr(990, 260, 180, 1270, 4, '#c99a70', 6); rr(1020, 320, 120, 420, 10, null, 5); rr(1020, 800, 120, 500, 10, null, 5); ell(1010, 900, 12, 12, '#e8c27a', 4);
  // ring light (left)
  const gl = .8 + .1 * Math.sin(t * 3); g.save(); g.shadowColor = `rgba(255,250,235,${gl})`; g.shadowBlur = 60; g.beginPath(); g.arc(90, 760, 190, 0, 7); g.strokeStyle = '#fffdf4'; g.lineWidth = 46; g.stroke(); g.restore();
  g.beginPath(); g.arc(90, 760, 214, 0, 7); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.beginPath(); g.arc(90, 760, 166, 0, 7); g.stroke(); ln([[90, 974], [90, 1500]], 16, '#6a6a74');
  // little shelf with a crystal vase
  rr(-260, 900, 260, 24, 6, '#8a5a3c', 6); poly([[-170, 900], [-150, 800], [-110, 800], [-90, 900]], 'rgba(220,240,255,.9)', 5);
}
// ---------- vanity (sharp foreground) ----------
const HELD = new Set();   // props currently in Zhanna's hands (hidden on the table)
function vanity(t) { rr(-200, TABLE, 1480, 40, 14, '#fbeef0', 8); rr(-180, TABLE + 36, 1440, 700, 0, '#f0d8de', 8); for (const x of [120, 540, 960]) { rr(x - 150, TABLE + 90, 300, 160, 16, null, 5); ell(x, TABLE + 170, 14, 14, '#e8c27a', 4); }
  if (!HELD.has('mayo')) jar(200, TABLE, .9); if (!HELD.has('cream')) creamTub(330, TABLE, .8); plateCuc(440, TABLE);
  if (!HELD.has('beer')) bottle(640, TABLE, .9, 0); teaBox(735, TABLE);
  phoneProp(t); }
function jar(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); rr(-55, -140, 110, 140, 16, 'rgba(235,245,255,.95)', 6); rr(-48, -128, 96, 120, 12, '#fff4cc', 0); rr(-60, -166, 120, 34, 10, '#3a7ad8', 6); rr(-50, -96, 100, 50, 6, '#ffffff', 4); txt('MAYO', 0, -71, 30, '#d8323c'); g.restore(); }
function creamTub(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); poly([[-60, -100], [60, -100], [50, 0], [-50, 0]], '#ffffff', 6); rr(-66, -116, 132, 22, 8, '#4ab0d8', 6); txt('SOUR', 0, -66, 24, '#2a6a9a'); txt('CREAM 20%', 0, -34, 20, '#2a6a9a'); g.restore(); }
function plateCuc(x, y) { ell(x, y - 8, 70, 16, '#ffffff', 5); for (const dx of [-30, 0, 30]) ell(x + dx, y - 16, 22, 9, '#d7ecaa', 4, '#3d8b3d'); }
function bottle(x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(-26, 0); g.lineTo(-26, -110); g.quadraticCurveTo(-26, -140, -10, -150); g.lineTo(-10, -190); g.lineTo(10, -190); g.lineTo(10, -150); g.quadraticCurveTo(26, -140, 26, -110); g.lineTo(26, 0); g.closePath(); g.fillStyle = '#8a4a1a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  rr(-24, -96, 48, 46, 4, '#f2d27a', 4); txt('BEER', 0, -73, 16, '#8a3a1a'); g.restore(); }
function teaBox(x, y) { rr(x - 50, y - 70, 100, 70, 6, '#2f8a5a', 6); txt('TEA', x, y - 35, 26, '#ffffff'); }
function phoneProp(t) { const x = 870, y = TABLE, call = t >= TL.RING && t < TL.HANG, sh = call && t < BY.k6.at ? 4 * Math.sin(t * 60) : 0;
  ln([[x - 40, y], [x, y - 60], [x + 40, y]], 6); ln([[x, y - 60], [x, y - 80]], 6); g.save(); g.translate(x + sh, y - 190); rr(-62, -110, 124, 220, 18, '#1d1b22', 6); rr(-52, -98, 104, 196, 10, call ? '#9ae6b0' : '#ffd8e8', 0); ell(0, -30, 26, 26, call ? '#ffffff' : '#c9b6f2', 0); g.restore(); }

// ---------- gestures ----------
let NOW = 0;
const rub = (a = 1) => [Math.sin(NOW * 9) * 14 * a, Math.cos(NOW * 9) * 10 * a];
const REST = s => [[s * 78, -860], [s * 150, -720], [s * 100, -625]];
const ZG = {
  rest: REST,
  present: s => s > 0 ? [[78, -860], [215, -800], [235, -950]] : REST(s),
  wave: s => s > 0 ? [[78, -860], [210, -960], [240, -1110]] : REST(s),
  point: s => s > 0 ? [[78, -860], [200, -820], [285, -850]] : REST(s),
  shrug: s => [[s * 78, -860], [s * 170, -780], [s * 225, -870]],
  cheek: s => s > 0 ? [[78, -860], [235, -900], [105 + rub()[0], -1012 + rub()[1]]] : [[-78, -860], [-175, -760], [-110, -790]],
  fork: s => s > 0 ? [[78, -860], [250, -880], [205 + 22 * Math.sin(NOW * 4), -945 - 9 * Math.sin(NOW * 4)]] : REST(s),
  forkup: s => s > 0 ? [[78, -860], [215, -900], [240, -1040]] : REST(s),
  bags: s => [[s * 78, -860], [s * 215, -900], [s * 78, -1035]],
  eyes: s => [[s * 78, -860], [s * 220, -930], [s * 64, -1095]],
  pelmeni: s => s < 0 ? [[-78, -860], [-235, -900], [-100, -1012]] : [[78, -860], [160, -760], [60, -760]],
  hush: s => s > 0 ? [[78, -860], [180, -860], [40, -955]] : REST(s),
  pour: s => s > 0 ? [[78, -860], [265, -1160], [185, -1610]] : [[-78, -860], [-160, -760], [-200, -860]],
  spoon: s => s > 0 ? [[78, -860], [255, -885], [215 + rub(.8)[0], -940 + rub(.8)[1]]] : [[-78, -860], [-175, -760], [-110, -790]],
  brooch: s => s > 0 ? [[78, -860], [160, -740], [20, -790]] : REST(s),
  explain: s => [[s * 78, -860], [s * 165, -760], [s * 165, -830]],
  wag: s => s > 0 ? [[78, -860], [190, -910], [180, -1050]] : REST(s),
};
const FRONT = new Set(['spoon', 'bags', 'rest', 'present', 'cheek', 'fork', 'forkup', 'eyes', 'pelmeni', 'hush', 'spoon', 'brooch', 'explain', 'point', 'wave', 'wag', 'shrug']);
const KG = {
  rest: s => [[s * 78, -860], [s * 150, -720], [s * 100, -640]],
  present: s => s > 0 ? [[78, -860], [215, -800], [225, -950]] : [[-78, -860], [-150, -720], [-100, -640]],
  cheek: s => s > 0 ? [[78, -860], [215, -880], [120 + rub(.7)[0], -1000 + rub(.7)[1]]] : [[-78, -860], [-150, -720], [-100, -640]],
  eyes: s => [[s * 78, -860], [s * 215, -900], [s * 150, -1050]],
  hair: s => s > 0 ? [[78, -860], [230, -1000], [190, -1180]] : [[-78, -860], [-215, -800], [-225, -950]],
  shock: s => [[s * 78, -860], [s * 200, -930], [s * 230, -1060]],
};
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of (P[l.id] || [])) if (u >= k) gg = v; return gg; } return idle; }
const ZPLAN = {z1: [[0, 'present']], z2: [[0, 'wave'], [.62, 'point']], z3: [[0, 'shrug'], [.28, 'present'], [.52, 'cheek']], z5: [[0, 'fork'], [.58, 'forkup']], z6: [[0, 'bags'], [.55, 'eyes'], [.93, 'rest']],
  z7: [[0, 'pelmeni']], z8: [[0, 'hush'], [.5, 'pour']], z9: [[0, 'spoon'], [.44, 'brooch'], [.72, 'wave']], z10: [[0, 'explain'], [.5, 'brooch']], z11: [[0, 'wag']], z12: [[0, 'shrug']], z13: [[0, 'brooch']]};
function zAct(t) { if (COVER) return {g: 'fork', mood: 'grin'}; if (t >= TL.END) return {g: 'rest', mood: 'grin'};
  let idle = 'rest'; if (t >= at('z8', .5) && t < TL.FRIDGE + .35) idle = 'pour'; if (t >= BY.z8.end && t < BY.p1.end + .3 && t >= TL.FRIDGE + .35) idle = 'shrug';
  const l = lineAt(t); let mood = plan(MOODS, 'z', t, 'smug');
  if (!(l && l.who === 'z')) mood = t >= TL.RING - .1 && t < BY.k6.at + .3 ? 'surprised' : t >= BY.k6.at && t < BY.k7.at ? 'happy' : l && l.id === 'p1' ? 'flat' : t >= TL.GRAB1 + .3 && t < BY.z13.at ? 'surprised' : t >= TL.GRAB2 + .3 ? 'surprised' : t >= BY.z8.end && t < BY.z9.at ? 'flat' : 'smug';
  const wink = !!(l && l.id === 'z1' && (t - l.at) / (l.end - l.at) > .8);
  return {g: plan(ZPLAN, 'z', t, idle), mood, wink}; }
// emotions: smug when trolling, grin on punchlines, shock, shiver, dreamy, triumphant, one wink
const MOODS = {z1: [[0, 'smug'], [.82, 'grin']], z2: [[0, 'grin']], z3: [[0, 'surprised'], [.3, 'smug'], [.78, 'grin']], z5: [[0, 'smug'], [.58, 'grin']], z6: [[0, 'kind'], [.75, 'grin']],
  z7: [[0, 'grin']], z8: [[0, 'smug'], [.75, 'grin']], z9: [[0, 'happy'], [.4, 'grin']], z10: [[0, 'smug']], z11: [[0, 'smug'], [.55, 'angry']], z12: [[0, 'kind']], z13: [[0, 'flat'], [.55, 'grin']]};
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
// gripObject: back of the hand -> object -> front fingertips + thumb. h = {x, y, rot, S, skin, nail, w (half-width of the object at the grip, world px), fist, side}
function gripObject(drawObj, h) { const sd = h.side || 1, W2 = (h.w || 0) / h.S;
  g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S); ell(0, 0, h.fist ? 30 : 34, h.fist ? 32 : 36, h.skin, 5); g.restore();
  drawObj();
  g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S);
  if (h.fist) { for (const o of [-17, -6, 5, 16]) { rr(-22, o - 6, 44, 12, 6, h.skin, 5); if (h.nail) ell(21, o, 6, 5, h.nail, 3); } g.save(); g.translate(-18, -26); g.rotate(.5); rr(-6, -7, 34, 14, 7, h.skin, 5); g.restore(); }
  else { for (const o of [-18, -6, 6, 18]) { rr(W2 - 16, o - 6, 26, 12, 6, h.skin, 5); if (h.nail) ell(W2 + 9, o, 6, 5, h.nail, 3); } rr(-W2 - 12, -16, 26, 14, 7, h.skin, 5); if (h.nail) ell(-W2 - 9, -9, 5, 4, h.nail, 3); }
  g.restore(); }
function hands(x, y, S, a, c, nail, glossy, skip = new Set()) { for (const s of [-1, 1]) { if (skip.has(s)) continue; const P3 = a.fn(s), E = P3[1], Hh = P3[2]; hand(x + Hh[0] * S, y + Hh[1] * S, Math.atan2(Hh[1] - E[1], Hh[0] - E[0]), S, c.pal.skin, nail, glossy); } }
function limbW(pts, w, col) { ln(pts, w + 14, INK); ln(pts, w, col); }
function armOver(a, x, y, S, c, sq = 1) { for (const s of [-1, 1]) { const [Sh, E, Hh] = a.fn(s); if (Hh[1] > -900) continue; g.save(); g.translate(x, y); g.scale(S, S * sq);
    const m = (k) => [Sh[0] + (E[0] - Sh[0]) * k, Sh[1] + (E[1] - Sh[1]) * k]; limbW([Sh, m(.45)], 46, c.pal.top); limbW([m(.4), E, Hh], 30, c.pal.arm || c.pal.skin); g.restore(); } }
const hpos = (a, s, x, y, S) => { const P3 = a.fn(s); return [x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0])]; };

// props in hands
function fork(x, y, ang, cutlet, sc = 1) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, 1); ln([[0, 0], [110, 0]], 9, '#c8ccd2'); ln([[0, 0], [110, 0]], 3, '#eef0f4'); rr(104, -16, 16, 32, 5, '#c8ccd2', 4); for (const o of [-12, -4, 4, 12]) ln([[118, o], [150, o]], 4, '#c8ccd2'); if (cutlet) ell(150, 0, 30, 22, '#9a5a2a', 5); g.restore(); }
function pelmeniBag(x, y, t) { g.save(); g.translate(x, y); g.rotate(-.15); rr(-90, -70, 180, 140, 18, 'rgba(200,228,248,.96)', 6); txt('PELMENI', 0, -36, 30, '#2a5a9a'); for (const [px, py] of [[-50, 20], [0, 26], [50, 18], [-24, 46], [26, 48]]) ell(px, py, 22, 14, '#fff8e8', 4);
  g.restore(); for (let i = 0; i < 4; i++) sparkle(x - 100 + hash(i) * 200, y - 80 + hash(i + 4) * 160, 12, Math.max(0, Math.sin(t * 5 + i * 2)), '#eaf8ff'); }
function spoon(x, y, ang, sc = 1) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, 1); ln([[-30, 0], [70, 0]], 9, '#c8ccd2'); ell(96, 0, 30, 20, '#c8ccd2', 5); ell(98, -6, 22, 12, '#ffffff', 3); g.restore(); }

function zState(t, x, y, S) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), fsx = faceState(t);
  const shiver = l && l.id === 'z7' ? 4 * Math.sin(t * 50) : 0, look = t >= BY.z12.at && t < TL.GRAB1 + .4 ? 1 : t >= TL.GRAB2 - .2 && t < CUK2 + .3 ? -.9 : 0;
  const tilt = spk ? .035 * Math.sin(t * 2.6) : .02 * Math.sin(t * 1.1), br = 1 - .006 * (1 + Math.sin(t * 2.2));
  return {l, spk, a, fsx, x: x + shiver, y, S, look, tilt, br}; }
function zhannaAt(t, x0, y0, S0, opt = {}) { const st = zState(t, x0, y0, S0), {a, fsx, x, y, S} = st;
  T.draw(g, {...ZH, pal: fsx.wet > .5 ? WET : ZH.pal, x, y, s: S, sq: st.br, arms: (a.fn = wig(a.fn, t, st.spk ? 6 : 2)), front: a.front, mood: a.act.mood, wink: a.act.wink, mouth: st.spk ? env(st.l, t) : 0, blink: blink(t, 2), tilt: st.tilt, look: st.look,
    skinFx: skinFx(fsx), faceFx: faceFx(fsx, t), hairFx: hairFx(fsx, t)});
  if (opt.mini) return; const bx = x - 40 * S, by = y - 790 * S * st.br; star(bx, by, 30 * S / .76, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 6; i++) { const sx = x + (hash(i) - .5) * 160 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  // props
  if (st.l && st.l.id === 'z7') for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const cx = x + sd * (300 + k * 26) * S, cy = y - 1070 * S; g.beginPath(); g.arc(cx, cy, (40 + k * 20) * S, sd > 0 ? -.6 : Math.PI - .6, sd > 0 ? .6 : Math.PI + .6); g.strokeStyle = '#6ab8f0'; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); }   // shiver lines
  HELD.clear(); const gR = a.act.g; armOver(a, x, y, S, ZH, st.br); const [rx, ry] = hpos(a, 1, x, y, S), [lx, ly] = hpos(a, -1, x, y, S);
  const onFace = (bx, by) => [x + bx * S, y + by * S], aim = (tx, ty) => [Math.atan2(ty - ry, tx - rx), Math.hypot(tx - rx, ty - ry)];
  const skin = ZH.pal.skin, nail = '#d63a8a', skip = new Set(), H = (hx, hy, rot, w, o = {}) => ({x: hx, y: hy, rot, S, skin, nail, w, ...o});
  const fist = (sd, hx, hy, tx, ty, len, gripAt, drawFn) => { const ang = Math.atan2(ty - hy, tx - hx), ox = hx - Math.cos(ang) * gripAt, oy = hy - Math.sin(ang) * gripAt, sc = Math.hypot(tx - ox, ty - oy) / len; skip.add(sd);
    gripObject(() => drawFn(ox, oy, ang, sc), H(hx, hy, ang - Math.PI / 2, 0, {fist: true, side: sd})); };
  if (gR === 'present' && t < BY.z3.end) { HELD.add('mayo'); skip.add(1); gripObject(() => jar(rx, ry + 56, .8), H(rx, ry, 0, 44)); }
  if (gR === 'cheek' || gR === 'spoon') { const cream = gR === 'spoon'; HELD.add(cream ? 'cream' : 'mayo'); skip.add(-1); gripObject(() => cream ? creamTub(lx, ly + 31, .62) : jar(lx, ly + 43, .62), H(lx, ly, 0, cream ? 36 : 34, {side: -1})); }
  if (gR === 'cheek') ell(rx - 16, ry - 22, 20, 13, '#fff1bf', 4);   // mayo on the fingertips, rubbed on the cheek
  if (gR === 'fork') { const [tx, ty] = onFace(92, -1048); fist(1, rx, ry, tx, ty, 150, 22, (ox, oy, ang, sc) => fork(ox, oy, ang, false, sc)); }
  if (gR === 'forkup') fist(1, rx, ry, rx + Math.cos(-1.3) * 150, ry + Math.sin(-1.3) * 150, 150, 22, (ox, oy, ang, sc) => fork(ox, oy, ang, true, sc));
  if (gR === 'spoon') { const [tx, ty] = onFace(100 + rub(.8)[0] * .6, -1005 + rub(.8)[1] * .6); fist(1, rx, ry, tx, ty, 96, -12, (ox, oy, ang, sc) => spoon(ox, oy, ang, sc)); }   // handle in the fist, bowl spreading cream on the cheek
  if (gR === 'pelmeni') { skip.add(-1); gripObject(() => pelmeniBag(lx, ly, t), H(lx, ly, -.15, 88, {side: -1})); }
  if (gR === 'pour') { HELD.add('beer'); skip.add(1); const tip = t >= TL.POUR - .2 && t < TL.FRIDGE + .2, r = tip ? -2.3 : -.3, bx = rx - 50 * Math.sin(r), by = ry + 50 * Math.cos(r);
    gripObject(() => bottle(bx, by, .9, r), H(rx, ry, r, 24));
    if (tip) { const mx = bx + 171 * Math.sin(r), my = by - 171 * Math.cos(r), hy = y - 1395 * S; g.save(); g.globalAlpha = .9; ln([[mx, my], [mx - 4, hy]], 14, INK); ln([[mx, my], [mx - 4, hy]], 9, '#f0c050'); g.restore(); for (let k = 0; k < 3; k++) ell(mx - 30 + k * 30, hy - 8 - 10 * Math.abs(Math.sin(t * 14 + k)), 7, 9, '#f0c050', 3); } }
  hands(x, y, S, a, ZH, nail, true, skip); }

// ---------- Petrovich's hand (face never shown) ----------
function grabK(t, g0) { const u = t - g0; if (u < 0 || u > 1.15) return null; const out = u < .45 ? 1 - ease(u / .45) : u < .6 ? 0 : ease((u - .6) / .5); return {out, holding: u >= .5}; }
function petroHand(t) { for (const [g0, side, eye] of [[TL.GRAB1, 1, 1], [TL.GRAB2, -1, -1]]) { const k = grabK(t, g0); if (!k) continue;
    const ex = ZH.x + eye * 50 * 1.2 * ZH.s, ey = SEAT + (-930 + (-1070 + 930) * 1.2) * ZH.s, sx = side > 0 ? 1200 : -120, sy = 1180;
    const hx = lerp(ex + side * 46, sx, k.out), hy = lerp(ey + 10, sy, k.out), ang = side > 0 ? Math.PI : 0;
    const wx = hx + side * 30, ax = hx + side * 62; ln([[wx, hy], [ax, hy + 4]], 52, INK); ln([[wx, hy], [ax, hy + 4]], 40, '#eec3a2'); ell(hx + side * 44, hy + 24, 13, 13, '#e8c27a', 4);   // wrist + watch
    ln([[ax, hy + 4], [ax + side * 900, hy + 160]], 96, INK); ln([[ax, hy + 4], [ax + side * 900, hy + 160]], 82, '#7a808c'); g.save(); g.translate(ax, hy + 4); g.rotate(side * .17); rr(-10, -44, 20, 88, 8, '#eef3f8', 5); g.restore();   // sleeve to the frame edge, shirt cuff
    if (k.holding) gripObject(() => { ell(hx - side * 10, hy, 40, 40, '#3d8b3d', 5); ell(hx - side * 10, hy, 32, 32, '#d7ecaa', 0); }, {x: hx, y: hy, rot: 0, S: 1.2, skin: '#eec3a2', w: 40, side: -side});
    else hand(hx, hy, ang, 1.2, '#eec3a2', null, false); } }

// ---------- Kaylee's phone insert ----------
const PH = {x: 170, y: 220, w: 740, h: 1310};
const KPLAN = {k1: [[0, 'present']], k3: [[0, 'cheek']], k4: [[0, 'eyes']], k5: [[0, 'hair']], k6: [[0, 'shock']], k7: [[0, 'cheek']]};
function kAct(t) { const l = lineAt(t); const id = l && l.who === 'k' ? l.id : null; let gg = 'rest';
  if (id) gg = plan(KPLAN, 'k', t, 'rest'); else { const prev = [...L].reverse().find(q => q.who === 'k' && q.end <= t + .4); if (prev && t - prev.end < .4) gg = KPLAN[prev.id][0][1]; }
  const mood = id === 'k6' ? 'surprised' : id === 'k7' || id === 'k1' ? 'grin' : id === 'k5' ? 'smug' : id === 'k4' ? 'kind' : null; return {g: gg, mood}; }
function kayleeRoom() { const {x, y, w, h} = PH; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#ffe4ee'); gr.addColorStop(1, '#f6d6f0'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  rr(x + 40, y + 330, 260, 18, 6, '#ffffff', 4); for (let i = 0; i < 4; i++) rr(x + 60 + i * 58, y + 250, 40, 80, 10, ['#ffc2d6', '#c9b6f2', '#b8e8d8', '#ffe6a8'][i], 4);
  g.save(); g.globalAlpha = .7; g.beginPath(); g.arc(x + w - 120, y + 240, 90, 0, 7); g.strokeStyle = '#ffffff'; g.lineWidth = 26; g.stroke(); g.restore(); }
function kaylee(t, x, y, S) { const l = lineAt(t), spk = l && l.who === 'k', a = blendArms(kAct, KG, t), id = l && l.id;
  const patches = (t >= at('k4', .35) && t < BY.k4.end + .6);
  T.draw(g, {...KY, x, y, s: S, arms: (a.fn = wig(a.fn, t, spk ? 5 : 1.5)), front: true, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 4), tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: 0,
    faceFx: patches ? (gg, HY) => { const pg = g; g = gg; for (const s of [-1, 1]) { g.save(); g.translate(s * 54, HY + 52); g.rotate(s * .2); g.beginPath(); g.ellipse(0, 0, 40, 18, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#f2c84a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.restore(); } g = pg; } : null});
  armOver(a, x, y, S, KY); const [rx, ry, ra] = hpos(a, 1, x, y, S);
  const kskip = new Set(), KH = (hx, hy, rot, w, o = {}) => ({x: hx, y: hy, rot, S, skin: KY.pal.skin, nail: '#ff9ec0', w, ...o});
  if (a.act.g === 'present') { kskip.add(1); gripObject(() => { g.save(); g.translate(rx, ry); rr(-30, -60, 60, 110, 14, '#ffc2d6', 5); rr(-12, -88, 24, 30, 6, '#ffffff', 4); txt('$80', 0, 26, 24, '#b02a70'); g.restore(); }, KH(rx, ry, 0, 30 * 1)); }
  if (a.act.g === 'cheek' && (id === 'k3' || (!id && t < BY.k4.at))) { kskip.add(1); gripObject(() => { g.save(); g.translate(rx - 10, ry - 20); g.rotate(-.5); g.beginPath(); g.moveTo(-40, 30); g.quadraticCurveTo(-50, -40, 0, -46); g.quadraticCurveTo(50, -40, 40, 30); g.quadraticCurveTo(0, 10, -40, 30); g.closePath(); g.fillStyle = '#7ad0a8'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore(); }, KH(rx, ry, -.5, 38)); }
  if (a.act.g === 'cheek' && id === 'k7') { kskip.add(1); const tx = x + 95 * S, ty = y - 1050 * S, ang = Math.atan2(ty - ry, tx - rx), ox = rx - Math.cos(ang) * 22, oy = ry - Math.sin(ang) * 22;
    gripObject(() => fork(ox, oy, ang, false, Math.hypot(tx - ox, ty - oy) / 150), KH(rx, ry, ang - Math.PI / 2, 0, {fist: true})); }
  if (a.act.g === 'hair') { const [lx, ly] = hpos(a, -1, x, y, S); kskip.add(-1); gripObject(() => { g.save(); g.translate(lx, ly); rr(-44, -36, 88, 70, 14, '#ffe6a8', 5); rr(-48, -50, 96, 20, 8, '#ffffff', 4); g.restore(); }, KH(lx, ly, 0, 44, {side: -1})); }
  hands(x, y, S, a, KY, '#ff9ec0', true, kskip); }
function phoneInsert(t) { const {x, y, w, h} = PH, incoming = t >= TL.RING - .2 && t < BY.k6.at + .35, call = t >= BY.k6.at && t < TL.HANG;
  const sh = incoming && t < BY.k6.at ? 6 * Math.sin(t * 55) : 0; g.save(); g.translate(sh, 0);
  g.save(); g.fillStyle = 'rgba(30,20,30,.35)'; g.beginPath(); g.roundRect(x - 10, y + 14, w + 40, h + 30, 80); g.fill(); g.restore(); rr(x - 22, y - 22, w + 44, h + 44, 80, '#1d1b22', 8);
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 60); g.clip();
  if (incoming && !(t >= BY.k6.at + .3)) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3a2a5a'); gr.addColorStop(1, '#8a4a8a'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.save(); g.beginPath(); g.arc(540, y + 420, 170, 0, 7); g.fillStyle = '#ffe4ee'; g.fill(); g.clip(); kaylee(t, 540, y + 420 + 1062 * .5 - 10, .5); g.restore(); ell(540, y + 420, 170, 170, null, 8, '#ffffff');
    txt('Kaylee', 540, y + 700, 84, '#ffffff'); txt('incoming video call…', 540, y + 790, 44, '#e8d8ff');
    const pulse = 1 + .08 * Math.sin(t * 12); for (const [bx, col] of [[370, '#e0404a'], [710, '#2fbf5a']]) { ell(bx, y + 1080, 70 * pulse, 70 * pulse, col, 6, '#ffffff'); }
    ln([[345, y + 1080], [395, y + 1080]], 10, '#ffffff'); ln([[690, y + 1070], [710, y + 1095], [735, y + 1060]], 10, '#ffffff'); }
  else { kayleeRoom(); g.save(); g.translate(0, 0); rr(x - 20, y + 1010, w + 40, 400, 0, '#ffffff', 6); kaylee(t, 540, y + 1880, 1.12); rr(x - 20, y + 1040, w + 40, 400, 0, '#fff4f8', 6); for (let i = 0; i < 3; i++) rr(x + 80 + i * 200, y + 990, 70, 60, 14, ['#ffc2d6', '#c9b6f2', '#b8e8d8'][i], 4); g.restore();
    if (call) { rr(x + 30, y + 40, 300, 70, 35, 'rgba(0,0,0,.45)', 0); txt('Kaylee', x + 120, y + 76, 36, '#ffffff', FONT, 'left'); ell(x + 76, y + 76, 16, 16, '#2fbf5a', 0);
      rr(x + w - 210, y + 40, 170, 250, 22, '#f3d6dc', 5); g.save(); g.beginPath(); g.roundRect(x + w - 210, y + 40, 170, 250, 22); g.clip(); zhannaAt(t, x + w - 125, y + 40 + 120 + 1062 * .17 + 40, .17, {mini: true}); g.restore(); rr(x + w - 210, y + 40, 170, 250, 22, null, 5, '#ffffff');
      ell(540, y + h - 110, 56, 56, '#e0404a', 5, '#ffffff'); ln([[515, y + h - 110], [565, y + h - 110]], 10, '#ffffff'); }
    else { rr(x + 30, y + 40, 280, 64, 32, 'rgba(0,0,0,.35)', 0); txt('@kayleeglow', x + 170, y + 73, 32, '#ffffff'); rr(x + w - 160, y + 44, 120, 56, 18, '#ff3a6a', 0); txt('GRWM', x + w - 100, y + 73, 28, '#ffffff'); } }
  g.restore(); rr(x, y, w, h, 60, null, 6, '#000'); rr(540 - 70, y + 14, 140, 26, 13, '#000', 0); g.restore(); }

// ---------- cards ----------
const PX = 110, PY = 120, PW = 860, PH2 = 520;
function stamp(x, y, s, u) { if (u <= 0) return; const k = ease(u * 4); g.save(); g.translate(x, y); g.rotate(-.2); g.scale(1.6 - .6 * k, 1.6 - .6 * k); g.globalAlpha *= k; rr(-110 * s, -44 * s, 220 * s, 88 * s, 14, null, 9, '#d8323c'); txt('DUPE', 0, 4, 64 * s, '#d8323c'); g.restore(); }
const CARD = {
  mayo: u => { g.save(); g.translate(230, 250); rr(-60, -110, 120, 210, 26, '#ffc2d6', 7); rr(-22, -150, 44, 44, 8, '#ffffff', 6); txt('LUXE', 0, -30, 34, '#b02a70', HW); g.restore(); txt('$80', 230, 410, 56, INK); ln([[170, 410], [290, 410]], 8, '#d8323c');
    txt('=', 430, 260, 90, INK); g.save(); g.translate(0, 0); jar(640, 350, 1.3); g.restore(); txt('$1.99', 640, 410, 56, '#2f9a5a'); stamp(640, 140, .9, u - .35); },
  fork: u => { g.save(); g.translate(230, 240); g.rotate(-.3); g.beginPath(); g.moveTo(-80, 60); g.quadraticCurveTo(-100, -80, 0, -90); g.quadraticCurveTo(100, -80, 80, 60); g.quadraticCurveTo(0, 20, -80, 60); g.closePath(); g.fillStyle = '#7ad0a8'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); g.restore();
    txt('GUA SHA', 230, 400, 50, INK); txt('=', 430, 250, 90, INK); g.save(); g.translate(560, 300); g.scale(1.8, 1.8); fork(0, 0, -.5, u > .5); g.restore(); txt('FORK', 640, 400, 50, '#d8323c'); },
  pelmeni: u => { g.save(); g.translate(230, 240); rr(-40, -100, 80, 140, 30, '#c9b6f2', 7); ln([[0, 40], [0, 120]], 10); ell(0, 120, 16, 16, INK, 0); g.restore(); txt('ICE ROLLER', 230, 410, 44, INK); txt('=', 440, 250, 90, INK);
    pelmeniBag(650, 250, u * 8); txt('PELMENI', 650, 410, 50, '#2a5a9a'); for (let i = 0; i < 3; i++) star(560 + i * 90, 120, 18, '#eaf8ff', 4, 6); },
  shelf: u => { rr(110, 60, 600, 80, 14, '#2a4a8a', 6); txt('GASTRONOM ODESSA', 410, 101, 44, '#ffd23f'); for (const [yy, n] of [[230, 'SHELF 1'], [360, 'SHELF 2']]) { rr(110, yy + 40, 600, 16, 4, '#8a5a3c', 5); for (let i = 0; i < 5; i++) yy === 360 ? jar(170 + i * 110, yy + 40, .55) : rr(140 + i * 110, yy - 50, 70, 90, 8, ['#e8a23a', '#d8323c', '#2f8a5a', '#ffffff', '#4ab0d8'][i], 5); }
    if (u > .3) { g.save(); g.translate(745, 380); g.rotate(-.06); poly([[-20, -30], [40, 0], [-20, 30]], '#d63a8a', 5); g.restore(); txt('LINK', 770, 300, 40, '#d63a8a'); txt('IN BIO', 770, 340, 34, '#d63a8a'); } },
  brad: u => { star(230, 220, 110, '#f2c820', 7, 5, -Math.PI / 2); txt('BRAD PITT', 230, 410, 50, INK); txt('=', 430, 250, 90, INK);
    g.save(); g.translate(640, 270); g.beginPath(); g.moveTo(-150, 30); g.bezierCurveTo(-160, -110, 160, -125, 150, 25); g.quadraticCurveTo(0, -10, -150, 30); g.closePath(); g.fillStyle = '#7a808c'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
    g.beginPath(); g.moveTo(-130, 24); g.quadraticCurveTo(0, -12, 140, 20); g.quadraticCurveTo(150, 50, 120, 56); g.quadraticCurveTo(0, 30, -120, 56); g.quadraticCurveTo(-150, 50, -130, 24); g.closePath(); g.fillStyle = '#5e6470'; g.fill(); g.stroke(); g.restore();
    txt('PETROVICH', 640, 410, 50, '#5e6470'); stamp(640, 130, .9, u - .4); },
};
function panel(id, u, t, a0, b0) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.translate(PX, PY); rr(10, 10, PW - 20, PH2 - 20, 46, '#fffaf0', 10);
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH2 - 80, 36); g.clip(); CARD[id](u); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH2 / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH2 / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const PANELS = [['mayo', at('z3', .3), BY.z3.end + .4], ['fork', BY.z5.at + .1, BY.z5.end + .35], ['pelmeni', BY.z7.at + .15, BY.z7.end + .35], ['shelf', BY.z10.at + .1, BY.z10.end + .35], ['brad', at('z13', .3), BY.z13.end + .6]];
function panels(t) { for (const [id, a, b] of PANELS) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b); }

// ---------- shots ----------
const CAM = {WIDE: [1.0, 540, 1010], MED: [1.35, 540, 1030], CU: [1.68, 540, 1000], CU2: [1.55, 540, 1010]};
const KS = id => [BY[id].at - .12, 'PHONE'];
const SH = [[0, 'MED'], [BY.z2.at - .1, 'WIDE'], KS('k1'), [BY.z3.at - .1, 'CU'], KS('k3'), [BY.z5.at - .1, 'MED'], KS('k4'), [BY.z6.at - .1, 'CU'], [BY.z7.at - .1, 'MED'], KS('k5'),
  [BY.z8.at - .05, 'WIDE'], [BY.z9.at - .1, 'CU'], [TL.RING - .2, 'PHONE'], [BY.z10.at - .1, 'MED'], KS('k7'), [BY.z11.at - .1, 'CU'], [BY.z12.at - .4, 'MED'], [TL.GRAB1 - .1, 'CU2'], [BY.z13.at - .1, 'CU'], [TL.GRAB2 - .1, 'CU2'], [TL.END, 'END']]
  .map(([at0, k], i, a) => ({at: at0, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
let SOLVED = null; try { SOLVED = JSON.parse(fs.readFileSync(__dirname + '/cams.json', 'utf8')); } catch (e) {}
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'MED' : sh.k === 'PHONE' ? 'WIDE' : sh.k; let [z, x, y] = CAM[k]; if (SOLVED && SOLVED[sh.i]) [z, x] = SOLVED[sh.i]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .025 * ease(u), punch = sh.at > 0 && sh.k !== 'END' ? .02 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = {z1: [['Гёрлиз', 'the girlies — девочки'], ['глоу', 'glow — сияние'], ['Ю ноу', 'you know — понимаешь']], z2: [['Гет рэди виз ми', 'get ready with me — собирайся со мной'], ['скинкеа рутин', 'skincare routine — уход за кожей'], ['тэгнула', 'tag — отметила']],
  z3: [['дьюп', 'dupe — дешёвый аналог']], z5: [['Гуаша', 'gua sha — скребок для лица'], ['Лифтинг', 'lifting — подтяжка']], z6: [['Патчи', 'patches — патчи']], z7: [['Криотерапия', 'cryotherapy — лечение холодом'], ['Сибирь-стайл', 'Siberia style — по-сибирски']],
  z8: [['Протеин', 'protein — белок'], ['Слэй', 'slay — ты королева']], z9: [['Ноу филтер', 'no filter — без фильтра'], ['Залайкайте', 'like — ставьте лайки']], z10: [['Линк ин био', 'link in bio — ссылка в профиле']],
  z11: [['Коллаб', 'collab — совместный ролик'], ['клинзер', 'cleanser — гель для умывания']], z12: [['Чекни', 'check — проверь'], ['глас скин', 'glass skin — кожа как стекло']], z13: [['Гёрлиз', 'the girlies — девочки'], ['дэйт', 'date — свидание'], ['дьюп', 'dupe — дешёвый аналог']]};
const SPL = {
  k1: [['Step one: my eighty-dollar cleanser.', 'Шаг первый: мой гель за 80 долларов.'], ["It's giving glass skin!", 'Кожа — прям как стекло!']],
  k3: [['Then my gua sha, for lifting.', 'Потом моя гуаша — для лифтинга.']],
  k4: [['Cooling eye patches for puffiness.', 'Охлаждающие патчи от отёков.']],
  k5: [['And for my hair, a protein—', 'А для волос — протеиновая…']],
  k6: [["Ma'am?! Your skin is literally glowing!", 'Мэм?! У вас кожа реально сияет!'], ['Is there a link in bio?', 'А ссылка в профиле есть?']],
  k7: [['A fork?! Iconic.', 'Вилка?! Это легендарно.'], ["Ma'am, can we collab?", 'Мэм, давайте коллаб?']],
};
function chunks(l) { if (SPL[l.id]) { const P = SPL[l.id], n = P.reduce((a, c) => a + c[0].length, 0); let acc = 0; return P.map(([s, tr]) => { const a = l.at + (l.end - l.at) * acc / n; acc += s.length; return {s, tr, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
  const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (l.end - l.at) < 1.2) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
const CH = L.map(l => ({l, ch: chunks(l)})), FLAT = [].concat(...CH.map(x => x.ch));
FLAT.forEach((c, i) => { const nx = FLAT[i + 1], lim = nx ? nx.a - .05 : c.b + 1.2; c.hold = Math.max(c.b, Math.min(c.a + 1.2, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .25, lim)); });
const CHIPS0 = []; for (const c of []) { if (c.who !== 'z') continue; const hits = (GLOSS[c.id] || []).filter(([w]) => c.s.toLowerCase().includes(w.toLowerCase())); if (!hits.length) continue;
  const dur = c.hold - c.a; if (dur < 1.2) continue; const use = dur / hits.length >= 1.2 ? hits : hits.slice(0, 1); use.forEach(([w, tr], i) => CHIPS.push({a: c.a + dur * i / use.length, b: c.a + dur * (i + 1) / use.length, w, tr})); }
const CHIPS = []; { const W0 = []; for (const l of L) { if (l.who !== 'z') continue; const low = l.text.toLowerCase();
    for (const [w, tr] of GLOSS[l.id] || []) { const i = low.indexOf(w.toLowerCase()); if (i < 0) throw new Error('gloss word not in line: ' + w); W0.push({t: l.at + (l.end - l.at) * i / low.length, w, tr}); } }
  W0.sort((p, q) => p.t - q.t); let prev = 0; W0.forEach((c, i) => { const a = Math.max(c.t, prev), nx = W0[i + 1], b = Math.max(a + 1.3, nx ? Math.min(nx.t, a + 1.8) : a + 1.6); CHIPS.push({a, b: Math.min(b, TL.END), w: c.w, tr: c.tr}); prev = b; }); }
const ENW = new Set([].concat(...Object.values(GLOSS).map(x => x.map(([w]) => w.toLowerCase().split(/[\s-]+/)))).flat());
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, '').toLowerCase(); return /[a-z]/i.test(x) || x.split('-').some(p => ENW.has(p)); };
function curChunk(t) { let cur = null; for (const c of FLAT) if (t >= c.a - .02 && t < c.hold) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  outlinedWords(cur.s.split(' '), 1640, 70, w => isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 46, () => '#ffffff'); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr.replace(/^.*? — /, m => m); let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = 4.4;
function hook(t) { if (t > HOOK_END + .3) return; const a = ease(t / .2) * (1 - ease((t - HOOK_END) / .3)); g.save(); g.globalAlpha = a; g.translate(540, 300); g.rotate(-.02);
  rr(-440, -150, 880, 300, 34, '#fffaf0', 9); txt('GLASS SKIN', 0, -62, 100, INK); txt('ЗА $1,99?!', 0, 58, 104, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 150, 960, 1580, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 250, 66, '#d63a8a');
  const R = [['GET READY WITH ME (GRWM)', 'собирайся со мной'], ['SKINCARE ROUTINE', 'уход за кожей'], ["IT'S GIVING…", 'прям вайб…'], ['GLASS SKIN', 'кожа как стекло'], ['DUPE', 'дешёвый аналог'], ['SLAY', 'ты королева / бомба'], ['LINK IN BIO', 'ссылка в профиле']];
  R.forEach(([en, ru], i) => { const y = 370 + i * 124; let f = 54; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Напиши дьюп своей мамы', 540, 1290, 52, '#d63a8a'); txt('по-английски:', 540, 1360, 52, '#d63a8a'); txt('$80 ______ = $2 ______', 540, 1470, 58, INK); txt('Лучший Жанна покажет Кейли!', 540, 1590, 48, INK); g.restore(); }

// ---------- frame ----------
function scene(t, c) { g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); room(t); g = G0;
  g.save(); g.filter = `blur(${(3 * c.z).toFixed(1)}px) saturate(0.7) brightness(1.02)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); zhannaAt(t, ZH.x, SEAT, ZH.s); vanity(t); petroHand(t); g.restore(); }
function frame(t) { NOW = t;
  const c = COVER ? {z: 1.5, x: 540, y: 1050, k: 'MED', sh: {k: 'MED'}} : camAt(t); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  if (c.sh.k === 'PHONE') { scene(t, {z: 1.0, x: 540, y: 1010}); g.save(); g.filter = 'blur(10px)'; g.drawImage(cv, 0, 0); g.filter = 'none'; g.restore(); g.fillStyle = 'rgba(40,20,40,.25)'; g.fillRect(0, 0, W, H); const pk = ease((t - c.sh.at) / .2), sc = .94 + .06 * pk;
    g.save(); g.translate(540, 875); g.scale(sc, sc); g.translate(-540, -875); phoneInsert(t); g.restore(); }
  else scene(t, c);
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.16)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END' && c.sh.k !== 'PHONE' && !COVER) panels(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); } }

const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { process.env.NOCAP = 1; COVER = true; const t = +(arg || at('z9', .8)); frame(t); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 190); g.save(); g.filter = 'blur(8px)'; g.drawImage(src, 0, 0, W, 8, 0, 0, W, 194); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 470); g.rotate(-.02); rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('БЬЮТИ-РУТИН', 0, -60, 100, INK); txt('ТЁТИ ЖАННЫ', 0, 60, 100, '#d63a8a'); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/zhanna_grwm.srt', out); }
else if (mode === 'info') { for (const c of FLAT) console.log(c.id, c.a.toFixed(2), c.hold.toFixed(2), (c.hold - c.a).toFixed(2), c.s, '|', c.tr || ''); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w);
  for (const [id, a, b] of PANELS) console.log('CARD', id, a.toFixed(2), (b - a).toFixed(2)); for (const s of SH) console.log('SH', s.i, s.at.toFixed(2), (s.end - s.at).toFixed(2), s.k); }
else if (mode === 'frame') { // Zhanna's horizontal extent per shot (incl. props) must fit inside the narrowest view; shrink zoom until it does
  const SC = .25, OX = 600, mc = createCanvas(Math.round(2600 * SC), Math.round(2200 * SC)), mg = mc.getContext('2d'), out = {};
  for (const sh of SH) { if (sh.k === 'PHONE' || sh.k === 'END') continue; let a = 1e9, b = -1e9;
    for (let t = sh.at; t < sh.end; t += .1) { NOW = t; g = mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, mc.width, mc.height); g.setTransform(SC, 0, 0, SC, OX * SC, 0); zhannaAt(t, ZH.x, SEAT, ZH.s); g = G0;
      const d = mg.getImageData(0, 0, mc.width, mc.height).data, w = mc.width; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) { const x = ((i - 3) / 4) % w; if (x < a) a = x; if (x > b) b = x; } }
    const ea = a / SC - OX - 30, eb = (b + 1) / SC - OX + 30; let [z, x] = CAM[sh.k]; x = Math.round((ea + eb) / 2); while (1080 / (z * 1.05) < eb - ea && z > .8) z -= .01;
    out[sh.i] = [+z.toFixed(3), x]; console.log(sh.i, sh.k, sh.at.toFixed(2), [Math.round(ea), Math.round(eb)], '->', out[sh.i], 'was', CAM[sh.k].slice(0, 2)); }
  fs.writeFileSync('cams.json', JSON.stringify(out)); }
