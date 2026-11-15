// templates/richest.js — сцены и графика фильма «Кто был самым богатым человеком в истории?».
// Весь текст на экране — из params (по-русски). Камера: params.cam {move, z, amt}.
import { E, V, S, layer, ease, prog, clamp, lerp, seg, poly, circle, ring, rr, glow, alpha, shade, text, FONTS, linGrad, radGrad, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, breathe, walkPose } from '/engine/rig2d.js';
import { tpl } from './_registry.js';
import { cue, showAt, popAt, camMove, plate, source, bigNum, fig } from '../lib.js';
import { voidBg } from './graphics.js';

const camOf = (info, t, def = {}) => camMove(t, info.dur, { ...def, ...(info.cam || {}) });
const GOLD = '#e8b84a', CREAM = '#f3ead8', RED = '#e0644f';
const T = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 40, color: o.color ?? CREAM, font: o.serif ? FONTS.serif : FONTS.ui, weight: o.weight ?? 900, spacing: o.spacing ?? 2, alpha: o.a ?? 1, align: o.align ?? 'center', glow: o.glow ?? 0, glowColor: o.glowColor });
const sky = (g, cols) => { g.fillStyle = linGrad(g, 0, -E.H * 0.3, 0, E.H, cols); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); };
const GY = () => E.H * V(0.8, 0.68);
const tagAt = (g, t, info) => { if (info.tag) plate(g, typeof info.tag === 'string' ? info.tag : info.tag.str, showAt(t, 0.4, info.dur)); };

// ---------------------------------------------------------------- пустыня и караван
function dunes(g, t, cam, o = {}) {
  const night = o.night, cols = night ? ['#0b1030', '#1f2650', '#3a3550'] : ['#e9a25a', '#f2c27a', '#f7dcae'];
  layer(g, cam, 0.1, (g) => { sky(g, cols); if (night) FX.stars(g, t, { count: 160 }); else FX.sun(g, E.W * 0.75, E.H * 0.3, 60, '#fff3d0', '#ffcf7a', 3); });
  const layers = night ? ['#2a2440', '#221c36', '#1a1529'] : ['#d9965a', '#c47f45', '#a8683a'];
  layers.forEach((c, i) => layer(g, cam, 0.3 + i * 0.3, (g) => FX.hills(g, { seed: 3 + i, y: E.H * (0.62 + i * 0.09), amp: 60 - i * 10, color: c, freq: 0.003 + i * 0.001 })));
}
function camel(g, x, y, s, ph, col, rider) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const legs = [-55, -35, 35, 55].map((lx, i) => [lx, Math.sin(ph + i * 1.6) * 10]);
  legs.forEach(([lx, sw]) => seg(g, [[lx, -95], [lx + sw * 0.5, -48], [lx + sw, 0]], 9, col));
  g.fillStyle = col; g.beginPath(); g.ellipse(0, -110, 75, 32, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(-5, -140, 34, 26, 0, 0, Math.PI * 2); g.fill();
  seg(g, [[60, -110], [92, -150], [100, -185]], 18, col); g.beginPath(); g.ellipse(112, -188, 22, 12, 0.2, 0, Math.PI * 2); g.fill();
  if (rider) { seg(g, [[-5, -160], [-5, -205]], 14, rider); circle(g, -5, -222, 14, rider); poly(g, [[-25, -170], [15, -170], [10, -135], [-20, -135]], rider); }
  g.restore();
}
tpl('caravan', 'Desert caravan of camels walking across dunes. params: night (bool), n (camels), gate (bool: city gate silhouette at the right), lead (bool: a gold-robed rider in front), tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftR', amt: 0.5 }); dunes(g, t, cam, { night: info.night });
    const col = info.night ? '#0e0c18' : '#4a2c1a', n = info.n || 7, gy = E.H * 0.86;
    if (info.gate) layer(g, cam, 0.7, (g) => { const x = E.W * 0.86; g.fillStyle = col; g.fillRect(x - 120, gy - 330, 240, 330); g.fillRect(x - 160, gy - 250, 40, 250); g.fillRect(x + 120, gy - 250, 40, 250);
      g.fillStyle = info.night ? '#3a3350' : '#f2c27a'; g.beginPath(); g.moveTo(x - 60, gy); g.lineTo(x - 60, gy - 150); g.arc(x, gy - 150, 60, Math.PI, 0); g.lineTo(x + 60, gy); g.fill(); });
    layer(g, cam, 0.85, (g) => { for (let i = 0; i < n; i++) { const x = ((t * 55 + i * 250) % (E.W * 1.8)) - E.W * 0.4; camel(g, x, gy - (i % 2) * 20, 0.75 - (i % 3) * 0.06, t * 3 + i, col, i === n - 1 && info.lead ? '#e8b84a' : (i % 2 ? shade(col, 0.15) : null)); } });
    tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- Каир: базар и приём у султана
function arches(g, y, col, n = 6) { for (let i = 0; i < n; i++) { const x = (i + 0.5) * E.W / n; g.fillStyle = col; g.fillRect(x - E.W / n / 2, y - 420, E.W / n, 420);
  g.fillStyle = shade(col, -0.35); g.beginPath(); g.moveTo(x - 70, y); g.lineTo(x - 70, y - 230); g.arc(x, y - 230, 70, Math.PI, 0); g.lineTo(x + 70, y); g.fill(); } }
tpl('bazaar', 'Cairo market 1324: arches, stalls with cloth, traders; a scale weighing gold on the front stall (cue "weigh"). params: tag, price (bool: price tags flip up)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.2, (g) => { sky(g, ['#f0b46a', '#f7d19a', '#f8e3c2']); FX.sun(g, E.W * 0.2, E.H * 0.2, 50, '#fff6e0', '#ffd59a', 3); });
    layer(g, cam, 0.5, (g) => { arches(g, gy - 40, '#c98f58'); FX.fog(g, gy - 300, 300, '#f6dcb4', 0.25); });
    layer(g, cam, 0.8, (g) => { ['#b8452f', '#2f6b8a', '#d4a03a', '#6a8a3a'].forEach((c, i) => { const x = E.W * (0.12 + i * 0.25); poly(g, [[x - 120, gy - 260], [x + 120, gy - 260], [x + 150, gy - 200], [x - 150, gy - 200]], c); g.fillStyle = '#5a3a22'; g.fillRect(x - 130, gy - 110, 260, 22); g.fillRect(x - 120, gy - 200, 10, 200); g.fillRect(x + 110, gy - 200, 10, 200); });
      g.fillStyle = '#7a5434'; g.fillRect(-E.W, gy, E.W * 3, E.H); });
    layer(g, cam, 1, (g) => {
      [[0.08, 'trader', 1], [0.33, 'robe', -1], [0.6, 'trader', 1], [0.86, 'musa', -1]].forEach(([fx, who, f], i) => fig(g, who, { x: E.W * fx, y: gy, s: 1.15, facing: f, pose: breathe(POSES[i === 0 ? 'explain' : 'stand'], t, 1, i), expr: i === 0 ? 'smile' : 'neutral' }));
      // весы
      const k = ease.inOut(prog(t, cue(info, 'weigh', 0.4), cue(info, 'weigh', 0.4) + 1.2)), x = E.W * 0.36, y = gy - 150, tilt = 0.18 * k;
      seg(g, [[x, y], [x, y - 120]], 8, '#3b2a1c'); g.save(); g.translate(x, y - 120); g.rotate(tilt); seg(g, [[-110, 0], [110, 0]], 7, '#3b2a1c');
      [[-110, GOLD], [110, '#cfd5e0']].forEach(([px, c]) => { seg(g, [[px, 0], [px, 50]], 3, '#3b2a1c'); g.save(); g.translate(px, 50); g.rotate(-tilt); poly(g, [[-45, 0], [45, 0], [30, 18], [-30, 18]], '#5a3a22'); circle(g, -10, -8, 12, c); circle(g, 12, -10, 12, c); glow(g, 0, -10, 40, c, 0.4); g.restore(); });
      g.restore(); });
    tagAt(g, t, info);
  } });
tpl('throneRoom', 'Mamluk throne room: the sultan on a throne, Mansa Musa standing before him. Cues: "bow" (Musa bows), "rise" (sultan rises), "sit" (Musa sits beside). params: tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.3, (g) => { sky(g, ['#3a1f1a', '#5a2f22', '#7a4630']); for (let i = 0; i < 5; i++) { const x = E.W * (0.1 + i * 0.2); g.fillStyle = '#2a1510'; g.fillRect(x - 30, 0, 60, gy); glow(g, x, gy - 420, 80, '#ffb35a', 0.5); }
      g.fillStyle = '#8a5a2a'; g.fillRect(-E.W, gy, E.W * 3, E.H); for (let i = -10; i < 30; i++) seg(g, [[i * 120, gy], [i * 120 - 300, E.H * 1.2]], 2, alpha('#3a2010', 0.5)); });
    const bow = cue(info, 'bow', 0.45), rise = cue(info, 'rise', 0.6), sit = cue(info, 'sit', 0.8);
    layer(g, cam, 1, (g) => {
      const tx = E.W * 0.68; poly(g, [[tx - 110, gy], [tx + 110, gy], [tx + 95, gy - 330], [tx - 95, gy - 330]], '#c99a3a'); poly(g, [[tx - 80, gy - 330], [tx + 80, gy - 330], [tx, gy - 400]], '#e8c060');
      const up = t > rise; fig(g, 'sultan', { x: tx, y: gy - (up ? 0 : 0), s: 1.2, facing: -1, pose: breathe(up ? POSES.wave : POSES.sit, t, 1, 2), expr: up ? 'smile' : 'neutral' });
      const mx = t > sit ? tx - 230 : E.W * 0.3, bowing = t > bow && t < bow + 1.6;
      fig(g, 'musa', { x: mx, y: gy, s: 1.2, facing: 1, pose: breathe(t > sit ? POSES.sit : bowing ? POSES.sad : POSES.stand, t, 1, 4), expr: t > sit ? 'smile' : 'neutral' });
      for (let i = 0; i < 4; i++) fig(g, 'robe', { x: E.W * (0.04 + i * 0.07), y: gy + 40, s: 0.95, facing: 1, pose: POSES.stand, sil: true });
    });
    tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- Рим: пожары и Красс
function insula(g, x, gy, w, h, col) { g.fillStyle = col; g.fillRect(x, gy - h, w, h); g.fillStyle = shade(col, -0.3); g.fillRect(x - 8, gy - h - 14, w + 16, 16);
  for (let r = 0; r < Math.floor(h / 70); r++) for (let c = 0; c < Math.floor(w / 50); c++) { g.fillStyle = '#2a1a14'; g.fillRect(x + 14 + c * 50, gy - h + 24 + r * 70, 22, 34); } }
function flames(g, x, y, s, t, seed) { const r = rng(seed); for (let i = 0; i < 9; i++) { const ph = t * 6 + i * 1.7, h = (90 + r() * 90) * s * (0.8 + 0.25 * Math.sin(ph)), px = x + (r() - 0.5) * 160 * s;
  poly(g, [[px - 26 * s, y], [px + 26 * s, y], [px + Math.sin(ph) * 10 * s, y - h]], i % 2 ? '#ff8a2a' : '#ffcf4a'); } glow(g, x, y - 80 * s, 240 * s, '#ff7a2a', 0.55); }
tpl('fireRome', 'Rome at night: apartment blocks; one burns (cue "fire"); Crassus in a white toga talks to the owner; builders (cue "build") rebuild. params: mode (fire|deal|build), tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY(), mode = info.mode || 'fire';
    layer(g, cam, 0.15, (g) => { sky(g, ['#0d0f24', '#2a1d36', '#5a2f3a']); FX.stars(g, t, { count: 80 }); });
    layer(g, cam, 0.5, (g) => { [[0.02, 260, 380], [0.3, 220, 300], [0.55, 280, 420], [0.82, 240, 340]].forEach(([fx, w, h], i) => insula(g, E.W * fx, gy, w, h, i === 2 && mode !== 'build' ? '#7a4a3a' : '#9a6a52')); });
    if (mode !== 'build') layer(g, cam, 0.55, (g) => flames(g, E.W * 0.55 + 140, gy - 420, 1.1, t, 4));
    if (mode === 'build') layer(g, cam, 0.55, (g) => { const x = E.W * 0.55; for (let i = 0; i < 6; i++) seg(g, [[x - 20 + i * 64, gy], [x - 20 + i * 64, gy - 460]], 6, '#c9a46a'); for (let j = 0; j < 6; j++) seg(g, [[x - 30, gy - 70 - j * 70], [x + 320, gy - 70 - j * 70]], 5, '#c9a46a'); });
    layer(g, cam, 1, (g) => { g.fillStyle = '#2a1e1c'; g.fillRect(-E.W, gy, E.W * 3, E.H);
      if (mode === 'build') for (let i = 0; i < 5; i++) fig(g, 'worker', { x: E.W * (0.5 + i * 0.08), y: gy, s: 1.0, facing: i % 2 ? -1 : 1, pose: breathe(i % 2 ? POSES.reach : POSES.holdFront, t, 1.4, i), expr: 'sad' });
      else { fig(g, 'crassus', { x: E.W * 0.28, y: gy, s: 1.25, facing: 1, pose: breathe(mode === 'deal' ? POSES.explain : POSES.stand, t, 1, 1), expr: 'neutral' });
        fig(g, 'trader', { x: E.W * 0.42, y: gy, s: 1.2, facing: -1, pose: breathe(POSES.shrug, t, 1, 3), expr: 'sad' }); }
    });
    tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- промышленность: нефть, сталь
tpl('oilfield', 'Pennsylvania oil field 1860s–1900s: wooden derricks, tanks, a train of tank cars. params: dusk (bool), tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.15, (g) => { sky(g, info.dusk ? ['#2a1f3a', '#7a4a4a', '#e09a5a'] : ['#7aa0c8', '#c8d8e8', '#e8e0d0']); });
    layer(g, cam, 0.4, (g) => FX.hills(g, { seed: 4, y: gy - 120, amp: 50, color: '#5a5048' }));
    layer(g, cam, 0.7, (g) => { for (let i = 0; i < 8; i++) { const x = E.W * (i * 0.14 - 0.05), h = 260 + (i % 3) * 60; const c = '#2a2018';
      seg(g, [[x - 50, gy], [x, gy - h]], 6, c); seg(g, [[x + 50, gy], [x, gy - h]], 6, c); for (let k = 1; k < 5; k++) seg(g, [[x - 50 + k * 10, gy - k * h / 5], [x + 50 - k * 10, gy - k * h / 5]], 3, c); }
      [0.2, 0.62].forEach((fx) => { g.fillStyle = '#3a3028'; rr(g, E.W * fx, gy - 120, 200, 120, 16); g.fill(); }); });
    layer(g, cam, 1, (g) => { g.fillStyle = '#3a2e24'; g.fillRect(-E.W, gy, E.W * 3, E.H); seg(g, [[-E.W, gy + 40], [E.W * 2, gy + 40]], 4, '#1a1410');
      for (let i = 0; i < 6; i++) { const x = ((t * 80 + i * 230) % (E.W * 1.6)) - E.W * 0.3; g.fillStyle = '#1a1612'; rr(g, x, gy - 30, 200, 60, 26); g.fill(); circle(g, x + 40, gy + 34, 12, '#0e0b08'); circle(g, x + 160, gy + 34, 12, '#0e0b08'); } });
    tagAt(g, t, info);
  } });
tpl('steelMill', 'Steel mill on a river: stacks with smoke, glowing furnace doors; optional strike crowd at the gate (crowd: true). params: tag, crowd', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.15, (g) => { sky(g, ['#1a1a26', '#3a3040', '#6a4a40']); });
    layer(g, cam, 0.5, (g) => { g.fillStyle = '#1e1a20'; g.fillRect(E.W * 0.1, gy - 300, E.W * 0.8, 300); for (let i = 0; i < 6; i++) { const x = E.W * (0.18 + i * 0.12); g.fillRect(x - 20, gy - 560, 40, 260);
      for (let k = 0; k < 5; k++) { const ph = (t * 0.25 + k * 0.2 + i * 0.13) % 1; circle(g, x + ph * 160, gy - 580 - ph * 260, 30 + ph * 70, alpha('#5a5560', 0.45 * (1 - ph))); } }
      for (let i = 0; i < 8; i++) { const x = E.W * (0.14 + i * 0.09); g.fillStyle = '#ff8a2a'; g.fillRect(x, gy - 120, 50, 70); glow(g, x + 25, gy - 85, 90, '#ff7a2a', 0.4 + 0.15 * Math.sin(t * 5 + i)); } });
    layer(g, cam, 1, (g) => { g.fillStyle = '#141218'; g.fillRect(-E.W, gy, E.W * 3, E.H); if (info.crowd) for (let i = 0; i < 9; i++) fig(g, 'worker', { x: E.W * (0.2 + i * 0.07), y: gy + 30, s: 0.95, facing: 1, pose: breathe(POSES.stand, t, 1, i), expr: 'worried' }); });
    tagAt(g, t, info);
  } });
tpl('castle', 'Norman castle on a hill (Richmond): optional snowy wasteland with empty houses (waste: true). params: waste, tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.35 }), gy = GY();
    layer(g, cam, 0.15, (g) => { sky(g, info.waste ? ['#8a9ab0', '#c0c8d4', '#e0e4ea'] : ['#2a3050', '#6a6a88', '#c8a888']); if (info.waste) FX.snow(g, t, { count: 120 }); });
    layer(g, cam, 0.45, (g) => { FX.hills(g, { seed: 9, y: gy - 160, amp: 90, color: info.waste ? '#b8c0cc' : '#3a3a48' }); const x = E.W * 0.62, y = gy - 230, c = info.waste ? '#5a5f6a' : '#1e1e2a';
      g.fillStyle = c; g.fillRect(x - 150, y - 160, 300, 160); g.fillRect(x - 60, y - 300, 120, 300); for (let i = 0; i < 6; i++) g.fillRect(x - 150 + i * 56, y - 190, 30, 30); for (let i = 0; i < 3; i++) g.fillRect(x - 60 + i * 45, y - 330, 28, 30); });
    layer(g, cam, 0.9, (g) => { g.fillStyle = info.waste ? '#dfe4ea' : '#2a2a34'; g.fillRect(-E.W, gy, E.W * 3, E.H);
      if (info.waste) [0.1, 0.25, 0.4, 0.8].forEach((fx, i) => { const x = E.W * fx;   // сожжённые дома: обугленные стены без крыш, дым, кое-где огонь
        poly(g, [[x - 60, gy], [x - 60, gy - 60], [x - 30, gy - 85], [x - 5, gy - 55], [x + 20, gy - 90], [x + 60, gy - 50], [x + 60, gy]], '#2a2420');
        for (let k = 0; k < 5; k++) { const ph = (t * 0.25 + k / 5 + i * 0.13) % 1; g.save(); g.globalAlpha *= 0.45 * (1 - ph); g.fillStyle = '#4a4a50'; g.beginPath(); g.arc(x + Math.sin(ph * 5 + i) * 30, gy - 90 - ph * 380, 30 + ph * 70, 0, 7); g.fill(); g.restore(); }
        if (i % 2 === 0) flames(g, x, gy - 10, 0.45, t, 30 + i); }); });
    tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- биржа и сегодняшний день
tpl('ticker', 'Stock-exchange screen: a running ticker tape and a price chart; drop (bool: the line falls sharply at cue "drop"), value (big label), sub. params: tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }); voidBg(g, t, cam);
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.12, x1 = E.W * 0.88, y0 = E.H * 0.25, y1 = E.H * 0.72, n = 60, r = rng(7), d = info.drop ? ease.inOut(prog(t, cue(info, 'drop', 0.5), cue(info, 'drop', 0.5) + 1)) : 0;
      g.strokeStyle = alpha('#9ab4e8', 0.15); g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x0, y0 + i * (y1 - y0) / 5); g.lineTo(x1, y0 + i * (y1 - y0) / 5); g.stroke(); }
      const pts = []; let v = 0.6; const shown = clamp(t / (info.dur * 0.7)); for (let i = 0; i <= n * shown; i++) { v += (r() - 0.45) * 0.06; if (i > n * 0.8) v -= d * 0.035; pts.push([lerp(x0, x1, i / n), lerp(y1, y0, clamp(v))]); }
      if (pts.length > 1) seg(g, pts, 5, d > 0.3 ? RED : '#5ad69a');
      if (info.value) { T(g, info.value, E.W / 2, E.H * 0.16, { size: 70, color: GOLD }); if (info.sub) T(g, info.sub, E.W / 2, E.H * 0.16 + 60, { size: 24 }); }
      const tape = info.tape || '  АКЦИИ ▲   ИНДЕКС ▼   НЕФТЬ ▲   ЗОЛОТО ▲   ДОЛЛАР ▼   ЕВРО ▲   МЕДЬ ▲   ЗЕРНО ▼'; g.fillStyle = '#0b1328'; g.fillRect(-E.W, E.H * 0.8, E.W * 3, 60);
      T(g, tape + tape, E.W * 1.2 - (t * 160) % (E.W * 1.4), E.H * 0.8 + 32, { size: 28, color: '#8fd0ff', align: 'center' }); });
    source(g, info.source, showAt(t, 0.6, info.dur)); tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- графика: весы, доля экономики, места, цепочка мифа, монеты
tpl('scales', 'Balance scale: left and right pans with labels; tilts towards the heavier side at cue "tilt". params: left {v, l}, right {v, l}, heavier ("left"|"right"|"equal"), source', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }); voidBg(g, t, cam);
    layer(g, cam, 1, (g) => { const x = E.W / 2, y = E.H * 0.34, k = ease.inOut(prog(t, cue(info, 'tilt', 0.8), cue(info, 'tilt', 0.8) + 1.4)), dir = info.heavier === 'left' ? -1 : info.heavier === 'right' ? 1 : 0, a = dir * 0.16 * k;
      seg(g, [[x, y], [x, E.H * 0.82]], 10, GOLD); poly(g, [[x - 120, E.H * 0.84], [x + 120, E.H * 0.84], [x + 60, E.H * 0.8], [x - 60, E.H * 0.8]], GOLD); circle(g, x, y, 16, GOLD);
      g.save(); g.translate(x, y); g.rotate(a); seg(g, [[-480, 0], [480, 0]], 8, GOLD);
      [[-480, info.left], [480, info.right]].forEach(([px, o]) => { seg(g, [[px - 120, 0], [px, 0], [px + 120, 0]], 2, GOLD); seg(g, [[px, 0], [px - 130, 170]], 2, alpha(GOLD, 0.7)); seg(g, [[px, 0], [px + 130, 170]], 2, alpha(GOLD, 0.7));
        g.save(); g.translate(px, 170); g.rotate(-a); poly(g, [[-150, 0], [150, 0], [110, 36], [-110, 36]], shade(GOLD, -0.3));
        if (o) { const p = popAt(t, 0.2 + (px > 0 ? 0.4 : 0)); if (p > 0) { T(g, o.v || '', 0, -60, { size: 52 * p, color: GOLD }); T(g, o.l || '', 0, 80, { size: 24, a: p }); } } g.restore(); });
      g.restore(); });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
tpl('pie', 'Share of an economy: a big circle (label) with a highlighted sector of pct %; optional compare sector {pct, label, color}. params: pct, label (circle), who (sector label), compare, source, cue "grow"', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }); voidBg(g, t, cam);
    layer(g, cam, 1, (g) => { const cx = E.W * 0.32, cy = E.H * 0.48, R = E.H * 0.3, k = ease.out(prog(t, cue(info, 'grow', 0.5), cue(info, 'grow', 0.5) + 1.2));
      circle(g, cx, cy, R, '#1b2a4a'); ring(g, cx, cy, R, 3, alpha('#9ab4e8', 0.5)); T(g, info.label || 'ЭКОНОМИКА', cx, cy + R + 50, { size: 28 });
      const sector = (pct, col, off) => { const a0 = -Math.PI / 2 + off, a1 = a0 + Math.PI * 2 * pct / 100 * k; g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 1.04, a0, a1); g.closePath(); g.fill(); return a1; };
      const zoom = Math.max(1, 6 / Math.max(info.pct || 1, 0.5));   // маленькие доли рисуем крупнее: «лупа» справа
      const a1 = sector(Math.min(100, (info.pct || 1)), GOLD, 0);
      if (info.compare) sector(info.compare.pct, info.compare.color || '#7fb2ff', Math.PI * 2 * (info.pct || 1) / 100 * k + 0.02);
      const lx = E.W * 0.72; T(g, `${info.pctStr || (info.pct + ' %')}`, lx, E.H * 0.42, { size: 96 * popAt(t, cue(info, 'grow', 0.5) + 0.6), color: GOLD }); T(g, info.who || '', lx, E.H * 0.52, { size: 28 });
      if (info.compare) { T(g, info.compare.str || `${info.compare.pct} %`, lx, E.H * 0.64, { size: 56, color: info.compare.color || '#7fb2ff', a: showAt(t, 1.4, info.dur) }); T(g, info.compare.label || '', lx, E.H * 0.71, { size: 24, a: showAt(t, 1.4, info.dur) }); }
      void zoom; void a1; });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
tpl('rankCard', 'Countdown card «N МЕСТО» with name, years and the share line. params: n, name, years, share, star (bool: add «*»)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.5 }); voidBg(g, t, cam);
    layer(g, cam, 1, (g) => { const p = popAt(t, 0.1); if (p <= 0) return;
      glow(g, E.W / 2, E.H * 0.38, 380, GOLD, 0.18 * p); T(g, `${info.n}${info.star ? '*' : ''}`, E.W / 2, E.H * 0.36, { size: 260 * p, color: GOLD });
      T(g, 'МЕСТО', E.W / 2, E.H * 0.54, { size: 34, spacing: 10, a: showAt(t, 0.3, info.dur) });
      T(g, info.name || '', E.W / 2, E.H * 0.66, { size: 58, a: showAt(t, 0.5, info.dur) });
      if (info.years) T(g, info.years, E.W / 2, E.H * 0.73, { size: 26, a: showAt(t, 0.6, info.dur), color: '#bcc8e0' });
      if (info.share) T(g, info.share, E.W / 2, E.H * 0.8, { size: 30, a: showAt(t, 0.9, info.dur), color: GOLD }); });
  } });
tpl('mythChain', 'How a myth spreads: boxes connected by arrows appear one by one; the last number is stamped «НЕТ РАСЧЁТА». params: items [str], stamp (str)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }); voidBg(g, t, cam);
    const it = info.items || ['САЙТ', 'РАДИО', 'ЖУРНАЛЫ', 'РОЛИКИ'], n = it.length, step = Math.min(1.1, info.dur * 0.6 / n);
    layer(g, cam, 1, (g) => { T(g, info.big || '$400 000 000 000', E.W / 2, E.H * 0.22, { size: 92, color: GOLD });
      it.forEach((s, i) => { const p = popAt(t, 0.4 + i * step); if (p <= 0) return; const w = E.W * 0.17, x = E.W * (0.14 + i * 0.72 / (n - 1 || 1)), y = E.H * 0.55;
        g.fillStyle = alpha('#1b2a4a', 0.95); rr(g, x - w / 2, y - 60, w, 120, 18); g.fill(); g.strokeStyle = alpha('#9ab4e8', 0.6); g.lineWidth = 2; g.stroke(); let z = 26; g.save(); g.font = `900 ${z}px "${FONTS.ui}"`; while (g.measureText(s).width + 2 * s.length > w - 24 && z > 14) { z -= 1; g.font = `900 ${z}px "${FONTS.ui}"`; } g.restore(); T(g, s, x, y, { size: z * p });
        if (i < n - 1) { const x2 = E.W * (0.14 + (i + 1) * 0.72 / (n - 1)); seg(g, [[x + w / 2 + 8, y], [x2 - w / 2 - 16, y]], 4, alpha(GOLD, 0.8)); poly(g, [[x2 - w / 2 - 6, y], [x2 - w / 2 - 22, y - 10], [x2 - w / 2 - 22, y + 10]], GOLD); } });
      const sp = popAt(t, 0.6 + n * step); if (sp > 0 && info.stamp !== false) { g.save(); g.translate(E.W / 2, E.H * 0.8); g.rotate(-0.06); g.strokeStyle = RED; g.lineWidth = 6; rr(g, -260 * sp, -42, 520 * sp, 84, 10); g.stroke(); T(g, info.stamp || 'РАСЧЁТА НЕТ', 0, 2, { size: 44 * sp, color: RED, spacing: 6 }); g.restore(); } });
  } });
function coin(g, x, y, r, label, col) { glow(g, x, y, r * 2, col, 0.25); circle(g, x, y, r, col); ring(g, x, y, r * 0.82, 3, shade(col, -0.3)); T(g, label, x, y + r + 40, { size: 24 }); }
tpl('coins', 'Coins of different eras on a table (сестерций, мискаль, гульден, доллар) and a big question mark. params: items [{l, c}], question (bool)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }); voidBg(g, t, cam);
    const it = info.items || [{ l: 'СЕСТЕРЦИЙ', c: '#c98a4a' }, { l: 'МИСКАЛЬ', c: GOLD }, { l: 'ГУЛЬДЕН', c: '#d8b860' }, { l: 'ДОЛЛАР', c: '#cfd5e0' }];
    layer(g, cam, 1, (g) => { it.forEach((o, i) => { const p = popAt(t, 0.2 + i * 0.35); if (p > 0) coin(g, E.W * (0.2 + i * 0.2), E.H * 0.45, 90 * p, o.l, o.c); });
      if (info.question !== false) { const q = popAt(t, 0.4 + it.length * 0.35); if (q > 0) T(g, '= ?', E.W / 2, E.H * 0.78, { size: 110 * q, color: RED }); } });
  } });
tpl('league', 'Rulers «ОТДЕЛЬНАЯ ЛИГА»: a throne, a crown and treasure chests behind a velvet rope; plate text. params: str', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.2, (g) => { sky(g, ['#1a0f22', '#3a1a32', '#5a2a3a']); glow(g, E.W / 2, E.H * 0.35, 500, '#ffb35a', 0.25); });
    layer(g, cam, 0.8, (g) => { const x = E.W / 2; g.fillStyle = '#6a1f2a'; g.fillRect(x - 120, gy - 360, 240, 360); g.fillStyle = GOLD; g.fillRect(x - 150, gy - 220, 300, 30); g.fillRect(x - 150, gy - 400, 300, 40);
      [[-1], [1]].forEach(([s]) => { const cx = x + s * 380; g.fillStyle = '#5a3a1a'; rr(g, cx - 110, gy - 120, 220, 120, 12); g.fill(); g.fillStyle = GOLD; g.fillRect(cx - 110, gy - 80, 220, 12); for (let i = 0; i < 7; i++) circle(g, cx - 80 + i * 26, gy - 128 - (i % 2) * 10, 16, GOLD); glow(g, cx, gy - 140, 120, GOLD, 0.35); });
      g.fillStyle = '#2a1520'; g.fillRect(-E.W, gy, E.W * 3, E.H); seg(g, [[E.W * 0.1, gy - 60], [E.W * 0.9, gy - 60]], 8, '#b83a4a'); [0.1, 0.5, 0.9].forEach((fx) => { g.fillStyle = GOLD; g.fillRect(E.W * fx - 8, gy - 110, 16, 110); }); });
    layer(g, cam, 1, (g) => { const p = showAt(t, 0.4, info.dur), s = info.str || 'ОТДЕЛЬНАЯ ЛИГА'; let z = 54; const tw = (z) => { g.save(); g.font = `900 ${z}px "${FONTS.ui}"`; const w = g.measureText(s).width + 6 * s.length; g.restore(); return w; }; while (tw(z) > E.W * 0.8 && z > 28) z -= 2; const w = tw(z) + 90; g.fillStyle = alpha('#0b0b12', 0.85 * p); rr(g, E.W / 2 - w / 2, E.H * 0.17 - z, w, z * 2, 14); g.fill(); T(g, s, E.W / 2, E.H * 0.17, { size: z, color: GOLD, a: p, spacing: 6 }); });
  } });
tpl('fuggerei', 'Augsburg social housing (Fuggerei): rows of yellow houses with green shutters, a sign with the yearly rent (cue "rent"). params: rent (str), sub', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.4 }), gy = GY();
    layer(g, cam, 0.2, (g) => { sky(g, ['#6a90c0', '#a8c4e0', '#e8e0d0']); });
    layer(g, cam, 0.7, (g) => { for (let i = 0; i < 6; i++) { const x = E.W * (i * 0.19 - 0.05); g.fillStyle = '#e8c870'; g.fillRect(x, gy - 300, E.W * 0.18, 300); poly(g, [[x - 10, gy - 300], [x + E.W * 0.18 + 10, gy - 300], [x + E.W * 0.09, gy - 420]], '#b8503a');
      for (let w = 0; w < 2; w++) for (let r = 0; r < 2; r++) { const wx = x + 40 + w * 140, wy = gy - 260 + r * 120; g.fillStyle = '#3a4a5a'; g.fillRect(wx, wy, 60, 70); g.fillStyle = '#3a7a4a'; g.fillRect(wx - 22, wy, 20, 70); g.fillRect(wx + 62, wy, 20, 70); } } });
    layer(g, cam, 1, (g) => { g.fillStyle = '#a8a090'; g.fillRect(-E.W, gy, E.W * 3, E.H); const p = popAt(t, cue(info, 'rent', 0.5)); if (p > 0) { g.fillStyle = '#f6f0e0'; rr(g, E.W / 2 - 260 * p, E.H * 0.2, 520 * p, 170, 16); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 4; g.stroke();
      T(g, info.rent || '0,88 €', E.W / 2, E.H * 0.2 + 70, { size: 84 * p, color: '#2a1a10' }); T(g, info.sub || 'В ГОД', E.W / 2, E.H * 0.2 + 135, { size: 26 * p, color: '#5a4a3a' }); } });
  } });
tpl('libraryKid', 'A child reading by a library window (Carnegie library), warm lamp. params: tag', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.35 }), gy = GY();
    layer(g, cam, 0.3, (g) => { sky(g, ['#2a2030', '#4a3a3a', '#6a5040']); for (let i = 0; i < 9; i++) { const x = E.W * (0.02 + i * 0.11); g.fillStyle = '#3a2a20'; g.fillRect(x, gy - 520, 140, 520); for (let k = 0; k < 6; k++) for (let b = 0; b < 6; b++) { g.fillStyle = ['#8a3a2a', '#3a5a7a', '#c8a050', '#4a6a3a'][(i + k + b) % 4]; g.fillRect(x + 10 + b * 21, gy - 500 + k * 84, 17, 70); } }
      { const wx = E.W * 0.62, wy = gy - 470; g.fillStyle = '#1a2a4a'; g.fillRect(wx, wy, 260, 300); g.fillStyle = '#e8e0c0'; g.beginPath(); g.arc(wx + 190, wy + 70, 26, 0, 7); g.fill();
        for (let k = 0; k < 14; k++) { g.fillStyle = '#f0f0ff'; g.fillRect(wx + ((k * 73) % 250) + 4, wy + ((k * 41) % 280) + 6, 3, 3); }
        g.fillStyle = '#3a2a20'; g.fillRect(wx - 12, wy - 12, 284, 14); g.fillRect(wx - 12, wy + 298, 284, 14); g.fillRect(wx - 12, wy, 14, 300); g.fillRect(wx + 258, wy, 14, 300); g.fillRect(wx + 123, wy, 14, 300); g.fillRect(wx, wy + 143, 260, 14); }
      glow(g, E.W * 0.62 + 130, gy - 320, 300, '#ffe9b0', 0.2); });
    layer(g, cam, 1, (g) => { g.fillStyle = '#4a3020'; g.fillRect(-E.W, gy, E.W * 3, E.H); g.fillStyle = '#6a4428'; g.fillRect(E.W * 0.5, gy - 140, 420, 24);
      fig(g, 'kid', { x: E.W * 0.58, y: gy, s: 1.2, facing: 1, pose: breathe(POSES.sit, t, 0.6, 2), expr: 'smile' }); g.fillStyle = '#f0e6d0'; g.fillRect(E.W * 0.6, gy - 175, 70, 46); glow(g, E.W * 0.75, gy - 260, 200, '#ffd88a', 0.35); });
    tagAt(g, t, info);
  } });

// ---------------------------------------------------------------- крупный текст под мысль диктора
const NAMES = {"МЕККУ": "Мекку", "САХАРУ": "Сахару", "КАИРЕ": "Каире", "КАИР": "Каир", "МАЛИ": "Мали", "РИМА": "Рима", "РИМЕ": "Риме", "РИМ": "Рим", "КРАСС": "Красс", "КРАССА": "Красса", "ФУГГЕР": "Фуггер", "ФУГГЕРА": "Фуггера", "ФУГГЕРОВ": "Фуггеров", "РОКФЕЛЛЕР": "Рокфеллер", "РОКФЕЛЛЕРА": "Рокфеллера", "МАСК": "Маск", "МАСКА": "Маска", "АЛАН": "Алан", "АЛАНА": "Алана", "РЫЖИЙ": "Рыжий", "АНГЛИИ": "Англии", "АНГЛИЮ": "Англию", "ЕВРОПЫ": "Европы", "ЕВРОПЕ": "Европе", "БЕЗОС": "Безос", "КАРНЕГИ": "Карнеги", "СПАРТАКА": "Спартака", "АКБАР": "Акбар", "АКБАРА": "Акбара", "ХОМСТЕД": "Хомстед", "ХОМСТЕДЕ": "Хомстеде", "АУГСБУРГ": "Аугсбург", "ВИЛЬГЕЛЬМА": "Вильгельма", "ЗАВОЕВАТЕЛЯ": "Завоевателя", "МАНХЭТТЕН": "Манхэттен", "РЕФОРМАЦИИ": "Реформации", "ФОРБС": "Форбс", "СТАТЕН-АЙЛЕНД": "Статен-Айленд", "ЙОРКШИРА": "Йоркшира", "РИЧМОНДСКИЙ": "Ричмондский", "ШОТЛАНДИИ": "Шотландии", "ДЖИНГЕРЕБЕР": "Джингеребер", "ОСМАН": "Осман", "АЛИ": "Али", "ХАН": "Хан", "ГЮНТЕР": ":Гюнтер:", "КЛЕППЕР": "Клеппер", "СТЕЙНМЕЦ": "Стейнмец", "ГРЕГ": "Грег", "КАРРЫ": "Карры", "КАРРАХ": "Каррах", "АЛЬ-УМАРИ": "аль-Умари", "ШУЛЬЦ": "Шульц", "ХАЙДАРАБАД": "Хайдарабад", "ИНДИЯ": "Индия", "ИНДИИ": "Индии", "НЬЮ-ЙОРК": "Нью-Йорк", "ГИННЕССА": "Гиннесса", "ГИННЕСС": "Гиннесс", "ПЛУТАРХА": "Плутарха", "ПЛУТАРХ": "Плутарх", "ВСЕМИРНЫЙ": "Всемирный", "АВГУСТ": "Август", "АВГУСТА": "Августа", "МУСА": "Муса", "МУСЫ": "Мусы", "МАНСА": "Манса", "АСТОР": "Астор"};
const KEEPUP = new Set(['США', 'МЛРД', 'МЛН', 'ТРЛН', 'ТЫС', 'XIX', 'XVI', 'XX', 'XXI', 'I', 'II', 'III', 'NARA', 'LOC']);
// Слова появляются по одному ровно тогда, когда их произносят (times — секунды от начала шота). Всё влезает в кадр:
// размер шрифта подбирается по ширине, максимум 2 строки. accent — индексы слов, выделенных золотом.
tpl('phrase', 'Big kinetic phrase synced to the narration: words pop in at their spoken times. params: words [str], times [s], accent [i], bg (void|warm|dark), sub (small line under)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', amt: 0.12 });
    if (info.bg === 'warm') layer(g, cam, 0.3, (g) => { sky(g, ['#1f1410', '#3a2216', '#2a170f']); glow(g, E.W / 2, E.H * 0.45, 700, '#ffb35a', 0.18); });
    else if (info.bg === 'dark') layer(g, cam, 0.3, (g) => { sky(g, ['#07080d', '#10121c', '#07080d']); glow(g, E.W / 2, E.H * 0.45, 600, '#7fa8ff', 0.1); });
    else if (info.bg === 'black' || info.hand !== false) { g.fillStyle = '#050505'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
    else voidBg(g, t, cam);
    const hand = info.hand !== false, acc = new Set(info.accent || []);
    // рукописный стиль: обычный регистр, имена с большой буквы
    const caseW = (w, i, all) => { if (!hand) return w;
      const m = w.match(/^([«"(]*)(.*?)([».,!?…:;")]*)$/); const pre = m[1], core = m[2], post = m[3];
      if (!core || KEEPUP.has(core) || /\d/.test(core) || !/[А-ЯЁA-Z]/.test(core)) return w;
      let c = NAMES[core] || core.toLowerCase();
      if (core === 'МИР' && all[i + 1] && all[i + 1].startsWith('ОСМАН')) c = 'Мир';
      if (core === 'БАНК' && all[i - 1] === 'ВСЕМИРНЫЙ') c = 'банк';
      const first = all.slice(0, i).every((x) => !/[А-ЯЁA-Za-zа-яё0-9]/.test(x));
      if (first) c = c.charAt(0).toUpperCase() + c.slice(1);
      return pre + c + post; };
    const W = (info.words || []).map((w, i, all) => caseW(w, i, all)), times = info.times || W.map((_, i) => i * 0.3);
    let size = hand ? 128 : 120; const font = hand ? 'Caveat' : FONTS.ui, sp = hand ? 0 : 3;
    const wid = (s, z) => { g.save(); g.font = `${hand ? 700 : 900} ${z}px "${font}"`; const w = g.measureText(s).width + sp * s.length; g.restore(); return w; };
    const split = (z) => { const lines = [[]]; let lw = 0, maxW = E.W * 0.84;
      W.forEach((w, i) => { const ww = wid(w, z) + z * 0.3; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += ww; }); return lines; };
    let lines = split(size); while ((lines.length > 2 || lines.some((l) => l.reduce((a, i) => a + wid(W[i], size) + size * 0.3, 0) > E.W * 0.86)) && size > 46) { size -= 6; lines = split(size); }
    layer(g, cam, 1, (g) => { const lh = size * 1.25, y0 = E.H * 0.47 - (lines.length - 1) * lh / 2;
      lines.forEach((l, li) => { const tot = l.reduce((a, i) => a + wid(W[i], size) + size * 0.3, 0) - size * 0.3; let x = E.W / 2 - tot / 2;
        l.forEach((i) => { const w = wid(W[i], size), p = popAt(t, Math.max(0, (times[i] ?? 0) - 0.05), 0.35);
          if (p > 0) { g.save(); g.translate(x + w / 2, y0 + li * lh); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
            text(g, W[i], 0, 0, { size, color: acc.has(i) ? GOLD : '#f4f1ea', font, weight: hand ? 700 : 900, spacing: sp, alpha: clamp(p * 1.4) }); g.restore(); }
          x += w + size * 0.3; }); });
      if (info.sub) T(g, info.sub, E.W / 2, y0 + lines.length * lh + 20, { size: 26, color: '#bcc8e0', a: showAt(t, 0.4, info.dur) }); });
  } });
