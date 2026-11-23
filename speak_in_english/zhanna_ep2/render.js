// «Тётя Жанна с Брайтона», ep2 «Жанна в салоне ногтей» — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt   (NOCAP=1 hides captions)
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
  nails: s => [[s * 78, -860], [s * 205, -820], [s * 262, -960]],
  phone: s => s > 0 ? [[78, -860], [190, -860], [150, -1040]] : [[-78, -860], [-50, -720], [40, -650]],
  walk: s => [[s * 78, -860], [s * 100, -720], [s * 105, -590]],
};
const BG = {
  work: s => s < 0 ? [[-78, -860], [-170, -720], [-250, -650]] : [[78, -860], [50, -720], [-40, -650]],
  present: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -820]] : [[78, -860], [50, -720], [-40, -650]],
  shapes: s => [[s * 78, -860], [s * 170, -800], [s * 160, -960]],
  terminal: s => s < 0 ? [[-78, -860], [-190, -820], [-290, -840]] : [[78, -860], [50, -720], [-40, -650]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
};
const FRONT = new Set(['explain', 'brooch', 'table', 'work', 'nails']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'phone'], [.55, 'palm']], z2: [[0, 'explain'], [.5, 'palm']], z3: [[0, 'explain'], [.55, 'shrug']], z4: [[0, 'brooch']], z5: [[0, 'shrug'], [.5, 'wag']], z6: [[0, 'palm'], [.6, 'table']],
  z7: [[0, 'nails']], z8: [[0, 'shrug'], [.4, 'wag']], z9: [[0, 'palm']], z10: [[0, 'phone']], z11: [[0, 'explain'], [.55, 'palm']]};
const BPLAN = {b1: [[0, 'hips']], b2: [[0, 'present']], b3: [[0, 'work']], b4: [[0, 'shapes']], b5: [[0, 'present']], b6: [[0, 'present'], [.45, 'terminal']], b7: [[0, 'terminal']], b8: [[0, 'terminal']], b9: [[0, 'terminal']]};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of P[l.id]) if (u >= k) gg = v; return gg; } return idle; }
function zAct(t) { if (t >= TL.END) return {g: 'nails', mood: 'grin'}; if (t >= TL.PHONE - .1 && t < BY.z10.end + .2) return {g: 'phone', mood: 'smug'};
  if (t < BY.z1.at + .4) return {g: 'walk', mood: 'smug'};
  const idle = t > BY.b1.end && t < BY.z6.end ? 'table' : t > TL.LATER ? 'table' : 'palm', l = lineAt(t);
  return {g: plan(ZPLAN, 'z', t, idle), mood: l && l.id === 'b5' ? 'flat' : 'smug'}; }
function bAct(t) { const l = lineAt(t); if (t >= TL.END) return {g: 'hips', mood: 'grin'};
  if (t >= BY.b6.at + 1.2 && t < TL.END && !(l && l.who === 'b')) return {g: 'terminal', mood: t >= BY.b9.at - .2 ? 'grin' : t > BY.z8.at + 2 ? 'surprised' : 'flat'};
  const idle = t > BY.b2.end && t < BY.z6.end ? 'work' : 'hips'; return {g: plan(BPLAN, 'b', t, idle), mood: l && l.id === 'b8' ? 'surprised' : t >= BY.b9.at - .2 ? 'grin' : 'flat'}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function nailsOn(hx, hy, col, glossy) { for (let k = 0; k < 4; k++) { const a = -2.3 + k * .45; const x = hx + Math.cos(a) * 26, y = hy + Math.sin(a) * 24; ell(x, y, 6, 8, col, 2); if (glossy) ell(x - 2, y - 3, 2, 3, '#ffffff', 0); } }
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH;
  const walkK = ease((t - .3) / 1.8), x = lerp(-260, c.x, walkK) + Math.sin(t * 1.4) * 4 * (spk ? 1.4 : 1), bob = walkK < 1 ? Math.abs(Math.sin(t * 9)) * 10 : 0;
  const tilt = spk ? .06 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  T.draw(g, {...c, x, y: FEET - bob, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 9 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look: spk ? .2 : .6});
  const S = c.s, bx = x - 40 * S, by = FEET - bob - 790 * S * br; star(bx, by, 32, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = FEET - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  const done = t > TL.LATER + 1;
  for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], H = P3[2]; if (a.act.g === 'phone' && s > 0) continue; hand(x + H[0] * S, FEET - bob + H[1] * S * br, Math.atan2(H[1] - E[1], H[0] - E[0]), S, c.pal.skin, done ? '#fff4f8' : '#d63a8a', done); }
  if (a.act.g === 'phone' && a.e > .8) { const H = a.fn(1)[2]; rr(x + H[0] * S - 24, FEET + H[1] * S - 64, 48, 90, 10, '#e05a8a', 5); } }
function gumR(t) { // Brook's bubble gum radius
  const bl = (a, b, r) => t >= a && t < b ? r * Math.sin(Math.PI * clamp((t - a) / (b - a))) : 0;
  let r = Math.max(bl(BY.b1.end + .1, BY.b1.end + 1.4, 38), bl(BY.b2.end + .2, BY.b3.at - .12, 62) * (t < BY.b3.at - .12 ? 1 : 0), bl(BY.z8.end - 1.6, BY.b8.at + .3, 70));
  if (t >= BY.z8.end - 1.6 && t < BY.b8.end + .4) r = 70 * clamp((t - (BY.z8.end - 1.6)) / .8) * (1 - clamp((t - BY.b8.at) / .5));
  return r; }
function brook(t) { const l = lineAt(t), spk = l && l.who === 'b', a = blendArms(bAct, BG, t), c = BR, x = c.x + Math.sin(t * 1.2 + 2) * 3;
  const chew = !spk && gumR(t) < 4 ? .12 + .1 * Math.abs(Math.sin(t * 7)) : 0, stop = t > BY.z8.end - .5 && t < TL.END;
  T.draw(g, {...c, x, y: FEET, arms: (a.fn = wig(a.fn, t, spk ? 7 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : stop ? 0 : chew, blink: blink(t, 5), tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: -.6});
  for (const s of [-1, 1]) { if (a.act.g === 'terminal' && s < 0) continue; const P3 = a.fn(s), E = P3[1], H = P3[2]; hand(x + H[0] * c.s, FEET + H[1] * c.s, Math.atan2(H[1] - E[1], H[0] - E[0]), c.s, c.pal.skin, '#b48ad8', false); }
  const r = gumR(t), mx = x - 4, my = FEET - c.s * 952; if (r > 3) { ell(mx - r * .3, my + 6, r, r * .95, '#ff9ac8', 5); ell(mx - r * .55, my - r * .3, r * .18, r * .12, 'rgba(255,255,255,.7)', 0); }
  const pop = BY.b3.at - .12; if (t >= pop && t < pop + .3) { const k = (t - pop) / .3; for (let i = 0; i < 6; i++) { const ag = i / 6 * 6.28; ell(mx - 20 + Math.cos(ag) * 60 * k, my + Math.sin(ag) * 50 * k, 10 * (1 - k), 8 * (1 - k), '#ff9ac8', 3); } }
  if (a.act.g === 'terminal' && a.e > .8) { const H = a.fn(-1)[2]; rr(x + H[0] * c.s - 40, FEET + H[1] * c.s - 80, 70, 110, 10, '#2a2a33', 5); rr(x + H[0] * c.s - 32, FEET + H[1] * c.s - 72, 54, 50, 6, '#bfe3f5', 3); } }

// ---------- clouds (Zhanna's thoughts) and cards (cutaways) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
function bigNail(x, y, s, base, tipCol, glossy, matteHalf, square) { g.save(); g.translate(x, y); g.scale(s, s); rr(-60, -40, 120, 260, 50, '#f4c8a8', 7);
  g.beginPath(); if (square) { g.moveTo(-46, 120); g.lineTo(-46, -100); g.lineTo(46, -100); g.lineTo(46, 120); } else { g.moveTo(-46, 120); g.lineTo(-46, -10); g.quadraticCurveTo(-46, -90, 0, -110); g.quadraticCurveTo(46, -90, 46, -10); g.lineTo(46, 120); } g.closePath(); g.fillStyle = base; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.save(); g.clip(); g.fillStyle = tipCol; g.fillRect(-50, -120, 100, 60); if (matteHalf) { g.fillStyle = 'rgba(120,100,110,0.25)'; g.fillRect(0, -120, 60, 260); } g.restore();
  if (glossy) { ell(-22, -40, 8, 30, 'rgba(255,255,255,.85)', 0); sparkle(-30, -90, 16, 1); } g.restore(); }
const CARD = {
  z3: u => { bigNail(230, 215, 1.0, '#ffe4ee', '#ffffff', true, true); txt('GLOSSY', 520, 160, 54, '#d63a8a'); txt('+', 520, 230, 54, INK); txt('MATTE', 520, 300, 54, '#7a6a72'); txt('?!', 720, 230, 110, INK, HW); },
  b4: u => { bigNail(260, 215, 1.0, '#ff9ac8', '#ff9ac8', true, false, true); txt('SQUARE', 260, 425, 46, INK);
    bigNail(600, 215, 1.0, '#ff9ac8', '#ff9ac8', true); txt('ALMOND', 600, 425, 46, INK); },
  z5: u => { for (let i = 0; i < 3; i++) { g.save(); g.translate(220 + i * 150, 270); g.rotate(-.2 + i * .2); ell(0, 0, 50, 75, '#c8955a', 6); for (let k = 0; k < 4; k++) ln([[-30, -40 + k * 25], [30, -45 + k * 25]], 4, '#8a5a2e'); g.restore(); }
    if (u > .5) { txt('ACHOO!', 650, 200, 90, '#e0283a', HW); for (let i = 0; i < 6; i++) ell(600 + i * 30, 320 + Math.sin(i) * 30, 8, 8, '#bfe3f5', 3); } },
  b6a: u => { for (let i = 0; i < 2; i++) bigNail(300 + i * 260, 300, 1.15, '#ffe4ee', '#ffffff', true); for (let i = 0; i < 5; i++) sparkle(150 + i * 140, 120 + (i % 2) * 300, 22, .5 + .5 * Math.sin(u * 20 + i)); },
  term: (u, press) => { rr(230, 20, 400, 480, 40, '#2a2a33', 0); rr(250, 40, 360, 440, 28, '#f6f6fa', 5); txt('TOTAL  $60.00', 430, 90, 34, INK); txt('Would you like', 430, 150, 32, INK); txt('to add a tip?', 430, 190, 32, INK);
    ['18%', '20%', '25%'].forEach((p, i) => rr(270 + i * 112, 230, 100, 80, 16, '#3a8ae0', 4)); ['18%', '20%', '25%'].forEach((p, i) => txt(p, 320 + i * 112, 270, 34, '#ffffff'));
    if (press === 'paid') { rr(270 + 2 * 112, 230, 100, 80, 16, '#2f9a5a', 6); txt('25%', 320 + 2 * 112, 270, 34, '#ffffff'); rr(270, 340, 320, 100, 16, '#e7f7ee', 5); txt('PAID BY', 430, 368, 30, '#2f9a5a'); txt('PETROVICH', 410, 408, 34, '#d63a8a'); g.beginPath(); g.moveTo(534, 424); g.bezierCurveTo(500, 400, 514, 380, 534, 396); g.bezierCurveTo(554, 380, 568, 400, 534, 424); g.fillStyle = '#ff5a8a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); return; }
    rr(290, 340, 280, 80, 16, press ? '#e0283a' : '#ffffff', 5); txt('No tip', 430, 380, 38, press ? '#ffffff' : INK);
    if (press) { g.save(); g.translate(500, 420); g.rotate(-.5); rr(-22, -10, 44, 120, 22, '#f4c8a8', 6); ell(0, -2, 15, 20, '#fff4f8', 4); g.restore(); } },
  phone: u => { rr(170, 20, 260, 420, 40, '#2a2230', 0); rr(186, 38, 228, 384, 30, '#3a3550', 5); ell(300, 130, 50, 50, '#c8a060', 5); txt('Petrovich', 300, 222, 36, '#ffffff'); txt('incoming call', 300, 262, 24, '#bbb');
    ell(245, 360, 32, 32, '#e0283a', 5); ell(355, 360, 32, 32, '#2f9a5a', 5); txt('NOSE MODE', 640, 110, 52, '#d63a8a', HW);
    const k = ease((u - .1) * 3); g.save(); g.translate(lerp(700, 430, k), lerp(330, 345, k)); ell(0, 0, 66, 52, '#f4c8a8', 7); ell(-22, 16, 9, 7, '#e2aa88', 0); ell(22, 16, 9, 7, '#e2aa88', 0); g.restore(); },
};
function panel(id, u, t, a0, b0, thought, press) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .25) / .25)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) for (const [x, y, r] of thought) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u, press); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .9 + .1 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const ZT = [[420, 770, 14], [380, 712, 22]], BT = null;
function panels(t) { const P = [['z3', BY.z3.at, BY.z3.end + .25, ZT], ['b4', BY.b4.at - .1, BY.b4.end + .4, BT], ['z5', BY.z5.at, BY.z5.end + .25, ZT], ['b6a', BY.b6.at - .1, BY.b6.at + 1.3, BT],
  ['term', BY.b6.at + 1.3, BY.b6.end + .4, BT], ['term', BY.z8.at + (BY.z8.end - BY.z8.at) * .55, BY.b8.end + .3, BT, true], ['phone', TL.PHONE, BY.z10.end + .2, ZT], ['term', BY.b9.at - .4, BY.z11.end + .3, BT, 'paid']];
  for (const [id, a, b, th, press] of P) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b, th, press === 'paid' ? 'paid' : press && t > a + .6); }
function laterCard(t) { const a = TL.LATER, b = BY.b6.at - .05; if (t < a || t >= b) return; const k = ease((t - a) / .2) * (1 - ease((t - b + .2) / .2));
  g.save(); g.globalAlpha = k; g.fillStyle = '#ff9ac8'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffb6d6'; for (let x = -200; x < 1300; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 60, 0); g.lineTo(x + 460, H); g.lineTo(x + 400, H); g.fill(); }
  txt('30 MINUTES', 540, 860, 130, INK); txt('LATER…', 540, 1000, 130, '#ffffff'); g.save(); g.translate(540, 1200); g.rotate(Math.sin(t * 18) * .25); rr(-140, -18, 280, 36, 18, '#f0e0c8', 6); g.restore(); g.restore(); }

// ---------- shots ----------
const CAM = {TWO: [1.05, 545, 1020], Z_MED: [1.6, 320, 900], B_MED: [1.6, 775, 930], Z_UP: [1.5, 330, 760], B_UP: [1.5, 775, 790], B_CU: [2.2, 790, 930]};
const SH = [[0, 'TWO'], [BY.b1.at - .1, 'B_MED'], [BY.z2.at - .1, 'Z_MED'], [BY.b2.at - .1, 'B_MED'], [BY.z3.at - .1, 'Z_UP'], [BY.b3.at - .3, 'B_MED'], [BY.z4.at - .1, 'Z_MED'], [BY.b4.at - .1, 'B_UP'],
  [BY.z5.at - .1, 'Z_UP'], [BY.b5.at - .1, 'B_MED'], [BY.z6.at - .1, 'Z_MED'], [TL.LATER, 'TWO'], [BY.b6.at - .1, 'B_UP'], [BY.z7.at - .1, 'Z_MED'], [BY.b7.at - .1, 'B_MED'], [BY.z8.at - .1, 'Z_MED'],
  [BY.z8.at + (BY.z8.end - BY.z8.at) * .55, 'B_UP'], [BY.b8.at - .1, 'B_CU'], [BY.z9.at - .1, 'TWO'], [TL.PHONE - .1, 'Z_UP'], [BY.b9.at - .4, 'B_UP'], [BY.z11.at - .1, 'Z_MED'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'TWO' : sh.k, [z, x, y] = CAM[k], u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .04 * ease(u), punch = sh.at > 0 ? .04 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = [['date', 'свидание'], ['Appointment', 'запись'], ['забукаю', 'book — запишусь'], ['ю ноу', 'you know — понимаешь'], ['Френч', 'French tip'], ['too much', 'перебор'], ['glossy', 'глянцевый'],
  ['matte', 'матовый'], ['лакшери', 'luxury — роскошь'], ['сейле', 'sale — распродажа'], ['allergy', 'аллергия'], ['almond', 'миндальная форма'], ['затэгаю', 'tag — отмечу'], ['Tip', 'чаевые? кончик?'],
  ['Okay', 'хорошо'], ["You're welcome", 'пожалуйста'], ['пикапнуть', 'pick up — взять трубку'], ['нэйлз', 'nails — ногти'], ['коллбэкну', 'call back — перезвоню']];
const GLINE = {z8: [['tip', 'совет']], z10: [['sixty dollars', 'шестьдесят долларов'], ['tip', 'чаевые'], ['twenty five percent', '25 процентов'], ['generous', 'щедрая']], z11: [['tip', 'чаевые']]};
const TRB = {b1: ['Привет! Вы записаны?'], b2: ['Хорошо… Что делаем сегодня?'], b3: ['Глянцевый… и матовый?'], b4: ['Квадрат или миндаль?'], b5: ['Я про форму, дорогая.'],
  b6: ['Готово! С вас шестьдесят…', 'Хотите оставить чаевые?'], b7: ['Нет, дорогая. Чаевые… мне.'], b8: ['…Спасибо?'], b9: ['Боже… спасибо!'], z9: ['Пожалуйста!']};
function chunks(l) { const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map((c, i) => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, tr: (TRB[l.id] || [])[i], who: l.who}; }); }
const CH = L.map(l => ({l, ch: chunks(l)}));
const chips = []; for (const l of L) { if (l.who !== 'z') continue; const s = l.text; for (const [w, tr] of (GLINE[l.id] || GLOSS)) { const i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) chips.push({a: l.at + (l.end - l.at) * i / s.length, w, tr}); } }
chips.sort((a, b) => a.a - b.a);
const isEn = w => /[a-z]/i.test(w) || /^(ю|ноу|деточке-NOPE|забукаю|френч|лакшери|сейле|затэгаю|пикапнуть|нэйлз|коллбэкну)/i.test(w.replace(/[«»"?!.,…—:]/g, ''));
function curChunk(t) { let cur = null; for (const {l, ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? .25 : 0)) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  outlinedWords(cur.s.split(' '), 1640, 70, w => cur.who === 'b' ? '#ffd23f' : isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 46, () => '#bfe9ff'); }
function chip(t) { const cur = curChunk(t); if (!cur || cur.who !== 'z') return; const low = cur.s.toLowerCase(); let c = null; for (const q of chips) if (t >= q.a - .1 && low.includes(q.w.toLowerCase())) c = q; if (!c) return;
  const k = ease((t - Math.max(c.a - .1, cur.a)) / .15), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
function hook(t) { const T1 = BY.b1.at + .6; if (t > T1 + .3) return; const k = ease(t / .25) * (1 - ease((t - T1) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.025);
  rr(-440, -110, 880, 220, 30, '#fffaf0', 8); txt('ЖАННА ДЕЛАЕТ', 0, -40, 76, INK); txt('МАНИКЮР', 0, 46, 88, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, '#d63a8a');
  const R = [['APPOINTMENT', 'запись'], ['FRENCH TIP', 'френч'], ['GLOSSY / MATTE', 'глянцевый / матовый'], ["YOU'RE ALL SET", 'всё готово'], ['WOULD YOU LIKE TO ADD A TIP?', 'хотите оставить чаевые?'], ['TIP', 'чаевые · совет · кончик'], ["YOU'RE WELCOME", 'пожалуйста (в ответ на спасибо)']];
  R.forEach(([en, ru], i) => { const y = 410 + i * 128; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('А вы что нажмёте:', 540, 1360, 48, INK); txt('18%, 20%, 25% или No tip?', 540, 1430, 48, '#d63a8a'); txt('Пишите в комменты', 540, 1530, 44, INK); g.restore(); }

function frame(t) {
  const c = camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); salon(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.04)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); brook(t); zhanna(t); table(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END') panels(t); laterCard(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else if (!(t >= TL.LATER && t < BY.b6.at)) { chip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.writeFileSync('final/zhanna_ep2.srt', out); }
