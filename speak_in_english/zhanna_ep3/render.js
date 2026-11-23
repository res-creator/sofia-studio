// «Тётя Жанна с Брайтона», ep3 v2 «Жанна в спортзале» (спор на шубу) — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | chunks   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const bgCv = createCanvas(W, H), GB = bgCv.getContext('2d'), clCv = createCanvas(W, H), GC = clCv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }
function heart(x, y, r, col) { g.beginPath(); g.moveTo(x, y + r); g.bezierCurveTo(x - r * 1.6, y - r * .1, x - r * .7, y - r * 1.3, x, y - r * .45); g.bezierCurveTo(x + r * .7, y - r * 1.3, x + r * 1.6, y - r * .1, x, y + r); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
function dumbbell(x, y, ang, sc, col) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc); rr(-46, -7, 92, 14, 6, '#9aa0aa', 4); rr(-62, -28, 22, 56, 8, col, 5); rr(40, -28, 22, 56, 8, col, 5); g.restore(); }
let NOW = 0;

const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 650, s: .8};
ZH.x = 280; ZH.s = .78;
const TR = {hair: 'short', headband: '#e0283a', pal: {skin: '#c98e66', skinS: '#b07650', hair: '#3a2a20', brow: '#2a1a14', top: '#2fa8a0', topS: '#23867f', collar: '#23867f', bottom: '#2a2a33', shorts: '#2a2a33', legs: '#c98e66', shoe: '#ffffff', sole: '#e0283a', armW: 40, whistle: '#e0283a', label: 'COACH'}, x: 900, s: .8};

// ---------- gym (flat) ----------
const FEET = 1720;
function gym(t) {
  g.fillStyle = '#dde4ec'; g.fillRect(-1200, -1200, 3480, 2600); g.fillStyle = '#d2dbe5'; for (let x = -1200; x < 2280; x += 110) g.fillRect(x, -1200, 50, 2600);
  rr(-1200, 1300, 3480, 80, 0, '#c4ccd6', 0);
  // sign
  rr(210, 150, 660, 180, 30, '#2a2a33', 8); txt('BRIGHTON', 540, 214, 74, '#ffd23f', HW); txt('GYM', 540, 284, 64, '#ffffff', HW); dumbbell(300, 284, 0, .8, '#e0283a'); dumbbell(780, 284, 0, .8, '#e0283a');
  // weight-stack machine (left)
  rr(-230, 380, 34, 1000, 8, '#7a808c', 7); rr(120, 380, 34, 1000, 8, '#7a808c', 7); rr(-240, 360, 410, 40, 10, '#7a808c', 7); ell(-30, 430, 34, 34, '#b8bec8', 6); ln([[-30, 464], [-30, 840]], 5);
  for (let i = 0; i < 9; i++) rr(-110, 860 + i * 52, 160, 46, 6, i === 4 ? '#e0283a' : '#3a3f4a', 5); rr(-230, 1290, 384, 30, 8, '#7a808c', 6);
  // dumbbell rack (centre)
  rr(380, 1130, 360, 26, 8, '#7a808c', 6); rr(380, 1250, 360, 26, 8, '#7a808c', 6); rr(392, 1150, 22, 230, 6, '#7a808c', 5); rr(706, 1150, 22, 230, 6, '#7a808c', 5);
  const DC = ['#3a5ad8', '#2fb0a0', '#f0b030', '#e0283a'];
  for (let i = 0; i < 4; i++) { dumbbell(430 + i * 86, 1110, Math.PI / 2, .55, DC[i]); dumbbell(430 + i * 86, 1230, Math.PI / 2, .6, DC[3 - i]); }
  // mirror (right)
  rr(930, 420, 420, 880, 20, '#eaf6fc', 9); ln([[1000, 520], [1100, 420]], 10, '#ffffff'); ln([[1010, 640], [1230, 420]], 16, '#ffffff');
  // kettlebells
  for (const [x, c] of [[860, '#3a3f4a'], [960, '#e0283a']]) { ell(x, 1345, 46, 44, c, 6); g.beginPath(); g.arc(x, 1300, 26, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 14; g.stroke(); g.strokeStyle = c; g.lineWidth = 6; g.stroke(); }
  // rubber floor
  g.fillStyle = '#6a707c'; g.fillRect(-1200, 1380, 3480, 1200); for (let c = -12; c < 24; c++) ln([[c * 140, 1380], [c * 170 - 700, 2400]], 4, '#5c626e'); for (let r = 0; r < 8; r++) ln([[-1200, 1460 + r * r * 30], [2280, 1460 + r * r * 30]], 4, '#5c626e');
  ln([[-1200, 1380], [2280, 1380]], 7);
}

// ---------- characters ----------
const ZX0 = 360, TMX = 260, LIFT = 36, BAGX = 700;
const ZG = {
  walk: s => s < 0 ? [[-78, -860], [-100, -720], [-108, -575]] : [[78, -860], [100, -720], [105, -590]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-160, -740], [-86, -640]],
  stop: s => s > 0 ? [[78, -860], [190, -840], [290, -900]] : [[-78, -860], [-160, -740], [-86, -640]],
  card: s => s > 0 ? [[78, -860], [190, -880], [230, -1010]] : [[-78, -860], [-160, -740], [-86, -640]],
  phone: s => s > 0 ? [[78, -860], [190, -860], [150, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  read: s => s > 0 ? [[78, -860], [150, -760], [70, -860]] : [[-78, -860], [-150, -760], [-60, -840]],
  fan: s => s < 0 ? [[-78, -860], [-170, -800], [-150, -930]] : [[78, -860], [160, -740], [86, -640]],
  stream: s => s > 0 ? [[78, -860], [190, -840], [290, -890]] : [[-78, -860], [-190, -930], [-215, -1070]],
  nails: s => [[s * 78, -860], [s * 205, -820], [s * 262, -960]],
  faint: s => [[s * 78, -860], [s * 170, -760], [s * 230, -700]],
};
const TG = {
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  present: s => s < 0 ? [[-78, -860], [-170, -770], [-260, -830]] : [[78, -860], [160, -740], [86, -640]],
  cheer: s => [[s * 78, -860], [s * 195, -960], [s * 238, -1130]],
  jack: s => { const k = Math.abs(Math.sin(Math.PI * (NOW - TL.JACK) / .5)); return TG.down(s).map((p, i) => [lerp(p[0], TG.cheer(s)[i][0], k), lerp(p[1], TG.cheer(s)[i][1], k)]); },
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  curl: s => { const k = (1 - Math.cos(NOW * 5.2 + (s > 0 ? 0 : Math.PI))) / 2; return [[s * 78, -860], [s * 118, -725], [s * (122 - 30 * k), -590 - 260 * k]]; },
  look: s => s > 0 ? [[78, -860], [150, -760], [60, -890]] : [[-78, -860], [-160, -740], [-86, -640]],
  sheepish: s => s > 0 ? [[78, -860], [200, -960], [130, -1090]] : [[-78, -860], [-160, -740], [-86, -640]],
  phoneT: s => s < 0 ? [[-78, -860], [-190, -860], [-150, -1040]] : [[78, -860], [160, -740], [86, -640]],
  tired: s => [[s * 80, -850], [s * 96, -700], [s * 98, -560]],
  carry: s => s < 0 ? [[-80, -850], [-100, -700], [-108, -570]] : [[80, -850], [96, -700], [98, -560]],
  catch: s => s < 0 ? [[-78, -860], [-210, -820], [-300, -850]] : [[78, -860], [-10, -790], [-150, -820]],
};
const FRONT = new Set(['explain', 'brooch', 'read', 'catch', 'look']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'explain'], [.45, 'wag']], z2: [[0, 'shrug']], z3: [[0, 'fan']], z4: [[0, 'stop'], [.35, 'brooch'], [.75, 'stop']], z5: [[0, 'stream']], z6: [[0, 'nails']],
  z7: [[0, 'wag'], [.5, 'card']], z8: [[0, 'explain'], [.5, 'stop']], z9: [[0, 'phone']], z10: [[0, 'wag']]};
const TPLAN = {t1: [[0, 'cheer'], [.4, 'present']], t2: [[0, 'shrug'], [.5, 'present']], t3: [[0, 'present'], [.5, 'cheer']], t4: [[0, 'curl'], [.5, 'shrug']], t6: [[0, 'sheepish']],
  t7: [[0, 'present']], t8: [[0, 'phoneT']], t9: [[0, 'carry']]};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id] || []) if (u >= k) gg = v; return gg; } return idle; }
const ON = BY.t2.at + .4, OFF = BY.t6.at + .2;
function zPos(t) { let x = lerp(-260, ZX0, ease((t - .2) / 1.8)), lift = 0, walk = t < 2.0;
  if (t >= ON) { const k = ease((t - ON) / 1.1); x = lerp(ZX0, TMX, k); lift = LIFT * ease((t - ON - .8) / .3); walk = walk || k < 1; }
  if (t >= OFF) { const k = ease((t - OFF) / 1.1); x = lerp(TMX, ZX0, k); lift = LIFT * (1 - ease((t - OFF) / .3)); walk = k < 1; }
  const onTM = t >= ON + .8 && t < OFF + .3; if (onTM && t > ON + 1.1 && t < OFF) walk = 'tm';
  return {x, lift, walk, onTM}; }
const FAINTK = t => ease((t - TL.FAINT) / .6);
function zAct(t) { if (t < BY.z1.at + .9) return {g: 'walk', mood: 'smug'};
  if (t >= TL.FAINT) return {g: 'faint', mood: 'flat'};
  if (t >= TL.STING) return {g: 'read', mood: 'surprised'};
  if (t >= BY.z5.at - .2 && t < TL.FOLLOW + 1) return {g: 'stream', mood: 'smug'};
  if (t >= BY.z9.at - .3 && t < BY.z9.end + .2) return {g: 'phone', mood: 'smug'};
  const l = lineAt(t), m = l && l.who === 't' && (l.id === 't6' || l.id === 't7') ? 'flat' : 'smug';
  return {g: plan(ZPLAN, 'z', t, 'hips'), mood: l && l.id === 'z4' && (t - l.at) / (l.end - l.at) > .3 && (t - l.at) / (l.end - l.at) < .6 ? 'happy' : m}; }
function tAct(t) { const l = lineAt(t), spk = l && l.who === 't';
  if (t >= TL.FAINT) return {g: 'catch', mood: 'surprised'};
  if (t >= BY.t9.at - .1) return {g: 'carry', mood: spk ? 'sad' : 'flat'};
  if (t >= TL.JACK && t < BY.z2.at) return {g: 'jack', mood: spk ? undefined : 'grin'};
  if (t >= BY.z2.at && t < BY.t2.at) return {g: 'cheer', mood: 'surprised'};
  if (t >= BY.t4.at && t < BY.t4.at + (BY.t4.end - BY.t4.at) * .5) return {g: 'curl', mood: undefined};
  if (t >= BY.z5.at && t < TL.FOLLOW) return {g: 'curl', mood: 'grin'};
  if (t >= TL.FOLLOW && t < BY.t6.at - .1) return {g: 'look', mood: 'grin'};
  if (t >= TL.RING - .1 && t < BY.z7.at + 1.6) return {g: 'look', mood: 'surprised'};
  if (t >= BY.z8.at + (BY.z8.end - BY.z8.at) * .6 && t < BY.t8.end + .2) return {g: 'phoneT', mood: spk ? undefined : 'flat'};
  if (t >= BY.z7.at + 1.6 && t < BY.t8.at) return {g: plan(TPLAN, 't', t, 'shrug'), mood: spk ? undefined : 'surprised'};
  return {g: plan(TPLAN, 't', t, 'hips'), mood: spk ? undefined : l && (l.id === 'z4' || l.id === 'z2') ? 'flat' : t > BY.z9.at - .3 ? 'flat' : 'grin'}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function phoneProp(x, y, w, h, ang, rec, col = '#e05a8a') { g.save(); g.translate(x, y); g.rotate(ang); rr(-w / 2, -h / 2, w, h, 12, col, 5); rr(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 7, '#3a3550', 3); if (rec) { ell(-w / 2 + 20, -h / 2 + 20, 6, 6, '#ff3a3a', 0); } g.restore(); }
function bag(x, y, sc, items) { g.save(); g.translate(x, y); g.scale(sc, sc);
  if (items.ring) { ln([[40, 0], [40, -150]], 8); ell(40, -190, 50, 50, null, 0); g.beginPath(); g.arc(40, -190, 46, 0, 7); g.strokeStyle = INK; g.lineWidth = 20; g.stroke(); g.strokeStyle = '#fffbe0'; g.lineWidth = 10; g.stroke(); }
  if (items.fan) { ln([[-40, 0], [-50, -90]], 10, INK); ln([[-40, 0], [-50, -90]], 5, '#ff9ac8'); ell(-52, -110, 30, 30, '#bfe3f5', 5); }
  g.beginPath(); g.arc(0, -10, 56, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 16; g.stroke(); g.strokeStyle = '#ff9ac8'; g.lineWidth = 8; g.stroke();
  poly([[-90, -10], [90, -10], [110, 120], [-110, 120]], '#e0569a', 7); ln([[-70, 20], [70, 20]], 5, '#b02a70'); star(0, 62, 18, '#f2c820', 4, 5); g.restore(); }
function fur(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.arc(0, -160, 12, Math.PI * .1, Math.PI * 1.3); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); ln([[0, -148], [0, -128]], 6); ln([[-80, -110], [0, -130], [80, -110]], 8, '#7a808c');
  poly([[-62, -112], [-120, -40], [-140, 90], [-100, 98], [-78, 0]], '#9a6a44', 7); poly([[62, -112], [120, -40], [140, 90], [100, 98], [78, 0]], '#9a6a44', 7);
  poly([[-66, -114], [66, -114], [112, 150], [-112, 150]], '#a8744a', 7); ln([[0, -60], [0, 148]], 5, '#7a4a2a'); for (const yy of [-20, 40, 100]) ell(14, yy, 7, 7, '#f2c820', 3);
  for (let i = 0; i < 7; i++) ell(-60 + i * 20, -112 + Math.abs(i - 3) * 7, 17, 17, '#e0c090', 4); for (let i = 0; i < 9; i++) ell(-104 + i * 26, 150, 15, 13, '#e0c090', 3); for (const sx of [-1, 1]) ell(sx * 120, 94, 22, 14, '#e0c090', 3); g.restore(); }
function shoeTag(x, y) { ln([[x, y], [x + 30, y + 40]], 3); g.save(); g.translate(x + 30, y + 40); g.rotate(-.2); rr(-6, 0, 80, 34, 8, '#fffaf0', 4); txt('SALE', 34, 18, 22, '#e0283a'); g.restore(); }
function treadmill(t, part) { const x = TMX, top = FEET - LIFT;
  if (part === 'deck') { poly([[x - 170, top - 30], [x + 170, top - 30], [x + 205, top + 4], [x - 205, top + 4]], '#2a2a33', 6); const sp = ((t * .25) % 1);
    for (let i = 0; i < 3; i++) { const v = (i + sp) / 3, yy = top - 30 + 34 * v, w = 170 + 35 * v; ln([[x - w + 10, yy], [x + w - 10, yy]], 3, '#4a4f5a'); } rr(x - 205, top + 4, 410, 34, 10, '#7a808c', 6); rr(x - 205, top - 270, 24, 274, 8, '#7a808c', 5); rr(x + 181, top - 270, 24, 274, 8, '#7a808c', 5); }
  else { const on = zPos(t).onTM, y0 = top - 330; rr(x - 190, y0, 380, 74, 18, '#3a3f4a', 7); rr(x - 70, y0 + 9, 140, 54, 10, '#16221a', 4); if (on) txt('SLOW', x, y0 + 37, 38, '#7dff9a'); ell(x - 130, y0 + 37, 14, 14, '#e0283a', 4); ell(x + 130, y0 + 37, 14, 14, '#2f9a5a', 4); } }
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH, P = zPos(t);
  const sway = P.walk === 'tm' ? Math.sin(t * 4.2) * 7 : 0, x = P.x + Math.sin(t * 1.4) * 4 * (spk ? 1.4 : 1) + sway, bob = P.walk === true ? Math.abs(Math.sin(t * 9)) * 9 : P.walk === 'tm' ? Math.abs(Math.sin(t * 4.2)) * 6 : 0;
  const fk = FAINTK(t), tilt = fk > 0 ? -.12 * fk : spk ? .06 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2)), base = FEET - P.lift - bob;
  ell(x, FEET - P.lift + 4, 150 * c.s, 18, 'rgba(30,30,40,.22)', 0);
  g.save(); if (fk > 0) { g.translate(x, base); g.rotate(.24 * fk); g.translate(-x, -base); }
  const G = a.act.g, faint = G === 'faint' && fk > .5;
  T.draw(g, {...c, x, y: base, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 8 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: faint || blink(t, 2), tilt, look: G === 'stream' || G === 'phone' ? .6 : spk ? .2 : .6});
  const S = c.s, bx = x - 40 * S, by = base - 790 * S * br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = base - (600 + hash(i + 9) * 240) * S + bob; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  if (faint) for (let i = 0; i < 3; i++) { const ag = t * 5 + i * 2.1; sparkle(x + Math.cos(ag) * 110, base - 1360 * S + Math.sin(ag) * 30, 16, 1); }
  if (BY.z2 && t >= BY.z2.at - .2 && t < BY.t2.at + .2) shoeTag(x + 60 * S, base - 40 * S);
  const ok = a.e > .8;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hd = P3[2], hx = x + Hd[0] * S, hy = base + Hd[1] * S * br, ang = Math.atan2(Hd[1] - E[1], Hd[0] - E[0]);
    if (G === 'phone' && s > 0) continue;
    if (G === 'walk' && s < 0) bag(hx, hy + 20, .62, {ring: true, fan: true});
    if (G === 'fan' && s < 0 && ok) { ln([[hx, hy], [hx + 10, hy - 60]], 10, INK); ln([[hx, hy], [hx + 10, hy - 60]], 5, '#ff9ac8'); ell(hx + 12, hy - 80, 30, 30, '#bfe3f5', 5); g.save(); g.translate(hx + 12, hy - 80); g.rotate(t * 25); for (let b = 0; b < 3; b++) { g.rotate(2.09); ell(0, -14, 7, 14, '#ffffff', 3); } g.restore(); }
    if (G === 'stream' && s < 0 && ok) { ln([[hx, hy + 40], [hx, hy - 80]], 8); g.beginPath(); g.arc(hx, hy - 125, 48, 0, 7); g.strokeStyle = INK; g.lineWidth = 20; g.stroke(); g.strokeStyle = '#fffbe0'; g.lineWidth = 10; g.stroke(); }
    hand(hx, hy, ang, S, c.pal.skin, '#d63a8a', true);
    if (s > 0 && ok && G === 'card') { g.save(); g.translate(hx + 10, hy - 50); g.rotate(-.12); rr(-62, -38, 124, 76, 10, '#f2c820', 5); rr(-46, -20, 26, 20, 4, '#d8a820', 3); txt('PETROVICH', 0, 18, 16, INK); g.restore(); hand(hx, hy, ang, S, c.pal.skin, '#d63a8a', true); }
    if (s > 0 && ok && G === 'stream') phoneProp(hx + 14, hy - 30, 96, 58, -.08, Math.floor(t * 2) % 2 === 0);
    if (s > 0 && ok && G === 'read') phoneProp(hx - 30, hy - 40, 60, 96, -.1, false); }
  if (G === 'phone' && ok) { const Hd = a.fn(1)[2]; rr(x + Hd[0] * S - 24, base + Hd[1] * S - 64, 48, 90, 10, '#e05a8a', 5); }
  g.restore(); }
function tX(t) { return TR.x - 60 * ease((t - BY.t9.at) / 1.2) + 20 * FAINTK(t); }
function hopY(t) { if (t >= TL.JACK && t < BY.z2.at) return 70 * Math.abs(Math.sin(Math.PI * (t - TL.JACK) / .5)); if (t >= BY.z2.at && t < BY.t2.at) return 70 * (1 - ease((t - BY.t2.at + .25) / .25)); return 0; }
function trainerHands(t, a, x, y) { const c = TR;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hd = P3[2], hx = x + Hd[0] * c.s, hy = y + Hd[1] * c.s, ang = Math.atan2(Hd[1] - E[1], Hd[0] - E[0]), G = a.act.g;
    if (G === 'phoneT' && s < 0 && a.e > .8) continue;
    if (G === 'curl' && a.e > .6) dumbbell(hx + Math.cos(ang) * 14, hy + Math.sin(ang) * 14, ang + Math.PI / 2, .8, '#3a3f4a');
    if (G === 'carry' && s < 0) bag(hx, hy + 18, .55, {ring: true, fan: false});
    hand(hx, hy, ang, c.s, c.pal.skin, null, false);
    if (G === 'look' && s > 0 && a.e > .8) phoneProp(hx - 10, hy - 40, 56, 92, .1, false, '#3a5ad8'); }
  if (a.act.g === 'phoneT' && a.e > .8) { const Hd = a.fn(-1)[2]; rr(x + Hd[0] * c.s - 24, y + Hd[1] * c.s - 64, 48, 90, 10, '#3a5ad8', 5); } }
let TA = null;
function trainer(t, handsLater) { const l = lineAt(t), spk = l && l.who === 't', a = blendArms(tAct, TG, t), c = TR, tired = t >= BY.t9.at - .1;
  const x = tX(t) + Math.sin(t * 1.2 + 2) * 3, walking = t > BY.t9.at && t < BY.t9.at + 1.2, y = FEET - hopY(t) - (walking ? Math.abs(Math.sin(t * 8)) * 7 : 0);
  ell(x, FEET + 4, 150 * c.s * (1 - hopY(t) / 300), 18, 'rgba(30,30,40,.22)', 0);
  if (t >= BY.z5.at && t < TL.FOLLOW + .6) { const k = ease((t - BY.z5.at) / .4) * (1 - ease((t - TL.FOLLOW) / .6)); const rg = g.createRadialGradient(x, FEET - 800, 40, x, FEET - 800, 420); rg.addColorStop(0, `rgba(255,250,215,${.55 * k})`); rg.addColorStop(1, 'rgba(255,250,215,0)'); g.fillStyle = rg; g.fillRect(x - 430, FEET - 1240, 860, 900); }
  T.draw(g, {...c, x, y, sq: tired ? .975 : 1, arms: (a.fn = wig(a.fn, t, spk ? 7 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 5), headband: c.headband,
    tilt: tired ? .07 + .02 * Math.sin(t) : spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: -.6, sweat: tired || a.act.g === 'curl' || a.act.g === 'jack'});
  if (handsLater) TA = {a, x, y}; else trainerHands(t, a, x, y); }
function floorBag(t) { if (t < 1.9 || t >= BY.t9.at - .1) { if (t >= TL.FAINT + .15) { const k = ease((t - TL.FAINT - .15) / .3), x = tX(t) - 120; bag(x, lerp(FEET - 330, FEET - 120, k), .55, {ring: true}); } return; }
  bag(BAGX, FEET - 120, .62, {ring: t < BY.z5.at - .3, fan: t < BY.z3.at - .3}); }

// ---------- hourglass (the 5-minute bet, no digits) ----------
const HG_A = .6, HG_B = (() => { const l = BY.z9, i = l.text.indexOf('Пять'); return l.at + (l.end - l.at) * (i + 8) / l.text.length; })();
function hourglass(t) { if (t < .2 || t >= TL.END) return; const p = clamp((t - HG_A) / (HG_B - HG_A)), a = ease(t / .4) * (1 - ease((t - HG_B - 1.6) / .4)); if (a <= 0) return;
  g.save(); g.globalAlpha = a; const x = 62, y = 110, sh = t > HG_B && t < HG_B + .5 ? Math.sin((t - HG_B) * 40) * .12 : 0; g.translate(x, y); g.rotate(sh); g.scale(1.35, 1.35);
  rr(-40, -70, 80, 14, 6, '#a0703a', 5); rr(-40, 56, 80, 14, 6, '#a0703a', 5);
  const bulb = () => { g.beginPath(); g.moveTo(-30, -56); g.lineTo(30, -56); g.quadraticCurveTo(30, -14, 4, 0); g.quadraticCurveTo(30, 14, 30, 56); g.lineTo(-30, 56); g.quadraticCurveTo(-30, 14, -4, 0); g.quadraticCurveTo(-30, -14, -30, -56); g.closePath(); };
  bulb(); g.fillStyle = 'rgba(235,248,255,.92)'; g.fill(); g.save(); bulb(); g.clip(); g.fillStyle = '#f2c040';
  const top = (1 - p) * 46; if (top > .5) g.fillRect(-32, -2 - top, 64, top); const bot = p * 46; if (bot > .5) { g.beginPath(); g.moveTo(-32, 56); g.lineTo(32, 56); g.lineTo(32, 56 - bot * .7); g.quadraticCurveTo(0, 56 - bot * 1.3, -32, 56 - bot * .7); g.closePath(); g.fill(); }
  if (p > 0 && p < 1) g.fillRect(-2, -2, 4, 56); g.restore(); bulb(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore(); }

// ---------- clouds (Zhanna's thoughts) and cards (cutaways) ----------
const PX = 150, PY = 120, PW = 840, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
function phoneScreen(x, y, w, h) { rr(x, y, w, h, 34, '#2a2230', 0); rr(x + 14, y + 16, w - 28, h - 32, 24, '#3a3550', 5); }
function avatar(x, y, r) { ell(x, y, r, r, '#c8a060', 5); ell(x, y - r * .2, r * .38, r * .38, '#8a6a3a', 0); g.beginPath(); g.ellipse(x, y + r * .62, r * .62, r * .42, 0, Math.PI, 0); g.fillStyle = '#8a6a3a'; g.fill(); }
function pill(x, y, w, s, bg, fg, size = 34) { rr(x - w / 2, y - 30, w, 60, 30, bg, 5); txt(s, x, y + 2, size, fg); }
function bubble(x, y, s, size, col) { g.font = `${size}px ${FONT}`; const w = g.measureText(s).width + 40; rr(x - w / 2, y - size * .75, w, size * 1.5, 20, '#ffffff', 5); poly([[x - 12, y + size * .75 - 2], [x + 8, y + size * .75 - 2], [x - 16, y + size * .75 + 22]], '#ffffff', 0); txt(s, x, y + 2, size, col); }
const CARD = {
  coat: u => { fur(240, 250, 1.15); txt('THE BET', 580, 120, 60, INK); txt('IF I LAST', 580, 195, 52, '#d63a8a'); txt('IN THE GYM', 580, 255, 52, '#d63a8a'); pill(580, 370, 300, 'FUR COAT', '#f2c820', INK, 38); },
  compl: u => { txt('PAIN', 190, 140, 92, '#7a6a72'); const k1 = ease((u - .06) / .12); if (k1 > 0) { ln([[85, 180], [85 + 210 * k1, 100]], 14, '#e0283a'); ln([[85, 100], [85 + 210 * k1, 180 - 80 * k1]], 14, '#e0283a'); }
    if (u > .2) { txt('GAIN =', 560, 110, 66, '#2f9a5a'); const k2 = ease((u - .3) / .12); g.save(); g.globalAlpha = k2; txt('COMPLIMENTS', 560, 190, 60, '#d63a8a'); g.restore();
      const k3 = ease((u - .42) / .12); g.save(); g.globalAlpha = k3; bubble(250, 340, 'WOW!', 50, '#d63a8a'); bubble(560, 330, 'GORGEOUS!', 46, '#1f3a8a'); g.restore(); } },
  follow: u => { phoneScreen(110, 30, 280, 420); g.save(); g.beginPath(); g.roundRect(128, 50, 244, 380, 22); g.clip(); g.fillStyle = '#dde4ec'; g.fillRect(128, 50, 244, 380);
      const save = NOW; NOW = u * 20; T.draw(g, {...TR, x: 250, y: 560, s: .27, mood: 'grin', headband: TR.headband, arms: TG.curl, blink: false}); NOW = save; g.restore(); txt('coach_tyler', 250, 72, 22, INK);
    pill(610, 110, 380, 'NEW FOLLOWERS', '#3a5ad8', '#ffffff', 36); for (let i = 0; i < 9; i++) { const kk = clamp((u * 1.6 - i * .1) / .3); if (kk > 0) heart(470 + (i % 3) * 110 + (i > 2 ? 20 : 0), 400 - 60 * Math.floor(i / 3) - 30 * kk, 26, '#ff5a8a'); } },
  ring: u => { g.save(); g.translate(250, 240); g.rotate(Math.sin(u * 60) * .05); phoneScreen(-140, -210, 280, 420); avatar(0, -90, 56); txt('Petrovich', 0, 10, 40, '#ffffff'); txt('incoming call', 0, 56, 26, '#bbbbbb'); ell(-60, 140, 32, 32, '#e0283a', 5); ell(60, 140, 32, 32, '#2f9a5a', 5); g.restore();
    txt('RING! RING!', 610, 220, 72, '#e0283a', HW); },
  gold: u => { g.save(); g.translate(430, 240); g.rotate(-.06); rr(-300, -170, 600, 340, 36, '#f2c820', 8); rr(-240, -90, 90, 66, 12, '#d8a820', 5); ln([[-240, -57], [-150, -57]], 3); txt('GOLD', 180, -110, 46, '#7a5a10');
    txt('•••• •••• •••• ••••', 0, 30, 44, INK); txt('PETROVICH', -60, 110, 58, INK, FONT); g.restore(); },
  coat2: u => { fur(240, 250, 1.1); g.save(); g.translate(600, 240); g.rotate(.05); rr(-150, -170, 300, 340, 10, '#ffffff', 6); txt('RECEIPT', 0, -120, 40, INK); ln([[-110, -80], [110, -80]], 3, '#bbb'); txt('FUR COAT', 0, -40, 40, INK); txt('SIZE S', 0, 10, 36, '#7a6a72');
    const k = ease((u - .3) / .15); g.globalAlpha = k; rr(-125, 50, 250, 90, 14, '#e7f7ee', 5); txt('PAID BY', 0, 75, 28, '#2f9a5a'); txt('PETROVICH', 0, 113, 36, '#d63a8a'); g.restore(); },
  sms: u => { phoneScreen(110, 30, 280, 420); avatar(250, 120, 44); txt('Petrovich', 250, 196, 32, '#ffffff'); rr(150, 240, 200, 70, 18, '#ffffff', 4); txt('Proud of you!', 250, 276, 24, INK); rr(150, 324, 200, 70, 18, '#ffffff', 4); txt('Gym tomorrow', 250, 348, 22, INK); txt('6 AM?', 250, 374, 22, '#e0283a');
    if (u > .3) { const k = ease((u - .3) / .15); g.save(); g.globalAlpha = k; txt('6 AM?!', 610, 200, 110, '#e0283a', HW); g.restore(); } },
};
function panel(id, u, t, a0, b0, thought) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const ZT = [[420, 740, 16], [380, 690, 24]];
const PANELS = [['coat', 2.9, BY.z1.end + .4, ZT], ['compl', BY.z4.at, BY.z4.end + .35, ZT], ['follow', TL.FOLLOW - .1, BY.z6.at + 1.8, null], ['ring', TL.RING - .1, BY.z7.at + 1.8, null],
  ['gold', BY.z7.at + 1.8, BY.t7.end + .35, null], ['coat2', BY.z9.at + .3, BY.z9.end + .3, ZT], ['sms', TL.STING, TL.FAINT + .2, null]];
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b, th); }

// ---------- shots ----------
const CAM = {TWO: [.95, 545, 1000], Z_MED: [1.6, 'Z', 900], T_MED: [1.6, 945, 930], Z_UP: [1.5, 'Z', 760], T_UP: [1.5, 965, 790], T_CU: [2.0, 905, 880], SHOES: [2.3, 'Z', 1590], END2: [1.1, 600, 1000]};
const SH = [[0, 'TWO'], [2.8, 'Z_UP'], [BY.t1.at - .1, 'T_MED'], [BY.z2.at - .1, 'TWO'], [BY.z2.at + (BY.z2.end - BY.z2.at) * .5, 'SHOES'], [BY.t2.at - .1, 'TWO'], [BY.z3.at - .1, 'Z_MED'],
  [BY.t3.at - .1, 'T_MED'], [BY.z4.at - .1, 'Z_UP'], [BY.t4.at - .1, 'TWO'], [TL.FOLLOW - .15, 'T_UP'], [BY.z6.at - .1, 'Z_UP'], [BY.t6.at - .1, 'T_MED'], [TL.RING - .15, 'T_UP'], [BY.z7.at - .1, 'Z_UP'],
  [BY.t7.at - .1, 'T_UP'], [BY.z8.at - .1, 'Z_MED'], [BY.t8.at - .1, 'T_MED'], [BY.z9.at - .1, 'Z_UP'], [BY.t9.at - .1, 'TWO'], [BY.z10.at - .1, 'Z_MED'], [TL.STING - .1, 'Z_UP'], [TL.FAINT - .1, 'END2'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'END2' : sh.k, [z, x0, y] = CAM[k], u = clamp((t - sh.at) / (sh.end - sh.at));
  const zx = zPos(sh.at + .3).x, x = x0 === 'Z' ? (zx < 300 ? zx : zx - 60) : x0;
  const push = sh.i % 3 === 2 || sh.k === 'END' ? 0 : .04 * ease(u), punch = sh.at > 0 && sh.k !== 'END' ? .04 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = [['gym', 'спортзал'], ['сейл', 'sale — распродажа'], ['speed', 'скорость'], ['Pain', 'боль'], ['gain', 'результат, прирост'], ['стримлю', 'stream — веду прямой эфир'], ['ю ноу', 'you know — понимаешь'],
  ['запромоутила', 'promote — прорекламировала'], ['свайпнула', 'swipe — провела картой'], ['reps', 'повторения'], ['size S', 'размер S'], ['personal assistant', 'личный помощник']];
const GLINE = {z10: [['No pain, no gain', 'без боли нет результата']]};
const CAPTXT = {z10: 'No pain, no gain, деточка!'};
const SPLIT = {z4: [['Pain я не хочу. Я хочу gain… комплиментов.'], ['И я учусь визуально. Покажи!']], t1: [['Five minutes? Piece of cake!', 'Пять минут? Проще простого!'], ['Twenty jumping jacks!', 'Двадцать прыжков-звёздочек!']], t2: [["Okay… let's hit the treadmill, then.", 'Ладно… тогда на беговую дорожку.']],
  t3: [["Ma'am, that's the slowest setting.", 'Мэм, это самая низкая скорость.'], ['No pain, no gain!', 'Без боли нет результата!']], t4: [['Ten reps, like this… Wait.', 'Десять повторений, вот так… Стоп.'], ['Why am I doing your workout?', 'А почему я делаю вашу тренировку?']],
  t6: [["Ma'am… you got me a thousand followers.", 'Мэм… вы принесли мне тысячу подписчиков.'], ['I gotta be honest.', 'Должен признаться.'], ['Petrovich paid me to make you quit', 'Петрович заплатил мне, чтобы вы сдались'], ['before the five minutes are up.', 'раньше, чем пройдут пять минут.']],
  t7: [["Wait… that's his card.", 'Стоп… это же его карта.']], t8: [['Sir? Yeah… she did a hundred reps.', 'Сэр? Да… она сделала сто повторений.'], ["And a plank. She's a beast.", 'И планку. Она зверь.']], t9: [["I'm gonna be so sore tomorrow…", 'Завтра у меня всё будет болеть…']]};
function chunks(l) { let out, trs = [];
  if (SPLIT[l.id]) { out = SPLIT[l.id].map(p => p[0]); trs = SPLIT[l.id].map(p => p[1]); }
  else { const text = CAPTXT[l.id] || l.text; const parts = [].concat(...text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=[,:])\s+/) : [p])); out = []; let cur = '';
    for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur); }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; const C = out.map((c, i) => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, tr: trs[i], who: l.who}; });
  for (;;) { const i = C.findIndex(c => c.b - c.a < 1.1); if (i < 0 || C.length < 2) break; const j = i + 1 < C.length ? i : i - 1, A = C[j], B = C[j + 1];
    C.splice(j, 2, {s: A.s + ' ' + B.s, a: A.a, b: B.b, tr: [A.tr, B.tr].filter(Boolean).join(' ') || undefined, who: A.who}); }
  return C; }
const CH = L.map(l => ({l, ch: chunks(l)}));
const chips = []; for (const {l, ch} of CH) { if (l.who !== 'z') continue; const G2 = GLINE[l.id] || GLOSS;
  ch.forEach((c, ci) => { const low = c.s.toLowerCase(), found = G2.map(([w, tr]) => ({w, tr, i: low.indexOf(w.toLowerCase())})).filter(x => x.i >= 0).sort((a, b) => a.i - b.i);
    const end = c.b + (ci === ch.length - 1 ? .25 : 0), D = end - c.a, n = Math.min(found.length, Math.floor(D / 1.2)); for (let k = 0; k < n; k++) chips.push({a: c.a + D * k / n, b: c.a + D * (k + 1) / n, w: found[k].w, tr: found[k].tr}); }); }
const isEn = w => /[a-z]/i.test(w) || /^(ю|ноу|сейл|стримлю|запромоутила|свайпнула)$/i.test(w.replace(/[«»"?!.,…—:]/g, ''));
function curChunk(t) { let cur = null; for (const {l, ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? .25 : 0)) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function fits(words, size) { g.font = `${size}px ${FONT}`; return g.measureText(words.join(' ')).width <= 980; }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  const col = w => cur.who === 't' ? '#ffd23f' : isEn(w) ? '#ffd23f' : '#ffffff', ws = cur.s.split(' ');
  let trY = 1730;
  let sz = 70; while (sz > 56 && !fits(ws, sz)) sz -= 2;
  if (fits(ws, sz)) outlinedWords(ws, 1640, sz, col);
  else { let best = 1, bd = 1e9; for (let i = 1; i < ws.length; i++) { const d = Math.abs(ws.slice(0, i).join(' ').length - ws.slice(i).join(' ').length); if (d < bd) { bd = d; best = i; } }
    outlinedWords(ws.slice(0, best), 1604, 64, col); outlinedWords(ws.slice(best), 1680, 64, col); trY = 1762; }
  g.restore(); if (!cur.tr) return; const tw = cur.tr.split(' ');
  if (fits(tw, 44)) outlinedWords(tw, trY, 46, () => '#ffffff');
  else { const m = Math.ceil(tw.length / 2); outlinedWords(tw.slice(0, m), trY - 6, 44, () => '#ffffff'); outlinedWords(tw.slice(m), trY + 50, 44, () => '#ffffff'); } }
function chip(t) { const c = chips.find(q => t >= q.a && t < q.b); if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = 2.6;
function hook(t) { if (t > HOOK_END + .3) return; const k = ease(t / .25) * (1 - ease((t - HOOK_END) / .3)); g.save(); g.globalAlpha = k; g.translate(560, 300); g.rotate(-.025);
  rr(-420, -110, 840, 220, 30, '#fffaf0', 8); txt('ЖАННА ПОСПОРИЛА', 0, -40, 72, INK); txt('НА ШУБУ', 0, 46, 92, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, '#d63a8a');
  const R = [['PIECE OF CAKE', 'проще простого'], ['JUMPING JACKS', 'прыжки-звёздочки'], ['TREADMILL', 'беговая дорожка'], ['NO PAIN, NO GAIN', 'без боли нет результата'], ['REPS', 'повторения'], ['QUIT', 'бросить, сдаться'], ["I'M GONNA BE SO SORE", 'завтра всё будет болеть']];
  R.forEach(([en, ru], i) => { const y = 400 + i * 124; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Петрович заметит, чья карта?', 540, 1300, 46, INK); txt('И что бы вы сказали тренеру', 540, 1380, 46, '#d63a8a'); txt('по-английски?', 540, 1440, 46, '#d63a8a'); txt('Пишите в комменты', 540, 1540, 44, INK); g.restore(); }

function scene(c, t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); gym(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.04)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  const P = zPos(t); treadmill(t, 'deck'); if (!P.onTM) treadmill(t, 'console'); floorBag(t);
  if (t >= TL.FAINT) { trainer(t, true); zhanna(t); trainerHands(t, TA.a, TA.x, TA.y); } else { trainer(t); zhanna(t); }
  if (P.onTM) treadmill(t, 'console'); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }
function frame(t) { NOW = t; const c = camAt(t); scene(c, t);
  if (c.sh.k !== 'END') panels(t); hourglass(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); } }
function cover(t) { NOW = t; scene({z: .95, x: 545, y: 900}, t);
  g.save(); g.translate(540, 495); g.rotate(-.02); rr(-450 + 8, -165 + 10, 900, 330, 34, 'rgba(42,34,48,0.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
  txt('ЖАННА ПОСПОРИЛА', 0, -88, 76, INK); txt('НА ШУБУ', 0, 10, 112, '#d63a8a'); txt('и перекупила тренера', 0, 106, 58, INK); g.restore(); }
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { cover(+(arg || BY.z5.at + 1.5)); fs.writeFileSync(outName || 'final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep3.srt', out); }
else if (mode === 'chunks') { for (const {l, ch} of CH) for (const c of ch) console.log(l.id, c.a.toFixed(2), c.b.toFixed(2), c.s, '|', c.tr || ''); console.log(chips.map(c => c.w + '@' + c.a.toFixed(1)).join(' ')); }
