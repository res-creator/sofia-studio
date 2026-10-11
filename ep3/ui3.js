// Episode 3 overlays: ep2 look + airport icons, 6-phrase tracker, speaker colours for the new cast.
const { OL, paint, line, curve, roundRect, clamp, ease } = require('../lib/draw');
const F = require('../lib/fonts');
const U = require('../lib/ui');
const U2 = require('../ep2/ui2');
const { ORANGE, GREEN, RED } = U;
U2.STYLE.anna = { bg: '#2A3D73', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };
U2.STYLE.announcer = U2.STYLE.anna;
U2.STYLE.bob = { bg: '#5E6676', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };
U2.STYLE.gary = { bg: '#E5484D', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };

function icon(ctx, name, X, Y, s = 1) {
  ctx.save(); ctx.translate(X, Y); ctx.scale(s, s);
  if (name === 'passport') {
    paint(ctx, c => roundRect(c, -30, -42, 60, 84, 8), '#1E2E5A', { lw: 6 });
    ctx.beginPath(); ctx.arc(0, -8, 14, 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = '#F2C744'; ctx.stroke();
    line(ctx, [[-14, 24], [14, 24]], 4, '#F2C744');
  } else if (name === 'bag') {
    paint(ctx, c => roundRect(c, -38, -26, 76, 62, 10), '#E5484D', { shade: '#B8323A', sx: 5, sy: 4, lw: 6 });
    curve(ctx, [-16, -26], [0, -50], [16, -26], 6, OL);
    U.textOutlined(ctx, '!', 0, 22, 52, '#FFFFFF', { olw: 8 });
  } else if (name === 'wave') {
    paint(ctx, c => c.arc(0, 0, 38, 0, 7), '#FFD23F', { lw: 6 }); curve(ctx, [-18, 8], [0, 26], [18, 8], 6, OL);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 13, -8, 5, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
  } else if (name === 'gate') {
    paint(ctx, c => roundRect(c, -40, -30, 80, 60, 10), '#2E6FD8', { lw: 6 });
    U.textOutlined(ctx, '12', 0, 14, 44, '#FFFFFF', { olw: 7 });
    line(ctx, [[0, 30], [0, 46]], 6, OL);
  } else if (name === 'delay') {
    paint(ctx, c => c.arc(0, 0, 38, 0, 7), '#FFFFFF', { lw: 6 }); line(ctx, [[0, 0], [0, -24]], 6, OL); line(ctx, [[0, 0], [18, 8]], 6, RED);
  } else if (name === 'seat') {
    paint(ctx, c => roundRect(c, -28, -44, 56, 60, 14), '#2E6FD8', { shade: '#2459B2', sx: 6, sy: 0, lw: 6 });
    paint(ctx, c => roundRect(c, -38, 6, 76, 34, 12), '#2E6FD8', { shade: '#2459B2', sx: 0, sy: -6, lw: 6 });
  } else U2.icon(ctx, name, 0, 0, 1);
  ctx.restore();
}
// phrase card: ep2 layout, ep3 icon set (monkey-patched icon for the shared draw routine)
function phraseCard(ctx, cd, k, out, t, side) {
  const orig = U2.icon; U2.icon = icon; // not used by ep2 phraseCard (it calls its local icon) → draw our own icon on top
  U2.phraseCard(ctx, Object.assign({}, cd, { icon: '_none' }), k, out, t, side); U2.icon = orig;
  if (k <= 0 || out >= 1) return;
  const a = ease.back(clamp(k)), o = 1 - ease.in(clamp(out)), s = 0.58 * a * o + 0.0001;
  const X = side === 'left' ? 450 : 1470, Y = 210;
  ctx.save(); ctx.translate(X + (1 - clamp(k * 1.4)) * (side === 'left' ? -260 : 260), Y); ctx.scale(s, s); ctx.rotate((side === 'left' ? 0.03 : -0.03) + Math.sin(t * 2) * 0.008);
  icon(ctx, cd.icon, 370, -144, 0.85); ctx.restore();
}
const TRACK = ['passport', 'bag', 'wave', 'gate', 'delay', 'seat'];
function tracker(ctx, done, t, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(36, 26); ctx.scale(0.6, 0.6);
  const y = 80, gap = 120, x0 = 110, n = TRACK.length - 1;
  paint(ctx, c => roundRect(c, x0 - 70, y - 62, gap * n + 140, 124, 62), 'rgba(255,255,255,0.88)', { lw: 6 });
  line(ctx, [[x0, y], [x0 + gap * n, y]], 10, '#E8D9CC');
  const fill = gap * Math.min(n, Math.max(0, done - 1)); if (fill > 0) line(ctx, [[x0, y], [x0 + fill, y]], 10, GREEN);
  TRACK.forEach((nm, i) => {
    const on = done >= i + 1 - 0.01, x = x0 + i * gap, pop = on ? 1 + 0.25 * Math.max(0, 1 - Math.abs(done - (i + 1)) * 3) : 1;
    paint(ctx, c => c.arc(x, y, 44 * pop, 0, 7), on ? '#FFFFFF' : '#F3EAE2', { lw: 6 });
    ctx.save(); if (!on) ctx.globalAlpha = 0.35 * alpha; icon(ctx, nm, x, y, 0.62 * pop); ctx.restore();
  });
  ctx.restore();
}
module.exports = { caption: U2.caption, phraseCard, tracker, icon, STYLE: U2.STYLE };
