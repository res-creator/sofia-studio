// Props with grip points. Each returns its grip points so hands can be placed on them.
const { paint, cap, line, shade } = require('./rig');
// baseball bat: knob K, angle a (direction towards the barrel), length L
function bat(K, a, L) { const u = [Math.cos(a), Math.sin(a)]; const at = d => [K[0] + u[0] * d, K[1] + u[1] * d]; return { K, a, L, low: at(26), high: at(64), tip: at(L) }; }
function drawBat(ctx, S, b) {
  paint(ctx, S, c => { c.save(); c.translate(...b.K); c.rotate(b.a); c.moveTo(0, -8); c.lineTo(b.L * 0.42, -9); c.quadraticCurveTo(b.L * 0.7, -20, b.L, -17); c.arc(b.L, 0, 17, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(b.L * 0.7, 20, b.L * 0.42, 9); c.lineTo(0, 8); c.closePath(); c.restore(); }, '#d6a05a');
  paint(ctx, S, c => { c.save(); c.translate(...b.K); c.rotate(b.a); c.ellipse(-4, 0, 7, 13, 0, 0, 7); c.restore(); }, '#b07d3e');
  ctx.save(); ctx.translate(...b.K); ctx.rotate(b.a); ctx.fillStyle = '#2b2b30'; ctx.fillRect(4, -8, 76, 16); ctx.restore();
}
// mug: centre M, returns handle grip
function mug(M, s = 1) { return { M, s, grip: [M[0] + 50 * s, M[1] + 2 * s] }; }
function drawMug(ctx, S, m) {
  const s = m.s, [x, y] = m.M;
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x + 40 * s, y, 22 * s, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = 14 * s + S.lw * 2; ctx.strokeStyle = S.ink; ctx.stroke(); ctx.lineWidth = 14 * s; ctx.strokeStyle = '#f2eee4'; ctx.stroke(); ctx.restore();
  paint(ctx, S, c => c.roundRect(x - 40 * s, y - 50 * s, 80 * s, 100 * s, 12 * s), '#f2eee4');
  ctx.save(); ctx.fillStyle = '#d6413a'; ctx.font = `${Math.round(20 * s)}px Anton`; ctx.textAlign = 'center'; ctx.fillText('SUGAR?', x - 9 * s, y + 9 * s); ctx.restore();
}
// wooden chair, side view. base point = front-left foot on the floor; tilt rotates around the back legs
function chair(x, ground, tilt = 0) { return { x, ground, tilt, rail: rotP([x + 80, ground - 330], [x + 80, ground], tilt) }; }
function rotP(p, c, a) { const dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
function drawChair(ctx, S, ch) {
  const wood = '#9a6438';
  ctx.save(); ctx.translate(ch.x + 80, ch.ground); ctx.rotate(ch.tilt); ctx.translate(-(ch.x + 80), -ch.ground);
  const X = ch.x, G = ch.ground;
  for (const [a, b, w] of [[[X - 70, G], [X - 66, G - 170], 8], [[X + 80, G], [X + 78, G - 170], 8], [[X + 80, G - 170], [X + 84, G - 340], 8], [[X + 66, G - 170], [X + 70, G - 330], 7]]) paint(ctx, S, c => cap(c, a, b, w, w), wood);
  paint(ctx, S, c => c.roundRect(X - 84, G - 186, 176, 26, 6), shade(wood, 1.12));
  paint(ctx, S, c => c.roundRect(X + 64, G - 345, 30, 140, 8), wood);
  ctx.restore();
}
module.exports = { bat, drawBat, mug, drawMug, chair, drawChair };
