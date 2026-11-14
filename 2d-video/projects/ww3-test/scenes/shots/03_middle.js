// shots/03_middle.js — the explanation (blueprint), the numbers, the globe, the question, the film's promise (timeline, scientists, history).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, FONTS, linGrad, radGrad, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { control, nearDesk } from '../sets/control.js';
import { study, studyDesk } from '../sets/study.js';
import { label, lt, globe, officerCap, chairAt } from '../lib.js';
import { SCI } from '../cast.js';

const fade = (t, info, a, b = 0.4) => ease.out(prog(t, a, a + b)) * clamp((info.dur - t) / 0.3);
const num = (n) => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ');

// s16 — "Это было солнце, отражённое от облаков." blueprint: sun → clouds → satellite
registerShot('s16', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur) };
  const c = UI.bpStroke(), gold = S().ui.gold;
  const tS = lt(info, 'солнце', 0.6), tR = lt(info, 'отражённое', 1.3), tC = lt(info, 'облаков', 2.4);
  layer(g, cam, 1, (g) => {
    UI.blueprint(g);
    // earth curve
    g.strokeStyle = alpha(c, 0.8); g.lineWidth = 3; g.beginPath(); g.arc(E.W / 2, E.H * 2.6, E.H * 1.95, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    // clouds on the horizon (appear early but light up on «облаков»)
    const cy = E.H * 0.7, cx = E.W * 0.5, on = ease.out(prog(t, tC - 0.2, tC + 0.3));
    for (const [dx, r] of [[-120, 50], [-50, 70], [40, 60], [110, 44], [-10, 46]]) { g.strokeStyle = on > 0 ? mix(c, gold, on) : c; g.lineWidth = 4; g.beginPath(); g.arc(cx + dx, cy - (r - 44) * 0.6, r, Math.PI, Math.PI * 2); g.stroke(); }
    seg(g, [[cx - 170, cy], [cx + 160, cy]], 4, on > 0 ? mix(c, gold, on) : c);
    // sun, top-left
    const sx = E.W * 0.13, sy = E.H * 0.2, sOn = ease.outBack(prog(t, tS - 0.1, tS + 0.4));
    g.save(); g.translate(sx, sy); g.scale(0.6 + 0.4 * sOn, 0.6 + 0.4 * sOn);
    ring(g, 0, 0, 56, 5, gold); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * 0.2; seg(g, [[Math.cos(a) * 74, Math.sin(a) * 74], [Math.cos(a) * 100, Math.sin(a) * 100]], 4, gold); } glow(g, 0, 0, 160, gold, 0.3 * sOn);
    g.restore();
    // satellite, top-right
    const ax = E.W * 0.8, ay = E.H * 0.2 + Math.sin(t * 1.2) * 6;
    g.save(); g.translate(ax, ay); g.rotate(0.35);
    rr(g, -34, -24, 68, 48, 6); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
    for (const s of [-1, 1]) { g.strokeRect(s > 0 ? 44 : -134, -16, 90, 32); seg(g, [[s * 34, 0], [s * 44, 0]], 3, c); for (let k = 1; k < 4; k++) seg(g, [[s > 0 ? 44 + k * 22 : -134 + k * 22, -16], [s > 0 ? 44 + k * 22 : -134 + k * 22, 16]], 2, alpha(c, 0.6)); }
    seg(g, [[-10, 24], [-26, 52]], 4, c); circle(g, -28, 56, 8, c);
    g.restore();
    // the light path: sun → cloud top → satellite sensor
    const hit = [cx - 30, cy - 70], sens = [ax - 26, ay + 60];
    const p1 = ease.inOut(prog(t, tS + 0.2, tR + 0.2)), p2 = ease.inOut(prog(t, tR + 0.1, tR + 1.0));
    g.setLineDash([16, 12]);
    if (p1 > 0) seg(g, [[sx + 40, sy + 40], [lerp(sx + 40, hit[0], p1), lerp(sy + 40, hit[1], p1)]], 5, gold);
    if (p2 > 0) seg(g, [hit, [lerp(hit[0], sens[0], p2), lerp(hit[1], sens[1], p2)]], 5, S().ui.accent);
    g.setLineDash([]);
    if (p2 > 0.98) { FX.rings(g, sens[0], sens[1], t - tR - 1, { count: 2, r0: 10, r1: 90, color: S().ui.accent, a: 0.7 }); glow(g, sens[0], sens[1], 80, S().ui.accent, 0.8); }
    if (p1 > 0.98) { glow(g, hit[0], hit[1], 120, gold, 0.6); FX.sparkle(g, hit[0], hit[1], 40, '#fff6dc', 0.9); }
    const L = (str, x, y, a, col = S().ui.cream, align = 'center') => label(g, str, x, y, { size: V(36, 40), a, color: col, align, spacing: 4 });
    L('СОЛНЦЕ', sx, sy + 150, fade(t, info, tS));
    L('СПУТНИК', ax, ay - 110, fade(t, info, 0.2));
    L('ОБЛАКА', cx, cy + 70, fade(t, info, tC - 0.1), gold);
    L('БЛИК → «СТАРТ»', sens[0] - 40, sens[1] + 120, fade(t, info, tR + 1.0), S().ui.accent);
  });
} });

// s17 — "около двенадцати тысяч ядерных боеголовок." dot matrix: 120 dots × 100
registerShot('s17', { draw(g, t, info) {
  const ui = S().ui, t0 = lt(info, 'двенадцати', 1.4), cam = { z: 1.0 + 0.04 * t / info.dur };
  const M = mood('void');
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 80, area: [0, 0, E.W, E.H], seed: 9 }); });
  layer(g, cam, 1, (g) => {
    const a = fade(t, info, 0, 0.4); g.save(); g.globalAlpha *= a;
    const cw = V(1400, 960), ch = V(760, 1100), x = (E.W - cw) / 2, y = (E.H - ch) / 2;
    rr(g, x, y, cw, ch, 28); g.fillStyle = ui.card; g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2.5; g.stroke();
    label(g, 'ЯДЕРНЫЕ БОЕГОЛОВКИ', x + 70, y + 86, { size: V(46, 48), color: ui.text, align: 'left', spacing: 2, glow: 0 });
    label(g, 'В МИРЕ СЕГОДНЯ · 1 ТОЧКА = 100', x + 72, y + 132, { size: V(22, 26), color: ui.sub, align: 'left', spacing: 3, glow: 0 });
    const p = ease.inOut(prog(t, t0, t0 + 1.4));
    text(g, '≈ ' + num(12000 * p), x + cw - 70, y + 104, { size: V(96, 96), color: ui.gold, font: FONTS.ui, weight: 900, align: 'right', glow: 24, glowColor: alpha(ui.gold, 0.5) });
    const cols = 20, rows = 6, gx = x + 90, gy = y + 230, sx = (cw - 180) / (cols - 1), sy = V(80, 120);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const n = j * cols + i, on = clamp(p * 120 - n);
      circle(g, gx + i * sx, gy + j * sy, 13, alpha(ui.text, 0.12)); if (on > 0) { circle(g, gx + i * sx, gy + j * sy, 13 * (0.6 + 0.4 * on), mix(ui.gold, '#fff3d6', 0.2)); glow(g, gx + i * sx, gy + j * sy, 30, ui.gold, 0.25 * on); } }
    g.restore();
  });
} });

// s18 — "Меньше, чем в восьмидесятых, но" comparison bars 1986 vs today
registerShot('s18', { draw(g, t, info) {
  const ui = S().ui, t8 = lt(info, 'восьмидесятых', 2.0), cam = { z: 1.0 + 0.04 * t / info.dur, x: -10 * t };
  const M = mood('void');
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 80, area: [0, 0, E.W, E.H], seed: 9 }); });
  layer(g, cam, 1, (g) => {
    const x0 = V(420, 120), x1 = E.W - V(200, 120), full = x1 - x0, y1 = E.H * V(0.4, 0.4), y2 = E.H * V(0.64, 0.58);
    const row = (y, lab, v, p, col, a) => { if (a <= 0) return; g.save(); g.globalAlpha *= a;
      label(g, lab, x0 - 40, y, { size: V(48, 44), align: 'right', color: ui.cream, spacing: 2 });
      rr(g, x0, y - 34, full, 68, 34); g.fillStyle = alpha(col, 0.1); g.fill();
      const w = Math.max(68, full * (v / 70000) * p); rr(g, x0, y - 34, w, 68, 34); g.fillStyle = col; g.fill(); glow(g, x0 + w, y, 80, col, 0.5);
      text(g, '≈ ' + num(v * p), x0 + w + (w > full * 0.8 ? -30 : 30), y + 2, { size: V(56, 52), color: w > full * 0.8 ? '#1a0e0a' : col, font: FONTS.ui, weight: 900, align: w > full * 0.8 ? 'right' : 'left', glow: w > full * 0.8 ? 0 : 14, glowColor: alpha(col, 0.6) });
      g.restore(); };
    row(y1, '1986', 70000, ease.out(prog(t, t8, t8 + 1.0)), ui.accent, fade(t, info, t8 - 0.3));
    row(y2, 'СЕГОДНЯ', 12000, ease.out(prog(t, 0.2, 1.0)), ui.gold, fade(t, info, 0.1));
    label(g, 'ЯДЕРНЫХ БОЕГОЛОВОК В МИРЕ', E.W / 2, E.H * V(0.2, 0.22), { size: V(34, 38), color: ui.text, spacing: 6, a: fade(t, info, 0) });
  });
} });

// s19 — "достаточно, чтобы изменить жизнь на всей планете." the night globe with city lights
registerShot('s19', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.07 * k };
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#03040a', '#070a18']); FX.stars(g, t, { count: 260, area: [-200, -200, E.W + 400, E.H + 400], seed: 3 }); });
  layer(g, cam, 1, (g) => {
    globe(g, E.W / 2, E.H * V(0.55, 0.5), V(420, 420), { M, lon0: 10 + 18 * t / info.dur * 1.0 + 10, lat0: 28, night: 0.95, lights: 1, t, lightDir: [-0.9, 0.2] });
  });
  FX.lensStreak(g, E.W / 2 - V(420, 420) * 0.9, E.H * 0.45, E.W * 0.8, '#bcd0ff', 0.12);
} });

// s20 — "Так что будет, если однажды рядом не окажется своего Петрова?" the empty chair, the cap left on the desk, rack focus to the question
registerShot('s20', { draw(g, t, info) {
  const tq = lt(info, 'если', 1.6), k = ease.inOut(t / info.dur), cam = { z: 1.45 + 0.1 * k, x: -150 + 30 * k, y: 140 };
  const scene = (g) => { const r = control(g, t, cam, { alarm: 0.35, banner: 0.6, arcs: [0, 1, 2, 3, 4].map(() => ({ p: 0.4 })), crewExpr: 'worried' });
    layer(g, cam, 1, (g) => { const px = E.W / 2 - V(260, 200); chairAt(g, px, r.GY, 1.25, 1, '#0d0f1c');
      const d = nearDesk(g, t, r.GY, r.M, { x: px + V(112, 88), alarm: 0.35, keyC: r.keyC });
      const cr = 26 * 1.3; officerCap(g, d.x + 290, d.top - 14 + cr * 0.48, cr, -1, { rim: r.M.rim, rimDir: [0.5, -1] }); });
    FX.dust(g, t, { count: 50, color: '#ffc0b0', a: 0.25 }); };
  const bl = 16 * ease.inOut(prog(t, tq - 0.6, tq + 0.4));
  if (bl < 0.5) scene(g); else { blurLayer(g, bl, scene); veil(g, '#05060c', 0.35 * bl / 16); }
  const a = fade(t, info, tq, 0.5), a2 = fade(t, info, lt(info, 'своего', 3.3) - 0.2, 0.5);
  label(g, 'ЕСЛИ РЯДОМ НЕ ОКАЖЕТСЯ', E.W / 2, E.H * 0.42, { size: V(66, 60), a, color: S().ui.cream, spacing: 6 });
  label(g, 'СВОЕГО ПЕТРОВА?', E.W / 2, E.H * 0.42 + V(110, 100), { size: V(112, 96), a: a2, color: S().ui.gold, spacing: 8, glow: 30 });
} });

// s21 — "В этом фильме мы пройдём по часам:" clock hands racing
registerShot('s21', { draw(g, t, info) {
  const M = mood('void'), cam = { z: 1.0 + 0.1 * ease.inOut(t / info.dur), r: 0.02 * t };
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 60, seed: 4, area: [0, 0, E.W, E.H] }); });
  FX.speedLines(g, t, { cx: E.W / 2, cy: E.H / 2, count: 50, a: 0.12, inner: 380, color: '#bcd0ff' });
  layer(g, cam, 1, (g) => {
    const r = V(330, 330), spin = Math.pow(t, 2) * 3600 * 6;
    glow(g, E.W / 2, E.H / 2, r * 1.8, M.rim, 0.2);
    FX.clock(g, E.W / 2, E.H / 2, r, 15 * 60 + spin, { face: '#dfe5f5', ink: '#0b0d16', red: S().ui.accent });
    FX.rings(g, E.W / 2, E.H / 2, t, { count: 3, r0: r * 1.05, r1: r * 1.6, speed: 1, color: '#dfe5f5', a: 0.3 });
  });
} });

// s22 — "первый час, первые сутки, неделя, год, десять лет." timeline with a walking line figure
registerShot('s22', { draw(g, t, info) {
  const M = mood('void'), ui = S().ui, cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur), x: -20 * t / info.dur };
  const T = [lt(info, 'первый', 0.1), lt(info, 'сутки', 1.8), lt(info, 'неделя', 2.5), lt(info, 'год', 3.2), lt(info, 'десять', 3.55)];
  const L = ['ПЕРВЫЙ ЧАС', 'СУТКИ', 'НЕДЕЛЯ', 'ГОД', '10 ЛЕТ'], top = ['1 ч', '24 ч', '7 дн', '365 дн', '3650 дн'];
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 90, seed: 8, area: [0, 0, E.W, E.H] }); FX.fog(g, E.H * 0.62, 260, M.rim, 0.06); });
  layer(g, cam, 1, (g) => {
    const x0 = V(220, 120), x1 = E.W - V(220, 120), y = E.H * V(0.6, 0.55), xs = (i) => lerp(x0, x1, i / 4);
    seg(g, [[x0 - 60, y], [x1 + 60, y]], 4, alpha(ui.blueprint, 0.35));
    let lit = -1; T.forEach((tt, i) => { if (t > tt - 0.05) lit = i; });
    const fillTo = lit < 0 ? x0 : lerp(xs(Math.max(0, lit - 1)), xs(lit), ease.out(prog(t, T[Math.max(0, lit)] - 0.05, T[Math.max(0, lit)] + 0.3)));
    if (lit >= 0) { seg(g, [[x0, y], [fillTo, y]], 6, ui.gold); glow(g, fillTo, y, 60, ui.gold, 0.6); }
    T.forEach((tt, i) => { const on = ease.outBack(prog(t, tt - 0.05, tt + 0.3)), x = xs(i);
      ring(g, x, y, 22, 4, on > 0 ? ui.gold : alpha(ui.blueprint, 0.5)); if (on > 0) { circle(g, x, y, 12 * on, ui.gold); glow(g, x, y, 90, ui.gold, 0.35 * on); }
      label(g, L[i], x, y + 80, { size: V(38, 34), a: 0.35 + 0.65 * clamp(on), color: on > 0 ? ui.cream : ui.text, spacing: 3, glow: on > 0 ? 14 : 0 });
      label(g, top[i], x, y - 70, { size: V(30, 28), a: clamp(on), color: ui.gold, spacing: 2 }); });
    // walking line figure along the line
    const wx = lit < 0 ? x0 - 40 : fillTo - 10, ph = t * Math.PI * 2 * 0.9;
    UI.lineFigure(g, { x: wx - 40, y: y - 6, s: 0.55, pose: walkPose(ph), color: alpha('#e8f0ff', 0.9) });
  });
} });

// s23 — "Без страшилок и без политики." the scientist at the desk under the lamp, two calm labels
registerShot('s23', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.06 * k, x: -40 + 30 * k, y: 60 };
  const { GY, M } = study(g, t, cam);
  layer(g, cam, 1, (g) => {
    const x = E.W / 2 - V(260, 160), s = 1.35;
    chairAt(g, x, GY, s, 1, '#1c1418');
    drawFigure(g, { x, y: GY, s, facing: 1, outfit: SCI, pose: breathe({ ...POSES.sit, eF: [30, -118], hF: [58, -136], eB: [22, -116], hB: [50, -130], head: [8, -178] }, t, 1, 5), expr: 'thinking', look: [0.6, 0.5], rim: { color: M.rim, dir: [1, -0.4] }, blink: (t % 3.4) > 3.3 });
    studyDesk(g, t, GY, M, x + 70 * s);
  });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.3 });
  const pill = (str, x, y, a) => { if (a <= 0) return; g.save(); g.globalAlpha *= a; const w = V(420, 400); rr(g, x - w / 2, y - 40, w, 80, 40); g.fillStyle = 'rgba(10,12,24,.65)'; g.fill(); g.strokeStyle = alpha(S().ui.cream, 0.5); g.lineWidth = 2; g.stroke(); g.restore(); label(g, str, x, y + 2, { size: V(34, 34), a, spacing: 4 }); };
  pill('БЕЗ СТРАШИЛОК', E.W * V(0.7, 0.5), E.H * V(0.3, 0.2), fade(t, info, lt(info, 'страшилок', 0.5)));
  pill('БЕЗ ПОЛИТИКИ', E.W * V(0.7, 0.5), E.H * V(0.3, 0.2) + 110, fade(t, info, lt(info, 'политики', 1.6)));
} });

// s24 — "Только то, что посчитали учёные," the scientist at the chalkboard, graph drawing on
registerShot('s24', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.2 + 0.05 * k, x: 120 - 40 * k, y: 120 };
  const { GY, M } = study(g, t, cam, { board: ease.inOut(prog(t, 0.2, 2.3)) });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + V(180, 160), y: GY, s: 1.5, facing: -1, outfit: SCI, pose: breathe(posesAt(t, [[0, POSES.stand], [0.4, POSES.point]]), t, 1, 7), expr: 'smile', prop: { type: 'pointer' }, rim: { color: M.rim, dir: [-1, -0.5] }, blink: (t % 3.1) > 3.0 });
  });
  blurLayer(g, 10, (g) => { g.fillStyle = '#120c10'; rr(g, -40, E.H - 220, 380, 300, 30); g.fill(); g.fillStyle = 'rgba(255,200,140,.35)'; circle(g, 200, E.H - 230, 70, 'rgba(255,210,150,.25)'); }, cam, 1.6);
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// s25 — "и то, что уже случалось в истории." cork board with year cards and red strings
registerShot('s25', { draw(g, t, info) {
  const M = mood('interiorWarm'), k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.12 * k, x: 30 - 60 * k };
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, E.H * 2, [shade(M.wall, -0.6), shade(M.wall, -0.4)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.9, (g) => {
    const bx = V(160, 60), by = V(110, 300), bw = E.W - 2 * bx, bh = V(820, 1200);
    rr(g, bx - 18, by - 18, bw + 36, bh + 36, 8); g.fillStyle = '#2a1c14'; g.fill();
    g.fillStyle = linGrad(g, 0, by, 0, by + bh, ['#7a5a3a', '#5a4028']); g.fillRect(bx, by, bw, bh);
    const r = rng(14); g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 400; i++) g.fillRect(bx + r() * bw, by + r() * bh, 3, 3);
    const cards = [['1962', 0.18, 0.3, -0.05], ['1983', 0.5, 0.52, 0.03], ['1995', 0.8, 0.3, 0.06], ['1973', 0.3, 0.75, 0.04], ['1979', 0.7, 0.76, -0.04]];
    const pos = cards.map(([, u, v]) => [bx + u * bw, by + v * bh]);
    const sp = ease.inOut(prog(t, 0.6, 2.4));
    [[0, 1], [1, 2], [1, 3], [1, 4]].forEach(([a, b], i) => { const q = clamp(sp * 4 - i); if (q <= 0) return; seg(g, [pos[a], [lerp(pos[a][0], pos[b][0], q), lerp(pos[a][1], pos[b][1], q)]], 3, S().ui.accent); });
    cards.forEach(([y, , , rot], i) => { const [x, yy] = pos[i], on = ease.outBack(prog(t, 0.1 + i * 0.18, 0.5 + i * 0.18)); if (on <= 0) return;
      g.save(); g.translate(x, yy); g.rotate(rot); g.scale(on, on);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-120, -70, 250, 160); g.fillStyle = '#efe6d2'; g.fillRect(-130, -80, 250, 160);
      text(g, y, -5, -20, { size: 64, color: i === 1 ? S().ink : '#3a2a20', font: FONTS.ui, weight: 900 });
      g.fillStyle = 'rgba(58,42,32,.5)'; for (let l = 0; l < 3; l++) g.fillRect(-100, 30 + l * 14, 150 - l * 30, 5);
      g.restore(); circle(g, x, yy - 70, 10, S().ui.accent); });
  });
  glow(g, E.W * 0.5, E.H * 0.2, E.W * 0.5, M.key, 0.15);
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });
