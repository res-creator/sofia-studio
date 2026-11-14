// sets/cockpit.js — bomber cockpit at night, seen from behind the two pilots: windscreen with stars and passing
// clouds, amber instrument panel (key light), overhead hatch (open = sky + wind). Used for 1961 (Goldsboro) and 1980 (engines start).
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const pitGround = () => E.H * V(0.86, 0.72);
// o: { warn 0..1 (red master caution), hatch 0..1, ground (parked on a night runway instead of flying), speed }
export function cockpit(g, t, cam, o = {}) {
  const M = mood('night'), GY = pitGround(), CX = E.W / 2, red = S().ui.accent, amber = '#ffb84a';
  const warn = o.warn ?? 0, pulse = warn * (0.5 + 0.5 * Math.sin(t * 8)), sp = o.ground ? 0 : (o.speed ?? 1);
  const frame = '#07080d', panelY = GY - V(250, 420);
  layer(g, cam, 0.2, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H * 0.3, 0, panelY, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, panelY + E.H);
    FX.stars(g, t, { count: 160, area: [-E.W * 0.5, -E.H * 0.3, E.W * 2, panelY], seed: 9 });
    if (o.ground) { FX.skyline(g, { x: -E.W, y: panelY - 20, w: E.W * 3, maxH: 60, color: '#05060c', windowColor: alpha(M.practical, 0.6), seed: 4 });
      for (let i = 0; i < 18; i++) { const x = -E.W * 0.2 + i * 160; circle(g, x, panelY - 10, 4, i % 3 ? '#9fd0ff' : amber); glow(g, x, panelY - 10, 24, '#9fd0ff', 0.4); } }
    else { const r = rng(5); for (let i = 0; i < 7; i++) { const cx = ((r() * E.W * 2 - t * 260 * sp * (0.6 + r())) % (E.W * 2) + E.W * 2) % (E.W * 2) - E.W * 0.3, cy = panelY - 60 - r() * V(380, 700);
      g.fillStyle = alpha('#8a96c8', 0.12); g.beginPath(); g.ellipse(cx, cy, 260 + r() * 200, 40 + r() * 30, 0, 0, Math.PI * 2); g.fill(); } }
  });
  layer(g, cam, 0.6, (g) => {
    // windscreen frame: thick struts + ceiling; overhead hatch
    g.fillStyle = frame; g.fillRect(-E.W, -E.H, E.W * 3, V(110, 200) + E.H);
    for (const sx of [CX - V(760, 420), CX, CX + V(760, 420)]) { g.beginPath(); g.moveTo(sx - 30, V(110, 200)); g.lineTo(sx + 30, V(110, 200)); g.lineTo(sx + 50 * Math.sign(sx - CX || 0.0001) + 40, panelY); g.lineTo(sx + 50 * Math.sign(sx - CX || 0.0001) - 40, panelY); g.closePath(); g.fill(); }
    g.fillRect(-E.W, panelY - 10, E.W * 3, 30);
    const hk = o.hatch ?? 0; if (hk > 0) { const hx = CX - 160, hw = 320; g.fillStyle = linGrad(g, 0, 0, 0, V(110, 200), [M.sky[0], M.sky[1]]); g.fillRect(hx, 0, hw * hk, V(110, 200)); FX.stars(g, t, { count: 20, area: [hx, 0, hw * hk, V(110, 200)], seed: 2 }); }
    seg(g, [[-E.W, V(110, 200)], [E.W * 2, V(110, 200)]], 4, alpha(M.rim, 0.25));
    // instrument panel (key)
    g.fillStyle = linGrad(g, 0, panelY, 0, E.H, ['#14121a', '#050508']); g.fillRect(-E.W, panelY + 10, E.W * 3, E.H);
    const r = rng(8);
    for (let i = 0; i < 22; i++) { const dx = CX - V(900, 520) + i * V(86, 50), dy = panelY + 70 + (i % 2) * 70, on = !(o.ground && i % 4 === 0 && t < 0.6);
      circle(g, dx, dy, 26, '#0c0c12'); ring(g, dx, dy, 26, 3, alpha(amber, 0.6)); if (on) { glow(g, dx, dy, 50, amber, 0.18); const a = -2.4 + r() * 2 + Math.sin(t * (0.5 + r()) + i) * 0.2 * (1 + warn); seg(g, [[dx, dy], [dx + Math.cos(a) * 20, dy + Math.sin(a) * 20]], 3, amber); } }
    for (let i = 0; i < 12; i++) { const lx = CX - V(500, 300) + i * V(90, 54), ly = panelY + 30; const lc = i === 5 && warn > 0 ? red : i % 3 ? '#7fe8c8' : amber; circle(g, lx, ly, 6, lc); glow(g, lx, ly, 22, lc, 0.4); }
    if (warn > 0) { circle(g, CX, panelY + 34, 18, mix('#300', red, pulse)); glow(g, CX, panelY + 34, 260, red, 0.5 * pulse); }
    glow(g, CX, panelY + 60, V(900, 600), amber, 0.1);
  });
  return { GY, CX, M, panelY, amber, red, pulse, seats: [CX - V(380, 230), CX + V(380, 230)] };
}
// pilot seat back (drawn in front of the seated figure at depth 1)
export function seatBack(g, x, panelY, s = 1) {
  rr(g, x - 70 * s, panelY - 120 * s, 140 * s, 360 * s, 26 * s); g.fillStyle = '#0a0a10'; g.fill();
  g.fillStyle = alpha('#ffb84a', 0.25); g.fillRect(x - 70 * s, panelY - 120 * s, 140 * s, 3);
}
