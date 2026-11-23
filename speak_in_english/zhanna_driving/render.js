// «Тётя Жанна с Брайтона» — «Жанна сдаёт на права в Америке» (zhanna_driving). Flat 2D, engine copied from ep7 (Zhanna, hidden Petrovich, hands, cards/clouds, captions/chips, end card, cams.json, face check).
// node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | info | frame | facecheck 3:0   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const bgCv = createCanvas(W, H), GB = bgCv.getContext('2d'), clCv = createCanvas(W, H), GC = clCv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const P01 = (t, a, d) => clamp((t - a) / d), ex = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), ei = x => x * x * x, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const spr = (x, d = 7, f = 9) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(f * x);   // spring 0->1 with overshoot
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
// fitText: every label on an object gets its box (maxW x maxH, padding already subtracted); the text shrinks, then wraps to two lines, until it fits
const TXTLOG = []; function txt(s, x, y, size, col, font = FONT, align = 'center', maxW = 0, maxH = 0) { s = String(s); g.font = `${size}px ${font}`; let f = size;
  if (maxW) { const lim = maxH || size * 1.2; while ((g.measureText(s).width > maxW || f > lim) && f > size * .62) { f -= 1; g.font = `${f}px ${font}`; }
    if (g.measureText(s).width > maxW && s.includes(' ')) { const ws = s.split(' '); let best = 1, bw = 1e9; for (let i = 1; i < ws.length; i++) { g.font = `${size}px ${font}`; const w = Math.max(g.measureText(ws.slice(0, i).join(' ')).width, g.measureText(ws.slice(i).join(' ')).width); if (w < bw) { bw = w; best = i; } }
      const a = ws.slice(0, best).join(' '), b = ws.slice(best).join(' '); let f2 = Math.min(size, lim / 2.1); g.font = `${f2}px ${font}`; while (Math.max(g.measureText(a).width, g.measureText(b).width) > maxW && f2 > 6) { f2 -= 1; g.font = `${f2}px ${font}`; }
      TXTLOG.push([s, maxW, Math.max(g.measureText(a).width, g.measureText(b).width), 'wrap']); g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(a, x, y - f2 * .55); g.fillText(b, x, y + f2 * .55); return; }
    TXTLOG.push([s, maxW, g.measureText(s).width, f < size ? 'shrunk' : 'ok']); }
  g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }
function heart(x, y, r, fill = '#ff5a8a') { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .7, y - r * 1.2, x, y - r * .4); g.bezierCurveTo(x + r * .7, y - r * 1.2, x + r * 1.4, y - r * .1, x, y + r * .9); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }

// ---------- cast ----------
// Zhanna: series palette (pink sequined top, star brooch, blonde bouffant, pink nails). Driver's seat = screen right (front view through the windshield)
const ZH = {outfit: 'blazer', hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, seated: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 965, s: .76};
// Petrovich: grey flat cap, brown jacket — back seat, always behind the BRIGHTON TIMES
const PE = {hair: 'short', cap: true, moustache: true, seated: true, pal: {arm: '#8a6d52', skin: '#eec3a2', skinS: '#d9a583', hair: '#cfcfcf', brow: '#9a9a9a', stache: '#dcdcdc', cap: '#7a808c', capS: '#5e6470', top: '#8a6d52', topS: '#6e553f', collar: '#eef3f8', bottom: '#4a4a52', legs: '#4a4a52', shoe: '#2a2230', sole: '#2a2230'}, x: 525, y: 1470, s: .46};
// Examiner: tired DMV officer, pale-blue shirt, navy tie, glasses, clipboard
const EX = {hair: 'short', glasses: true, seated: true, pal: {skin: '#e9bf9c', skinS: '#d4a27e', hair: '#8a7a68', brow: '#5a4a3a', top: '#a9c6e4', topS: '#8eaed0', collar: '#ffffff', tie: '#26346a', bottom: '#3a4050', legs: '#3a4050', shoe: '#1e1e24', sole: '#1e1e24'}, x: 88, s: .76};
const SEAT = 1850, DASH = 1352;
let NOW = 0;

// ---------- motion of the car ----------
function speed(t) { if (t < BY.z1.end - .4) return 0; if (t < BY.z1.end + .6) return ease((t - BY.z1.end + .4) / 1) ;
  if (t >= BY.z9.at - .3 && t < BY.z10.at + .6) return 0; if (t >= BY.z10.at + .6 && t < BY.e11.at) return .6 * ease((t - BY.z10.at - .6) / .8);
  if (t >= BY.e11.at) return .6 * (1 - ease((t - BY.e11.at) / .9)); return 1; }
const TURN = [BY.z3.at + .5, BY.z3.at + 2.2];
const OFF = [0]; for (let i = 1; i <= TL.TOTAL * FPS + 2; i++) { const t = i / FPS, turn = t > TURN[0] && t < TURN[1] ? 1.8 : 1; OFF.push(OFF[i - 1] + speed(t) * turn / FPS); }
const offAt = t => OFF[clamp(Math.round(t * FPS), 0, OFF.length - 1)];
const rollAt = t => t > TURN[0] && t < TURN[1] ? -.035 * Math.sin(Math.PI * (t - TURN[0]) / (TURN[1] - TURN[0])) : 0;

// ---------- street (seen through the rear window; blurred) ----------
function sign(kind, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); ln([[0, 0], [0, 260]], 12, '#8a9098');
  if (kind === 'yield') { poly([[-90, -70], [90, -70], [0, 80]], '#d8323c', 6); poly([[-60, -52], [60, -52], [0, 48]], '#ffffff', 0); txt('YIELD', 0, -24, 26, '#d8323c', FONT, 'center', 70, 28); }
  if (kind === 'speed') { rr(-70, -100, 140, 180, 10, '#ffffff', 6); txt('SPEED', 0, -70, 26, INK, FONT, 'center', 112, 28); txt('LIMIT', 0, -42, 26, INK, FONT, 'center', 112, 28); txt('30', 0, 20, 64, INK, FONT, 'center', 116, 70); }
  if (kind === 'stop') { const p = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; p.push([Math.cos(a) * 86, -10 + Math.sin(a) * 86]); } poly(p, '#d8323c', 6); txt('STOP', 0, -8, 40, '#ffffff', FONT, 'center', 124, 48); }
  g.restore(); }
function carSide(x, y, col, s = 1, dir = 1) { g.save(); g.translate(x, y); g.scale(s * dir, s); rr(-150, -50, 300, 70, 26, col, 6); poly([[-90, -50], [-60, -100], [60, -100], [100, -50]], col, 6); poly([[-75, -54], [-52, -92], [0, -92], [0, -54]], '#cfe6f2', 4); poly([[10, -54], [10, -92], [55, -92], [84, -54]], '#cfe6f2', 4);
  ell(-90, 24, 30, 30, '#2a2a30', 5); ell(90, 24, 30, 30, '#2a2a30', 5); g.restore(); }
const SIGNS = [['yield', BY.e4.at - 1.0], ['speed', BY.e5.at - .9], ['stop', BY.e8.at - 1.1]];
const PASSERS = [[BY.e4.at - .5, '#4a7ad0', -1], [BY.z7.at + .5, '#e0b040', 1], [BY.z7.at + 1.2, '#58a868', 1]];
function street(t) { const off = offAt(t);
  g.fillStyle = '#bfe3f2'; g.fillRect(-1400, -800, 3900, 1800); ell(260, 640, 50, 50, '#fff3c0', 0);
  for (let i = -3; i < 16; i++) { const P = 230, bx = ((i * P - off * 520) % (P * 14) + P * 14) % (P * 14) - 900, hh = 260 + hash(i % 14 + 1) * 200, col = ['#e8b89a', '#d8a0a8', '#c8c0a8', '#e6cfa0'][i % 14 % 4];
    rr(bx, 1060 - hh, P - 20, hh + 60, 4, col, 5); for (let k = 0; k < 6; k++) rr(bx + 24 + (k % 3) * 62, 1080 - hh + 36 + Math.floor(k / 3) * 80, 36, 50, 3, '#8fb8d8', 3); }
  // the El (elevated train over Brighton Beach Ave)
  rr(-1400, 760, 3900, 46, 0, '#5a6470', 6); for (let i = -4; i < 20; i++) { const px = ((i * 260 - off * 700) % 5200 + 5200) % 5200 - 1100; rr(px, 806, 30, 320, 0, '#5a6470', 5); ln([[px + 15, 806], [px + 120, 760]], 5, '#4a525c'); }
  rr(-1400, 1080, 3900, 300, 0, '#8a8f98', 0); for (let i = -2; i < 18; i++) { const dx = ((i * 220 - off * 900) % 3960 + 3960) % 3960 - 1100; rr(dx, 1130, 110, 14, 4, '#f4f0e4', 0); }
  for (const [kind, t0] of SIGNS) { const u = (t - t0) / 2.4; if (u > 0 && u < 1) sign(kind, lerp(1350, -350, u), 820, 1.1); }
  for (const [t0, col, dir] of PASSERS) { const u = (t - t0) / 1.0; if (u > 0 && u < 1) carSide(dir < 0 ? lerp(1500, -500, u) : lerp(-500, 1500, u), 1110, col, 1.3, dir); } }
function rearInterior() { // car ceiling, rear window frame, rear bench (all blurred with the street)
  g.save(); g.fillStyle = '#d8ccc0'; g.beginPath(); g.rect(-1400, -800, 3900, 3000); g.roundRect(-170, 560, 1400, 560, 70); g.fill('evenodd'); g.restore();
  rr(-170, 560, 1400, 560, 70, null, 14, '#6a5e58'); rr(-300, 985, 1700, 620, 60, '#b49a82', 8); for (const x of [60, 525, 990]) rr(x - 170, 1005, 340, 480, 50, '#c4ab92', 5); }

// ---------- interior (crisp) ----------
function seatBacks() { rr(330, 1196, 390, 400, 40, '#4a4452', 7); rr(370, 1222, 310, 56, 24, '#5a5262', 5); for (const x of [EX.x, ZH.x]) { rr(x - 70, 870, 140, 120, 34, '#4a4452', 6); ln([[x - 36, 990], [x - 36, 1012]], 8, '#9aa0a8'); ln([[x + 36, 990], [x + 36, 1012]], 8, '#9aa0a8'); rr(x - 165, 1008, 330, 520, 60, '#5a5262', 7); ln([[x - 120, 1060], [x - 120, 1440]], 4, '#4a4452'); ln([[x + 120, 1060], [x + 120, 1440]], 4, '#4a4452'); } }
function dashboard(t) {
  g.beginPath(); g.moveTo(-1400, DASH + 40); g.quadraticCurveTo(-1400, DASH, -1300, DASH); g.lineTo(2400, DASH); g.lineTo(2500, DASH + 40); g.lineTo(2500, 2600); g.lineTo(-1400, 2600); g.closePath(); g.fillStyle = '#3e3848'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  rr(-1400, DASH + 6, 3900, 26, 10, '#4c4558', 0); rr(30, DASH + 70, 250, 110, 18, '#4c4558', 6); ln([[110, DASH + 125], [200, DASH + 125]], 6, '#2a2430');   // glovebox
  for (const x of [470, 580]) { rr(x - 44, DASH + 40, 88, 60, 12, '#2a2430', 5); for (let k = 0; k < 3; k++) ln([[x - 32, DASH + 56 + k * 15], [x + 32, DASH + 56 + k * 15]], 3, '#6a6474'); }
  // pink hood below the dashboard
  g.beginPath(); g.moveTo(-1400, 1560); g.quadraticCurveTo(540, 1500, 2500, 1560); g.lineTo(2500, 2600); g.lineTo(-1400, 2600); g.closePath(); g.fillStyle = '#e46aa0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  ln([[240, 1580], [140, 2100]], 5, '#c8558a'); ln([[840, 1580], [940, 2100]], 5, '#c8558a'); ell(540, 1640, 46, 18, '#f2c820', 5); }
function wheel(t) { const x = ZH.x, y = 1335, r = 125, rot = rollAt(t) * -8 + (t > TURN[0] && t < TURN[1] ? -1.2 * Math.sin(Math.PI * (t - TURN[0]) / (TURN[1] - TURN[0])) : 0);
  ln([[x, y + 30], [x, DASH + 40]], 34, '#2a2430'); g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.arc(0, 0, r, 0, 7); g.strokeStyle = INK; g.lineWidth = 34; g.stroke(); g.strokeStyle = '#4a4452'; g.lineWidth = 20; g.stroke();
  ln([[-r, 0], [-34, 10]], 14, '#4a4452'); ln([[r, 0], [34, 10]], 14, '#4a4452'); ln([[0, 30], [0, r]], 14, '#4a4452'); ell(0, 10, 40, 34, '#5a5262', 6); star(0, 10, 16, '#f2c820', 4, 5); g.restore(); }
const MIR = [BY.z1.at + .15, BY.e2.at + .3];   // mirror turned towards Zhanna
const mirK = t => clamp(Math.min(ease((t - MIR[0]) / .35), 1 - ease((t - MIR[1]) / .35)));
function mirror(t) { const x = 525, y = 630, k = COVER ? 1 : mirK(t);
  ln([[x, 470], [x, y - 36]], 12); // air freshener (pink tree) hanging on a string
  const sw = Math.sin(t * 2.3) * .12 - rollAt(t) * 4; g.save(); g.translate(x - 70, y + 34); g.rotate(sw); ln([[0, 0], [0, 50]], 3); poly([[0, 46], [26, 96], [12, 96], [30, 130], [-30, 130], [-12, 96], [-26, 96]], '#ff7ac0', 4); g.restore();
  g.save(); g.translate(x, y); g.scale(1 - .25 * Math.sin(Math.PI * k), 1); g.rotate(-.06 * k);
  if (k < .5) { rr(-115, -40, 230, 80, 30, '#3e3848', 7); rr(-60, -14, 120, 22, 10, '#4c4558', 0); }
  else { rr(-115, -40, 230, 80, 30, '#3e3848', 7); rr(-100, -28, 200, 56, 22, '#dfe8ee', 5); g.save(); g.beginPath(); g.roundRect(-100, -28, 200, 56, 22); g.clip(); ln([[-80, 28], [-20, -28]], 14, 'rgba(255,255,255,.7)');
    const lips = (dx, w) => { g.beginPath(); g.moveTo(dx - w, 4); g.quadraticCurveTo(dx - w / 2, -14, dx, -4); g.quadraticCurveTo(dx + w / 2, -14, dx + w, 4); g.quadraticCurveTo(dx, 22, dx - w, 4); g.closePath(); g.fillStyle = '#d02a5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); };
    lips(20, 46); g.restore(); if (t - MIR[0] > .5 && t - MIR[0] < 1.6) { heart(118, -48, 16); heart(140, -82, 11); } sparkle(-80, -36, 14, .9); }
  g.restore(); }
function frameCar() { // windshield frame: pink roof and A-pillars (outside every character's extent)
  g.fillStyle = '#e46aa0'; g.beginPath(); g.moveTo(-1400, -800); g.lineTo(2500, -800); g.lineTo(2500, 2600); g.lineTo(1330, 2600); g.lineTo(1265, 1352); g.quadraticCurveTo(1235, 520, 1115, 480); g.lineTo(-55, 480); g.quadraticCurveTo(-175, 520, -210, 1352); g.lineTo(-275, 2600); g.lineTo(-1400, 2600); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-210, 1352); g.quadraticCurveTo(-175, 520, -55, 480); g.lineTo(1115, 480); g.quadraticCurveTo(1235, 520, 1265, 1352); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); g.strokeStyle = '#2a2430'; g.lineWidth = 6; g.beginPath(); g.moveTo(-185, 1352); g.quadraticCurveTo(-151, 540, -45, 504); g.lineTo(1105, 504); g.quadraticCurveTo(1211, 540, 1241, 1352); g.stroke();
  rr(150, 430, 780, 20, 10, '#c8558a', 0); }

// ---------- gestures ----------
const ZG = {
  wheel: s => [[s * 78, -860], [s * 175, -700], [s * 145, -757]],
  point: s => s > 0 ? [[78, -860], [190, -920], [150, -1080]] : ZG.wheel(s),          // finger up (mirror / "listen")
  lip: s => s > 0 ? [[78, -860], [235, -850], [118 + 14 * Math.sin(NOW * 9), -918]] : ZG.wheel(s),
  palm: s => s > 0 ? [[78, -860], [175, -790], [255, -860]] : ZG.wheel(s),
  dream: s => s > 0 ? [[78, -860], [130, -760], [30, -800]] : ZG.wheel(s),
  wag: s => s > 0 ? [[78, -860], [180, -900], [170, -1040]] : ZG.wheel(s),
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : ZG.wheel(s),
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  shake: s => s < 0 ? [[-78, -860], [-200, -760], [-330, -790]] : ZG.wheel(s),
  offer: s => s < 0 ? [[-78, -860], [-200, -790], [-320, -850]] : ZG.wheel(s),
  wave: s => s > 0 ? [[78, -860], [215, -960], [255 + 25 * Math.sin(NOW * 9), -1110]] : ZG.wheel(s),
  fists: s => [[s * 78, -860], [s * 200, -880], [s * 235, -1030]],
  license: s => s > 0 ? [[78, -860], [220, -860], [270, -960]] : ZG.wheel(s),
};
const EG = {
  pad: s => s < 0 ? [[-78, -860], [-130, -730], [-20, -770]] : [[78, -860], [130, -730], [50, -790]],
  point: s => s < 0 ? [[-78, -860], [-130, -730], [-20, -770]] : [[78, -860], [190, -900], [215, -1020]],
  shock: s => [[s * 78, -860], [s * 190, -930], [s * 230, -1070]],
  clutch: s => [[s * 78, -860], [s * 120, -740], [s * 26, -820]],
  stamp: s => s < 0 ? [[-78, -860], [-130, -730], [-20, -770]] : [[78, -860], [170, -820], [60, -800 - 120 * Math.max(0, Math.sin(clamp((NOW - TL.STAMP1 + .35) / .35) * Math.PI))]],
  beg: s => [[s * 78, -860], [s * 130, -760], [s * 16, -860]],
  look: s => s < 0 ? [[-78, -860], [-130, -730], [-20, -770]] : [[78, -860], [150, -760], [110, -680]],
  push: s => [[s * 78, -860], [s * 200, -760], [s * 300 + 40, -800]],
};
const FRONT = new Set(['palm', 'dream', 'wheel', 'brooch', 'pad', 'point', 'clutch', 'stamp', 'beg', 'look', 'offer', 'shake', 'push', 'lip', 'wag', 'license', 'wave']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(l.env[i] || 0); };   // mouthEnv (prep.py): 0 = closed, no smoothing
const lineFor = (who, t) => { for (const l of L) if (l.who === who && t >= l.at - .05 && t < l.end + .3) return l; return null; };
const talkSt = (l, t, seed) => { const r = T.talk(l, t, seed); return {mouth: r.mouth, round: r.round, vis: r.round, nod: r.nod, talking: !!l && t < l.end + .05}; };   // toon v3: spring-smoothed, stateless
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
const ZPLAN = {z1: [[0, 'point'], [.22, 'lip'], [.8, 'wheel']], z2: [[0, 'palm'], [.55, 'wheel']], z3: [[0, 'wag'], [.45, 'wheel']], z4: [[0, 'wag'], [.6, 'palm']], z5: [[0, 'shake']], z7: [[0, 'wave']], z8: [[0, 'brooch']],
  z10: [[0, 'dream'], [.3, 'offer']], z11: [[0, 'offer'], [.45, 'brooch']], z12: [[0, 'fists']], z13: [[0, 'license'], [.7, 'shrug']]};
const EPLAN = {e1: [[0, 'pad']], e2: [[0, 'look']], e3: [[0, 'point']], e4: [[0, 'point']], e5: [[0, 'point']], e7: [[0, 'point']], e8: [[0, 'point']], e9: [[0, 'pad']], e10: [[0, 'shock']], e11: [[0, 'stamp'], [.6, 'beg']], e12: [[0, 'stamp'], [.35, 'push']]};
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of (P[l.id] || [])) if (u >= k) gg = v; return gg; } return idle; }
// Zhanna's emotions (toon v2 MOODS) change on every beat; a blink on each change
const ZMOOD = {z1: [[0, 'smug'], [.25, 'flirty'], [.62, 'proud']], z2: [[0, 'smugside'], [.6, 'eyeroll']], z3: [[0, 'smug'], [.55, 'grin']], z4: [[0, 'smugside'], [.55, 'proud']],
  z5: [[0, 'grin'], [.5, 'smug']], z7: [[0, 'happy'], [.5, 'proud']], z8: [[0, 'dreamy']], z9: [[0, 'smug']], z10: [[0, 'kind'], [.4, 'dreamy']], z11: [[0, 'smugside'], [.5, 'dreamy']],
  z12: [[0, 'angry']], z13: [[0, 'proud'], [.4, 'grin'], [.75, 'smugside']]};
const LAUGH = [['z3', 1.0], ['z5', .9], ['z7', .8], ['z11', .7]];
const LISTEN = [['e2', 'smug'], ['e3', 'smugside'], ['e4', 'smugside'], ['e5', 'flat'], ['e7', 'smug'], ['e8', 'eyeroll'], ['p2', 'kind'], ['e9', 'proud'], ['e10', 'grin'], ['p3', 'surprised'], ['e12', 'laugh']];
function zLaugh(t) { for (const [id, d] of LAUGH) if (t >= BY[id].end && t < BY[id].end + d) return t - BY[id].end; if (t >= TL.STAMP2 && t < BY.z13.at) return t - TL.STAMP2; if (t >= TL.END) return t - TL.END; return -1; }
function zMood(t) { if (COVER) return 'flirty'; if (t >= TL.END) return 'laugh'; const l = lineAt(t);
  if (l && l.who === 'z') { const u = (t - l.at) / (l.end - l.at); let m = 'smug'; for (const [k, v] of (ZMOOD[l.id] || [])) if (u >= k) m = v; return m; }
  if (zLaugh(t) >= 0) return 'laugh'; if (t >= TL.STAMP1 && t < BY.z12.at) return 'shocked';
  for (const [id, m] of LISTEN) if (l && l.id === id) return m; return 'smug'; }
function zAct(t) { return {g: plan(ZPLAN, 'z', t, 'wheel'), mood: zMood(t)}; }
const EMOOD = {e1: 'sleepy', e2: 'worried', e3: 'flat', e4: 'angry', e5: 'angry', e7: 'flat', e8: 'angry', e9: 'sleepy', e10: 'shocked', e11: 'sad', e12: 'happy',
  z1: 'surprised', z2: 'flat', z3: 'shocked', z4: 'disgusted', z5: 'worried', z7: 'shocked', z8: 'disgusted', p2: 'eyeroll', z10: 'worried', z11: 'worried', z12: 'worried', p3: 'surprised', z13: 'happy'};
function eMood(t) { if (COVER) return 'shocked'; const l = lineAt(t); if (!l) return t < BY.z1.at ? 'sleepy' : t > TL.STAMP1 && t < BY.e12.at ? 'sad' : 'flat';
  if (l.id === 'z1' && t < l.at + 1.4) return 'sleepy'; if (l.id === 'p3' && t > l.at + (l.end - l.at) * .5) return 'worried'; return EMOOD[l.id] || 'flat'; }
function eAct(t) { let idle = 'pad'; if (t >= BY.z5.at && t < BY.z5.end + .2) idle = 'clutch'; if (t >= BY.z10.at + .5 && t < BY.e10.at) idle = 'clutch'; if (t >= BY.z12.at && t < BY.e12.at) idle = 'beg';
  return {g: plan(EPLAN, 'e', t, idle), mood: eMood(t)}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
// gripping hand in two layers: back = palm + thumb (behind the object), front = curled fingers with nails over the object's edge
function gripBack(x, y, ang, S, skin) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S); g.save(); g.translate(-2, 20); g.rotate(.8); rr(0, -6, 30, 12, 6, skin, 5); g.restore(); ell(0, 0, 27, 25, skin, 5); g.restore(); }
function gripFront(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-15, -5, 5, 15]) { const len = 30 - Math.abs(o) * .35; rr(4, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 2, o, 6.5, 5.5, nail, 3); if (glossy) ell(len, o - 2, 2.2, 1.4, '#ffffff', 0); } else ln([[len - 2, o - 3], [len - 2, o + 3]], 2, '#c89a7a'); }
  g.restore(); }
function pen(x, y, ang, S) { g.save(); g.translate(x, y); g.rotate(ang + 1.2); g.scale(S, S); rr(-50, -6, 100, 12, 5, '#26346a', 4); poly([[50, -6], [66, 0], [50, 6]], '#e8c27a', 3); g.restore(); }
const handPos = (x, y, S, a, s) => { const P3 = a.fn(s), E = P3[1], Hh = P3[2]; return {x: x + Hh[0] * S, y: y + Hh[1] * S, ang: Math.atan2(Hh[1] - E[1], Hh[0] - E[0])}; };
function hands(x, y, S, a, c, nail, glossy) { for (const s of [-1, 1]) { const h = handPos(x, y, S, a, s); hand(h.x, h.y, h.ang, S, c.pal.skin, nail, glossy); } }

// ---------- props ----------
function container(x, y, s, open = true, steamy = true) { g.save(); g.translate(x, y); g.scale(s, s);
  poly([[-70, -30], [70, -30], [56, 24], [-56, 24]], '#c8ccd2', 5); for (let k = 0; k < 4; k++) ln([[-50 + k * 33, -22], [-44 + k * 30, 18]], 2, '#a8acb4');
  if (open) { for (const [cx, cy] of [[-36, -34], [0, -38], [36, -34]]) ell(cx, cy, 22, 13, '#9a5a30', 4); poly([[-74, -32], [-60, -80], [56, -88], [74, -36]], '#dde0e6', 5); if (steamy) for (let i = 0; i < 3; i++) { const ph = (NOW * .8 + i * .33) % 1; g.save(); g.globalAlpha *= (1 - ph) * .8; ln([[-30 + i * 30, -50 - ph * 40], [-24 + i * 30 + 8 * Math.sin(NOW * 5 + i), -70 - ph * 40]], 6, '#ffffff'); g.restore(); } }
  else rr(-74, -42, 148, 16, 6, '#dde0e6', 5);
  g.restore(); }
function clipboard(x, y, ang, sc, t) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc); rr(-62, -84, 124, 168, 10, '#b07a44', 6); rr(-50, -64, 100, 140, 4, '#ffffff', 4); rr(-26, -94, 52, 24, 6, '#c8ccd2', 5);
  for (let k = 0; k < 5; k++) ln([[-36, -40 + k * 22], [26, -40 + k * 22]], 3, '#9ab0d0');
  const marks = [BY.e4.at + .5, BY.e5.at + .5, BY.e8.at + .5].filter(m => t >= m).length; for (let k = 0; k < marks; k++) { const mx = 36, my = -40 + k * 22; ln([[mx - 8, my - 8], [mx + 8, my + 8]], 4, '#d8323c'); ln([[mx + 8, my - 8], [mx - 8, my + 8]], 4, '#d8323c'); }
  if (t >= TL.STAMP1) { g.save(); g.translate(0, 47); g.rotate(-.18); g.translate(0, -47); rr(-40, 32, 80, 30, 6, null, 5, t >= TL.STAMP2 ? '#2f9a5a' : '#d8323c'); txt(t >= TL.STAMP2 ? 'PASSED' : 'FAILED', 0, 47, 22, t >= TL.STAMP2 ? '#2f9a5a' : '#d8323c', FONT, 'center', 68, 24); g.restore(); }
  g.restore(); }
// container state: in the bag -> Zhanna's hand (z10) -> examiner's clipboard (z11) -> dashboard (e12: "Keep the cutlets!")
const C_HAND = BY.z10.at + .3, C_CLIP = BY.z11.at + .9, C_DASH = BY.e12.at + 1.1;

// ---------- characters (front view) ----------
let ZA = null, EA = null;
function zBody(t) { const l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH, x = c.x + Math.sin(t * 1.4) * 3 * (spk ? 1.4 : 1), y = SEAT;
  const tilt = (spk ? .05 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02) + rollAt(t) * 2, br = 1 - .006 * (1 + Math.sin(t * 2.2));
  const zl = lineFor('z', t), ts = zl ? talkSt(zl, t, 3) : {mouth: T.follow(u => zLaugh(u) >= 0 ? T.laughEnv(zLaugh(u)) : 0, t, .06, .1, .3), nod: 0, round: .5, vis: .5, talking: false}, breath = 2 + 2 * Math.sin(t * 2.2), md = T.moodAt(zMood, t, .25);
  T.draw(g, {...c, x, y, sq: br, arms: (a.fn = wig(a.fn, t, spk ? 6 : 1.5)), ik: false, breath, front: a.front, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, nod: ts.nod, t, blink: blink(t, 2) || md.blink, tilt, look: a.act.g === 'lip' || COVER ? -.6 : spk ? .2 : -.4});
  const S = c.s, bx = x - 40 * S, by = y - 790 * S * br; star(bx, by, 30, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  ZA = {a, x, y, br}; }
function limbW(pts, w, col) { ln(pts, w + 14); ln(pts, w, col); }
function zArms(x, y, S, br, a) { g.save(); g.translate(x, y); g.scale(S, S); g.scale(1 + (1 - br) * .5, br); const c = T.palOf(ZH);
  for (const s of [-1, 1]) T.drawArm(g, ZH, s, a.fn(s), c); g.restore(); }
function zHands(t) { const {a, x, y, br} = ZA, S = ZH.s, sk = ZH.pal.skin, NL = '#d63a8a'; zArms(x, y, S, br, a);
  const H = {}; for (const s of [-1, 1]) H[s] = handPos(x, y, S, a, s);
  const onWheel = s => { const d = Math.hypot(H[s].x - ZH.x, H[s].y - 1335); return d > 90 && d < 160; };
  const holdC = t >= C_HAND && t < C_CLIP - .5 && ['offer', 'brooch', 'wheel', 'dream'].includes(a.act.g) && !onWheel(-1);
  const obj = {1: a.act.g === 'lip' && a.e > .5 ? 'lip' : a.act.g === 'license' && a.e > .5 ? 'license' : null, '-1': holdC ? 'cont' : null};
  for (const s of [-1, 1]) if (onWheel(s)) gripBack(H[s].x, H[s].y, H[s].ang, S, sk);
  wheel(t);
  for (const s of [-1, 1]) if (onWheel(s)) gripFront(H[s].x, H[s].y, H[s].ang, S, sk, NL, true);
  for (const s of [-1, 1]) { if (onWheel(s)) continue; const h = H[s], o = obj[s]; if (!o) { hand(h.x, h.y, h.ang, S, sk, NL, true); continue; }
    gripBack(h.x, h.y, h.ang, S, sk);
    if (o === 'lip') { const mx = x + 4, my = y - 950 * S * br + 2, dx = mx - h.x, dy = my - h.y, L0 = Math.hypot(dx, dy), ux = dx / L0, uy = dy / L0;
      g.save(); g.translate(h.x - ux * 14, h.y - uy * 14); g.rotate(Math.atan2(uy, ux)); const len = L0 + 14; rr(0, -10, len - 26, 20, 6, '#f2c820', 4); rr(len - 30, -8, 30, 16, 7, '#d02a5a', 4); g.restore(); }
    if (o === 'license') { g.save(); g.translate(h.x + 52, h.y - 30); g.rotate(-.12); rr(-62, -38, 124, 76, 8, '#fffaf0', 5); ell(-34, -2, 16, 18, '#f3d27a', 3); rr(-12, -18, 60, 8, 3, '#9ab0d0', 0); rr(-12, -2, 50, 8, 3, '#9ab0d0', 0); txt('OK', 22, 22, 18, '#2f9a5a', FONT, 'center', 40, 20); g.restore(); }
    if (o === 'cont') { g.save(); g.globalAlpha *= ease((t - C_HAND) / .3); container(h.x - 52, h.y - 4, .9); g.restore(); }
    gripFront(h.x, h.y, h.ang, S, sk, NL, true); }
  if (t >= C_CLIP - .5 && t < C_CLIP) { const h = H[-1], mv = ease((t - C_CLIP + .5) / .5); container(lerp(h.x - 52, EX.x + 150, mv), lerp(h.y - 4, DASH - 26, mv) - Math.sin(Math.PI * mv) * 50, .9); } }
function exX(t) { const a = TL.DOOR - .45; return t < a ? EX.x : EX.x - 900 * ease((t - a) / .5); }
function eBody(t) { const x0 = exX(t); if (x0 < -700) { EA = null; return; } const l = lineAt(t), spk = l && l.who === 'e', a = blendArms(eAct, EG, t), c = EX, x = x0 + Math.sin(t * 1.2 + 2) * 2, y = SEAT;
  const twitch = a.act.mood === 'sad' && Math.sin(t * 23) > .7 ? 1 : 0, tilt = (spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t)) + rollAt(t) * 3 + (eAct(t).g === 'look' ? -.12 : 0);
  const ts = talkSt(lineFor('e', t), t, 7), md = T.moodAt(eMood, t, .25); T.draw(g, {...c, x, y, arms: (a.fn = T.ik(wig(a.fn, t, spk ? 5 : 1.2), 2 + 2 * Math.sin(t * 2.4))), ik: false, front: a.front, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, nod: ts.nod, t, blink: blink(t, 5) || twitch || md.blink, tilt, look: a.act.g === 'look' ? .9 : spk ? 0 : .6, sweat: a.act.mood === 'sad' || t >= BY.e11.at && t < TL.DOOR});
  const S = c.s; rr(x - 70 * S - 22, y - 800 * S - 16, 44, 30, 6, '#e8c27a', 4); txt('DMV', x - 70 * S, y - 800 * S, 15, INK, FONT, 'center', 34, 20);
  EA = {a, x, y, clip: null}; }
function eHands(t) { if (!EA) return; const {a, x, y} = EA, S = EX.s; const hasClip = a.act.g !== 'shock' && a.act.g !== 'push';
  const sk = EX.pal.skin, h = handPos(x, y, S, a, -1), r = handPos(x, y, S, a, 1);
  if (hasClip) { const rot = a.act.g === 'shock' ? -.5 : -.08, cx = h.x + Math.cos(rot) * 50 + 4, cy = h.y + Math.sin(rot) * 50 - 6, ga = rot;
    gripBack(h.x, h.y, ga, S, sk); clipboard(cx, cy, rot, .9, t); EA.clip = [cx, cy]; gripFront(h.x, h.y, ga, S, sk);
    if (['pad', 'stamp', 'look'].includes(a.act.g)) { gripBack(r.x, r.y, r.ang, S, sk); pen(r.x, r.y, r.ang, S); gripFront(r.x, r.y, r.ang, S, sk); } else hand(r.x, r.y, r.ang, S, sk, null, false); }
  else hands(x, y, S, a, EX, null, false); }
function dashProps(t) { if (t >= C_CLIP) { const k = ease((t - C_DASH) / .35); container(lerp(EX.x + 150, 525, k), DASH - 26 - Math.sin(Math.PI * k) * 60, .9); } }

// ---------- Petrovich (hidden behind the BRIGHTON TIMES, in both views) ----------
function jacket(x, y, S) { const c = PE.pal; g.save(); g.translate(x, y); g.scale(S, S);
  g.beginPath(); g.moveTo(-290, -380); g.lineTo(-300, -790); g.quadraticCurveTo(-300, -905, -150, -910); g.lineTo(150, -910); g.quadraticCurveTo(300, -905, 300, -790); g.lineTo(290, -380); g.closePath(); g.fillStyle = c.top; g.fill(); g.strokeStyle = INK; g.lineWidth = 7 / S * .76; g.stroke();
  poly([[-46, -900], [46, -900], [0, -760]], c.collar, 6); ln([[-46, -900], [-110, -640]], 8, c.topS); ln([[46, -900], [110, -640]], 8, c.topS); for (const yy of [-700, -600, -500]) ell(0, yy, 9, 9, c.topS, 4); g.restore(); }
function lap(x, y, S) { const c = PE.pal; g.save(); g.translate(x, y); g.scale(S, S); rr(-290, -560, 580, 140, 40, c.bottom, 7); for (const s of [-1, 1]) ell(s * 130, -430, 115, 60, c.bottom, 7); g.restore(); }
function paper(x, top, k, S) { const w = S ? 215 * S : 178 * k, h = S ? 420 * S : 360 * k; rr(x - w, top, w * 2, h, 6, '#f4f1e8', 7); txt('BRIGHTON TIMES', x, top + 42 * k, 40 * k, INK, HW, 'center', 2 * w - 30 * k, 48 * k); ln([[x - w + 16 * k, top + 70 * k], [x + w - 16 * k, top + 70 * k]], 4);
  rr(x - w + 20 * k, top + 90 * k, 150 * k, 110 * k, 4, '#c8cfd6', 4); for (let j = 0; j < 9; j++) ln([[x - w + (j < 4 ? 186 : 20) * k, top + (98 + j * 26) * k], [x + w - 20 * k, top + (98 + j * 26) * k]], 4, '#b8b2a4'); ln([[x, top + 214 * k], [x, top + h - 14 * k]], 3, '#d8d2c4'); }
const nodAt = t => { const l = lineAt(t); return l && l.who === 'p' && /Угу/.test(l.text) ? Math.sin(Math.PI * clamp((t - l.at) / (l.end - l.at))) : 0; };
function petro(t, x, y, S, top) { const l = lineAt(t), spk = l && l.who === 'p', a = blendArms(() => ({g: 'hold'}), {hold: s => [[s * 262, -845], [s * 318, -690], [s * 226, -935]]}, t), k = S / .76, nod = nodAt(t) * 10 * k;
  const fn = a.fn; jacket(x, y + nod, S); const ts = talkSt(lineFor('p', t), t, 5); T.draw(g, {...PE, x, y: y + nod, s: S, arms: (a.fn = wig(fn, t, 1.2)), ik: false, front: false, probe: !!process.env.FACECHECK, mood: 'kind', mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, t, blink: blink(t, 7), tilt: 0, look: -.3});
  lap(x, y + nod, S); const HP = [-1, 1].map(s => ({s, ...handPos(x, y + nod, S, a, s)})); for (const h of HP) gripBack(h.x, h.y, h.s < 0 ? 0 : Math.PI, S, PE.pal.skin); paper(x, top + nod, k, S); for (const h of HP) { const s = h.s; gripFront(h.x, h.y, s < 0 ? 0 : Math.PI, S, PE.pal.skin); if (s < 0) { ell(h.x - Math.cos(h.ang) * 22 * S, h.y - Math.sin(h.ang) * 22 * S, 13 * k, 13 * k, '#e8c27a', 4); } } }
function petrovich(t) { petro(t, PE.x + Math.sin(t * 1.1 + 1) * 2, PE.y, PE.s, PE.y - 1272 * PE.s); }

// ---------- special views (screen coordinates) ----------
function backSeat(t) { // reverse angle into the back seat: Petrovich behind the paper, front seat backs in the foreground
  const l = lineAt(t); petro(t, 540, 1882, 1.0, 1882 - 1250);
  if (l && (l.id === 'p3' || l.id === 'p2')) { const e = env(l, t), bx = 885, by = 470, r = 74 + 8 * e; ell(bx, by, r, r * .78, '#fffaf0', 7); poly([[bx - 40, by + 44], [778, 660], [bx - 4, by + 56]], '#fffaf0', 0); ln([[bx - 40, by + 46], [778, 660], [bx - 2, by + 56]], 7);
    g.save(); g.translate(bx - 38, by - 24); g.scale(.95, .95); flag(0, 0, 76, 50); g.restore(); for (let i = 0; i < 3; i++) ln([[700 + i * 20, 590 - i * 26], [720 + i * 22, 576 - i * 28]], 6); }
  rr(330, 1560, 420, 600, 50, '#4a4452', 8); rr(370, 1590, 340, 80, 30, '#5a5262', 6);
  for (const [x, f] of [[110, 1], [970, -1]]) { rr(x - 120, 980, 240, 150, 50, '#4a4452', 8); ln([[x - 50, 1130], [x - 50, 1170]], 12, '#9aa0a8'); ln([[x + 50, 1130], [x + 50, 1170]], 12, '#9aa0a8'); rr(x - 230 + f * 20, 1160, 460, 900, 90, '#5a5262', 9); ln([[x - 150, 1240], [x - 150, 1900]], 5, '#4a4452'); ln([[x + 150, 1240], [x + 150, 1900]], 5, '#4a4452'); } }
function backSeatBg(t) { g.save(); g.translate(540, 960); g.scale(1.25, 1.25); g.translate(-525, -960); street(t); rearInterior(); g.restore(); }
// parking, top-down
const PK0 = BY.z9.at - .1, PK1 = BY.z9.at + 1.9;
function topBg(t) { g.fillStyle = '#8a8f98'; g.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) rr(i * 220 - 60, 690, 120, 16, 6, '#f4f0e4', 0);
  rr(-20, 1300, 1120, 400, 0, '#c9c2b4', 7); for (let x = 0; x < 1100; x += 120) ln([[x, 1300], [x, 1700]], 4, '#b4ac9c'); ell(980, 1480, 90, 90, '#5a9a5a', 7); ell(130, 1520, 70, 70, '#5a9a5a', 7);
  for (const x of [20, 360, 700, 1040]) ln([[x, 1010], [x, 1290]], 10, '#ffffff'); ln([[20, 1290], [1040, 1290]], 8, '#ffffff');
  topCar(-150, 1150, 0, '#4a7ad0', false); }
function topCar(x, y, ang, col, zh) { g.save(); g.translate(x, y); g.rotate(ang); rr(-170, -88, 340, 176, 50, col, 8); rr(40, -70, 70, 140, 22, '#5a6a80', 5); rr(-140, -70, 50, 140, 18, '#5a6a80', 5); for (const [wx, wy] of [[-110, -92], [110, -92], [-110, 92], [110, 92]]) rr(wx - 30, wy - 12, 60, 24, 8, '#2a2a30', 4);
  if (zh) { rr(-88, -66, 120, 132, 26, '#f08cb8', 5); ln([[-70, -40], [14, -40]], 4, '#c8558a'); ln([[-70, 40], [14, 40]], 4, '#c8558a'); ell(155, -58, 14, 10, '#fff3c0', 3); ell(155, 58, 14, 10, '#fff3c0', 3); rr(-172, -70, 14, 30, 4, '#d8323c', 3); rr(-172, 40, 14, 30, 4, '#d8323c', 3); }
  g.restore(); }
function topView(t) { const u = clamp((t - PK0) / (PK1 - PK0)), e = ease(u), x = lerp(-260, 700, e), y = lerp(860, 1150, ease(clamp((u - .45) / .55))), ang = lerp(0, -.42, ease(clamp((u - .55) / .45))) + (u >= 1 ? .02 * Math.sin((t - PK1) * 14) * Math.exp(-(t - PK1) * 3) : 0);
  if (u > .6 && u < 1) for (let i = 0; i < 2; i++) ln([[x - 200, y + 70 - i * 140], [x - 330, y + 90 - i * 160]], 10, 'rgba(40,40,40,.45)');
  topCar(x, y, ang, '#e46aa0', true); if (u >= 1) { const k = ease((t - PK1) / .3); g.save(); g.globalAlpha = k; for (const sx of [530, 870]) { rr(sx - 60, 1030, 120, 60, 14, '#fffaf0', 5); txt(sx < 700 ? '1' : '2', sx, 1061, 40, '#d63a8a', FONT, 'center', 100, 48); } g.restore(); } }

// ---------- clouds (thoughts) and cards (cutaways) ----------
const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
function speedo(x, y, r, v) { g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.closePath(); g.fillStyle = '#2a2430'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; ln([[x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95]], 5, i * 10 > 30 ? '#ff5a5a' : '#ffffff'); }
  const a = Math.PI + v / 80 * Math.PI; ln([[x, y], [x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78]], 9, '#ff3a3a'); ell(x, y, 12, 12, '#ffffff', 4); }
function board(x, y, s, stamp, u) { g.save(); g.translate(x, y); g.scale(s, s); rr(-130, -170, 260, 340, 16, '#b07a44', 8); rr(-106, -136, 212, 290, 6, '#ffffff', 5); rr(-50, -186, 100, 40, 10, '#c8ccd2', 6); for (let k = 0; k < 6; k++) ln([[-80, -90 + k * 40], [70, -90 + k * 40]], 4, '#9ab0d0');
  for (let k = 0; k < 3; k++) { const mx = 84, my = -90 + k * 40; ln([[mx - 12, my - 12], [mx + 12, my + 12]], 6, '#d8323c'); ln([[mx + 12, my - 12], [mx - 12, my + 12]], 6, '#d8323c'); } g.restore(); }
function stampMark(x, y, label, col, u, rot) { const k = clamp(u / .18), sc = lerp(1.8, 1, ease(k)); if (u <= 0) return; g.save(); g.globalAlpha *= k; g.translate(x, y); g.rotate(rot); g.scale(sc, sc); rr(-150, -50, 300, 100, 12, 'rgba(255,255,255,.6)', 9, col); txt(label, 0, 4, 66, col, FONT, 'center', 270, 80); g.restore(); }
const CARD = {
  right: u => { g.save(); g.translate(250, 300); ln([[0, 140], [0, -10]], 46, '#2a7ad0'); g.beginPath(); g.arc(90, -10, 90, Math.PI, 1.5 * Math.PI); g.strokeStyle = '#2a7ad0'; g.lineWidth = 46; g.stroke(); poly([[90, -150], [190, -100], [90, -50]], '#2a7ad0', 0); g.restore();
    txt('MAKE A', 600, 170, 56, INK, FONT, 'center', 420, 64); txt('RIGHT TURN', 600, 245, 62, '#2a7ad0', FONT, 'center', 420, 70); txt('направо', 600, 345, 52, '#c0283a', FONT, 'center', 420, 60); },
  yield: u => { sign('yield', 250, 250, 1.7); txt('YIELD', 610, 200, 84, '#d8323c', FONT, 'center', 400, 90); txt('уступи', 610, 300, 52, INK, FONT, 'center', 400, 60); txt('дорогу', 610, 360, 52, INK, FONT, 'center', 400, 60); },
  speed: u => { sign('speed', 220, 240, 1.35); speedo(600, 330, 170, lerp(30, 52, ease(u * 2)) + Math.sin(u * 40) * .8); txt('SPEED LIMIT 30', 600, 400, 44, INK, FONT, 'center', 400, 50); if (u > .35) txt(Math.round(lerp(30, 50, ease((u - .35) * 4))) + '!', 600, 255, 64, '#ff5a5a', FONT, 'center', 200, 70); },
  price: u => { g.save(); g.translate(230, 270); g.rotate(-.12); poly([[-120, -70], [90, -70], [140, 0], [90, 70], [-120, 70]], '#fff3c0', 7); ell(100, 0, 12, 12, '#ffffff', 5); txt('30', -20, 4, 90, INK, FONT, 'center', 170, 110); if (u > .2) ln([[-110, 50], [80, -50]], 12, '#d8323c'); g.restore();
    if (u > .3) { ln([[380, 270], [470, 270]], 12); poly([[470, 245], [505, 270], [470, 295]], INK, 0); g.save(); g.translate(620, 270); g.rotate(.1); poly([[-120, -70], [90, -70], [140, 0], [90, 70], [-120, 70]], '#ffc0dc', 7); ell(100, 0, 12, 12, '#ffffff', 5); txt('50?', -14, 4, 86, '#d63a8a', FONT, 'center', 170, 110); g.restore(); } },
  merge: u => { rr(130, 60, 300, 420, 10, '#8a8f98', 6); ln([[280, 80], [280, 460]], 8, '#ffffff'); g.setLineDash([30, 26]); ln([[280, 80], [280, 460]], 8, '#8a8f98'); g.setLineDash([]); g.save(); g.translate(355, 400);
    g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(0, -120, -150, -120, -150, -260); g.strokeStyle = '#f2c820'; g.lineWidth = 30; g.stroke(); poly([[-150, -330], [-195, -255], [-105, -255]], '#f2c820', 0); g.restore();
    txt('MERGE', 640, 200, 84, '#2a7ad0', FONT, 'center', 340, 90); txt('LEFT', 640, 285, 64, '#2a7ad0', FONT, 'center', 340, 70); txt('перестройтесь', 640, 375, 46, '#c0283a', FONT, 'center', 340, 56); },
  stop: u => { sign('stop', 240, 250, 1.6); txt('COME TO A', 610, 160, 46, INK, FONT, 'center', 400, 56); txt('COMPLETE', 610, 230, 62, '#d8323c', FONT, 'center', 400, 70); txt('STOP', 610, 300, 62, '#d8323c', FONT, 'center', 400, 70); txt('полная остановка', 610, 385, 40, INK, FONT, 'center', 400, 50); },
  cutlets: u => { container(430, 330, 2.4, true, true); for (let i = 0; i < 5; i++) { const ph = (u * 2 + i * .2) % 1; g.save(); g.globalAlpha *= 1 - ph; heart(250 + i * 90, 210 - ph * 120, 22); g.restore(); } txt('домашние!', 430, 440, 46, '#d63a8a', HW, 'center', 700, 56); },
  failed: u => { board(300, 270, 1.15); stampMark(560, 290, 'FAILED', '#d8323c', u - .05, -.18); if (u > .3) txt('не сдали', 560, 420, 48, INK, FONT, 'center', 400, 56); },
  nextweek: u => { rr(110, 80, 280, 330, 24, '#ffffff', 7); rr(110, 80, 280, 90, 24, '#d8323c', 7); txt('NEXT WEEK', 250, 126, 34, '#ffffff', FONT, 'center', 240, 56); txt('TUE', 250, 250, 96, INK, FONT, 'center', 240, 110); txt('Zhanna', 250, 350, 40, '#d63a8a', HW, 'center', 240, 50);
    const n = Math.min(6, 1 + Math.floor(u * 9)); for (let i = 0; i < n; i++) container(610 + (i % 2) * 90 - (i >= 4 ? 45 : 0), 420 - Math.floor(i / 2) * 70, 1.05, false, false); if (u > .6) container(625, 420 - 3 * 70 + 10, 1.05, true, true); },
  passed: u => { board(300, 270, 1.15); if (u > 0) { const k = ease(u / .15); ln([[460, 290], [460 + 230 * k, 290]], 0); } stampMark(560, 230, 'FAILED', '#d8323c', 1, -.18); if (u > .12) ln([[420, 270], [700, 190]], 14, INK); stampMark(580, 370, 'PASSED', '#2f9a5a', u - .2, .06); },
  license: u => { g.save(); g.translate(480, 270); g.rotate(-.05); rr(-330, -170, 660, 340, 30, '#fffaf0', 9); rr(-330, -170, 660, 80, 30, '#2a7ad0', 9); txt('DRIVER LICENSE', 0, -130, 48, '#ffffff', FONT, 'center', 600, 60);
    rr(-300, -66, 190, 210, 14, '#ffe0ee', 6); ell(-205, 0, 84, 70, '#f3d27a', 6); ell(-205, 30, 46, 52, '#f4c8a8', 5); ell(-205, -18, 60, 26, '#f3d27a', 0); q2([-224, 52], [-205, 64], [-186, 52]); star(-150, 110, 18, '#f2c820', 4);
    txt('ZHANNA', 110, -52, 60, INK, FONT, 'center', 390, 64); txt('BRIGHTON BEACH', 110, 0, 34, '#7a808c', FONT, 'center', 390, 40); g.restore(); stampMark(580, 370, 'PASSED', '#2f9a5a', 1, .06); },
};
function q2(a, c, b) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = '#d02a5a'; g.lineWidth = 7; g.lineCap = 'round'; g.stroke(); }
let curCam = null;
function headScreen(who) { const c = curCam, wx = who === 'z' ? ZH.x + 70 : EX.x + 30; return [540 + (wx - c.x) * c.z, 960 + (790 - c.y) * c.z]; }
function panel(id, u, t, a0, b0, thought, m) { const ui = m === 'cutin' ? 1 : P01(t, a0, .45), uo = m === 'cutout' ? 0 : P01(t, b0 - .3, .3), sp = m === 'cutin' ? 1 : spr(ui, 6, 10);
  const k = clamp(ui * 5) * (1 - ei(clamp((uo - .35) / .65))); if (k <= 0) return;
  const scl = (.62 + .38 * sp) * (uo < .35 ? 1 + .05 * Math.sin(Math.PI * uo / .35) : 1 - .4 * ei((uo - .35) / .65)), rot = (1 - sp) * -.08;   // spring in with overshoot, anticipation (grow) then out
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) { const [hx, top] = headScreen(thought); const bx = clamp(hx, 200, 880); ell(bx + 10, top - 26, 14, 14, '#fffaf0', 6); ell(lerp(bx, 540, .3) + 20, (top + PY + PH) / 2 - 8, 22, 22, '#fffaf0', 6); }
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u); g.restore();
  g = prev; g.save(); g.globalAlpha = k; g.translate(540, PY + PH / 2); g.rotate(rot); g.scale(scl, scl); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const P3SPLIT = BY.p3.at + (BY.p3.end - BY.p3.at) * .4;
const PANELS = TL.PANELS;   // from prep.py (card SFX use the same times)
function panels(t) { for (const [id, a, b, th, m] of PANELS) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b, th, m); }

// ---------- shots ----------
const CAM = {TWO: [.82, 555, 1000], ZM: [1.25, 790, 990], E_UP: [1.7, 60, 1060], Z_UP: [1.7, 990, 1060], ZP: [1.25, 790, 1000]};
const SH = [[0, 'TWO'], [BY.z1.at - .05, 'ZM'], [BY.e2.at - .1, 'E_UP'], [BY.z2.at - .1, 'PSEAT'], [BY.e3.at - .1, 'E_UP'], [BY.z3.at - .1, 'TWO'], [BY.e4.at - .1, 'E_UP'], [BY.z4.at - .1, 'Z_UP'], [BY.e5.at - .1, 'TWO'],
  [BY.e7.at - .1, 'E_UP'], [BY.z7.at - .1, 'Z_UP'], [BY.e8.at - .1, 'TWO'], [BY.z8.at - .1, 'Z_UP'], [BY.p2.at - .1, 'PSEAT'], [BY.e9.at - .1, 'E_UP'], [BY.z9.at - .1, 'TOP'], [BY.z10.at - .1, 'TWO'],
  [BY.e10.at - .1, 'E_UP'], [BY.z11.at - .1, 'TWO'], [BY.e11.at - .1, 'E_UP'], [BY.z12.at - .1, 'Z_UP'], [BY.p3.at - .1, 'PSEAT'], [P3SPLIT, 'E_UP'], [BY.e12.at - .1, 'TWO'], [BY.z13.at - .1, 'ZP'],
  [BY.p4.at - .1, 'PSEAT'], [TL.END, 'END']].map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
const SUBJ = {TWO: 'EPZ', ZM: 'PZ', E_UP: 'E', Z_UP: 'Z', ZP: 'PZ', END: 'EPZ'};
const SPECIAL = new Set(['PSEAT', 'TOP']);
let SOLVED = null; try { SOLVED = JSON.parse(fs.readFileSync(__dirname + '/cams.json', 'utf8')); } catch (e) {}
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' || SPECIAL.has(sh.k) ? 'TWO' : sh.k; let [z, x, y] = CAM[k]; if (SOLVED && SOLVED[sh.i]) [z, x] = SOLVED[sh.i]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  const push = sh.i % 3 === 2 ? 0 : .02 * ease(u); let punch = sh.at > 0 && sh.k !== 'END' ? .015 * (1 - ease((t - sh.at) / .3)) : 0, sx = 0, sy = 0;
  for (const [t0, kk] of TL.PUNCH) { const v = t - t0; if (v >= 0 && v < .7) { punch += .07 * kk * Math.exp(-7 * v); sx += 9 * kk * Math.exp(-8 * v) * Math.sin(v * 64 + t0); sy += 7 * kk * Math.exp(-8 * v) * Math.cos(v * 57 + t0); } }
  let jump = 0; if (JUMPABLE.has(sh.k) && sh.end - sh.at > 4) for (const c of FLAT) if (c.a > sh.at + 1.8 && c.a < sh.end - 1.2 && c.a <= t) jump++;   // jump cut on caption-chunk changes
  const jz = jump % 2 ? .94 : 1, z1 = z * (1 + push + punch) * jz; return {z: z1, x: x + sx / z1, y: y + (jz < 1 ? 30 : 0) + sy / z1, k, sh}; }
const JUMPABLE = new Set(['TWO', 'ZP']);

// ---------- captions ----------
const GLOSS = {z1: [['Чекаю', 'check — проверяю'], ['Лукаю', 'look — выгляжу'], ['ю ноу', 'you know — понимаешь']], z9: [['Паркуюсь', 'park — парковаться']], z3: [['Райт', 'направо / правильно', 'RIGHT', ' = ']],
  z4: [['Йилд', 'yield — уступи дорогу'], ['саджешн', 'suggestion — предложение'], ['консидернула', 'consider — рассмотрела']], z7: [['Мёрджусь', 'merge — перестраиваюсь'], ['сигнал', 'signal — поворотник']],
  z11: [['Брайб', 'bribe — взятка']], z12: [['Фейлд', 'failed — не сдала'], ['фейлишь', 'fail — заваливать']], p2: [['Full stop', 'точка (UK)', 'full stop', ' — ']]};
const SPL = {
  e1: [['Check your mirrors.', 'Проверьте зеркала.']],
  e2: [["Ma'am… who is that in the back seat?", 'Мэм… а кто это на заднем сиденье?']],
  e3: [['Make a right turn.', 'Поверните направо.']],
  e4: [["Yield! Ma'am, yield!", 'Уступите дорогу! Мэм, уступите!']],
  e5: [['The speed limit is thirty!', 'Ограничение скорости — тридцать!']],
  e7: [['Merge left. Use your signal.', 'Перестройтесь влево. Включите поворотник.']],
  e8: [['That was a stop sign!', 'Там был знак «стоп»!'], ['You have to come to a complete stop!', 'Нужно полностью остановиться!']],
  p2: [['Full stop.', 'Точка.']],
  e9: [['Parallel park, please.', 'Припаркуйтесь параллельно, пожалуйста.']],
  e10: [["Ma'am, are you trying to bribe me?!", 'Мэм, вы что, пытаетесь меня подкупить?!']],
  e11: [['Pull over. You failed.', 'Остановитесь у обочины. Вы не сдали.'], ['Please… just let me out.', 'Пожалуйста… просто выпустите меня.']],
  p3: [['Sir, if you fail her…', 'Сэр, если вы её завалите…'], ["she'll be back next week.", 'она вернётся на следующей неделе.'], ['With more cutlets.', 'С новыми котлетами.']],
  e12: [['…You passed!', '…Вы сдали!'], ['Keep the cutlets! Never come back!', 'Котлеты оставьте себе! Не возвращайтесь!']],
};
function chunks(l) { if (SPL[l.id]) { const P = SPL[l.id], n = P.reduce((a, c) => a + c[0].length, 0); let acc = 0; return P.map(([s, tr]) => { const a = l.at + (l.end - l.at) * acc / n; acc += s.length; return {s, tr, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
  const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (l.end - l.at) < 1.2) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
function wordTimes(l, ch) { const W2 = l.words || []; let wi = 0;   // map caption tokens to whisper words (punctuation-only tokens share the previous time)
  ch.forEach((c, j) => { c.wt = c.s.split(' ').map(tok => { const real = /[\p{L}\d]/u.test(tok); const v = real && W2.length ? W2[Math.min(wi, W2.length - 1)] : null; if (real) wi++; return v; });
    let last = l.at; c.wt = c.wt.map(v => (last = v ?? last)); if (j > 0 && W2.length) c.a = Math.max(l.at, c.wt[0] - .04); });
  ch.forEach((c, j) => { c.b = j < ch.length - 1 ? ch[j + 1].a : l.end; }); return ch; }
const CH = L.map(l => ({l, ch: wordTimes(l, chunks(l))})), FLAT = [].concat(...CH.map(x => x.ch));
FLAT.forEach((c, i) => { const nx = FLAT[i + 1], lim = nx ? nx.a - .05 : c.b + 1.2; c.hold = Math.max(c.b, Math.min(c.a + 1.2, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .25, lim)); });
// chips: per caption chunk; a chunk with several glossary words splits its time (each >= 1.2 s, else only the first)
const CHIPS = []; for (const c of FLAT) { if (c.who !== 'z' && c.id !== 'p2') continue; const hits = (GLOSS[c.id] || []).filter(([w]) => c.s.toLowerCase().includes(w.toLowerCase()));
  for (const [w, tr, show, sep] of hits) { const toks = c.s.split(' '), ti = toks.findIndex(x => x.toLowerCase().includes(w.toLowerCase().split(' ')[0])), a = Math.max((ti >= 0 && c.wt ? c.wt[ti] : c.a) - .1, c.a - .05); const nx = L.find(l => l.at > c.b + .01 && l.id !== c.id), lim = nx ? nx.at - .05 : 1e9; CHIPS.push({a, b: Math.min(a + 1.7, Math.max(a + 1.2, lim)), w: show || w, tr, sep: sep || ' — '}); } }
CHIPS.sort((p, q) => p.a - q.a); { const slotEnd = [-1, -1]; for (const q of CHIPS) { q.slot = slotEnd[0] <= q.a ? 0 : 1; slotEnd[q.slot] = q.b + .05; } }
const EN = /^(чекаю|лукаю|ю|ноу|райт|йилд|саджешн|консидернула|мёрджусь|паркуюсь|брайб|фейлд|фейлишь)$/i;
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
function britChip(t) { const a = BY.p3.at, b = BY.p3.at + 2.6; if (t < a || t >= b) return; const k = ease((t - a) / .15) * (1 - ease((t - b + .15) / .15));
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); g.font = `42px ${FONT}`; const tw = g.measureText('British accent').width, w = tw + 130;
  rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5); flag(-w / 2 + 22, -24, 60, 40); txt('British accent', -w / 2 + 100, -3, 42, '#1f3a8a', FONT, 'left', w - 120, 50); g.restore(); }
function chip(t) { for (const c of CHIPS) if (t >= c.a && t < c.b) chip1(t, c); }
function chip1(t, c) {
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = c.sep + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 - c.slot * 86 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = 2.7;
function hook(t) { if (t > HOOK_END + .3) return; const a = clamp(t / .06) * (1 - ease((t - HOOK_END) / .3)), st = 1 + .6 * (1 - ex(P01(t, 0, .3))); g.save(); g.globalAlpha = a; g.translate(540, 330); g.rotate(-.02 - .06 * (1 - ex(P01(t, 0, .3)))); g.scale(st, st);
  rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('ЖАННА', 0, -92, 92, INK, FONT, 'center', 840, 100); txt('СДАЁТ НА ПРАВА', 0, 4, 86, '#d63a8a', FONT, 'center', 840, 96); txt('В АМЕРИКЕ', 0, 98, 80, INK, FONT, 'center', 840, 90); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 170, 960, 1540, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 270, 64, '#d63a8a', FONT, 'center', 880, 80);
  const R = [['CHECK YOUR MIRRORS', 'проверьте зеркала'], ['MAKE A RIGHT TURN', 'поверните направо'], ['YIELD', 'уступите дорогу'], ['THE SPEED LIMIT IS 30', 'ограничение скорости — 30'],
    ['MERGE LEFT', 'перестройтесь влево'], ['COME TO A COMPLETE STOP', 'полностью остановитесь'], ['PULL OVER', 'остановитесь у обочины']];
  R.forEach(([en, ru], i) => { const y = 390 + i * 126; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a', FONT, 'center', 880, 60); txt(ru, 540, y + 50, 38, '#c0283a', FONT, 'center', 880, 46); });
  txt('А вы с какого раза', 540, 1300, 52, '#d63a8a', FONT, 'center', 880, 60); txt('сдали на права?', 540, 1366, 52, '#d63a8a', FONT, 'center', 880, 60); txt('1 — с первого    2 — со второго', 540, 1450, 44, INK, FONT, 'center', 880, 56); txt('3 — с третьего и дальше', 540, 1512, 44, INK, FONT, 'center', 880, 56); txt('Пишите цифру!', 540, 1600, 50, '#d63a8a', FONT, 'center', 880, 60); g.restore(); }

let COVER = false;
function scene(t, c) { NOW = t; const view = c.sh.k; curCam = c; g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (view === 'PSEAT') backSeatBg(t); else if (view === 'TOP') topBg(t); else { g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); g.translate(525, 1000); g.rotate(rollAt(t)); g.translate(-525, -1000); street(t); rearInterior(); }
  g = G0; g.save(); g.filter = `blur(${(view === 'TOP' ? 4 : 2.6 * c.z).toFixed(1)}px) saturate(0.7) brightness(1.03)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  if (view === 'PSEAT') backSeat(t); else if (view === 'TOP') topView(t);
  else { g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); g.translate(525, 1000); g.rotate(rollAt(t)); g.translate(-525, -1000);
    petrovich(t); seatBacks(); eBody(t); zBody(t); eHands(t); dashboard(t); dashProps(t); zHands(t); mirror(t); frameCar(); g.restore(); }
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (view !== 'END' && !COVER) panels(t); }
// whip-pan: a real pan — the outgoing shot slides out left while the incoming one follows right behind it (no empty frame), ease-in-out over .65 s; 6 sub-frames of motion blur, speed lines
const WOUT = .3, WIN = .35, whipU = t => { for (const w of TL.WHIP) if (t >= w - WOUT && t < w + WIN) return {w, p: eio(P01(t, w - WOUT, WOUT + WIN)) * W}; return null; };
const accCv = createCanvas(W, H), GACC = accCv.getContext('2d'), frzCv = createCanvas(W, H), GFRZ = frzCv.getContext('2d'), shotCv = createCanvas(W, H), GSH = shotCv.getContext('2d');
function whipFrame(t) { GACC.setTransform(1, 0, 0, 1, 0, 0); GACC.fillStyle = '#e46aa0'; GACC.fillRect(0, 0, W, H); const N = 6;
  for (let k = 0; k < N; k++) { const ts = t + (k / (N - 1) - .5) / 30 * .9, q = whipU(ts) || whipU(t); GSH.setTransform(1, 0, 0, 1, 0, 0); GSH.fillStyle = '#e46aa0'; GSH.fillRect(0, 0, W, H);
    scene(ts, camAt(q.w - .001)); GSH.drawImage(cv, -q.p, 0); scene(ts, camAt(q.w + .001)); GSH.drawImage(cv, W - q.p, 0);
    GACC.globalAlpha = 1 / (k + 1); GACC.drawImage(shotCv, 0, 0); } GACC.globalAlpha = 1;
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(accCv, 0, 0);
  for (let i = 0; i < 12; i++) { const yy = 140 + i * 140 + hash(i) * 40, len = 200 + hash(i + 3) * 300, x0 = hash(i + 7) * W; ln([[x0, yy], [x0 + len, yy]], 8, 'rgba(255,255,255,.45)'); } }
function freezeFrame(t) { const f0 = TL.FREEZE[0], u = (t - f0) / TL.FREEZE[1]; scene(f0, camAt(f0)); GFRZ.setTransform(1, 0, 0, 1, 0, 0); GFRZ.clearRect(0, 0, W, H); GFRZ.drawImage(cv, 0, 0);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); const z = 1 + .05 * eio(u); g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); g.filter = 'grayscale(1) contrast(1.3) brightness(1.05)'; g.drawImage(frzCv, 0, 0); g.filter = 'none';
  const pr = ex(P01(t, f0 + .15, .5)); if (pr > 0) { g.beginPath(); for (let i = 0; i <= 64 * pr; i++) { const a = -2.2 + i / 64 * 6.6, r = 1 + .04 * Math.sin(i * .7), px = 700 + Math.cos(a) * 330 * r, py = 1150 + Math.sin(a) * 170 * r; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.strokeStyle = '#e0262f'; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(); }   // red pencil around the car
  g.restore(); const lk = spr(P01(t, f0 + .25, .4), 6, 10); if (lk > 0) { g.save(); g.translate(540, 560); g.rotate(-.04 + (1 - lk) * -.1); g.scale(lk, lk); rr(-360, -56, 720, 112, 10, '#e0262f', 6); txt('1 МАШИНА = 2 МЕСТА', 0, 2, 62, '#ffffff', HW, 'center', 680, 90); g.restore(); } }
function frame(t) { NOW = t;
  const c = COVER ? {z: .83, x: 572, y: 1000, k: 'TWO', sh: {k: 'TWO'}} : camAt(t), view = c.sh.k;
  if (!COVER && whipU(t)) whipFrame(t); else if (!COVER && t >= TL.FREEZE[0] && t < TL.FREEZE[0] + TL.FREEZE[1]) freezeFrame(t); else scene(t, c);
  curCam = c; g = G0; g.setTransform(1, 0, 0, 1, 0, 0);
  if (process.env.NOCAP) return;
  hook(t); if (view === 'END') endCard(t); else { chip(t); britChip(t); caption(t); }
}
const [mode, arg, outName] = process.argv.slice(2);
process.chdir(__dirname);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { // NOCAP still shifted down 180 px, top strip filled, cream plate 900x330 (text inside the 3:4 crop)
  const t = +(arg || BY.z1.at + 2.0); process.env.NOCAP = 1; COVER = true; frame(t); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 180); g.save(); g.filter = 'blur(8px)'; g.drawImage(src, 0, 0, W, 8, 0, 0, W, 184); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 495); g.rotate(-.02); rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('ЖАННА', 0, -92, 92, INK, FONT, 'center', 840, 100); txt('СДАЁТ', 0, 4, 100, '#d63a8a', FONT, 'center', 840, 110); txt('НА ПРАВА', 0, 98, 86, INK, FONT, 'center', 840, 96); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/zhanna_driving.srt', out); }
else if (mode === 'info') { for (const c of FLAT) console.log(c.id, c.a.toFixed(2), c.hold.toFixed(2), c.s, '|', c.tr || ''); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w); for (const [id, a, b] of PANELS) console.log('CARD', id, a.toFixed(2), (b - a).toFixed(2)); for (const s of SH) console.log('SH', s.at.toFixed(2), s.k); }
else if (mode === 'frame') { // measure each character's horizontal extent per shot, then solve the camera
  const SC = .25, OX = 600, mc = createCanvas(Math.round(2600 * SC), Math.round(2000 * SC)), mg = mc.getContext('2d');
  const ext = (fn, t) => { NOW = t; g = mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, mc.width, mc.height); g.setTransform(SC, 0, 0, SC, OX * SC, 0); fn(t); g = G0;
    const d = mg.getImageData(0, 0, mc.width, mc.height).data, w = mc.width; let a = 1e9, b = -1e9; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) { const x = ((i - 3) / 4) % w; if (x < a) a = x; if (x > b) b = x; } return a > b ? null : [a / SC - OX, (b + 1) / SC - OX]; };
  const CHR = {Z: t => { zBody(t); zHands(t); }, P: petrovich, E: t => { eBody(t); eHands(t); }}, out = {}, M = 16;
  for (const sh of SH) { if (SPECIAL.has(sh.k)) continue; const k = sh.k === 'END' ? 'TWO' : sh.k, [z0, x0] = CAM[k], E = {};
    for (const c of 'ZPE') { let a = 1e9, b = -1e9; for (let t = sh.at; t < sh.end; t += .1) { if (c === 'E' && t >= TL.DOOR - .45) continue; if (c === 'Z') eBody(t); const e = ext(CHR[c], t); if (e) { a = Math.min(a, e[0]); b = Math.max(b, e[1]); } } E[c] = a > b ? null : [a - M, b + M]; }
    const subj = SUBJ[sh.k].split('').filter(c => E[c]); let best = null;
    const ZS = []; for (let d = 0; d <= 1.3; d += .01) { if (z0 - d >= .7) ZS.push(z0 - d); if (d && z0 + d <= 2.2) ZS.push(z0 + d); } ZS.sort((p, q) => Math.abs(p - z0) * (p > z0 ? 1.5 : 1) - Math.abs(q - z0) * (q > z0 ? 1.5 : 1));
    for (const z of ZS) { if (best) break; const wMin = 1080 / (z * 1.045), wMax = 1080 / z;
      const S = subj.map(c => E[c]), sa = Math.min(...S.map(e => e[0])), sb = Math.max(...S.map(e => e[1])); if (sb - sa > wMin) continue;
      const cands = []; for (let x = sb - wMin / 2; x <= sa + wMin / 2; x += 2) cands.push(x); cands.sort((p, q) => Math.abs(p - x0) - Math.abs(q - x0));
      for (const x of cands) { let ok = true; for (const c of 'ZPE') { if (subj.includes(c) || !E[c]) continue; const [oa, ob] = E[c];
          const outside = (x + wMax / 2 <= oa) || (x - wMax / 2 >= ob), inside = oa >= x - wMin / 2 && ob <= x + wMin / 2; if (!outside && !inside) { ok = false; break; } }
        if (ok) { best = [+z.toFixed(3), Math.round(x)]; break; } } }
    out[sh.i] = best; console.log(sh.i, sh.k, sh.at.toFixed(2), JSON.stringify(E), '->', best, 'was', [z0, x0]); }
  fs.writeFileSync('cams.json', JSON.stringify(out)); }
else if (mode === 'textaudit') { // render sample frames and report every object label: fitted size vs its box
  const seen = new Map(); for (let t = 0; t < TL.TOTAL; t += .25) { TXTLOG.length = 0; frame(t); for (const [s0, mw, w, st] of TXTLOG) { const k = s0.replace(/\d+!$/, 'N!'); if (!seen.has(k) || seen.get(k)[1] < w) seen.set(k, [mw, w, st]); } }
  let bad = 0; for (const [k, [mw, w, st]] of seen) { const ok = w <= mw + .5; if (!ok) bad++; console.log(ok ? 'OK ' : 'OVER', k.padEnd(34), 'box', Math.round(mw), 'text', Math.round(w), st); } console.log('labels', seen.size, 'overflowing', bad);
  const un = (fs.readFileSync(__filename, 'utf8').match(/txt\([^;]*?\)/g) || []).filter(c => !/,\s*'(center|left)',/.test(c) && !c.startsWith('txt(s, x')); console.log('txt calls without a box:', un.length, un.join(' | ')); }
else if (mode === 'smoothcheck') { // per-frame change of the drawn mouth opening; >15% allowed only at true onsets (opening from a nearly closed mouth)
  let n = 0, big = 0, worst = 0, dips = 0, low = 0, dur = 0;
  for (const l of L) { if (l.who === 'p') continue; const M = []; for (let t = l.at - .1; t < l.end + .3; t += 1 / FPS) M.push(T.talk(l, t).mouth); dur += l.end - l.at;
    for (let i = 1; i < M.length; i++) { const d = Math.abs(M[i] - M[i - 1]), onset = M[i - 1] < .12 && M[i] > M[i - 1]; n++; if (d > .151 && !onset) { big++; worst = Math.max(worst, d); } if (M[i] < .15) low++; }
    let hi = 0, lo = 1, down = false; for (const m of M) { if (!down) { if (m > hi) hi = m; if (hi - m >= .2) { down = true; lo = m; } } else { if (m < lo) lo = m; if (m - lo >= .2) { dips++; down = false; hi = m; } } } }
  console.log(`frames ${n}, non-onset jumps >15%: ${big} (${(100 * big / n).toFixed(1)}%), worst ${worst.toFixed(3)}, visible syllable dips/s ${(dips / dur).toFixed(2)}, near-closed ${(100 * low / n).toFixed(0)}%`); }
else if (mode === 'facecheck') { // Petrovich's face carries magenta probes; any magenta pixel in any frame = face visible
  process.env.NOCAP = 1; let bad = 0; const [step, off] = (arg || '1:0').split(':').map(Number); for (let i = off || 0; i < TL.TOTAL * FPS; i += step) { frame(i / FPS); const d = cv.data(); let n = 0; for (let j = 0; j < d.length; j += 16) if (d[j] > 230 && d[j + 1] < 40 && d[j + 2] > 230) n++; if (n) { bad++; console.log('VISIBLE', (i / FPS).toFixed(2), n); } } console.log('facecheck done, frames with face:', bad); }
