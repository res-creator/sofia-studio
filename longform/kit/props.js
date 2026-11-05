// How It's Run LONG-FORM props & sets (shared by all chapters). Every prop: ink outline, flat fill + one cel-shade band, small highlights.
// Brand rule: the drink is named in plain bold type ("COCA-COLA", "PEPSI"); no logo copies (no script lettering, no wave ribbon, no circle logos).
const L = require('./look');
const { INK, CREAM, RED, YELLOW, BLUE, ink, rr, ell, poly, darken, lighten, clamp, lerp, E, hash, fitText } = L;
const COLA = '#3B1F12', COLA2 = '#5A2E18', GLASS = 'rgba(190,230,215,0.55)', GLASS_G = '#7FB8A2';

// ---- the drink ----
// bottle(ctx, x, y(bottom), s, o): o.kind 'straight' (1890s-1910s) | 'contour' (curvy, 1916+) | 'pepsi' | 'modern' (plastic); o.fill 0..1 liquid; o.label text; o.open; o.rot
function bottle(ctx, x, y, s = 1, o = {}) {
  const k = o.kind || 'contour', H0 = 230, fill = o.fill ?? 1; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const glass = o.glass || (k === 'pepsi' ? 'rgba(200,225,240,0.6)' : k === 'modern' ? 'rgba(150,80,60,0.25)' : GLASS);
  const shape = () => { ctx.beginPath();
    if (k === 'straight') { ctx.moveTo(-32, 0); ctx.lineTo(-32, -130); ctx.bezierCurveTo(-32, -165, -14, -170, -12, -190); ctx.lineTo(-12, -222); ctx.lineTo(12, -222); ctx.lineTo(12, -190); ctx.bezierCurveTo(14, -170, 32, -165, 32, -130); ctx.lineTo(32, 0); }
    else if (k === 'contour') { ctx.moveTo(-30, 0); ctx.bezierCurveTo(-36, -30, -24, -50, -27, -75); ctx.bezierCurveTo(-30, -100, -40, -120, -34, -140); ctx.bezierCurveTo(-26, -168, -12, -175, -11, -200); ctx.lineTo(-11, -224); ctx.lineTo(11, -224); ctx.lineTo(11, -200); ctx.bezierCurveTo(12, -175, 26, -168, 34, -140); ctx.bezierCurveTo(40, -120, 30, -100, 27, -75); ctx.bezierCurveTo(24, -50, 36, -30, 30, 0); }
    else { ctx.moveTo(-34, 0); ctx.lineTo(-34, -140); ctx.bezierCurveTo(-34, -170, -13, -175, -12, -200); ctx.lineTo(-12, -224); ctx.lineTo(12, -224); ctx.lineTo(12, -200); ctx.bezierCurveTo(13, -175, 34, -170, 34, -140); ctx.lineTo(34, 0); }
    ctx.closePath(); };
  // liquid
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = k === 'pepsi' ? '#2A1A12' : COLA; ctx.fillRect(-50, -H0 * fill, 100, H0 * fill + 5);
  ctx.globalAlpha = 0.5; ctx.fillStyle = COLA2; ctx.fillRect(-50, -H0 * fill, 22, H0 * fill); ctx.restore();
  shape(); ink(ctx, glass, 5);
  if (k === 'contour') { ctx.save(); shape(); ctx.clip(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#CFEFE2'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 11, -150); ctx.lineTo(i * 11, -10); ctx.stroke(); } ctx.restore(); }
  ctx.save(); shape(); ctx.clip(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#FFF'; rr(ctx, -22, -200, 8, 170, 4); ctx.fill(); ctx.restore();
  // cap
  if (!o.open) { rr(ctx, -15, -236, 30, 16, 4); ink(ctx, k === 'pepsi' ? BLUE : k === 'modern' ? RED : '#D8B04A', 4); }
  // label
  const lab = o.label ?? (k === 'pepsi' ? 'PEPSI' : 'COCA-COLA');
  if (lab) { const ly = k === 'straight' ? -95 : -110; rr(ctx, -36, ly - 18, 72, 36, 5); ink(ctx, k === 'pepsi' ? BLUE : RED, 4); fitText(ctx, lab, 0, ly + 1, 17, k === 'pepsi' ? '#FFFFFF' : CREAM, 62); }
  ctx.restore(); }
// soda-fountain glass (flared), o.fill, o.fizz(t), o.ice
function glassCup(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const fill = o.fill ?? 0.85;
  const shape = () => { ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-30, -60); ctx.bezierCurveTo(-46, -90, -48, -120, -46, -135); ctx.lineTo(46, -135); ctx.bezierCurveTo(48, -120, 46, -90, 30, -60); ctx.lineTo(22, 0); ctx.closePath(); };
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = COLA; ctx.fillRect(-60, -135 * fill, 120, 140); ctx.fillStyle = '#E9D2B5'; ctx.fillRect(-60, -135 * fill - 8, 120, 9);
  if (o.fizz) for (let i = 0; i < 9; i++) { const ph = (o.fizz * 0.7 + i * 0.37) % 1; ctx.beginPath(); ctx.arc(-30 + i * 7.5, -10 - ph * 120 * fill, 2.5, 0, 6.27); ctx.fillStyle = 'rgba(255,240,220,0.7)'; ctx.fill(); }
  ctx.restore(); shape(); ink(ctx, 'rgba(255,255,255,0.18)', 5); rr(ctx, -30, 0, 60, 10, 4); ink(ctx, 'rgba(220,240,235,0.7)', 4); ctx.restore(); }
function jug(ctx, x, y, s = 1, col = '#C9A777') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.bezierCurveTo(-70, -60, -60, -120, -22, -130); ctx.lineTo(-18, -165); ctx.lineTo(18, -165); ctx.lineTo(22, -130); ctx.bezierCurveTo(60, -120, 70, -60, 50, 0); ctx.closePath(); ink(ctx, col, 5); L.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-50, 0); ctx.bezierCurveTo(-70, -60, -60, -120, -22, -130); ctx.lineTo(22, -130); ctx.bezierCurveTo(60, -120, 70, -60, 50, 0); ctx.closePath(); }, 1, 0.15);
  ctx.beginPath(); ctx.arc(52, -85, 26, -1.4, 1.4); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke(); rr(ctx, -20, -178, 40, 16, 5); ink(ctx, '#8A5A33', 4); ctx.restore(); }
// syrup kettle (copper) with steam puffs (t)
function kettle(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(ctx, 0, -70, 110, 80); ink(ctx, '#B86B3C', 6); L.shade(ctx, () => ell(ctx, 0, -70, 110, 80), 1, 0.18); ell(ctx, 0, -138, 100, 20); ink(ctx, COLA2, 5);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 112, -95, 18, sx > 0 ? -1.5 : 1.6, sx > 0 ? 1.5 : 4.7); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); }
  for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i * 0.25) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.7; L.cloud(ctx, -40 + i * 26 + Math.sin(ph * 6 + i) * 12, -150 - ph * 160, 0.35 + ph * 0.4, '#F4EEE6'); ctx.restore(); }
  ctx.restore(); }
// wooden crate with bottles (n across), o.kind bottle type, o.text stencil
function crate(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const n = o.n || 4, w = n * 52 + 20;
  if (o.bottles !== false) for (let i = 0; i < n; i++) bottle(ctx, -w / 2 + 36 + i * 52, -50, 0.42, { kind: o.kind || 'straight', label: '' });
  rr(ctx, -w / 2, -70, w, 70, 4); ink(ctx, '#C8954F', 5); L.planks(ctx, -w / 2 + 3, -67, w - 6, 64, '#C8954F', { pw: 22 });
  rr(ctx, -w / 2, -70, w, 70, 4); ink(ctx, null, 5); if (o.text) fitText(ctx, o.text, 0, -35, 26, '#7A2E1E', w - 20); ctx.restore(); }
// delivery truck: o.era 1910 | 1930 | 1945 | 1980 | 2020, o.text, t for wheel spin, o.load (crates)
function truck(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); const era = o.era || 1930, col = o.col || RED, t = o.t || 0;
  const wheel = (wx, r) => { ctx.save(); ctx.translate(wx, -r); ctx.rotate(t * 8); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#2A2628', 5); ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, 6.27); ink(ctx, '#B8B2A8', 4); for (let i = 0; i < 5; i++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 0.45); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore(); };
  if (era < 1920) { // open-bed early truck
    rr(ctx, -230, -150, 290, 60, 6); ink(ctx, col, 5); for (let i = 0; i < 4; i++) crate(ctx, -200 + i * 70, -150, 0.42, { n: 3, kind: 'straight' });
    rr(ctx, 60, -230, 110, 140, 10); ink(ctx, darken(col, 0.85), 5); rr(ctx, 78, -215, 74, 60, 6); ink(ctx, '#BFE3F0', 4); rr(ctx, 170, -150, 70, 60, 10); ink(ctx, col, 5);
    wheel(-160, 46); wheel(160, 46); }
  else { const rnd = era >= 1980 ? 8 : 26; rr(ctx, -260, -250, 330, 180, 8); ink(ctx, o.box || CREAM, 5); L.shade(ctx, () => rr(ctx, -260, -250, 330, 180, 8), 1, 0.1);
    rr(ctx, -250, -230, 310, 70, 6); ink(ctx, col, 4); if (o.text) fitText(ctx, o.text, -95, -195, 40, CREAM, 290);
    if (o.load) for (let i = 0; i < 4; i++) crate(ctx, -215 + i * 76, -82, 0.4, { n: 3, kind: o.kind || 'contour', bottles: true });
    ctx.beginPath(); ctx.moveTo(70, -70); ctx.lineTo(70, -220); ctx.lineTo(150, -220); ctx.quadraticCurveTo(185, -200, 200, -150); ctx.lineTo(240, -140); ctx.quadraticCurveTo(255, -130, 255, -70); ctx.closePath(); ink(ctx, col, 5);
    poly(ctx, [[85, -205], [145, -205], [175, -150], [85, -150]]); ink(ctx, '#BFE3F0', 4); rr(ctx, -270, -78, 535, 26, rnd / 3); ink(ctx, '#3A3438', 4);
    if (era < 1950) { ell(ctx, 120, -78, 60, 30); ctx.save(); ctx.globalAlpha = 0; ctx.restore(); }
    wheel(-170, 44); wheel(170, 44); ctx.beginPath(); ctx.arc(250, -110, 10, 0, 6.27); ink(ctx, '#FFF2B0', 3); }
  ctx.restore(); }
// soda fountain counter with taps, stools and back bar
function fountain(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const w = o.w || 900, P = L.ERA[o.era || 'gaslight'];
  rr(ctx, -w / 2, -230, w, 230, 8); ink(ctx, '#E8E1D2', 6); L.tiles(ctx, -w / 2 + 6, -200, w - 12, 194, '#F1EBDD', '#DCD3C0', 32); rr(ctx, -w / 2, -230, w, 230, 8); ink(ctx, null, 6);
  rr(ctx, -w / 2 - 20, -258, w + 40, 34, 10); ink(ctx, '#4A2E1E', 6); rr(ctx, -w / 2 - 20, -258, w + 40, 10, 5); ink(ctx, '#7A4A2A', 0);
  for (let i = 0; i < (o.taps ?? 3); i++) { const tx = -w * 0.25 + i * w * 0.18; rr(ctx, tx - 9, -350, 18, 92, 6); ink(ctx, '#C9CDD2', 5); ctx.beginPath(); ctx.arc(tx, -360, 16, 0, 6.27); ink(ctx, '#D8B04A', 5); rr(ctx, tx - 4, -340, 30, 10, 4); ink(ctx, '#C9CDD2', 4); }
  if (o.stools !== false) for (let i = 0; i < 5; i++) { const sx = -w / 2 + 90 + i * (w - 180) / 4; rr(ctx, sx - 6, 0, 12, 110, 4); ink(ctx, '#8A8F96', 4); ell(ctx, sx, 0, 46, 14); ink(ctx, RED, 5); }
  ctx.restore(); }
// apothecary shelves full of jars (x,y top-left), n rows
function shelves(ctx, x, y, w, h, o = {}) { const rows = o.rows || 4, rh = h / rows; ctx.save(); rr(ctx, x, y, w, h, 6); ink(ctx, '#5A3420', 6); L.planks(ctx, x + 8, y + 8, w - 16, h - 16, '#6B4123', { vertical: true, pw: 48 });
  for (let r = 0; r < rows; r++) { const yy = y + (r + 1) * rh - 8; rr(ctx, x + 4, yy, w - 8, 12, 3); ink(ctx, '#8A5A33', 4);
    let xx = x + 22; let i = 0; while (xx < x + w - 40) { const v = hash(r * 97 + i * 13 + (o.seed || 0)), jw = 26 + v * 26, jh = rh * (0.45 + v * 0.35), col = ['#B7D7C9', '#E3C77D', '#C46A4A', '#8FB6D8', '#D9D2C2', '#9C6AA8', '#5F8F5F'][Math.floor(v * 7)];
      rr(ctx, xx, yy - jh, jw, jh, 6); ink(ctx, col, 3.5); rr(ctx, xx + jw * 0.2, yy - jh - 9, jw * 0.6, 10, 3); ink(ctx, '#3A2A1E', 3); rr(ctx, xx + 3, yy - jh * 0.62, jw - 6, jh * 0.28, 2); ink(ctx, CREAM, 2.5);
      xx += jw + 8 + v * 8; i++; } }
  ctx.restore(); }
// storefront facade: x = left, y = ground; o.w, o.h, o.col, o.sign, o.awning [a,b], o.brick, o.door, o.windowLight
function storefront(ctx, x, y, o = {}) { const w = o.w || 420, h = o.h || 520, col = o.col || '#B86B4B'; ctx.save();
  if (o.brick !== false) L.bricks(ctx, x, y - h, w, h, col, { bw: 46, bh: 18 }); else { ctx.fillStyle = col; ctx.fillRect(x, y - h, w, h); }
  ctx.beginPath(); ctx.rect(x, y - h, w, h); ink(ctx, null, 6);
  rr(ctx, x - 10, y - h - 24, w + 20, 30, 4); ink(ctx, darken(col, 0.7), 5); // cornice
  for (let i = 0; i < (o.upper ?? 3); i++) { const wx = x + 30 + i * (w - 60) / (o.upper ?? 3); const ww = (w - 60) / (o.upper ?? 3) - 24; rr(ctx, wx, y - h + 40, ww, 110, 6); ink(ctx, o.night ? '#F7D27A' : '#9CC7D8', 5); ctx.beginPath(); ctx.moveTo(wx + ww / 2, y - h + 40); ctx.lineTo(wx + ww / 2, y - h + 150); ctx.moveTo(wx, y - h + 95); ctx.lineTo(wx + ww, y - h + 95); ink(ctx, null, 4); rr(ctx, wx - 8, y - h + 148, ww + 16, 12, 3); ink(ctx, CREAM, 4); }
  const sy = y - h + 190; rr(ctx, x + 14, sy, w - 28, 62, 6); ink(ctx, o.signCol || '#2A3A2E', 5); if (o.sign) fitText(ctx, o.sign, x + w / 2, sy + 32, 36, o.signFg || '#F2D27A', w - 60, { font: o.signFont });
  const by = sy + 80, bh = y - by - 10; rr(ctx, x + 20, by, w * 0.58, bh, 6); ink(ctx, o.night ? '#F7C873' : '#A8D0DF', 5); if (o.display) o.display(ctx, x + 20, by, w * 0.58, bh);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; poly(ctx, [[x + 40, by + 10], [x + 80, by + 10], [x + 40, by + 70]]); ctx.fill(); ctx.restore();
  rr(ctx, x + w * 0.66, by - 10, w * 0.26, bh + 10, 6); ink(ctx, o.doorCol || '#5A3420', 5); ctx.beginPath(); ctx.arc(x + w * 0.69, by + bh * 0.55, 5, 0, 6.27); ink(ctx, '#D8B04A', 2);
  if (o.awning) { const [a, b] = o.awning, ay = by + 22; poly(ctx, [[x + 6, ay - 30], [x + w - 6, ay - 30], [x + w + 14, ay + 40], [x - 14, ay + 40]]); ctx.save(); ctx.clip(); L.stripes(ctx, x - 20, ay - 40, w + 40, 90, a, b, 34); ctx.restore(); poly(ctx, [[x + 6, ay - 30], [x + w - 6, ay - 30], [x + w + 14, ay + 40], [x - 14, ay + 40]]); ink(ctx, null, 5);
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(x - 14 + (i + 0.5) * (w + 28) / 12, ay + 40, (w + 28) / 24, 0, Math.PI); ink(ctx, i % 2 ? a : b, 4); } }
  ctx.restore(); }
function lamppost(ctx, x, y, s = 1, lit = false) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -7, -330, 14, 330, 5); ink(ctx, '#2E3A34', 5); rr(ctx, -20, -20, 40, 20, 4); ink(ctx, '#2E3A34', 4);
  poly(ctx, [[-26, -395], [26, -395], [18, -335], [-18, -335]]); ink(ctx, lit ? '#FFE3A0' : '#D8E4E8', 5); poly(ctx, [[-32, -395], [32, -395], [0, -425]]); ink(ctx, '#2E3A34', 5); if (lit) L.glow(ctx, 0, -365, 160, '#FFD58A', 0.5); ctx.restore(); }
// cobbled / dirt street band
function street(ctx, x, y, w, h, o = {}) { ctx.save(); ctx.fillStyle = o.col || '#A08A68'; ctx.fillRect(x, y, w, h); if (o.cobble !== false) { ctx.globalAlpha = 0.35; for (let i = 0; i < w / 40 * h / 22; i++) { const v = hash(i * 3.7), u = hash(i * 9.1); ell(ctx, x + v * w, y + u * h, 16, 7); ctx.fillStyle = darken(o.col || '#A08A68', 0.75); ctx.fill(); } ctx.globalAlpha = 1; }
  ctx.fillStyle = o.curb || '#C9BFA8'; ctx.fillRect(x, y, w, 18); ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w, y + 18); ink(ctx, null, 4); ctx.restore(); }
// money
function coin(ctx, x, y, r = 30, spin = 0, label = '5¢') { ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.08, Math.abs(Math.cos(spin))), 1); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#C9C4BA', 4); ctx.beginPath(); ctx.arc(0, 0, r * 0.74, 0, 6.27); ink(ctx, null, 2.5); if (Math.abs(Math.cos(spin)) > 0.4) fitText(ctx, label, 0, 2, r * 0.75, INK, r * 1.4); ctx.restore(); }
function bills(ctx, x, y, s = 1, n = 5, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(0, -i * 12); ctx.rotate((hash(i * 7) - 0.5) * 0.12); rr(ctx, -80, -36, 160, 72, 6); ink(ctx, '#9BC48A', 4); ell(ctx, 0, 0, 22, 26); ink(ctx, '#7BAA6A', 3); fitText(ctx, '$', 0, 2, 30, '#2E5A2A', 40); ctx.restore(); } ctx.restore(); }
function moneyBag(ctx, x, y, s = 1, label = '$') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-30, -120); ctx.bezierCurveTo(-110, -60, -90, 0, 0, 0); ctx.bezierCurveTo(90, 0, 110, -60, 30, -120); ctx.closePath(); ink(ctx, '#C9A86A', 5); L.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-30, -120); ctx.bezierCurveTo(-110, -60, -90, 0, 0, 0); ctx.bezierCurveTo(90, 0, 110, -60, 30, -120); ctx.closePath(); }, 1, 0.15);
  rr(ctx, -34, -134, 68, 18, 8); ink(ctx, '#8A6A3A', 4); fitText(ctx, label, 0, -55, 56, '#5A3A1A', 120); ctx.restore(); }
// paper things
function ticket(ctx, x, y, s = 1, text = 'FREE', sub = 'ONE GLASS', rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-130, -60); ctx.lineTo(130, -60); ctx.arc(130, 0, 18, -1.57, 1.57, true); ctx.lineTo(130, 60); ctx.lineTo(-130, 60); ctx.arc(-130, 0, 18, 1.57, -1.57, true); ctx.closePath(); ink(ctx, CREAM, 5);
  ctx.setLineDash([8, 8]); rr(ctx, -108, -44, 216, 88, 6); ink(ctx, null, 2.5); ctx.setLineDash([]); fitText(ctx, text, 0, -12, 46, RED, 190); fitText(ctx, sub, 0, 28, 22, INK, 190, { font: L.F.type }); ctx.restore(); }
function poster(ctx, x, y, w, h, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); rr(ctx, -w / 2, -h / 2, w, h, 4); ink(ctx, o.bg || CREAM, 5); if (o.draw) o.draw(ctx, w, h);
  if (o.title) fitText(ctx, o.title, 0, -h / 2 + h * 0.16, h * 0.13, o.fg || RED, w * 0.86); if (o.sub) fitText(ctx, o.sub, 0, h / 2 - h * 0.12, h * 0.07, INK, w * 0.86, { font: L.F.type }); ctx.restore(); }
function clock(ctx, x, y, r = 60, t = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, o.rim || RED, 6); ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 6.27); ink(ctx, CREAM, 4); if (o.text) fitText(ctx, o.text, 0, r * 0.35, r * 0.2, RED, r * 1.2);
  for (const [a, l, w] of [[t * 0.5, r * 0.45, 6], [t * 6, r * 0.65, 4]]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -l); ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); } ctx.restore(); }
function calendar(ctx, x, y, s = 1, top = '1886', big = 'MAY', small = '8') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -90, -110, 180, 220, 8); ink(ctx, CREAM, 5); rr(ctx, -90, -110, 180, 56, 8); ink(ctx, RED, 5); fitText(ctx, top, 0, -82, 34, CREAM, 160); fitText(ctx, big, 0, -20, 40, INK, 160); fitText(ctx, small, 0, 50, 70, INK, 160); ctx.restore(); }
// a phone ringing, a TV set, a vending machine, a cooler, a six-bottle carton
function phone(ctx, x, y, s = 1, t = 0, ringing = false) { ctx.save(); ctx.translate(x + (ringing ? Math.sin(t * 60) * 3 : 0), y); ctx.scale(s, s); rr(ctx, -60, -60, 120, 60, 14); ink(ctx, '#C9302C', 5); ctx.beginPath(); ctx.arc(0, -32, 18, 0, 6.27); ink(ctx, CREAM, 4); rr(ctx, -70, -88, 140, 26, 12); ink(ctx, '#C9302C', 5); if (ringing) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 80, -70, 18, sx > 0 ? -0.8 : 2.3, sx > 0 ? 0.8 : 3.9); ink(ctx, null, 4); } ctx.restore(); }
function tv(ctx, x, y, s = 1, screen) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -150, -230, 300, 230, 22); ink(ctx, '#8A5A33', 6); rr(ctx, -120, -205, 200, 170, 26); ink(ctx, '#1E2A2E', 5); if (screen) { ctx.save(); rr(ctx, -116, -201, 192, 162, 24); ctx.clip(); screen(ctx, -116, -201, 192, 162); ctx.restore(); }
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(118, -170 + i * 45, 11, 0, 6.27); ink(ctx, '#D8B04A', 4); } ctx.beginPath(); ctx.moveTo(-60, -230); ctx.lineTo(-100, -300); ctx.moveTo(40, -230); ctx.lineTo(80, -300); ink(ctx, null, 4); ctx.restore(); }
function vending(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -110, -420, 220, 420, 16); ink(ctx, RED, 6); L.shade(ctx, () => rr(ctx, -110, -420, 220, 420, 16), 1, 0.16); rr(ctx, -90, -380, 180, 70, 8); ink(ctx, CREAM, 4); fitText(ctx, o.text || 'ICE COLD', 0, -345, 30, RED, 160);
  rr(ctx, -80, -290, 120, 200, 8); ink(ctx, '#3A2A24', 4); for (let i = 0; i < 4; i++) bottle(ctx, -60 + i * 27, -110, 0.32, { label: '' }); rr(ctx, 55, -260, 26, 50, 6); ink(ctx, '#C9CDD2', 4); rr(ctx, -80, -70, 160, 36, 6); ink(ctx, '#2A2628', 4); ctx.restore(); }
function carton(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 3; i++) bottle(ctx, -50 + i * 50, -40, 0.5, { label: '' }); rr(ctx, -85, -95, 170, 95, 6); ink(ctx, '#E3C77D', 5); rr(ctx, -85, -95, 170, 40, 6); ink(ctx, RED, 4); fitText(ctx, '6 BOTTLES', 0, -74, 24, CREAM, 150); poly(ctx, [[-20, -95], [-12, -150], [12, -150], [20, -95]]); ink(ctx, '#E3C77D', 4); ctx.beginPath(); ctx.arc(0, -138, 12, 0, 6.27); ink(ctx, '#3A2A24', 3); ctx.restore(); }
// comic FX
function burst(ctx, x, y, r, u, col = YELLOW) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.translate(x, y); const k = E.out(u) * r; ctx.globalAlpha = 1 - u * u; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, rr2 = i % 2 ? k * 0.55 : k; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ink(ctx, col, 5); ctx.restore(); }
function speedLines(ctx, x, y, w, h, t, dir = -1, a = 0.5) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const yy = y + hash(i * 3.3) * h, ln = 80 + hash(i * 1.7) * 160, xx = x + ((hash(i * 5.1) * w - t * 2400 * dir) % w + w) % w; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + ln * -dir, yy); ctx.stroke(); } ctx.restore(); }
function puff(ctx, x, y, u, s = 1, col = '#EFE7DA') { if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha = 1 - u; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; L.cloud(ctx, x + Math.cos(a) * 60 * s * E.out(u), y + Math.sin(a) * 30 * s * E.out(u) - u * 20, 0.3 * s * (1 + u), col); } ctx.restore(); }
function sparkles(ctx, x, y, r, t, n = 6, col = YELLOW) { ctx.save(); for (let i = 0; i < n; i++) { const ph = (t * 1.3 + i / n) % 1, a = i / n * 6.28 + t * 0.4, k = Math.sin(ph * Math.PI) * 14; ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6); ctx.beginPath(); ctx.moveTo(0, -k); ctx.lineTo(k * 0.3, 0); ctx.lineTo(0, k); ctx.lineTo(-k * 0.3, 0); ctx.closePath(); ink(ctx, col, 2.5); ctx.restore(); } ctx.restore(); }
function bubble(ctx, x, y, w, h, text, o = {}) { ctx.save(); ctx.translate(x, y); rr(ctx, -w / 2, -h / 2, w, h, h / 2.5); ink(ctx, o.bg || '#FFFFFF', 5); poly(ctx, [[o.tail ?? -w * 0.2, h / 2 - 3], [(o.tail ?? -w * 0.2) + 30, h / 2 - 3], [(o.tail ?? -w * 0.2) - 10 * (o.tailDir || 1), h / 2 + 40]]); ink(ctx, o.bg || '#FFFFFF', 0); ctx.beginPath(); ctx.moveTo(o.tail ?? -w * 0.2, h / 2); ctx.lineTo((o.tail ?? -w * 0.2) - 10 * (o.tailDir || 1), h / 2 + 40); ctx.lineTo((o.tail ?? -w * 0.2) + 30, h / 2); ink(ctx, null, 5); if (text) fitText(ctx, text, 0, 2, o.size || 40, o.fg || INK, w - 40); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, u = 1, col = RED, w = 1) { if (u <= 0) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0); ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.lineWidth = 16 * w; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 9 * w; ctx.strokeStyle = col; ctx.stroke(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(w, w); poly(ctx, [[0, -26], [38, 0], [0, 26]]); ink(ctx, col, 5); ctx.restore(); }
// crowd: a row of generic toons; deterministic looks; o.react 'cheer'|'shock'|'angry'|'drink'
function crowd(ctx, x0, x1, y, s, n, t, o = {}) { const { toon } = require('./toon'); const tops = ['#D93A35', '#2F6DB5', '#F7C548', '#2F8A6A', '#8A5AA8', '#E07A3A', '#4A4F5C', '#C9C4BA'], hairs = ['short', 'side', 'curly', 'long', 'bald', 'bun'], hcols = ['#2B1E16', '#5A3A22', '#151313', '#D9B25A', '#A4462A', '#A9A49C'];
  for (let i = 0; i < n; i++) { const v = hash(i * 7.7 + (o.seed || 0)), u = hash(i * 3.1 + 5 + (o.seed || 0)), x = lerp(x0, x1, n > 1 ? i / (n - 1) : 0.5) + (v - 0.5) * 30;
    const look = { skin: L.SKIN[Math.floor(u * L.SKIN.length)], hair: { style: hairs[Math.floor(v * 6)], col: hcols[Math.floor(u * 6)] }, top: tops[Math.floor(v * 8)], pants: ['#3A3A48', '#2F4A6A', '#5A4A3A'][Math.floor(u * 3)], stache: v > 0.8, glasses: u > 0.85 ? 'round' : null, hat: o.hats ? o.hats[Math.floor(u * o.hats.length)] : null, hatCol: '#3A2A24', ...(o.look || {}) };
    const pose = o.pose || (o.react === 'cheer' ? (i % 2 ? 'cheer' : 'fist') : o.react === 'angry' ? (i % 3 ? 'fist' : 'arms') : o.react === 'shock' ? 'shock' : 'stand'), ex = o.expr || (o.react === 'cheer' ? 'laugh' : o.react === 'angry' ? 'angry' : o.react === 'shock' ? 'shock' : 'neutral');
    toon(ctx, x, y + Math.sin(t * 7 + i) * (o.react === 'cheer' ? 5 : 0), s * (0.92 + u * 0.16), look, pose, ex, { t: t + i, seed: i, flip: v > 0.5 }); } }
module.exports = { bottle, glassCup, jug, kettle, crate, truck, fountain, shelves, storefront, lamppost, street, coin, bills, moneyBag, ticket, poster, clock, calendar, phone, tv, vending, carton, burst, speedLines, puff, sparkles, bubble, arrow, crowd, COLA };
