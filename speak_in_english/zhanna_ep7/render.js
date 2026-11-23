// «Тётя Жанна с Брайтона», ep7 v2 «Петрович заговорил» (his face is never shown) — flat 2D. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | info   (NOCAP=1 hides captions)
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

// Zhanna: exactly as in ep2 (palette, hair, brooch, sparkles, pink nails)
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 215, s: .76};
// Petrovich: ~60, grey flat cap, simple brown jacket, grey moustache, kind eyes
const PE = {hair: 'short', cap: true, moustache: true, pal: {skin: '#eec3a2', skinS: '#d9a583', hair: '#cfcfcf', brow: '#9a9a9a', stache: '#dcdcdc', cap: '#7a808c', capS: '#5e6470', top: '#8a6d52', topS: '#6e553f', collar: '#eef3f8', bottom: '#4a4a52', legs: '#4a4a52', shoe: '#2a2230', sole: '#2a2230'}, x: 760, s: .76};
// Waiter Tyler: young American, black shirt, red tie
const WA = {hair: 'spiky', pal: {skin: '#f0c9a8', skinS: '#ddae8c', hair: '#6b4a2e', brow: '#4a3220', top: '#2f2f3a', topS: '#23232c', collar: '#ffffff', tie: '#c8323c', bottom: '#2a2a33', legs: '#2a2a33', shoe: '#1e1e24', sole: '#1e1e24'}, x: 1300, s: .72};

// ---------- restaurant (flat) ----------
const SEAT = 1850, TABLE = 1352;
function restaurant(t) {
  g.fillStyle = '#f1dcc4'; g.fillRect(-1200, -1200, 3480, 2600); g.fillStyle = '#ead0b4'; for (let x = -1200; x < 2280; x += 120) g.fillRect(x, -1200, 54, 2600);
  // window with the night street
  rr(620, 180, 520, 560, 20, '#2c3a5c', 10); g.save(); g.beginPath(); g.roundRect(630, 190, 500, 540, 14); g.clip();
  for (let i = 0; i < 7; i++) { const bx = 620 + i * 80, bh = 180 + hash(i) * 260; rr(bx, 740 - bh, 70, bh, 4, '#3d4c72', 0); for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > .45) rr(bx + 14 + (k % 2) * 26, 760 - bh + 30 + Math.floor(k / 2) * 46, 14, 20, 2, '#ffd98a', 0); }
  ell(1040, 270, 34, 34, '#fff1c8', 0); g.restore(); ln([[880, 180], [880, 740]], 10); ln([[620, 460], [1140, 460]], 10);
  // framed pictures
  rr(-40, 260, 300, 220, 10, '#c89a4a', 9); rr(-14, 286, 248, 168, 4, '#8fb8c8', 5); poly([[-14, 454], [70, 360], [140, 420], [190, 380], [234, 454]], '#5a8a6a', 4);
  rr(330, 300, 200, 250, 10, '#c89a4a', 9); rr(354, 324, 152, 202, 4, '#f6e8d0', 5); ell(430, 420, 40, 50, '#d06a5a', 4);
  // sign
  const glow = .7 + .2 * Math.sin(t * 2); g.save(); g.shadowColor = `rgba(255,150,80,${glow})`; g.shadowBlur = 30; rr(40, 40, 520, 140, 26, '#3a2a2a', 8); txt('BRIGHTON GRILL', 300, 112, 64, '#ffb46a', HW); g.restore();
  // wainscot
  rr(-1200, 880, 3480, 520, 0, '#8a5a3c', 0); for (let x = -1180; x < 2280; x += 200) rr(x, 920, 160, 400, 10, '#7a4c30', 5); ln([[-1200, 880], [2280, 880]], 9);
  // plant
  rr(-170, 700, 180, 180, 18, '#c46a4a', 7); for (let k = 0; k < 6; k++) { const a = -2.4 + k * .35; g.save(); g.translate(-80, 710); g.rotate(a + Math.PI / 2); ell(0, -90, 26, 90, '#3c9a6a', 5); g.restore(); }
  // floor
  g.fillStyle = '#b07a52'; g.fillRect(-1200, 1400, 3480, 900); for (let x = -1200; x < 2280; x += 140) ln([[x, 1400], [x - 60, 2300]], 5, '#946240'); ln([[-1200, 1400], [2280, 1400]], 7);
}
function glass(x, y, kind, fill) { // y = table top
  if (kind === 'flute') { ln([[x, y], [x, y - 60]], 7); ell(x, y - 2, 22, 6, '#ffffff', 5); g.beginPath(); g.moveTo(x - 18, y - 160); g.lineTo(x + 18, y - 160); g.lineTo(x + 12, y - 62); g.quadraticCurveTo(x, y - 52, x - 12, y - 62); g.closePath(); g.fillStyle = 'rgba(230,245,255,.9)'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    g.save(); g.clip(); g.fillStyle = '#f6d36a'; g.fillRect(x - 20, y - 130, 40, 80); g.restore(); g.beginPath(); g.moveTo(x - 18, y - 160); g.lineTo(x + 18, y - 160); g.lineTo(x + 12, y - 62); g.quadraticCurveTo(x, y - 52, x - 12, y - 62); g.closePath(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); return; }
  if (kind === 'wine') { ln([[x, y], [x, y - 50]], 7); ell(x, y - 2, 24, 6, '#ffffff', 5); g.beginPath(); g.moveTo(x - 30, y - 130); g.lineTo(x + 30, y - 130); g.quadraticCurveTo(x + 32, y - 52, x, y - 50); g.quadraticCurveTo(x - 32, y - 52, x - 30, y - 130); g.closePath(); g.fillStyle = 'rgba(230,245,255,.9)'; g.fill();
    g.save(); g.clip(); g.fillStyle = fill || '#f2e6a0'; g.fillRect(x - 34, y - 96, 68, 50); g.restore(); g.beginPath(); g.moveTo(x - 30, y - 130); g.lineTo(x + 30, y - 130); g.quadraticCurveTo(x + 32, y - 52, x, y - 50); g.quadraticCurveTo(x - 32, y - 52, x - 30, y - 130); g.closePath(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); return; }
  rr(x - 26, y - 90, 52, 90, 8, 'rgba(225,242,255,.9)', 5); rr(x - 22, y - 60, 44, 56, 6, 'rgba(160,210,240,.7)', 0); }
function plate(x, y, food) { ell(x, y - 6, 92, 22, '#ffffff', 6); ell(x, y - 8, 62, 13, '#f4f0ea', 3);
  if (food === 'steak') { ell(x - 10, y - 18, 40, 14, '#8a4a2a', 5); ln([[x - 30, y - 22], [x - 4, y - 14]], 3, '#5a2a14'); ln([[x - 14, y - 24], [x + 12, y - 16]], 3, '#5a2a14'); }
  if (food === 'fish') { g.beginPath(); g.moveTo(x - 50, y - 14); g.quadraticCurveTo(x, y - 40, x + 40, y - 14); g.quadraticCurveTo(x, y + 10, x - 50, y - 14); g.closePath(); g.fillStyle = '#b8c8d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
  if (food === 'bones') { ln([[x - 40, y - 14], [x + 34, y - 14]], 4); for (let k = 0; k < 4; k++) ln([[x - 26 + k * 16, y - 24], [x - 26 + k * 16, y - 4]], 3); poly([[x + 34, y - 14], [x + 52, y - 26], [x + 52, y - 2]], '#ffffff', 4); } }
function table(t) { // in front of the seated pair: hides their lower bodies
  rr(-140, TABLE, 1140, 34, 12, '#fffaf2', 7); rr(-124, TABLE + 30, 1108, 700, 6, '#fffaf2', 7); for (let x = -100; x < 980; x += 70) ln([[x, TABLE + 60], [x, TABLE + 640]], 3, '#efe4d4'); rr(-124, TABLE + 30, 1108, 36, 0, '#c8323c', 5);
  const later = t >= TL.LATER + .2;
  // candle in the middle (between the faces, below the chins)
  rr(475, TABLE - 70, 34, 70, 8, '#fff4dc', 5); const fl = 1 + .08 * Math.sin(t * 13); ell(492, TABLE - 92, 11 * fl, 20 * fl, '#ffc94a', 4); ell(492, TABLE - 88, 5, 9, '#fff2b0', 0);
  if (!later) { rr(150, TABLE - 16, 150, 18, 4, '#7a2a30', 4);  }   // closed menus
  else { plate(222, TABLE, t < BOX0 ? 'steak' : null); plate(760, TABLE, t < TL.FORK + 1.2 ? 'fish' : 'bones'); }
  glass(70, TABLE, 'flute'); glass(905, TABLE, t >= BY.w4.at ? 'wine' : 'water');
  if (t >= BOX0) { const k = ease((t - BOX0) / .4); g.save(); g.globalAlpha = k; rr(590, TABLE - 66, 100, 64, 8, '#f2ecdc', 6); ln([[590, TABLE - 50], [690, TABLE - 50]], 4); g.restore(); } // to-go box (steams at p7)
}

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
};
const PG = {
  rest: s => [[s * 78, -860], [s * 140, -740], [s * 80, -690]],
  present: s => s > 0 ? [[78, -860], [160, -760], [240, -800]] : [[-78, -860], [-140, -740], [-80, -690]],
  cap: s => s > 0 ? [[78, -860], [290, -1020], [222, -1212]] : [[-78, -860], [-140, -740], [-80, -690]],
  pay: s => s > 0 ? [[78, -860], [175, -760], [235, -700]] : [[-78, -860], [-140, -740], [-80, -690]],
  hold: s => [[s * 78, -860], [s * 160, -800], [s * 235, -930]],
  raise: s => s > 0 ? [[78, -860], [200, -1000], [190, -1300]] : [[-78, -860], [-160, -800], [-235, -930]],
};
const WG = {
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  pad: s => s < 0 ? [[-78, -860], [-140, -740], [-46, -780]] : [[78, -860], [130, -730], [24, -800]],
  present: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -800]] : [[78, -860], [102, -720], [110, -580]],
  point: s => s < 0 ? [[-78, -860], [-180, -770], [-290, -720]] : [[78, -860], [102, -720], [110, -580]],
  check: s => s < 0 ? [[-78, -860], [-170, -770], [-270, -760]] : [[78, -860], [102, -720], [110, -580]],
  take: s => s < 0 ? [[-78, -860], [-175, -800], [-285, -850]] : [[78, -860], [102, -720], [110, -580]],
  pour: s => s > 0 ? [[78, -860], [150, -760], [150, -680]] : [[-78, -860], [-102, -720], [-110, -580]],
};
const FRONT = new Set(['table', 'explain', 'brooch', 'rest', 'pad', 'pour']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'explain'], [.4, 'brooch'], [.72, 'wag']], z2: [[0, 'palm'], [.35, 'explain'], [.72, 'shrug']], z3: [[0, 'point'], [.55, 'wag']], z4: [[0, 'shock']], z5: [[0, 'shrug'], [.5, 'palm']], z6: [[0, 'point'], [.6, 'brooch']]};
const PPLAN = {p5: [[0, 'raise']]};
const WPLAN = {w1: [[0, 'present'], [.55, 'pad']], w2: [[0, 'pad']], w3: [[0, 'present']], w4: [[0, 'take']], w6: [[0, 'check']], w5: [[0, 'present'], [.5, 'point']]};
// ---- Petrovich stays hidden: menu -> newspaper, hands, back view, steam. Paper top never goes below PMIN (cap brim level), except under full steam.
const RAISED = 930, PMIN = 994, GA0 = BY.z3.at + 1.6, GA1 = GA0 + 1.0, MT = BY.w4.at + .35, BOX0 = BY.z5.end - .3, CAPT = BY.p4.at + .3;
const STEAM = [BY.p7.at - .75, BY.p7.at - .25, BY.p7.end + .45, BY.p7.end + 1.0];   // rise start, full cover, fade start, gone
function steamK(t) { return t < STEAM[0] || t > STEAM[3] ? 0 : t < STEAM[1] ? ease((t - STEAM[0]) / (STEAM[1] - STEAM[0])) : t < STEAM[2] ? 1 : 1 - ease((t - STEAM[2]) / (STEAM[3] - STEAM[2])); }
function paperTop(t) { let y = RAISED;
  if (t >= GA0 && t < GA1 + .9) y = t < GA0 + 1.2 ? lerp(RAISED, PMIN, ease((t - GA0) / 1.2)) : lerp(PMIN, RAISED, ease((t - GA1 - .6) / .3));   // gag 1: lowers… waiter steps in front
  if (t >= BY.p7.at - .15 && t < BY.p7.end + .4) y = t < BY.p7.end ? lerp(RAISED, 1250, ease((t - BY.p7.at + .15) / .3)) : lerp(1250, RAISED, ease((t - BY.p7.end) / .3));   // steam gag
  if (t >= BY.p8.at + .2 && t < TL.CUT) y = lerp(RAISED, PMIN, ease((t - BY.p8.at - .2) / (TL.CUT - BY.p8.at - .35)));   // cliffhanger
  return y; }
const FORKK = [[0, [235, -930]], [.45, [40, -690]], [.7, [40, -700]], [1.05, [175, -1250]], [1.25, [70, -1180]], [1.75, [70, -1180]], [1.95, [175, -1250]], [2.3, [235, -930]]];
function forkHand(t) { const u = t - TL.FORK; if (u < 0 || u > 2.3) return null; let i = 0; while (i < FORKK.length - 2 && u > FORKK[i + 1][0]) i++; const [a, p] = FORKK[i], [b, q] = FORKK[i + 1], k = ease((u - a) / (b - a)); return {p: [lerp(p[0], q[0], k), lerp(p[1], q[1], k)], full: u > .55 && u < 1.3, chew: u > 1.25 && u < 1.75}; }
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of (P[l.id] || [])) if (u >= k) gg = v; return gg; } return idle; }
const REVEAL = BY.p3.at + 1.0;
function zAct(t) { if (t >= TL.END) return {g: 'table', mood: 'grin'}; const l = lineAt(t);
  const shocked = t >= REVEAL && t < TL.LATER, idle = t >= BY.z4.at && t < TL.LATER ? 'shock' : 'table';
  return {g: plan(ZPLAN, 'z', t, idle), mood: shocked && !(l && l.who === 'z') ? 'surprised' : l && l.id === 'p7' ? 'flat' : 'smug'}; }
function pAct(t) { return {g: plan(PPLAN, 'p', t, 'hold'), mood: 'kind'}; }
function wAct(t) { if (t >= TL.END) return {g: 'down', mood: 'grin'}; const l = lineAt(t);
  let idle = t > BY.w1.end && t < BY.w4.at ? 'pad' : 'down'; if (t >= GA1 + .5 && t < BY.z3.end + .4) idle = 'pour'; if (t >= MT - .3 && t < BY.w4.end + 1.4) idle = 'take'; if (t >= TL.CHECK - .6 && t < BY.p6.end + .1) idle = 'check';
  const mood = l && l.id === 'w2' ? 'smug' : l && (l.id === 'w4' || l.id === 'w6') && (t - l.at) < 1.0 ? 'surprised' : t >= REVEAL - .4 && t < BY.w4.at ? 'surprised' : l && l.who === 'w' ? null : t >= BY.p6.at + 1 && t < BY.w5.end ? 'grin' : null;
  return {g: plan(WPLAN, 'w', t, idle), mood}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function hands(x, y, S, a, c, nail, glossy) { for (const s of [-1, 1]) { const P3 = a.fn(s), E = P3[1], Hh = P3[2]; hand(x + Hh[0] * S, y + Hh[1] * S, Math.atan2(Hh[1] - E[1], Hh[0] - E[0]), S, c.pal.skin, nail, glossy); } }

function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH, x = c.x + Math.sin(t * 1.4) * 3 * (spk ? 1.4 : 1), y = SEAT;
  const tilt = spk ? .05 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  T.draw(g, {...c, x, y, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 8 : 2)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look: spk ? .4 : .7});
  const S = c.s, bx = x - 40 * S, by = y - 790 * S * br; star(bx, by, 30, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  hands(x, y, S, a, c, '#d63a8a', true); }
function paper(x, top, kind, alpha = 1) { const w = 170, h = 360; g.save(); g.globalAlpha *= alpha;
  if (kind === 'menu') { rr(x - w, top, w * 2, h, 14, '#7a2a30', 7); rr(x - w + 18, top + 18, w * 2 - 36, h - 36, 8, null, 4, '#e8c27a'); txt('MENU', x, top + 120, 64, '#e8c27a', HW); star(x, top + 210, 22, '#e8c27a', 4); }
  else { rr(x - w, top, w * 2, h, 6, '#f4f1e8', 7); txt('BRIGHTON TIMES', x, top + 42, 40, INK, HW); ln([[x - w + 16, top + 70], [x + w - 16, top + 70]], 4);
    rr(x - w + 20, top + 90, 150, 110, 4, '#c8cfd6', 4); for (let k = 0; k < 9; k++) ln([[x - w + (k < 4 ? 186 : 20), top + 98 + k * 26], [x + w - 20, top + 98 + k * 26]], 4, '#b8b2a4'); ln([[x, top + 214], [x, top + h - 14]], 3, '#d8d2c4'); }
  g.restore(); }
function steam(x, y, k) { if (k <= 0) return; const P = [[-120, 40, 80], [-40, -20, 95], [60, 10, 90], [140, 60, 70], [-150, 130, 70], [-60, 120, 100], [60, 130, 100], [150, 150, 70], [0, 200, 80], [-100, 210, 60], [100, 215, 60]];
  g.save(); g.globalAlpha *= clamp(k * 1.5); const s = .6 + .4 * k, dy = (1 - k) * 160; for (const pass of [1, 0]) for (const [px, py, pr] of P) { g.beginPath(); g.arc(x + px * s, y + py * s + dy, pr * s, 0, 7); if (pass) { g.strokeStyle = '#9aa4ac'; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = '#ffffff'; g.fill(); } }
  for (let i = 0; i < 3; i++) ln([[x - 60 + i * 60, y + 260 * s + dy], [x - 50 + i * 60 + 10 * Math.sin(i), y + 320 * s + dy]], 6, '#c8d0d6'); g.restore(); }
function petrovich(t) { const l = lineAt(t), spk = l && l.who === 'p', a = blendArms(pAct, PG, t), c = PE, x = c.x + Math.sin(t * 1.1 + 1) * 2, y = SEAT, S = c.s, top = paperTop(t);
  const capLift = t >= CAPT && t < CAPT + 1.0 ? 4 * Math.sin(Math.PI * clamp((t - CAPT) / 1.0)) : 0, fk = forkHand(t);
  const base = a.fn, fn = fk ? (s => s > 0 ? [[78, -860], [lerp(78, fk.p[0], .5) + 60, lerp(-860, fk.p[1], .5) + 40], fk.p] : base(s)) : base;
  T.draw(g, {...c, x, y, arms: (a.fn = wig(fn, t, 1.2)), front: false, probe: !!process.env.FACECHECK, mood: 'kind', mouth: spk ? env(l, t) : 0, blink: blink(t, 7), tilt: 0, look: -.3, capLift, bald: true});
  const kind = t < MT ? 'menu' : 'paper', mk = t < MT ? 0 : ease((t - MT) / .45), chew = fk && fk.chew ? 4 * Math.sin(t * 30) : 0;
  if (process.env.NOPAPER) {} else if (t >= MT - .05) paper(x, top + chew, 'paper'); if (t < MT + .45) paper(x + 230 * mk, top + 10 * mk, 'menu', 1 - mk);
  if (capLift > 2.5) { const by = Math.min(top, 905) - 8; sparkle(x + 40, by - 10, 26, 1); sparkle(x - 30, by + 2, 14, .8); }   // bald glint above the paper
  const inPaper = (hx, hy) => Math.abs(hx - x) < 166 && hy > top + 6 && hy < top + 360;
  for (const s of [-1, 1]) { const P3 = fn(s), E = P3[1], Hh = P3[2], hx = x + Hh[0] * S, hy = y + Hh[1] * S; if (inPaper(hx, hy) && !(a.act.g === 'hold' && !fk)) continue;
    const ang = Math.atan2(Hh[1] - E[1], Hh[0] - E[0]); if (fk && s > 0) { g.save(); g.translate(hx, hy); g.rotate(ang - .5); ln([[10, 0], [70, 0]], 7, '#c8ccd2'); for (const o of [-6, 0, 6]) ln([[70, o], [92, o]], 4, '#c8ccd2'); if (fk.full) ell(92, 0, 16, 9, '#b8c8d0', 4); g.restore(); }
    hand(hx, hy, ang, S, c.pal.skin, null, false); if (s < 0 || (fk && s > 0)) { const wx = hx - Math.cos(ang) * 22 * S, wy = hy - Math.sin(ang) * 22 * S; ell(wx, wy, 13, 13, '#e8c27a', 4); } }   // wrist watch
  steam(x - 10, 1012, steamK(t)); }
const WIN = [[BY.w1.at - 1.1, BY.w4.end + .8], [BY.p5.at - .3, BY.p7.end + .5]];
function waiterOff(t) { let off = 1; for (const [a, b] of WIN) { const k = Math.min(ease((t - a) / .8), 1 - ease((t - b) / .9)); off = Math.min(off, 1 - clamp(k)); } return off; }
function waiterX(t) { let x = WA.x, walk = false; if (t >= GA1 && t < BY.z3.end + .4) { x = lerp(WA.x, 800, ease((t - GA1) / .6)); walk = t < GA1 + .6; }
  if (t >= BY.w4.at - .6 && t < BY.w4.end + .4) { x = lerp(WA.x, 1180, ease((t - BY.w4.at + .6) / .5)); walk = walk || t < BY.w4.at - .1; } if (t >= BY.w4.end + .4) x = t < BY.w4.end + 2 ? 1180 : x;
  return {x, walk}; }
const waiterFront = t => t >= GA1 && t < BY.z3.end + .4;
function waiter(t) { const off = waiterOff(t); if (off >= .999) return; const l = lineAt(t), spk = l && l.who === 'w', a = blendArms(wAct, WG, t), c = WA, wp = waiterX(t), walking = off > .001 || wp.walk, x = wp.x + off * 520 + Math.sin(t * 1.2 + 2) * 3, FEET = 1720 - (walking ? Math.abs(Math.sin(t * 8)) * 6 : 0);
  T.draw(g, {...c, x, y: FEET, arms: (a.fn = wig(a.fn, t, spk ? 6 : 1.5)), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 5), tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: -.7});
  if (a.act.g === 'pad' && a.e > .5) { const Hh = a.fn(-1)[2]; g.save(); g.translate(x + Hh[0] * c.s + 18, FEET + Hh[1] * c.s - 30); g.rotate(-.1); rr(-36, -46, 72, 92, 6, '#fffdf4', 5); for (let k = 0; k < 4; k++) ln([[-22, -24 + k * 18], [22, -24 + k * 18]], 3, '#9ab0d0'); g.restore(); }
  if (a.act.g === 'pour' && a.e > .5) { const Hh = a.fn(1)[2]; g.save(); g.translate(x + Hh[0] * c.s + 8, FEET + Hh[1] * c.s - 40); g.rotate(.5); rr(-26, -40, 52, 80, 10, '#dff2fb', 5); ln([[26, -30], [44, -44]], 6); g.restore(); ln([[x + Hh[0] * c.s + 46, FEET + Hh[1] * c.s - 50], [905, TABLE - 60]], 5, '#8fd2ff'); }
  if (a.act.g === 'take' && t >= MT + .45) { const Hh = a.fn(-1)[2]; g.save(); g.translate(x + Hh[0] * c.s - 14, FEET + Hh[1] * c.s + 10); g.rotate(-.12); rr(-30, -70, 60, 140, 8, '#7a2a30', 5); g.restore(); }
  if (a.act.g === 'check' && a.e > .5) { const Hh = a.fn(-1)[2]; g.save(); g.translate(x + Hh[0] * c.s - 20, FEET + Hh[1] * c.s - 6); g.rotate(-.08); rr(-48, -30, 96, 60, 6, '#2a2a33', 5); txt('CHECK', 0, 0, 20, '#e8c27a'); g.restore(); }
  hands(x, FEET, c.s, a, c, null, false); }


// ---------- clouds (Zhanna's thoughts) and cards (cutaways) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
function steakPic(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); ell(0, 40, 150, 46, '#ffffff', 7); ell(0, 36, 110, 30, '#f4f0ea', 3);
  g.beginPath(); g.moveTo(-100, 10); g.bezierCurveTo(-110, -60, 40, -80, 90, -40); g.bezierCurveTo(130, -10, 90, 40, 20, 40); g.bezierCurveTo(-40, 44, -94, 40, -100, 10); g.closePath(); g.fillStyle = '#7a3e22'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  for (let k = 0; k < 4; k++) ln([[-70 + k * 40, -36], [-40 + k * 40, 24]], 7, '#3e1e10'); g.restore(); }
function fishPic(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); ell(0, 40, 160, 46, '#ffffff', 7);
  g.beginPath(); g.moveTo(-120, 10); g.quadraticCurveTo(-20, -70, 90, 6); g.quadraticCurveTo(-20, 70, -120, 10); g.closePath(); g.fillStyle = '#b8c8d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  poly([[90, 6], [150, -36], [140, 6], [150, 48]], '#9ab0bc', 7); ell(-80, 0, 9, 9, INK, 0); ln([[-50, -20], [-40, 30]], 5); ell(-10, -60, 26, 10, '#7ab868', 4); ell(40, 52, 22, 14, '#ffe27a', 4); g.restore(); }
function bill(x, y, r, label) { g.save(); g.translate(x, y); g.rotate(r); rr(-110, -54, 220, 108, 10, '#a8d898', 6); ell(0, 0, 36, 36, '#86c074', 4); txt(label, 0, 2, 40, '#2f6a2a'); g.restore(); }
function glove(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); rr(-60, 50, 120, 70, 16, '#ffffff', 7); g.beginPath(); g.moveTo(-70, 60); g.bezierCurveTo(-110, -40, -60, -120, 10, -120); g.bezierCurveTo(90, -120, 110, -40, 80, 60); g.closePath(); g.fillStyle = '#d8323c'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  ell(-62, -10, 34, 46, '#d8323c', 7); ell(-20, -80, 26, 12, 'rgba(255,255,255,.6)', 0); g.restore(); }
function togo(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); poly([[-100, -10], [100, -10], [80, 90], [-80, 90]], '#f2ecdc', 7); poly([[-100, -10], [-70, -60], [70, -60], [100, -10]], '#e4dcc4', 7); ln([[0, -60], [0, 90]], 4, '#c8bc9c'); g.restore(); }
const CARD = {
  steak: u => { steakPic(250, 250, 1.1); txt('WELL-DONE', 600, 150, 58, '#7a3e22'); txt('+', 600, 225, 54, INK); txt('JUICY', 600, 300, 58, '#d8323c'); if (u > .25) txt('?!', 600, 395, 90, INK, HW); for (let i = 0; i < 3; i++) ell(130 + i * 40, 150 - (i % 2) * 30, 10, 14, '#8fd2ff', 3); },
  fish: u => { fishPic(240, 230, 1.0); txt('SEA BASS', 240, 380, 46, INK); if (u > .35) { g.save(); g.translate(600, 290); g.scale(1.5, 1.5); glass(0, 60, 'wine'); g.restore(); txt('HOUSE WHITE', 600, 415, 42, INK); } },
  years: u => { rr(110, 70, 260, 300, 24, '#ffffff', 7); rr(110, 70, 260, 80, 24, '#d8323c', 7); txt('20', 240, 255, 130, INK); txt('YEARS', 240, 335, 40, INK);
    rr(460, 110, 280, 170, 50, '#ffffff', 7); poly([[520, 270], [500, 330], [570, 278]], '#ffffff', 0); ln([[520, 276], [500, 330], [566, 278]], 7); txt('Mm-hmm…', 600, 195, 50, '#7a808c', HW); if (u > .4) { g.save(); g.translate(560, 385); g.rotate(-.15); ell(0, 0, 44, 44, 'rgba(220,240,255,.7)', 8); ell(-14, -14, 12, 7, '#ffffff', 0); g.beginPath(); g.moveTo(40, 18); g.bezierCurveTo(90, 60, 60, 90, 110, 100); g.strokeStyle = '#c8a04a'; g.lineWidth = 5; g.stroke(); g.restore(); txt('?!', 700, 380, 90, '#d63a8a', HW); } },
  check: (u, paid) => { rr(140, 50, 320, 400, 16, '#2a2a33', 0); rr(160, 70, 280, 360, 10, '#fffdf4', 5); txt('BRIGHTON GRILL', 300, 110, 26, INK); for (let k = 0; k < 4; k++) ln([[190, 160 + k * 40], [410, 160 + k * 40]], 4, '#cfc6b4');
    txt('TOTAL', 222, 380, 30, INK); txt('$148.50', 362, 380, 34, '#d8323c');
    if (paid) { const k = ease((u - .05) * 4), bx = lerp(900, 650, k), sk = '#eec3a2'; bill(bx, 210, -.08, '$100'); bill(bx + 30, 300, .06, '$100');
      if (u < .55) { for (const [hx, hy, an] of [[bx + 150, 250, Math.PI], [bx + 180, 330, Math.PI - .2]]) { g.save(); g.translate(hx, hy); rr(40, -42, 200, 84, 10, '#8a6d52', 7); rr(26, -36, 20, 72, 6, '#eef3f8', 5); g.restore(); hand(hx, hy, an, 1.6, sk, null, false); }
        ell(bx + 205, 240, 20, 20, '#e8c27a', 5); } if (u > .45) { g.save(); g.translate(600, 420); g.rotate(-.06); rr(-210, -38, 420, 76, 16, '#2f9a5a', 6); txt('KEEP THE CHANGE', 0, 2, 38, '#ffffff'); g.restore(); } }
    else { txt('THE BILL?', 640, 190, 46, '#1f3a8a'); txt('=', 640, 250, 46, INK); txt('THE CHECK!', 640, 310, 46, '#d8323c'); } },
  box: u => { glove(240, 230, 1.15); txt('BOX?!', 240, 400, 56, '#d8323c', HW); if (u > .45) { togo(620, 230, 1.1); txt('TO-GO BOX', 620, 380, 44, INK); } },
};
let curCam = null;
function panel(id, u, t, a0, b0, thought, press) { const k = ease((t - a0) / .3) * (1 - ease((t - b0 + .3) / .3)); if (k <= 0) return;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) { const c = curCam, hx = 540 + (ZH.x + 70 - c.x) * c.z, top = 960 + (800 - c.y) * c.z; ell(hx + 10, top - 22, 14, 14, '#fffaf0', 6); ell(hx + 34, (top + PY + PH) / 2 - 8, 22, 22, '#fffaf0', 6); }
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u, press); g.restore();
  g = prev; g.save(); g.globalAlpha = k; const sc = .92 + .08 * k; g.translate(540, PY + PH / 2); g.scale(sc, sc); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
// the two check cards are one card that changes content (no fade between them)
const PANELS = [['steak', BY.w2.at - .1, BY.w2.end + .35, false], ['fish', BY.p3.at + .2, BY.w4.end, false], ['years', BY.z4.at + .3, BY.z4.end + .35, true],
  ['check', BY.w6.at + .1, BY.p6.end + .9, false], ['box', BY.z5.at, BY.z5.end + .35, true]];
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) { const paid = id === 'check' && t >= BY.p6.at + .05; panel(id, paid ? (t - BY.p6.at - .05) / (b - BY.p6.at - .05) : (t - a) / (b - a), t, a, b, th, paid); } }
function laterCard(t) { const a = TL.LATER, b = TL.FORK - .05; if (t < a || t >= b) return; const k = ease((t - a) / .25) * (1 - ease((t - b + .25) / .25));
  g.save(); g.globalAlpha = k; g.fillStyle = '#e9b98a'; g.fillRect(0, 0, W, H); g.fillStyle = '#f0c89e'; for (let x = -200; x < 1300; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 60, 0); g.lineTo(x + 460, H); g.lineTo(x + 400, H); g.fill(); }
  txt('ONE HOUR', 540, 700, 130, INK); txt('LATER…', 540, 840, 130, '#ffffff');
  ell(540, 1130, 150, 150, '#fffaf0', 10); for (let i = 0; i < 12; i++) { const ag = i / 12 * 6.28; ln([[540 + Math.cos(ag) * 120, 1130 + Math.sin(ag) * 120], [540 + Math.cos(ag) * 135, 1130 + Math.sin(ag) * 135]], 6); }
  const ag = -1.57 + (t - a) * 3; ln([[540, 1130], [540 + Math.cos(ag) * 105, 1130 + Math.sin(ag) * 105]], 9); ln([[540, 1130], [540 + Math.cos(ag / 12 - .5) * 70, 1130 + Math.sin(ag / 12 - .5) * 70]], 11); ell(540, 1130, 12, 12, INK, 0); g.restore(); }

// ---------- shots ----------
const CAM = {TWO: [1.1, 485, 1030], ZP: [1.25, 485, 1010], Z_MED: [1.6, 235, 1000], Z_UP: [1.5, 235, 918], P_MED: [1.6, 760, 1000], P_UP: [1.45, 760, 940], P_CU: [1.9, 760, 1020],
  W_MED: [1.5, 1300, 925], PW: [1.2, 1030, 975]};
const SH = [[0, 'TWO'], [BY.p1.at - .15, 'P_MED'], [BY.w1.at - .1, 'W_MED'], [BY.z2.at - .1, 'Z_MED'], [BY.w2.at - .1, 'W_MED'], [BY.z3.at - .1, 'ZP'], [GA1 - .1, 'PW'], [BY.p2.at - .1, 'BACK'], [BY.w3.at - .1, 'PW'],
  [BY.p3.at - .1, 'P_UP'], [BY.w4.at - .7, 'PW'], [BY.z4.at - .1, 'Z_UP'], [BY.p4.at - .2, 'P_CU'], [TL.LATER + .3, 'P_MED'], [BY.w6.at - .1, 'W_MED'], [BY.p6.at - .1, 'PW'], [BY.w5.at - .1, 'W_MED'],
  [BY.z5.at - .1, 'Z_UP'], [STEAM[0] - .1, 'PW'], [BY.z6.at - .1, 'ZP'], [BY.p8.at - .15, 'P_CU'], [TL.CUT, 'BLACK'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
// framing rule: every character is fully inside the frame horizontally or fully outside. cams.json (node render.js frame) holds the solved [z, x] per shot
const SUBJ = {TWO: 'ZP', ZP: 'ZP', Z_MED: 'Z', Z_UP: 'Z', P_MED: 'P', P_UP: 'P', P_CU: 'P', W_MED: 'W', PW: 'PW', END: 'ZP'};
let SOLVED = null; try { SOLVED = JSON.parse(fs.readFileSync(__dirname + '/cams.json', 'utf8')); } catch (e) {}
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' || sh.k === 'BLACK' || sh.k === 'BACK' ? 'TWO' : sh.k; let [z, x, y] = CAM[k]; if (SOLVED && SOLVED[sh.i]) [z, x] = SOLVED[sh.i]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .02 * ease(u), punch = sh.at > 0 && sh.k !== 'END' ? .02 * (1 - ease((t - sh.at) / .3)) : 0; return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions ----------
const GLOSS = {z1: [['date', 'свидание'], ['забукала', 'book — заказала'], ['ю ноу', 'you know — понимаешь']], z2: [['Рэди', 'ready — готовы'], ['заордерю', 'order — закажу'], ['Вэлл дан', 'well-done — полная прожарка']],
  z3: [['конфидентно', 'confident — уверенно'], ['инглише', 'English — английский']], z4: [['спикаешь', 'speak — говоришь']], z5: [['Бокс', 'box — коробка (а не бокс)']], z6: [['транслейтор', 'translator — переводчик']]};
const SPL = {
  w1: [['Hi, folks! Are you ready to order?', 'Привет! Готовы сделать заказ?']],
  w2: [['Well-done… but juicy.', 'Полная прожарка… но сочный.'], ["Sure… I'll let the chef know.", 'Ладно… передам повару.']],
  w3: [['And for you, sir? The steak as well?', 'А вам, сэр? Тоже стейк?']],
  p3: [["Actually, I'll have the sea bass,", 'Вообще-то мне сибаса,'], ["if that's all right.", 'если можно.'], ['And a glass of the house white, please.', 'И бокал домашнего белого, пожалуйста.'], ['Thank you ever so much.', 'Премного благодарен.']],
  w4: [['Oh! Excellent choice, sir!', 'О! Отличный выбор, сэр!']],
  p4: [['You never asked, darling.', 'Ты не спрашивала, дорогая.']],
  p5: [['Could we have the bill, please?', 'Можно нам счёт, пожалуйста?']],
  w6: [['The… check? Sure!', 'Счёт? Конечно!']],
  p8: [['As you wish, darling.', 'Как скажешь, дорогая.']],
  p6: [['Here you are. Keep the change.', 'Вот, пожалуйста. Сдачи не надо.']],
  w5: [['Thank you, sir! Would you like a box for that?', 'Спасибо, сэр! Вам упаковать с собой?']],
  p7: [["She'd love one, thank you.", 'Да, она с удовольствием, спасибо.']],
};
function chunks(l) { if (SPL[l.id]) { const P = SPL[l.id], n = P.reduce((a, c) => a + c[0].length, 0); let acc = 0; return P.map(([s, tr]) => { const a = l.at + (l.end - l.at) * acc / n; acc += s.length; return {s, tr, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
  const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (l.end - l.at) < 1.2) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
const CH = L.map(l => ({l, ch: chunks(l)})), FLAT = [].concat(...CH.map(x => x.ch));
FLAT.forEach((c, i) => { const nx = FLAT[i + 1], lim = nx ? nx.a - .05 : c.b + 1.2; c.hold = Math.max(c.b, Math.min(c.a + 1.2, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .25, lim)); });
// chips: per caption chunk; a chunk with two glossary words splits its time (each >= 1.2 s, else only the first)
const CHIPS = []; for (const c of FLAT) { if (c.who !== 'z') continue; const hits = (GLOSS[c.id] || []).filter(([w]) => c.s.toLowerCase().includes(w.toLowerCase())); if (!hits.length) continue;
  const dur = c.hold - c.a; if (dur < 1.2) continue; const use = dur / hits.length >= 1.2 ? hits : hits.slice(0, 1); use.forEach(([w, tr], i) => CHIPS.push({a: c.a + dur * i / use.length, b: c.a + dur * (i + 1) / use.length, w, tr})); }
const EN = /^(date|забукала|ю|ноу|рэди|заордерю|вэлл|дан|конфидентно|инглише|спикаешь|бокс|транслейтор)$/i;
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, ''); return /[a-z]/i.test(x) || EN.test(x); };
function curChunk(t) { let cur = null; for (const c of FLAT) if (t >= c.a - .02 && t < c.hold) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); } }
function caption(t) { const cur = curChunk(t); if (!cur) return; const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); g.translate(-540, -1640);
  outlinedWords(cur.s.split(' '), 1640, 70, w => isEn(w) ? '#ffd23f' : '#ffffff'); g.restore(); if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 46, () => '#ffffff'); }
function flag(x, y, w, h) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#1f3a8a'; g.fillRect(x, y, w, h);
  ln([[x, y], [x + w, y + h]], 10, '#ffffff'); ln([[x + w, y], [x, y + h]], 10, '#ffffff'); ln([[x, y], [x + w, y + h]], 4, '#d8323c'); ln([[x + w, y], [x, y + h]], 4, '#d8323c');
  ln([[x + w / 2, y], [x + w / 2, y + h]], 14, '#ffffff'); ln([[x, y + h / 2], [x + w, y + h / 2]], 14, '#ffffff'); ln([[x + w / 2, y], [x + w / 2, y + h]], 8, '#d8323c'); ln([[x, y + h / 2], [x + w, y + h / 2]], 8, '#d8323c'); g.restore(); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, w, h); }
function britChip(t) { const a = BY.p3.at, b = BY.p3.at + 3.0; if (t < a || t >= b) return; const k = ease((t - a) / .15) * (1 - ease((t - b + .15) / .15));
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); g.font = `42px ${FONT}`; const tw = g.measureText('British accent').width, w = tw + 130;
  rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5); flag(-w / 2 + 22, -24, 60, 40); txt('British accent', -w / 2 + 100, -3, 42, '#1f3a8a', FONT, 'left'); g.restore(); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = 4.6;
function hook(t) { if (t > HOOK_END + .3) return; const a = ease(t / .25) * (1 - ease((t - HOOK_END) / .3)); g.save(); g.globalAlpha = a; g.translate(540, 330); g.rotate(-.02);
  rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('КТО ТАКОЙ', 0, -92, 88, INK); txt('ПЕТРОВИЧ?', 0, 2, 96, '#d63a8a'); txt('ЧТО ПОД КЕПКОЙ?', 0, 96, 80, INK); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 170, 960, 1540, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ПЕТРОВИЧА', 540, 270, 62, '#d63a8a');
  const R = [['ARE YOU READY TO ORDER?', 'готовы сделать заказ?'], ["I'LL HAVE THE SEA BASS", 'мне, пожалуйста, сибаса'], ["IF THAT'S ALL RIGHT", 'если можно'], ['YOU NEVER ASKED', 'ты не спрашивала'],
    ['THE BILL (UK) = THE CHECK (US)', 'счёт'], ['KEEP THE CHANGE', 'сдачи не надо'], ['WOULD YOU LIKE A BOX?', 'упаковать вам с собой?']];
  R.forEach(([en, ru], i) => { const y = 390 + i * 126; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Почему Петрович молчал 20 лет?', 540, 1320, 50, '#d63a8a'); txt('1 — шпион    2 — лорд', 540, 1410, 48, INK); txt('3 — Жанна не давала слова', 540, 1480, 48, INK); txt('Пишите цифру!', 540, 1580, 50, '#d63a8a'); g.restore(); }
function blackCard(t) { const k = ease((t - TL.CUT) / .2); g.save(); g.fillStyle = '#000000'; g.fillRect(0, 0, W, H); g.globalAlpha = ease((t - TL.CUT - .15) / .3); txt('ПРОДОЛЖЕНИЕ', 540, 900, 96, '#ffffff'); txt('СЛЕДУЕТ…', 540, 1020, 96, '#ff7ac0'); g.restore(); }
function backView(t) { // reverse angle over Petrovich's shoulder: cap, back of the head, jacket; Zhanna across the table
  const l = lineAt(t), zl = l && l.who === 'z', nod = l && l.id === 'p2' ? 8 * Math.sin(Math.PI * clamp((t - l.at) / (l.end - l.at))) : 0;
  T.draw(g, {...ZH, x: 330, y: 1690, s: .7, arms: s => ZG.table(s), front: true, mood: 'smug', mouth: zl ? env(l, t) : 0, blink: blink(t, 2), tilt: .03 * Math.sin(t * 1.1), look: .3});
  star(330 - 28, 1690 - 553, 26, '#f2c820', 5, 8, t * .3); ell(330 - 28, 1690 - 553, 8, 8, '#ff5a8a', 4); for (const s of [-1, 1]) { const P3 = ZG.table(s); hand(330 + P3[2][0] * .7, 1690 + P3[2][1] * .7, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0]), .7, ZH.pal.skin, '#d63a8a', true); }
  rr(-40, 1250, 1160, 760, 0, '#fffaf2', 7); glass(150, 1330, 'flute'); rr(560, 1250, 34, 70, 8, '#fff4dc', 5); ell(577, 1228, 11, 20, '#ffc94a', 4); rr(260, 1300, 150, 18, 4, '#7a2a30', 4);
  const px = 770, py = 1340 + nod, c = PE.pal;
  g.beginPath(); g.moveTo(470, 1930); g.bezierCurveTo(470, 1640, 560, 1560, px, 1556); g.bezierCurveTo(980, 1560, 1050, 1640, 1050, 1930); g.closePath(); g.fillStyle = c.top; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  ln([[px, 1600], [px, 1930]], 5, c.topS); rr(px - 56, 1450 + nod * .5, 112, 120, 30, c.skinS, 7); rr(px - 70, 1548, 140, 30, 14, c.collar, 6);
  for (const s of [-1, 1]) ell(px + s * 158, py + 10, 30, 46, c.skin, 7);
  ell(px, py, 160, 175, c.hair, 8); g.save(); g.beginPath(); g.ellipse(px, py, 160, 175, 0, 0, 7); g.clip(); for (let k = 0; k < 6; k++) ln([[px - 120 + k * 48, py + 40], [px - 110 + k * 48, py + 150]], 4, '#b4b4b4'); g.restore(); ell(px, py, 160, 175, null, 8);
  g.beginPath(); g.moveTo(px - 178, py - 40); g.bezierCurveTo(px - 190, py - 230, px + 190, py - 240, px + 180, py - 40); g.quadraticCurveTo(px, py - 70, px - 178, py - 40); g.closePath(); g.fillStyle = c.cap; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  rr(px - 40, py - 66, 80, 18, 8, c.capS, 5); ell(px, py - 222, 16, 10, c.capS, 5); }

let COVER = false;
function frame(t) {
  const c0 = COVER ? {z: 1.04, x: 485, y: 1060, k: 'ZP', sh: {k: 'ZP'}} : camAt(t), back = c0.sh.k === 'BACK', c = back ? {...c0, z: 1.15, x: 760, y: 820} : c0; curCam = c; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); restaurant(t); g = G0;
  g.save(); g.filter = `blur(${(2.5 * c.z).toFixed(1)}px) saturate(0.6) brightness(1.03)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  if (back) backView(t); else { g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); const wf = waiterFront(t); if (!COVER && !wf) waiter(t); zhanna(t); petrovich(t); table(t); if (!COVER && wf) waiter(t); g.restore(); }
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END' && c.sh.k !== 'BLACK' && !COVER) panels(t); laterCard(t); if (c.sh.k === 'BLACK') blackCard(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else if (c.sh.k !== 'BLACK' && !(t >= TL.LATER && t < TL.FORK)) { chip(t); britChip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { // NOCAP still shifted down 180 px, top strip filled, cream plate 900x330 rotated -0.02, top edge at y=330 (text inside the 3:4 crop)
  const t = +(arg || BY.p3.at + 4.2); process.env.NOCAP = 1; COVER = true; frame(t); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 180); g.save(); g.filter = 'blur(8px)'; g.drawImage(src, 0, 0, W, 8, 0, 0, W, 184); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 495); g.rotate(-.02); rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('ПЕТРОВИЧ', 0, -92, 86, INK); txt('ЗАГОВОРИЛ', 0, 2, 96, '#d63a8a'); txt('ПО-АНГЛИЙСКИ', 0, 96, 78, INK); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/zhanna_ep7.srt', out); }
else if (mode === 'info') { for (const c of FLAT) console.log(c.id, c.a.toFixed(2), c.hold.toFixed(2), c.s, '|', c.tr || ''); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w); for (const s of SH) console.log('SH', s.at.toFixed(2), s.k); }
else if (mode === 'frame') { // measure each character's horizontal extent per shot, then solve the camera
  const SC = .25, OX = 600, mc = createCanvas(Math.round(2600 * SC), Math.round(2000 * SC)), mg = mc.getContext('2d');
  const ext = (fn, t) => { g = mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, mc.width, mc.height); g.setTransform(SC, 0, 0, SC, OX * SC, 0); fn(t); g = G0;
    const d = mg.getImageData(0, 0, mc.width, mc.height).data, w = mc.width; let a = 1e9, b = -1e9; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) { const x = ((i - 3) / 4) % w; if (x < a) a = x; if (x > b) b = x; } return a > b ? null : [a / SC - OX, (b + 1) / SC - OX]; };
  const CHR = {Z: zhanna, P: petrovich, W: waiter}, out = {}, M = 16;
  for (const sh of SH) { if (sh.k === 'BACK' || sh.k === 'BLACK') continue; const k = sh.k === 'END' ? 'TWO' : sh.k, [z0, x0] = CAM[k], E = {};
    for (const c of 'ZPW') { let a = 1e9, b = -1e9; for (let t = sh.at; t < sh.end; t += .1) { const e = ext(CHR[c], t); if (e) { a = Math.min(a, e[0]); b = Math.max(b, e[1]); } } E[c] = a > b ? null : [a - M, b + M]; }
    const subj = SUBJ[sh.k].split('').filter(c => E[c]); let best = null;
    const ZS = []; for (let d = 0; d <= 1.3; d += .01) { if (z0 - d >= .7) ZS.push(z0 - d); if (d && z0 + d <= 2.2) ZS.push(z0 + d); } ZS.sort((p, q) => Math.abs(p - z0) * (p > z0 ? 1.5 : 1) - Math.abs(q - z0) * (q > z0 ? 1.5 : 1));
    for (const z of ZS) { if (best) break; const wMin = 1080 / (z * 1.045), wMax = 1080 / z; // narrowest (push+punch) and widest view
      const S = subj.map(c => E[c]), sa = Math.min(...S.map(e => e[0])), sb = Math.max(...S.map(e => e[1])); if (sb - sa > wMin) continue;
      const cands = []; for (let x = sb - wMin / 2; x <= sa + wMin / 2; x += 2) cands.push(x); cands.sort((p, q) => Math.abs(p - x0) - Math.abs(q - x0));
      for (const x of cands) { let ok = true; for (const c of 'ZPW') { if (subj.includes(c) || !E[c]) continue; const [oa, ob] = E[c];
          const outside = (x + wMax / 2 <= oa) || (x - wMax / 2 >= ob), inside = oa >= x - wMin / 2 && ob <= x + wMin / 2; if (!outside && !inside) { ok = false; break; } }
        if (ok) { best = [+z.toFixed(3), Math.round(x)]; break; } } }
    out[sh.i] = best; console.log(sh.i, sh.k, sh.at.toFixed(2), JSON.stringify(E), '->', best, 'was', [z0, x0]); }
  fs.writeFileSync('cams.json', JSON.stringify(out)); }
else if (mode === 'facecheck') { // Petrovich's face carries magenta probes; any magenta pixel in any frame = face visible
  process.env.NOCAP = 1; let bad = 0; const [step, off] = (arg || '1:0').split(':').map(Number); for (let i = off || 0; i < TL.TOTAL * FPS; i += step) { frame(i / FPS); const d = cv.data(); let n = 0; for (let j = 0; j < d.length; j += 16) if (d[j] > 230 && d[j + 1] < 40 && d[j + 2] > 230) n++; if (n) { bad++; console.log('VISIBLE', (i / FPS).toFixed(2), n); } } console.log('facecheck done, frames with face:', bad); }