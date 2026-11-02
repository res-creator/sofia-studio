// How It's Run — backgrounds in the reference style (lawnchair_ep17 sky/backyard/street, emu_ep12 warm land): flat paper colours,
// soft gradients, one sun glow, a few clouds, simple houses with ink outline, ground strip. World space: floor at y = 0, up is negative,
// x centred on 0 (draw inside ST.layer(ctx, cam, 1, w => ...)). Interiors: room() — wall, skirting, floor, window, door, frame on the wall.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const { C, rr, hash } = K;
const { INK, fillStroke, px } = R;
const poly = (ctx, pts, fill, lw = 5) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); fillStroke(ctx, fill, lw); };

function cloud(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  for (const [dx, dy, r, col] of [[-90, 14, 60, '#EAF3FF'], [-30, -20, 80, '#F4F9FF'], [40, -10, 70, '#F4F9FF'], [100, 16, 54, '#EAF3FF'], [0, 26, 90, '#FFFFFF'], [-150, 34, 44, '#EAF3FF']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function skyFill(ctx, c0, c1, y0 = -3200, y1 = 0) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(-6000, y0, 12000, y1 - y0); }
// day sky + low hills (o.warm: the emu outback colours; o.clouds: count)
function sky(ctx, t, o = {}) {
  if (o.warm) skyFill(ctx, '#F2CF8E', '#F9EBCB'); else skyFill(ctx, '#7FB6F2', '#DDF0FF');
  LT.glow(ctx, o.sunX ?? 1400, o.sunY ?? -1800, 900, 'rgba(255,245,200,1)', o.warm ? 0.5 : 0.35);
  if (o.warm) { R.ell(ctx, o.sunX ?? 700, o.sunY ?? -1300, 90, 90); ctx.fillStyle = '#FFF4D8'; ctx.fill(); }
  for (let i = 0; i < (o.clouds ?? 3); i++) cloud(ctx, -1400 + i * 1200 + t * (4 + i * 2), -1500 - (i % 2) * 300, 1.1 + hash(i) * 0.4, 0.9);
  if (o.hills !== false) { ctx.fillStyle = o.warm ? '#B9A27A' : '#9DB8A0'; ctx.beginPath(); ctx.moveTo(-3000, -150); for (let x = -3000; x <= 3000; x += 160) ctx.lineTo(x, -230 - Math.sin(x / 400) * 80 - hash(x) * 30); ctx.lineTo(3000, 0); ctx.lineTo(-3000, 0); ctx.closePath(); ctx.fill(); }
}
function ground(ctx, kind = 'lawn') {
  if (kind === 'lawn') { ctx.fillStyle = '#7CC27A'; ctx.fillRect(-3000, 0, 6000, 1600); for (let i = 0; i < 14; i++) if (i % 2) { ctx.fillStyle = 'rgba(60,140,70,0.18)'; ctx.fillRect(-3000, i * 90, 6000, 90); } }
  else if (kind === 'dirt') { const g = ctx.createLinearGradient(0, 0, 0, 1400); g.addColorStop(0, '#D9B57A'); g.addColorStop(1, '#C98E5F'); ctx.fillStyle = g; ctx.fillRect(-3000, 0, 6000, 1600); }
  else if (kind === 'road') { ctx.fillStyle = '#B9B1A3'; ctx.fillRect(-3000, 0, 6000, 70); ctx.fillStyle = '#5A606B'; ctx.fillRect(-3000, 70, 6000, 1500); ctx.fillStyle = '#E9D36A'; for (let x = -3000; x < 3000; x += 240) ctx.fillRect(x, 330, 130, 14); }
}
// a row of simple houses (lawnchair street); o.cols / o.roofs palettes, o.n houses from x0
function houses(ctx, x0 = -1700, n = 9, o = {}) {
  const cols = o.cols || ['#F2E2C0', '#E8C8B0', '#CFE3D0', '#E6D8F0'], roofs = o.roofs || ['#C86A4A', '#8A5A6A', '#6A7AA0', '#B07A4A'];
  for (let i = 0; i < n; i++) { const x = x0 + i * 520, h = 360 + hash(i) * 120; rr(ctx, x, -h, 420, h, 6); fillStroke(ctx, cols[i % 4], 5); poly(ctx, [[x - 30, -h], [x + 210, -h - 150], [x + 450, -h]], roofs[i % 4], 5);
    rr(ctx, x + 50, -h + 90, 90, 100, 6); fillStroke(ctx, '#BFE0FA', 4); rr(ctx, x + 280, -h + 90, 90, 100, 6); fillStroke(ctx, '#BFE0FA', 4); rr(ctx, x + 180, -150, 70, 150, 6); fillStroke(ctx, '#8A5A34', 4); }
}
// a shop front with an awning and a sign (plain text, no logo); x = centre, w = width
function shopFront(ctx, x, w, sign, o = {}) {
  ctx.save(); ctx.translate(x, 0); const h = o.h || 620;
  rr(ctx, -w / 2, -h, w, h, 6); fillStroke(ctx, o.col || '#E8DCC4', 5);
  rr(ctx, -w / 2 + 40, -h + 40, w - 80, 110, 8); fillStroke(ctx, o.signCol || '#2E3A59', 5); ctx.font = `64px ${K.F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFDF8'; ctx.fillText(sign, 0, -h + 118);
  for (let i = 0; i < Math.floor(w / 90); i++) { ctx.fillStyle = i % 2 ? (o.awn || C.red) : '#FFFDF8'; ctx.beginPath(); ctx.moveTo(-w / 2 + i * 90, -h + 170); ctx.lineTo(-w / 2 + i * 90 + 90, -h + 170); ctx.lineTo(-w / 2 + i * 90 + 90, -h + 250); ctx.lineTo(-w / 2 + i * 90, -h + 250); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-w / 2, -h + 170, w, 80);
  rr(ctx, -w / 2 + 40, -h + 290, w * 0.55, h - 330, 6); fillStroke(ctx, '#BFE0FA', 5); rr(ctx, w / 2 - w * 0.3, -h + 290, w * 0.3 - 40, h - 290, 6); fillStroke(ctx, '#8A5A34', 5);
  ctx.restore();
}
// an interior: wall colour, skirting, floor (wood|tile|carpet), optional window (o.window: x), door (o.door: x), frame (o.frame: {x, draw})
function room(ctx, t, o = {}) {
  ctx.fillStyle = o.wall || '#EFE3CB'; ctx.fillRect(-3000, -2400, 6000, 2400);
  ctx.fillStyle = 'rgba(160,120,80,0.08)'; for (let x = -3000; x < 3000; x += 110) ctx.fillRect(x, -2400, 6, 2400);
  if (o.window !== undefined) { ctx.save(); ctx.translate(o.window, -820); rr(ctx, -260, -300, 520, 520, 10); fillStroke(ctx, '#FFFDF8', 6);
    ctx.save(); rr(ctx, -236, -276, 472, 472, 6); ctx.clip(); skyFill(ctx, '#7FB6F2', '#DDF0FF', -300, 220); cloud(ctx, -60 + (t * 6) % 300, -140, 0.6); if (o.view) o.view(ctx, t); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(0, -276); ctx.lineTo(0, 196); ctx.moveTo(-236, -40); ctx.lineTo(236, -40); ctx.stroke(); ctx.restore(); }
  if (o.door !== undefined) { ctx.save(); ctx.translate(o.door, 0); rr(ctx, -150, -620, 300, 620, 8); fillStroke(ctx, '#B98A5A', 5); R.ell(ctx, 100, -300, 14, 14); fillStroke(ctx, C.yellow, 3); ctx.restore(); }
  if (o.frame) { ctx.save(); ctx.translate(o.frame.x, o.frame.y ?? -1000); rr(ctx, -150, -110, 300, 220, 8); fillStroke(ctx, '#8A5A34', 6); rr(ctx, -128, -88, 256, 176, 4); fillStroke(ctx, '#FFFDF8', 3); if (o.frame.draw) o.frame.draw(ctx); ctx.restore(); }
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-3000, -60, 6000, 60); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, -60); ctx.lineTo(3000, -60); ctx.stroke();
  const f = o.floor || 'wood';
  if (f === 'wood') { ctx.fillStyle = '#B98A5A'; ctx.fillRect(-3000, 0, 6000, 1600); ctx.strokeStyle = 'rgba(70,40,20,0.22)'; ctx.lineWidth = 3; for (let y = 40; y < 1600; y += 70) { ctx.beginPath(); ctx.moveTo(-3000, y); ctx.lineTo(3000, y); ctx.stroke(); } }
  else if (f === 'tile') { ctx.fillStyle = '#E9E3D3'; ctx.fillRect(-3000, 0, 6000, 1600); for (let i = -12; i < 12; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2) { ctx.fillStyle = '#D6CDB9'; ctx.fillRect(i * 240, j * 240, 240, 240); } }
  else { ctx.fillStyle = o.carpet || '#8E6E8E'; ctx.fillRect(-3000, 0, 6000, 1600); }
}
// a desk / counter in front of a character (top at y = top, centred at x)
function desk(ctx, x, w = 700, top = -300, col = '#8A5A34') { ctx.save(); ctx.translate(x, 0); rr(ctx, -w / 2, top, w, 40, 8); fillStroke(ctx, col, 5); rr(ctx, -w / 2 + 20, top + 40, w - 40, -top - 40, 6); fillStroke(ctx, R.shade(col, -0.15), 5); ctx.restore(); }

module.exports = { poly, cloud, skyFill, sky, ground, houses, shopFront, room, desk };
