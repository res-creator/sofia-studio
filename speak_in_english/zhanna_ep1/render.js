// «Тётя Жанна с Брайтона», ep1 — flat 2D cartoon (same look as British is easy 2D). Calm, lively characters, thought-cloud cutaways.
// node render.js still 1,10,20   |   node render.js clip 0:20 out/p0.mp4     (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H), g = cv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }

// ---------- Brighton street (flat) ----------
const FEET = 1700;
function street(t) {
  g.fillStyle = '#9fd6f0'; g.fillRect(-1200, -1200, 3480, 1700);
  for (const [x, y, s] of [[140, 120, 1], [760, 80, .8]]) { const dx = (t * 6 * s) % 1600; for (const [a, b, r] of [[0, 0, 50], [50, -20, 60], [100, 0, 45]]) ell(x + a + dx - 300, y + b, r, r * .7, '#ffffff', 0); }
  // buildings
  const B = [[-300, 360, 420, '#c86a4a'], [120, 300, 330, '#e0b060'], [450, 340, 330, '#8a5a8a'], [780, 290, 420, '#5a8ab0'], [1200, 350, 300, '#c86a4a']];
  for (const [x, y, w, c] of B) { rr(x, y, w, 1500, 0, c, 7); for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(w / 110); k++) rr(x + 30 + k * 110, y + 60 + r * 150, 70, 100, 6, '#cfe8f5', 6); }
  // elevated train track
  rr(-1200, 170, 3480, 70, 0, '#3f6b52', 7); for (let x = -1180; x < 2280; x += 60) ell(x, 205, 6, 6, '#2a4a38', 0);
  for (const x of [-120, 520, 1160]) { rr(x - 22, 240, 44, 900, 0, '#3f6b52', 7); }
  const tx = ((t * 260) % 3800) - 1900; if (tx > -1500 && tx < 1700) { rr(tx, 70, 1100, 100, 16, '#c8ccd2', 7); for (let k = 0; k < 9; k++) rr(tx + 40 + k * 118, 92, 80, 46, 6, '#3a4a5a', 5); rr(tx + 20, 150, 1060, 14, 4, '#e05a2a', 4); }
  // shop fronts
  const S = [[-300, 'DELI', '#e05a2a'], [120, 'PHARMACY', '#2f9a5a'], [450, 'NAILS', '#d63a8a'], [780, 'BAKERY', '#1f3a8a'], [1200, 'DELI', '#e05a2a']];
  for (const [x, label, c] of S) { const w = x === 780 ? 420 : x === -300 ? 420 : 330; rr(x + 10, 820, w - 20, 110, 10, c, 7); txt(label, x + w / 2, 878, label.length > 6 ? 54 : 70, '#ffffff', HW);
    for (let k = 0; k < Math.floor(w / 60); k++) poly([[x + k * 60, 940], [x + k * 60 + 60, 940], [x + k * 60 + 60, 1000], [x + k * 60, 1000]], k % 2 ? '#ffffff' : c, 4);
    rr(x + 30, 1010, w - 60, 330, 6, '#bfe3f5', 7); ln([[x + w / 2, 1010], [x + w / 2, 1340]], 6); }
  // sidewalk
  g.fillStyle = '#c9c3bb'; g.fillRect(-1200, 1340, 3480, 2000); ln([[-1200, 1340], [2280, 1340]], 7);
  for (let x = -1200; x < 2280; x += 220) ln([[x, 1340], [x - 160, 2400]], 4, 'rgba(42,34,48,0.25)'); ln([[-1200, 1520], [2280, 1520]], 4, 'rgba(42,34,48,0.25)');
  g.fillStyle = 'rgba(40,40,70,0.12)'; g.fillRect(-1200, -1200, 3480, 2540);
}

// ---------- characters ----------
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 650, s: .8};
const RE = {hair: 'ponytail', lashes: true, pal: {skin: '#d9a07a', skinS: '#c08460', hair: '#3a2014', brow: '#2a160e', tie: '#e05a2a', top: '#2f3a6a', topS: '#232c52', collar: '#ffffff', bottom: '#2f3a6a', legs: '#2f3a6a', shoe: '#2a2230', sole: '#2a2230'}, x: 205, s: .72};
const GEST = {
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  palm: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : [[-78, -860], [-102, -720], [-110, -580]],
  palmL: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -820]] : [[78, -860], [160, -740], [86, -640]],
  three: s => s > 0 ? [[78, -860], [190, -930], [200, -1090]] : [[-78, -860], [-160, -740], [-86, -640]],
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  snap: s => s > 0 ? [[78, -860], [210, -880], [300, -960]] : [[-78, -860], [-160, -740], [-86, -640]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-160, -740], [-86, -640]],
  phone: s => s > 0 ? [[78, -860], [190, -860], [150, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  mic: s => s > 0 ? [[78, -860], [200, -830], [330, -860]] : [[-78, -860], [-102, -720], [-110, -580]],
};
const FRONT = new Set(['explain', 'brooch']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const PLAN = {z1: [[0, 'three'], [.42, 'palm']], z2: [[0, 'explain'], [.45, 'hips'], [.8, 'brooch']], z3: [[0, 'palmL'], [.5, 'explain']], z4: [[0, 'shrug'], [.6, 'palm']],
  z5: [[0, 'explain'], [.5, 'wag'], [.8, 'palm']], z6: [[0, 'shrug'], [.25, 'wag'], [.85, 'snap']], z7: [[0, 'brooch'], [.45, 'palm'], [.8, 'shrug']], z8: [[0, 'hips']], z9: [[0, 'shrug'], [.6, 'brooch']], z10: [[0, 'hips']], z11: [[0, 'phone']]};
function zAct(t) { // gesture + mood for Zhanna
  const l = lineAt(t);
  if (t >= TL.PHONE - .1 && t < TL.END) return {g: 'phone', mood: 'smug'};
  if (t >= TL.END) return {g: 'hips', mood: 'grin'};
  if (l && l.who === 'z') { const u = (t - l.at) / (l.end - l.at); let gg = 'palm'; for (const [k, v] of PLAN[l.id]) if (u >= k) gg = v; return {g: gg, mood: l.id === 'z8' ? 'grin' : 'smug'}; }
  if (t > BY.z8.end && t < BY.r3.at) return {g: 'hips', mood: 'grin'};
  return {g: 'hips', mood: 'smug'};
}
function blendArms(fnAt, t, key) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GEST[prev], f1 = GEST[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function zhanna(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, t), c = ZH;
  const sway = Math.sin(t * 1.4) * 4 * (spk ? 1.4 : 1), x = c.x + sway, tilt = spk ? .06 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) - .02;
  const breathe = 1 - .006 * (1 + Math.sin(t * 2.2));
  T.draw(g, {...c, x, y: FEET, sq: breathe, arms: wig(a.fn, t, spk ? 10 : 3), front: a.front, mood: a.act.mood, mouth: spk ? env(l, t) : 0, blink: blink(t, 2), tilt, look: spk ? -.15 : -.6});
  // brooch + sequins
  const S = c.s, bx = x - 40 * S, by = FEET - 790 * S * breathe; star(bx, by, 34, '#f2c820', 5, 8, t * .3); ell(bx, by, 10, 10, '#ff5a8a', 4); sparkle(bx + 30, by - 28, 14, .5 + .5 * Math.sin(t * 5));
  for (let i = 0; i < 9; i++) { const sx = x + (hash(i) - .5) * 150 * S, sy = FEET - (590 + hash(i + 9) * 260) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  if (a.act.g === 'phone' && a.e > .8) { const H = a.fn(1)[2]; rr(x + H[0] * S - 26, FEET + H[1] * S * breathe - 70, 52, 96, 10, '#e05a8a', 5); }
  if (a.act.g === 'three' && a.e > .8) { const H = a.fn(1)[2]; for (let k = 0; k < 3; k++) { const fx = x + H[0] * S - 16 + k * 16, fy = FEET + H[1] * S - 14; ln([[fx, fy], [fx + (k - 1) * 3, fy - 40]], 18, INK); ln([[fx, fy], [fx + (k - 1) * 3, fy - 40]], 9, ZH.pal.skin); ell(fx + (k - 1) * 3, fy - 44, 6, 5, '#d02a5a', 0); } }
}
function reporter(t) { const l = lineAt(t), spk = l && l.who === 'r', c = RE, x = c.x + Math.sin(t * 1.2 + 2) * 3;
  T.draw(g, {...c, x, y: FEET, arms: wig(GEST.mic, t, 2), mood: 'flat', mouth: spk ? env(l, t) : 0, blink: blink(t, 5), tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: .6});
  const H = GEST.mic(1)[2], hx = x + H[0] * c.s, hy = FEET + H[1] * c.s; // microphone toward Zhanna
  g.save(); g.translate(hx, hy); g.rotate(-.35); rr(-6, -18, 120, 26, 10, '#2a2a2a', 5); ell(128, -5, 26, 22, '#5a5a62', 6); rr(30, -42, 58, 50, 6, '#e0283a', 5); txt('24', 59, -17, 30, '#ffffff'); g.restore(); }

// ---------- thought cloud cutaways ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function mini(st, x, y, s) { T.draw(g, {...st, x, y, s}); }
const MAN = {hair: 'short', pal: {skin: '#efc29c', skinS: '#dca47c', hair: '#3a2a20', brow: '#3a2a20', top: '#4a6a9a', topS: '#3a5a8a', tie: '#c0283a', collar: '#ffffff', bottom: '#2f3a55', legs: '#2f3a55', shoe: '#2a2230', sole: '#2a2230'}};
const FRIEND = {hair: 'long', lashes: true, pal: {skin: '#f2c4a0', skinS: '#e0a880', hair: '#c0283a', brow: '#7a1a20', top: '#2fb0a0', topS: '#209080', bottom: '#2fb0a0', skirt: '#2fb0a0', legs: '#f2c4a0', shoe: '#ffffff', sole: '#2fb0a0'}, skirt: true};
const CLOUD = {
  z2: u => { rr(560, 70, 230, 380, 8, '#8a5a2e', 7); rr(580, 90, 190, 360, 4, '#ffe9b0', 0); txt('RESTAURANT', 675, 50, 34, INK);
    const zx = lerp(320, 520, ease(u * 1.4)); mini({...ZH, mood: 'smug', pose: 'hips'}, zx, 470, .27); for (let i = 0; i < 6; i++) sparkle(zx + Math.cos(u * 6 + i) * 110, 300 + Math.sin(u * 6 + i) * 110, 16, .9);
    for (const [x, dir] of [[120, 1], [250, 1]]) { mini({...MAN, mood: 'happy', pose: 'cheer'}, x, 470, .22); } txt('WOW', 190, 120, 50, '#d63a8a', HW); },
  z3: u => { mini({...MAN, mood: 'flat', pose: 'hold'}, 280, 490, .3); const sx = 150 + ((u * 2.2) % 1) * 260; g.fillStyle = 'rgba(80,220,120,0.35)'; g.fillRect(sx - 14, 40, 28, 460); ln([[sx, 40], [sx, 500]], 5, '#2f9a5a');
    ['WATCH', 'SHOES', 'CAR'].forEach((w, i) => { if (u > .25 + i * .2) { txt(w, 610, 150 + i * 110, 60, INK); poly([[740, 150 + i * 110], [760, 175 + i * 110], [800, 120 + i * 110], [810, 130 + i * 110], [760, 195 + i * 110], [730, 160 + i * 110]], '#2f9a5a', 4); } }); },
  z4: u => { const b = ease(u * 1.6); mini({...MAN, mood: 'surprised', pose: 'shrug'}, 200, 490, .26);
    mini({hair: 'short', pal: {skin: '#d9a07a', skinS: '#c08460', hair: '#1e1614', brow: '#1e1614', top: '#ffffff', topS: '#e0e0e0', tie: '#2a2230', collar: '#ffffff', bottom: '#2a2230', legs: '#2a2230', shoe: '#2a2230', sole: '#2a2230'}, mood: 'flat', pose: 'cheer'}, 560, 490, .26);
    g.save(); g.translate(560, 300 - b * 60); g.scale(.5 + b * .7, .5 + b * .7); rr(-40, -150, 80, 200, 26, '#2f6a3a', 6); rr(-18, -220, 36, 80, 8, '#2f6a3a', 6); rr(-24, -230, 48, 26, 6, '#e0b040', 5); rr(-34, -90, 68, 70, 6, '#f6efdc', 5); txt('$900', 0, -55, 24, '#c0283a'); g.restore(); },
  z5: u => { const k = clamp((u - .2) * 3); g.save(); g.translate(330, 280); for (const s of [-1, 1]) { g.save(); g.translate(s * k * 60, 0); g.rotate(s * k * .25); rr(s < 0 ? -110 : 0, -170, 110, 340, 4, '#ffffff', 6); g.restore(); }
    txt('BILL', 0, -120, 40, INK); txt('$900', 0, -40, 50, '#c0283a'); g.restore(); if (u > .45) txt('50 / 50', 330, 470, 54, '#c0283a');
    if (u > .55) { const fx = 700, wv = Math.sin(u * 30) * 14; ln([[fx, 470], [fx, 150]], 10); poly([[fx, 150], [fx + 170, 170 + wv], [fx, 260]], '#e0283a', 6); txt('RED FLAG', fx + 20, 70, 44, '#e0283a'); } },
  z6: u => { rr(140, 40, 300, 460, 36, '#2a2230', 0); rr(156, 60, 268, 420, 26, '#f6f6fa', 5); rr(180, 120, 160, 56, 20, '#3a8ae0', 0); txt('Hey :)', 260, 148, 30, '#ffffff'); txt('Read 3 days ago', 290, 210, 24, '#888');
    const gy = 290 + Math.sin(u * 12) * 18; g.save(); g.globalAlpha = .9; g.beginPath(); g.moveTo(560, gy + 140); g.quadraticCurveTo(540, gy - 40, 640, gy - 60); g.quadraticCurveTo(740, gy - 40, 720, gy + 140); for (let k = 0; k < 4; k++) g.lineTo(720 - k * 40 - 20, gy + 120 + (k % 2) * 20); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore();
    ell(615, gy + 10, 10, 16, INK, 0); ell(665, gy + 10, 10, 16, INK, 0); ell(640, gy + 55, 14, 18, INK, 0);
    if (u > .78) { const k = ease((u - .78) * 6); g.save(); g.translate(430, 280); g.rotate(-.2); g.scale(1.6 - .6 * k, 1.6 - .6 * k); g.globalAlpha = k; rr(-170, -70, 340, 140, 18, null, 10, '#e0283a'); txt('NEXT!', 0, 4, 96, '#e0283a'); g.restore(); } },
  z7: u => { const items = [['HOUSE', 170], ['CAR', 430], ['DIAMONDS', 690]]; items.forEach(([w, x], i) => { const k = ease((u - i * .22) * 5); if (k <= 0) return; g.save(); g.translate(x, 280); g.scale(k, k);
      if (i === 0) { poly([[-110, -10], [0, -110], [110, -10]], '#c0283a', 6); rr(-90, -10, 180, 140, 4, '#f6efdc', 6); rr(-24, 50, 48, 80, 4, '#8a5a2e', 5); }
      if (i === 1) { rr(-130, 0, 260, 80, 26, '#e0b040', 6); rr(-80, -60, 160, 70, 20, '#e0b040', 6); rr(-62, -48, 56, 44, 8, '#bfe3f5', 4); rr(6, -48, 56, 44, 8, '#bfe3f5', 4); ell(-75, 85, 30, 30, '#2a2230', 5); ell(75, 85, 30, 30, '#2a2230', 5); }
      if (i === 2) { poly([[-90, -40], [-50, -90], [50, -90], [90, -40], [0, 90]], '#bfeefe', 6); ln([[-90, -40], [90, -40]], 5); sparkle(70, -90, 26, 1); }
      txt(w, 0, 190, 40, INK); g.restore(); }); },
  z8: u => { ell(740, 120, 70, 70, '#ffd84a', 6); ln([[180, 500], [210, 160]], 22, '#8a5a2e'); for (let k = 0; k < 5; k++) { const a = -2.6 + k * .55; poly([[210, 160], [210 + Math.cos(a) * 170, 160 + Math.sin(a) * 120], [210 + Math.cos(a + .2) * 120, 160 + Math.sin(a + .2) * 60]], '#3cb371', 5); }
    g.fillStyle = '#7fd0e8'; g.fillRect(0, 400, PW, 120); txt('MIAMI', 430, 60, 70, '#d63a8a', HW);
    mini({...MAN, mood: 'happy', pose: 'down'}, 400, 500, .26); mini({...FRIEND, mood: 'happy', pose: 'down'}, 560, 500, .25); ell(480, 240, 30, 26, '#ff5a8a', 5); },
  z11: u => { rr(300, 20, 260, 480, 40, '#2a2230', 0); rr(316, 40, 228, 440, 30, '#3a3550', 5); ell(430, 170, 60, 60, '#c8a060', 5); txt('Petrovich', 430, 280, 40, '#ffffff'); poly([[530, 268], [548, 252], [566, 268], [548, 290]], '#ff5a8a', 3);
    txt('incoming call', 430, 325, 26, '#bbb'); const ring = Math.sin(u * 40) * (u < .5 ? 6 : 0); ell(370 + ring, 420, 34, 34, u > .55 ? '#ffffff' : '#e0283a', 5); ell(490 - ring, 420, 34, 34, '#2f9a5a', 5);
    if (u > .55) txt('DECLINED', 430, 470, 30, '#e0283a'); },
};
function cloud(id, u, t) { const k = ease(u * 6) * (1 - ease((u - .93) * 14)); if (k <= 0) return; g.save(); g.globalAlpha = k;
  for (const [x, y, r] of [[700, 760, 16], [740, 700, 24]]) ell(x, y, r, r, '#fffaf0', 6);
  g.translate(PX + PW / 2, PY + PH / 2); g.scale(.85 + .15 * k, .85 + .15 * k); g.translate(-PW / 2, -PH / 2);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ell(PW / 2 + Math.cos(a) * (PW / 2 - 10), PH / 2 + Math.sin(a) * (PH / 2 - 10), 70, 60, '#fffaf0', 6); }
  rr(10, 10, PW - 20, PH - 20, 60, '#fffaf0', 0); g.save(); g.beginPath(); g.roundRect(20, 20, PW - 40, PH - 40, 50); g.clip(); CLOUD[id](u); g.restore(); g.restore(); }
const CLOUD_FOR = {z2: 'z2', z3: 'z3', z4: 'z4', z5: 'z5', z6: 'z6', z7: 'z7', z8: 'z8'};

// ---------- shots ----------
const CAM = {Z_MED: [1.55, 620, 824], Z_CLOUD: [1.5, 640, 668], Z_CU: [2.3, 650, 800], TWO: [1.02, 470, 1010]};
const SH = [[0, 'Z_MED'], [BY.z2.at - .1, 'Z_CLOUD'], [BY.r1.at - .1, 'TWO'], [BY.z6.at - .1, 'Z_CLOUD'], [BY.r2.at - .1, 'TWO'], [BY.z8.at - .1, 'Z_CLOUD'], [BY.z8.end + .1, 'Z_CU'], [BY.r3.at - .1, 'TWO'], [BY.z9.at - .1, 'Z_MED'],
  [BY.r4.at - .1, 'TWO'], [BY.z10.at - .1, 'Z_CU'], [TL.PHONE - .1, 'Z_CLOUD'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
// extra cuts inside long cloud stretches: cut to close-up on the punch words
const PUNCH = [[BY.z5.at + (BY.z5.end - BY.z5.at) * .62, BY.z5.end + .1]];
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; let k = sh.k === 'END' ? 'TWO' : sh.k, at = sh.at, end = sh.end;
  for (const [a, b] of PUNCH) if (t >= a && t < b) { k = 'Z_CU'; at = a; end = b; }
  const [z, x, y] = CAM[k], u = clamp((t - at) / (end - at)), push = sh.i % 3 === 2 ? 0 : .04 * ease(u), punch = at > 0 ? .04 * (1 - ease((t - at) / .3)) : 0;
  return {z: z * (1 + push + punch), x, y, k, sh}; }

// ---------- captions with Runglish highlight + translation chips ----------
const GLOSS = [['married', 'замужем'], ['divorce lawyer', 'адвокат по разводам'], ['confidence', 'уверенность'], ['gorgeous', 'шикарная'], ['too much', 'перебор'], ['ю ноу', 'you know — понимаешь'], ['Can I buy you a drink', 'можно вас угостить?'],
  ['чекаю', 'check — проверяю'], ['кар', 'car — машина'], ['relaxed', 'расслабленно'], ['Sure, why not', 'конечно, почему нет'], ['The most expensive one', 'самое дорогое'], ['split the bill', 'платить пополам'], ['блокаю', 'block — блокирую'],
  ['Red flag', 'тревожный знак'], ['гостит', 'ghost — пропал без объяснений'], ['call-ай', 'call — звонить'], ['текстай', 'text — писать'], ['his loss', 'это его потеря'], ['Next', 'следующий!'], ['super generous', 'очень щедрый'], ['Хаус', 'house — дом'],
  ['diamonds', 'бриллианты'], ['best friend', 'лучшая подруга'], ['problem', 'проблема'], ['Ноу', 'no — нет'], ["It's complicated", 'всё сложно'], ['busy', 'занята'], ["I'll call you back", 'я перезвоню'], ['Коллбэкну', 'call back — перезвоню']];
const SHOWN = {z6: 'Он тебя гостит? Не звони! Не коллай ему! Не текстай! Это his loss. Next!'};
function chunks(l) { const s = (SHOWN[l.id] || l.text).replace(/call-ай/g, 'коллай'); const parts = s.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n}; }); }
const CH = L.map(l => ({l, ch: chunks(l)}));
const chips = []; for (const l of L) { const s = l.text; for (const [w, tr] of GLOSS) { const i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) chips.push({a: l.at + (l.end - l.at) * i / s.length, w: w.replace('call-ай', 'коллай'), tr}); } }
chips.sort((a, b) => a.a - b.a);
const isEn = w => /[a-z]/i.test(w) || /^(ю|ноу|кар|хаус|чекаю|блокаю|гостит|коллай|текстай|коллбэкну)/i.test(w.replace(/[«»"?!.,…—]/g, ''));
function caption(t) { let cur = null; for (const {l, ch} of CH) for (const c of ch) if (t >= c.a - .02 && t < c.b + (c === ch[ch.length - 1] ? .25 : 0)) cur = c; if (!cur) return;
  const words = cur.s.split(' '); let size = 70; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; let tw = words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  while (tw > 980 && size > 40) { size -= 4; g.font = `${size}px ${FONT}`; tw = words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1); }
  const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12); g.save(); g.translate(540, 1640); g.scale(pop, pop); let x = -tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { const ww = g.measureText(w).width; g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, 0); g.fillStyle = isEn(w) ? '#ffd23f' : '#ffffff'; g.fillText(w, x, 0); x += ww + sp(); } g.restore(); }
function chip(t) { let c = null; for (const q of chips) if (t >= q.a && t < q.a + 1.5) c = q; if (!c) return; const k = ease((t - c.a) / .15); const s = `${c.w} = ${c.tr}`;
  g.font = `40px ${FONT}`; const w = Math.min(1000, g.measureText(s).width + 50); g.save(); g.globalAlpha = k; g.translate(540, 1545 + (1 - k) * 20); rr(-w / 2, -38, w, 76, 38, '#1f3a8a', 6, '#ffffff'); g.font = `40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  let f = 40; while (g.measureText(s).width > w - 40) { f -= 2; g.font = `${f}px ${FONT}`; } g.fillStyle = '#ffffff'; g.fillText(s, 0, 2); g.restore(); }
function hook(t) { if (t > 3.2) return; const k = ease(t / .25) * (1 - ease((t - 2.9) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 300); g.rotate(-.03); rr(-430, -110, 860, 220, 26, '#ffd23f', 8); txt('КАК НАЙТИ МУЖА', 0, -38, 72, INK); txt('В АМЕРИКЕ?', 0, 44, 72, '#c0283a'); g.restore();
  g.save(); g.globalAlpha = k; rr(70, 480, 230, 64, 12, '#e0283a', 6); txt('NEWS 24', 185, 513, 40, '#ffffff'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 190, 960, 1500, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 290, 64, '#d63a8a');
  const R = [['I WAS MARRIED', 'я была замужем'], ['DIVORCE LAWYER', 'адвокат по разводам'], ['GORGEOUS', 'сногсшибательная'], ['SPLIT THE BILL', 'платить пополам'], ['RED FLAG', 'тревожный знак'], ['TO GHOST SOMEONE', 'пропасть без объяснений'], ["I'LL CALL YOU BACK", 'я перезвоню']];
  R.forEach(([en, ru], i) => { const y = 410 + i * 128; txt(en, 540, y, 54, '#1f3a8a'); txt(ru, 540, y + 50, 38, '#c0283a'); });
  txt('Split the bill на свидании —', 540, 1340, 46, INK); txt('red flag или норм?', 540, 1400, 46, '#c0283a'); txt('А Петрович — муж номер четыре', 540, 1490, 40, INK); txt('или запасной вариант?', 540, 1544, 40, INK); txt('Пиши в комменты', 540, 1620, 44, '#d63a8a'); g.restore(); }

function frame(t) {
  const c = camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); street(t); reporter(t); zhanna(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.2)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.k === 'Z_CLOUD' && c.sh.k !== 'END') { const l = lineAt(t) || L.find(q => q.at > t); const id = t >= TL.PHONE - .1 ? 'z11' : CLOUD_FOR[(L.filter(q => q.at <= t + .1).pop() || {}).id];
    if (id) { const a = id === 'z11' ? TL.PHONE : BY[id].at, b = id === 'z11' ? BY.z11.end + .3 : BY[id].end + .25; if (t < b) cloud(id, (t - a) / (b - a), t); } }
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else { chip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const {ch} of CH) for (const c of ch) out += `${++n}\n${ts(c.a)} --> ${ts(c.b)}\n${c.s}\n\n`; fs.writeFileSync('final/zhanna_ep1.srt', out); }
