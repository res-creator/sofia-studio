// sets/ocean.js — underwater: the hunted sub with ships above and flashes of training charges (1962), the seabed
// with a cable as thin as a garden hose, Bikini's crater reef with corals, fish and sharks. Key = light from the surface.
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { subHull } from './sub.js';

export const seaGround = () => E.H * V(0.86, 0.74);
// o: { mode:'deep'|'cable'|'reef', ships:n, flashes:[t0,…] (seconds, x spread), sub:{x,y,s,tilt}, dawn 0..1 (lighter water), fish:n, sharks:n }
export function ocean(g, t, cam, o = {}) {
  const M = mood('night'), GY = seaGround(), CX = E.W / 2, mode = o.mode || 'deep', dawn = o.dawn ?? (mode === 'reef' ? 0.6 : 0);
  const top = mix('#0f4a5e', '#3fa0b0', dawn), mid = mix('#062433', '#10506a', dawn), deep = mix('#020a12', '#06263a', dawn);
  const surfY = -E.H * 0.1 + V(0, -200);
  layer(g, cam, 0.15, (g) => {
    g.fillStyle = linGrad(g, 0, surfY, 0, GY + 300, [top, mid, deep]); g.fillRect(-E.W * 1.5, surfY - E.H, E.W * 4, E.H * 3);
    // surface shimmer + god rays
    for (let i = 0; i < 40; i++) { const x = -E.W + i * 120 + Math.sin(t * 0.9 + i) * 30; seg(g, [[x, surfY + 4], [x + 70, surfY + 6]], 3, alpha('#bff2ff', 0.25)); }
    FX.godRays(g, CX + V(200, 100), surfY - 100, { count: 12, angle: Math.PI / 2, spread: 0.9, len: E.H * 1.4, a: 0.05 + dawn * 0.05, t, color: '#bff2ff' });
  });
  layer(g, cam, 0.3, (g) => {
    // ships at the surface (dark hulls from below)
    const n = o.ships ?? 0, r = rng(3);
    for (let i = 0; i < n; i++) { const sx = CX - V(700, 400) + i * V(560, 380) + Math.sin(t * 0.2 + i) * 20, w = 300 + r() * 120;
      g.fillStyle = '#03070c'; g.beginPath(); g.moveTo(sx - w / 2, surfY + 10); g.lineTo(sx + w / 2, surfY + 10); g.lineTo(sx + w * 0.38, surfY + 52); g.lineTo(sx - w * 0.42, surfY + 46); g.closePath(); g.fill();
      FX.pool(g, sx, surfY + 6, w * 0.7, 18, '#bff2ff', 0.1); }
    // training charges: white flash + expanding ring + bubbles (no damage shown)
    (o.flashes || []).forEach((t0, i) => { const k = t - t0; if (k < 0 || k > 1.6) return; const fx = CX - V(400, 220) + ((i * 470) % V(1100, 700)), fy = GY - V(520, 820) + ((i * 97) % 140);
      glow(g, fx, fy, 260 * (1 - k / 1.6) + 40, '#e8fbff', 0.9 * (1 - k / 1.6)); ring(g, fx, fy, 30 + k * 420, 6 * (1 - k / 1.6) + 1, alpha('#e8fbff', 0.6 * (1 - k / 1.6))); });
  });
  layer(g, cam, 0.6, (g) => {
    if (o.sub) subHull(g, o.sub.x ?? CX, o.sub.y ?? GY - V(330, 520), o.sub.s ?? 0.9, { tilt: o.sub.tilt || 0, rim: mix('#6fb0c8', '#ffd6a8', dawn) });
    // seabed
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 300, [mix('#10222a', '#4a5a4a', dawn * 0.6), '#020608']); g.beginPath(); g.moveTo(-E.W, GY + 400);
    for (let x = -E.W; x <= E.W * 2.5; x += 60) g.lineTo(x, GY + Math.sin(x * 0.004) * 26 + Math.sin(x * 0.013) * 10); g.lineTo(E.W * 2.5, GY + 400); g.closePath(); g.fill();
    if (mode === 'cable') { const cy = (x) => GY + 20 + Math.sin(x * 0.003) * 14; const pts = []; for (let x = -E.W; x <= E.W * 2.5; x += 30) pts.push([x, cy(x)]);
      seg(g, pts, o.cableW ?? 14, '#0b0c10'); seg(g, pts.map(([x, y]) => [x, y - 4]), 3, alpha('#9fd8e8', 0.45)); glow(g, CX, GY + 20, 300, '#9fd8e8', 0.06); }
    if (mode === 'reef') reef(g, t, GY, o);
  });
  // particles: drifting plankton / bubbles
  const r = rng(11); for (let i = 0; i < 70; i++) { const x = (r() * E.W * 1.4 - E.W * 0.2 + Math.sin(t * 0.3 + i) * 20), y = ((r() * E.H - t * (10 + r() * 30)) % E.H + E.H) % E.H; circle(g, x, y, 1 + r() * 2.2, alpha('#cff6ff', 0.25 + 0.25 * r())); }
  return { GY, CX, M, surfY };
}
function reef(g, t, GY, o) {
  const r = rng(21), cols = ['#ff8a6a', '#ffb27a', '#e86a9a', '#7fd6c0', '#c98aff'];
  for (let i = 0; i < 26; i++) { const x = -E.W * 0.3 + i * 110 + r() * 60, h = 80 + r() * 160, c = mix(cols[i % cols.length], '#0a1a22', 0.35);
    const br = (x0, y0, len, a, d) => { if (d > 3) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; seg(g, [[x0, y0], [x1, y1]], 12 - d * 3, c); br(x1, y1, len * 0.7, a - 0.5 + Math.sin(t * 0.7 + i) * 0.03, d + 1); br(x1, y1, len * 0.7, a + 0.45, d + 1); };
    if (i % 3) br(x, GY + 10, h * 0.45, -Math.PI / 2, 0); else { g.fillStyle = c; g.beginPath(); g.ellipse(x, GY + 4, 60, 40, 0, Math.PI, Math.PI * 2); g.fill(); } }
  // fish school
  const n = o.fish ?? 40; for (let i = 0; i < n; i++) { const u = (i / n), fx = ((u * 1600 + t * 90) % (E.W + 400)) - 200, fy = GY - V(420, 700) + Math.sin(u * 13 + t) * 80 + (i % 5) * 18;
    g.fillStyle = alpha('#e8f6ff', 0.75); g.beginPath(); g.ellipse(fx, fy, 14, 6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(fx - 12, fy); g.lineTo(fx - 22, fy - 7); g.lineTo(fx - 22, fy + 7); g.fill(); }
  for (let i = 0; i < (o.sharks ?? 1); i++) { const sx = ((t * 60 + i * 900) % (E.W + 800)) - 400, sy = GY - V(620, 900) + i * 120; shark(g, sx, sy, 1 - i * 0.2); }
}
export function shark(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0a1820';
  g.beginPath(); g.moveTo(170, 0); g.quadraticCurveTo(60, -50, -120, -8); g.lineTo(-190, -50); g.lineTo(-170, 0); g.lineTo(-190, 46); g.lineTo(-120, 10); g.quadraticCurveTo(60, 40, 170, 0); g.fill();
  g.beginPath(); g.moveTo(20, -30); g.lineTo(-20, -92); g.lineTo(-40, -24); g.fill(); g.beginPath(); g.moveTo(30, 20); g.lineTo(-10, 66); g.lineTo(-20, 18); g.fill(); g.restore();
}
