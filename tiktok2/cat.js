// TikTok series side character: ginger cat waiter (bust, behind the counter). New character (own file).
const { OL, paint, line, curve, roundRect } = require('../lib/draw');
const O = '#F59A3C', OS = '#D97B1F', CR = '#FFF1D8', PK = '#F7A8B8';
// p: {mouth 0..1, blink 0..1, look -1..1, brow, ears, tilt, glasses, vest, hold(ctx), smile}
function drawCat(ctx, x, y, s, p = {}) {
  const o = Object.assign({ mouth: 0, blink: 0, look: 0, brow: 0, ears: 0, tilt: 0, glasses: false, smile: 0.4, bow: true }, p);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt);
  // body / vest
  paint(ctx, c => { c.moveTo(-170, 230); c.bezierCurveTo(-190, 90, -120, 40, 0, 40); c.bezierCurveTo(120, 40, 190, 90, 170, 230); c.closePath(); }, '#2B3A55', { shade: '#1E2A40', sx: 8, sy: 0, lw: 7 });
  paint(ctx, c => { c.moveTo(-50, 44); c.lineTo(0, 150); c.lineTo(50, 44); c.closePath(); }, '#FFFFFF', { lw: 5 });
  if (o.bow) { paint(ctx, c => { c.moveTo(0, 54); c.lineTo(-34, 36); c.lineTo(-34, 74); c.closePath(); }, '#E5484D', { lw: 5 }); paint(ctx, c => { c.moveTo(0, 54); c.lineTo(34, 36); c.lineTo(34, 74); c.closePath(); }, '#E5484D', { lw: 5 }); ctx.beginPath(); ctx.arc(0, 55, 10, 0, 7); ctx.fillStyle = '#C8323A'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke(); }
  // ears
  for (const k of [-1, 1]) {
    const w = o.ears * k * 0.12;
    ctx.save(); ctx.translate(k * 100, -120); ctx.rotate(k * 0.35 + w);
    paint(ctx, c => { c.moveTo(-50, 30); c.lineTo(0, -90); c.lineTo(52, 30); c.closePath(); }, O, { shade: OS, sx: -4, sy: -4, lw: 7 });
    paint(ctx, c => { c.moveTo(-26, 24); c.lineTo(0, -50); c.lineTo(28, 24); c.closePath(); }, PK, { lw: 0 });
    ctx.restore();
  }
  // head
  paint(ctx, c => c.ellipse(0, -30, 160, 140, 0, 0, 7), O, { shade: OS, sx: -10, sy: -10, lw: 8 });
  // stripes
  for (const k of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, [[k * (30 + i * 28), -158 + i * 2], [k * (38 + i * 28), -124 + i * 4]], 7, OS);
  // muzzle
  paint(ctx, c => c.ellipse(0, 36, 76, 52, 0, 0, 7), CR, { lw: 5 });
  // eyes
  for (const k of [-1, 1]) {
    const ex = k * 62, ey = -40, op = 1 - o.blink;
    paint(ctx, c => c.ellipse(ex, ey, 34, 38 * Math.max(0.06, op), 0, 0, 7), '#FFFFFF', { lw: 5 });
    if (op > 0.2) { ctx.beginPath(); ctx.ellipse(ex + o.look * 12, ey + 2, 15, 22 * op, 0, 0, 7); ctx.fillStyle = '#3FA45B'; ctx.fill(); ctx.beginPath(); ctx.ellipse(ex + o.look * 12, ey + 2, 8, 17 * op, 0, 0, 7); ctx.fillStyle = OL; ctx.fill(); ctx.beginPath(); ctx.arc(ex + o.look * 12 - 5, ey - 8, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); }
    line(ctx, [[ex - 34, ey - 54 - o.brow * 10 * k], [ex + 34, ey - 54 + o.brow * 10 * k * 0 - o.brow * 10]], 7, OS);
  }
  if (o.glasses) for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 62, -40, 44, 0, 7); ctx.lineWidth = 7; ctx.strokeStyle = '#3A221D'; ctx.stroke(); } if (o.glasses) line(ctx, [[-18, -40], [18, -40]], 6, '#3A221D');
  // nose + mouth
  paint(ctx, c => { c.moveTo(-14, 6); c.lineTo(14, 6); c.lineTo(0, 22); c.closePath(); }, PK, { lw: 4 });
  const m = o.mouth;
  if (m > 0.08) paint(ctx, c => { c.moveTo(-34, 44); c.quadraticCurveTo(0, 44 + 70 * m, 34, 44); c.quadraticCurveTo(0, 38, -34, 44); c.closePath(); }, '#7A1E2A', { lw: 5 });
  else { curve(ctx, [-34, 42 - o.smile * 6], [0, 44 + o.smile * 16], [34, 42 - o.smile * 6], 5, OL); }
  line(ctx, [[0, 22], [0, 40]], 4, OL);
  // whiskers
  for (const k of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, [[k * 60, 28 + i * 12], [k * 150, 14 + i * 22]], 3.5, 'rgba(58,34,29,0.7)');
  ctx.restore();
  if (o.hold) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); o.hold(ctx); ctx.restore(); }
}
module.exports = { drawCat };
