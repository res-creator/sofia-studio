// «Тётя Жанна с Брайтона», ep5 «Жанна на бранче с подругами» — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | chips   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
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

// ---------- cast ----------
const S0 = .58, FEET = 1800, TT = 1448, WFLOOR = 1650;   // seated people stand on a virtual ground FEET; the table top TT hides them below the waist
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 540, s: S0};
const LU = {hair: 'curly', lashes: true, earrings: '#f2c820', pal: {skin: '#f0c4a4', skinS: '#dca586', hair: '#7a1f3a', brow: '#4a1424', lip: '#c0203a', top: '#7a3ab0', topS: '#5f2a8e', collar: '#f2c820', bottom: '#2a2230', legs: '#2a2230', shoe: '#2a2230', sole: '#2a2230'}, x: 150, s: S0};
const TO = {hair: 'short', glasses: true, earrings: '#f6f0e6', pal: {skin: '#f2d2bc', skinS: '#ddb59c', hair: '#5a3a5a', brow: '#3a2440', lip: '#b0506a', top: '#8a9a5a', topS: '#6f7d46', collar: '#e8dcc0', bottom: '#4a4a3a', legs: '#4a4a3a', shoe: '#2a2230', sole: '#2a2230'}, x: 930, s: S0};
const WA = {hair: 'ponytail', lashes: true, pal: {skin: '#f6d6c0', skinS: '#e6b8a0', hair: '#9a6232', brow: '#6a3e1e', tie: '#ffffff', top: '#2f8f8a', topS: '#25726e', collar: '#ffffff', bottom: '#2a2230', legs: '#2a2230', shoe: '#ffffff', sole: '#e05a2a', pocket: true}, x: 1350, s: S0};

const A = {
  table: s => [[s * 78, -860], [s * 165, -720], [s * 235, -655]],
  palm: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : A.table(s),
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  up: s => [[s * 78, -860], [s * 185, -950], [s * 255, -1075]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [205, -1010]] : A.table(s),
  phone: s => s > 0 ? [[78, -860], [150, -700], [70, -790]] : A.table(s),
  hair: s => s > 0 ? [[78, -860], [205, -960], [250, -1105]] : A.table(s),
  star: s => s > 0 ? [[78, -860], [105, -715], [5, -790]] : A.table(s),
  chin: s => s < 0 ? [[-78, -860], [-170, -680], [-188, -880]] : [[78, -860], [150, -720], [180, -650]],
  point: s => s < 0 ? [[-78, -860], [-170, -770], [-262, -800]] : A.table(s),
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  note: s => s > 0 ? [[78, -860], [125, -740], [45, -770]] : [[-78, -860], [-125, -740], [-35, -805]],
  check: s => s > 0 ? [[78, -860], [175, -770], [255, -785]] : A.down(s),
  walk: s => [[s * 78, -860], [s * 100, -720], [s * 105, -590]],
};
const FRONT = new Set(['explain', 'phone', 'star', 'note']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s, per = 3.3) => ((t + s * 1.3) % (per + s * .4)) < .12;
const PLAN = {
  l1: [[0, 'up'], [.32, 'shrug'], [.62, 'up']], l2: [[0, 'shrug'], [.35, 'explain'], [.68, 'up']], l3: [[0, 'star']],
  z1: [[0, 'explain'], [.5, 'palm']], z2: [[0, 'explain'], [.42, 'wag']], z3: [[0, 'shrug'], [.28, 'phone']], z4: [[0, 'table'], [.25, 'hair']], z5: [[0, 'palm'], [.55, 'shrug']],
  t1: [[0, 'chin']], t2: [[0, 'chin']], t3: [[0, 'point']],
  w1: [[0, 'note']], w2: [[0, 'note']], w3: [[0, 'check']]};
function plan(who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of PLAN[l.id]) if (u >= k) gg = v; return gg; } return idle; }
const SHOCK0 = TL.REVEAL, SHOCK1 = BY.z4.at + .5;   // Zhanna recognises herself
const spk = (t, who) => { const l = lineAt(t); return l && l.who === who ? l : null; };
const LOOK = {l: {z: 1, t: 1, w: 1}, z: {l: -1, t: 1, w: 1}, t: {l: -1, z: -1, w: 1}};
const lookAt = (t, me, dflt) => { const l = lineAt(t); if (!l || l.who === me) return dflt; return LOOK[me][l.who] ?? dflt; };
function zAct(t) { if (t >= TL.END) return {g: 'palm', mood: 'grin'};
  if (t >= SHOCK0 && t < SHOCK1) return {g: 'table', mood: 'surprised'};
  const l = lineAt(t); let mood = 'smug'; if (l && l.id === 'l2' && t > l.at + 1) mood = 'grin'; if (l && l.id === 't2') mood = 'flat'; if (t >= SHOCK1 && t < BY.w3.at) mood = 'grin';
  return {g: plan('z', t, 'table'), mood}; }
function lAct(t) { if (t >= TL.END) return {g: 'up', mood: 'grin'}; const l = lineAt(t);
  if (t >= BY.t3.at + .4 && t < BY.w3.at) return {g: t < BY.z4.at + 1.2 ? 'up' : 'table', mood: 'surprised'};
  if (l && l.id === 'l1') return {g: plan('l', t, 'table'), mood: t < l.at + 2.4 ? 'surprised' : 'grin'};
  if (l && l.id === 'l2') return {g: plan('l', t, 'table'), mood: 'grin'};
  if (l && l.id === 'l3') return {g: 'star', mood: 'smug'};
  if (l && l.id === 'z5') return {g: 'table', mood: 'flat'};
  return {g: 'table', mood: l && l.id === 'w2' ? 'grin' : 'smug'}; }
function tAct(t) { if (t >= TL.END) return {g: 'chin', mood: 'smug'}; const l = lineAt(t);
  if (l && l.id === 't3') return {g: 'point', mood: 'sleepy'};
  if (t >= BY.t3.end && t < BY.t3.end + .5) return {g: 'point', mood: 'sleepy'};
  return {g: plan('t', t, 'chin'), mood: l && l.id === 'z5' ? 'smug' : 'sleepy'}; }
const W_IN1 = BY.w1.at - 1.0, W_OUT1 = BY.w2.end + .9, W_IN2 = BY.w3.at - .9;
function wAct(t) { if (t < W_IN1 + .8 || (t > W_OUT1 && t < W_IN2 + .7)) return {g: 'walk', mood: ''};
  const l = lineAt(t); let mood = ''; if (l && l.id === 'w1') mood = 'grin'; if (l && l.id === 'w2') mood = t < l.at + 1.8 ? 'flat' : 'grin'; if (l && l.id === 'w3') mood = t < l.at + 2.4 ? '' : 'flat';
  return {g: plan('w', t, t < W_OUT1 ? 'note' : 'check'), mood}; }
function wPos(t) { // waitress walks in from the right, leaves, comes back with the check
  if (t < W_IN1) return null; if (t < W_IN1 + .9) return lerp(1720, WA.x, ease((t - W_IN1) / .9));
  if (t < W_OUT1) return WA.x; if (t < W_OUT1 + .9) return lerp(WA.x, 1720, ease((t - W_OUT1) / .9));
  if (t < W_IN2) return null; if (t < W_IN2 + .9) return lerp(1720, WA.x, ease((t - W_IN2) / .9)); return WA.x; }
function blendArms(fnAt, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = A[prev], f1 = A[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function hands(c, x, y, a, nail, skip) { for (const s of [-1, 1]) { if (skip && skip(s)) continue; const P3 = a.fn(s), E = P3[1], Hh = P3[2]; hand(x + Hh[0] * c.s, y + Hh[1] * c.s, Math.atan2(Hh[1] - E[1], Hh[0] - E[0]), c.s, c.pal.skin, nail, false); } }

function zhanna(t) { const l = spk(t, 'z'), a = blendArms(zAct, t), c = ZH, x = c.x + Math.sin(t * 1.4) * 3;
  const shock = t >= SHOCK0 && t < SHOCK1, tilt = shock ? 0 : l ? .05 * Math.sin(t * 2.6) : .025 * Math.sin(t * 1.1) + .015, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  T.draw(g, {...c, x, y: FEET, seated: true, sq: br, arms: wig(a.fn, t, shock ? 0 : l ? 8 : 2), front: a.front, mood: a.act.mood, mouth: l ? env(l, t) : 0, blink: !shock && blink(t, 2), tilt, look: shock ? 0 : lookAt(t, 'z', .2)});
  const S = c.s, bx = x - 40 * S, by = FEET - 790 * S * br; star(bx, by, 41 * S, '#f2c820', 4, 8, t * .3); ell(bx, by, 11 * S, 11 * S, '#ff5a8a', 3);
  for (let i = 0; i < 6; i++) { const sx = x + (hash(i) - .5) * 150 * S, sy = FEET - (640 + hash(i + 9) * 190) * S; sparkle(sx, sy, (8 + 5 * hash(i + 3)) * S / .78, Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  hands(c, x, FEET, a, '#d63a8a', s => a.act.g === 'phone' && s > 0 && a.e > .5);
  if (a.act.g === 'phone' && a.e > .5) { const Hh = a.fn(1)[2], px = x + Hh[0] * S, py = FEET + Hh[1] * S; g.save(); g.translate(px, py); g.rotate(-.12); rr(-22, -44, 44, 78, 9, '#e05a8a', 4); rr(-16, -38, 32, 58, 5, '#bfe3f5', 3); g.restore();
    hand(px - 4, py + 14, -1.2, S, c.pal.skin, '#d63a8a', false); } }
function luda(t) { const l = spk(t, 'l'), a = blendArms(lAct, t), c = LU, x = c.x + Math.sin(t * 1.2 + 1) * 3, shocked = a.act.mood === 'surprised';
  T.draw(g, {...c, x, y: FEET, seated: true, arms: wig(a.fn, t, l ? 9 : shocked ? 3 : 2), front: a.front, mood: a.act.mood, mouth: l ? env(l, t) : 0, blink: blink(t, 4), tilt: l ? .06 * Math.sin(t * 2.9) : .02 * Math.sin(t + 1), look: lookAt(t, 'l', .7)});
  hands(c, x, FEET, a, '#c0203a'); }
function toma(t) { const l = spk(t, 't'), a = blendArms(tAct, t), c = TO, x = c.x + Math.sin(t * .9 + 3) * 2;
  const lk = l && l.id !== 't1' ? -1 : lookAt(t, 't', -.3);
  T.draw(g, {...c, x, y: FEET, seated: true, arms: wig(a.fn, t, l ? 4 : 1), front: a.front, mood: a.act.mood, mouth: l ? env(l, t) * .8 : 0, blink: blink(t, 7, 4.2), tilt: a.act.g === 'chin' ? -.08 : .03 * Math.sin(t * .8), look: lk});
  hands(c, x, FEET, a, '#b0506a'); }
function waitress(t) { const x = wPos(t); if (x == null) return; const l = spk(t, 'w'), a = blendArms(wAct, t), c = WA, walking = a.act.g === 'walk', bob = walking ? Math.abs(Math.sin(t * 9)) * 9 : 0;
  g.save(); g.translate(x, 0); g.scale(-1, 1);   // mirrored: she faces the table on her left
  T.draw(g, {...c, x: 0, y: WFLOOR - bob, arms: wig(a.fn, t, l ? 6 : 1), front: a.front, mood: a.act.mood, mouth: l ? env(l, t) : 0, blink: blink(t, 9), tilt: l ? .04 * Math.sin(t * 3) : 0, look: .5});
  hands(c, 0, WFLOOR - bob, a, '#ff9ac8');
  if (a.act.g === 'note' && a.e > .6) { const Hh = a.fn(-1)[2]; g.save(); g.translate(Hh[0] * c.s, WFLOOR + Hh[1] * c.s); rr(-30, -62, 60, 76, 6, '#ffffff', 4); for (let k = 0; k < 3; k++) ln([[-18, -44 + k * 16], [18, -44 + k * 16]], 3, '#9aa'); g.restore(); }
  if (a.act.g === 'check' && a.e > .6) { const Hh = a.fn(1)[2]; g.save(); g.translate(Hh[0] * c.s + 30, WFLOOR + Hh[1] * c.s - 10); rr(-40, -56, 80, 104, 8, '#3a2a2a', 4); rr(-30, -46, 60, 22, 4, '#f2c820', 0); g.restore(); }
  g.restore(); }

// ---------- brunch café (flat) ----------
function cafe(t) {
  g.fillStyle = '#f6e7d2'; g.fillRect(-1300, -1300, 3700, 2900); g.fillStyle = '#f1dcc2'; for (let x = -1300; x < 2400; x += 140) g.fillRect(x, -1300, 60, 2900);
  // big arched window with the Brighton Beach boardwalk
  g.save(); g.beginPath(); g.moveTo(330, 1080); g.lineTo(330, 470); g.arc(540, 470, 210, Math.PI, 0); g.lineTo(750, 1080); g.closePath(); g.fillStyle = '#bfe3f5'; g.fill(); g.clip();
  g.fillStyle = '#4aa0d0'; g.fillRect(300, 760, 500, 120); g.fillStyle = '#f2d9a0'; g.fillRect(300, 880, 500, 220); g.fillStyle = '#c8955a'; g.fillRect(300, 930, 500, 30);
  ell(660, 470, 46, 46, '#ffe08a', 0); for (const [cx, cy] of [[430, 560], [610, 620]]) { ell(cx, cy, 50, 20, '#ffffff', 0); ell(cx + 30, cy - 12, 34, 18, '#ffffff', 0); } g.restore();
  g.beginPath(); g.moveTo(330, 1080); g.lineTo(330, 470); g.arc(540, 470, 210, Math.PI, 0); g.lineTo(750, 1080); g.closePath(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
  ln([[540, 262], [540, 1080]], 8); ln([[330, 700], [750, 700]], 8); rr(310, 1070, 460, 30, 8, '#ffffff', 7);
  // menu chalkboard + sign
  rr(-190, 380, 360, 470, 18, '#3a4440', 9); txt('BRUNCH', -10, 450, 62, '#fff6e0', HW); for (const [i, s] of ['MIMOSA', 'PANCAKES', 'AVO TOAST', 'COFFEE'].entries()) { txt(s, -110, 540 + i * 70, 34, '#f6e7d2', HW, 'left'); ell(130, 540 + i * 70, 7, 7, '#f2c820', 0); }
  rr(860, 400, 330, 250, 16, '#fffaf0', 8); txt('BRIGHTON', 1025, 480, 50, '#d63a8a', HW); txt('CAFÉ', 1025, 560, 66, INK, HW);
  // pendant lamps + string lights
  for (const lx of [150, 930]) { ln([[lx, -300], [lx, 210]], 5); poly([[lx - 70, 290], [lx - 30, 210], [lx + 30, 210], [lx + 70, 290]], '#e0b040', 7); ell(lx, 296, 22, 14, '#fff6c0', 5); }
  g.beginPath(); g.moveTo(-400, 160); g.quadraticCurveTo(540, 300, 1500, 160); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  for (let i = 0; i < 16; i++) { const u = i / 15, x = lerp(-400, 1500, u), y = 160 + 140 * 4 * u * (1 - u) * .5 + 8; ell(x, y + 16, 9, 13, ['#ffd23f', '#ff9ac8', '#9fd8c0'][i % 3], 3); }
  // plants
  for (const [px, py] of [[1300, 1180], [-230, 1180]]) { rr(px - 80, py, 160, 170, 20, '#d8784a', 7); for (let k = 0; k < 7; k++) { g.save(); g.translate(px, py + 10); g.rotate(-1.2 + k * .4); ell(0, -110, 30, 110, '#3cb371', 5); g.restore(); } }
  // wainscot + floor
  rr(-1300, 1130, 3700, 340, 0, '#9cc5a1', 7); for (let x = -1300; x < 2400; x += 180) rr(x + 20, 1170, 140, 260, 10, '#a9cfae', 5);
  g.fillStyle = '#c99a6a'; g.fillRect(-1300, 1470, 3700, 1500); for (let r = 0; r < 14; r++) ln([[-1300, 1470 + r * 70], [2400, 1470 + r * 70]], 3, '#b5865a'); ln([[-1300, 1470], [2400, 1470]], 7);
}
function chairs() { for (const c of [LU, ZH, TO]) { rr(c.x - 128, 1225, 256, 300, 70, '#9a5a32', 8); rr(c.x - 96, 1258, 192, 240, 46, '#e8cf9a', 6); for (let k = 0; k < 5; k++) ln([[c.x - 80 + k * 40, 1270], [c.x - 80 + k * 40, 1480]], 3, '#caa86a'); } }
function flute(x, y, k) { g.save(); g.translate(x, y); g.scale(k, k); g.beginPath(); g.moveTo(-17, -118); g.lineTo(17, -118); g.lineTo(13, -50); g.quadraticCurveTo(0, -38, -13, -50); g.closePath(); g.fillStyle = '#f7d36a'; g.fill();
  g.save(); g.clip(); g.fillStyle = '#f39a3a'; g.fillRect(-20, -58, 40, 20); g.fillStyle = '#fff6c0'; g.fillRect(-20, -122, 40, 10); g.restore(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  ln([[0, -42], [0, -6]], 5); ell(0, -4, 18, 5, '#ffffff', 4); for (let i = 0; i < 3; i++) ell(-4 + i * 4, -70 - i * 14, 2.4, 2.4, '#ffffff', 0); g.restore(); }
function table(t) {
  rr(-200, TT, 1420, 46, 14, '#fbf6ee', 7); rr(-180, TT + 42, 1380, 1200, 6, '#e98a9a', 7); for (let x = -160; x < 1200; x += 90) ln([[x, TT + 70], [x, TT + 1100]], 4, '#d77484'); ln([[-180, TT + 120], [1200, TT + 120]], 5);
  // plates in front of each friend (low, never above the hands)
  for (const [px, food] of [[LU.x, 'pancakes'], [ZH.x, 'croissant'], [TO.x, 'toast']]) { ell(px, TT + 8, 92, 16, '#ffffff', 6);
    if (food === 'pancakes') { for (let k = 0; k < 3; k++) rr(px - 52, TT - 6 - k * 13, 104, 14, 7, '#e8b060', 4); rr(px - 14, TT - 50, 28, 12, 4, '#fff1a8', 3); }
    if (food === 'croissant') { g.beginPath(); g.moveTo(px - 60, TT); g.quadraticCurveTo(px, TT - 60, px + 60, TT); g.quadraticCurveTo(px, TT - 18, px - 60, TT); g.fillStyle = '#e8a850'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); for (const d of [-25, 0, 25]) ln([[px + d, TT - 34 + Math.abs(d) * .4], [px + d * .8, TT - 12]], 3); }
    if (food === 'toast') { rr(px - 50, TT - 34, 100, 34, 8, '#e0b070', 5); ell(px, TT - 36, 40, 12, '#8cc06a', 4); } }
  if (t >= TL.GLASS) { const k = ease((t - TL.GLASS) / .25); for (const [i, gx] of [345, 650, 735].entries()) if (t >= TL.GLASS + i * .14) flute(gx, TT + 4, .95 * (i === 0 ? k : 1)); }
}

// ---------- clouds (thoughts) and cards (cutaways) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
const fadeIn = (u0, d = .3) => ease(u0 / d);
function wig2(x, y) { g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-80, 80); g.bezierCurveTo(-110, -40, -70, -110, 0, -112); g.bezierCurveTo(70, -110, 110, -40, 80, 80); g.quadraticCurveTo(60, 20, 40, -20); g.quadraticCurveTo(0, 10, -40, -20); g.quadraticCurveTo(-60, 20, -80, 80); g.closePath(); g.fillStyle = '#f3d27a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  ln([[-30, -80], [20, -95]], 4); ln([[-55, -40], [-20, -70]], 4); rr(-36, 64, 72, 30, 8, '#e0d6c8', 5); g.restore(); }
function tree(x, y, u) { g.save(); g.translate(x, y); poly([[0, -120], [70, 0], [30, 0], [90, 90], [-90, 90], [-30, 0], [-70, 0]], '#d63a8a', 6); rr(-16, 90, 32, 26, 4, '#8a5a2e', 5); star(0, -122, 20, '#f2c820', 4);
  for (let i = 0; i < 6; i++) sparkle(-50 + (i % 3) * 50, -20 + Math.floor(i / 3) * 70, 11, .5 + .5 * Math.sin(u * 30 + i)); g.restore(); }
function bag(x, y) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, -40, 46, Math.PI, 0); g.strokeStyle = INK; g.lineWidth = 14; g.stroke(); g.strokeStyle = '#f2c820'; g.lineWidth = 7; g.stroke();
  rr(-85, -40, 170, 130, 16, '#2a2230', 6); g.strokeStyle = '#f2c820'; g.lineWidth = 6; g.beginPath(); g.arc(-12, 22, 20, .7, 5.6); g.stroke(); g.beginPath(); g.arc(12, 22, 20, -2.4, 2.4); g.stroke(); g.restore(); }
const CARD = {
  mimosa: u => { g.save(); g.translate(250, 450); g.scale(3.0, 3.0); flute(0, 0, 1); g.restore();
    txt('CHAMPAGNE', 580, 200, 56, '#c08a10'); txt('99%', 580, 268, 72, INK); txt('JUICE', 580, 350, 46, '#e0702a'); txt('1%', 580, 408, 56, INK); },
  gossip: u => { const items = [[0, 165, 'NOT HER HAIR', () => wig2(165, 230)], [.33, 430, 'SEQUINS', () => tree(430, 230, u)], [.63, 695, 'MADE IN BRIGHTON', () => bag(695, 260)]];
    for (const [u0, x, lab, fn] of items) { const k = fadeIn((u - u0) * 8.3); if (k <= 0) continue; g.save(); g.globalAlpha *= k; fn(); let f = 42; g.font = `${f}px ${FONT}`; while (g.measureText(lab).width > 250) { f -= 2; g.font = `${f}px ${FONT}`; } txt(lab, x, 412, f, '#d63a8a'); g.restore(); } },
  phone: (u, press) => { rr(130, 20, 300, 450, 40, '#2a2230', 0); rr(146, 38, 268, 414, 30, '#ffffff', 5);
    rr(166, 64, 228, 46, 23, '#eef0f4', 3); txt('fake but gorgeous', 280, 88, 22, '#7a7a8a');
    ell(280, 200, 62, 62, '#f3d27a', 5); g.save(); g.beginPath(); g.ellipse(280, 200, 62, 62, 0, 0, 7); g.clip(); ell(280, 214, 34, 40, '#f4c8a8', 4); ell(280, 284, 56, 30, '#d63a8a', 4); g.restore(); ell(280, 200, 62, 62, null, 5);
    txt('blonde · sequins', 280, 300, 24, INK);
    rr(190, 340, 180, 64, 18, press ? '#e0283a' : '#ffffff', 5); txt(press ? 'BLOCKED' : 'BLOCK', 280, 372, press ? 30 : 34, press ? '#ffffff' : '#e0283a');
    txt('BLOCK!', 640, 200, 88, '#e0283a', HW); txt('?!', 640, 320, 80, INK, HW); },
  check: u => { g.save(); g.translate(430, 250); g.rotate(-.03); rr(-190, -210, 380, 430, 18, '#ffffff', 6);
    txt('BRIGHTON CAFÉ', 0, -160, 34, INK); ln([[-150, -125], [150, -125]], 3, '#bbb'); txt('3 x MIMOSA', -150, -80, 30, INK, FONT, 'left'); txt('$36', 150, -80, 30, INK, FONT, 'right');
    txt('3 x BRUNCH', -150, -30, 30, INK, FONT, 'left'); txt('$54', 150, -30, 30, INK, FONT, 'right'); ln([[-150, 6], [150, 6]], 3, '#bbb'); txt('TOTAL', -150, 44, 36, INK, FONT, 'left'); txt('$90', 150, 44, 36, INK, FONT, 'right');
    const k = ease((u - .3) * 4); if (k > 0) { g.save(); g.globalAlpha *= k; g.translate(0, 140); g.rotate(-.12); g.scale(1.3 - .3 * k, 1.3 - .3 * k); rr(-170, -48, 340, 96, 14, 'rgba(47,154,90,0.12)', 6, '#2f9a5a'); txt('PAID BY', -40, -18, 28, '#2f9a5a'); txt('PETROVICH', -10, 20, 36, '#d63a8a');
      g.beginPath(); g.moveTo(130, 14); g.bezierCurveTo(96, -10, 110, -30, 130, -14); g.bezierCurveTo(150, -30, 164, -10, 130, 14); g.fillStyle = '#ff5a8a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.restore(); } g.restore(); },
};
function panel(id, u, t, a0, b0, thought, press) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u, press); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const PANELS = [['mimosa', BY.w2.at + .2, BY.w2.end + .6], ['gossip', BY.l2.at + .3, BY.l2.end + .35, 'l'], ['phone', BY.z3.at + 1.5, BY.z3.end + .45], ['check', BY.w3.at + 1.0, BY.w3.end + .5]];
function panels(t, cam) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) {
  let puffs = null; if (th) { const hx = 540 + (LU.x + 25 - cam.x) * cam.z, hy = 960 + (FEET - 1330 * S0 - cam.y) * cam.z; puffs = [[hx + 10, hy - 24, 12], [hx + 34, (hy - 40 + 680) / 2, 19]]; }
  panel(id, (t - a) / (b - a), t, a, b, puffs, id === 'phone' && t > BY.z3.end - .45); } }

// ---------- shots ----------
const CAM = {WIDE: [1.0, 540, 1150], WIDE4: [.74, 760, 1170], L_MED: [2.3, 118, 1280], Z_MED: [2.4, 540, 1280], T_MED: [2.3, 962, 1280], LZ: [1.35, 345, 1170], ZT: [1.35, 735, 1170],
  Z_UP: [2.2, 540, 1105], W_MED: [1.6, 1420, 1060], BROOCH: [2.9, 530, 1245]};
const SH = [[0, 'WIDE'], [BY.l1.at + 2.6, 'L_MED'], [BY.z1.at - .1, 'Z_MED'], [BY.t1.at - .1, 'T_MED'], [W_IN1 - .05, 'WIDE4'], [BY.w1.at + 1.0, 'W_MED'], [BY.z2.at - .1, 'Z_MED'], [BY.w2.at - .1, 'W_MED'],
  [BY.l2.at - .1, 'LZ'], [BY.t2.at - .1, 'T_MED'], [BY.z3.at - .1, 'Z_UP'], [BY.l3.at - .1, 'L_MED'], [TL.REVEAL, 'BROOCH', 'Z_MED'], [BY.t3.at - .1, 'T_MED'], [BY.t3.end + .1, 'LZ'],
  [BY.z4.at + 1.0, 'Z_MED'], [W_IN2 - .05, 'WIDE4'], [BY.w3.at + .6, 'W_MED'], [BY.z5.at - .1, 'Z_UP'], [BY.z5.at + 2.6, 'WIDE'], [TL.END, 'END']].map(([at, k, from], i, a) => ({at, k, from, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
let COVERCAM = null;
function camAt(t) { if (COVERCAM) return {...COVERCAM, k: 'COVER', sh: {k: 'COVER'}}; let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'WIDE' : sh.k; let [z, x, y] = CAM[k]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  if (sh.from) { const e = ease((t - sh.at) / .6), f = CAM[sh.from]; z = lerp(f[0], z, e); x = lerp(f[1], x, e); y = lerp(f[2], y, e); return {z, x, y, k, sh}; }
  const push = sh.i % 3 === 2 || k === 'WIDE4' ? 0 : .035 * ease(u), punch = sh.at > 0 ? .03 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = [["I can't even", 'у меня нет слов'], ['fake', 'фальшивка'], ['gorgeous', 'шикарная'], ['Спиллни ти', 'spill the tea — выкладывай'], ['ю ноу', 'you know — понимаешь'], ['drama', 'драма'],
  ['джуса', 'juice — сока'], ['So extra', 'это перебор'], ['Лоу-ки', 'low-key — слегка, вроде'], ['зачекаю', 'check — проверю'], ['инсте', 'Instagram'], ['заблокаю', 'block — заблокирую'], ['real', 'настоящий']];
const GLINE = {z1: [['Спиллни ти', 'spill the tea — выкладывай']], z4: [['gorgeous', 'шикарная']], z3: [["I can't even", 'у меня нет слов'], ['зачекаю', 'check — проверю'], ['заблокаю', 'block — заблокирую']]};
const TRB = {w1: ['Привет, дамы! Для начала принести вам мимозы?'], w2: ['Так… по сути, шампанское.', 'Рада за вас.'], w3: ['Ах да, ваш счёт уже оплачен.', 'Какой-то… Петрович?']};
const CHOVR = {t2: ['So extra. Лоу-ки на кого-то похожа…'], l2: ['Короче! Волосы — блонд, но не свои.', 'Блёстки — как на ёлке.', 'Сумка — Шанель, но с Брайтона!'], w1: ['Hi, ladies! Can I start you off with some mimosas?'], w3: ["Oh, and your check's been taken care of.", 'Some guy named… Petrovich?']};
function chunks(l) { let out; if (CHOVR[l.id]) out = CHOVR[l.id]; else { const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur); }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map((c, i) => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, tr: (TRB[l.id] || [])[i], who: l.who, id: l.id}; }); }
const CH = L.map(l => ({l, ch: chunks(l)}));
// chips: one per glossed word, shown only while its caption chunk is on screen, each at least 1.2 s
const CHIPS = []; for (const {l, ch} of CH) { if (l.who === 'w') continue; ch.forEach((c, ci) => { const endC = c.b + (ci === ch.length - 1 ? .25 : 0), found = [];
  for (const [w, tr] of (GLINE[l.id] || GLOSS)) { const i = c.s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) found.push({w, tr, a: Math.max(c.a, c.a + (c.b - c.a) * i / c.s.length - .1)}); }
  found.sort((p, q) => p.a - q.a); const keep = []; for (const f of found) { if (keep.length && f.a < keep[keep.length - 1].a + 1.2) f.a = keep[keep.length - 1].a + 1.2; if (endC - f.a < 1.2 && keep.length) break; keep.push(f); }
  keep.forEach((f, k) => { const b = k + 1 < keep.length ? keep[k + 1].a : endC; if (b - f.a >= 1.2) CHIPS.push({...f, b}); else if (k === 0 && endC - c.a >= 1.2) CHIPS.push({...f, a: Math.max(c.a, endC - 1.2), b: endC}); }); }); }
const RUSS = /^(спиллни|ти|ю|ноу|джуса|лоу-ки|зачекаю|инсте|заблокаю)$/i;
const isEn = w => /[a-z]/i.test(w) || RUSS.test(w.replace(/[«»"?!.,…—:]/g, ''));
function curChunk(t) { let cur = null; for (const {ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? .25 : 0)) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  outlinedWords(cur.s.split(' '), 1640, 70, w => cur.who === 'w' ? '#ffd23f' : isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 48, () => '#ffffff'); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK1 = 2.9;
function hook(t) { if (t > HOOK1 + .3) return; const k = ease(t / .25) * (1 - ease((t - HOOK1) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 330); g.rotate(-.025);
  rr(-440, -125, 880, 250, 30, '#fffaf0', 8); txt('ЖАННА НА БРАНЧЕ', 0, -45, 72, INK); txt('СПЛЕТНИ', 0, 50, 96, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, '#d63a8a');
  const R = [['SPILL THE TEA', 'выкладывай сплетни'], ["I CAN'T EVEN", 'у меня нет слов'], ['FAKE / GORGEOUS', 'фальшивка / шикарная'], ['SO EXTRA', 'это перебор'], ['LOW-KEY', 'слегка, вроде как'], ['LOVE THAT FOR YOU', 'рада за тебя'], ["IT'S BEEN TAKEN CARE OF", 'уже оплачено']];
  R.forEach(([en, ru], i) => { const y = 410 + i * 128; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Жанна — FAKE или GORGEOUS?', 540, 1360, 50, INK); txt('FAKE, GORGEOUS или ОБА?', 540, 1430, 50, '#d63a8a'); txt('Пишите в комменты', 540, 1530, 44, INK); g.restore(); }

function frame(t) {
  const c = camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); cafe(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.03)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); chairs(); luda(t); toma(t); zhanna(t); table(t); waitress(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END' && !COVERCAM) panels(t, c);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); }
}
module.exports = {frame, cv, TL};
if (require.main === module) {
  const [mode, arg, outName] = process.argv.slice(2);
  if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
  else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
    (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
  else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
    let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep5.srt', out); }
  else if (mode === 'cover') { const t = +(arg || 54.5); COVERCAM = {z: 2.15, x: 550, y: 1110}; process.env.NOCAP = 1; frame(t);
    g.save(); g.translate(540, 330 + 165); g.rotate(-.02); rr(-450 + 8, -165 + 10, 900, 330, 34, 'rgba(42,34,48,0.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
    const fit = (s, f0) => { let f = f0; g.font = `${f}px ${FONT}`; while (g.measureText(s).width > 820) { f -= 2; g.font = `${f}px ${FONT}`; } return f; };
    txt('ЖАННА НА БРАНЧЕ', 0, -88, fit('ЖАННА НА БРАНЧЕ', 74), INK); txt('FAKE, НО GORGEOUS', 0, 6, fit('FAKE, НО GORGEOUS', 92), '#d63a8a'); txt('СПЛЕТНИ С ПОДРУГАМИ', 0, 98, fit('СПЛЕТНИ С ПОДРУГАМИ', 56), INK); g.restore();
    fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
  else if (mode === 'chips') { for (const c of CHIPS) console.log(c.w, c.a.toFixed(2), c.b.toFixed(2), (c.b - c.a).toFixed(2)); }
}
