// sets/field.js — a wheat field. `grey` 0..1: normal golden evening → grey sunless sky (nuclear-winter mood);
// `frost` 0..1: hoar frost on the ears in July; elevator and tractor in the distance. Key = low sun through clouds.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { truck } from './port.js';

export const fieldGround = () => E.H * V(0.8, 0.68);
// o: { grey 0..1, frost 0..1, wind 0..1, elevator:true, tractor: x 0..1 | null, sun 0..1 (visible) }
export function field(g, t, cam, o = {}) {
  const Mg = mood('golden'), Ms = mood('storm'), k = o.grey ?? 0, GY = fieldGround(), CX = E.W / 2, fr = o.frost ?? 0, wind = o.wind ?? 0.6;
  const sky = Mg.sky.map((c, i) => mix(c, Ms.sky[Math.min(i, Ms.sky.length - 1)], k));
  const wheat = mix(mix('#d9a84a', '#7a7a6a', k), '#cfe4ff', fr * 0.6), stem = mix('#8a6a2a', '#4a4a44', k);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, sky);
    const sun = (o.sun ?? 1) * (1 - k * 0.85); if (sun > 0) { const sx = CX + V(520, 220), sy = GY - V(330, 520); FX.sun(g, sx, sy, 56, '#fff3dc', Mg.key, 5 * sun); FX.godRays(g, sx, sy, { count: 14, angle: Math.PI * 0.6, spread: 1.4, len: 1500, a: 0.06 * sun, t }); }
    FX.clouds(g, { y: GY - V(700, 1100), h: 200, color: mix('#ffd9b0', '#6a6a78', k), a: 0.25 + k * 0.4, seed: 2, count: 8 });
  });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - V(90, 140), amp: 30, color: mix('#8a6a3a', '#3a3a3e', k), seed: 5 }); FX.fog(g, GY - V(160, 220), 160, mix(Mg.fog, Ms.fog, k), 0.25 + k * 0.2);
    if (o.elevator !== false) { const ex = CX - V(600, 280); for (let i = 0; i < 4; i++) { rr(g, ex + i * 44, GY - V(330, 420), 40, V(240, 320), 16); g.fillStyle = mix('#3a2a24', '#2a2a30', k); g.fill(); } g.fillStyle = mix('#2a1e1a', '#222228', k); g.fillRect(ex + 50, GY - V(400, 500), 70, 80); } });
  layer(g, cam, 0.55, (g) => { g.fillStyle = linGrad(g, 0, GY - V(100, 140), 0, GY + 200, [mix('#b08a3a', '#4a4a44', k), mix('#5a3a1a', '#22221f', k)]); g.fillRect(-E.W, GY - V(100, 140), E.W * 3, E.H);
    if (o.tractor != null) truck(g, CX - V(500, 300) + o.tractor * V(1000, 600), GY - V(70, 100), 0.35, Mg); });
  // foreground ears (depth 1.2), swaying
  layer(g, cam, 1.2, (g) => {
    const r = rng(9);
    for (let i = 0; i < 150; i++) { const x = -E.W * 0.3 + i * 18 + r() * 12, h = V(220, 300) + r() * 140, y0 = E.H + 40, sw = Math.sin(t * 1.6 * wind + x * 0.01) * 18 * wind;
      const tx = x + sw, ty = y0 - h; seg(g, [[x, y0], [tx, ty]], 3, stem);
      for (let j = 0; j < 6; j++) { const yy = ty + j * 11; g.fillStyle = wheat; g.beginPath(); g.ellipse(tx - 5, yy, 5, 9, -0.5, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(tx + 5, yy, 5, 9, 0.5, 0, Math.PI * 2); g.fill(); }
      if (fr > 0 && i % 3 === 0) { glow(g, tx, ty + 20, 14, '#e8f4ff', 0.5 * fr); circle(g, tx + 3, ty + 8, 1.6, alpha('#ffffff', fr)); } }
  });
  if (fr > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#9fc8ff', 0.08 * fr); g.fillRect(0, 0, E.W, E.H); g.restore(); }
  return { GY, CX, M: k > 0.5 ? Ms : Mg };
}
