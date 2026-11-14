// sets/arctic.js — 1995, a northern island: aurora curtains over snowy hills, a small research rocket climbing
// (a dot with a flame and a thin trail — never a weapon close-up). Key = the aurora.
import { E, V, S, mood, layer, backdrop, seg, circle, glow, alpha, shade, mix, rng, clamp, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const arcticGround = () => E.H * V(0.8, 0.68);
// o: { rocket: null | 0..1 (climb progress), aurora 0..1 }
export function arctic(g, t, cam, o = {}) {
  const M = mood('night'), GY = arcticGround(), CX = E.W / 2, au = o.aurora ?? 1;
  layer(g, cam, 0.1, (g) => {
    backdrop(g, ['#020614', '#06142a', '#0c2440']); FX.stars(g, t, { count: 240, area: [-E.W, -E.H, E.W * 3, GY], seed: 13 });
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let c = 0; c < 4; c++) { const base = GY - V(420, 700) - c * 70, colA = c % 2 ? '#5cffb0' : '#7fe8c8';
      for (let i = 0; i < 70; i++) { const x = -E.W * 0.5 + i * 45, wav = Math.sin(i * 0.18 + t * 0.6 + c) * 60 + Math.sin(i * 0.05 - t * 0.3) * 90, y = base + wav, h = V(260, 380) * (0.6 + 0.4 * Math.sin(i * 0.3 + c + t));
        g.fillStyle = linGrad(g, 0, y - h, 0, y, [alpha(c === 3 ? '#c08aff' : colA, 0), alpha(colA, 0.05 * au), alpha(colA, 0.16 * au)]); g.fillRect(x, y - h, 46, h); } }
    g.restore();
  });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY - V(120, 180), amp: 90, color: '#1a2a44', seed: 7 }); FX.hills(g, { y: GY - V(40, 60), amp: 50, color: '#2a3c5a', seed: 11 }); });
  layer(g, cam, 0.6, (g) => {
    if (o.rocket != null) { const k = clamp(o.rocket), x0 = CX + V(240, 120), y0 = GY - V(60, 80), x = x0 + k * 120, y = y0 - k * V(900, 1300);
      g.save(); g.globalCompositeOperation = 'lighter'; seg(g, [[x0, y0], [x0 + k * 60, y0 - k * V(450, 650)], [x, y]], 5, alpha('#ffe6c0', 0.35)); g.restore();
      circle(g, x, y, 5, '#e8eef8'); glow(g, x, y + 10, 50, '#ffcf8a', 0.9); glow(g, x, y + 10, 140, '#ff9a4a', 0.3); }
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 500, ['#c8d8f0', '#5a6a8a']); g.beginPath(); g.moveTo(-E.W, GY); for (let x = -E.W; x < E.W * 2.5; x += 90) g.lineTo(x, GY - 20 + Math.sin(x * 0.006) * 18); g.lineTo(E.W * 2.5, E.H * 2); g.lineTo(-E.W, E.H * 2); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#5cffb0', 0.06 * au); g.fillRect(-E.W, GY - 30, E.W * 3, 300); g.restore();
    for (let i = 0; i < 8; i++) FX.pine(g, -E.W * 0.2 + i * 330, GY - 10, 0.5, '#0a1220');
  });
  FX.snow(g, t, { count: 90, speed: 40, color: '#e8f0ff' });
  return { GY, CX, M };
}
