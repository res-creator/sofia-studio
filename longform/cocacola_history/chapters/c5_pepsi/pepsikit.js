// Chapter 5 "The Rival" — local sets & props: bottle characters (comic metaphor), boxing ring, 1898 pharmacy, boardroom, Depression street,
// Italian hilltop, 1970s living room, 1975 TV taste-test set, race track, stormy boardroom. Built on longform/kit (nothing here edits the kit).
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, E, hash, darken, lighten, fitText } = L;
const PBLUE = '#2F6DB5';

// ---------- bottle characters (obvious metaphor: the two drinks as cartoon rivals) ----------
// kind 'contour' (Coke) | 'pepsi'; expr happy|grin|smug|worried|sad|shock|angry|determined|love; o: t, arms:[la,ra] (rad from down, + outwards), gloves, legs (run phase or null), sy (height stretch), itemR, flip, label
function bottleGuy(ctx, x, y, s, kind = 'contour', expr = 'happy', o = {}) {
  const t = o.t || 0, coke = kind !== 'pepsi', sy = o.sy || 1, lift = o.legs != null ? 64 : 0, col = coke ? RED : PBLUE;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#000'; ell(ctx, 0, 0, 52, 9); ctx.fill(); ctx.restore();
  if (o.legs != null) { const ph = o.legs; for (const sd of [-1, 1]) { const a = Math.sin(ph) * 0.7 * sd, k = Math.max(0, Math.cos(ph) * sd) * 0.9; const hx = sd * 14, hy = -lift + 4, kx = hx + Math.sin(a) * 34, ky = hy + Math.cos(a) * 34, fx = kx + Math.sin(a - k) * 34, fy = ky + Math.cos(a - k) * 34;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 17; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#F4F0E6'; ctx.stroke(); ell(ctx, fx + 8, fy, 15, 8); ink(ctx, col, 4); } }
  const shY = -lift - 120 * sy, arms = o.arms || [0.35, 0.35];
  const arm = (sd, a, item) => { const ax = sd * 30, ay = shY, ex = ax + Math.sin(a) * 40 * sd, ey = ay + Math.cos(a) * 40, hx = ex + Math.sin(a * 1.15) * 36 * sd, hy = ey + Math.cos(a * 1.15) * 36;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#F4F0E6'; ctx.stroke();
    if (item) { ctx.save(); ctx.translate(hx, hy); item(ctx); ctx.restore(); } ctx.beginPath(); ctx.arc(hx, hy, o.gloves ? 22 : 12, 0, 6.28); ink(ctx, o.gloves ? col : '#F4F0E6', 4); if (o.gloves) { ctx.beginPath(); ctx.arc(hx - 6, hy - 6, 6, 0, 6.28); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill(); } };
  arm(-1, arms[0], o.itemL);
  ctx.save(); ctx.translate(0, -lift); ctx.scale(1, sy); P.bottle(ctx, 0, 0, 1, { kind, label: '', open: o.open, fill: o.fill }); ctx.restore();
  // label band low on the body, plain bold type
  const ly = -lift - 52 * sy; rr(ctx, -37, ly - 20, 74, 40, 6); ink(ctx, col, 4); ctx.save(); if (o.flip) ctx.scale(-1, 1); fitText(ctx, o.label ?? (coke ? 'COCA-COLA' : 'PEPSI'), 0, ly + 1, 17, coke ? CREAM : '#FFFFFF', 64); ctx.restore();
  // face
  const fy = -lift - 128 * sy; face(ctx, 0, fy, expr, t);
  arm(1, arms[1], o.itemR);
  ctx.restore(); }
function face(ctx, x, y, expr, t = 0) { ctx.save(); ctx.translate(x, y); const blink = (t * 0.41 + x * 0.001) % 2.7 < 0.1;
  const eyeR = expr === 'shock' ? 13 : 11;
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 13, 0);
    if (expr === 'happy' || expr === 'grin' || expr === 'love' || blink) { ctx.beginPath(); ctx.moveTo(-9, 3); ctx.quadraticCurveTo(0, expr === 'love' || blink ? 4 : -10, 9, 3); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
    else { ell(ctx, 0, 0, eyeR * 0.85, eyeR); ink(ctx, '#FFFFFF', 3); ctx.beginPath(); ctx.arc(expr === 'smug' ? sd * 2 : 0, 2, expr === 'shock' ? 3.5 : 4.5, 0, 6.28); ctx.fillStyle = INK; ctx.fill(); if (expr === 'smug') { ctx.save(); ell(ctx, 0, 0, eyeR * 0.85, eyeR); ctx.clip(); ctx.fillStyle = '#5A2E18'; ctx.fillRect(-12, -14, 24, 12); ctx.restore(); ell(ctx, 0, 0, eyeR * 0.85, eyeR); ink(ctx, null, 3); } }
    const by = -17 - (expr === 'shock' ? 6 : 0); ctx.beginPath(); if (expr === 'angry' || expr === 'determined') { ctx.moveTo(-sd * 10, by - 5); ctx.lineTo(sd * 9, by + 4); } else if (expr === 'worried' || expr === 'sad') { ctx.moveTo(-sd * 10, by + 4); ctx.lineTo(sd * 9, by - 4); } else { ctx.moveTo(-9, by); ctx.quadraticCurveTo(0, by - 5, 9, by); }
    ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
  if (expr === 'love') for (const sd of [-1, 1]) heart(ctx, sd * 13, -2, 7, RED);
  ctx.translate(0, 20); ctx.beginPath();
  if (expr === 'grin' || expr === 'happy' || expr === 'love') { ctx.moveTo(-11, -3); ctx.quadraticCurveTo(0, 13, 11, -3); ctx.closePath(); ink(ctx, '#7A2626', 3.5); }
  else if (expr === 'shock') { ell(ctx, 0, 3, 7, 9); ink(ctx, '#5A1A1A', 3.5); }
  else if (expr === 'sad' || expr === 'worried') { ctx.moveTo(-9, 5); ctx.quadraticCurveTo(0, -4, 9, 5); ink(ctx, null, 4); if (expr === 'worried') { ctx.beginPath(); ctx.moveTo(30, -36); ctx.quadraticCurveTo(38, -22, 30, -18); ctx.quadraticCurveTo(22, -22, 30, -36); ink(ctx, '#9AD7FF', 3); } }
  else if (expr === 'smug') { ctx.moveTo(-8, 2); ctx.quadraticCurveTo(4, 6, 11, -4); ink(ctx, null, 4); }
  else if (expr === 'angry') { rr(ctx, -10, -3, 20, 9, 3); ink(ctx, '#FFFFFF', 3); }
  else { ctx.moveTo(-8, 1); ctx.lineTo(8, 1); ink(ctx, null, 4); }
  ctx.restore(); }
function heart(ctx, x, y, r, col = RED) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, r * 0.9); ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.7, -r * 1.3, 0, -r * 0.45); ctx.bezierCurveTo(r * 0.7, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9); ctx.closePath(); ink(ctx, col, Math.max(2, r * 0.18)); ctx.restore(); }
function note(ctx, x, y, s = 1, col = INK) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(ctx, 0, 0, 14, 10, -0.4); ink(ctx, col, 0); ctx.fillStyle = col; ctx.fillRect(10, -54, 5, 54); ctx.beginPath(); ctx.moveTo(15, -54); ctx.quadraticCurveTo(34, -40, 26, -22); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); }
function notes(ctx, x, y, t, n = 8, spread = 400, cols = [RED, PBLUE, '#2F8A6A', '#8A5AA8', '#E07A3A']) { for (let i = 0; i < n; i++) { const ph = (t * 0.45 + i / n) % 1; ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI); note(ctx, x + (hash(i * 3.3) - 0.5) * spread + Math.sin(t * 2 + i) * 30, y - ph * 420, 0.8 + hash(i) * 0.6, cols[i % cols.length]); ctx.restore(); } }
function stamp(ctx, txt, x, y, u, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.16); const k = u < 1 ? lerp(2.4, 1, E.out(clamp(u))) : 1; ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3) * 0.92;
  const s = o.size || 120; ctx.font = `${s}px ${L.F.black}`; const w = ctx.measureText(txt).width + s * 0.7, h = s * 1.3; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.lineWidth = 12; ctx.strokeStyle = o.col || RED; ctx.stroke(); rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
  fitText(ctx, txt, 0, s * 0.05, s, o.col || RED, w - 40); ctx.restore(); }
function frameP(ctx, x, y, w, h, fill, inner) { rr(ctx, x - w / 2, y - h / 2, w, h, 6); ink(ctx, '#B8873A', 6); rr(ctx, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 3); ink(ctx, fill || '#E9DCC0', 4); if (inner) { ctx.save(); rr(ctx, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 3); ctx.clip(); inner(ctx, x, y); ctx.restore(); } }
function rainFx(ctx, x0, y0, w, h, t, a = 0.5) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#BFD8F0'; ctx.lineWidth = 3; for (let i = 0; i < 120; i++) { const x = x0 + hash(i * 1.7) * w, y = y0 + ((hash(i * 3.1) * h + t * 1400) % h); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 36); ctx.stroke(); } ctx.restore(); }
function rainCloud(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); L.cloud(ctx, 0, 0, 1.2, '#7E868C'); ctx.beginPath(); [[-60, 0, 40], [-20, -22, 48], [30, -14, 42], [62, 4, 32], [0, 8, 44]].forEach(([cx, cy, r]) => { ctx.moveTo(cx * 1.2 + r * 1.2, cy * 1.2); ctx.arc(cx * 1.2, cy * 1.2, r * 1.2, 0, 6.28); }); ink(ctx, null, 4); rainFx(ctx, -90, 30, 180, 200, t, 0.8); ctx.restore(); }

// ---------- boxing ring (a running gag: ROUND 1 / 2 / 3) ----------
function arena(ctx, t, o = {}) { ctx.fillStyle = '#1E1A2A'; ctx.fillRect(-2400, -1400, 4800, 2800); for (const lx of [-900, 0, 900]) { ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#FFF4C8'; poly(ctx, [[lx - 40, -1400], [lx + 40, -1400], [lx + 420, 300], [lx - 420, 300]]); ctx.fill(); ctx.restore(); }
  for (let r = 0; r < 3; r++) P.crowd(ctx, -2200, 2200, -280 + r * 110, 0.34, 26, t + r, { react: o.react || 'cheer', seed: r * 7 + 3 });
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.fillRect(-2400, -460, 4800, 400); ctx.restore();
  for (let i = 0; i < 14; i++) { const ph = (t * 1.7 + hash(i)) % 1; if (ph < 0.08) { ctx.save(); ctx.globalAlpha = 1 - ph / 0.08; L.glow(ctx, -2000 + hash(i * 5) * 4000, -380 + hash(i * 9) * 200, 80, '#FFFFFF', 0.9); ctx.restore(); } } }
function ring(ctx, front = false) { // back ropes when !front, front ropes + apron when front
  const cols = [RED, '#F4F0E6', PBLUE];
  if (!front) { poly(ctx, [[-1100, 160], [1100, 160], [1300, 420], [-1300, 420]]); ink(ctx, '#E9E3D6', 6); L.shade(ctx, () => poly(ctx, [[-1100, 160], [1100, 160], [1300, 420], [-1300, 420]]), 1, 0.08);
    for (const px of [-1100, 1100]) { rr(ctx, px - 18, -330, 36, 490, 8); ink(ctx, '#C9CDD2', 5); }
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-1100, -300 + i * 110); ctx.lineTo(1100, -300 + i * 110); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = cols[i]; ctx.stroke(); } return; }
  rr(ctx, -1400, 420, 2800, 260, 4); ink(ctx, '#2A3A6A', 6); fitText(ctx, 'CHAMPIONSHIP', 0, 520, 70, CREAM, 1200);
  for (const px of [-1300, 1300]) { rr(ctx, px - 22, -200, 44, 640, 8); ink(ctx, '#C9CDD2', 5); }
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-1300, -170 + i * 130); ctx.lineTo(1300, -170 + i * 130); ctx.lineWidth = 20; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = cols[i]; ctx.stroke(); } }
function roundCard(ctx, x, y, n, word, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate(Math.sin(u * 8) * 0.03 * (1 - clamp(u)));
  rr(ctx, -300, -150, 600, 300, 18); ink(ctx, CREAM, 7); rr(ctx, -300, -150, 600, 90, 18); ink(ctx, INK, 7); fitText(ctx, `ROUND ${n}`, 0, -104, 54, YELLOW, 520); fitText(ctx, word, 0, 40, 104, RED, 540); ctx.restore(); }

// ---------- places ----------
function town1898(ctx, t) { L.skyGrad(ctx, -2200, -1300, 4400, 1500, ERA.sepia.sky); L.cloud(ctx, -600 + t * 8, -700, 1.1, '#FFF6E6'); L.cloud(ctx, 700 + t * 6, -780, 0.8, '#FFF6E6');
  for (let i = 0; i < 9; i++) { const x = -2100 + i * 480, h = 260 + hash(i * 3) * 180; rr(ctx, x, 200 - h, 420, h, 4); ink(ctx, ['#D9B98A', '#C9A06A', '#E2C394'][i % 3], 4); poly(ctx, [[x - 20, 200 - h], [x + 210, 200 - h - 120], [x + 440, 200 - h]]); ink(ctx, '#9A5B44', 4); } }
function boardroom(ctx, t, o = {}) { L.planks(ctx, -2200, -1300, 4400, 1600, o.wood || '#6B4123', { vertical: true, pw: 80 }); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-2200, -1300, 4400, 280);
  frameP(ctx, -560, -520, 260, 320, '#9CB0A0', (g, x, y) => P.bottle(g, x, y + 120, 0.95, { kind: 'contour' })); frameP(ctx, 560, -520, 260, 320, '#C9B79A', (g, x, y) => toon(g, x, y + 270, 0.75, LOOKS.woodruff, 'stand', 'smug', { t, noShadow: true }));
  rr(ctx, -200, -760, 400, 90, 8); ink(ctx, '#3A2A1E', 5); fitText(ctx, 'BOARD ROOM', 0, -715, 46, '#D8B04A', 360); L.planks(ctx, -2200, 200, 4400, 1000, '#4A2E1E', { pw: 50 }); }
function longTable(ctx, y, w) { rr(ctx, -w / 2, y - 40, w, 60, 14); ink(ctx, '#5A3420', 6); rr(ctx, -w / 2 + 30, y + 20, w - 60, 200, 6); ink(ctx, '#4A2E1E', 6); }
function depression(ctx, t) { L.skyGrad(ctx, -2200, -1300, 4400, 1500, ['#8A8E92', '#C9C4B4']); L.cloud(ctx, -700 + t * 6, -720, 1.4, '#B8B8B4'); L.cloud(ctx, 600 + t * 4, -800, 1.2, '#B8B8B4'); }
function shutters(ctx) { const S = ['CLOSED', 'BANK', 'FOR RENT', 'CLOSED', 'CAFÉ', 'CLOSED'];
  for (let i = 0; i < 6; i++) { const x = -1900 + i * 640; P.storefront(ctx, x, 210, { w: 600, h: 560 + (i % 2) * 80, col: ['#8A6A5A', '#9A8A7A', '#7E6A5E'][i % 3], sign: S[i] === 'CLOSED' || S[i] === 'FOR RENT' ? 'GENERAL STORE' : S[i], signCol: '#3A3438', signFg: '#C9C4BA', awning: ['#7E7A70', '#A9A49C'] });
    if (S[i] === 'CLOSED' || S[i] === 'FOR RENT') { ctx.save(); ctx.translate(x + 180, 0); ctx.rotate(-0.12); rr(ctx, -120, -50, 240, 100, 6); ink(ctx, CREAM, 5); fitText(ctx, S[i], 0, 2, 48, RED, 210); ctx.restore(); } } }
function hills(ctx, t) { // sunny Italian hilltop (far layers): sky, distant village on a hill, rolling hills, cypress trees
  L.skyGrad(ctx, -2600, -1400, 5200, 1700, ['#3FA9F5', '#D8F0FF']); ctx.beginPath(); ctx.arc(1300, -760, 110, 0, 6.28); ink(ctx, '#FFE07A', 5); L.glow(ctx, 1300, -760, 500, '#FFF2B0', 0.6); L.cloud(ctx, -900 + t * 12, -760, 1.2); L.cloud(ctx, 300 + t * 9, -860, 0.9);
  ctx.beginPath(); ctx.moveTo(-2600, 0); ctx.quadraticCurveTo(-1800, -360, -1000, -120); ctx.quadraticCurveTo(-200, 60, 600, -200); ctx.quadraticCurveTo(1400, -420, 2600, -80); ctx.lineTo(2600, 600); ctx.lineTo(-2600, 600); ctx.closePath(); ink(ctx, '#9CC97A', 5);
  for (let i = 0; i < 9; i++) { const x = -1700 + i * 70, y = -250 + Math.abs(i - 4) * 18; rr(ctx, x, y - 70, 60, 70, 3); ink(ctx, ['#F2D8B0', '#EBC79A', '#F6E2C2'][i % 3], 3); poly(ctx, [[x - 6, y - 70], [x + 30, y - 96], [x + 66, y - 70]]); ink(ctx, '#C9603A', 3); }
  rr(ctx, -1430, -440, 40, 150, 3); ink(ctx, '#EBC79A', 3); poly(ctx, [[-1436, -440], [-1410, -480], [-1384, -440]]); ink(ctx, '#C9603A', 3);
  for (let i = 0; i < 10; i++) { const x = -2300 + i * 520 + hash(i) * 100, y = -60 + Math.sin(i * 1.3) * 80; ell(ctx, x, y - 70, 16, 80); ink(ctx, '#3E6E3A', 4); }
  for (let r = 0; r < 4; r++) for (let i = 0; i < 30; i++) { const x = -2500 + i * 180 + (r % 2) * 90, y = 120 + r * 60; ctx.beginPath(); ctx.arc(x, y, 14, 0, 6.28); ink(ctx, '#7FAF5A', 3); } }
function hilltop(ctx, y = 220) { ctx.beginPath(); ctx.moveTo(-2600, y + 80); ctx.quadraticCurveTo(0, y - 140, 2600, y + 80); ctx.lineTo(2600, y + 1200); ctx.lineTo(-2600, y + 1200); ctx.closePath(); ink(ctx, '#7FBF5A', 6);
  for (let i = 0; i < 70; i++) { const x = -2400 + hash(i) * 4800, yy = y + 40 + hash(i * 3) * 600; ctx.beginPath(); ctx.arc(x, yy, 7, 0, 6.28); ink(ctx, [YELLOW, '#FFFFFF', '#E8607A'][i % 3], 2.5); } }
function filmCamera(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 12; ctx.strokeStyle = INK; for (const a of [-0.35, 0, 0.35]) { ctx.beginPath(); ctx.moveTo(0, -260); ctx.lineTo(Math.sin(a) * 260, 0); ctx.stroke(); } ctx.lineWidth = 6; ctx.strokeStyle = '#8A8F96'; for (const a of [-0.35, 0, 0.35]) { ctx.beginPath(); ctx.moveTo(0, -260); ctx.lineTo(Math.sin(a) * 260, 0); ctx.stroke(); }
  rr(ctx, -110, -380, 200, 130, 12); ink(ctx, '#3A3438', 6); rr(ctx, 90, -350, 70, 70, 8); ink(ctx, '#5A5458', 5); ell(ctx, 170, -315, 18, 34); ink(ctx, '#9CC7D8', 4);
  for (const [cx, cy] of [[-60, -440], [40, -440]]) { ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); ctx.arc(0, 0, 56, 0, 6.28); ink(ctx, '#3A3438', 6); ctx.rotate(t * 4); for (let i = 0; i < 3; i++) { ctx.rotate(2.09); ctx.beginPath(); ctx.arc(28, 0, 12, 0, 6.28); ink(ctx, '#8A8F96', 3); } ctx.restore(); } ctx.restore(); }
function radio(ctx, x, y, s, t, on = 1) { ctx.save(); ctx.translate(x, y + (on ? Math.abs(Math.sin(t * 8)) * -4 : 0)); ctx.scale(s, s); rr(ctx, -200, -240, 400, 240, 30); ink(ctx, '#E07A3A', 6); L.shade(ctx, () => rr(ctx, -200, -240, 400, 240, 30), 1, 0.14);
  ctx.beginPath(); ctx.arc(-80, -120, 80, 0, 6.28); ink(ctx, '#3A2A24', 5); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-80, -120, 14 + i * 11, 0, 6.28); ctx.lineWidth = 3; ctx.strokeStyle = '#6B5A48'; ctx.stroke(); } const k = 1 + (on ? Math.sin(t * 16) * 0.06 : 0); ctx.save(); ctx.translate(-80, -120); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 26, 0, 6.28); ink(ctx, '#5A4A3A', 4); ctx.restore();
  rr(ctx, 30, -200, 140, 60, 8); ink(ctx, '#F4E8C8', 4); for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(44 + i * 18, -190); ctx.lineTo(44 + i * 18, -170); ink(ctx, null, 2); } rr(ctx, 70 + Math.sin(t * 0.5) * 20, -198, 6, 56, 2); ink(ctx, RED, 0);
  for (const kx of [60, 140]) { ctx.beginPath(); ctx.arc(kx, -80, 24, 0, 6.28); ink(ctx, '#C9CDD2', 4); } ctx.beginPath(); ctx.moveTo(-120, -240); ctx.lineTo(-200, -400); ink(ctx, null, 5); ctx.beginPath(); ctx.arc(-200, -400, 8, 0, 6.28); ink(ctx, '#C9CDD2', 3); ctx.restore(); }
function room70s(ctx, t) { L.stripes(ctx, -2200, -1300, 4400, 1500, '#F2A65A', '#E8904A', 70); for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.arc(-2100 + (i % 10) * 450, -1100 + Math.floor(i / 10) * 420, 70, 0, 6.28); ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(160,80,30,0.35)'; ctx.stroke(); }
  rr(ctx, -900, -720, 520, 400, 10); ink(ctx, '#6B4123', 7); ctx.save(); rr(ctx, -880, -700, 480, 360, 4); ctx.clip(); L.skyGrad(ctx, -880, -700, 480, 360, ['#3FA9F5', '#BDE8FF']); L.cloud(ctx, -700 + t * 20, -560, 0.6); ctx.restore(); ctx.beginPath(); ctx.moveTo(-640, -700); ctx.lineTo(-640, -340); ink(ctx, '#6B4123', 8);
  ctx.beginPath(); ctx.arc(700, -620, 90, 0, 6.28); ink(ctx, '#F7C548', 6); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; ctx.beginPath(); ctx.moveTo(700 + Math.cos(a) * 100, -620 + Math.sin(a) * 100); ctx.lineTo(700 + Math.cos(a) * 140, -620 + Math.sin(a) * 140); ctx.lineWidth = 8; ctx.strokeStyle = '#E07A3A'; ctx.stroke(); }
  ctx.fillStyle = '#8A5A33'; ctx.fillRect(-2200, 200, 4400, 1000); for (let i = 0; i < 300; i++) { const x = -2200 + hash(i) * 4400, y = 210 + hash(i * 3) * 900; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 16); ctx.lineWidth = 4; ctx.strokeStyle = i % 2 ? '#A06A3A' : '#74482A'; ctx.stroke(); } }
function sofa(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -360, -260, 720, 180, 40); ink(ctx, '#6E8E3A', 6); rr(ctx, -380, -120, 760, 120, 30); ink(ctx, '#7EA04A', 6); for (const sd of [-1, 1]) { rr(ctx, sd * 380 - 50, -200, 100, 200, 30); ink(ctx, '#6E8E3A', 6); } ctx.restore(); }
// 1975 TV taste-test set
function tvStudio(ctx, t) { ctx.fillStyle = '#2A2440'; ctx.fillRect(-2400, -1400, 4800, 2800); for (let i = 0; i < 12; i++) { const x = -2200 + i * 400; rr(ctx, x - 40, -1100, 80, 60, 8); ink(ctx, '#3A3438', 4); ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#FFF4C8'; poly(ctx, [[x - 30, -1040], [x + 30, -1040], [x + 220, 200], [x - 220, 200]]); ctx.fill(); ctx.restore(); }
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(-1700 + i * 200, -880, 16, 0, 6.28); ink(ctx, (Math.floor(t * 4) + i) % 3 ? '#FFE07A' : '#8A7A3A', 3); } }
function backdrop(ctx, t) { rr(ctx, -1000, -820, 2000, 760, 20); ink(ctx, PBLUE, 7); L.stripes(ctx, -990, -810, 1980, 740, PBLUE, '#3A7FC8', 60); rr(ctx, -1000, -820, 2000, 760, 20); ink(ctx, null, 7);
  rr(ctx, -620, -760, 1240, 170, 14); ink(ctx, '#FFFFFF', 6); fitText(ctx, 'THE PEPSI CHALLENGE', 0, -675, 92, PBLUE, 1160); for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(-900 + i * 200, -560, 10, 0, 6.28); ink(ctx, (Math.floor(t * 5) + i) % 2 ? '#FFFFFF' : '#9CC7E8', 3); } }
function tvCam(ctx, x, y, s, t, label = 'CAM 1') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -20, -260, 40, 260, 8); ink(ctx, '#5A5458', 5); for (const a of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(a * 120, 0); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke(); }
  rr(ctx, -170, -440, 300, 180, 16); ink(ctx, '#C9CDD2', 6); rr(ctx, 130, -400, 90, 100, 10); ink(ctx, '#3A3438', 6); ell(ctx, 222, -350, 22, 44); ink(ctx, '#7FB2E5', 4); fitText(ctx, label, -20, -350, 38, INK, 240); ctx.beginPath(); ctx.arc(-140, -420, 12, 0, 6.28); ink(ctx, Math.floor(t * 2) % 2 ? RED : '#7A2626', 3); ctx.restore(); }
function cup(ctx, x, y, s, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); poly(ctx, [[-44, -130], [44, -130], [34, 0], [-34, 0]]); ink(ctx, '#FFFFFF', 5); ctx.save(); poly(ctx, [[-44, -130], [44, -130], [34, 0], [-34, 0]]); ctx.clip(); ctx.fillStyle = '#3B1F12'; ctx.fillRect(-50, -130 + 130 * (1 - (o.fill ?? 0.8)), 100, 140); ctx.restore(); poly(ctx, [[-44, -130], [44, -130], [34, 0], [-34, 0]]); ink(ctx, null, 5); rr(ctx, -48, -138, 96, 14, 6); ink(ctx, '#F4F0E6', 4); if (o.mark) fitText(ctx, o.mark, 0, -60, 56, INK, 70); ctx.restore(); }
function tally(ctx, x, y, a, b, u = 1) { rr(ctx, x - 230, y - 160, 460, 320, 14); ink(ctx, '#1E2A2E', 6); fitText(ctx, 'PICKED', x, y - 120, 36, '#FFE07A', 400); for (const [i, n] of [[0, a], [1, b]]) { const cx = x - 110 + i * 220; fitText(ctx, i ? 'CUP 2' : 'CUP 1', cx, y - 60, 34, '#FFFFFF', 180); for (let k = 0; k < n; k++) { const g = Math.floor(k / 5), r = k % 5; ctx.beginPath(); if (r < 4) { ctx.moveTo(cx - 60 + g * 0 + r * 22, y - 20 + g * 70); ctx.lineTo(cx - 60 + r * 22, y + 30 + g * 70); } else { ctx.moveTo(cx - 72, y + g * 70); ctx.lineTo(cx + 20, y - 4 + g * 70 - 10); } ctx.lineWidth = 7; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round'; ctx.stroke(); } } }
// race track
function stands(ctx, t) { L.skyGrad(ctx, -2600, -1400, 5200, 1500, ERA.pop.sky); L.cloud(ctx, -600 - t * 40, -760, 1.3); L.cloud(ctx, 900 - t * 30, -860, 1.0);
  for (let r = 0; r < 4; r++) { rr(ctx, -2600, -560 + r * 110, 5200, 110, 0); ink(ctx, r % 2 ? '#C9CDD2' : '#B9BEC4', 4); } for (let r = 0; r < 4; r++) P.crowd(ctx, -2500, 2500, -470 + r * 110, 0.3, 34, t + r, { react: 'cheer', seed: r * 5 + 1 });
  rr(ctx, -2600, -120, 5200, 100, 0); ink(ctx, '#2F8A6A', 5); for (let i = 0; i < 12; i++) { rr(ctx, -2500 + i * 440, -100, 360, 60, 6); ink(ctx, i % 2 ? CREAM : '#FFE07A', 3); fitText(ctx, i % 2 ? 'GO!' : 'FASTER', -2320 + i * 440, -70, 30, INK, 320); } }
function track(ctx, t, speed = 1) { ctx.fillStyle = '#C8603A'; ctx.fillRect(-2600, -20, 5200, 1200); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-2600, 120 + i * 200); ctx.lineTo(2600, 120 + i * 200); ctx.lineWidth = 8; ctx.strokeStyle = '#F4F0E6'; ctx.stroke(); }
  for (let i = 0; i < 30; i++) { const x = -2600 + ((i * 180 - t * 900 * speed) % 5400 + 5400) % 5400; ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.fillRect(x, 140 + (i % 4) * 200, 60, 8); ctx.restore(); } }
function lightning(ctx, x, y, h, seed = 0) { ctx.beginPath(); let px = x, py = y; ctx.moveTo(px, py); for (let i = 0; i < 9; i++) { px += (hash(i * 3 + seed) - 0.5) * 120; py += h / 9; ctx.lineTo(px, py); } ctx.lineWidth = 16; ctx.strokeStyle = '#E8F0FF'; ctx.lineJoin = 'miter'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); }

const YOUNG = [ // 1971 hilltop: young people, many looks (generic)
  { skin: '#F2C9A0', hair: { style: 'long', col: '#D9B25A' }, top: '#F4F0E6', pants: '#2F6DB5' },
  { skin: '#8E5A36', hair: { style: 'curly', col: '#151313' }, top: '#E07A3A', pants: '#5A4A3A' },
  { skin: '#E8B58A', hair: { style: 'long', col: '#151313' }, top: '#D93A35', pants: '#2A2A38' },
  { skin: '#D39A6A', hair: { style: 'short', col: '#2B1E16' }, top: '#2F8A6A', pants: '#4A3A2E' },
  { skin: '#F6D3B3', hair: { style: 'long', col: '#A4462A' }, top: '#F7C548', pants: '#2F6DB5' },
  { skin: '#6B4026', hair: { style: 'bun', col: '#151313' }, top: '#8A5AA8', pants: '#3A3A48' },
  { skin: '#F2C9A0', hair: { style: 'side', col: '#5A3A22' }, top: '#9CC7E8', pants: '#5A4A3A', stache: 1 },
  { skin: '#B97A4E', hair: { style: 'long', col: '#2B1E16' }, top: '#F4F0E6', pants: '#8A5A33' },
  { skin: '#E8B58A', hair: { style: 'curly', col: '#5A3A22' }, top: '#E8607A', pants: '#2A2A38' },
];
const EXECS = [ // generic executives (no likeness)
  { skin: '#F0CBA8', hair: { style: 'side', col: '#2B1E16' }, top: '#2E2A28', top2: '#F4F0E6', tie: '#7A2A2A', pants: '#2E2A28' },
  { skin: '#E8B58A', hair: { style: 'bald', col: '#A9A49C' }, stache: 1, stacheCol: '#A9A49C', top: '#3A3438', top2: '#F4F0E6', bow: RED, pants: '#3A3438', build: 'round' },
  { skin: '#F2C9A0', hair: { style: 'fringe', col: '#5A3A22' }, glasses: 'round', top: '#4A4F5C', top2: '#F4F0E6', tie: '#2F8A6A', pants: '#4A4F5C' },
  { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#2A3140', top2: '#F4F0E6', tie: '#D93A35', pants: '#2A3140' },
];

module.exports = { PBLUE, bottleGuy, face, heart, note, notes, stamp, frameP, rainFx, rainCloud, arena, ring, roundCard, town1898, boardroom, longTable, depression, shutters, hills, hilltop, filmCamera, radio, room70s, sofa, tvStudio, backdrop, tvCam, cup, tally, stands, track, lightning, YOUNG, EXECS };
