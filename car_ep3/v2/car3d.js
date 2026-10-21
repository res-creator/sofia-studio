// v2 props: 2.5D environments and pseudo-3D pieces for "Your Car Was Reporting On You" (cinematic cut).
// Builds on tests/mcd_collage/kit.js and car_ep3/carkit.js (both unchanged). Local units = screen px at camera zoom 1.
const K = require('../../tests/mcd_collage/kit');
const CK = require('../carkit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat, lerpCol } = K;
const { P3, text, car, page } = CK;
const NIGHT = { sky1: '#0E1326', sky2: '#2A2350', ground: '#151824', road: '#2A2E3A', lane: '#F2E8C9', lamp: '#FFD27A' };
const wrap = (v, m) => ((v % m) + m) % m;

// ---------- the car seen from the front (440 x ~300, ground at y=0) ----------
function carFront(ctx, o = {}) {
  const col = o.col || C.red;
  flat(ctx, () => rr(ctx, -215, -70, 70, 70, 14), '#141414'); flat(ctx, () => rr(ctx, 145, -70, 70, 70, 14), '#141414');
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-220, -40); ctx.lineTo(-210, -150); ctx.quadraticCurveTo(-200, -175, -160, -180); ctx.lineTo(-120, -265); ctx.quadraticCurveTo(0, -282, 120, -265); ctx.lineTo(160, -180); ctx.quadraticCurveTo(200, -175, 210, -150); ctx.lineTo(220, -40); ctx.quadraticCurveTo(220, -22, 200, -22); ctx.lineTo(-200, -22); ctx.quadraticCurveTo(-220, -22, -220, -40); ctx.closePath(); }, col, { sb: 34, sy: 18, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-140, -185); ctx.lineTo(-108, -255); ctx.quadraticCurveTo(0, -268, 108, -255); ctx.lineTo(140, -185); ctx.closePath(); }, o.glass || '#12151F', 4);
  ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#9CC3F5'; ctx.beginPath(); ctx.moveTo(30, -255); ctx.lineTo(70, -255); ctx.lineTo(20, -190); ctx.lineTo(-20, -190); ctx.closePath(); ctx.fill(); ctx.restore();
  for (const sx of [-1, 1]) { flat(ctx, () => rr(ctx, sx * 150 - 38, -140, 76, 34, 12), o.lights ? '#FFF3C4' : C.yellow, 3); flat(ctx, () => rr(ctx, sx * 236 - 14, -190, 28, 24, 8), col, 3); }
  flat(ctx, () => rr(ctx, -90, -120, 180, 46, 12), '#1B1B1B', 3); ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 4; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -120 + i * 11.5); ctx.lineTo(80, -120 + i * 11.5); ctx.stroke(); }
  flat(ctx, () => rr(ctx, -200, -60, 400, 26, 10), '#1B1B1B', 3);
  if (o.lights) { const g = ctx.createRadialGradient(0, -120, 20, 0, -120, 520); g.addColorStop(0, 'rgba(255,240,190,0.28)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(-520, -640, 1040, 1040); }
}
// pseudo-3D turn: side panel (cos) + front panel (sin) hinged at the front edge, like a box rotating about a vertical axis
function carTurn(ctx, th, o = {}) {
  const c = Math.cos(th), s = Math.sin(th), sideW = 1030 * c, frontW = 440 * s, x0 = (sideW - frontW) / 2;
  ctx.save(); ctx.translate(x0, 0); // keeps the turning car centred
  if (c > 0.02) { ctx.save(); ctx.translate(-515 * c, 0); ctx.scale(c, 1); car(ctx, o); ctx.restore(); }
  if (s > 0.02) { ctx.save(); ctx.translate(frontW / 2, 0); ctx.scale(s, 1 + 0.1 * s); carFront(ctx, o); ctx.restore(); }
  ctx.restore();
}

// ---------- night road, side view (2.5D layers scroll at different speeds). centred, ~1400 x 1300 ----------
function roadScene(ctx, t, o = {}) {
  const v = o.speed ?? 1, sc = t * 900 * v;
  const g = ctx.createLinearGradient(0, -700, 0, 300); g.addColorStop(0, NIGHT.sky1); g.addColorStop(1, NIGHT.sky2); ctx.fillStyle = g; ctx.fillRect(-900, -760, 1800, 1100);
  ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(320, -480, 70, 0, 7); ctx.fill(); ctx.fillStyle = NIGHT.sky2; ctx.beginPath(); ctx.arc(352, -500, 62, 0, 7); ctx.fill();
  for (let i = 0; i < 14; i++) { const x = wrap(i * 190 - sc * 0.12, 2660) - 1330, h = 160 + hash(i * 5) * 260; ctx.fillStyle = '#1C2140'; ctx.fillRect(x, 120 - h, 150, h);
    ctx.fillStyle = 'rgba(255,210,122,0.55)'; for (let r = 0; r < h / 40 - 1; r++) for (let k = 0; k < 3; k++) if (hash(i * 31 + r * 7 + k) > 0.55) ctx.fillRect(x + 18 + k * 42, 140 - h + r * 40, 16, 18); }
  for (let i = 0; i < 6; i++) { const x = wrap(i * 420 - sc * 0.55, 2520) - 1260; // street lamps (mid layer)
    flat(ctx, () => rr(ctx, x - 7, -260, 14, 400, 5), '#2E3348'); flat(ctx, () => rr(ctx, x - 7, -268, 70, 14, 6), '#2E3348');
    const lg = ctx.createRadialGradient(x + 60, -250, 4, x + 60, -250, 170); lg.addColorStop(0, 'rgba(255,210,122,0.7)'); lg.addColorStop(1, 'rgba(255,210,122,0)'); ctx.fillStyle = lg; ctx.fillRect(x - 120, -420, 360, 360);
    ctx.fillStyle = NIGHT.lamp; ctx.beginPath(); ctx.arc(x + 62, -252, 12, 0, 7); ctx.fill(); }
  ctx.fillStyle = NIGHT.ground; ctx.fillRect(-900, 140, 1800, 60); ctx.fillStyle = NIGHT.road; ctx.fillRect(-900, 200, 1800, 300); ctx.fillStyle = '#20232E'; ctx.fillRect(-900, 500, 1800, 300);
  ctx.fillStyle = NIGHT.lane; for (let i = 0; i < 9; i++) ctx.fillRect(wrap(i * 260 - sc, 2340) - 1170, 345, 150, 14);
  if (o.car !== false) { ctx.save(); ctx.translate(0, 330 + Math.sin(t * 13) * 2.5 * v); ctx.scale(0.62, 0.62); if (o.turn) carTurn(ctx, o.turn, { glass: '#12151F', spin: t * 14 * v, lights: o.turn > 0.6 }); else car(ctx, { glass: '#12151F', spin: t * 14 * v }); ctx.restore(); }
  if (o.antenna) { const a = o.antenna; for (let k = 0; k < 3; k++) { const ph = (t * 1.6 + k / 3) % 1; ctx.save(); ctx.globalAlpha = a * (1 - ph); ctx.strokeStyle = P3.blue; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(10, 160, 30 + ph * 160, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.restore(); } }
  for (let i = 0; i < 8; i++) { const x = wrap(i * 300 - sc * 1.7, 2400) - 1200; flat(ctx, () => rr(ctx, x - 16, 560, 32, 150, 8), '#3A3F55'); } // guardrail posts (foreground, fastest)
  flat(ctx, () => rr(ctx, -900, 590, 1800, 26, 6), '#4A5068');
}

// ---------- interior: windshield with a perspective road, dashboard, cluster, steering wheel ----------
function interior(ctx, t, o = {}) { // centred on the cluster; ~1300 x 1900
  const v = o.speed ?? 1, sc = o.dist ?? t * v;
  const hy = -420; // horizon
  const g = ctx.createLinearGradient(0, -900, 0, hy); g.addColorStop(0, NIGHT.sky1); g.addColorStop(1, NIGHT.sky2); ctx.fillStyle = g; ctx.fillRect(-800, -1000, 1600, 580);
  ctx.fillStyle = '#1C2140'; for (let i = 0; i < 12; i++) { const h = 40 + hash(i * 3) * 90; ctx.fillRect(-700 + i * 120, hy - h, 90, h); }
  ctx.fillStyle = NIGHT.ground; ctx.fillRect(-800, hy, 1600, 420);
  ctx.fillStyle = NIGHT.road; ctx.beginPath(); ctx.moveTo(-40, hy); ctx.lineTo(40, hy); ctx.lineTo(700, 0); ctx.lineTo(-700, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = NIGHT.lane; for (let i = 0; i < 10; i++) { const z = 1 - wrap(i / 10 + sc * 0.9, 1), y0 = hy + (0 - hy) * Math.pow(1 - z, 2.2), y1 = hy + (0 - hy) * Math.pow(1 - Math.max(0, z - 0.05), 2.2), w0 = 3 + (1 - z) * 26;
    if (y1 > hy + 2) ctx.fillRect(-w0 / 2, y0, w0, y1 - y0); }
  if (o.brakeLights) { ctx.save(); ctx.globalAlpha = o.brakeLights; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(-60, hy + 120, 12, 0, 7); ctx.arc(60, hy + 120, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#2B2F3D'; ctx.fillRect(-80, hy + 100, 160, 14); ctx.restore(); }
  // A-pillars and roof frame the windshield
  ctx.fillStyle = '#090B12'; ctx.beginPath(); ctx.moveTo(-800, -1000); ctx.lineTo(800, -1000); ctx.lineTo(800, -820); ctx.quadraticCurveTo(0, -880, -800, -820); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-800, -820); ctx.lineTo(-560, -760); ctx.lineTo(-700, 40); ctx.lineTo(-800, 40); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(800, -820); ctx.lineTo(560, -760); ctx.lineTo(700, 40); ctx.lineTo(800, 40); ctx.closePath(); ctx.fill();
  // dashboard
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-800, -40); ctx.quadraticCurveTo(0, -150, 800, -40); ctx.lineTo(800, 700); ctx.lineTo(-800, 700); ctx.closePath(); }, '#1F2330', { sb: 40, sy: -10, lw: 0 });
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(-800, -40); ctx.quadraticCurveTo(0, -150, 800, -40); ctx.lineTo(800, -10); ctx.quadraticCurveTo(0, -120, -800, -10); ctx.closePath(); ctx.fill();
  cut(ctx, () => rr(ctx, -330, 20, 660, 420, 60), '#11141D', { sb: 20, sy: 6, lw: 4, stroke: '#2C3245' });
  ctx.save(); ctx.translate(0, 250); gaugeNoNum(ctx, o.needle ?? 0.35, o.red); ctx.restore();
  if (o.rec) { ctx.save(); ctx.globalAlpha = o.rec; ctx.translate(-470, 140); cut(ctx, () => rr(ctx, -120, -40, 240, 80, 40), '#0B0D14', { sb: 10, sy: 4, lw: 3, stroke: '#3A4256' });
    ctx.fillStyle = Math.floor(t * 2.5) % 2 ? '#5A1018' : C.red; ctx.beginPath(); ctx.arc(-68, 0, 18, 0, 7); ctx.fill(); text(ctx, 'REC', -34, 18, 44, '#FFFFFF'); text(ctx, 'ONSTAR', 0, 76, 28, P3.slateD, F.xb, 'center'); ctx.restore(); }
  for (const [k, ic] of [[0, o.iconBrake], [1, o.iconAccel]]) if (ic) { ctx.save(); ctx.globalAlpha = ic; ctx.translate(-150 + k * 300, 100); flat(ctx, () => rr(ctx, -44, -44, 88, 88, 18), k ? C.yellow : C.red); CK.eventIcon(ctx, k, 0, 0, 0.9); ctx.restore(); }
  // steering wheel (foreground)
  ctx.save(); ctx.translate(0, 820); ctx.rotate(o.steer || 0); ctx.strokeStyle = '#0A0C12'; ctx.lineWidth = 70; ctx.beginPath(); ctx.arc(0, 0, 520, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.strokeStyle = '#1A1E2A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 548, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore();
}
function gaugeNoNum(ctx, v, red) { // speedometer without a number (we never show a speed value)
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25; ctx.lineCap = 'round';
  ctx.lineWidth = 22; ctx.strokeStyle = '#2C3245'; ctx.beginPath(); ctx.arc(0, 0, 170, a0, a1); ctx.stroke();
  ctx.strokeStyle = P3.blue; ctx.beginPath(); ctx.arc(0, 0, 170, a0, lerp(a0, a1, Math.min(v, 0.72))); ctx.stroke();
  if (v > 0.72) { ctx.strokeStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 170, lerp(a0, a1, 0.72), lerp(a0, a1, v)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; for (let i = 0; i <= 12; i++) { const a = lerp(a0, a1, i / 12); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 132, Math.sin(a) * 132); ctx.lineTo(Math.cos(a) * 148, Math.sin(a) * 148); ctx.stroke(); }
  const na = lerp(a0, a1, v); ctx.strokeStyle = red ? C.red : C.yellow; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(na) * 150, Math.sin(na) * 150); ctx.stroke();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); }, '#0B0D14', 3);
}

// ---------- data journey environments ----------
function brokerCorridor(ctx, w, h) { // filing cabinets converging to a vanishing point (2.5D)
  ctx.fillStyle = '#1E2433'; ctx.fillRect(-w / 2, -h / 2, w, h);
  const vx = 0, vy = -60;
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const z0 = i / 6, z1 = (i + 1) / 6, f = z => 1 - z * 0.82;
    const xa = side * w / 2 * f(z0), xb = side * w / 2 * f(z1), ya = h * 0.42 * f(z0), yb = h * 0.42 * f(z1);
    ctx.fillStyle = i % 2 ? '#2B3346' : '#323B51'; ctx.beginPath(); ctx.moveTo(xa, vy - ya); ctx.lineTo(xb, vy - yb); ctx.lineTo(xb, vy + yb); ctx.lineTo(xa, vy + ya); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,87,0.55)'; for (let k = 0; k < 4; k++) { const yy = lerp(-ya, ya, (k + 0.5) / 4) * 0.8, yy2 = lerp(-yb, yb, (k + 0.5) / 4) * 0.8; ctx.beginPath(); ctx.moveTo(lerp(xa, xb, 0.35), vy + lerp(yy, yy2, 0.35) - 6); ctx.lineTo(lerp(xa, xb, 0.65), vy + lerp(yy, yy2, 0.65) - 5); ctx.lineTo(lerp(xa, xb, 0.65), vy + lerp(yy, yy2, 0.65) + 5); ctx.lineTo(lerp(xa, xb, 0.35), vy + lerp(yy, yy2, 0.35) + 6); ctx.closePath(); ctx.fill(); } }
  ctx.fillStyle = '#151A26'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2 * 0.18, vy - h * 0.42 * 0.18); ctx.lineTo(-w / 2 * 0.18, vy - h * 0.42 * 0.18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#262D3F'; ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(w / 2 * 0.18, vy + h * 0.42 * 0.18); ctx.lineTo(-w / 2 * 0.18, vy + h * 0.42 * 0.18); ctx.closePath(); ctx.fill();
}
function printer(ctx) { // a big report printer (data broker output)
  cut(ctx, () => rr(ctx, -330, -150, 660, 300, 40), '#2E3446', { sb: 30, sy: 14, lw: 4 });
  flat(ctx, () => rr(ctx, -260, -40, 520, 26, 12), '#0B0D14'); flat(ctx, () => rr(ctx, 200, 70, 80, 24, 12), C.yellow); text(ctx, 'DATA BROKER', -280, 110, 34, '#BFC6D6', F.xb);
}
function priceTag(ctx, level) { // "$" -> "$$" -> "$$$"
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-230, -120); ctx.lineTo(170, -120); ctx.lineTo(260, 0); ctx.lineTo(170, 120); ctx.lineTo(-230, 120); ctx.closePath(); }, P3.paper, { sb: 26, sy: 14, lw: 4 });
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(165, 0, 18, 0, 7); ctx.fill(); text(ctx, 'YOUR PRICE', -200, -62, 30, '#7A7A7A', F.xb);
  text(ctx, '$'.repeat(Math.max(1, Math.round(level))), -200, 70, 120, level > 2.5 ? C.red : C.ink);
}
function trafficTicket(ctx) { cut(ctx, () => rr(ctx, -170, -230, 340, 460, 14), '#FFF7DA', { sb: 22, sy: 12, lw: 3 });
  flat(ctx, () => rr(ctx, -170, -230, 340, 80, [14, 14, 0, 0]), '#E8D9A8'); text(ctx, 'TRAFFIC', -140, -178, 40, C.ink); for (let i = 0; i < 6; i++) flat(ctx, () => rr(ctx, -140, -110 + i * 48, 280, 14, 7), '#E4D9BE'); }

// ---------- newspaper collage ----------
function clipping(ctx, head, w, h, o = {}) { // torn newspaper clipping with a headline
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + (w * i) / 10, -h / 2 + (hash(i + (o.seed || 0)) - 0.5) * 12);
    ctx.lineTo(w / 2, h / 2); for (let i = 10; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / 10, h / 2 + (hash(i + 40 + (o.seed || 0)) - 0.5) * 12); ctx.closePath(); }, o.paper || '#EFEADF', { sb: 26, sy: 14, lw: 2.5 });
  if (head) { ctx.save(); ctx.font = `${o.size || 120}px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = o.col || C.ink; ctx.fillText(head, 0, (o.size || 120) * 0.36); ctx.restore(); }
  if (o.lines) { ctx.fillStyle = '#C9C2B4'; for (let i = 0; i < o.lines; i++) ctx.fillRect(-w / 2 + 30, -h / 2 + 40 + i * 30, (w - 60) * (0.6 + hash(i * 3) * 0.4), 12); }
}
function agencyBuilding(ctx, blocked) { // "consumer reporting agencies"
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-200, -170); ctx.lineTo(0, -260); ctx.lineTo(200, -170); ctx.closePath(); }, P3.paper, { sb: 20, sy: 10, lw: 4 });
  cut(ctx, () => rr(ctx, -180, -170, 360, 240, 6), P3.paper, { sb: 20, sy: 10, lw: 4 });
  for (let i = 0; i < 4; i++) flat(ctx, () => rr(ctx, -150 + i * 85, -140, 40, 190, 6), '#D9D2C3');
  flat(ctx, () => rr(ctx, -200, 70, 400, 28, 6), P3.paper, 4);
  if (blocked) { ctx.save(); ctx.globalAlpha = clamp(blocked); ctx.translate(-300, -60); ctx.rotate(-0.08); flat(ctx, () => rr(ctx, -40, -150, 80, 300, 10), C.red, 4); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(-40, -110 + k * 90, 80, 30); ctx.restore(); }
}

module.exports = { NIGHT, wrap, carFront, carTurn, roadScene, interior, gaugeNoNum, brokerCorridor, printer, priceTag, trafficTicket, clipping, agencyBuilding };
