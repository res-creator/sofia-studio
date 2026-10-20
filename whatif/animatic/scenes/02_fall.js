// 2. Falling toward the clouds — head-first dive, planet rushes up, ends in a cloud white-out.
const { camAt, apply, W, H } = require('../camera');
const { space, jupiter, puff, streaks } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp, ease, hash } = require('../../../lib/draw');
const CAM = [[0, { x: 0, y: 450, zoom: 0.4, rot: -0.06 }], [1.0, { x: 0, y: 150, zoom: 0.8, rot: 0.12 }, 'inOut'], [3, { x: 0, y: 0, zoom: 1.25, rot: 0.2 }, 'in']];
module.exports = { id: 'fall', dur: 3, sfx: [[0, 'whoosh'], [0.2, 'wind'], [2.55, 'puff']], draw(ctx, u, t) {
  const d = 900 * (1 - ease.in(clamp(u / 3)) * 0.95); // distance from mascot to the cloud tops
  space(ctx, W, H, t, u * 900);
  ctx.save(); apply(ctx, camAt(CAM, u), 4 + u * 4, t);
  jupiter(ctx, 0, d + 4200, 4200, t);
  if (d < 700) for (let i = 0; i < 14; i++) puff(ctx, -1400 + i * 210 + Math.sin(i * 3) * 40, d + 40 + hash(i) * 120, 1.6 + hash(i * 2) * 0.8, '#FBF3E2', '#D9C3A0');
  drawDummyFx(ctx, 0, 0, 0.9, { t, rot: Math.PI * ease.inOut(clamp(u / 0.8)) + Math.sin(t * 6) * 0.06, eyes: 'wide', look: [0, -1], legs: 'flail',
    armL: [-200, -380 + Math.sin(t * 13) * 40], armR: [200, -380 - Math.sin(t * 13) * 40], mouth: { open: 0.8, o: 1 }, brow: { l: -1, r: -1 } });
  ctx.restore();
  streaks(ctx, W, H, t, 26, [0, -2600 * (0.4 + u / 3)], 'rgba(255,255,255,0.4)', 260);
  const wo = clamp((u - 2.55) / 0.4); if (wo > 0) { ctx.fillStyle = `rgba(251,243,226,${wo})`; ctx.fillRect(0, 0, W, H); }
} };
