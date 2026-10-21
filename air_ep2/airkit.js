// Aviation props for the Bold Editorial Collage episode (built on tests/mcd_collage/kit.js primitives).
// All props are drawn around a local origin; sizes are in local units, scaled by the caller.
const K = require('../tests/mcd_collage/kit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat, contact, lerpCol } = K;

const A2 = { blue: '#2F6FDB', blueD: '#2457B5', sky1: '#2E6BD6', sky2: '#9CC3F5', navy: '#161B2E', cabin: '#262D47', aisle: '#3A4266', red: C.red, ink: C.ink, cream: C.paper, paper: '#FFFDF8', grey: '#8E95A6' };
const SKIN = ['#F1C9A5', '#C68642', '#8D5524', '#E0AC69', '#F5D3B3', '#A0673D'];
const SHIRT = [C.red, A2.blue, C.ink, '#FFFDF8', '#8E9AAF', '#E07A5F', '#2F6FDB', '#3D3D3D', C.red, '#5B6C8F'];

// ---------- boarding pass (vertical), 760 x 1040, centre origin ----------
// o: bg (notch colour), stamp(0..1), denied(0..1), hi(0..1 highlight route), tape(0..1), toBill(0..1 morph), seat text
function ticket(ctx, o = {}) {
  const m = E.inOut(clamp(o.toBill || 0)), col = lerpCol('#FFFDF8', '#CFE9D4', m);
  cut(ctx, () => rr(ctx, -380, -520, 760, 1040, lerp(36, 18, m)), col, { sb: 30, sy: 16, lw: 4 });
  const ta = 1 - clamp(m * 2), ba = clamp(m * 2 - 1);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha *= ta;
    flat(ctx, () => rr(ctx, -380, -520, 760, 170, [36, 36, 0, 0]), A2.blue);
    ctx.fillStyle = '#FFFFFF'; ctx.font = `40px ${F.xb}`; ctx.textAlign = 'left'; ctx.fillText('BOARDING PASS', -330, -420);
    planeIcon(ctx, 270, -435, 1.1, '#FFFFFF');
    ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.font = `124px ${F.black}`; ctx.fillText('NYC', -205, -180); ctx.fillText('LAX', 205, -180);
    planeIcon(ctx, 0, -222, 1.25, C.red);
    ctx.font = `30px ${F.xb}`; ctx.fillStyle = '#6B6B6B'; ctx.fillText('NEW YORK', -205, -125); ctx.fillText('LOS ANGELES', 205, -125);
    if (o.hi) { const u = E.inOut(clamp(o.hi)); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,200,87,0.85)'; ctx.fillRect(-330, -300, 660 * u, 200); ctx.restore(); }
    const field = (lab, val, x, y, vc) => { ctx.textAlign = 'left'; ctx.font = `26px ${F.xb}`; ctx.fillStyle = '#7A7A7A'; ctx.fillText(lab, x, y); ctx.font = `60px ${F.black}`; ctx.fillStyle = vc || C.ink; ctx.fillText(val, x, y + 62); };
    field('FLIGHT', '247', -330, -20); field('GATE', 'B12', -60, -20); field('SEAT', o.seat || '??', 170, -20, C.red);
    field('PASSENGER', 'YOU', -330, 120); field('DATE', 'TODAY', 170, 120);
    ctx.setLineDash([16, 14]); ctx.strokeStyle = '#B8B0A0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-340, 250); ctx.lineTo(340, 250); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = o.bg || C.paper; for (const sx of [-380, 380]) { ctx.beginPath(); ctx.arc(sx, 250, 30, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.ink; let x = -300; for (let i = 0; x < 300; i++) { const w = 4 + Math.floor(hash(i * 7) * 3) * 4; ctx.fillRect(x, 310, w, 150); x += w + 6 + Math.floor(hash(i * 3) * 2) * 4; }
    ctx.restore();
  }
  if (ba > 0) { // banknote face
    ctx.save(); ctx.globalAlpha *= ba; ctx.strokeStyle = C.billD; ctx.lineWidth = 6; rr(ctx, -340, -480, 680, 960, 10); ctx.stroke();
    ctx.fillStyle = 'rgba(61,140,106,0.16)'; ctx.beginPath(); ctx.arc(0, 0, 210, 0, 7); ctx.fill(); ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = C.billD; ctx.font = `300px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 14); ctx.textBaseline = 'alphabetic';
    for (const [cx, cy] of [[-270, -410], [270, 410]]) { ctx.beginPath(); ctx.arc(cx, cy, 34, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  if (o.stamp) stamp(ctx, 'NO SEAT?!', 0, 40, 1.0, o.stamp, -0.2);
  if (o.denied) stamp(ctx, 'DENIED BOARDING', 0, -50, 0.62, o.denied, -0.16);
  if (o.tape) { const u = clamp(o.tape); ctx.save(); ctx.globalAlpha *= 0.85; ctx.fillStyle = '#FFE08A';
    for (const [y, r] of [[-260, -0.12], [120, 0.1]]) { ctx.save(); ctx.translate(0, y); ctx.rotate(r); ctx.fillRect(-60 * u, -170, 120 * u, 340); ctx.restore(); } ctx.restore(); }
}
// rubber stamp: thick red frame + heavy type, slams from big to 1
function stamp(ctx, text, x, y, s, u, rot = -0.2, col = C.red) {
  if (u <= 0) return; const k = u < 1 ? lerp(2.4, 1, E.out5(clamp(u))) : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * k, s * k); ctx.globalAlpha *= clamp(u * 4);
  ctx.font = `150px ${F.black}`; const w = ctx.measureText(text).width + 90, h = 210;
  ctx.strokeStyle = col; ctx.lineWidth = 16; rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.stroke(); ctx.lineWidth = 5; rr(ctx, -w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 10); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 8); ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,253,248,0.55)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(-w / 2 + hash(i * 3) * w, -h / 2 + hash(i * 7) * h, 2 + hash(i) * 5, 0, 7); ctx.fill(); } // ink grain
  ctx.restore();
}
function planeIcon(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(-34, -4); ctx.lineTo(26, -4); ctx.quadraticCurveTo(40, 0, 26, 4); ctx.lineTo(-34, 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-16, -26); ctx.lineTo(-8, -26); ctx.lineTo(12, -4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(-16, 26); ctx.lineTo(-8, 26); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(-40, -16); ctx.lineTo(-30, -16); ctx.lineTo(-24, -4); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------- airliner, side view, nose right; ~1600 long; window centre at (0,-30) ----------
function airliner(ctx, o = {}) {
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-640, -110); ctx.lineTo(-780, -400); ctx.lineTo(-650, -400); ctx.lineTo(-470, -110); ctx.closePath(); }, C.red, { sb: 24, sy: 12 });
  ctx.save(); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(-650, -280, 46, 0, 7); ctx.fill(); ctx.restore();
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-620, -10); ctx.lineTo(-800, 40); ctx.lineTo(-740, 60); ctx.lineTo(-560, 20); ctx.closePath(); }, '#D9DEE8', { sb: 10, sy: 6 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-720, -110); ctx.lineTo(560, -120); ctx.bezierCurveTo(760, -120, 820, -40, 820, 0); ctx.bezierCurveTo(820, 60, 760, 110, 560, 115); ctx.lineTo(-640, 110); ctx.quadraticCurveTo(-780, 60, -800, -20); ctx.quadraticCurveTo(-790, -100, -720, -110); ctx.closePath(); }, '#FFFFFF', { sb: 40, sy: 22, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-700, 40); ctx.lineTo(640, 40); ctx.quadraticCurveTo(700, 40, 720, 60); ctx.lineTo(-660, 64); ctx.closePath(); }, C.red);
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(690, -80); ctx.quadraticCurveTo(760, -78, 790, -40); ctx.lineTo(690, -40); ctx.closePath(); }, A2.navy, 3);
  for (let x = -560; x <= 560; x += 70) { flat(ctx, () => rr(ctx, x - 20, -58, 40, 56, 20), A2.navy, 2.5); ctx.fillStyle = 'rgba(156,195,245,0.55)'; ctx.beginPath(); ctx.ellipse(x - 6, -42, 6, 10, 0, 0, 7); ctx.fill(); }
  flat(ctx, () => rr(ctx, 600, -90, 46, 130, 10), '#EEF1F6', 3);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-120, 60); ctx.lineTo(220, 60); ctx.lineTo(-80, 330); ctx.lineTo(-210, 330); ctx.closePath(); }, '#C9D1DE', { sb: 22, sy: 10 });
  cut(ctx, () => rr(ctx, -40, 150, 230, 90, 45), '#E4E8EF', { sb: 16, sy: 8 }); flat(ctx, () => rr(ctx, 150, 160, 44, 70, 22), '#3A3F4F', 3);
}

// ---------- passengers ----------
function personTop(ctx, x, y, s, i, look = 0) { // seen from above; look = -1..1 (head turn)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 6, 48, 30, 0, 0, 7); }, SHIRT[i % SHIRT.length], { sb: 10, sy: 5, edgeW: 6, lw: 3 });
  ctx.rotate(look * 0.8);
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, -4, 25, 0, 7); }, SKIN[i % SKIN.length], 3);
  ctx.fillStyle = i % 3 === 0 ? '#3B2A20' : i % 3 === 1 ? '#151515' : '#7A4B2A'; ctx.beginPath(); ctx.arc(0, 2, 25, Math.PI * 0.05, Math.PI * 0.95); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(0, -26, 5, 0, 7); ctx.fill(); // nose = facing
  ctx.restore();
}
// front view standing passenger, feet at (0,0), height ~440. o: ghost(0..1), arm ('up'), pass(0..1 alpha), hold (draw fn for the pass)
function personFront(ctx, x, y, s, i, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = clamp(o.ghost || 0), shirt = SHIRT[i % SHIRT.length], skin = SKIN[i % SKIN.length];
  const shape = (build, col, lw = 3.5) => { if (g < 1) { ctx.save(); ctx.globalAlpha *= 1 - g; cut(ctx, build, col, { sb: 14, sy: 8, lw }); ctx.restore(); }
    if (g > 0) { ctx.save(); ctx.globalAlpha *= g * 0.8; build(); ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); } };
  shape(() => rr(ctx, -46, -150, 40, 150, 14), '#2D3142'); shape(() => rr(ctx, 6, -150, 40, 150, 14), '#2D3142');
  if (o.arm === 'up') shape(() => rr(ctx, 50, -470, 34, 200, 17), shirt);
  shape(() => rr(ctx, -66, -310, 132, 180, [44, 44, 18, 18]), shirt);
  shape(() => rr(ctx, -88, -300, 32, 150, 16), shirt); if (o.arm !== 'up') shape(() => rr(ctx, 56, -300, 32, 140, 16), shirt);
  shape(() => { ctx.beginPath(); ctx.arc(0, -362, 50, 0, 7); }, skin);
  if (g < 1) { ctx.save(); ctx.globalAlpha *= 1 - g; ctx.fillStyle = i % 3 === 0 ? '#3B2A20' : i % 3 === 1 ? '#151515' : '#7A4B2A'; ctx.beginPath(); ctx.arc(0, -372, 50, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-17, -360, 5, 0, 7); ctx.arc(17, -360, 5, 0, 7); ctx.fill(); ctx.restore(); }
  if (o.pass !== undefined && o.arm !== 'up') { ctx.save(); ctx.globalAlpha *= clamp(o.pass); ctx.translate(76, -170); ctx.rotate(0.12); ctx.scale(0.11, 0.11); (o.hold || ticket)(ctx, { bg: '#000' }); ctx.restore(); }
  ctx.restore();
}
function miniTicket(ctx, x, y, s, rot = 0, edge = null) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  cut(ctx, () => rr(ctx, -26, -17, 52, 34, 5), '#FFFDF8', { sb: 6, sy: 3, edgeW: 4, lw: edge ? 5 : 2.5, stroke: edge || C.ink });
  ctx.fillStyle = A2.blue; ctx.fillRect(-26, -17, 14, 34); ctx.fillStyle = C.ink; ctx.fillRect(-6, -6, 22, 4); ctx.fillRect(-6, 2, 14, 4);
  ctx.restore();
}

// ---------- cabin seen from above (nose up). 6 rows x 4 seats ----------
const CAB = { rows: 6, cols: [-235, -125, 125, 235], y0: -420, dy: 160 };
function cabinShell(ctx) {
  cut(ctx, () => rr(ctx, -340, -720, 680, 1480, 300), A2.cabin, { sb: 40, sy: 20, stroke: '#0B0E19', edgeW: 10, lw: 4 });
  flat(ctx, () => rr(ctx, -60, -660, 120, 1380, 50), A2.aisle);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = -600; y < 700; y += 80) ctx.fillRect(-6, y, 12, 40);
  for (const sx of [-1, 1]) for (let y = -560; y < 640; y += 120) flat(ctx, () => rr(ctx, sx * 318 - 9, y, 18, 54, 9), '#9CC3F5');
}
function seatTop(ctx, x, y, s = 1, col = A2.blue) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cut(ctx, () => rr(ctx, -50, -52, 100, 108, 18), col, { sb: 8, sy: 4, edgeW: 5, lw: 3, stroke: '#0B0E19' });
  flat(ctx, () => rr(ctx, -50, 30, 100, 26, 10), A2.blueD, 3); flat(ctx, () => rr(ctx, -58, -40, 12, 80, 6), '#1C2340'); flat(ctx, () => rr(ctx, 46, -40, 12, 80, 6), '#1C2340');
  ctx.restore();
}

// ---------- seat map (S3): top-view plane silhouette with 100 seats (20 rows x 5) ----------
const SM = { xs: [-98, -60, 6, 44, 82].map(v => v - 4), y0: -380, dy: 38 };
const seatPos = i => [SM.xs[i % 5], SM.y0 + Math.floor(i / 5) * SM.dy];
function planeTop(ctx) {
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-150, -60); ctx.lineTo(-500, 160); ctx.lineTo(-500, 220); ctx.lineTo(-150, 120); ctx.lineTo(150, 120); ctx.lineTo(500, 220); ctx.lineTo(500, 160); ctx.lineTo(150, -60); ctx.closePath(); }, '#E6E1D6', { sb: 26, sy: 14 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-60, 450); ctx.lineTo(-210, 540); ctx.lineTo(-210, 580); ctx.lineTo(-40, 540); ctx.lineTo(40, 540); ctx.lineTo(210, 580); ctx.lineTo(210, 540); ctx.lineTo(60, 450); ctx.closePath(); }, '#E6E1D6', { sb: 18, sy: 10 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -620); ctx.bezierCurveTo(120, -600, 150, -480, 150, -400); ctx.lineTo(150, 420); ctx.quadraticCurveTo(150, 560, 0, 600); ctx.quadraticCurveTo(-150, 560, -150, 420); ctx.lineTo(-150, -400); ctx.bezierCurveTo(-150, -480, -120, -600, 0, -620); ctx.closePath(); }, '#FFFDF8', { sb: 30, sy: 16, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-60, -520); ctx.quadraticCurveTo(0, -560, 60, -520); ctx.lineTo(50, -490); ctx.quadraticCurveTo(0, -515, -50, -490); ctx.closePath(); }, A2.navy);
}
function smallSeat(ctx, x, y, filled) { ctx.fillStyle = filled ? A2.blue : '#D9D2C3'; rr(ctx, x - 15, y - 15, 30, 30, 7); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = filled ? A2.blueD : '#B9B1A3'; ctx.stroke(); }

// ---------- departure board (split-flap) ----------
const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function board(ctx, t, o = {}) { // o.flip: time the status starts flipping
  cut(ctx, () => rr(ctx, -470, -240, 940, 480, 26), '#121212', { sb: 40, sy: 20, lw: 4 });
  flat(ctx, () => rr(ctx, -440, -210, 880, 70, 12), '#1E1E1E');
  ctx.fillStyle = C.yellow; ctx.font = `34px ${F.xb}`; ctx.textAlign = 'left'; ctx.fillText('DEPARTURES', -410, -162); planeIcon(ctx, 390, -175, 0.9, C.yellow);
  ctx.font = `26px ${F.xb}`; ctx.fillStyle = '#8A8A8A'; ctx.fillText('FLIGHT', -410, -95); ctx.fillText('TO', -200, -95);
  ctx.font = `64px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('247', -410, -30); ctx.fillText('LOS ANGELES', -200, -30);
  ctx.font = `26px ${F.xb}`; ctx.fillStyle = '#8A8A8A'; ctx.fillText('STATUS', -410, 40);
  const target = 'OVERBOOKED', before = 'ON TIME   ', n = target.length, cw = 80, x0 = -410;
  for (let i = 0; i < n; i++) {
    const tl = (o.flip ?? 1e9) + i * 0.05, done = t > tl + 0.35, flipping = t > tl && !done;
    const ch = done ? target[i] : flipping ? FLAP[Math.floor((t * 40 + i * 7) % FLAP.length)] : before[i];
    const x = x0 + i * (cw + 6), red = done;
    flat(ctx, () => rr(ctx, x, 62, cw, 112, 8), red ? C.red : '#2A2A2A'); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x, 116, cw, 4);
    ctx.fillStyle = red ? '#FFFFFF' : C.yellow; ctx.font = `78px ${F.black}`; ctx.textAlign = 'center';
    const sq = flipping ? Math.abs(Math.cos((t - tl) * 40)) : 1; ctx.save(); ctx.translate(x + cw / 2, 118); ctx.scale(1, Math.max(0.15, sq)); ctx.fillText(ch.trim() ? ch : '', 0, 28); ctx.restore();
  }
  ctx.textAlign = 'left';
}

function moneyStack(ctx, x, y, s, n, u = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < n; i++) { const k = E.back(clamp(u * n * 0.5 - i * 0.5 + 0.5), 2); if (k <= 0) continue; ctx.save(); ctx.globalAlpha *= clamp(k * 3); K.bill(ctx, (hash(i) - 0.5) * 14, -i * 30 - (1 - k) * 60, 2.4, (hash(i + 4) - 0.5) * 0.12); ctx.restore(); }
  if (u >= 1) { flat(ctx, () => rr(ctx, -20, -n * 30 - 30, 40, n * 30 + 60, 6), 'rgba(255,200,87,0.92)'); }
  ctx.restore();
}
function check(ctx, x, y, s, u) { if (u <= 0) return; const k = E.back(clamp(u), 2.5); ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); }, C.ink, { sb: 18, sy: 10, lw: 0 });
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-42, 2); ctx.lineTo(-10, 34); ctx.lineTo(46, -30); ctx.stroke(); ctx.restore(); }


// ---------- added for the final cut (old functions unchanged) ----------
// front-view airline seat, floor at (0,0); o.front: draw only the cushion front (to cover a seated passenger's legs)
function seatFront(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.front) {
    cut(ctx, () => rr(ctx, -20, -70, 40, 70, 8), '#2D3142', { sb: 10, sy: 6 });
    cut(ctx, () => rr(ctx, -118, -360, 236, 290, [60, 60, 20, 20]), A2.blue, { sb: 26, sy: 14, lw: 4 });
    flat(ctx, () => rr(ctx, -84, -340, 168, 54, 22), '#E9EEF8', 3);
    if (o.empty) { ctx.save(); ctx.globalAlpha *= o.empty; ctx.setLineDash([14, 10]); ctx.lineWidth = 6; ctx.strokeStyle = C.yellow; rr(ctx, -132, -374, 264, 384, 64); ctx.stroke(); ctx.restore(); }
  } else {
    cut(ctx, () => rr(ctx, -128, -120, 256, 70, 26), A2.blueD, { sb: 16, sy: 8, lw: 4 });
    flat(ctx, () => rr(ctx, -150, -150, 30, 110, 12), '#1C2340', 3); flat(ctx, () => rr(ctx, 120, -150, 30, 110, 12), '#1C2340', 3);
  }
  ctx.restore();
}
// departures board with the overbooked flight and a later flight (row 2), 940 x 600
function board2(ctx, t, o = {}) {
  cut(ctx, () => rr(ctx, -470, -240, 940, 600, 26), '#121212', { sb: 40, sy: 20, lw: 4 });
  flat(ctx, () => rr(ctx, -440, -210, 880, 70, 12), '#1E1E1E');
  ctx.fillStyle = C.yellow; ctx.font = `34px ${F.xb}`; ctx.textAlign = 'left'; ctx.fillText('DEPARTURES', -410, -162); planeIcon(ctx, 390, -175, 0.9, C.yellow);
  ctx.font = `64px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('247', -410, -60); ctx.fillText('LOS ANGELES', -200, -60);
  const target = 'OVERBOOKED', before = 'ON TIME   ', cw = 80;
  for (let i = 0; i < target.length; i++) {
    const tl = (o.flip ?? -1) + i * 0.04, done = t > tl + 0.3, flipping = t > tl && !done;
    const ch = done ? target[i] : flipping ? FLAP[Math.floor((t * 40 + i * 7) % FLAP.length)] : before[i], x = -410 + i * (cw + 6);
    flat(ctx, () => rr(ctx, x, -10, cw, 112, 8), done ? C.red : '#2A2A2A'); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x, 44, cw, 4);
    ctx.fillStyle = done ? '#FFFFFF' : C.yellow; ctx.font = `78px ${F.black}`; ctx.textAlign = 'center';
    const sq = flipping ? Math.abs(Math.cos((t - tl) * 40)) : 1; ctx.save(); ctx.translate(x + cw / 2, 46); ctx.scale(1, Math.max(0.15, sq)); ctx.fillText(ch.trim() ? ch : '', 0, 28); ctx.restore();
  }
  ctx.textAlign = 'left'; flat(ctx, () => rr(ctx, -440, 140, 880, 4, 2), '#333333');
  const hl = clamp(o.later || 0); if (hl > 0) { ctx.save(); ctx.globalAlpha = hl * 0.25; flat(ctx, () => rr(ctx, -450, 165, 900, 150, 14), C.yellow); ctx.restore(); }
  ctx.font = `52px ${F.black}`; ctx.fillStyle = '#BDBDBD'; ctx.fillText('251', -410, 262); ctx.fillText('LOS ANGELES', -200, 262);
  ctx.font = `40px ${F.black}`; ctx.fillStyle = C.yellow; ctx.textAlign = 'right'; ctx.fillText('LATER', 430, 262); ctx.textAlign = 'left';
}

module.exports = { seatFront, board2, A2, SKIN, SHIRT, ticket, stamp, planeIcon, airliner, personTop, personFront, miniTicket, CAB, cabinShell, seatTop, SM, seatPos, planeTop, smallSeat, board, moneyStack, check };
