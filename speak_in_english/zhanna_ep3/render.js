// «Тётя Жанна с Брайтона», ep3 «Жанна в спортзале» — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | chunks   (NOCAP=1 hides captions)
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
const TR = {hair: 'short', headband: '#e0283a', pal: {skin: '#c98e66', skinS: '#b07650', hair: '#3a2a20', brow: '#2a1a14', top: '#2fa8a0', topS: '#23867f', collar: '#23867f', bottom: '#2a2a33', shorts: '#2a2a33', legs: '#c98e66', shoe: '#ffffff', sole: '#e0283a', armW: 40, whistle: '#e0283a', label: 'COACH'}, x: 850, s: .8};

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
const ZG = {
  walk: s => [[s * 78, -860], [s * 100, -720], [s * 105, -590]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-160, -740], [-86, -640]],
  stop: s => s > 0 ? [[78, -860], [190, -840], [290, -900]] : [[-78, -860], [-160, -740], [-86, -640]],
  card: s => s > 0 ? [[78, -860], [190, -880], [230, -1010]] : [[-78, -860], [-160, -740], [-86, -640]],
  phone: s => s > 0 ? [[78, -860], [190, -860], [150, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  film: s => s > 0 ? [[78, -860], [190, -840], [290, -890]] : [[-78, -860], [-160, -740], [-86, -640]],
  selfie: s => s > 0 ? [[78, -860], [200, -1000], [260, -1130]] : [[-78, -860], [-190, -820], [-200, -960]],
};
const TG = {
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  present: s => s < 0 ? [[-78, -860], [-170, -770], [-260, -830]] : [[78, -860], [160, -740], [86, -640]],
  cheer: s => [[s * 78, -860], [s * 205, -960], [s * 265, -1130]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  curl: s => { const k = (1 - Math.cos(NOW * 5.2 + (s > 0 ? 0 : Math.PI))) / 2; return [[s * 78, -860], [s * 118, -725], [s * (122 - 30 * k), -590 - 260 * k]]; },
  tired: s => [[s * 80, -850], [s * 96, -700], [s * 98, -560]],
};
const FRONT = new Set(['explain', 'brooch']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'card'], [.62, 'wag']], z2: [[0, 'explain'], [.42, 'brooch'], [.75, 'shrug']], z3: [[0, 'explain'], [.5, 'shrug']], z4: [[0, 'stop'], [.5, 'brooch']], z5: [[0, 'film']],
  z6: [[0, 'selfie']], z7: [[0, 'explain'], [.55, 'shrug']], z8: [[0, 'wag'], [.5, 'explain']], z9: [[0, 'phone']]};
const TPLAN = {t1: [[0, 'cheer'], [.45, 'present']], t2: [[0, 'present'], [.5, 'hips']], t3: [[0, 'cheer']], t4: [[0, 'present'], [.4, 'curl']], t5: [[0, 'present']], t6: [[0, 'shrug']], t7: [[0, 'tired']]};
const WALKOUT = BY.z9.end + .1;
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id]) if (u >= k) gg = v; return gg; } return idle; }
function zAct(t) { if (t < BY.z1.at + .1 || t >= WALKOUT) return {g: 'walk', mood: 'smug'};
  if (t >= BY.z5.at - .2 && t < BY.z5.end + .1) return {g: 'film', mood: 'smug'};
  if (t >= BY.z6.at - .1 && t < BY.z6.end + .15) return {g: 'selfie', mood: 'grin'};
  if (t >= BY.z9.at - .5) return {g: 'phone', mood: 'smug'};
  const l = lineAt(t), m = l && l.who === 't' ? (l.id === 't3' ? 'flat' : 'smug') : 'smug';
  return {g: plan(ZPLAN, 'z', t, 'hips'), mood: l && l.id === 'z4' && (t - l.at) / (l.end - l.at) > .55 ? 'happy' : m}; }
function tAct(t) { const l = lineAt(t);
  if (t >= BY.t7.at - .1) return {g: 'tired', mood: 'sad'};
  if (t >= BY.t4.at + (BY.t4.end - BY.t4.at) * .4 && t < BY.t5.at - .05) return {g: 'curl', mood: l && l.who === 't' ? undefined : 'grin'};
  if (t >= BY.t6.at - .1 && t < BY.t6.end + .05) return {g: 'shrug', mood: 'surprised'};
  if (t >= BY.z6.at && t < BY.t6.at) return {g: 'hips', mood: 'flat'};
  if (t >= BY.t6.end && t < BY.t7.at) return {g: 'tired', mood: 'flat'};
  const g1 = plan(TPLAN, 't', t, 'hips'); return {g: g1, mood: l && l.who === 't' ? undefined : l && l.id === 'z3' ? 'flat' : l && l.id === 'z2' ? 'surprised' : 'grin'}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function phoneProp(x, y, w, h, ang, rec) { g.save(); g.translate(x, y); g.rotate(ang); rr(-w / 2, -h / 2, w, h, 12, '#e05a8a', 5); rr(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 7, '#3a3550', 3); if (rec) { ell(-w / 2 + 20, -h / 2 + 20, 6, 6, '#ff3a3a', 0); } g.restore(); }
function zX(t) { const inK = ease((t - .2) / 1.8), outK = ease((t - WALKOUT) / 2.6); return lerp(-260, ZH.x, inK) + lerp(0, -760, outK); }
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH;
  const x = zX(t) + Math.sin(t * 1.4) * 4 * (spk ? 1.4 : 1), walking = t < 2.0 || t > WALKOUT, bob = walking ? Math.abs(Math.sin(t * 9)) * 9 : 0;
  const tilt = spk ? .06 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  ell(x, FEET + 4, 150 * c.s, 18, 'rgba(30,30,40,.22)', 0);
  T.draw(g, {...c, x, y: FEET - bob, sq: br, arms: wig(a.fn, t, spk ? 8 : 2), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look: a.act.g === 'film' || a.act.g === 'phone' ? .6 : spk ? .2 : .6});
  const S = c.s, bx = x - 40 * S, by = FEET - bob - 790 * S * br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = FEET - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  const ok = a.e > .8, G = a.act.g;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hd = P3[2], hx = x + Hd[0] * S, hy = FEET - bob + Hd[1] * S * br, ang = Math.atan2(Hd[1] - E[1], Hd[0] - E[0]);
    if (G === 'phone' && s > 0) continue;
    if (G === 'selfie' && s < 0 && ok) dumbbell(hx, hy, ang + Math.PI / 2, .7, '#ff7ac0');
    hand(hx, hy, ang, S, c.pal.skin, '#d63a8a', true);
    if (s > 0 && ok && G === 'card') { g.save(); g.translate(hx + 10, hy - 50); g.rotate(-.12); rr(-62, -38, 124, 76, 10, '#f2c820', 5); txt('GYM', 0, -6, 30, INK); ln([[-40, 20], [40, 20]], 4, '#b08a10'); g.restore(); hand(hx, hy, ang, S, c.pal.skin, '#d63a8a', true); }
    if (s > 0 && ok && G === 'film') phoneProp(hx + 14, hy - 30, 96, 58, -.08, Math.floor(t * 2) % 2 === 0);
    if (s > 0 && ok && G === 'selfie') { phoneProp(hx + 6, hy - 40, 54, 92, .15, false); ell(hx - 4, hy - 72, 5, 5, '#2a2230', 0);
      for (const ft of TL.SELFIE) { const k = (t - ft) / .25; if (k > 0 && k < 1) { g.save(); g.globalAlpha = 1 - k; star(hx - 4, hy - 72, 30 + 50 * k, '#ffffff', 0, 8, 0); g.restore(); } } } }
  if (G === 'phone' && ok) { const Hd = a.fn(1)[2]; rr(x + Hd[0] * S - 24, FEET + Hd[1] * S - 64, 48, 90, 10, '#e05a8a', 5); } }
function trainer(t) { const l = lineAt(t), spk = l && l.who === 't', a = blendArms(tAct, TG, t), c = TR, tired = t >= BY.t6.end;
  const x = c.x + Math.sin(t * 1.2 + 2) * 3, hype = !tired && !spk ? Math.abs(Math.sin(t * 2.4)) * 4 : 0;
  ell(x, FEET + 4, 150 * c.s, 18, 'rgba(30,30,40,.22)', 0);
  T.draw(g, {...c, x, y: FEET - hype, sq: tired ? .975 : 1, arms: wig(a.fn, t, spk ? 7 : 2), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 5), headband: c.headband,
    tilt: tired ? .07 + .02 * Math.sin(t) : spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: -.6, sweat: tired || a.act.g === 'curl'});
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hd = P3[2], hx = x + Hd[0] * c.s, hy = FEET - hype + Hd[1] * c.s, ang = Math.atan2(Hd[1] - E[1], Hd[0] - E[0]);
    if (a.act.g === 'curl' && a.e > .6) dumbbell(hx + Math.cos(ang) * 14, hy + Math.sin(ang) * 14, ang + Math.PI / 2, .8, '#3a3f4a');
    hand(hx, hy, ang, c.s, c.pal.skin, null, false); } }

// ---------- clouds (Zhanna's thoughts) and cards (cutaways) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
function memberCard(x, y, nameFn) { g.save(); g.translate(x, y); g.rotate(-.05); rr(-150, -95, 300, 190, 20, '#f2c820', 6); txt('GYM', -64, -46, 40, INK); txt('MEMBERSHIP', 0, 0, 36, INK); ln([[-118, 30], [118, 30]], 4, '#b08a10'); if (nameFn) nameFn(); g.restore(); }
function phoneScreen(x, y, w, h) { rr(x, y, w, h, 34, '#2a2230', 0); rr(x + 14, y + 16, w - 28, h - 32, 24, '#3a3550', 5); }
function avatar(x, y, r) { ell(x, y, r, r, '#c8a060', 5); ell(x, y - r * .2, r * .38, r * .38, '#8a6a3a', 0); g.beginPath(); g.ellipse(x, y + r * .62, r * .62, r * .42, 0, Math.PI, 0); g.fillStyle = '#8a6a3a'; g.fill(); }
function pill(x, y, w, s, bg, fg, size = 34) { rr(x - w / 2, y - 30, w, 60, 30, bg, 5); txt(s, x, y + 2, size, fg); }
const CARD = {
  blocked: u => { memberCard(240, 200, () => { txt('from Petrovich', -10, 62, 28, '#7a4a10'); heart(110, 60, 14, '#ff5a8a'); });
    phoneScreen(500, 40, 260, 400); avatar(630, 140, 52); txt('Petrovich', 630, 236, 34, '#ffffff'); if (u > .45) { const k = ease((u - .45) / .1); g.save(); g.globalAlpha = k; pill(630, 330, 210, 'BLOCKED', '#e0283a', '#ffffff'); g.restore(); } },
  sushi: u => { for (let i = 0; i < 3; i++) { const x = 170 + i * 260, y = 210; rr(x - 110, y + 10, 220, 46, 12, '#c8955a', 6); for (let k = 0; k < 3; k++) { ell(x - 66 + k * 66, y - 16, 30, 30, '#2a3a30', 5); ell(x - 66 + k * 66, y - 16, 20, 20, '#ffffff', 0); ell(x - 66 + k * 66, y - 16, 9, 9, '#ff8a5a', 0); } }
    txt('SUSHI SETS', 430, 380, 70, '#d63a8a'); },
  spa: u => { txt('PAIN', 200, 170, 96, '#7a6a72'); const k1 = ease((u - .08) / .15); if (k1 > 0) { ln([[90, 210], [90 + 220 * k1, 130]], 14, '#e0283a'); ln([[90, 130], [90 + 220 * k1, 210 - 80 * k1]], 14, '#e0283a'); }
    if (u > .3) { txt('GAIN', 600, 100, 76, '#2f9a5a'); txt('=', 600, 162, 56, INK);
      const k2 = ease((u - .4) / .12); g.save(); g.globalAlpha = k2; txt('SPA', 600, 228, 70, '#d63a8a'); for (const [y, rx] of [[400, 86], [356, 68], [318, 50]]) ell(580, y, rx, 24, '#6a6f7a', 6); rr(700, 330, 40, 90, 8, '#fffaf0', 5); ell(720, 318, 9, 16, '#ffb030', 3); g.restore(); } },
  selfie: u => { phoneScreen(110, 30, 280, 420); g.save(); g.beginPath(); g.roundRect(128, 50, 244, 380, 22); g.clip(); g.fillStyle = '#ffe4ee'; g.fillRect(128, 50, 244, 380);
      T.draw(g, {...ZH, x: 250, y: 600, s: .3, mood: 'grin', blink: false, tilt: -.08, pose: 'wave', look: 0}); g.restore(); txt('zhanna_brighton', 250, 72, 22, INK);
    txt('#workout', 610, 120, 64, '#d63a8a', HW); const k = ease((u - .25) / .15); g.save(); g.globalAlpha = k; pill(610, 250, 260, 'POSTED', '#2f9a5a', '#ffffff', 38); g.restore();
    for (let i = 0; i < 3; i++) { const kk = ease((u - .4 - i * .1) / .12); if (kk > 0) heart(500 + i * 110, 380 - 20 * kk, 26 * kk, '#ff5a8a'); } },
  story: u => { phoneScreen(110, 30, 280, 420); g.save(); g.beginPath(); g.roundRect(128, 50, 244, 380, 22); g.clip(); g.fillStyle = '#dde4ec'; g.fillRect(128, 50, 244, 380);
      const save = NOW; NOW = u * 20; T.draw(g, {...TR, x: 250, y: 620, s: .3, mood: 'sad', sweat: true, headband: TR.headband, arms: TG.curl, blink: false}); NOW = save; g.restore(); txt('zhanna_brighton', 250, 72, 22, INK);
    txt('MY WORKOUT', 610, 120, 60, '#d63a8a'); for (let i = 0; i < 4; i++) { const kk = ease((u - .15 - i * .1) / .12); if (kk > 0) heart(470 + i * 95, 270 - 30 * kk, 30 * kk, '#ff5a8a'); } },
  call: u => { phoneScreen(110, 30, 280, 420); avatar(250, 140, 54); txt('Petrovich', 250, 238, 36, '#ffffff'); pill(250, 320, 220, 'UNBLOCKED', '#2f9a5a', '#ffffff', 30);
    ell(250, 400, 26, 26, '#e0283a', 4);
    memberCard(620, 160, null); const k = ease((u - .35) / .12); txt('ZHANNA', 620, 330, 46, '#7a6a72'); if (k > 0) ln([[530, 332], [530 + 180 * k, 328]], 9, '#e0283a');
    const k2 = ease((u - .5) / .12); g.save(); g.globalAlpha = k2; txt('PETROVICH', 620, 410, 52, '#d63a8a'); g.restore(); },
};
function panel(id, u, t, a0, b0, thought) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const ZT = [[400, 740, 16], [360, 690, 24]];
const PANELS = [['blocked', 3.0, BY.z1.end + .35, ZT], ['sushi', BY.z3.at, BY.z3.end + .35, ZT], ['spa', BY.z4.at, BY.z4.end + .35, ZT],
  ['selfie', BY.z6.at + (BY.z6.end - BY.z6.at) * .5, BY.z6.end + .45, null], ['story', BY.z8.at + .2, BY.z8.end + .3, null], ['call', BY.z9.at, BY.z9.end + .2, null]];
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b, th); }

// ---------- shots ----------
const CAM = {TWO: [1.05, 565, 1020], Z_MED: [1.6, 300, 900], T_MED: [1.6, 865, 930], Z_UP: [1.5, 310, 760], T_UP: [1.5, 865, 790], T_CU: [2.0, 855, 880]};
const SH = [[0, 'TWO'], [2.8, 'Z_UP'], [BY.t1.at - .1, 'T_MED'], [BY.z2.at - .1, 'Z_MED'], [BY.t2.at - .1, 'T_MED'], [BY.z3.at - .1, 'Z_UP'], [BY.t3.at - .1, 'T_CU'], [BY.z4.at - .1, 'Z_UP'],
  [BY.t4.at - .1, 'TWO'], [BY.z5.at - .1, 'Z_MED'], [BY.t5.at - .1, 'T_MED'], [BY.z6.at - .1, 'Z_UP'], [BY.t6.at - .1, 'T_UP'], [BY.z7.at - .1, 'Z_MED'], [BY.t7.at - .1, 'T_CU'], [BY.z8.at - .1, 'Z_UP'],
  [BY.z9.at - .5, 'Z_UP'], [WALKOUT - .1, 'TWO'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'TWO' : sh.k, [z, x, y] = CAM[k], u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 || sh.k === 'END' ? 0 : .04 * ease(u), punch = sh.at > 0 && sh.k !== 'END' ? .04 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = [['membership', 'абонемент'], ['gym', 'спортзал'], ['ю ноу', 'you know — понимаешь'], ['заблокала', 'block — заблокировала'], ['Краш', 'crush — симпатия (и «разнести»)'],
  ['суши-сеты', 'set — подход'], ['Pain', 'боль'], ['gain', 'результат, прирост'], ['зачекала', 'check — рассмотрела'], ['сторис', 'stories — истории в соцсети'],
  ['Запостила', 'post — выложила'], ['Workout done', 'тренировка окончена'], ['reps', 'повторения'], ['разблокала', 'unblock — разблокировала']];
const GLINE = {z7: [['reps', 'повторения'], ['ю ноу', 'you know — понимаешь']], z8: [['no pain, no gain', 'без боли нет результата']], z9: [['разблокала', 'unblock — разблокировала'], ['Membership', 'абонемент'], ['ю ноу', 'you know — понимаешь']]};
const TRB = {t1: ['Добро пожаловать!', 'Готовы разнести первую тренировку?'], t2: ['Хорошо! Начнём полегче.', 'Три подхода по десять повторений.'], t3: ['Без боли нет результата!'],
  t4: ['Сначала смотрите на меня. Вот так…', 'и напрягаем!'], t5: ['Ваша очередь! Давайте, у вас получится!'], t6: ['Стоп… вы не сделали ни одного повторения!'], t7: ['Я сделал за вас все три подхода…', 'Завтра у меня всё будет болеть.']};
const CAPTXT = {z8: 'Вот, деточка: no pain, no gain. Тебе pain, мне gain.'};
function chunks(l) { const text = CAPTXT[l.id] || l.text; const parts = [].concat(...text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; const C = out.map((c, i) => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, tr: (TRB[l.id] || [])[i], who: l.who}; });
  for (;;) { const i = C.findIndex(c => c.b - c.a < 1.1); if (i < 0 || C.length < 2) break; const j = i + 1 < C.length ? i : i - 1, A = C[j], B = C[j + 1];
    C.splice(j, 2, {s: A.s + ' ' + B.s, a: A.a, b: B.b, tr: [A.tr, B.tr].filter(Boolean).join(' ') || undefined, who: A.who}); }
  return C; }
const CH = L.map(l => ({l, ch: chunks(l)}));
const chips = []; for (const {l, ch} of CH) { if (l.who !== 'z') continue; const G2 = GLINE[l.id] || GLOSS;
  ch.forEach((c, ci) => { const low = c.s.toLowerCase(), found = G2.map(([w, tr]) => ({w, tr, i: low.indexOf(w.toLowerCase())})).filter(x => x.i >= 0).sort((a, b) => a.i - b.i);
    const end = c.b + (ci === ch.length - 1 ? .25 : 0), D = end - c.a, n = Math.min(found.length, Math.floor(D / 1.2)); for (let k = 0; k < n; k++) chips.push({a: c.a + D * k / n, b: c.a + D * (k + 1) / n, w: found[k].w, tr: found[k].tr}); }); }
const isEn = w => /[a-z]/i.test(w) || /^(ю|ноу|заблокала|краш|сеты|суши-сеты|зачекала|сторис|запостила|разблокала)$/i.test(w.replace(/[«»"?!.,…—:]/g, ''));
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
function hook(t) { if (t > HOOK_END + .3) return; const k = ease(t / .25) * (1 - ease((t - HOOK_END) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.025);
  rr(-440, -110, 880, 220, 30, '#fffaf0', 8); txt('ЖАННА ИДЁТ', 0, -40, 76, INK); txt('В СПОРТЗАЛ', 0, 46, 88, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, '#d63a8a');
  const R = [['WORKOUT', 'тренировка'], ['REP / SET', 'повторение / подход'], ['NO PAIN, NO GAIN', 'без боли нет результата'], ['YOUR TURN', 'твоя очередь'], ['YOU GOT THIS', 'у тебя получится'], ["I'M SORE", 'мышцы болят (после тренировки)'], ['MEMBERSHIP', 'абонемент']];
  R.forEach(([en, ru], i) => { const y = 410 + i * 128; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Кто вы в спортзале?', 540, 1345, 48, INK); txt('Жанна, тренер или Петрович?', 540, 1415, 48, '#d63a8a'); txt('Пишите в комменты', 540, 1520, 44, INK); g.restore(); }

function scene(c, t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); gym(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.04)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); trainer(t); zhanna(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H); }
function frame(t) { NOW = t; const c = camAt(t); scene(c, t);
  if (c.sh.k !== 'END') panels(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); } }
function cover(t) { NOW = t; scene({z: 1.04, x: 565, y: 880}, t);
  g.save(); g.translate(540, 495); g.rotate(-.02); rr(-450 + 8, -165 + 10, 900, 330, 34, 'rgba(42,34,48,0.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
  txt('ЖАННА ПРИШЛА', 0, -88, 82, INK); txt('В СПОРТЗАЛ', 0, 8, 104, '#d63a8a'); txt('и сделала 40 селфи', 0, 104, 64, INK); g.restore(); }
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { cover(+(arg || BY.z6.at + .4)); fs.writeFileSync(outName || 'final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep3.srt', out); }
else if (mode === 'chunks') { for (const {l, ch} of CH) for (const c of ch) console.log(l.id, c.a.toFixed(2), c.b.toFixed(2), c.s, '|', c.tr || ''); console.log(chips.map(c => c.w + '@' + c.a.toFixed(1)).join(' ')); }
