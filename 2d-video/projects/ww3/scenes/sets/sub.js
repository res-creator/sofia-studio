// sets/sub.js — inside a diesel submarine compartment (Б-59, 1962) or the reactor compartment (К-19, 1961).
// Key light = caged emergency lamp on the ceiling (amber; red with `alarm`). `heat` 0..1 warms everything and adds haze.
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const subGround = () => E.H * V(0.8, 0.68);
// o: { heat 0..1, alarm 0..1, k19 (reactor pipes, colder), lampX, thermo: value or null }
export function sub(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = subGround(), CX = E.W / 2, red = S().ui.accent;
  const heat = o.heat ?? 0, alarm = o.alarm ?? 0, pulse = alarm * (0.55 + 0.45 * Math.sin(t * 6));
  const wall = mix(shade(M.wall, -0.45), '#3a1a16', heat * 0.5), dark = shade(M.dark, -0.4);
  const lampX = o.lampX ?? CX - V(120, 60), lampY = GY - V(640, 980);
  const key = mix(o.k19 ? '#bfe3ff' : M.key, red, clamp(alarm * 0.8 + heat * 0.25));
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [dark, wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    // curved hull ribs
    for (let x = -E.W; x < E.W * 2.5; x += 300) { g.fillStyle = alpha('#000', 0.28); g.fillRect(x, -E.H, 26, GY + E.H); g.fillStyle = alpha(M.rim, 0.06); g.fillRect(x + 26, -E.H, 4, GY + E.H); }
    // round bulkhead hatch
    const hx = CX + V(520, 260), hy = GY - V(330, 480);
    g.fillStyle = shade(wall, -0.35); g.beginPath(); g.ellipse(hx, hy, 140, 190, 0, 0, Math.PI * 2); g.fill();
    ring(g, hx, hy, 150, 18, shade(wall, 0.12)); g.fillStyle = '#07080c'; g.beginPath(); g.ellipse(hx, hy, 110, 160, 0, 0, Math.PI * 2); g.fill();
    glow(g, hx, hy + 40, 120, key, 0.12);
    // gauges + valve wheels on the back wall
    const r = rng(7);
    for (let i = 0; i < 6; i++) { const gx = -200 + i * 380 + r() * 60, gy = GY - V(420, 640) + r() * 80;
      circle(g, gx, gy, 34, shade(wall, 0.15)); circle(g, gx, gy, 27, '#e8dcc2'); const a = -2.2 + (o.thermo != null ? heat * 3 : 1.5) + Math.sin(t * 3 + i) * 0.05 * (1 + heat * 4);
      seg(g, [[gx, gy], [gx + Math.cos(a) * 22, gy + Math.sin(a) * 22]], 3, red); circle(g, gx, gy, 4, '#222'); }
    for (const vx of [CX - V(700, 380), CX + V(160, 120)]) { const vy = GY - V(250, 360); ring(g, vx, vy, 40, 8, shade(wall, 0.25)); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; seg(g, [[vx, vy], [vx + Math.cos(a) * 40, vy + Math.sin(a) * 40]], 6, shade(wall, 0.25)); } }
  });
  layer(g, cam, 0.55, (g) => {
    // overhead pipes (k19: more, colder colours)
    const pc = o.k19 ? '#5a6a7a' : shade(wall, 0.2);
    for (let i = 0; i < (o.k19 ? 6 : 4); i++) { const py = GY - V(760, 1150) + i * V(46, 60), pw = 18 + (i % 2) * 10;
      seg(g, [[-E.W, py], [E.W * 2.5, py]], pw, shade(pc, -0.1 * i)); seg(g, [[-E.W, py - pw * 0.3], [E.W * 2.5, py - pw * 0.3]], 3, alpha(M.rim, 0.15)); }
    for (const vx of [CX - V(380, 200), CX + V(300, 180)]) seg(g, [[vx, GY - V(780, 1160)], [vx, GY - 40]], 22, shade(pc, -0.15));
    // caged emergency lamp = key
    seg(g, [[lampX, GY - V(800, 1200)], [lampX, lampY - 30]], 6, '#1a1214');
    circle(g, lampX, lampY, 30, mix('#ffdca0', red, clamp(alarm + heat * 0.4)));
    for (let k = -2; k <= 2; k++) seg(g, [[lampX + k * 13, lampY - 30], [lampX + k * 15, lampY + 30]], 3, '#1a1214');
    glow(g, lampX, lampY, 420, key, 0.28 + pulse * 0.25); FX.lightCone(g, lampX, lampY + 20, { angle: Math.PI / 2, spread: 0.75, len: V(800, 1200), color: key, a: 0.12 + pulse * 0.08 });
    if (o.thermo != null) { // wall thermometer "+50"
      const tx = CX - V(560, 320), ty = GY - V(560, 820), th = 220;
      rr(g, tx - 26, ty - 20, 52, th + 60, 14); g.fillStyle = '#d8cdb4'; g.fill(); rr(g, tx - 7, ty, 14, th, 7); g.fillStyle = '#7a6a5a'; g.fill();
      const fill = th * clamp(o.thermo / 60); rr(g, tx - 7, ty + th - fill, 14, fill, 7); g.fillStyle = red; g.fill(); circle(g, tx, ty + th + 14, 16, red);
      text(g, `+${Math.round(o.thermo)}°`, tx + 44, ty + th - fill, { size: 44, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', glow: 12, glowColor: alpha(red, 0.8) }); }
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 600, [shade(M.floor, -0.35), dark]); g.fillRect(-E.W * 1.5, GY - 40, E.W * 4, E.H * 2);
    for (let x = -E.W; x < E.W * 2.5; x += 40) seg(g, [[x, GY - 30], [x + 30, GY + 500]], 2, alpha('#000', 0.3));            // grating
    FX.pool(g, lampX, GY - 10, 520, 70, key, 0.22 + pulse * 0.2);
  });
  if (heat > 0) FX.fog(g, GY - V(700, 1000), V(700, 1000), mix(M.fog, red, 0.3), 0.12 * heat);
  return { GY, CX, M, key, red, lampX, pulse };
}
// table for the three officers (depth 1, in front of seated figures). Returns top y.
export function subTable(g, GY, M, x, w = V(560, 480), o = {}) {
  const top = GY - 140, c = '#140e10';
  g.fillStyle = c; g.fillRect(x, top, w, 16); seg(g, [[x + 30, top], [x + 30, GY]], 12, c); seg(g, [[x + w - 30, top], [x + w - 30, GY]], 12, c);
  g.fillStyle = alpha(o.key || M.key, 0.35); g.fillRect(x, top, w, 3);
  if (o.map !== false) { g.fillStyle = '#d8cba8'; g.save(); g.translate(x + w * 0.5, top - 2); g.rotate(-0.03); g.fillRect(-120, -5, 240, 5); g.restore(); }
  return top;
}
// submarine hull silhouette (side view, no weapons). s≈1 → ~900 units long
export function subHull(g, x, y, s = 1, o = {}) {
  const c = o.color || '#0b0f16', rim = o.rim || '#6fb0c8';
  g.save(); g.translate(x, y); g.scale(s * (o.facing ?? 1), s); g.rotate(o.tilt || 0);
  g.fillStyle = alpha(rim, 0.5); g.beginPath(); g.ellipse(0, -4, 452, 64, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 450, 62, 0, 0, Math.PI * 2); g.fill();
  rr(g, 40, -128, 150, 80, 22); g.fill(); seg(g, [[120, -128], [120, -175]], 8, c); seg(g, [[150, -128], [150, -160]], 6, c);
  poly2(g, [[-430, 0], [-520, -70], [-500, 0], [-520, 70]], c);
  g.fillStyle = alpha(rim, 0.25); g.fillRect(-300, -40, 600, 4);
  g.restore();
}
function poly2(g, pts, c) { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
