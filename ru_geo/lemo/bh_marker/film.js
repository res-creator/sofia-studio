// «Мысленный эксперимент» · «Какой высоты бывают небоскрёбы» — доска 0–85.3 с в стиле Marker on Paper (Lemo-Opuscar).
// Время = секунды фильма (озвучка building_height/film.json). 20.6–30.9 закрыто картой (bh_map): там лист пустой.
// Тот же сюжет и те же такты, что в bh_board (Whiteboard Explainer), рассказанные грамматикой маркера на бумаге:
// один вопрос на лист, чёрный = конструкция, синий = известное, красный = искомое / ответ; смена листа: отклейка (peel)
// или «проход сквозь знак» (push through); камера ездит над бумагой. Нижние 250 px кадра всегда пустые (субтитры).
// window.render(t) — секунды всего фильма; ?t0=&t1= — кусок.
import { clamp, lerp, mulberry, TAU } from '/core/lib.js';
import { W, H, Ink, Stroke, line, poly, curve, arc, circle, arrow, dashed, makePaper, composeOn, paperCanvas, reseed, setBoil, setGlyphs } from './pen.js';

const Q = new URLSearchParams(location.search);
const FILM = 85.3;
const T0 = +(Q.get('t0') || 0), T1 = +(Q.get('t1') || FILM);
const DRAW_FPS = 15;                    // рисунки «на двойках»: 15 рисунков в секунду при 30 к/с
const cv = document.getElementById('c'), X = cv.getContext('2d');
const K = 'black', RD = 'red', BL = 'blue';
const ink = new Ink();
const eio = t => (t = clamp(t), t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = t => 1 - Math.pow(1 - clamp(t), 3), ei = t => Math.pow(clamp(t), 2.6);
const FONT = 'Caveat';

// ───────── листы
const SHEETS = [];
let CUR = null, B = 0, NI = 0;
const lenOf = it => it.T ? it.T.L : it.len;
function E(t0, t1, kind, items) {
  items = [items].flat(4);
  if (B === 0) {
    const xs = items.map(it => it.T ? it.T.x + (it.T.w / 2) * (it.T.align === 'right' ? -1 : it.T.align === 'center' ? 0 : 1) : (it.start[0] + it.end[0]) / 2);
    CUR.EL.push({ t0, t1, kind, color: items[0].T ? items[0].T.color : items[0].color, x: xs.reduce((a, b) => a + b, 0) / xs.length });
  }
  CUR.BUILD[B][NI++] = items;
}
const T = (s, x, y, o = {}) => {
  const L = ink.layout(s, x, y, { font: FONT, ...o });
  L.align = o.align; return { T: L };
};
// строка из кусков разного цвета, слева направо: [[текст, цвет], ...]
function TL(parts, x, y, o = {}) {
  const out = []; let cx = x;
  for (const [s, col] of parts) { const t = T(s, cx, y, { ...o, color: col }); out.push(t); cx += t.T.w; }
  out.right = cx; return out;
}
const sheet = def => SHEETS.push({ EL: [], BUILD: [[], [], []], ...def });
function pageNo(n, t) {
  E(t, t + .2, 'line', circle(1806, 104, 34, { w: 5, a0: -2.6, lap: .3 }));
  E(t + .21, t + .3, 'write', T(String(n), 1806, 124, { size: 60, align: 'center', jit: .3 }));
}
// небрежное зачёркивание поверх слова (чёрный маркер туда-сюда)
function scribble(x0, x1, y, h = 40, n = 11) {
  const zz = [];
  for (let i = 0; i <= n; i++) zz.push([x0 + (x1 - x0) * (i / n) + (i % 2 ? 7 : -7), y - h / 2 + (i % 2) * h + Math.sin(i * 1.7) * 3]);
  return curve(zz, { w: 6.5, jitter: .3, pool: .6, smooth: 1 });
}
// штриховка потолка: линия и короткие косые штрихи над ней
function ceiling(x0, x1, y, t0, t1) {
  const hs = [];
  for (let x = x0 + 20; x < x1 - 10; x += 34) hs.push(line(x, y - 4, x + 26, y - 38, { w: 4, jitter: .2, pool: .4 }));
  E(t0, t0 + (t1 - t0) * .45, 'line', line(x0, y, x1, y, { w: 9, over: 0 }));
  E(t0 + (t1 - t0) * .45, t1, 'hatch', hs);
}
function stick(cx, top, s = 1, o = {}) {      // маленький человечек: голова, тело, руки, ноги
  const w = o.w ?? 5;
  return [circle(cx, top + 11 * s, 11 * s, { w, a0: 2.4, lap: .25 }), line(cx, top + 22 * s, cx, top + 58 * s, { w }),
    line(cx - 16 * s, top + 36 * s, cx + 16 * s, top + 34 * s, { w }), line(cx, top + 58 * s, cx - 13 * s, top + 84 * s, { w }), line(cx, top + 58 * s, cx + 13 * s, top + 84 * s, { w })];
}

// ═════════ лист ①  1.0–9.35: «Самое тяжёлое в небоскрёбе — не бетон и не люди. Это верёвка.»
sheet({
  id: 1, a: 0, seed: 8,
  build() {
    reseed(101);
    E(1.05, 2.25, 'write', T('Что тяжелее всего?', 110, 160, { size: 116 }));
    // башня уступами (каждая сторона одним движением)
    const Lp = [[960, 800], [968, 680], [990, 680], [998, 560], [1018, 560], [1028, 450], [1044, 450], [1052, 360], [1058, 360], [1060, 320]];
    E(2.25, 2.80, 'line', [poly(Lp, { w: 8, jitter: .5 }), poly(Lp.map(([x, y]) => [2120 - x, y]), { w: 8, jitter: .5 }), line(880, 800, 1240, 800, { w: 8, over: 0 })]);
    // «не бетон и не люди»: написать и зачеркнуть
    const tb = T('бетон', 1250, 660, { size: 70 });
    E(2.82, 3.10, 'write', tb);
    E(3.10, 3.24, 'line', scribble(1240, 1250 + tb.T.w + 6, 640));
    const tl = T('люди', 1370, 770, { size: 70 });
    E(3.26, 3.85, 'write', [stick(1300, 690, .95), tl]);
    E(3.88, 4.08, 'line', scribble(1360, 1370 + tl.T.w + 6, 750));
    // «Это верёвка, на которой висит лифт»: шахта, кабина, трос — красным (это и есть ответ листа)
    E(4.20, 4.85, 'line', [line(1047, 470, 1047, 794, { w: 5, bow: .002 }), line(1073, 470, 1073, 794, { w: 5, bow: .002 }), circle(1060, 468, 9, { w: 5 })]);
    E(4.90, 5.15, 'line', [line(1050, 640, 1070, 640, { w: 5, over: 3 }), line(1070, 640, 1070, 672, { w: 5, over: 3 }), line(1070, 672, 1050, 672, { w: 5, over: 3 }), line(1050, 672, 1050, 640, { w: 5, over: 3 })]);
    E(5.20, 5.85, 'line', line(1060, 478, 1060, 639, { color: RD, w: 5, bow: .002, over: 0 }));
    const tv = T('верёвка!', 1250, 530, { size: 76, color: RD });
    E(5.90, 6.80, 'line', [...arrow(1238, 505, 1084, 540, { color: RD, w: 6, head: 22, via: [1160, 500] }), tv]);
    pageNo(1, 6.82);
    // «И чем выше башня, тем она тяжелее»: башня растёт (синий пунктир — то, что дано), трос толстеет
    const tall = [[962, 790], [985, 600], [1020, 420], [1046, 270], [1058, 190]];
    E(6.90, 8.00, 'dash', [...dashed(tall, { color: BL, w: 5.5, dash: 22, gap: 14, smooth: 2 }), ...dashed(tall.map(([x, y]) => [2120 - x, y]), { color: BL, w: 5.5, dash: 22, gap: 14, smooth: 2 })]);
    E(8.05, 8.40, 'line', line(1063, 478, 1063, 639, { color: RD, w: 5, bow: .002, over: 0 }));
    E(8.45, 9.25, 'write', TL([['выше', BL], [' = ', K], ['тяжелее', RD]], 1250, 360, { size: 72 }));
  },
  cam() {
    return [
      [0.00, 960, 540, 1.0], [4.10, 960, 540, 1.0],
      [4.90, 1150, 600, 1.3, 0, 'eio'],             // ближе к шахте: заголовок и номер целиком за кадром
      [6.70, 1150, 600, 1.3], [7.30, 960, 540, 1.0, 0, 'eio'],   // назад: башня растёт до самого верха листа
    ];
  },
});

// ═════════ лист ②  9.95–21.0: Тимур в кабине (ближе), потом весы: трос против всего остального, красный «?»
sheet({
  id: 2, a: 9.95, seed: 15,
  build() {
    reseed(202);
    const cx = 480;
    E(9.98, 10.40, 'line', [line(cx - 52, 300, cx - 52, 786, { w: 7, bow: .002 }), line(cx + 52, 300, cx + 52, 786, { w: 7, bow: .002 }), line(cx - 110, 290, cx + 110, 290, { w: 9, over: 0 }), circle(cx, 316, 15, { w: 6 })]);
    E(10.40, 10.62, 'line', [line(cx - 40, 470, cx + 40, 470, { w: 7, over: 5 }), line(cx + 40, 470, cx + 40, 590, { w: 7, over: 5 }), line(cx + 40, 590, cx - 40, 590, { w: 7, over: 5 }), line(cx - 40, 590, cx - 40, 470, { w: 7, over: 5 })]);
    E(10.62, 10.95, 'line', line(cx, 332, cx, 469, { color: RD, w: 7, bow: .002, over: 0 }));
    E(10.95, 11.30, 'line', stick(cx, 492, 1.1, { w: 6 }));
    E(11.30, 11.80, 'write', [...arrow(cx + 160, 528, cx + 30, 530, { w: 5, head: 16 }), T('Тимур', cx + 172, 546, { size: 62 })]);
    E(11.85, 12.25, 'line', arrow(cx - 92, 640, cx - 92, 430, { w: 6, head: 20 }));
    // «едет вверх уже третью минуту»: часы и синее «3 мин» (дано)
    const ck = [cx + 200, 640];
    E(12.40, 13.30, 'line', [circle(...ck, 34, { w: 6 }), line(ck[0], ck[1], ck[0], ck[1] - 24, { w: 5, over: 0 }), line(ck[0], ck[1], ck[0] + 20, ck[1] + 8, { w: 5, over: 0 })]);
    E(13.35, 14.20, 'write', T('3 мин', ck[0] + 56, ck[1] + 20, { size: 64, color: BL }));
    // «однажды верёвка станет тяжелее всего остального. Что тогда?»
    E(14.75, 15.65, 'write', T('Что перевесит?', 110, 160, { size: 110 }));
    pageNo(2, 15.68);
    const px = 1330, L0 = [1050, 470], R0 = [1610, 380];
    E(15.95, 16.45, 'line', [line(px, 400, px, 760, { w: 8 }), line(px - 130, 762, px + 130, 762, { w: 8, over: 0 }), line(...L0, ...R0, { w: 8, over: 0 }), circle(px, 425, 8, { w: 5 })]);
    const pan = (c, w = 80) => [line(c[0], c[1], c[0] - w * .8, c[1] + 130, { w: 4.5, over: 0 }), line(c[0], c[1], c[0] + w * .8, c[1] + 130, { w: 4.5, over: 0 }), arc(c[0], c[1] + 130, w, 0, Math.PI, { w: 7, ry: 32 })];
    E(16.45, 16.90, 'line', [...pan(L0), ...pan(R0)]);
    const coil = []; for (let i = 0; i < 4; i++) coil.push(arc(L0[0], L0[1] + 124 - i * 14, 56 - i * 9, Math.PI, 3 * Math.PI, { color: RD, w: 6, ry: 15 }));
    E(16.95, 17.40, 'line', coil);
    const cab = [[R0[0] - 52, R0[1] + 76], [R0[0] - 12, R0[1] + 76], [R0[0] - 12, R0[1] + 126], [R0[0] - 52, R0[1] + 126], [R0[0] - 52, R0[1] + 76]];
    E(17.42, 17.75, 'line', [poly(cab, { w: 5, jitter: .3 }), ...stick(R0[0] + 30, R0[1] + 42, .95, { w: 5 })]);   // кабина и люди
    E(17.80, 18.40, 'write', T('верёвка', L0[0], L0[1] + 250, { size: 66, color: RD, align: 'center' }));
    E(18.45, 19.35, 'write', T('всё остальное', R0[0], R0[1] + 250, { size: 62, align: 'center' }));
    E(19.45, 20.10, 'write', T('?', px - 4, 360, { size: 230, color: RD, align: 'center', jit: 0 }));
  },
  cam() {
    return [
      [9.95, 700, 610, 1.45], [12.30, 720, 610, 1.45], [12.80, 820, 610, 1.4, 0, 'eio'],   // близко: шахта, кабина, Тимур, часы
      [14.20, 820, 610, 1.4], [14.75, 960, 540, 1.0, 0, 'eio'],                               // назад: весь лист
    ];
  },
});

// ═════════ лист ③  21.8–39.45 (до 30.9 под картой — лист пустой): «что не даёт строить выше» — два пункта
const G3 = {};
sheet({
  id: 3, a: 21.8, seed: 22,
  build() {
    reseed(303);
    E(30.95, 32.55, 'write', T('Что мешает строить выше?', 110, 165, { size: 104 }));
    pageNo(3, 32.58);
    const r = 40, c1 = [300, 430], c2 = [1060, 430];
    Object.assign(G3, { r, mark: c1 });
    E(32.90, 33.12, 'line', circle(...c1, r, { w: 5, a0: -2.4, lap: .3, jitter: .4, seed: 9001 }));
    E(33.12, 33.25, 'write', T('1', c1[0], c1[1] + 20, { size: 60, align: 'center', jit: 0, seed: 71 }));
    E(33.30, 34.90, 'write', [T('где рвётся', 480, 420, { size: 74 }), T('сталь', 480, 500, { size: 74 })]);
    E(35.35, 36.00, 'write', T('через 2 минуты', 482, 576, { size: 54, color: BL }));
    E(36.20, 36.42, 'line', circle(...c2, r, { w: 5, a0: -2.4, lap: .3, jitter: .4 }));
    E(36.42, 36.55, 'write', T('2', c2[0], c2[1] + 20, { size: 60, align: 'center', jit: 0, seed: 72 }));
    const ga = T('главный', 1170, 420, { size: 74 });
    E(36.60, 37.30, 'write', [ga, T('ответ', 1170, 500, { size: 74 })]);
    E(37.30, 37.80, 'write', T('в самом конце', 1172, 576, { size: 54, color: BL }));
    E(37.82, 38.20, 'write', T('?', 1170 + ga.T.w + 70, 500, { size: 200, color: RD, align: 'center', jit: 0 }));
  },
  cam() {
    const z = 230 / G3.r;                         // кружок с «1» заполняет середину кадра
    return [[21.8, 960, 540, 1.0], [38.35, 960, 540, 1.0], [39.45, G3.mark[0], G3.mark[1], z, 0, 'ei']];
  },
});

// ═════════ лист ④  39.45–52.6: прошли сквозь кружок «1» — «Проверка 1: сколько весит трос»
const G4 = {};
sheet({
  id: 4, a: 39.45, seed: 31,
  build() {
    reseed(404);
    const r = 60, c = [330, 205];
    Object.assign(G4, { r, mark: c });
    // кружок с «1» уже на листе, когда мы в него входим (толщина: 5 × z③ = w × z④)
    const k = r / G3.r;
    E(39.0, 39.01, 'line', circle(...c, r, { w: 5 * k, a0: -2.4, lap: .3, jitter: .4, seed: 9001 }));
    E(39.0, 39.01, 'write', T('1', c[0], c[1] + 20 * k, { size: 60 * k, align: 'center', jit: 0, seed: 71 }));
    E(39.55, 41.00, 'write', T('Сколько весит трос?', 430, 240, { size: 108 }));
    pageNo(4, 41.0);
    const sx = 330;
    E(41.05, 41.90, 'line', [line(sx - 120, 340, sx + 120, 340, { w: 9, over: 0 }), line(sx - 42, 342, sx - 42, 790, { w: 6, bow: .002 }), line(sx + 42, 342, sx + 42, 790, { w: 6, bow: .002 })]);
    E(41.95, 42.30, 'line', [line(sx - 32, 560, sx + 32, 560, { w: 7, over: 4 }), line(sx + 32, 560, sx + 32, 650, { w: 7, over: 4 }), line(sx + 32, 650, sx - 32, 650, { w: 7, over: 4 }), line(sx - 32, 650, sx - 32, 560, { w: 7, over: 4 })]);
    E(42.35, 42.80, 'line', line(sx, 344, sx, 559, { w: 6, bow: .002, over: 0 }));
    E(42.85, 43.80, 'write', [...arrow(sx + 112, 590, sx + 50, 600, { color: BL, w: 5, head: 15 }), T('половина', sx + 122, 590, { size: 56, color: BL }), T('пути', sx + 122, 650, { size: 56, color: BL })]);
    const ex = 760;
    const w1 = TL([['вес троса', RD], [' =', K]], ex, 420, { size: 80 });
    E(43.85, 45.00, 'write', w1);
    E(45.00, 46.50, 'write', TL([['длина', BL], [' × ', K], ['вес 1 метра', BL]], ex, 520, { size: 80 }));
    const d1 = T('длиннее', ex, 625, { size: 72 });
    const ax = ex + d1.T.w + 24;
    const d2 = T('тяжелее', ax + 110, 625, { size: 72 });
    E(46.55, 48.10, 'write', [d1, ...arrow(ax, 602, ax + 86, 602, { w: 5, head: 16 }), d2]);
    // «на пальцах»: ладонь
    const hx = 1520, hy = 760;
    E(48.15, 49.40, 'line', [arc(hx, hy - 20, 88, Math.PI * .05, Math.PI * .95, { w: 7 }),
      ...[[-84, -40, -118, -150], [-44, -66, -56, -214], [0, -72, 8, -232], [44, -66, 68, -210], [84, -30, 136, -108]].map(([a, b, c2, d]) => line(hx + a, hy + b, hx + c2, hy + d, { w: 7 }))]);
    E(49.40, 50.50, 'write', T('на пальцах', 1670, 650, { size: 62, color: BL }));
    // последний штрих листа — красный кружок вокруг искомого
    const ww = w1[0].T.w;
    E(50.70, 51.30, 'line', circle(ex + ww / 2, 398, ww / 2 + 34, { color: RD, w: 6.5, ry: 62, a0: -2.7, lap: .3 }));
  },
  cam() {
    const z3 = 230 / G3.r, z4 = z3 * G3.r / G4.r;
    return [[39.45, G4.mark[0], G4.mark[1], z4], [40.40, 960, 540, 1.0, 0, 'eo'], [52.6, 960, 540, 1.0]];
  },
});

// ═════════ лист ⑤  52.6–64.6 (под машинкой «ТРОС» до 54.15): «Сколько держит сталь?»
sheet({
  id: 5, a: 52.6, seed: 44,
  build() {
    reseed(505);
    ceiling(200, 680, 270, 54.25, 54.60);
    E(54.62, 55.20, 'line', curve([[440, 272], [443, 450], [438, 620], [440, 790]], { w: 9 }));
    E(55.22, 55.75, 'write', T('стальной канат', 470, 760, { size: 56 }));
    E(55.80, 57.20, 'write', T('Сколько держит сталь?', 110, 165, { size: 104 }));
    pageNo(5, 57.22);
    E(57.30, 57.80, 'write', T('прочность', 620, 420, { size: 62 }));
    const g = T('1–2 ГПа', 620, 520, { size: 104, color: BL });
    E(57.85, 59.00, 'write', g);
    E(59.35, 60.30, 'write', TL([['1 ГПа', BL], [' это:', K]], 1160, 330, { size: 66 }));
    const qx = 1200, qy = 390;
    E(60.40, 61.15, 'line', [line(qx, qy, qx + 100, qy, { color: BL, w: 6, over: 4 }), line(qx + 100, qy, qx + 100, qy + 100, { color: BL, w: 6, over: 4 }), line(qx + 100, qy + 100, qx, qy + 100, { color: BL, w: 6, over: 4 }), line(qx, qy + 100, qx, qy, { color: BL, w: 6, over: 4 })]);
    E(61.15, 61.70, 'write', T('1 мм²', qx + 122, qy + 70, { size: 62, color: BL }));
    E(61.75, 62.35, 'line', [line(qx + 50, qy + 100, qx + 50, qy + 190, { w: 6, over: 0 }), poly([[qx - 10, qy + 300], [qx + 18, qy + 190], [qx + 82, qy + 190], [qx + 110, qy + 300], [qx - 10, qy + 300]], { w: 7 })]);
    // ответ листа рукой, на такт «около ста килограммов»
    const kg = T('≈ 100 кг', qx + 140, qy + 290, { size: 96, color: RD });
    E(62.40, 63.35, 'write', kg);
    E(63.38, 63.62, 'line', line(qx + 140, qy + 312, qx + 140 + kg.T.w, qy + 308, { color: RD, w: 6, over: 0 }));
  },
  cam() {
    return [[52.6, 960, 540, 1.0], [59.20, 960, 540, 1.0], [60.20, 1152, 612, 1.25, 0, 'eio'], [64.6, 1152, 612, 1.25]];
  },
});

// ═════════ лист ⑥  65.2–85.3: канат на весу; вопрос (машинкой 69.6–73.3) → «рвётся здесь», у самого верха
sheet({
  id: 6, a: 65.2, seed: 57,
  build() {
    reseed(606);
    const rx = 1000;
    ceiling(700, 1300, 260, 65.22, 65.55);
    E(65.58, 66.40, 'line', curve([[rx, 262], [rx + 2, 470], [rx - 2, 640], [rx, 790]], { w: 9 }));
    E(66.45, 68.30, 'line', [0, 1, 2, 3, 4].map(i => arrow(rx + 44, 700 - i * 105, rx + 44, 762 - i * 105, { color: BL, w: 5, head: 16 })));
    E(66.60, 67.55, 'write', T('нижние метры', rx + 90, 520, { size: 60, color: BL }));
    E(67.60, 68.60, 'write', T('тянут верхние', rx + 90, 590, { size: 60, color: BL }));
    E(73.35, 74.15, 'write', T('Где он порвётся?', 110, 165, { size: 104 }));
    pageNo(6, 74.17);
    E(74.50, 75.90, 'write', [...arrow(rx - 40, 712, rx - 40, 770, { w: 5, head: 15 }), T('держит чуть-чуть', rx - 66, 770, { size: 56, align: 'right' })]);
    E(76.40, 77.60, 'line', poly([[rx - 34, 276], [rx - 54, 290], [rx - 54, 676], [rx - 34, 690]], { w: 5.5, jitter: .3 }));
    E(77.70, 79.60, 'write', [T('верх несёт', rx - 80, 380, { size: 62, align: 'right' }), T('всю длину', rx - 80, 450, { size: 62, align: 'right' })]);
    E(81.60, 82.10, 'line', poly([[rx - 30, 300], [rx - 12, 314], [rx + 2, 296], [rx + 18, 316], [rx + 34, 300]], { color: RD, w: 6.5, jitter: .2 }));
    E(82.50, 83.30, 'line', circle(rx + 2, 306, 64, { color: RD, w: 6.5, a0: -2.6, lap: .3 }));
    E(83.35, 84.60, 'write', T('рвётся здесь', rx + 90, 330, { size: 70, color: RD }));
  },
  cam() {
    return [[65.2, 960, 540, 1.0], [78.0, 960, 540, 1.0], [80.20, 1000, 594, 1.3, 0, 'eio'], [FILM, 1000, 594, 1.3]];
  },
});

// ───────── камера: [t, cx, cy, zoom, rot, ease]; зум в логарифме
function camAt(S, t) {
  const k = S.keys;
  if (t <= k[0][0]) return k[0];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const a = k[i - 1], b = k[i], ef = { eio, eo, ei }[b[5] || 'eio'], u = ef((t - a[0]) / (b[0] - a[0]));
    return [t, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)];
  }
  return k[k.length - 1];
}
function matrix([, cx, cy, z, r = 0]) {
  if (z >= 1 && !r) { const hw = W / 2 / z, hh = H / 2 / z; cx = clamp(cx, hw, W - hw); cy = clamp(cy, hh, H - hh); }
  const a = z * Math.cos(r), b = z * Math.sin(r), c = -b, d = a;
  return [a, b, c, d, W / 2 - (a * cx + c * cy), H / 2 - (b * cx + d * cy)];
}

// ───────── один лист в один момент
const LIFT = 22;
const pcv = document.createElement('canvas'); pcv.width = W; pcv.height = H;
const px = pcv.getContext('2d', { willReadFrequently: true });
function drawSheet(S, t, out) {
  const f = Math.floor(t * DRAW_FPS + 1e-6), tq = f / DRAW_FPS, boil = f % 3;
  const M = matrix(camAt(S, t));
  ink.clear(); ink.setCamera(M);
  S.EL.forEach((e, i) => {
    const p = clamp((tq - e.t0) / (e.t1 - e.t0));
    if (p <= 0) return;
    const items = S.BUILD[boil][i], lens = items.map(lenOf), tot = lens.reduce((a, b) => a + b, 0) + LIFT * (items.length - 1);
    let left = p >= 1 ? Infinity : p * tot;
    for (let k = 0; k < items.length && left > 0; k++) {
      const it = items[k];
      if (it.T) ink.write(it.T, left); else ink.stroke(it, left);
      left -= lens[k] + LIFT;
    }
  });
  px.setTransform(1, 0, 0, 1, 0, 0); px.fillStyle = '#f8f7f3'; px.fillRect(0, 0, W, H);
  px.setTransform(...M); px.imageSmoothingQuality = 'high'; px.drawImage(S.paperC, 0, 0); px.setTransform(1, 0, 0, 1, 0, 0);
  composeOn(px.getImageData(0, 0, W, H).data, ink, out);
  return out;
}

// ───────── отклейка: уголок поднимается, линия сгиба идёт снизу-справа вверх-влево, лист уходит
const imA = X.createImageData(W, H), imB = X.createImageData(W, H);
const cA = document.createElement('canvas'); cA.width = W; cA.height = H;
const cB = document.createElement('canvas'); cB.width = W; cB.height = H;
const nrm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const P = (o, u, s) => [o[0] + u[0] * s, o[1] + u[1] * s];
const PEELS = [{ a: 9.35, b: 9.95, A: 0, B: 1 }, { a: 21.0, b: 21.8, A: 1, B: 2 }, { a: 64.6, b: 65.2, A: 4, B: 5 }];
function peelFrame(t, PL) {
  const SA = SHEETS[PL.A], SB = SHEETS[PL.B];
  const u = eio((t - PL.a) / (PL.b - PL.a));
  drawSheet(SA, Math.min(t, PL.a), imA); cA.getContext('2d').putImageData(imA, 0, 0);
  drawSheet(SB, t, imB); cB.getContext('2d').putImageData(imB, 0, 0);
  const n = nrm([-W, -H]), BR = [W, H], diag = Math.hypot(W, H), s = lerp(-20, diag + 260, u);
  const F = P(BR, n, s), tv = [-n[1], n[0]];
  const half = sign => { X.beginPath(); const L = 4000; const a = P(F, tv, -L), b = P(F, tv, L); X.moveTo(...a); X.lineTo(...b); X.lineTo(...P(b, n, sign * L)); X.lineTo(...P(a, n, sign * L)); X.closePath(); };
  X.drawImage(cB, 0, 0);
  X.save(); half(-1); X.clip();
  const g = X.createLinearGradient(...F, ...P(F, n, -46)); g.addColorStop(0, 'rgba(70,63,51,.14)'); g.addColorStop(1, 'rgba(70,63,51,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
  X.save(); half(1); X.clip(); X.drawImage(cA, 0, 0); X.restore();
  const refl = p => { const d = (p[0] - F[0]) * n[0] + (p[1] - F[1]) * n[1]; return P(p, n, -2 * d * .86); };
  const corners = [[0, 0], [W, 0], [W, H], [0, H]], poly2 = [];
  for (let i = 0; i < 4; i++) {
    const p = corners[i], q = corners[(i + 1) % 4], dp = (p[0] - F[0]) * n[0] + (p[1] - F[1]) * n[1], dq = (q[0] - F[0]) * n[0] + (q[1] - F[1]) * n[1];
    if (dp < 0) poly2.push(p);
    if ((dp < 0) !== (dq < 0)) { const r = dp / (dp - dq); poly2.push([lerp(p[0], q[0], r), lerp(p[1], q[1], r)]); }
  }
  if (poly2.length > 2) {
    const fl = poly2.map(refl);
    X.save(); X.beginPath(); fl.forEach((p, i) => i ? X.lineTo(...p) : X.moveTo(...p)); X.closePath();
    X.save(); X.shadowColor = 'rgba(60,52,40,.16)'; X.shadowBlur = 18; X.shadowOffsetX = -4; X.shadowOffsetY = -3;
    const g2 = X.createLinearGradient(...F, ...P(F, n, 520)); g2.addColorStop(0, '#e2e0d9'); g2.addColorStop(.35, '#efede8'); g2.addColorStop(1, '#f7f6f2');
    X.fillStyle = g2; X.fill(); X.restore();
    X.strokeStyle = 'rgba(150,142,128,.35)'; X.lineWidth = 1; X.stroke(); X.restore();
  }
}

// ───────── печатная машинка на чёрном (экранный слой, как в старом фильме): буква за буквой, блочный курсор
const CARDS = [
  { str: 'ХОЛОДНЫЙ СТАРТ', t0: 0.05, t1: 0.75, t2: 0.98 },
  { str: 'ТРОС', t0: 52.6, t1: 53.4, t2: 54.15 },
  { str: 'Почему канат рвётся под собственным весом?', t0: 69.6, t1: 72.9, t2: 73.3 },
];
const cardAt = t => CARDS.find(cd => t >= cd.t0 - .1 && t <= cd.t2 + .1);
function drawCard(cd, t) {
  const a = clamp((t - cd.t0 + .1) / .1) * (1 - clamp((t - cd.t2) / .1));
  X.save(); X.globalAlpha = a; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  const size = cd.str.length > 20 ? 66 : 92; X.font = `400 ${size}px PM`; X.fillStyle = '#f2f0ea'; X.textBaseline = 'alphabetic';
  const words = cd.str.split(' '), rows = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (X.measureText(tr).width > 1500 && cur) { rows.push(cur); cur = w; } else cur = tr; }
  rows.push(cur);
  const n = cd.str.replace(/\s/g, '').length, u = clamp((t - cd.t0) / (cd.t1 - cd.t0)); let shown = Math.floor(u * n + 1e-6) + (u >= 1 ? 1 : 0);
  const lh = size * 1.35, y0 = 540 - (rows.length - 1) * lh / 2; let cx = 0, cy = 0;
  rows.forEach((ln, i) => {
    const x0 = 960 - X.measureText(ln).width / 2; let s = '';
    for (const ch of ln) { if (ch !== ' ') { if (shown <= 0) break; shown--; } s += ch; }
    X.fillText(s, x0, y0 + i * lh); if (s || i === 0) { cx = x0 + X.measureText(s).width; cy = y0 + i * lh; }
  });
  if (u < 1 || Math.floor(t * 2.4) % 2 === 0) { X.fillStyle = '#E23B2E'; X.fillRect(cx + 10, cy - size * .78, size * .5, size * .92); }
  X.restore();
}

const IM = X.createImageData(W, H);
const sheetAt = t => { let S = SHEETS[0]; for (const s of SHEETS) if (t >= s.a) S = s; return S; };
function renderFilm(t) {
  const cd = cardAt(t);
  if (cd && t >= cd.t0 && t <= cd.t2) { X.fillStyle = '#000'; X.fillRect(0, 0, W, H); drawCard(cd, t); return; }   // карта целиком закрывает кадр
  const PL = PEELS.find(p => t >= p.a && t < p.b);
  if (PL) peelFrame(t, PL);
  else { drawSheet(sheetAt(t), t, IM); X.putImageData(IM, 0, 0); }
  if (cd) drawCard(cd, t);
}

async function boot() {
  const fonts = [
    new FontFace(FONT, 'url(fonts/Caveat-700.ttf)', { weight: '700' }),
    new FontFace(FONT, 'url(fonts/Caveat-400.ttf)', { weight: '400' }),
    new FontFace('PM', 'url(fonts/ibm-plex-mono-latin-400-normal.woff2)', { weight: '400', unicodeRange: 'U+0000-00FF,U+2000-206F' }),
    new FontFace('PM', 'url(fonts/ibm-plex-mono-cyrillic-400-normal.woff2)', { weight: '400', unicodeRange: 'U+0400-045F' }),
  ];
  for (const f of fonts) { await f.load(); document.fonts.add(f); }
  await document.fonts.load('400 40px PM', 'АбЁё12');
  setGlyphs(await (await fetch('glyphs.json')).json());
  for (const S of SHEETS) {
    CUR = S;
    for (B = 0; B < 3; B++) { NI = 0; setBoil(B); S.build(); }
    setBoil(0);
    S.keys = S.cam();
    S.paperC = paperCanvas(makePaper(S.seed));
  }
  window.DUR = T1 - T0;
  window.render = t => renderFilm(t + T0);
  // события для шумов (assemble_bh_trial.py): маркер (stroke/write/dash), машинка (key), отклейка и проход (erase)
  const ev = [];
  for (const S of SHEETS) S.EL.forEach((e, i) => {
    const items = S.BUILD[0][i], lens = items.map(lenOf), tot = lens.reduce((a, b) => a + b, 0) + LIFT * (items.length - 1);
    let acc = 0;
    items.forEach((it, k) => {
      const a = e.t0 + (e.t1 - e.t0) * acc / tot, b = e.t0 + (e.t1 - e.t0) * (acc + lens[k]) / tot;
      const segs = it.T ? it.T.gl.map(g => ({ t: a + (b - a) * g.L0 / it.T.L, d: (b - a) * g.len / it.T.L * .9 })) : [{ t: a, d: b - a }];
      const type = it.T ? 'write' : e.kind === 'dash' ? 'dash' : 'stroke';
      if (e.t1 - e.t0 > .02) for (const g of segs) ev.push({ t: +g.t.toFixed(4), dur: +g.d.toFixed(4), type, col: e.color, pan: +clamp(e.x / W * 2 - 1, -1, 1).toFixed(3), sheet: S.id });
      acc += lens[k] + LIFT;
    });
  });
  for (const p of PEELS) ev.push({ t: p.a, dur: p.b - p.a, type: 'erase', name: 'peel' });
  ev.push({ t: 38.35, dur: 1.1, type: 'erase', name: 'push' });
  for (const cd of CARDS) { const n = cd.str.replace(/\s/g, '').length; for (let i = 0; i < n; i++) ev.push({ t: +(cd.t0 + (cd.t1 - cd.t0) * i / Math.max(1, n - 1)).toFixed(4), dur: .04, type: 'key' }); }
  // карта закрывает 20.6–30.9 и машинка — 3 карточки: штрихи под ними не звучат
  const hidden = t => CARDS.some(cd => t >= cd.t0 - .1 && t <= cd.t2 + .1);
  window.EV = ev.filter(e => !(e.type !== 'key' && hidden(e.t))).map(e => ({ ...e, t: +(e.t - T0).toFixed(4) })).filter(e => e.t > -1e-6 && e.t < window.DUR).sort((a, b) => a.t - b.t);
  // проверка чтения (core/render/readcheck.mjs): каждая надпись на листе, её рамка на экране через камеру
  window.TEXTS = t => {
    t += T0;
    if (cardAt(t)) return [];
    const PL = PEELS.find(p => t >= p.a && t < p.b), S = PL ? SHEETS[PL.A] : sheetAt(t), tt = PL ? PL.a : t;
    const M = matrix(camAt(S, tt)), out = [];
    S.EL.forEach((e, i) => {
      if (e.kind !== 'write' || tt < e.t0) return;
      const its = S.BUILD[0][i].filter(it => it.T); if (!its.length) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const { T: L } of its) {
        const ax = L.align === 'right' ? -L.w : L.align === 'center' ? -L.w / 2 : 0;
        for (const [qx, qy] of [[ax, -L.size * .8], [ax + L.w, -L.size * .8], [ax, L.size * .25], [ax + L.w, L.size * .25]]) {
          const c = Math.cos(L.rotAll), s = Math.sin(L.rotAll), wx = L.x + qx * c - qy * s, wy = L.y + qx * s + qy * c;
          const sx = M[0] * wx + M[2] * wy + M[4], sy = M[1] * wx + M[3] * wy + M[5];
          x0 = Math.min(x0, sx); y0 = Math.min(y0, sy); x1 = Math.max(x1, sx); y1 = Math.max(y1, sy);
        }
      }
      out.push({ id: `s${S.id}-${i}`, text: its.map(it => it.T.str).join(''), x0, y0, x1, y1 });
    });
    return out;
  };
  // нижние 250 px: есть ли чернила (по слоям плотности, через камеру)
  window.LOWINK = t => {
    t += T0; window.render(t - T0);
    if (cardAt(t)) return 0;
    let n = 0;
    for (const c of Object.values(ink.L)) { const d = c.getContext('2d').getImageData(0, 830, W, 250).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; }
    return n;
  };
  window.READY = true;
}
boot();
