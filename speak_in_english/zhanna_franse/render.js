// «Тётя Жанна — Франсе по-брайтонски»: Zhanna lip-syncs the trend fragment (song 56.2–77.9 s, the owner adds the TikTok sound),
// then a spoken punchline with Kaylee and Petrovich (face never shown). Our toon v4 engine (toon.js from GRWM).
// node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | smoothcheck | armaudit | textaudit | accaudit | sheet   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l])), SONG = TL.SONG_LEN;
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const P01 = (t, a, d) => clamp((t - a) / d), ei = x => x * x * x, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, spr = (x, d = 7, f = 9) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(f * x);
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7, stroke = INK) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
// every label fits inside its object (fitText); textaudit records any label that had to hit the minimum size
const TEXTLOG = [];
function fit(str, x, y, w, h, maxS, col, o = {}) { const s = T.fitText(g, str, {x: x - w / 2, y: y - h / 2, w, h}, {maxSize: maxS, color: col, pad: o.pad ?? 5, lines: o.lines || 1, font: o.font || FONT, minSize: 6}); TEXTLOG.push([str, s]); return s; }
function sparkle(x, y, r, a = 1, col = '#fff6c0') { if (a <= 0) return; g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], col, 3); g.restore(); }
const scr = (x, y) => { const m = g.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
let PROPBOX = [], FACEBOX = [], CAPBOX = [];   // for accaudit (screen space)
const regProp = (name, x, y, w, h) => { const a = scr(x, y), b = scr(x + w, y + h); PROPBOX.push([name, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])]); };

// ---------- cast ----------
const ZH = {outfit: 'sequins', hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}};
const KY = {hair: 'ponytail', lashes: true, earrings: '#f4f4ff', skirt: true, pal: {skin: '#f6d4bc', skinS: '#e6b89c', hair: '#6a3e2a', brow: '#4a2a1a', lip: '#e0607a', top: '#c9b6f2', topS: '#ad98dc', collar: '#c9b6f2', bottom: '#8a7ab8', skirt: '#8a7ab8', legs: '#f6d4bc', shoe: '#ffffff', sole: '#ffffff'}};
const NAIL = '#d63a8a', FEET = 1900, TABLE = 1400;

// ---------- shot list (song time = video time; scene cuts on strong beats, every shot >= 1.2 s) ----------
const SC = Object.fromEntries(TL.SC.map(([k, a]) => [k, a]));
const SH = [   // [start, scene, camera fn]
  [0, 'perfume'], [SC.label, 'label'], [SC.perfume2, 'perfume2'], [SC.croissant, 'croissant'], [SC.beret, 'beret'], [SC.eiffel, 'eiffel'], [SC.kvas, 'kvas'],
  [SONG, 'two'], [BY.z1.at - .15, 'zcu'], [BY.k2.at - .12, 'kcu'], [BY.z2.at - .12, 'zcu2'], [BY.z2.end + .25, 'petro'], [TL.END, 'end']];
const shotAt = t => { let s = SH[0], i = 0; SH.forEach((q, j) => { if (t >= q[0]) { s = q; i = j; } }); return {k: s[1], a: s[0], b: (SH[i + 1] || [TL.TOTAL])[0], i}; };
const ZX = 540, ZX2 = 390, KX = 770;   // Zhanna alone / in the two-shot, Kaylee in the two-shot
function camAt(t, sh) { const u = t - sh.a, d = sh.b - sh.a;
  switch (sh.k) {
    case 'perfume': return {z: lerp(1.28, 1.4, eio(clamp(u / d))), x: ZX + 40, y: 1060};
    case 'perfume2': return {z: 1.7, x: ZX + 50, y: 990};
    case 'croissant': { const pull = eio(P01(t, SC.reveal, .55)); return {z: lerp(2.15, 1.25, pull), x: lerp(ZX + 40, ZX + 40, pull), y: lerp(975, 1080, pull)}; }   // tight on the «croissant», real pull-back on the beat
    case 'beret': return {z: lerp(1.25, 1.36, eio(clamp(u / d))), x: ZX, y: 1000};
    case 'eiffel': { const pull = eio(P01(t, SC.wheel, .65)); return {z: lerp(1.55, .62, pull), x: lerp(ZX - 40, 540, pull), y: lerp(1020, 760, pull)}; }   // tight: lattice behind her looks like the tower; pull-back: a ferris wheel
    case 'kvas': { const push = eio(P01(t, 20.1, .5)); return {z: lerp(1.3, 1.55, push), x: ZX + 60, y: lerp(1060, 1020, push)}; }
    case 'two': return {z: .98, x: 575, y: 1080};
    case 'zcu': return {z: 1.65, x: ZX2 + 30, y: 1000};
    case 'kcu': { const sh2 = t >= BY.k2.at + .25 && t < BY.k2.at + .55 ? 9 * Math.sin(t * 70) * (1 - P01(t, BY.k2.at + .25, .3)) : 0; return {z: 1.7, x: KX - 20 + sh2, y: 1010}; }   // short shake on «isn't»
    case 'zcu2': return {z: lerp(1.6, 1.85, eio(clamp(u / d))), x: ZX2 + 30, y: 990};
    default: return {z: .98, x: 575, y: 1080}; } }

// ---------- lip-sync ----------
const lineFor = (who, t) => { for (const l of L) if (l.who === who && t >= l.at - .05 && t < l.end + .3) return l; return null; };
const speaking = (who, t) => { const l = lineFor(who, t); return !!(l && t >= l.at && t < l.end); };
const roundAt = (l, t) => { if (!l.round) return null; const i = Math.floor((t - l.at) * 30); return T.follow(u => (l.round[Math.floor((u - l.at) * 30)] || 0), t, .06, .08, .25); };
function mouthOf(who, t, seed) { const l = lineFor(who, t); if (!l) return {mouth: 0, nod: 0, round: .5};
  const ts = l.id === 'song' ? T.talk(l, t + 1 / 30, seed, {attack: .045, release: .07}) : T.talk(l, t, seed);   // song: lead by one frame (measured best sync vs the vocal) const r = roundAt(l, t); if (r != null) ts.round = r;
  if (l.id === 'song') ts.nod = 3 * beatBob(t) + ts.nod * .6; return ts; }
const BEATS = TL.BEATS; function beatBob(t) { let b = -1; for (const x of BEATS) if (x <= t) b = x; if (b < 0) return 0; const u = t - b; return u < .25 ? Math.sin(Math.PI * u / .25) : 0; }   // small head bob on each beat
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;

// ---------- Zhanna's gestures (local coords; shoulders at ±78; a raised hand stays on its own side) ----------
const REST = s => [[s * 78, -860], [s * 150, -720], [s * 100, -625]];
const HIP = s => [[s * 78, -860], [s * 190, -770], [s * 112, -655]];
const ZG = {
  rest: REST, hips: HIP,
  perfume: s => s > 0 ? [[78, -860], [235, -850], [262, -1000]] : HIP(s),          // bottle beside the face, not in front of it
  spray: s => s > 0 ? [[78, -860], [228, -840], [250, -975]] : HIP(s),
  pastry: s => s > 0 ? [[78, -860], [240, -800], [268, -905]] : HIP(s),            // «croissant» at chin height beside the face
  bite: s => s > 0 ? [[78, -860], [215, -830], [168, -950]] : HIP(s),              // to the mouth: pastry end at the lips, eyes stay clear
  capup: s => [[s * 78, -860], [s * 250, -1010], [s * 250, -1250]],               // both hands up at the sides of the hair
  pose: s => s > 0 ? [[78, -860], [215, -790], [250, -930]] : HIP(s),
  voila: s => s > 0 ? [[78, -860], [235, -960], [335, -1080]] : HIP(s),
  glass: s => s > 0 ? [[78, -860], [238, -870], [262, -1015]] : HIP(s),
  toast: s => s > 0 ? [[78, -860], [240, -930], [280, -1110]] : HIP(s),
  explain: s => [[s * 78, -860], [s * 170, -760], [s * 175, -835]],
  present: s => s > 0 ? [[78, -860], [215, -800], [235, -940]] : REST(s),
};
const ZHS = {voila: ['open', 'open'], present: ['open', 'open'], explain: ['open', 'open'], capup: ['open', 'open'], hips: ['fist', 'fist'], rest: ['open', 'open']};
const shapeOf = (tab, gname, sd) => (tab[gname] || ['open', 'fist'])[sd > 0 ? 0 : 1];
const SPRAYS = [.7, 2.1, 4.35, 4.95];   // perfume puffs (song beats)
const CAPDROP = [10.83, 11.55];          // shower cap goes on in the gap before «У…»
const BITE = [8.3, 8.95];                // bite in the vocal gap after «…дерьмо»
function zGest(t) {
  if (t < SC.label) return t >= .55 && t < .95 || t >= 1.95 && t < 2.35 ? 'spray' : 'perfume';
  if (t < SC.croissant) return SPRAYS.some(p => t >= p - .15 && t < p + .25) ? 'spray' : 'perfume';
  if (t < SC.beret) return t >= BITE[0] && t < BITE[1] ? 'bite' : 'pastry';
  if (t < SC.eiffel) return t >= CAPDROP[0] - .35 && t < CAPDROP[1] ? 'capup' : 'pose';
  if (t < SC.kvas) return t >= 14.9 ? 'voila' : 'hips';
  if (t < SONG) return t >= 20.15 ? 'toast' : 'glass';
  if (t >= BY.z1.at - .1 && t < BY.z1.end + .1) return t < (BY.z1.at + BY.z1.end) / 2 ? 'present' : 'explain';
  if (t >= BY.z2.at - .1 && t < BY.z2.end + .2) return 'explain';
  return 'hips'; }
const FRONT = new Set(Object.keys(ZG));
function blendArms(fnAt, GT, t, dur = .2) { const a1 = fnAt(t); let prev = a1, k = 1; for (let d = .02; d <= dur; d += .02) { const a = fnAt(t - d); if (a !== a1) { prev = a; k = d / dur; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), cur: a1, prev, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function zMood(t) {
  if (t < SC.label) return 'smug'; if (t < SC.croissant) return t < SC.perfume2 + .5 ? 'proud' : 'smugside';
  if (t < SC.reveal) return 'dreamy'; if (t < SC.beret) return t >= BITE[0] && t < BITE[1] + .2 ? 'smug' : 'proud';
  if (t < SC.eiffel) return t < 12.2 ? 'smug' : 'flirty'; if (t < SC.kvas) return t < SC.wheel ? 'proud' : 'smugside';
  if (t < SONG) return t < 20.1 ? 'smug' : 'proud';
  if (t < BY.z1.at) return 'eyeroll'; if (t < BY.z1.end + .1) return t < (BY.z1.at + BY.z1.end) / 2 ? 'smug' : 'proud';
  if (t < BY.z2.at) return 'smugside'; if (t < BY.z2.end + .2) return 'smug'; if (t < TL.END) return 'smugside'; return 'grin'; }
let DIRS = {};
// gripObject: back of the hand -> object -> front fingertips + thumb (h.w = half-width of the object at the grip)
function gripObject(drawObj, h) { const sd = h.side || 1, W2 = (h.w || 0) / h.S, dir = h.dir ?? DIRS[sd];
  g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S); ell(0, 0, h.fist ? 30 : 34, h.fist ? 32 : 36, h.skin, 5); g.restore();
  if (dir != null) ln([[h.x, h.y], [h.x - Math.cos(dir) * 26 * h.S, h.y - Math.sin(dir) * 26 * h.S]], 28 * h.S, h.skin);
  drawObj();
  g.save(); g.translate(h.x, h.y); g.rotate(h.rot); g.scale(sd * h.S, h.S);
  if (h.fist) { for (const o of [-17, -6, 5, 16]) { rr(-22, o - 6, 44, 12, 6, h.skin, 5); if (h.nail) ell(21, o, 6, 5, h.nail, 3); } g.save(); g.translate(-18, -26); g.rotate(.5); rr(-6, -7, 34, 14, 7, h.skin, 5); g.restore(); }
  else { for (const o of [-18, -6, 6, 18]) { rr(W2 - 16, o - 6, 26, 12, 6, h.skin, 5); if (h.nail) ell(W2 + 9, o, 6, 5, h.nail, 3); } rr(-W2 - 12, -16, 26, 14, 7, h.skin, 5); if (h.nail) ell(-W2 - 9, -9, 5, 4, h.nail, 3); }
  g.restore(); }
function armOver(fn, x, y, S, st) { for (const s of [-1, 1]) { const P3 = fn(s); if (P3[2][1] > -900) continue; g.save(); g.translate(x, y); g.scale(S, S); T.drawArm(g, st, s, P3, null, 'none'); g.restore(); } }
const hpos = (fn, s, x, y, S) => { const P3 = fn(s); return [x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0])]; };

// ---------- props ----------
function perfumeBottle(x, y, s, puff) { g.save(); g.translate(x, y); g.scale(s, s);
  rr(-46, -120, 92, 120, 20, 'rgba(255,214,232,.95)', 6); rr(-38, -110, 76, 100, 14, '#ffb8d4', 0); rr(-16, -150, 32, 34, 6, '#f2c820', 6); rr(-26, -170, 52, 24, 8, '#f2c820', 6);
  rr(-36, -86, 72, 50, 8, '#fffaf0', 4); fit('LE PARFUM', 0, -61, 72, 50, 18, '#b02a70', {pad: 4, lines: 2}); g.restore();
  if (puff > 0) for (let k = 0; k < 7; k++) { const u = puff, a = -2.6 + (hash(k) - .5) * .7, r = 30 + u * 150 * (.6 + hash(k + 3) * .6); g.save(); g.globalAlpha = (1 - u) * .8; ell(x - 10 * s + Math.cos(a) * r * s, y - 160 * s + Math.sin(a) * r * s * .6, (14 + 20 * u) * s, (12 + 16 * u) * s, '#fff0f6', 3, '#e8b8cc'); g.restore(); } }
function pastry(x, y, ang, s, bitten) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.beginPath(); g.moveTo(-95, 0); g.bezierCurveTo(-95, -52, 95, -52, 95, 0); g.bezierCurveTo(95, 40, -95, 40, -95, 0); g.closePath(); g.fillStyle = '#e0a04a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.save(); g.clip(); g.fillStyle = '#c47e2e'; g.fillRect(-100, 12, 200, 40); g.restore();
  for (const sx of [-50, -10, 30, 64]) ln([[sx, -26], [sx + 10, -8]], 4, '#f6c878');
  if (bitten) { g.save(); g.globalCompositeOperation = 'destination-out'; ell(-98, -4, 34, 30, '#000', 0); g.restore(); ell(-90, -2, 24, 20, '#f6f0c0', 0); for (let k = 0; k < 5; k++) ell(-88 + hash(k) * 16, -14 + hash(k + 2) * 26, 6, 4, '#8ac04a', 2); }   // the bite shows the cabbage
  g.restore(); }
function showerCap(HY, drop) { g.save(); g.translate(0, -drop * 260); g.globalAlpha *= clamp(1.4 - drop * 1.4);
  g.beginPath(); g.moveTo(-262, HY - 150); g.bezierCurveTo(-270, HY - 360, 270, HY - 380, 262, HY - 150); g.closePath(); g.fillStyle = '#bfe8f6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  for (const [x, y] of [[-150, -250], [-40, -300], [80, -280], [170, -210], [-90, -190], [30, -215]]) ell(x, HY + y, 16, 12, '#ffffff', 3, '#9fcfe2');   // polka dots
  g.beginPath(); for (let i = 0; i <= 26; i++) { const x = -270 + i * 540 / 26, y = HY - 150 + (i % 2 ? 16 : -6); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.strokeStyle = '#ffffff'; g.lineWidth = 22; g.lineJoin = 'round'; g.stroke(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();   // ruffled elastic edge
  g.restore(); }
function glassProp(x, y, s, tilt) { g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s); ln([[0, 0], [0, -70]], 8, '#eaf6ff'); ln([[0, 0], [0, -70]], 3, INK); ell(0, 2, 30, 8, '#eaf6ff', 5);
  poly([[-34, -70], [34, -70], [18, -170], [-18, -170]].map(([a, b]) => [a * .8, b]), 'rgba(235,246,255,.9)', 5); poly([[-24, -80], [24, -80], [13, -150], [-13, -150]], '#c9883a', 0);   // kvas is brown
  for (let k = 0; k < 4; k++) ell(-8 + hash(k) * 16, -96 - k * 14, 3, 3, '#f6d79a', 0); g.restore(); }
function kvasBottle(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-60, 0); g.lineTo(-60, -230); g.quadraticCurveTo(-60, -300, -24, -320); g.lineTo(-24, -400); g.lineTo(24, -400); g.lineTo(24, -320); g.quadraticCurveTo(60, -300, 60, -230); g.lineTo(60, 0); g.closePath();
  g.fillStyle = '#6a3a1a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); rr(-30, -430, 60, 38, 6, '#f2c820', 6); rr(-56, -200, 112, 120, 8, '#fffaf0', 5); fit('КВАС', 0, -158, 112, 64, 44, '#c0283a', {pad: 6}); fit('ON SALE $1.49', 0, -106, 112, 34, 18, INK, {pad: 4}); g.restore(); }
function pirozhkiBag(x, y) { poly([[x - 90, y], [x - 80, y - 150], [x + 80, y - 150], [x + 90, y]], '#e6cf9c', 6); fit('ПИРОЖКИ', x, y - 100, 150, 40, 30, '#8a4a1a'); fit('2 за $1', x, y - 52, 150, 40, 30, '#c0283a'); }

// ---------- sets ----------
function apartment(t) { g.fillStyle = '#efd2e4'; g.fillRect(-1400, -1400, 3900, 3400); g.fillStyle = '#e6c2d8';
  for (let x = -1400; x < 2500; x += 110) g.fillRect(x, -1400, 40, 3400);   // striped wallpaper
  rr(150, 230, 780, 760, 14, '#a8283a', 9); rr(180, 260, 720, 700, 8, '#c8343e', 5); g.save(); g.translate(540, 610);   // the wall carpet
  for (const [r, c] of [[250, '#e8a23a'], [195, '#2a4a8a'], [140, '#c8343e'], [86, '#e8a23a'], [38, '#2a4a8a']]) { g.save(); g.rotate(.785); rr(-r / 1.414, -r / 1.414, r * 1.414, r * 1.414, 6, c, 5); g.restore(); } g.restore();
  rr(-520, 300, 520, 640, 10, '#9fd4f0', 9); ln([[-260, 300], [-260, 940]], 9); ln([[-520, 620], [0, 620]], 9); for (const [x, y] of [[-420, 380], [-150, 420]]) sparkle(x, y, 14, .9, '#ffffff');   // window
  rr(1060, 280, 180, 260, 10, '#f2c820', 8); rr(1080, 300, 140, 220, 6, '#fffaf0', 0); fit('PARIS', 1150, 410, 140, 60, 40, '#d63a8a');   // a Paris poster
  ln([[540, 120], [540, 190]], 4); ell(540, 210, 70, 26, '#f2c820', 6); for (let k = 0; k < 7; k++) ell(480 + k * 20, 245 + (k % 2) * 10, 6, 10, 'rgba(230,248,255,.9)', 3); }   // little chandelier
function table(t, props) { rr(-400, TABLE, 1900, 40, 14, '#fbeef0', 8); rr(-380, TABLE + 36, 1860, 900, 0, '#f0d8de', 8); for (const x of [40, 540, 1040]) { rr(x - 160, TABLE + 90, 320, 170, 16, null, 5); ell(x, TABLE + 175, 14, 14, '#e8c27a', 4); }
  if (props.bag) { pirozhkiBag(250, TABLE); regProp('bag', 160, TABLE - 150, 180, 150); }
  if (props.kvas) { kvasBottle(330, TABLE, .8); regProp('kvas', 280, TABLE - 345, 100, 345); }
  if (props.vase) { poly([[820, TABLE], [835, TABLE - 110], [885, TABLE - 110], [900, TABLE]], 'rgba(220,240,255,.9)', 5); for (const [dx, c] of [[-20, '#ff8ab8'], [10, '#ffd23f'], [36, '#ff8ab8']]) { ln([[860, TABLE - 110], [860 + dx, TABLE - 200]], 5, '#3d8b3d'); ell(860 + dx, TABLE - 210, 18, 18, c, 4); } } }
function boardwalk(t) {   // Coney Island-ish boardwalk: flat sky bands, sea, planks, a generic ferris wheel (no logos)
  const sky = ['#ffd8c4', '#ffc4c8', '#f7b0cc', '#e6a2d4']; sky.forEach((c, i) => { g.fillStyle = c; g.fillRect(-1600, -1400 + i * 520, 4200, 530); });
  g.fillStyle = '#5fb8d8'; g.fillRect(-1600, 1350, 4200, 160); g.fillStyle = '#e8c890'; g.fillRect(-1600, 1500, 4200, 900); for (let x = -1600; x < 2600; x += 120) ln([[x, 1500], [x - 300, 2400]], 4, '#c9a46a');
  const cx = 470, cy = 330, R = 760;   // wheel centre (world); the A-frame legs stand right behind Zhanna
  g.save(); g.lineCap = 'round'; for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + t * .05; ln([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], 10, '#fff4f8'); ln([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], 3, INK); }
  g.beginPath(); g.arc(cx, cy, R, 0, 7); g.strokeStyle = INK; g.lineWidth = 34; g.stroke(); g.strokeStyle = '#ff5a8a'; g.lineWidth = 22; g.stroke(); g.beginPath(); g.arc(cx, cy, R - 60, 0, 7); g.strokeStyle = '#ffd23f'; g.lineWidth = 9; g.stroke();
  for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283 + t * .05, gx = cx + Math.cos(a) * R, gy = cy + Math.sin(a) * R; rr(gx - 46, gy + 10, 92, 74, 16, k % 2 ? '#2a9ad8' : '#ffd23f', 6); ln([[gx, gy], [gx, gy + 12]], 6); }
  g.restore();
  // A-frame lattice legs (they read as «la tour Eiffel» in the tight shot)
  for (const sd of [-1, 1]) { const top = [cx + sd * 30, cy + 40], bot = [cx + sd * 430, 1500]; const N = 12;
    ln([top, bot], 34, INK); ln([top, bot], 24, '#8a6a9a'); const top2 = [cx + sd * 110, cy + 40], bot2 = [cx + sd * 600, 1500]; ln([top2, bot2], 34, INK); ln([top2, bot2], 24, '#8a6a9a');
    for (let k = 1; k < N; k++) { const u = k / N, p = [lerp(top[0], bot[0], u), lerp(top[1], bot[1], u)], q = [lerp(top2[0], bot2[0], u), lerp(top2[1], bot2[1], u)], u2 = (k + 1) / N, q2 = [lerp(top2[0], bot2[0], u2), lerp(top2[1], bot2[1], u2)];
      ln([p, q], 6, '#5a4468'); ln([p, q2], 5, '#5a4468'); } }
  ell(cx, cy, 70, 70, '#ffd23f', 9); for (let k = 0; k < 10; k++) sparkle(cx + Math.cos(k + t) * (R + 30), cy + Math.sin(k + t) * (R + 30), 12, Math.max(0, Math.sin(t * 4 + k)), '#ffffff'); }

// ---------- characters ----------
const sinceCut = t => Math.min(.2, Math.max(.021, t - shotAt(t).a));   // no arm blending across a hard cut
function zhanna(t, x, y, S, opt = {}) { const a = blendArms(zGest, ZG, t, sinceCut(t)), md = T.moodAt(zMood, t, .25), ts = mouthOf('z', t, 3), breath = 2 + 2 * Math.sin(t * 2.2);
  const spkK = T.follow(u => speaking('z', u) ? 1 : 0, t, .25, .35, .5), capK = t >= CAPDROP[0] && t < SONG + 5 ? 1 - ease(P01(t, CAPDROP[0], CAPDROP[1] - CAPDROP[0])) : null;
  const fn = T.ik(wig(a.fn, t, 1.5 + 3 * spkK), breath);
  T.draw(g, {...ZH, hands: {1: 'none', '-1': 'none'}, x, y, s: S, arms: fn, ik: false, front: true, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: spkK > .5, nod: ts.nod, t,
    blink: blink(t, 2) || md.blink, tilt: .02 * Math.sin(t * 1.1) + .03 * spkK * Math.sin(t * 2.6), look: opt.look || 0, lean: .01 * Math.sin(t * .6),
    hairFx: capK != null && t < SC.eiffel ? (gg, HY) => { const pg = g; g = gg; showerCap(HY, capK); g = pg; } : null});
  FACEBOX.push(['zhanna-eyes', ...(() => { const a1 = scr(x - 190 * S, y - 1180 * S), b1 = scr(x + 190 * S, y - 1000 * S); return [a1[0], a1[1], b1[0] - a1[0], b1[1] - a1[1]]; })()]);
  armOver(fn, x, y, S, ZH);
  DIRS = {}; for (const sd of [-1, 1]) { const P3 = fn(sd); DIRS[sd] = Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]); }
  const [rx, ry, ra] = hpos(fn, 1, x, y, S), skin = ZH.pal.skin, H = (hx, hy, rot, w, o = {}) => ({x: hx, y: hy, rot, S, skin, nail: NAIL, w, ...o}), skip = new Set(), G = a.e < .5 ? a.prev : a.cur;
  if (G === 'perfume' || G === 'spray') { skip.add(1); let puff = 0; for (const p of [.75, 2.15, ...SPRAYS]) if (t >= p && t < p + .7) puff = (t - p) / .7; gripObject(() => perfumeBottle(rx, ry + 52 * S, S * 1.05, puff), H(rx, ry, 0, 48 * S)); regProp('perfume', rx - 50 * S, ry - 130 * S, 100 * S, 190 * S); }
  if (G === 'pastry' || G === 'bite') { skip.add(1); const bitten = t >= BITE[0] + .3; gripObject(() => pastry(rx - 70 * S, ry - 4 * S, -.08, S * .95, bitten), H(rx, ry, 0, 34 * S, {fist: false})); regProp('pastry', rx - 165 * S, ry - 45 * S, 190 * S, 80 * S); }
  if (G === 'glass' || G === 'toast') { skip.add(1); const tilt = G === 'toast' ? -.15 + .05 * Math.sin(t * 6) : 0; gripObject(() => glassProp(rx, ry + 30 * S, S * 1.1, tilt), H(rx, ry, 0, 10 * S, {fist: true})); regProp('glass', rx - 40 * S, ry - 170 * S, 80 * S, 200 * S);
    if (G === 'toast') for (let k = 0; k < 3; k++) sparkle(rx + (k - 1) * 50 * S, ry - 220 * S - k * 20 * S, 14 * S, Math.max(0, Math.sin(t * 7 + k * 2))); }
  for (const sd of [-1, 1]) { if (skip.has(sd)) continue; const P3 = fn(sd); T.drawHand(g, shapeOf(ZHS, G, sd), x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), S, skin, NAIL, sd, 22); } }
const KG = { rest: s => [[s * 78, -860], [s * 150, -720], [s * 100, -640]], present: s => s > 0 ? [[78, -860], [215, -800], [225, -950]] : [[-78, -860], [-150, -720], [-100, -640]],
  shock: s => [[s * 78, -860], [s * 205, -930], [s * 235, -1060]], hips: s => [[s * 78, -860], [s * 185, -770], [s * 110, -655]] };
const kGest = t => t >= BY.k1.at - .1 && t < BY.k1.end ? 'present' : t >= BY.k2.at - .1 && t < BY.k2.end + .3 ? 'shock' : t >= BY.p1.at - .2 ? 'hips' : 'rest';
const kMood = t => t < BY.k1.at ? 'neutral' : t < BY.k1.end + .2 ? 'surprised' : t < BY.k2.at ? 'worried' : t < BY.k2.end + .3 ? 'shocked' : t < BY.p1.at ? 'eyeroll' : t < TL.END ? 'surprised' : 'laugh';
function kaylee(t, x, y, S) { const a = blendArms(kGest, KG, t, sinceCut(t)), md = T.moodAt(kMood, t, .25), ts = mouthOf('k', t, 11), spkK = T.follow(u => speaking('k', u) ? 1 : 0, t, .25, .35, .5);
  const fn = T.ik(wig(a.fn, t, 1.5 + 3 * spkK), 2 + 2 * Math.sin(t * 2.4));
  T.draw(g, {...KY, hands: {1: 'none', '-1': 'none'}, x, y, s: S, arms: fn, ik: false, front: true, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: spkK > .5, nod: ts.nod, t, blink: blink(t, 4) || md.blink, tilt: .02 * Math.sin(t) + .03 * spkK * Math.sin(t * 3), look: -.6});
  FACEBOX.push(['kaylee-eyes', ...(() => { const a1 = scr(x - 190 * S, y - 1180 * S), b1 = scr(x + 190 * S, y - 1000 * S); return [a1[0], a1[1], b1[0] - a1[0], b1[1] - a1[1]]; })()]);
  armOver(fn, x, y, S, KY); const G = a.e < .5 ? a.prev : a.cur;
  for (const sd of [-1, 1]) { const P3 = fn(sd); T.drawHand(g, G === 'hips' ? 'fist' : 'open', x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), S, KY.pal.skin, '#ff9ec0', sd, 22); } }
function petrovich(t) {   // from behind in his armchair, newspaper up; face never shown
  g.fillStyle = '#efd2e4'; g.fillRect(0, 0, W, H); g.fillStyle = '#e6c2d8'; for (let x = -60; x < W; x += 110) g.fillRect(x, 0, 40, H);
  rr(120, 220, 840, 500, 14, '#a8283a', 9);
  const rs = t >= TL.RUSTLE && t < TL.RUSTLE + .8 ? Math.sin(t * 40) * 6 * (1 - P01(t, TL.RUSTLE, .8)) : 0, sp = t >= BY.p1.at && t < BY.p1.end + .1 ? Math.sin((t - BY.p1.at) * 30) * 4 : 0;
  g.save(); g.translate(540 + rs, 700 + sp); rr(-330, -230, 660, 420, 8, '#f3eedf', 7); ln([[0, -230], [0, 190]], 5); fit('BRIGHTON POST', -165, -180, 290, 60, 40, INK); fit('КУРС ДОЛЛАРА', 165, -180, 290, 60, 36, INK);
  for (let i = 0; i < 6; i++) { ln([[-300, -100 + i * 44], [-30, -100 + i * 44]], 5, '#b8b2a2'); ln([[30, -100 + i * 44], [300, -100 + i * 44]], 5, '#b8b2a2'); } g.restore();
  rr(160, 1050, 760, 900, 120, '#7a2a3a', 9); rr(110, 1250, 140, 700, 60, '#8a3444', 8); rr(830, 1250, 140, 700, 60, '#8a3444', 8);   // armchair back + arms
  const hy = 980 + sp; g.save(); g.translate(540, hy); ell(-150, 20, 30, 44, '#e8b896', 7); ell(150, 20, 30, 44, '#e8b896', 7); ell(0, 0, 160, 170, '#e8b896', 8);
  g.save(); g.beginPath(); g.ellipse(0, 0, 156, 166, 0, 0, 7); g.clip(); g.fillStyle = '#b8b0a8'; g.fillRect(-170, 40, 340, 200); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-50, -80, 50, 26, -.4, 0, 7); g.fill(); g.restore();
  for (let k = -4; k <= 4; k++) ln([[k * 30, 44], [k * 32, 90]], 3, '#8a8278'); g.restore();
  rr(250, 1160, 580, 760, 90, '#2c3f8f', 9); for (const sx of [300, 330, 750, 780]) ln([[sx, 1180], [sx, 1900]], 10, '#f4f1ea'); }

// ---------- inserts ----------
function labelInsert(t, u) { g.fillStyle = '#f7c6da'; g.fillRect(0, 0, W, H); for (let k = 0; k < 8; k++) sparkle(120 + hash(k) * 840, 200 + hash(k + 7) * 1400, 20, Math.max(0, Math.sin(t * 4 + k)), '#ffffff');
  const z = 1 + .04 * u; g.save(); g.translate(540, 980); g.scale(z, z); g.rotate(-.03);
  rr(-330, -560, 660, 980, 120, 'rgba(255,214,232,.97)', 10); rr(-290, -520, 580, 900, 100, '#ffb8d4', 0); rr(-110, -720, 220, 190, 24, '#f2c820', 10);
  rr(-260, -260, 520, 460, 24, '#fffaf0', 8); fit('ЛЕ ПАРФЮМ', 0, -180, 480, 110, 90, '#b02a70'); fit('Made in Brighton', 0, -70, 480, 80, 52, INK); rr(-140, 40, 280, 120, 20, '#d63a8a', 6); fit('$3.99', 0, 100, 260, 110, 80, '#ffffff'); g.restore(); }

// ---------- captions (owner's old style: whole phrase opaque, pops in; English/Runglish yellow, Russian white, black outline) ----------
const Y = '#ffd23f', Wh = '#ffffff';
const SCAP = [   // song section: only short scene captions (no lyrics)
  [SC.reveal + .25, SC.beret - .05, [['Ле', Y], ['круассан', Y], ['а-ля', Y], ['капуста', Wh]]],
  [11.4, SC.eiffel - .05, [['Ле', Y], ['берет.', Wh], ['Very', Y], ['fancy.', Y]]],
  [SC.wheel + .12, SC.kvas - .02, [['Ле', Y], ['Пари.', Y], ['Почти.', Wh]]],
  [18.4, SONG - .02, [['Ле', Y], ['шампань.', Y], ['On', Y], ['sale.', Y]]]];
const SPLIT = { k1: [['Aunt Zhanna, do you even speak French?', 'Тётя Жанна, ты вообще говоришь по-французски?', 1]],
  z1: [['Деточка, конечно.', null, .38], ['Мерси, бонжур… ле шоппинг.', null, 1]], k2: [["Shopping isn't French!", 'Шоппинг — это не по-французски!', 1]],
  z2: [['It is!', null, .44], ['Это когда платит Петрович.', null, 1]], p1: [['Угу.', null, 1]] };
const ENW = new Set(['мерси', 'бонжур', 'ле', 'шоппинг', 'it', 'is', 'aunt', 'zhanna', 'do', 'you', 'even', 'speak', 'french', 'shopping', "isn't"]);
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, '').toLowerCase(); return /[a-z]/i.test(x) || ENW.has(x); };
const CAPS = [];
for (const s of SCAP) CAPS.push({a: s[0], b: s[1], words: s[2], tr: null});
for (const l of L) { if (!SPLIT[l.id]) continue; let a = l.at - .05; const n = SPLIT[l.id].length; SPLIT[l.id].forEach(([s, tr, f], i) => { const b = i === n - 1 ? Math.max(l.end + .35, a + 1.25) : l.at + (l.end - l.at) * f; CAPS.push({a, b: Math.max(b, a + 1.25), words: s.split(' ').map(w => [w, isEn(w) ? Y : Wh]), tr}); a = b; }); }
CAPS.sort((p, q) => p.a - q.a); for (let i = 0; i < CAPS.length - 1; i++) if (CAPS[i].b > CAPS[i + 1].a) CAPS[i].b = CAPS[i + 1].a;
const CHIPS = [{a: SC.label + .1, b: SC.croissant - .05, w: 'knockoff', tr: 'подделка'}, {a: 11.75, b: SC.eiffel - .05, w: 'fancy', tr: 'шикарный'}, {a: 18.9, b: SONG - .02, w: 'on sale', tr: 'по скидке'},
  {a: BY.z1.at + (BY.z1.end - BY.z1.at) * .4, b: BY.z1.end + .3, w: 'merci', tr: 'спасибо (франц.)'}];
function outlinedWords(words, y, size0) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width, tw0 = () => words.reduce((a, [w]) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  CAPBOX.push(['caption', 540 - tw / 2, y - size * .6, tw, size * 1.2]);
  for (const [w, c] of words) { const ww = g.measureText(w).width; g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = c; g.fillText(w, x, y); x += ww + sp(); } }
function caption(t) { let cur = null; for (const c of CAPS) if (t >= c.a && t < c.b) cur = c; if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12);
  g.save(); g.translate(540, 1660); g.scale(pop, pop); g.translate(-540, -1660); outlinedWords(cur.words, 1660, 72); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' ').map(w => [w, Wh]), 1750, 44); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 44; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1548 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); CAPBOX.push(['chip', 540 - w / 2, 1508, w, 72]); }
function hookPlate(t) { if (t >= 2.6) return; const ui = P01(t, 0, .3), uo = P01(t, 2.3, .3), sp = 1 - Math.pow(2, -10 * ui), al = clamp(t / .06) * (1 - ei(uo)), sc = 1 + .5 * (1 - sp) - .3 * ei(uo);
  g.save(); g.globalAlpha = al; g.translate(540, 250); g.rotate(-.025); g.scale(sc, sc); rr(-440, -120, 880, 240, 34, '#fffaf0', 9); fit('ФРАНСЕ', 0, -48, 840, 100, 92, '#d63a8a'); fit('ПО-БРАЙТОНСКИ', 0, 52, 840, 90, 66, INK); g.restore(); CAPBOX.push(['hook', 100, 130, 880, 240]); }
function endTable(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(70, 230, 940, 1360, 44, '#fffaf0', 8); fit('ПЕРЕВОДИМ ЖАННУ', 540, 330, 880, 90, 66, '#d63a8a');
  [['KNOCKOFF', 'подделка'], ['FANCY', 'шикарный'], ['ON SALE', 'по скидке'], ['MERCI', 'спасибо (по-французски)']].forEach(([en, ru], i) => { const y = 480 + i * 170; fit(en, 540, y, 860, 80, 72, '#1f3a8a'); fit(ru, 540, y + 64, 860, 52, 44, '#c0283a'); });
  fit('А что у тебя «ле»?', 540, 1300, 860, 80, 60, '#d63a8a'); fit('Пиши в комментариях!', 540, 1400, 860, 70, 52, INK); g.restore(); }

// ---------- frame ----------
function world(t, c, set, draw) { g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); set(t); draw(); g.restore(); }
function frame(t) { PROPBOX = []; FACEBOX = []; CAPBOX = []; g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = INK; g.fillRect(0, 0, W, H);
  const sh = shotAt(t), c = camAt(t, sh), Zs = .86;
  if (sh.k === 'label') labelInsert(t, (t - sh.a) / (sh.b - sh.a));
  else if (sh.k === 'eiffel') world(t, c, boardwalk, () => zhanna(t, ZX, FEET, Zs));
  else if (sh.k === 'petro') petrovich(t);
  else if (['two', 'zcu', 'kcu', 'zcu2', 'end'].includes(sh.k)) world(t, c, apartment, () => { zhanna(t, ZX2, FEET, Zs * .92, {look: .6}); kaylee(t, KX, FEET, Zs * .86); table(t, {}); });
  else world(t, c, apartment, () => { zhanna(t, ZX, FEET, Zs); table(t, {bag: sh.k === 'croissant' && t >= SC.reveal, kvas: sh.k === 'kvas', vase: sh.k !== 'kvas'}); });
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.14)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (process.env.NOCAP) return sh; hookPlate(t); if (sh.k === 'end') endTable(t); else { chip(t); caption(t); } return sh; }

// ---------- modes ----------
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'cover') { process.env.NOCAP = 1; frame(12.6); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 200);
  g.fillStyle = '#efd2e4'; g.fillRect(0, 0, W, 210); g.save(); g.translate(540, 300); g.rotate(-.02); rr(-450, -170, 900, 340, 34, '#fffaf0', 9); fit('ФРАНСЕ', 0, -60, 860, 130, 120, '#d63a8a'); fit('ПО-БРАЙТОНСКИ', 0, 70, 860, 110, 84, INK); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync('final/zhanna_franse.srt', CAPS.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.words.map(w => w[0]).join(' ')}${c.tr ? '\n' + c.tr : ''}\n`).join('\n')); }
else if (mode === 'info') { for (let i = 0; i < SH.length - 1; i++) console.log(SH[i][1], SH[i][0].toFixed(2), (SH[i + 1][0] - SH[i][0]).toFixed(2)); for (const c of CAPS) console.log('CAP', c.a.toFixed(2), (c.b - c.a).toFixed(2), c.words.map(w => w[0]).join(' ')); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w); }
else if (mode === 'smoothcheck') { let n = 0, big = 0, worst = 0, dips = 0, low = 0, dur = 0;
  for (const l of L) { if (l.who === 'p') continue; const M = []; for (let t = l.at - .1; t < l.end + .3; t += 1 / FPS) M.push(mouthOf(l.who, t, 3).mouth); dur += l.end - l.at;
    for (let i = 1; i < M.length; i++) { const d = Math.abs(M[i] - M[i - 1]), onset = M[i - 1] < .12 && M[i] > M[i - 1]; n++; if (d > .151 && !onset) { big++; worst = Math.max(worst, d); } if (M[i] < .15) low++; }
    let hi = 0, lo = 1, down = false; for (const m of M) { if (!down) { if (m > hi) hi = m; if (hi - m >= .2) { down = true; lo = m; } } else { if (m < lo) lo = m; if (m - lo >= .2) { dips++; down = false; hi = m; } } } }
  console.log(`frames ${n}, non-onset jumps >15%: ${big} (${(100 * big / n).toFixed(1)}%), worst ${worst.toFixed(3)}, visible syllable dips/s ${(dips / dur).toFixed(2)}, near-closed ${(100 * low / n).toFixed(0)}%`); }
else if (mode === 'armaudit') { const bad = {}; for (let t = 0; t < TL.END; t += 1 / FPS) { for (const [nm, f, GT] of [['z', zGest, ZG], ['k', kGest, KG]]) { const a = blendArms(f, GT, t), fn = T.ik(a.fn, 2);
    for (const s of [-1, 1]) { const [Sh, E, Hh] = fn(s); if (Hh[1] < -880 && Hh[0] * s < 40) (bad[nm + ' hand-cross ' + a.cur + ' s=' + s] = bad[nm + ' hand-cross ' + a.cur + ' s=' + s] || []).push(+t.toFixed(2)); if (E[0] * s < 0) (bad[nm + ' elbow-cross ' + a.cur] = bad[nm + ' elbow-cross ' + a.cur] || []).push(+t.toFixed(2)); } } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v[0], '…', v[v.length - 1]); if (!Object.keys(bad).length) console.log('no crossing'); }
else if (mode === 'textaudit') { const over = new Set(); let n = 0; for (let t = 0; t < TL.TOTAL; t += .25) { TEXTLOG.length = 0; frame(t); for (const [s, sz] of TEXTLOG) { n++; if (sz <= 6.01) over.add(s); } } console.log('text draws', n, 'overflowing', over.size, [...over]); }
else if (mode === 'accaudit') { // props must not cover the eyes band (the bite only reaches the lips); captions/chips/plates must not sit on faces
  const hit = (a, b) => a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[2] < b[2] + b[4] && b[2] < a[2] + a[4]; const bad = {};
  for (let t = 0; t < TL.TOTAL; t += 1 / 15) { frame(t); for (const f of FACEBOX) { const fb = [f[0], f[1], f[2], f[3], f[4]]; for (const p of PROPBOX.concat(CAPBOX)) if (hit([0, p[1], p[2], p[3], p[4]], [0, fb[1], fb[2], fb[3], fb[4]])) (bad[p[0] + ' over ' + f[0]] = bad[p[0] + ' over ' + f[0]] || []).push(+t.toFixed(2)); } }
  for (const [k, v] of Object.entries(bad)) console.log(k, v.length, 'frames', v[0], '…', v[v.length - 1]); if (!Object.keys(bad).length) console.log('accaudit: 0'); }
else if (mode === 'sheet') { const ts = arg.split(',').map(Number), cols = 6, sw = 270, shh = 480, sc = createCanvas(cols * sw, Math.ceil(ts.length / cols) * shh), sg = sc.getContext('2d');
  ts.forEach((t, i) => { frame(t); sg.drawImage(cv, (i % cols) * sw, Math.floor(i / cols) * shh, sw, shh); sg.fillStyle = '#fff'; sg.font = '24px NBL'; sg.fillText(t.toFixed(1) + 's', (i % cols) * sw + 8, Math.floor(i / cols) * shh + 28); });
  fs.writeFileSync(outName || 'final/contact_sheet.png', sc.toBuffer('image/png')); }
