// 5. Heat increasing — colour climbs from ember red to white-hot, embers stream past, heat shimmer warps the frame.
const { apply, W, H } = require('../camera');
const { streaks } = require('../world');
const { drawDummyFx } = require('../../../lib/dummy');
const { clamp, ease, lerp, hash } = require('../../../lib/draw');
const mix = (a, b, f) => '#' + [0, 2, 4].map(i => Math.round(lerp(parseInt(a.substr(i + 1, 2), 16), parseInt(b.substr(i + 1, 2), 16), f)).toString(16).padStart(2, '0')).join('');
module.exports = { id: 'heat', dur: 3, shimmer: u => 4 + u * 7, sfx: [[0, 'fire']], draw(ctx, u, t) {
  const h = ease.inOut(clamp(u / 2.8));
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix('#4A120A', '#B8360E', h)); g.addColorStop(0.6, mix('#9A2A10', '#FF7A1F', h)); g.addColorStop(1, mix('#E0561A', '#FFE7A0', h)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W / 2, H * 0.55, 50, W / 2, H * 0.55, 900); r.addColorStop(0, `rgba(255,240,190,${0.25 + h * 0.5})`); r.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  streaks(ctx, W, H, t, 34, [60, -1500], 'rgba(255,220,120,0.9)', 50, 9, 7);
  streaks(ctx, W, H, t, 16, [-40, -900], 'rgba(255,255,230,0.6)', 30, 21, 4);
  ctx.save(); apply(ctx, { x: 0, y: 0, zoom: 1.25 - h * 0.2, rot: h * 0.12 }, 6, t);
  const halo = ctx.createRadialGradient(0, -150, 60, 0, -150, 520); halo.addColorStop(0, `rgba(255,250,210,${0.2 + h * 0.6})`); halo.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = halo; ctx.fillRect(-600, -700, 1200, 1200);
  drawDummyFx(ctx, 0, 100, 0.9, { t, glow: 0.25 + h * 0.75, eyes: 'wide', legs: 'flail', brow: { l: -1, r: -1 }, mouth: { open: 0.7, o: 1 }, armL: [-210, -330 + Math.sin(t * 15) * 40], armR: [210, -330 - Math.sin(t * 15) * 40], rot: Math.sin(t * 3) * 0.08 });
  ctx.restore();
} };
