// sets/port.js — a sea port at dusk: tanker at the berth, gantry cranes, oil tanks, grain elevator, truck with grain.
// Key = low sun over the sea + crane floodlights. `stopped` 0..1 turns the port idle (lights off, cranes frozen, no trucks).
import { E, V, S, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const portGround = () => E.H * V(0.8, 0.68);
// o: { stopped 0..1, truck: x progress 0..1, nz (NZ-ish green hills behind), tanker:true }
export function port(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = portGround(), CX = E.W / 2, st = o.stopped ?? 0, tt = t * (1 - st);
  const ink = '#0a0a14', seaY = GY - V(120, 160);
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX - V(520, 200), seaY - V(90, 160), 60, '#fff3dc', M.key, 5); FX.clouds(g, { y: seaY - V(560, 900), h: 130, color: '#ffd9c0', a: 0.18, seed: 4 }); });
  layer(g, cam, 0.25, (g) => {
    if (o.nz) FX.hills(g, { y: seaY - 30, amp: 70, color: mix(M.grass, M.sky[0], 0.5), seed: 9 });
    g.fillStyle = linGrad(g, 0, seaY, 0, GY, [mix(M.sky[2], '#2a3050', 0.5), '#141a30']); g.fillRect(-E.W, seaY, E.W * 3, GY - seaY + 10);
    FX.lensStreak(g, CX - V(520, 200), seaY + 6, E.W * 0.8, '#ffd8a8', 0.3, 3);
    for (let i = 0; i < 30; i++) seg(g, [[CX - V(520, 200) - 160 + (i % 6) * 60 + Math.sin(t + i) * 10, seaY + 12 + i * 4], [CX - V(520, 200) - 120 + (i % 6) * 60 + Math.sin(t + i) * 10, seaY + 12 + i * 4]], 2, alpha('#ffd8a8', 0.35));
  });
  layer(g, cam, 0.5, (g) => {
    // oil tanks + grain elevator (far right)
    for (let i = 0; i < 4; i++) { const tx = CX + V(520, 250) + i * 150; g.fillStyle = shade(M.wall, -0.5); g.fillRect(tx, seaY - 90, 120, 90); g.beginPath(); g.ellipse(tx + 60, seaY - 90, 60, 14, 0, 0, Math.PI * 2); g.fill(); }
    const ex = CX + V(1150, 500); for (let i = 0; i < 5; i++) { rr(g, ex + i * 52, seaY - 330, 48, 330, 20); g.fillStyle = shade(M.wall, -0.4 - (i % 2) * 0.08); g.fill(); }
    g.fillStyle = shade(M.wall, -0.5); g.fillRect(ex + 60, seaY - 420, 90, 100);
    // gantry cranes with floodlights
    for (let i = 0; i < 3; i++) { const cx = CX - V(450, 260) + i * V(420, 260), h = V(520, 700), arm = (1 - st) * Math.sin(tt * 0.4 + i) * 0.04;
      seg(g, [[cx - 60, GY - 60], [cx - 40, GY - h]], 12, ink); seg(g, [[cx + 60, GY - 60], [cx + 40, GY - h]], 12, ink);
      g.save(); g.translate(cx, GY - h); g.rotate(arm); seg(g, [[-200, 0], [320, 0]], 14, ink); seg(g, [[160 + Math.sin(tt * 0.6 + i) * 60, 0], [160 + Math.sin(tt * 0.6 + i) * 60, 160]], 3, ink); g.restore();
      const on = 1 - st; circle(g, cx, GY - h - 14, 7, alpha('#ffe8b0', 0.3 + 0.7 * on)); if (on > 0) { glow(g, cx, GY - h - 14, 70, '#ffe8b0', 0.5 * on); FX.lightCone(g, cx, GY - h, { angle: Math.PI / 2, spread: 0.35, len: h, color: '#ffe8b0', a: 0.08 * on }); }
      circle(g, cx + 320, GY - h, 6, '#ff5a4a'); }
    // tanker at the berth
    if (o.tanker !== false) { const tx = CX - V(700, 520), tw = V(1350, 900);
      g.fillStyle = ink; g.beginPath(); g.moveTo(tx, GY - 150); g.lineTo(tx + tw, GY - 150); g.lineTo(tx + tw - 60, GY - 60); g.lineTo(tx + 40, GY - 60); g.closePath(); g.fill();
      g.fillStyle = '#4a1a1a'; g.fillRect(tx + 40, GY - 82, tw - 100, 18);
      rr(g, tx + 40, GY - 270, 170, 120, 6); g.fillStyle = ink; g.fill(); for (let k = 0; k < 4; k++) g.fillStyle = alpha(M.practical, 0.25 + 0.75 * (1 - st) * (k % 2)), g.fillRect(tx + 60 + k * 36, GY - 245, 22, 14);
      seg(g, [[tx + 150, GY - 270], [tx + 150, GY - 330]], 10, ink); for (let k = 0; k < 6; k++) seg(g, [[tx + 280 + k * 160, GY - 150], [tx + 280 + k * 160, GY - 180]], 6, ink);
      seg(g, [[tx + 260, GY - 176], [tx + tw - 80, GY - 176]], 4, ink); }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 60, 0, GY + 500, ['#1a1824', '#05050a']); g.fillRect(-E.W, GY - 60, E.W * 3, E.H * 2);
    seg(g, [[-E.W, GY - 60], [E.W * 2, GY - 60]], 4, alpha(M.rim, 0.3));
    for (let i = -6; i < 20; i++) { g.fillStyle = '#05050a'; g.fillRect(i * 140, GY - 80, 22, 24); }                            // bollards
    if (o.truck != null) truck(g, -400 + (E.W + 800) * o.truck * (1 - st * 0.7), GY + 30, 1, M);
  });
  return { GY, CX, M, seaY };
}
export function truck(g, x, y, s = 1, M) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#0a0a12'; g.fillRect(-260, -150, 330, 120); g.fillStyle = '#c9a85a'; g.beginPath(); g.moveTo(-250, -150); g.quadraticCurveTo(-100, -210, 60, -150); g.fill();   // grain heap
  rr(g, 80, -160, 130, 130, 14); g.fillStyle = '#0a0a12'; g.fill(); g.fillStyle = alpha('#ffd59a', 0.6); g.fillRect(150, -145, 50, 40);
  for (const wx of [-200, -80, 150]) { circle(g, wx, -24, 30, '#050508'); circle(g, wx, -24, 12, '#2a2a34'); }
  glow(g, 210, -60, 80, '#ffe8b0', 0.5); g.restore();
}
