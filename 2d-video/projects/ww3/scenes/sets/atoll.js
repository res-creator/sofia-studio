// sets/atoll.js — Bikini atoll, 1946 and today: lagoon, ring of sand with palms, a small white church, outrigger
// boats. Key = sun (day/golden). `empty` = no village (today); `boats` 0..1 = boats leaving the shore.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp, poly } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { palm } from '../lib.js';

export const atollGround = () => E.H * V(0.8, 0.68);
// o: { golden:false, empty:false, church:true, boats: null | 0..1, beach:false (camera at the waterline) }
export function atoll(g, t, cam, o = {}) {
  const M = mood(o.golden ? 'golden' : 'day'), GY = atollGround(), CX = E.W / 2, lagY = GY - V(170, 240);
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); const sx = CX + V(600, 260), sy = lagY - V(420, 700); FX.sun(g, sx, sy, 50, '#fff8e8', M.key, 4); FX.clouds(g, { y: lagY - V(520, 900), h: 120, color: '#ffffff', a: 0.25, seed: 8, count: 7 }); });
  layer(g, cam, 0.25, (g) => {
    g.fillStyle = linGrad(g, 0, lagY, 0, GY, [mix('#3fb0c0', M.sky[1], 0.3), '#1a6a8a']); g.fillRect(-E.W, lagY, E.W * 3, GY - lagY + 40);
    for (let i = 0; i < 40; i++) seg(g, [[-E.W + (i * 97) % (E.W * 3) + Math.sin(t * 0.8 + i) * 14, lagY + 10 + (i % 7) * 18], [-E.W + (i * 97) % (E.W * 3) + 50 + Math.sin(t * 0.8 + i) * 14, lagY + 10 + (i % 7) * 18]], 2, alpha('#ffffff', 0.35));
    // far islets of the ring
    for (let i = 0; i < 8; i++) { const ix = -E.W * 0.4 + i * 420; g.fillStyle = '#e8d8a8'; g.beginPath(); g.ellipse(ix, lagY + 4, 140, 10, 0, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 3; k++) palm(g, ix - 60 + k * 50, lagY + 4, 0.18, '#1a3a3a', t, i * 3 + k); }
    if (o.boats != null) for (let i = 0; i < 4; i++) { const bx = CX - V(200, 100) + i * 150 - o.boats * V(900, 500) * (0.7 + i * 0.15), by = lagY + 60 + i * 24 - o.boats * 40, s = 1 - o.boats * 0.5;
      g.fillStyle = '#1a1414'; g.beginPath(); g.moveTo(bx - 70 * s, by); g.lineTo(bx + 70 * s, by); g.lineTo(bx + 50 * s, by + 16 * s); g.lineTo(bx - 50 * s, by + 16 * s); g.closePath(); g.fill();
      poly(g, [[bx, by - 4], [bx, by - 120 * s], [bx + 60 * s, by - 10]], '#e8dcc0'); seg(g, [[bx - 40 * s, by + 26 * s], [bx + 40 * s, by + 26 * s]], 3, '#1a1414'); }
  });
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 60, 0, GY + 400, ['#e8d8a8', '#a89060']); g.fillRect(-E.W, GY - 60, E.W * 3, E.H);
    g.fillStyle = mix(M.grass, '#3a6a3a', 0.4); g.beginPath(); g.moveTo(-E.W, GY - 40); for (let x = -E.W; x < E.W * 2.5; x += 80) g.lineTo(x, GY - 52 + Math.sin(x * 0.01) * 10); g.lineTo(E.W * 2.5, E.H * 2); g.lineTo(-E.W, E.H * 2); g.fill();
    if (!o.empty && o.church !== false) { const cx = CX + V(420, 200), cy = GY - 50;
      g.fillStyle = '#efe8da'; g.fillRect(cx - 120, cy - 170, 240, 170); poly(g, [[cx - 140, cy - 170], [cx, cy - 260], [cx + 140, cy - 170]], '#8a5a4a');
      g.fillStyle = '#efe8da'; g.fillRect(cx - 24, cy - 330, 48, 90); poly(g, [[cx - 30, cy - 330], [cx, cy - 380], [cx + 30, cy - 330]], '#8a5a4a');
      g.fillStyle = '#3a2a22'; g.fillRect(cx - 26, cy - 90, 52, 90); for (const dx of [-80, 60]) { g.fillStyle = '#6a8aa0'; g.fillRect(cx + dx, cy - 130, 24, 40); } }
    for (const [px, s, sd] of [[-E.W * 0.1, 0.9, 1], [CX - V(700, 360), 1.1, 2], [CX - V(380, 200), 0.75, 3], [CX + V(800, 380), 1.0, 4], [E.W * 1.1, 1.2, 5]]) palm(g, px, GY - 40, s, '#0e1612', t, sd);
  });
  return { GY: GY - 40, CX, M, lagY };
}
