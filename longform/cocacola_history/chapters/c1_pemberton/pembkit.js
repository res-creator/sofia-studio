// Chapter 1 local kit: 1880s Georgia sets & props (drugstore, gaslight street, lab bench, kettle room, soda fountain, office, war smoke).
// Built on longform/kit (look/props/toon). Same ink + flat fill + one shade band rules.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, darken, lighten, clamp, lerp, E, hash, fitText } = L;

// ---------- small props ----------
function jar(ctx, x, y, w, h, col, label, o = {}) { // apothecary jar, bottom-centre at x,y
  ctx.save(); ctx.translate(x, y);
  rr(ctx, -w / 2, -h, w, h, w * 0.22); ink(ctx, col, 4); L.shade(ctx, () => rr(ctx, -w / 2, -h, w, h, w * 0.22), 1, 0.14);
  rr(ctx, -w * 0.32, -h - 14, w * 0.64, 16, 5); ink(ctx, o.lid || '#3A2A1E', 4); ctx.beginPath(); ctx.arc(0, -h - 18, w * 0.12, 0, 6.27); ink(ctx, o.lid || '#3A2A1E', 3);
  if (label) { rr(ctx, -w * 0.38, -h * 0.62, w * 0.76, h * 0.3, 3); ink(ctx, CREAM, 3); fitText(ctx, label, 0, -h * 0.47, Math.min(18, h * 0.18), INK, w * 0.68); }
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; rr(ctx, -w * 0.36, -h * 0.9, w * 0.1, h * 0.6, 3); ctx.fill(); ctx.restore();
  ctx.restore(); }
function showGlobe(ctx, x, y, s, col, t = 0) { // pharmacy show globe (coloured liquid in a big glass urn)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -16, -40, 32, 40, 6); ink(ctx, '#C9A44A', 4); ell(ctx, 0, -110, 70, 78); ink(ctx, col, 5);
  ctx.save(); ell(ctx, 0, -110, 70, 78); ctx.clip(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; ell(ctx, -26, -140, 14, 30, 0.4); ctx.fill(); ctx.restore();
  rr(ctx, -12, -205, 24, 30, 6); ink(ctx, col, 4); poly(ctx, [[-22, -205], [22, -205], [0, -250]]); ink(ctx, '#C9A44A', 4);
  L.glow(ctx, 0, -110, 120, col, 0.18 + Math.sin(t * 2) * 0.04); ctx.restore(); }
function flask(ctx, x, y, s, col, t = 0, o = {}) { // erlenmeyer with bubbles
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sh = () => { ctx.beginPath(); ctx.moveTo(-14, -120); ctx.lineTo(-14, -80); ctx.lineTo(-60, 0); ctx.lineTo(60, 0); ctx.lineTo(14, -80); ctx.lineTo(14, -120); ctx.closePath(); };
  ctx.save(); sh(); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-70, -50, 140, 60);
  for (let i = 0; i < 7; i++) { const ph = (t * 1.6 + i * 0.37 + (o.seed || 0)) % 1; ctx.beginPath(); ctx.arc(-30 + hash(i * 3 + (o.seed || 0)) * 60, -6 - ph * 90, 4 + i % 3, 0, 6.27); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); } ctx.restore();
  sh(); ink(ctx, 'rgba(220,240,240,0.25)', 5); rr(ctx, -18, -132, 36, 14, 4); ink(ctx, '#C9A44A', 4);
  if (o.steam !== false) for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8; L.cloud(ctx, Math.sin(ph * 5 + i) * 14, -150 - ph * 120, 0.18 + ph * 0.25, '#F4EEE6'); ctx.restore(); }
  ctx.restore(); }
function mortar(ctx, x, y, s, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.save(); ctx.translate(20, -60); ctx.rotate(0.5 + Math.sin(t * 6) * 0.15); rr(ctx, -10, -80, 20, 100, 9); ink(ctx, '#E8E1D2', 4); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-60, -60); ctx.quadraticCurveTo(-60, 0, 0, 0); ctx.quadraticCurveTo(60, 0, 60, -60); ctx.closePath(); ink(ctx, '#E8E1D2', 5); rr(ctx, -66, -68, 132, 14, 6); ink(ctx, '#F4EFE4', 4); ctx.restore(); }
function wineBottle(ctx, x, y, s, o = {}) { // dark wine-coca bottle with a cream label
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const sh = () => { ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, -150); ctx.bezierCurveTo(-40, -185, -14, -190, -13, -215); ctx.lineTo(-13, -260); ctx.lineTo(13, -260); ctx.lineTo(13, -215); ctx.bezierCurveTo(14, -190, 40, -185, 40, -150); ctx.lineTo(40, 0); ctx.closePath(); };
  sh(); ink(ctx, o.col || '#4A2A3A', 5); L.shade(ctx, sh, 1, 0.2); rr(ctx, -16, -275, 32, 22, 4); ink(ctx, '#B8483A', 4);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; rr(ctx, -30, -160, 9, 140, 4); ctx.fill(); ctx.restore();
  rr(ctx, -36, -130, 72, 90, 6); ink(ctx, CREAM, 4); const lab = o.label || ['FRENCH', 'WINE', 'COCA'];
  lab.forEach((s2, i) => fitText(ctx, s2, 0, -112 + i * 26, 20, i === 2 ? RED : INK, 64));
  if (o.sweat) for (let i = 0; i < 4; i++) { const ph = (o.sweat * 0.8 + i * 0.27) % 1; ctx.save(); ctx.translate((i % 2 ? 1 : -1) * (44 + i * 3), -200 + i * 30 + ph * 60); ctx.globalAlpha = 1 - ph * 0.6; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 4, 0, 8); ctx.quadraticCurveTo(-10, 4, 0, -14); ink(ctx, '#9AD7FF', 3.5); ctx.restore(); }
  if (o.face) { const f = o.face; ctx.save(); ctx.translate(0, -180); for (const sx of [-1, 1]) { ell(ctx, sx * 14, 0, 9, 11); ink(ctx, '#FFF', 3); ctx.beginPath(); ctx.arc(sx * 14 + (f === 'look' ? 3 : 0), 2, 3.5, 0, 6.27); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.moveTo(sx * 22, -16); ctx.lineTo(sx * 6, -12 + (f === 'worried' ? -6 : 0)); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-9, 22); ctx.bezierCurveTo(-4, 16, 0, 26, 4, 18); ctx.lineTo(9, 22); ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore(); }
  ctx.restore(); }
function leaf(ctx, x, y, s, rot = 0, col = '#4E9A4A') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(46, -40, 46, 40, 0, 70); ctx.bezierCurveTo(-46, 40, -46, -40, 0, -70); ctx.closePath(); ink(ctx, col, 5);
  L.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(46, -40, 46, 40, 0, 70); ctx.bezierCurveTo(-46, 40, -46, -40, 0, -70); ctx.closePath(); }, 1, 0.15);
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 86); for (let i = -2; i <= 2; i++) { ctx.moveTo(0, i * 20); ctx.lineTo(-22, i * 20 - 14); ctx.moveTo(0, i * 20); ctx.lineTo(22, i * 20 - 14); } ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.6); ctx.stroke(); ctx.restore(); }
function kolaNut(ctx, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.bezierCurveTo(-55, -50, -5, -60, 0, -30); ctx.bezierCurveTo(5, -60, 55, -50, 50, 0); ctx.bezierCurveTo(50, 45, -50, 45, -50, 0); ctx.closePath(); ink(ctx, '#B5643A', 5);
  L.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-50, 0); ctx.bezierCurveTo(-55, -50, -5, -60, 0, -30); ctx.bezierCurveTo(5, -60, 55, -50, 50, 0); ctx.bezierCurveTo(50, 45, -50, 45, -50, 0); ctx.closePath(); }, 1, 0.18);
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(4, 0, 0, 34); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#FFF'; ell(ctx, -24, -18, 10, 6, -0.5); ctx.fill(); ctx.restore(); ctx.restore(); }
function sugarSack(ctx, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const sh = () => { ctx.beginPath(); ctx.moveTo(-60, 0); ctx.bezierCurveTo(-75, -60, -60, -120, -40, -140); ctx.lineTo(-30, -160); ctx.lineTo(30, -160); ctx.lineTo(40, -140); ctx.bezierCurveTo(60, -120, 75, -60, 60, 0); ctx.closePath(); };
  sh(); ink(ctx, '#E9DDBE', 5); L.shade(ctx, sh, 1, 0.14); rr(ctx, -36, -150, 72, 12, 5); ink(ctx, '#B8954F', 3); fitText(ctx, 'SUGAR', 0, -70, 30, '#7A2E1E', 100); fitText(ctx, '100 LB', 0, -38, 18, INK, 90, { font: L.F.type }); ctx.restore(); }
function hourglass(ctx, x, y, s, u) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -60, -170, 120, 16, 5); ink(ctx, '#7A4A2A', 4); rr(ctx, -60, -10, 120, 16, 5); ink(ctx, '#7A4A2A', 4);
  const gl = () => { ctx.beginPath(); ctx.moveTo(-46, -154); ctx.bezierCurveTo(-46, -100, -8, -96, -6, -82); ctx.bezierCurveTo(-8, -68, -46, -64, -46, -10); ctx.lineTo(46, -10); ctx.bezierCurveTo(46, -64, 8, -68, 6, -82); ctx.bezierCurveTo(8, -96, 46, -100, 46, -154); ctx.closePath(); };
  ctx.save(); gl(); ctx.clip(); ctx.fillStyle = '#E3C77D'; const top = (1 - u) * 60; ctx.fillRect(-50, -82 - top, 100, top); const bot = u * 60; ctx.beginPath(); ctx.moveTo(-50, -10); ctx.lineTo(0, -10 - bot * 1.3); ctx.lineTo(50, -10); ctx.fill(); if (u < 1) ctx.fillRect(-2, -84, 4, 72); ctx.restore();
  gl(); ink(ctx, 'rgba(220,240,240,0.25)', 4); for (const sx of [-1, 1]) { rr(ctx, sx * 52 - 5, -158, 10, 152, 4); ink(ctx, '#7A4A2A', 3); } ctx.restore(); }
function chair(ctx, x, y, s, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#6B4123';
  rr(ctx, -70, -330, 140, 200, 30); ink(ctx, c, 5); rr(ctx, -50, -310, 100, 160, 20); ink(ctx, o.cushion || '#7A2E2E', 4); rr(ctx, -85, -150, 170, 40, 12); ink(ctx, o.cushion || '#7A2E2E', 5);
  for (const sx of [-1, 1]) { rr(ctx, sx * 70 - 8, -115, 16, 115, 5); ink(ctx, c, 4); rr(ctx, sx * 80 - 12, -220, 24, 80, 10); ink(ctx, c, 4); } ctx.restore(); }
function balanceScale(ctx, x, y, s, tilt, o = {}) { // tilt + => left pan down
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -120, -20, 240, 30, 8); ink(ctx, '#C9A44A', 5); rr(ctx, -14, -440, 28, 430, 8); ink(ctx, '#C9A44A', 5); ctx.beginPath(); ctx.arc(0, -450, 22, 0, 6.27); ink(ctx, '#D8B04A', 5);
  ctx.save(); ctx.translate(0, -440); ctx.rotate(-tilt); rr(ctx, -420, -12, 840, 24, 10); ink(ctx, '#C9A44A', 5);
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 400, 0); ctx.rotate(tilt); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-150, 200); ctx.moveTo(0, 0); ctx.lineTo(150, 200); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-170, 200); ctx.quadraticCurveTo(0, 270, 170, 200); ctx.closePath(); ink(ctx, '#D8B04A', 5); if (sx < 0 && o.left) o.left(ctx); if (sx > 0 && o.right) o.right(ctx); ctx.restore(); }
  ctx.restore(); ctx.restore(); }
function horseBuggy(ctx, x, y, s, t, o = {}) { // simple horse + buggy facing right
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); const ph = t * 8, hc = o.horse || '#8A5A33';
  const wheel = (wx, r) => { ctx.save(); ctx.translate(wx, -r); ctx.rotate(t * 5); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 6); for (let i = 0; i < 8; i++) { ctx.rotate(0.785); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); };
  // buggy
  rr(ctx, -360, -190, 200, 80, 10); ink(ctx, '#2E2A28', 5); ctx.beginPath(); ctx.moveTo(-360, -190); ctx.quadraticCurveTo(-330, -300, -200, -290); ctx.lineTo(-200, -190); ctx.closePath(); ink(ctx, '#3A3438', 5);
  toon(ctx, -250, -150, 0.5, o.driver || { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#5A4A3A', pants: '#3A3A48', hat: 'bowler', hatCol: '#3A2A24' }, 'hold', 'happy', { t, noShadow: true });
  wheel(-320, 70); wheel(-190, 56); ctx.beginPath(); ctx.moveTo(-160, -130); ctx.lineTo(0, -150); ink(ctx, null, 6);
  // horse legs
  for (let i = 0; i < 4; i++) { const lx = [10, 40, 140, 170][i], a = Math.sin(ph + i * 1.6) * 0.35; ctx.save(); ctx.translate(lx, -130); ctx.rotate(a); rr(ctx, -9, 0, 18, 125, 8); ink(ctx, darken(hc, i % 2 ? 0.85 : 1), 4); rr(ctx, -11, 112, 22, 16, 4); ink(ctx, '#2A1E18', 3); ctx.restore(); }
  ell(ctx, 90, -170, 110, 55); ink(ctx, hc, 5); L.shade(ctx, () => ell(ctx, 90, -170, 110, 55), 1, 0.14);
  ctx.save(); ctx.translate(190, -200); ctx.rotate(-0.6 + Math.sin(ph) * 0.05); rr(ctx, -20, -90, 50, 110, 20); ink(ctx, hc, 5); ctx.restore();
  ctx.save(); ctx.translate(240, -290 + Math.sin(ph) * 3); ctx.rotate(0.35); rr(ctx, -25, -30, 90, 52, 22); ink(ctx, hc, 5); ctx.beginPath(); ctx.arc(10, -14, 6, 0, 6.27); ctx.fillStyle = INK; ctx.fill(); poly(ctx, [[-14, -26], [-6, -56], [4, -28]]); ink(ctx, hc, 4); ctx.restore();
  ctx.beginPath(); ctx.moveTo(175, -235); ctx.quadraticCurveTo(140, -250, 120, -215); ctx.lineWidth = 14; ctx.strokeStyle = '#2E2016'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-15, -175); ctx.quadraticCurveTo(-40, -150 + Math.sin(ph * 0.5) * 10, -36, -110); ctx.lineWidth = 12; ctx.stroke();
  ctx.restore(); }
function dog(ctx, x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); const ph = t * 10, c = o.col || '#C9A06A';
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate([-40, -25, 30, 45][i], -40); ctx.rotate(Math.sin(ph + i * 1.7) * 0.4 * (o.walk === false ? 0 : 1)); rr(ctx, -6, 0, 12, 40, 6); ink(ctx, darken(c, i % 2 ? 0.85 : 1), 3.5); ctx.restore(); }
  ell(ctx, 0, -50, 62, 26); ink(ctx, c, 4.5); ctx.save(); ctx.translate(-58, -60); ctx.rotate(-0.8 + Math.sin(t * 14) * 0.4); rr(ctx, -5, -40, 10, 40, 5); ink(ctx, c, 3.5); ctx.restore();
  ctx.save(); ctx.translate(62, -78 + (o.sniff ? Math.sin(t * 16) * 3 : 0)); ell(ctx, 0, 0, 28, 24); ink(ctx, c, 4.5); ell(ctx, 26, 6, 14, 10); ink(ctx, c, 4); ctx.beginPath(); ctx.arc(38, 2, 5, 0, 6.27); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(4, -6, 5, 0, 6.27); ctx.fill(); ell(ctx, -14, -2, 10, 22, 0.3); ink(ctx, darken(c, 0.7), 3.5); ctx.restore(); ctx.restore(); }
function bulb(ctx, x, y, s, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2.4) * s; ctx.scale(k, k); L.glow(ctx, 0, -10, 160, '#FFE38A', 0.6);
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * 0.785); ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(0, -104); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, -16, 48, 0.75 * Math.PI, 2.25 * Math.PI); ctx.lineTo(18, 30); ctx.lineTo(-18, 30); ctx.closePath(); ink(ctx, '#FFE38A', 5); rr(ctx, -20, 30, 40, 26, 5); ink(ctx, '#B8B2A8', 4); ctx.restore(); }
function cloudDark(ctx, x, y, s, t, o = {}) { // small heavy cloud with rain lines
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); [[-70, 10, 46], [-20, -20, 58], [40, -8, 50], [80, 14, 36], [0, 18, 50]].forEach(([cx, cy, r]) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r + Math.sin(t * 2 + cx) * 2, 0, 6.27); }); ink(ctx, o.col || '#4A4652', 5);
  if (o.rain !== false) { ctx.save(); ctx.strokeStyle = '#8FB6D8'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { const ph = (t * 1.8 + hash(i * 3.3)) % 1, xx = -80 + i * 20; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.moveTo(xx, 60 + ph * 140); ctx.lineTo(xx - 6, 84 + ph * 140); ctx.stroke(); } ctx.restore(); }
  ctx.restore(); }
function deed(ctx, x, y, s, rot = 0, o = {}) { // paper with typewriter lines; o.piece 0..3 shows a torn quarter
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (o.piece === undefined) { rr(ctx, -150, -200, 300, 400, 6); ink(ctx, CREAM, 5); fitText(ctx, 'COCA-COLA', 0, -150, 38, RED, 260); fitText(ctx, 'RIGHTS & FORMULA', 0, -108, 20, INK, 260, { font: L.F.type });
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-110, -60 + i * 30); ctx.lineTo(110 - (i % 3) * 30, -60 + i * 30); ctx.lineWidth = 4; ctx.strokeStyle = '#9A8A70'; ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-100, 170); ctx.bezierCurveTo(-60, 140, -40, 190, 0, 160); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  else { const q = o.piece, pts = [[[-150, -200], [10, -200], [20, -40], [-8, 10], [-150, 0]], [[10, -200], [150, -200], [150, -10], [-8, 10], [20, -40]], [[-150, 0], [-8, 10], [12, 90], [-20, 200], [-150, 200]], [[-8, 10], [150, -10], [150, 200], [-20, 200], [12, 90]]][q];
    const cx = pts.reduce((a, p) => a + p[0], 0) / 5, cy = pts.reduce((a, p) => a + p[1], 0) / 5; ctx.translate(-cx, -cy); poly(ctx, pts); ink(ctx, CREAM, 5); ctx.save(); poly(ctx, pts); ctx.clip();
    fitText(ctx, 'COCA-COLA', 0, -150, 38, RED, 260); for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-110, -60 + i * 30); ctx.lineTo(110 - (i % 3) * 30, -60 + i * 30); ctx.lineWidth = 4; ctx.strokeStyle = '#9A8A70'; ctx.stroke(); } ctx.restore(); }
  ctx.restore(); }
function gasLamp(ctx, x, y, t, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -200); ctx.lineTo(0, -40); ink(ctx, null, 5); rr(ctx, -30, -50, 60, 16, 6); ink(ctx, '#C9A44A', 4);
  ctx.beginPath(); ctx.moveTo(-28, -36); ctx.quadraticCurveTo(-34, 14, 0, 22); ctx.quadraticCurveTo(34, 14, 28, -36); ctx.closePath(); ink(ctx, '#FBE3A6', 4); L.glow(ctx, 0, -6, 260 + Math.sin(t * 9) * 8, '#FFC870', 0.38); ctx.restore(); }

// ---------- sets ----------
// drugstore interior: wall with shelves of labelled jars, show globes, counter with scale/mortar/register, gas lamps, checker floor
const JARLAB = ['SAL', 'IPEC', 'CAMPH', 'ZINC', 'MYRRH', 'ALOE', 'ANISE', 'MENTH', 'SODA', 'IODINE', 'BORAX', 'GINGER'];
function drugWall(ctx, t, o = {}) { const seed = o.seed || 0;
  L.wallpaper(ctx, -1800, -900, 3600, 1120, o.wall || '#6E3A2C', o.dot || '#84483A', 52);
  rr(ctx, -1800, -900, 3600, 60, 0); ink(ctx, '#4A2A1A', 0); rr(ctx, -1800, -850, 3600, 22, 0); ink(ctx, '#8A5A33', 4);
  for (let b = 0; b < 4; b++) { const bx = -1700 + b * 870; rr(ctx, bx, -760, 760, 820, 8); ink(ctx, '#5A3420', 6); L.planks(ctx, bx + 10, -750, 740, 800, '#6B4123', { vertical: true, pw: 60 });
    rr(ctx, bx - 14, -790, 788, 44, 6); ink(ctx, '#4A2A18', 5); if (o.signs && o.signs[b]) fitText(ctx, o.signs[b], bx + 380, -768, 28, '#F2D27A', 700);
    for (let r = 0; r < 4; r++) { const yy = -560 + r * 200; rr(ctx, bx + 4, yy, 752, 14, 3); ink(ctx, '#8A5A33', 4);
      let xx = bx + 40, i = 0; while (xx < bx + 700) { const v = hash(b * 311 + r * 97 + i * 13 + seed), w = 54 + v * 34, h = 90 + v * 70, col = ['#B7D7C9', '#E3C77D', '#C46A4A', '#8FB6D8', '#D9D2C2', '#9C6AA8', '#5F8F5F', '#E8E1D2'][Math.floor(v * 8)];
        if (xx + w > bx + 740) break; jar(ctx, xx + w / 2, yy, w, h, col, JARLAB[Math.floor(hash(i * 7 + r + b * 5 + seed) * JARLAB.length)]); xx += w + 14; i++; } } }
  if (o.lamps !== false) for (const lx of [-900, 0, 900]) gasLamp(ctx, lx, -700, t + lx, 1); }
function counter(ctx, x, y, w, o = {}) { // wooden counter front with panels and marble top; y = top
  rr(ctx, x, y, w, 380, 6); ink(ctx, '#7A4A2A', 6); L.planks(ctx, x + 6, y + 30, w - 12, 344, '#7A4A2A', { vertical: true, pw: 70 });
  for (let i = 0; i < Math.floor(w / 300); i++) { rr(ctx, x + 40 + i * 300, y + 80, 240, 220, 10); ink(ctx, '#6B4123', 5); rr(ctx, x + 60 + i * 300, y + 100, 200, 180, 8); ink(ctx, '#8A5A33', 4); }
  rr(ctx, x - 20, y - 10, w + 40, 40, 8); ink(ctx, o.top || '#E8E1D2', 6); ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = '#9A9488'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 12, y - 6); ctx.quadraticCurveTo(x + i * w / 12 + 40, y + 10, x + i * w / 12 + 90, y + 26); ctx.stroke(); } ctx.restore(); }
function register(ctx, x, y, s, n = '0', o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); poly(ctx, [[-110, 0], [110, 0], [90, -120], [-90, -120]]); ink(ctx, '#C9A44A', 6); L.shade(ctx, () => poly(ctx, [[-110, 0], [110, 0], [90, -120], [-90, -120]]), 1, 0.15);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(-70 + j * 35, -90 + i * 28, 10, 0, 6.27); ink(ctx, CREAM, 3); }
  rr(ctx, -70, -220, 140, 100, 10); ink(ctx, '#C9A44A', 6); rr(ctx, -52, -205, 104, 64, 6); ink(ctx, '#F6EBD3', 4); fitText(ctx, n, 0, -172, 48, INK, 90); if (o.label) fitText(ctx, o.label, 0, -232, 18, '#5A3A1A', 140); ctx.restore(); }
function floorTiles(ctx, y, h = 700, a = '#E9E0CC', b = '#6B4A3A') { ctx.save(); ctx.beginPath(); ctx.rect(-2000, y, 4000, h); ctx.clip(); ctx.fillStyle = a; ctx.fillRect(-2000, y, 4000, h);
  for (let j = 0; j < 12; j++) for (let i = -30; i < 30; i++) { if ((i + j) % 2) continue; const y0 = y + j * 60, sc = 1 + j * 0.08; ctx.fillStyle = b; ctx.fillRect(i * 70 * sc, y0, 70 * sc, 60); } ctx.restore(); ctx.beginPath(); ctx.moveTo(-2000, y); ctx.lineTo(2000, y); ink(ctx, null, 5); }
// 1880s street: skyline far, row of storefronts mid, street + sidewalk near
function skyline(ctx, t, o = {}) { const col = o.col || '#B98A70'; for (let i = 0; i < 14; i++) { const x = -2200 + i * 330, h = 260 + hash(i * 5.3) * 280; rr(ctx, x, 120 - h, 280, h + 100, 4); ink(ctx, darken(col, 0.88 + hash(i) * 0.12), 4);
    for (let r = 0; r < h / 80 - 1; r++) for (let c2 = 0; c2 < 3; c2++) { rr(ctx, x + 30 + c2 * 82, 150 - h + r * 80, 44, 50, 4); ink(ctx, o.night ? (hash(i * 9 + r * 3 + c2) > 0.4 ? '#F7D27A' : '#3A2E3A') : lighten(col, 0.3), 2.5); } }
  // church steeple + factory chimney
  poly(ctx, [[-120, -360], [-60, -560], [0, -360]]); ink(ctx, darken(col, 0.8), 4); rr(ctx, -120, -360, 120, 480, 4); ink(ctx, darken(col, 0.9), 4);
  rr(ctx, 900, -420, 70, 540, 4); ink(ctx, '#7A4634', 4); for (let i = 0; i < 4; i++) { const ph = (t * 0.25 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.6; L.cloud(ctx, 935 + ph * 260, -450 - ph * 180, 0.5 + ph, '#D9CDBA'); ctx.restore(); } }
function streetRow(ctx, x0, y, list, o = {}) { let x = x0; for (const s of list) { P.storefront(ctx, x, y, { w: s.w || 440, h: s.h || 560, col: s.col, sign: s.sign, signCol: s.signCol, signFg: s.signFg, awning: s.awning, brick: s.brick, night: o.night, upper: s.upper, display: s.display, doorCol: s.doorCol }); if (s.after) s.after(ctx, x, y); x += (s.w || 440) + (s.gap ?? 30); } }
function telegraph(ctx, x0, x1, y, step = 700) { for (let x = x0; x <= x1; x += step) { rr(ctx, x - 9, y - 640, 18, 640, 4); ink(ctx, '#5A4030', 4); rr(ctx, x - 70, y - 610, 140, 14, 4); ink(ctx, '#5A4030', 4); }
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let x = x0; x < x1; x += step) { ctx.moveTo(x - 50 + k * 50, y - 604); ctx.quadraticCurveTo(x + step / 2, y - 560, x + step - 50 + k * 50, y - 604); } ctx.stroke(); } ctx.restore(); }

module.exports = { jar, showGlobe, flask, mortar, wineBottle, leaf, kolaNut, sugarSack, hourglass, chair, balanceScale, horseBuggy, dog, bulb, cloudDark, deed, gasLamp, drugWall, counter, register, floorTiles, skyline, streetRow, telegraph };
