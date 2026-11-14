// sets/norad.js — an air-defence command hall (1955 Colorado Springs / 1979–80 command centres / 1995 radar):
// huge wall screen (key light), rows of consoles with duty officers in headsets, phones. No flags, no insignia.
// screen modes: 'map' (tracks), 'attack' (many arrows), 'digits' (000 → 002 → 200), 'santa' (sleigh track), 'empty' ('ПУСКОВ НЕТ'), 'radar'
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp, text, FONTS, ease, prog } from '/engine/core.js';
import { drawFigure, POSES, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { worldMap, arcLine, headset } from '../lib.js';
import { CREW } from '../cast.js';

export const noradGround = () => E.H * V(0.8, 0.68);
export const NSCREEN = () => ({ x: E.W / 2 - V(520, 440), y: noradGround() - V(760, 1160), w: V(1040, 880), h: V(440, 480) });
// o: { screen:'map', p:0..1 (screen animation progress), digits:'000', alarm 0..1, crew:true, second:'empty'|null (small second screen) }
export function norad(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = noradGround(), CX = E.W / 2, red = S().ui.accent, sc = NSCREEN(), alarm = o.alarm ?? 0;
  const pulse = alarm * (0.55 + 0.45 * Math.sin(t * 7)), wall = shade(M.wall, -0.4);
  const keyC = mix('#9fe0ff', red, clamp(alarm));
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.5), wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    for (let x = -E.W; x < E.W * 2.5; x += 200) { g.fillStyle = alpha('#000', 0.15); g.fillRect(x, -E.H, 4, GY + E.H); }
    rr(g, sc.x - 26, sc.y - 26, sc.w + 52, sc.h + 52, 10); g.fillStyle = shade(wall, -0.6); g.fill();
    screenContent(g, t, sc, o, red);
    glow(g, sc.x + sc.w / 2, sc.y + sc.h / 2, sc.w * 0.9, keyC, 0.15 + pulse * 0.25);
    if (o.second !== undefined && o.second !== null) { const s2 = { x: sc.x + sc.w + 90, y: sc.y + 60, w: V(360, 300), h: V(220, 200) };
      rr(g, s2.x - 14, s2.y - 14, s2.w + 28, s2.h + 28, 8); g.fillStyle = shade(wall, -0.6); g.fill(); g.fillStyle = '#04100c'; g.fillRect(s2.x, s2.y, s2.w, s2.h);
      text(g, o.secondText || 'ПУСКОВ НЕТ', s2.x + s2.w / 2, s2.y + s2.h / 2, { size: V(40, 36), color: '#7fe8c8', font: FONTS.ui, weight: 900, spacing: 3, glow: 14, glowColor: alpha('#7fe8c8', 0.6), alpha: 0.6 + 0.4 * Math.sin(t * 3) ** 2 });
      glow(g, s2.x + s2.w / 2, s2.y + s2.h / 2, s2.w, '#7fe8c8', 0.08); }
    for (let x = -E.W; x < E.W * 2.5; x += 380) { rr(g, x, GY - V(900, 1320), 160, 10, 5); g.fillStyle = alpha(M.practical, 0.4); g.fill(); }
  });
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 160, 0, GY + 600, [M.floor, shade(M.dark, -0.4)]); g.fillRect(-E.W * 1.5, GY - 160, E.W * 4, E.H * 2);
    FX.pool(g, sc.x + sc.w / 2, GY - 120, sc.w * 0.7, 60, keyC, 0.12 + pulse * 0.2);
    const rowY = GY - 150, rim = { color: mix(M.rim, red, alarm * 0.6), dir: [0.2, -1], w: 3 };
    for (let i = 0; i < 7; i++) { const x = -300 + i * 400;
      if (o.crew !== false && i % 2 === 0) { const fo = { x: x + 40, y: rowY, s: 0.7, facing: i < 3 ? 1 : -1, outfit: CREW, pose: breathe(o.crewPose?.(i) || POSES.sit, t, 1, i), expr: o.crewExpr || 'neutral', rim, shadow: false, blink: (t % (2.6 + i * 0.2)) > 2.5 + i * 0.2 };
        drawFigure(g, fo); const p = fo.pose, hx = fo.x + fo.facing * 0.7 * p.head[0], hy = fo.y + 0.7 * p.head[1]; headset(g, hx, hy, 26 * 0.7, fo.facing, { rim: rim.color }); }
      FX.counter(g, { x: x - 100, y: rowY, w: 260, h: 70, color: shade(wall, -0.5), top: shade(wall, -0.2), doors: 3 });
      for (let k = 0; k < 6; k++) circle(g, x - 70 + k * 36, rowY - 56, 4, alpha(k === 3 && alarm > 0 ? red : M.practical, 0.9));
      rr(g, x + 110, rowY - 96, 40, 22, 6); g.fillStyle = k2(i) ? red : '#1a1c28'; g.fill(); }
  });
  return { GY, CX, M, keyC, red, pulse, sc };
}
const k2 = (i) => i === 3;
function screenContent(g, t, sc, o, red) {
  const mode = o.screen || 'map', p = o.p ?? 1, col = '#7fe8c8';
  g.save(); g.beginPath(); g.rect(sc.x, sc.y, sc.w, sc.h); g.clip();
  g.fillStyle = '#03100e'; g.fillRect(sc.x, sc.y, sc.w, sc.h);
  if (mode !== 'digits' && mode !== 'empty') {
    const P = worldMap(g, sc.x, sc.y, sc.w, sc.h, { lon0: -150, lon1: 60, lat0: 78, lat1: 10, land: alpha(col, 0.18), ocean: '#03100e', grid: true, M: { rim: col, grass: col, wall: col } });
    if (mode === 'attack') for (let i = 0; i < 14; i++) { const a = P(20 + (i % 5) * 8, 50 + (i % 4) * 3), b = P(-100 + (i % 7) * 6, 38 + (i % 3) * 4); arcLine(g, a, b, clamp(p * 1.4 - i * 0.04), { color: alpha(red, 0.9), lift: 0.3, w: 3 }); }
    if (mode === 'map') for (let i = 0; i < 4; i++) { const a = P(-120 + i * 12, 30 + i * 3), b = P(-90 + i * 10, 55 - i * 2); arcLine(g, a, b, p, { color: alpha(col, 0.8), lift: 0.15, w: 2 }); }
    if (mode === 'santa') { const a = P(-10, 75), b = P(-105, 39), q = arcLine(g, a, b, p, { color: alpha('#ffd59a', 0.9), lift: 0.2, w: 3 }); sleigh(g, q[0], q[1], 1); }
    if (mode === 'radar') { const cx = sc.x + sc.w * 0.5, cy = sc.y + sc.h * 0.9, a = -Math.PI / 2 + Math.sin(t * 0.9) * 1.2; for (const rr2 of [0.3, 0.6, 0.9]) ring(g, cx, cy, sc.h * rr2, 1.5, alpha(col, 0.3)); seg(g, [[cx, cy], [cx + Math.cos(a) * sc.h, cy + Math.sin(a) * sc.h]], 3, alpha(col, 0.8)); if (o.blip) { circle(g, cx + sc.h * 0.2, cy - sc.h * 0.62 * clamp(p), 8, red); glow(g, cx + sc.h * 0.2, cy - sc.h * 0.62 * clamp(p), 40, red, 0.8); } }
  } else if (mode === 'digits') {
    const str = o.digits || '000', hot = str !== '000';
    text(g, str, sc.x + sc.w / 2, sc.y + sc.h * 0.52, { size: sc.h * 0.62, color: hot ? red : col, font: FONTS.ui, weight: 900, spacing: 20, glow: 40, glowColor: alpha(hot ? red : col, 0.8) });
    text(g, o.digitsLabel || 'РАКЕТЫ С ПОДЛОДОК', sc.x + sc.w / 2, sc.y + sc.h * 0.12, { size: V(30, 28), color: alpha(col, 0.8), font: FONTS.ui, weight: 900, spacing: 5 });
  } else text(g, o.emptyText || 'ПУСКОВ НЕТ', sc.x + sc.w / 2, sc.y + sc.h / 2, { size: V(64, 56), color: col, font: FONTS.ui, weight: 900, spacing: 6, glow: 20, glowColor: alpha(col, 0.6) });
  g.fillStyle = 'rgba(0,0,0,.2)'; for (let sy = sc.y; sy < sc.y + sc.h; sy += 4) g.fillRect(sc.x, sy, sc.w, 1.5);
  g.restore();
}
export function sleigh(g, x, y, s = 1, color = '#ffd59a') {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = color; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-30, 10); g.lineTo(26, 10); g.quadraticCurveTo(36, 10, 36, 2); g.stroke(); seg(g, [[-22, 10], [-22, -6], [10, -6], [18, -18]], 4, color);
  for (let i = 0; i < 2; i++) { seg(g, [[40 + i * 26, -4], [56 + i * 26, -4]], 5, color); seg(g, [[56 + i * 26, -4], [62 + i * 26, -16]], 3, color); }
  glow(g, 0, 0, 60, color, 0.4); g.restore();
}
