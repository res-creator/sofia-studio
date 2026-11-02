// Episode 20 "The lightbulb cartel" (Phoebus, Geneva 1924) — props and sets on howitsrun_style (people, sets, plates from the style
// reference lawnchair_ep17 / emu_ep12). Generic re-enactment: no logos, no portraits (company names only as plain text, and we use none).
// World space: floor at y = 0, up is negative.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash, lerpCol } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');

// ---------- the lightbulb (screw base at y = 0, globe above; ~330 tall at s = 1). o.on 0..1, o.burnt, o.flick ----------
function globePath(ctx) { ctx.beginPath(); ctx.moveTo(-32, -88); ctx.bezierCurveTo(-38, -128, -108, -150, -108, -214); ctx.arc(0, -214, 108, Math.PI, 0); ctx.bezierCurveTo(108, -150, 38, -128, 32, -88); ctx.closePath(); }
function bulb(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const on = clamp(o.on || 0);
  if (on > 0 && o.glow !== false) LT.glow(ctx, 0, -210, 360, 'rgba(255,214,110,1)', 0.6 * on);
  // screw base
  rr(ctx, -36, -96, 72, 84, 10); fillStroke(ctx, '#BFC3C7', 5);
  ctx.strokeStyle = '#7E8489'; ctx.lineWidth = 5; for (let y = -80; y < -16; y += 16) { ctx.beginPath(); ctx.moveTo(-34, y); ctx.lineTo(34, y + 6); ctx.stroke(); }
  ell(ctx, 0, -8, 18, 12); fillStroke(ctx, '#3A3A40', 4);
  // glass
  const fill = o.burnt ? '#B3AFA4' : lerpCol('#EAF0F2', '#FFF1A8', on);
  CL.cutout(ctx, () => globePath(ctx), fill, { elev: o.elev ?? 1, tex: 0.35 });
  if (o.burnt) { ctx.save(); globePath(ctx); ctx.clip(); const g = ctx.createRadialGradient(0, -250, 10, 0, -250, 110); g.addColorStop(0, 'rgba(40,36,30,0.55)'); g.addColorStop(1, 'rgba(40,36,30,0)'); ctx.fillStyle = g; ctx.fillRect(-120, -330, 240, 240); ctx.restore(); }
  // filament: two stems + zigzag
  const fc = o.burnt ? '#5A564E' : lerpCol('#6A6A68', '#FFFFFF', on);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#8A8F98'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, -96); ctx.lineTo(-30, -190); ctx.moveTo(14, -96); ctx.lineTo(30, -190); ctx.stroke();
  const zz = []; for (let i = 0; i <= 8; i++) zz.push([lerp(-30, 30, i / 8), -190 - (i % 2 ? 22 : 0)]);
  if (on > 0.05 && !o.burnt) { ctx.strokeStyle = `rgba(255,190,60,${0.6 * on})`; ctx.lineWidth = 16; ctx.beginPath(); zz.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); }
  ctx.strokeStyle = fc; ctx.lineWidth = 6; ctx.beginPath();
  zz.forEach((p, i) => { if (o.burnt && i === 5) { ctx.lineTo(p[0] - 6, p[1] + 10); ctx.moveTo(p[0] + 4, p[1] + 14); } else if (i) ctx.lineTo(...p); else ctx.moveTo(...p); }); ctx.stroke();
  // highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, -214, 80, Math.PI * 1.08, Math.PI * 1.38); ctx.stroke();
  ctx.restore();
}
// a hanging lamp: cord from y = top down to the socket at (0, 0), bulb hanging below; on 0..1
function pendant(ctx, s, top, on) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(0, 0); ctx.stroke();
  ctx.scale(s, s); rr(ctx, -46, -20, 92, 40, 10); fillStroke(ctx, '#2A2A30', 5); ctx.translate(0, 8); ctx.rotate(Math.PI); bulb(ctx, 1, { on, elev: 0.8 }); ctx.restore();
}
// a mound of burnt-out bulbs (cached sprite), bottom centre at (0, 0), w wide
let PILE = null;
function bulbPile(ctx, w = 700) {
  if (!PILE) { const cw = 1400, ch = 840; PILE = createCanvas(cw, ch); const g = PILE.getContext('2d'); g.translate(cw / 2, 700);
    const items = []; for (let i = 0; i < 70; i++) { const x = (hash(i * 3.1) - 0.5) * 1180, top = -560 * Math.cos(Math.min(1, Math.abs(x) / 620) * Math.PI / 2) ** 0.9; items.push([x, lerp(-10, top + 40, hash(i * 7.7) ** 0.7), (hash(i * 5.3) - 0.5) * 3.4, 0.62 + hash(i) * 0.25]); }
    items.sort((a, b) => a[1] - b[1]); for (const [x, y, r, s] of items) { g.save(); g.translate(x, y); g.rotate(r); g.translate(0, 160 * s); bulb(g, s, { burnt: true, elev: 0.6 }); g.restore(); } }
  const k = w / 1400; ctx.drawImage(PILE, -700 * k, -700 * k, 1400 * k, 840 * k);
}
// ---------- the Geneva meeting room: dark panelled wall, tall window with the lake and the mountains ----------
function genevaView(ctx, t) { ctx.fillStyle = '#C9D7E0'; ctx.fillRect(-240, -60, 480, 300); SE.poly(ctx, [[-240, 0], [-120, -140], [-20, -40], [80, -170], [240, -20], [240, 40], [-240, 40]], '#8EA2B8', 3);
  SE.poly(ctx, [[80, -170], [50, -130], [110, -130]], '#FFFDF8', 2); ctx.fillStyle = '#6E9CC8'; ctx.fillRect(-240, 40, 480, 200); }
function meetRoom(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: '#8C6A4E', floor: 'carpet', carpet: '#7A3A3A', window: o.window ?? 640, view: genevaView, frame: o.frame });
  ctx.strokeStyle = 'rgba(40,24,12,0.35)'; ctx.lineWidth = 6; for (let x = -2900; x < 3000; x += 420) { rr(ctx, x, -1500, 340, 620, 8); ctx.stroke(); rr(ctx, x, -800, 340, 640, 8); ctx.stroke(); }
}
// the conference table, side view (top at y = top), centred at 0
function table(ctx, w = 900, top = -300) { rr(ctx, -w / 2, top, w, 36, 8); fillStroke(ctx, '#5A3A22', 5); for (const x of [-w / 2 + 60, w / 2 - 80]) { rr(ctx, x, top + 36, 26, -top - 36, 4); fillStroke(ctx, '#4A2E1A', 5); } }
// the agreement (centred, ~440 x 560). stamp 0..1 = SECRET; tear 0..1 splits it in two halves
function agreement(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const tr = o.tear || 0;
  const draw = () => { CL.cutout(ctx, () => rr(ctx, -220, -280, 440, 560, 6), '#FBF6EA', { elev: 1.4 });
    fitTxt(ctx, 'AGREEMENT', 0, -200, 54, INK, 380, 'center', ST.FONT.type); fitTxt(ctx, 'GENEVA · 1924', 0, -150, 30, '#4A4A48', 380, 'center', ST.FONT.type);
    ctx.strokeStyle = 'rgba(40,40,40,0.35)'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-170, -90 + i * 40); ctx.lineTo(170 - (i % 3) * 40, -90 + i * 40); ctx.stroke(); }
    fitTxt(ctx, '1,000 HOURS', 0, 190, 40, C.red, 380, 'center', ST.FONT.type);
    ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = 4; for (const x of [-120, 0, 120]) { ctx.beginPath(); ctx.moveTo(x - 50, 250); ctx.bezierCurveTo(x - 20, 220, x, 270, x + 40, 236); ctx.stroke(); }
    if (o.stamp > 0) { ctx.save(); ctx.translate(40, 40); ST.stampWord(ctx, 'SECRET', 76, o.stamp, C.red, -0.2); ctx.restore(); } };
  if (tr <= 0) draw();
  else for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 80 * E.out(tr), 60 * E.in(tr) * (k > 0 ? 1.4 : 1)); ctx.rotate(k * 0.22 * E.out(tr));
    ctx.beginPath(); ctx.moveTo(0, -300); for (let i = 0; i <= 12; i++) ctx.lineTo((hash(i + 3) - 0.5) * 40, -300 + i * 50); ctx.lineTo(k * 400, 320); ctx.lineTo(k * 400, -320); ctx.closePath(); ctx.clip(); draw(); ctx.restore(); }
  ctx.restore();
}
// ---------- the world map board (paper card, centred at 0; the map from tests/mcd_collage/kit.js) ----------
const MAP_PTS = { GERMANY: [11, 51], NETHERLANDS: [5, 52.3], FRANCE: [2.5, 46.5], BRITAIN: [-2, 53], JAPAN: [138, 36], USA: [-98, 39] };
function mapBoard(ctx) {
  CL.cutout(ctx, () => rr(ctx, -500, -340, 1000, 680, 16), '#CFE6F2', { elev: 1.6 });
  ctx.save(); ctx.translate(0, 300); K.continents(ctx); ctx.restore();
}
const mapXY = n => { const [x, y] = K.ll(...MAP_PTS[n]); return [x, y + 300]; };
// a pin + a paper pennant with a country name (pennant at offset (dx, dy) from the pin), u = pop 0..1
function pennant(ctx, name, col, dx, dy, u) {
  if (u <= 0) return; const [x, y] = mapXY(name);
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(dx * u, dy * u); ctx.stroke();
  ell(ctx, 0, 0, 13, 13); fillStroke(ctx, C.red, 4);
  ctx.translate(dx * u, dy * u); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.font = `40px ${F.black}`; const w = ctx.measureText(name).width + 34;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -32, w, 60, 10), col, { elev: 1.2 }); txt(ctx, name, 0, 13, 40, col === PAL.cream || col === C.yellow ? INK : PAL.cream); ctx.restore();
}
// ---------- hours plate (centred). text, colour; cut 0..1: right half drops away after a vertical cut ----------
function hourPlate(ctx, s, num, sub, o = {}) {
  ctx.save(); ctx.scale(s, s); const w = 780, h = 300, cutU = o.cut || 0;
  const body = () => { CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 22), o.col || PAL.cream, { elev: 1.8 }); fitTxt(ctx, num, 0, 50, 170, o.fg || INK, w - 80); fitTxt(ctx, sub, 0, 125, 44, o.fg2 || '#4A4A48', w - 80); };
  if (cutU <= 0) body();
  else { ctx.save(); ctx.beginPath(); ctx.rect(-w, -h, w, h * 2); ctx.clip(); body(); ctx.restore();
    ctx.save(); ctx.translate(30 * cutU, 2400 * E.in(cutU)); ctx.rotate(0.6 * E.in(cutU)); ctx.beginPath(); ctx.rect(0, -h, w, h * 2); ctx.clip(); body(); ctx.restore(); }
  ctx.restore();
}
// big tailor scissors, pivot at 0, blades to +x; open 0..1
function scissors(ctx, s = 1, open = 0) {
  ctx.save(); ctx.scale(s, s); const a = 0.05 + 0.32 * open;
  for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * a);
    SE.poly(ctx, [[0, -14 * k], [330, -4 * k], [340, 2 * k], [0, 18 * k]], '#C9CED6', 4);
    ctx.save(); ctx.translate(-120, 30 * k); ell(ctx, 0, 0, 62, 40); fillStroke(ctx, C.red, 5); ell(ctx, 0, 0, 34, 20); fillStroke(ctx, PAL.paper, 4); ctx.restore();
    tube(ctx, [[-70, 22 * k], [0, 4 * k]], 22, C.red, 4); ctx.restore(); }
  ell(ctx, 0, 0, 12, 12); fillStroke(ctx, '#5A606B', 4); ctx.restore();
}
// ---------- Switzerland: the Alps, the test lab ----------
function alps(ctx, t) {
  SE.sky(ctx, t, { clouds: 2, hills: false, sunX: -800, sunY: -1700 });
  for (const [x, h, col, w] of [[-1500, 1400, '#9DB0C8', 900], [-500, 1700, '#8EA2BC', 1000], [600, 1500, '#9DB0C8', 950], [1600, 1300, '#8EA2BC', 900], [-900, 900, '#7E96B0', 800], [1000, 1000, '#7E96B0', 800]]) {
    SE.poly(ctx, [[x - w, 0], [x, -h], [x + w, 0]], col, 5); SE.poly(ctx, [[x - w * 0.24, -h * 0.76], [x, -h], [x + w * 0.24, -h * 0.76], [x + w * 0.08, -h * 0.7], [x - w * 0.06, -h * 0.78]], '#FFFDF8', 4); }
  ctx.fillStyle = '#7CC27A'; ctx.fillRect(-4000, -40, 8000, 2000); ctx.fillStyle = 'rgba(60,140,70,0.2)'; for (let i = 0; i < 12; i++) if (i % 2) ctx.fillRect(-4000, -40 + i * 90, 8000, 90);
  ctx.fillStyle = '#D9C9A6'; ctx.fillRect(-4000, 30, 8000, 120); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-4000, 30); ctx.lineTo(4000, 30); ctx.moveTo(-4000, 150); ctx.lineTo(4000, 150); ctx.stroke();
}
function lab(ctx) {
  rr(ctx, -420, -700, 840, 700, 8); fillStroke(ctx, '#F2E8D4', 5); SE.poly(ctx, [[-470, -700], [0, -930], [470, -700]], '#B0503A', 5);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { if (r === 1 && (c === 1 || c === 2)) continue; rr(ctx, -360 + c * 190, -560 + r * 250, 120, 140, 6); fillStroke(ctx, '#FFE9A0', 4); }
  rr(ctx, -90, -260, 180, 260, 6); fillStroke(ctx, '#8A5A34', 5);
  CL.cutout(ctx, () => rr(ctx, -300, -800, 600, 92, 10), PAL.navy, { elev: 1 }); fitTxt(ctx, 'TEST LAB', 0, -738, 60, PAL.cream, 560);
  // a small Swiss flag on a pole (plain flag, not a logo)
  tube(ctx, [[380, -700], [380, -1060]], 10, '#8A8F98', 3); rr(ctx, 380, -1060, 120, 120, 4); fillStroke(ctx, '#D52B1E', 4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(428, -1040, 24, 80); ctx.fillRect(400, -1012, 80, 24);
}
// a parcel (base centre at 0), label text
function parcel(ctx, s = 1, lab = 'SAMPLES') {
  ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -120, -150, 240, 150, 8), '#C9A06A', { elev: 1, tex: 0.5 });
  ctx.strokeStyle = '#7A5A34'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, 0); ctx.moveTo(-120, -75); ctx.lineTo(120, -75); ctx.stroke();
  rr(ctx, 14, -136, 96, 48, 4); fillStroke(ctx, PAL.cream, 3); fitTxt(ctx, lab, 62, -104, 18, INK, 86); ctx.restore();
}
// stopwatch (centred), hand angle from t
function stopwatch(ctx, s = 1, a = 0) {
  ctx.save(); ctx.scale(s, s); rr(ctx, -16, -128, 32, 34, 6); fillStroke(ctx, '#BFC3C7', 4); ell(ctx, 0, -134, 22, 10); fillStroke(ctx, '#BFC3C7', 4);
  CL.cutout(ctx, () => ell(ctx, 0, 0, 100, 100), '#D9DDE0', { elev: 1 }); ell(ctx, 0, 0, 82, 82); fillStroke(ctx, PAL.cream, 4);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.sin(b) * 66, -Math.cos(b) * 66); ctx.lineTo(Math.sin(b) * 78, -Math.cos(b) * 78); ctx.stroke(); }
  ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 66, -Math.cos(a) * 66); ctx.stroke(); ell(ctx, 0, 0, 9, 9); fillStroke(ctx, INK, 0); ctx.restore();
}
// the test rack: a lab bench with n bulbs in sockets; on[i] 0..1, tags under them
function testRack(ctx, on, tags = []) {
  rr(ctx, -560, -330, 1120, 40, 8); fillStroke(ctx, '#8A5A34', 5); rr(ctx, -540, -290, 1080, 290, 6); fillStroke(ctx, shade('#8A5A34', -0.15), 5);
  on.forEach((u, i) => { const x = -420 + i * 210; ctx.save(); ctx.translate(x, -330); rr(ctx, -40, -40, 80, 40, 6); fillStroke(ctx, '#2A2A30', 4); ctx.translate(0, -34); bulb(ctx, 0.62, { on: u, burnt: u < 0, elev: 0.8 }); ctx.restore();
    if (tags[i]) { ctx.save(); ctx.translate(x, -200); CL.cutout(ctx, () => rr(ctx, -80, -26, 160, 52, 8), tags[i][1] || PAL.cream, { elev: 0.6, tex: 0 }); fitTxt(ctx, tags[i][0], 0, 12, 32, tags[i][2] || INK, 140); ctx.restore(); } });
}
// a plain banknote (no currency, no number): green paper with an oval
function note(ctx, s = 1, rot = 0) { ctx.save(); ctx.scale(s, s); ctx.rotate(rot); CL.cutout(ctx, () => rr(ctx, -130, -62, 260, 124, 8), '#CFE3C4', { elev: 1.1 });
  ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = '#3D8C6A'; rr(ctx, -114, -48, 228, 96, 6); ctx.stroke(); ell(ctx, 0, 0, 34, 40); ctx.fillStyle = '#B5D6AA'; ctx.fill(); ctx.stroke(); ctx.restore(); }
// a factory office desk with a lamp (floor 0) — the owner pays the fine
function office(ctx, t) {
  SE.room(ctx, t, { wall: '#DCD3C0', floor: 'wood', window: -700, view: (g) => { g.fillStyle = '#9AA3AA'; g.fillRect(-240, -60, 480, 300); for (let i = 0; i < 3; i++) { rr(g, -200 + i * 150, -120 - i * 30, 90, 400, 4); fillStroke(g, '#6A6E74', 3); } } });
  CL.cutout(ctx, () => rr(ctx, -260, -1290, 520, 120, 10), '#3A3F4A', { elev: 1 }); fitTxt(ctx, 'BULB FACTORY', 0, -1210, 54, PAL.cream, 480);
}
// ---------- chart on paper: average bulb life 1926 -> 1933 (u = draw progress) ----------
function chart(ctx, u, o = {}) {
  const w = 860, h = 760; ctx.save(); ctx.rotate(-0.015); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FBF6EA', { elev: 1.8 });
  fitTxt(ctx, 'AVERAGE BULB LIFE', 0, -h / 2 + 76, 54, INK, w - 80, 'center', ST.FONT.type);
  const x0 = -w / 2 + 120, x1 = w / 2 - 110, yTop = -h / 2 + 200, yBot = h / 2 - 120, Y = v => lerp(yBot, yTop, (v - 0) / 2000);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(x0, yTop - 20); ctx.lineTo(x0, yBot); ctx.lineTo(x1 + 40, yBot); ctx.stroke();
  ctx.strokeStyle = 'rgba(80,110,160,0.25)'; ctx.lineWidth = 3; for (const v of [500, 1000, 1500, 2000]) { ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1 + 40, Y(v)); ctx.stroke(); }
  fitTxt(ctx, '1926', x0 + 40, yBot + 60, 40, '#4A4A48', 200, 'center', ST.FONT.type); fitTxt(ctx, '1933', x1, yBot + 60, 40, '#4A4A48', 200, 'center', ST.FONT.type);
  const pts = [[x0 + 40, Y(1800)], [lerp(x0 + 40, x1, 0.3), Y(1700)], [lerp(x0 + 40, x1, 0.55), Y(1450)], [lerp(x0 + 40, x1, 0.8), Y(1300)], [x1, Y(1205)]];
  const n = (pts.length - 1) * clamp(u); ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); } ctx.stroke();
  ell(ctx, ...pts[0], 14, 14); fillStroke(ctx, C.red, 4); ST.label(ctx, '1,800 h', pts[0][0] + 110, pts[0][1] - 60, 1, { size: 40, rot: 0 });
  if (u >= 1) { ell(ctx, ...pts[4], 14, 14); fillStroke(ctx, C.red, 4); }
  ST.label(ctx, '1,205 h', pts[4][0] - 70, pts[4][1] + 80, o.endU || 0, { size: 40, rot: 0 });
  ctx.restore();
}
// ---------- cost vs price columns + the money bag between them ----------
function moneyBag(ctx, s = 1) { ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-50, -250); ctx.quadraticCurveTo(-30, -200, -70, -180); ctx.bezierCurveTo(-200, -120, -190, 0, -100, 0); ctx.lineTo(100, 0); ctx.bezierCurveTo(190, 0, 200, -120, 70, -180); ctx.quadraticCurveTo(30, -200, 50, -250); ctx.closePath(); }, '#C9A06A', { elev: 1.6, tex: 0.5 });
  ctx.strokeStyle = '#6A4A2A'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-62, -186); ctx.quadraticCurveTo(0, -170, 62, -186); ctx.stroke(); txt(ctx, '$', 0, -40, 130, '#2F7A58'); ctx.restore(); }
// ---------- the shop: shelves with bulb boxes, counter, cash register ----------
function shop(ctx, t) {
  SE.room(ctx, t, { wall: '#EFE3CB', floor: 'tile' });
  for (let r = 0; r < 2; r++) { const y = -830 + r * 240; rr(ctx, -900, y, 1500, 24, 4); fillStroke(ctx, '#8A5A34', 4); for (let i = 0; i < 9; i++) { const x = -860 + i * 160; rr(ctx, x, y - 150, 110, 150, 6); fillStroke(ctx, ['#FFE9A0', '#F2D6C0', '#CFE3D0'][(i + r) % 3], 4); ctx.save(); ctx.translate(x + 55, y - 40); bulb(ctx, 0.28, { elev: 0, glow: false }); ctx.restore(); } }
}
function register(ctx, s = 1, ding = 0, n = '') { ctx.save(); ctx.scale(s, s); SE.poly(ctx, [[-150, 0], [150, 0], [130, -200], [-130, -200]], '#B08A3A', 5); rr(ctx, -110, -300, 220, 110, 8); fillStroke(ctx, '#C9A04A', 5);
  rr(ctx, -80, -290, 160, 70, 6); fillStroke(ctx, '#FFFDF8', 3); fitTxt(ctx, n, 0, -240, 52, INK, 140);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { ell(ctx, -80 + j * 54, -150 + i * 44, 16, 14); fillStroke(ctx, '#F4F1E8', 3); }
  rr(ctx, -150, -6 + ding * 40, 300, 46, 4); fillStroke(ctx, '#8A6A2A', 4); ctx.restore(); }
// newspaper held open (for the reader)
function paperNews(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.rotate(-0.25); CL.cutout(ctx, () => rr(ctx, -40, -150, 230, 260, 4), '#F2EEE2', { elev: 0.8, tex: 0.4 });
  fitTxt(ctx, 'NEWS', 75, -110, 36, INK, 200, 'center', ST.FONT.type); ctx.fillStyle = 'rgba(40,40,40,0.35)'; for (let i = 0; i < 7; i++) ctx.fillRect(-20, -80 + i * 26, 190 - (i % 3) * 30, 10); ctx.restore(); }
// the home: wall, floor lamp-free room, armchair; the hanging bulb is drawn by the shot
function home(ctx, t, dim = 0) {
  SE.room(ctx, t, { wall: lerpCol('#E8D7B0', '#6A5E4A', dim), floor: 'wood', frame: { x: -520, y: -1000, draw: g => { g.fillStyle = '#9DB8A0'; g.fillRect(-128, -88, 256, 176); SE.poly(g, [[-128, 88], [-30, -40], [60, 40], [128, -20], [128, 88]], '#6E9070', 2); } } });
}
function armchair(ctx, s = 1) { ctx.save(); ctx.scale(s, s); rr(ctx, -220, -520, 120, 520, 40); fillStroke(ctx, '#8A3A3A', 5); rr(ctx, -200, -250, 380, 120, 30); fillStroke(ctx, '#A04848', 5); rr(ctx, -200, -140, 380, 140, 20); fillStroke(ctx, '#7A3030', 5); ctx.restore(); }

module.exports = { CS, bulb, pendant, bulbPile, meetRoom, table, agreement, mapBoard, mapXY, pennant, hourPlate, scissors, alps, lab, parcel, stopwatch, testRack, note, office, chart, moneyBag, shop, register, paperNews, home, armchair };
