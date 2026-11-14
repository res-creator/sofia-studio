// sets/tram.js — Hiroshima: an empty street in August 1945 with a single tram (no ruins in close-up; only low,
// far silhouettes and poles), warm dusty light; `today` = the city now: tram on a bridge, river, lit high-rises, oleanders.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { oleander } from '../lib.js';

export const tramGround = () => E.H * V(0.8, 0.68);
// o: { today:false, tramX (x of the car's centre), flowers 0..1 }
export function tramStreet(g, t, cam, o = {}) {
  const today = !!o.today, M = mood(today ? 'golden' : 'dusk'), GY = tramGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => {
    backdrop(g, today ? M.sky : M.sky.map((c) => mix(c, '#b08a6a', 0.35)));
    const sx = CX - V(560, 240), sy = GY - V(420, 640); FX.sun(g, sx, sy, 54, '#fff3dc', M.key, 4); FX.godRays(g, sx, sy, { count: 12, angle: 0.2, spread: 1.4, len: 1600, a: 0.05, t });
    if (!today) FX.fog(g, GY - V(500, 700), V(500, 700), '#c8a080', 0.22);
  });
  layer(g, cam, 0.3, (g) => {
    if (today) { FX.skyline(g, { x: -E.W, y: GY - V(160, 220), w: E.W * 3, maxH: V(420, 620), color: shade(M.wall, -0.4), windowColor: alpha(M.practical, 0.7), seed: 13 }); }
    else { const r = rng(4); for (let i = 0; i < 22; i++) { const x = -E.W * 0.5 + i * 160 + r() * 60, h = 40 + r() * 90; g.fillStyle = mix('#5a4038', '#2a1e1e', 0.5); g.fillRect(x, GY - V(140, 200) - h, 60 + r() * 80, h); } }
  });
  layer(g, cam, 0.6, (g) => {
    if (today) { g.fillStyle = linGrad(g, 0, GY - 120, 0, GY + 200, ['#3a4a6a', '#141a2a']); g.fillRect(-E.W, GY - 120, E.W * 3, 400);                  // river
      for (let i = 0; i < 24; i++) seg(g, [[-E.W + i * 160 + Math.sin(t + i) * 12, GY - 60 + (i % 4) * 22], [-E.W + i * 160 + 60 + Math.sin(t + i) * 12, GY - 60 + (i % 4) * 22]], 2, alpha('#ffd8a8', 0.3));
      g.fillStyle = '#0c0c14'; g.fillRect(-E.W, GY - 150, E.W * 3, 34); for (let i = -6; i < 24; i++) seg(g, [[i * 140, GY - 116], [i * 140 + 30, GY + 120]], 16, '#0c0c14'); }  // bridge
    else { g.fillStyle = linGrad(g, 0, GY - 160, 0, GY + 500, ['#4a3a32', '#160f0d']); g.fillRect(-E.W, GY - 160, E.W * 3, E.H); }
    // poles + overhead wire
    for (let i = -4; i < 16; i++) { const px = i * 340 + 80; seg(g, [[px, GY - (today ? 150 : 20)], [px, GY - V(560, 760)]], 8, '#0c0a0e'); seg(g, [[px - 50, GY - V(540, 740)], [px + 50, GY - V(540, 740)]], 5, '#0c0a0e'); }
    seg(g, [[-E.W, GY - V(500, 700)], [E.W * 2.5, GY - V(500, 700)]], 2.5, '#0c0a0e');
    if (!today) { for (const dy of [0, 26]) seg(g, [[-E.W, GY - 6 + dy], [E.W * 2.5, GY - 6 + dy]], 4, alpha('#d8b890', 0.45)); for (let i = -20; i < 60; i++) seg(g, [[i * 50, GY - 10], [i * 50 - 6, GY + 30]], 6, alpha('#000', 0.35)); }
    if (o.flowers) for (let i = 0; i < 26; i++) oleander(g, -E.W * 0.2 + i * 90 + (i % 3) * 20, GY + V(70, 120) + (i % 4) * 22, 1.4, o.flowers, i);
  });
  return { GY, CX, M, wireY: GY - V(500, 700), railY: today ? GY - 150 : GY + 6 };
}
// the tram car (depth 1). inside(g, wx, wy, ww, wh) draws passengers/girls behind the windows. Returns window rects.
export function tramCar(g, x, railY, s = 1, t = 0, o = {}) {
  const w = 760 * s, h = 300 * s, top = railY - h - 26 * s, green = o.color || '#3d5a4a', cream = '#d8c8a0';
  g.save();
  rr(g, x - w / 2, top, w, h, 30 * s); g.fillStyle = shade(green, -0.35); g.fill();
  g.fillStyle = shade(cream, -0.35); g.fillRect(x - w / 2, top + h * 0.55, w, h * 0.12);
  seg(g, [[x - 60 * s, top], [x - 140 * s, top - 160 * s], [x + 40 * s, top - 180 * s]], 5 * s, '#0c0a0e');      // pantograph to wire
  const wins = []; for (let i = 0; i < 6; i++) { const wx = x - w / 2 + 50 * s + i * 112 * s, wy = top + 40 * s, ww = 86 * s, wh = 110 * s; wins.push([wx, wy, ww, wh]);
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, ['#ffe2b0', '#c88a5a']); g.fillRect(wx, wy, ww, wh); }
  if (o.inside) { g.save(); g.beginPath(); wins.forEach(([a, b, c, d]) => g.rect(a, b, c, d)); g.clip(); o.inside(g, wins); g.restore(); }
  wins.forEach(([a, b, c, d]) => { g.fillStyle = alpha('#000', 0.25); g.fillRect(a, b + d - 6 * s, c, 6 * s); glow(g, a + c / 2, b + d / 2, 90 * s, '#ffd59a', 0.15); });
  g.fillStyle = shade(green, -0.55); g.fillRect(x - w / 2, railY - 30 * s, w, 14 * s);
  for (const dx of [-0.3, 0.3]) { circle(g, x + dx * w, railY - 10 * s, 22 * s, '#08070a'); }
  glow(g, x + w / 2 - 10 * s, top + h * 0.75, 80 * s, '#ffe8b0', 0.5);
  g.restore(); return wins;
}
