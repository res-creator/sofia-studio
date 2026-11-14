// sets/home.js — ordinary life: a city kitchen with a TV on the news and a night window (key = pendant lamp + TV),
// and the 1980 bedroom: moonlit blinds, bedside phone, red clock «3:00» (key = moon through blinds + clock glow).
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, glow, alpha, shade, mix, rng, clamp, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const homeGround = () => E.H * V(0.8, 0.68);
// tvContent(g, x, y, w, h, t) — optional custom TV picture; default = generic news layout with a headline bar
// o: { tv: fn | {head:'…', ticker:'…'}, night:true, lampOn:true, tvGlow }
export function kitchen(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), N = mood('night'), GY = homeGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.4), dark = shade(M.dark, -0.3), tvC = o.tvGlow || '#9fd0ff';
  const lampX = CX - V(140, 40), lampY = GY - V(560, 820);
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [dark, wall]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    // tiles
    g.strokeStyle = alpha('#000', 0.12); g.lineWidth = 2; for (let y = GY - V(380, 560); y < GY - 140; y += 46) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2.5, y); g.stroke(); }
    // window on the left: night city
    const wx = CX - V(860, 470), wy = GY - V(680, 1050), ww = V(420, 330), wh = V(420, 460);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(wall, -0.5), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, N.sky); g.fillRect(x, y, w, h); FX.stars(g, t, { count: 30, area: [x, y, w, h * 0.5], seed: 3 });
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.6, color: shade(N.wall, -0.35), windowColor: alpha(N.practical, 0.8), seed: 7 }); });
    // cupboards + fridge
    for (let i = 0; i < 3; i++) { rr(g, CX + V(-80, -60) + i * 170, GY - V(700, 1050), 150, V(200, 260), 6); g.fillStyle = shade(wall, -0.25); g.fill(); circle(g, CX + V(-80, -60) + i * 170 + 130, GY - V(600, 900), 5, alpha(M.rim, 0.4)); }
    rr(g, CX + V(700, 300), GY - V(560, 820), 230, V(560, 820), 14); g.fillStyle = shade(wall, -0.15); g.fill(); seg(g, [[CX + V(700, 300) + 200, GY - V(420, 640)], [CX + V(700, 300) + 200, GY - V(300, 500)]], 6, alpha(M.rim, 0.4));
    // TV on a cabinet (right)
    const tx = CX + V(330, 150), ty = GY - V(470, 700), tw = V(300, 260), th = V(200, 180);
    g.fillStyle = shade(wall, -0.5); g.fillRect(tx - 30, ty + th + 20, tw + 60, GY - ty - th - 20);
    FX.screen(g, { x: tx, y: ty, w: tw, h: th, glowC: tvC, a: 0.35 }, (g, sx, sy, sw, sh) => { if (typeof o.tv === 'function') o.tv(g, sx, sy, sw, sh, t); else newsTV(g, sx, sy, sw, sh, t, o.tv || {}); });
    glow(g, tx + tw / 2, ty + th / 2, tw * 1.4, tvC, 0.12 + 0.04 * Math.sin(t * 9));
    // pendant lamp (key)
    seg(g, [[lampX, -E.H], [lampX, lampY - 40]], 3, '#120c0e');
    g.fillStyle = '#1a1214'; g.beginPath(); g.moveTo(lampX - 80, lampY); g.lineTo(lampX + 80, lampY); g.lineTo(lampX + 30, lampY - 50); g.lineTo(lampX - 30, lampY - 50); g.closePath(); g.fill();
    if (o.lampOn !== false) { glow(g, lampX, lampY + 6, 70, '#fff1cc', 0.9); FX.lightCone(g, lampX, lampY, { angle: Math.PI / 2, spread: 0.7, len: V(560, 820), color: M.key, a: 0.18 }); }
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 600, [shade(M.floor, -0.25), shade(M.dark, -0.5)]); g.fillRect(-E.W * 1.5, GY - 30, E.W * 4, E.H * 2);
    FX.floorLines(g, GY - 30, GY + 600, 'rgba(0,0,0,.25)', 0.08); if (o.lampOn !== false) FX.pool(g, lampX, GY, 460, 70, M.key, 0.25);
  });
  return { GY, CX, M, lampX, lampY };
}
export function newsTV(g, x, y, w, h, t, o = {}) {
  g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#1a2a4a', '#0a1428']); g.fillRect(x, y, w, h);
  circle(g, x + w * 0.3, y + h * 0.42, h * 0.16, '#0b0f18'); g.fillStyle = '#0b0f18'; g.fillRect(x + w * 0.3 - h * 0.2, y + h * 0.58, h * 0.4, h * 0.3);   // presenter silhouette
  rr(g, x + w * 0.55, y + h * 0.16, w * 0.38, h * 0.4, 4); g.fillStyle = alpha('#9fd0ff', 0.25); g.fill();
  g.fillStyle = S().ui.accent; g.fillRect(x, y + h * 0.72, w, h * 0.13);
  text(g, o.head || 'НОВОСТИ', x + 10, y + h * 0.785, { size: h * 0.09, color: '#fff', font: FONTS.ui, weight: 900, align: 'left', spacing: 1 });
  g.fillStyle = '#0a0c14'; g.fillRect(x, y + h * 0.85, w, h * 0.15);
  g.save(); g.beginPath(); g.rect(x, y + h * 0.85, w, h * 0.15); g.clip();
  text(g, o.ticker || '• БИРЖИ • ЦЕНЫ НА НЕФТЬ • ПОГОДА • СВЯЗЬ •', x + w - ((t * 60) % (w * 2.2)), y + h * 0.925, { size: h * 0.075, color: alpha('#fff', 0.85), font: FONTS.ui, weight: 800, align: 'left' }); g.restore();
}
// counter + cup + phone on the table (depth 1). Returns top y.
export function kitchenTable(g, GY, M, x, w = V(520, 460), o = {}) {
  const top = GY - 150, c = '#1c1418';
  g.fillStyle = c; g.fillRect(x, top, w, 18); seg(g, [[x + 24, top], [x + 24, GY]], 12, c); seg(g, [[x + w - 24, top], [x + w - 24, GY]], 12, c);
  g.fillStyle = alpha(M.key, 0.35); g.fillRect(x, top, w, 3);
  if (o.cup !== false) { const cx = x + w * 0.7; g.fillStyle = '#e9e1cf'; g.fillRect(cx, top - 40, 34, 40); seg(g, [[cx + 34, top - 32], [cx + 46, top - 22], [cx + 34, top - 12]], 4, '#e9e1cf');
    for (let i = 0; i < 2; i++) { g.save(); g.globalAlpha *= 0.35; seg(g, [[cx + 10 + i * 12, top - 46], [cx + 4 + i * 12, top - 80], [cx + 14 + i * 12, top - 110]], 3, '#fff'); g.restore(); } }
  return top;
}
// o: { ring 0..1 (phone shakes, rings), clock:'3:00', lamp 0..1 (bedside lamp switched on) }
export function bedroom(g, t, cam, o = {}) {
  const M = mood('night'), GY = homeGround(), CX = E.W / 2, red = S().ui.accent;
  const wall = shade(M.wall, -0.45), dark = shade(M.dark, -0.3), lamp = o.lamp ?? 0;
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [dark, mix(wall, '#4a3a30', lamp * 0.5)]); g.fillRect(-E.W * 1.5, -E.H, E.W * 4, GY + E.H);
    const wx = CX + V(260, 120), wy = GY - V(700, 1000), ww = V(420, 360), wh = V(440, 480);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 1, rows: 1, frame: shade(wall, -0.5), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.moon(g, x + w * 0.65, y + h * 0.3, 26); });
    for (let i = 0; i < 12; i++) { g.fillStyle = alpha('#0a0c18', 0.75); g.fillRect(wx, wy + i * (wh / 12), ww, wh / 24); }         // blinds
    // moonlight stripes on the wall/floor
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { g.fillStyle = alpha(M.rim, 0.05); g.beginPath(); g.moveTo(wx, wy + i * wh / 6); g.lineTo(wx + ww, wy + i * wh / 6); g.lineTo(wx - 300 + ww, GY + 200 + i * 40); g.lineTo(wx - 300, GY + 180 + i * 40); g.fill(); } g.restore();
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 600, [shade(M.floor, -0.3), shade(M.dark, -0.5)]); g.fillRect(-E.W * 1.5, GY - 30, E.W * 4, E.H * 2);
    FX.bed(g, { x: CX - V(620, 420), y: GY, w: V(700, 560), color: shade('#4a4a80', -0.3), frame: '#120f1c', pillow: '#a8a4c8' });
  });
  // nightstand + phone + clock (depth 1)
  const nx = CX + V(150, 120), ny = GY - 150, ring2 = o.ring ?? 0;
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#100c16'; g.fillRect(nx - 90, ny, 180, 150); g.fillStyle = alpha(M.rim, 0.25); g.fillRect(nx - 90, ny, 180, 3);
    const sh = ring2 > 0 ? Math.sin(t * 60) * 3 * ring2 : 0;
    rr(g, nx - 70 + sh, ny - 40, 90, 40, 10); g.fillStyle = '#2a2a34'; g.fill(); seg(g, [[nx - 74 + sh, ny - 50], [nx + 24 + sh, ny - 50]], 14, '#3a3a46'); circle(g, nx - 76 + sh, ny - 44, 12, '#3a3a46'); circle(g, nx + 26 + sh, ny - 44, 12, '#3a3a46');
    if (ring2 > 0) FX.rings(g, nx - 25, ny - 40, t, { count: 3, r0: 40, r1: 160, color: '#fff1e6', a: 0.5 * ring2, speed: 2 });
    rr(g, nx + 34, ny - 46, 70, 44, 6); g.fillStyle = '#07070a'; g.fill();
    text(g, o.clock || '3:00', nx + 69, ny - 24, { size: 30, color: red, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(red, 0.9) }); glow(g, nx + 69, ny - 24, 90, red, 0.25);
    if (lamp > 0) { glow(g, nx - 40, ny - 140, 240, '#ffd59a', 0.5 * lamp); circle(g, nx - 40, ny - 140, 30, alpha('#ffe6b8', lamp)); seg(g, [[nx - 40, ny - 110], [nx - 40, ny]], 5, '#2a2026'); }
  });
  return { GY, CX, M, phone: [nx - 25, ny - 40] };
}
