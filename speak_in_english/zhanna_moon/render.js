// «Тётя Жанна с Брайтона» — «Жанна и её мужчины» (trend «my moon my man»; the song itself is NOT in the file). Flat 2D, engine from ep7.
// node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | info | framecheck | facecheck   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l])), W0 = TL.W0, W1 = TL.W1;
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const bgCv = createCanvas(W, H), GB = bgCv.getContext('2d'), clCv = createCanvas(W, H), GC = clCv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function otxt(s, x, y, size, col, font = FONT, lw = .2, stroke = INK) { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * lw; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }
function heart(x, y, r, fill, lw = 5) { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.6, y - r * .1, x - r * .8, y - r * 1.3, x, y - r * .45); g.bezierCurveTo(x + r * .8, y - r * 1.3, x + r * 1.6, y - r * .1, x, y + r * .9); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }

// Zhanna: series look (pink sequined top, star brooch, blonde bouffant, pink nails)
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 215, s: .76};
const PE = {hair: 'short', cap: true, moustache: true, pal: {skin: '#eec3a2', skinS: '#d9a583', hair: '#cfcfcf', brow: '#9a9a9a', stache: '#dcdcdc', cap: '#7a808c', capS: '#5e6470', top: '#8a6d52', topS: '#6e553f', collar: '#eef3f8', bottom: '#4a4a52', legs: '#4a4a52', shoe: '#2a2230', sole: '#2a2230'}, x: 1150, s: .76};
const ZX = 780;   // where Zhanna stands for the dip, next to Petrovich

// ---------- Zhanna's kitchen on Brighton Beach (flat) ----------
const SEAT = 1850, TABLE = 1352;
function kitchen(t) {
  g.fillStyle = '#f6dfe0'; g.fillRect(-1200, -1200, 3480, 2600);
  for (let y = -1100; y < 900; y += 110) for (let x = -1200 + (Math.abs(Math.round(y / 110)) % 2) * 60; x < 2280; x += 120) { ell(x, y, 9, 9, '#efc4cc', 0); ell(x, y, 3.5, 3.5, '#f9eef0', 0); }
  // window with the night sea and a BIG moon (above Petrovich)
  rr(880, 170, 560, 560, 22, '#26365e', 12); g.save(); g.beginPath(); g.roundRect(892, 182, 536, 536, 14); g.clip();
  for (let i = 0; i < 20; i++) sparkle(900 + hash(i) * 520, 200 + hash(i + 40) * 300, 5 + 4 * hash(i + 7), .5 + .5 * Math.sin(t * 2 + i));
  ell(1240, 330, 92, 92, '#fff3c4', 0); ell(1214, 306, 18, 14, '#f1e2a8', 0); ell(1268, 360, 12, 10, '#f1e2a8', 0);
  g.fillStyle = '#1e5a8a'; g.fillRect(880, 560, 560, 200); for (let k = 0; k < 5; k++) ln([[1170 + Math.sin(t + k) * 10, 580 + k * 26], [1310 + Math.sin(t + k) * 10, 580 + k * 26]], 5, 'rgba(255,240,190,.6)');
  g.restore(); ln([[1160, 170], [1160, 730]], 10); ln([[880, 450], [1440, 450]], 10);
  rr(860, 150, 600, 50, 10, '#e07aa0', 7); for (let x = 880; x < 1440; x += 56) ell(x + 20, 214, 22, 26, '#e07aa0', 5);   // frilly curtain
  // photo wall above Zhanna's seat (her men, pinned)
  for (let i = 0; i < 5; i++) { const px = -120 + i * 150, py = 300 + (i % 2) * 60, r = (hash(i) - .5) * .3; g.save(); g.translate(px, py); g.rotate(r); rr(-55, -65, 110, 130, 4, '#fffdf6', 5); rr(-44, -54, 88, 82, 2, ['#f6c6d0', '#4ab0b0', '#8fc0e8', '#c8a0d8', '#f0c070'][i], 3); ell(0, -60, 8, 8, '#d63a8a', 3); g.restore(); }
  ell(640, 330, 70, 70, '#fffaf0', 8); ln([[640, 330], [640, 285]], 7); ln([[640, 330], [672, 342]], 7);   // wall clock
  // tiles + fridge
  rr(-1200, 880, 3480, 520, 0, '#bfe3dc', 0); for (let y = 880; y < 1400; y += 60) ln([[-1200, y], [2280, y]], 3, '#a4d2c8'); for (let x = -1200; x < 2280; x += 60) ln([[x, 880], [x, 1400]], 3, '#a4d2c8');
  ln([[-1200, 880], [2280, 880]], 8);
  rr(-560, 420, 300, 980, 30, '#f2f2ee', 8); ln([[-560, 800], [-260, 800]], 6); rr(-300, 560, 18, 140, 8, '#c8c8c0', 4); rr(-300, 860, 18, 160, 8, '#c8c8c0', 4);
  for (let k = 0; k < 3; k++) { g.save(); g.translate(-470 + k * 70, 500 + (k % 2) * 30); g.rotate((k - 1) * .1); rr(-26, -30, 52, 60, 4, ['#f2c820', '#8fd2ff', '#d63a8a'][k], 4); g.restore(); }
  g.fillStyle = '#c89a72'; g.fillRect(-1200, 1400, 3480, 900); for (let x = -1200; x < 2280; x += 160) ln([[x, 1400], [x - 70, 2300]], 5, '#b0825a'); ln([[-1200, 1400], [2280, 1400]], 7);
}
function cutletPlate(x, y, s = 1, rose = false) { g.save(); g.translate(x, y); g.scale(s, s); ell(0, -6, 96, 24, '#ffffff', 6); ell(0, -8, 66, 14, '#f4f0ea', 3);
  for (const [cx, cy] of [[-34, -22], [8, -26], [44, -18], [-6, -12]]) { ell(cx, cy, 30, 15, '#9a5a2e', 5); ln([[cx - 14, cy - 5], [cx + 10, cy - 7]], 3, '#c88a4a'); }
  ell(-60, -14, 14, 8, '#7ab868', 3);
  if (rose) { g.save(); g.translate(20, -34); g.rotate(-.45); ln([[0, 0], [0, -110]], 7, '#3c8a4a'); ell(14, -50, 16, 8, '#4aa05a', 4); ell(0, -122, 28, 26, '#d8323c', 6);
    g.beginPath(); g.arc(0, -122, 13, .3, 5.5); g.strokeStyle = '#8a1a22'; g.lineWidth = 4; g.stroke(); g.restore(); }
  g.restore(); }
function cup(x, y) { rr(x - 34, y - 70, 68, 70, 14, '#fffaf0', 6); g.beginPath(); g.arc(x + 40, y - 38, 18, -1.4, 1.4); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); ell(x, y - 70, 34, 8, '#b86a3a', 5); for (let k = 0; k < 6; k++) ell(x - 20 + k * 8, y - 40, 3, 3, '#d63a8a', 0); }
function compote(x, y) { rr(x - 28, y - 100, 56, 100, 8, 'rgba(225,242,255,.9)', 5); rr(x - 24, y - 66, 48, 62, 6, 'rgba(210,80,110,.75)', 0); ell(x - 6, y - 30, 8, 8, '#a8223a', 0); }
const PLATE0 = [930, TABLE];
function table(t) { // kitchen table with a red-check oilcloth, hides the lower bodies
  rr(-300, TABLE, 1900, 30, 10, '#ffffff', 7); g.save(); g.beginPath(); g.rect(-290, TABLE + 26, 1880, 700); g.fillStyle = '#ffffff'; g.fill(); g.clip();
  for (let x = -290, i = 0; x < 1600; x += 64, i++) for (let y = TABLE + 26, j = 0; y < TABLE + 726; y += 64, j++) if ((i + j) % 2 === 0) { g.fillStyle = '#e8606a'; g.fillRect(x, y, 64, 64); }
  g.restore(); rr(-290, TABLE + 26, 1880, 700, 0, null, 7);
  cup(70, TABLE); ell(420, TABLE - 30, 60, 34, '#f2c820', 6); ell(420, TABLE - 60, 34, 12, '#f2c820', 5); ell(420, TABLE - 74, 10, 8, INK, 0);   // sugar bowl
  compote(1385, TABLE);
  if (t < OFF0 + .2) cutletPlate(PLATE0[0], PLATE0[1], 1, true); }

// ---------- gestures ----------
const ZG = {
  table: s => [[s * 78, -860], [s * 150, -740], [s * 90, -680]],
  palm: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : [[-78, -860], [-150, -740], [-90, -680]],
  explain: s => [[s * 78, -860], [s * 150, -740], [s * 140, -800]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : [[-78, -860], [-150, -740], [-90, -680]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-150, -740], [-90, -680]],
  point: s => s > 0 ? [[78, -860], [180, -820], [255, -860]] : [[-78, -860], [-150, -740], [-90, -680]],
  shock: s => [[s * 78, -860], [s * 200, -930], [s * 250, -1060]],
  clasp: s => [[s * 78, -860], [s * 150, -760], [s * 24, -820]],
};
const FRONT = new Set(['table', 'explain', 'brooch', 'clasp']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'explain'], [.55, 'wag']], z2a: [[0, 'palm']], z2b: [[0, 'brooch']], z2c: [[0, 'shrug']], z2d: [[0, 'wag']], z3a: [[0, 'palm']], z3b: [[0, 'wag']], z3c: [[0, 'explain'], [.6, 'shock']],
  z3d: [[0, 'shrug']], z3e: [[0, 'palm']], z4a: [[0, 'palm']], z4b: [[0, 'explain']], z4c: [[0, 'brooch']], z4d: [[0, 'shrug']], z4e: [[0, 'shock']], z5: [[0, 'explain'], [.35, 'point']]};
const ZMOOD = {z2b: 'happy', z4c: 'happy', z3c: 'angry', z4e: 'angry'};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of (P[l.id] || [])) if (u >= k) gg = v; return gg; } return idle; }
function zAct(t) { const l = lineAt(t); return {g: plan(ZPLAN, 'z', t, t >= BY.z5.at && t < BY.z5.end + 1 ? 'point' : 'table'), mood: (l && ZMOOD[l.id]) || 'smug'}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function hands(x, y, S, a, c, nail, glossy) { for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hh = P3[2]; hand(x + Hh[0] * S, y + Hh[1] * S, Math.atan2(Hh[1] - E[1], Hh[0] - E[0]), S, c.pal.skin, nail, glossy); } }

// ---------- the silent window: offer, dip ----------
const DIPCUT = W0 + 1.9, OFF0 = W0 + 2.05, OFF1 = W0 + 2.75, TAKE = W0 + 3.0, DIP1 = W0 + 3.6;
const dipped = t => t >= DIPCUT;
const dipR = t => t < TAKE ? 0 : -.7 * ease((t - TAKE) / (DIP1 - TAKE)) + (t > DIP1 ? .015 * Math.sin((t - DIP1) * 2) : 0);
const PIV = [ZX, SEAT - 570 * ZH.s];
function zw(p, t) { // Zhanna local point -> world (dip rotation around her hips)
  const x0 = ZX + p[0] * ZH.s, y0 = SEAT + p[1] * ZH.s, r = dipR(t), dx = x0 - PIV[0], dy = y0 - PIV[1]; return [PIV[0] + dx * Math.cos(r) - dy * Math.sin(r), PIV[1] + dx * Math.sin(r) + dy * Math.cos(r)]; }
const toZ = p => [(p[0] - ZX) / ZH.s, (p[1] - SEAT) / ZH.s], toP = p => [(p[0] - PE.x) / PE.s, (p[1] - SEAT) / PE.s];
const OFFER = [912, 1196];   // world: where Petrovich holds out the plate
const ZRAISE = [[78, -860], [210, -1060], [300, -1200]], ZFLING = [[-78, -860], [-150, -760], [-20, -790]];   // plate held high; other hand on her heart
const mixP = (A, B, k) => A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
function zDipArms(t) { const L0 = ZG.clasp(-1), R0 = ZG.clasp(1), oz = toZ([OFFER[0] - 26, OFFER[1] + 10]), reach = [[78, -860], [lerp(78, oz[0], .55), lerp(-860, oz[1], .55) + 50], oz];
  const k1 = ease((t - OFF1 + .1) / .35), k2 = ease((t - TAKE) / (DIP1 - TAKE));
  const right = t < TAKE ? mixP(R0, reach, k1) : mixP(reach, ZRAISE, k2), left = mixP(L0, ZFLING, k2); return s => s > 0 ? right : left; }
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z';
  if (!dipped(t)) { const a = blendArms(zAct, ZG, t), c = ZH, x = c.x + Math.sin(t * 1.4) * 3 * (spk ? 1.4 : 1), y = SEAT;
    const tilt = spk ? .05 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2));
    T.draw(g, {...c, x, y, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 8 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look: spk ? .4 : .7});
    const S = c.s, bx = x - 40 * S, by = y - 790 * S * br; star(bx, by, 30, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
    for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
    hands(x, y, S, a, c, '#d63a8a', true); return; }
  // dip: the whole figure rotates around the hips (hidden by the table); arms and hands share one wiggled point set
  const c = ZH, S = c.s, x = ZX, y = SEAT, r = dipR(t), after = t >= W1;
  const a = {fn: zDipArms(t)}; g.save(); g.translate(...PIV); g.rotate(r); g.translate(-PIV[0], -PIV[1]);
  T.draw(g, {...c, x, y, arms: (a.fn = wig(a.fn, t, 1.5)), front: t < TAKE, mood: after ? 'smug' : 'happy', pucker: !after && t > DIP1 - .2, mouth: spk ? env(l, t) : 0, blink: after ? blink(t, 2) : false,
    wink: l && l.id === 'z8' && t > l.at + .25, tilt: after ? .06 : .1, look: after ? (l && l.id === 'z8' ? -.2 : .9) : 0});
  const bx = x - 40 * S, by = y - 790 * S; star(bx, by, 30, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  hands(x, y, S, a, c, '#d63a8a', true); g.restore();
  if (t >= TAKE) { const hp = zw(a.fn(1)[2], t); cutletPlate(hp[0] + 10, hp[1] - 18, .8, true); } }   // plate held aloft (upright)

// ---------- Petrovich: always hidden behind BRIGHTON TIMES; the paper never goes below the cap brim (PMIN) ----------
const RAISED = 800, PMIN = 994;
function paperTop(t) { let y = RAISED; if (t >= W0 + .2) y = lerp(RAISED, PMIN, ease((t - W0 - .2) / 1.6));
  const p = BY.p1; if (t >= p.at && t < p.end + .3) y -= 14 * Math.sin(Math.PI * clamp((t - p.at) / (p.end + .3 - p.at)));   // «Угу» nod
  return y; }
const PG = {hold: s => [[s * 78, -860], [s * 160, -800], [s * 235, -930]]};
function pLeftArm(t, base) { // left hand: holds the paper -> picks up the plate -> offers it -> holds Zhanna's waist
  if (t < OFF0) return base; const plate = toP([PLATE0[0] + 40, PLATE0[1] - 26]), offer = toP([OFFER[0] + 40, OFFER[1] + 14]), H0 = base[2];
  let Hh; if (t < OFF0 + .35) Hh = H0.map((v, i) => lerp(v, plate[i], ease((t - OFF0) / .35))); else if (t < OFF1) Hh = plate.map((v, i) => lerp(v, offer[i], ease((t - OFF0 - .35) / (OFF1 - OFF0 - .35))));
  else if (t < TAKE) Hh = offer; else { const wz = toP(zw([118, -700], t)); Hh = offer.map((v, i) => lerp(v, wz[i], ease((t - TAKE) / (DIP1 - TAKE)))); }
  const S0 = [-78, -860], E = [lerp(S0[0], Hh[0], .5) + 10, lerp(S0[1], Hh[1], .5) + 60]; return [S0, E, Hh]; }
function petrovich(t) { const l = lineAt(t), spk = l && l.who === 'p', c = PE, x = c.x + Math.sin(t * 1.1 + 1) * 2, y = SEAT, S = c.s, top = paperTop(t);
  const a = {fn: s => s < 0 ? pLeftArm(t, PG.hold(s)) : PG.hold(s)};
  T.draw(g, {...c, x, y, arms: (a.fn = wig(a.fn, t, 1.2)), front: false, probe: !!process.env.FACECHECK, mood: 'kind', mouth: spk ? env(l, t) : 0, blink: blink(t, 7), tilt: 0, look: -.3});
  paper(x, top);
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hh = P3[2], hx = x + Hh[0] * S, hy = y + Hh[1] * S, ang = Math.atan2(Hh[1] - E[1], Hh[0] - E[0]);
    if (s < 0 && t >= OFF0 + .2 && t < TAKE) cutletPlate(hx - 40, hy - 14, .8, true);
    hand(hx, hy, ang, S, c.pal.skin, null, false); if (s < 0) { const wx = hx - Math.cos(ang) * 22 * S, wy = hy - Math.sin(ang) * 22 * S; ell(wx, wy, 13, 13, '#e8c27a', 4); } } }   // wrist watch
function paper(x, top, alpha = 1) { const w = 170, h = 360; g.save(); g.globalAlpha *= alpha;
  rr(x - w, top, w * 2, h, 6, '#f4f1e8', 7); txt('BRIGHTON TIMES', x, top + 42, 40, INK, HW); ln([[x - w + 16, top + 70], [x + w - 16, top + 70]], 4);
  rr(x - w + 20, top + 90, 150, 110, 4, '#c8cfd6', 4); for (let k = 0; k < 9; k++) ln([[x - w + (k < 4 ? 186 : 20), top + 98 + k * 26], [x + w - 20, top + 98 + k * 26]], 4, '#b8b2a4'); ln([[x, top + 214], [x, top + h - 14]], 3, '#d8d2c4');
  g.restore(); }

// ---------- polaroid cards (the men) ----------
const CW = 600, CHT = 740, CPX = 30, CPW = 540, CPH = 540, CY = 64;   // card box, photo box
const M1 = {hair: 'curly', moustache: true, pal: {skin: '#f0c4a0', skinS: '#dca684', hair: '#4a2e1a', brow: '#3a2412', stache: '#4a2e1a', top: '#2a3a6a', topS: '#1f2c52', collar: '#ffffff', tie: '#ffffff', bottom: '#2a3a6a', legs: '#2a3a6a'}};
const M1o = {hair: 'short', moustache: true, pal: {skin: '#eebd9a', skinS: '#d8a07c', hair: '#a89888', brow: '#8a7a6a', stache: '#9a8a7a', top: '#f2f2ee', topS: '#dcdcd4', collar: '#f2f2ee', bottom: '#4a5a7a', legs: '#4a5a7a'}};
const M2 = {hair: 'spiky', pal: {skin: '#e8b088', skinS: '#d0966e', hair: '#1e1a1a', brow: '#1e1a1a', top: '#f06a3a', topS: '#d0502a', collar: '#f06a3a', bottom: '#f4f0e0', legs: '#f4f0e0'}};
const BF = {hair: 'long', lashes: true, earrings: '#f2c820', pal: {skin: '#f2c6a6', skinS: '#dcaa88', hair: '#7a3a22', hairS: '#5a2a18', brow: '#5a2a18', lip: '#d02a3a', top: '#c8323c', topS: '#a8222c', collar: '#c8323c', bottom: '#c8323c', legs: '#f2c6a6'}};
const RI = {hair: 'short', pal: {skin: '#f2c8a4', skinS: '#dcae8a', hair: '#f0d070', brow: '#c8a040', top: '#3a7ab8', topS: '#2a5a90', collar: '#3a7ab8', bottom: '#2a3a5a', legs: '#2a3a5a'}};
const down = s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]];
function man(st, x, y, s, o = {}) { const arms = o.arms || down; T.draw(g, {...st, x, y, s, arms, front: o.front, mood: o.mood || 'smug', blink: false, look: o.look || 0, tilt: o.tilt || 0, probe: false});
  for (const q of [-1, 1]) { const P3 = arms(q); hand(x + P3[2][0] * s, y + P3[2][1] * s, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), s, st.pal.skin, st.lashes ? '#d02a3a' : null, false); }
  const hy = y - 1098 * s, hx = x;   // eye line
  if (o.shades) { for (const q of [-1, 1]) rr(hx + q * 60 * s - 58 * s, hy - 40 * s, 116 * s, 80 * s, 26 * s, '#1a1a22', 5); ln([[hx - 4 * s, hy - 10 * s], [hx + 4 * s, hy - 10 * s]], 6); ell(hx - 80 * s, hy - 16 * s, 12 * s, 7 * s, 'rgba(255,255,255,.7)', 0); }
  if (o.chain) { g.beginPath(); g.moveTo(x - 50 * s, y - 880 * s); g.quadraticCurveTo(x, y - 780 * s, x + 50 * s, y - 880 * s); g.strokeStyle = '#f2c820'; g.lineWidth = 12 * s; g.stroke(); ell(x, y - 815 * s, 18 * s, 22 * s, '#f2c820', 4); }
  if (o.helmet) { const ty = y - 1262 * s; g.beginPath(); g.moveTo(x - 200 * s, ty + 110 * s); g.bezierCurveTo(x - 200 * s, ty - 90 * s, x + 200 * s, ty - 90 * s, x + 200 * s, ty + 110 * s); g.closePath(); g.fillStyle = '#f2c820'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); rr(x - 240 * s, ty + 96 * s, 480 * s, 34 * s, 14 * s, '#f2c820', 6); ln([[x, ty - 40 * s], [x, ty + 96 * s]], 6); }
  if (o.flower) { for (let k = 0; k < 5; k++) ell(x + 50 * s + Math.cos(k * 1.26) * 16 * s, y - 800 * s + Math.sin(k * 1.26) * 16 * s, 11 * s, 11 * s, '#ffffff', 3); ell(x + 50 * s, y - 800 * s, 8 * s, 8 * s, '#f2c820', 3); }
  if (o.dots) for (let k = 0; k < 9; k++) ell(x + (hash(k) - .5) * 150 * s, y - (600 + hash(k + 5) * 260) * s, 14 * s, 14 * s, '#ffe27a', 3); }
function datestamp(s) { g.save(); g.font = `34px ${FONT}`; g.textAlign = 'right'; g.fillStyle = '#ff8a2a'; g.shadowColor = 'rgba(255,120,40,.8)'; g.shadowBlur = 8; g.fillText(s, CPW - 22, CPH - 30); g.restore(); }
function stamp(s, x, y, size, u, rot = -.22) { if (u <= 0) return; const k = clamp(u / .08), sc = 1.7 - .7 * ease(k); g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= k;
  g.font = `${size}px ${FONT}`; const w = g.measureText(s).width + 50; rr(-w / 2, -size * .7, w, size * 1.4, 14, 'rgba(255,255,255,.25)', 10, '#d8323c'); txt(s, 0, 4, size, '#d8323c'); g.restore(); }
function palm(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(10, -150, 30, -300); g.lineTo(50, -300); g.quadraticCurveTo(30, -150, 18, 0); g.closePath(); g.fillStyle = '#a8703a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  for (let k = 0; k < 6; k++) { g.save(); g.translate(40, -300); g.rotate(-2.8 + k * .95); ell(70, 0, 80, 20, '#3c9a5a', 5); g.restore(); } g.restore(); }
function phone(lines, u) { rr(120, 20, 300, 520, 40, '#2a2230', 0); rr(136, 52, 268, 456, 20, '#f4f6fb', 0);
  ell(190, 96, 26, 26, RI.pal.skin, 4); g.save(); g.beginPath(); g.arc(190, 96, 26, Math.PI, 0); g.fillStyle = RI.pal.hair; g.fill(); g.restore(); txt('Richard', 228, 96, 30, INK, FONT, 'left');
  lines.forEach(([s, me], i) => { if (u < i * .2) return; const y = 190 + i * 100; let fz = 26; g.font = `${fz}px ${FONT}`; while (g.measureText(s).width > 214) { fz -= 1; g.font = `${fz}px ${FONT}`; } const w = g.measureText(s).width + 34; rr(me ? 392 - w : 148, y - 34, w, 70, 22, me ? '#ffd0e4' : '#dfe8ff', 4); txt(s, me ? 392 - w / 2 : 148 + w / 2, y + 2, fz, INK); }); }
function weddingBg() { g.fillStyle = '#f6c6d0'; g.fillRect(0, 0, CPW, CPH); for (let i = 0; i < 9; i++) heart(30 + i * 62, 40 + (i % 2) * 22, 16, '#ffffff', 3); }
function miniPetro(x, y, s) { g.save(); g.translate(x, y); g.scale(s / PE.s, s / PE.s); T.draw(g, {...PE, x: 0, y: 0, arms: PG.hold, front: false, mood: 'kind', probe: false, blink: false}); paper(0, PMIN - SEAT + 6);
  for (const q of [-1, 1]) { const P3 = PG.hold(q); hand(P3[2][0] * PE.s, P3[2][1] * PE.s, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), PE.s, PE.pal.skin, null, false); } g.restore(); }
const CARD = {
  moon: {cap: 'my moon?', draw: u => { weddingBg(); man(M1, 270, 760, .48, {mood: 'happy', flower: true}); datestamp('1989'); }},
  ex: {cap: 'my ex', draw: u => { g.fillStyle = '#9a7a5c'; g.fillRect(0, 0, CPW, CPH); rr(10, 250, 520, 140, 40, '#7a5a8a', 6); g.fillStyle = 'rgba(140,200,255,.25)'; g.fillRect(0, 0, 120, CPH);
    man(M1o, 270, 760, .48, {mood: 'sleepy', arms: s => s > 0 ? [[78, -860], [170, -760], [150, -900]] : down(s)}); rr(-40, 470, 620, 120, 30, '#6a4a7a', 6); const hp = [270 + 150 * .48, 760 - 900 * .48]; rr(hp[0] - 20, hp[1] - 70, 40, 64, 8, '#c8323c', 4); datestamp('2009'); }},
  exh: {cap: 'ex-husband', draw: u => { weddingBg(); man(M1, 270, 760, .48, {mood: 'happy', flower: true}); g.fillStyle = '#fffdf6'; g.beginPath(); g.moveTo(232, 0); for (let i = 0; i <= 12; i++) g.lineTo(232 + (i % 2 ? 18 : -18), i * 46); g.lineTo(268, CPH); for (let i = 12; i >= 0; i--) g.lineTo(268 + (i % 2 ? 18 : -18), i * 46); g.closePath(); g.fill();
    for (const ty of [80, 470]) { g.save(); g.translate(250, ty); g.rotate(-.2); rr(-90, -22, 180, 44, 4, 'rgba(240,226,180,.85)', 0); g.restore(); } stamp('EX', 420, 110, 84, u); }},
  man: {cap: 'my man', draw: u => { g.fillStyle = '#4ab0b0'; g.fillRect(0, 0, CPW, CPH); palm(20, 560, .9); palm(470, 560, .8); man(M2, 270, 760, .48, {shades: true, chain: true, dots: true}); }},
  flag: {cap: 'red flag', draw: u => { weddingBg(); man(M2, 200, 696, .42, {shades: true, chain: true, dots: true, look: 1}); man(BF, 410, 675, .4, {mood: 'smug', look: -1});
    g.save(); g.translate(70, 330); g.rotate(-.12); ln([[0, 0], [0, -260]], 9, '#6a4a2a'); g.beginPath(); g.moveTo(0, -260); g.quadraticCurveTo(70, -290 + 10 * Math.sin(u * 20), 140, -250); g.lineTo(140, -170); g.quadraticCurveTo(70, -210 + 10 * Math.sin(u * 20 + 1), 0, -180); g.closePath(); g.fillStyle = '#e0242c'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore(); }},
  dance: {cap: 'best friend', draw: u => { g.fillStyle = '#6a3a8a'; g.fillRect(0, 0, CPW, CPH); for (let i = 0; i < 14; i++) ell(hash(i) * CPW, hash(i + 3) * 300, 14, 14, ['#ffe27a', '#ff7ac0', '#8fd2ff'][i % 3], 0);
    man(M2, 200, 696, .42, {shades: true, chain: true, dots: true, tilt: .15, arms: s => s > 0 ? [[78, -860], [170, -900], [230, -1000]] : down(s)}); man(BF, 370, 675, .4, {mood: 'happy', tilt: -.15, arms: s => s < 0 ? [[-78, -860], [-170, -900], [-230, -1000]] : down(s)});
    for (let k = 0; k < 3; k++) { const nx = 80 + k * 190, ny = 90 + (k % 2) * 40; ell(nx, ny, 16, 12, '#ffffff', 4); ln([[nx + 14, ny], [nx + 14, ny - 60], [nx + 40, ny - 50]], 5, '#ffffff'); } }},
  miami: {cap: 'miami', draw: u => { const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#ff7ab0'); gr.addColorStop(1, '#ffc46a'); g.fillStyle = gr; g.fillRect(0, 0, CPW, 360); ell(270, 330, 110, 110, '#fff0a0', 0);
    g.fillStyle = '#2aa0c8'; g.fillRect(0, 330, CPW, 120); g.fillStyle = '#f6dca0'; g.fillRect(0, 440, CPW, 120); palm(60, 520, .9); palm(470, 520, .75); txt('greetings from', 270, 80, 40, '#ffffff', HW); otxt('MIAMI', 270, 180, 120, '#ff8a2a', FONT, .14); }},
  her: {cap: 'her man', draw: u => { const gr = g.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#ff8ab8'); gr.addColorStop(1, '#ffd06a'); g.fillStyle = gr; g.fillRect(0, 0, CPW, CPH); palm(450, 560, 1.0);
    man(BF, 350, 696, .42, {mood: 'happy', tilt: -.12}); man(M2, 200, 717, .44, {shades: true, chain: true, dots: true, tilt: .12}); heart(275, 70, 30, '#ff3a6a', 5); }},
  rich: {cap: 'richard', draw: u => { g.fillStyle = '#8fc0e8'; g.fillRect(0, 0, CPW, CPH); man(RI, 270, 760, .48, {mood: 'grin', helmet: true}); sparkle(300, 500, 20, .5 + .5 * Math.sin(u * 30)); sparkle(110, 240, 16, 1); sparkle(440, 300, 22, 1); }},
  rig: {cap: 'oil rig', draw: u => { g.fillStyle = '#b8d8f0'; g.fillRect(0, 0, CPW, CPH); g.fillStyle = '#3a6a9a'; g.fillRect(0, 420, CPW, 140);
    g.save(); g.translate(380, 440); for (const q of [-1, 1]) ln([[q * 120, 0], [q * 50, -330]], 9); for (let k = 1; k < 5; k++) { const y = -k * 70, w = 120 - k * 14; ln([[-w, y], [w, y]], 6); ln([[-w, y], [w - 14, y - 70]], 4); } rr(-160, -20, 320, 40, 6, '#e05a2a', 6); ln([[60, -330], [60, -400]], 8); g.restore();
    man(RI, 150, 755, .4, {mood: 'grin', helmet: true, arms: s => s > 0 ? [[78, -860], [190, -930], [215, -1080]] : down(s)}); }},
  soul: {cap: 'soulmate?', draw: u => { g.fillStyle = '#ffd6e6'; g.fillRect(0, 0, CPW, CPH); phone([['hi, beautiful', false], ['you are my soulmate', false], ['ohh!', true]], u); heart(470, 120, 30, '#ff3a6a', 5); heart(70, 400, 24, '#ff3a6a', 5); }},
  cash: {cap: '$3000?', draw: u => { g.fillStyle = '#dff0d8'; g.fillRect(0, 0, CPW, CPH); phone([['send $3000', false], ['for a ticket', false], ['ok…', true]], u);
    g.save(); g.translate(450, 450); g.rotate(-.2); rr(-80, -42, 160, 84, 10, '#a8d898', 6); ell(0, 0, 28, 28, '#86c074', 4); txt('$', 0, 2, 40, '#2f6a2a'); g.restore(); }},
  scam: {cap: 'scammer', draw: u => { g.fillStyle = '#8fc0e8'; g.fillRect(0, 0, CPW, CPH); man(RI, 270, 760, .48, {mood: 'grin', helmet: true}); g.fillStyle = 'rgba(60,60,70,.35)'; g.fillRect(0, 0, CPW, CPH); stamp('SCAMMER', 270, 330, 86, u * 1.2); }},
  stay: {cap: 'stays home', draw: u => { g.fillStyle = '#f6dfe0'; g.fillRect(0, 0, CPW, CPH); rr(10, 300, 520, 120, 40, '#b8704a', 6); miniPetro(270, 640, .44); rr(-40, 430, 620, 200, 40, '#a8603a', 6); }},
  cutlets: {cap: 'cutlets', draw: u => { g.fillStyle = '#bfe3dc'; g.fillRect(0, 0, CPW, CPH); ell(270, 340, 220, 90, '#3a3a44', 8); ell(270, 330, 190, 70, '#55555f', 0); rr(470, 310, 130, 34, 14, '#2a2230', 0);
    for (const [cx, cy] of [[190, 320], [290, 300], [350, 350], [220, 370]]) { ell(cx, cy, 46, 24, '#9a5a2e', 5); ln([[cx - 20, cy - 8], [cx + 16, cy - 10]], 4, '#c88a4a'); }
    for (let k = 0; k < 4; k++) { const sx = 160 + k * 70, ph = u * 6 + k; g.beginPath(); g.moveTo(sx, 240); g.bezierCurveTo(sx - 20, 200, sx + 20, 170 - 10 * Math.sin(ph), sx, 130); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 8; g.stroke(); } }},
  nomoon: {cap: 'my moon? no', draw: u => { g.fillStyle = '#26365e'; g.fillRect(0, 0, CPW, CPH); for (let i = 0; i < 14; i++) sparkle(hash(i) * CPW, hash(i + 9) * CPH, 8, 1); ell(270, 270, 150, 150, '#fff3c4', 6); ell(230, 230, 26, 20, '#f1e2a8', 0);
    const k = ease((u - .15) * 4); if (k > 0) ln([[120, 120], [lerp(120, 420, k), lerp(120, 420, k)]], 26, '#e0242c'); const k2 = ease((u - .35) * 4); if (k2 > 0) ln([[420, 120], [lerp(420, 120, k2), lerp(120, 420, k2)]], 26, '#e0242c'); }},
  keeper: {cap: "he's a keeper", draw: u => { g.fillStyle = '#ffe6ee'; g.fillRect(0, 0, CPW, CPH); heart(270, 330, 240, '#ff9ab8', 8); miniPetro(270, 640, .42); for (let i = 0; i < 6; i++) sparkle(60 + hash(i) * 420, 60 + hash(i + 2) * 200, 14, .5 + .5 * Math.sin(u * 20 + i)); }},
};
const CL = TL.CL, cardTilt = i => (i % 2 ? 1 : -1) * (.035 + .02 * hash(i));
function drawCard(i, t, k, dim) { const c = CL[i], C = CARD[c.id], u = (t - c.at) / (c.end - c.at); const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.translate((W - CW) / 2, CY); rr(8, 14, CW, CHT, 10, 'rgba(40,20,40,.3)', 0); rr(0, 0, CW, CHT, 10, '#fffdf6', 6);
  g.save(); g.translate(CPX, CPX); g.beginPath(); g.rect(0, 0, CPW, CPH); g.clip(); C.draw(dim ? 1 : u); g.restore(); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(CPX, CPX, CPW, CPH);
  let f = 96; g.font = `${f}px ${HW}`; while (g.measureText(C.cap).width > CW - 70) { f -= 4; g.font = `${f}px ${HW}`; } txt(C.cap, CW / 2, CPX + CPH + 84, f, '#2a2a5a', HW);
  g = prev; g.save(); g.globalAlpha = k; const cx = W / 2, cy = CY + CHT / 2, land = dim ? 1 : ease((t - c.at) / .22);
  g.translate(cx, cy - (1 - land) * 70); g.rotate(cardTilt(i) + (1 - land) * .12); const sc = dim ? .95 : 1.07 - .07 * land; g.scale(sc, sc); g.translate(-cx, -cy); if (dim) g.filter = 'brightness(0.82)'; g.drawImage(clCv, 0, 0); g.filter = 'none'; g.restore(); }
const chained = j => j > 0 && Math.abs(CL[j - 1].end - CL[j].at) < .01;
function cards(t) { let i = -1; for (let j = 0; j < CL.length; j++) if (t >= CL[j].at && t < CL[j].end) i = j; if (i < 0) return;
  const c = CL[i], last = !(CL[i + 1] && chained(i + 1)), k = last ? 1 - ease((t - c.end + .25) / .25) : 1, inK = chained(i) ? 1 : ease((t - c.at) / .2);
  if (chained(i)) drawCard(i - 1, t, k, true); drawCard(i, t, k * inK, false); }

// ---------- shots ----------
const CAM = {ZH: [1.06, 300, 860], ZL: [1.0, 300, 848], ZL2: [1.04, 290, 852], PL: [1.0, 1150, 848], DIP: [.97, 830, 860], END: [.97, 830, 860]};
const firstOf = id => CL.find(c => c.grp === id).at;
const SH = [[0, 'ZH'], [CL[0].at, 'ZL'], [firstOf('z3a'), 'ZL2'], [firstOf('z4a'), 'ZL'], [BY.z5.at - .05, 'ZL2'], [TL.PCUT, 'PL'], [DIPCUT, 'DIP'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; let [z, x, y] = CAM[sh.k]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  let beat = 0; for (const c of CL) if (t >= c.at && t < c.at + .3) beat = .012 * (1 - ease((t - c.at) / .3));   // tiny punch on every card flip (the beat)
  const push = sh.k === 'DIP' || sh.k === 'END' ? .03 * ease((t - W0 - 2.5) / 3) : .015 * ease(u); return {z: z * (1 + push + beat), x, y, k: sh.k, sh}; }

// ---------- captions ----------
const GLOSS = {z1: [['Ю ноу', 'you know — понимаешь']], z2b: [['my moon', 'моя луна, любовь всей жизни']], z2c: [['my ex', 'мой бывший']], z2d: [['Экс-хазбенд', 'ex-husband — бывший муж']], z3a: [['my man', 'мой мужчина']],
  z3b: [['Ред флаг', 'red flag — тревожный знак']], z3c: [['бестфрендшей', 'best friend — лучшая подруга']], z3e: [['her man', 'её мужчина']], z4c: [['soulmate', 'родственная душа']], z4e: [['Скамер', 'scammer — мошенник']],
  z6a: [['скамит', 'scam — обманывать']], z6d: [["he's a keeper", 'такого надо держать']], z7: [['my man', 'мой мужчина']], z8: [['Ю ноу', 'you know — понимаешь']]};
function chunks(l) { const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (l.end - l.at) < 1.2) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
const CH = L.map(l => ({l, ch: chunks(l)})), FLAT = [].concat(...CH.map(x => x.ch));
FLAT.forEach((c, i) => { const nx = FLAT[i + 1]; let lim = nx ? nx.a - .05 : c.b + 1.2; if (c.b < W0) lim = Math.min(lim, W0 - .05); c.hold = Math.max(c.b, Math.min(c.a + 1.2, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .25, lim)); });
const CHIPS = []; for (const c of FLAT) { const hits = (GLOSS[c.id] || []).filter(([w]) => c.s.toLowerCase().includes(w.toLowerCase())); if (!hits.length) continue;
  const dur = c.hold - c.a; if (dur < 1.2) continue; CHIPS.push({a: c.a, b: c.hold, w: hits[0][0], tr: hits[0][1]}); }
const EN = /^(ю|ноу|экс-хазбенд|хазбенд|ред|флаг|бестфрендшей|скамер|скамит)$/i;
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, ''); return /[a-z]/i.test(x) || EN.test(x); };
function curChunk(t) { let cur = null; for (const c of FLAT) if (t >= c.a - .02 && t < c.hold) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1660); g.scale(pop, pop); g.translate(-540, -1660);
  const words = cur.s.split(' '), col = w => isEn(w) ? '#ffd23f' : '#ffffff'; g.font = `66px ${FONT}`;
  if (g.measureText(cur.s).width > 980 && words.length > 1) { let best = 1, bd = 1e9; for (let i = 1; i < words.length; i++) { const d = Math.abs(g.measureText(words.slice(0, i).join(' ')).width - g.measureText(words.slice(i).join(' ')).width); if (d < bd) { bd = d; best = i; } }
    outlinedWords(words.slice(0, best), 1640, 64, col); outlinedWords(words.slice(best), 1726, 64, col); } else outlinedWords(words, 1660, 70, col); g.restore(); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1550 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = CL[0].at;
function hook(t) { if (t > HOOK_END) return; const a = ease(t / .2) * (1 - ease((t - HOOK_END + .3) / .3)); g.save(); g.globalAlpha = a; g.translate(540, 360); g.rotate(-.02);
  rr(-470, -190, 940, 380, 40, '#fffaf0', 9); g.save(); g.rotate(Math.sin(t * 3) * .02); otxt('my moon my maaaan', 0, -70, 112, '#d63a8a', HW, .1); g.restore();
  txt('ЖАННА И ЕЁ', 0, 40, 76, INK); txt('МУЖЧИНЫ', 0, 120, 84, '#d63a8a'); heart(-400, -150, 26, '#ff7ab0', 4); heart(410, 140, 22, '#ff7ab0', 4); g.restore(); }
// the silent window: dreamy caption + romantic light + slow sparkles + hearts
function romance(t) { const k = ease((t - W0) / .6) * (1 - ease((t - TL.END) / .4)); if (k <= 0) return;
  g.save(); g.globalAlpha = k; const v = g.createRadialGradient(W / 2, H * .5, 300, W / 2, H * .5, 1150); v.addColorStop(0, 'rgba(255,170,210,0.10)'); v.addColorStop(1, 'rgba(190,40,120,0.42)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) { const sp = 30 + 30 * hash(i); let y = (hash(i + 50) * H - (t - W0) * sp) % H; if (y < 0) y += H; sparkle(hash(i + 20) * W, y, 9 + 9 * hash(i + 4), .4 + .5 * Math.sin(t * 1.5 + i)); }
  g.restore(); }
function hearts(t) { if (t < TAKE + .3) return; for (let i = 0; i < 16; i++) { const t0 = TAKE + .3 + i * .42, u = (t - t0) / 3.2; if (u < 0 || u > 1) continue; const x0 = 640 + (hash(i) - .5) * 520, y = 1250 - u * 900, x = x0 + Math.sin(u * 6 + i) * 30;
  g.save(); g.globalAlpha = Math.sin(Math.PI * u); heart(x, y, 22 + 14 * hash(i + 3), ['#ff3a6a', '#ff7ab0', '#ffb0cc'][i % 3], 4); g.restore(); } }
function dreamCaption(t) { const a = W0 + .3, b = W1 - .05; if (t < a || t > b) return; const k = ease((t - a) / .7) * (1 - ease((t - b + .5) / .5)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.03 + .015 * Math.sin(t * 1.2)); const sc = 1 + .04 * Math.sin(t * 1.6); g.scale(sc, sc);
  g.shadowColor = 'rgba(255,120,190,.9)'; g.shadowBlur = 40; otxt('my moon', 0, -70, 138, '#fff2f8', HW, .09, '#a8226a'); otxt('my maaaan', 0, 70, 150, '#ffe27a', HW, .09, '#a8226a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 66, '#d63a8a');
  const R = [['MY EX / EX-HUSBAND', 'бывший / бывший муж'], ['RED FLAG', 'тревожный знак'], ['SOULMATE', 'родственная душа'], ['SCAMMER', 'мошенник'], ["HE'S A KEEPER", 'такого надо держать'], ['MY MAN', 'мой мужчина']];
  R.forEach(([en, ru], i) => { const y = 410 + i * 132; txt(en, 540, y, 56, '#1f3a8a'); txt(ru, 540, y + 54, 40, '#c0283a'); });
  txt('Кто ваш my man?', 540, 1240, 60, '#d63a8a'); txt('А — бывший', 540, 1340, 52, INK); txt('Б — Петрович', 540, 1415, 52, INK); txt('В — котлеты', 540, 1490, 52, INK); txt('Пишите букву!', 540, 1600, 52, '#d63a8a'); g.restore(); }

let COVER = false;
function frame(t) {
  const c = COVER ? {z: .97, x: 820, y: 880, k: 'DIP', sh: {k: 'DIP'}} : camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); kitchen(t); g = G0;
  g.save(); g.filter = `blur(${(2.6 * c.z).toFixed(1)}px) saturate(0.7) brightness(1.03)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); zhanna(t); petrovich(t); table(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  romance(t); hearts(t); if (c.sh.k !== 'END') cards(t);
  if (process.env.NOCAP) return;
  hook(t); dreamCaption(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { const t = +(arg || W0 + 4.6); process.env.NOCAP = 1; COVER = true; frame(t);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.translate(540, 480); g.rotate(-.02); rr(-470, -190, 940, 380, 40, '#fffaf0', 9); txt('ЖАННА И ЕЁ', 0, -110, 84, INK); txt('МУЖЧИНЫ', 0, -20, 96, '#d63a8a');
  otxt('my moon my maaaan', 0, 100, 96, '#ffe27a', HW, .12, '#a8226a'); g.restore(); fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/zhanna_moon.srt', out); }
else if (mode === 'info') { for (const c of FLAT) console.log(c.id, c.a.toFixed(2), c.hold.toFixed(2), c.s); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w); for (const s of SH) console.log('SH', s.at.toFixed(2), s.k); for (const c of CL) console.log('CARD', c.id, c.at.toFixed(2), (c.end - c.at).toFixed(2)); }
else if (mode === 'framecheck') { // a character must be fully inside the frame or fully outside: no pixels on the left/right/top edges
  const mc = createCanvas(W, H), mg = mc.getContext('2d'); let bad = 0;
  const ext = (fn, t, c) => { g = mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); fn(t); g = G0; const d = mg.getImageData(0, 0, W, H).data; let edge = 0, any = 0;
    for (let y = 0; y < H; y += 2) for (const x of [0, W - 1]) if (d[(y * W + x) * 4 + 3] > 8) edge++; for (let x = 0; x < W; x += 2) if (d[x * 4 + 3] > 8) edge++; for (let i = 3; i < d.length; i += 64) if (d[i] > 8) any++; return {edge, any}; };
  for (let t = 0; t < TL.END; t += .25) { const c = camAt(t); for (const [n, fn] of [['Z', zhanna], ['P', petrovich]]) { const e = ext(fn, t, c); if (e.any && e.edge) { bad++; console.log('CUT', n, t.toFixed(2), c.k, e.edge); } } } console.log('framecheck done, bad:', bad); }
else if (mode === 'facecheck') { // Petrovich's face carries magenta probes; any magenta pixel in any frame = face visible
  process.env.NOCAP = 1; let bad = 0; const [step, off, endS] = (arg || '1:0').split(':').map(Number); for (let i = off || 0; i < (endS || TL.TOTAL) * FPS; i += step) { frame(i / FPS); const d = cv.data(); let n = 0; for (let j = 0; j < d.length; j += 16) if (d[j] > 230 && d[j + 1] < 40 && d[j + 2] > 230) n++; if (n) { bad++; console.log('VISIBLE', (i / FPS).toFixed(2), n); } } console.log('facecheck done, frames with face:', bad); }
