// Episode 22 "Your ring is an ad" — props and sets on howitsrun_style (style reference lawnchair_ep17 / emu_ep12).
// Generic re-enactment: no logos (company names as plain text only), no portraits. World space: floor at y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');
const GOLD = '#E8B83A', GEM = '#BFE8FF';

// ---------- the diamond (brilliant cut, side view), centred, width 2r ----------
function gem(ctx, r = 40, glow = 0) {
  ctx.save();
  if (glow > 0) LT.glow(ctx, 0, 0, r * 3.2, 'rgba(220,245,255,1)', 0.55 * glow);
  const top = -r * 0.45, gird = -r * 0.1;
  SE.poly(ctx, [[-r * 0.55, top], [r * 0.55, top], [r, gird], [0, r * 0.95], [-r, gird]], GEM, 4.5);
  ctx.strokeStyle = 'rgba(40,90,130,0.55)'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(-r, gird); ctx.lineTo(r, gird); ctx.moveTo(-r * 0.55, top); ctx.lineTo(-r * 0.3, gird); ctx.lineTo(0, r * 0.95); ctx.lineTo(r * 0.3, gird); ctx.lineTo(r * 0.55, top);
  ctx.moveTo(-r * 0.3, gird); ctx.lineTo(0, top); ctx.lineTo(r * 0.3, gird); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.moveTo(-r * 0.45, top + 3); ctx.lineTo(-r * 0.15, top + 3); ctx.lineTo(-r * 0.35, gird - 2); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// a 4-point sparkle star
function star(ctx, x, y, r, a = 1, col = '#FFFFFF') {
  if (a <= 0 || r <= 0) return; ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const rr2 = i % 2 ? r * 0.22 : r, an = i * Math.PI / 4 - Math.PI / 2; ctx.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(23,23,23,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
function sparkles(ctx, t, r, n = 3, k = 1, seed = 0) { for (let i = 0; i < n; i++) { const ph = (t * 1.6 + hash(i + seed) ) % 1; star(ctx, Math.cos(i * 2.4 + seed) * r, Math.sin(i * 2.4 + seed) * r * 0.8 - r * 0.2, 26 * k * Math.sin(ph * Math.PI), 0.95); } }
// the ring (gold band + diamond), base of the band at 0, ~2.2 r tall
function ring(ctx, r = 40, glow = 0) {
  ctx.save(); ctx.lineWidth = r * 0.5; ctx.strokeStyle = INK; ell(ctx, 0, 0, r, r * 0.9); ctx.stroke(); ctx.lineWidth = r * 0.3; ctx.strokeStyle = GOLD; ctx.stroke();
  ctx.translate(0, -r * 1.15); gem(ctx, r * 0.62, glow); ctx.restore();
}
// the ring box (velvet), centred on its base; open 0..1 (lid angle), glow 0..1
function ringBox(ctx, s = 1, open = 1, glow = 0, t = 0) {
  ctx.save(); ctx.scale(s, s);
  const u = clamp(open);
  if (u > 0.02) { const h = 150 * u; rr(ctx, -92, -112 - h, 184, h + 10, 14); fillStroke(ctx, '#8A1E2E', 5); if (h > 40) { rr(ctx, -76, -100 - h, 152, h - 20, 8); ctx.fillStyle = '#F4EEDF'; ctx.fill(); } }
  rr(ctx, -95, -110, 190, 110, 16); fillStroke(ctx, '#A82638', 5); rr(ctx, -80, -112, 160, 34, 10); fillStroke(ctx, '#5A0E1A', 4);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-80, -70, 160, 10);
  if (u > 0.3) { ctx.save(); ctx.translate(0, -112); ring(ctx, 34, glow); if (glow > 0) { ctx.translate(0, -40); sparkles(ctx, t, 70, 3, 1.1 * glow); } ctx.restore(); }
  if (u <= 0.02) { rr(ctx, -98, -150, 196, 46, 16); fillStroke(ctx, '#8A1E2E', 5); }
  ctx.restore();
}
// sound arcs in front of the megaphone (world), u = phase
function shout(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const u = (t * 2.2 + i / 3) % 1; ctx.globalAlpha = Math.sin(u * Math.PI) * 0.9; ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 50 + u * 160, -0.55, 0.55); ctx.stroke(); }
  ctx.restore(); }

// ---------- the wedding hall (floor y = 0): pink wall, flower arch, chairs with ribbons ----------
function hall(ctx, t) {
  SE.room(ctx, t, { wall: '#F2DCD8', floor: 'wood' });
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = -3000; x < 3000; x += 220) ctx.fillRect(x, -2400, 90, 2340);
  for (const x of [-1300, 1300]) { ctx.save(); ctx.translate(x, -1050); rr(ctx, -220, -320, 440, 560, 220); fillStroke(ctx, '#FFFDF8', 6); ctx.save(); rr(ctx, -196, -296, 392, 512, 196); ctx.clip(); SE.skyFill(ctx, '#9CC8F0', '#E6F3FF', -300, 220); SE.cloud(ctx, 0, -60, 0.5); ctx.restore(); ctx.restore(); }
  // flower arch
  ctx.save(); ctx.translate(0, 0); ctx.lineWidth = px(ctx, 30); ctx.strokeStyle = '#7AA87A'; ctx.beginPath(); ctx.moveTo(-620, 0); ctx.lineTo(-620, -900); ctx.arc(0, -900, 620, Math.PI, 0); ctx.lineTo(620, 0); ctx.stroke();
  for (let i = 0; i <= 26; i++) { const a = Math.PI + i / 26 * Math.PI, x = Math.cos(a) * 620, y = -900 + Math.sin(a) * 620; ell(ctx, x, y, 36, 36); fillStroke(ctx, ['#F4B6C2', '#FFFDF8', '#E07A8A'][i % 3], 4); }
  for (const sx of [-620, 620]) for (let j = 0; j < 8; j++) { ell(ctx, sx, -110 * j - 60, 34, 34); fillStroke(ctx, ['#FFFDF8', '#F4B6C2', '#E07A8A'][j % 3], 4); }
  ctx.restore();
}
// ---------- 1930s office (floor y = 0): wood panels, window, a framed map, filing cabinet ----------
function office30(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: o.wall || '#E6D6B6', floor: 'wood', window: o.window ?? 700 });
  ctx.fillStyle = '#B98A5A'; ctx.fillRect(-3000, -700, 6000, 640); ctx.strokeStyle = 'rgba(70,40,20,0.35)'; ctx.lineWidth = 4; for (let x = -3000; x < 3000; x += 260) ctx.strokeRect(x + 20, -660, 220, 560);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-3000, -700); ctx.lineTo(3000, -700); ctx.stroke();
}
// a chart board on an easel: title + a line that falls (u 0..1 draws it); centred, base on the floor at 0
function chartBoard(ctx, u, title = 'US DIAMOND SALES') {
  tube(ctx, [[-180, 0], [-120, -820]], 14, '#6A4024', 4); tube(ctx, [[180, 0], [120, -820]], 14, '#6A4024', 4);
  CL.cutout(ctx, () => rr(ctx, -300, -1200, 600, 480, 10), '#FFFDF8', { elev: 1.2 });
  fitTxt(ctx, title, 0, -1140, 40, INK, 540);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-250, -1080 + i * 70); ctx.lineTo(250, -1080 + i * 70); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-250, -1090); ctx.lineTo(-250, -770); ctx.lineTo(260, -770); ctx.stroke();
  const pts = [[-240, -1050], [-160, -1000], [-90, -1015], [0, -930], [80, -950], [160, -860], [230, -800]];
  const n = (pts.length - 1) * clamp(u); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i <= Math.ceil(n); i++) { const k = Math.min(1, n - (i - 1)); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); } ctx.stroke();
  if (u > 0.98) { ctx.save(); ctx.translate(250, -790); ctx.rotate(0.9); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-14, -16); ctx.lineTo(-14, 16); ctx.closePath(); ctx.fill(); ctx.restore(); }
}
// a burlap sack of diamonds (base at 0, ~360 tall)
function sack(ctx, s = 1, t = 0) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.quadraticCurveTo(-230, -200, -110, -300); ctx.lineTo(110, -300); ctx.quadraticCurveTo(230, -200, 170, 0); ctx.closePath(); fillStroke(ctx, '#C9A06A', 5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(90,60,30,0.25)'; ctx.lineWidth = 3; for (let x = -240; x < 240; x += 18) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, -320); ctx.stroke(); } ctx.restore();
  for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(-90 + (i % 5) * 45 + (i > 4 ? 22 : 0), -310 - (i > 4 ? 30 : 0)); gem(ctx, 26); ctx.restore(); }
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(200 + i * 55, -10); ctx.rotate(0.3 * i); gem(ctx, 18); ctx.restore(); }
  ctx.restore();
}
// a folder with a typed job title (centred), text on two lines
function folder(ctx, s = 1, l1 = 'THE JOB:', l2 = 'DIAMOND = LOVE') {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-200, -140); ctx.lineTo(-80, -140); ctx.lineTo(-60, -116); ctx.lineTo(200, -116); ctx.lineTo(200, 140); ctx.lineTo(-200, 140); ctx.closePath(); }, '#E3C27A', { elev: 1.2 });
  CL.cutout(ctx, () => rr(ctx, -160, -80, 320, 180, 6), '#FFFDF8', { elev: 0.4, tex: 0 });
  fitTxt(ctx, l1, 0, -26, 34, '#4A4A48', 280, 'center', ST.FONT.type); fitTxt(ctx, l2, 0, 50, 46, C.red, 290);
  ctx.restore();
}
// a heart (centred), r = half width
function heart(ctx, r = 100, col = C.red) { ctx.save(); ctx.scale(r / 100, r / 100); ctx.beginPath(); ctx.moveTo(0, 90); ctx.bezierCurveTo(-120, 10, -110, -90, -50, -90); ctx.bezierCurveTo(-20, -90, 0, -70, 0, -45); ctx.bezierCurveTo(0, -70, 20, -90, 50, -90); ctx.bezierCurveTo(110, -90, 120, 10, 0, 90); ctx.closePath(); fillStroke(ctx, col, 6); ctx.restore(); }
// ---------- a night office (floor y = 0): window with a moon + stars, wall clock at late hour ----------
function nightOffice(ctx, t) {
  SE.room(ctx, t, { wall: '#C9C3B4', floor: 'wood', window: -420, view: (c) => { c.fillStyle = '#1E2A48'; c.fillRect(-300, -320, 600, 560); ell(c, 120, -150, 60, 60); c.fillStyle = '#FFF4D8'; c.fill(); for (let i = 0; i < 14; i++) star(c, -200 + hash(i) * 380, -250 + hash(i + 9) * 380, 9, 0.8 + 0.2 * Math.sin(t * 3 + i)); } });
  // the clock
  ctx.save(); ctx.translate(380, -1150); ell(ctx, 0, 0, 90, 90); fillStroke(ctx, '#FFFDF8', 6); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 8); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(5.6) * 46, -Math.cos(5.6) * 46); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(t * 0.8) * 70, -Math.cos(t * 0.8) * 70); ctx.stroke(); ctx.restore();
  // a desk lamp glow + darker room
  ctx.fillStyle = 'rgba(20,30,60,0.28)'; ctx.fillRect(-3000, -2400, 6000, 4000);
}
// the typewriter (on a desk top at 0), sheet with lines of text typed up to n chars
function typewriter(ctx, s = 1, lines = [], n = 0, t = 0) {
  ctx.save(); ctx.scale(s, s);
  // sheet
  const sh = 80 + lines.length * 46; CL.cutout(ctx, () => rr(ctx, -150, -150 - sh, 300, sh + 40, 4), '#FFFDF8', { elev: 0.6, tex: 0.3 });
  let k = n; lines.forEach((l, i) => { const v = l.slice(0, Math.max(0, Math.min(l.length, k))); k -= l.length; fitTxt(ctx, v, -130, -150 - sh + 60 + i * 46, 34, INK, 260, 'left', ST.FONT.type); });
  // body
  rr(ctx, -200, -150, 400, 60, 14); fillStroke(ctx, '#2A2A30', 5); rr(ctx, -230, -120, 460, 40, 14); fillStroke(ctx, '#3A3A40', 5);
  SE.poly(ctx, [[-210, -90], [210, -90], [240, 0], [-240, 0]], '#2E3A59', 5);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const j = ((Math.floor(t * 12) + i * 3 + r) % 7 === 0) ? 4 : 0; ell(ctx, -170 + i * 42 + r * 12, -66 + r * 24 + j, 13, 9); fillStroke(ctx, '#F4EEDF', 3); }
  ctx.restore();
}
// a desk lamp (base at 0), on
function lamp(ctx, s = 1) { ctx.save(); ctx.scale(s, s); LT.glow(ctx, 60, -60, 420, 'rgba(255,230,160,1)', 0.55); tube(ctx, [[0, 0], [-30, -200], [60, -260]], 12, '#2FA37E', 4); ell(ctx, 0, -6, 60, 14); fillStroke(ctx, '#25876A', 4);
  ctx.save(); ctx.translate(70, -260); ctx.rotate(0.5); SE.poly(ctx, [[-50, 0], [50, 0], [30, -60], [-30, -60]], '#2FA37E', 4); ctx.restore(); ctx.restore(); }
// ---------- balance scale (pivot at 0); tilt + = right pan down ----------
function balance(ctx, tilt, left, right) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 520); ctx.stroke(); ctx.strokeStyle = '#C9A06A'; ctx.lineWidth = px(ctx, 8); ctx.stroke();
  rr(ctx, -150, 510, 300, 40, 12); fillStroke(ctx, '#C9A06A', 5);
  const a = tilt * 0.28; ctx.save(); ctx.rotate(a); rr(ctx, -380, -14, 760, 28, 14); fillStroke(ctx, '#C9A06A', 5);
  for (const [sx, draw] of [[-1, left], [1, right]]) { ctx.save(); ctx.translate(sx * 360, 0); ctx.rotate(-a);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, 220); ctx.moveTo(0, 0); ctx.lineTo(120, 220); ctx.stroke();
    ell(ctx, 0, 226, 150, 30); fillStroke(ctx, '#D8D2C2', 5); ctx.save(); ctx.translate(0, 216); draw(ctx); ctx.restore(); ctx.restore(); }
  ctx.restore(); ell(ctx, 0, 0, 24, 24); fillStroke(ctx, C.red, 5); ctx.restore();
}
// a pay envelope ("1 MONTH'S SALARY"), base centre at 0
function payEnvelope(ctx, s = 1, l1 = '1 MONTH', l2 = 'SALARY') {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -130, -170, 260, 170, 8), '#E9D9B0', { elev: 1 });
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-130, -170); ctx.lineTo(0, -100); ctx.lineTo(130, -170); ctx.stroke();
  fitTxt(ctx, l1, 0, -62, 40, INK, 220); fitTxt(ctx, l2, 0, -22, 26, '#4A4A48', 200, 'center', ST.FONT.type);
  ctx.fillStyle = '#7FB07A'; rr(ctx, 40, -196, 80, 40, 4); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); txt(ctx, '$', 80, -166, 26, INK);
  ctx.restore();
}
// ---------- the pawn shop (floor y = 0): wall shelves, sign, glass counter (counter drawn separately) ----------
function pawnShop(ctx, t, o = {}) {
  SE.room(ctx, t, { wall: '#D8E2D0', floor: 'tile' });
  if (o.sign !== false) { CL.cutout(ctx, () => rr(ctx, -560, -1270, 1120, 140, 12), '#171717', { elev: 1.2 }); fitTxt(ctx, 'WE BUY GOLD & DIAMONDS', 0, -1180, 60, C.yellow, 1040); }
  for (const y of [-1020, -780]) { rr(ctx, -1400, y, 2800, 26, 6); fillStroke(ctx, '#8A5A34', 4); }
  // shelf items: a radio, a clock, a trumpet-ish horn, a camera, a guitar
  const items = [[-1100, -1020, 'radio'], [-700, -1020, 'clock'], [-250, -1020, 'cam'], [600, -1020, 'radio'], [1000, -1020, 'clock'], [-900, -780, 'cam'], [-450, -780, 'clock'], [500, -780, 'cam'], [950, -780, 'radio']];
  for (const [x, y, k] of items) { ctx.save(); ctx.translate(x, y);
    if (k === 'radio') { rr(ctx, -80, -110, 160, 110, 12); fillStroke(ctx, '#B5304A', 4); ell(ctx, -30, -55, 26, 26); fillStroke(ctx, '#F4EEDF', 3); rr(ctx, 14, -80, 50, 50, 6); fillStroke(ctx, '#F4EEDF', 3); }
    else if (k === 'clock') { ell(ctx, 0, -70, 60, 60); fillStroke(ctx, '#E8B83A', 4); ell(ctx, 0, -70, 44, 44); fillStroke(ctx, '#FFFDF8', 3); }
    else { rr(ctx, -70, -90, 140, 90, 10); fillStroke(ctx, '#3A3A40', 4); ell(ctx, 0, -45, 30, 30); fillStroke(ctx, '#BFE0FA', 4); }
    ctx.restore(); }
}
// the glass counter (top at y = top), centred at x
function counter(ctx, x, w = 1200, top = -380) {
  ctx.save(); ctx.translate(x, 0);
  rr(ctx, -w / 2, top, w, -top, 8); fillStroke(ctx, '#7A5A3A', 5);
  rr(ctx, -w / 2 + 40, top + 50, w - 80, 170, 6); fillStroke(ctx, '#CFE6EE', 4);
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(-w / 2 + 120 + i * (w - 240) / 5, top + 170); ctx.scale(0.5, 0.5); ring(ctx, 40); ctx.restore(); }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-w / 2 + 60, top + 60, 40, 150);
  rr(ctx, -w / 2 - 20, top - 24, w + 40, 30, 8); fillStroke(ctx, '#8A6A4A', 5);
  ctx.restore();
}
// a price tag / slip (centred)
function slip(ctx, s, text, col = '#FFFDF8', fg = INK, strike = 0) {
  ctx.save(); ctx.scale(s, s); ctx.font = `90px ${F.black}`; const w = ctx.measureText(text).width + 70;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -70, w, 130, 12), col, { elev: 1.2 }); txt(ctx, text, 0, 28, 90, fg);
  if (strike > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 10, 20); ctx.lineTo(-w / 2 + 10 + (w - 20) * clamp(strike), -20); ctx.stroke(); }
  ctx.restore();
}
// a jeweller's loupe held to the eye (item for the dealer's hand)
function loupe(ctx) { ell(ctx, 0, -20, 22, 22); fillStroke(ctx, '#2A2A30', 4); ell(ctx, 0, -20, 13, 13); fillStroke(ctx, '#BFE0FA', 3); }
// a pastel backdrop for the brides line (floor y = 0): wall with bunting
function chapel(ctx, t) {
  SE.room(ctx, t, { wall: '#EDE3F0', floor: 'wood' });
  for (let i = -14; i < 14; i++) { const x = i * 160; ctx.fillStyle = ['#F4B6C2', '#FFC857', '#BFE0FA'][((i % 3) + 3) % 3]; ctx.beginPath(); ctx.moveTo(x, -1500 + Math.sin(i) * 6); ctx.lineTo(x + 140, -1500); ctx.lineTo(x + 70, -1380); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, -1500); ctx.lineTo(3000, -1500); ctx.stroke();
}

module.exports = { CS, GOLD, gem, star, sparkles, ring, ringBox, shout, hall, office30, chartBoard, sack, folder, heart, nightOffice, typewriter, lamp, balance, payEnvelope, pawnShop, counter, slip, loupe, chapel };
