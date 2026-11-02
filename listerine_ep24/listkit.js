// Episode 24 "Floor cleaner → mouthwash" (Listerine) — sets and props on howitsrun_style (style reference lawnchair_ep17 / emu_ep12).
// Generic re-enactment: no logos (the name only as plain text), no portraits. World space: floor at y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');
const AMBER = '#B8651E', GREEN = '#9BC46A';

// frame-0 headline "A → B": A on cream, B on the red strip (same build as ST.headlineVs)
function headlineArrow(ctx, A, B, a = 1, y = 420) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(ST.W / 2, y); ctx.rotate(-0.02);
  const HS = 80; ctx.font = `${HS}px ${F.black}`; const wa = ctx.measureText(A).width, wv = ctx.measureText(' → ').width, we = ctx.measureText(B).width + 28;
  const k = Math.min(1, 960 / (wa + wv + we + 70)); ctx.scale(k, k);
  const x0 = -(wa + wv + we) / 2, cw = wa + wv + we + 70;
  CL.cutout(ctx, () => rr(ctx, -cw / 2, -84, cw, 124, 18), PAL.cream, { elev: 1.6 });
  txt(ctx, A, x0, 6, HS, INK, 'left'); txt(ctx, ' → ', x0 + wa, 6, HS, C.red, 'left');
  ctx.save(); ctx.translate(x0 + wa + wv + we / 2, -22); CL.cutout(ctx, () => rr(ctx, -we / 2, -56, we, 88, 12), C.red, { elev: 0.8 }); txt(ctx, B, 0, 28, HS, PAL.cream); ctx.restore();
  ctx.restore();
}

// ---------- small props ----------
function bucket(ctx, s = 1) { ctx.save(); ctx.scale(s, s); SE.poly(ctx, [[-80, -150], [80, -150], [64, 0], [-64, 0]], '#9AA3AD', 5); ell(ctx, 0, -150, 80, 18); fillStroke(ctx, '#C9A06A', 4);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.arc(0, -150, 76, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore(); }
// mop from the grip point (gx, gy) down to the floor head at (fx, 0)
function mop(ctx, gx, gy, fx) { tube(ctx, [[gx, gy], [fx, -40]], 14, '#C9A06A', 4);
  for (let i = 0; i < 9; i++) tube(ctx, [[fx - 8 + i * 2, -40], [fx - 70 + i * 17, 0]], 12, '#E9E1CE', 3); rr(ctx, fx - 30, -56, 60, 26, 8); fillStroke(ctx, '#5A606B', 4); }
function puddle(ctx, x, w, t) { ctx.save(); ctx.translate(x, 6); ell(ctx, 0, 0, w, w * 0.12); ctx.fillStyle = 'rgba(184,101,30,0.35)'; ctx.fill();
  for (let i = 0; i < 3; i++) { const u = (t * 1.3 + i * 0.33) % 1, sx = (hash(i) - 0.5) * w * 1.4; ctx.save(); ctx.translate(sx, -30 - u * 40); ctx.globalAlpha *= Math.sin(u * Math.PI); sparkle(ctx, 18); ctx.restore(); } ctx.restore(); }
function sparkle(ctx, r) { ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.3 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
// gargle bubbles at (x, y)
function bubbles(ctx, x, y, t, n = 6) { for (let i = 0; i < n; i++) { const u = (t * 1.6 + i / n) % 1, r = 8 + hash(i) * 12; ell(ctx, x + Math.sin(t * 5 + i) * 18 + (hash(i + 3) - 0.5) * 40, y - u * 120, r, r); ctx.globalAlpha = 1 - u; fillStroke(ctx, 'rgba(230,245,255,0.9)', 3); ctx.globalAlpha = 1; } }
// the green breath cloud (u 0..1 grows), centre at (x, y)
function breathCloud(ctx, x, y, s, u, t = 0) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 1.8) * s; ctx.scale(k, k);
  for (const [dx, dy, r] of [[0, 0, 40], [44, -18, 46], [92, 6, 40], [56, 30, 38], [126, -20, 34], [20, 34, 30]]) { ell(ctx, dx + Math.sin(t * 3 + dx) * 4, dy + Math.cos(t * 2.5 + dy) * 4, r, r * 0.86); fillStroke(ctx, GREEN, 4); }
  ctx.strokeStyle = '#5E8A3A'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(150 + i * 10, -60 + i * 40); ctx.quadraticCurveTo(180 + i * 10, -70 + i * 40 + Math.sin(t * 6 + i) * 8, 210 + i * 10, -55 + i * 40); ctx.stroke(); }
  ctx.restore();
}
function sink(ctx, x) { ctx.save(); ctx.translate(x, 0); tube(ctx, [[0, -520], [0, 0]], 70, '#F4F1E8', 5); rr(ctx, -150, -600, 300, 90, 30); fillStroke(ctx, '#FFFDF8', 5);
  tube(ctx, [[-40, -600], [-40, -660], [10, -660]], 14, '#B9BEC2', 4); ctx.restore(); }
// ---------- sets ----------
// frame 0: a tiled washroom: wall tiles, mirror, sink on the right
function washroom(ctx, t) {
  SE.room(ctx, t, { wall: '#DDEBE3', floor: 'tile' });
  ctx.strokeStyle = 'rgba(80,120,100,0.25)'; ctx.lineWidth = 3; for (let y = -60; y > -1300; y -= 90) { ctx.beginPath(); ctx.moveTo(-3000, y); ctx.lineTo(3000, y); ctx.stroke(); } for (let x = -3000; x < 3000; x += 90) { ctx.beginPath(); ctx.moveTo(x, -1300); ctx.lineTo(x, -60); ctx.stroke(); }
  ctx.fillStyle = '#2E6A58'; ctx.fillRect(-3000, -1310, 6000, 26);
  rr(ctx, 260, -1180, 280, 360, 20); fillStroke(ctx, '#C9A06A', 6); rr(ctx, 284, -1156, 232, 312, 14); fillStroke(ctx, '#CFE3EE', 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(320, -1120); ctx.lineTo(380, -1120); ctx.lineTo(310, -1000); ctx.closePath(); ctx.fill();
}
// 1880s operating room: dark green wall, gas lamp, wooden table with a patient (lying, sheet), a bandaged arm
function opRoom(ctx, t) {
  SE.room(ctx, t, { wall: '#C9D4C2', floor: 'wood' });
  ctx.fillStyle = 'rgba(60,80,60,0.12)'; ctx.fillRect(-3000, -2400, 6000, 1800);
  ctx.save(); ctx.translate(-80, -1240); tube(ctx, [[0, -400], [0, -60]], 10, '#5A606B', 3); SE.poly(ctx, [[-90, -60], [90, -60], [50, 20], [-50, 20]], '#3E5A4A', 4); R.ell(ctx, 0, 34, 26, 26); fillStroke(ctx, '#FFE7A0', 3);
  const g = ctx.createRadialGradient(0, 40, 0, 0, 40, 420); g.addColorStop(0, 'rgba(255,240,190,0.5)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(-500, -300, 1000, 800); ctx.restore();
  // cabinet with jars
  ctx.save(); ctx.translate(-860, 0); rr(ctx, -200, -900, 400, 900, 8); fillStroke(ctx, '#8A5A34', 5); for (let r = 0; r < 3; r++) { rr(ctx, -170, -860 + r * 250, 340, 200, 6); fillStroke(ctx, '#E9E1CE', 4); for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(-120 + i * 80, -670 + r * 250); CS.bottle(ctx, 0.42); ctx.restore(); } } ctx.restore();
}
function opTable(ctx, x) { ctx.save(); ctx.translate(x, 0);
  for (const lx of [-300, 300]) tube(ctx, [[lx, -330], [lx, 0]], 22, '#6A4024', 4);
  rr(ctx, -380, -370, 760, 50, 10); fillStroke(ctx, '#8A5A34', 5);
  // patient: sheet lump + head on a pillow (head left), arm out on the near side
  rr(ctx, -370, -420, 140, 60, 26); fillStroke(ctx, '#FFFDF8', 4);
  ctx.beginPath(); ctx.moveTo(-250, -370); ctx.bezierCurveTo(-240, -500, 300, -470, 360, -370); ctx.closePath(); fillStroke(ctx, '#F4EEDF', 5);
  R.head(ctx, -300, -455, 58, { skin: '#E8B48F', hair: '#5A3A22', hairStyle: 'short', iris: '#3A2414', brow: '#3A2414' }, { ...R.expr('worried'), look: [0.6, -1], tilt: -1.4 });
  ctx.restore(); }
// a bandaged forearm (on the table edge), u = wet (amber) 0..1
function bandageArm(ctx, x, y, u) { ctx.save(); ctx.translate(x, y); tube(ctx, [[-120, 0], [80, 10]], 46, '#E8B48F', 5); rr(ctx, -60, -26, 110, 52, 14); fillStroke(ctx, '#FFFDF8', 4);
  if (u > 0) { ctx.save(); rr(ctx, -60, -26, 110, 52, 14); ctx.clip(); ctx.globalAlpha = 0.6 * clamp(u); ell(ctx, -5, 0, 70 * clamp(u), 30); ctx.fillStyle = AMBER; ctx.fill(); ctx.restore(); }
  ell(ctx, 96, 12, 24, 20); fillStroke(ctx, '#E8B48F', 4); ctx.restore(); }
// a pour stream from (x0, y0) to (x1, y1), u 0..1 visible
function pour(ctx, x0, y0, x1, y1, u, t) { if (u <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(184,101,30,0.85)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.setLineDash([30, 10]); ctx.lineDashOffset = -t * 300;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + 10, lerp(y0, y1, 0.3), lerp(x0, x1, 1), lerp(y0, y1, clamp(u))); ctx.stroke(); ctx.restore(); }
// a dusty drugstore: shelves with dusty amber bottles, counter, cobweb
function drugstore(ctx, t) {
  SE.room(ctx, t, { wall: '#E6D9BE', floor: 'wood' });
  for (let r = 0; r < 3; r++) { const y = -1180 + r * 260; rr(ctx, -900, y, 1800, 26, 6); fillStroke(ctx, '#8A5A34', 4);
    for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(-800 + i * 200, y); CS.bottle(ctx, 0.62); ctx.fillStyle = 'rgba(200,190,170,0.55)'; ctx.fillRect(-46, -190, 92, 40); ctx.restore(); } }
  ctx.strokeStyle = 'rgba(80,80,80,0.5)'; ctx.lineWidth = 2; ctx.save(); ctx.translate(-900, -1360); for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.arc(0, 0, k * 40, 0, Math.PI / 2); ctx.stroke(); } for (let a = 0; a <= 4; a++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a * Math.PI / 8) * 200, Math.sin(a * Math.PI / 8) * 200); ctx.stroke(); } ctx.restore();
}
// a sales chart card (flat line), centred; u draws the line
function salesChart(ctx, u, o = {}) {
  const w = o.w || 520, h = o.h || 360; CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FBF6EA', { elev: 1.6 });
  fitTxt(ctx, o.title || 'MOUTHWASH SALES', 0, -h / 2 + 56, 40, INK, w - 40, 'center', ST.FONT.type);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2 + 90); ctx.lineTo(-w / 2 + 50, h / 2 - 40); ctx.lineTo(w / 2 - 30, h / 2 - 40); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 50, -h / 2, (w - 80) * clamp(u), h); ctx.clip(); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const x = -w / 2 + 60 + i * (w - 100) / 20, y = h / 2 - 80 + Math.sin(i * 1.7) * 4; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
}
// 1921 office: window, framed picture, desk
function office(ctx, t) { SE.room(ctx, t, { wall: '#EFE3CB', floor: 'wood', window: 520, frame: { x: -520, y: -1060, draw: g => { g.save(); g.translate(0, 60); CS.bottle(g, 0.45); g.restore(); } } }); }
// the old medical book (open u 0..1), centred at its spine bottom
function book(ctx, s, u) {
  ctx.save(); ctx.scale(s, s); const o = E.out(clamp(u));
  if (o < 0.5) { rr(ctx, -200, -60, 400, 60, 8); fillStroke(ctx, '#6A2E2A', 5); rr(ctx, -190, -56, 380, 14, 4); fillStroke(ctx, '#F4EEDF', 3); rr(ctx, -200, -80, 400, 30, 8); fillStroke(ctx, '#7A3A34', 5); fitTxt(ctx, 'MEDICAL DICTIONARY', 0, -58, 22, '#E9C46A', 360); }
  else { for (const sx of [-1, 1]) { ctx.save(); ctx.scale(sx, 1); ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(120, -50, 260, -30); ctx.lineTo(260, 10); ctx.quadraticCurveTo(120, -10, 0, 20); ctx.closePath(); fillStroke(ctx, '#F4EEDF', 5);
      ctx.strokeStyle = 'rgba(23,23,23,0.3)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(40, -16 - i * 0 + i * 6 - 10); ctx.lineTo(220, -34 + i * 8); ctx.stroke(); } ctx.restore(); }
    rr(ctx, -270, 8, 540, 26, 8); fillStroke(ctx, '#6A2E2A', 5); }
  ctx.restore();
}
function dust(ctx, x, y, u) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.translate(x, y); for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.1 + 0.8 * hash(i)), d = 60 + u * (180 + hash(i + 2) * 200), r = 30 + hash(i + 5) * 40;
  ell(ctx, Math.cos(a) * d, Math.sin(a) * d, r * (0.6 + u), r * (0.6 + u)); ctx.fillStyle = `rgba(200,190,170,${0.7 * (1 - u)})`; ctx.fill(); } ctx.restore(); }
// a 1920s party room: bunting, lamp, punch table
function party(ctx, t) {
  SE.room(ctx, t, { wall: '#E9D8E8', floor: 'wood', window: 760 });
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-1400, -1350); ctx.quadraticCurveTo(-300, -1150, 1400, -1350); ctx.stroke();
  for (let i = 0; i < 16; i++) { const u = i / 15, x = lerp(-1350, 1350, u), y = -1350 + Math.sin(u * Math.PI) * 160 * (1 - Math.abs(0.4 - u) * 0.6); SE.poly(ctx, [[x - 40, y], [x + 40, y], [x, y + 80]], [C.red, C.yellow, PAL.blue, '#2FA37E'][i % 4], 3); }
  ctx.save(); ctx.translate(-760, 0); rr(ctx, -200, -330, 400, 30, 6); fillStroke(ctx, '#FFFDF8', 4); for (const lx of [-170, 170]) tube(ctx, [[lx, -300], [lx, 0]], 14, '#6A4024', 3);
  ell(ctx, 0, -380, 110, 60); fillStroke(ctx, '#F7B7C6', 4); ctx.restore();
}
// garden wedding: sky, lawn, flower arch, chairs
function wedding(ctx, t) {
  SE.sky(ctx, t, { clouds: 3 }); SE.ground(ctx, 'lawn');
  ctx.save(); ctx.translate(250, 0); ctx.lineWidth = px(ctx, 5); for (const r of [430, 380]) { ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(-r, -700); ctx.arc(0, -700, r, Math.PI, 0); ctx.lineTo(r, 0); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 30); ctx.stroke(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = px(ctx, 20); ctx.stroke(); }
  for (let i = 0; i < 26; i++) { const a = Math.PI + Math.PI * i / 25, r = 405; ell(ctx, Math.cos(a) * r, -700 + Math.sin(a) * r, 26, 26); fillStroke(ctx, ['#F7B7C6', '#FFFDF8', '#FFC857'][i % 3], 3); } ctx.restore();
}
// newspaper ad clipping with a headline (two lines), centred, u pops
function clipping(ctx, l1, l2, u) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate(0.03);
  ctx.beginPath(); for (let i = 0; i <= 24; i++) { const x = -430 + i * 860 / 24; ctx.lineTo(x, -170 + (i % 2) * 10); } for (let i = 0; i <= 24; i++) { const x = 430 - i * 860 / 24; ctx.lineTo(x, 170 - (i % 2) * 10); } ctx.closePath();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = '#F2EBD8'; ctx.fill(); ctx.restore(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(23,23,23,0.5)'; ctx.stroke();
  fitTxt(ctx, '— 1920s MAGAZINE AD —', 0, -110, 30, '#6A6A68', 700, 'center', ST.FONT.type);
  fitTxt(ctx, l1, 0, -20, 70, INK, 790, 'center', 'serif'); fitTxt(ctx, l2, 0, 70, 70, C.red, 790, 'center', 'serif');
  ctx.strokeStyle = 'rgba(23,23,23,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-360, 112 + i * 18); ctx.lineTo(360, 112 + i * 18); ctx.stroke(); }
  ctx.restore();
}
// money bag with "$"
function moneyBag(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-50, -200); ctx.quadraticCurveTo(0, -170, 50, -200); ctx.lineTo(30, -160); ctx.bezierCurveTo(150, -110, 140, 0, 0, 0); ctx.bezierCurveTo(-140, 0, -150, -110, -30, -160); ctx.closePath(); fillStroke(ctx, '#C9A06A', 5);
  rr(ctx, -40, -176, 80, 20, 8); fillStroke(ctx, '#8A5A34', 4); txt(ctx, '$', 0, -40, 110, '#2FA37E'); ctx.restore(); }
function pedestal(ctx, s = 1) { ctx.save(); ctx.scale(s, s); rr(ctx, -200, -60, 400, 60, 8); fillStroke(ctx, '#E9E1CE', 5); rr(ctx, -150, -420, 300, 360, 6); fillStroke(ctx, '#F4F1E8', 5);
  ctx.fillStyle = 'rgba(0,0,0,0.07)'; for (let i = 0; i < 5; i++) ctx.fillRect(-130 + i * 60, -410, 20, 340); rr(ctx, -190, -460, 380, 50, 8); fillStroke(ctx, '#E9E1CE', 5); ctx.restore(); }
// spotlight cone from above at x
function spot(ctx, x, top, bottom, w) { const g = ctx.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, 'rgba(255,245,200,0.55)'); g.addColorStop(1, 'rgba(255,245,200,0.1)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 60, top); ctx.lineTo(x + 60, top); ctx.lineTo(x + w, bottom); ctx.lineTo(x - w, bottom); ctx.closePath(); ctx.fill(); }

module.exports = { AMBER, GREEN, headlineArrow, bucket, mop, puddle, sparkle, bubbles, breathCloud, sink, washroom, opRoom, opTable, bandageArm, pour, drugstore, salesChart, office, book, dust, party, wedding, clipping, moneyBag, pedestal, spot };
