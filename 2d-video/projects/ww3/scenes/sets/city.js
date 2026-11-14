// sets/city.js — a night city street: skyline, warm facades, lamp posts; optional closed bank (1914 queue),
// "two capitals" mode (two skylines facing each other across a dark gap, linked by the hot line). Key = lamps + windows.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp, text, FONTS, poly } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const cityGround = () => E.H * V(0.8, 0.68);
// o: { bank:false (bank facade with «ЗАКРЫТО»), old:false (1914 sepia-ish lamps), rain:false, twin:false }
export function city(g, t, cam, o = {}) {
  const M = mood('night'), GY = cityGround(), CX = E.W / 2, lampC = o.old ? '#ffd08a' : M.practical;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 120 }); FX.moon(g, CX + V(640, 300), V(160, 280), 36); });
  if (o.twin) {
    layer(g, cam, 0.35, (g) => { FX.skyline(g, { x: -E.W * 0.4, y: GY, w: E.W * 0.75, maxH: V(460, 700), color: shade(M.wall, -0.4), windowColor: alpha(M.practical, 0.75), seed: 3 });
      FX.skyline(g, { x: E.W * 0.65, y: GY, w: E.W * 0.75, maxH: V(460, 700), color: shade(M.wall, -0.4), windowColor: alpha(M.practical, 0.75), seed: 9 });
      g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#0a0c18', '#020308']); g.fillRect(-E.W, GY, E.W * 3, E.H); });
    return { GY, CX, M, left: [E.W * 0.22, GY - V(300, 450)], right: [E.W * 0.78, GY - V(300, 450)] };
  }
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY - V(140, 200), w: E.W * 3, maxH: V(480, 720), color: shade(M.wall, -0.45), windowColor: alpha(M.practical, 0.55), seed: 5 }));
  layer(g, cam, 0.6, (g) => {
    for (let i = 0; i < 6; i++) FX.facade(g, { x: -E.W * 0.4 + i * 480, y: GY, w: 440, h: V(520, 760) + (i % 3) * 60, color: shade(M.wall, -0.2 - (i % 2) * 0.08), win: lampC, dark: shade(M.wall, -0.5), cols: 4, rows: 4, lit: 0.45, seed: i + 2 });
    if (o.bank) { const bx = CX - V(260, 220), bw = V(620, 520), bh = V(520, 760);
      g.fillStyle = shade(M.wall, 0.05); g.fillRect(bx, GY - bh, bw, bh); poly(g, [[bx - 30, GY - bh], [bx + bw / 2, GY - bh - 120], [bx + bw + 30, GY - bh]], shade(M.wall, 0.12));
      for (let i = 0; i < 5; i++) { g.fillStyle = shade(M.wall, 0.25); g.fillRect(bx + 40 + i * (bw - 100) / 4, GY - bh + 40, 28, bh - 80); }
      g.fillStyle = '#05060c'; g.fillRect(bx + bw / 2 - 70, GY - 220, 140, 220);
      rr(g, bx + bw / 2 - 140, GY - 300, 280, 64, 6); g.fillStyle = '#e8e0c8'; g.fill(); text(g, o.bankSign || 'ЗАКРЫТО', bx + bw / 2, GY - 268, { size: 40, color: '#2a1a14', font: FONTS.ui, weight: 900, spacing: 4 });
      text(g, 'БАНК', bx + bw / 2, GY - bh - 40, { size: 50, color: alpha(S().ui.cream, 0.7), font: FONTS.serif, weight: 900, spacing: 10 }); }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 10, 0, GY + 500, ['#1a1a28', '#05050a']); g.fillRect(-E.W, GY - 10, E.W * 3, E.H * 2);
    for (let i = -3; i < 10; i++) FX.lampPost(g, i * 520 + 120, GY, V(330, 420), { light: lampC, a: 0.22 });
    seg(g, [[-E.W, GY + 60], [E.W * 2.5, GY + 60]], 3, alpha(M.rim, 0.12));
  });
  if (o.rain) FX.rain(g, t, { count: 160 });
  return { GY, CX, M };
}
