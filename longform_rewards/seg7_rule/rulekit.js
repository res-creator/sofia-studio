// Long-form "When Paying People Backfired" — segment 7 "THE RULE · Goodhart's Law": props on howitsrun_style (16:9).
// The five "paid for" cards (tail, flights, barcodes, accounts, plates), the dial gauge (a measure) and the target, the reward envelope,
// the table-top echo of the cold open (a hand with scissors over the cartoon rat, a coin), and the two-part final plate.
// Borrowed read-only: the rat, coin, tail, scissors, magnifier (rats_ep26/ratkit.js), the tickets (hoover_ep19/hoovkit.js),
// the account card and the chapter card (../seg4_wellsfargo/bankkit.js, same author).
process.env.HIR_WIDE = '1';
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const RK = require('../../rats_ep26/ratkit');
const HK = require('../../hoover_ep19/hoovkit');
const B = require('../seg4_wellsfargo/bankkit');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL, FONT } = ST;

// ---------- small icons (centred) ----------
function barcode(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -150, -100, 300, 200, 10), '#FFFDF8', { elev: 0.8 });
  for (let i = 0, x = -120; x < 120; i++) { const w = 3 + Math.floor(hash(i) * 4) * 3; ctx.fillStyle = INK; ctx.fillRect(x, -70, w, 120); x += w + 4 + Math.floor(hash(i + 50) * 3) * 3; }
  fitTxt(ctx, '0 41000 25', 0, 86, 26, INK, 240, 'center', FONT.type); ctx.restore(); }
function plateIcon(ctx, s = 1, num = 'ABC·123') { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -170, -80, 340, 160, 18), '#F4F1E8', { elev: 0.8 });
  rr(ctx, -150, -62, 300, 124, 12); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); fitTxt(ctx, num, 0, 26, 74, '#2E3A59', 270); ctx.restore(); }
// a card with an icon and a caption; u = pop, o.x = strike 0..1
function thingCard(ctx, u, cap, draw, o = {}) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 1.8); ctx.scale(k, k); ctx.rotate(o.rot || 0);
  CL.cutout(ctx, () => rr(ctx, -150, -170, 300, 340, 16), '#FFFDF8', { elev: 1.4 });
  ctx.save(); rr(ctx, -138, -158, 276, 250, 12); ctx.clip(); ctx.fillStyle = o.bg || '#E6EEF4'; ctx.fillRect(-140, -160, 280, 260); draw(ctx); ctx.restore();
  fitTxt(ctx, cap, 0, 146, 44, INK, 260);
  if (o.strike) { ctx.save(); ctx.translate(0, -30); ST.bigX(ctx, 90, o.strike); ctx.restore(); }
  ctx.restore();
}
// ---------- dial gauge (a measure): needle angle a (-1..1), crack 0..1 ----------
function gauge(ctx, a, crack = 0, s = 1) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 170, Math.PI, 0); ctx.lineTo(170, 40); ctx.lineTo(-170, 40); ctx.closePath(); }, '#FFFDF8', { elev: 1.4 });
  const zones = [['#2FA37E', Math.PI, Math.PI * 1.4], ['#FFC857', Math.PI * 1.4, Math.PI * 1.7], ['#E63946', Math.PI * 1.7, Math.PI * 2]];
  for (const [col, a0, a1] of zones) { ctx.beginPath(); ctx.arc(0, 0, 140, a0, a1); ctx.lineWidth = 24; ctx.strokeStyle = col; ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); for (let i = 0; i <= 10; i++) { const q = Math.PI + i / 10 * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(q) * 112, Math.sin(q) * 112); ctx.lineTo(Math.cos(q) * 96, Math.sin(q) * 96); ctx.stroke(); }
  const q = -Math.PI / 2 + a * Math.PI * 0.45; tube(ctx, [[0, 0], [Math.cos(q) * 120, Math.sin(q) * 120]], 10, INK, 0); ell(ctx, 0, 0, 16, 16); fillStroke(ctx, '#3A3F4E', 4);
  if (crack > 0) { ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); const pts = [[-40, -160], [-10, -110], [-36, -70], [6, -30], [-14, 10], [20, 40]]; const n = Math.ceil(pts.length * clamp(crack));
    pts.slice(0, n).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
  ctx.restore();
}
// ---------- target with an arrow that flies in (u 0..1) ----------
function target(ctx, u = 0, s = 1) {
  ctx.save(); ctx.scale(s, s);
  for (const [r, col] of [[160, C.red], [122, '#FFFDF8'], [84, C.red], [46, '#FFFDF8'], [18, C.red]]) { ell(ctx, 0, 0, r, r); fillStroke(ctx, col, 5); }
  if (u > 0) { const d = (1 - E.out(clamp(u))) * 700; ctx.save(); ctx.translate(d * 0.9, -d * 0.45); ctx.rotate(-0.45);
    tube(ctx, [[0, 0], [230, 0]], 12, '#8A5A34', 4); SE.poly(ctx, [[230, 0], [270, -26], [300, -26], [262, 0], [300, 26], [270, 26]], '#6A8AC8', 4); SE.poly(ctx, [[0, 0], [30, -16], [30, 16]], '#C9CED6', 4); ctx.restore(); }
  ctx.restore();
}
// ---------- the reward envelope with a tag (tag text t2 revealed by rev 0..1) ----------
function rewardEnv(ctx, s = 1, tagText = 'PAYS FOR: ???') {
  ctx.save(); ctx.scale(s, s); ctx.rotate(-0.06);
  CL.cutout(ctx, () => rr(ctx, -150, -90, 300, 180, 10), '#F4EEDF', { elev: 1.2 });
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-150, -90); ctx.lineTo(0, 10); ctx.lineTo(150, -90); ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, -110, 20, 220, 56, 8), PAL.green, { elev: 0.4, tex: 0 }); fitTxt(ctx, 'REWARD', 0, 62, 42, PAL.cream, 200);
  ctx.restore();
}
// ---------- the table-top (echo of the cold open): wall + wooden table edge at y0 (screen space) ----------
function tableTop(ctx, t, y0 = 600) {
  const W = ST.W, H = ST.H; const g = ctx.createLinearGradient(0, 0, 0, y0); g.addColorStop(0, '#E9DFC8'); g.addColorStop(1, '#DCCFB2'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, y0);
  ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 34, W, 3);
  const g2 = ctx.createLinearGradient(0, y0, 0, H); g2.addColorStop(0, '#B98A5A'); g2.addColorStop(1, '#9A6E44'); ctx.fillStyle = g2; ctx.fillRect(0, y0, W, H - y0);
  ctx.strokeStyle = 'rgba(70,40,20,0.25)'; ctx.lineWidth = 3; for (let y = y0 + 40; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(W * 0.3, y + 8, W * 0.6, y - 8, W, y + 4); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
}
// a hand coming in from the left edge (sleeve + hand) holding the scissors (open 0..1); hand at (hx, hy), angle a
function scissorHand(ctx, hx, hy, a, open, skin = '#E8B48F', sleeve = '#2E3A59') {
  const bx = hx - Math.cos(a) * 520, by = hy - Math.sin(a) * 520;
  tube(ctx, [[bx, by], [hx - Math.cos(a) * 40, hy - Math.sin(a) * 40]], 74, sleeve, 5);
  ctx.save(); ctx.translate(hx + Math.cos(a) * 70, hy + Math.sin(a) * 70); ctx.rotate(a); RK.scissors(ctx, 1.1, open); ctx.restore();
  R.hand(ctx, [hx, hy], a, skin, 'fist', { size: 1.9 });
}
// two-part final plate, the same geometry as ST.headline2 (the cold open's "PAID PER / RAT TAIL"), parts pop separately
function finalPlate(ctx, l1, l2, u1, u2, y = 170) {
  const W = ST.W; ctx.save(); ctx.translate(W / 2, y);
  if (u1 > 0) { ctx.save(); const k = E.back(clamp(u1), 1.8); ctx.scale(k, k); CL.cutout(ctx, () => rr(ctx, -500, -70, 1000, 118, 16), PAL.cream, { elev: 1.4 }); fitTxt(ctx, l1, 0, 14, 74, INK, 940); ctx.restore(); }
  if (u2 > 0) { ctx.save(); ctx.translate(0, 124); ctx.rotate(0.025); const k = E.back(clamp(u2), 1.8); ctx.scale(k, k); CL.cutout(ctx, () => rr(ctx, -440, -62, 880, 110, 14), C.red, { elev: 1.2 }); fitTxt(ctx, l2, 0, 24, 80, PAL.cream, 820); ctx.restore(); }
  ctx.restore();
}

module.exports = { barcode, plateIcon, thingCard, gauge, target, rewardEnv, tableTop, scissorHand, finalPlate, RK, HK, B };
