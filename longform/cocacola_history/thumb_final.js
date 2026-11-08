// FINAL YouTube thumbnail (owner's brief, Nov 2026): "9 COKES A DAY?!" — a big, shocked John Pemberton on the left with his small 1886 pharmacy
// behind him; a huge curvy Coca-Cola bottle with a red label on the right; modern bottling plants, trucks and a highway far behind.
// Drawn in code (lit, shaded, perspective). Brand: plain bold type on the label, no script logo. 1920x1080 -> 1280x720. Usage: node thumb_final.js
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const L = require('../kit/look'), P = require('../kit/props');
const { INK, CREAM, RED, YELLOW, ink, rr, ell, poly, darken, lighten } = L;
const W = 1920, H = 1080, cv = createCanvas(W, H), ctx = cv.getContext('2d');
const HZ = 640, VP = [1180, HZ]; // horizon + vanishing point
const lin = (x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rad = (x, y, r, stops) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

// ---------- sky: dusk on the left (1886), bright golden on the right (today) ----------
ctx.fillStyle = lin(0, 0, 0, HZ, [[0, '#24305E'], [0.55, '#E0704A'], [1, '#FFC27A']]); ctx.fillRect(0, 0, W, HZ);
ctx.fillStyle = rad(1450, 430, 900, [[0, 'rgba(255,236,170,0.95)'], [0.35, 'rgba(255,190,110,0.45)'], [1, 'rgba(255,160,90,0)']]); ctx.fillRect(0, 0, W, HZ);
// god rays from behind the bottle
ctx.save(); ctx.translate(1450, 420); ctx.globalCompositeOperation = 'lighter';
for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); poly(ctx, [[0, 0], [1700, -70], [1700, 70]]); ctx.fillStyle = `rgba(255,230,170,${i % 2 ? 0.07 : 0.0})`; ctx.fill(); }
ctx.restore();
// soft clouds
for (const [x, y, s, a] of [[260, 150, 1.6, 0.35], [700, 90, 1.1, 0.3], [1650, 120, 1.3, 0.5], [1100, 230, 0.9, 0.35]]) { ctx.save(); ctx.globalAlpha = a; L.cloud(ctx, x, y, s, '#FFE9CF'); ctx.restore(); }

// ---------- far background: modern bottling plants, warehouses, smokestacks (right half) ----------
function plantBlock(x, w, h, col, roof) { // building with windows, lit from the right
  rr(ctx, x, HZ - h, w, h, 3); ink(ctx, col, 3); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x, HZ - h, w * 0.18, h);
  ctx.fillStyle = roof; ctx.fillRect(x - 4, HZ - h - 8, w + 8, 10);
  for (let r = 0; r < Math.floor(h / 26) - 1; r++) for (let c = 0; c < Math.floor(w / 22); c++) { ctx.fillStyle = (r + c) % 5 ? 'rgba(255,240,200,0.75)' : 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 8 + c * 22, HZ - h + 14 + r * 26, 12, 12); } }
ctx.save(); ctx.globalAlpha = 0.92;
plantBlock(980, 150, 120, '#B8A99A', '#8A3A32'); plantBlock(1140, 220, 170, '#C9BBA9', '#B23A2E'); plantBlock(1370, 260, 140, '#BFAF9C', '#9A2E26');
plantBlock(1640, 180, 190, '#CDBFAE', '#B23A2E'); plantBlock(1830, 140, 120, '#B8A99A', '#8A3A32');
for (const [x, h] of [[1200, 300], [1260, 260], [1700, 320], [1760, 280]]) { rr(ctx, x, HZ - h, 26, h, 4); ink(ctx, '#A8968A', 3); rr(ctx, x - 3, HZ - h, 32, 14, 3); ink(ctx, '#B23A2E', 3);
  for (let k = 0; k < 4; k++) { ctx.save(); ctx.globalAlpha = 0.45 - k * 0.09; L.cloud(ctx, x + 13 + k * 38, HZ - h - 20 - k * 34, 0.35 + k * 0.18, '#F4E6D6'); ctx.restore(); } }
// silo tanks
for (const x of [1560, 1600]) { rr(ctx, x, HZ - 150, 38, 150, 18); ink(ctx, '#D8D2C8', 3); }
ctx.restore();
// haze over the far plants
ctx.fillStyle = lin(0, HZ - 340, 0, HZ, [[0, 'rgba(255,200,140,0)'], [1, 'rgba(255,200,140,0.35)']]); ctx.fillRect(900, HZ - 340, 1020, 340);

// ---------- ground: old dirt street (left) -> modern highway in perspective (right) ----------
ctx.fillStyle = lin(0, HZ, 0, H, [[0, '#9C7A55'], [1, '#6E5136']]); ctx.fillRect(0, HZ, W, H - HZ);
// highway wedge from the vanishing point to the bottom right
poly(ctx, [[VP[0] - 20, HZ], [VP[0] + 30, HZ], [W + 400, H], [980, H]]); ctx.fillStyle = lin(0, HZ, 0, H, [[0, '#7A7C82'], [1, '#4A4C52']]); ctx.fill();
ctx.save(); poly(ctx, [[VP[0] - 20, HZ], [VP[0] + 30, HZ], [W + 400, H], [980, H]]); ctx.clip();
for (let i = 0; i < 14; i++) { const u0 = Math.pow(i / 14, 2), u1 = Math.pow((i + 0.5) / 14, 2); const p = u => [VP[0] + 5 + (1600 - VP[0]) * u, HZ + (H - HZ) * u];
  const [a, b] = p(u0), [c, d] = p(u1); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.lineWidth = 2 + u1 * 16; ctx.strokeStyle = '#F2D27A'; ctx.stroke(); }
ctx.restore();
// trucks on the highway, scaled by distance
function truckAt(u, flip) { const x = VP[0] + (flip ? -0.15 : 0.55) * 900 * u + 10, y = HZ + (H - HZ) * u, s = 0.12 + u * 0.75; P.truck(ctx, x, y, s, { era: 2020, text: flip ? 'COCA-COLA' : '', flip: !flip, col: RED, box: '#F4EFE6' }); }
truckAt(0.1, false); truckAt(0.22, true); truckAt(0.38, false);

// ---------- 1886 pharmacy behind Pemberton (small, warm, lit windows at dusk) ----------
P.storefront(ctx, 520, 700, { w: 420, h: 400, col: '#A85E40', sign: 'PHARMACY', signCol: '#3A1E14', awning: [RED, CREAM], night: true, upper: 2,
  display: (g, dx, dy, dw, dh) => { for (let i = 0; i < 3; i++) P.jug(g, dx + 50 + i * 70, dy + dh - 8, 0.32); } });
L.glow(ctx, 640, 560, 260, '#FFC873', 0.45);
P.lamppost(ctx, 980, 712, 0.75, true);
// wooden boardwalk under the pharmacy
rr(ctx, 480, 696, 560, 24, 4); ink(ctx, '#7A5232', 4);

// ---------- the giant bottle (lit glass, condensation, red label) ----------
const BX = 1460, BY = 1050, BS = 4.25;
ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ell(ctx, BX - 30, BY, 300, 36); ctx.fill(); ctx.restore();
L.glow(ctx, BX, 560, 520, '#FFE6A8', 0.5);
P.bottle(ctx, BX, BY, BS, { kind: 'contour', label: '', glass: 'rgba(140,200,180,0.16)' });
// glass highlights + rim light + droplets (bottle coordinates: x * BS, y * BS from bottom)
ctx.save(); ctx.translate(BX, BY); ctx.scale(BS, BS);
ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFFFFF'; rr(ctx, -24, -205, 7, 150, 4); ctx.fill(); ctx.globalAlpha = 0.35; rr(ctx, -13, -200, 3, 120, 2); ctx.fill();
ctx.globalAlpha = 0.5; ctx.strokeStyle = '#FFE7B0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(29, -10); ctx.bezierCurveTo(35, -40, 24, -55, 27, -75); ctx.bezierCurveTo(30, -100, 40, -120, 34, -140); ctx.stroke();
ctx.globalAlpha = 0.8; for (let i = 0; i < 26; i++) { const x = -26 + L.hash(i * 3.1) * 52, y = -20 - L.hash(i * 7.3) * 170, r = 0.8 + L.hash(i * 1.9) * 1.6; ell(ctx, x, y, r, r * 1.3); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill(); }
ctx.restore();
// red label with plain bold type (no logo copy)
ctx.save(); ctx.translate(BX, BY - 112 * BS); ctx.rotate(-0.02);
rr(ctx, -170, -64, 340, 128, 16); ink(ctx, '#E1251B', 7); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-170, 20, 340, 44);
ctx.beginPath(); ctx.moveTo(-150, 40); ctx.bezierCurveTo(-60, 18, 60, 58, 150, 30); ctx.lineWidth = 7; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
L.fitText(ctx, 'COCA-COLA', 0, -6, 66, '#FFFFFF', 300); ctx.restore();
P.sparkles(ctx, BX, 300, 260, 0.3, 8, '#FFF6D8');

// ---------- John Pemberton: big, shocked, lit from the right ----------
function pemberton(cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const skin = '#EDBE98', skinSh = '#C9906A', beard = '#D6D0C6', beardSh = '#A9A298', coat = '#2B2624', shirt = '#F4EFE4';
  // coat + shoulders (bust)
  ctx.beginPath(); ctx.moveTo(-330, 560); ctx.bezierCurveTo(-320, 330, -190, 250, 0, 245); ctx.bezierCurveTo(190, 250, 320, 330, 330, 560); ctx.closePath(); ink(ctx, coat, 8);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,200,130,0.28)'; ctx.fillRect(120, 200, 260, 400); ctx.restore();
  poly(ctx, [[-70, 250], [70, 250], [40, 420], [0, 470], [-40, 420]]); ink(ctx, shirt, 6); // shirt V
  poly(ctx, [[-60, 262], [0, 300], [60, 262], [52, 300], [0, 318], [-52, 300]]); ink(ctx, '#1C1A1F', 5); // bow tie
  // lapels
  poly(ctx, [[-70, 250], [-150, 300], [-60, 470]]); ink(ctx, darken(coat, 0.8), 5); poly(ctx, [[70, 250], [150, 300], [60, 470]]); ink(ctx, lighten(coat, 0.12), 5);
  // ears
  for (const sx of [-1, 1]) { ell(ctx, sx * 168, -10, 30, 44); ink(ctx, sx > 0 ? skin : skinSh, 6); }
  // head
  const head = () => { ctx.beginPath(); ctx.moveTo(-165, -40); ctx.bezierCurveTo(-170, -230, 170, -230, 165, -40); ctx.bezierCurveTo(168, 120, -168, 120, -165, -40); ctx.closePath(); };
  head(); ink(ctx, skin, 8);
  ctx.save(); head(); ctx.clip(); ctx.fillStyle = 'rgba(160,90,60,0.22)'; ctx.fillRect(-200, -260, 150, 420); ctx.fillStyle = 'rgba(255,220,170,0.35)'; ctx.fillRect(110, -260, 80, 420); ctx.restore();
  // hair (grey, side-parted, high forehead)
  ctx.beginPath(); ctx.moveTo(-170, -40); ctx.bezierCurveTo(-185, -170, -120, -215, -30, -205); ctx.bezierCurveTo(-90, -185, -130, -150, -140, -60); ctx.closePath(); ink(ctx, beard, 6);
  ctx.beginPath(); ctx.moveTo(170, -40); ctx.bezierCurveTo(185, -170, 110, -220, -10, -208); ctx.bezierCurveTo(70, -190, 130, -150, 140, -60); ctx.closePath(); ink(ctx, beard, 6);
  // forehead wrinkles (surprise)
  ctx.lineWidth = 4; ctx.strokeStyle = skinSh; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-70 + i * 6, -160 + i * 16); ctx.quadraticCurveTo(0, -172 + i * 16, 70 - i * 6, -160 + i * 16); ctx.stroke(); }
  // eyes: huge, shocked
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 66, -60);
    ell(ctx, 0, 0, 46, 58); ink(ctx, '#FFFFFF', 6); ctx.save(); ell(ctx, 0, 0, 46, 58); ctx.clip(); ctx.fillStyle = 'rgba(120,140,170,0.18)'; ctx.fillRect(-50, -60, 100, 22); ctx.restore();
    ctx.beginPath(); ctx.arc(10, 8, 21, 0, 6.27); ctx.fillStyle = '#5B7FA6'; ctx.fill(); ctx.beginPath(); ctx.arc(11, 9, 12, 0, 6.27); ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.arc(4, 0, 6, 0, 6.27); ctx.fillStyle = '#FFF'; ctx.fill(); ctx.beginPath(); ctx.arc(17, 16, 3, 0, 6.27); ctx.fill();
    // raised bushy brows
    ctx.beginPath(); ctx.moveTo(-50, -86); ctx.bezierCurveTo(-20, -118 - (sx > 0 ? 8 : 0), 25, -118, 52, -92); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = '#B9B2A6'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore(); }
  // nose
  ctx.beginPath(); ctx.moveTo(-6, -40); ctx.bezierCurveTo(-24, 10, -26, 30, -4, 38); ctx.bezierCurveTo(14, 42, 26, 30, 20, 20); ink(ctx, skin, 5);
  // full beard (layered, with strands and shading)
  const beardShape = () => { ctx.beginPath(); ctx.moveTo(-162, -10); ctx.bezierCurveTo(-170, 150, -110, 260, 0, 285); ctx.bezierCurveTo(110, 260, 170, 150, 162, -10); ctx.bezierCurveTo(130, 60, 70, 40, 0, 52); ctx.bezierCurveTo(-70, 40, -130, 60, -162, -10); ctx.closePath(); };
  beardShape(); ink(ctx, beard, 7);
  ctx.save(); beardShape(); ctx.clip(); ctx.fillStyle = 'rgba(120,110,100,0.25)'; ctx.fillRect(-200, -20, 140, 320); ctx.fillStyle = 'rgba(255,230,190,0.35)'; ctx.fillRect(100, -20, 80, 320);
  ctx.strokeStyle = beardSh; ctx.lineWidth = 3.5; for (let i = -7; i <= 7; i++) { ctx.beginPath(); ctx.moveTo(i * 20, 70 + Math.abs(i) * 6); ctx.bezierCurveTo(i * 22 + 6, 150, i * 18 - 4, 210, i * 12, 270); ctx.stroke(); } ctx.restore();
  // open mouth (O) inside the beard
  ell(ctx, 0, 112, 40, 52); ink(ctx, '#5A1A1A', 6); ell(ctx, 0, 140, 22, 14); ctx.fillStyle = '#C0505A'; ctx.fill();
  // moustache
  ctx.beginPath(); ctx.moveTo(0, 52); ctx.bezierCurveTo(-40, 36, -100, 50, -118, 86); ctx.bezierCurveTo(-80, 74, -40, 80, 0, 72); ctx.bezierCurveTo(40, 80, 80, 74, 118, 86); ctx.bezierCurveTo(100, 50, 40, 36, 0, 52); ctx.closePath(); ink(ctx, '#E2DCD2', 6);
  // hands raised to the cheeks (shock), lit from the right
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 205, 110); ctx.rotate(sx * 0.25);
    ctx.beginPath(); ctx.moveTo(-sx * 10, 160); ctx.lineTo(-sx * 6, 40); ink(ctx, null, 0);
    rr(ctx, -46, 60, 92, 160, 40); ink(ctx, coat, 7); // sleeve
    // open palm with four rounded fingers (spread in shock)
    ctx.beginPath(); ctx.moveTo(-46, 44); ctx.lineTo(-50, -20);
    const tips = [[-40, -88, -0.18], [-14, -104, -0.06], [12, -102, 0.06], [36, -86, 0.18]];
    for (const [tx, ty] of tips) { ctx.lineTo(tx - 11, ty + 40); ctx.arc(tx, ty, 11.5, Math.PI, 0); ctx.lineTo(tx + 11, ty + 40); }
    ctx.lineTo(48, -10); ctx.lineTo(46, 44); ctx.closePath(); ink(ctx, sx > 0 ? skin : '#E2AE88', 6);
    ctx.lineWidth = 3.5; ctx.strokeStyle = skinSh; ctx.beginPath(); ctx.moveTo(-30, 10); ctx.quadraticCurveTo(0, 22, 30, 8); ctx.stroke();
    rr(ctx, -50, 44, 100, 26, 10); ink(ctx, shirt, 5); // cuff
    ctx.restore(); }
  ctx.restore(); }
pemberton(420, 600, 1.12);
// a small glass of the drink on the counter edge in front of him (scale of the beginning)
P.glassCup(ctx, 760, 1060, 1.0, { fill: 0.85, fizz: 1 });

// ---------- headline ----------
ctx.save(); ctx.translate(560, 150); ctx.rotate(-0.035);
ctx.save(); ctx.translate(10, 12); ctx.globalAlpha = 0.35; rr(ctx, -520, -110, 1040, 210, 26); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
rr(ctx, -520, -110, 1040, 210, 26); ink(ctx, YELLOW, 9);
L.fitText(ctx, '9 COKES A DAY?!', 0, 0, 158, INK, 960);
ctx.restore();

L.finish(ctx, 'pop', { vignette: 0.3, grain: 0.07 });
const out = createCanvas(1280, 720); out.getContext('2d').drawImage(cv, 0, 0, 1280, 720);
fs.writeFileSync(`${__dirname}/how_coca_cola_took_over_the_world_thumbnail_final.png`, out.toBuffer('image/png')); console.log('final thumb ok');
