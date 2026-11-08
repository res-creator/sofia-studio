// Parallax sets, batch 2: S2 Kalmar · S3 New York · S4 Stockholm stadium · S7 government hall · S8 Match Palace (court + office) · S9 penthouse · S10 newsstand / crash street.
// Same contract as sets.js: set(ctx, g, o) → one frame; o.cam keys, o.k Kreuger state (+ kx, ky, ks, kz).
const P = require('./par.js'); const K = require('./kreuger.js');
const { W, H, layer, camAt, fillShade, rect, poly, blob, sky, beams, dust, smoke, rain, glow, grade, vignette, grain, hash, clamp, lerp, ss, back } = P;
const LINE = 'rgba(27,20,16,0.5)';
const putK = (ctx, cam, o, g, def) => { if (!o.k) return; const s = o.ks ?? def[2], st = Object.assign({ legs: 'stand' }, o.k), y = o.ky ?? (st.legs ? (def[1] - 648 * s) : def[1]);
  layer(ctx, cam, o.kz ?? def[3] ?? 1.0, x => K.kreuger(x, o.kx ?? def[0], y, s, st, g), { dof: 7 }); };
// a faceless secondary figure (ministers, bankers, accountants, crowds): hat optional, simple suit; back = seen from behind
function person(x, px, py, s, col = '#2c2f38', o = {}) { x.save(); x.translate(px, py); x.scale(s, s); const sway = o.sway || 0;
  fillShade(x, c => { c.beginPath(); c.moveTo(-58, 40); c.bezierCurveTo(-62, 120, -52, 220, -50, 300); c.lineTo(50, 300); c.bezierCurveTo(52, 220, 62, 120, 58, 40); c.bezierCurveTo(40, 14, -40, 14, -58, 40); c.closePath(); }, col, { line: LINE, y0: 0, y1: 300 });
  if (!o.back) { fillShade(x, poly([[-18, 22], [0, 80], [18, 22]]), '#efe9dc', {}); fillShade(x, poly([[-5, 30], [5, 30], [7, 78], [0, 88], [-7, 78]]), o.tie || '#3a2228', {}); }
  fillShade(x, c => { c.beginPath(); c.ellipse(0 + sway, -18, 32, 40, 0, 0, 7); }, o.skin || '#dcb393', { line: LINE });
  fillShade(x, c => { c.beginPath(); c.ellipse(0 + sway, -40, 33, 22, 0, Math.PI, 0); }, o.hair || '#3a3028', {});
  if (o.hat) { fillShade(x, c => { c.beginPath(); c.ellipse(sway, -50, 48, 9, 0, 0, 7); }, '#1d1d22', {}); fillShade(x, rect(-28 + sway, -86, 56, 38), '#1d1d22', { line: LINE }); }
  if (!o.back) { x.fillStyle = '#2a2018'; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sway + sd * 11, -20, 3.5, 3.5 * (1 - (o.blink || 0)) + 0.3, 0, 0, 7); x.fill(); x.fillRect(sway + sd * 11 - 8, -32, 16, 3); }
    x.strokeStyle = 'rgba(90,40,30,0.8)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(sway - 9, 2); x.quadraticCurveTo(sway, 2 + (o.smile ? 5 : o.frown ? -4 : 1), sway + 9, 2); x.stroke(); x.strokeStyle = 'rgba(140,90,70,0.6)'; x.beginPath(); x.moveTo(sway, -14); x.lineTo(sway - 3, -4); x.stroke(); }
  if (o.glasses) { x.strokeStyle = '#1b1410'; x.lineWidth = 2.5; x.beginPath(); x.arc(-12 + sway, -20, 8, 0, 7); x.arc(12 + sway, -20, 8, 0, 7); x.stroke(); }
  if (o.legs) for (const sd of [-1, 1]) fillShade(x, rect(sd * 26 - 20, 296, 40, 260), col, { line: LINE });
  x.restore(); }
// ============ S2 · KALMAR, 1890s (golden morning harbour; the castle across the water; the family match factory) ============
function kalmar(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, -200, 0, 1.0, 1.4], [12, 200, -20, 1.1, 1.4]]);
  sky(ctx, [[0, '#9fc2d6'], [0.55, '#f2d5a4'], [1, '#e9b77c']]); glow(ctx, 1500, 380, 600, '255,220,160', 0.35);
  layer(ctx, cam, 6, x => { x.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 5; i++) { blob(x, ((i * 500 + g * 8) % 2600) - 300, 160 + (i % 2) * 80, 80, i * 9, 2.8); x.fill(); } });
  layer(ctx, cam, 4, x => { x.fillStyle = '#7c95a6'; x.fillRect(-500, 600, 3000, 600);   // sea
    x.fillStyle = '#8a8f93'; x.fillRect(1180, 430, 420, 180); for (const [tx, th] of [[1160, 240], [1360, 200], [1580, 250]]) { x.fillRect(tx, 610 - th, 70, th); x.beginPath(); x.moveTo(tx - 10, 610 - th); x.lineTo(tx + 35, 540 - th); x.lineTo(tx + 80, 610 - th); x.fill(); } // castle
    x.strokeStyle = 'rgba(255,240,210,0.5)'; x.lineWidth = 2; for (let i = 0; i < 30; i++) { const wy = 640 + i * 14, wx = (i * 137 + g * 30) % 2200 - 200; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + 60, wy); x.stroke(); } });
  layer(ctx, cam, 2.2, x => { const cols = ['#b5452f', '#e0b04a', '#9c3a2a', '#d9cfb5', '#c56b3c']; for (let i = 0; i < 9; i++) { const hx = -300 + i * 200, hh = 150 + hash(i) * 60;
      fillShade(x, rect(hx, 700 - hh, 180, hh + 200), cols[i % 5], { line: LINE, y0: 700 - hh, y1: 900 }); fillShade(x, poly([[hx - 10, 700 - hh], [hx + 90, 620 - hh], [hx + 190, 700 - hh]]), '#5a3a2e', { line: LINE });
      x.fillStyle = '#f5ead0'; for (let w = 0; w < 2; w++) x.fillRect(hx + 30 + w * 80, 740 - hh, 36, 44); } });
  layer(ctx, cam, 1.4, x => { fillShade(x, rect(1350, 420, 520, 380), '#8a4a34', { line: LINE, y0: 420, y1: 800 }); fillShade(x, rect(1450, 120, 60, 320), '#6a3a2a', { line: LINE }); smoke(x, 1480, 120, g, { col: '220,215,205', a: 0.4, s: 1.3 });
    x.fillStyle = '#f2e6c8'; x.font = `900 40px ${P.SERIF}`; x.fillText('TÄNDSTICKSFABRIK', 1380, 480); x.fillStyle = '#f7d48a'; for (let i = 0; i < 6; i++) x.fillRect(1380 + i * 80, 540, 46, 70); });
  putK(ctx, cam, o, g, [900, 1010, 0.8, 1.1]);
  layer(ctx, cam, 0.55, x => { fillShade(x, rect(-400, 900, 3000, 400), '#6b5640', { y0: 900, y1: 1300 }); for (let i = 0; i < 30; i++) { x.strokeStyle = 'rgba(40,30,20,0.4)'; x.beginPath(); x.moveTo(-400 + i * 100, 900); x.lineTo(-400 + i * 100, 1300); x.stroke(); }
    fillShade(x, c => { c.beginPath(); c.ellipse(200, 900, 80, 100, 0, 0, 7); }, '#7a5230', { line: LINE }); fillShade(x, rect(1700, 200, 18, 760), '#4a3322', {}); x.strokeStyle = '#3a2a1c'; x.lineWidth = 3; x.beginPath(); x.moveTo(1709, 220); x.lineTo(1300, 900); x.moveTo(1709, 220); x.lineTo(2100, 900); x.stroke(); });
  dust(ctx, g, 40); grade(ctx, 'warm', 0.9); vignette(ctx, 0.3); grain(ctx, g); }
// ============ S3 · NEW YORK, early 1900s (dusk; the Flatiron's steel frame, cranes, an elevated train) ============
function newyork(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 200, 1.0, 1.0], [10, 40, -160, 1.15, 1.0]]);
  sky(ctx, [[0, '#2c2a4a'], [0.5, '#c4644a'], [1, '#f0a85a']]);
  layer(ctx, cam, 4.5, x => { for (let i = 0; i < 26; i++) { const bx = -500 + i * 120, bh = 200 + hash(i) * 260; x.fillStyle = '#5a3a4a'; x.fillRect(bx, 760 - bh, 108, bh + 400); x.fillStyle = 'rgba(255,200,120,0.6)'; for (let w = 0; w < 12; w++) if (hash(i * 11 + w) > 0.6) x.fillRect(bx + 14 + (w % 3) * 30, 780 - bh + Math.floor(w / 3) * 50, 14, 22); } });
  layer(ctx, cam, 1.6, x => { // the Flatiron: a narrow triangular steel frame with stone cladding on the lower floors
    const fx = 760; x.fillStyle = '#c9b79a'; x.beginPath(); x.moveTo(fx, 1100); x.lineTo(fx, 520); x.lineTo(fx + 90, 470); x.lineTo(fx + 420, 520); x.lineTo(fx + 420, 1100); x.fill();
    x.strokeStyle = '#2a1e1a'; x.lineWidth = 6; for (let y = 60; y < 1100; y += 54) { x.beginPath(); x.moveTo(fx, y); x.lineTo(fx + 90, y - 30); x.lineTo(fx + 420, y); x.stroke(); }
    for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(fx + k * 52, 60 - (k < 2 ? k * 15 : 30 - (k - 2) * 4)); x.lineTo(fx + k * 52, 1100); x.stroke(); }
    x.fillStyle = '#c9b79a'; for (let y = 520; y < 1100; y += 54) for (let k = 0; k < 8; k++) if (hash(y + k) > 0.3) x.fillRect(fx + 4 + k * 52, y + 4, 44, 46);
    x.strokeStyle = '#1e1614'; x.lineWidth = 8; x.beginPath(); x.moveTo(fx + 200, 60); x.lineTo(fx + 200, -200); x.lineTo(fx + 520, -160); x.stroke(); x.lineWidth = 3; x.beginPath(); x.moveTo(fx + 500, -160); x.lineTo(fx + 500, 20 + Math.sin(g) * 20); x.stroke();
    fillShade(x, rect(fx + 470, 20 + Math.sin(g) * 20, 60, 16), '#3a2a24', {}); smoke(x, fx + 300, 60, g, { col: '240,230,220', a: 0.3 }); });
  layer(ctx, cam, 0.8, x => { // the elevated railway + street
    fillShade(x, rect(-400, 760, 3000, 50), '#2a2224', { line: LINE }); for (let i = 0; i < 16; i++) fillShade(x, rect(-380 + i * 220, 810, 26, 400), '#2a2224', {});
    const tx = ((g * 220) % 3400) - 1200; for (let c = 0; c < 3; c++) { fillShade(x, c2 => { c2.beginPath(); c2.roundRect(tx + c * 330, 650, 310, 110, 16); }, '#5a2a24', { line: LINE }); x.fillStyle = '#f7d48a'; for (let w = 0; w < 6; w++) x.fillRect(tx + c * 330 + 20 + w * 48, 676, 30, 34); }
    smoke(x, tx + 30, 640, g, { col: '220,210,200', a: 0.3 }); });
  if (o.k) { layer(ctx, cam, 0.75, x => { fillShade(x, rect(1100, 1000, 900, 40), '#2a1e1a', { line: LINE }); for (let i = 0; i < 14; i++) { x.fillStyle = '#5a4a40'; x.beginPath(); x.arc(1120 + i * 62, 1020, 5, 0, 7); x.fill(); } }); putK(ctx, cam, o, g, [1500, 1002, 0.62, 0.75]); }
  dust(ctx, g, 30); grade(ctx, 'warm', 0.6); vignette(ctx, 0.36); grain(ctx, g);
  if (o.date !== false) P.plate(ctx, 'NEW YORK · 1900s', 120, 140, clamp((g - 0.5) / 0.4), { size: 50, bar: '#e3a83a' }); }
// ============ S4 · STOCKHOLM STADIUM 1911–12 (brick towers and arches going up; scaffolding; bright day) ============
function stadium(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, -260, 0, 1.0, 1.0], [12, 260, -20, 1.08, 1.0]]);
  sky(ctx, [[0, '#7fb0d8'], [1, '#e8eef2']]);
  layer(ctx, cam, 5, x => { x.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 5; i++) { blob(x, ((i * 520 + g * 10) % 2600) - 300, 150 + (i % 2) * 60, 90, i * 5, 2.6); x.fill(); } x.fillStyle = '#7d9a7a'; blob(x, 960, 900, 900, 3, 2.2); x.fill(); });
  layer(ctx, cam, 1.5, x => { // brick stand with arches and two towers, half built, scaffolding
    fillShade(x, rect(-200, 420, 2300, 600), '#8a3f2e', { line: LINE, y0: 420, y1: 1000 });
    for (let i = 0; i < 18; i++) { const ax = -150 + i * 130; x.fillStyle = '#4a2018'; x.beginPath(); x.moveTo(ax, 900); x.lineTo(ax, 700); x.arc(ax + 45, 700, 45, Math.PI, 0); x.lineTo(ax + 90, 900); x.fill(); }
    for (const tx of [380, 1380]) { fillShade(x, rect(tx, 140, 180, 300), '#93432f', { line: LINE }); fillShade(x, poly([[tx - 20, 140], [tx + 90, 40], [tx + 200, 140]]), '#5a3a2a', { line: LINE }); }
    x.strokeStyle = '#c9a06a'; x.lineWidth = 6; for (let i = 0; i < 12; i++) { const sx = 900 + i * 60; x.beginPath(); x.moveTo(sx, 420); x.lineTo(sx, 120); x.stroke(); } for (let y = 140; y < 420; y += 70) { x.beginPath(); x.moveTo(900, y); x.lineTo(1560, y); x.stroke(); }
    for (let i = 0; i < 5; i++) person(x, 950 + i * 120, 300 + (i % 2) * 140 + Math.sin(g * 2 + i) * 3, 0.32, '#4a3f36', { hat: true }); });
  putK(ctx, cam, o, g, [700, 1000, 0.8, 1.05]);
  layer(ctx, cam, 0.6, x => { fillShade(x, rect(-400, 960, 3000, 300), '#8a7a5e', { y0: 960, y1: 1260 }); // site ground, a concrete mixer turning
    x.save(); x.translate(1600, 860); x.rotate(g * 1.5); fillShade(x, c => { c.beginPath(); c.ellipse(0, 0, 110, 80, 0, 0, 7); }, '#6a6e72', { line: LINE }); x.strokeStyle = '#3a3e42'; x.lineWidth = 6; for (let k = 0; k < 4; k++) { x.rotate(0.785); x.beginPath(); x.moveTo(-100, 0); x.lineTo(100, 0); x.stroke(); } x.restore();
    for (let i = 0; i < 4; i++) fillShade(x, rect(-200 + i * 140, 880 - (i % 2) * 40, 120, 80), '#b9b0a0', { line: LINE }); });
  dust(ctx, g, 40, '255,250,235'); vignette(ctx, 0.26); grain(ctx, g);
  if (o.date !== false) P.plate(ctx, 'STOCKHOLM · 1911–12', 120, 140, clamp((g - 0.5) / 0.4), { size: 50, bar: '#e3a83a' }); }
// ============ S7 · GOVERNMENT HALL (columns, a long green table, tall draped windows, chandelier; a contract signed) ============
function hall(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [10, 0, 30, 1.18, 1.0]]);
  sky(ctx, [[0, '#2a2018'], [1, '#4a3626']]);
  layer(ctx, cam, 2.6, x => { fillShade(x, rect(-600, -300, 3200, 1600), '#6e5a44', { y0: -300, y1: 1300 });
    for (let i = 0; i < 5; i++) { const wx = -150 + i * 520; fillShade(x, rect(wx, 60, 260, 640), '#e9d8b0', {}); fillShade(x, rect(wx - 50, 30, 80, 720), '#6a1f24', { line: LINE }); fillShade(x, rect(wx + 230, 30, 80, 720), '#6a1f24', { line: LINE }); } });
  beams(ctx, 900, 0.8);
  layer(ctx, cam, 1.7, x => { for (let i = 0; i < 6; i++) { const cx = -200 + i * 480; fillShade(x, rect(cx, -200, 110, 1300), '#d6c7a6', { line: LINE, x0: cx, x1: cx + 110, y0: 0, y1: 0, hi: 0.25, lo: 0.3 }); for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(80,60,40,0.25)'; x.beginPath(); x.moveTo(cx + 20 + k * 24, -200); x.lineTo(cx + 20 + k * 24, 1100); x.stroke(); } }
    x.strokeStyle = '#c9a54a'; x.lineWidth = 4; x.beginPath(); x.moveTo(960, -200); x.lineTo(960, 90); x.stroke(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; x.fillStyle = '#ffe2a0'; x.beginPath(); x.arc(960 + Math.cos(a) * 120, 110 + Math.sin(a) * 24, 9, 0, 7); x.fill(); } glow(x, 960, 110, 260, '255,220,150', 0.4); });
  layer(ctx, cam, 1.05, x => { person(x, 520, 470, 0.95, '#25262c', { glasses: true, hair: '#9a9088' }); person(x, 340, 500, 0.85, '#30323a', { hair: '#2a2420' }); });
  putK(ctx, cam, o, g, [1340, 440, 1.0, 1.0]); // behind the table: pass k.legs = false in shots
  layer(ctx, cam, 0.95, x => { fillShade(x, rect(80, 760, 1760, 70), '#2d5a3a', { line: LINE }); fillShade(x, rect(120, 830, 1680, 300), '#4a2f1e', { y0: 830, y1: 1130 });
    fillShade(x, poly([[860, 740], [1080, 736], [1092, 770], [850, 774]]), '#f4ecd8', { line: LINE }); if (o.seal) { x.fillStyle = '#9b1d1d'; x.beginPath(); x.arc(1050, 760, 12, 0, 7); x.fill(); } });
  dust(ctx, g, 40); grade(ctx, 'warm', 0.7); vignette(ctx, 0.4); grain(ctx, g); }
// ============ S8 · MATCH PALACE, STOCKHOLM 1928 — o.office ? his office : the courtyard with the fountain ============
function palace(ctx, g, o = {}) { const cam = camAt(g, o.cam || (o.office ? [[0, 0, -120, 1.0, 1.0], [10, 0, 60, 1.12, 1.0]] : [[0, 0, -120, 1.0, 1.5], [10, 0, 60, 1.12, 1.5]]));
  if (!o.office) { sky(ctx, [[0, '#8fb3cf'], [1, '#e6dccb']]);
    layer(ctx, cam, 2.4, x => { fillShade(x, rect(-300, 80, 2500, 1000), '#d9c9a8', { y0: 80, y1: 1080 }); for (let fl = 0; fl < 4; fl++) for (let w = 0; w < 12; w++) { fillShade(x, rect(-220 + w * 200, 170 + fl * 190, 90, 130), '#3b4450', { hi: 0.3 }); }
      fillShade(x, rect(-300, 60, 2500, 40), '#b9a888', {}); });
    layer(ctx, cam, 1.5, x => { fillShade(x, rect(560, 300, 800, 700), '#e5d6b6', { line: LINE }); for (let i = 0; i < 5; i++) fillShade(x, rect(600 + i * 170, 380, 60, 620), '#efe2c6', { line: LINE, hi: 0.3 }); fillShade(x, poly([[540, 300], [960, 160], [1380, 300]]), '#cdbd9c', { line: LINE });
      x.fillStyle = '#5a4a3a'; x.font = `900 44px ${P.SERIF}`; x.textAlign = 'center'; x.fillText('TÄNDSTICKSPALATSET', 960, 280); x.textAlign = 'left'; });
    layer(ctx, cam, 0.95, x => { fillShade(x, c => { c.beginPath(); c.ellipse(960, 960, 360, 70, 0, 0, 7); }, '#8a8478', { line: LINE }); fillShade(x, c => { c.beginPath(); c.ellipse(960, 950, 330, 54, 0, 0, 7); }, '#6f9db0', {});
      for (let i = 0; i < 14; i++) { const u = ((g * 0.8 + i / 14) % 1); x.fillStyle = `rgba(230,245,255,${0.7 * (1 - u)})`; x.beginPath(); x.arc(960 + Math.cos(i) * u * 200, 900 - Math.sin(u * Math.PI) * 160, 6, 0, 7); x.fill(); }
      fillShade(x, c => { c.beginPath(); c.moveTo(940, 940); c.lineTo(950, 720); c.quadraticCurveTo(960, 680, 975, 720); c.lineTo(985, 940); c.closePath(); }, '#4d5a52', { line: LINE }); });
    putK(ctx, cam, o, g, [1420, 1060, 0.62, 0.9]); dust(ctx, g, 30, '255,255,240'); vignette(ctx, 0.28); grain(ctx, g); return; }
  sky(ctx, [[0, '#2a1d14'], [1, '#3e2a1c']]);
  layer(ctx, cam, 2.2, x => { for (let i = 0; i < 12; i++) fillShade(x, rect(-500 + i * 260, -300, 252, 1700), i % 2 ? '#5a3b26' : '#63412a', { line: 'rgba(0,0,0,0.25)' });
    fillShade(x, rect(1150, 120, 560, 520), '#9fb6c8', { line: LINE }); x.fillStyle = 'rgba(80,95,110,0.8)'; for (let i = 0; i < 6; i++) x.fillRect(1160 + i * 92, 400 - hash(i) * 120, 80, 260 + hash(i) * 120);
    fillShade(x, rect(1140, 110, 580, 20), '#3a2416', {}); fillShade(x, rect(1140, 630, 580, 20), '#3a2416', {});
    fillShade(x, rect(260, 160, 300, 380), '#8a6a3a', { line: LINE }); fillShade(x, rect(285, 185, 250, 330), o.portrait ? '#000' : '#5a4a3a', {}); });
  beams(ctx, 1600, 0.6);
  putK(ctx, cam, o, g, [880, 430, 1.25, 1.0]); // behind the desk: pass k.legs = false
  layer(ctx, cam, 0.8, x => { fillShade(x, rect(-100, 820, 2100, 80), '#3a2414', { line: LINE }); fillShade(x, rect(0, 900, 1900, 400), '#2b1a10', {});
    fillShade(x, poly([[1500, 760], [1700, 760], [1640, 660], [1560, 660]]), '#2f6a45', { line: LINE }); fillShade(x, rect(1590, 760, 20, 70), '#222', {}); glow(x, 1600, 770, 220, '255,210,140', 0.4);
    fillShade(x, poly([[600, 806], [880, 800], [890, 826], [596, 832]]), '#f1e8d2', { line: LINE }); });
  dust(ctx, g, 30); grade(ctx, 'warm', 0.7); vignette(ctx, 0.42); grain(ctx, g); }
// ============ S9 · PARK AVENUE PENTHOUSE, NIGHT (a roof garden with real trees above Manhattan) ============
function penthouse(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, -100, 0, 1.0, 1.0], [10, 100, -20, 1.1, 1.0]]);
  sky(ctx, [[0, '#0d1230'], [1, '#33305a']]); glow(ctx, 1550, 200, 160, '255,250,220', 0.5); ctx.fillStyle = '#f7f1dc'; ctx.beginPath(); ctx.arc(1550, 200, 46, 0, 7); ctx.fill();
  for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + hash(i) * 0.6})`; ctx.fillRect(hash(i * 3) * W, hash(i * 7) * 500, 2, 2); }
  layer(ctx, cam, 4, x => { for (let i = 0; i < 30; i++) { const bx = -500 + i * 110, bh = 260 + hash(i) * 420; x.fillStyle = '#151a30'; x.fillRect(bx, 1000 - bh, 100, bh + 200); x.fillStyle = 'rgba(255,214,140,0.75)'; for (let w = 0; w < 30; w++) if (hash(i * 31 + w) > 0.62) x.fillRect(bx + 12 + (w % 4) * 22, 1020 - bh + Math.floor(w / 4) * 40, 10, 16); }
    x.fillStyle = '#1c2140'; x.beginPath(); x.moveTo(820, 1000); x.lineTo(820, 260); x.lineTo(860, 160); x.lineTo(900, 260); x.lineTo(900, 1000); x.fill(); });
  layer(ctx, cam, 1.0, x => { fillShade(x, rect(-300, 820, 2600, 40), '#cfc6b4', { line: LINE }); for (let i = 0; i < 40; i++) fillShade(x, rect(-280 + i * 66, 860, 18, 140), '#bdb4a2', {}); fillShade(x, rect(-300, 1000, 2600, 300), '#8a8070', {});
    for (const tx of [180, 1680]) { fillShade(x, rect(tx - 70, 720, 140, 120), '#6a4a34', { line: LINE }); fillShade(x, rect(tx - 10, 520, 20, 210), '#4a3424', {}); x.fillStyle = '#1f3b2a'; blob(x, tx, 470, 150, tx, 1.1); x.fill(); x.fillStyle = 'rgba(80,140,90,0.5)'; blob(x, tx - 30, 430, 90, tx + 3, 1.1); x.fill(); }
    for (let i = 0; i < 9; i++) { x.fillStyle = `rgba(255,220,150,${0.6 + 0.3 * Math.sin(g * 3 + i)})`; x.beginPath(); x.arc(300 + i * 160, 300 + Math.sin(i) * 30, 6, 0, 7); x.fill(); } x.strokeStyle = 'rgba(40,30,30,0.5)'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i < 9; i++) x.lineTo(300 + i * 160, 300 + Math.sin(i) * 30); x.stroke(); });
  putK(ctx, cam, o, g, [1180, 1080, 0.85, 0.95]); grade(ctx, 'night', 0.5); vignette(ctx, 0.4); grain(ctx, g);
  if (o.date !== false) P.plate(ctx, 'PARK AVENUE · NEW YORK', 120, 140, clamp((g - 0.5) / 0.4), { size: 48, bar: '#e3a83a' }); }
// ============ S10 · NEWSSTAND, OCTOBER 1929 — o.crash: papers fly, a crowd at the bank doors ============
function newsstand(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [8, 0, -20, 1.15, 1.0]]);
  sky(ctx, o.crash ? [[0, '#5e646c'], [1, '#9aa0a6']] : [[0, '#c9b38a'], [1, '#e6d6b2']]);
  layer(ctx, cam, 3, x => { for (let i = 0; i < 8; i++) { const bx = -400 + i * 380; fillShade(x, rect(bx, 80, 360, 1000), i % 2 ? '#8a7a66' : '#7a6c5a', { y0: 80, y1: 1080 }); for (let fl = 0; fl < 6; fl++) for (let w = 0; w < 3; w++) fillShade(x, rect(bx + 40 + w * 110, 140 + fl * 130, 60, 90), '#3a4250', {}); }
    if (o.crash) { fillShade(x, rect(600, 260, 760, 700), '#d6ccb6', { line: LINE }); for (let i = 0; i < 6; i++) fillShade(x, rect(640 + i * 120, 360, 50, 600), '#e6dcc6', { line: LINE }); x.fillStyle = '#3a3026'; x.font = `900 52px ${P.SERIF}`; x.textAlign = 'center'; x.fillText('BANK', 980, 330); x.textAlign = 'left'; } });
  layer(ctx, cam, 1.4, x => { if (o.crash) for (let i = 0; i < 16; i++) person(x, 420 + i * 70 + Math.sin(g * 2 + i) * 4, 640 + (i % 3) * 30, 0.6, ['#2c2f38', '#3a2f2a', '#2a3438'][i % 3], { hat: true, back: true }); });
  layer(ctx, cam, 1.0, x => { if (o.crash) return; // the newsstand kiosk with magazine racks
    fillShade(x, rect(560, 380, 800, 520), '#4a5a3a', { line: LINE }); fillShade(x, poly([[520, 380], [1400, 380], [1360, 300], [560, 300]]), '#2f3a26', { line: LINE });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const mx = 600 + c * 124, my = 420 + r * 150; if (o.cover && r === 0 && c === 2) continue; fillShade(x, rect(mx, my, 100, 132), ['#c23a2a', '#e8d6a8', '#2a4a6a', '#d9b04a'][(r + c) % 4], { line: LINE }); x.fillStyle = 'rgba(30,20,10,0.6)'; x.fillRect(mx + 10, my + 12, 80, 10); }
    if (o.cover) o.cover(x, 848, 420, 100, 132); person(x, 1480, 520, 0.8, '#3a3a40', { hat: true }); });
  putK(ctx, cam, o, g, [330, 1000, 0.75, 0.95]);
  if (o.crash) layer(ctx, cam, 0.6, x => { for (let i = 0; i < 26; i++) { const u = ((g * 0.35 + hash(i)) % 1), px = (hash(i * 3) * 2400 - 200) + Math.sin(g * 2 + i) * 60, py = -100 + u * 1300;
      x.save(); x.translate(px, py); x.rotate(g * (hash(i) - 0.5) * 3 + i); fillShade(x, rect(-50, -34, 100, 68), '#efe8d6', { line: LINE }); x.fillStyle = 'rgba(30,20,10,0.6)'; for (let k = 0; k < 4; k++) x.fillRect(-40, -24 + k * 14, 80, 5); x.restore(); } });
  dust(ctx, g, 30); grade(ctx, o.crash ? 'grey' : 'warm', 0.8); vignette(ctx, 0.36); grain(ctx, g); }
module.exports = { kalmar, newyork, stadium, hall, palace, penthouse, newsstand, person };
