// Camera for vertical 1080x1920 shots. Keys: [u, {x, y, zoom, rot}, easeName]. Values hold before the first / after the last key.
const { ease, lerp, clamp, noise1 } = require('../../lib/draw');
const W = 1080, H = 1920;
function camAt(keys, u) {
  if (u <= keys[0][0]) return Object.assign({ rot: 0 }, keys[0][1]);
  for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) {
    const [ua, a] = keys[i - 1], [ub, b, e] = keys[i]; const f = (ease[e || 'inOut'])(clamp((u - ua) / (ub - ua)));
    return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), zoom: lerp(a.zoom, b.zoom, f), rot: lerp(a.rot || 0, b.rot || 0, f) };
  }
  return Object.assign({ rot: 0 }, keys[keys.length - 1][1]);
}
// shake: pixels of jitter, t: global time (keeps noise continuous across frames)
function apply(ctx, c, shake = 0, t = 0) {
  const sx = shake * noise1(t * 23), sy = shake * noise1(t * 23 + 71), sr = shake * 0.0009 * noise1(t * 17 + 13);
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.rotate((c.rot || 0) + sr); ctx.scale(c.zoom, c.zoom); ctx.translate(-c.x, -c.y);
}
module.exports = { camAt, apply, W, H };
