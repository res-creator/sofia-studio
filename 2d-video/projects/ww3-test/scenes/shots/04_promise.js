// shots/04_promise.js — what the film covers (internet, money, hunger, where to survive, seven brinks) and the finale.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, noise, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, FONTS, linGrad, radGrad, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { station } from '../sets/station.js';
import { label, lt, globe, PLACES, petrov } from '../lib.js';
import { PETROV, CREW } from '../cast.js';

const fade = (t, info, a, b = 0.4) => ease.out(prog(t, a, a + b)) * clamp((info.dur - t) / 0.3);

// s26 — "Мы узнаем, что станет с интернетом" phone in hand: НЕТ СЕТИ
registerShot('s26', { draw(g, t, info) {
  const N = mood('night'), cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: -15 * t };
  blurLayer(g, 16, (g) => { backdrop(g, N.sky); FX.skyline(g, { x: -200, y: E.H * 0.85, w: E.W + 400, maxH: 500, color: shade(N.wall, -0.2), windowColor: alpha(N.practical, 0.8), lit: 0.35, seed: 31 }); for (let i = 0; i < 14; i++) glow(g, (i * 211) % E.W, E.H * (0.55 + (i % 4) * 0.08), 60, i % 3 ? N.practical : N.rim, 0.25); });
  veil(g, '#04050c', 0.35);
  layer(g, cam, 1, (g) => {
    const pw = V(380, 420), ph = V(720, 800), px = E.W / 2 - pw / 2 + V(120, 0), py = E.H / 2 - ph / 2 + 30;
    const ink = S().ink, scr = '#0e1424', rimC = '#9fd8ff';
    // hand behind phone
    seg(g, [[px + pw * 0.2, py + ph * 0.9], [px - 300, E.H + 300]], 170, ink);
    rr(g, px - 14, py - 14, pw + 28, ph + 28, 54); g.fillStyle = '#05060a'; g.fill(); g.strokeStyle = alpha(rimC, 0.5); g.lineWidth = 3; g.stroke();
    rr(g, px, py, pw, ph, 42); g.fillStyle = linGrad(g, 0, py, 0, py + ph, ['#162038', scr]); g.fill();
    // status bar: empty signal bars
    for (let i = 0; i < 4; i++) rr(g, px + 40 + i * 18, py + 52 - i * 8, 12, 14 + i * 8, 3), g.fillStyle = alpha('#ffffff', 0.18), g.fill();
    seg(g, [[px + 36, py + 60], [px + 110, py + 30]], 4, S().ui.accent);
    label(g, '00:15', px + pw - 50, py + 46, { size: 26, align: 'right', color: '#dfe6ff', glow: 0, spacing: 1 });
    // wifi icon with slash
    const cx = px + pw / 2, cy = py + ph * 0.42, on = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.2));
    for (let k = 0; k < 3; k++) { g.strokeStyle = alpha('#dfe6ff', (0.25 + 0.2 * k) * on); g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy + 60, 50 + k * 45, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); }
    circle(g, cx, cy + 60, 14, alpha('#dfe6ff', 0.6));
    seg(g, [[cx - 110, cy + 90], [cx + 110, cy - 110]], 14, S().ui.accent);
    label(g, 'НЕТ СЕТИ', cx, py + ph * 0.7, { size: V(48, 52), color: '#ffffff', spacing: 4, glow: 12 });
    // spinner
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 4; circle(g, cx + Math.cos(a) * 26, py + ph * 0.84 + Math.sin(a) * 26, 5, alpha('#dfe6ff', 0.15 + 0.1 * i)); }
    glow(g, cx, cy, pw * 1.3, rimC, 0.12);
    // thumb
    seg(g, [[px - 30, py + ph * 0.75], [px + 40, py + ph * 0.6]], 54, ink);
  });
} });

// s27 — "и деньгами," ATM at night: НЕ РАБОТАЕТ
registerShot('s27', { draw(g, t, info) {
  const N = mood('night'), cam = { z: 1.15 + 0.08 * t / info.dur, x: 20, y: 40 }, GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(N.wall, -0.5), shade(N.wall, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2);
    for (let y = GY - 40; y > -E.H; y -= 60) for (let x = -E.W + ((y / 60) % 2 ? 60 : 0); x < E.W * 2; x += 120) { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(x, y, 120, 60); }
    const ax = E.W / 2 + V(150, 40), ay = GY - V(560, 600), aw = V(360, 340), ah = V(560, 600);
    rr(g, ax - 20, ay - 20, aw + 40, ah + 20, 14); g.fillStyle = shade(N.wall, -0.65); g.fill();
    rr(g, ax, ay, aw, ah, 10); g.fillStyle = shade(N.wall, -0.15); g.fill();
    const sx = ax + 40, sy = ay + 60, sw = aw - 80, sh = V(200, 220), fl = 0.75 + 0.25 * Math.sin(t * 30) * (noise(t * 4, 2) > 0.3 ? 1 : 0);
    rr(g, sx, sy, sw, sh, 8); g.fillStyle = mix('#1a0808', S().ui.accent, 0.35 * fl); g.fill();
    label(g, 'НЕ РАБОТАЕТ', sx + sw / 2, sy + sh * 0.42, { size: V(38, 40), color: '#ffe8e0', glow: 16, glowA: 0.8, a: fl, spacing: 3 });
    label(g, 'СЕРВИС НЕДОСТУПЕН', sx + sw / 2, sy + sh * 0.72, { size: V(18, 20), color: '#ffc8b8', glow: 0, a: fl, spacing: 2 });
    rr(g, ax + 60, sy + sh + 60, aw - 120, 18, 9); g.fillStyle = '#05060a'; g.fill();
    for (let i = 0; i < 12; i++) rr(g, ax + 70 + (i % 3) * 60, sy + sh + 110 + Math.floor(i / 3) * 40, 46, 28, 6), g.fillStyle = shade(N.wall, -0.4), g.fill();
    glow(g, sx + sw / 2, sy + sh / 2, 420, S().ui.accent, 0.25 * fl);
    g.fillStyle = shade(N.floor, -0.3); g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.pool(g, sx + sw / 2, GY + 30, 360, 50, S().ui.accent, 0.18 * fl);
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - V(120, 160), y: GY, s: 1.6, facing: 1, outfit: CREW, pose: breathe(posesAt(t, [[0, POSES.holdFront], [0.45, POSES.shrug]]), t, 1, 3), expr: 'confused', rim: { color: mix(N.rim, S().ui.accent, 0.7), dir: [1, -0.3] } });
  });
  FX.rain(g, t, { count: 120, a: 0.25 });
} });

// s28 — "почему голод может оказаться" empty supermarket shelves under flickering tubes
registerShot('s28', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: 1.05 + 0.04 * t / info.dur, x: 80 - 120 * ease.inOut(t / info.dur) }, GY = E.H * V(0.86, 0.72);
  const fl = noise(t * 6, 5) > 0.55 ? 0.35 : 1;
  layer(g, cam, 0.3, (g) => { g.fillStyle = shade(M.wall, -0.5); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let x = -E.W; x < E.W * 2; x += 520) { rr(g, x, 40, 300, 16, 8); g.fillStyle = alpha('#e8f4ff', 0.85 * (x % 1040 === 0 ? fl : 1)); g.fill(); glow(g, x + 150, 48, 260, '#cfe4ff', 0.25 * (x % 1040 === 0 ? fl : 1)); } });
  layer(g, cam, 0.8, (g) => {
    const top = GY - V(700, 1100), r = rng(4);
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, top, E.W * 3, GY - top);
    for (let k = 0; k < 4; k++) { const sy = top + 60 + k * (GY - top - 80) / 4;
      g.fillStyle = shade(M.wall, 0.15); g.fillRect(-E.W, sy + 120, E.W * 3, 14); g.fillStyle = alpha('#000', 0.3); g.fillRect(-E.W, sy + 134, E.W * 3, 10);
      for (let x = -E.W + 80; x < E.W * 2; x += 210) { rr(g, x, sy + 128, 60, 26, 3); g.fillStyle = '#f2efe6'; g.fill(); g.fillStyle = '#d04a3a'; g.fillRect(x + 6, sy + 134, 30, 6); }
      for (let i = 0; i < 3; i++) if (r() < 0.6) { const x = -200 + r() * (E.W + 400); rr(g, x, sy + 64, 46, 56, 4); g.fillStyle = mix('#7a6a4a', M.wall, 0.4); g.fill(); g.fillStyle = alpha('#fff', 0.2); g.fillRect(x + 4, sy + 80, 38, 14); } }
    g.fillStyle = linGrad(g, 0, GY, 0, E.H, [shade(M.floor, 0.1), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3, E.H);
  });
  FX.dust(g, t, { count: 50, color: '#dfe8ff', a: 0.3 });
  veil(g, '#000', 0.3 * (1 - fl));
} });

// s29 — "страшнее самих взрывов," a field under a grey sky, dry stalks in the wind, dim sun through haze
registerShot('s29', { draw(g, t, info) {
  const M = mood('storm'), cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: -30 * t }, GY = E.H * V(0.62, 0.58);
  layer(g, cam, 0.1, (g) => { backdrop(g, [shade(M.sky[0], 0.1), shade(M.sky[2], 0.15), mix(M.fog, '#8a8a90', 0.5)]); circle(g, E.W * 0.68, E.H * 0.3, 54, alpha('#e8e2d0', 0.55)); glow(g, E.W * 0.68, E.H * 0.3, 260, '#d8d2c0', 0.18);
    FX.clouds(g, { y: E.H * 0.18, h: 220, color: '#c8ccd8', a: 0.18, seed: 4, count: 9 }); });
  layer(g, cam, 0.35, (g) => { FX.hills(g, { y: GY, amp: 30, color: shade(M.wall, -0.2), seed: 3 }); FX.tree(g, E.W * 0.3, GY - 6, 0.9, shade(M.wall, -0.45)); FX.fog(g, GY - 120, 200, M.fog, 0.3); });
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, E.H, [mix('#5a5440', M.wall, 0.4), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    const r = rng(7); for (let i = 0; i < 260; i++) { const x = -E.W * 0.5 + r() * E.W * 2, yb = GY + 20 + r() * (E.H - GY), s = 0.4 + (yb - GY) / (E.H - GY) * 1.4, sway = Math.sin(t * 2.2 + x * 0.01) * 8 * s;
      seg(g, [[x, yb], [x + sway, yb - 60 * s]], 2.5 * s, mix('#8a7a54', M.dark, 0.35)); g.fillStyle = mix('#a08a58', M.dark, 0.35); g.beginPath(); g.ellipse(x + sway, yb - 66 * s, 3.5 * s, 10 * s, 0.2, 0, 7); g.fill(); } });
  FX.dust(g, t, { count: 60, color: '#d8d4c8', a: 0.35 });
  veil(g, '#202430', 0.15);
} });

// s30 — "и в каких странах, по расчётам учёных, выжить проще всего." globe turns: Iceland, then Australia + New Zealand
registerShot('s30', { draw(g, t, info) {
  const M = mood('night'), cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur) };
  const turn = ease.inOut(prog(t, 1.4, 3.0));
  const lon0 = lerp(-15, 155, turn), lat0 = lerp(48, -30, turn);
  const aIs = fade(t, info, 0.4) * (1 - prog(t, 1.4, 2.0)), aAu = ease.out(prog(t, 2.8, 3.3)), aNz = ease.out(prog(t, 3.1, 3.6));
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#03040a', '#070a18']); FX.stars(g, t, { count: 240, area: [-200, -200, E.W + 400, E.H + 400], seed: 6 }); });
  let P;
  layer(g, cam, 1, (g) => {
    const pulse = 0.75 + 0.25 * Math.sin(t * 5);
    P = globe(g, E.W / 2, E.H * 0.52, V(410, 420), { M, lon0, lat0, night: 0.35, lights: 0.3, t, hl: { is: aIs * pulse, au: aAu * pulse, nz: aNz * pulse }, lightDir: [-0.5, 0.5] });
    const tag = (key, str, a, dx, dy) => { const [x, y, z] = P(...PLACES[key]); if (z < 0.15 || a <= 0) return; seg(g, [[x, y], [x + dx, y + dy]], 2, alpha(S().ui.cream, a)); circle(g, x, y, 6, alpha(S().ui.gold, a)); label(g, str, x + dx + (dx > 0 ? 12 : -12), y + dy, { size: V(36, 36), a, align: dx > 0 ? 'left' : 'right', spacing: 3 }); };
    tag('is', 'ИСЛАНДИЯ', aIs, 220, -120);
    tag('au', 'АВСТРАЛИЯ', aAu, -260, -40);
    tag('nz', 'НОВАЯ ЗЕЛАНДИЯ', aNz, 160, 110);
  });
} });

// s31 — "А ещё вспомним семь раз," a giant glowing 7 and seven marks
registerShot('s31', { draw(g, t, info) {
  const M = mood('void'), ui = S().ui, cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur) }, t7 = 0.45;
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 60, seed: 2, area: [0, 0, E.W, E.H] }); });
  layer(g, cam, 1, (g) => {
    const on = ease.outBack(prog(t, t7 - 0.15, t7 + 0.35)); g.save(); g.translate(E.W / 2, E.H * 0.44); g.scale(0.4 + 0.6 * on, 0.4 + 0.6 * on);
    text(g, '7', 0, 0, { size: V(380, 400), color: ui.gold, font: FONTS.ui, weight: 900, glow: 60, glowColor: alpha(ui.gold, 0.8), alpha: clamp(on) }); g.restore();
    for (let i = 0; i < 7; i++) { const a = ease.out(prog(t, t7 + 0.2 + i * 0.1, t7 + 0.5 + i * 0.1)); const x = E.W / 2 + (i - 3) * 70, y = E.H * 0.78; seg(g, [[x, y - 40], [x, y + 40]], 10, alpha(i === 6 ? ui.accent : ui.cream, a)); }
    label(g, 'РАЗ НА КРАЮ', E.W / 2, E.H * 0.9, { size: V(34, 36), a: fade(t, info, t7 + 0.9), color: ui.text, spacing: 8, glow: 0 });
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// cliff set: night, moon, land on the left, edge at EX, fog-filled drop on the right
const EX = () => E.W * V(0.64, 0.7);
function cliff(g, t, cam) {
  const N = mood('night'), GY = E.H * V(0.74, 0.66);
  layer(g, cam, 0.1, (g) => { backdrop(g, N.sky); FX.stars(g, t, { count: 260, area: [-E.W, -E.H, E.W * 3, E.H * 1.6] }); FX.moon(g, E.W * 0.82, E.H * 0.2, 46); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: E.H * 0.82, amp: 50, color: shade(N.wall, -0.1), seed: 9 }); FX.fog(g, E.H * 0.62, 300, N.fog, 0.45); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = shade(N.dark, -0.2); g.beginPath(); g.moveTo(-E.W, GY); g.lineTo(EX(), GY); g.lineTo(EX() + 30, GY + 120); g.lineTo(EX() - 10, GY + 300); g.lineTo(EX() + 40, E.H * 2); g.lineTo(-E.W, E.H * 2); g.closePath(); g.fill();
    seg(g, [[-E.W, GY], [EX(), GY]], 4, alpha(N.rim, 0.35)); seg(g, [[EX(), GY], [EX() + 30, GY + 120]], 3, alpha(N.rim, 0.5));
    for (let i = 0; i < 30; i++) { const x = -E.W * 0.3 + i * 70; if (x > EX() - 40) break; seg(g, [[x, GY], [x + 6, GY - 14 - (i % 3) * 6]], 3, shade(N.dark, -0.2)); }
  });
  return { GY, N };
}
const ballR = () => V(150, 140);
function ball(g, t, x, GY, rot, N) {
  const R = ballR();
  globe(g, x, GY - R, R, { M: N, lon0: -rot * 180 / Math.PI * 0.8, lat0: 20, night: 0.5, lights: 0.8, t, lightDir: [0.6, 0.6] });
  FX.pool(g, x, GY + 4, R * 0.9, 12, N.rim, 0.1);
}

// s32 — "когда мир уже стоял на самом краю." the world rolls to the brink and stops
registerShot('s32', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.1 * k, x: 120 * k, y: 30 * k };
  const { GY, N } = cliff(g, t, cam);
  const R = ballR(), stop = EX() - R * 0.15, p = ease.out(prog(t, 0, 2.2)), x = lerp(E.W * 0.12, stop, p);
  const wob = t > 2.2 ? Math.sin((t - 2.2) * 9) * 6 * Math.exp(-(t - 2.2) * 2) : 0;
  layer(g, cam, 1, (g) => { ball(g, t, x + wob, GY, x / R, N); if (t > 2.0) for (let i = 0; i < 4; i++) { const d = (t * 1.2 + i * 0.3) % 1; circle(g, EX() + 8 + i * 10, GY + 10 + d * 300, 4, alpha(N.rim, 0.5 * (1 - d))); } });
  FX.dust(g, t, { count: 60, color: '#c9d4ff', a: 0.3 });
} });

// s33 — "И каждый раз его спасал человек." Petrov braces and pulls the world back from the edge
registerShot('s33', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.08 * k, x: 260 - 40 * k, y: 110 };
  const { GY, N } = cliff(g, t, cam);
  const R = ballR(), stop = EX() - R * 0.15, back = ease.inOut(prog(t, 0.6, 2.6)) * R * 0.9, x = stop - back;
  const s = 1.45, hx = x - R * 1.02, lean = { head: [-14, -204], sh: [-12, -170], hip: [0, -100], eF: [22, -158], hF: [56, -150], eB: [14, -150], hB: [52, -142], kF: [14, -52], fF: [26, 0], kB: [-14, -50], fB: [-30, 0] };
  const px = hx - 56 * s;
  layer(g, cam, 1, (g) => {
    ball(g, t, x, GY, x / R, N);
    petrov(g, { x: px, y: GY, s, facing: 1, pose: breathe(lean, t, 0.6, 2), expr: t < 1 ? 'worried' : 'determined', look: [1, -0.2], rim: { color: N.rim, dir: [0.4, -1], w: 4 } });
  });
  if (t > 2.4) FX.rings(g, E.W / 2, E.H / 2, t - 2.4, { count: 2, r0: 100, r1: 600, speed: 0.6, color: '#e8f0ff', a: 0.12 });
  FX.dust(g, t, { count: 60, color: '#c9d4ff', a: 0.3 });
} });

// s34 — "Это фильм о том, чего никто не хочет." title card over a dark horizon
registerShot('s34', { draw(g, t, info) {
  const N = mood('night'), cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), y: -10 * t };
  layer(g, cam, 0.2, (g) => { backdrop(g, N.sky); FX.stars(g, t, { count: 200, area: [-200, -200, E.W + 400, E.H] }); glow(g, E.W / 2, E.H * 0.9, E.W * 0.6, N.rim, 0.12); });
  layer(g, cam, 0.5, (g) => FX.skyline(g, { x: -200, y: E.H * V(0.86, 0.8), w: E.W + 400, maxH: V(220, 400), color: shade(N.wall, -0.4), windowColor: alpha(N.practical, 0.7), lit: 0.2, seed: 21 }));
  layer(g, cam, 0.8, (g) => { g.fillStyle = shade(N.dark, -0.4); g.fillRect(-E.W, E.H * V(0.86, 0.8), E.W * 3, E.H); });
  FX.dust(g, t, { count: 30, color: '#c9d4ff', a: 0.3 });
  UI.titleCard(g, t, { lines: ['ЧТО БУДЕТ, ЕСЛИ НАЧНЁТСЯ', 'ТРЕТЬЯ МИРОВАЯ'], dur: info.dur, y: E.H * V(0.44, 0.4) });
} });

// s35 — "И о том, почему этого до сих пор не случилось." dawn over the forest; Petrov watches the sunrise
registerShot('s35', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 - 0.08 * k, x: -60 + 40 * k, y: 30 };
  const { GY, M } = station(g, t, cam, { dawn: true, sunRise: k });
  layer(g, cam, 1, (g) => {
    const hx = E.W * 0.2, top = GY - 70;
    g.fillStyle = shade(M.dark, -0.3); g.beginPath(); g.ellipse(hx, top + 520, 760, 520, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = alpha(M.rim, 0.5); g.lineWidth = 3; g.beginPath(); g.ellipse(hx, top + 520, 760, 520, 0, Math.PI * 1.3, Math.PI * 1.75); g.stroke();
    petrov(g, { x: hx, y: top + 1, s: 1.1, facing: 1, pose: breathe(POSES.relaxed, t, 1, 3), expr: 'smile', look: [1, -0.3], rim: { color: M.rim, dir: [1, -0.3], w: 4 }, shadow: false });
  });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.35 });
  FX.lensStreak(g, E.W / 2 + V(720, 300), GY - V(400, 520) - 110 * k, E.W * 1.2, '#ffe0b0', 0.2);
} });
