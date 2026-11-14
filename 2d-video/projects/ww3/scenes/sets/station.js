// sets/station.js — the early-warning station in a pine forest outside Moscow. Night (moon, warm windows) or dawn.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const stationGround = () => E.H * V(0.8, 0.68);
function pines(g, y, n, h, color, seed, x0 = -E.W, x1 = E.W * 2) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = lerpN(x0, x1, (i + r() * 0.8) / n), s = h * (0.7 + r() * 0.6); FX.pine(g, x, y + r() * 10, s / 220, color); }
}
const lerpN = (a, b, k) => a + (b - a) * k;
export function station(g, t, cam, o = {}) {
  const dawn = !!o.dawn, M = mood(dawn ? 'golden' : 'night'), GY = stationGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.35), dark = shade(M.dark, -0.2);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, dawn ? [shade(M.sky[0], -0.3), M.sky[0], M.sky[1], M.sky[2]] : M.sky);
    if (!dawn) { FX.stars(g, t, { count: 220, area: [-E.W, -E.H, E.W * 3, GY + E.H * 0.6] }); FX.moon(g, CX + V(560, 260), GY - V(640, 1100), 44); }
    else { const sx = CX + V(720, 300), sy = GY - V(400, 520) - (o.sunRise ?? 0) * 110; FX.sun(g, sx, sy, 70, '#fff3dc', M.key, 6); FX.godRays(g, sx, sy, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 1.7, len: 1800, a: 0.07, t }); }
    FX.clouds(g, { y: GY - V(700, 1200), h: 160, color: dawn ? '#ffd9b0' : '#9aa8e0', a: dawn ? 0.22 : 0.06, seed: 6 });
  });
  layer(g, cam, 0.3, (g) => { pines(g, GY - V(150, 200), 60, 300, mix(M.sky[1], dark, 0.6), 3); FX.fog(g, GY - V(260, 360), 220, M.fog, dawn ? 0.35 : 0.25); });
  layer(g, cam, 0.55, (g) => {
    pines(g, GY - 40, 34, 420, mix(M.sky[0], dark, 0.82), 9);
    // antenna mast + dish
    const mx = CX + V(470, 260);
    seg(g, [[mx, GY - 40], [mx, GY - V(560, 760)]], 10, shade(wall, -0.3));
    for (let k = 0; k < 9; k++) { const yy = GY - 40 - k * V(58, 80); seg(g, [[mx - 26, yy], [mx + 26, yy - V(58, 80)]], 3, shade(wall, -0.3)); seg(g, [[mx + 26, yy], [mx - 26, yy - V(58, 80)]], 3, shade(wall, -0.3)); }
    g.save(); g.translate(mx, GY - V(560, 760)); g.rotate(-0.5 + 0.08 * Math.sin(t * 0.4)); g.fillStyle = shade(wall, 0.05); g.beginPath(); g.ellipse(0, 0, 90, 34, 0, Math.PI, Math.PI * 2); g.fill(); seg(g, [[0, 0], [0, -60]], 4, shade(wall, 0.1)); g.restore();
    circle(g, mx, GY - V(600, 800), 7, '#ff5a4a'); glow(g, mx, GY - V(600, 800), 50, '#ff5a4a', 0.5 + 0.4 * Math.sin(t * 3));
  });
  layer(g, cam, 0.75, (g) => {
    // low concrete building
    const bx = CX - V(520, 420), bw = V(900, 760), bh = V(230, 300), by = GY - bh;
    g.fillStyle = linGrad(g, 0, by, 0, GY, [shade(wall, 0.08), wall]); g.fillRect(bx, by, bw, bh);
    g.fillStyle = shade(wall, -0.4); g.fillRect(bx - 16, by - 18, bw + 32, 22);
    for (let i = 0; i < 6; i++) {
      const wx = bx + 60 + i * (bw - 120) / 6, ww = (bw - 120) / 6 - 30, wy = by + 60, wh = bh * 0.38, lit = i === 2 || i === 3 || i === 5;
      g.fillStyle = lit ? linGrad(g, 0, wy, 0, wy + wh, [M.practical, shade(M.practical, -0.5)]) : shade(wall, -0.5); g.fillRect(wx, wy, ww, wh);
      g.fillStyle = shade(wall, -0.55); g.fillRect(wx + ww / 2 - 3, wy, 6, wh);
      if (lit) { glow(g, wx + ww / 2, wy + wh / 2, 150, M.practical, dawn ? 0.15 : 0.35); FX.pool(g, wx + ww / 2, GY + 30, 140, 24, M.practical, dawn ? 0.06 : 0.18); }
      if (o.silhouette && i === 3) { circle(g, wx + ww * 0.5, wy + wh * 0.55, 13, '#0a0c16'); g.fillStyle = '#0a0c16'; g.fillRect(wx + ww * 0.5 - 18, wy + wh * 0.68, 36, wh * 0.4); }
    }
    FX.door(g, { x: bx + bw - 120, y: GY, w: 70, h: 150, color: shade(wall, -0.2), open: 0, light: M.practical });
    FX.lampPost(g, bx + bw + 60, GY, 260, { light: M.practical, a: dawn ? 0.05 : 0.2 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 4, 0, GY + 500, [shade(M.floor, -0.1), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY - 4, E.W * 3, E.H * 2);
    seg(g, [[-E.W, GY + 40], [E.W * 2, GY + 40]], 2, alpha(M.rim, 0.12));
    for (let i = -8; i < 18; i++) seg(g, [[i * 160, GY + 26], [i * 160, GY - 40]], 3, alpha(shade(wall, -0.2), 0.9));      // fence posts
    seg(g, [[-E.W, GY - 30], [E.W * 2, GY - 30]], 2, alpha(shade(wall, -0.2), 0.9)); seg(g, [[-E.W, GY - 10], [E.W * 2, GY - 10]], 2, alpha(shade(wall, -0.2), 0.9));
  });
  return { GY, CX, M };
}
