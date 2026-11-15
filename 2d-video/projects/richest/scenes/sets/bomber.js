// sets/bomber.js — the 1961 night outside: a big jet in the night sky with a fuel plume from the wing, the tanker
// above, the breakup with parachute canopies; and the fields near Goldsboro (tree with a canopy, a swamp). Key = moon.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const skyGround = () => E.H * V(0.8, 0.68);
// generic 8-engine swept-wing jet silhouette, side-top 3/4; no weapons. s≈1 → ~1000 units
export function jet(g, x, y, s = 1, o = {}) {
  const c = o.color || '#05060b', rim = o.rim || '#b8c8ff';
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.facing ?? 1), s);
  const parts = () => {
    g.beginPath(); g.moveTo(520, 0); g.quadraticCurveTo(470, -26, 380, -28); g.lineTo(-420, -22); g.lineTo(-520, -110); g.lineTo(-560, -110); g.lineTo(-500, -14); g.lineTo(-520, 10); g.lineTo(380, 24); g.quadraticCurveTo(480, 22, 520, 0); g.fill(); // fuselage + fin
    g.beginPath(); g.moveTo(120, 0); g.lineTo(-180, 0); g.lineTo(-420, 190); g.lineTo(-340, 190); g.closePath(); g.fill();  // near wing
    g.beginPath(); g.moveTo(80, -10); g.lineTo(-120, -10); g.lineTo(-260, -120); g.lineTo(-210, -120); g.closePath(); g.fill(); // far wing
    for (const [ex, ey] of [[-90, 50], [-180, 110], [-270, 160]]) { rr(g, ex - 50, ey, 100, 24, 10); g.fill(); }
  };
  g.fillStyle = alpha(rim, 0.6); g.save(); g.translate(0, -4); parts(); g.restore();
  g.fillStyle = c; parts();
  circle(g, 470, -6, 4, '#ff5a4a'); circle(g, -380, 190, 5, '#7fff9a'); glow(g, -380, 190, 30, '#7fff9a', 0.6 * (0.5 + 0.5 * Math.sin((o.t || 0) * 6)));
  g.restore();
}
// o: { plane:{x,y,s,rot}, leak 0..1, tanker 0..1, breakup 0..1, chutes:[{x,y,p}], moonX }
export function bomberSky(g, t, cam, o = {}) {
  const M = mood('night'), GY = skyGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 260, area: [-E.W, -E.H, E.W * 3, E.H * 1.2] }); FX.moon(g, o.moonX ?? CX + V(620, 280), V(180, 300), 50); });
  layer(g, cam, 0.25, (g) => { const r = rng(4); for (let i = 0; i < 9; i++) { const x = ((r() * E.W * 2.4 - t * 40) % (E.W * 2.4)) - E.W * 0.4, y = E.H * (0.45 + r() * 0.5);
    g.fillStyle = alpha('#8a96c8', 0.1 + r() * 0.08); g.beginPath(); g.ellipse(x, y, 380 + r() * 300, 50 + r() * 40, 0, 0, Math.PI * 2); g.fill(); } });
  layer(g, cam, 0.5, (g) => {
    const p = o.plane || { x: CX, y: E.H * 0.5, s: 0.8 }, br = o.breakup ?? 0;
    if (o.tanker) jet(g, p.x + 160, p.y - 260 + (1 - o.tanker) * -120, (p.s ?? 0.8) * 0.55, { t, rim: M.rim });
    if ((o.leak ?? 0) > 0) { const wx = p.x - 260 * (p.s ?? 0.8), wy = p.y + 150 * (p.s ?? 0.8);
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, wx, 0, wx - 900 * o.leak, 0, [alpha('#e8f0ff', 0.55), alpha('#e8f0ff', 0)]); g.beginPath(); g.moveTo(wx, wy - 6); g.lineTo(wx - 900 * o.leak, wy - 40); g.lineTo(wx - 900 * o.leak, wy + 50); g.lineTo(wx, wy + 8); g.fill(); g.restore(); }
    if (br <= 0) jet(g, p.x, p.y, p.s ?? 0.8, { rot: p.rot || 0, t, rim: M.rim });
    else { g.save(); g.beginPath(); g.rect(-E.W, -E.H, p.x - 40 + E.W, E.H * 3); g.clip(); jet(g, p.x - br * 80, p.y + br * 120, p.s ?? 0.8, { rot: (p.rot || 0) + br * 0.35, t, rim: M.rim }); g.restore();
      g.save(); g.beginPath(); g.rect(p.x - 40, -E.H, E.W * 2, E.H * 3); g.clip(); jet(g, p.x + br * 60, p.y + br * 200, p.s ?? 0.8, { rot: (p.rot || 0) - br * 0.5, t, rim: M.rim }); g.restore(); }
    (o.chutes || []).forEach((c) => chute(g, c.x, c.y + (c.p ?? 0) * 200, c.s ?? 0.6, M.rim, t));
  });
  return { GY, CX, M };
}
export function chute(g, x, y, s = 0.6, rim = '#b8c8ff', t = 0, o = {}) {
  const sw = Math.sin(t * 1.4 + x) * 0.06;
  g.save(); g.translate(x, y); g.rotate(sw); g.scale(s, s);
  g.fillStyle = o.color || '#e8e4dc'; g.beginPath(); g.arc(0, -120, 110, Math.PI, Math.PI * 2); g.quadraticCurveTo(55, -110, 0, -118); g.quadraticCurveTo(-55, -110, -110, -120); g.fill();
  g.strokeStyle = alpha('#e8e4dc', 0.7); g.lineWidth = 2; for (const dx of [-105, -50, 0, 50, 105]) { g.beginPath(); g.moveTo(dx, -118); g.lineTo(0, 10); g.stroke(); }
  if (!o.empty) { circle(g, 0, 16, 14, '#05060b'); seg(g, [[0, 28], [0, 70]], 12, '#05060b'); seg(g, [[0, 70], [-10, 104]], 10, '#05060b'); seg(g, [[0, 70], [12, 102]], 10, '#05060b'); }
  else { rr(g, -24, 12, 48, 110, 22); g.fillStyle = '#2a2c36'; g.fill(); }       // a long canister-shape, small & neutral
  g.restore();
}
// Goldsboro fields at night: o: { tree:{x, chute 0..1}, swamp 0..1 (bubbles), dawn }
export function goldsboro(g, t, cam, o = {}) {
  const M = mood('night'), GY = skyGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 160 }); FX.moon(g, CX - V(600, 260), V(200, 320), 40); });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY - V(140, 200), amp: 40, color: shade(M.wall, -0.45), seed: 3 }); for (let i = 0; i < 30; i++) FX.tree(g, -E.W * 0.3 + i * 110, GY - V(130, 190), 0.55, '#07080f'); FX.fog(g, GY - V(200, 260), 160, M.fog, 0.3); });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 500, [shade(M.grass, -0.55), '#030406']); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2);
    for (let i = 0; i < 40; i++) seg(g, [[-E.W + i * 120, GY + 300], [CX + (i - 20) * 22, GY - 18]], 2, alpha('#000', 0.35));   // furrows
    if (o.swamp != null) { const sx = CX + V(380, 160); g.fillStyle = alpha('#2a4a4a', 0.9); g.beginPath(); g.ellipse(sx, GY + 70, 360, 60, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 18; i++) seg(g, [[sx - 330 + i * 38, GY + 60], [sx - 340 + i * 38, GY - 20 - (i % 3) * 20]], 4, '#07080f');
      const k = (t * 0.8) % 1; ring(g, sx, GY + 70, 20 + k * 120 * o.swamp, 2, alpha(M.rim, (1 - k) * 0.5 * o.swamp)); }
    if (o.tree) { const tx = o.tree.x ?? CX - V(260, 120);
      seg(g, [[tx, GY], [tx, GY - 260]], 26, '#05060b'); for (const [dx, dy, r] of [[0, -330, 120], [-90, -280, 90], [90, -280, 90], [0, -420, 80]]) circle(g, tx + dx, GY + dy, r, '#06070d');
      g.save(); g.globalCompositeOperation = 'source-atop'; g.restore();
      if ((o.tree.chute ?? 0) > 0) chute(g, tx + 40, GY - 250 - (1 - o.tree.chute) * 400, 0.75, M.rim, t * 0.3, { empty: true }); }
  });
  return { GY, CX, M };
}
