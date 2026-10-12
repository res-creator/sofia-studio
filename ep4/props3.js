// Episode 4 props: suitcase, burger, passport (+ egg insert), tie clip, boarding pass, trolley, Uncle Gary's look.
const { OL, paint, line, curve, roundRect, hash, clamp, lerp } = require('../lib/draw');
const F = require('../lib/fonts');
const W = 1920, H = 1080;

function burger(c, X, Y, s = 1, rot = 0) {
  c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.moveTo(-50, 8); q.lineTo(50, 8); q.quadraticCurveTo(52, 30, 30, 32); q.lineTo(-30, 32); q.quadraticCurveTo(-52, 30, -50, 8); q.closePath(); }, '#E8A04A', { shade: '#C9812E', sx: 0, sy: -6, lw: 5 });
  paint(c, q => roundRect(q, -52, -6, 104, 16, 8), '#6B3A22', { lw: 5 });
  paint(c, q => { q.moveTo(-56, -6); for (let i = 0; i <= 6; i++) q.lineTo(-56 + i * 18.7, -6 + (i % 2 ? -8 : 4)); q.lineTo(56, -6); q.closePath(); }, '#6FC96A', { lw: 4 });
  paint(c, q => { q.moveTo(-52, -10); q.quadraticCurveTo(-50, -56, 0, -58); q.quadraticCurveTo(50, -56, 52, -10); q.closePath(); }, '#F2B05A', { shade: '#D18F35', sx: -6, sy: 4, lw: 5 });
  c.fillStyle = '#FFF2D0'; for (const [dx, dy] of [[-20, -38], [0, -46], [20, -36], [-6, -30]]) { c.beginPath(); c.ellipse(dx, dy, 5, 3, 0.4, 0, 7); c.fill(); }
  c.restore();
}
function wrapper(c, X, Y, s = 1, rot = 0, seed = 1) {
  c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s);
  const pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, r = 46 * (0.78 + 0.35 * hash(seed * 13 + i)); pts.push([Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8]); }
  const shape = q => { pts.forEach((p, i) => i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1])); q.closePath(); };
  paint(c, shape, '#FFE07A', { shade: '#E8B640', sx: 6, sy: 6, lw: 5 });
  c.save(); c.beginPath(); shape(c); c.clip(); c.fillStyle = '#E5484D'; c.fillRect(-80, -8, 160, 18); c.restore();
  c.restore();
}
// suitcase: (X, Y) = bottom centre. o.open 0..1 (lid angle), o.w/h body size
function suitcase(c, X, Y, s = 1, o = {}) {
  const w = 320, h = 230, open = o.open || 0, col = o.col || '#E5484D', sh = o.sh || '#B8323A';
  c.save(); c.translate(X, Y); c.scale(s, s); if (o.rot) c.rotate(o.rot);
  for (const wx of [-120, 120]) { paint(c, q => q.ellipse(wx, 14, 20, 20, 0, 0, 7), '#3A3F4A', { lw: 5 }); }
  paint(c, q => roundRect(q, -w / 2, -h, w, h, 26), col, { shade: sh, sx: 12, sy: -10, lw: 7 });
  if (!open) { for (const bx of [-90, 90]) paint(c, q => roundRect(q, bx - 16, -h, 32, h, 8), '#F2C744', { lw: 5 }); paint(c, q => roundRect(q, -26, -h - 20, 52, 24, 8), '#3A3F4A', { lw: 5 }); }
  else { paint(c, q => roundRect(q, -w / 2 + 14, -h + 10, w - 28, 60, 18), '#3A2A24', { lw: 5 }); }
  c.restore();
}
function suitcaseLid(c, X, Y, s, k, col = '#E5484D') { // open lid: an upright panel behind/above the case top (foreshortened), grows with k
  const hh = 40 + k * 170, top = Y - 230 * s;
  c.save(); c.translate(X, top); c.scale(s, s);
  paint(c, q => roundRect(q, -150, -hh / s * 0 - hh, 300, hh + 6, 22), k > 0.5 ? '#B8323A' : col, { shade: '#8F2830', sx: 0, sy: -8, lw: 7 });
  if (k > 0.5) { c.save(); c.globalAlpha = 0.5; paint(c, q => roundRect(q, -120, -hh + 24, 240, hh - 50, 14), '#8F2830', { lw: 0 }); c.restore(); }
  c.restore();
}
function passport(c, s = 1, rot = 0) {
  c.save(); c.scale(s, s); c.rotate(rot);
  paint(c, q => roundRect(q, -36, -50, 72, 100, 8), '#1E2E5A', { shade: '#141F40', sx: 5, sy: 5, lw: 5 });
  c.beginPath(); c.arc(0, -8, 16, 0, 7); c.lineWidth = 4; c.strokeStyle = '#F2C744'; c.stroke();
  c.fillStyle = '#F2C744'; c.font = `800 13px ${F.EN}`; c.textAlign = 'center'; c.fillText('PASSPORT', 0, 32);
  c.restore();
}
function boardingPass(c, s = 1, rot = 0) {
  c.save(); c.scale(s, s); c.rotate(rot);
  paint(c, q => roundRect(q, -50, -28, 100, 56, 6), '#FFFFFF', { shade: '#E3E8EF', sx: 4, sy: 4, lw: 4 });
  c.fillStyle = '#2E6FD8'; c.fillRect(-50, -28, 100, 14); c.fillStyle = OL; c.fillRect(-36, 2, 56, 5); c.fillRect(-36, 14, 40, 5);
  c.restore();
}
function egg(c, X, Y, s) {
  paint(c, q => q.ellipse(X, Y, 70 * s, 92 * s, 0, 0, 7), '#FFF6E6', { shade: '#EADBC0', sx: 10 * s, sy: 8 * s, lw: 6 });
  c.save(); c.globalAlpha = 0.6; c.beginPath(); c.ellipse(X - 26 * s, Y - 40 * s, 14 * s, 22 * s, -0.4, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
}
function passportInsert(ctx, t, k) { // full-screen close-up of Gus's passport
  ctx.fillStyle = '#F4F6F9'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#E3E8EF'; for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 100 + 40, W, 6);
  const z = 1 + 0.04 * k; ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.rotate(-0.03);
  paint(ctx, q => roundRect(q, -640, -380, 1280, 760, 30), '#1E2E5A', { lw: 8 });
  paint(ctx, q => roundRect(q, -620, -360, 610, 720, 18), '#F3EEDD', { shade: '#E3DCC3', sx: -8, sy: 0, lw: 6 });
  paint(ctx, q => roundRect(q, 10, -360, 610, 720, 18), '#F3EEDD', { shade: '#E3DCC3', sx: 8, sy: 0, lw: 6 });
  paint(ctx, q => roundRect(q, -540, -260, 360, 460, 12), '#CFE6F7', { lw: 6 });
  egg(ctx, -360, -20, 1.75);
  ctx.fillStyle = '#7A6A50'; ctx.font = `700 34px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText('PASSPORT', -540, -290);
  [['NAME', 'GUS'], ['COUNTRY', 'GOOSELAND'], ['BORN', 'IN AN EGG'], ['HEIGHT', 'TALL-ISH']].forEach((r, i) => { ctx.fillStyle = '#9C8A6E'; ctx.font = `700 30px ${F.EN}`; ctx.fillText(r[0], 80, -240 + i * 130); ctx.fillStyle = '#2A2420'; ctx.font = `800 52px ${F.EN}`; ctx.fillText(r[1], 80, -186 + i * 130); });
  ctx.save(); ctx.translate(-160, 250); ctx.rotate(-0.25); ctx.globalAlpha = 0.6; ctx.lineWidth = 6; ctx.strokeStyle = '#E5484D'; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.stroke(); ctx.fillStyle = '#E5484D'; ctx.font = `800 30px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillText('HONK', 0, 10); ctx.restore();
  ctx.restore();
}
function tieClip(c, X, Y, s = 1, rot = 0) {
  c.save(); c.translate(X, Y); c.rotate(rot); c.scale(s, s);
  paint(c, q => roundRect(q, -34, -8, 68, 16, 6), '#F2C744', { shade: '#C99A1E', sx: 0, sy: -3, lw: 4 });
  c.fillStyle = '#fff'; c.globalAlpha = 0.7; c.fillRect(-22, -4, 26, 3); c.restore();
}
// Uncle Gary on the stock Gus rig (hold callback): sunglasses + red bandana. Use with tie:false.
function gary(c, f, h) {
  const { hx, hy } = h;
  paint(c, q => { q.moveTo(hx - 64, hy - 24); q.bezierCurveTo(hx - 50, hy - 70, hx + 40, hy - 74, hx + 64, hy - 30); q.lineTo(hx + 60, hy - 14); q.bezierCurveTo(hx + 30, hy - 50, hx - 40, hy - 46, hx - 62, hy - 6); q.closePath(); }, '#E5484D', { shade: '#B8323A', sx: 0, sy: 4, lw: 5 });
  c.fillStyle = '#fff'; for (const [dx, dy] of [[-30, -48], [0, -54], [30, -48]]) { c.beginPath(); c.arc(hx + dx, hy + dy, 4, 0, 7); c.fill(); }
  paint(c, q => { q.moveTo(hx - 62, hy - 20); q.lineTo(hx - 110, hy - 40); q.lineTo(hx - 96, hy - 6); q.closePath(); }, '#E5484D', { lw: 5 });
  paint(c, q => q.ellipse(hx + 22, hy - 12, 30, 22, 0, 0, 7), '#1E2230', { lw: 5 });
  c.save(); c.globalAlpha = 0.5; curve(c, [hx + 6, hy - 22], [hx + 14, hy - 28], [hx + 26, hy - 26], 4, '#fff'); c.restore();
  line(c, [[hx - 8, hy - 14], [hx - 60, hy - 18]], 6, '#1E2230');
}
function trolley(c, X, Y, s = 1) { // food cart, bottom centre
  c.save(); c.translate(X, Y); c.scale(s, s);
  paint(c, q => roundRect(q, -130, -330, 260, 330, 14), '#C9D1DC', { shade: '#9DA7B6', sx: 12, sy: 0, lw: 7 });
  paint(c, q => roundRect(q, -110, -310, 220, 140, 10), '#8E96A3', { lw: 5 });
  paint(c, q => roundRect(q, -110, -150, 220, 130, 10), '#E5484D', { lw: 5 });
  paint(c, q => roundRect(q, -146, -350, 292, 28, 10), '#F4F6F9', { lw: 6 });
  for (const wx of [-90, 90]) paint(c, q => q.ellipse(wx, 10, 20, 20, 0, 0, 7), '#3A3F4A', { lw: 5 });
  c.restore();
}
function plate(c, X, Y, kind) { // chicken / fish dish
  c.save(); c.translate(X, Y);
  paint(c, q => q.ellipse(0, 0, 60, 18, 0, 0, 7), '#FFFFFF', { lw: 5 });
  if (kind === 'fish') paint(c, q => { q.moveTo(-34, 0); q.quadraticCurveTo(-8, -26, 24, -2); q.lineTo(44, -14); q.lineTo(42, 14); q.lineTo(24, 4); q.quadraticCurveTo(-8, 24, -34, 0); q.closePath(); }, '#7FB4E8', { lw: 4 });
  else paint(c, q => q.ellipse(0, -8, 32, 18, 0, 0, 7), '#D9A05B', { lw: 4 });
  c.restore();
}
function eggInsertCaption() {}
module.exports = { burger, wrapper, suitcase, suitcaseLid, passport, boardingPass, egg, passportInsert, tieClip, gary, trolley, plate };
