// 3. Turbulent atmosphere — jet-stream bands shearing in opposite directions, tumbling mascot, lightning.
const { apply, W, H } = require('../camera');
const { band, streaks } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp, line, hash } = require('../../../lib/draw');
const COLS = ['#F1DFC0', '#D9A877', '#F6EBD6', '#C07A4E', '#EAD2AE', '#B8693F', '#E3C49A', '#A85E3A'];
const BOLT = 1.35;
function bolt(ctx, x0, y0, len, seed) { const p = [[x0, y0]]; for (let i = 1; i < 9; i++) p.push([x0 + (hash(i + seed) - 0.5) * 160, y0 + len * i / 8]); line(ctx, p, 22, 'rgba(200,230,255,0.5)'); line(ctx, p, 8, '#fff'); }
module.exports = { id: 'turbulence', dur: 3, sfx: [[0, 'storm'], [BOLT, 'thunder']], draw(ctx, u, t) {
  ctx.fillStyle = '#F6EBD6'; ctx.fillRect(0, 0, W, H);
  const roll = Math.sin(u * 2.6) * 0.22, fall = u * 1400;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(roll); ctx.scale(1.25, 1.25); ctx.translate(-W / 2, -H / 2);
  for (let i = -2; i < 12; i++) { const y = ((i * 230 - fall) % 2760 + 2760) % 2760 - 400; band(ctx, W, y, 420, (i % 2 ? 1 : -1) * (500 + (i % 3) * 260), t, COLS[(i + 8) % 8], i * 1.3); }
  const fl = clamp(1 - Math.abs(u - BOLT) / 0.12);
  if (u > BOLT - 0.05 && u < BOLT + 0.2) bolt(ctx, 260, 120, 900, 7);
  ctx.restore();
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl * 0.7})`; ctx.fillRect(0, 0, W, H); }
  ctx.save(); apply(ctx, { x: 0, y: 0, zoom: 1.15, rot: roll * 0.5 }, 16, t);
  drawDummyFx(ctx, 0, 120, 0.9, { t, rot: u * 4.2 + Math.PI, eyes: 'swirl', legs: 'tuck', armL: [-190, -300], armR: [190, -250], mouth: { open: 0.5, o: 1 } });
  ctx.restore();
  streaks(ctx, W, H, t, 30, [900, -1800], 'rgba(255,255,255,0.75)', 70, 3, 5); // ammonia ice crystals
} };
