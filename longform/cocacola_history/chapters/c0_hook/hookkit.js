// Chapter 0 (cold open) local kit: bottle tidal wave, close-up hands, top-down crowd, bottle-ring planet, subway, panel grid,
// 1886 drugstore pieces (copied from c1 pembkit), 1899 office desk from above, 1985 crowd, WWII crane + ship.
// Built on longform/kit (look/props/toon). Same ink + flat fill + one shade band rules. Brand names only as plain type.
const { createCanvas } = require('@napi-rs/canvas');
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ink, rr, ell, poly, darken, lighten, clamp, lerp, E, hash, fitText } = L;
const HEAD_Y = -236; // toon head centre above the feet at s = 1

// toon placed by its head centre (for close-ups: the body runs off the bottom of the frame)
function toonHead(ctx, cx, cy, s, look, pose, expr, o = {}) { return toon(ctx, cx, cy - HEAD_Y * s, s, look, pose, expr, { noShadow: true, ...o }); }

// ---------- bottle sprites (fast: one vector draw, then drawImage) ----------
const SPR = {};
function sprite(kind = 'contour', label) { const k = kind + '|' + label; if (!SPR[k]) { const c = createCanvas(110, 270), g = c.getContext('2d'); P.bottle(g, 55, 258, 1, { kind, label }); SPR[k] = c; } return SPR[k]; }
function sb(ctx, x, y, s, rot = 0, kind = 'contour', label) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(sprite(kind, label), -55, -135); ctx.restore(); } // centred bottle

// ---------- the bottle tidal wave (frame 0) ----------
// x = front foot of the wave, y = street level, s scale; t time (bottles tumble along the curl)
function wavePath(ctx) { ctx.beginPath(); ctx.moveTo(-3200, 0); ctx.lineTo(-3200, -760);
  ctx.bezierCurveTo(-2300, -1000, -900, -1180, -250, -1010); ctx.bezierCurveTo(120, -920, 300, -720, 170, -560);
  ctx.bezierCurveTo(110, -490, -10, -520, -30, -610); ctx.bezierCurveTo(-50, -700, -190, -720, -280, -560);
  ctx.bezierCurveTo(-360, -420, -330, -150, 260, 0); ctx.closePath(); }
function barrelPath(ctx) { ctx.beginPath(); ctx.moveTo(-30, -610); ctx.bezierCurveTo(-50, -700, -190, -720, -280, -560); ctx.bezierCurveTo(-360, -420, -330, -150, 260, 0); ctx.lineTo(-120, 0); ctx.bezierCurveTo(-470, -200, -420, -520, -300, -650); ctx.bezierCurveTo(-200, -760, -60, -720, -30, -610); ctx.closePath(); }
function bottleWave(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // shadow on the street in front
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#1A0E08'; ell(ctx, 150, 10, 700, 60); ctx.fill(); ctx.restore();
  ctx.save(); wavePath(ctx); ctx.clip(); ctx.fillStyle = '#3B1F12'; ctx.fillRect(-3300, -1300, 3800, 1400);
  // packed bottles flowing along the curl: rows follow the wave's top line; each row slides forward at its own speed
  for (let j = 0; j < 19; j++) { const yy = -1120 + j * 64, sp = 80 + (j % 4) * 25;
    for (let i = 0; i < 56; i++) { const v = hash(j * 131 + i * 7.3), xx = -3260 + ((i * 62 + t * sp + v * 40) % 3560);
      const curl = yy < -560 && xx > -300 ? (xx + 300) * 0.0035 : 0; sb(ctx, xx, yy + (v - 0.5) * 30 + Math.sin(t * 2 + i) * 6, 0.5 + v * 0.12, v * 6.28 + t * (v > 0.5 ? 1.4 : -1.1) + curl, v > 0.93 ? 'straight' : 'contour'); } }
  // foam streaks that read "wave"
  ctx.globalAlpha = 0.55; ctx.strokeStyle = '#F6EBD3'; ctx.lineCap = 'round';
  for (let k = 0; k < 7; k++) { ctx.lineWidth = 16 - k * 1.5; const ph = (t * 0.25 + k / 7) % 1, o = -2900 + ph * 2600; ctx.beginPath(); ctx.moveTo(o, -840 + k * 60); ctx.bezierCurveTo(o + 500, -960 + k * 60, o + 900, -980 + k * 50, o + 1200, -900 + k * 40); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.restore();
  // dark barrel inside the curl
  ctx.save(); barrelPath(ctx); ctx.globalAlpha = 0.45; ctx.fillStyle = '#140804'; ctx.fill(); ctx.restore();
  wavePath(ctx); ink(ctx, null, 8);
  // foam lip along the crest + tip
  const crest = u => { // point on crest bezier (-250,-1010)->(170,-560) approx
    const p0 = [-1400, -1120], p1 = [-250, -1010], p2 = [200, -820], p3 = [170, -560]; const a = 1 - u; return [a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]; };
  for (let i = 0; i < 26; i++) { const u = i / 25, [cx, cy] = crest(u), r = 30 + hash(i * 3.1) * 34 + Math.sin(t * 6 + i) * 6; ctx.beginPath(); ctx.arc(cx, cy - 6, r, 0, 6.27); ink(ctx, '#FBF4E6', 5); }
  for (let i = 0; i < 16; i++) { const ph = (t * 0.9 + hash(i * 5.7)) % 1, [cx, cy] = crest(0.55 + hash(i) * 0.45); ctx.save(); ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(cx + ph * 260 + hash(i * 2) * 60, cy - 30 - ph * 120 + ph * ph * 260, 10 + hash(i * 9) * 12, 0, 6.27); ink(ctx, '#FBF4E6', 4); ctx.restore(); }
  // base foam rolling over the street
  for (let i = 0; i < 18; i++) { const bx = -340 + i * 40 + Math.sin(t * 5 + i) * 10, by = -14 - Math.abs(Math.sin(i * 1.3 + t * 3)) * 26; ctx.beginPath(); ctx.arc(bx, by, 26 + hash(i * 7) * 16, 0, 6.27); ink(ctx, '#FBF4E6', 5); }
  ctx.restore(); }
// a few big bottles thrown forward off the crest (drawn in world coords, tumbling)
function flyers(ctx, x, y, s, t, n = 7) { for (let i = 0; i < n; i++) { const ph = (t * 0.55 + hash(i * 3.3)) % 1, sx = x + (100 + ph * 900) * s, sy = y + (-900 + ph * 300 + ph * ph * 1000 - hash(i) * 200) * s;
    if (ph > 0.05 && ph < 0.95) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(ph * 8 + i); P.bottle(ctx, 0, 110, 0.75 * s, { kind: 'contour' }); ctx.restore(); } } }

// ---------- modern street ----------
function tower(ctx, x, y, w, h, col = '#9CC3E0', o = {}) { rr(ctx, x, y - h, w, h, 6); ink(ctx, col, 5); ctx.save(); rr(ctx, x, y - h, w, h, 6); ctx.clip(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF';
  poly(ctx, [[x + w * 0.1, y - h], [x + w * 0.35, y - h], [x - w * 0.2, y], [x - w * 0.45, y]]); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = darken(col, 0.75); ctx.lineWidth = 2.5;
  for (let r = y - h + 30; r < y; r += o.floor || 34) { ctx.beginPath(); ctx.moveTo(x, r); ctx.lineTo(x + w, r); ctx.stroke(); } for (let c = x + 30; c < x + w; c += o.col || 40) { ctx.beginPath(); ctx.moveTo(c, y - h); ctx.lineTo(c, y); ctx.stroke(); } ctx.restore(); rr(ctx, x, y - h, w, h, 6); ink(ctx, null, 5); }
function skyline(ctx, x0, x1, y, seed = 0, night = false) { const cols = night ? ['#3A4A6A', '#2E3A58', '#46557A'] : ['#9CC3E0', '#B9D4E8', '#86AFCF', '#A8C8DE']; for (let x = x0, i = 0; x < x1; i++) { const w = 160 + hash(i * 3.7 + seed) * 140, h = 380 + hash(i * 5.1 + seed) * 520; tower(ctx, x, y, w, h, cols[i % cols.length]);
    if (night) for (let k = 0; k < 10; k++) { const v = hash(i * 31 + k); if (v > 0.5) { rr(ctx, x + 14 + (k % 3) * (w / 3), y - h + 30 + Math.floor(k / 3) * 70, w / 4, 30, 3); ink(ctx, '#F7D27A', 0); } } x += w + 20; } }
function shopRow(ctx, x0, y, list) { let x = x0; for (const s of list) { const w = s.w || 460, h = s.h || 520; rr(ctx, x, y - h, w, h, 4); ink(ctx, s.col || '#E9E3D6', 6); L.shade(ctx, () => rr(ctx, x, y - h, w, h, 4), 1, 0.08);
    rr(ctx, x + 18, y - h + 26, w - 36, 64, 6); ink(ctx, s.signCol || BLUE, 5); fitText(ctx, s.sign || '', x + w / 2, y - h + 59, 38, s.signFg || CREAM, w - 70);
    rr(ctx, x + 26, y - h + 120, w * 0.6, h - 140, 6); ink(ctx, '#BFE3F0', 5); ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#FFF'; poly(ctx, [[x + 50, y - h + 130], [x + 100, y - h + 130], [x + 50, y - h + 220]]); ctx.fill(); ctx.restore();
    rr(ctx, x + w * 0.7, y - h + 120, w * 0.22, h - 120, 4); ink(ctx, s.door || '#5A6A7A', 5);
    if (s.awning) { const ay = y - h + 100; poly(ctx, [[x + 10, ay - 10], [x + w - 10, ay - 10], [x + w + 10, ay + 50], [x - 10, ay + 50]]); ctx.save(); ctx.clip(); L.stripes(ctx, x - 20, ay - 20, w + 40, 80, s.awning[0], s.awning[1], 30); ctx.restore(); poly(ctx, [[x + 10, ay - 10], [x + w - 10, ay - 10], [x + w + 10, ay + 50], [x - 10, ay + 50]]); ink(ctx, null, 5); }
    x += w + (s.gap ?? 24); } }
function road(ctx, x, y, w, h, t = 0) { ctx.fillStyle = '#5A5C64'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#F6EBD3'; for (let i = 0; i < w / 220; i++) ctx.fillRect(x + i * 220, y + h * 0.48, 120, 12); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ink(ctx, null, 4); }
function pavement(ctx, x, y, w, h) { ctx.fillStyle = '#D6CFC2'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 3; for (let i = 0; i * 150 < w; i++) { ctx.beginPath(); ctx.moveTo(x + i * 150, y); ctx.lineTo(x + i * 150 - 120, y + h); ctx.stroke(); } for (let j = 1; j < h / 90; j++) { ctx.beginPath(); ctx.moveTo(x, y + j * 90); ctx.lineTo(x + w, y + j * 90); ctx.stroke(); }
  ctx.fillStyle = '#A9A398'; ctx.fillRect(x, y, w, 16); ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + w, y + 16); ink(ctx, null, 4); }
function cafeTable(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -8, -300, 16, 300, 5); ink(ctx, '#C9CDD2', 4); poly(ctx, [[-260, -300], [260, -300], [150, -400], [-150, -400]]); ctx.save(); ctx.clip(); L.stripes(ctx, -270, -410, 540, 120, RED, CREAM, 44); ctx.restore(); poly(ctx, [[-260, -300], [260, -300], [150, -400], [-150, -400]]); ink(ctx, null, 5);
  rr(ctx, -10, -150, 20, 150, 5); ink(ctx, '#3A3438', 4); ell(ctx, 0, -2, 60, 10); ink(ctx, '#3A3438', 4); ell(ctx, 0, -150, 120, 18); ink(ctx, '#F4F0E6', 5);
  rr(ctx, 30, -186, 40, 34, 8); ink(ctx, '#FFFFFF', 4); ctx.beginPath(); ctx.arc(74, -170, 11, -1.4, 1.4); ink(ctx, null, 4);
  for (let i = 0; i < 2; i++) { const ph = (t * 0.6 + i * 0.5) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.6; L.cloud(ctx, 50 + Math.sin(ph * 6 + i) * 8, -200 - ph * 70, 0.12 + ph * 0.1, '#FFFFFF'); ctx.restore(); }
  ctx.restore(); }
function hydrant(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -40, -150, 80, 150, 16); ink(ctx, RED, 5); L.shade(ctx, () => rr(ctx, -40, -150, 80, 150, 16), 1, 0.15); ell(ctx, 0, -150, 44, 20); ink(ctx, darken(RED, 0.85), 5); rr(ctx, -64, -110, 128, 30, 10); ink(ctx, RED, 5); rr(ctx, -54, -10, 108, 14, 4); ink(ctx, '#8A2A2A', 4); ctx.restore(); }
function bird(ctx, x, y, s, t) { const f = Math.sin(t * 18) * 0.6; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-34, -f * 30); ctx.quadraticCurveTo(-14, -16, 0, 0); ctx.quadraticCurveTo(14, -16, 34, -f * 30); ink(ctx, null, 6); ctx.restore(); }

// ---------- close-up hand (mitten) + opener ----------
function bigHand(ctx, x, y, s, rot, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const skin = o.skin || L.SKIN[1], sl = o.sleeve || '#2F6DB5';
  rr(ctx, 60, -70, 700, 140, 40); ink(ctx, sl, 6); L.shade(ctx, () => rr(ctx, 60, -70, 700, 140, 40), 1, 0.12); rr(ctx, 40, -80, 60, 160, 18); ink(ctx, o.cuff || lighten(sl, 0.3), 5);
  rr(ctx, -150, -95, 220, 190, 80); ink(ctx, skin, 6); L.shade(ctx, () => rr(ctx, -150, -95, 220, 190, 80), 1, 0.1);
  if (o.fist !== false) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-150 + 10, -50 + i * 48); ctx.quadraticCurveTo(-110, -44 + i * 48, -80, -52 + i * 48); ctx.lineWidth = 4; ctx.strokeStyle = darken(skin, 0.7); ctx.stroke(); }
  ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#FFF'; ell(ctx, -60, -60, 50, 18, -0.2); ctx.fill(); ctx.restore(); ctx.restore(); }
function opener(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -20, -40, 420, 80, 30); ink(ctx, '#C9CDD2', 6); ctx.beginPath(); ctx.arc(30, 0, 24, 0, 6.27); ink(ctx, '#7A7E86', 4); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFF'; rr(ctx, 70, -28, 300, 12, 6); ctx.fill(); ctx.restore(); ctx.restore(); }
function cap(ctx, x, y, s, rot, col = '#D8B04A') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); for (let i = 0; i < 21; i++) { const a = i / 21 * 6.283, r = i % 2 ? 46 : 52; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.45); } ctx.closePath(); ink(ctx, col, 5); ell(ctx, 0, -6, 36, 12); ink(ctx, lighten(col, 0.25), 3); ctx.restore(); }
function bokeh(ctx, x0, y0, w, h, t, cols, n = 26, seed = 0) { for (let i = 0; i < n; i++) { const v = hash(i * 3.3 + seed), u = hash(i * 7.9 + seed); ctx.save(); ctx.globalAlpha = 0.18 + u * 0.22; ctx.beginPath(); ctx.arc(x0 + v * w + Math.sin(t * 0.6 + i) * 20, y0 + u * h, 40 + hash(i * 5 + seed) * 90, 0, 6.27); ctx.fillStyle = cols[i % cols.length]; ctx.fill(); ctx.restore(); } }
function fizzSpray(ctx, x, y, u, s = 1, n = 30) { if (u <= 0 || u >= 1) return; ctx.save(); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (hash(i * 2.1) - 0.5) * 1.6, v = (300 + hash(i * 4.3) * 700) * s, d = E.out(u) * v; ctx.globalAlpha = 1 - u;
  ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + u * u * 300 * s, (6 + hash(i) * 14) * s, 0, 6.27); ink(ctx, i % 3 ? '#FFF8EA' : '#C9864A', 3); } ctx.restore(); }

// ---------- subway ----------
function subwayCar(ctx, t, o = {}) { ctx.fillStyle = '#C9D1DC'; ctx.fillRect(-2400, -1100, 4800, 1500);
  for (let i = 0; i < 6; i++) { const wx = -2100 + i * 760; rr(ctx, wx, -560, 560, 360, 30); ink(ctx, '#1E2440', 7); ctx.save(); rr(ctx, wx, -560, 560, 360, 30); ctx.clip();
      for (let k = 0; k < 6; k++) { const ph = ((t * 2.2 + hash(k * 3 + i)) % 1), lx = wx + 560 - ph * 900; ctx.fillStyle = '#F7D27A'; ctx.globalAlpha = 0.8; ctx.fillRect(lx, -460 + k * 50, 160, 8); } ctx.globalAlpha = 1;
      ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFF'; poly(ctx, [[wx + 40, -560], [wx + 140, -560], [wx + 40, -380]]); ctx.fill(); ctx.globalAlpha = 1; ctx.restore(); rr(ctx, wx, -560, 560, 360, 30); ink(ctx, null, 7); }
  for (let i = 0; i < 6; i++) { const ax = -2100 + i * 760; rr(ctx, ax + 40, -760, 480, 120, 8); ink(ctx, ['#F7C548', '#E8622E', '#2F8A6A', '#8A5AA8', '#2F6DB5', '#D93A35'][i], 5); fitText(ctx, ['CITY LINE', 'NEXT STOP', 'MIND THE GAP', 'LINE 2', 'EXPRESS', 'DOWNTOWN'][i], ax + 280, -700, 46, CREAM, 440); }
  rr(ctx, -2400, -820, 4800, 26, 6); ink(ctx, '#9AA4B0', 4); rr(ctx, -2400, -120, 4800, 18, 4); ink(ctx, '#9AA4B0', 4);
  for (let i = 0; i < 12; i++) { rr(ctx, -2300 + i * 380, -40, 340, 120, 20); ink(ctx, '#2F6DB5', 5); rr(ctx, -2300 + i * 380, 70, 340, 50, 12); ink(ctx, '#24548C', 5); }
  ctx.fillStyle = '#7A808A'; ctx.fillRect(-2400, 330, 4800, 900); ctx.beginPath(); ctx.moveTo(-2400, 330); ctx.lineTo(2400, 330); ink(ctx, null, 5); }
function pole(ctx, x, y0, y1) { rr(ctx, x - 16, y0, 32, y1 - y0, 14); ink(ctx, '#D8DDE3', 6); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFF'; rr(ctx, x - 8, y0 + 10, 7, y1 - y0 - 20, 4); ctx.fill(); ctx.restore(); }

// ---------- top-down people (seen from above) ----------
function topPerson(ctx, x, y, s, i, t, popT) { const v = hash(i * 1.37), u = hash(i * 2.91), w = hash(i * 4.4);
  const tops = ['#D93A35', '#2F6DB5', '#F7C548', '#2F8A6A', '#8A5AA8', '#E07A3A', '#4A4F5C', '#F4F0E6', '#C46A9A'], hcols = ['#2B1E16', '#5A3A22', '#151313', '#D9B25A', '#A4462A', '#A9A49C'];
  ctx.save(); ctx.translate(x, y); ctx.rotate(v * 6.28); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#000'; ell(ctx, 10, 12, 50, 34); ctx.fill(); ctx.restore();
  ell(ctx, 0, 0, 46, 28); ink(ctx, tops[Math.floor(v * tops.length)], 4);
  const raise = popT === undefined ? 0 : clamp((t - popT + 0.4) / 0.3), skin = L.SKIN[Math.floor(u * L.SKIN.length)];
  // arm up with a bottle (seen from above: the bottle is a circle with a cap)
  const ax = 34, ay = -26 - raise * 18; ctx.beginPath(); ctx.moveTo(30, -6); ctx.lineTo(ax, ay); ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 11; ctx.strokeStyle = tops[Math.floor(v * tops.length)]; ctx.stroke();
  ctx.beginPath(); ctx.arc(ax, ay, 16, 0, 6.27); ink(ctx, 'rgba(190,230,215,0.8)', 3.5); ctx.beginPath(); ctx.arc(ax, ay, 9, 0, 6.27); ink(ctx, popT !== undefined && t > popT ? '#3B1F12' : '#D8B04A', 3);
  if (popT !== undefined) { const pu = clamp((t - popT) / 0.5); if (pu > 0 && pu < 1) { ctx.save(); ctx.globalAlpha = 1 - pu; ctx.beginPath(); ctx.arc(ax, ay, 14 + pu * 40, 0, 6.27); ctx.lineWidth = 5; ctx.strokeStyle = '#FFF8EA'; ctx.stroke(); ctx.restore(); } }
  ctx.beginPath(); ctx.arc(-30, 4, 12, 0, 6.27); ink(ctx, skin, 3.5);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.27); ink(ctx, skin, 4); ctx.beginPath(); ctx.arc(-3, 2, 20, 0, 6.27); ctx.fillStyle = hcols[Math.floor(u * hcols.length)]; ctx.fill(); if (w > 0.8) { ctx.beginPath(); ctx.arc(0, 0, 24, 0, 6.27); ink(ctx, ['#F7C548', RED, BLUE][Math.floor(u * 3)], 4); }
  ctx.restore(); }
function plazaTop(ctx, x0, y0, w, h, t) { L.tiles(ctx, x0, y0, w, h, '#E3D9C6', '#D2C6AE', 90); ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 2; for (let i = 0; i * 90 < w; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * 90, y0); ctx.lineTo(x0 + i * 90, y0 + h); ctx.stroke(); } ctx.restore();
  // fountain (top view)
  ctx.beginPath(); ctx.arc(0, 0, 230, 0, 6.27); ink(ctx, '#C9C1B0', 7); ctx.beginPath(); ctx.arc(0, 0, 190, 0, 6.27); ink(ctx, '#6FB4D8', 5);
  for (let k = 0; k < 4; k++) { const ph = (t * 0.6 + k / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(0, 0, 40 + ph * 140, 0, 6.27); ctx.lineWidth = 4; ctx.strokeStyle = '#E3F3FA'; ctx.stroke(); ctx.restore(); } ctx.beginPath(); ctx.arc(0, 0, 36, 0, 6.27); ink(ctx, '#C9C1B0', 5);
  for (const [tx, ty] of [[-1500, -800], [1500, -800], [-1500, 800], [1500, 800], [-2300, 0], [2300, 0]]) { for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + t * 0.2; ctx.beginPath(); ctx.arc(tx + Math.cos(a) * 60, ty + Math.sin(a) * 60, 90, 0, 6.27); ink(ctx, k % 2 ? '#3E8E4A' : '#5FA85A', 5); } } }

// ---------- the planet with a ring of bottles ----------
function stars(ctx, x0, y0, w, h, t, n = 120) { for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x0 + hash(i) * w, y0 + hash(i * 2.3) * h, 1.5 + hash(i * 5) * 3 + Math.sin(t * 3 + i) * 0.8, 0, 6.27); ctx.fillStyle = '#F6EBD3'; ctx.globalAlpha = 0.5 + hash(i * 7) * 0.5; ctx.fill(); } ctx.globalAlpha = 1; }
const LANDS = [[-0.55, -0.35, 0.34, 0.22, 0.3], [-0.38, 0.28, 0.17, 0.3, 0.2], [0.12, -0.32, 0.4, 0.2, -0.2], [0.18, 0.18, 0.2, 0.28, 0.1], [0.62, 0.38, 0.18, 0.12, 0.4], [-0.9, -0.05, 0.12, 0.2, 0], [0.9, -0.15, 0.2, 0.16, 0.2]];
function planet(ctx, x, y, r, t, o = {}) { ctx.save(); ctx.translate(x, y); L.glow(ctx, 0, 0, r * 1.5, '#7FC3FF', 0.35);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#3F8FD8', 8); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ctx.clip();
  for (const [lx, ly, rx, ry, rot] of LANDS) { const xx = ((lx + t * 0.05 + 1.5) % 2.2 - 1.1) * r; ell(ctx, xx, ly * r, rx * r, ry * r, rot); ink(ctx, '#7CC36A', 5); ell(ctx, xx - rx * r * 0.3, ly * r - ry * r * 0.2, rx * r * 0.4, ry * r * 0.35, rot); ink(ctx, '#5FA85A', 0); }
  for (let i = 0; i < 6; i++) { const cx = ((hash(i * 3) * 2 + t * 0.09) % 2.4 - 1.2) * r; L.cloud(ctx, cx, (hash(i * 7) - 0.5) * r * 1.4, r / 420, 'rgba(255,255,255,0.8)'); }
  ctx.globalAlpha = 0.3; ctx.fillStyle = '#0A1030'; ctx.beginPath(); ctx.arc(r * 0.45, r * 0.3, r * 1.1, 0, 6.27); ctx.fill(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; ell(ctx, -r * 0.45, -r * 0.5, r * 0.25, r * 0.12, -0.6); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 8); ctx.restore(); }
// ring of bottles: half = 'back' | 'front'
function bottleRing(ctx, x, y, rx, ry, tilt, t, half, n = 64, spin = 0.25) { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + t * spin, sn = Math.sin(a); if ((half === 'back') !== (sn < 0)) continue; const bx = Math.cos(a) * rx, by = sn * ry, k = 0.8 + sn * 0.22;
    sb(ctx, bx, by, 0.5 * k * (1 + hash(i) * 0.2), -a + Math.PI / 2 + hash(i * 3) * 0.6, hash(i * 9) > 0.85 ? 'straight' : 'contour'); }
  ctx.restore(); }

// ---------- panel grid ("and someone else") ----------
const THEMES = [ // bg, ground, deco
  { sky: ['#7FC3E8', '#D8F0F7'], gr: '#F2D9A0', deco: 'sun' }, { sky: ['#1E2A44', '#3A4A6A'], gr: '#2E3440', deco: 'city' }, { sky: ['#E8EEF4', '#FFFFFF'], gr: '#F4F7FA', deco: 'snow' },
  { sky: ['#FFB070', '#FFE0A0'], gr: '#E9B97A', deco: 'cactus' }, { sky: ['#DDE6EE', '#CCD8E2'], gr: '#B9A88E', deco: 'office' }, { sky: ['#3FA9F5', '#BDE8FF'], gr: '#3E8E4A', deco: 'stadium' },
  { sky: ['#F6E2B8', '#EAB979'], gr: '#B98A55', deco: 'sun' }, { sky: ['#2E2440', '#7A4B5A'], gr: '#5A3A24', deco: 'city' }];
const PANEL_LOOKS = [LOOKS.woman, LOOKS.kid, LOOKS.shopper, LOOKS.worker, { skin: L.SKIN[5], hair: { style: 'bun', col: '#151313' }, top: '#E07A3A', pants: '#3A3A48' },
  { skin: L.SKIN[0], hair: { style: 'bald', col: '#A9A49C' }, stache: 1, stacheCol: '#A9A49C', glasses: 'round', top: '#8A5AA8', pants: '#3A3A48' }, { skin: L.SKIN[2], hair: { style: 'curly', col: '#2B1E16' }, top: '#2F8A6A', pants: '#2F4A6A', hat: 'cap', hatCol: '#F7C548' },
  { skin: L.SKIN[3], hair: { style: 'long', col: '#151313' }, top: '#F7C548', pants: '#2F6DB5' }, { skin: L.SKIN[6], hair: { style: 'short', col: '#D9B25A' }, top: '#2F6DB5', top2: '#F4F0E6', tie: RED, pants: '#2A3140' }];
function panel(ctx, x, y, w, h, i, t) { const th = THEMES[i % THEMES.length], lk = PANEL_LOOKS[Math.floor(hash(i * 5.3) * PANEL_LOOKS.length)];
  ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip(); L.skyGrad(ctx, x, y, w, h, th.sky); ctx.fillStyle = th.gr; ctx.fillRect(x, y + h * 0.72, w, h * 0.3);
  if (th.deco === 'sun') { ctx.beginPath(); ctx.arc(x + w * 0.8, y + h * 0.22, h * 0.1, 0, 6.27); ink(ctx, YELLOW, 3); }
  if (th.deco === 'city') for (let k = 0; k < 5; k++) { rr(ctx, x + k * w * 0.22, y + h * (0.3 + hash(k + i) * 0.2), w * 0.18, h, 3); ink(ctx, '#46557A', 2); }
  if (th.deco === 'snow') for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.arc(x + hash(k * 3 + i) * w, y + ((hash(k * 7) + t * 0.3) % 1) * h, 3 + hash(k) * 3, 0, 6.27); ctx.fillStyle = '#9CC3E0'; ctx.fill(); }
  if (th.deco === 'cactus') { rr(ctx, x + w * 0.82, y + h * 0.35, w * 0.06, h * 0.5, 8); ink(ctx, '#3E8E4A', 3); }
  if (th.deco === 'office') { rr(ctx, x + w * 0.62, y + h * 0.1, w * 0.3, h * 0.25, 4); ink(ctx, '#9CC7E8', 3); }
  if (th.deco === 'stadium') for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(x + k * w / 13, y + h * 0.3 + (k % 2) * 8 + Math.sin(t * 8 + k) * 3, h * 0.04, 0, 6.27); ink(ctx, ['#D93A35', '#F7C548', '#2F6DB5'][k % 3], 2); }
  const s = h / 260, hx = x + w * (0.42 + (hash(i) - 0.5) * 0.12), hy = y + h * 0.42;
  toonHead(ctx, hx, hy, s, lk, { la: [0.18, 0.1], ra: [2.6, 1.83] }, hash(i * 2) > 0.5 ? 'happy' : 'grin', { t: t + i, seed: i, flip: hash(i * 8) > 0.5, itemR: (g, ang) => { g.rotate(ang - 2.2); P.bottle(g, 0, 70, 0.42, { open: true, fill: 0.6 }); } });
  ctx.restore(); rr(ctx, x, y, w, h, 8); ink(ctx, null, 5); }

// ---------- 1880s drugstore (from c1 pembkit) ----------
function jar(ctx, x, y, w, h, col, label, o = {}) { ctx.save(); ctx.translate(x, y);
  rr(ctx, -w / 2, -h, w, h, w * 0.22); ink(ctx, col, 4); L.shade(ctx, () => rr(ctx, -w / 2, -h, w, h, w * 0.22), 1, 0.14);
  rr(ctx, -w * 0.32, -h - 14, w * 0.64, 16, 5); ink(ctx, o.lid || '#3A2A1E', 4); ctx.beginPath(); ctx.arc(0, -h - 18, w * 0.12, 0, 6.27); ink(ctx, o.lid || '#3A2A1E', 3);
  if (label) { rr(ctx, -w * 0.38, -h * 0.62, w * 0.76, h * 0.3, 3); ink(ctx, CREAM, 3); fitText(ctx, label, 0, -h * 0.47, Math.min(18, h * 0.18), INK, w * 0.68); }
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; rr(ctx, -w * 0.36, -h * 0.9, w * 0.1, h * 0.6, 3); ctx.fill(); ctx.restore(); ctx.restore(); }
function showGlobe(ctx, x, y, s, col, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -16, -40, 32, 40, 6); ink(ctx, '#C9A44A', 4); ell(ctx, 0, -110, 70, 78); ink(ctx, col, 5);
  ctx.save(); ell(ctx, 0, -110, 70, 78); ctx.clip(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF'; ell(ctx, -26, -140, 14, 30, 0.4); ctx.fill(); ctx.restore();
  rr(ctx, -12, -205, 24, 30, 6); ink(ctx, col, 4); poly(ctx, [[-22, -205], [22, -205], [0, -250]]); ink(ctx, '#C9A44A', 4); L.glow(ctx, 0, -110, 120, col, 0.18 + Math.sin(t * 2) * 0.04); ctx.restore(); }
function gasLamp(ctx, x, y, t, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -200); ctx.lineTo(0, -40); ink(ctx, null, 5); rr(ctx, -30, -50, 60, 16, 6); ink(ctx, '#C9A44A', 4);
  ctx.beginPath(); ctx.moveTo(-28, -36); ctx.quadraticCurveTo(-34, 14, 0, 22); ctx.quadraticCurveTo(34, 14, 28, -36); ctx.closePath(); ink(ctx, '#FBE3A6', 4); L.glow(ctx, 0, -6, 260 + Math.sin(t * 9) * 8, '#FFC870', 0.38); ctx.restore(); }
const JARLAB = ['SAL', 'IPEC', 'CAMPH', 'ZINC', 'MYRRH', 'ALOE', 'ANISE', 'MENTH', 'SODA', 'IODINE', 'BORAX', 'GINGER'];
function drugWall(ctx, t, o = {}) { const seed = o.seed || 0;
  L.wallpaper(ctx, -2400, -1100, 4800, 1320, o.wall || '#6E3A2C', o.dot || '#84483A', 52);
  for (let b = 0; b < 5; b++) { const bx = -2200 + b * 870; rr(ctx, bx, -760, 760, 820, 8); ink(ctx, '#5A3420', 6); L.planks(ctx, bx + 10, -750, 740, 800, '#6B4123', { vertical: true, pw: 60 });
    rr(ctx, bx - 14, -790, 788, 44, 6); ink(ctx, '#4A2A18', 5); if (o.signs && o.signs[b]) fitText(ctx, o.signs[b], bx + 380, -768, 28, '#F2D27A', 700);
    for (let r = 0; r < 4; r++) { const yy = -560 + r * 200; rr(ctx, bx + 4, yy, 752, 14, 3); ink(ctx, '#8A5A33', 4);
      let xx = bx + 40, i = 0; while (xx < bx + 700) { const v = hash(b * 311 + r * 97 + i * 13 + seed), w = 54 + v * 34, h = 90 + v * 70, col = ['#B7D7C9', '#E3C77D', '#C46A4A', '#8FB6D8', '#D9D2C2', '#9C6AA8', '#5F8F5F', '#E8E1D2'][Math.floor(v * 8)];
        if (xx + w > bx + 740) break; jar(ctx, xx + w / 2, yy, w, h, col, JARLAB[Math.floor(hash(i * 7 + r + b * 5 + seed) * JARLAB.length)]); xx += w + 14; i++; } } }
  if (o.lamps !== false) for (const lx of [-1300, -430, 440, 1310]) gasLamp(ctx, lx, -700, t + lx, 1); }
function counter(ctx, x, y, w, o = {}) { rr(ctx, x, y, w, 520, 6); ink(ctx, '#7A4A2A', 6); L.planks(ctx, x + 6, y + 30, w - 12, 484, '#7A4A2A', { vertical: true, pw: 70 });
  for (let i = 0; i < Math.floor(w / 300); i++) { rr(ctx, x + 40 + i * 300, y + 80, 240, 220, 10); ink(ctx, '#6B4123', 5); rr(ctx, x + 60 + i * 300, y + 100, 200, 180, 8); ink(ctx, '#8A5A33', 4); }
  rr(ctx, x - 20, y - 10, w + 40, 40, 8); ink(ctx, o.top || '#E8E1D2', 6); ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = '#9A9488'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 12, y - 6); ctx.quadraticCurveTo(x + i * w / 12 + 40, y + 10, x + i * w / 12 + 90, y + 26); ctx.stroke(); } ctx.restore(); }
function sodaTap(ctx, x, y, s, open = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -22, -300, 44, 300, 12); ink(ctx, '#C9CDD2', 6); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFF'; rr(ctx, -12, -290, 9, 280, 4); ctx.fill(); ctx.restore();
  rr(ctx, -10, -300, 130, 30, 12); ink(ctx, '#C9CDD2', 5); rr(ctx, 100, -300, 26, 60, 8); ink(ctx, '#C9CDD2', 5);
  ctx.save(); ctx.translate(0, -300); ctx.rotate(-0.3 - open * 0.7); rr(ctx, -10, -150, 20, 150, 8); ink(ctx, '#2E2A28', 5); ell(ctx, 0, -160, 22, 26); ink(ctx, '#D8B04A', 5); ctx.restore(); ell(ctx, 0, -310, 40, 14); ink(ctx, '#D8B04A', 5); ctx.restore(); }
function chalkTally(ctx, x, y, w, h, n, title) { rr(ctx, x - 16, y - 16, w + 32, h + 32, 10); ink(ctx, '#7A4A2A', 7); rr(ctx, x, y, w, h, 6); ink(ctx, '#2E3A34', 4); fitText(ctx, title, x + w / 2, y + 44, 40, '#F2EEE4', w - 40, { font: L.F.type });
  ctx.save(); ctx.strokeStyle = '#F2EEE4'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), k = i % 5, gx = x + 50 + g * 190; ctx.beginPath(); if (k < 4) { ctx.moveTo(gx + k * 34, y + 100); ctx.lineTo(gx + k * 34 + 4, y + h - 40); } else { ctx.moveTo(gx - 16, y + h - 60); ctx.lineTo(gx + 130, y + 110); } ctx.stroke(); } ctx.restore(); }
function horseBuggy(ctx, x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); const ph = t * 8, hc = o.horse || '#8A5A33';
  const wheel = (wx, r) => { ctx.save(); ctx.translate(wx, -r); ctx.rotate(t * 5); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 6); for (let i = 0; i < 8; i++) { ctx.rotate(0.785); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); };
  rr(ctx, -360, -190, 200, 80, 10); ink(ctx, '#2E2A28', 5); ctx.beginPath(); ctx.moveTo(-360, -190); ctx.quadraticCurveTo(-330, -300, -200, -290); ctx.lineTo(-200, -190); ctx.closePath(); ink(ctx, '#3A3438', 5);
  toon(ctx, -250, -150, 0.5, { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#5A4A3A', pants: '#3A3A48', hat: 'bowler', hatCol: '#3A2A24' }, 'hold', 'happy', { t, noShadow: true });
  wheel(-320, 70); wheel(-190, 56); ctx.beginPath(); ctx.moveTo(-160, -130); ctx.lineTo(0, -150); ink(ctx, null, 6);
  for (let i = 0; i < 4; i++) { const lx = [10, 40, 140, 170][i], a = Math.sin(ph + i * 1.6) * 0.35; ctx.save(); ctx.translate(lx, -130); ctx.rotate(a); rr(ctx, -9, 0, 18, 125, 8); ink(ctx, darken(hc, i % 2 ? 0.85 : 1), 4); rr(ctx, -11, 112, 22, 16, 4); ink(ctx, '#2A1E18', 3); ctx.restore(); }
  ell(ctx, 90, -170, 110, 55); ink(ctx, hc, 5); L.shade(ctx, () => ell(ctx, 90, -170, 110, 55), 1, 0.14);
  ctx.save(); ctx.translate(190, -200); ctx.rotate(-0.6 + Math.sin(ph) * 0.05); rr(ctx, -20, -90, 50, 110, 20); ink(ctx, hc, 5); ctx.restore();
  ctx.save(); ctx.translate(240, -290 + Math.sin(ph) * 3); ctx.rotate(0.35); rr(ctx, -25, -30, 90, 52, 22); ink(ctx, hc, 5); ctx.beginPath(); ctx.arc(10, -14, 6, 0, 6.27); ctx.fillStyle = INK; ctx.fill(); poly(ctx, [[-14, -26], [-6, -56], [4, -28]]); ink(ctx, hc, 4); ctx.restore();
  ctx.beginPath(); ctx.moveTo(175, -235); ctx.quadraticCurveTo(140, -250, 120, -215); ctx.lineWidth = 14; ctx.strokeStyle = '#2E2016'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
function oldSkyline(ctx, col = '#4A3448') { for (let i = 0; i < 14; i++) { const x = -2600 + i * 380, h = 300 + hash(i * 5.3) * 300; rr(ctx, x, 120 - h, 330, h + 100, 4); ink(ctx, darken(col, 0.88 + hash(i) * 0.12), 4);
    for (let r = 0; r < h / 90 - 1; r++) for (let c = 0; c < 3; c++) { rr(ctx, x + 36 + c * 96, 150 - h + r * 90, 50, 54, 4); ink(ctx, hash(i * 9 + r * 3 + c) > 0.45 ? '#F7D27A' : '#2E2430', 2.5); } } }

// ---------- 1899: desk seen from above ----------
function dollarBill(ctx, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.save(); ctx.translate(10, 14); ctx.globalAlpha = 0.3; rr(ctx, -200, -86, 400, 172, 10); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -200, -86, 400, 172, 10); ink(ctx, '#B5D3A0', 6); rr(ctx, -180, -68, 360, 136, 6); ink(ctx, null, 3); ell(ctx, 0, 0, 56, 58); ink(ctx, '#9BC48A', 4); fitText(ctx, '$1', 0, 4, 62, '#2E5A2A', 100);
  for (const [cx, cy] of [[-150, -42], [150, -42], [-150, 42], [150, 42]]) fitText(ctx, '1', cx, cy, 40, '#2E5A2A', 40); fitText(ctx, 'ONE DOLLAR', 0, 76, 20, '#2E5A2A', 200, { font: L.F.type }); ctx.restore(); }
function contract(ctx, x, y, s, rot = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.save(); ctx.translate(14, 18); ctx.globalAlpha = 0.3; rr(ctx, -230, -300, 460, 600, 6); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -230, -300, 460, 600, 6); ink(ctx, '#F4ECD8', 6); fitText(ctx, 'AGREEMENT', 0, -240, 44, INK, 400, { font: L.F.type }); fitText(ctx, o.title || 'BOTTLING RIGHTS', 0, -180, 40, RED, 400);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-180, -110 + i * 36); ctx.lineTo(180 - (i % 3) * 50, -110 + i * 36); ctx.lineWidth = 5; ctx.strokeStyle = '#A8987C'; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-180, 240); ctx.lineTo(-10, 240); ctx.moveTo(30, 240); ctx.lineTo(190, 240); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  if (o.sign) { ctx.beginPath(); const n = Math.floor(o.sign * 30); for (let i = 0; i <= n; i++) { const k = i / 30; const px = 40 + k * 140, py = 226 + Math.sin(k * 22) * 14 - k * 10; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.lineWidth = 5; ctx.strokeStyle = '#1E2A5A'; ctx.stroke(); }
  if (o.glow) L.glow(ctx, 0, 0, 520, '#FFE38A', o.glow * 0.5); ctx.restore(); }
function deskTop(ctx, x0, y0, w, h) { L.planks(ctx, x0, y0, w, h, '#7A4A2A', { pw: 90 }); ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.fillRect(x0, y0, w, h); ctx.restore();
  rr(ctx, -900, -520, 1800, 1040, 20); ink(ctx, '#2E5A3E', 7); rr(ctx, -870, -490, 1740, 980, 14); ink(ctx, null, 3); }
function inkwell(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 6.27); ink(ctx, '#C9A44A', 6); ctx.beginPath(); ctx.arc(0, 0, 40, 0, 6.27); ink(ctx, '#1E1A2E', 5); ctx.restore(); }
function pen(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -20, -220, 40, 260, 16); ink(ctx, '#2E2A28', 5); poly(ctx, [[-18, 40], [18, 40], [0, 100]]); ink(ctx, '#D8B04A', 4); ctx.restore(); }
function specs(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 60, 0, 46, 0, 6.27); ink(ctx, 'rgba(220,240,245,0.35)', 7); } ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(0, -24, 14, -6); ink(ctx, null, 7); ctx.restore(); }
function pocketWatch(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.27); ink(ctx, '#D8B04A', 7); ctx.beginPath(); ctx.arc(0, 0, 62, 0, 6.27); ink(ctx, CREAM, 4); for (const [a, l] of [[t * 0.4, 30], [t * 4, 48]]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -l); ink(ctx, null, 6); ctx.restore(); }
  ctx.beginPath(); for (let i = 0; i < 14; i++) { ctx.arc(-80 - i * 24, 30 + Math.sin(i) * 14, 9, 0, 6.27); } ink(ctx, '#C9A44A', 3); ctx.restore(); }

// ---------- 1985 ----------
function sign(ctx, x, y, w, h, text, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); rr(ctx, -9, h / 2 - 10, 18, o.stick ?? 260, 4); ink(ctx, '#8A5A33', 4); rr(ctx, -w / 2, -h / 2, w, h, 6); ink(ctx, o.bg || CREAM, 6);
  const lines = text.split('|'); lines.forEach((ln, i) => fitText(ctx, ln, 0, (i - (lines.length - 1) / 2) * h * 0.38, h * (lines.length > 1 ? 0.3 : 0.42), o.fg || RED, w - 30)); ctx.restore(); }
function markerPath(ctx, pts, u, col = RED, w = 12) { const n = Math.max(2, Math.floor(pts.length * clamp(u))); if (u <= 0) return; ctx.save(); ctx.beginPath(); for (let i = 0; i < n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w + 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); }
function stamp(ctx, s, x, y, u, o = {}) { if (u <= 0) return; const k = u < 1 ? 1 + (1 - E.out(clamp(u))) * 1.6 : 1; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3);
  const size = o.size || 80; ctx.font = `${size}px ${L.F.black}`; const w = Math.min(ctx.measureText(s).width + size * 0.8, o.maxW || 1600), h = size * 1.5;
  rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = 'rgba(246,235,211,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = o.col || RED; ctx.stroke(); rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8); ctx.lineWidth = 4; ctx.stroke();
  fitText(ctx, s, 0, 4, size, o.col || RED, w - size * 0.6); ctx.restore(); }
function beaker(ctx, x, y, s, col, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sh = () => { ctx.beginPath(); ctx.moveTo(-60, -180); ctx.lineTo(-60, -10); ctx.quadraticCurveTo(-60, 0, -50, 0); ctx.lineTo(50, 0); ctx.quadraticCurveTo(60, 0, 60, -10); ctx.lineTo(60, -180); ctx.closePath(); };
  ctx.save(); sh(); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-70, -110, 140, 120); for (let i = 0; i < 6; i++) { const ph = (t * 1.3 + i * 0.29) % 1; ctx.beginPath(); ctx.arc(-40 + hash(i * 3) * 80, -10 - ph * 100, 5, 0, 6.27); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); } ctx.restore();
  sh(); ink(ctx, 'rgba(220,240,240,0.25)', 5); for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-60, -40 * i); ctx.lineTo(-30, -40 * i); ink(ctx, null, 3); } ctx.restore(); }
function hq(ctx, x, y, w, h) { rr(ctx, x - w / 2, y - h, w, h, 6); ink(ctx, '#C9D1DC', 6); L.shade(ctx, () => rr(ctx, x - w / 2, y - h, w, h, 6), 1, 0.12); for (let r = 0; r < Math.floor(h / 70) - 1; r++) for (let c = 0; c < Math.floor(w / 70); c++) { rr(ctx, x - w / 2 + 20 + c * 70, y - h + 90 + r * 70, 44, 40, 3); ink(ctx, '#7FB2E5', 3); }
  rr(ctx, x - w / 2 + 20, y - h + 16, w - 40, 56, 6); ink(ctx, RED, 4); fitText(ctx, 'HEADQUARTERS', x, y - h + 45, 36, CREAM, w - 60); rr(ctx, x - 60, y - 110, 120, 110, 4); ink(ctx, '#5A6A7A', 5); }

// ---------- WWII: crane, factory, ships ----------
function factory(ctx, x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); // y = bottom
  L.bricks(ctx, -360, -380, 720, 380, '#9A5B44', { bw: 52, bh: 22 }); rr(ctx, -360, -380, 720, 380, 4); ink(ctx, null, 6);
  for (let i = 0; i < 3; i++) poly(ctx, [[-360 + i * 240, -380], [-360 + i * 240 + 120, -470], [-120 + i * 240, -380]]), ink(ctx, '#7E4634', 6);
  rr(ctx, 220, -640, 70, 280, 4); ink(ctx, '#7E4634', 5); for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.6; L.cloud(ctx, 255 - ph * 200, -680 - ph * 160, 0.4 + ph * 0.6, '#D9CDBA'); ctx.restore(); }
  rr(ctx, -300, -340, 520, 70, 6); ink(ctx, CREAM, 5); fitText(ctx, 'BOTTLING PLANT', -40, -304, 44, '#7A2E1E', 490);
  for (let i = 0; i < 4; i++) { rr(ctx, -310 + i * 160, -230, 110, 110, 6); ink(ctx, '#F7D27A', 4); ctx.beginPath(); ctx.moveTo(-255 + i * 160, -230); ctx.lineTo(-255 + i * 160, -120); ink(ctx, null, 3); }
  rr(ctx, 230, -150, 100, 150, 4); ink(ctx, '#5A3420', 5);
  if (o.straps) { ctx.beginPath(); ctx.moveTo(-340, -380); ctx.lineTo(0, -820); ctx.lineTo(340, -380); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); } ctx.restore(); }
function crane(ctx, x, y, h, jib, hookX, hookY) { // lattice tower at x (ground y), jib to the right; hook rope to (hookX, hookY)
  const top = y - h; rr(ctx, x - 50, top, 100, h, 4); ink(ctx, '#E3A52F', 6); ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let yy = top; yy < y; yy += 100) { ctx.beginPath(); ctx.moveTo(x - 50, yy); ctx.lineTo(x + 50, yy + 100); ctx.moveTo(x + 50, yy); ctx.lineTo(x - 50, yy + 100); ctx.stroke(); } ctx.restore();
  rr(ctx, x - 200, top - 60, jib + 200, 60, 4); ink(ctx, '#E3A52F', 6); ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let xx = x - 200; xx < x + jib; xx += 80) { ctx.beginPath(); ctx.moveTo(xx, top - 60); ctx.lineTo(xx + 80, top); ctx.stroke(); } ctx.restore();
  rr(ctx, x - 260, top - 20, 120, 120, 6); ink(ctx, '#5A6A7A', 5); rr(ctx, x - 80, top - 180, 160, 120, 8); ink(ctx, '#E3A52F', 6); rr(ctx, x - 60, top - 160, 70, 60, 4); ink(ctx, '#BFE3F0', 4);
  rr(ctx, hookX - 40, top - 10, 80, 40, 6); ink(ctx, '#3A3438', 5); ctx.beginPath(); ctx.moveTo(hookX - 8, top + 30); ctx.lineTo(hookX - 8, hookY); ctx.moveTo(hookX + 8, top + 30); ctx.lineTo(hookX + 8, hookY); ink(ctx, null, 5);
  ctx.beginPath(); ctx.arc(hookX, hookY + 30, 30, -1.4, 3.6); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#8A8F96'; ctx.stroke(); }
function warship(ctx, x, y, s, t, col = '#7E868C') { ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3 + x) * 5 * s); ctx.scale(s, s); poly(ctx, [[-420, -40], [380, -40], [320, 40], [-380, 40]]); ink(ctx, col, 6); rr(ctx, -200, -120, 260, 80, 4); ink(ctx, darken(col, 0.9), 5); rr(ctx, -120, -200, 90, 80, 4); ink(ctx, darken(col, 0.85), 5);
  rr(ctx, 100, -80, 160, 40, 4); ink(ctx, darken(col, 0.9), 4); ctx.beginPath(); ctx.moveTo(180, -60); ctx.lineTo(330, -100); ink(ctx, null, 10); ctx.beginPath(); ctx.moveTo(-80, -200); ctx.lineTo(-80, -300); ink(ctx, null, 5); ctx.restore(); }
function cargoShip(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y + Math.sin(t * 1.2) * 6 * s); ctx.rotate(Math.sin(t * 1.1) * 0.012); ctx.scale(s, s); poly(ctx, [[-640, -80], [600, -80], [520, 80], [-580, 80]]); ink(ctx, '#5E6640', 7); rr(ctx, -640, -80, 1240, 16, 3); ink(ctx, '#3A4028', 0);
  rr(ctx, 380, -260, 160, 180, 6); ink(ctx, '#8A9068', 6); rr(ctx, 410, -330, 60, 70, 4); ink(ctx, '#5E6640', 5); ctx.restore(); }
function sea(ctx, x0, y, w, h, t, col = '#5E7C8E') { ctx.fillStyle = col; ctx.fillRect(x0, y, w, h); ctx.save(); ctx.strokeStyle = lighten(col, 0.3); ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < w / 120; i++) for (let j = 0; j < 5; j++) { const xx = x0 + i * 120 + Math.sin(t * 1.5 + i + j) * 20 + (j % 2) * 60, yy = y + 40 + j * h / 6; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 30, yy - 12, xx + 60, yy); ctx.stroke(); } ctx.restore(); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ink(ctx, null, 4); }
function plane(ctx, x, y, s, col = '#6E7650') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(ctx, 0, 0, 120, 26); ink(ctx, col, 5); poly(ctx, [[-20, -6], [40, -6], [10, -120], [-30, -120]]); ink(ctx, col, 5); poly(ctx, [[-20, 6], [40, 6], [10, 90], [-30, 90]]); ink(ctx, darken(col, 0.85), 5); poly(ctx, [[-110, -4], [-80, -4], [-110, -60], [-130, -60]]); ink(ctx, col, 4); ctx.beginPath(); ctx.arc(120, 0, 10, 0, 6.27); ink(ctx, '#3A3438', 3); ctx.restore(); }

// ---------- war smoke + bandages (from c1, respectful) ----------
function smoke(ctx, t, n = 10, col = '#B9B4AA', a = 0.55, seed = 0) { for (let i = 0; i < n; i++) { const v = hash(i * 5.1 + seed), x = -2000 + ((v * 4000 + t * (30 + v * 40)) % 4000), y = -600 + hash(i * 2.7 + seed) * 800; ctx.save(); ctx.globalAlpha = a * (0.5 + v * 0.5); L.cloud(ctx, x, y, 1.6 + v * 2, col); ctx.restore(); } }
function headBand(ctx, cx, cy, s) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.08); rr(ctx, -66, -46, 132, 24, 10); ink(ctx, '#F4F0E6', 4); ctx.beginPath(); ctx.moveTo(-30, -44); ctx.lineTo(-24, -24); ctx.moveTo(14, -44); ctx.lineTo(20, -24); ctx.lineWidth = 2.5; ctx.strokeStyle = '#C9C0AE'; ctx.stroke(); ctx.restore(); }
function desat(ctx, a, W, H, tint = '#CFC6B4') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = a; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.6; ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); ctx.restore(); }

function sling(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-40, -170); ctx.lineTo(48, -90); ctx.lineTo(30, -76); ctx.lineTo(-52, -156); ctx.closePath(); L.ink(ctx, '#F4F0E6', 4); ctx.restore(); }
module.exports = { sling, HEAD_Y, toonHead, sb, sprite, bottleWave, flyers, tower, skyline, shopRow, road, pavement, cafeTable, hydrant, bird, bigHand, opener, cap, bokeh, fizzSpray, subwayCar, pole,
  topPerson, plazaTop, stars, planet, bottleRing, panel, jar, showGlobe, gasLamp, drugWall, counter, sodaTap, chalkTally, horseBuggy, oldSkyline, dollarBill, contract, deskTop, inkwell, pen, specs, pocketWatch,
  sign, markerPath, stamp, beaker, hq, factory, crane, warship, cargoShip, sea, plane, smoke, headBand, desat };
