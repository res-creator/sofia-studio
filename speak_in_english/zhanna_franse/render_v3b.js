// «Франсе» v3b (render_v3b.js) — subtitles copied 1:1 from the owner's reference, bag punch-in on «Шанель», dynamic editing (punch-ins, whip pans,
// zoom-through, torn-photo split, PiP pop, particles, beat shakes). Based on v3: «illustrated lyrics» (owner's reference): one literal illustrated scene per sung line, soft 0.3 s cross-dissolves on the
// line starts, slow drift / push-in, dark vignette, karaoke lyric typography at the TOP (sung words solid white, upcoming words dim,
// the key word of each line big yellow-orange). Zhanna acts and lip-syncs lightly. No dialogue. t=0 = song 56.0 s. No song audio in the file.
// node render_v3.js still 1,5 | storyboard | clip 0:20 out/v3_0.mp4 | accaudit | textaudit | armaudit   (NOCAP=1 hides the lyrics)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts, loadImage} = require('@napi-rs/canvas'), T = require('./toon_v3');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['montserrat-latin-900-normal', 'MBL'], ['montserrat-cyrillic-900-normal', 'MBC'], ['montserrat-latin-900-italic', 'MIL'], ['montserrat-cyrillic-900-italic', 'MIC']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const LYR = 'MBL, MBC', LYRI = 'MIL, MIC';   // lyric font: Montserrat Black (OFL), the closest free Cyrillic match to the reference
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC';
const TL = require('./timeline_v3.json'), LINES = TL.LINES, LEN = TL.LEN;
const BEAT = [0.72, 1.29, 1.77, 2.35, 2.78, 3.23, 3.67, 4.08, 4.58, 5.11, 5.64, 6.17, 6.67, 7.15, 7.72, 8.25, 8.77, 9.25, 9.69, 10.22, 10.76, 11.25, 11.74, 12.27, 12.68, 13.14, 13.63, 14.09, 14.53, 15.06, 15.59, 16.12, 16.63, 17.16, 17.65, 18.22, 18.72, 19.19, 19.65, 20.12, 20.63, 21.07, 21.51];   // librosa beat_track on the track from 56.0 s, refined to onset peaks
const FB = b => Math.floor(b * 30 + 1e-6) / 30;   // the hit lands on the beat's frame or 1 frame earlier
const SCN = [0, FB(3.23), FB(5.64), 9.2, FB(11.74), FB(14.53), FB(17.16), FB(20.12)];   // 3 -> 4 is one continuous shot (9.2 only switches the gesture)
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
  bottleUp: s => s > 0 ? [[78, -860], [215, -820], [225, -960]] : HIP(s),   // bottle up beside the face, left hand flips the tag at chest height
  judge: s => s > 0 ? [[78, -860], [175, -760], [95, -700]] : [[-78, -860], [-175, -760], [-95, -700]],        // arms crossed-ish (hands at the waist front)
  smirk: s => s > 0 ? [[78, -860], [190, -770], [112, -655]] : [[-78, -860], [-215, -800], [-190, -930]],   // knuckles on the outer jaw, lips free       // one hand on the hip, the other at the chin
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
// stylish sunglasses (head coordinates): rounded cat-eye lenses a bit wider than the eyes, gold frame, thin bridge, temple arms to the ears,
// dark gradient lens with a white diagonal shine; brows stay visible above. dy = how far up the head they sit (0 = on the eyes, -1 = pushed up into the hair)
function glasses(gg, HY, dy = 0) { const pg = g; g = gg; g.save(); g.translate(0, dy * 205); const ey = HY - 32;
  ln([[-150, ey - 4], [-196, ey + 10]], 7, '#c99a1e'); ln([[150, ey - 4], [196, ey + 10]], 7, '#c99a1e');   // temple arms to the ears
  for (const s of [-1, 1]) { const cx = s * 58; g.beginPath(); g.moveTo(cx - 62, ey - 30); g.quadraticCurveTo(cx - 62 * 0 + s * 10, ey - 52 - (s > 0 ? 0 : 0), cx + 66, ey - 40);   // cat-eye top edge, outer corner lifted
    g.quadraticCurveTo(cx + 74 * 1, ey + 2, cx + 46, ey + 34); g.quadraticCurveTo(cx, ey + 52, cx - 44, ey + 34); g.quadraticCurveTo(cx - 70, ey + 8, cx - 62, ey - 30); g.closePath();
    if (s < 0) { g.save(); g.translate(2 * cx, 0); g.scale(-1, 1); g.translate(0, 0); g.restore(); }
    const gr = g.createLinearGradient(cx, ey - 50, cx, ey + 50); gr.addColorStop(0, '#2a2238'); gr.addColorStop(1, '#5a3a5e'); g.fillStyle = gr; g.fill(); g.strokeStyle = '#c99a1e'; g.lineWidth = 9; g.stroke(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.save(); g.clip(); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 40, ey + 24); g.lineTo(cx + 2, ey - 40); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 18, ey + 30); g.lineTo(cx + 22, ey - 32); g.stroke(); g.restore(); }
  g.beginPath(); g.moveTo(-12, ey - 18); g.quadraticCurveTo(0, ey - 28, 12, ey - 18); g.strokeStyle = '#c99a1e'; g.lineWidth = 7; g.stroke();   // bridge
  g.restore(); g = pg; }
const shades = (gg, HY) => glasses(gg, HY, 0);
// a character: gesture fn, mood, mouth (light lip-sync for Zhanna), optional walk pose / seated / sunglasses / props in the right hand
const envAt = t => { const f = t * FPS, i = Math.floor(f), k = f - i; return (TL.env[i] || 0) * (1 - k) + (TL.env[i + 1] || 0) * k; };
const SONGLINE = {at: 0, end: LEN, env: TL.env};
function person(st0, t, x, y, S, o = {}) { const g1 = GEST[o.g || 'rest'], g0 = o.gb ? GEST[o.gb[0]] : null, kb = o.gb ? ease(o.gb[1]) : 1, base = g0 && kb < 1 ? s => g1(s).map((p, i) => [lerp(g0(s)[i][0], p[0], kb), lerp(g0(s)[i][1], p[1], kb)]) : g1;
  const fn = T.ik(wig(base, t, 2), 2 + 2 * Math.sin(t * 2.2 + x)); const sing = o.sing ? T.talk(SONGLINE, t + 1 / 30, 3, {attack: .045, release: .07}) : {mouth: 0, nod: 0, round: .5};
  const st = {...st0, hands: {1: 'none', '-1': 'none'}, x, y, s: S, arms: fn, ik: false, front: true, mood: o.mood || 'smug', mouth: o.mouth ?? sing.mouth, round: sing.round, nod: (o.nod || 0) + sing.nod * .6, t,
    blink: ((t + x * .01) % 3.4) < .12 && !o.shades, tilt: (o.tilt || 0) + .02 * Math.sin(t * 1.1 + x), look: o.look || 0, lean: o.lean || 0, seated: o.seated, hairFx: o.shades ? shades : null, ...(o.walk ? {walk: o.walk.walk, walkDir: o.walk.walkDir} : {})};
  T.draw(g, st); faceReg(o.name || 'face', x, y, S); armOver(fn, x, y, S, st0);
  DIRS = {}; for (const sd of [-1, 1]) { const P3 = fn(sd); DIRS[sd] = Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]); }
  const skip = new Set(o.hold ? Object.keys(o.hold).map(Number) : []);
  if (o.hold) for (const [sd, f] of Object.entries(o.hold)) { const P3 = fn(+sd), hx = x + P3[2][0] * S, hy = y + P3[2][1] * S; f(hx, hy, S); }
  for (const sd of [-1, 1]) { if (skip.has(sd)) continue; const P3 = fn(sd); T.drawHand(g, o.hand ? o.hand(sd) : 'open', x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), S, st0.pal.skin, NAIL, sd, 22); } }

// ---------- props ----------
function perfumeBottle(x, y, s, puff, tag = 0) { g.save(); g.translate(x, y); g.scale(s, s);
  rr(-46, -120, 92, 120, 20, 'rgba(255,214,232,.95)', 6); rr(-38, -110, 76, 100, 14, '#ffb8d4', 0); rr(-16, -150, 32, 34, 6, '#f2c820', 6); rr(-26, -170, 52, 24, 8, '#f2c820', 6);
  rr(-36, -86, 72, 50, 8, '#fffaf0', 4); fit('LE PARFUM', 0, -61, 72, 50, 18, '#b02a70', {pad: 4, lines: 2});
  if (tag > 0) { ln([[30, -140], [110, -20 - 20 * Math.sin(tag * 3)]], 3); g.save(); g.translate(110, -20 - 20 * Math.sin(tag * 3)); g.rotate(-.25 + .2 * Math.sin(tag * 6)); const fl = Math.cos(Math.PI * (1 - clamp(tag * 2))); g.scale(Math.abs(fl), 1);   // the tag flips round: back side blank while it turns, text only on the front
    rr(-40, 0, 200, 130, 14, '#fff3a8', 6); ell(-20, 20, 8, 8, '#ffffff', 4); if (fl > 0) { fit('$3.99', 60, 46, 170, 64, 56, '#c0283a'); fit('Brighton Beach', 60, 100, 170, 36, 26, INK); } g.restore(); }
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

// ---------- shots: camera keyframes per scene (t, z, x, y, ease) — the framing changes every ~1.2–2.5 s on the beats; no static shot ----------
const ZS = .86, B = [0.71, 1.5, 2.21, 2.93, 3.65, 4.37, 5.0, 5.64, 6.32, 7.0, 7.66, 8.34, 9.0, 9.66, 10.32, 11.03, 11.73, 12.36, 13.13, 13.83, 14.52, 15.19, 15.88, 16.61, 17.31, 18.02, 18.7, 19.41, 20.11, 20.81, 21.49];
// k: 'm' = smooth move, 'p' = punch-in (0.16 s, expo), 'c' = cut (instant)
const CAMK = [
  [[0, 1.12, 560, 1110], [FB(1.29), 1.3, 580, 1080, 'm'], [FB(1.77), 1.72, 640, 1010, 'p'], [SCN[1], 1.85, 650, 1000, 'm']],
  [[SCN[1], 1.3, 600, 1070], [FB(4.58), 2.2, 760, 1060, 'p'], [SCN[2], 2.35, 770, 1050, 'm']],
  [[SCN[2], 1.0, 640, 760], [FB(6.67), 1.0, 640, 1260, 'm'], [FB(7.15), 1.75, 330, 1000, 'c'], [FB(8.25), 1.05, 560, 1100, 'p'], [9.2, 1.12, 590, 1100, 'm']],
  [[9.2, 1.12, 590, 1100], [FB(9.69) - .16, 1.2, 600, 1100, 'm'], [FB(9.69), 3.1, 0, 0, 'c'], [SCN[4], 3.3, 0, 0, 'm']],
  [[SCN[4], .95, 300, 1130], [FB(13.63) - .16, .95, 900, 1130, 'm'], [FB(13.63), 1.6, 0, 0, 'p'], [SCN[5], 1.7, 0, 0, 'm']],
  [[SCN[5], 1.25, 360, 1060], [FB(15.06), .9, 600, 1130, 'p'], [FB(16.12), 1.7, 820, 1030, 'p'], [SCN[6], 1.8, 820, 1020, 'm']],
  [[SCN[6], 1.05, 460, 1100], [FB(18.72), 1.0, 540, 960, 'c'], [SCN[7], 1.12, 540, 960, 'm']],
  [[SCN[7], .62, 560, 1160], [FB(21.07), .78, 480, 1180, 'p'], [22.5, .84, 470, 1190, 'm']]];
const MUG = FB(18.72);   // police flash + full-screen mugshot on the beat inside «тюрьме»
const TRANS = ['whip', 'zoom', 'none', 'whip', 'tear', 'pip', 'rise'];   // 3 -> 4 is one continuous hallway shot   // transition INTO scene k+1 (from scene k)
let BAGPOS = [0, 0], FOOTPOS = [0, 0];
function camOf(k, t) { if (k === 4 && t < FB(13.63) - .16) { const wp = T.walkPose(t, SCN[4] - .15, 2.6, [-120, FEET], [980, FEET], ZS, ZS, 95); return {z: .95, x: clamp(wp.x + 60, 300, 900), y: 1130}; } const K = CAMK[k]; let i = 0; while (i < K.length - 1 && t >= K[i + 1][0]) i++; const a = K[i], b = K[i + 1];
  const pos = q => q[2] === 0 && q[3] === 0 ? (k === 3 ? BAGPOS : FOOTPOS) : [q[2], q[3]];
  if (!b) { const pa = pos(a); return {z: a[1], x: pa[0], y: pa[1]}; }
  const d = b[0] - a[0], kind = b[4] || 'm', u = kind === 'c' ? 0 : kind === 'p' ? clamp((t - a[0]) / Math.min(.16, d)) : clamp((t - a[0]) / d);
  const e = kind === 'p' ? 1 - Math.pow(2, -10 * u) : eio(u); const pa = pos(a), pb = pos(b);
  if (kind === 'p' || kind === 'c') { const last = K[i - 1]; }
  // a punch/cut target is reached at its keyframe time: interpolate from the previous key to this one only during the last 0.16 s
  if (kind === 'p') { const t0 = b[0] - .16, uu = clamp((t - t0) / .16), ee = 1 - Math.pow(2, -10 * uu); return {z: lerp(a[1], b[1], ee), x: lerp(pa[0], pb[0], ee), y: lerp(pa[1], pb[1], ee)}; }
  if (kind === 'c') return {z: a[1], x: pa[0], y: pa[1]};
  return {z: lerp(a[1], b[1], e), x: lerp(pa[0], pb[0], e), y: lerp(pa[1], pb[1], e)}; }
// light shake on strong beats inside a scene
const SHAKES = [[FB(1.77), .25], [FB(7.15), .3], [FB(9.69), .22], [FB(13.63), .25], [MUG, .3], [FB(21.07), .25]];
const shakeAt = t => { let s = [0, 0]; for (const [a, d] of SHAKES) if (t >= a && t < a + d) { const k = 1 - (t - a) / d; s = [Math.sin(t * 90) * 10 * k, Math.cos(t * 77) * 7 * k]; } return s; };
// overlays: glitter, flying price tags («money rain»), splash drops, camera flash
function particles(k, t) { const a = SCN[k];
  if (k === 0 || k === 4) for (let i = 0; i < 26; i++) { const u = (t * .25 + hash(i)) % 1, x = hash(i + 50) * 1080 + Math.sin(t * 2 + i) * 30, y = -40 + u * 2000; sparkle(x, y, 8 + 10 * hash(i + 9), .5 + .5 * Math.sin(t * 6 + i), i % 3 ? '#fff6c0' : '#ffb8e0'); }
  if (k === 1 && t > FB(4.58)) for (let i = 0; i < 9; i++) { const u = clamp((t - FB(4.58) - i * .09) / 1.2); if (u <= 0 || u >= 1) continue; const x = 1200 - u * 1500 + hash(i) * 200, y = 600 + hash(i + 3) * 900 + Math.sin(u * 7 + i) * 60;   // price tags fly across
    g.save(); g.translate(x, y); g.rotate(Math.sin(u * 5 + i) * .5); rr(-70, -40, 140, 80, 12, '#fff3a8', 5); fit('$3.99', 0, 0, 120, 60, 40, '#c0283a'); g.restore(); }
  if (k === 7) for (let i = 0; i < 20; i++) { const u = (t * .6 + hash(i)) % 1, x = hash(i + 20) * 1080, y = 1900 - u * 900 - Math.sin(u * 3.14) * 200; ell(x, y, 10, 14, 'rgba(200,235,255,.85)', 3, '#5aa8d8'); }
  if (k === 6 && t >= MUG && t < 18.6) { g.fillStyle = `rgba(255,255,255,${1 - (t - MUG) / .25})`; g.fillRect(0, 0, W, H); } }   // police camera flash
function mugshot(t) { g.fillStyle = '#20202a'; g.fillRect(0, 0, W, H); chart(120, 380, 840, 1200); const u = t - MUG;
  person(ZH, t, 540, 2150, 1.05, {g: u > .9 ? 'shrug' : 'rest', mood: u < .9 ? 'proud' : 'smug', sing: 1, name: 'mugshot-z'});
  rr(270, 1360, 540, 170, 12, '#1d1b22', 7); fit('BRIGHTON PD', 540, 1420, 500, 70, 64, '#ffffff'); fit('№ 0056', 540, 1490, 500, 44, 40, '#ffd23f'); }
function scene(k, t, camOverride) { const a = SCN[k]; let c = camOverride || camOf(k, t); const sh = shakeAt(t);
  if (k === 6 && t >= MUG) { g.save(); const z = 1 + .05 * clamp((t - MUG) / 2); g.translate(540 + sh[0], 960 + sh[1]); g.scale(z, z); g.translate(-540, -960); mugshot(t); g.restore(); particles(k, t); return; }
  g.save(); g.translate(540 + sh[0], 960 + sh[1]); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  if (k === 0) { apartment(); let puff = 0; for (const p of [.72, 1.77, 2.78].map(FB)) if (t >= p && t < p + .7) puff = (t - p) / .7; person(ZH, t, 540, FEET, ZS, {g: t >= FB(1.77) - .1 && t < FB(2.35) || t >= FB(2.78) - .1 ? 'spray' : 'grand', mood: t < 1.6 ? 'smug' : 'proud', sing: 1, hold: {1: (hx, hy, S) => gripObject(() => perfumeBottle(hx, hy + 52 * S, S * 1.05, puff), {x: hx, y: hy, rot: 0, S, skin: ZH.pal.skin, nail: NAIL, w: 48 * S})}}); vanity(); }
  if (k === 1) { apartment(); person(ZH, t, 540, FEET, ZS, {g: 'bottleUp', mood: t < FB(4.58) ? 'proud' : 'smugside', sing: 1, hold: {1: (hx, hy, S) => gripObject(() => perfumeBottle(hx, hy + 52 * S, S * 1.05, 0, P01(t, FB(3.67), 1.0)), {x: hx, y: hy, rot: 0, S, skin: ZH.pal.skin, nail: NAIL, w: 48 * S})}}); vanity(); }
  if (k === 2 || k === 3) { hallway(); const nbG = 'bagHold';
    person(NB, t, 760, FEET, ZS, {g: nbG, mood: k === 2 ? 'proud' : 'smug', look: -.5, tilt: -.03, name: 'neighbour', hold: {1: (hx, hy, S) => { const bx = hx + 10 * S, by = hy + 140 * S; if (k === 3) BAGPOS = [bx, by - 40 * S]; gripObject(() => bag(bx, by, S * .78), {x: hx, y: hy, rot: 0, S, skin: NB.pal.skin, nail: '#9a2a6a', w: 22 * S, fist: true}); }}});
    person(ZH, t, 310, FEET, ZS, {g: t < 9.2 ? 'judge' : 'smirk', gb: t >= 9.2 ? ['judge', P01(t, 9.2, .35)] : null, mood: t < FB(7.15) ? 'eyeroll' : t < 9.2 ? 'disgusted' : t < FB(9.69) ? 'surprised' : 'smugside', look: .8, sing: 1, hand: () => 'fist'}); }
  if (k === 4) { boardwalk(t); const wp = T.walkPose(t, a - .15, 2.6, [-120, FEET], [980, FEET], ZS, ZS, 95);
    for (let j = 0; j < 12; j++) { const fx = -120 + j * 95, alive = wp.x - fx; if (alive < 70) continue; if (j === 7) FOOTPOS = [fx, FEET - 120]; g.save(); g.globalAlpha = clamp(1 - alive / 1600); ell(fx, FEET + (j % 2 ? 10 : -6), 34, 14, '#ff8ac8', 4); for (let q = 0; q < 2; q++) sparkle(fx + (hash(j + q) - .5) * 60, FEET - 30 - hash(j * 3 + q) * 40, 12 + (t > FB(13.63) && j === 7 ? 18 * Math.sin((t - FB(13.63)) * 8) : 0), .9, '#fff6c0'); g.restore(); }
    if (!FOOTPOS[0]) FOOTPOS = [545, FEET - 120]; person(ZH, t, wp.x, wp.y, wp.s, {g: 'strut', mood: 'proud', sing: 1, walk: wp, lean: wp.lean, shades: true, hand: () => 'fist'}); }
  if (k === 5) { boardwalk(t, false); bench(780, FEET - 40); const copy = t >= FB(15.59);   // grannies switch to her pose on the beat
    for (const [gx, col] of [[680, '#7fb8d8'], [920, '#c9a0e0']]) person(GR(col), t, gx, FEET - 80, ZS * .8, {g: copy ? 'voila' : 'rest', mood: copy ? 'proud' : 'surprised', shades: copy, look: -.6, seated: true, hand: () => 'open', name: 'granny'});
    if (copy && t < 16.6) for (const gx of [680, 920]) sparkle(gx + 40, FEET - 80 - 1090 * ZS * .8, 22 * Math.abs(Math.sin((t - FB(15.59)) * 6)), 1, '#ffffff');
    person(ZH, t, 330, FEET, ZS, {g: 'voila', mood: t < 15.6 ? 'proud' : 'smugside', sing: 1, shades: true, hand: sd => sd > 0 ? 'open' : 'fist'}); }
  if (k === 6) { apartment(); person(ZH, t, 700, FEET, ZS, {g: 'worry', mood: 'worried', sing: 1, look: -.7, hand: () => 'open'}); vanity(); }
  if (k === 7) { sea(t); umbrellaPetro(1210, 2050, .9, t); bigWave(t); flamingo(380, 1640, 1.0, t); person(ZH, t, 380, 1640 - 110 + 560 * ZS * .9 + 8 * Math.sin(t * 2.4), ZS * .9, {g: 'wave', mood: 'proud', sing: 1, seated: true, shades: true, hand: () => 'open'}); }
  g.restore();
  if (k === 6 && t < MUG) { const pk = P01(t, FB(17.65) - .25, .25), sp = pk < 1 ? 1 - Math.pow(1 - pk, 3) * Math.cos(pk * 6) : 1; if (pk > 0) {   // PiP pop: thought bubble with the mugshot
    g.save(); g.translate(300, 820); g.scale(sp, sp); for (const [bx, by, r] of [[200, 210, 16], [150, 160, 24]]) ell(bx, by, r, r, '#ffffff', 6); rr(-230, -190, 460, 340, 90, '#ffffff', 8);
    g.save(); g.beginPath(); g.roundRect(-195, -160, 390, 280, 30); g.clip(); chart(-195, -160, 390, 280); person(ZH, t, 0, 470, .4, {g: 'rest', mood: 'proud', name: 'mugshot'}); g.restore(); rr(-120, 50, 240, 62, 8, '#1d1b22', 5); fit('BRIGHTON PD', 0, 81, 230, 56, 34, '#ffffff'); g.restore(); } }
  particles(k, t); }

// ---------- lyrics: the reference system 1:1 ----------
// small words: white Montserrat Black, uppercase, soft dark drop shadow (no hard outline); upcoming words dim (~35%) and ~18% smaller;
// each word pops to full size/opacity when sung (0.12 s ease-out); the key word: big yellow-orange with a warm glow, per-line style
// (wobbly letters / glow / italic), lands with a bloom; the whole line fades out (0.2 s, slight shrink) as the next line arrives.
const HIDE = new Set(['(?)']); const SHOWLINE = LINES.map((L, i) => L.filter((w, j) => !HIDE.has(w[0]) && !(i === 4 && j === 0)));   // only confident words: line 5 drops its first word, line 6 its last
const KSTYLE = ['wobble', 'glow', 'italic', 'italic', 'wobble', 'glow', 'italic', 'wobble'];
function shadowText(str, x, y, font, col, al, glow) { g.save(); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = al;
  if (glow) { g.shadowColor = `rgba(255,160,30,${.85 * glow})`; g.shadowBlur = 34 * glow; g.fillStyle = col; g.fillText(str, x, y); }
  g.shadowColor = 'rgba(10,5,15,.75)'; g.shadowBlur = 16; g.shadowOffsetY = 5; g.fillStyle = col; g.fillText(str, x, y); g.restore(); }
function lyrics(t) { let li = -1; for (let i = 0; i < LINES.length; i++) if (t >= LINES[i][0][1] - .3) li = i; if (li < 0) return;
  const L = SHOWLINE[li], end = LINES[li + 1] ? LINES[li + 1][0][1] - .3 : LEN - .25; const tin = P01(t, LINES[li][0][1] - .3, .18), tout = P01(t, end - .2, .2); if (tout >= 1) return;
  const al = ease(tin) * (1 - ease(tout)), shrink = 1 - .06 * ease(tout);
  const rows = []; let cur = []; for (const w of L) { if (w[3]) { if (cur.length) rows.push({key: 0, ws: cur}); rows.push({key: 1, ws: [w]}); cur = []; } else cur.push(w); } if (cur.length) rows.push({key: 0, ws: cur});
  const mg = []; for (const r of rows) { const last = mg[mg.length - 1]; if (r.key && last && last.key) last.ws.push(...r.ws); else mg.push({...r, ws: [...r.ws]}); }
  const SZ = mg.map(r => r.key ? 150 : 76); let y = 230 + SZ[0] * .5; g.save(); g.translate(540, 300); g.scale(shrink, shrink); g.translate(-540, -300);
  mg.forEach((r, ri) => { const st = KSTYLE[li], up = s => s.toUpperCase(); let size = r.key ? 150 : 76; const fnt = s => `${s}px ${r.key && st === 'italic' ? LYRI : LYR}`;
    const txt = up(r.ws.map(w => w[0]).join(' ')); g.font = fnt(size); while (g.measureText(txt).width > 960 && size > 30) { size -= 4; g.font = fnt(size); }
    const sp = g.measureText(' ').width; let widths = r.ws.map(w => g.measureText(up(w[0])).width), tw = widths.reduce((a, b) => a + b, 0) + sp * (r.ws.length - 1), x = 540 - tw / 2;
    TEXTBOX.push(['lyrics', x, y - size * .6, tw, size * 1.2]);
    r.ws.forEach((w, i) => { const ww = widths[i], cx = x + ww / 2, sung = t >= w[1], k = ease(P01(t, w[1], .12)), sc = .82 + .18 * k + (r.key ? .14 * Math.sin(Math.PI * clamp((t - w[1]) / .25)) : 0), a2 = al * (.35 + .65 * k);
      g.save(); g.translate(cx, y); g.scale(sc, sc);
      if (r.key) { const glow = st === 'glow' ? .6 + .4 * k + .5 * Math.sin(Math.PI * clamp((t - w[1]) / .4)) : .35 * k + .6 * Math.sin(Math.PI * clamp((t - w[1]) / .3)), col = '#f8b531';
        if (st === 'wobble') { const ch = [...up(w[0])], cw = ch.map(c => g.measureText(c).width), tot = cw.reduce((a, b) => a + b, 0); let xx = -tot / 2; ch.forEach((c, j) => { g.save(); g.translate(xx + cw[j] / 2, 6 * Math.sin(t * 7 + j * 1.3) * k); g.rotate((j % 2 ? 1 : -1) * .07 * (1 - .4 * k) + .03 * Math.sin(t * 5 + j)); shadowText(c, 0, 0, fnt(size), col, a2, Math.max(0, glow)); g.restore(); xx += cw[j]; }); }
        else shadowText(up(w[0]), 0, 0, fnt(size), col, a2, Math.max(0, glow)); }
      else shadowText(up(w[0]), 0, 0, fnt(size), '#ffffff', a2, 0);
      g.restore(); x += ww + sp; });
    if (ri < mg.length - 1) y += SZ[ri] * .5 + SZ[ri + 1] * .5 + (r.key || mg[ri + 1].key ? 4 : 10); });
  g.restore(); }
function vignette() { const v = g.createRadialGradient(W / 2, H * .5, 420, W / 2, H * .5, 1150); v.addColorStop(0, 'rgba(20,10,25,0)'); v.addColorStop(1, 'rgba(20,10,25,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  const top = g.createLinearGradient(0, 0, 0, 620); top.addColorStop(0, 'rgba(20,10,25,.42)'); top.addColorStop(1, 'rgba(20,10,25,0)'); g.fillStyle = top; g.fillRect(0, 0, W, 620); }
const sceneAt = t => { let k = 0; SCN.forEach((s, i) => { if (t >= s - 1e-6) k = i; }); return k; };
function paint(cc, k, t, cam) { const gg = cc.getContext('2d'); g = gg; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, W, H); scene(k, t, cam); g = G0; }
// transitions into scene k (centred on the line start s0, 0.3 s; whip and tear slightly longer)
function transition(kind, k, t, s0) { const d = kind === 'whip' ? .36 : kind === 'tear' ? .4 : .3, u = clamp((t - (s0 - d)) / d), e = eio(u);
  paint(cA, k - 1, t); paint(cB, k, t); g = G0; g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'whip') { const off = e * W; for (let j = 0; j < 6; j++) { const o = (j / 5 - .5) * 60 * Math.sin(Math.PI * u); g.globalAlpha = 1 / (j + 1); g.drawImage(cA, -off + o, 0); g.drawImage(cB, W - off + o, 0); } g.globalAlpha = 1; }
  else if (kind === 'zoom') { g.save(); g.globalAlpha = 1 - e; g.translate(540, 960); g.scale(1 + .6 * e, 1 + .6 * e); g.drawImage(cA, -540, -960); g.restore(); g.save(); g.globalAlpha = e; g.translate(540, 960); g.scale(1.25 - .25 * e, 1.25 - .25 * e); g.drawImage(cB, -540, -960); g.restore(); g.globalAlpha = 1; }
  else if (kind === 'slide') { g.drawImage(cA, -80 * e, 0); g.globalAlpha = e; g.drawImage(cB, 80 * (1 - e), 0); g.globalAlpha = 1; }
  else if (kind === 'tear') { g.drawImage(cB, 0, 0); const sp = e * 700, jag = []; for (let i = 0; i <= 24; i++) jag.push([540 + (i % 2 ? 26 : -26) + (i - 12) * 6, i * 80]);   // torn-photo split: the old frame rips down the middle and both halves fly apart
    for (const side of [-1, 1]) { g.save(); g.translate(side * sp, 0); g.rotate(side * .08 * e); g.beginPath(); g.moveTo(side < 0 ? 0 : W, 0); jag.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(side < 0 ? 0 : W, H); g.closePath(); g.clip(); g.drawImage(cA, 0, 0);
      g.beginPath(); jag.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = '#f6f0e6'; g.lineWidth = 16; g.stroke(); g.restore(); } }
  else if (kind === 'pip') { g.drawImage(cA, 0, 0); const sp = e; g.save(); g.translate(540, 960); g.scale(.3 + .7 * sp, .3 + .7 * sp); g.rotate(-.06 * (1 - sp)); rr(-552, -972, 1104, 1944, 30, '#ffffff', 0); g.drawImage(cB, -540, -960); g.restore(); }   // picture-in-picture pops and fills the frame
  else if (kind === 'rise') { g.drawImage(cA, 0, -200 * e); g.globalAlpha = e; g.drawImage(cB, 0, 200 * (1 - e)); g.globalAlpha = 1; } }
function frame(t) { FACEBOX = []; PROPBOX = []; TEXTBOX = []; g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, W, H);
  const k = sceneAt(t); let done = false;
  for (const kk of [k, k + 1]) { if (kk < 1 || kk >= SCN.length) continue; const s0 = SCN[kk], kind = TRANS[kk - 1], d = kind === 'whip' ? .36 : kind === 'tear' ? .4 : .3; if (kind !== 'none' && t >= s0 - d && t < s0) { transition(kind, kk, t, s0); done = true; break; } }
  if (!done && k === 3 && t >= FB(9.69) - .16 && t < FB(9.69)) { const u = ease((t - (FB(9.69) - .16)) / .16), c0 = camOf(3, FB(9.69) - .16), c1 = camOf(3, FB(9.69) + .01); paint(cA, 3, t, {z: c0.z * (1 + .15 * u), x: c0.x, y: c0.y + 60 * u}); paint(cB, 3, t, {z: c1.z * (1.25 - .25 * u), x: c1.x, y: c1.y}); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cA, 0, 0); g.globalAlpha = u; g.drawImage(cB, 0, 0); g.globalAlpha = 1; done = true; }
  if (!done && k === 4 && t >= FB(13.63) - .16 && t < FB(13.63)) { const u = ease((t - (FB(13.63) - .16)) / .16), c0 = camOf(4, FB(13.63) - .17), c1 = camOf(4, FB(13.63) + .01); paint(cA, 4, t, {z: c0.z * (1 + .12 * u), x: c0.x, y: c0.y + 50 * u}); paint(cB, 4, t, {z: c1.z * (1.25 - .25 * u), x: c1.x, y: c1.y}); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cA, 0, 0); g.globalAlpha = u; g.drawImage(cB, 0, 0); g.globalAlpha = 1; done = true; }   // footprint punch as a zoom-through (no face sweeps through the lyrics)
  if (!done) scene(k, t);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); vignette(); if (t > LEN - .3) { g.fillStyle = `rgba(0,0,0,${clamp((t - LEN + .3) / .3)})`; g.fillRect(0, 0, W, H); } if (!process.env.NOCAP) lyrics(t); }

// the bag never moves: measure its position once so a chunk/still that starts inside the bag close-up frames it correctly
{ const tc = createCanvas(W, H), keep = g; g = tc.getContext('2d'); scene(3, SCN[3] + .5); g = keep; }
// ---------- modes ----------
const EVENTS = () => { const ev = []; SCN.slice(1).forEach((s, i) => { if (TRANS[i] !== 'none') ev.push([s, 'scene change ' + (i + 1) + ' -> ' + (i + 2) + ' (' + TRANS[i] + ')']); }); CAMK.forEach((K, k) => K.forEach(q => { if (q[4] === 'p') ev.push([q[0], 'punch-in (scene ' + (k + 1) + ')']); if (q[4] === 'c') ev.push([q[0], 'cut / zoom-through (scene ' + (k + 1) + ')']); })); SHAKES.forEach(([a]) => ev.push([a, 'shake'])); [.72, 1.77, 2.78].forEach(p => ev.push([FB(p), 'perfume puff'])); ev.push([FB(3.67), 'price-tag flip']); ev.push([FB(4.58), 'flying price tags']); ev.push([FB(15.59), 'grannies copy + glint']); ev.push([FB(17.65), 'thought bubble pop']); ev.push([MUG, 'police flash']); return ev.sort((a, b) => a[0] - b[0]); };
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'beats') { for (const [t, what] of EVENTS()) { const nb = BEAT.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a), f = Math.round(t * 30), fb = Math.round(nb * 30); console.log(`${t.toFixed(3)} s  frame ${f}  | beat ${nb.toFixed(2)} (frame ${fb})  lead ${fb - f} fr  | ${what}`); } }
if (mode === 'still') { fs.mkdirSync('out/st3b', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st3b/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, LEN) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'accaudit') { const hit = (a, b) => a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[2] < b[2] + b[4] && b[2] < a[2] + a[4]; const bad = {};
  for (let t = 0; t < LEN; t += 1 / 15) { frame(t); for (const f of FACEBOX) { if (f[0] === 'mugshot') continue; for (const p of TEXTBOX) if (hit([0, p[1], p[2], p[3], p[4]], f)) { const key = 'lyrics over ' + f[0] + ' (scene ' + (sceneAt(t) + 1) + ')'; (bad[key] = bad[key] || []).push(+t.toFixed(2)); } } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v[0], '…', v[v.length - 1]); if (!Object.keys(bad).length) console.log('accaudit: 0 (lyrics never on a face)'); }
else if (mode === 'textaudit') { const over = new Set(); let n = 0; for (let t = 0; t < LEN; t += .25) { TEXTLOG.length = 0; frame(t); for (const [s, sz] of TEXTLOG) { n++; if (sz <= 6.01) over.add(s); } } console.log('text draws', n, 'overflowing', over.size, [...over]); }
else if (mode === 'armaudit') { const bad = {}; for (const [nm, f] of Object.entries(GEST)) { const fn = T.ik(f, 2); for (const s of [-1, 1]) { const [Sh, E, Hh] = fn(s); if (Hh[1] < -880 && Hh[0] * s < 40) bad[nm + ' hand crosses s=' + s] = 1; if (E[0] * s < 0) bad[nm + ' elbow crosses s=' + s] = 1; } }
  console.log(Object.keys(bad).length ? Object.keys(bad) : 'armaudit: no crossing (all gestures: a raised hand stays on its own shoulder side)'); }
else if (mode === 'cutaudit') { // hard cuts / scene changes must be >= 1.2 s apart
  const ev = [...new Set([...SCN.slice(1).filter((x, i) => TRANS[i] !== 'none'), MUG, ...[].concat(...CAMK.map(K => K.filter(q => q[4] === 'c').map(q => q[0])))].map(x => +x.toFixed(2)))]; ev.sort((a, b) => a - b); const gaps = ev.map((x, i) => i ? +(x - ev[i - 1]).toFixed(2) : +x.toFixed(2)); console.log('cut times', ev.map(x => +x.toFixed(2)), 'min gap', Math.min(...gaps), gaps); }
else if (mode === 'sheet') { const ts = arg.split(',').map(Number), cols = 6, sw = 270, shh = 480, sc = createCanvas(cols * sw, Math.ceil(ts.length / cols) * shh), sg = sc.getContext('2d');
  ts.forEach((t, i) => { frame(t); sg.drawImage(cv, (i % cols) * sw, Math.floor(i / cols) * shh, sw, shh); sg.fillStyle = '#fff'; sg.font = '24px NBL'; sg.fillText(t.toFixed(2) + 's', (i % cols) * sw + 8, Math.floor(i / cols) * shh + 28); });
  fs.writeFileSync(outName || 'final/contact_sheet_v3.png', sc.toBuffer('image/png')); }
else if (mode === 'cover') { process.env.NOCAP = 1; frame(15.6); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 0);
  g.save(); g.translate(540, 360); shadowText('НА МНЕ', 0, -70, `84px ${LYR}`, '#ffffff', 1, 0); shadowText('ФРАНСЕ', 0, 60, `170px ${LYR}`, '#f8b531', 1, 1); g.restore();
  fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync('final/zhanna_franse.srt', SHOWLINE.map((L, i) => `${i + 1}\n${ts(Math.max(0, LINES[i][0][1] - .2))} --> ${ts(LINES[i + 1] ? LINES[i + 1][0][1] - .3 : LEN - .25)}\n${L.map(w => w[0]).join(' ')}\n`).join('\n')); }
else if (mode === 'storyboard') { (async () => {
  const R = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/franse_ref/', OW = 1500, out = createCanvas(OW, 3900), og = out.getContext('2d'); og.fillStyle = '#fbf3f8'; og.fillRect(0, 0, OW, out.height); og.textBaseline = 'top';
  const wrap = (str, x, y, maxW, size, col, lh = 1.25) => { og.font = `${size}px NBL, NBC`; og.fillStyle = col; let line = '', yy = y; for (const w of str.split(' ')) { const t2 = line ? line + ' ' + w : w; if (og.measureText(t2).width > maxW && line) { og.fillText(line, x, yy); yy += size * lh; line = w; } else line = t2; } if (line) og.fillText(line, x, yy); return yy + size * lh; };
  let y = wrap('«Франсе» v3b — раскадровка перед рендером', 30, 24, OW - 60, 46, INK); y = wrap('Белая рамка — наш кадр (движок). Розовая рамка — кадр референса.', 30, y, OW - 60, 24, '#6a5a6a') + 10;
  // A. subtitles side by side (top 40% of the frame)
  y = wrap('1. Субтитры как в референсе: шрифт Montserrat Black (верхний регистр), белые слова с мягкой тенью без обводки; будущие слова бледные и мельче, на слове — «поп» до полного размера; ключевое слово крупно жёлто-оранжевым со свечением (стили: «пляшущие буквы» / свечение / курсив); строка гаснет и чуть сжимается, когда приходит следующая.', 30, y, OW - 60, 24, INK) + 6;
  const PAIRS = [[0.95, 'sb_0.75.png', 'будущие слова бледные'], [2.0, 'sb_1.45.png', 'спетое слово — белое, полное'], [4.6, 'sb_4.25.png', 'ключевое слово со свечением'], [10.3, 'sb_6.4.png', 'ключевое слово курсивом']];
  const cw = 340, ch = 270; for (let i = 0; i < PAIRS.length; i++) { const [t, ref, why] = PAIRS[i], x = 30 + (i % 2) * (2 * cw + 60), yy = y + Math.floor(i / 2) * (ch + 60);
    frame(t); og.drawImage(cv, 0, 120, 1080, 860, x, yy, cw, ch); og.strokeStyle = '#fff'; og.lineWidth = 5; og.strokeRect(x, yy, cw, ch);
    try { const im = await loadImage(R + ref); og.drawImage(im, 0, 40, 576, 460, x + cw + 15, yy, cw, ch); } catch (e) {} og.strokeStyle = '#ff5aa0'; og.strokeRect(x + cw + 15, yy, cw, ch); wrap(`${t.toFixed(2)} с — ${why}`, x, yy + ch + 6, 2 * cw, 20, '#c0286a'); }
  y += 2 * (ch + 60) + 10;
  // B. bag punch-in
  y = wrap('2. Наезд на сумку на слове «Шанель» (9,94 с): быстрый зум-наплыв 0,16 с в крупный план надписи «COCO SHANEL» (подделка, без логотипа), держим до конца строки.', 30, y, OW - 60, 24, INK) + 6;
  const BT = [9.5, 9.86, 9.9, 10.3, 11.2], bw = 270, bh = 480; for (let i = 0; i < BT.length; i++) { frame(BT[i]); og.drawImage(cv, 30 + i * (bw + 18), y, bw, bh); og.strokeStyle = '#fff'; og.strokeRect(30 + i * (bw + 18), y, bw, bh); wrap(BT[i].toFixed(2) + ' с', 30 + i * (bw + 18), y + bh + 4, bw, 20, INK); }
  y += bh + 50;
  // C. transitions per line
  y = wrap('3. Переходы и приёмы по строкам (кадр сменяется каждые 1,3–2,7 с, на долях; статичных кадров нет):', 30, y, OW - 60, 24, INK) + 6;
  const TR = [[3.28, '1→2 вжух (whip pan)', 'tr_2.3.png'], [5.88, '2→3 зум-наплыв', 'tr_5.6.png'], [11.67, '4→5 вжух', 'tr_9.55.png'], [14.4, '5→6 «рваное фото»', 'tr_19.5.png'], [17.1, '6→7 картинка-в-картинке', 'tr_13.0.png']];
  for (let i = 0; i < TR.length; i++) { const [t, lab, ref] = TR[i], x = 30 + i * (bw + 18); frame(t); og.drawImage(cv, x, y, bw, bh); og.strokeStyle = '#fff'; og.strokeRect(x, y, bw, bh); wrap(lab.replace('→', '–'), x, y + bh + 4, bw, 20, INK);
    try { const im = await loadImage(R + ref); og.drawImage(im, x, y + bh + 60, bw, bh); } catch (e) {} og.strokeStyle = '#ff5aa0'; og.strokeRect(x, y + bh + 60, bw, bh); }
  y += 2 * bh + 110;
  ['Строка 1 «ПАРФЮМ» — медленный наезд, удар-наезд на ключевом слове + лёгкая тряска, блёстки падают, облако духов на каждой доле.',
   'Строка 2 «ГОТЬЕ» — наезд на ценник $3.99 на слове, ценники пролетают через кадр (как деньги в референсе).',
   'Строка 3 «Д**ЬМО» — камера «осматривает» соседку сверху вниз, на ключевом слове — склейка на крупный план Жанны с тряской, потом отъезд.',
   'Строка 4 «ШАНЕЛЬ» — тот же коридор без склейки (Жанна переводит руку к подбородку), на «Шанель» — зум-наплыв на сумку «COCO SHANEL».',
   'Строка 5 «СЛЕД» — камера едет за походкой, на «след» — удар-наезд на блестящие следы, блёстки в воздухе.',
   'Строка 6 «КАК Я» — на сильной доле бабушки копируют позу и надевают очки (блик), удар-наезд на бабушек.',
   'Строка 7 «ТЮРЬМЕ» — облако-мысль выскакивает (PiP), на «тюрьме» — вспышка полицейской камеры и фото во весь экран, Жанна на фото пожимает плечами.',
   'Строка 8 «ВОЛНЕ» — переход «подъём», широкий план с качкой, брызги, наезд на ключевом слове, в конце затемнение.',
   'Слова: показываем только уверенные — в строке 5 убрано первое слово (whisper слышит «Уэйсо/Майсу/Моя»), в строке 6 — последнее («навязать/наверх/навек»).'].forEach(sx => { y = wrap('• ' + sx, 30, y, OW - 60, 22, INK) + 2; });
  const fin = createCanvas(OW, Math.ceil(y + 30)); fin.getContext('2d').drawImage(out, 0, 0); fs.writeFileSync('storyboard_v3b.png', fin.toBuffer('image/png')); console.log('storyboard_v3b.png', OW, Math.ceil(y + 30)); })(); }
