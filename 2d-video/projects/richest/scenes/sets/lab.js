// sets/lab.js — a computing centre / scientists' lab (1983 and 2019–2022): mainframe cabinets with spinning tape
// reels and blinking lamps, two desks with paper charts or monitors. Key = monitors + lamp panel (interiorCool).
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const labGround = () => E.H * V(0.8, 0.68);
// o: { modern:false (monitors instead of reels), lights:1 }
export function lab(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = labGround(), CX = E.W / 2, wall = shade(M.wall, -0.35), r = rng(17);
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.4), wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    for (let x = -E.W; x < E.W * 2.5; x += 380) { rr(g, x, GY - V(880, 1300), 200, 10, 5); g.fillStyle = alpha('#e8f0ff', 0.45); g.fill(); glow(g, x + 100, GY - V(875, 1295), 140, '#e8f0ff', 0.1); }
    // mainframe cabinets
    for (let i = 0; i < 9; i++) { const cx = -E.W * 0.3 + i * 300, cw = 240, ch = V(560, 760), cy = GY - 140 - ch;
      rr(g, cx, cy, cw, ch, 6); g.fillStyle = shade(wall, -0.25 + (i % 2) * 0.05); g.fill(); g.fillStyle = alpha(M.rim, 0.12); g.fillRect(cx, cy, cw, 3);
      if (!o.modern) for (const [dx, dy] of [[60, 120], [180, 120]]) { const rx = cx + dx, ry = cy + dy; circle(g, rx, ry, 46, '#0c0e18'); ring(g, rx, ry, 46, 4, alpha(M.rim, 0.4)); const a = t * (i % 2 ? 2.2 : -1.6) + i; for (let k = 0; k < 3; k++) seg(g, [[rx, ry], [rx + Math.cos(a + k * 2.1) * 38, ry + Math.sin(a + k * 2.1) * 38]], 4, alpha(M.rim, 0.5)); circle(g, rx, ry, 10, '#2a2e44'); }
      for (let j = 0; j < 5; j++) for (let k = 0; k < 8; k++) { const on = (Math.floor(t * (0.8 + r() * 2) + r() * 9) % 3) > 0, lc = r() < 0.25 ? '#ffc66e' : M.practical; circle(g, cx + 30 + k * 26, cy + (o.modern ? 80 : 220) + j * 30, 5, on ? lc : shade(wall, -0.1)); }
    }
  });
  layer(g, cam, 0.75, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 120, 0, GY + 600, [shade(M.floor, 0), shade(M.dark, -0.4)]); g.fillRect(-E.W * 1.5, GY - 120, E.W * 4, E.H * 2);
    FX.floorLines(g, GY - 120, GY + 600, 'rgba(0,0,0,.25)', 0.07);
    FX.pool(g, CX, GY - 40, 900, 80, M.practical, 0.12);
  });
  return { GY, CX, M };
}
// desk with a chart (paper printout or monitor) at depth 1. chart: 'fall'|'rise'|'flat'|'spectrum'; p = draw progress
export function labDesk(g, t, GY, M, x, o = {}) {
  const w = o.w ?? V(460, 400), top = GY - 150, c = '#0e1018', chart = o.chart || 'fall', p = o.p ?? 1, col = o.color || S().ui.gold;
  g.fillStyle = c; g.fillRect(x, top, w, 16); seg(g, [[x + 20, top], [x + 20, GY]], 12, c); seg(g, [[x + w - 20, top], [x + w - 20, GY]], 12, c);
  g.fillStyle = alpha(M.practical, 0.3); g.fillRect(x, top, w, 3);
  const sx = x + w * 0.2, sy = top - 190, sw = w * 0.62, sh = 160;
  FX.screen(g, { x: sx, y: sy, w: sw, h: sh, glowC: M.practical, a: 0.25, bg: '#071420' }, (g, X, Y, W, H) => {
    g.strokeStyle = alpha(M.practical, 0.25); g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(X, Y + (H * i) / 4); g.lineTo(X + W, Y + (H * i) / 4); g.stroke(); }
    g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); const n = Math.floor(40 * clamp(p));
    for (let i = 0; i <= n; i++) { const u = i / 40; let v = chart === 'fall' ? 0.2 + 0.7 * (u < 0.2 ? 1 : Math.exp(-(u - 0.2) * 5)) : chart === 'rise' ? 0.15 + 0.7 * u * u : chart === 'spectrum' ? 0.5 + 0.35 * Math.sin(u * 9) * (1 - u) : 0.5;
      const X2 = X + 10 + u * (W - 20), Y2 = Y + H - 10 - v * (H - 20); i ? g.lineTo(X2, Y2) : g.moveTo(X2, Y2); } g.stroke(); });
  seg(g, [[x + w * 0.51, top], [x + w * 0.51, top - 30]], 10, c);
  return { top, screen: [sx, sy, sw, sh] };
}
