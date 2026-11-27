// «Высота зданий» · пробный отрывок в стиле Whiteboard Explainer (движок Lemo-Opuscar wb.js).
// Время = секунды фильма (озвучка film.json). Карта (20.6–30.9) вставляется поверх при сборке.
import * as W from './engine/wb.js';
import { clamp, lerp, mulberry } from '/core/lib.js';
const { INK } = W;
export const END = 85.3;

export async function build() {
  await W.loadFont('cv', 'fonts/caveat_lines.json');
  const tl = new W.Timeline();
  const K = new W.Pen('black', INK.black, { park: [2250, 1300] });
  const O = new W.Pen('orange', INK.orange, { park: [2350, 1150] });
  const B = new W.Pen('blue', INK.blue, { park: [2150, 1420] });
  const R = new W.Pen('red', INK.red, { park: [-300, 1300] });
  const G = new W.Pen('green', INK.green, { park: [2300, 1250] });
  const T = (s, x, y, o = {}) => W.text(s, x, y, { font: 'cv', h: 56, ...o });
  const D = (pen, shapes, a, b, o = {}) => tl.draw(pen, shapes, a, { by: b, ...o });
  const counters = [];      // числа, которые бегут (рисуются шрифтом Caveat поверх доски)
  const count = (fmt, a, b, x, y, t0, t1, o = {}) => counters.push({ fmt, a, b, x, y, t0, t1, size: o.size || 130, color: o.color || INK.orange, eraseAt: o.eraseAt });
  const cards = [];         // печатная машинка на чёрном (экранный слой)
  const typeCard = (str, t0, t1, t2) => { cards.push({ str, t0, t1, t2 }); const n = str.replace(/\s/g, '').length; for (let i = 0; i < n; i++) tl.cue(t0 + (t1 - t0) * i / Math.max(1, n - 1), 'key'); };

  // призраки старых уроков (еле видные)
  const ghosts = [], gR = mulberry(99);
  for (let i = 0; i < 40; i++) {
    const x = gR() * 7600 + 200, y = gR() * 4100 + 200, k = gR(), o = { w: 12, alpha: .05 + gR() * .04, color: gR() < .2 ? '#8aa0c8' : '#9aa0a8' };
    if (k < .3) ghosts.push(...T(['x = 4', 'вт', 'дз', 'ок', 'f(x)', 'стр. 7', '→ 12', 'итог'][i % 8], x, y, { h: 50 + gR() * 40, ...o }));
    else if (k < .55) ghosts.push(W.circle(x, y, 40 + gR() * 110, o));
    else ghosts.push(W.line(x, y, x + 200 + gR() * 500, y + (gR() - .5) * 80, o));
  }

  // ═════════ 0. заголовок машинкой
  typeCard('ХОЛОДНЫЙ СТАРТ', 0.05, 0.75, 0.98);

  // ═════════ A. «Самое тяжёлое в небоскрёбе не бетон и не люди» 1.0–4.16
  const L = [[900, 2300], [912, 1800], [950, 1800], [962, 1400], [1000, 1400], [1018, 1050], [1058, 1050], [1078, 760], [1094, 760], [1100, 600]];
  const tower = [W.poly(L, { w: 9 }), W.poly(L.map(([x, y]) => [2200 - x, y]), { w: 9 }), W.line(820, 2300, 1380, 2300, { w: 9 })];
  D(K, tower, 1.05, 2.5);
  D(K, T('бетон', 1500, 1520, { h: 64 }), 2.55, 3.0);
  D(R, W.line(1480, 1540, 1720, 1460, { w: 8 }), 3.0, 3.15);
  D(K, [W.circle(1540, 1700, 18, { w: 6 }), W.line(1540, 1718, 1540, 1790, { w: 6 }), W.line(1510, 1745, 1570, 1745, { w: 6 }), W.line(1540, 1790, 1518, 1840, { w: 6 }), W.line(1540, 1790, 1562, 1840, { w: 6 }),
    ...T('люди', 1600, 1800, { h: 64 })], 3.2, 3.85);
  D(R, W.line(1490, 1820, 1780, 1720, { w: 8 }), 3.9, 4.1);
  // «Это верёвка, на которой висит лифт» 4.16–6.86
  const shaft = [W.line(1080, 820, 1080, 2280, { w: 5, color: '#7d828a' }), W.line(1120, 820, 1120, 2280, { w: 5, color: '#7d828a' })];
  D(K, [...shaft, W.circle(1100, 840, 16, { w: 6 })], 4.2, 4.9);
  D(K, W.rect(1084, 1600, 32, 46, { w: 6, over: 3 }), 4.95, 5.2);
  D(O, W.line(1100, 856, 1100, 1600, { w: 7 }), 5.25, 5.9);
  D(O, [...T('верёвка!', 1300, 1180, { h: 70 }), ...W.arrow(1290, 1160, 1112, 1120, { w: 6, head: 22 })], 5.95, 6.8);
  // «И чем выше башня, тем она тяжелее» 6.86–9.64
  const tall = [[900, 2300], [950, 1300], [1020, 700], [1070, 300], [1100, 150]];
  D(B, [...W.dashed(tall, { w: 6 }), ...W.dashed(tall.map(([x, y]) => [2200 - x, y]), { w: 6 })], 6.9, 8.0, { minGap: .01, maxGap: .03 });
  D(O, W.line(1112, 856, 1112, 1600, { w: 12, color: INK.orange }), 8.05, 8.45);
  D(O, T('выше = тяжелее', 1300, 560, { h: 70 }), 8.5, 9.55);
  // «Тимур, выдуманный лифтёр, едет вверх уже третью минуту» 9.64–14.72
  D(B, [W.circle(1100, 1612, 6, { w: 4 }), W.line(1100, 1618, 1100, 1634, { w: 4 }), W.line(1100, 1634, 1094, 1644, { w: 4 }), W.line(1100, 1634, 1106, 1644, { w: 4 })], 9.7, 10.2);
  D(B, [...T('Тимур', 1170, 1640, { h: 40 }), ...W.arrow(1165, 1630, 1124, 1626, { w: 4, head: 12 })], 10.25, 11.0);
  D(B, [...W.arrow(1150, 1690, 1150, 1560, { w: 5, head: 16 })], 11.8, 12.3);
  D(K, [W.circle(1230, 1600, 30, { w: 5 }), W.line(1230, 1600, 1230, 1576, { w: 5 }), W.line(1230, 1600, 1250, 1607, { w: 5 }), ...T('3 мин', 1275, 1614, { h: 40 })], 12.4, 14.4);
  // «однажды верёвка станет тяжелее всего остального. Что тогда?» 14.72–20.12
  const sc = [W.line(2300, 1080, 2300, 1560, { w: 8 }), W.line(2180, 1560, 2420, 1560, { w: 8 }), W.line(2020, 1180, 2580, 1040, { w: 8 })];
  const panL = [W.line(2020, 1180, 1960, 1330, { w: 4 }), W.line(2020, 1180, 2080, 1330, { w: 4 }), W.arc(2020, 1330, 80, 0, Math.PI, { w: 7, ry: 34 })];
  const panR = [W.line(2580, 1040, 2520, 1190, { w: 4 }), W.line(2580, 1040, 2640, 1190, { w: 4 }), W.arc(2580, 1190, 80, 0, Math.PI, { w: 7, ry: 34 })];
  D(K, [...sc, ...panL, ...panR], 14.8, 16.2);
  const coil = []; for (let i = 0; i < 4; i++) coil.push(W.arc(2020, 1320 - i * 14, 52 - i * 8, Math.PI, 3 * Math.PI, { w: 6, ry: 16 }));
  D(O, coil, 16.25, 16.9);
  D(K, [W.rect(2555, 1150, 36, 40, { w: 5, over: 2 }), W.circle(2620, 1160, 9, { w: 4 }), W.line(2620, 1169, 2620, 1190, { w: 4 })], 16.95, 17.35);
  D(O, T('верёвка', 1910, 1460, { h: 56 }), 17.4, 18.2);
  D(K, T('всё остальное', 2460, 1320, { h: 48 }), 18.25, 19.3);
  D(R, T('?', 2720, 1250, { h: 240, w: 16 }), 19.45, 20.1);

  // ═════════ B. план (после карты) 30.9–38.72
  D(K, T('Что я покажу', 3350, 720, { h: 80 }), 30.95, 32.4);
  D(K, T('1.', 3350, 930, { h: 70 }), 32.6, 32.8);
  D(K, W.line(3500, 840, 3500, 1080, { w: 7 }), 32.85, 33.2);
  D(K, W.line(3440, 840, 3560, 840, { w: 8 }), 33.2, 33.35);
  D(R, W.poly([[3480, 880], [3495, 892], [3506, 876], [3520, 894]], { w: 6, jitter: .2 }), 33.4, 33.6);
  D(K, T('где рвётся сталь', 3610, 960, { h: 64 }), 33.65, 35.3);
  D(B, T('через 2 минуты', 3610, 1040, { h: 46 }), 35.35, 36.0);
  D(K, T('2.', 3350, 1250, { h: 70 }), 36.2, 36.4);
  D(K, W.roundRect(3450, 1160, 110, 110, 18, { w: 7 }), 36.45, 36.9);
  D(R, T('?', 3486, 1250, { h: 76 }), 36.95, 37.2);
  D(K, T('главный ответ', 3610, 1240, { h: 64 }), 37.25, 38.3);
  D(B, T('в самом конце', 3610, 1320, { h: 46 }), 38.3, 38.9);

  // ═════════ C. «Сначала проверим верёвку…» 39.43–50.81
  D(K, T('Проверка 1: верёвка', 4450, 720, { h: 76 }), 39.5, 41.0);
  D(K, [W.line(4580, 820, 4580, 1680, { w: 6, color: '#7d828a' }), W.line(4660, 820, 4660, 1680, { w: 6, color: '#7d828a' }), W.line(4540, 820, 4700, 820, { w: 9 })], 41.05, 41.9);
  D(K, W.rect(4590, 1200, 60, 80, { w: 7, over: 3 }), 41.95, 42.3);
  D(O, W.line(4620, 825, 4620, 1200, { w: 8 }), 42.35, 42.8);
  D(B, [...T('половина пути', 4700, 1260, { h: 50 }), ...W.arrow(4695, 1245, 4664, 1238, { w: 4, head: 14 })], 42.85, 43.8);
  D(K, T('вес троса =', 4850, 950, { h: 64 }), 43.85, 45.0);
  D(K, T('длина × вес 1 метра', 4850, 1040, { h: 64 }), 45.0, 46.5);
  D(O, T('длиннее → тяжелее', 4850, 1150, { h: 64 }), 46.55, 48.1);
  const hand = [W.arc(5560, 1450, 90, Math.PI * .05, Math.PI * .95, { w: 7 }), ...[[-80, -20, -110, -150], [-40, -50, -50, -210], [0, -55, 10, -225], [40, -50, 65, -205], [80, -10, 130, -110]].map(([a, b2, c, d2]) => W.line(5560 + a, 1450 + b2, 5560 + c, 1450 + d2, { w: 7 }))];
  D(K, hand, 48.15, 49.4);
  D(B, T('на пальцах', 5700, 1420, { h: 50 }), 49.4, 50.6);

  // ═════════ D. глава «ТРОС»
  typeCard('ТРОС', 52.6, 53.4, 54.15);

  // ═════════ E. глава «Трос» 54.13–85.14 (низ доски, y + 2500)
  const Y = 2500;
  D(K, [W.line(620, Y + 150, 1300, Y + 150, { w: 9 }), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => W.line(650 + i * 85, Y + 150, 690 + i * 85, Y + 105, { w: 4, color: '#7d828a' }))], 54.3, 54.85);
  D(K, W.curve([[960, Y + 150], [963, Y + 400], [958, Y + 600], [960, Y + 760]], { w: 9 }), 54.9, 55.6);
  D(K, T('стальной канат', 1000, Y + 640, { h: 66 }), 55.0, 55.75);
  D(K, T('прочность стали', 1420, Y + 290, { h: 60 }), 56.0, 57.3);
  count(v => `${Math.round(v / 2)}–${Math.round(v)} ГПа`, 0, 2, 1420, Y + 450, 57.85, 59.0);
  D(K, T('1 ГПа это:', 2620, Y + 250, { h: 60 }), 59.35, 60.3);
  D(B, W.rect(2700, Y + 330, 110, 110, { w: 7 }), 60.4, 61.2);
  D(B, T('1 мм²', 2830, Y + 410, { h: 56 }), 61.2, 61.7);
  D(K, [W.line(2755, Y + 440, 2755, Y + 560, { w: 6 }), W.poly([[2690, Y + 700], [2715, Y + 560], [2795, Y + 560], [2820, Y + 700], [2690, Y + 700]], { w: 7 })], 61.8, 62.7);
  count(v => `${Math.round(v)} кг`, 0, 100, 2870, Y + 690, 62.4, 63.9);
  D(K, [W.line(4450, Y + 120, 5150, Y + 120, { w: 9 }), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => W.line(4480 + i * 85, Y + 120, 4520 + i * 85, Y + 75, { w: 4, color: '#7d828a' }))], 64.1, 64.55);
  D(K, W.curve([[4800, Y + 120], [4802, Y + 330], [4798, Y + 560], [4800, Y + 800]], { w: 9 }), 64.6, 66.2);
  D(B, [0, 1, 2, 3, 4].map(i => W.arrow(4840, Y + 700 - i * 125, 4840, Y + 760 - i * 125, { w: 5, head: 16 })), 66.45, 68.3, { minGap: .02 });
  D(B, T('нижние метры', 4880, Y + 440, { h: 54 }), 66.6, 67.6);
  D(B, T('тянут верхние', 4880, Y + 510, { h: 54 }), 67.6, 68.6);
  typeCard('Почему канат рвётся под собственным весом?', 69.6, 72.9, 73.3);
  D(G, [...W.arrow(4740, Y + 740, 4740, Y + 790, { w: 5, head: 14 }), ...T('держит чуть-чуть', 4700, Y + 800, { h: 50, align: 'right' })], 74.2, 75.9);
  D(O, W.poly([[4730, Y + 140], [4710, Y + 150], [4710, Y + 790], [4730, Y + 800]], { w: 5 }), 76.4, 77.6);
  D(O, T('верх несёт всю длину', 4690, Y + 250, { h: 54, align: 'right' }), 77.7, 79.6);
  D(R, W.poly([[4770, Y + 170], [4790, Y + 185], [4805, Y + 168], [4822, Y + 188], [4838, Y + 172]], { w: 7, jitter: .2 }), 81.6, 82.1);
  D(R, W.circle(4802, Y + 178, 62, { w: 6 }), 82.5, 83.4);
  D(R, T('рвётся здесь', 4890, Y + 190, { h: 52 }), 83.3, 84.6);
  tl.end();

  // ───────── камера [t, x, y, zoom, rot, ease]
  const cam = new W.Camera([
    [0, 1700, 1500, .55], [1.0, 1700, 1500, .55, 0, 'l'],
    [2.6, 1500, 1560, .6, 0, 'io'],                 // к подписям «бетон / люди»
    [4.2, 1150, 1250, .95, 0, 'io'],                 // в шахту: верёвка
    [6.9, 1950, 1250, .5, 0, 'io'],                  // отъезд: башня растёт
    [8.4, 2000, 1150, .48, 0, 'l'],
    [9.7, 1150, 1600, 2.2, 0, 'io'],                 // наезд на кабину и Тимура
    [12.3, 1180, 1560, 1.9, 0, 'io'],
    [14.8, 2300, 1260, .95, 0, 'io'],                // к весам
    [19.3, 2380, 1220, 1.0, 0, 'l'],
    [20.1, 2420, 1200, 1.05, 0, 'l'],
    [30.4, 3850, 1050, .95, 0, 'io'],                // (под картой) к плану
    [38.9, 3870, 1040, .98, 0, 'l'],
    [39.45, 5050, 1150, .95, 0, 'io'],               // перелёт к проверке
    [47.9, 5100, 1150, .98, 0, 'l'],
    [48.6, 5450, 1280, 1.1, 0, 'io'],                // к «пальцам»
    [51.5, 5460, 1290, 1.12, 0, 'l'],
    [54.15, 960, Y + 470, 1.25, 0, 'h'],             // после машинки: начало главы
    [55.85, 1350, Y + 470, 1.0, 0, 'io'],
    [59.25, 3000, Y + 470, 1.1, 0, 'io'],
    [63.95, 4800, Y + 470, 1.15, 0, 'io'],
    [73.3, 4800, Y + 470, 1.15, 0, 'l'],
    [80.2, 4790, Y + 330, 1.4, 0, 'io'],
    [85.3, 4790, Y + 320, 1.42, 0, 'l'],
  ]);

  const board = new W.Board(tl, { ghosts });
  for (const p of [K, O, B, R, G]) board.objs.push({ draw: (ctx, t, c) => { const pose = W.penPose(p, t, cam); if (pose) W.drawMarker(ctx, p, pose, c, t); } });
  board.objs.push({ draw: (ctx, t, c) => {           // числа-счётчики в мировых координатах
    W.applyCam(ctx, c);
    for (const n of counters) {
      if (t < n.t0 - .1) continue;
      const u = 1 - Math.pow(1 - clamp((t - n.t0) / (n.t1 - n.t0)), 3), v = lerp(n.a, n.b, u);
      const pop = 1 + .1 * Math.exp(-(((t - n.t1) * 7) ** 2));
      ctx.save(); ctx.translate(n.x, n.y); ctx.scale(pop, pop); ctx.globalAlpha = clamp((t - n.t0 + .1) / .15) * .95;
      ctx.globalCompositeOperation = 'multiply'; ctx.font = `700 ${n.size}px CV`; ctx.fillStyle = n.color; ctx.fillText(n.fmt(v), 0, 0); ctx.restore();
    }
  } });
  board.overlays.push({ draw: (ctx, t) => {          // печатная машинка на чёрном
    for (const cd of cards) {
      if (t < cd.t0 - .1 || t > cd.t2 + .1) continue;
      const a = clamp((t - cd.t0 + .1) / .1) * (1 - clamp((t - cd.t2) / .1));
      ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1920, 1080);
      const size = cd.str.length > 20 ? 66 : 92; ctx.font = `400 ${size}px PM`; ctx.fillStyle = '#f2f0ea';
      const words = cd.str.split(' '), rows = []; let cur = '';
      for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > 1500 && cur) { rows.push(cur); cur = w; } else cur = tr; }
      rows.push(cur);
      const n = cd.str.replace(/\s/g, '').length, u = clamp((t - cd.t0) / (cd.t1 - cd.t0)); let shown = Math.floor(u * n + 1e-6) + (u >= 1 ? 1 : 0);
      const lh = size * 1.35, y0 = 540 - (rows.length - 1) * lh / 2; let cx = 0, cy = 0;
      rows.forEach((ln, i) => { const x0 = 960 - ctx.measureText(ln).width / 2; let s = '';
        for (const ch of ln) { if (ch !== ' ') { if (shown <= 0) break; shown--; } s += ch; }
        ctx.fillText(s, x0, y0 + i * lh); if (s) { cx = x0 + ctx.measureText(s).width; cy = y0 + i * lh; } });
      if (u < 1 || Math.floor(t * 2.4) % 2 === 0) { ctx.fillStyle = INK.orange; ctx.fillRect(cx + 10, cy - size * .78, size * .5, size * .92); }
      ctx.globalAlpha = 1;
    }
  } });

  const off = new OffscreenCanvas(1920, 1080), oc = off.getContext('2d');
  function render(ctx, t) {                          // размытие движения на быстрых перелётах камеры
    const dt = 1 / 30, a = cam.at(t), b = cam.at(Math.max(0, t - dt));
    const sp = Math.hypot((a.x - b.x) * a.z, (a.y - b.y) * a.z) + Math.abs(Math.log(a.z / b.z)) * 900;
    const N = sp > 14 ? Math.min(10, Math.ceil(sp * .5 / 4)) : 1;
    if (N === 1) { board.render(ctx, t, cam); return; }
    const ov = board.overlays; board.overlays = [];
    for (let i = 0; i < N; i++) { board.render(oc, t - dt * .5 * i / (N - 1), cam); ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(off, 0, 0); }
    ctx.globalAlpha = 1; board.overlays = ov; for (const o of ov) { ctx.save(); o.draw(ctx, t); ctx.restore(); }
  }
  const ev = [...tl.ev].sort((a, b) => a.t - b.t);
  for (const n of counters) ev.push({ t: n.t0, type: 'count', dur: n.t1 - n.t0 });
  return { dur: END, render, ev, cam, tl };
}
