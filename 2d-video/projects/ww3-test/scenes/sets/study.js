// sets/study.js — a scientist's study at night: night window, bookshelves, chalkboard with a graph, a warm desk lamp (key light).
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, text, FONTS, ease, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const studyGround = () => E.H * V(0.8, 0.68);
export function study(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), N = mood('night'), GY = studyGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.45), dark = shade(M.dark, -0.3);
  const lampX = CX - V(80, 60), lampY = GY - 250;
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [dark, wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    // night window on the left
    const wx = CX - V(820, 480), wy = GY - V(640, 1000), ww = V(380, 340), wh = V(400, 440);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(wall, -0.5), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, N.sky); g.fillRect(x, y, w, h);
      FX.moon(g, x + w * 0.7, y + h * 0.25, 22);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.5, color: shade(N.wall, -0.3), windowColor: alpha(N.practical, 0.7), seed: 12 });
    });
    // bookshelf on the right
    const bx = CX + V(520, 260), by = GY - V(620, 900), r = rng(3);
    g.fillStyle = shade(wall, -0.4); g.fillRect(bx, by, 420, V(620, 900) - 40);
    for (let s = 0; s < 5; s++) { const sy = by + 20 + s * V(110, 160); g.fillStyle = shade(wall, -0.6); g.fillRect(bx, sy + V(90, 140), 420, 10);
      for (let x = bx + 14; x < bx + 400;) { const bw = 14 + r() * 22, bh = V(60, 100) + r() * 30; g.fillStyle = mix(['#5a3a3a', '#3a4a5a', '#5a5238', '#3a3048'][Math.floor(r() * 4)], wall, 0.35); g.fillRect(x, sy + V(90, 140) - bh, bw, bh); x += bw + 3; } }
    if (o.board) { // chalkboard with a growing graph
      const cx0 = CX - V(260, 380), cy0 = GY - V(640, 1000), cw = V(640, 700), ch = V(360, 420), p = o.board;
      rr(g, cx0 - 16, cy0 - 16, cw + 32, ch + 32, 6); g.fillStyle = '#3a2a1e'; g.fill();
      g.fillStyle = '#1c2a24'; g.fillRect(cx0, cy0, cw, ch);
      const chalk = alpha('#e8efe6', 0.85);
      seg(g, [[cx0 + 50, cy0 + ch - 50], [cx0 + cw - 40, cy0 + ch - 50]], 3, chalk); seg(g, [[cx0 + 50, cy0 + ch - 50], [cx0 + 50, cy0 + 40]], 3, chalk);
      g.strokeStyle = S().ui.gold; g.lineWidth = 5; g.beginPath(); const n = Math.floor(60 * p);
      for (let i = 0; i <= n; i++) { const u = i / 60, x = cx0 + 60 + u * (cw - 120), y = cy0 + ch - 60 - (ch - 140) * (0.15 + 0.85 * Math.exp(-((u - 0.25) ** 2) / 0.02)) * (u < 0.25 ? 1 : 1 - 0.55 * (u - 0.25)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      for (const [i, s] of ['t', 'T', '°C'].entries()) text(g, s, cx0 + cw - 120 + i * 40, cy0 + 50, { size: 30, color: chalk, font: FONTS.ui, weight: 700 });
      text(g, 'Σ = ∫ f(t) dt', cx0 + cw * 0.62, cy0 + ch * 0.32, { size: 34, color: chalk, font: FONTS.ui, weight: 700, alpha: ease.out(prog(p, 0.3, 0.7)) });
    }
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 600, [shade(M.floor, -0.2), shade(M.dark, -0.5)]); g.fillRect(-E.W * 1.5, GY - 30, E.W * 4, E.H * 2);
    FX.floorLines(g, GY - 30, GY + 600, 'rgba(0,0,0,.25)', 0.08);
    FX.pool(g, lampX, GY + 10, 520, 80, M.key, 0.25);
  });
  return { GY, CX, M, lampX, lampY };
}
// desk + lamp + papers at depth 1 (in front of a seated figure); returns desk top y
export function studyDesk(g, t, GY, M, x, w = 460) {
  const top = GY - 150, c = '#1c1418';
  g.fillStyle = c; g.fillRect(x, top, w, 18); seg(g, [[x + 20, top], [x + 20, GY]], 12, c); seg(g, [[x + w - 20, top], [x + w - 20, GY]], 12, c);
  g.fillStyle = alpha(M.key, 0.35); g.fillRect(x, top, w, 3);
  // papers
  for (let i = 0; i < 4; i++) { g.save(); g.translate(x + 120 + i * 50, top - 2); g.rotate(-0.08 + i * 0.05); g.fillStyle = '#e9e1cf'; g.fillRect(-40, -6, 80, 6); g.restore(); }
  // lamp
  const lx = x + w - 90; seg(g, [[lx, top], [lx - 40, top - 110], [lx + 10, top - 170]], 7, '#2a2026');
  g.fillStyle = '#2a2026'; g.beginPath(); g.moveTo(lx - 20, top - 190); g.lineTo(lx + 60, top - 150); g.lineTo(lx + 30, top - 120); g.closePath(); g.fill();
  glow(g, lx + 30, top - 140, 60, '#fff1cc', 0.9); FX.lightCone(g, lx + 30, top - 140, { angle: Math.PI * 0.62, spread: 0.6, len: 260, color: M.key, a: 0.25 });
  return { top };
}
