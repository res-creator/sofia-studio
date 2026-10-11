// Gus the goose: Sofia's deadpan roommate. Origin = feet centre, y down. ~ 520 units tall.
const { OL, paint, line, curve, roundRect } = require('./draw');
const C = { body: '#FFFFFF', sh: '#D9DEE6', beak: '#FF9A2E', beakSh: '#E0761A', leg: '#FF9A2E', tie: '#2E6FD8' };

// p: { honk 0..1, wing 0..1 (flap), neck -1..1 (lean), look -1..1, lids 0..1 (0.55 = deadpan), walk phase, face: 1|-1, tie, hat, hold(ctx) }
function drawGus(ctx, x, y, scale, p = {}) {
  const o = Object.assign({ honk: 0, wing: 0, neck: 0, look: 0, lids: 0.55, walk: 0, walking: false, face: 1, tie: true, squash: 1, mug: false }, p);
  ctx.save(); ctx.translate(x, y); ctx.scale(scale * o.face, scale * o.squash);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(0, 6, 120, 18, 0, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  // legs
  for (const s of [-1, 1]) {
    const sw = o.walking ? Math.sin(o.walk * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 24 : 0;
    const lift = o.walking ? Math.max(0, Math.sin(o.walk * Math.PI * 2 + (s > 0 ? Math.PI : 0))) * 18 : 0;
    const hx = s * 30, fx = s * 30 + sw;
    line(ctx, [[hx, -120], [fx, -lift]], 18, OL); line(ctx, [[hx, -120], [fx, -lift]], 9, C.leg);
    paint(ctx, c => { c.moveTo(fx - 10, -lift - 4); c.lineTo(fx + 46, -lift + 4); c.quadraticCurveTo(fx + 30, -lift + 14, fx - 14, -lift + 8); c.closePath(); }, C.leg, { lw: 5 });
  }
  // body
  const body = c => { c.moveTo(-150, -230); c.bezierCurveTo(-190, -150, -110, -90, 10, -96); c.bezierCurveTo(120, -100, 150, -170, 120, -240); c.bezierCurveTo(90, -300, -60, -300, -150, -230); c.closePath(); };
  paint(ctx, body, C.body, { shade: C.sh, sx: -10, sy: -14 });
  // tail
  paint(ctx, c => { c.moveTo(-140, -240); c.lineTo(-200, -270); c.lineTo(-150, -205); c.closePath(); }, C.body, { lw: 5 });
  // wing
  ctx.save(); ctx.translate(-20, -210); ctx.rotate(-o.wing * 0.9);
  paint(ctx, c => { c.moveTo(60, -10); c.bezierCurveTo(40, -60, -100, -50, -120, 10); c.bezierCurveTo(-60, 30, 20, 30, 60, -10); c.closePath(); }, C.body, { shade: C.sh, sx: 0, sy: -8 });
  curve(ctx, [-90, 6], [-60, -6], [-40, 10], 4, C.sh); curve(ctx, [-60, 14], [-30, 2], [-10, 16], 4, C.sh);
  ctx.restore();
  // neck (S curve) + head
  const nb = [70, -250], hx = 90 + o.neck * 40, hy = -470;
  ctx.save(); ctx.beginPath(); ctx.moveTo(nb[0], nb[1]); ctx.bezierCurveTo(140, -330, 40 + o.neck * 30, -380, hx, hy + 40);
  ctx.lineWidth = 84; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke();
  ctx.lineWidth = 72; ctx.strokeStyle = C.body; ctx.stroke(); ctx.restore();
  if (o.tie) {
    ctx.save(); ctx.translate(nb[0] + 34, nb[1] - 58); ctx.rotate(-0.15);
    paint(ctx, c => { c.moveTo(-26, -14); c.lineTo(0, 0); c.lineTo(26, -14); c.lineTo(22, 12); c.lineTo(0, 2); c.lineTo(-22, 12); c.closePath(); }, C.tie, { lw: 5 });
    paint(ctx, c => { c.moveTo(-10, 4); c.lineTo(10, 4); c.lineTo(16, 70); c.lineTo(0, 86); c.lineTo(-16, 70); c.closePath(); }, C.tie, { lw: 5 });
    ctx.restore();
  }
  // head
  paint(ctx, c => c.ellipse(hx, hy, 66, 60, 0, 0, 7), C.body, { shade: C.sh, sx: -8, sy: -10 });
  // beak (opens on honk)
  const op = o.honk * 0.5;
  ctx.save(); ctx.translate(hx + 50, hy + 6);
  ctx.save(); ctx.rotate(op * 0.6);
  paint(ctx, c => { c.moveTo(-6, 4); c.bezierCurveTo(40, 10, 80, 20, 92, 22); c.quadraticCurveTo(60, 34, -4, 30); c.closePath(); }, C.beakSh, { lw: 5 });
  ctx.restore();
  ctx.save(); ctx.rotate(-op * 0.5);
  paint(ctx, c => { c.moveTo(-8, -26); c.bezierCurveTo(40, -24, 86, 4, 96, 18); c.quadraticCurveTo(50, 20, -6, 12); c.closePath(); }, C.beak, { lw: 5 });
  ctx.beginPath(); ctx.arc(30, -8, 4, 0, 7); ctx.fillStyle = OL; ctx.fill();
  ctx.restore(); ctx.restore();
  // eye: deadpan half-lid
  const ex = hx + 18 + o.look * 6, ey = hy - 14;
  paint(ctx, c => c.ellipse(ex, ey, 17, 20, 0, 0, 7), '#fff', { lw: 5 });
  ctx.beginPath(); ctx.arc(ex + 4 + o.look * 4, ey + 4, 9, 0, 7); ctx.fillStyle = '#1b1b1b'; ctx.fill();
  ctx.beginPath(); ctx.arc(ex + 1, ey, 3, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  if (o.lids > 0) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 17, 20, 0, 0, 7); ctx.clip();
    ctx.fillStyle = C.sh; ctx.fillRect(ex - 20, ey - 22, 40, 42 * o.lids); ctx.restore();
    line(ctx, [[ex - 19, ey - 20 + 40 * o.lids], [ex + 19, ey - 22 + 40 * o.lids]], 6, OL);
  }
  // unimpressed brow
  line(ctx, [[ex - 20, ey - 30], [ex + 18, ey - 28]], 7, OL);
  if (o.hold) { ctx.save(); o.hold(ctx, o.face, { hx, hy }); ctx.restore(); }
  ctx.restore();
}
module.exports = { drawGus };
