// sets/control.js — the command post: huge wall screen (polar map), rows of consoles, Petrov's near desk with the red phone.
// Key light = the wall screen (teal, or pulsing red during the alarm). Value structure: dark room, bright screen.
import { E, V, S, mood, layer, rr, seg, circle, linGrad, glow, alpha, shade, mix, rng, clamp } from '/engine/core.js';
import { drawFigure, POSES, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { polarMap, startBanner, redPhone, chairAt } from '../lib.js';
import { CREW } from '../cast.js';

export const ctrlGround = () => E.H * V(0.8, 0.68);
export const SCREEN = () => ({ x: E.W / 2 - V(250, 400), y: ctrlGround() - V(700, 1100), w: V(900, 800), h: V(400, 460) });
// o: { alarm 0..1, arcs, banner 0..1, crew:true, desk:true, frozen }
export function control(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = ctrlGround(), CX = E.W / 2, red = S().ui.accent;
  const alarm = o.alarm ?? 0, pulse = alarm * (0.55 + 0.45 * Math.sin(t * 7));
  const tf = o.frozen ? 0 : t;
  const wall = shade(M.wall, -0.35), sc = SCREEN();
  const keyC = mix(M.practical, red, clamp(alarm * 1.2));
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.4), wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    for (let x = -E.W; x < E.W * 2.5; x += 240) { g.fillStyle = alpha('#000', 0.18); g.fillRect(x, -E.H, 6, GY + E.H); }
    // side panels with lamps
    const r = rng(5);
    for (const px of [-760, -460, sc.x + sc.w + 120, sc.x + sc.w + 420, 2300]) {
      rr(g, px, GY - V(560, 900), 220, V(420, 600), 8); g.fillStyle = shade(wall, -0.35); g.fill();
      for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) { const on = (Math.floor(tf * (0.6 + r() * 1.5) + r() * 9) % 3) > 0; const lc = r() < 0.2 ? red : r() < 0.5 ? '#ffc66e' : M.practical; circle(g, px + 30 + i * 40, GY - V(520, 860) + j * 46, 6, on ? lc : shade(wall, -0.2)); if (on) glow(g, px + 30 + i * 40, GY - V(520, 860) + j * 46, 18, lc, 0.3); }
    }
    // the big wall screen
    rr(g, sc.x - 24, sc.y - 24, sc.w + 48, sc.h + 48, 10); g.fillStyle = shade(wall, -0.6); g.fill();
    if (o.banner) { polarMap(g, sc.x, sc.y, sc.w, sc.h * 0.72, tf, { arcs: o.arcs || [], alarm }); startBanner(g, sc.x, sc.y + sc.h * 0.76, sc.w, sc.h * 0.24, tf, o.banner); }
    else polarMap(g, sc.x, sc.y, sc.w, sc.h, tf, { arcs: o.arcs || [], alarm });
    glow(g, sc.x + sc.w / 2, sc.y + sc.h / 2, sc.w * 0.9, keyC, 0.16 + pulse * 0.25);
    // alarm beacon
    const bx = sc.x - 90, by = sc.y - 10;
    rr(g, bx - 18, by - 22, 36, 40, 10); g.fillStyle = alarm > 0 ? mix('#3a0e0a', red, pulse) : '#2a1414'; g.fill();
    if (alarm > 0) { glow(g, bx, by, 220, red, 0.6 * pulse); }
    // ceiling strip lights
    for (let x = -E.W; x < E.W * 2.5; x += 380) { rr(g, x, GY - V(860, 1300), 160, 10, 5); g.fillStyle = alpha(M.practical, 0.5); g.fill(); glow(g, x + 80, GY - V(855, 1295), 120, M.practical, 0.12); }
  });
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 160, 0, GY + 600, [shade(M.floor, 0.0), shade(M.dark, -0.4)]); g.fillRect(-E.W * 1.5, GY - 160, E.W * 4, E.H * 2);
    FX.floorLines(g, GY - 160, GY + 600, 'rgba(0,0,0,.25)', 0.07);
    FX.pool(g, sc.x + sc.w / 2, GY - 120, sc.w * 0.7, 60, keyC, 0.12 + pulse * 0.25);
    // back row of consoles with seated crew (plain silhouettes)
    const rowY = GY - 150, rim = { color: mix(M.rim, red, alarm * 0.6), dir: [0.2, -1], w: 3 };
    for (let i = 0; i < 7; i++) {
      const x = -300 + i * 420;
      if (o.crew !== false && i % 2 === 1) drawFigure(g, { x: x + 40, y: rowY, s: 0.7, facing: -1, outfit: CREW, pose: breathe(o.crewPose?.(i) || POSES.sit, tf, 1, i), expr: o.crewExpr || 'neutral', rim, shadow: false, blink: (tf % (2.7 + i * 0.2)) > 2.6 + i * 0.2 });
      FX.counter(g, { x: x - 100, y: rowY, w: 260, h: 70, color: shade(wall, -0.5), top: shade(wall, -0.2), doors: 3 });
      for (let k = 0; k < 6; k++) { const lc = k === 2 && alarm > 0 ? red : M.practical; circle(g, x - 70 + k * 36, rowY - 56, 4, alpha(lc, 0.9)); }
      FX.screen(g, { x: x - 40, y: rowY - 150, w: 110, h: 70, glowC: keyC, a: 0.15 }, (g, sx, sy, w, h) => { g.fillStyle = alpha(keyC, 0.35); for (let l = 0; l < 4; l++) g.fillRect(sx + 8, sy + 10 + l * 14, w * (0.4 + ((i + l) % 3) * 0.15), 5); });
    }
  });
  return { GY, CX, M, keyC, pulse, red };
}
// Petrov's near desk (foreground, depth 1): console top, small CRT, red phone. Returns the phone position.
export function nearDesk(g, t, GY, M, o = {}) {
  const x = o.x ?? E.W / 2 - V(40, 60), w = V(520, 460), top = GY - 160, red = S().ui.accent, keyC = o.keyC || M.practical;
  g.fillStyle = shade(M.wall, -0.65); g.fillRect(x, top, w, GY - top);
  g.fillStyle = shade(M.wall, -0.35); g.fillRect(x - 10, top - 14, w + 20, 18);
  g.fillStyle = alpha(M.rim, 0.25); g.fillRect(x - 10, top - 14, w + 20, 3);
  for (let k = 0; k < 9; k++) circle(g, x + 40 + k * 34, top + 40, 5, k === 4 && (o.alarm ?? 0) > 0 ? red : alpha(M.practical, 0.7));
  FX.screen(g, { x: x + w - 210, y: top - 170, w: 170, h: 120, glowC: keyC, a: 0.25 }, (g, sx, sy, sw, sh) => { if (o.crt) o.crt(g, sx, sy, sw, sh); else { g.fillStyle = alpha(keyC, 0.5); for (let l = 0; l < 5; l++) g.fillRect(sx + 10, sy + 12 + l * 20, sw * (0.3 + (l % 3) * 0.18), 6); } });
  const px = x + 120, py = top - 14;
  redPhone(g, px, py, 1, o.lift ?? 0);
  return { px, py, top, x, w };
}
export { chairAt };
