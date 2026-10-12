// Vocabulary picture cards (reference style: big white cards with a picture + coloured label that pop over the scene while Sofia explains).
const { TL } = require('./engine');
const { OL, paint, line, curve, roundRect, clamp, ease } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const B3 = require('./bg3');
const PR = require('./props3');

// line id → cards; `at` = index of the word on which the card pops in
const SPEC = {
  e1: [{ kind: 'passport', label: 'PASSPORT', col: '#2E6FD8', at: 1 }],
  e2: [{ kind: 'heavy', label: 'HEAVY', col: '#E5484D', at: 0 }, { kind: 'light', label: 'LIGHT', col: '#3DAA6E', at: 8 }],
  e3: [{ kind: 'gate', label: 'GATE', col: '#2E6FD8', at: 1 }, { kind: 'plane', label: 'PLANE', col: '#FF7A2F', at: 7 }],
  e4: [{ kind: 'late', label: 'DELAYED', col: '#E5484D', at: 0 }, { kind: 'ontime', label: 'ON TIME', col: '#3DAA6E', at: 6 }],
  e5: [{ kind: 'window', label: 'WINDOW', col: '#2E6FD8', at: 1 }, { kind: 'aisle', label: 'AISLE', col: '#FF7A2F', at: 9 }],
  e6: [{ kind: 'wave', label: 'HAVE A NICE FLIGHT!', col: '#FF7A2F', at: 0 }],
};
function clock(c, late, ok) {
  paint(c, q => q.arc(0, 0, 100, 0, 7), '#FFFFFF', { lw: 8 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [[Math.sin(a) * 80, -Math.cos(a) * 80], [Math.sin(a) * 92, -Math.cos(a) * 92]], 5, OL); }
  line(c, [[0, 0], [0, -62]], 9, OL); line(c, [[0, 0], [50, 22]], 9, late ? '#E5484D' : OL);
  if (late) { c.fillStyle = '#E5484D'; c.font = `800 60px ${F.EN}`; c.textAlign = 'center'; c.fillText('+2h', 82, -92); }
  if (ok === 'x') { line(c, [[-80, -80], [80, 80]], 18, '#E5484D'); line(c, [[80, -80], [-80, 80]], 18, '#E5484D'); }
}
function pic(c, kind) {
  c.save();
  if (kind === 'passport') { PR.passport(c, 2.6, 0.08); }
  else if (kind === 'heavy') {
    paint(c, q => { q.moveTo(-70, 70); q.lineTo(-50, -40); q.lineTo(50, -40); q.lineTo(70, 70); q.closePath(); }, '#5E6676', { shade: '#434A58', sx: 10, sy: 0, lw: 8 });
    paint(c, q => q.arc(0, -52, 24, Math.PI, 0), '#5E6676', { lw: 8 }); U.textOutlined(c, '20 KG', 0, 38, 46, '#FFFFFF', { olw: 8 });
  } else if (kind === 'light') {
    paint(c, q => { q.moveTo(-90, 60); q.bezierCurveTo(-100, -60, 40, -100, 90, -70); q.bezierCurveTo(80, 0, 30, 50, -90, 60); q.closePath(); }, '#BFE3FF', { shade: '#90C6EE', sx: 6, sy: 6, lw: 7 });
    line(c, [[-100, 70], [60, -50]], 8, OL); for (let i = 0; i < 4; i++) line(c, [[-50 + i * 24, 18 - i * 22], [-30 + i * 24, -6 - i * 22]], 4, 'rgba(58,34,29,0.5)');
  } else if (kind === 'gate') {
    paint(c, q => roundRect(q, -85, -90, 170, 130, 14), '#2E6FD8', { lw: 8 }); U.textOutlined(c, '12', 0, -5, 90, '#FFFFFF', { olw: 12 });
    paint(c, q => roundRect(q, -60, 52, 120, 70, 8), '#CFE6F7', { lw: 6 });
  } else if (kind === 'plane') { B3.plane(c, 0, 10, 0.55); }
  else if (kind === 'late') clock(c, true);
  else if (kind === 'ontime') clock(c, false, 'x');
  else if (kind === 'window') {
    paint(c, q => roundRect(q, -70, -100, 140, 190, 70), '#5FB3F0', { lw: 9 }); B3.cloud(c, -10, -20, 26);
    paint(c, q => roundRect(q, -100, 40, 70, 70, 14), '#2E6FD8', { lw: 7 });
  } else if (kind === 'aisle') {
    paint(c, q => roundRect(q, -100, -100, 66, 190, 14), '#2E6FD8', { lw: 7 }); paint(c, q => roundRect(q, 34, -100, 66, 190, 14), '#2E6FD8', { lw: 7 });
    paint(c, q => roundRect(q, -26, -100, 52, 190, 8), '#E8D9CC', { lw: 0 }); line(c, [[0, 70], [0, -70]], 8, '#FF7A2F'); line(c, [[0, -70], [-20, -44]], 8, '#FF7A2F'); line(c, [[0, -70], [20, -44]], 8, '#FF7A2F');
  } else if (kind === 'wave') {
    B3.plane(c, 0, 10, 0.6); for (let i = 0; i < 3; i++) line(c, [[-190 + i * 20, -70 - i * 24], [-120 + i * 20, -70 - i * 24]], 6, '#FFD23F');
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
