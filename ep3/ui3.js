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
// NEW PHRASE card: ep2 layout; the phrase is auto-fitted to the card width, card sits in a top corner (away from faces)
function phraseCard(ctx, cd, k, out, t, side = 'right') {
  if (k <= 0 || out >= 1) return;
  const a = ease.back(clamp(k)), o = 1 - ease.in(clamp(out)), s = 0.5 * a * o + 0.0001;
  const X = side === 'left' ? 310 : 1590, Y = 185;
  ctx.save(); ctx.translate(X + (1 - clamp(k * 1.4)) * (side === 'left' ? -260 : 260), Y); ctx.scale(s, s); ctx.rotate((side === 'left' ? 0.03 : -0.03) + Math.sin(t * 2) * 0.008);
  ctx.save(); ctx.globalAlpha = 0.25; paint(ctx, c => roundRect(c, -440 + 14, -190 + 18, 880, 380, 46), '#000', { lw: 0 }); ctx.restore();
  paint(ctx, c => roundRect(c, -440, -190, 880, 380, 46), '#FFFFFF', { lw: 8 });
  ctx.save(); ctx.beginPath(); roundRect(ctx, -440, -190, 880, 380, 46); ctx.clip(); ctx.fillStyle = GREEN; ctx.fillRect(-440, -190, 880, 92); ctx.restore();
  line(ctx, [[-440, -98], [440, -98]], 8, OL);
  U.textOutlined(ctx, 'NEW PHRASE', -390, -125, 44, '#FFFFFF', { align: 'left', olw: 8 });
  icon(ctx, cd.icon, 370, -144, 0.85);
  ctx.font = `800 100px ${F.EN}`; const fs = Math.min(100, Math.floor(100 * 790 / Math.max(1, ctx.measureText(cd.en).width)));
  U.textOutlined(ctx, cd.en, 0, 40, fs, ORANGE, { olw: Math.max(8, fs * 0.14) });
  ctx.font = '42px DejaVu Sans'; ctx.fillStyle = '#8A6A5C'; ctx.textAlign = 'center'; ctx.fillText(cd.ipa, 0, 120);
  ctx.restore();
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
// YOUR TURN plate: mic ring + phrase, text auto-fitted so everything stays inside the plate
function yourTurn(ctx, phrase, k, t) {
  if (k <= 0 || k >= 1) return;
  const inn = ease.back(clamp(k / 0.15)), out = 1 - ease.in(clamp((k - 0.9) / 0.1)), s = inn * out * 0.8;
  ctx.save(); ctx.translate(960, 880); ctx.scale(s, s);
  paint(ctx, c => roundRect(c, -520, -150, 1040, 300, 50), ORANGE, { lw: 8 });
  U.textOutlined(ctx, 'YOUR TURN!', 90, -60, 64, '#FFFFFF', { olw: 12 });
  ctx.font = `800 84px ${F.EN}`; const fs = Math.min(84, Math.floor(84 * 780 / Math.max(1, ctx.measureText(phrase).width)));
  U.textOutlined(ctx, phrase, 90, 60, fs, '#FFFFFF', { olw: Math.max(8, fs * 0.155) });
  ctx.save(); ctx.translate(-410, 0);
  paint(ctx, c => c.arc(0, 0, 66, 0, 7), '#FFFFFF', { lw: 7 });
  ctx.beginPath(); ctx.arc(0, 0, 54, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp((k - 0.1) / 0.8)); ctx.lineWidth = 14; ctx.strokeStyle = GREEN; ctx.lineCap = 'round'; ctx.stroke();
  U.icon(ctx, 'mic', 0, 2, 0.8 + 0.08 * Math.sin(t * 14));
  ctx.restore(); ctx.restore();
}
module.exports = { caption: U2.caption, phraseCard, tracker, icon, yourTurn, STYLE: U2.STYLE };
