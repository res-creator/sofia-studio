// «Тётя Жанна с Брайтона», ep4 «Жанна и дейтинг-приложение» — flat 2D (engine of ep2).
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
const HAND1 = BY.l4.at + (BY.l4.end - BY.l4.at) * .5, HAND2 = BY.z7.end + .05; // phone: Liza -> Zhanna -> Liza
const ZPLAN = {z1: [[0, 'explain'], [.5, 'palm']], z2: [[0, 'brooch'], [.62, 'shrug']], z3: [[0, 'explain'], [.4, 'palm']], z4: [[0, 'wag']], z5: [[0, 'scroll']], z6: [[0, 'scroll'], [.3, 'scrollUp'], [.75, 'scroll']],
  z7: [[0, 'scrollUp'], [.7, 'scroll']], z8: [[0, 'brooch']]};
const LPLAN = {l2: [[0, 'phone']], l3: [[0, 'phone']], l4: [[0, 'phone'], [.45, 'present'], [.62, 'explain']], l5: [[0, 'present']], l6: [[0, 'explain'], [.45, 'shrug']], l7: [[0, 'phone']], l8: [[0, 'phone']]};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who && P[l.id]) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id]) if (u >= k) gg = v; return gg; } return idle; }
function zAct(t) { const l = lineAt(t), id = l && l.id;
  if (t >= TL.END) return {g: 'brooch', mood: 'happy'};
  const has = t >= HAND1 && t < HAND2, idle = has ? 'scroll' : 'lap';
  let gg = plan(ZPLAN, 'z', t, idle); if (!has && (gg === 'scroll' || gg === 'scrollUp')) gg = 'lap'; if (has && !(gg === 'scroll' || gg === 'scrollUp')) gg = 'scroll';
  const mood = id === 'z7' ? 'angry' : id === 'l6' && t > BY.l6.at + 1 ? 'surprised' : id === 'z6' ? 'grin' : id === 'l8' && t > BY.l8.at + 1.2 ? 'surprised' : id === 'z8' ? 'grin' : 'smug';
  return {g: gg, mood}; }
function lAct(t) { const l = lineAt(t), id = l && l.id;
  if (t >= TL.END) return {g: 'shrug', mood: 'flat'};
  const has = t < HAND1 || t >= HAND2; let gg = plan(LPLAN, 'l', t, has ? 'phone' : 'lap'); if (!has && gg === 'phone') gg = 'lap'; if (has && gg === 'lap') gg = 'phone';
  const mood = id === 'z2' && t > BY.z2.at + (BY.z2.end - BY.z2.at) * .6 ? 'flat' : id === 'l6' && t > BY.l6.at + 1 ? 'surprised' : id === 'z7' ? 'surprised' : id === 'z8' ? 'flat' : id === 'z6' ? 'flat' : (l && l.who === 'l') ? 'happy' : 'smug';
  return {g: gg, mood: mood === 'smug' ? 'flat' : mood}; }
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
  T.draw(g, {...c, x, y: FEET, sq: br, arms: wig(a.fn, t, spk ? 8 : 2), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, seedB), tilt, look: spk ? .15 * Math.sign(lookIdle) : lookIdle});
  return {x, a, br}; }
function hands(c, P, nail, phoneSide, caseCol) { const {x, a, br} = P, S = c.s;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hh = P3[2], hx = x + Hh[0] * S, hy = FEET + Hh[1] * S * br, ang = Math.atan2(Hh[1] - E[1], Hh[0] - E[0]);
    if (s === phoneSide && a.e > .6) { hand(hx, hy, ang, S, c.pal.skin, nail, false); phoneProp(hx + 6 * s, hy - 46, -.08 * s, S * 1.0, caseCol); }
    else hand(hx, hy, ang, S, c.pal.skin, nail, false); } }
function zhanna(t) { const P = person(t, ZH, zAct, ZG, 'z', 2, .6), S = ZH.s, x = P.x;
  const bx = x - 40 * S, by = FEET - 790 * S * P.br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 6; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = FEET - (640 + hash(i + 9) * 200) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  hands(ZH, P, '#d63a8a', (P.a.act.g === 'scroll' || P.a.act.g === 'scrollUp') ? 1 : 0, '#d63a8a'); }
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
  z1: ['Лиза, деточка!', 'Петрович три дня не звонит.', 'Делаем мне профиль в dating app —', 'пусть ревнует, ю ноу?'],
  z2: ['Лиза, пиши в bio:', 'I am woman with big experience.', 'Три мужа, ю ноу?'],
  l2: ['Про мужей не надо. Пишем:', 'Confident, fun, and full of life.'],
  z3: ['Дальше. Looking for:', 'man with house, car and no mother.'],
  l3: ['Пишем: Looking for a man with his own place.', "No mama's boys."],
  z4: ['И deal-breaker:', 'если чекает телефон за ужином —', 'сразу блокаю!'],
  l4: ['Deal-breaker: phones at dinner.', 'Готово! Теперь swipe left — это нет,', 'swipe right — это да.'],
  z5: ['Лево! Лево!', 'С мамой на фото — лево!'],
  l5: ['Тётя, тут фото только с рыбой.', 'Это red flag.'],
  z6: ['Red flag? Деточка,', 'это не flag, это судак!', 'Кило на пять! Свайпаю right!'],
  l6: ["It's a match!", 'Ой… это Петрович.'],
  z7: ['Петрович?! Ах он,', 'свайпает за моей спиной!', 'Пиши: ты ходишь по тонкому льду!'],
  l7: ["You're on thin ice.", 'И сердечко. Отправила.'],
  l8: ['Ой, он ответил:', 'I am man with big experience.'],
  z8: ['Деточка… это судьба.', 'Ю ноу?'],
};
const TRC = {'I am woman with big experience.': '«Я женщина с большим опытом»', 'Confident, fun, and full of life.': 'Уверенная, весёлая, полная жизни.', 'man with house, car and no mother.': 'мужчина с домом, машиной и без мамы',
  'Пишем: Looking for a man with his own place.': 'Ищу мужчину со своим жильём.', "No mama's boys.": 'Маменькиных сынков — мимо.', 'Deal-breaker: phones at dinner.': 'Не прощу: телефон за ужином.',
  "It's a match!": 'Взаимная симпатия!', "You're on thin ice.": 'Ты ходишь по тонкому льду.', 'I am man with big experience.': '«Я мужчина с большим опытом»'};
// chunk timing: char share mapped onto voiced frames of the line (pauses don't count)
function chunks(l) { const parts = CHUNKS[l.id], env = l.env, vo = env.map(e => e > .1 ? 1 : 0), cum = [0]; for (const v of vo) cum.push(cum[cum.length - 1] + v); const tot = cum[cum.length - 1] || 1;
  const tAt = f => { if (f <= 0) return l.at; if (f >= 1) return l.end; const target = f * tot; let i = 0; while (i < cum.length - 1 && cum[i + 1] < target) i++; return Math.min(l.end, l.at + i / 30); };
  const n = parts.reduce((a, c) => a + c.length, 0); let acc = 0;
  return parts.map((s, i) => { const a = i ? tAt(acc / n) - .05 : l.at; acc += s.length; return {s, a, b: i === parts.length - 1 ? l.end : tAt(acc / n) - .05, tr: TRC[s], who: l.who, id: l.id, i}; }); }
const CH = L.map(l => ({l, ch: chunks(l)})), CHB = Object.fromEntries(CH.map(({l, ch}) => [l.id, ch]));
const cs = (id, i) => CHB[id][i].a;
// chips (translation of Runglish words), only while the word is on screen and only if they can stay ≥1.2 s
const GL = {z1: [['dating app', 'приложение для знакомств'], ['ю ноу', 'you know — понимаешь']], z2: [['bio', 'пара строк о себе'], ['ю ноу', 'you know — понимаешь']],
  z3: [['Looking for', 'ищу']], z4: [['deal-breaker', 'то, что не прощу'], ['чекает', 'check — проверяет'], ['блокаю', 'block — блокирую']],
  l5: [['red flag', 'тревожный звоночек']], z6: [['flag', 'флаг'], ['судак', 'рыба такая'], ['Свайпаю right', 'swipe right — да']], z7: [['свайпает', 'swipe — листает анкеты']]};
const CHIPS = []; for (const {l, ch} of CH) for (const c of ch) { if (c.tr) continue; const low = c.s.toLowerCase(), list = [];
  for (const [w, tr] of (GL[l.id] || [])) { const i = low.indexOf(w.toLowerCase()); if (i >= 0 && !CHIPS.some(q => q.c === c && q.w === w)) list.push({c, w, tr, a: c.a + (c.b - c.a) * i / c.s.length}); }
  list.sort((p, q) => p.a - q.a); const endC = c.b + (c === ch[ch.length - 1] ? .25 : 0);
  let ok = list; for (let it = 0; it < 4; it++) { ok = ok.filter((q, j) => ((ok[j + 1] ? ok[j + 1].a : endC) - Math.max(q.a - .1, c.a)) >= 1.2); }
  ok.forEach((q, j) => { q.b = ok[j + 1] ? ok[j + 1].a : endC; CHIPS.push(q); }); }
const RU_EN = /^(ю|ноу|чекает|блокаю|свайпаю|свайпает)$/i;
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
const CARD = {
  nocall: t => { phoneFrame(150, 40, () => { avFish(113, 130, 52); txt('Petrovich', 113, 215, 32, INK); txt('0 calls', 113, 258, 30, RED);
      for (let i = 0; i < 2; i++) { ln([[20, 300 + i * 50], [206, 300 + i * 50]], 3, '#e8d0dc'); } }, 'Calls');
    g.save(); g.globalAlpha *= pop(t, BY.z1.at + 3.6); rr(470, 120, 300, 150, 24, '#ffffff', 6); txt('3 DAYS', 620, 175, 58, RED); txt('NO CALL', 620, 232, 38, INK); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('z1', 3)); txt('?!', 620, 360, 120, PINK, HW); g.restore(); },
  bio: t => { phoneFrame(60, 40, ZPROF); txt('BIO', 360, 80, 46, PINK, FONT, 'left');
    const a1 = cs('z2', 1), a2 = cs('l2', 0) + .4, a3 = cs('l2', 1);
    g.save(); g.globalAlpha *= pop(t, a1); const L1 = para('I am woman with big experience.', 360, 150, 40, '#7a6a72', 440); g.restore();
    if (t > a2) strike(356, 150, 400, L1.length, 47, (t - a2) / .5);
    g.save(); g.globalAlpha *= pop(t, a3); para('Confident, fun, and full of life.', 360, 310, 44, GREEN, 440); g.restore(); },
  want: t => { const it = [[200, 'HOUSE', cs('z3', 1)], [430, 'CAR', cs('z3', 1) + .5], [660, 'NO MOTHER', cs('z3', 1) + 1.1]];
    it.forEach(([x, lab, a], i) => { g.save(); g.globalAlpha *= pop(t, a); const y = 230;
      if (i === 0) { poly([[x - 90, y - 10], [x, y - 90], [x + 90, y - 10]], RED, 6); rr(x - 70, y - 10, 140, 110, 6, '#f6e0a8', 6); rr(x - 18, y + 40, 36, 60, 4, '#8a5a3a', 5); rr(x + 28, y + 10, 30, 30, 4, '#bfe3f5', 4); }
      if (i === 1) { rr(x - 100, y + 10, 200, 60, 20, '#3a8ae0', 6); poly([[x - 60, y + 12], [x - 35, y - 35], [x + 40, y - 35], [x + 65, y + 12]], '#3a8ae0', 6); rr(x - 40, y - 26, 34, 30, 4, '#bfe3f5', 3); rr(x + 4, y - 26, 34, 30, 4, '#bfe3f5', 3); ell(x - 55, y + 72, 22, 22, INK, 0); ell(x + 55, y + 72, 22, 22, INK, 0); ell(x - 55, y + 72, 9, 9, '#cccccc', 0); ell(x + 55, y + 72, 9, 9, '#cccccc', 0); }
      if (i === 2) { avMom(x, y + 20, 75); g.save(); g.globalAlpha *= pop(t, a + .4); ln([[x - 85, y - 60], [x + 85, y + 100]], 14, RED); ln([[x + 85, y - 60], [x - 85, y + 100]], 14, RED); g.restore(); }
      txt(lab, x, 400, 40, i === 2 ? RED : INK); g.restore(); }); },
  look: t => { phoneFrame(60, 40, ZPROF); txt('LOOKING FOR', 360, 80, 44, PINK, FONT, 'left');
    const L1 = para('man with house, car and no mother', 360, 140, 30, '#9a8a92', 440); strike(356, 140, 400, L1.length, 36, 1);
    g.save(); g.globalAlpha *= pop(t, cs('l3', 0) + .5); para('a man with his own place.', 360, 250, 40, GREEN, 440); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('l3', 1)); txt("No mama's boys.", 360, 390, 44, PINK, FONT, 'left'); g.restore(); },
  deal: t => { ell(220, 260, 150, 150, '#ffffff', 7); ell(220, 260, 105, 105, '#f6efe6', 4); g.save(); g.translate(220, 260); g.rotate(-.3); rr(-40, -70, 80, 140, 14, '#2a2230', 5); rr(-32, -60, 64, 112, 8, '#bfe3f5', 0); g.restore();
    ln([[40, 140], [40, 380]], 8, '#9a9aa8'); ln([[400, 140], [400, 380]], 8, '#9a9aa8');
    g.save(); g.globalAlpha *= pop(t, BY.z4.at + .8); g.beginPath(); g.arc(220, 260, 160, 0, 7); g.strokeStyle = RED; g.lineWidth = 16; g.stroke(); ln([[107, 147], [333, 373]], 16, RED); g.restore();
    fitTxt('DEAL-BREAKER', 630, 130, 58, PINK, 400); g.save(); g.globalAlpha *= pop(t, cs('l4', 0)); para('phones at dinner', 630, 250, 52, INK, 360, 1.15, 'center'); g.restore(); },
  swipe: t => { const S = TL.SWIPES, profs = [[(x, y, r) => avMan(x, y, r, 0), 'Boris, 61', 'Ham radio, tea'], [(x, y, r) => avMan(x, y, r, 1), 'Gena, 57', 'Cars. Only cars.'], [(x, y, r) => avMom(x, y, r), 'Vova, 52', 'Me and Mama'], [(x, y, r) => avMan(x, y, r, 2), 'Igor, 60', 'Chess, sauna']];
    phoneFrame(60, 40, () => { for (let i = profs.length - 1; i >= 0; i--) { const out = S[i] !== undefined ? clamp((t - S[i]) / .35) : 0; if (out >= 1) continue; g.save(); g.translate(113 - ease(out) * 320, 230); g.rotate(-ease(out) * .5); g.translate(-113, -230);
        rr(14, 60, 198, 340, 18, '#ffffff', 4); g.save(); g.beginPath(); g.roundRect(14, 60, 198, 340, 18); g.clip(); profileScreen(profs[i][0], profs[i][1], [profs[i][2]]); g.restore();
        if (out > 0) { g.save(); g.globalAlpha *= clamp(out * 4); ell(113, 160, 60, 60, 'rgba(255,255,255,.85)', 7, RED); ln([[83, 130], [143, 190]], 12, RED); ln([[143, 130], [83, 190]], 12, RED); g.restore(); } g.restore(); } });
    const a1 = cs('l4', 1) + .6, a2 = cs('l4', 2);
    g.save(); g.globalAlpha *= pop(t, a1); fitTxt('SWIPE LEFT', 590, 140, 54, RED, 440); ln([[440, 210], [740, 210]], 10, RED); poly([[420, 210], [455, 185], [455, 235]], RED, 0); txt('= НЕТ', 590, 265, 46, INK); g.restore();
    g.save(); g.globalAlpha *= pop(t, a2); fitTxt('SWIPE RIGHT', 590, 340, 54, GREEN, 440); ln([[440, 400], [740, 400]], 10, GREEN); poly([[760, 400], [725, 375], [725, 425]], GREEN, 0); txt('= ДА', 590, 448, 40, INK); g.restore(); },
  fish: t => { const out = clamp((t - TL.SWR) / .35);
    phoneFrame(60, 40, () => { g.save(); g.translate(113 + ease(out) * 320, 230); g.rotate(ease(out) * .5); g.translate(-113, -230); rr(14, 60, 198, 340, 18, '#ffffff', 4);
      rr(14, 60, 198, 200, 18, '#bfe3f5', 4); fish(113, 165, .68); txt('???, 58', 113, 290, 30, INK); txt('Fishing. Garage.', 113, 330, 21, '#7a6a72');
      if (out > 0) { g.save(); g.globalAlpha *= clamp(out * 4); ell(113, 160, 60, 60, 'rgba(255,255,255,.85)', 7, GREEN); heart(113, 165, 30, GREEN, 4); g.restore(); } g.restore(); });
    g.save(); g.globalAlpha *= pop(t, cs('l5', 1)); flag(385, 175, 1.1); txt('RED FLAG?', 640, 150, 52, RED); g.restore();
    g.save(); g.globalAlpha *= pop(t, cs('z6', 1)); txt('СУДАК!', 600, 300, 64, '#3a7a5a', HW); g.restore();
    if (t > cs('z6', 2)) stamp('5 KG', 600, 410, 54, PINK, -.1, (t - cs('z6', 2)) / 1); },
  match: t => { const k = ease((t - TL.MATCH) / .4); txt("IT'S A MATCH!", 430, 100, 74, PINK); for (const [i, sx, sy] of [[0, 70, 200], [1, 790, 200], [2, 70, 330], [3, 790, 330], [4, 430, 160], [5, 430, 345]]) sparkle(sx, sy, 18, .5 + .5 * Math.sin(t * 5 + i));
    avZ(270 - (1 - k) * 60, 260, 105); avFish(590 + (1 - k) * 60, 260, 105); heart(430, 250, 38 * (1 + .08 * Math.sin(t * 6)), '#ff5a8a', 5);
    g.save(); g.globalAlpha *= pop(t, cs('l6', 1)); rr(440, 390, 300, 62, 20, '#fff0f6', 5); txt('Petrovich, 58', 590, 421, 38, INK); g.restore();
    txt('Zhanna, 39', 270, 421, 32, '#7a6a72'); },
  chat: t => { rr(30, 40, 800, 90, 0, '#ff9ac8', 0); avFish(95, 85, 36); txt('Petrovich', 150, 85, 40, '#ffffff', FONT, 'left');
    const b1 = cs('l7', 0) + .25, b2 = cs('l7', 1), b3 = TL.PING;
    g.save(); g.globalAlpha *= pop(t, b1); rr(380, 160, 430, 76, 30, PINK, 5); txt("You're on thin ice.", 595, 199, 36, '#ffffff'); g.restore();
    g.save(); g.globalAlpha *= pop(t, b2); rr(690, 248, 120, 76, 30, PINK, 5); heart(750, 288, 22, '#ffffff', 3); g.restore();
    g.save(); g.globalAlpha *= pop(t, b3); rr(50, 345, 560, 76, 30, '#ffffff', 5); txt('I am man with big experience.', 330, 384, 34, INK); g.restore(); },
};
function panel(id, t, a0, b0, thought) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](t); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const ZT = [[360, 740, 13], [390, 690, 20]];
const PANELS = [['nocall', BY.z1.at + 3.3, BY.z1.end + .25, ZT], ['bio', BY.z2.at, BY.l2.end + .35], ['want', BY.z3.at, BY.z3.end + .3, ZT], ['look', BY.l3.at - .05, BY.l3.end + .4],
  ['deal', BY.z4.at, cs('l4', 1) + .1], ['swipe', cs('l4', 1) + .1, BY.z5.end + .35], ['fish', BY.l5.at - .05, TL.MATCH], ['match', TL.MATCH, BY.l7.at - .1], ['chat', BY.l7.at - .1, TL.END]];
for (let i = 1; i < PANELS.length; i++) if (PANELS[i - 1][2] > PANELS[i][1]) PANELS[i - 1][2] = PANELS[i][1];   // never two panels at once
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) panel(id, t, a, b, th); }
function hook(t) { const T1 = BY.z1.at + 2.9; if (t > T1 + .3) return; const k = ease(t / .25) * (1 - ease((t - T1) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.025);
  rr(-450, -110, 900, 220, 30, '#fffaf0', 8); fitTxt('ЖАННА ИЩЕТ МУЖЧИНУ', 0, -40, 66, INK, 820); txt('В ПРИЛОЖЕНИИ', 0, 46, 80, PINK); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, PINK);
  const R = [['BIO', 'пара строк о себе'], ["NO MAMA'S BOYS", 'маменькиных сынков — мимо'], ['DEAL-BREAKER', 'то, что точно не прощу'], ['SWIPE LEFT / SWIPE RIGHT', 'нет / да'], ["IT'S A MATCH!", 'взаимная симпатия'], ['RED FLAG', 'тревожный звоночек'], ["YOU'RE ON THIN ICE", 'ходишь по тонкому льду']];
  R.forEach(([en, ru], i) => { const y = 400 + i * 122; fitTxt(en, 540, y, 52, '#1f3a8a', 880); txt(ru, 540, y + 48, 38, '#c0283a'); });
  txt('Ваш главный red flag в анкете?', 540, 1300, 46, INK); txt('А — фото с рыбой', 540, 1375, 44, PINK); txt('Б — живёт с мамой', 540, 1435, 44, PINK); txt('В — телефон за ужином', 540, 1495, 44, PINK);
  txt('Пишите букву в комменты', 540, 1590, 42, INK); g.restore(); }

// ---------- shots ----------
const CAM = {TWO: [1.0, 545, 1000], Z_UP: [1.04, 530, 800], L_UP: [1.04, 555, 810], TWO_UP: [1.06, 545, 795]};   // every shot keeps both characters fully in frame
const SH = [[0, 'TWO'], [BY.z1.at + 3.2, 'Z_UP'], [BY.l2.at - .1, 'L_UP'], [BY.z3.at - .1, 'Z_UP'], [BY.l3.at - .1, 'L_UP'], [BY.z4.at - .1, 'Z_UP'], [BY.l4.at - .1, 'L_UP'],
  [BY.z5.at - .1, 'Z_UP'], [BY.l5.at - .1, 'L_UP'], [BY.z6.at - .1, 'Z_UP'], [TL.MATCH, 'TWO_UP'], [BY.z7.at - .1, 'Z_UP'], [BY.l7.at - .1, 'L_UP'], [BY.l8.at - .1, 'TWO_UP'], [BY.z8.at - .1, 'Z_UP'], [TL.END, 'END']]
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
  const t = +(arg || (BY.z6.at + 1.2)); frame(t, {nopanel: true, cam: {z: 1.12, x: 545, y: 920, k: 'TWO', sh: {k: 'TWO'}}});
  const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0); g = G0; g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.filter = 'blur(6px)'; g.drawImage(src, 0, 0, W, 200, 0, 0, W, 200); g.filter = 'none'; g.restore(); g.drawImage(src, 0, 0, W, H - 180, 0, 180, W, H - 180);
  const gr = g.createLinearGradient(0, 160, 0, 220); gr.addColorStop(0, 'rgba(243,220,188,0)'); gr.addColorStop(.5, 'rgba(243,220,188,.6)'); gr.addColorStop(1, 'rgba(243,220,188,0)'); g.fillStyle = gr; g.fillRect(0, 160, W, 60);
  g.save(); g.translate(540, 330 + 165); g.rotate(-.02); rr(-450 + 10, -165 + 12, 900, 330, 34, 'rgba(42,34,48,.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
  fitTxt('ЖАННА ИЩЕТ', 0, -92, 82, INK, 820); fitTxt('МУЖЧИНУ', 0, 2, 110, PINK, 820); fitTxt('В ПРИЛОЖЕНИИ', 0, 100, 62, INK, 820); g.restore();
  fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
