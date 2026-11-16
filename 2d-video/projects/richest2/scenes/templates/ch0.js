// ch0.js — вступление (0:00–1:31): Манса Муса в Каире, султан, «$400 млрд», четыре кандидата.
import { E, ease, prog, clamp, lerp, noise, shade } from '/engine/core.js';
import { tpl } from './_registry.js';
import * as T from '../toon.js';
import { person, camel, tag, yearTag, bubble, withCam, K, at, inn, pop, k01, hand, box, ell, poly, line, limb, coin, sack, chest, barPile, goldBar, light, finish, C, OL, SKIN } from '../toon.js';
import * as CA from '../cast.js';

const GY = 930;
const walkX = (t, t0, t1, x0, x1) => lerp(x0, x1, clamp((t - t0) / (t1 - t0)));
const walking = (t, t0, t1) => t > t0 && t < t1;

// ================================================================ ЧЁРНАЯ КАРТОЧКА: рукописный текст по словам
tpl('card', 'Black card, handwritten words appear in sync with narration. params: text, gold:[words to colour gold], size', {
  draw(g, t, info) {
    g.fillStyle = '#060606'; g.fillRect(0, 0, E.W, E.H);
    const words = info.text.split(/\s+/), size = info.size || 92; let prev = info.shot.start - 0.5;
    const times = words.map((w) => { if (/^[—–-]$/.test(w)) return null; const v = T.wt(w, prev); if (v != null && v < info.shot.end + 0.2) { prev = v; return v - info.shot.start; } return null; });
    for (let i = 0; i < times.length; i++) if (times[i] == null) times[i] = i ? times[i - 1] + 0.05 : 0;
    if (times[0] > 0.35) for (let i = 0; i < times.length; i++) times[i] -= times[0] - 0.05;  // первое слово сразу
    g.save(); g.font = `700 ${size}px "${T.HAND}"`;
    const maxW = E.W * 0.74, lines = [[]]; let lw = 0;
    words.forEach((w, i) => { const ww = g.measureText(w + ' ').width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += ww; });
    const lh = size * 1.18, y0 = E.H / 2 - (lines.length - 1) * lh / 2;
    lines.forEach((ln, li) => { const full = ln.map((i) => words[i]).join(' '); let x = E.W / 2 - g.measureText(full).width / 2;
      ln.forEach((i) => { const w = words[i], a = clamp((t - times[i]) / 0.12); const gold = (info.gold || []).some((q) => w.toLowerCase().includes(q));
        if (a > 0) T.hand(g, w, x, y0 + li * lh, { size, color: gold ? '#f2c037' : '#f4f1ea', align: 'left', a }); x += g.measureText(w + ' ').width; }); });
    g.restore();
  } });

// ================================================================ A1 — в чужой город приехал один человек
tpl('arrive', 'Sunset desert, Cairo on the horizon, a lone rider (Musa) on a camel; camera pushes in on «один человек».', {
  draw(g, t, info) {
    const tP = at(info, 'один', 0.7);
    withCam(g, t, [K(0, 960, 540, 1), K(tP, 900, 560, 1.08), K(info.dur, 760, 600, 1.45)], (g) => {
      T.desert(g, t, { sunset: true, sunX: 1500, sunY: 400, city: (g) => T.cairo(g, 1160, 700, 0.7, '#b07850') });
      T.palm(g, 1720, 760, 0.8, t); T.palm(g, 1820, 780, 0.65, t);
      const x = walkX(t, 0, info.dur, 420, 700);
      camel(g, x, 860, 1.05, t * 4, { t, rider: { ...CA.MUSA, expr: 'smile', look: 0.6 } });
    });
    finish(g);
  } });

// ================================================================ A2 — и золото в этом городе подешевело
tpl('goldSign', 'Money-changer stall close-up: big gold coin on the counter, price board; on «подешевело» the price drops with a red arrow, the trader is shocked.', {
  draw(g, t, info) {
    const tD = at(info, 'подешев', 0.6);
    withCam(g, t, [K(0, 960, 520, 1.05), K(info.dur, 960, 500, 1.15)], (g) => {
      T.wallRoom(g, { wall: '#e8c48e', floor: '#8a5a32', fy: 800 });
      T.window_(g, 140, 140, 300, 380, (g) => { T.sky(g, ['#f6b26b', '#fbe0a8']); T.cairo(g, 60, 520, 0.4, '#c08a58'); }, { arch: true });
      // доска с ценой
      box(g, 1120, 120, 560, 330, '#3a4a3a', { r: 8 }); box(g, 1100, 100, 600, 370, null, { r: 10, lw: 12, grad: false });
      T.coin(g, 1250, 280, 80, C.gold, { sym: '' }); hand(g, '=', 1380, 285, { size: 90, color: '#f4f1ea' });
      const k = k01(t, tD, tD + 0.5); hand(g, k < 0.5 ? '25' : '22', 1520, 290, { size: 130, color: k < 0.5 ? '#f4f1ea' : '#ff8a7a' });
      T.ell(g, 1630, 270, 20, 20, '#c9ced8', 4); T.ell(g, 1630, 270, 13, 13, null, 3);
      T.arrow(g, 1520, 340, 200, -1, C.red, pop(t, tD + 0.1, 0.5));
      // прилавок
      box(g, 300, 640, 1320, 60, '#8a5a32', { r: 4 }); box(g, 330, 700, 1260, 260, '#a8703e', { r: 4 });
      [0, 1, 2].forEach((i) => T.coin(g, 560 + i * 70, 620 - (i % 2) * 14, 34));
      person(g, { ...CA.MERCHANT('#2f6b8a', 0), x: 960, y: 660, s: 1.05, t, expr: t > tD ? 'shock' : 'smile', pose: t > tD ? 'shrug' : 'idle', look: t > tD ? 0.8 : 0 });
      box(g, 300, 640, 1320, 60, '#8a5a32', { r: 4 }); box(g, 330, 700, 1260, 260, '#a8703e', { r: 4 });
      [[600, 660], [1330, 660]].forEach(([x, y]) => T.scale2(g, x, y + 4, 0.45, 0.05 * Math.sin(t), (g) => T.coin(g, 0, -14, 24), null));
    });
    finish(g);
  } });

// ================================================================ B — Каир, 1324
tpl('cairoWide', 'Wide busy Cairo panorama (walls, domes, minarets, Nile boats), year tag 1324 and a «Каир» tag.', {
  draw(g, t, info) {
    const tY = at(info, 'тысяча', 0.25), tC = at(info, 'каир', 0.05);
    withCam(g, t, [K(0, 800, 560, 1.12), K(info.dur, 1100, 520, 1.02)], (g) => {
      T.sky(g, ['#86c8ea', '#cfe9f2', '#f8e6bc']); T.ell(g, 300, 220, 70, 70, '#fff6d0', 0); light(g, 300, 220, 300, '#fff0b0', 0.5);
      for (let i = 0; i < 5; i++) T.ell(g, ((i * 430 + t * 20) % 2400) - 200, 160 + (i % 2) * 70, 120, 28, 'rgba(255,255,255,.8)', 0);
      T.cairo(g, -100, 760, 1.05, '#d2995e'); T.cairo(g, 1050, 780, 0.95, '#c88d55');
      // Нил и лодки
      g.fillStyle = T.vgrad(g, 780, 140, '#3f8fbf', 0.15); g.fillRect(-500, 780, 3000, 150); line(g, [[-500, 780], [2500, 780]], 5);
      [0, 1].forEach((i) => { const x = ((t * 40 + i * 900) % 2200) - 200; g.save(); g.translate(x, 830); poly(g, [[-90, 0], [90, 0], [60, 30], [-60, 30]], '#8a5a32'); line(g, [[0, 0], [0, -150]], 6); poly(g, [[4, -150], [4, -10], [80, -20]], '#f6efe0', 4); g.restore(); });
      g.fillStyle = T.vgrad(g, 930, 200, '#e0b070', 0.1); g.fillRect(-500, 930, 3000, 300); line(g, [[-500, 930], [2500, 930]], 5);
      for (let i = 0; i < 9; i++) { const x = 100 + i * 210 + Math.sin(i) * 40; person(g, { ...CA.MERCHANT(['#2f6b8a', '#a8322a', '#6a8a3a', '#c99a3a'][i % 4], i), x: x + Math.sin(t * 0.8 + i) * 30, y: 1015, s: 0.55, t, walk: t * 5 + i, face: i % 2 ? 1 : -1 }); }
      tag(g, 'Каир', 820, 260, pop(t, tC), { string: [700, 420], size: 54 });
    });
    yearTag(g, '1324 год', pop(t, tY));
    finish(g);
  } });

// ================================================================ C — правитель империи Мали, Манса Муса
tpl('musaMali', 'Musa in front of a Mali mud-brick mosque with wooden spikes and palms; tags «Мали» and «Манса Муса».', {
  draw(g, t, info) {
    const tM = at(info, 'мали', 0.5), tN = at(info, 'манса', 0.65);
    withCam(g, t, [K(0, 960, 560, 1.0), K(info.dur, 980, 600, 1.12)], (g) => {
      T.sky(g, ['#7ec4ea', '#cfe9f2', '#f6dcae']);
      // мечеть из сырцового кирпича
      const mc = '#c98a52'; box(g, 380, 330, 1160, 520, mc, { r: 6 });
      [[420, 160], [880, 90], [1340, 160]].forEach(([x, h], i) => { box(g, x, 330 - h, 200, h + 10, shade(mc, 0.05), { r: 4 }); poly(g, [[x, 330 - h], [x + 200, 330 - h], [x + 170, 330 - h - 70], [x + 30, 330 - h - 70]], shade(mc, 0.1));
        for (let r = 0; r < 4; r++) for (let j = 0; j < 4; j++) line(g, [[x + 30 + j * 46, 360 - h + r * 60], [x + 50 + j * 46, 360 - h + r * 60]], 8, '#7a4a2a'); ell(g, x + 100, 330 - h - 82, 12, 12, '#f6efe0', 4); });
      for (let r = 0; r < 4; r++) for (let j = 0; j < 14; j++) line(g, [[400 + j * 82, 420 + r * 110], [424 + j * 82, 420 + r * 110]], 8, '#7a4a2a');
      for (let j = 0; j < 5; j++) { const x = 480 + j * 240; g.beginPath(); g.moveTo(x - 50, 850); g.lineTo(x - 50, 720); g.arc(x, 720, 50, Math.PI, 0); g.lineTo(x + 50, 850); g.closePath(); T.fo(g, '#5a3420'); }
      T.palm(g, 220, 900, 1.1, t); T.palm(g, 1720, 900, 1.2, t); T.palm(g, 1600, 920, 0.8, t);
      g.fillStyle = T.vgrad(g, 850, 230, '#e0aa6a', 0.1); g.fillRect(-500, 850, 3000, 400); line(g, [[-500, 850], [2500, 850]], 5);
      person(g, { ...CA.MALIAN('#3a7a5a', 0), x: 640, y: 960, s: 0.95, t, pose: 'idle', look: 0.8 });
      person(g, { ...CA.MALIAN('#a8322a', 1), x: 1300, y: 960, s: 0.95, t, pose: 'idle', look: -0.8, face: -1 });
      person(g, { ...CA.MUSA, x: 960, y: 1000, s: 1.25, t, pose: t > tN ? 'wave' : 'hips', expr: 'smile', look: 0 });
      tag(g, 'Мали', 560, 210, pop(t, tM), { bg: '#ffd43b', size: 58 });
      tag(g, 'Манса Муса', 1300, 520, pop(t, tN), { size: 60, string: [1060, 640] });
    });
    finish(g);
  } });

// ================================================================ D — путь в Мекку через Сахару (карта)
tpl('route', 'Parchment map: Mali → Cairo → Mecca, dashed route drawing, camel icon walking, «Сахара» written across.', {
  draw(g, t, info) {
    const k = k01(t, 0.1, info.dur - 0.2);
    withCam(g, t, [K(0, 960, 540, 1.04), K(info.dur, 1000, 520, 1.12)], (g) => {
      g.fillStyle = '#5a3a24'; g.fillRect(-500, -500, 3000, 2200); for (let i = 0; i < 12; i++) line(g, [[-500, i * 110], [2500, i * 110 + 20]], 3, 'rgba(0,0,0,.25)');
      T.parchment(g, 960, 540, 1500, 840);
      // берега: Африка (грубая форма), Аравия, Средиземное и Красное море
      g.save(); g.globalAlpha = 0.9;
      T.poly(g, [[260, 300], [800, 260], [1130, 300], [1180, 420], [1240, 560], [1160, 900], [300, 900], [260, 560]], '#e6cf98', 4);
      T.poly(g, [[1250, 330], [1640, 360], [1700, 700], [1420, 760], [1290, 520]], '#e6cf98', 4);
      g.restore();
      hand(g, 'Сахара', 700, 520, { size: 70, color: 'rgba(120,80,40,.55)' }); for (let i = 0; i < 6; i++) T.ell(g, 520 + i * 70, 600 + (i % 2) * 20, 22, 8, 'rgba(160,110,60,.4)', 0);
      const P = [[420, 640], [600, 560], [820, 470], [1120, 380], [1230, 470], [1370, 560]];
      const end = T.dashed(g, P, k, C.red, 8);
      [[420, 640, 'Мали'], [1120, 380, 'Каир'], [1370, 560, 'Мекка']].forEach(([x, y, s], i) => { T.ell(g, x, y, 16, 16, i === 1 ? C.gold : C.red, 4); hand(g, s, x + (i === 2 ? 70 : 0), y - 50, { size: 54 }); });
      g.save(); g.translate(end[0], end[1] - 10); camel(g, 0, 0, 0.35, t * 6, {}); g.restore();
    });
    finish(g);
  } });

// ================================================================ E — и везёт столько золота
tpl('goldCaravan', 'Long caravan of camels loaded with gold sacks and chests; starts tight on one glowing load, pulls out to an endless line.', {
  draw(g, t, info) {
    const tS = at(info, 'столько', 0.15), tG = at(info, 'город', 0.45);
    withCam(g, t, [K(0, 900, 640, 1.9), K(tS, 900, 620, 1.7), K(tS + 1.6, 960, 560, 1.0), K(info.dur, 980, 540, 0.92)], (g) => {
      T.desert(g, t, { sunset: false, sunX: 1650, sunY: 250, city: (g) => { if (t > tG - 0.6) { g.save(); g.globalAlpha = inn(t, tG - 0.6, 0.8); T.cairo(g, 1500, 690, 0.45, '#d0a070'); g.restore(); } } });
      for (let i = -1; i < 8; i++) {
        const x = ((t * 70 + i * 330) % 3300) - 900, y = 880;
        const load = (g) => { if (i % 3 === 0) { chest(g, 0, -168, 0.55, 1, 0.6); } else { sack(g, -40, -150, 0.7, '#c99a4a', ''); sack(g, 40, -150, 0.7, '#c99a4a', ''); T.coin(g, 0, -232, 22); } };
        camel(g, x, y, 0.95, t * 4 + i, { load, t });
        if (i % 2 === 0) person(g, { ...CA.MALIAN(['#3a7a5a', '#a8322a', '#2f6b8a'][(i + 3) % 3], i), x: x + 170, y: y + 40, s: 0.62, t, walk: t * 6 + i });
      }
      light(g, 900, 560, 500, '#ffe08a', 0.25);
    });
    finish(g);
  } });

// ================================================================ F, G — свита платит золотом; торговцы поднимают цены
function marketStreet(g, t, o = {}) {
  T.sky(g, ['#86c8ea', '#d8eef2']);
  T.cairo(g, -60, 520, 0.8, '#d0a070'); T.cairo(g, 900, 540, 0.8, '#c99a6a');
  g.fillStyle = T.vgrad(g, 520, 600, '#e8c08a', 0.1); g.fillRect(-500, 520, 3000, 800); line(g, [[-500, 520], [2500, 520]], 4);
  // лавки
  const stalls = [[260, '#a8322a', 'ткани'], [820, '#2f6b8a', 'специи'], [1380, '#6a8a3a', 'хлеб']];
  stalls.forEach(([x, col, w], i) => { limb(g, [[x - 210, 830], [x - 210, 470]], 12, '#6a4a2a'); limb(g, [[x + 210, 830], [x + 210, 470]], 12, '#6a4a2a');
    for (let j = 0; j < 6; j++) { T.path(g, [[x - 240 + j * 80, 440], [x - 160 + j * 80, 440], [x - 160 + j * 80, 500], [x - 240 + j * 80, 520]]); T.fo(g, j % 2 ? col : '#f6efe0', 4); }
    box(g, x - 250, 690, 500, 40, '#8a5a32', { r: 4 }); box(g, x - 230, 730, 460, 140, '#a8703e', { r: 4 });
    if (i === 0) for (let j = 0; j < 5; j++) box(g, x - 200 + j * 82, 630, 70, 60, ['#d94a3a', '#3a7ad9', '#f2c037', '#6a3a8a', '#3aa86a'][j], { r: 6, lw: 4 });
    if (i === 1) for (let j = 0; j < 5; j++) { g.beginPath(); g.ellipse(x - 170 + j * 85, 690, 40, 46, 0, Math.PI, 0); T.fo(g, ['#d9772a', '#c9a12a', '#a83a2a', '#6a8a3a', '#d9b04a'][j]); }
    if (i === 2) for (let j = 0; j < 6; j++) T.ell(g, x - 190 + j * 76, 672, 34, 20, '#d9a058', 4);
  });
  return stalls;
}
tpl('payGold', 'Cairo market: Musa\'s retinue pays a merchant with gold coins; coins fly into the merchant\'s hands.', {
  draw(g, t, info) {
    const tP = at(info, 'платит', 0.2), tA = at(info, 'всё', 0.7);
    withCam(g, t, [K(0, 900, 600, 1.3), K(info.dur, 820, 620, 1.45)], (g) => {
      marketStreet(g, t);
      person(g, { ...CA.MERCHANT('#2f6b8a', 0), x: 400, y: 700, s: 1.0, t, expr: t > tP + 0.5 ? 'grin' : 'neutral', pose: 'hold', look: 0.8 });
      box(g, 10, 690, 500, 40, '#8a5a32', { r: 4 }); box(g, 30, 730, 460, 140, '#a8703e', { r: 4 });
      person(g, { ...CA.MALIAN('#3a7a5a', 0), x: 980, y: 960, s: 1.1, t, pose: 'give', face: -1, look: -0.8, expr: 'smile' });
      person(g, { ...CA.MALIAN('#a8322a', 1), x: 1260, y: 980, s: 1.0, t, pose: 'idle', face: -1, look: -0.6, prop: (g) => sack(g, 70, -120, 0.7, '#c99a4a') });
      for (let i = 0; i < 9; i++) { const st = tP + i * 0.17, k = prog(t, st, st + 0.55); if (k <= 0) continue; const x = lerp(860, 440 + (i % 3) * 20, k), y = lerp(780, 640, k) - Math.sin(k * Math.PI) * 160; if (k < 1) T.coin(g, x, y, 22); else T.coin(g, 380 + (i % 3) * 34, 680 - Math.floor(i / 3) * 14, 22); }
      tag(g, 'золотом за всё', 700, 330, pop(t, tA - 0.2), { size: 54 });
    });
    finish(g);
  } });
tpl('pricesUp', 'Same market: merchants flip their price tags up, green? no — red arrows up over every stall; prices double.', {
  draw(g, t, info) {
    const tU = at(info, 'поднима', 0.55);
    withCam(g, t, [K(0, 960, 560, 1.0), K(info.dur, 960, 540, 1.08)], (g) => {
      const st = marketStreet(g, t);
      st.forEach(([x], i) => { const k = k01(t, tU + i * 0.15, tU + i * 0.15 + 0.35); person(g, { ...CA.MERCHANT(['#a8322a', '#2f6b8a', '#6a8a3a'][i], i + 1), x, y: 700, s: 0.95, t, expr: k > 0.5 ? 'grin' : 'smile', pose: k > 0 ? 'wave' : 'idle', look: 0.2 });
        box(g, x - 250, 690, 500, 40, '#8a5a32', { r: 4 }); box(g, x - 230, 730, 460, 140, '#a8703e', { r: 4 });
        tag(g, k < 0.5 ? `${[2, 3, 1][i]}` : `${[2, 3, 1][i] * 2}`, x + 150, 590, 1, { size: 64, bg: k < 0.5 ? C.paper : '#ffd9d0', rot: 0.05, noPop: true });
        T.arrow(g, x + 240, 640, 160, 1, C.red, pop(t, tU + i * 0.15 + 0.3)); });
      for (let i = 0; i < 3; i++) person(g, { ...CA.MALIAN(['#3a7a5a', '#c99a3a', '#2f6b8a'][i], i), x: 400 + i * 560, y: 1060, s: 0.9, t, walk: t * 5 + i });
    });
    finish(g);
  } });

// ================================================================ H — а само золото дешевеет (меняла с доской)
tpl('goldChart', 'Money-changer\'s chalkboard: a gold-coin line chart dives down; the changer scratches his head.', {
  draw(g, t, info) {
    const tD = at(info, 'дешев', 0.5);
    withCam(g, t, [K(0, 960, 520, 1.0), K(info.dur, 1000, 480, 1.15)], (g) => {
      T.wallRoom(g, { wall: '#e8d4ae', floor: '#8a5a32', fy: 820 });
      box(g, 420, 140, 1080, 560, '#2f4a3a', { r: 6 }); box(g, 400, 120, 1120, 600, null, { r: 8, lw: 14, grad: false });
      hand(g, 'золото', 620, 210, { size: 64, color: '#f2c037' }); T.coin(g, 480, 212, 34);
      const pts = [[480, 330], [640, 320], [800, 340], [960, 330]]; const k = k01(t, tD - 0.4, tD + 0.8), drop = [[1060, 420], [1180, 560], [1300, 640]];
      const all = pts.concat(drop.slice(0, Math.ceil(k * 3)).map((p, i) => i === Math.ceil(k * 3) - 1 ? [lerp(pts[3][0] + (i ? drop[i - 1][0] - pts[3][0] : 0), p[0], 1), p[1]] : p));
      line(g, all, 10, '#f6efe0'); const last = all[all.length - 1]; T.coin(g, last[0], last[1], 30);
      T.arrow(g, 1400, 380, 220, -1, C.red, pop(t, tD + 0.3));
      person(g, { ...CA.MERCHANT('#8a5a8a', 2), x: 300, y: 1010, s: 1.1, t, expr: t > tD ? 'worried' : 'neutral', pose: t > tD ? 'think' : 'idle', look: 0.8 });
    });
    finish(g);
  } });

// ================================================================ J — один гость — и в огромном городе подешевело золото
tpl('cityCoin', 'Bird\'s-eye Cairo with a tiny caravan entering; a giant gold coin above the city sinks, red arrow down.', {
  draw(g, t, info) {
    const tD = at(info, 'подешев', 0.5);
    withCam(g, t, [K(0, 960, 560, 1.1), K(info.dur, 960, 540, 0.98)], (g) => {
      T.sky(g, ['#f6b26b', '#fbe0a8']); T.cairo(g, 160, 900, 1.45, '#c98a52');
      g.fillStyle = T.vgrad(g, 900, 300, '#d9a868', 0.1); g.fillRect(-500, 900, 3000, 400); line(g, [[-500, 900], [2500, 900]], 5);
      for (let i = 0; i < 4; i++) camel(g, 160 + i * 70 + t * 20, 990, 0.3, t * 5 + i, {});
      const k = k01(t, tD - 0.2, tD + 0.9), y = lerp(260, 470, k);
      g.save(); g.translate(960, y); const sq = 1 - 0.25 * k; g.scale(1, sq); T.coin(g, 0, 0, 170, C.gold); g.restore(); light(g, 960, y, 400, '#ffe08a', 0.4 * (1 - k));
      T.arrow(g, 1240, 240, 260, -1, C.red, pop(t, tD));
    });
    finish(g);
  } });

// ================================================================ K — арабский историк аль-Умари записал — спустя годы, со слов очевидцев
tpl('umari', 'Night study: al-Umari writes on a scroll by candlelight; tag «аль-Умари», later «спустя ~12 лет»; two elderly witnesses enter and talk (bubble with camel and gold).', {
  draw(g, t, info) {
    const tN = at(info, 'умари', 0.2), tY = at(info, 'спустя', 0.45), tW = at(info, 'очевид', 0.8);
    withCam(g, t, [K(0, 860, 600, 1.15), K(tY, 900, 580, 1.1), K(tW - 0.3, 960, 560, 1.0), K(info.dur, 980, 560, 1.0)], (g) => {
      T.wallRoom(g, { wall: '#5a4a6a', floor: '#3a2a2a', fy: 800 });
      T.window_(g, 1250, 150, 260, 360, (g) => { T.sky(g, ['#141a3a', '#2e3a6a']); T.ell(g, 180, 90, 34, 34, '#fbf6ea', 0); for (let i = 0; i < 10; i++) T.ell(g, (i * 53) % 250, (i * 37) % 300, 3, 3, '#fff', 0); }, { arch: true });
      T.shelf(g, 160, 360, 400, [(g, x, y) => T.books(g, x - 60, y, 5, 3), (g, x, y) => T.vase(g, x, y), (g, x, y) => T.books(g, x - 40, y, 4, 9)]);
      T.rug(g, 800, 930, 900, 360);
      person(g, { ...CA.UMARI, x: 740, y: 900, s: 1.25, t, sit: true, pose: 'writing', expr: t > tW ? 'neutral' : 'closed', look: t > tW ? 0.9 : 0.2 });
      box(g, 700, 800, 340, 30, '#7a5232', { r: 4 }); box(g, 730, 830, 280, 70, '#6a4428', { r: 4 });
      T.scroll(g, 880, 790, 220, 40, 1); T.candle(g, 1020, 800, t);
      const kw = inn(t, tW - 0.3, 0.8), wx = lerp(1900, 1450, kw);
      person(g, { ...CA.MERCHANT('#7a6a5a', 2), hair: { s: 'none' }, beardCol: '#e9e4da', x: wx, y: 960, s: 1.0, t, face: -1, look: -0.8, talk: t > tW, walk: kw < 1 ? t * 6 : false });
      person(g, { ...CA.MERCHANT('#5a6a7a', 0), beardCol: '#e9e4da', x: wx + 220, y: 980, s: 0.95, t, face: -1, look: -0.8, walk: kw < 1 ? t * 6 + 1 : false });
      bubble(g, wx - 40, 560, 300, 170, pop(t, tW + 0.2), (g) => { camel(g, -60, 70, 0.32, 0, {}); T.coin(g, 60, -10, 30); T.coin(g, 100, 20, 26); }, { tail: 40 });
    });
    tag(g, 'аль-Умари', 420, 200, pop(t, tN), { size: 60, bg: '#ffd43b' });
    tag(g, 'спустя годы', 470, 310, pop(t, tY), { size: 52 });
    finish(g);
  } });

// ================================================================ L — мискаль = 25 дирхемов → 22 или меньше
tpl('mithqal', 'Balance scale on a money-changer\'s table: one gold mithqal vs a stack of silver dirhams counting up to 25, then down to 22 «или меньше».', {
  draw(g, t, info) {
    const t25 = at(info, 'двадцати', 0.4), tA = at(info, 'после', 0.65), tL = at(info, 'меньше', 0.9, 6);
    const before = t < tA; const n = before ? Math.round(clamp((t - 1.0) / Math.max(0.1, t25 - 1.0)) * 25) : (t < tL - 0.2 ? 22 : 21);
    const tilt = before ? lerp(0.22, 0, clamp(n / 25)) : lerp(0, 0.12, k01(t, tA, tA + 0.8));
    withCam(g, t, [K(0, 960, 600, 1.45), K(tA, 960, 560, 1.25), K(info.dur, 980, 540, 1.35)], (g) => {
      T.wallRoom(g, { wall: '#e8d4ae', floor: '#7a4a2a', fy: 760 });
      T.window_(g, 160, 150, 280, 380, (g) => { T.sky(g, ['#86c8ea', '#e8f4f8']); T.cairo(g, 20, 380, 0.35, '#c98a52'); }, { arch: true });
      box(g, 260, 820, 1400, 50, '#8a5a32', { r: 4 }); box(g, 290, 870, 1340, 300, '#a8703e', { r: 4 });
      T.scale2(g, 960, 830, 1.5, tilt, (g) => { T.coin(g, 0, -26, 30, C.gold); }, (g) => { for (let i = 0; i < n; i++) T.ell(g, (i % 5 - 2) * 14, -12 - Math.floor(i / 5) * 12 - (i % 5) * 1.5, 22, 8, '#cfd5e0', 3); });
    });
    tag(g, '1 золотой мискаль', 560, 330, pop(t, 0.6), { size: 52, bg: '#ffe9a8' });
    tag(g, `${n} серебряных дирхемов`, 1380, 300, pop(t, 1.0), { size: 52, bg: '#e8eef6', noPop: n > 0 });
    yearTag(g, before ? 'до приезда Мусы' : 'после', 1, { size: 50 });
    if (!before && t > tL - 0.2) tag(g, 'или меньше', 1400, 410, pop(t, tL - 0.2), { size: 50, bg: '#ffd9d0' });
    finish(g);
  } });

// ================================================================ M — приём у султана (одна сцена, несколько ракурсов; действие по абсолютному времени)
const TH = { enter: 43.4, refuse: 45.6, say: 48.9, bow: 51.5, rise: 52.9, seat: 53.7 };
function throneRoom(g, t, gt) {
  T.wallRoom(g, { wall: '#e6d2a6', floor: '#9a7a5a', fy: 760 });
  for (let i = 0; i < 6; i++) { const x = 120 + i * 340; box(g, x, 120, 60, 640, '#d8bc86', { r: 4 }); box(g, x - 16, 100, 92, 30, '#c9a46a', { r: 4, lw: 4 }); }
  for (let i = 0; i < 5; i++) { const x = 230 + i * 340; g.beginPath(); g.moveTo(x, 760); g.lineTo(x, 330); g.arc(x + 110, 330, 110, Math.PI, 0); g.lineTo(x + 220, 760); T.fo(g, null, 4); }
  T.curtain(g, 760, 90, 200, 560, '#2f6b8a', 1); T.curtain(g, 1160, 90, 200, 560, '#2f6b8a', -1);
  T.rug(g, 960, 900, 1300, 420, '#a8322a', C.gold);
  // трон
  box(g, 1000, 520, 300, 260, '#c9a14a', { r: 20 }); box(g, 980, 700, 340, 90, '#b8873a', { r: 10 });
  // подушка для гостя
  const kS = k01(gt, TH.seat - 0.3, TH.seat + 0.3); if (gt > TH.rise) { g.save(); g.globalAlpha = inn(gt, TH.rise, 0.4); box(g, 760, 730, 220, 60, '#a8322a', { r: 20 }); g.restore(); }
  // султан
  const rise = k01(gt, TH.rise - 0.1, TH.rise + 0.5) * (1 - k01(gt, TH.seat + 0.6, TH.seat + 1.2));
  person(g, { ...CA.SULTAN, x: 1150, y: 790 - rise * 40, s: 1.05, t, sit: rise < 0.5, pose: gt > TH.rise && gt < TH.seat + 1 ? 'bothOut' : 'idle', expr: gt > TH.rise ? 'smile' : (gt > TH.refuse && gt < TH.say ? 'angry' : 'neutral'), look: -0.7, face: -1, talk: gt > TH.rise && gt < TH.rise + 0.8 });
  // стражники
  person(g, { ...CA.GUARD, x: 1460, y: 900, s: 1.0, t, pose: 'cross', expr: 'angry', look: -0.6, face: -1 });
  person(g, { ...CA.GUARD, x: 1640, y: 920, s: 1.0, t, pose: 'cross', expr: gt > TH.refuse && gt < TH.say ? 'shock' : 'neutral', look: -0.6, face: -1, seed: 8 });
  // придворный показывает на пол
  person(g, { ...CA.COURTIER, x: 820, y: 960, s: 1.0, t, pose: gt > TH.refuse && gt < TH.say ? 'point' : 'idle', expr: gt > TH.refuse && gt < TH.say ? 'angry' : 'neutral', look: -0.5, face: -1, bow: gt > TH.refuse && gt < TH.refuse + 1.2 ? 0.5 : 0 });
  // Муса: входит, отказывается, говорит, кланяется, садится рядом
  const mx = gt < TH.seat ? walkX(gt, TH.enter - 0.2, TH.enter + 1.6, -150, 420) : lerp(420, 870, kS), my = gt < TH.seat ? 980 : lerp(980, 760, kS);
  const bow = k01(gt, TH.bow - 0.1, TH.bow + 0.35) * (1 - k01(gt, TH.bow + 0.7, TH.bow + 1.1));
  person(g, { ...CA.MUSA, x: mx, y: my, s: 1.1, t, sit: gt > TH.seat + 0.1, walk: walking(gt, TH.enter - 0.2, TH.enter + 1.6) ? gt * 6 : (kS > 0 && kS < 1 ? gt * 6 : false),
    pose: gt > TH.refuse && gt < TH.say - 0.4 ? 'cross' : gt >= TH.say - 0.4 && gt < TH.bow - 0.2 ? { l: [0.18, 0.15], r: [2.9, 0] } : 'idle',
    expr: gt > TH.refuse && gt < TH.say - 0.4 ? 'angry' : gt > TH.rise ? 'smile' : 'neutral', talk: gt > TH.say - 0.6 && gt < TH.bow, look: 0.6, bow });
  person(g, { ...CA.MALIAN('#3a7a5a', 0), x: mx - 260, y: 1000, s: 0.95, t, walk: walking(gt, TH.enter - 0.2, TH.enter + 1.6) ? gt * 6 + 1 : false, look: 0.6, bow: bow * 0.8 });
  return { mx };
}
tpl('throne', 'Audience with the Sultan of Egypt (one continuous scene; params.view picks the camera: wide | refuse | say | bow | seat).', {
  draw(g, t, info) {
    const gt = info.globalT, v = info.view || 'wide';
    const cams = { wide: [K(0, 960, 560, 1.0), K(info.dur, 900, 580, 1.06)], refuse: [K(0, 640, 600, 1.45), K(info.dur, 620, 610, 1.6)], say: [K(0, 520, 560, 1.6), K(info.dur, 520, 520, 1.75)],
      bow: [K(0, 760, 600, 1.15), K(info.dur, 760, 600, 1.2)], seat: [K(0, 1000, 600, 1.2), K(info.dur, 1000, 590, 1.32)] };
    let st; withCam(g, t, cams[v], (g) => { st = throneRoom(g, t, gt); });
    if (v === 'wide') tag(g, 'султан Египта', 1440, 300, pop(t, at(info, 'султан', 0.5)), { size: 56, bg: '#ffd43b' });
    if (v === 'refuse') { const k = pop(gt, TH.refuse + 0.6); bubble(g, 840, 360, 260, 150, k, (g) => hand(g, 'Нет.', 0, 4, { size: 80 }), { tail: -80 }); }
    if (v === 'say') bubble(g, 760, 300, 560, 170, pop(gt, TH.say), (g) => hand(g, '«Я кланяюсь Богу…»', 0, 4, { size: 64 }), { tail: -200 });
    finish(g);
  } });

// ================================================================ N — сегодня в интернете вы прочитаете
tpl('kidPhone', 'Modern bedroom at night: a kid in bed scrolls a phone, the screen lights his face.', {
  draw(g, t, info) {
    withCam(g, t, [K(0, 960, 560, 1.0), K(info.dur, 900, 600, 1.2)], (g) => {
      T.wallRoom(g, { wall: '#3a4a7a', floor: '#4a3a5a', fy: 820 });
      T.window_(g, 1250, 150, 380, 320, (g) => { T.sky(g, ['#101a3a', '#2a3a6a']); T.skyline(g, 330, t, { col: '#1a2244', win: '#ffd77a' }); });
      T.frame(g, 300, 200, 220, 160, (g) => { T.sky(g, ['#f6b26b', '#fbe0a8']); T.ell(g, 410, 290, 40, 40, '#fff6d0', 0); });
      box(g, 380, 700, 1000, 160, '#e9e2f2', { r: 20 }); box(g, 340, 640, 120, 260, '#6a4a8a', { r: 20 }); box(g, 420, 660, 220, 90, '#fbf6ea', { r: 30 });
      person(g, { ...CA.KID, x: 640, y: 760, s: 1.0, t, sit: true, pose: 'hold', look: 0.5, expr: 'neutral' });
      box(g, 600, 740, 760, 140, '#5a7ad9', { r: 30 });
      g.save(); g.translate(740, 590); g.rotate(-0.2); box(g, -26, -44, 52, 88, '#24242c', { r: 8, lw: 4 }); g.fillStyle = '#e8f0ff'; g.fillRect(-20, -36, 40, 70); g.restore();
      light(g, 720, 560, 260, '#cfe0ff', 0.55);
    });
    T.dim(g, 0.12, '#101030'); finish(g);
  } });
tpl('phoneArticle', 'Phone screen close-up: article «Манса Муса — самый богатый человек в истории» with a cartoon portrait; thumb scrolls.', {
  draw(g, t, info) {
    const tR = at(info, 'самый', 0.3);
    withCam(g, t, [K(0, 960, 560, 1.0), K(info.dur, 960, 520, 1.12)], (g) => {
      g.fillStyle = '#20223a'; g.fillRect(-500, -500, 3000, 2200); light(g, 960, 540, 700, '#5a6ab0', 0.4);
      T.phone(g, 960, 560, 2.0, (g) => {
        g.fillStyle = '#fff'; g.fillRect(-104, 0, 208, 400); const sc = -k01(t, 0.2, 1.2) * 30;
        g.translate(0, sc); g.fillStyle = '#e8ecf4'; g.fillRect(-104, 0, 208, 30); hand(g, 'www', -70, 15, { size: 18, color: '#7a8aa8' });
        box(g, -92, 44, 184, 120, '#f6dcae', { r: 6, lw: 3 }); g.save(); g.translate(0, 168); g.scale(0.36, 0.36); person(g, { ...CA.MUSA, x: 0, y: 0, s: 1, t, expr: 'smile' }); g.restore();
        const lines = ['Манса Муса —', 'самый богатый', 'человек', 'в истории']; lines.forEach((s, i) => { const k = clamp((t - (tR - 0.6) - i * 0.25) / 0.2); if (k > 0) hand(g, s, 0, 196 + i * 30, { size: 30, color: i ? OL : '#b8322a', a: k }); });
        for (let i = 0; i < 4; i++) { g.fillStyle = '#d8dce6'; g.fillRect(-90, 330 + i * 16, 180 - (i % 2) * 50, 8); }
      });
      const k = (t * 0.9) % 1; ell(g, 1180 + 30, 820 - k * 80, 50, 60, SKIN.light, 5);
    });
    finish(g);
  } });

// ================================================================ O — $400 млрд: Муса на башне из золота
tpl('tower', 'Musa standing on a gigantic tower of gold bars reaching above the clouds; tag «$400 млрд».', {
  draw(g, t, info) {
    const t4 = at(info, 'четыреста', 0.05);
    withCam(g, t, [K(0, 960, 860, 1.25), K(info.dur * 0.6, 960, 480, 1.0), K(info.dur, 960, 440, 0.95)], (g) => {
      T.sky(g, ['#5d4a8a', '#e3786a', '#f6b26b', '#fbe0a8'], -200, 1200);
      for (let i = 0; i < 6; i++) T.ell(g, ((i * 380 + t * 15) % 2400) - 200, 520 + (i % 3) * 60, 200, 40, 'rgba(255,240,230,.85)', 0);
      T.skyline(g, 1250, t, { col: '#4a3a6a', win: '#ffd77a', seed: 9 });
      const h = lerp(4, 30, k01(t, 0, info.dur * 0.7));
      for (let i = 0; i < h; i++) { const y = 1300 - i * 34; for (let j = -2; j <= 2; j++) goldBar(g, 960 + j * 74 + (i % 2) * 37, y, 90); }
      const top = 1300 - h * 34;
      person(g, { ...CA.MUSA, x: 960, y: top, s: 0.9, t, pose: 'cheer', expr: 'grin' });
      light(g, 960, top - 150, 300, '#ffe08a', 0.5);
    });
    tag(g, '$400 млрд', 1420, 300, pop(t, t4), { size: 92, bg: '#ffd43b' });
    finish(g);
  } });

// ================================================================ P — запомните эту цифру… откуда она взялась
tpl('pinboard', 'Detective corkboard: the «$400 млрд» tag gets pinned, red string to a big «?» note; a magnifier hovers; a wall clock ticks.', {
  draw(g, t, info) {
    const tQ = at(info, 'откуда', 0.7);
    withCam(g, t, [K(0, 960, 540, 1.0), K(tQ, 1000, 520, 1.12), K(info.dur, 1120, 500, 1.35)], (g) => {
      T.wallRoom(g, { wall: '#5a4a3a', floor: '#3a2a22', fy: 980 });
      box(g, 300, 120, 1320, 760, '#c99a5a', { r: 6 }); g.fillStyle = 'rgba(120,70,30,.15)'; for (let i = 0; i < 300; i++) g.fillRect((i * 97) % 1300 + 310, (i * 53) % 740 + 130, 4, 4);
      [[420, 200, 220, 160], [1340, 600, 200, 150], [460, 620, 180, 130]].forEach(([x, y, w, h], i) => { box(g, x, y, w, h, '#f6efe0', { r: 2, lw: 4 }); for (let j = 0; j < 4; j++) line(g, [[x + 20, y + 30 + j * 26], [x + w - 30, y + 30 + j * 26]], 3, '#9a9a9a'); T.ell(g, x + w / 2, y + 8, 9, 9, C.red, 3); });
      const kp = pop(t, 0.2); g.save(); g.translate(760, 420); tag(g, '$400 млрд', 0, 0, kp, { size: 84, bg: '#ffd43b' }); g.restore(); T.ell(g, 760, 360, 11, 11, C.red, 4);
      const ks = k01(t, 1.0, 2.2); if (ks > 0) line(g, [[760, 360], [lerp(760, 1240, ks), lerp(360, 330, ks)]], 5, C.red);
      if (t > 1.6) { box(g, 1140, 220, 210, 210, '#ffe36a', { r: 4, lw: 4 }); hand(g, '?', 1245, 330, { size: 170, color: C.red }); T.ell(g, 1240, 330 - 100, 11, 11, C.red, 4); }
      const mx = 760 + Math.sin(t * 1.4) * 160, my = 500 + Math.cos(t * 1.1) * 60; T.ell(g, mx, my, 90, 90, 'rgba(200,230,255,.3)', 12); limb(g, [[mx + 64, my + 64], [mx + 150, my + 150]], 26, '#6a4a2a');
      T.clock(g, 1760, 240, 90, t, 0.6);
    });
    finish(g);
  } });

// ================================================================ R — римлянин, который скупал горящие дома
tpl('crassusFire', 'Roman street at dusk: an insula burns; Crassus calmly offers a small coin bag to the crying owner.', {
  draw(g, t, info) {
    withCam(g, t, [K(0, 960, 560, 1.05), K(info.dur, 900, 580, 1.2)], (g) => {
      T.sky(g, ['#3a2a4a', '#a84a3a', '#e88a4a']);
      [[150, 300, 420, '#d9b08a'], [520, 380, 520, '#c99a7a'], [1300, 360, 460, '#d8b890']].forEach(([x, w, h, c]) => { box(g, x, 900 - h, w, h, c, { r: 2 }); poly(g, [[x - 20, 900 - h], [x + w + 20, 900 - h], [x + w / 2, 900 - h - 90]], '#a8523a'); for (let r = 0; r < 3; r++) for (let j = 0; j < 3; j++) box(g, x + 40 + j * (w - 80) / 3, 900 - h + 60 + r * 120, 50, 70, '#3a2a2a', { r: 2, lw: 4 }); });
      T.smoke(g, 780, 380, t, 7, 1.2); T.flame(g, 700, 520, 1.1, t, 1); T.flame(g, 860, 470, 0.9, t, 2); T.flame(g, 780, 700, 0.8, t, 3);
      g.fillStyle = T.vgrad(g, 900, 300, '#8a7a6a', 0.1); g.fillRect(-500, 900, 3000, 400); line(g, [[-500, 900], [2500, 900]], 5);
      person(g, { ...CA.ROMAN(0), x: 1040, y: 1000, s: 1.05, t, expr: 'sad', pose: 'shrug', face: -1, look: -0.4, sweat: true });
      person(g, { ...CA.CRASSUS, x: 1340, y: 1010, s: 1.1, t, expr: 'smirk', pose: 'give', face: -1, look: -0.7, prop: (g, h) => sack(g, h.r[0] + 10, h.r[1] + 40, 0.5, '#c99a4a') });
    });
    tag(g, 'Рим', 200, 120, pop(t, 0.2), { size: 58, bg: '#ffd43b' });
    finish(g);
  } });
// ================================================================ S — банкир, который купил императору корону
tpl('fuggerCrown', 'Fugger\'s counting room: the banker presents a crown on a red cushion to a young emperor; ledgers and coin stacks.', {
  draw(g, t, info) {
    const tC = at(info, 'корону', 0.8);
    withCam(g, t, [K(0, 960, 560, 1.05), K(info.dur, 980, 520, 1.2)], (g) => {
      T.wallRoom(g, { wall: '#4a6a5a', floor: '#7a5232', fy: 800, boards: true });
      T.window_(g, 820, 150, 280, 380, (g) => { T.sky(g, ['#86c8ea', '#e8f4f8']); }, {});
      T.shelf(g, 200, 420, 420, [(g, x, y) => T.books(g, x - 70, y, 6, 4), (g, x, y) => barPile(g, x, y, 6, 50)]);
      box(g, 300, 760, 520, 40, '#6a4428', { r: 4 }); for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i % 2; j++) T.coin(g, 360 + i * 110, 750 - j * 10, 26);
      person(g, { ...CA.FUGGER, x: 820, y: 960, s: 1.1, t, pose: 'hold', expr: 'smirk', look: 0.8, prop: (g, h) => { const x = (h.l[0] + h.r[0]) / 2, y = h.l[1] - 10; box(g, x - 70, y - 10, 140, 26, '#a8322a', { r: 10 }); g.save(); g.translate(x, y + 30); g.scale(0.7, 0.7); T.hat(g, 'crown', null, t); g.restore(); } });
      person(g, { ...CA.EMPEROR, x: 1260, y: 970, s: 1.1, t, pose: t > tC ? 'cheer' : 'idle', expr: t > tC ? 'grin' : 'neutral', face: -1, look: -0.6 });
    });
    tag(g, 'банкир', 520, 240, pop(t, 0.3), { size: 58, bg: '#ffd43b' });
    finish(g);
  } });
// ================================================================ T — нефтяной король, чьё состояние больше бюджета страны
tpl('oilKing', 'Rockefeller on oil barrels with derricks behind; two money stacks grow — «бюджет США» vs his fortune, his is taller.', {
  draw(g, t, info) {
    const tB = at(info, 'больше', 0.55);
    withCam(g, t, [K(0, 900, 560, 1.15), K(info.dur, 960, 520, 1.0)], (g) => {
      T.sky(g, ['#86c8ea', '#e8f4f8', '#f6e3b6']);
      for (let i = 0; i < 4; i++) { const x = 140 + i * 260; poly(g, [[x, 860], [x + 160, 860], [x + 80, 420]], 'rgba(0,0,0,0)', 6); line(g, [[x, 860], [x + 80, 420], [x + 160, 860]], 8); for (let j = 1; j < 5; j++) line(g, [[x + j * 16, 860 - j * 88], [x + 160 - j * 16, 860 - j * 88]], 4); }
      g.fillStyle = T.vgrad(g, 860, 300, '#9a8a5a', 0.1); g.fillRect(-500, 860, 3000, 400); line(g, [[-500, 860], [2500, 860]], 5);
      for (let i = 0; i < 3; i++) box(g, 360 + i * 120, 760, 110, 150, '#2a3a4a', { r: 10 });
      person(g, { ...CA.ROCKEFELLER, x: 480, y: 770, s: 1.0, t, pose: 'hips', expr: t > tB ? 'smirk' : 'neutral', look: 0.7 });
      const k = k01(t, 0.4, tB + 0.6), a = Math.round(lerp(1, 18, k)), b = Math.round(lerp(1, 15, k));
      T.banknoteStack(g, 1150, 940, b, 170, '#9ad07a'); T.banknoteStack(g, 1520, 940, a, 170, '#f2c037');
      hand(g, 'бюджет США', 1150, 990, { size: 50 }); hand(g, 'Рокфеллер', 1520, 990, { size: 50 });
    });
    yearTag(g, '1913', pop(t, 0.2));
    finish(g);
  } });
// ================================================================ U — или человек, который живёт прямо сейчас?
tpl('nowMan', 'Today\'s city: a dark silhouette of a modern billionaire with a big «?» above, a phone in hand, a rocket launch far away.', {
  draw(g, t, info) {
    withCam(g, t, [K(0, 960, 560, 1.0), K(info.dur, 960, 600, 1.2)], (g) => {
      T.sky(g, ['#2a3a7a', '#7a6ab0', '#e8a0a0']); T.skyline(g, 880, t, { col: '#3a3a6a', win: '#ffd77a', seed: 3 });
      const ry = 760 - Math.max(0, t - 0.6) * 260; poly(g, [[1600, ry - 120], [1630, ry - 40], [1630, ry + 40], [1570, ry + 40], [1570, ry - 40]], '#f6efe0', 4); T.flame(g, 1600, ry + 120, -0.4, t, 4); T.smoke(g, 1600, 900, t, 5, 0.8);
      g.fillStyle = '#3a3050'; g.fillRect(-500, 880, 3000, 400); line(g, [[-500, 880], [2500, 880]], 5);
      g.save(); g.globalAlpha = 1; person(g, { ...CA.MODERN, skin: '#1e1a26', col: '#1e1a26', col2: '#1e1a26', hair: { s: 'short', c: '#1e1a26' }, x: 900, y: 1000, s: 1.25, t, pose: 'hold', expr: 'neutral' }); g.restore();
      hand(g, '?', 900, 480 + Math.sin(t * 3) * 10, { size: 260, color: '#ffd43b' });
    });
    yearTag(g, 'сегодня', pop(t, 0.2));
    finish(g);
  } });
// ================================================================ V — давайте посчитаем. Честно.
tpl('countDesk', 'Top-down desk: hands slide abacus beads, a ledger with columns; on «Честно» a balance scale levels out.', {
  draw(g, t, info) {
    const tH = at(info, 'честно', 0.4);
    withCam(g, t, [K(0, 960, 540, 1.1), K(info.dur, 960, 540, 1.0)], (g) => {
      g.fillStyle = T.vgrad(g, 0, 1080, '#8a5a32', 0.15); g.fillRect(-500, -500, 3000, 2200); for (let i = 0; i < 14; i++) line(g, [[-500, i * 90 + 20], [2500, i * 90 + 40]], 3, 'rgba(60,30,10,.3)');
      box(g, 260, 180, 700, 520, '#f6efe0', { r: 6 }); line(g, [[610, 200], [610, 680]], 3, '#c9b89a');
      const rows = ['Муса', 'Красс', 'Фуггер', 'Рокфеллер', '…']; rows.forEach((s, i) => { hand(g, s, 300, 260 + i * 90, { size: 52, align: 'left' }); if (t > 0.5 + i * 0.4) hand(g, '?', 760, 260 + i * 90, { size: 60, color: C.red }); });
      box(g, 1080, 220, 600, 400, '#7a4a2a', { r: 10 }); for (let r = 0; r < 5; r++) { line(g, [[1100, 280 + r * 70], [1660, 280 + r * 70]], 5, '#c9a46a'); for (let b = 0; b < 6; b++) { const sh = (r + b) % 3 === 0 ? k01(t, 0.3 + r * 0.3, 0.8 + r * 0.3) * 120 : 0; T.ell(g, 1140 + b * 50 + (b > 2 ? 140 : 0) + (b <= 2 ? sh : -sh * 0), 280 + r * 70, 24, 20, ['#d94a3a', '#f2c037', '#3a7ad9'][r % 3], 4); } }
      { const hx = 1380 + Math.sin(t * 3) * 40; limb(g, [[hx + 40, 1200], [hx, 760]], 70, '#3a6aa8'); ell(g, hx, 720, 52, 58, SKIN.light, 5); }
      T.scale2(g, 960, 1000, 0.8, lerp(0.2, 0, k01(t, tH, tH + 0.7)), (g) => T.coin(g, 0, -20, 26), (g) => T.coin(g, 0, -20, 26, '#cfd5e0'));
    });
    finish(g);
  } });
