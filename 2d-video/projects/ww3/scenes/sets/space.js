// sets/space.js — the Earth at night from space (lib.globe): stars, sun glow at the limb, satellites on orbits,
// the 1962 radiation belt, undersea cables as glowing lines, the soot "curtain" in the stratosphere, the cold tint.
import { E, V, S, mood, layer, backdrop, seg, circle, ring, glow, alpha, shade, mix, rng, clamp, ease, lerp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { globe, proj } from '../lib.js';

// cable routes (lon,lat polylines across oceans; schematic, not a real cable map)
export const CABLES = [
  [[-74, 40], [-40, 45], [-10, 50], [-5, 50]], [[-80, 26], [-40, 30], [-9, 38]], [[-118, 34], [-160, 21], [140, 35]], [[-122, 45], [-170, 50], [145, 40]],
  [[-43, -23], [-20, -10], [3, 6]], [[-9, 38], [-15, 20], [-17, 14], [3, 6], [18, -34]], [[32, 31], [43, 12], [55, 15], [73, 19]], [[73, 19], [80, 6], [100, 2], [114, 22]],
  [[114, 22], [121, 25], [130, 32], [140, 35]], [[104, 1], [115, -10], [150, -34]], [[151, -34], [174, -37]], [[150, -34], [-160, 0], [-118, 34]],
];
// o: { lon0, lat0, R, cx, cy, night, lights, hl, sats:n, satsDead 0..1, belt 0..1, cables 0..1, smoke 0..1, cold 0..1, sun 0..1, spin (deg/s) }
export function space(g, t, cam, o = {}) {
  const M = mood('night'), CX = E.W / 2, cx = o.cx ?? CX, cy = o.cy ?? E.H * V(0.55, 0.5), R = o.R ?? V(420, 400);
  const lon0 = (o.lon0 ?? 30) + (o.spin ?? 2) * t, lat0 = o.lat0 ?? 20;
  let P;
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#02030a', '#060a1c', '#0a1030']); FX.stars(g, t, { count: 380, area: [-E.W, -E.H, E.W * 3, E.H * 3], seed: 21 }); });
  layer(g, cam, 0.6, (g) => {
    if ((o.sun ?? 0.6) > 0) { const sx = cx - R * 1.05, sy = cy - R * 0.55; glow(g, sx, sy, R * 1.2, '#fff3dc', 0.25 * (o.sun ?? 0.6)); FX.lensStreak(g, sx, sy, E.W * 0.9, '#ffe6cc', 0.25 * (o.sun ?? 0.6), 3); }
    const cold = o.cold ?? 0, smoke = o.smoke ?? 0;
    const Mx = { ...M, grass: mix(mix(M.grass, M.wall, 0.4), '#cfe4ff', cold * 0.6), sky: [M.sky[0], mix(M.sky[1], '#1a4a8a', 0.4)], rim: mix(M.rim, '#9a8a7a', smoke) };
    P = globe(g, cx, cy, R, { M: Mx, lon0, lat0, night: o.night ?? 0.7, lights: (o.lights ?? 0.8) * (1 - smoke * 0.7), hl: o.hl || {}, t, lightDir: o.lightDir || [-0.7, 0.35] });
    // cables on the surface
    if ((o.cables ?? 0) > 0) CABLES.forEach((c, ci) => { const pts = []; for (let i = 0; i < c.length - 1; i++) for (let k = 0; k <= 12; k++) { const u = k / 12; let l0 = c[i][0], l1 = c[i + 1][0]; if (Math.abs(l1 - l0) > 180) l1 += l1 < l0 ? 360 : -360; pts.push([lerp(l0, l1, u), lerp(c[i][1], c[i + 1][1], u)]); }
      const n = Math.floor(pts.length * clamp(o.cables * 1.3 - ci * 0.03)); let run = [];
      for (let i = 0; i < n; i++) { const [x, y, z] = P(pts[i][0], pts[i][1]); if (z > 0.05) run.push([x, y]); else { if (run.length > 1) seg(g, run, 3, alpha('#7fe8ff', 0.85)); run = []; } }
      if (run.length > 1) { seg(g, run, 3, alpha('#7fe8ff', 0.85)); const h = run[run.length - 1]; glow(g, h[0], h[1], 20, '#7fe8ff', 0.6); } });
    if (smoke > 0) { g.save(); g.beginPath(); g.arc(cx, cy, R * 1.08, 0, Math.PI * 2); g.arc(cx, cy, R * 0.6, 0, Math.PI * 2, true); g.fillStyle = alpha('#1a1614', 0.55 * smoke); g.fill('evenodd'); g.restore();
      circle(g, cx, cy, R, alpha('#0a0806', 0.35 * smoke)); }
    if ((o.belt ?? 0) > 0) { g.save(); g.translate(cx, cy); g.rotate(-0.35); g.scale(1, 0.32); for (const k of [1.35, 1.5]) ring(g, 0, 0, R * k, R * 0.06, alpha('#ff9ad0', 0.35 * o.belt)); g.restore(); glow(g, cx, cy, R * 1.6, '#ff9ad0', 0.08 * o.belt); }
    // satellites on the high orbit (front half drawn over the globe)
    const n = o.sats ?? 0, dead = o.satsDead ?? 0;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + t * 0.15, ox = Math.cos(a) * R * 1.55, oy = Math.sin(a) * R * 0.45, front = Math.sin(a) > -0.1;
      if (!front && Math.hypot(ox, oy) < R) continue; const off = i / n < dead, x = cx + ox, y = cy + oy - R * 0.1;
      circle(g, x, y, 5, off ? '#3a3a48' : '#e8f4ff'); if (!off) glow(g, x, y, 22, '#bfe8ff', 0.6 * (0.7 + 0.3 * Math.sin(t * 5 + i))); }
    if (n > 0) { g.save(); g.translate(cx, cy - R * 0.1); g.scale(1, 0.29); ring(g, 0, 0, R * 1.55, 1.5, alpha('#bfe8ff', 0.15)); g.restore(); }
  });
  return { CX, M, P, cx, cy, R };
}
