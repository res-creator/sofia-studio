// 4. Pressure increasing — rings close in on the mascot, the haze thickens, the body squashes.
const { apply, W, H } = require('../camera');
const { streaks, vignette } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp, ease } = require('../../../lib/draw');
module.exports = { id: 'pressure', dur: 3, sfx: [[0, 'groan'], [1.2, 'creak'], [2.2, 'creak']], draw(ctx, u, t) {
  const p = ease.inOut(clamp(u / 2.8));
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8A4A28'); g.addColorStop(1, '#3A1A10'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  streaks(ctx, W, H, t, 40, [0, -900 * (1 - p * 0.75)], 'rgba(255,200,150,0.18)', 120, 5, 10); // fluid slows as it thickens
  ctx.save(); ctx.translate(W / 2, H / 2 + 60);
  for (let i = 0; i < 7; i++) { const f = ((u * (0.5 + p * 0.9) + i / 7) % 1); const r = (1 - f) * 1300 + 260; ctx.globalAlpha = f * (0.25 + p * 0.5); ctx.lineWidth = 10 + f * 30 * (0.5 + p); ctx.strokeStyle = '#F2B07A'; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 1.05, 0, 0, 7); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
  ctx.save(); apply(ctx, { x: 0, y: -40, zoom: 1.0 + p * 0.45, rot: -0.03 + p * 0.06 }, 3 + p * 12, t);
  drawDummyFx(ctx, 0, 220, 0.9, { t, squash: 1 - p * 0.42, eyes: p > 0.65 ? 'shut' : 'wide', legs: 'tuck', brow: { l: 1, r: 1 }, mouth: { open: 0.25, teeth: 1, smile: -0.4 },
    armL: [-200 + p * 120, -260 + p * 120], armR: [200 - p * 120, -260 + p * 120] });
  ctx.restore();
  vignette(ctx, W, H, 820 - p * 520, 'rgba(20,6,2,0.95)');
} };
