// 1. Mascot floating near giant Jupiter — tight on the mascot, then a fast pull-back reveals the scale.
const { camAt, apply, W, H } = require('../camera');
const { space, jupiter } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp } = require('../../../lib/draw');
const CAM = [[0, { x: 0, y: -120, zoom: 2.1, rot: 0.06 }], [0.5, { x: 0, y: -100, zoom: 1.9, rot: 0.05 }, 'lin'], [2.2, { x: 0, y: 900, zoom: 0.42, rot: -0.05 }, 'inOut'], [3, { x: 0, y: 1000, zoom: 0.38, rot: -0.06 }, 'out']];
module.exports = { id: 'approach', dur: 3, sfx: [[0, 'drone'], [0.55, 'whoosh']], draw(ctx, u, t) {
  space(ctx, W, H, t, u * 30);
  ctx.save(); apply(ctx, camAt(CAM, u), 0, t);
  jupiter(ctx, 0, 3300, 2600, t);
  const look = u > 1.6, panic = clamp((u - 2.2) / 0.4);
  drawDummyFx(ctx, 0, Math.sin(t * 2) * 12, 0.9, { t, rot: Math.sin(t * 1.3) * 0.12, eyes: look ? 'wide' : 'open', look: look ? [0, 1] : [0.3, -0.2],
    armR: u < 1.4 ? [140, -420 + Math.sin(t * 11) * 35] : [170 + panic * 30, -260 - panic * 80], armL: [-150 - panic * 30, -60 - panic * 200],
    legs: panic > 0 ? 'flail' : 'stand', mouth: look ? { open: 0.5, o: 1 } : { smile: 0.8 }, brow: look ? { l: -1, r: -1 } : {} });
  ctx.restore();
} };
