// Episode 27 "Bitcoin Pizza" (2010) — sets and props on howitsrun_style (people, sets, paper plates; after hoover_ep19/hoovkit.js).
// Generic re-enactment: brand names as plain text only, no logos, no portraits. World space: floor at y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const LT = require('../hirkit/light');
const ST = require('../howitsrun_style/style');
const SE = require('../howitsrun_style/sets');
const { C, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');   // the approved cast: LASZLO, KID, pizzaBox, coin, gpu, laptop
const GOLD = '#E8A73A', GOLD2 = '#F6C65B';

// a coin seen from the side (flat ellipse), centre at 0
function flatCoin(ctx, x, y, s = 1, a = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.fillStyle = '#B9802A'; ctx.beginPath(); ctx.ellipse(0, 6, 46, 15, 0, 0, 7); ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = GOLD2; ctx.beginPath(); ctx.ellipse(0, 0, 46, 15, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-14, -3, 14, 4, 0, 0, 7); ctx.fill(); ctx.restore(); }
// a heap of coins (n coins) with its base at 0, width ~w
function coinPile(ctx, n, w = 300, seed = 0) {
  const per = Math.max(1, Math.round(w / 70)); let k = 0;
  for (let row = 0; k < n; row++) { const m = Math.max(1, per - row); for (let i = 0; i < m && k < n; i++, k++) { const x = (i - (m - 1) / 2) * 62 + (hash(k + seed) - 0.5) * 16; flatCoin(ctx, x, -14 - row * 22, 1, (hash(k * 3 + seed) - 0.5) * 0.25); } }
}
// the balance scale on a table: post from y = 0 up to -h, beam rotates by tilt (+ = left side down); pans hang 260 below the beam ends
function balance(ctx, tilt, left, right, o = {}) {
  const h = o.h || 560, L = o.L || 380;
  rr(ctx, -110, -24, 220, 24, 8); fillStroke(ctx, '#5A4632', 5); rr(ctx, -16, -h, 32, h - 20, 8); fillStroke(ctx, '#8A6A3A', 5);
  // beam
  ctx.save(); ctx.translate(0, -h); ctx.rotate(-tilt); rr(ctx, -L - 20, -14, 2 * L + 40, 28, 12); fillStroke(ctx, '#C9A04A', 5); ctx.restore();
  ell(ctx, 0, -h, 26, 26); fillStroke(ctx, GOLD, 5);
  [[-1, left], [1, right]].forEach(([sd, fn]) => { const ex = sd * L * Math.cos(tilt), ey = -h - sd * L * Math.sin(tilt);
    const py = ey + 260; ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 150, py); ctx.moveTo(ex, ey); ctx.lineTo(ex + 150, py); ctx.stroke();
    ctx.save(); ctx.translate(ex, py); ctx.beginPath(); ctx.ellipse(0, 0, 175, 26, 0, 0, Math.PI); ctx.closePath(); fillStroke(ctx, '#C9A04A', 5); if (fn) fn(ctx); ctx.restore(); });
}
// a hanging price tag (paper), hole at top-left; flip u: 0 = front text a, 1 = back text b (flips around the horizontal axis)
function priceTag(ctx, a, b, u = 0, o = {}) {
  const w = o.w || 520, h = o.h || 200, k = Math.cos(Math.PI * clamp(u)), s = a && u < 0.5 ? a : b;
  ctx.save(); ctx.scale(1, Math.max(0.02, Math.abs(k)));
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2 + 60, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2 + 60, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath(); }, o.col || C.yellow, { elev: 1.6 });
  ell(ctx, -w / 2 + 50, 0, 16, 16); fillStroke(ctx, PAL.cream, 4);
  fitTxt(ctx, s, 30, h * 0.2, o.size || 96, o.fg || INK, w - 130); ctx.restore();
}
// the two pizza boxes stacked (base at 0); squash 0..1 flattens them (the avalanche)
function boxStack(ctx, s = 1, squash = 0) { ctx.save(); ctx.scale(1 + squash * 0.25, 1 - squash * 0.7); CS.pizzaBox(ctx, s); ctx.translate(0, -44 * s); CS.pizzaBox(ctx, s); ctx.restore(); }
// a forum post card (plain text, generic forum look), centred; lines of text; date in the header bar
function forumPost(ctx, user, date, lines, o = {}) {
  const w = o.w || 900, h = o.h || 520;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), '#F4F6FA', { elev: 2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, 92, 18); ctx.fillStyle = '#3E5A86'; ctx.fill(); ctx.fillRect(-w / 2, -h / 2 + 60, w, 32); ctx.restore();
  fitTxt(ctx, o.title || 'FORUM · PIZZA FOR BITCOINS?', -w / 2 + 34, -h / 2 + 62, 40, PAL.cream, w - 70, 'left', K.F.xb);
  ell(ctx, -w / 2 + 80, -h / 2 + 170, 44, 44); fillStroke(ctx, '#9AA4B4', 4); ell(ctx, -w / 2 + 80, -h / 2 + 158, 16, 16); ctx.fillStyle = PAL.cream; ctx.fill();
  txt(ctx, user, -w / 2 + 150, -h / 2 + 162, 40, '#3E5A86', 'left', K.F.black); txt(ctx, date, -w / 2 + 150, -h / 2 + 204, 30, '#6A6A68', 'left', K.F.xb);
  lines.forEach((s, i) => fitTxt(ctx, s, -w / 2 + 50, -h / 2 + 300 + i * 66, 50, INK, w - 100, 'left', K.F.xb));
}
// a simplified map card of the USA (generic outline), centred; CA and FL dots; u = flight progress 0..1 of the box along the arc
const US = [[-400, -170], [-300, -200], [-120, -190], [60, -190], [170, -150], [250, -175], [330, -190], [395, -230], [410, -160], [330, -90], [300, -30], [250, 10], [255, 70], [305, 160], [290, 200], [245, 130], [195, 95], [110, 110], [30, 140], [-30, 200], [-90, 120], [-180, 90], [-260, 70], [-330, 20], [-390, -60]];
function usMap(ctx, u, t, drawBox) {
  CL.cutout(ctx, () => rr(ctx, -470, -300, 940, 600, 22), '#DDEFF8', { elev: 2 });
  ctx.beginPath(); US.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); fillStroke(ctx, '#BFD9A0', 6);
  const A = [-360, -20], B = [262, 120];
  ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 7); ctx.beginPath(); ctx.moveTo(...A); ctx.quadraticCurveTo(-40, -330, B[0], B[1]); ctx.stroke(); ctx.restore();
  for (const [p, n, dx] of [[A, 'CALIFORNIA', 40], [B, 'FLORIDA', -10]]) { ell(ctx, p[0], p[1], 18, 18); fillStroke(ctx, C.red, 5); fitTxt(ctx, n, p[0] + dx, p[1] + 66, 40, INK, 300); }
  const v = clamp(u), q = (1 - v) * (1 - v), x = q * A[0] + 2 * v * (1 - v) * -40 + v * v * B[0], y = q * A[1] + 2 * v * (1 - v) * -330 + v * v * B[1];
  ctx.save(); ctx.translate(x, y - 20); ctx.rotate(Math.sin(t * 8) * 0.06); drawBox(ctx); ctx.restore();
}
// a house front with a porch, door at x = 0 (door opens 0..1), doormat
function porch(ctx, t, open = 0) {
  SE.sky(ctx, t, { clouds: 2 }); ctx.fillStyle = '#7CC27A'; ctx.fillRect(-3000, 0, 6000, 1600);
  rr(ctx, -1400, -1100, 2800, 1100, 6); fillStroke(ctx, '#F2E2C0', 6);
  ctx.fillStyle = 'rgba(160,120,80,0.10)'; for (let y = -1080; y < 0; y += 60) ctx.fillRect(-1400, y, 2800, 5);
  SE.poly(ctx, [[-1500, -1100], [0, -1500], [1500, -1100]], '#C86A4A', 6);
  for (const x of [-700, 700]) { rr(ctx, x - 170, -800, 340, 360, 8); fillStroke(ctx, '#BFE0FA', 6); }
  rr(ctx, -190, -760, 380, 760, 8); fillStroke(ctx, '#3A2A20', 6);
  ctx.save(); ctx.translate(-170, 0); ctx.scale(1 - 0.85 * open, 1); rr(ctx, 0, -740, 340, 740, 6); fillStroke(ctx, '#2E7D6A', 5); ell(ctx, 300, -360, 16, 16); fillStroke(ctx, C.yellow, 3); ctx.restore();
  rr(ctx, -500, -10, 1000, 60, 6); fillStroke(ctx, '#B9B1A3', 5); rr(ctx, -260, -18, 520, 30, 8); fillStroke(ctx, '#8A5A34', 4);
}
// an open, empty wallet (centred); a moth flutters out
function wallet(ctx, t, open = 1) {
  ctx.save(); CL.cutout(ctx, () => rr(ctx, -230, -150, 460, 300, 26), '#7A4A2A', { elev: 1.6 });
  rr(ctx, -200, -120, 400, 120 * open + 40, 14); fillStroke(ctx, '#5A3420', 4); ctx.strokeStyle = 'rgba(255,240,210,0.6)'; ctx.setLineDash([10, 9]); ctx.lineWidth = 3; ctx.strokeRect(-215, -135, 430, 270); ctx.setLineDash([]);
  if (open > 0.5) { const k = (t * 1.2) % 1, mx = -40 + k * 140, my = -150 - k * 260, f = Math.sin(t * 40);
    ctx.save(); ctx.translate(mx, my); ctx.globalAlpha = 1 - k * 0.6; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 22, 0, 24, 12 + 8 * f, sd * 0.4, 0, 7); fillStroke(ctx, '#C9B79A', 3); } ell(ctx, 0, 0, 8, 16); fillStroke(ctx, '#6A5A4A', 3); ctx.restore(); }
  ctx.restore();
}
// a pizza slice, tip pointing in +x (local), length ~200 at s = 1
function slice(ctx, s = 1, bite = 0) { ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(bite > 0.5 ? 150 : 200, -10); ctx.lineTo(bite > 0.5 ? 150 : 200, 10); ctx.lineTo(0, 80); ctx.closePath(); fillStroke(ctx, '#F2B640', 5);
  rr(ctx, -26, -86, 40, 172, 18); fillStroke(ctx, '#C9853A', 5);
  ctx.fillStyle = '#C9302C'; for (const [x, y] of [[50, -30], [60, 30], [110, 0]]) if (!(bite > 0.5 && x > 100)) { ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); }
  ctx.restore(); }
// a soft glow (screen-space blend), centred at x, y
function glow(ctx, x, y, r, col, a) { LT.glow(ctx, x, y, r, col, a); }
module.exports = { CS, GOLD, flatCoin, coinPile, balance, priceTag, boxStack, forumPost, usMap, porch, wallet, slice, glow };
