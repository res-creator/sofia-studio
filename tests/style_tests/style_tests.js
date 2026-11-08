// Three 10-second style tests on one story beat (the Match King, 1920s): CUTOUT (перекладная), COMIC, COLLAGE.
// Same voice line, same timing, same story beats; only the drawing and animation language changes. All art is drawn in code (no AI images).
// node style_tests.js <cutout|comic|collage> video out.mp4 | still t1,t2 out.png
const { createCanvas } = require('/home/user/sofia-studio/node_modules/@napi-rs/canvas'); const fs = require('fs'), { spawn } = require('child_process');
const W = 1920, H = 1080, FPS = 30, T = 10, VO = 0.5;            // voice starts at 0.5 s
const words = JSON.parse(fs.readFileSync(__dirname + '/words.json')), MOUTH = JSON.parse(fs.readFileSync(__dirname + '/mouth.json'));
const at = (w, n = 0) => { const k = words.filter(x => x[0].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(w))[n]; return k[1] + VO; };
const t = { y20: at('1920'), man: at('man'), controlled: at('controlled'), matches: at('matches'), his: at('his'), ivar: at('ivar'), name2: at('croyger'), lent: at('lent'), money: at('money'), countries: at('countries') };
const B2 = t.his - 0.25, B3 = t.lent - 0.35;                     // beat changes
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const eo = u => 1 - Math.pow(1 - clamp(u), 3), back = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mouth = g => { const i = Math.floor((g - VO) * 30); return i >= 0 && i < MOUTH.length ? MOUTH[i] : 0; };
const F = '"Inter Display", Inter, "DejaVu Sans", sans-serif';
const COUNTRIES = [['FRANCE', 0], ['GERMANY', 1], ['POLAND', 2]];
// ---------------- the man (one design, three renderings) ----------------
// parts in local units (head ~ 100 wide). st: { m mouth 0-1, blink 0-1, arm angle, tilt }
function man(ctx, x, y, s, st, R) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // body
  R.part(ctx, 'body', () => { ctx.beginPath(); ctx.moveTo(-100, 240); ctx.bezierCurveTo(-104, 120, -74, 72, 0, 66); ctx.bezierCurveTo(74, 72, 104, 120, 100, 240); ctx.closePath(); }, '#2a2e3a');
  R.part(ctx, 'shirt', () => { ctx.beginPath(); ctx.moveTo(-30, 68); ctx.lineTo(0, 150); ctx.lineTo(30, 68); ctx.closePath(); }, '#f4f1ea');
  R.part(ctx, 'lapL', () => { ctx.beginPath(); ctx.moveTo(-32, 70); ctx.lineTo(-2, 158); ctx.lineTo(-30, 128); ctx.lineTo(-52, 92); ctx.closePath(); }, '#1d2029');
  R.part(ctx, 'lapR', () => { ctx.beginPath(); ctx.moveTo(32, 70); ctx.lineTo(2, 158); ctx.lineTo(30, 128); ctx.lineTo(52, 92); ctx.closePath(); }, '#1d2029');
  R.part(ctx, 'collar', () => { ctx.beginPath(); ctx.moveTo(-24, 64); ctx.lineTo(-4, 84); ctx.lineTo(-20, 94); ctx.closePath(); ctx.moveTo(24, 64); ctx.lineTo(4, 84); ctx.lineTo(20, 94); ctx.closePath(); }, '#ffffff');
  R.part(ctx, 'tie', () => { ctx.beginPath(); ctx.moveTo(-8, 82); ctx.lineTo(8, 82); ctx.lineTo(12, 140); ctx.lineTo(0, 156); ctx.lineTo(-12, 140); ctx.closePath(); }, '#8a1c1c');
  R.part(ctx, 'pocket', () => { ctx.beginPath(); ctx.moveTo(48, 132); ctx.lineTo(74, 128); ctx.lineTo(70, 140); ctx.lineTo(50, 142); ctx.closePath(); }, '#f4f1ea');
  // writing arm (rotates at the shoulder)
  ctx.save(); ctx.translate(70, 100); ctx.rotate(st.arm || 0);
  R.part(ctx, 'arm', () => { ctx.beginPath(); ctx.roundRect(-18, -10, 36, 120, 16); }, '#30354a'); R.pin && R.pin(ctx, 0, 0);
  ctx.translate(0, 112); ctx.rotate(-(st.arm || 0) * 1.6 - 0.6);
  R.part(ctx, 'fore', () => { ctx.beginPath(); ctx.roundRect(-16, -8, 32, 92, 14); }, '#30354a'); R.pin && R.pin(ctx, 0, 0);
  R.part(ctx, 'hand', () => { ctx.beginPath(); ctx.ellipse(0, 96, 17, 15, 0, 0, 7); }, '#e9c3a0');
  if (st.pen) R.part(ctx, 'pen', () => { ctx.beginPath(); ctx.roundRect(-3, 80, 6, 46, 2); }, '#1b1b1b');
  ctx.restore();
  // head
  ctx.save(); ctx.translate(0, 62); ctx.rotate(st.tilt || 0);
  R.part(ctx, 'neck', () => { ctx.beginPath(); ctx.roundRect(-20, -30, 40, 36, 8); }, '#e2b893');
  R.part(ctx, 'ears', () => { ctx.beginPath(); ctx.ellipse(-52, -88, 11, 18, 0, 0, 7); ctx.ellipse(52, -88, 11, 18, 0, 0, 7); }, '#e2b893');
  R.part(ctx, 'head', () => { ctx.beginPath(); ctx.moveTo(-50, -120); ctx.bezierCurveTo(-56, -40, -40, -24, 0, -22); ctx.bezierCurveTo(40, -24, 56, -40, 50, -120); ctx.bezierCurveTo(46, -168, -46, -168, -50, -120); ctx.closePath(); }, '#efcaa6');
  R.part(ctx, 'jaw', () => { ctx.beginPath(); ctx.moveTo(-44, -60); ctx.bezierCurveTo(-36, -30, -14, -24, 0, -24); ctx.bezierCurveTo(14, -24, 36, -30, 44, -60); ctx.bezierCurveTo(30, -40, -30, -40, -44, -60); ctx.closePath(); }, '#ddb08a');
  R.part(ctx, 'hair', () => { ctx.beginPath(); ctx.moveTo(-52, -112); ctx.bezierCurveTo(-60, -176, 50, -186, 54, -118); ctx.bezierCurveTo(50, -140, 30, -150, -14, -146); ctx.lineTo(-20, -138); ctx.bezierCurveTo(-36, -136, -46, -126, -52, -112); ctx.closePath(); }, '#3a2a1e');
  const ey = -96, bl = 1 - (st.blink || 0);
  R.part(ctx, 'eyes', () => { ctx.beginPath(); ctx.ellipse(-20, ey, 11, 8 * bl + 0.5, 0, 0, 7); ctx.ellipse(20, ey, 11, 8 * bl + 0.5, 0, 0, 7); }, '#fbf7ef');
  R.ink(ctx, () => { for (const ex of [-18, 22]) { ctx.beginPath(); ctx.ellipse(ex, ey + 1, 4.5, 4.5 * bl + 0.3, 0, 0, 7); ctx.fill(); } }, 'fill');
  R.ink(ctx, () => { ctx.beginPath(); ctx.moveTo(-34, ey - 16); ctx.quadraticCurveTo(-20, ey - 24, -8, ey - 17); ctx.moveTo(8, ey - 17); ctx.quadraticCurveTo(20, ey - 24, 34, ey - 16); ctx.stroke(); }, 'stroke', 5);
  R.ink(ctx, () => { ctx.beginPath(); ctx.moveTo(-1, ey + 4); ctx.lineTo(-8, ey + 28); ctx.quadraticCurveTo(0, ey + 33, 7, ey + 28); ctx.stroke(); }, 'stroke', 3.5);
  const mo = st.m || 0; R.part(ctx, 'mouth', () => { ctx.beginPath(); ctx.moveTo(-17, ey + 46); ctx.quadraticCurveTo(0, ey + 50 + mo * 18, 17, ey + 46); ctx.quadraticCurveTo(0, ey + 42, -17, ey + 46); ctx.closePath(); }, '#6a2424');
  ctx.restore(); ctx.restore(); }
// ---------------- props ----------------
function matchbox(ctx, x, y, s, rot, R, lab = 'SÄKERHETS') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  R.part(ctx, 'box', () => { ctx.beginPath(); ctx.rect(-60, -38, 120, 76); }, '#f2c230'); R.part(ctx, 'band', () => { ctx.beginPath(); ctx.rect(-60, -12, 120, 24); }, '#b8231b');
  R.part(ctx, 'strike', () => { ctx.beginPath(); ctx.rect(-60, -38, 120, 9); }, '#5a3a24');
  ctx.fillStyle = '#fff6dc'; ctx.font = `900 15px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, 0, 1); ctx.restore(); }
function match(ctx, x, y, s, rot, R, lit = 0, g = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  R.part(ctx, 'stick', () => { ctx.beginPath(); ctx.rect(-4, -10, 8, 120); }, '#e8c88f'); R.part(ctx, 'tip', () => { ctx.beginPath(); ctx.ellipse(0, -14, 8, 11, 0, 0, 7); }, '#b51d1d');
  if (lit > 0) { const f = 1 + Math.sin(g * 40) * 0.1; ctx.globalAlpha = lit; ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.ellipse(0, -40 * f, 14, 30 * f, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.ellipse(0, -32, 6, 14, 0, 0, 7); ctx.fill(); }
  ctx.restore(); }
function coin(ctx, x, y, s, R) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R.part(ctx, 'coin', () => { ctx.beginPath(); ctx.ellipse(0, 0, 26, 26, 0, 0, 7); }, '#f0b72f');
  ctx.fillStyle = '#9a6a10'; ctx.font = `900 30px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2); ctx.restore(); }
function blob(ctx, cx, cy, r, seed, sx = 1) { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, k = 0.7 + 0.45 * hash(seed + i % 24) + 0.15 * Math.sin(a * 3 + seed); const x = cx + Math.cos(a) * r * k * sx, y = cy + Math.sin(a) * r * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
const LAND = [[-140, -120, 95, 1, 1.3], [60, -110, 80, 7, 1.6], [120, 30, 70, 13, 0.8], [-110, 90, 80, 21, 0.7], [170, 170, 45, 29, 1.2], [-20, -10, 40, 33, 1]];
// ======================= STYLE 1 · CUTOUT (перекладная) =======================
// paper pieces with fibre texture and a soft drop shadow, brass pins at joints, motion "on twos" (15 fps), slight jitter of each piece
function paperTex(col) { const c = createCanvas(128, 128), x = c.getContext('2d'); x.fillStyle = col; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) { const h = hash(i * 3.3); x.fillStyle = h > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; x.fillRect(hash(i) * 128, hash(i * 7.1) * 128, 1 + hash(i * 2) * 3, 1); } return c; }
const TEX = {};
const CUT = { part(ctx, n, path, col) { path(); ctx.save(); ctx.shadowColor = 'rgba(40,25,10,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
    if (!TEX[col]) TEX[col] = ctx.createPattern(paperTex(col), 'repeat'); ctx.fillStyle = TEX[col]; ctx.fill(); ctx.restore(); ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); },
  ink(ctx, path, mode, w) { ctx.fillStyle = '#1e1712'; ctx.strokeStyle = '#1e1712'; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; path(); },
  pin(ctx, x, y) { ctx.save(); ctx.fillStyle = '#c9a04a'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x - 2, y - 2, 2, 0, 7); ctx.fill(); ctx.restore(); } };
function cutout(ctx, g0) { const g = Math.floor(g0 * 15) / 15, R = CUT, j = n => (hash(n + Math.floor(g * 15)) - 0.5) * 2.2;   // on twos + jitter
  // backdrop: layered paper
  ctx.fillStyle = TEX['#d9c7a3'] || (TEX['#d9c7a3'] = ctx.createPattern(paperTex('#d9c7a3'), 'repeat')); ctx.fillRect(0, 0, W, H);
  if (g < B2) { // beat 1 · a paper globe covered with matchboxes
    const gx = 960, gy = 600; R.part(ctx, 'sea', () => { ctx.beginPath(); ctx.arc(gx + j(1), gy + j(2), 340, 0, 7); }, '#5f8fa8');
    LAND.forEach(([a, b, rr, sd, sx]) => R.part(ctx, 'land', () => blob(ctx, gx + a, gy + b, rr * 1.2, sd, sx), '#9db36b'));
    for (let i = 0; i < 3; i++) R.part(ctx, 'cloud', () => blob(ctx, ((300 + i * 700 + g * 40) % 2200) - 100, 160 + i * 90, 60, 40 + i, 2.2), '#f3ead7');
    R.part(ctx, 'sun', () => { ctx.beginPath(); ctx.arc(1640, 220, 90, 0, 7); }, '#f0b23c');
    for (let i = 0; i < 14; i++) { const u = back((g - t.man - i * 0.12) / 0.35); if (u <= 0) continue; const a = hash(i * 9) * 6.28, r = 60 + hash(i * 4) * 230;
      matchbox(ctx, gx + Math.cos(a) * r, gy + Math.sin(a) * r * 0.8 - (1 - u) * 300, 0.55 * u, (hash(i) - 0.5) * 0.8, R); }
    paperLabel(ctx, 'THE 1920s', 120, 170, ss((g - t.y20 + 0.2) / 0.3), '#b8231b');
    paperLabel(ctx, "MOST OF THE WORLD'S MATCHES", 120, 290, ss((g - t.matches + 0.4) / 0.3), '#2a2e3a', 54); return; }
  // beat 2/3 · the office: window with a paper skyline, desk, the man
  R.part(ctx, 'wall', () => { ctx.beginPath(); ctx.rect(0, 0, W, 720); }, '#c7b28a');
  R.part(ctx, 'window', () => { ctx.beginPath(); ctx.rect(1200, 120, 520, 420); }, '#a9c4cf');
  ctx.save(); ctx.beginPath(); ctx.rect(1200, 120, 520, 420); ctx.clip(); R.part(ctx, 'cl', () => blob(ctx, 1300 + (g * 30) % 300, 200, 50, 3, 2), '#ffffff');
  for (let i = 0; i < 7; i++) R.part(ctx, 'bld', () => { ctx.beginPath(); ctx.rect(1210 + i * 74, 300 + hash(i) * 120, 62, 300); }, i % 2 ? '#6f8796' : '#5d7483');
  for (let i = 0; i < 2; i++) R.part(ctx, 'chim', () => { ctx.beginPath(); ctx.rect(1290 + i * 260, 230, 22, 200); }, '#4e5f6b'); ctx.restore();
  R.part(ctx, 'frameP', () => { ctx.beginPath(); ctx.rect(240, 200, 220, 170); }, '#7b4a2a'); R.part(ctx, 'pic', () => { ctx.beginPath(); ctx.rect(258, 218, 184, 134); }, '#b9cc8f');
  R.part(ctx, 'picsun', () => { ctx.beginPath(); ctx.arc(350, 290, 34, 0, 7); }, '#e3a23a');
  ['top', 'bot', 'l', 'r', 'mid'].forEach((k, i) => R.part(ctx, 'fr', () => { ctx.beginPath(); ctx.rect(...[[1190, 110, 540, 20], [1190, 530, 540, 20], [1190, 110, 20, 440], [1710, 110, 20, 440], [1450, 110, 20, 440]][i]); }, '#5b3a22'));
  R.part(ctx, 'lampP', () => { ctx.beginPath(); ctx.rect(1490, 560, 16, 140); }, '#3b3b3b'); R.part(ctx, 'lampS', () => { ctx.beginPath(); ctx.moveTo(1430, 580); ctx.lineTo(1566, 580); ctx.lineTo(1530, 500); ctx.lineTo(1466, 500); ctx.closePath(); }, '#2f7a4f');
  const u3 = clamp((g - B3) / 0.3), arm = g > B3 ? -0.9 + Math.sin(g * 9) * 0.25 * (g < t.countries ? 1 : 0) : -0.2 + Math.sin(g * 2) * 0.05;
  man(ctx, 720 + j(3), 330 + j(4), 2.05, { m: mouth(g0), blink: (g % 3.1) < 0.12 ? 1 : 0, arm, tilt: Math.sin(g * 1.3) * 0.05, pen: g > B3 }, R);
  R.part(ctx, 'desk', () => { ctx.beginPath(); ctx.rect(240, 700, 1440, 70); }, '#7b4a2a'); R.part(ctx, 'deskf', () => { ctx.beginPath(); ctx.rect(280, 770, 1360, 310); }, '#5e3820');
  matchbox(ctx, 420, 668, 0.9, -0.1, R); match(ctx, 520, 650, 0.8, 1.2, R, ss((g - B2 - 0.4) / 0.3), g0);
  if (g < B3) { paperLabel(ctx, 'IVAR KREUGER', 120, 170, ss((g - t.ivar) / 0.3), '#b8231b', 80); paperLabel(ctx, 'THE MATCH KING', 120, 290, ss((g - t.ivar - 0.4) / 0.3), '#2a2e3a', 44); return; }
  // beat 3 · loans: a paper contract, coins hop to country tags
  R.part(ctx, 'paper', () => { ctx.beginPath(); ctx.rect(860, 600, 260, 110); }, '#f7f1e3');
  COUNTRIES.forEach(([n, i]) => { const tt = t.money + i * 0.45, u = clamp((g - tt) / 0.7); const tx = 1300 + i * 0, ty = 170 + i * 150;
    paperLabel(ctx, n, 960, ty + 150, ss((g - tt + 0.2) / 0.25), '#2a2e3a', 56);
    if (u > 0 && u < 1) coin(ctx, lerp(990, 930, u), lerp(620, ty + 130, u) - Math.sin(u * Math.PI) * 180, 1.4, R); });
  paperLabel(ctx, 'LOANS TO GOVERNMENTS', 120, 170, ss((g - t.lent) / 0.3), '#b8231b', 64); }
function paperLabel(ctx, s, x, y, a, col, size = 64) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = 1; ctx.translate(x, y - (1 - eo(a)) * 40); ctx.rotate(-0.02);
  ctx.font = `900 ${size}px ${F}`; const w = ctx.measureText(s).width; CUT.part(ctx, 'lab', () => { ctx.beginPath(); ctx.rect(-20, -size * 0.85, w + 40, size * 1.25); }, col);
  ctx.fillStyle = '#fff6e4'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, 0, size * 0.1 + 6); ctx.restore(); }
// ======================= STYLE 2 · COMIC =======================
// a printed comic page: panels appear one by one, the camera travels panel to panel; thick ink, flat colours, halftone shading, captions, sound words
const COMIC = { part(ctx, n, path, col) { if (n === 'jaw') return; const small = ['eyes', 'mouth', 'collar', 'pocket', 'tie'].includes(n); path(); ctx.fillStyle = col; ctx.fill(); if (!small && n !== 'head') { ctx.save(); ctx.clip(); halftone(ctx, col); ctx.restore(); } path(); ctx.strokeStyle = '#111'; ctx.lineWidth = small ? 2.5 : 6; ctx.lineJoin = 'round'; ctx.stroke(); },
  ink(ctx, path, mode, w) { ctx.fillStyle = '#111'; ctx.strokeStyle = '#111'; ctx.lineWidth = (w || 3) * 1.4; ctx.lineCap = 'round'; path(); } };
function halftone(ctx, col) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; const m = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = 0; y < H; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) { const r = 2.6 * clamp((x - y * 0.6) / W + 0.2); if (r > 0.4) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }
  ctx.setTransform(m); }
function comicPage(ctx, g) { // page = 3 panels laid out on a 2400 x 1500 page; the camera frames one panel at a time
  ctx.fillStyle = '#fbf6e9'; ctx.fillRect(0, 0, 2400, 1500);
  const P = [[40, 40, 1400, 700], [1480, 40, 880, 700], [40, 780, 2320, 680]];
  const draw = [p1, p2, p3]; const show = [0, B2 - 0.5, B3 - 0.5];
  P.forEach(([x, y, w, h], i) => { if (g < show[i] - 0.1) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y); draw[i](ctx, g, w, h); ctx.restore();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 10; ctx.strokeRect(x, y, w, h); }); return P; }
function speed(ctx, w, h, col) { ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 60; i++) { const a = i / 60 * 6.28; ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * 140, h / 2 + Math.sin(a) * 140); ctx.lineTo(w / 2 + Math.cos(a) * 2000, h / 2 + Math.sin(a) * 2000); ctx.stroke(); } }
function caption(ctx, s, x, y, a, size = 40) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.font = `900 ${size}px ${F}`; const w = ctx.measureText(s).width;
  ctx.fillStyle = '#ffe14d'; ctx.fillRect(x, y, w + 40, size * 1.5); ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.strokeRect(x, y, w + 40, size * 1.5); ctx.fillStyle = '#111'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 20, y + size * 0.78); ctx.restore(); }
function boom(ctx, s, x, y, a, size, col, rot = -0.12) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = back(a); ctx.scale(k, k); ctx.font = `900 ${size}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#111'; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
function p1(ctx, g, w, h) { speed(ctx, w, h, '#2d6fb5'); const R = COMIC; ctx.save(); ctx.translate(w / 2, h / 2 + 30);
  R.part(ctx, 'globe', () => { ctx.beginPath(); ctx.arc(0, 0, 250, 0, 7); }, '#4aa3df'); LAND.forEach(([a, b, rr, sd, sx]) => R.part(ctx, 'l', () => blob(ctx, a * 0.75, b * 0.75, rr * 0.9, sd, sx), '#7cc35f'));
  ctx.restore(); for (let i = 0; i < 12; i++) { const u = back((g - t.man - i * 0.1) / 0.3); if (u <= 0) continue; const a = hash(i * 9) * 6.28, r = 80 + hash(i * 4) * 160; matchbox(ctx, w / 2 + Math.cos(a) * r, h / 2 + 30 + Math.sin(a) * r * 0.8, 0.5 * u, (hash(i) - 0.5), R); }
  caption(ctx, 'THE 1920s . . .', 30, 30, ss((g - t.y20 + 0.2) / 0.3), 46); caption(ctx, "ONE MAN CONTROLS MOST OF THE WORLD'S MATCHES", 30, h - 110, ss((g - t.controlled) / 0.3), 34); }
function p2(ctx, g, w, h) { ctx.fillStyle = '#f2d06b'; ctx.fillRect(0, 0, w, h); const R = COMIC; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  man(ctx, w / 2, h - 300, 1.9, { m: mouth(g), blink: (g % 3.1) < 0.12 ? 1 : 0, arm: -0.2, tilt: -0.06 }, R); ctx.restore();
  caption(ctx, 'IVAR KREUGER', 30, 30, ss((g - t.ivar) / 0.3), 54); boom(ctx, 'THE MATCH KING!', w / 2, h - 120, clamp((g - t.ivar - 0.5) / 0.35), 92, '#ff4d3a'); }
function p3(ctx, g, w, h) { speed(ctx, w, h, '#c0392b'); const R = COMIC;
  ctx.save(); ctx.translate(380, 120); man(ctx, 0, 0, 1.25, { m: mouth(g), arm: -0.9 + Math.sin(g * 9) * 0.25 * (g < t.countries ? 1 : 0), pen: 1 }, R); ctx.restore();
  R.part(ctx, 'desk', () => { ctx.beginPath(); ctx.rect(60, 480, 820, 200); }, '#8a5a35'); R.part(ctx, 'paper', () => { ctx.beginPath(); ctx.rect(420, 440, 260, 70); }, '#fffdf2');
  boom(ctx, 'SCRITCH!', 600, 380, clamp((g - t.lent - 0.1) / 0.3), 64, '#ffe14d', 0.1);
  COUNTRIES.forEach(([n, i]) => { const tt = t.money + i * 0.45, u = clamp((g - tt) / 0.6), cx = 1250 + i * 360;
    if (u > 0 && u < 1) coin(ctx, lerp(650, cx, u), lerp(430, 360, u) - Math.sin(u * Math.PI) * 220, 1.5, R);
    if (g > tt + 0.5) { boom(ctx, n, cx, 360, clamp((g - tt - 0.5) / 0.3), 66, '#ffffff', (i - 1) * 0.08); boom(ctx, 'KA-CHING!', cx, 470, clamp((g - tt - 0.6) / 0.3), 40, '#ffe14d', 0.05); } });
  caption(ctx, 'HE LENDS MONEY TO WHOLE COUNTRIES', 30, 30, ss((g - t.lent) / 0.3), 46); }
function comic(ctx, g) { const page = createCanvas(2400, 1500), pc = page.getContext('2d'); const P = comicPage(pc, g);
  // camera: frames panel 1, then 2, then 3, with eased moves and a slow push; a final pull back shows the page
  const cams = [[0, P[0]], [B2 - 0.35, P[1]], [B3 - 0.35, P[2]], [9.0, [0, 0, 2400, 1500]]];
  let k = cams.findLastIndex(c => g >= c[0]); const a = cams[Math.max(0, k)][1], b = cams[Math.min(cams.length - 1, k + 1)][1], u = k < cams.length - 1 ? ss((g - cams[k + 1][0] + 0.45) / 0.45) : 0;
  const r = a.map((v, i) => lerp(v, b[i], u)), pad = 60, sc = Math.min(W / (r[2] + pad * 2), H / (r[3] + pad * 2)) * (1 + 0.03 * ((g * 0.3) % 1));
  ctx.fillStyle = '#20232b'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-(r[0] + r[2] / 2), -(r[1] + r[3] / 2)); ctx.drawImage(page, 0, 0); ctx.restore(); }
// ======================= STYLE 3 · COLLAGE =======================
// yellowed newsprint, torn paper pieces, a halftone "photo" cut-out of the man with a white border, tape, red marker circles; stop-motion at 12 fps
const NEWS = (() => { const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#e9dfc5'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(40,30,20,0.55)';
  for (let col = 0; col < 8; col++) for (let y = 40; y < H; y += 16) { const w = 180 + hash(col * 99 + y) * 40; if (hash(col + y * 3) > 0.93) continue; x.fillRect(30 + col * 238, y, w, 5); }
  return c; })();
function torn(ctx, x, y, w, h, col, seed, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); const N = 40;
  for (let i = 0; i <= N; i++) ctx.lineTo(i / N * w, (hash(seed + i) - 0.5) * 14); for (let i = 0; i <= N; i++) ctx.lineTo(w + (hash(seed + 50 + i) - 0.5) * 14, i / N * h);
  for (let i = N; i >= 0; i--) ctx.lineTo(i / N * w, h + (hash(seed + 100 + i) - 0.5) * 14); for (let i = N; i >= 0; i--) ctx.lineTo((hash(seed + 150 + i) - 0.5) * 14, i / N * h);
  ctx.closePath(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
function tape(ctx, x, y, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = 'rgba(240,232,200,0.75)'; ctx.fillRect(-60, -16, 120, 32); ctx.restore(); }
function cutText(ctx, s, x, y, size, col, bg, rot, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y + (1 - eo(a)) * 30); ctx.rotate(rot); ctx.globalAlpha = clamp(a * 2); let cx = 0;
  for (const [i, ch] of [...s].entries()) { ctx.font = `900 ${size * (0.9 + hash(i * 3) * 0.25)}px ${hash(i) > 0.5 ? 'serif' : F}`; const w = ctx.measureText(ch).width; if (ch !== ' ') { ctx.fillStyle = hash(i * 7) > 0.6 ? '#111' : bg; ctx.save(); ctx.translate(cx, 0); ctx.rotate((hash(i * 5) - 0.5) * 0.12); ctx.fillRect(-4, -size * 0.85, w + 8, size * 1.15); ctx.fillStyle = hash(i * 7) > 0.6 ? '#fff' : col; ctx.fillText(ch, 0, 0); ctx.restore(); } cx += w + 10; }
  ctx.restore(); }
function photoMan(g, st) { const c = createCanvas(700, 820), x = c.getContext('2d'); x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 700, 820);
  const R = { part(ctx, n, path, col) { path(); const v = parseInt(col.slice(1, 3), 16) * 0.3 + parseInt(col.slice(3, 5), 16) * 0.55 + parseInt(col.slice(5, 7), 16) * 0.15; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fill(); }, ink(ctx, path, mode, w) { ctx.fillStyle = '#111'; ctx.strokeStyle = '#111'; ctx.lineWidth = w || 3; path(); } };
  man(x, 350, 470, 2.1, st, R);
  // halftone print of the "photo"
  const d = x.getImageData(0, 0, 700, 820).data, o = createCanvas(700, 820), y = o.getContext('2d'); y.fillStyle = '#efe9da'; y.fillRect(0, 0, 700, 820); y.fillStyle = '#1a1714';
  for (let yy = 0; yy < 820; yy += 9) for (let xx = 0; xx < 700; xx += 9) { const v = Math.pow(d[(yy * 700 + xx) * 4] / 255, 3.2), r = (1 - v) * 5.8; if (r > 0.3) { y.beginPath(); y.arc(xx, yy, r, 0, 7); y.fill(); } } return o; }
function collage(ctx, g0) { const g = Math.floor(g0 * 12) / 12, jt = n => (hash(n + Math.floor(g * 12)) - 0.5) * 3;
  ctx.drawImage(NEWS, jt(1), jt(2)); torn(ctx, 80, 640, 900, 380, '#c63b2d', 3, -0.04); torn(ctx, 1100, 90, 760, 520, '#2f4f6f', 9, 0.03);
  if (g < B2) { // matchboxes pile up on a torn map shape, marker circle
    torn(ctx, 560, 230, 820, 560, '#d7c9a6', 21, -0.02); for (let i = 0; i < 16; i++) { const u = clamp((g - 0.6 - i * 0.12) / 0.2); if (u <= 0) continue; matchbox(ctx, 700 + (i % 6) * 100 + jt(i), 330 + Math.floor(i / 6) * 120 + jt(i + 9), 0.75, (hash(i) - 0.5) * 0.5, { part(c, n, p, col) { p(); c.fillStyle = col; c.fill(); } }); }
    if (g > t.matches - 0.3) { ctx.save(); ctx.strokeStyle = '#d62020'; ctx.lineWidth = 9; ctx.beginPath(); const u = clamp((g - t.matches + 0.3) / 0.5); ctx.ellipse(970, 500, 460, 300, -0.05, 0, 6.3 * u); ctx.stroke(); ctx.restore(); }
    cutText(ctx, 'THE 1920s', 120, 200, 90, '#111', '#f4ead2', -0.04, ss((g - t.y20 + 0.2) / 0.25)); cutText(ctx, 'MOST OF THE MATCHES', 120, 330, 60, '#fff', '#c63b2d', 0.02, ss((g - t.controlled) / 0.25)); return; }
  // the "photo" cut-out of the man, taped on
  const st = { m: mouth(g0), blink: (g % 3.1) < 0.12 ? 1 : 0, arm: g > B3 ? -0.9 + Math.sin(g * 9) * 0.25 * (g < t.countries ? 1 : 0) : -0.2, tilt: Math.sin(g * 1.3) * 0.04, pen: g > B3 };
  const ph = photoMan(g0, st); ctx.save(); ctx.translate(560 + jt(5), 560 + jt(6)); ctx.rotate(-0.05 + Math.sin(g * 0.8) * 0.01); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#fbf8f0'; ctx.fillRect(-370, -440, 740, 880); ctx.shadowColor = 'transparent'; ctx.drawImage(ph, -350, -420); ctx.restore(); tape(ctx, 400, 140, -0.3); tape(ctx, 760, 150, 0.25);
  if (g < B3) { cutText(ctx, 'IVAR KREUGER', 1000, 760, 96, '#111', '#f4ead2', -0.03, ss((g - t.ivar) / 0.25)); cutText(ctx, 'THE MATCH KING', 1040, 900, 64, '#fff', '#c63b2d', 0.02, ss((g - t.ivar - 0.4) / 0.25)); return; }
  // loans: country tags torn from paper, red marker arrows from the man to each
  COUNTRIES.forEach(([n, i]) => { const tt = t.money + i * 0.45, a = ss((g - tt) / 0.25), y = 240 + i * 230; if (a <= 0) return;
    ctx.save(); ctx.strokeStyle = '#d62020'; ctx.lineWidth = 8; ctx.lineCap = 'round'; const u = clamp((g - tt) / 0.4); ctx.beginPath(); ctx.moveTo(900, 520); ctx.quadraticCurveTo(1150, y - 60, lerp(900, 1300, u), lerp(520, y, u)); ctx.stroke(); ctx.restore();
    cutText(ctx, n, 1330, y + 20, 70, '#111', '#f4ead2', (i - 1) * 0.04, a); coin(ctx, 1290, y, 1, { part(c, nn, p, col) { p(); c.fillStyle = col; c.fill(); c.strokeStyle = '#111'; c.lineWidth = 3; c.stroke(); } }); });
  cutText(ctx, 'LOANS TO GOVERNMENTS', 80, 120, 64, '#fff', '#111', -0.02, ss((g - t.lent) / 0.25)); }
// ---------------- render ----------------
const STY = { cutout, comic, collage };
function frame(ctx, style, g) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; STY[style](ctx, g);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.0); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (g > T - 0.5) { ctx.fillStyle = `rgba(0,0,0,${ss((g - T + 0.5) / 0.5)})`; ctx.fillRect(0, 0, W, H); } }
(async () => { const [style, mode, a1, a2] = process.argv.slice(2); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(640 * 3, 360 * Math.ceil(ts.length / 3)), c2 = sh.getContext('2d');
    ts.forEach((tt, i) => { frame(ctx, style, tt); c2.drawImage(cv, (i % 3) * 640, Math.floor(i / 3) * 360, 640, 360); c2.fillStyle = '#f22'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % 3) * 640 + 8, Math.floor(i / 3) * 360 + 26); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < T * FPS; f++) { frame(ctx, style, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); })();
