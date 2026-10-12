// Vocabulary picture cards (ep4) (reference style: big white cards with a picture + coloured label that pop over the scene while Sofia explains).
const { TL } = require('./engine');
const { OL, paint, line, curve, roundRect, clamp, ease } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');

// line id → cards; `at` = index of the word on which the card pops in
const SPEC = {
  e1: [{ kind: 'reserve', label: 'RESERVATION', col: '#2E6FD8', at: 1 }],
  e2: [{ kind: 'keycard', label: 'KEY CARD', col: '#7A2432', at: 1 }],
  e3: [{ kind: 'toast', label: 'BREAKFAST', col: '#FF7A2F', at: 0 }],
  e5: [{ kind: 'hot', label: 'HOT', col: '#E5484D', at: 0 }, { kind: 'cold', label: 'COOL', col: '#2E9BE8', at: 9 }],
  e4: [{ kind: 'lock', label: 'PASSWORD', col: '#2E6FD8', at: 1 }],
  e6: [{ kind: 'exit', label: 'CHECK-OUT', col: '#3DAA6E', at: 0 }],
};
function therm(c, hot) {
  paint(c, q => roundRect(q, -26, -100, 52, 150, 26), '#FFFFFF', { lw: 8 }); const col = hot ? '#E5484D' : '#2E9BE8';
  c.fillStyle = col; c.fillRect(-9, hot ? -80 : -10, 18, hot ? 130 : 60); c.beginPath(); c.arc(0, 62, 36, 0, 7); c.fill(); c.lineWidth = 8; c.strokeStyle = OL; c.stroke();
  if (hot) for (let i = 0; i < 3; i++) line(c, [[-70 + i * 6, -60 + i * 30], [-50 + i * 6, -80 + i * 30]], 6, '#FF9D2F');
  else for (let i = 0; i < 3; i++) { line(c, [[56, -70 + i * 40], [86, -70 + i * 40]], 6, '#7FD0FF'); line(c, [[71, -85 + i * 40], [71, -55 + i * 40]], 6, '#7FD0FF'); }
}
function pic(c, kind) {
  c.save();
  if (kind === 'reserve') {
    paint(c, q => roundRect(q, -95, -80, 190, 170, 18), '#FFFFFF', { lw: 8 }); c.fillStyle = '#E5484D'; c.fillRect(-95, -80, 190, 46); line(c, [[-95, -80], [95, -80], [95, -34], [-95, -34]], 8, OL);
    for (const x of [-50, 50]) line(c, [[x, -100], [x, -62]], 10, OL);
    line(c, [[-44, 20], [-10, 56], [52, -12]], 18, '#3DAA6E');
  } else if (kind === 'keycard') {
    c.rotate(-0.15); paint(c, q => roundRect(q, -110, -60, 220, 140, 18), '#2E6FD8', { shade: '#2459B2', sx: 6, sy: 6, lw: 8 }); c.fillStyle = '#F2C744'; c.fillRect(-84, -30, 44, 34); line(c, [[-84, 50], [84, 50]], 8, '#FFFFFF'); line(c, [[-30, 20], [60, 20]], 8, '#9EC2FF');
    U.textOutlined(c, 'ROOM 404', 20, -22, 34, '#FFFFFF', { olw: 7 });
  } else if (kind === 'toast') {
    paint(c, q => { q.moveTo(-60, 70); q.lineTo(-60, -10); q.quadraticCurveTo(-90, -80, -30, -80); q.quadraticCurveTo(0, -100, 30, -80); q.quadraticCurveTo(90, -80, 60, -10); q.lineTo(60, 70); q.closePath(); }, '#F2B05A', { shade: '#D18F35', sx: 8, sy: -6, lw: 8 });
    paint(c, q => roundRect(q, -40, -50, 80, 100, 14), '#FFE3A8', { lw: 5 }); paint(c, q => roundRect(q, 74, 4, 70, 70, 14), '#FFFFFF', { lw: 7 }); c.fillStyle = '#FFC93C'; c.beginPath(); c.arc(109, 38, 20, 0, 7); c.fill();
  } else if (kind === 'hot') therm(c, true);
  else if (kind === 'cold') therm(c, false);
  else if (kind === 'lock') {
    paint(c, q => roundRect(q, -78, -10, 156, 120, 18), '#F2C744', { shade: '#C79A2A', sx: 6, sy: 6, lw: 8 }); c.beginPath(); c.arc(0, -10, 50, Math.PI, 0); c.lineWidth = 16; c.strokeStyle = OL; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#B9C0CC'; c.stroke();
    for (let i = 0; i < 4; i++) { c.fillStyle = OL; c.beginPath(); c.arc(-45 + i * 30, 60, 9, 0, 7); c.fill(); }
  } else if (kind === 'exit') {
    paint(c, q => roundRect(q, -90, -100, 110, 190, 10), '#A8714A', { shade: '#7E5232', sx: 8, sy: 0, lw: 8 }); c.beginPath(); c.arc(-10, -6, 9, 0, 7); c.fillStyle = '#F2C744'; c.fill();
    line(c, [[30, -4], [110, -4]], 14, '#3DAA6E'); line(c, [[78, -40], [112, -4], [78, 32]], 14, '#3DAA6E');
  }
  c.restore();
}
function drawCard(ctx, cd, k, t) {
  const a = ease.back(clamp(k)); if (a <= 0) return;
  ctx.save(); ctx.scale(a, a); ctx.rotate(Math.sin(t * 2.2) * 0.012);
  ctx.save(); ctx.globalAlpha = 0.22; paint(ctx, c => roundRect(c, -180 + 10, -210 + 14, 360, 420, 40), '#000', { lw: 0 }); ctx.restore();
  paint(ctx, c => roundRect(c, -180, -210, 360, 420, 40), '#FFFFFF', { lw: 8 });
  ctx.save(); ctx.translate(0, -30); pic(ctx, cd.kind); ctx.restore();
  ctx.font = `800 100px ${F.EN}`; const fs = Math.min(70, Math.floor(100 * 320 / Math.max(1, ctx.measureText(cd.label).width)));
  U.textOutlined(ctx, cd.label, 0, 175, fs, cd.col, { olw: Math.max(8, fs * 0.16) });
  ctx.restore();
}
function draw(ctx, t) {
  for (const id of Object.keys(SPEC)) {
    const L = TL.lines.find(l => l.id === id); if (!L || t < L.t0 || t > L.t1 + 0.6) continue;
    const cs = SPEC[id], X = cs.length === 1 ? [1680] : [1450, 1760], out = 1 - ease.in(clamp((t - L.t1 + 0.1) / 0.5));
    cs.forEach((cd, i) => {
      const w = L.words[Math.min(cd.at, L.words.length - 1)], t0 = w ? w.t0 : L.t0, k = (t - t0) / 0.35;
      ctx.save(); ctx.translate(X[i], 250); ctx.scale(out * 0.74, out * 0.74); drawCard(ctx, cd, k, t); ctx.restore();
    });
  }
}
module.exports = { draw, SPEC, pic };
