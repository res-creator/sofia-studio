// 6. Reveal — from the glowing mascot, pull far back to a planet cut-away: the layers blend into each other,
//    the expected "ground" line dissolves, and the mascot keeps sinking. One line of text at the very end.
const { camAt, apply, W, H } = require('../camera');
const { space, jupiter } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp, ease, hash } = require('../../../lib/draw');
const F = require('../../../lib/fonts');
const R = 1000;
const CAM = [[0, { x: 0, y: -950, zoom: 6, rot: 0.1 }], [0.3, { x: 0, y: -935, zoom: 5.2, rot: 0.08 }, 'lin'], [2.1, { x: 0, y: 40, zoom: 0.62, rot: 0 }, 'inOut'], [4.4, { x: 0, y: 60, zoom: 0.57, rot: 0 }, 'lin']];
module.exports = { id: 'reveal', dur: 4.4, sfx: [[0, 'boom'], [0.3, 'whoosh'], [2.1, 'dissolve']], draw(ctx, u, t) {
  space(ctx, W, H, t, 0);
  ctx.save(); apply(ctx, camAt(CAM, u), u < 0.4 ? 8 : 0, t);
  jupiter(ctx, 0, 0, R, t);
  // cut-away wedge: soft radial blend, no hard boundary anywhere
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R + 2, -Math.PI * 0.72, -Math.PI * 0.28); ctx.closePath(); ctx.clip();
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R); [[0, '#FFF4D6'], [0.18, '#E8EDF6'], [0.42, '#A9B4C8'], [0.62, '#E36A3A'], [0.82, '#C77B4F'], [1, '#EBD3AE']].forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(-R, -R, 2 * R, 2 * R); ctx.restore();
  // the "ground" you might expect: a dashed shell that breaks apart
  const br = clamp((u - 2.1) / 1.0);
  if (u > 1.4) { ctx.save(); ctx.globalAlpha = clamp((u - 1.4) / 0.3) * (1 - br); ctx.setLineDash([26, 22]); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, R * 0.7, -Math.PI * 0.72, -Math.PI * 0.28); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 26 * br; i++) { const a = -Math.PI * 0.72 + hash(i) * Math.PI * 0.44, rr = R * 0.7 + (hash(i * 3) - 0.5) * 120 * br; ctx.globalAlpha = 1 - br; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr + br * 40, 6, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1; }
  // the mascot: still sinking, glowing, passes where the ground "should" be
  const y = -950 + clamp(u / 3.6) * 500;
  const gl = ctx.createRadialGradient(0, y - 30, 4, 0, y - 30, 120); gl.addColorStop(0, 'rgba(255,240,180,0.9)'); gl.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = gl; ctx.fillRect(-140, y - 170, 280, 280);
  drawDummyFx(ctx, 0, y, 0.12, { t, glow: 0.6, eyes: 'wide', legs: 'flail', armL: [-200, -330], armR: [200, -330], mouth: { open: 0.6, o: 1 } });
  ctx.restore();
  const a = clamp((u - 2.6) / 0.5);
  if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.font = `700 76px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.fillText('There is no ground.', W / 2, 1560 + (1 - a) * 20); ctx.restore(); }
} };
