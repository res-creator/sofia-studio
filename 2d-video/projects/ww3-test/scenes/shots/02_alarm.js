// shots/02_alarm.js — inside the command post: the warning, five launches, Petrov's minutes, the decision, the freeze.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, mix, text, FONTS, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { control, nearDesk, ctrlGround, SCREEN } from '../sets/control.js';
import { petrov, officerCap, chairAt, label, lt, nameplate, polarMap, startBanner, redPhone } from '../lib.js';
import { PETROV } from '../cast.js';

const PX = () => E.W / 2 - V(260, 200);           // Petrov's seat x (wide)
const sitPose = POSES.sit;
const deskPose = { ...POSES.sit, eF: [30, -120], hF: [62, -132], eB: [22, -118], hB: [52, -128] };
const standDesk = { ...POSES.stand, eF: [24, -136], hF: [52, -118], eB: [14, -134], hB: [40, -116] };
function room(g, t, cam, o = {}) {
  const r = control(g, t, cam, o);
  layer(g, cam, 1, (g) => {
    const s = o.s ?? 1.25, rim = { color: mix(r.M.rim, r.red, (o.alarm ?? 0) * 0.5), dir: [0.6, -0.8], w: 4 };
    if (!o.noPetrov) { if (!o.standing) chairAt(g, PX(), r.GY, s, 1, '#0d0f1c');
      petrov(g, { x: PX() + (o.standing ? 10 : 0), y: r.GY, s, facing: 1, pose: o.pose || breathe(sitPose, t, 1, 2), expr: o.expr || 'neutral', look: o.look || [0.6, -0.4], rim, blink: !o.frozen && (t % 3.3) > 3.2 }); }
    else chairAt(g, PX(), r.GY, s, 1, '#0d0f1c');
    r.desk = nearDesk(g, t, r.GY, r.M, { x: PX() + V(90, 70) * s, alarm: o.alarm, keyC: r.keyC, crt: o.crt, lift: o.lift });
    o.extra?.(g, r);
  });
  return r;
}
const fade = (t, info, a, b = 0.4) => ease.out(prog(t, a, a + b)) * clamp((info.dur - t) / 0.3);

// s03 — "Компьютер системы предупреждения" establishing interior
registerShot('s03', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.06 * k, x: 30 - 50 * k };
  room(g, t, cam, { arcs: [] });
  FX.dust(g, t, { count: 60, color: '#bcd0ff', a: 0.25 });
} });

// s04 — "пишет одно слово:" CRT insert, cursor typing
registerShot('s04', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: 1 + 0.05 * t / info.dur };
  blurLayer(g, 14, (g) => control(g, t, { z: 1.7, x: -200, y: -150 }, {})); veil(g, '#05070e', 0.5);
  layer(g, cam, 1, (g) => {
    const w = V(1100, 900), h = V(700, 700), x = (E.W - w) / 2, y = (E.H - h) / 2 - 20;
    rr(g, x - 40, y - 40, w + 80, h + 80, 50); g.fillStyle = '#0b0d16'; g.fill(); g.strokeStyle = alpha(M.rim, 0.4); g.lineWidth = 3; g.stroke();
    rr(g, x, y, w, h, 40); g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#0a2a22', '#04120e']); g.fill();
    const col = '#7fe8c8'; const lines = ['СИСТЕМА  «ОКО»', 'КАНАЛ 1 ..... НОРМА', 'КАНАЛ 2 ..... НОРМА', ''];
    lines.forEach((ln, i) => text(g, ln, x + 70, y + 110 + i * 80, { size: 44, color: alpha(col, 0.75), font: FONTS.ui, weight: 800, align: 'left', glow: 10, glowColor: alpha(col, 0.6), spacing: 3 }));
    const blink = Math.floor(t * 4) % 2 === 0; if (blink) { g.fillStyle = col; g.fillRect(x + 70, y + 110 + 3 * 80 - 24, 30, 48); }
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let sy = y; sy < y + h; sy += 5) g.fillRect(x, sy, w, 2);
    glow(g, E.W / 2, E.H / 2, w * 0.7, col, 0.12);
  });
} });

// s05 — "«Старт»" giant flashing banner, alarm shake
registerShot('s05', { draw(g, t, info) {
  const [sx, sy] = shake(t, 10 * (1 - prog(t, 0, 0.8)) + 2, 9);
  const cam = { z: 1.0 + 0.08 * ease.out(prog(t, 0, info.dur)), x: sx, y: sy };
  const M = mood('interiorCool'), red = S().ui.accent;
  layer(g, cam, 0.6, (g) => { g.fillStyle = '#07060c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 1, (g) => {
    const w = V(1500, 980), h = V(380, 300), x = (E.W - w) / 2, y = (E.H - h) / 2;
    startBanner(g, x, y, w, h, t + 0.1);
    for (let i = 0; i < 2; i++) { rr(g, x - 60 + i * (w + 90), y + h * 0.2, 30, h * 0.6, 8); g.fillStyle = '#180808'; g.fill(); }
  });
  veil(g, red, 0.12 * (0.5 + 0.5 * Math.sin(t * 7)), 'lighter');
  FX.dust(g, t, { count: 40, color: '#ffb0a0', a: 0.3 });
} });

// s06 — "Потом ещё четыре." the map: one arc, then four more
registerShot('s06', { draw(g, t, info) {
  const t4 = lt(info, 'четыре', 1.3);
  const cam = { z: 1.0 + 0.05 * t / info.dur };
  const M = mood('interiorCool');
  blurLayer(g, 10, (g) => control(g, t, { z: 1.6, y: 200 }, { alarm: 1 })); veil(g, '#04050a', 0.55);
  layer(g, cam, 1, (g) => {
    const w = V(1500, 980), h = V(800, 900), x = (E.W - w) / 2, y = (E.H - h) / 2;
    rr(g, x - 20, y - 20, w + 40, h + 40, 12); g.fillStyle = '#05070c'; g.fill();
    const arcs = [0, 1, 2, 3, 4].map((i) => ({ p: i === 0 ? 0.35 + 0.05 * t : ease.out(prog(t, t4 + (i - 1) * 0.18 - 0.1, t4 + (i - 1) * 0.18 + 1.2)) * 0.3 }));
    polarMap(g, x, y, w, h, t, { arcs, alarm: 1 });
    const n = 1 + [1, 2, 3, 4].filter((i) => t > t4 + (i - 1) * 0.18 - 0.1).length;
    UI.readout(g, { label: 'ЦЕЛИ', value: String(n), x: x + 50, y: y + 70, color: S().ui.accent, size: 70 });
  });
} });

// s07 — "Пять американских ракет летят к" Petrov stands up, crew turns
registerShot('s07', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.06 * k, x: 160 - 40 * k, y: 120 };
  const up = ease.inOut(prog(t, 0.15, 0.7));
  const pose = posesAt(t, [[0, deskPose], [0.35, standDesk]]);
  room(g, t, cam, { alarm: 1, banner: 1, arcs: [0, 1, 2, 3, 4].map(() => ({ p: 0.35 + 0.05 * t })), pose, standing: up > 0.4, expr: t > 0.4 ? 'shocked' : 'surprised', look: [0.7, -0.6], crewExpr: 'scared', crewPose: () => POSES.sitBack });
  UI.badge(g, { str: '5 РАКЕТ', a: fade(t, info, 0.5), color: S().ui.accent, size: V(48, 52) });
  FX.dust(g, t, { count: 40, color: '#ffc0b0', a: 0.25 });
} });

// s08 — "Советскому Союзу." map close-up, five arrows creeping across the pole
registerShot('s08', { draw(g, t, info) {
  const cam = { z: 1 + 0.08 * ease.inOut(t / info.dur), r: -0.01 };
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#030508'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    polarMap(g, -40, -40, E.W + 80, E.H + 80, t, { arcs: [0, 1, 2, 3, 4].map((i) => ({ p: 0.45 + 0.09 * t + i * 0.01 })), alarm: 1, zoom: 1.35, cyo: 120 });
  });
  veil(g, S().ui.accent, 0.08 * (0.5 + 0.5 * Math.sin(t * 7)), 'lighter');
} });

// s09 — "У дежурного офицера, Станислава Петрова, есть" medium on Petrov + nameplate
registerShot('s09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.7 + 0.06 * k, x: -120 - 30 * k, y: 230 };
  room(g, t, cam, { alarm: 1, banner: 1, arcs: [0, 1, 2, 3, 4].map(() => ({ p: 0.55 })), pose: breathe(standDesk, t, 1, 4), standing: true, expr: 'worried', look: [0.7, -0.5], crewExpr: 'worried' });
  nameplate(g, t, { name: 'СТАНИСЛАВ ПЕТРОВ', role: 'ДЕЖУРНЫЙ ОФИЦЕР · 44 ГОДА', start: lt(info, 'станислава', 1.4) - 0.1, dur: info.dur, x: E.W - V(720, 600), y: E.H - V(230, 520) });
  FX.dust(g, t, { count: 40, color: '#ffc0b0', a: 0.25 });
} });

// s10 — "несколько минут." wall clock + countdown
registerShot('s10', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: 1.0 + 0.06 * t / info.dur, x: -10 * t };
  blurLayer(g, 14, (g) => control(g, t, { z: 1.8, x: 300, y: -200 }, { alarm: 1 })); veil(g, '#05060c', 0.45);
  layer(g, cam, 1, (g) => {
    const cx = E.W * V(0.36, 0.5), cy = E.H * V(0.5, 0.38), r = V(300, 280);
    glow(g, cx, cy, r * 1.6, M.rim, 0.15);
    FX.clock(g, cx, cy, r, 15 * 60 + t * 1, { face: '#d8deef', ink: '#0b0d16', red: S().ui.accent });
    const left = Math.max(0, 300 - t * 7), mm = Math.floor(left / 60), ss = Math.floor(left % 60);
    UI.readout(g, { label: 'ОСТАЛОСЬ', value: `0${mm}:${String(ss).padStart(2, '0')}`, x: E.W * V(0.62, 0.5), y: E.H * V(0.5, 0.75), color: S().ui.accent, size: V(110, 100), a: fade(t, info, 0.2), align: V('left', 'center') });
  });
  veil(g, S().ui.accent, 0.06 * (0.5 + 0.5 * Math.sin(t * 7)), 'lighter');
} });

// s11 — "Доложить наверх" hand reaching for the red phone
registerShot('s11', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: 1.0 + 0.05 * t / info.dur };
  blurLayer(g, 14, (g) => control(g, t, { z: 1.6, x: -100, y: -120 }, { alarm: 1, banner: 1 })); veil(g, '#05060c', 0.4);
  layer(g, cam, 1, (g) => {
    const s = V(3.4, 3.0), px = E.W * 0.55, py = E.H * V(0.82, 0.7);
    g.fillStyle = linGrad(g, 0, py - 10, 0, E.H, [shade(M.wall, -0.4), shade(M.wall, -0.75)]); g.fillRect(-E.W, py - 10, E.W * 3, E.H);
    g.fillStyle = alpha(M.rim, 0.3); g.fillRect(-E.W, py - 10, E.W * 3, 4);
    redPhone(g, px, py, s, 0);
    const k = ease.inOut(prog(t, 0.05, 1.35)), ink = S().ink, rimC = mix(M.rim, S().ui.accent, 0.5);
    const hx = lerp(px - 640, px - 70 * s, k), hy = lerp(py + 140, py - 70 * s, k);
    const handArm = (dx, dy, c, sl) => {
      seg(g, [[hx - 150 + dx, hy + 70 + dy], [hx - 900 + dx, hy + 520 + dy]], 150, sl);
      seg(g, [[hx + dx, hy + dy], [hx - 170 + dx, hy + 80 + dy]], 78, c);
      circle(g, hx + 10 + dx, hy - 6 + dy, 62, c);
      for (let i = 0; i < 4; i++) seg(g, [[hx + 20 + dx, hy - 40 + i * 24 + dy], [hx + 110 - i * 8 + dx, hy - 62 + i * 30 + dy]], 26, c);
      seg(g, [[hx - 10 + dx, hy - 40 + dy], [hx + 30 + dx, hy - 92 + dy]], 26, c);
    };
    handArm(-7, -7, rimC, rimC);
    handArm(0, 0, ink, PETROV.color);
    seg(g, [[hx - 260, hy + 140], [hx - 900, hy + 520]], 150, alpha('#000', 0.25));
  });
  veil(g, S().ui.accent, 0.08 * (0.5 + 0.5 * Math.sin(t * 7)), 'lighter');
} });

// s12 — "— значит, возможно, начать войну." over-the-shoulder: blurred Petrov fg, phone + СТАРТ beyond
registerShot('s12', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.45 + 0.08 * k, x: -90, y: 120, r: -0.015 - 0.015 * k };
  const r = control(g, t, cam, { alarm: 1, banner: 1, arcs: [0, 1, 2, 3, 4].map(() => ({ p: 0.6 + 0.04 * t })), crewExpr: 'scared' });
  layer(g, cam, 1, (g) => nearDesk(g, t, r.GY, r.M, { x: E.W / 2 - 100, alarm: 1, keyC: r.keyC }));
  blurLayer(g, 16, (g) => {
    const cx = V(260, 150), cy = E.H * 0.62, R = V(260, 230);
    g.fillStyle = PETROV.color; g.beginPath(); g.ellipse(cx, E.H + 60, R * 1.6, R * 1.25, 0, Math.PI, Math.PI * 2); g.fill();
    circle(g, cx + 20, cy, R * 0.85, S().ink); officerCap(g, cx + 20, cy, R * 0.85, 1, { noBadge: true });
    g.strokeStyle = alpha(r.red, 0.6); g.lineWidth = 10; g.beginPath(); g.arc(cx + 20, cy, R * 0.86, -1.2, 0.6); g.stroke();
  }, cam, 1.7);
  FX.dust(g, t, { count: 40, color: '#ffc0b0', a: 0.25 });
} });

// s13 — "Он решает:" giant face: thinking → determined
registerShot('s13', { draw(g, t, info) {
  const td = lt(info, 'решает', 1.5);
  blurLayer(g, 16, (g) => control(g, t, { z: 1.8, x: 260, y: -160 }, { alarm: 1, banner: 1 })); veil(g, '#05060c', 0.45);
  const M = mood('interiorCool'), r = V(300, 320) * (1 + 0.04 * t), cx = E.W / 2 - V(80, 0), cy = E.H * V(0.62, 0.56);
  bigFace(g, cx, cy, r, { outfit: PETROV, expr: t < td - 0.1 ? 'thinking' : 'determined', look: t < td - 0.1 ? [0.4, -0.3] : [0.05, 0], rimColor: mix(M.rim, S().ui.accent, 0.6), rimSide: 1, blink: (t % 2.9) > 2.8 });
  officerCap(g, cx, cy, r, 1, { front: true });
  if (t > td) FX.rings(g, cx, cy, t - td, { count: 2, r0: r * 1.05, r1: r * 1.6, speed: 0.8, color: '#e8f0ff', a: 0.35 });
} });

// s14 — "это ошибка." FREEZE: flash, the room stops, particles hang, cool tint
registerShot('s14', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.03 * t, x: 40, y: 60, r: -0.02 + 0.01 * t };
  room(g, 0.4, cam, { alarm: 1, banner: 1, arcs: [0, 1, 2, 3, 4].map(() => ({ p: 0.62 })), pose: { ...POSES.stand, eF: [22, -150], hF: [46, -170], eB: [-8, -136], hB: [-10, -100] }, standing: true, expr: 'determined', look: [0.5, -0.2], frozen: true, crewExpr: 'scared' });
  FX.drops(g, t, { count: 70, color: '#d8e4ff', rMax: 7, drift: 2 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,130,255,.45)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  veil(g, '#060a18', 0.25);
  const ta = lt(info, 'это', 0.1);
  const a = fade(t, info, ta, 0.35), sc = 1 + 0.25 * (1 - ease.outBack(prog(t, ta, ta + 0.4)));
  g.save(); g.translate(E.W / 2, E.H * 0.44); g.scale(sc, sc);
  text(g, 'ЭТО ОШИБКА', 0, 0, { size: V(150, 120), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 10, glow: 40, glowColor: 'rgba(140,180,255,.9)', alpha: a });
  g.restore();
  FX.rings(g, E.W / 2, E.H * 0.44, t, { count: 3, r0: 200, r1: 900, speed: 0.4, color: '#e8f0ff', a: 0.25 * a });
  UI.badge(g, { str: 'ЛОЖНАЯ ТРЕВОГА?', a: fade(t, info, ta + 0.6), size: V(34, 38), color: S().ui.gold });
} });

// s15 — "оказывается прав." the room calms: screen back to teal, Petrov sits back relieved
registerShot('s15', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 - 0.05 * k, x: -20 * k, y: 30 };
  const calm = 1 - ease.inOut(prog(t, 0, 0.8));
  room(g, t, cam, { alarm: calm, arcs: [], pose: breathe(posesAt(t, [[0, POSES.sit], [0.5, POSES.sitBack]]), t, 1.4, 3), expr: t > 0.6 ? 'smile' : 'neutral', look: [0.6, -0.5], crewPose: () => POSES.sit });
  FX.dust(g, t, { count: 50, color: '#bcd0ff', a: 0.25 });
  UI.readout(g, { label: 'УДАРА', value: 'НЕ БЫЛО', x: V(150, 90), y: E.H - V(170, 560), color: S().ui.good, size: V(56, 60), a: fade(t, info, 0.9) });
} });
