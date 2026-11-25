// «Франсе» v3 — «illustrated lyrics» (owner's reference): one literal illustrated scene per sung line, soft 0.3 s cross-dissolves on the
// line starts, slow drift / push-in, dark vignette, karaoke lyric typography at the TOP (sung words solid white, upcoming words dim,
// the key word of each line big yellow-orange). Zhanna acts and lip-syncs lightly. No dialogue. t=0 = song 56.0 s. No song audio in the file.
// node render_v3.js still 1,5 | storyboard | clip 0:20 out/v3_0.mp4 | accaudit | textaudit | armaudit   (NOCAP=1 hides the lyrics)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts, loadImage} = require('@napi-rs/canvas'), T = require('./toon_v3');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC';
const TL = require('./timeline_v3.json'), LINES = TL.LINES, LEN = TL.LEN, SCN = TL.SCENES.map(s => s[0]);
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0; const cA = createCanvas(W, H), cB = createCanvas(W, H);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }, P01 = (t, a, d) => clamp((t - a) / d);
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7, stroke = INK) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
const TEXTLOG = []; function fit(str, x, y, w, h, maxS, col, o = {}) { const s = T.fitText(g, str, {x: x - w / 2, y: y - h / 2, w, h}, {maxSize: maxS, color: col, pad: o.pad ?? 5, lines: o.lines || 1, font: o.font || FONT, minSize: 6}); TEXTLOG.push([str, s]); return s; }
function sparkle(x, y, r, a = 1, col = '#fff6c0') { if (a <= 0) return; g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], col, 3); g.restore(); }
const scr = (x, y) => { const m = g.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
let FACEBOX = [], PROPBOX = [], TEXTBOX = [];
const faceReg = (nm, x, y, S) => { const a = scr(x - 190 * S, y - 1200 * S), b = scr(x + 190 * S, y - 950 * S); FACEBOX.push([nm, a[0], a[1], b[0] - a[0], b[1] - a[1]]); };

// ---------- cast ----------
const ZH = {outfit: 'sequins', hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}};
const NB = {outfit: 'leopard', hair: 'bun', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#efc0a0', skinS: '#d9a283', hair: '#5a2a3a', brow: '#3a1a22', lip: '#9a2a6a', top: '#cf8a48', topS: '#b47236', bottom: '#2a2230', skirt: '#2a2230', legs: '#efc0a0', shoe: '#9a2a6a', sole: '#9a2a6a'}};   // the neighbour: fussy fake-designer look
const GR = c => ({outfit: 'sequins', hair: 'curly', skirt: true, pal: {skin: '#f0c6aa', skinS: '#dcaa8c', hair: '#d8d4dc', brow: '#9a9098', lip: '#c05a6a', top: c, topS: c, collar: c, bottom: '#4a4a6a', skirt: '#4a4a6a', legs: '#f0c6aa', shoe: '#6a6a7a', sole: '#6a6a7a'}});
const NAIL = '#d63a8a', FEET = 1900, TABLE = 1400;
const REST = s => [[s * 78, -860], [s * 150, -720], [s * 100, -625]], HIP = s => [[s * 78, -860], [s * 190, -770], [s * 112, -655]];
const GEST = {
  rest: REST, hips: HIP,
  perfume: s => s > 0 ? [[78, -860], [235, -850], [262, -1000]] : HIP(s), spray: s => s > 0 ? [[78, -860], [228, -840], [250, -975]] : HIP(s),
  grand: s => s > 0 ? [[78, -860], [235, -850], [262, -1000]] : [[-78, -860], [-235, -960], [-330, -1090]],     // perfume in the right hand, left arm thrown out: «voilà»
  bottleUp: s => s > 0 ? [[78, -860], [215, -820], [225, -960]] : [[-78, -860], [-150, -780], [-60, -900]],   // bottle up beside the face, left hand flips the tag at chest height
  judge: s => s > 0 ? [[78, -860], [175, -760], [95, -700]] : [[-78, -860], [-175, -760], [-95, -700]],        // arms crossed-ish (hands at the waist front)
  smirk: s => s > 0 ? [[78, -860], [190, -770], [112, -655]] : [[-78, -860], [-170, -780], [-80, -905]],       // one hand on the hip, the other at the chin
  bagHold: s => s > 0 ? [[78, -860], [180, -760], [205, -660]] : HIP(s),
  strut: s => [[s * 78, -860], [s * 120, -730], [s * 120, -610]],
  voila: s => s > 0 ? [[78, -860], [235, -960], [335, -1080]] : HIP(s),
  shrug: s => [[s * 78, -860], [s * 170, -780], [s * 225, -870]], worry: s => [[s * 78, -860], [s * 160, -780], [s * 95, -880]],
  wave: s => s > 0 ? [[78, -860], [230, -930], [300, -1060]] : [[-78, -860], [-175, -800], [-200, -690]],
};
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function armOver(fn, x, y, S, st) { for (const s of [-1, 1]) { const P3 = fn(s); if (P3[2][1] > -900) continue; g.save(); g.translate(x, y); g.scale(S, S); T.drawArm(g, st, s, P3, null, 'none'); g.restore(); } }
let DIRS = {};
function gripObject(drawObj, h) { const sd = h.side || 1, W2 = (h.w || 0) / h.S, dir = h.dir ?? DIRS[sd];
  g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S); ell(0, 0, h.fist ? 30 : 34, h.fist ? 32 : 36, h.skin, 5); g.restore();
  if (dir != null) ln([[h.x, h.y], [h.x - Math.cos(dir) * 26 * h.S, h.y - Math.sin(dir) * 26 * h.S]], 28 * h.S, h.skin);
  drawObj(); g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S);
  if (h.fist) { for (const o of [-17, -6, 5, 16]) { rr(-22, o - 6, 44, 12, 6, h.skin, 5); if (h.nail) ell(21, o, 6, 5, h.nail, 3); } g.save(); g.translate(-18, -26); g.rotate(.5); rr(-6, -7, 34, 14, 7, h.skin, 5); g.restore(); }
  else { for (const o of [-18, -6, 6, 18]) { rr(W2 - 16, o - 6, 26, 12, 6, h.skin, 5); if (h.nail) ell(W2 + 9, o, 6, 5, h.nail, 3); } rr(-W2 - 12, -16, 26, 14, 7, h.skin, 5); if (h.nail) ell(-W2 - 9, -9, 5, 4, h.nail, 3); }
  g.restore(); }
const shades = (gg, HY) => { const pg = g; g = gg; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 56, HY - 30, 64, 52, 0, 0, 7); g.fillStyle = '#1d1b22'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); ell(s * 56 - 22, HY - 46, 14, 8, 'rgba(255,255,255,.55)', 0); } ln([[-8, HY - 34], [8, HY - 34]], 8); g = pg; };
// a character: gesture fn, mood, mouth (light lip-sync for Zhanna), optional walk pose / seated / sunglasses / props in the right hand
const envAt = t => { const f = t * FPS, i = Math.floor(f), k = f - i; return (TL.env[i] || 0) * (1 - k) + (TL.env[i + 1] || 0) * k; };
const SONGLINE = {at: 0, end: LEN, env: TL.env};
function person(st0, t, x, y, S, o = {}) { const fn = T.ik(wig(GEST[o.g || 'rest'], t, 2), 2 + 2 * Math.sin(t * 2.2 + x)); const sing = o.sing ? T.talk(SONGLINE, t + 1 / 30, 3, {attack: .045, release: .07}) : {mouth: 0, nod: 0, round: .5};
  const st = {...st0, hands: {1: 'none', '-1': 'none'}, x, y, s: S, arms: fn, ik: false, front: true, mood: o.mood || 'smug', mouth: o.mouth ?? sing.mouth, round: sing.round, nod: (o.nod || 0) + sing.nod * .6, t,
    blink: ((t + x * .01) % 3.4) < .12 && !o.shades, tilt: (o.tilt || 0) + .02 * Math.sin(t * 1.1 + x), look: o.look || 0, lean: o.lean || 0, seated: o.seated, faceFx: o.shades ? shades : null, ...(o.walk ? {walk: o.walk.walk, walkDir: o.walk.walkDir} : {})};
  T.draw(g, st); faceReg(o.name || 'face', x, y, S); armOver(fn, x, y, S, st0);
  DIRS = {}; for (const sd of [-1, 1]) { const P3 = fn(sd); DIRS[sd] = Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]); }
  const skip = new Set(o.hold ? Object.keys(o.hold).map(Number) : []);
  if (o.hold) for (const [sd, f] of Object.entries(o.hold)) { const P3 = fn(+sd), hx = x + P3[2][0] * S, hy = y + P3[2][1] * S; f(hx, hy, S); }
  for (const sd of [-1, 1]) { if (skip.has(sd)) continue; const P3 = fn(sd); T.drawHand(g, o.hand ? o.hand(sd) : 'open', x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), S, st0.pal.skin, NAIL, sd, 22); } }

// ---------- props ----------
function perfumeBottle(x, y, s, puff, tag = 0) { g.save(); g.translate(x, y); g.scale(s, s);
  rr(-46, -120, 92, 120, 20, 'rgba(255,214,232,.95)', 6); rr(-38, -110, 76, 100, 14, '#ffb8d4', 0); rr(-16, -150, 32, 34, 6, '#f2c820', 6); rr(-26, -170, 52, 24, 8, '#f2c820', 6);
  rr(-36, -86, 72, 50, 8, '#fffaf0', 4); fit('LE PARFUM', 0, -61, 72, 50, 18, '#b02a70', {pad: 4, lines: 2});
  if (tag > 0) { ln([[30, -140], [110, -20 - 20 * Math.sin(tag * 3)]], 3); g.save(); g.translate(110, -20 - 20 * Math.sin(tag * 3)); g.rotate(-.25 + .2 * Math.sin(tag * 6)); g.scale(Math.cos(Math.PI * (1 - clamp(tag * 2))), 1);   // the tag flips round
    rr(-40, 0, 200, 130, 14, '#fff3a8', 6); ell(-20, 20, 8, 8, '#ffffff', 4); fit('$3.99', 60, 46, 170, 64, 56, '#c0283a'); fit('Brighton Beach', 60, 100, 170, 36, 26, INK); g.restore(); }
  g.restore();
  if (puff > 0) for (let k = 0; k < 9; k++) { const u = puff, a = -2.4 + (hash(k) - .5) * 1.1, r = 40 + u * 190 * (.6 + hash(k + 3) * .6); g.save(); g.globalAlpha = (1 - u) * .85; ell(x - 10 * s + Math.cos(a) * r * s, y - 170 * s + Math.sin(a) * r * s * .7, (16 + 26 * u) * s, (14 + 20 * u) * s, '#fff0f6', 3, '#e8b8cc'); g.restore(); sparkle(x + Math.cos(a) * r * s * 1.1, y - 180 * s + Math.sin(a) * r * s * .6, 10 * s, (1 - u), '#ffffff'); } }
function bag(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.arc(0, -120, 60, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 18; g.stroke(); g.strokeStyle = '#f2c820'; g.lineWidth = 9; g.stroke();
  rr(-120, -120, 240, 170, 26, '#1d1b22', 7); for (let k = 0; k < 5; k++) ln([[-100 + k * 50, -110], [-60 + k * 50, 40]], 3, '#3a3640'); rr(-100, -70, 200, 70, 10, '#fffaf0', 5); fit('COCO SHANEL', 0, -35, 200, 70, 40, INK); g.restore(); }   // a knockoff: the typo IS the joke, no real logo
function bench(x, y) { rr(x - 330, y - 330, 660, 40, 10, '#b07a4a', 7); rr(x - 330, y - 270, 660, 40, 10, '#b07a4a', 7); rr(x - 350, y - 200, 700, 46, 10, '#c58a54', 7); for (const dx of [-290, 290]) rr(x + dx - 16, y - 160, 32, 160, 6, '#5a4a4a', 6); }
function chart(x, y, w, h) { rr(x, y, w, h, 8, '#e9edf2', 6); for (let k = 0; k <= 6; k++) { const yy = y + 20 + k * (h - 40) / 6; ln([[x + 10, yy], [x + 60, yy]], 4, '#5a6070'); ln([[x + w - 60, yy], [x + w - 10, yy]], 4, '#5a6070'); } }

// ---------- sets ----------
function apartment() { g.fillStyle = '#efd2e4'; g.fillRect(-1600, -1400, 4300, 3400); g.fillStyle = '#e6c2d8'; for (let x = -1600; x < 2700; x += 110) g.fillRect(x, -1400, 40, 3400);
  rr(150, 230, 780, 760, 14, '#a8283a', 9); rr(180, 260, 720, 700, 8, '#c8343e', 5); g.save(); g.translate(540, 610);
  for (const [r, c] of [[250, '#e8a23a'], [195, '#2a4a8a'], [140, '#c8343e'], [86, '#e8a23a'], [38, '#2a4a8a']]) { g.save(); g.rotate(.785); rr(-r / 1.414, -r / 1.414, r * 1.414, r * 1.414, 6, c, 5); g.restore(); } g.restore();
  rr(-520, 300, 520, 640, 10, '#9fd4f0', 9); ln([[-260, 300], [-260, 940]], 9); ln([[-520, 620], [0, 620]], 9); rr(1060, 280, 180, 260, 10, '#f2c820', 8); rr(1080, 300, 140, 220, 6, '#fffaf0', 0); fit('PARIS', 1150, 410, 140, 60, 40, '#d63a8a'); }
function vanity() { rr(-400, TABLE, 1900, 40, 14, '#fbeef0', 8); rr(-380, TABLE + 36, 1860, 900, 0, '#f0d8de', 8); for (const x of [40, 540, 1040]) { rr(x - 160, TABLE + 90, 320, 170, 16, null, 5); ell(x, TABLE + 175, 14, 14, '#e8c27a', 4); }
  poly([[820, TABLE], [835, TABLE - 110], [885, TABLE - 110], [900, TABLE]], 'rgba(220,240,255,.9)', 5); for (const [dx, c] of [[-20, '#ff8ab8'], [10, '#ffd23f'], [36, '#ff8ab8']]) { ln([[860, TABLE - 110], [860 + dx, TABLE - 200]], 5, '#3d8b3d'); ell(860 + dx, TABLE - 210, 18, 18, c, 4); } }
function hallway() { g.fillStyle = '#d9cbe8'; g.fillRect(-1600, -1400, 4300, 3400); g.fillStyle = '#cbbadc'; for (let y = -1400; y < 2000; y += 120) g.fillRect(-1600, y, 4300, 8);
  rr(820, 330, 420, 1570, 12, '#8a5a3c', 9); rr(860, 380, 340, 640, 10, null, 6); rr(860, 1080, 340, 760, 10, null, 6); ell(890, 1080, 16, 16, '#e8c27a', 5); fit('12', 1030, 260, 120, 80, 64, INK);
  rr(-400, 1880, 1900, 300, 0, '#a07a6a', 0); for (let x = -400; x < 1500; x += 140) ln([[x, 1880], [x + 80, 2100]], 4, '#8a6a5a'); }
function boardwalk(t, wheel = true) { ['#ffd8c4', '#ffc4c8', '#f7b0cc', '#e6a2d4'].forEach((c, i) => { g.fillStyle = c; g.fillRect(-1800, -1400 + i * 520, 4600, 530); });
  g.fillStyle = '#5fb8d8'; g.fillRect(-1800, 1350, 4600, 160); g.fillStyle = '#e8c890'; g.fillRect(-1800, 1500, 4600, 900); for (let x = -1800; x < 2800; x += 120) ln([[x, 1500], [x - 300, 2400]], 4, '#c9a46a');
  if (wheel) { const cx = 1500, cy = 500, R = 600; g.save(); g.globalAlpha = .6; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + t * .05; ln([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], 6, '#fff4f8'); } g.beginPath(); g.arc(cx, cy, R, 0, 7); g.strokeStyle = '#ff5a8a'; g.lineWidth = 18; g.stroke(); g.restore(); }
  for (const [x, h] of [[-700, 260], [-300, 200], [200, 240]]) { ln([[x, 1500], [x, 1500 - h * 2]], 14, '#6a5a5a'); ell(x, 1500 - h * 2, 40, 24, '#fff4c0', 6); } }   // lamp posts
function sea(t) { ['#ffe1b8', '#ffc9b0', '#ffb0b8', '#f39ec8'].forEach((c, i) => { g.fillStyle = c; g.fillRect(-1800, -1400 + i * 480, 4600, 490); }); ell(1000, 420, 160, 160, '#fff1a0', 0);
  g.fillStyle = '#3a9ad0'; g.fillRect(-1800, 1250, 4600, 1200); for (let k = 0; k < 7; k++) { const y = 1300 + k * 110; ln([[-800 + (k % 2) * 60 + 30 * Math.sin(t * 2 + k), y], [-500, y]], 8, '#8fd4f4'); ln([[600 + 30 * Math.sin(t * 2 + k * 2), y + 40], [900, y + 40]], 8, '#8fd4f4'); }
  g.fillStyle = '#f0d49a'; g.beginPath(); g.moveTo(700, 2100); g.quadraticCurveTo(1100, 1700, 1800, 1650); g.lineTo(1800, 2400); g.lineTo(700, 2400); g.closePath(); g.fill(); }
function bigWave(t) { const ph = Math.sin(t * 1.6) * 30; g.beginPath(); g.moveTo(-1200, 2000); g.lineTo(-1200, 1500 + ph); g.bezierCurveTo(-600, 1280 + ph, -100, 1100 - ph, 300, 1250 + ph);
  g.bezierCurveTo(500, 1320, 640, 1180, 560, 1080); g.bezierCurveTo(520, 1020, 430, 1060, 470, 1130); g.lineTo(700, 2000); g.closePath(); g.fillStyle = '#2a86c4'; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  for (let k = 0; k < 9; k++) ell(560 - k * 90 + 20 * Math.sin(t * 3 + k), 1100 + k * 22 + 10 * Math.cos(t * 2 + k), 34, 22, '#ffffff', 5); }
function flamingo(x, y, s, t) { g.save(); g.translate(x, y + 8 * Math.sin(t * 2.4)); g.rotate(.05 * Math.sin(t * 1.7)); g.scale(s, s);
  ell(0, 0, 300, 110, '#ff7ab4', 9); ell(-40, -20, 200, 60, '#ff9ccb', 0); g.beginPath(); g.moveTo(230, -40); g.bezierCurveTo(330, -200, 220, -330, 300, -420); g.strokeStyle = INK; g.lineWidth = 70; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#ff7ab4'; g.lineWidth = 56; g.stroke();
  ell(320, -430, 60, 52, '#ff7ab4', 8); poly([[360, -420], [430, -400], [372, -380]], '#2a2230', 5); ell(318, -446, 10, 10, INK, 0); g.restore(); }
function umbrellaPetro(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); ln([[0, 0], [0, -520]], 14, '#6a5a5a'); g.beginPath(); g.moveTo(-300, -470); g.quadraticCurveTo(0, -700, 300, -470); g.closePath();
  g.fillStyle = '#ffd23f'; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); for (const dx of [-150, 0, 150]) ln([[0, -620], [dx, -470]], 6);
  rr(-130, -210, 260, 210, 40, '#2c3f8f', 8); for (const sx of [-110, 110]) ln([[sx, -200], [sx, -20]], 9, '#f4f1ea'); ell(0, -260, 80, 85, '#e8b896', 8); g.save(); g.beginPath(); g.ellipse(0, -260, 76, 81, 0, 0, 7); g.clip(); g.fillStyle = '#b8b0a8'; g.fillRect(-90, -240, 180, 90); g.restore();
  rr(-150, -420, 300, 170, 6, '#f3eedf', 6); fit('BRIGHTON POST', 0, -385, 270, 50, 34, INK); for (let i = 0; i < 3; i++) ln([[-130, -330 + i * 26], [130, -330 + i * 26]], 4, '#b8b2a2'); g.restore(); }

// ---------- scenes (one per sung line) ----------
const ZS = .86;
const CAMS = [ // [z0, z1, x0, x1, y0, y1] slow drift / push-in inside each scene (heads stay below the lyric band)
  [1.22, 1.36, 560, 590, 1080, 1060], [1.4, 1.55, 640, 650, 1030, 1015], [1.0, 1.08, 640, 620, 1100, 1090], [1.2, 1.28, 600, 610, 1080, 1070],
  [.9, .98, 520, 600, 1120, 1110], [.86, .94, 560, 560, 1130, 1120], [1.0, 1.08, 430, 440, 1100, 1090], [.66, .74, 520, 560, 1130, 1110]];
function camOf(k, t) { const a = SCN[k], b = SCN[k + 1] ?? LEN, u = eio(clamp((t - a) / (b - a))), c = CAMS[k]; return {z: lerp(c[0], c[1], u), x: lerp(c[2], c[3], u), y: lerp(c[4], c[5], u)}; }
function scene(k, t) { const c = camOf(k, t); g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); const a = SCN[k];
  if (k === 0) { apartment(); let puff = 0; for (const p of [.9, 1.66, 2.5]) if (t >= p && t < p + .75) puff = (t - p) / .75; person(ZH, t, 540, FEET, ZS, {g: 'grand', mood: t < 1.6 ? 'smug' : 'proud', sing: 1, hold: {1: (hx, hy, S) => gripObject(() => perfumeBottle(hx, hy + 52 * S, S * 1.05, puff), {x: hx, y: hy, rot: 0, S, skin: ZH.pal.skin, nail: NAIL, w: 48 * S})}}); vanity(); }
  if (k === 1) { apartment(); person(ZH, t, 540, FEET, ZS, {g: 'bottleUp', mood: t < a + 1.2 ? 'proud' : 'smugside', sing: 1, hold: {1: (hx, hy, S) => gripObject(() => perfumeBottle(hx, hy + 52 * S, S * 1.05, 0, P01(t, a + .5, 1.2)), {x: hx, y: hy, rot: 0, S, skin: ZH.pal.skin, nail: NAIL, w: 48 * S})}}); vanity(); }
  if (k === 2) { hallway(); const up = Math.sin((t - a) * 1.4); person(NB, t, 820, FEET, ZS, {g: 'bagHold', mood: 'proud', look: -.5, tilt: -.03, hold: {1: (hx, hy, S) => gripObject(() => bag(hx + 10 * S, hy + 160 * S, S * .9), {x: hx, y: hy, rot: 0, S, skin: NB.pal.skin, nail: '#9a2a6a', w: 22 * S, fist: true})}});
    person(ZH, t, 300, FEET, ZS, {g: 'judge', mood: (t - a) % 2 < 1 ? 'disgusted' : 'eyeroll', look: .7 + .3 * up, sing: 1, hand: () => 'fist'});
    for (let k2 = 0; k2 < 4; k2++) { const yy = lerp(700, 1700, ((t - a) * .45 + k2 * .25) % 1); g.save(); g.globalAlpha = .55; ln([[620, yy], [680, yy + 10]], 6, '#d63a8a'); g.restore(); } }   // her gaze scanning the outfit up and down
  if (k === 3) { hallway(); person(NB, t, 740, FEET, ZS, {g: 'bagHold', mood: 'smug', look: -.4, hold: {1: (hx, hy, S) => gripObject(() => bag(hx + 10 * S, hy + 140 * S, S * .75), {x: hx, y: hy, rot: 0, S, skin: NB.pal.skin, nail: '#9a2a6a', w: 22 * S, fist: true})}});
    person(ZH, t, 330, FEET, ZS, {g: 'smirk', mood: t < a + .8 ? 'surprised' : 'smugside', look: .8, sing: 1, hand: sd => sd < 0 ? 'fist' : 'fist'}); }
  if (k === 4) { boardwalk(t); const wp = T.walkPose(t, a - .2, 3.0, [-120, FEET], [1080, FEET], ZS, ZS, 95), dir = wp.walkDir;
    for (let j = 0; j < 12; j++) { const fx = -120 + j * 105, alive = wp.x - fx; if (alive < 60) continue; g.save(); g.globalAlpha = clamp(1 - alive / 1400); ell(fx, FEET + (j % 2 ? 10 : -6), 34, 14, '#ff8ac8', 4); for (let q = 0; q < 2; q++) sparkle(fx + (hash(j + q) - .5) * 60, FEET - 30 - hash(j * 3 + q) * 40, 12, .9, '#fff6c0'); g.restore(); }   // glittery footprints
    person(ZH, t, wp.x, wp.y, wp.s, {g: 'strut', mood: 'proud', sing: 1, walk: wp, lean: wp.lean, shades: true, hand: () => 'fist'}); }
  if (k === 5) { boardwalk(t, false); bench(780, FEET - 40); const copy = P01(t, a + .6, .5);   // grannies copy her pose and sunglasses
    person(GR('#7fb8d8'), t, 680, FEET - 80, ZS * .8, {g: copy > .5 ? 'voila' : 'rest', mood: copy > .5 ? 'proud' : 'surprised', shades: copy > .5, look: -.6, seated: true, hand: () => 'open'});
    person(GR('#c9a0e0'), t, 920, FEET - 80, ZS * .8, {g: copy > .5 ? 'voila' : 'rest', mood: copy > .5 ? 'proud' : 'surprised', shades: copy > .5, look: -.6, seated: true, hand: () => 'open'});
    person(ZH, t, 330, FEET, ZS, {g: 'voila', mood: t < a + 1.4 ? 'proud' : 'smugside', sing: 1, shades: true, hand: sd => sd > 0 ? 'open' : 'fist'}); }
  if (k === 6) { apartment(); const worried = t < 18.6; person(ZH, t, 660, FEET, ZS, {g: worried ? 'worry' : 'shrug', mood: worried ? 'worried' : 'smug', sing: 1, look: worried ? -.7 : 0, hand: () => 'open'}); vanity();
    const bk = ease(P01(t, a + .1, .4)) * (1 - ease(P01(t, 19.4, .4))); if (bk > 0) { g.save(); g.globalAlpha = bk;   // thought bubble: the glam mugshot
      for (const [bx, by, r] of [[440, 940, 20], [380, 890, 30]]) ell(bx, by, r, r, '#ffffff', 6); g.save(); g.translate(110, 790); rr(-215, -190, 430, 330, 100, '#ffffff', 8);
      g.save(); g.beginPath(); g.roundRect(-180, -160, 360, 270, 30); g.clip(); chart(-180, -160, 360, 270); person(ZH, t, 0, 450, .36, {g: 'rest', mood: 'proud', name: 'mugshot'}); g.restore();
      rr(-110, 40, 220, 62, 8, '#1d1b22', 5); fit('BRIGHTON PD', 0, 71, 210, 56, 34, '#ffffff'); g.restore(); g.restore(); } }
  if (k === 7) { sea(t); umbrellaPetro(1210, 2050, .9, t); bigWave(t); flamingo(380, 1640, 1.0, t); person(ZH, t, 380, 1640 - 110 + 560 * ZS * .9 + 8 * Math.sin(t * 2.4), ZS * .9, {g: 'wave', mood: 'proud', sing: 1, seated: true, shades: true, hand: () => 'open'}); }
  g.restore(); }
// ---------- lyrics: karaoke at the top (sung = solid white, upcoming = dim, key word big yellow-orange) ----------
function lyrics(t) { let li = -1; for (let i = 0; i < LINES.length; i++) if (t >= LINES[i][0][1] - .25) li = i; if (li < 0) return; const L = LINES[li], end = LINES[li + 1] ? LINES[li + 1][0][1] - .25 : LEN; if (t >= end) return;
  const al = ease(P01(t, L[0][1] - .25, .2)) * (1 - ease(P01(t, end - .2, .2))); if (al <= 0) return;
  // layout: split into rows; key words on their own row at 120 px, others at 72 px; every row fits 980 px
  const rows = []; let cur = []; for (const w of L) { if (w[3]) { if (cur.length) rows.push({key: 0, ws: cur}); rows.push({key: 1, ws: [w]}); cur = []; } else cur.push(w); } if (cur.length) rows.push({key: 0, ws: cur});
  const merged = []; for (const r of rows) { const last = merged[merged.length - 1]; if (r.key && last && last.key) last.ws.push(...r.ws); else merged.push({...r, ws: [...r.ws]}); }
  let y = 210; g.save(); g.globalAlpha = al; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const r of merged) { let size = r.key ? 124 : 72; const txt = r.ws.map(w => w[0]).join(' '); g.font = `${size}px ${FONT}`; while (g.measureText(txt).width > 980 && size > 30) { size -= 4; g.font = `${size}px ${FONT}`; }
    const sp = g.measureText(' ').width, tw = g.measureText(txt).width; let x = 540 - tw / 2; TEXTBOX.push(['lyrics', x, y - size * .6, tw, size * 1.2]);
    for (const w of r.ws) { const ww = g.measureText(w[0]).width, sung = t >= w[1], k = ease(P01(t, w[1], .12)), pop = r.key ? 1 + .12 * (1 - k) * (sung ? 1 : 0) : 1;
      g.save(); g.translate(x + ww / 2, y); g.scale(pop, pop); g.translate(-(x + ww / 2), -y); g.globalAlpha = al * (sung ? 1 : .32); g.lineWidth = size * .2; g.strokeStyle = '#1a1420'; g.strokeText(w[0], x, y);
      g.fillStyle = r.key ? (sung ? '#ffb22a' : '#ffd88a') : '#ffffff'; g.fillText(w[0], x, y); g.restore(); x += ww + sp; }
    y += size * (r.key ? 1.0 : 1.05); }
  g.restore(); }
function vignette() { const v = g.createRadialGradient(W / 2, H * .5, 420, W / 2, H * .5, 1150); v.addColorStop(0, 'rgba(20,10,25,0)'); v.addColorStop(1, 'rgba(20,10,25,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  const top = g.createLinearGradient(0, 0, 0, 560); top.addColorStop(0, 'rgba(20,10,25,.45)'); top.addColorStop(1, 'rgba(20,10,25,0)'); g.fillStyle = top; g.fillRect(0, 0, W, 560); }   // darker band behind the lyrics
const sceneAt = t => { let k = 0; SCN.forEach((s, i) => { if (t >= s) k = i; }); return k; };
function frame(t) { FACEBOX = []; PROPBOX = []; TEXTBOX = []; g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, W, H);
  const k = sceneAt(t), d = .3, s0 = SCN[k];
  if (k > 0 && t < s0 + d / 2) {   // soft cross-dissolve centred on the line start
    const kk = ease((t - (s0 - d / 2)) / d); for (const [cc, kn] of [[cA, k - 1], [cB, k]]) { const gg = cc.getContext('2d'); g = gg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); scene(kn, t); }
    g = G0; g.drawImage(cA, 0, 0); g.globalAlpha = kk; g.drawImage(cB, 0, 0); g.globalAlpha = 1; }
  else if (k < SCN.length - 1 && t >= SCN[k + 1] - d / 2) { const kk = ease((t - (SCN[k + 1] - d / 2)) / d); for (const [cc, kn] of [[cA, k], [cB, k + 1]]) { const gg = cc.getContext('2d'); g = gg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); scene(kn, t); } g = G0; g.drawImage(cA, 0, 0); g.globalAlpha = kk; g.drawImage(cB, 0, 0); g.globalAlpha = 1; }
  else scene(k, t);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); vignette(); if (!process.env.NOCAP) lyrics(t); }

// ---------- modes ----------
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st3', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st3/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, LEN) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'accaudit') { const hit = (a, b) => a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[2] < b[2] + b[4] && b[2] < a[2] + a[4]; const bad = {};
  for (let t = 0; t < LEN; t += 1 / 15) { frame(t); for (const f of FACEBOX) { if (f[0] === 'mugshot') continue; for (const p of TEXTBOX) if (hit([0, p[1], p[2], p[3], p[4]], f)) (bad['lyrics over ' + f[0] + ' (scene ' + (sceneAt(t) + 1) + ')'] = bad['lyrics over ' + f[0] + ' (scene ' + (sceneAt(t) + 1) + ')'] || []).push(+t.toFixed(2)); } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v[0], '…', v[v.length - 1]); if (!Object.keys(bad).length) console.log('accaudit: 0 (lyrics never on a face)'); }
else if (mode === 'textaudit') { const over = new Set(); let n = 0; for (let t = 0; t < LEN; t += .25) { TEXTLOG.length = 0; frame(t); for (const [s, sz] of TEXTLOG) { n++; if (sz <= 6.01) over.add(s); } } console.log('text draws', n, 'overflowing', over.size, [...over]); }
else if (mode === 'storyboard') { (async () => {
  const R = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/franse_ref/';
  const ROWS = [  // [our time, label, reference frame, what it borrows]
    [1.9, '1 «ле ПАРФЮМ»: Жанна брызгает духами, облако блёсток', 'f1.png', 'персонаж в своей сцене + слова сверху'],
    [4.6, '2 «ГОТЬЕ»: переворачивает ценник $3.99 · Brighton Beach', 'f4.png', 'ключевое слово крупно, жёлто-оранжевым'],
    [7.2, '3 «Д**ЬМО»: Жанна оценивает соседку с ног до головы', 'g16.6.png', 'два персонажа в кадре, эмоции вместо слов'],
    [10.2, '4 «ШАНЕЛЬ»: сумка-подделка «COCO SHANEL», Жанна ухмыляется', 'f12.png', 'предмет сцены рассказывает шутку'],
    [12.9, '5 «СЛЕД»: походка по набережной, блестящие следы', 'g7.5.png', 'персонаж идёт по сцене (походка)'],
    [15.6, '6 «КАК Я»: бабушки на лавке копируют позу и очки', 'g12.6.png', 'вторые персонажи повторяют действие'],
    [18.0, '7 «ТЮРЬМЕ»: облако-мысль с гламурным фото из полиции', 'g19.6.png', 'картинка-в-картинке (фото рвётся / мысль)'],
    [21.4, '8 «ВОЛНЕ»: Жанна на фламинго на волне, Петрович под зонтом', 'f31.png', 'мягкая смена сцены + наезд камеры'],
    [3.28, 'переход 1–2: наплыв 0,3 с', 'g9.6.png', 'наплыв (cross-dissolve) между строками']];
  const tw = 300, th = 533, pad = 24, cols = 2, rowH = th + 130, out = createCanvas(pad + cols * (2 * tw + 3 * pad), 200 + Math.ceil(ROWS.length / cols) * rowH + 520), og = out.getContext('2d');
  og.fillStyle = '#fbf3f8'; og.fillRect(0, 0, out.width, out.height); og.textBaseline = 'top';
  const wrapTxt = (str, x, y, maxW, size, col, lh = 1.25) => { og.font = `${size}px ${FONT}`; og.fillStyle = col; let line = '', yy = y; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (og.measureText(tst).width > maxW && line) { og.fillText(line, x, yy); yy += size * lh; line = w; } else line = tst; } if (line) og.fillText(line, x, yy); return yy + size * lh; };
  const ty = wrapTxt('«Франсе» v3 — раскадровка в стиле референса (песня-иллюстрация)', pad, 20, out.width - 2 * pad, 40, INK); wrapTxt('Слева — наш кадр (движок, размер телефона). Справа, в розовой рамке — кадр референса, откуда взят приём.', pad, ty, out.width - 2 * pad, 22, '#6a5a6a');
  for (let i = 0; i < ROWS.length; i++) { const [t, lab, ref, why] = ROWS[i], cx = pad + (i % cols) * (2 * tw + 3 * pad), cy = 180 + Math.floor(i / cols) * rowH;
    frame(t); og.drawImage(cv, cx, cy, tw, th); og.strokeStyle = '#ffffff'; og.lineWidth = 6; og.strokeRect(cx, cy, tw, th);
    try { const im = await loadImage(R + ref); og.drawImage(im, cx + tw + pad, cy, tw, th); } catch (e) {} og.strokeStyle = '#ff5aa0'; og.lineWidth = 6; og.strokeRect(cx + tw + pad, cy, tw, th);
    const yy = wrapTxt(`${t.toFixed(1)} с · ${lab}`, cx, cy + th + 10, 2 * tw + pad, 22, INK); wrapTxt('реф: ' + why, cx, yy + 2, 2 * tw + pad, 20, '#c0286a'); }
  let ny = 180 + Math.ceil(ROWS.length / cols) * rowH + 10;
  ['Что изменилось по сравнению с v2:', '• Одна иллюстрированная сцена на каждую строчку песни (8 сцен), мягкий наплыв 0,3 с на начале строки, медленный наезд/дрейф, тёмная виньетка.',
   '• Слова песни — сверху, как в референсе: спетые слова белые и непрозрачные, следующие — бледные; ключевое слово строки крупно жёлто-оранжевым.',
   '  (Бледные будущие слова — часть стиля референса; спетые слова всегда непрозрачные.) Мат закрыт звёздочками: «Д**ЬМО».',
   '• Субтитры перевода, плашки, диалог и концовка с Кейли/Петровичем убраны — видео заканчивается на ~22,5 с вместе с отрывком.',
   '• Жанна поёт (лёгкий липсинк) и играет эмоциями; соседка в «дизайнерском» наряде, сумка «COCO SHANEL» (подделка, без настоящего логотипа).',
   '• Шаг на набережной — новая походка (стопа стоит, колено сгибается), бабушки копируют позу и очки, облако-мысль «BRIGHTON PD», фламинго на волне.',
   '• Песни в файле нет: звук ставишь в TikTok с 0:56.0 трека.'].forEach((s, i) => { ny = wrapTxt(s, pad, ny, out.width - 2 * pad, i ? 22 : 28, INK) + 4; });
  fs.writeFileSync('storyboard_v3.png', out.toBuffer('image/png')); console.log('storyboard_v3.png'); })(); }
