// «Тётя Жанна с Брайтона», ep4 v2 «Жанна и дейтинг-приложение» — flat 2D (engine of ep2).
// node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover      (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC', PINK = '#d63a8a', RED = '#e0283a', GREEN = '#2f9a5a';
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
function fitTxt(s, x, y, size, col, maxW, font = FONT, align = 'center') { g.font = `${size}px ${font}`; while (g.measureText(s).width > maxW && size > 16) { size -= 2; g.font = `${size}px ${font}`; } txt(s, x, y, size, col, font, align); return size; }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }
function heart(x, y, s, fill = '#ff5a8a', lw = 4) { g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.4, y - s * .1, x - s * .7, y - s * 1.1, x, y - s * .35); g.bezierCurveTo(x + s * .7, y - s * 1.1, x + s * 1.4, y - s * .1, x, y + s * .9); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
// wraps words into lines no wider than maxW; returns the lines
function wrap(s, size, maxW, font = FONT) { g.font = `${size}px ${font}`; const out = []; let cur = ''; for (const w of s.split(' ')) { const nx = cur ? cur + ' ' + w : w; if (g.measureText(nx).width > maxW && cur) { out.push(cur); cur = w; } else cur = nx; } if (cur) out.push(cur); return out; }
function para(s, x, y, size, col, maxW, lh = 1.18, align = 'left') { const ls = wrap(s, size, maxW); ls.forEach((l, i) => txt(l, x, y + i * size * lh, size, col, FONT, align)); return ls; }

// ---------- living room on Brighton (flat, blurred) ----------
const FEET = 1720, SEAT = 1330;
function room(t) {
  g.fillStyle = '#f3dcbc'; g.fillRect(-1200, -1200, 3480, 2900); g.fillStyle = '#ecd0aa';
  for (let x = -1200; x < 2280; x += 90) for (let y = -1200; y < 1500; y += 120) { const o = ((y / 120) % 2) * 45; ell(x + o, y, 10, 14, '#ecd0aa', 0); }
  // carpet on the wall
  rr(170, 300, 740, 700, 18, '#9a2a34', 8); rr(200, 330, 680, 640, 10, '#b8323a', 5);
  for (const [cx, cy] of [[540, 650]]) { poly([[cx, cy - 250], [cx + 230, cy], [cx, cy + 250], [cx - 230, cy]], '#2a3a6a', 6); poly([[cx, cy - 170], [cx + 150, cy], [cx, cy + 170], [cx - 150, cy]], '#d9a64a', 5); poly([[cx, cy - 80], [cx + 70, cy], [cx, cy + 80], [cx - 70, cy]], '#9a2a34', 4); }
  for (const [cx, cy] of [[260, 400], [820, 400], [260, 900], [820, 900]]) poly([[cx, cy - 50], [cx + 50, cy], [cx, cy + 50], [cx - 50, cy]], '#d9a64a', 4);
  for (let x = 185; x < 900; x += 22) { ln([[x, 1000], [x, 1030]], 4, '#d9a64a'); ln([[x, 270], [x, 300]], 4, '#d9a64a'); }
  // cabinet with crystal (left)
  rr(-330, 260, 430, 1300, 14, '#8a5a3a', 8); for (const y of [300, 700]) { rr(-300, y, 370, 360, 8, '#cfe6ef', 6);
    for (let i = 0; i < 4; i++) { const x = -260 + i * 90; poly([[x, y + 160], [x + 50, y + 160], [x + 40, y + 230], [x + 10, y + 230]], '#eaf6ff', 4); ln([[x + 25, y + 230], [x + 25, y + 280]], 5); ln([[x + 8, y + 284], [x + 42, y + 284]], 5); }
    ln([[-300, y + 300], [70, y + 300]], 6); }
  rr(-300, 1100, 370, 400, 8, '#7a4a2e', 6);
  // window with the ocean (right)
  rr(950, 280, 420, 640, 10, '#bfe3f5', 9); g.fillStyle = '#5aa6d6'; g.fillRect(955, 620, 410, 140); g.fillStyle = '#f2dca0'; g.fillRect(955, 760, 410, 155);
  ell(1180, 420, 45, 45, '#ffe680', 5); ln([[950, 600], [1370, 600]], 6); ln([[1160, 280], [1160, 920]], 8);
  rr(900, 240, 90, 760, 30, '#d9a64a', 6);
  // floor + rug
  g.fillStyle = '#c89060'; g.fillRect(-1200, 1500, 3480, 600); for (let x = -1200; x < 2280; x += 140) ln([[x, 1500], [x - 60, 2100]], 4, '#b07a4c');
  ln([[-1200, 1500], [2280, 1500]], 7); rr(60, 1640, 960, 300, 30, '#8a2a40', 6); rr(100, 1670, 880, 240, 20, '#c85a6a', 4);
  // plant
  rr(1000, 1300, 150, 200, 18, '#e7e2d6', 7); for (let k = 0; k < 6; k++) { g.save(); g.translate(1075, 1310); g.rotate(-1.0 + k * .4); ell(0, -110, 26, 100, '#3cb371', 5); g.restore(); }
}
// leopard sofa (sharp, foreground): back behind the characters, seat + arms in front
function spots(x0, y0, w, h, seed) { for (let i = 0; i < w * h / 4200; i++) { const x = x0 + hash(i + seed) * w, y = y0 + hash(i * 1.7 + seed + 3) * h, r = 12 + hash(i + seed + 7) * 10;
  g.beginPath(); g.ellipse(x, y, r, r * .8, hash(i + seed) * 3, 0, 5.2); g.strokeStyle = '#4a2e1a'; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); ell(x, y, r * .45, r * .35, '#c8862a', 0); } }
function sofaBack() { g.save(); g.beginPath(); g.roundRect(40, 960, 1000, 420, 70); g.fillStyle = '#e8b860'; g.fill(); g.clip(); spots(40, 960, 1000, 420, 1); g.restore(); rr(40, 960, 1000, 420, 70, null, 8);
  for (const [x, c] of [[110, '#d63a8a'], [880, '#3aa89a']]) { g.save(); g.translate(x + 50, 1150); g.rotate(x < 500 ? -.15 : .15); rr(-70, -80, 140, 160, 34, c, 7); g.restore(); } }
function sofaFront() { g.save(); g.beginPath(); g.roundRect(30, SEAT, 1020, 240, 40); g.fillStyle = '#e8b860'; g.fill(); g.clip(); spots(30, SEAT, 1020, 240, 9); g.restore(); rr(30, SEAT, 1020, 240, 40, null, 8);
  ln([[540, SEAT + 10], [540, SEAT + 230]], 6); for (const x of [-30, 950]) { g.save(); g.beginPath(); g.roundRect(x, 1160, 160, 420, 60); g.fillStyle = '#e0ac50'; g.fill(); g.clip(); spots(x, 1160, 160, 420, x + 40); g.restore(); rr(x, 1160, 160, 420, 60, null, 8); }
  for (const x of [80, 1000]) rr(x - 20, 1575, 40, 50, 8, '#d9a64a', 5); }

// ---------- characters ----------
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, seated: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 330, s: .78};
const LZ = {hair: 'ponytail', lashes: true, glasses: true, seated: true, pal: {skin: '#f2d0b8', skinS: '#e2b498', hair: '#6a4030', hairS: '#4a2e24', brow: '#4a2e24', top: '#3aa89a', topS: '#2e8a7e', collar: '#ffffff', bottom: '#2a3a6a', legs: '#2a3a6a', shoe: '#ffffff', sole: '#ffffff'}, x: 760, s: .74};
const ZG = {
  lap: s => [[s * 78, -860], [s * 124, -730], [s * 46, -640]],
  palm: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : [[-78, -860], [-124, -730], [-46, -640]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [190, -880], [250, -980]] : [[-78, -860], [-124, -730], [-46, -640]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-124, -730], [-46, -640]],
  scroll: s => s > 0 ? [[78, -860], [150, -720], [80, -660]] : [[-78, -860], [-90, -720], [20, -690]],
  scrollUp: s => s > 0 ? [[78, -860], [150, -720], [80, -660]] : [[-78, -860], [-190, -870], [-250, -980]],
};
const LG = {
  lap: s => [[s * 78, -860], [s * 124, -730], [s * 46, -640]],
  phone: s => s < 0 ? [[-78, -860], [-150, -730], [-80, -680]] : [[78, -860], [120, -730], [10, -700]],
  present: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -820]] : [[78, -860], [124, -730], [46, -640]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
};
const FRONT = new Set(['lap', 'scroll', 'scrollUp', 'phone', 'brooch', 'explain']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
// v2: Liza holds the phone the whole time; Zhanna gestures
const ZPLAN = {z1: [[0, 'explain'], [.5, 'palm']], z2: [[0, 'brooch'], [.4, 'explain']], z3: [[0, 'brooch']], z4: [[0, 'explain'], [.62, 'palm']], z5: [[0, 'shrug'], [.75, 'wag']],
  z6: [[0, 'explain'], [.45, 'palm']], z8: [[0, 'shrug']], z9: [[0, 'brooch']], z10: [[0, 'wag'], [.4, 'palm']]};
const LPLAN = {};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who && P[l.id]) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id]) if (u >= k) gg = v; return gg; } return idle; }
const after = (id, d) => BY[id].at + d;
function zAct(t) { const l = lineAt(t), id = l && l.id;
  if (t >= TL.END) return {g: 'lap', mood: 'smug'};
  const gg = plan(ZPLAN, 'z', t, 'lap');
  const mood = id === 'z1' && t < after('z1', 2) ? 'angry' : id === 'z5' ? 'angry' : id === 'l5' && t > after('l5', 4) ? 'surprised' : id === 'z6' ? 'smug' : id === 'z8' || (id === 'l8' && t > after('l8', 2.5)) ? 'surprised'
    : id === 'l9' ? 'surprised' : id === 'z9' || id === 'l10' ? 'sad' : id === 'z4' ? 'grin' : 'smug';
  return {g: gg, mood}; }
function lAct(t) { const l = lineAt(t), id = l && l.id;
  if (t >= BY.z10.end + .1) return {g: 'phone', mood: 'flat', look: 0};   // flat look into the camera
  const mood = ['z2', 'z3', 'z9', 'l10'].includes(id) ? 'flat' : ['z5', 'z8', 'l9'].includes(id) ? 'surprised' : id === 'z6' || id === 'z4' ? 'grin' : (l && l.who === 'l') ? 'happy' : 'flat';
  return {g: 'phone', mood, look: id === 'l10' ? 0 : undefined}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .24; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .24; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function phoneProp(x, y, ang, S, caseCol) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S); rr(-44, -78, 88, 150, 16, caseCol, 6); rr(-35, -68, 70, 128, 9, '#ffe4ee', 3); heart(0, -10, 14, '#ff5a8a', 3); rr(-22, 30, 44, 12, 6, '#ff9ac8', 0); g.restore(); }
function person(t, c, act, GT, who, seedB, lookIdle) { const l = lineAt(t), spk = l && l.who === who, a = blendArms(act, GT, t), x = c.x + Math.sin(t * 1.3 + seedB) * 3;
  const tilt = spk ? .05 * Math.sin(t * 2.6 + seedB) : .025 * Math.sin(t * 1.1 + seedB) + (who === 'z' ? .02 : -.02), br = 1 - .006 * (1 + Math.sin(t * 2.2 + seedB));
  T.draw(g, {...c, x, y: FEET, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 8 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, seedB), tilt, look: a.act.look !== undefined ? a.act.look : spk ? .15 * Math.sign(lookIdle) : lookIdle});
  return {x, a, br}; }
function hands(c, P, nail, phoneSide, caseCol) { const {x, a, br} = P, S = c.s;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hh = P3[2], hx = x + Hh[0] * S, hy = FEET + Hh[1] * S * br, ang = Math.atan2(Hh[1] - E[1], Hh[0] - E[0]);
    if (s === phoneSide && a.e > .6) { hand(hx, hy, ang, S, c.pal.skin, nail, false); phoneProp(hx + 6 * s, hy - 46, -.08 * s, S * 1.0, caseCol); }
    else hand(hx, hy, ang, S, c.pal.skin, nail, false); } }
function zhanna(t) { const P = person(t, ZH, zAct, ZG, 'z', 2, .6), S = ZH.s, x = P.x;
  const bx = x - 40 * S, by = FEET - 790 * S * P.br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 6; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = FEET - (640 + hash(i + 9) * 200) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  hands(ZH, P, '#d63a8a', 0, '#d63a8a'); }
function liza(t) { const P = person(t, LZ, lAct, LG, 'l', 5, -.6); hands(LZ, P, '#ffd23f', P.a.act.g === 'phone' ? -1 : 0, '#3a3550'); }

// ---------- UI pieces for cards (phone screens) ----------
function avZ(x, y, r) { ell(x, y, r, r, '#ffe4ee', 5); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); ell(x, y + r * .25, r * .9, r * .75, '#f3d27a', 0); ell(x, y + r * .15, r * .5, r * .55, '#f4c8a8', 3);
  ell(x, y - r * .3, r * .62, r * .32, '#f3d27a', 3); ell(x - r * .17, y + r * .12, r * .09, r * .11, INK, 0); ell(x + r * .17, y + r * .12, r * .09, r * .11, INK, 0); ln([[x - r * .14, y + r * .42], [x + r * .14, y + r * .42]], Math.max(2, r * .08), '#d02a5a');
  ell(x, y + r * 1.0, r * .7, r * .4, PINK, 3); g.restore(); ell(x, y, r, r, null, 5); }
function fish(x, y, s, flip = 1) { g.save(); g.translate(x, y); g.scale(s * flip, s); poly([[110, 0], [175, -55], [165, 0], [175, 55]], '#7a9a6a', 5); poly([[-30, -40], [10, -78], [50, -40]], '#7a9a6a', 5);
  g.beginPath(); g.ellipse(0, 0, 125, 52, 0, 0, 7); g.fillStyle = '#b8cba0'; g.fill(); g.save(); g.clip(); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,90,60,.45)'; g.fillRect(-60 + i * 34, -60, 14, 120); } g.fillStyle = '#e8eedc'; g.fillRect(-130, 18, 260, 40); g.restore();
  g.beginPath(); g.ellipse(0, 0, 125, 52, 0, 0, 7); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); ell(-82, -10, 11, 11, '#ffffff', 4); ell(-84, -10, 5, 5, INK, 0); ln([[-125, 8], [-100, 12]], 4); g.restore(); }
function avFish(x, y, r) { ell(x, y, r, r, '#bfe3f5', 5); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); fish(x + r * .1, y, r / 150); g.restore(); ell(x, y, r, r, null, 5); }
function avMan(x, y, r, k) { const skin = ['#e8b894', '#c88a60', '#f2d0b8'][k], hair = ['#3a2a20', null, '#8a6a4a'][k]; ell(x, y, r, r, ['#d8e8c8', '#f6e0a8', '#e0d8f0'][k], 5);
  g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); ell(x, y + r * 1.0, r * .75, r * .45, ['#4a6aa8', '#6a6a6a', '#a8504a'][k], 3); ell(x, y + r * .05, r * .48, r * .55, skin, 3);
  if (hair) ell(x, y - r * .4, r * .5, r * .22, hair, 3); ell(x - r * .17, y, r * .07, r * .09, INK, 0); ell(x + r * .17, y, r * .07, r * .09, INK, 0);
  if (k === 0) ln([[x - r * .22, y + r * .25], [x + r * .22, y + r * .25]], r * .1, '#3a2a20'); if (k === 1) { rr(x - r * .4, y - r * .12, r * .34, r * .2, 4, INK, 0); rr(x + r * .06, y - r * .12, r * .34, r * .2, 4, INK, 0); }
  g.restore(); ell(x, y, r, r, null, 5); }
function avMom(x, y, r) { ell(x, y, r, r, '#f0dce8', 5); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip();
  for (const [dx, dy, sc, mom] of [[-.38, .1, .5, 0], [.36, .02, .56, 1]]) { const cx = x + dx * r, cy = y + dy * r, rs = r * sc; ell(cx, cy + rs * 1.3, rs * .8, rs * .5, mom ? '#8a5aa8' : '#4a6aa8', 3); ell(cx, cy + rs * .1, rs * .5, rs * .58, '#f2c8a8', 3);
    if (mom) { ell(cx, cy - rs * .5, rs * .55, rs * .3, '#c8c8d0', 3); ell(cx, cy - rs * .78, rs * .22, rs * .18, '#c8c8d0', 3); g.beginPath(); g.ellipse(cx - rs * .18, cy + rs * .05, rs * .1, rs * .1, 0, 0, 7); g.ellipse(cx + rs * .18, cy + rs * .05, rs * .1, rs * .1, 0, 0, 7); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
    else ell(cx, cy - rs * .45, rs * .45, rs * .2, '#3a2a20', 3); ell(cx - rs * .17, cy + rs * .05, rs * .06, rs * .08, INK, 0); ell(cx + rs * .17, cy + rs * .05, rs * .06, rs * .08, INK, 0); }
  g.restore(); ell(x, y, r, r, null, 5); }
// phone frame inside a card: x0,y0 top-left, 250x440
function phoneFrame(x0, y0, screen, title = 'matchy') { rr(x0, y0, 250, 440, 38, '#2a2230', 0); rr(x0 + 12, y0 + 14, 226, 412, 28, '#fff6fa', 4); g.save(); g.beginPath(); g.roundRect(x0 + 12, y0 + 14, 226, 412, 28); g.clip(); g.translate(x0 + 12, y0 + 14);
  g.fillStyle = '#ff9ac8'; g.fillRect(0, 0, 226, 48); heart(28, 25, 11, '#ffffff', 3); txt(title, 120, 25, 26, '#ffffff'); screen(); g.restore(); }
// profile screen (226 x 412 coordinates inside the phone)
function profileScreen(av, name, lines, extra) { rr(14, 60, 198, 200, 18, '#ffe4ee', 4); av(113, 160, 80); txt(name, 113, 290, 30, INK); if (lines) lines.forEach((s, i) => fitTxt(s, 113, 330 + i * 30, 21, '#7a6a72', 200)); if (extra) extra(); }
const ZPROF = () => profileScreen((x, y, r) => avZ(x, y, r), 'Zhanna, 39', null);
// strike-through over a block of lines
function strike(x, y, w, n, lh, k) { for (let i = 0; i < n; i++) ln([[x, y + i * lh + 2], [x + w * clamp(k * n - i), y + i * lh - 2]], 7, RED); }
function stamp(s, x, y, size, col, rot, k) { g.save(); g.globalAlpha *= clamp(k * 3); g.translate(x, y); g.rotate(rot); const sc = 1 + .5 * (1 - ease(k * 3)); g.scale(sc, sc); g.font = `${size}px ${FONT}`; const w = g.measureText(s).width + 34;
  rr(-w / 2, -size * .75, w, size * 1.5, 14, '#ffffff', 6, col); txt(s, 0, 2, size, col); g.restore(); }
function flag(x, y, s) { ln([[x, y + 70 * s], [x, y - 70 * s]], 8 * s); poly([[x, y - 70 * s], [x + 90 * s, y - 45 * s], [x, y - 15 * s]], RED, 5); }

// ---------- chunks (captions) ----------
const CHUNKS = {
  z1: ['Петрович три дня не звонит.', 'Всё — ухожу в dating app!'],
  z2: ['Лиза, пиши в bio:', 'I am hot woman with own flat', 'and big cutlets.'],
  l1: ['Тётя, big cutlets — это странно.', 'Пишем: Independent, stylish,', 'and an amazing cook.'],
  l2: ['Тётя… тридцать девять?'],
  z3: ['В душе, деточка.'],
  l3: ['Первый: Kevin, двадцать пять.', 'Looking for a sugar mama.'],
  z4: ['Деточка, я сама ищу sugar daddy!', 'Свайпаю left!'],
  l4: ['Кто-то написал: Hey.'],
  z5: ['Hay? Это же сено!', 'Он меня коровой назвал?!', 'Блокаю!'],
  l5: ["It's a match!", 'Хирург с нефтяной вышки.', 'I need five hundred dollars for a plane ticket.', 'Это scammer.'],
  z6: ['Пиши: ноу проблем, дарлинг!', 'Но сначала пусть сендит тысячу —', 'на визу, ю ноу.'],
  l6: ['No problem, darling!', 'But first, send me a thousand dollars for my visa.'],
  l7: ['Richard unmatched you. Сбежал.'],
  l8: ['Ого, super like!', 'На фото — котлеты.', 'А в bio: Made this profile to find you.'],
  z8: ['Это мои котлеты!', 'Это Петрович!'],
  l9: ['Он пишет: Why you block me?'],
  z9: ['Ой… Я его в пятницу заблокала.'],
  l10: ['Тётя… так red flag — это вы.'],
  z10: ["Пиши: It's a match.", 'Но сначала — пятьсот долларов', 'на цветы, ю ноу.'],
};
const TRC = {'I am hot woman with own flat': '«Я горячая женщина со своей квартирой', 'and big cutlets.': 'и большими котлетами»', 'Пишем: Independent, stylish,': 'Пишем: независимая, стильная', 'and an amazing cook.': 'и потрясающе готовит.',
  'Looking for a sugar mama.': 'Ищу богатую спонсоршу.', "It's a match!": 'Взаимная симпатия!', 'I need five hundred dollars for a plane ticket.': 'Мне нужно 500 долларов на билет.',
  'No problem, darling!': 'Без проблем, дорогой!', 'But first, send me a thousand dollars for my visa.': 'Но сначала пришли мне тысячу долларов на визу.', 'Richard unmatched you. Сбежал.': 'Ричард удалил мэтч — сбежал.',
  'А в bio: Made this profile to find you.': 'Создал анкету, чтобы найти тебя.', 'Он пишет: Why you block me?': 'Почему ты меня заблокировала?', "Пиши: It's a match.": 'Пиши: «Взаимная симпатия».'};
// chunk timing: char share mapped onto voiced frames of the line (pauses don't count)
function chunks(l) { const parts = CHUNKS[l.id], env = l.env, vo = env.map(e => e > .1 ? 1 : 0), cum = [0]; for (const v of vo) cum.push(cum[cum.length - 1] + v); const tot = cum[cum.length - 1] || 1;
  const tAt = f => { if (f <= 0) return l.at; if (f >= 1) return l.end; const target = f * tot; let i = 0; while (i < cum.length - 1 && cum[i + 1] < target) i++; return Math.min(l.end, l.at + i / 30); };
  const n = parts.reduce((a, c) => a + c.length, 0); let acc = 0;
  return parts.map((s, i) => { const a = i ? tAt(acc / n) - .05 : l.at; acc += s.length; return {s, a, b: i === parts.length - 1 ? l.end : tAt(acc / n) - .05, tr: TRC[s], who: l.who, id: l.id, i}; }); }
const CH = L.map(l => ({l, ch: chunks(l)})), CHB = Object.fromEntries(CH.map(({l, ch}) => [l.id, ch]));
const cs = (id, i) => CHB[id][i].a;
// chips (translation of Runglish words), only while the word is on screen and only if they can stay ≥1.2 s
const GL = {z1: [['dating app', 'приложение для знакомств']], z4: [['sugar daddy', 'богатый спонсор'], ['Свайпаю left', 'swipe left — «нет»']], z5: [['Hay', 'сено (а hey — привет)'], ['Блокаю', 'block — блокирую']],
  z6: [['ноу проблем', 'no problem — без проблем'], ['сендит', 'send — пришлёт']], l5: [['scammer', 'мошенник']], l8: [['super like', 'суперлайк']], z9: [['заблокала', 'block — заблокировала']], l10: [['red flag', 'тревожный звоночек']], z10: [['ю ноу', 'you know — понимаешь']]};
const CHIPS = []; for (const {l, ch} of CH) for (const c of ch) { if (c.tr) continue; const low = c.s.toLowerCase(), list = [];
  for (const [w, tr] of (GL[l.id] || [])) { const i = low.indexOf(w.toLowerCase()); if (i >= 0 && !CHIPS.some(q => q.c === c && q.w === w)) list.push({c, w, tr, a: c.a + (c.b - c.a) * i / c.s.length}); }
  list.sort((p, q) => p.a - q.a); const endC = c.b + (c === ch[ch.length - 1] ? .25 : 0);
  let ok = list; for (let it = 0; it < 4; it++) { ok = ok.filter((q, j) => ((ok[j + 1] ? ok[j + 1].a : endC) - Math.max(q.a - .1, c.a)) >= 1.2); }
  ok.forEach((q, j) => { q.b = ok[j + 1] ? ok[j + 1].a : endC; CHIPS.push(q); }); }
const RU_EN = /^(ю|ноу|блокаю|свайпаю|сендит|заблокала|дарлинг)$/i;
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, ''); return /[a-z]/i.test(x) || RU_EN.test(x); };
function curChunk(t) { let cur = null; for (const {l, ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? .25 : 0)) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1650); g.scale(pop, pop); g.translate(-540, -1650);
  outlinedWords(cur.s.split(' '), 1650, 68, w => isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1740, 46, () => '#ffffff'); }
function chip(t) { const c = CHIPS.find(q => t >= q.a - .1 && t < q.b); if (!c) return;
  const k = ease((t - Math.max(c.a - .1, c.c.a)) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1540 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = PINK; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }

// ---------- clouds (Zhanna's thoughts) and cards (phone screens) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
const pop = (t, a) => ease((t - a) / .25);   // items appear with a short fade
function tag(x, y) { rr(x, y - 16, 150, 32, 16, RED, 0); txt('RUNGLISH', x + 75, y + 1, 20, '#ffffff'); }
function bubble(s, x, y, maxW, right, col, tcol, size = 28) { const ls = wrap(s, size, maxW - 40); g.font = `${size}px ${FONT}`; const w = Math.max(...ls.map(l => g.measureText(l).width)) + 40, h = ls.length * size * 1.2 + 26, bx = right ? x - w : x;
  rr(bx, y, w, h, 24, col, 5); ls.forEach((l, i) => txt(l, bx + 20, y + 13 + size * .6 + i * size * 1.2, size, tcol, FONT, 'left')); return h; }
function cutlets(x, y, s) { ell(x, y, 110 * s, 60 * s, '#ffffff', 6); ell(x, y, 80 * s, 40 * s, '#f2ece0', 3); for (const [dx, dy] of [[-35, -4], [0, 6], [35, -6]]) ell(x + dx * s, y + dy * s, 30 * s, 20 * s, '#a0602e', 4); for (const dx of [-60, 60]) ln([[x + dx * s, y - 12 * s], [x + dx * s * 1.1, y - 2 * s]], 4 * s, '#3cb371'); }
function avCut(x, y, r) { ell(x, y, r, r, '#fff0d8', 5); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); cutlets(x, y + r * .1, r / 120); g.restore(); ell(x, y, r, r, null, 5); }
function avKevin(x, y, r) { avMan(x, y, r, 2); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); g.beginPath(); g.ellipse(x, y - r * .32, r * .52, r * .3, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#e0283a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); rr(x - r * .05, y - r * .38, r * .7, r * .12, 4, '#e0283a', 3); g.restore(); }
function avDoc(x, y, r) { avMan(x, y, r, 0); g.save(); g.beginPath(); g.arc(x, y, r - 3, 0, 7); g.clip(); ell(x, y + r * 1.0, r * .75, r * .45, '#3a8ae0', 3); ln([[x - r * .1, y + r * .62], [x - r * .1, y + r * .9]], 3, '#ffffff'); ell(x + r * .3, y + r * .75, r * .1, r * .1, '#f2c820', 2); g.restore(); }
function hayBale(x, y, s) { rr(x - 70 * s, y - 40 * s, 140 * s, 80 * s, 14 * s, '#e6c75a', 5); for (let i = -3; i <= 3; i++) ln([[x + i * 18 * s, y - 34 * s], [x + i * 18 * s + 6 * s, y + 34 * s]], 3, '#c9a63a'); ln([[x - 35 * s, y - 40 * s], [x - 35 * s, y + 40 * s]], 6, '#8a5a3a'); ln([[x + 35 * s, y - 40 * s], [x + 35 * s, y + 40 * s]], 6, '#8a5a3a'); }
function chatHead(av, name) { rr(30, 40, 800, 90, 0, '#ff9ac8', 0); av(95, 85, 36); txt(name, 150, 85, 38, '#ffffff', FONT, 'left'); }
const CARD = {
  bio: t => { phoneFrame(60, 40, () => { ZPROF(); if (t > BY.l2.at) { g.save(); g.globalAlpha *= pop(t, BY.l2.at); g.beginPath(); g.ellipse(170, 290, 30, 22, 0, 0, 7); g.strokeStyle = RED; g.lineWidth = 5; g.stroke(); g.restore(); } });
    txt('BIO', 360, 76, 44, PINK, FONT, 'left');
    const a1 = cs('z2', 1), a2 = cs('l1', 0) + .3, a3 = cs('l1', 1);
    g.save(); g.globalAlpha *= pop(t, a1); tag(360, 124); const L1 = para('I am hot woman with own flat and big cutlets.', 360, 168, 32, '#7a6a72', 450);
    const yc = 168 + L1.length * 37 + 10; ln([[362, yc], [372, yc + 10], [390, yc - 10]], 5, GREEN); fitTxt("I'm a hot woman with my own flat", 400, yc, 26, GREEN, 420, FONT, 'left'); g.restore();
    if (t > a2) strike(356, 168, 420, L1.length, 37, (t - a2) / .5);
    g.save(); g.globalAlpha *= pop(t, a3); para('Independent, stylish, and an amazing cook.', 360, 320, 38, GREEN, 450); g.restore();
    if (t > BY.z3.at) { g.save(); g.globalAlpha *= pop(t, BY.z3.at); txt('39 = в душе', 205, 470, 30, PINK, HW); g.restore(); } },
  kevin: t => { const out = clamp((t - TL.SW1) / .35);
    phoneFrame(60, 40, () => { g.save(); g.translate(113 - ease(out) * 320, 230); g.rotate(-ease(out) * .5); g.translate(-113, -230); rr(14, 60, 198, 340, 18, '#ffffff', 4);
      g.save(); g.beginPath(); g.roundRect(14, 60, 198, 340, 18); g.clip(); profileScreen((x, y, r) => avKevin(x, y, r), 'Kevin, 25', ['Looking for', 'a sugar mama']); g.restore();
      if (out > 0) { g.save(); g.globalAlpha *= clamp(out * 4); ell(113, 160, 60, 60, 'rgba(255,255,255,.85)', 7, RED); ln([[83, 130], [143, 190]], 12, RED); ln([[143, 130], [83, 190]], 12, RED); g.restore(); } g.restore(); });
    g.save(); g.globalAlpha *= pop(t, cs('l3', 1)); fitTxt('SUGAR MAMA', 590, 110, 54, PINK, 440); txt('богатая спонсорша', 590, 165, 34, INK); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('z4', 0) + .8); fitTxt('SUGAR DADDY', 590, 260, 54, '#1f3a8a', 440); txt('богатый спонсор', 590, 315, 34, INK); g.restore();
    g.save(); g.globalAlpha *= pop(t, TL.SW1 - .35); fitTxt('SWIPE LEFT = НЕТ', 590, 415, 44, RED, 440); g.restore(); },
  hey: t => { chatHead((x, y, r) => avMan(x, y, r, 1), 'Stas, 49'); g.save(); g.globalAlpha *= pop(t, TL.PING1); bubble('Hey.', 60, 160, 300, false, '#ffffff', INK, 40); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('z5', 0)); txt('HEY = привет', 600, 190, 46, GREEN); txt('HAY = сено', 600, 270, 46, '#b07a2a'); hayBale(600, 370, .9); g.restore();
    if (t > TL.BLOCK1) stamp('BLOCKED', 230, 360, 50, RED, -.12, (t - TL.BLOCK1) / 1); },
  scam: t => { const k = pop(t, TL.MATCH); chatHead((x, y, r) => avDoc(x, y, r), 'Dr. Richard, 52'); txt("IT'S A MATCH!", 690, 85, 30, '#ffffff');
    g.save(); g.globalAlpha *= pop(t, TL.MATCH + .5); bubble('Hello, my queen.', 50, 148, 500, false, '#ffffff', INK, 32); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('l5', 2)); bubble('I need $500 for a plane ticket.', 50, 222, 600, false, '#ffffff', INK, 32); g.restore();
    if (t > cs('l5', 3)) stamp('SCAMMER', 680, 210, 46, RED, .12, (t - cs('l5', 3)) / 1);
    g.save(); g.globalAlpha *= pop(t, BY.l6.at + .2); bubble('No problem, darling! But first, send me $1,000 for my visa.', 810, 298, 600, true, PINK, '#ffffff', 30); g.restore();
    if (t > TL.THUD) { g.save(); g.globalAlpha *= pop(t, TL.THUD); rr(130, 410, 600, 62, 20, '#e8e4ea', 5); txt('Richard unmatched you.', 430, 441, 34, '#6a6070'); g.restore(); } },
  petro: t => { phoneFrame(60, 40, () => { rr(14, 60, 198, 340, 18, '#ffffff', 4); rr(14, 60, 198, 200, 18, '#fff0d8', 4); cutlets(113, 165, .8);
      txt(t > BY.z8.at + .8 ? 'Petrovich, 58' : '???, 58', 113, 290, 28, INK); g.save(); g.globalAlpha *= pop(t, cs('l8', 2)); fitTxt('Made this profile', 113, 330, 21, '#7a6a72', 200); fitTxt('to find you.', 113, 358, 21, '#7a6a72', 200); g.restore(); });
    const k = pop(t, TL.SUPER); g.save(); g.globalAlpha *= k; star(450, 130, 48, '#3a8ae0', 6, 5, -Math.PI / 2); fitTxt('SUPER LIKE', 650, 130, 52, '#3a8ae0', 300); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('l8', 2)); txt('Создал анкету,', 600, 270, 34, INK); txt('чтобы найти тебя', 600, 315, 34, INK); g.restore();
    if (t > cs('z8', 1)) { g.save(); g.globalAlpha *= pop(t, cs('z8', 1)); rr(420, 380, 360, 70, 22, '#fff0f6', 5); txt('= PETROVICH', 600, 416, 40, PINK); g.restore(); } },
  chat2: t => { chatHead((x, y, r) => avCut(x, y, r), 'Petrovich');
    g.save(); g.globalAlpha *= pop(t, TL.PING2); bubble('Why you block me?', 50, 150, 400, false, '#ffffff', INK, 32); tag(440, 178); ln([[62, 248], [72, 258], [90, 238]], 5, GREEN); txt('Why did you block me?', 100, 248, 28, GREEN, FONT, 'left'); g.restore();
    g.save(); g.globalAlpha *= pop(t, BY.z9.at + .3); rr(140, 280, 580, 50, 18, '#e8e4ea', 0); txt('You blocked Petrovich on Friday.', 430, 306, 26, '#6a6070'); g.restore();
    if (t > BY.l10.at) { g.save(); g.globalAlpha *= pop(t, BY.l10.at + .3); flag(745, 205, .8); g.restore(); }
    g.save(); g.globalAlpha *= pop(t, cs('z10', 0) + .3); bubble("It's a match.", 810, 340, 400, true, PINK, '#ffffff', 32); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('z10', 1) + .3); bubble('But first, send me $500 for flowers.', 810, 410, 640, true, PINK, '#ffffff', 30); g.restore(); },
};
function panel(id, t, a0, b0, thought) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](t); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const PANELS = [['bio', BY.z2.at, BY.z3.end + .35], ['kevin', BY.l3.at - .05, TL.PING1 - .1], ['hey', TL.PING1 - .1, TL.MATCH - .1], ['scam', TL.MATCH - .1, TL.SW2 + .2],
  ['petro', TL.SUPER - .1, TL.PING2 - .1], ['chat2', TL.PING2 - .1, TL.END]];
for (let i = 1; i < PANELS.length; i++) if (PANELS[i - 1][2] > PANELS[i][1]) PANELS[i - 1][2] = PANELS[i][1];   // never two panels at once
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) panel(id, t, a, b, th); }
function hook(t) { const T1 = BY.z1.end - .1; if (t > T1 + .3) return; const k = ease(t / .25) * (1 - ease((t - T1) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.025);
  rr(-450, -110, 900, 220, 30, '#fffaf0', 8); fitTxt('ЖАННА, 55,', 0, -40, 72, INK, 820); fitTxt('ИЩЕТ ЛЮБОВЬ', 0, 46, 84, PINK, 820); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, PINK);
  const R = [['SCAMMER', 'мошенник'], ['UNMATCH', 'удалить мэтч'], ['SUGAR MAMA / SUGAR DADDY', 'богатая спонсорша / спонсор'], ['HEY / HAY', 'привет / сено (звучат одинаково)'], ['SUPER LIKE', 'суперлайк — «очень нравишься»'], ['RED FLAG', 'тревожный звоночек'], ["IT'S A MATCH!", 'взаимная симпатия']];
  R.forEach(([en, ru], i) => { const y = 400 + i * 122; fitTxt(en, 540, y, 52, '#1f3a8a', 880); txt(ru, 540, y + 48, 38, '#c0283a'); });
  txt('Кого вы свайпнете right?', 540, 1290, 46, INK); txt('А — Кевин, 25   Б — «Hey»', 540, 1370, 42, PINK); txt('В — хирург с вышки', 540, 1430, 42, PINK); txt('Г — Петрович с котлетами', 540, 1490, 42, PINK);
  txt('Пишите букву в комменты', 540, 1590, 42, INK); g.restore(); }

// ---------- shots ----------
const CAM = {TWO: [1.0, 545, 1000], Z_UP: [1.04, 530, 800], L_UP: [1.04, 555, 810], TWO_UP: [1.06, 545, 795]};   // every shot keeps both characters fully in frame
const SH = [[0, 'TWO'], [BY.z2.at - .1, 'Z_UP'], [BY.l1.at - .1, 'L_UP'], [BY.z3.at - .1, 'TWO_UP'], [BY.l3.at - .1, 'L_UP'], [BY.z4.at - .1, 'Z_UP'], [BY.l4.at - .4, 'L_UP'],
  [BY.z5.at - .1, 'Z_UP'], [TL.MATCH, 'L_UP'], [BY.z6.at - .1, 'Z_UP'], [BY.l6.at - .1, 'L_UP'], [TL.SUPER, 'L_UP'], [BY.z8.at - .1, 'TWO_UP'], [BY.l9.at - .4, 'L_UP'], [BY.z9.at - .1, 'Z_UP'],
  [BY.l10.at - .1, 'L_UP'], [BY.z10.at - .1, 'Z_UP'], [BY.z10.end + .05, 'L_UP'], [TL.END, 'END']]
  .map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'TWO' : sh.k, [z, x, y] = CAM[k], u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .035 * ease(u), punch = sh.at > 0 ? .03 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

function frame(t, opt = {}) {
  const c = opt.cam || camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); room(t); g = G0;
  g.save(); g.filter = `blur(${(2.6 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.03)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); sofaBack(); liza(t); zhanna(t); sofaFront(); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (opt.nopanel) return; if (c.sh.k !== 'END') panels(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep4.srt', out); }
else if (mode === 'cover') { // NOCAP still (no cards), shifted down 180 px, top strip filled, cream plate with 3 lines
  const t = +(arg || (BY.z4.at + 1.0)); frame(t, {nopanel: true, cam: {z: 1.12, x: 545, y: 920, k: 'TWO', sh: {k: 'TWO'}}});
  const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0); g = G0; g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.filter = 'blur(6px)'; g.drawImage(src, 0, 0, W, 200, 0, 0, W, 200); g.filter = 'none'; g.restore(); g.drawImage(src, 0, 0, W, H - 180, 0, 180, W, H - 180);
  const gr = g.createLinearGradient(0, 160, 0, 220); gr.addColorStop(0, 'rgba(243,220,188,0)'); gr.addColorStop(.5, 'rgba(243,220,188,.6)'); gr.addColorStop(1, 'rgba(243,220,188,0)'); g.fillStyle = gr; g.fillRect(0, 160, W, 60);
  g.save(); g.translate(540, 330 + 165); g.rotate(-.02); rr(-450 + 10, -165 + 12, 900, 330, 34, 'rgba(42,34,48,.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
  fitTxt('ЖАННА, 55,', 0, -92, 82, INK, 820); fitTxt('ИЩЕТ ЛЮБОВЬ', 0, 2, 104, PINK, 820); fitTxt('В ПРИЛОЖЕНИИ', 0, 100, 62, INK, 820); g.restore();
  fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
