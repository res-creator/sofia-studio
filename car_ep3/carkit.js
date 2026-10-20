// Props for "Your Car Was Reporting On You" (Bold Editorial Collage), built on tests/mcd_collage/kit.js primitives.
// Brands are text only (no logos); the car is a generic stylized coupe.
const K = require('../tests/mcd_collage/kit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat, lerpCol } = K;
const P3 = { cream: C.paper, ink: C.ink, red: C.red, yellow: C.yellow, blue: '#4D8DFF', blueD: '#2F64C8', slate: '#C9D6EA', slateD: '#8EA3C2', dark: '#171717', panel: '#1F2330', manila: '#E8C27A', manilaD: '#C99E52', paper: '#FFFDF8', grey: '#8E95A6' };

const text = (ctx, s, x, y, size, col, font = F.black, align = 'left') => { ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); };

// ---------- insurance application (760 x 980, centre origin) ----------
function insuranceDoc(ctx, t, o = {}) {
  cut(ctx, () => rr(ctx, -380, -490, 760, 980, 30), P3.paper, { sb: 34, sy: 18, lw: 4 });
  flat(ctx, () => rr(ctx, -380, -490, 760, 150, [30, 30, 0, 0]), P3.blue);
  text(ctx, 'AUTO INSURANCE', -330, -400, 46, '#FFFFFF', F.black); text(ctx, 'APPLICATION', -330, -360, 28, 'rgba(255,255,255,0.8)', F.xb);
  carIcon(ctx, 260, -410, 0.9, '#FFFFFF');
  const row = (lab, val, y, vc) => { text(ctx, lab, -330, y, 28, '#7A7A7A', F.xb); text(ctx, val, -330, y + 56, 54, vc || C.ink); flat(ctx, () => rr(ctx, -330, y + 78, 660, 3, 1), '#E4DED2'); };
  row('VEHICLE', 'CHEVROLET CAMARO', -270, null); row('ACCIDENTS', '0', -130, null); row('TICKETS', '0', 10, null);
  text(ctx, 'STATUS', -330, 150, 28, '#7A7A7A', F.xb);
  const dots = '.'.repeat(1 + Math.floor((t * 4) % 3)); if (!o.denied) text(ctx, 'REVIEWING' + dots, -330, 206, 54, P3.blueD);
  for (let i = 0; i < 4; i++) flat(ctx, () => rr(ctx, -330, 260 + i * 44, 660 - i * 90, 16, 8), '#ECE6DA');
}
function carIcon(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(-50, 10); ctx.lineTo(-46, -6); ctx.lineTo(-22, -10); ctx.lineTo(-8, -26); ctx.lineTo(20, -26); ctx.lineTo(34, -10); ctx.lineTo(50, -6); ctx.lineTo(52, 10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(-28, 12, 10, 0, 7); ctx.arc(28, 12, 10, 0, 7); ctx.fill(); ctx.restore();
}

// ---------- records folder + pages ----------
function folder(ctx, o = {}) { // ~780 x 560, centre origin; o.open 0..1, o.label
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-390, -230); ctx.lineTo(-390, -280); ctx.quadraticCurveTo(-390, -300, -370, -300); ctx.lineTo(-140, -300); ctx.lineTo(-110, -260); ctx.lineTo(370, -260); ctx.quadraticCurveTo(390, -260, 390, -240); ctx.lineTo(390, 260); ctx.lineTo(-390, 260); ctx.closePath(); }, P3.manilaD, { sb: 34, sy: 18, lw: 4 });
  if (o.inside) o.inside(ctx);
  const op = E.inOut(clamp(o.open || 0)), h = 470 * (1 - op * 0.55);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-390, 260 - h); ctx.lineTo(390, 260 - h); ctx.lineTo(390, 260); ctx.lineTo(-390, 260); ctx.closePath(); }, P3.manila, { sb: 20, sy: 10, lw: 4 });
  if (o.label && op < 0.6) { ctx.save(); ctx.globalAlpha *= 1 - op / 0.6; flat(ctx, () => rr(ctx, -230, 260 - h + 70, 460, 90, 10), P3.paper, 3); text(ctx, o.label, 0, 260 - h + 130, 40, C.ink, F.black, 'center'); ctx.restore(); }
}
function page(ctx, i = 0) { // 220 x 280 record sheet
  cut(ctx, () => rr(ctx, -110, -140, 220, 280, 10), P3.paper, { sb: 14, sy: 8, edgeW: 6, lw: 2.5 });
  const col = [C.red, C.yellow, P3.blue][i % 3]; flat(ctx, () => rr(ctx, -90, -118, 60, 60, 10), col);
  text(ctx, ['BRAKE', 'ACCEL', 'SPEED'][i % 3], -20, -80, 22, C.ink, F.black);
  for (let k = 0; k < 6; k++) flat(ctx, () => rr(ctx, -90, -30 + k * 26, 180 - (hash(i * 7 + k) * 70), 10, 5), '#D9D2C3');
}

// ---------- police badge ----------
function badge(ctx, o = {}) { // ~520 tall
  const g = clamp(o.grey || 0), gold = lerpCol('#E8B23A', '#9AA0AA', g), goldD = lerpCol('#B9851E', '#6E7480', g);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -270); ctx.bezierCurveTo(90, -200, 170, -210, 220, -230); ctx.quadraticCurveTo(240, 40, 0, 260); ctx.quadraticCurveTo(-240, 40, -220, -230); ctx.bezierCurveTo(-170, -210, -90, -200, 0, -270); ctx.closePath(); }, gold, { sb: 34, sy: 18, lw: 5 });
  ctx.save(); ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 6, r = i % 2 ? 62 : 130; ctx.lineTo(Math.cos(a) * r, -10 + Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = goldD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, -10, 44, 0, 7); }, gold, 4);
  flat(ctx, () => rr(ctx, -170, 140, 340, 70, 12), C.ink); text(ctx, 'POLICE', 0, 192, 50, gold, F.black, 'center');
}
function xMark(ctx, x, y, s, u) { // two red slashes drawn on
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) { const v = clamp(u * 2 - k); if (v <= 0) continue; const a = k ? [260, -260, -260, 260] : [-260, -260, 260, 260];
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 64; ctx.beginPath(); ctx.moveTo(a[0] + 8, a[1] + 12); ctx.lineTo(lerp(a[0], a[2], v) + 8, lerp(a[1], a[3], v) + 12); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 56; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], a[2], v), lerp(a[1], a[3], v)); ctx.stroke(); }
  ctx.restore();
}

// ---------- the car: stylized coupe, side view, nose right, ground at y=0, ~1020 long ----------
const CAR_WIN = [60, -205]; // windshield point (for the camera dive)
function car(ctx, o = {}) {
  const col = o.col || C.red;
  ctx.save(); ctx.fillStyle = 'rgba(30,20,10,0.22)'; ctx.beginPath(); ctx.ellipse(0, 6, 520, 26, 0, 0, 7); ctx.fill(); ctx.restore();
  const body = () => { ctx.beginPath(); ctx.moveTo(-505, -40); ctx.lineTo(-500, -120); ctx.quadraticCurveTo(-480, -158, -420, -165); ctx.lineTo(-250, -175); ctx.quadraticCurveTo(-150, -268, 30, -272); ctx.quadraticCurveTo(110, -270, 190, -180); ctx.lineTo(440, -150); ctx.quadraticCurveTo(505, -140, 515, -95); ctx.lineTo(515, -40); ctx.quadraticCurveTo(515, -22, 490, -22); ctx.lineTo(-480, -22); ctx.quadraticCurveTo(-505, -22, -505, -40); ctx.closePath(); };
  cut(ctx, body, col, { sb: 40, sy: 22, lw: 4 });
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(-520, -80, 1040, 70); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-520, -150, 1040, 14); ctx.restore();
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-225, -180); ctx.quadraticCurveTo(-140, -252, 20, -255); ctx.quadraticCurveTo(95, -252, 160, -185); ctx.closePath(); }, o.glass || '#1B2234', 4);
  flat(ctx, () => rr(ctx, -40, -258, 16, 80, 6), col);
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#9CC3F5'; ctx.beginPath(); ctx.moveTo(40, -248); ctx.lineTo(80, -248); ctx.lineTo(10, -184); ctx.lineTo(-30, -184); ctx.closePath(); ctx.fill(); ctx.restore();
  flat(ctx, () => rr(ctx, 470, -128, 44, 26, 10), C.yellow, 3); flat(ctx, () => rr(ctx, -506, -134, 26, 30, 8), '#8A1C24', 3);
  flat(ctx, () => rr(ctx, -40, -150, 60, 10, 5), C.ink);
  for (const wx of [-330, 330]) {
    flat(ctx, () => { ctx.beginPath(); ctx.arc(wx, -22, 104, Math.PI, 0); ctx.closePath(); }, '#141414');
    flat(ctx, () => { ctx.beginPath(); ctx.arc(wx, -6, 86, 0, 7); }, '#202020', 4); flat(ctx, () => { ctx.beginPath(); ctx.arc(wx, -6, 50, 0, 7); }, '#B8BEC9', 3);
    ctx.save(); ctx.translate(wx, -6); ctx.rotate(o.spin || 0); ctx.strokeStyle = '#6E7480'; ctx.lineWidth = 8; for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -44); ctx.stroke(); } ctx.restore();
    flat(ctx, () => { ctx.beginPath(); ctx.arc(wx, -6, 14, 0, 7); }, '#4A4F5A', 3);
  }
}

// ---------- dashboard HUD ----------
function gauge(ctx, v, o = {}) { // speedometer r=320; v 0..1
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); }, P3.panel, { sb: 40, sy: 18, lw: 4, stroke: '#0B0D14' });
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  ctx.lineCap = 'round';
  ctx.lineWidth = 26; ctx.strokeStyle = '#2C3245'; ctx.beginPath(); ctx.arc(0, 0, 268, a0, a1); ctx.stroke();
  ctx.strokeStyle = P3.blue; ctx.beginPath(); ctx.arc(0, 0, 268, a0, lerp(a0, a1, Math.min(v, 0.72))); ctx.stroke();
  if (v > 0.72) { ctx.strokeStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 268, lerp(a0, a1, 0.72), lerp(a0, a1, v)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5;
  for (let i = 0; i <= 14; i++) { const a = lerp(a0, a1, i / 14), r0 = i % 2 ? 222 : 206; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * 240, Math.sin(a) * 240); ctx.stroke(); }
  const na = lerp(a0, a1, v); ctx.strokeStyle = o.needle || C.yellow; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(na) * 230, Math.sin(na) * 230); ctx.stroke();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); }, '#0B0D14', 4);
  text(ctx, String(Math.round(v * 140)), 0, 150, 110, '#FFFFFF', F.black, 'center'); text(ctx, 'MPH', 0, 200, 34, P3.slateD, F.xb, 'center');
}
function eventIcon(ctx, kind, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
  if (kind === 0) { ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 36, Math.PI * 0.7, Math.PI * 1.3); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 36, -Math.PI * 0.3, Math.PI * 0.3); ctx.stroke(); ctx.font = `34px ${F.black}`; ctx.textAlign = 'center'; ctx.fillText('!', 0, 12); }
  else if (kind === 1) { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-34 + k * 6, -16 + k * 16); ctx.lineTo(8 + k * 6, -16 + k * 16); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(18, -26); ctx.lineTo(38, 0); ctx.lineTo(18, 26); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, 8, 32, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(24, -16); ctx.stroke(); }
  ctx.restore();
}
function dataCard(ctx, kind, label, o = {}) { // 640 x 120
  const col = [C.red, C.yellow, P3.blue][kind];
  cut(ctx, () => rr(ctx, -320, -60, 640, 120, 20), P3.paper, { sb: 20, sy: 10, lw: 3 });
  flat(ctx, () => rr(ctx, -306, -46, 92, 92, 16), col); eventIcon(ctx, kind, -260, 0, 1.0);
  text(ctx, label, -190, 18, 50, C.ink, F.black);
  if (o.stamp) text(ctx, o.stamp, 300, 14, 26, '#7A7A7A', F.xb, 'right');
}
function recChip(ctx, t) { cut(ctx, () => rr(ctx, -110, -34, 220, 68, 34), '#0B0D14', { sb: 10, sy: 4, lw: 3, stroke: '#3A4256' });
  ctx.fillStyle = Math.floor(t * 2.5) % 2 ? '#5A1018' : C.red; ctx.beginPath(); ctx.arc(-62, 0, 16, 0, 7); ctx.fill(); text(ctx, 'REC', -30, 16, 40, '#FFFFFF', F.black); }

// ---------- data chain ----------
function reportCard(ctx, o = {}) { // 560 x 700
  cut(ctx, () => rr(ctx, -280, -350, 560, 700, 24), P3.paper, { sb: 30, sy: 16, lw: 4 });
  flat(ctx, () => rr(ctx, -280, -350, 560, 120, [24, 24, 0, 0]), C.ink); text(ctx, 'DRIVING', -240, -296, 44, '#FFFFFF'); text(ctx, 'REPORT', -240, -250, 44, C.yellow);
  [C.red, C.yellow, P3.blue, C.red, P3.blue, C.yellow].forEach((c, i) => { flat(ctx, () => rr(ctx, -240, -190 + i * 70, 40, 40, 8), c); flat(ctx, () => rr(ctx, -180, -180 + i * 70, 300 + hash(i) * 110, 20, 10), '#D9D2C3'); });
  flat(ctx, () => rr(ctx, -240, 240, 480, 70, 14), '#F1ECE2', 3); text(ctx, 'RISK', -215, 290, 40, C.ink); flat(ctx, () => rr(ctx, -90, 262, 300 * clamp(o.risk ?? 0.8), 26, 13), C.red);
}
function insurer(ctx) { // shield with a car, ~420 tall
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(200, -170); ctx.quadraticCurveTo(210, 90, 0, 220); ctx.quadraticCurveTo(-210, 90, -200, -170); ctx.closePath(); }, P3.blue, { sb: 30, sy: 16, lw: 5 });
  carIcon(ctx, 0, -10, 2.2, '#FFFFFF'); flat(ctx, () => rr(ctx, -170, 110, 340, 62, 12), C.ink); text(ctx, 'INSURER', 0, 158, 44, '#FFFFFF', F.black, 'center');
}
function riskMeter(ctx, v) { // semicircle low->high, r=260
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 300, Math.PI, 0); ctx.lineTo(300, 40); ctx.lineTo(-300, 40); ctx.closePath(); }, P3.paper, { sb: 26, sy: 12, lw: 4 });
  const seg2 = [[P3.blue, 0, 0.4], [C.yellow, 0.4, 0.72], [C.red, 0.72, 1]];
  ctx.lineWidth = 46; for (const [c, a, b] of seg2) { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(0, 0, 220, Math.PI + a * Math.PI, Math.PI + b * Math.PI); ctx.stroke(); }
  const na = Math.PI + v * Math.PI; ctx.strokeStyle = C.ink; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(na) * 200, Math.sin(na) * 200); ctx.stroke();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); }, C.ink); text(ctx, 'LOW', -250, 34, 30, '#7A7A7A', F.xb); text(ctx, 'HIGH', 250, 34, 30, '#7A7A7A', F.xb, 'right');
}
function arrowDown(ctx, x0, y0, y1, u, t) { // dashed connector with a travelling pulse
  if (u <= 0) return; const y = lerp(y0, y1, u); ctx.save(); ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 8; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y); ctx.stroke(); ctx.setLineDash([]);
  if (u >= 1) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0 - 26, y1 - 30); ctx.lineTo(x0 + 26, y1 - 30); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fill(); } ctx.restore();
}

// ---------- legal documents ----------
function legalDoc(ctx, title, o = {}) { // 720 x 940
  cut(ctx, () => rr(ctx, -360, -470, 720, 940, 14), P3.paper, { sb: 34, sy: 18, lw: 4 });
  text(ctx, o.kicker || 'UNITED STATES', 0, -390, 26, '#7A7A7A', F.xb, 'center'); text(ctx, title, 0, -320, 64, C.ink, F.black, 'center');
  flat(ctx, () => rr(ctx, -300, -290, 600, 6, 3), C.ink);
  for (let i = 0; i < 11; i++) flat(ctx, () => rr(ctx, -300, -230 + i * 52, 600 - (i % 4 === 3 ? 220 : hash(i * 5) * 90), 16, 8), '#D9D2C3');
  if (o.hi) { const u = E.inOut(clamp(o.hi)); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,200,87,0.9)'; ctx.fillRect(-306, -128, 612 * u, 44); ctx.fillRect(-306, -24, 520 * u, 44); ctx.restore(); }
}
function padlock(ctx, s, u) { if (u <= 0) return; const k = E.back(clamp(u), 2.2); ctx.save(); ctx.scale(s * k, s * k);
  ctx.lineWidth = 28; ctx.strokeStyle = '#9AA0AA'; ctx.beginPath(); ctx.arc(0, -70, 70, Math.PI, 0); ctx.lineTo(70, -10); ctx.moveTo(-70, -70); ctx.lineTo(-70, -10); ctx.stroke();
  cut(ctx, () => rr(ctx, -110, -20, 220, 170, 24), C.yellow, { sb: 20, sy: 10, lw: 4 }); flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 50, 20, 0, 7); }, C.ink); flat(ctx, () => rr(ctx, -8, 50, 16, 50, 6), C.ink); ctx.restore(); }

module.exports = { P3, text, insuranceDoc, carIcon, folder, page, badge, xMark, car, CAR_WIN, gauge, eventIcon, dataCard, recChip, reportCard, insurer, riskMeter, arrowDown, legalDoc, padlock };
