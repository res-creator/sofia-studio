// Natural arm posing for hq.human(): geometry + IK with sensible elbows and forearm foreshortening
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
function geom(cfg, drop = 0) {
  const h = cfg.h || 1500, B = Object.assign({ shoulder: 1 }, cfg.build || {});
  const headH = h * 0.165 * (cfg.headScale || 1.14), hw = headH * 0.43 * (cfg.headW || 1), hh = headH * 0.5, sw = hw * 1.75 * B.shoulder;
  const yNeck = -h + headH * 1.03 + drop, ySh = yNeck + 16;
  return { h, headH, hw, hh, sw, ySh, ua: h * 0.18, fa: h * 0.165, headY: -h + hh + drop, shL: { x: -sw * 0.84, y: ySh + 46 }, shR: { x: sw * 0.84, y: ySh + 46 } };
}
// reach(g, side, tx, ty): target in the character's local coords (feet at 0,0). side -1 = screen-left arm.
// Hand in front of the body -> elbow hangs by the side and the forearm comes toward the camera (shortened).
// Otherwise two-bone IK choosing the elbow that is lower / further out (never a backwards elbow).
function reach(g, side, tx, ty, o = {}) {
  const sh = side < 0 ? g.shL : g.shR, ua = g.ua, fa = g.fa;
  const dx = (tx - sh.x) * side, dy = ty - sh.y, d = Math.hypot(dx, dy);
  if (!o.planar && dx < ua * 0.3 && dy > -ua * 0.15) {
    const ae = o.elbow ?? clamp(0.14 + Math.max(0, dx) / ua * 0.5 + Math.max(0, -dy) / ua * 0.4, 0.06, 0.7);
    const ex = Math.sin(ae) * ua, ey = Math.cos(ae) * ua, fx = dx - ex, fy = dy - ey, L = Math.hypot(fx, fy);
    if (L <= fa * 1.02) return { a: ae, b: ae - Math.atan2(fx, fy), fl: Math.max(0.32, L / fa), fist: !!o.fist };
  }
  const dd = clamp(d, Math.abs(ua - fa) + 4, ua + fa - 2), th = Math.atan2(dx, dy);
  const al = Math.acos(clamp((ua * ua + dd * dd - fa * fa) / (2 * ua * dd), -1, 1));
  let best = null;
  for (const s of [1, -1]) { const a1 = th + al * s, ex = Math.sin(a1) * ua, ey = Math.cos(a1) * ua, score = ex * 0.55 + ey; if (!best || score > best.score) best = { a1, ex, ey, score }; }
  const k = dd / Math.max(d, 1e-6), a2 = Math.atan2(dx * k - best.ex, dy * k - best.ey);
  return { a: best.a1, b: best.a1 - a2, fl: 1, fist: !!o.fist };
}
const relaxed = (side) => ({ a: 0.14, b: 0.22 * (side ? 1 : 1) });
module.exports = { geom, reach, relaxed };
