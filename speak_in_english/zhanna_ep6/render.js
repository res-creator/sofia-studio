// «Тётя Жанна с Брайтона», ep6 «Жанна учит Брук русскому» — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt   (NOCAP=1 hides captions)
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

const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 650, s: .8};

// ---------- nail salon (flat) ----------
const FEET = 1720, TABLE = 1240;
function salon(t) {
  g.fillStyle = '#f7cfe0'; g.fillRect(-1200, -1200, 3480, 2600); g.fillStyle = '#f2bfd4'; for (let x = -1200; x < 2280; x += 110) g.fillRect(x, -1200, 50, 2600);
  // neon sign
  const glow = .75 + .25 * Math.sin(t * 3); g.save(); g.shadowColor = `rgba(255,80,170,${glow})`; g.shadowBlur = 40; rr(250, 170, 580, 170, 30, '#3a2236', 8); txt('NAILS', 540, 258, 120, '#ff7ac0', HW); g.restore();
  // polish shelves
  const C = ['#e0283a', '#d63a8a', '#ff9ac8', '#b48ad8', '#3a5ad8', '#2fb0a0', '#f0b030', '#ffffff', '#2a2230', '#c86a4a'];
  for (const [y, n0] of [[640, 0], [900, 5]]) { for (let i = 0; i < 13; i++) { const x = -60 + i * 92, c = C[(i + n0) % C.length]; rr(x, y - 90, 50, 90, 14, c, 5); rr(x + 14, y - 130, 22, 42, 5, '#2a2230', 4); ell(x + 18, y - 64, 6, 14, 'rgba(255,255,255,.55)', 0); }
    rr(-200, y, 1480, 24, 6, '#ffffff', 6); }
  // plant + mirror
  rr(-160, 1050, 200, 190, 20, '#ffffff', 7); for (let k = 0; k < 6; k++) { const a = -2.4 + k * .35; g.save(); g.translate(-60, 1060); g.rotate(a + Math.PI / 2); ell(0, -90, 26, 90, '#3cb371', 5); g.restore(); }
  ell(1080, 1000, 120, 170, '#dff2fb', 8);
  // floor
  for (let r = 0; r < 12; r++) for (let c = -12; c < 24; c++) { g.fillStyle = (r + c) % 2 ? '#ffffff' : '#2a2230'; g.fillRect(c * 110, 1380 + r * 110, 110, 110); }
  ln([[-1200, 1380], [2280, 1380]], 7);
}
function table(t) { // manicure table in front of both: hides legs
  rr(120, TABLE, 840, 40, 14, '#ffffff', 7); rr(140, TABLE + 36, 800, 700, 6, '#ff9ac8', 7); ln([[140, TABLE + 140], [940, TABLE + 140]], 5);
  rr(480, TABLE - 26, 120, 30, 14, '#f6efdc', 5); // hand cushion
  for (let i = 0; i < 4; i++) rr(132 + i * 36, TABLE - 54, 26, 54, 9, ['#e0283a', '#ff9ac8', '#ffffff', '#d63a8a'][i], 4); }

// ---------- characters ----------
const BR = {hair: 'bun', lashes: true, pal: {skin: '#f2d0b8', skinS: '#e2b498', hair: '#b48ad8', brow: '#7a5aa8', top: '#3a3a46', topS: '#2a2a33', collar: '#ff9ac8', bottom: '#3a3a46', legs: '#3a3a46', shoe: '#2a2230', sole: '#2a2230'}, x: 790, s: .74};
ZH.x = 300; ZH.s = .78;
const ZG = {
  table: s => s > 0 ? [[78, -860], [170, -720], [250, -650]] : [[-78, -860], [-50, -720], [40, -650]],
  palm: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : [[-78, -860], [-50, -720], [40, -650]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : [[-78, -860], [-50, -720], [40, -650]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-50, -720], [40, -650]],
  text: s => s > 0 ? [[78, -860], [170, -760], [215, -820]] : [[-78, -860], [-50, -720], [40, -650]],
};
const BG = {
  work: s => s < 0 ? [[-78, -860], [-170, -720], [-250, -650]] : [[78, -860], [50, -720], [-40, -650]],
  present: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -820]] : [[78, -860], [50, -720], [-40, -650]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  file: s => s < 0 ? [[-78, -860], [-170, -770], [-235, -830]] : [[78, -860], [160, -740], [86, -640]],
  terminal: s => s < 0 ? [[-78, -860], [-180, -800], [-250, -800]] : [[78, -860], [160, -740], [86, -640]],
  grab: s => s < 0 ? [[-78, -860], [-200, -820], [-310, -840]] : [[78, -860], [160, -740], [86, -640]],
  vmsg: s => s < 0 ? [[-78, -860], [-175, -770], [-235, -870]] : [[78, -860], [160, -740], [86, -640]],
};
const FRONT = new Set(['explain', 'brooch', 'table', 'work', 'text', 'vmsg', 'file', 'terminal']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z2: [[0, 'explain'], [.6, 'palm']], z3: [[0, 'brooch']], z4: [[0, 'explain'], [.6, 'shrug']], z5: [[0, 'explain'], [.5, 'palm']], z6: [[0, 'brooch']],
  z7: [[0, 'explain'], [.5, 'palm']], z8: [[0, 'wag']], z9: [[0, 'brooch'], [.5, 'shrug']], z10: [[0, 'wag']], z11: [[0, 'text']], z12: [[0, 'text']], z13: [[0, 'shrug'], [.55, 'explain']]};
const ZMOOD = {z3: 'surprised', z8: 'angry', z12: 'surprised', b7: 'surprised', b5: 'flat'};
const BPLAN = {b1: [[0, 'shrug'], [.5, 'present']], b2: [[0, 'shrug']], b3: [[0, 'file']], b4: [[0, 'shrug']], b5: [[0, 'shrug']], b7: [[0, 'terminal']], b8: [[0, 'shrug']],
  b9: [[0, 'grab']], b10: [[0, 'vmsg']], b11: [[0, 'vmsg']], b12: [[0, 'vmsg']]};
const BMOOD = {b4: 'surprised', b5: 'grin', b7: 'smug', b10: 'smug', b11: 'smug', b12: 'smug'};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id]) if (u >= k) gg = v; return gg; } return idle; }
const HAS_PHONE_Z = t => t >= TL.PHONE - .1 && t < BY.b9.end - .1, PINK_B = t => t >= BY.b9.end - .1 && t < TL.DOOR - .3, BLUE_B = t => t >= TL.IVAN - .05;
const TERM = t => t >= BY.b7.at - .35 && t < BY.z8.end + .2;
function zAct(t) { const l = lineAt(t); if (t >= TL.END) return {g: 'palm', mood: 'grin'};
  if (HAS_PHONE_Z(t)) return {g: 'text', mood: l && ZMOOD[l.id] || (l && l.id === 'b9' ? 'surprised' : 'smug')};
  if (t >= TL.R1 && t < BY.z13.at) return {g: 'shrug', mood: 'surprised'};
  return {g: plan(ZPLAN, 'z', t, 'table'), mood: l && ZMOOD[l.id] || 'smug'}; }
function bAct(t) { const l = lineAt(t); if (t >= TL.END) return {g: 'vmsg', mood: 'grin'};
  if (PINK_B(t) || BLUE_B(t)) return {g: 'vmsg', mood: t >= TL.R3 ? 'grin' : 'smug'};
  if (TERM(t)) return {g: 'terminal', mood: 'smug'};
  if (t >= TL.DOOR - .3 && t < TL.IVAN) return {g: 'hips', mood: 'smug'};
  return {g: plan(BPLAN, 'b', t, 'work'), mood: l && BMOOD[l.id] || 'flat'}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function nailsOn(hx, hy, col, glossy) { for (let k = 0; k < 4; k++) { const a = -2.3 + k * .45; const x = hx + Math.cos(a) * 26, y = hy + Math.sin(a) * 24; ell(x, y, 6, 8, col, 2); if (glossy) ell(x - 2, y - 3, 2, 3, '#ffffff', 0); } }

function phoneProp(x, y, S, col) { g.save(); g.translate(x, y); g.scale(S, S); rr(-30, -62, 60, 104, 12, col, 6); rr(-22, -52, 44, 70, 6, '#bfe3f5', 3); g.restore(); }
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH;
  const x = c.x + Math.sin(t * 1.4) * 4 * (spk ? 1.4 : 1);
  const tilt = spk ? .05 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  const look = t >= TL.DOOR && t < BY.z13.at + 1 ? -.9 : a.act.g === 'text' ? .9 : spk ? .2 : .6;
  T.draw(g, {...c, x, y: FEET, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 8 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look});
  const S = c.s, bx = x - 40 * S, by = FEET - 790 * S * br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = FEET - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], H = P3[2]; const hx = x + H[0] * S, hy = FEET + H[1] * S * br;
    if (s > 0 && a.act.g === 'text' && a.e > .6) phoneProp(hx + 6, hy - 46 * S, S, '#e05a8a');
    hand(hx, hy, Math.atan2(H[1] - E[1], H[0] - E[0]), S, c.pal.skin, '#d63a8a', true); } }
function gumR(t) { // Brook's bubble gum radius
  const bl = (a, b, r) => t >= a && t < b ? r * Math.sin(Math.PI * clamp((t - a) / (b - a))) : 0;
  let r = bl(BY.b1.end + .15, BY.b1.end + 1.4, 36);
  const p0 = BY.b12.end + .05, p1 = TL.POP; if (t >= p0 && t < p1) r = 72 * ease((t - p0) / (p1 - p0));
  return r; }
function brook(t) { const l = lineAt(t), spk = l && l.who === 'b', a = blendArms(bAct, BG, t), c = BR, x = c.x + Math.sin(t * 1.2 + 2) * 3;
  const chew = !spk && gumR(t) < 4 ? .12 + .1 * Math.abs(Math.sin(t * 7)) : 0;
  T.draw(g, {...c, x, y: FEET, arms: (a.fn = wig(a.fn, t, spk ? 7 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : chew, blink: blink(t, 5), tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: -.6});
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], H = P3[2], hx = x + H[0] * c.s, hy = FEET + H[1] * c.s, ang = Math.atan2(H[1] - E[1], H[0] - E[0]);
    if (s < 0 && a.act.g === 'vmsg' && a.e > .6) phoneProp(hx - 4, hy - 46 * c.s, c.s, BLUE_B(t) ? '#3a8ae0' : '#e05a8a');
    if (s < 0 && a.act.g === 'file' && a.e > .6) { g.save(); g.translate(hx, hy); g.rotate(ang - .5); rr(10 * c.s, -6 * c.s, 95 * c.s, 12 * c.s, 5, '#e8d2b0', 4); g.restore(); }
    hand(hx, hy, ang, c.s, c.pal.skin, '#b48ad8', false);
    if (s < 0 && a.act.g === 'terminal' && a.e > .8) { rr(hx - 44, hy - 96, 76, 118, 12, '#2a2a33', 5); rr(hx - 35, hy - 87, 58, 50, 6, '#bfe3f5', 3); txt('30%', hx - 6, hy - 62, 22, '#d63a8a'); } }
  const r = gumR(t), mx = x - 4, my = FEET - c.s * 952; if (r > 3) { ell(mx - r * .3, my + 6, r, r * .95, '#ff9ac8', 5); ell(mx - r * .55, my - r * .3, r * .18, r * .12, 'rgba(255,255,255,.7)', 0); }
  const pop = TL.POP; if (t >= pop && t < pop + .3) { const k = (t - pop) / .3; for (let i = 0; i < 6; i++) { const ag = i / 6 * 6.28; ell(mx - 20 + Math.cos(ag) * 60 * k, my + Math.sin(ag) * 50 * k, 10 * (1 - k), 8 * (1 - k), '#ff9ac8', 3); } } }

// ---------- cards: Zhanna's lesson board, Brook's day, tip terminal, chats ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
const tAt = (id, w) => { const l = BY[id], i = l.text.indexOf(w); if (i < 0) throw new Error(id + ' ' + w); return l.at + (l.end - l.at) * i / l.text.length; };
function fitTxt(s, x, y, size, col, maxW, font = FONT) { g.font = `${size}px ${font}`; while (g.measureText(s).width > maxW && size > 20) { size -= 2; g.font = `${size}px ${font}`; } txt(s, x, y, size, col, font); }
function head101(s = 'RUSSIAN 101') { txt(s, 430, 82, 30, '#9a8a92'); ln([[300, 108], [560, 108]], 3, '#e5d6dc'); }
function board(word, sub) { head101(); fitTxt(word, 430, 205, 124, '#d63a8a', 740); sub.forEach((s, i) => fitTxt(s, 430, 332 + i * 72, 56, '#1f3a8a', 740)); }
function rain(x, y) { for (let i = 0; i < 3; i++) ln([[x - 24 + i * 22, y + 26], [x - 32 + i * 22, y + 48]], 4, '#3a8ae0'); ell(x - 20, y, 22, 18, '#dfe6ee', 4); ell(x + 10, y - 8, 28, 24, '#dfe6ee', 4); ell(x + 34, y + 4, 18, 15, '#dfe6ee', 4); }
function flame(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); poly([[0, -46], [24, -8], [26, 18], [0, 34], [-26, 18], [-24, -8]], '#ff8a2a', 4); poly([[0, -14], [12, 6], [0, 24], [-12, 6]], '#ffd23f', 0); g.restore(); }
const pin = (t, a) => ease((t - a) / .25);
function icoCar(x, y) { rr(x - 80, y - 10, 160, 50, 14, '#3a8ae0', 5); poly([[x - 50, y - 10], [x - 30, y - 45], [x + 30, y - 45], [x + 50, y - 10]], '#bfe3f5', 5); ell(x - 45, y + 42, 18, 18, INK, 0); ell(x + 45, y + 42, 18, 18, INK, 0);
  ln([[x + 80, y + 10], [x + 120, y - 50], [x + 150, y - 50]], 6); }
function icoRing(x, y) { ell(x, y + 18, 40, 40, null, 9); g.strokeStyle = '#f2c820'; g.lineWidth = 6; g.beginPath(); g.arc(x, y + 18, 40, 0, 7); g.stroke(); poly([[x - 22, y - 30], [x + 22, y - 30], [x + 32, y - 18], [x, y + 4], [x - 32, y - 18]], '#bfe9ff', 4); }
function icoWallet(x, y) { rr(x - 70, y - 30, 140, 90, 14, '#c86a4a', 5); rr(x + 20, y, 60, 30, 10, '#e08a6a', 4); for (let i = 0; i < 3; i++) { g.save(); g.translate(x - 40 + i * 40, y - 60 - (i % 2) * 14); ell(-8, 0, 9, 6, '#cfc6d6', 3); ell(8, 0, 9, 6, '#cfc6d6', 3); g.restore(); } }
function bubble(y, s, mine, k, h = 66) { g.font = `38px ${FONT}`; const w = Math.max(...s.split('\n').map(q => g.measureText(q).width)) + 48; const bx = mine ? 790 - w : 70;
  g.save(); g.globalAlpha *= k; g.translate(0, (1 - k) * 18); rr(bx, y - h / 2, w, h, 26, mine ? '#ff9ac8' : '#e9e6ee', 4);
  s.split('\n').forEach((q, i, A) => txt(q, bx + w / 2, y + (i - (A.length - 1) / 2) * 44, 38, INK)); g.restore(); }
function vbubble(y, k) { const w = 300, bx = 790 - w; g.save(); g.globalAlpha *= k; g.translate(0, (1 - k) * 18); rr(bx, y - 33, w, 66, 26, '#ff9ac8', 4);
  poly([[bx + 30, y - 16], [bx + 30, y + 16], [bx + 56, y]], INK, 0);
  for (let i = 0; i < 14; i++) { const hh = 8 + 20 * Math.abs(Math.sin(i * 1.9 + 1)); rr(bx + 74 + i * 11, y - hh / 2, 6, hh, 3, INK, 0); } txt('0:01', bx + 262, y, 26, INK);
  txt('«Ой. Всё.»', bx + w / 2, y + 56, 34, '#d63a8a'); g.restore(); }
function chat(t, who, M) { // M: [time, text|'VOICE', mine, height]
  let y = 150, rows = []; for (const [a, s, mine, h] of M) { if (t < a) break; rows.push([a, s, mine, h, y + h / 2 - 33]); y += h + 14; }
  const need = Math.max(0, y - 14 - 470), last = rows.length ? rows[rows.length - 1][0] : 0, prevNeed = (() => { let yy = 150; for (const r of rows.slice(0, -1)) yy += r[3] + 14; return Math.max(0, yy - 14 - 470); })();
  const sc = lerp(prevNeed, need, ease((t - last) / .3)); g.save(); g.translate(0, -sc);
  for (const [a, s, mine, h, yy] of rows) { const k = pin(t, a); s === 'VOICE' ? vbubble(yy, k) : bubble(yy, s, mine, k, h); } g.restore();
  rr(30, 30, PW - 60, 76, 0, '#fffaf0', 0); ln([[40, 106], [PW - 40, 106]], 3, '#e5d6dc'); ell(400 - who.length * 9, 68, 22, 22, '#c8a060', 4); txt(who, 450 + 14, 70, 36, INK); }
const CARD = {
  avos: () => { board('АВОСЬ', ['fingers crossed', "maybe it'll work out"]); rain(745, 78); },
  norm: () => { board('НОРМАЛЬНО', ["it's fine", 'not bad']); flame(745, 82, .9); flame(118, 82, .9); },
  day: t => { head101("BROOK'S DAY"); [['towed', icoCar, 'car towed'], ['engaged', icoRing, 'ex engaged'], ['broke', icoWallet, 'broke']].forEach(([w, f, lab], i) => { const k = pin(t, tAt('b5', w) - .15); if (k <= 0) return;
      const x = 170 + i * 260; g.save(); g.globalAlpha *= k; g.translate(x, 250); g.scale(.85 + .15 * k, .85 + .15 * k); f(0, 0); fitTxt(lab, 0, 145, 40, '#1f3a8a', 230); g.restore(); });
    const k = pin(t, BY.b5.end - .1); if (k > 0) { g.save(); g.globalAlpha *= k; g.translate(700, 80); g.rotate(-.08); txt('НОРМАЛЬНО!', 0, 0, 40, '#d63a8a'); g.restore(); } },
  davai: t => { head101(); txt('ДАВАЙ', 430, 196, 112, '#d63a8a');
    [['bye!', 'bye'], ['come on!', 'come on'], ["let's!", "let's"]].forEach(([s, w], i) => { const k = pin(t, tAt('z7', w) - .1); const x = 165 + i * 265;
      g.save(); g.globalAlpha *= .35 + .65 * k; g.translate(x, 360); g.scale(.9 + .1 * k, .9 + .1 * k); rr(-118, -50, 236, 100, 26, k > .5 ? '#e7efff' : '#f1eef2', 5); fitTxt(s, 0, 0, 46, k > .5 ? '#1f3a8a' : '#9a8a92', 200); g.restore(); }); },
  term: t => { rr(250, 40, 360, 440, 28, '#f6f6fa', 5); txt('TOTAL  $60.00', 430, 90, 34, INK); txt('Add a tip?', 430, 150, 36, INK);
    ['18%', '20%', '30%'].forEach((q, i) => { const hot = i === 2 && t > BY.b7.at; rr(270 + i * 112, 210, 100, 80, 16, hot ? '#d63a8a' : '#3a8ae0', hot ? 7 : 4); txt(q, 320 + i * 112, 250, 34, '#ffffff'); });
    const k = pin(t, BY.b7.at); if (k > 0) { g.save(); g.globalAlpha *= k; g.translate(544, 320); g.rotate(-.12); rr(-70, -26, 140, 52, 14, '#fffaf0', 4); txt('ДАВАЙ', 0, 0, 30, '#d63a8a'); g.restore(); }
    rr(290, 380, 280, 70, 16, '#ffffff', 4); txt('No tip', 430, 415, 34, '#9a8a92'); },
  oy: () => { board('ОЙ ВСЁ', ["I'm done.", 'whatever.']); },
  chatP: t => chat(t, 'Petrovich', [[TL.PHONE, 'Late one hour.', false, 66], [tAt('z11', 'ой всё') - .1, 'ой всё', true, 66], [TL.OKMSG, 'ok', false, 66], [TL.SENT, 'VOICE', true, 108], [TL.R1, 'ON MY WAY!!!', false, 66], [TL.R2, '…AND A RING!!!', false, 66]]),
  chatI: t => chat(t, 'Ivan', [[TL.IVAN, 'Sorry, running late.', false, 66], [TL.SENT2, 'VOICE', true, 108], [TL.R3, 'ON MY WAY!!!', false, 66]]),
};
function panel(id, t, a0, b0) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.translate(PX, PY); rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10);
  g.save(); g.beginPath(); g.roundRect(30, 30, PW - 60, PH - 60, 36); g.clip(); CARD[id](t); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const PANELS = () => [['avos', BY.z2.at, BY.z3.end + .3], ['norm', BY.z4.at, BY.z5.end + .15], ['day', BY.b5.at - .1, BY.z6.end + .35], ['davai', BY.z7.at, BY.z7.end + .8],
  ['term', BY.b7.at - .3, BY.z8.end + .3], ['oy', BY.z9.at, BY.b8.end + .3], ['chatP', TL.PHONE, TL.DOOR + .3], ['chatI', TL.IVAN, BY.b12.end + .15]];
function panels(t) { for (const [id, a, b] of PANELS()) if (t >= a && t < b) panel(id, t, a, b); }
function ding(t) { const a = TL.DOOR + .3, b = BY.z13.at + 1.2; if (t < a || t >= b) return; const k = ease((t - a) / .3) * (1 - ease((t - b + .3) / .3));
  g.save(); g.globalAlpha = k; g.translate(210, 400); g.rotate(-.12 + .03 * Math.sin(t * 9)); star(0, 0, 150, '#ffd23f', 8, 12); txt('DING!', 0, 4, 60, INK); g.restore(); }
function doorLight(t) { const a = TL.DOOR, b = BY.z13.end + .3; if (t < a || t >= b) return; const k = ease((t - a) / .5) * (1 - ease((t - b + .4) / .4));
  g.save(); g.globalAlpha = k; poly([[-400, 380], [110, 470], [110, 1380], [-400, 1380]], 'rgba(255,240,190,0.85)', 0); poly([[-400, 1380], [110, 1380], [330, 1920], [-400, 1920]], 'rgba(255,240,190,0.7)', 0);
  const s = ease((t - a - .2) / 1.2), bx = -150 + s * 150, by = 820; g.fillStyle = 'rgba(60,30,60,0.45)';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(bx + Math.cos(i * .9) * 34, by + Math.sin(i * .9) * 30 - 20, 26, 22, 0, 0, 7); g.fill(); }
  g.beginPath(); g.moveTo(bx - 14, by + 10); g.lineTo(bx + 14, by + 10); g.lineTo(bx + 4, by + 170); g.lineTo(bx - 4, by + 170); g.fill(); g.restore(); }
function phoneOnTable(t) { if (t >= TL.DOOR - .3 && t < TL.IVAN) { rr(860, TABLE - 22, 90, 24, 8, '#e05a8a', 5); } }

// ---------- shots ----------
const CAM = {TWO: [1.05, 545, 1020], Z_MED: [1.6, 320, 900], B_MED: [1.6, 775, 930], Z_UP: [1.5, 330, 760], Z_UP2: [1.42, 350, 775], B_UP: [1.5, 775, 790], B_UP2: [1.42, 760, 800], TWO_D: [1.0, 470, 1010]};
const SH = [[0, 'TWO'], [BY.z2.at - .1, 'Z_UP'], [BY.b2.at - .1, 'B_UP'], [BY.b3.at - .1, 'B_UP2'], [BY.z3.at - .1, 'Z_UP2'], [BY.z4.at - .1, 'Z_UP'], [BY.b4.at - .1, 'B_UP2'], [BY.z5.at - .1, 'Z_UP2'],
  [BY.b5.at - .1, 'B_UP'], [BY.z6.at - .1, 'Z_UP2'], [BY.z7.at - .1, 'Z_UP'], [BY.b7.at - .4, 'B_UP2'], [BY.z8.at - .1, 'Z_UP2'], [BY.z9.at - .1, 'Z_UP'], [BY.b8.at - .1, 'B_UP'], [BY.z10.at - .1, 'Z_UP2'],
  [BY.z11.at - .1, 'Z_UP'], [BY.b9.at - .1, 'B_UP'], [BY.b10.at - .1, 'B_UP2'], [TL.R1 - .1, 'Z_UP'], [TL.DOOR + .3, 'TWO_D'], [TL.IVAN - .1, 'B_UP'], [BY.b12.end + .15, 'B_MED'],
  [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'TWO' : sh.k, [z, x, y] = CAM[k], u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .035 * ease(u), punch = sh.at > 0 ? .03 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = [['umbrella', 'зонт'], ['рейнит', 'rain — пойдёт дождь'], ["it's fine", 'всё нормально'], ['ю ноу', 'you know — понимаешь'], ['Сендую', 'send — отправляю']];
const GLINE = {z7: [], z5: [["it's fine", 'всё нормально']], z2: [['umbrella', 'зонт · рейнит — rain']]};
const TRB = {b1: ['Жанна, у меня вечером свидание с русским.', 'Научи меня русскому. Быстро.'], b2: ['Авось? Типа…', 'скрестим пальцы?'], b3: ['Поняла. Пилку я не продезинфицировала. Авось?'],
  b4: ['Нормал… ноу? Так это НЕ нормально?'], b5: ['Нормально! Машину эвакуировали,', 'бывший женится, а я на мели!'], b7: ["(let's do it!)"], b8: ["(I'm done?)"], b9: ['Не-не, дорогая. Дай сюда.'],
  b10: ["(I'm done.)"], b11: ["(I'm done.)"], b12: ['(No big deal, hun.)']};
function chunks(l) { const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); let out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 30 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  const dur = s => (l.end - l.at) * s.length / l.text.length; // merge chunks shorter than 1.2 s into a neighbour
  for (let i = 0; i < out.length; i++) if (out.length > 1 && dur(out[i]) < 1.0) { const j = i < out.length - 1 ? i + 1 : i - 1; const m = j > i ? out[i] + ' ' + out[j] : out[j] + ' ' + out[i]; out.splice(Math.min(i, j), 2, m); i = -1; }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map((c, i) => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, tr: (TRB[l.id] || [])[i], who: l.who, l: l.id}; }); }
const CH = L.map(l => ({l, ch: chunks(l)}));
const chips = []; for (const l of L) { if (l.who !== 'z') continue; const s = l.text; for (const [w, tr] of (GLINE[l.id] || GLOSS)) { const i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) chips.push({a: l.at + (l.end - l.at) * i / s.length, w, tr, id: l.id}); } }
chips.sort((a, b) => a.a - b.a);
const isEn = w => /[a-z]/i.test(w) || /^(ю|ноу|рейнит|сендую)$/i.test(w.replace(/[«»"?!.,…—:()]/g, ''));
function curChunk(t) { let cur = null; for (const {l, ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? Math.max(.25, 1.25 - (c.b - c.a)) : 0)) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  outlinedWords(cur.s.split(' '), 1640, 70, w => isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 46, () => '#bfe9ff'); }
function chipAt(t) { const cur = curChunk(t); if (!cur || cur.who !== 'z') return null; const low = cur.s.toLowerCase(), cand = chips.filter(q => q.id === cur.l && low.includes(q.w.toLowerCase())); if (!cand.length) return null; let c = cand[0]; for (const q of cand) if (t >= q.a - .1) c = q; return {c, cur}; }
function chip(t) { const r = chipAt(t); if (!r) return; const {c, cur} = r;
  const k = ease((t - cur.a) / .15), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
function hook(t) { const T1 = BY.b1.at + 1.6; if (t > T1 + .3) return; const k = ease(t / .25) * (1 - ease((t - T1) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.025);
  rr(-450, -110, 900, 220, 30, '#fffaf0', 8); txt('ЖАННА УЧИТ', 0, -42, 76, INK); txt('АМЕРИКАНКУ РУССКОМУ', 0, 46, 66, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('РУССКИЙ ДЛЯ БРУК', 540, 290, 64, '#d63a8a');
  const R = [['АВОСЬ', "fingers crossed · maybe it'll work out"], ['НОРМАЛЬНО', "it's fine · not bad"], ['ДАВАЙ', "bye · come on · let's"], ['ОЙ ВСЁ', "I'm done · whatever"], ['Я НА МЕЛИ', "I'm broke"], ['ОПАЗДЫВАЮ', "I'm running late"], ['УЖЕ ЕДУ', "I'm on my way"]];
  R.forEach(([ru, en], i) => { const y = 405 + i * 124; txt(ru, 540, y, 52, '#c0283a'); fitTxt(en, 540, y + 50, 40, '#1f3a8a', 880); });
  txt('Какое русское слово', 540, 1330, 48, INK); txt('Брук выучит следующим?', 540, 1395, 48, INK); txt('Пишите — лучшее', 540, 1490, 50, '#d63a8a'); txt('возьмём в серию', 540, 1555, 50, '#d63a8a'); g.restore(); }

function frame(t) {
  const c = camAt(t); if (process.env.CAMDY) c.y -= +process.env.CAMDY / c.z; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); salon(t); doorLight(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.04)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); if (!c.k.startsWith('Z_')) brook(t); if (!c.k.startsWith('B_')) zhanna(t); table(t); phoneOnTable(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END' && !process.env.NOPANEL) { panels(t); ding(t); }
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep6.srt', out); }
else if (mode === 'check') { // durations of every chunk / chip / panel (owner: nothing on screen < 1.2 s)
  for (const {ch} of CH) for (const c of ch) if (c.b - c.a + (c === ch[ch.length - 1] ? Math.max(.25, 1.25 - (c.b - c.a)) : 0) < 1.2) console.log('short chunk', (c.b - c.a).toFixed(2), c.s);
  let prev = null, st = 0; for (let t = 0; t < TL.TOTAL; t += 1 / 30) { const r = chipAt(t), key = r ? r.c.w + r.c.a : null; if (key !== prev) { if (prev) console.log('chip', prev.slice(0, 16), (t - st).toFixed(2)); prev = key; st = t; } }
  for (const [id, a, b] of PANELS()) console.log('panel', id, a.toFixed(2), (b - a).toFixed(2)); console.log('shots', SH.map(s => s.k + ':' + (s.end - s.at).toFixed(1)).join(' ')); }
else if (mode === 'chunks') { for (const {l, ch} of CH) for (const c of ch) console.log(l.id, c.a.toFixed(2), c.b.toFixed(2), c.s, '|', c.tr || ''); }
else if (mode === 'cover') { // NOCAP still, scene shifted down 180 px (top strip = real background), cream plate 900x330 at y=330, 3 lines
  process.env.CAMDY = 180; frame(+arg); const c2 = createCanvas(W, H), q = c2.getContext('2d'); q.drawImage(cv, 0, 0); // scene rendered 180 px lower, top strip filled with real background
  g = q; g.save(); g.translate(540, 330 + 165); g.rotate(-.02); rr(-450 + 10, -165 + 12, 900, 330, 34, 'rgba(42,34,48,0.35)', 0); rr(-450, -165, 900, 330, 34, '#fffaf0', 9);
  fitTxt('АМЕРИКАНКА СКАЗАЛА', 0, -88, 70, INK, 820); fitTxt('«ОЙ ВСЁ»', 0, 4, 116, '#d63a8a', 820); fitTxt('И ПЕТРОВИЧ ПРИБЕЖАЛ', 0, 98, 66, INK, 820); g.restore();
  fs.writeFileSync('final/cover.png', c2.toBuffer('image/png')); }
