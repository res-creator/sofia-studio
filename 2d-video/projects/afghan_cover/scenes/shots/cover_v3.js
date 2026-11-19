// Обложки v3 (YouTube 1280x720) для «Что если бы ты родилась девочкой в Афганистане?».
// Тот же риг героев (pro.js fig) и палитра фильма, но тёмный фон, крупное лицо, 2–4 слова огромным шрифтом.
//   v3a — «ЕМУ МОЖНО. ЕЙ НЕТ.»: брат входит в школу / героиня у двери на цепи
//   v3b — крупный план лица героини + «ТЕБЕ 12. ШКОЛЫ БОЛЬШЕ НЕТ»
//   v3c — героиня у окна, которое закладывают кирпичом + «РОДИЛАСЬ ДЕВОЧКОЙ В АФГАНИСТАНЕ»
// Рендер: PW_CHROMIUM=/opt/pw-browsers/chromium node render.mjs --project projects/afghan_cover --stills 5,7,9
import { E, registerShot } from '/engine/core.js';
import { fig, OL, fo, rr, bx, el, ln, pg, blob, glow, cone, vg, shade, rng, htxt, scrib } from '/projects/afghan/scenes/lib/pro.js';
import { C } from '/projects/afghan/scenes/shots/afghan.js';

const FONT = (s) => `700 ${s}px "OswC", "OswL", "Nunito", sans-serif`;
const W = 1920, H = 1080;

// огромный текст: тень + тонкий тёмный контур + заливка; maxW — ужать по ширине
function T(g, s, x, y, size, col, o = {}) {
  g.save(); g.font = FONT(size); g.textBaseline = 'alphabetic'; g.textAlign = o.align || 'left';
  const w = g.measureText(s).width + (o.skew ? Math.abs(o.skew) * size * 0.75 : 0), k = o.maxW && w > o.maxW ? o.maxW / w : 1;
  g.translate(x, y); g.rotate(o.rot || 0); g.scale(k, 1); if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0);
  g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = size * 0.12; g.shadowOffsetX = size * 0.03; g.shadowOffsetY = size * 0.05;
  g.fillStyle = '#08080c'; g.fillText(s, 0, 0);
  g.shadowColor = 'transparent';
  g.lineWidth = o.lw ?? Math.max(6, size * 0.07); g.strokeStyle = o.ol || '#0b0b12'; g.strokeText(s, 0, 0);
  g.fillStyle = col; g.fillText(s, 0, 0); g.restore();
  return w * k;
}
// плашка-тег (страна)
function TAG(g, s, x, y, size, bg, col = '#ffffff', o = {}) {
  g.save(); g.font = FONT(size); const w = g.measureText(s).width + size * 0.7, h = size * 1.32;
  const x0 = o.align === 'center' ? x - w / 2 : x; g.translate(x0, y); g.rotate(o.rot ?? -0.02);
  g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, 8, 10, w, h, 10); g.fill(); rr(g, 0, 0, w, h, 10); fo(g, bg, 5, '#0b0b12');
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + size * 0.06); g.restore();
}
// большие глаза поверх глаз рига (в тех же координатах фигуры): блик, «мокрая» нижняя кромка
function eyes(g, x, y, s, o, t, opt = {}) {
  const f = (o.turn || 0) * 26, bob = Math.sin(t * 2.1 + (o.seed ?? 1)) * 2, look = (o.look || 0), lookY = (o.lookY || 0);
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, bob);
  [-34, 34].forEach((dx, i) => {
    const cx = dx + f, cy = -448, rx = opt.rx ?? 21, ry = opt.ry ?? 24, side = (o.turn || 0) * (i ? -1 : 1);
    const sx = rx * (1 - Math.max(0, -side) * 0.25);
    g.save(); g.translate(cx, cy);
    g.beginPath(); g.ellipse(0, 0, sx, ry, 0, 0, Math.PI * 2); fo(g, '#fbf8f1', 4);
    g.save(); g.beginPath(); g.ellipse(0, 0, sx, ry, 0, 0, Math.PI * 2); g.clip();
    const ix = look * 7, iy = lookY * 6 + 2;
    el(g, ix, iy, 13.5, 15.5, opt.iris || '#3a2618', 0); el(g, ix, iy, 8, 9.5, '#0d0a08', 0);
    el(g, ix - 4.5, iy - 6, 4.6, 4.6, '#ffffff', 0); el(g, ix + 4.5, iy + 5, 2, 2, 'rgba(255,255,255,.9)', 0);
    if (opt.sad) { g.beginPath(); g.moveTo(-sx - 2, -ry - 2); g.lineTo(sx + 2, -ry - 2); g.lineTo(sx + 2, -ry * 0.35 + (i ? 4 : -4) * 0 ); g.quadraticCurveTo(0, -ry * 0.62, -sx - 2, -ry * 0.35); g.closePath(); g.fillStyle = shade(o.skin, -0.06); g.fill(); g.beginPath(); g.moveTo(-sx, -ry * 0.37); g.quadraticCurveTo(0, -ry * 0.62, sx, -ry * 0.37); g.lineWidth = 3.5; g.strokeStyle = OL; g.stroke(); }
    if (opt.wet) { g.beginPath(); g.ellipse(0, ry * 0.78, sx * 0.85, ry * 0.28, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(170,220,255,.55)'; g.fill(); }
    g.restore();
    g.beginPath(); g.ellipse(0, 0, sx, ry, 0, 0, Math.PI * 2); g.lineWidth = 4; g.strokeStyle = OL; g.stroke();
    g.restore();
  });
  if (opt.tear) { // слеза + мокрая дорожка по щеке под левым (от зрителя) глазом
    const tx = -36 + f, ty = -420;
    g.save(); g.globalAlpha = 0.55; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx - 4, ty + 20, tx - 2, ty + 34); g.lineWidth = 6; g.strokeStyle = '#cdeeff'; g.lineCap = 'round'; g.stroke(); g.restore();
    const dx = tx - 2, dy = ty + 50;
    g.beginPath(); g.moveTo(dx, dy - 20); g.quadraticCurveTo(dx + 13, dy + 2, dx, dy + 12); g.quadraticCurveTo(dx - 13, dy + 2, dx, dy - 20); fo(g, '#bfe6ff', 3);
    el(g, dx - 3, dy + 1, 3, 4.5, '#ffffff', 0);
  }
  g.restore();
}
// широкая улыбка «D» поверх рта рига
function grin(g, x, y, s, o, t) {
  const f = (o.turn || 0) * 26, bob = Math.sin(t * 2.1 + (o.seed ?? 1)) * 2, mx = f * 1.05, my = -388;
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, bob);
  g.beginPath(); g.moveTo(mx - 36, my); g.quadraticCurveTo(mx, my - 6, mx + 36, my); g.quadraticCurveTo(mx + 30, my + 40, mx, my + 40); g.quadraticCurveTo(mx - 30, my + 40, mx - 36, my); g.closePath(); fo(g, '#5a1f1c', 0);
  g.save(); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(mx - 40, my - 8, 80, 15); el(g, mx, my + 38, 20, 12, '#d0585a', 0); g.restore();
  g.beginPath(); g.moveTo(mx - 36, my); g.quadraticCurveTo(mx, my - 6, mx + 36, my); g.quadraticCurveTo(mx + 30, my + 40, mx, my + 40); g.quadraticCurveTo(mx - 30, my + 40, mx - 36, my); g.closePath(); g.lineWidth = 4.5; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
  g.restore();
}
// координаты центра головы фигуры на экране
const headAt = (x, y, s) => [x, y - 440 * s];

// ----------------------------------------------------------------- значки
function check(g, x, y, r) { g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 8; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = '#22b14c'; g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); fo(g, null, 8, '#0b0b12'); g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.52, y - r * 0.36); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = r * 0.26; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = r * 0.17; g.strokeStyle = '#ffffff'; g.stroke(); }
function cross(g, x, y, r) { g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 8; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = '#e2283a'; g.fill(); g.restore(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); fo(g, null, 8, '#0b0b12'); const a = r * 0.4; [[[-a, -a], [a, a]], [[a, -a], [-a, a]]].forEach(([p, q]) => { g.beginPath(); g.moveTo(x + p[0], y + p[1]); g.lineTo(x + q[0], y + q[1]); g.lineCap = 'round'; g.lineWidth = r * 0.26; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = r * 0.17; g.strokeStyle = '#ffffff'; g.stroke(); }); }
// цепь из звеньев от (x0,y0) до (x1,y1)
function chain(g, x0, y0, x1, y1, link = 34, col = '#a8adb6') { const d = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), n = Math.floor(d / (link * 0.78)); for (let i = 0; i <= n; i++) { const k = i / n; g.save(); g.translate(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); g.rotate(a); g.beginPath(); if (i % 2) g.ellipse(0, 0, link * 0.55, link * 0.16, 0, 0, Math.PI * 2); else g.ellipse(0, 0, link * 0.55, link * 0.32, 0, 0, Math.PI * 2); g.lineWidth = 15; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = 8; g.strokeStyle = col; g.stroke(); g.restore(); } }
function padlock(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.arc(0, -40, 42, Math.PI, 0); g.lineWidth = 24; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#b9bec8'; g.stroke(); bx(g, -64, -46, 128, 112, '#e0a92a', 14, 7, 0.25); el(g, 0, 0, 12, 12, '#2a1a08', 0); pg(g, [[-6, 4], [6, 4], [9, 34], [-9, 34]], '#2a1a08', 0); g.restore(); }
// табличка «ШКОЛА»
function sign(g, x, y, w, h, bg, col) { bx(g, x - w / 2, y - h / 2, w, h, bg, 8, 6, 0.1); g.save(); g.font = FONT(h * 0.66); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText('ШКОЛА', x, y + h * 0.04); g.restore(); }
function bricksIn(g, x, y, w, h, bw, bh, col, seed = 1, keep) { const R = rng(seed); g.save(); rr(g, x, y, w, h, 2); g.clip(); for (let r = 0; r * bh < h + bh; r++) for (let c = -1; c * bw < w + bw; c++) { const bxx = x + c * bw + (r % 2) * bw / 2, byy = y + h - (r + 1) * bh; if (keep && !keep(bxx + bw / 2, byy + bh / 2)) continue; bx(g, bxx + 2, byy + 2, bw - 4, bh - 4, shade(col, (R() - 0.5) * 0.18), 3, 3, 0.18); } g.restore(); }

// ================================================================= A: ЕМУ МОЖНО. ЕЙ НЕТ.
function coverA(g, t) {
  // ЛЕВО: тёплое солнце, открытая дверь школы
  g.save(); g.beginPath(); g.rect(0, 0, 960, H); g.clip();
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f08a24'); gr.addColorStop(0.45, '#ffc24a'); gr.addColorStop(1, '#f6a63a'); g.fillStyle = gr; g.fillRect(0, 0, 960, H);
  for (let x = -40; x < 960; x += 120) ln(g, [[x, 260], [x + 10, H]], 3, 'rgba(120,60,10,.12)');
  // дверной проём со светом
  bx(g, 470, 300, 380, 700, '#9a5a2a', 8, 7); rr(g, 500, 330, 320, 670, 4); g.fillStyle = '#fff6d6'; g.fill(); glow(g, 660, 600, 420, '255,250,220', 0.9);
  g.save(); rr(g, 500, 330, 320, 670, 4); g.clip(); bx(g, 540, 400, 240, 150, '#2f5a46', 6, 5); scrib(g, 560, 440, 200, 3, 34, 'rgba(240,240,230,.85)', 4, 4); bx(g, 520, 760, 160, 26, '#b8875a', 4, 4); bx(g, 700, 790, 160, 26, '#b8875a', 4, 4); g.restore();
  rr(g, 500, 330, 320, 670, 4); fo(g, null, 6);
  // распахнутая створка
  pg(g, [[820, 330], [930, 290], [930, 1040], [820, 1000]], vg(g, 290, 750, '#3a8ab0', 0.18), 6); el(g, 905, 660, 9, 9, '#e0b33a', 3);
  sign(g, 660, 270, 300, 74, '#2a6a4a', '#ffffff');
  cone(g, 660, 330, 300, 900, 760, '255,250,210', 0.25);
  // брат с рюкзаком
  const bo = { ...C.brother, expr: 'smile', look: 0, turn: 0.15, pack: '#e2483a', pose: [[-100, -175, 1], [190, -480, 1]], noShadow: true };
  fig(g, 300, 1395, 1.7, bo, 1.0); eyes(g, 300, 1395, 1.7, bo, 1.0); grin(g, 300, 1395, 1.7, bo, 1.0);
  check(g, 790, 520, 92);
  // затемнение сверху под текст
  gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, 'rgba(60,20,0,.55)'); gr.addColorStop(1, 'rgba(60,20,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 960, 300);
  g.restore();

  // ПРАВО: холодная ночь, та же дверь на цепи
  g.save(); g.beginPath(); g.rect(960, 0, 960, H); g.clip();
  gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0b1020'); gr.addColorStop(1, '#1c2742'); g.fillStyle = gr; g.fillRect(960, 0, 960, H);
  for (let x = 960; x < W; x += 120) ln(g, [[x, 260], [x + 10, H]], 3, 'rgba(255,255,255,.04)');
  bx(g, 1030, 300, 380, 700, '#3a2a22', 8, 7); bx(g, 1060, 330, 320, 670, '#2a4a66', 4, 6, 0.2); bx(g, 1085, 360, 270, 270, '#24405a', 4, 4); bx(g, 1085, 660, 270, 310, '#24405a', 4, 4);
  sign(g, 1220, 270, 300, 74, '#2a3a40', '#8a9aa8');
  chain(g, 1040, 560, 1400, 700); chain(g, 1040, 700, 1400, 560); padlock(g, 1220, 650, 1.05);
  glow(g, 1600, 560, 520, '90,130,220', 0.35);
  const ho = { ...C.heroine, expr: 'sad', look: -0.35, lookY: 0.1, turn: -0.12, noShadow: true, pose: [[-100, -175, 1], [100, -175, -1]] };
  fig(g, 1655, 1520, 2.05, ho, 1.0); eyes(g, 1655, 1520, 2.05, ho, 1.0, { sad: true, wet: true, tear: true });
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(175,195,240,.9)'; g.fillRect(960, 0, 960, H); g.restore();
  cross(g, 1220, 470, 92);
  gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(960, 0, 960, 300);
  g.restore();
  // разделитель
  g.fillStyle = '#0b0b12'; g.fillRect(952, 0, 16, H); g.fillStyle = '#ffffff'; g.fillRect(957, 0, 6, H);
  T(g, 'ЕМУ МОЖНО.', 480, 205, 190, '#ffffff', { align: 'center', maxW: 900 });
  T(g, 'ЕЙ НЕТ.', 1440, 205, 190, '#ff3b3b', { align: 'center', maxW: 900 });
  TAG(g, 'АФГАНИСТАН', 960, 960, 62, '#e2283a', '#ffffff', { align: 'center', rot: 0 });
}

// ================================================================= B: крупный план лица
function coverB(g, t) {
  let gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#05070f'); gr.addColorStop(1, '#0f1a33'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // еле видная школьная доска
  g.save(); g.globalAlpha = 0.5; bx(g, -40, 380, 1000, 640, '#3a2a22', 8, 6); rr(g, -16, 404, 952, 592, 4); g.fillStyle = '#16302a'; g.fill(); g.restore();
  g.save(); g.globalAlpha = 0.16; htxt(g, 'А  Б  В  Г', 260, 470, 70, '#ffffff'); htxt(g, '2 + 2 = 4', 640, 560, 64, '#ffffff'); htxt(g, 'мама мыла раму', 360, 960, 60, '#ffffff'); g.restore();
  glow(g, 1410, 540, 700, '80,120,230', 0.5); glow(g, 1410, 460, 420, '255,200,150', 0.18);
  const s = 3.85, x = 1410, y = 560 + 440 * s;
  const o = { ...C.heroine, expr: 'sad', look: 0, lookY: 0, turn: 0, noShadow: true };
  fig(g, x, y, s, o, 1.0); eyes(g, x, y, s, o, 1.0, { sad: true, wet: true, tear: true });
  // холодный контровой свет
  g.save(); g.globalCompositeOperation = 'screen'; gr = g.createLinearGradient(x + 300, 0, x + 560, 0); gr.addColorStop(0, 'rgba(120,170,255,0)'); gr.addColorStop(1, 'rgba(120,170,255,.25)'); g.fillStyle = gr; g.fillRect(x + 300, 0, 400, H); g.restore();
  // тень слева для текста
  gr = g.createLinearGradient(0, 0, 900, 0); gr.addColorStop(0, 'rgba(0,0,0,.65)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 900, H);
  TAG(g, 'АФГАНИСТАН', 70, 66, 70, '#ffd43b', '#111111');
  T(g, 'ТЕБЕ 12.', 64, 470, 300, '#ffffff', { maxW: 820 });
  T(g, 'ШКОЛЫ', 70, 690, 200, '#ff3b3b', { maxW: 800 });
  T(g, 'БОЛЬШЕ НЕТ', 70, 900, 200, '#ff3b3b', { maxW: 800 });
}

// ================================================================= C: окно закладывают кирпичом
function coverC(g, t) {
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0c0b12'); gr.addColorStop(1, '#1d1622'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // стена комнаты
  g.save(); g.globalAlpha = 0.5; for (let x = 0; x < W; x += 140) ln(g, [[x, 380], [x + 8, H]], 3, 'rgba(255,255,255,.05)'); g.restore();
  // окно справа: снизу уже заложено кирпичом, сверху остался просвет с закатом
  const wx = 1000, wy = 400, ww = 780, wh = 640, gy1 = 640;
  bx(g, wx - 34, wy - 34, ww + 68, wh + 68, '#3a2618', 8, 7);
  g.save(); rr(g, wx, wy, ww, wh, 4); g.clip();
  gr = g.createLinearGradient(0, wy, 0, gy1); gr.addColorStop(0, '#ffb04a'); gr.addColorStop(1, '#ffe2a0'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
  g.beginPath(); g.moveTo(wx, gy1); [[0, 560], [90, 500], [200, 545], [330, 470], [470, 535], [600, 485], [780, 550]].forEach(([dx, yy]) => g.lineTo(wx + dx, yy)); g.lineTo(wx + ww, gy1); g.closePath(); fo(g, '#c8704a', 4);
  glow(g, wx + 420, 520, 420, '255,240,190', 0.85);
  bricksIn(g, wx, gy1, ww, wy + wh - gy1, 112, 54, '#8a3e2a', 4);
  // недоложенный ряд
  for (let c = 0; c < 4; c++) bx(g, wx + 2 + c * 112, gy1 - 54 + 2, 108, 50, shade('#8a3e2a', c * 0.03), 3, 3, 0.18);
  g.restore(); rr(g, wx, wy, ww, wh, 4); fo(g, null, 7);
  // крестовина рамы в просвете
  ln(g, [[wx + ww / 2, wy], [wx + ww / 2, gy1 - 54]], 12, '#3a2618');
  // кирпичи на подоконнике
  // луч из щели на героиню
  g.save(); g.globalCompositeOperation = 'screen'; gr = g.createLinearGradient(wx, 0, 300, 0); gr.addColorStop(0, 'rgba(255,200,120,.38)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx, gy1 - 54); g.lineTo(260, 1080); g.lineTo(60, 520); g.closePath(); g.fill(); g.restore();
  const s = 2.6, x = 500, y = 750 + 440 * s;
  const o = { ...C.heroine, scarf: '#5a7ab8', expr: 'sad', look: 1, lookY: -0.2, turn: 0.55, noShadow: true };
  fig(g, x, y, s, o, 1.0); eyes(g, x, y, s, o, 1.0, { sad: true, wet: true, tear: true });
  // тёплый свет на лице со стороны окна
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, x + 260, 760, 380, '255,170,90', 0.3); g.restore();
  gr = g.createLinearGradient(0, 0, 0, 340); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 340);
  T(g, 'РОДИЛАСЬ ДЕВОЧКОЙ', 960, 205, 165, '#ffffff', { align: 'center', maxW: 1820 });
  T(g, 'В АФГАНИСТАНЕ', 960, 355, 140, '#ffd43b', { align: 'center', maxW: 1500 });
}


// ================================================================= v4: стиль «сцена-история» (ночь, один тёплый свет, курсив)
const IT = { skew: -0.2, rot: -0.04 };
function redCircle(g, x, y, rx, ry, rot = -0.12) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); for (let a = 0; a <= Math.PI * 2.25; a += 0.05) { const r = 1 + 0.05 * Math.sin(a * 3); const px = Math.cos(a - 1.2) * rx * r, py = Math.sin(a - 1.2) * ry * r * (1 + (a > Math.PI * 2 ? 0.08 : 0)); a ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = '#0b0b12'; g.stroke(); g.lineWidth = 13; g.strokeStyle = '#ff2a2a'; g.stroke(); g.restore(); }
function particles(g, n, seed, col = '255,255,255', y0 = 0, y1 = H, x0 = 0, x1 = W, rmax = 4, amax = 0.55) { const R = rng(seed); for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = 1 + R() * rmax; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = `rgba(${col},${(0.15 + R() * amax).toFixed(2)})`; g.fill(); } }
// рука у рта: 'shh' — палец к губам, 'cover' — ладонь закрывает рот (в координатах фигуры)
function mouthHand(g, x, y, s, o, t, kind) {
  const f = (o.turn || 0) * 26, bob = Math.sin(t * 2.1 + (o.seed ?? 1)) * 2, mx = f * 1.05, my = -382;
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, bob);
  if (kind === 'shh') { rr(g, mx - 9, my - 42, 18, 70, 9); fo(g, o.skin, 4); g.beginPath(); g.ellipse(mx + 4, my + 46, 30, 26, 0, 0, Math.PI * 2); fo(g, o.skin, 4); ln(g, [[mx - 12, my + 40], [mx + 18, my + 40]], 3, shade(o.skin, -0.35)); ln(g, [[mx - 10, my + 54], [mx + 16, my + 54]], 3, shade(o.skin, -0.35)); }
  else { g.beginPath(); g.ellipse(mx + 34, my + 14, 26, 30, 0, 0, Math.PI * 2); fo(g, o.skin, 4); [-14, 0, 14, 28].forEach((dy, i) => { rr(g, mx - 34 + i * 3, my + dy - 8, 74 - i * 6, 16, 8); fo(g, o.skin, 3.5); }); }
  g.restore();
}
function sky(g, a, b, y1 = H) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function openBook(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); pg(g, [[-170, -10], [0, 10], [170, -10], [170, 30], [0, 50], [-170, 30]], '#6a2a2a', 5); pg(g, [[-160, -70], [0, -40], [0, 34], [-160, 10]], '#fbf4dc', 4); pg(g, [[160, -70], [0, -40], [0, 34], [160, 10]], '#f4ead0', 4); for (let i = 0; i < 4; i++) { ln(g, [[-140, -46 + i * 16], [-22, -24 + i * 16]], 3, 'rgba(60,60,80,.55)'); ln(g, [[22, -24 + i * 16], [140, -46 + i * 16]], 3, 'rgba(60,60,80,.55)'); } g.restore(); }
function oilLamp(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); bx(g, -50, -20, 100, 40, '#8a6a2a', 10, 5); g.beginPath(); g.ellipse(0, -30, 40, 34, 0, 0, Math.PI * 2); fo(g, 'rgba(255,230,170,.55)', 4); g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(14, -36, 0, -22); g.quadraticCurveTo(-14, -36, 0, -60); fo(g, '#ffcc4a', 0); el(g, 0, -34, 5, 9, '#fff6d0', 0); bx(g, -26, -76, 52, 14, '#8a6a2a', 5, 4); g.restore(); }

// D: УЧИСЬ ШЁПОТОМ
function coverD(g, t) {
  sky(g, '#060a18', '#0d1630');
  // заложенное кирпичом окно с ночной улицей
  const wx = 1120, wy = 430, ww = 520, wh = 420, gy = 640;
  bx(g, wx - 26, wy - 26, ww + 52, wh + 52, '#241812', 6, 6);
  g.save(); rr(g, wx, wy, ww, wh, 4); g.clip(); sky(g, '#0a1430', '#1a2a50'); g.fillStyle = '#0c1226'; g.fillRect(wx, 560, ww, 200); for (const [a, b] of [[wx + 60, 590], [wx + 200, 600], [wx + 380, 585]]) { bx(g, a, b, 26, 30, '#ffcf6a', 2, 2); glow(g, a + 13, b + 15, 40, '255,200,100', 0.5); }
  particles(g, 50, 11, '230,240,255', wy, gy, wx, wx + ww, 3, 0.6);
  bricksIn(g, wx, gy, ww, wy + wh - gy, 104, 50, '#4a2a26', 3);
  for (let c = 0; c < 3; c++) bx(g, wx + 2 + c * 104, gy - 48, 100, 46, '#4a2a26', 3, 3, 0.18);
  g.restore(); rr(g, wx, wy, ww, wh, 4); fo(g, null, 6);
  // пол и ковёр
  g.fillStyle = '#121a30'; g.fillRect(0, 880, W, 200); ln(g, [[0, 880], [W, 880]], 5, '#05070f');
  // свет лампы
  const lx = 1210, ly = 990;
  glow(g, lx, ly - 80, 900, '255,160,60', 0.6); glow(g, lx, ly - 80, 320, '255,220,150', 0.75);
  particles(g, 60, 5, '255,220,160', 600, 1060, 820, 1600, 3, 0.5);
  const s = 2.5, x = 470, y = 640 + 440 * s;
  const o = { ...C.heroine, expr: 'worried', look: 0, lookY: 0, turn: 0.1, noShadow: true, pose: 'hush' };
  fig(g, x, y, s, o, 1.0); eyes(g, x, y, s, o, 1.0, { wet: true }); mouthHand(g, x, y, s, o, 1.0, 'shh');
  // одеяло на плечах
  g.beginPath(); g.moveTo(-60, 1080); g.bezierCurveTo(20, 920, 160, 940, 250, 1000); g.quadraticCurveTo(470, 960, 700, 1010); g.bezierCurveTo(820, 940, 930, 1000, 980, 1080); g.closePath(); fo(g, vg(g, 930, 150, '#7a3a4a', 0.2), 6);
  for (let k = 0; k < 6; k++) ln(g, [[80 + k * 150, 1000 + (k % 2) * 10], [120 + k * 150, 1080]], 4, 'rgba(255,210,140,.25)');
  // тёплый свет на лице справа
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, x + 260, 700, 420, '255,160,80', 0.45); g.restore();
  openBook(g, 960, 975, 1.05); oilLamp(g, lx, ly, 1.6);
  redCircle(g, 960, 970, 225, 82, -0.05);
  vignetteDark(g, 0.55);
  TAG(g, 'АФГАНИСТАН', 70, 60, 60, '#e2283a', '#ffffff');
  T(g, 'УЧИСЬ', 1470, 190, 180, '#ffffff', { ...IT, align: 'center', maxW: 860 });
  T(g, 'ШЁПОТОМ', 1430, 420, 190, '#ffd43b', { ...IT, align: 'center', maxW: 900 });
}
function vignetteDark(g, a) { const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,8,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }

// E: ШКОЛА ТОЛЬКО ДЛЯ НЕГО
function coverE(g, t) {
  sky(g, '#0a1630', '#2a3a66', 700);
  // школа за воротами: тёплые окна
  bx(g, 760, 360, 1100, 420, '#2a3050', 6, 6, 0.1); for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { const wx = 820 + c * 170, wy = 410 + r * 170; bx(g, wx, wy, 110, 120, '#ffc85a', 4, 4, 0.1); glow(g, wx + 55, wy + 60, 120, '255,190,90', 0.35); }
  glow(g, 1300, 700, 620, '255,180,80', 0.45);
  // стена и земля
  g.fillStyle = '#1a2440'; g.fillRect(0, 760, W, 320); ln(g, [[0, 760], [W, 760]], 5, '#05070f');
  bx(g, -20, 600, 760, 200, '#3a3a5a', 4, 6, 0.1); bx(g, 1700, 600, 260, 200, '#3a3a5a', 4, 6, 0.1);
  // ворота: правая створка открыта (тёплый проход), левая закрыта на замок
  const gx0 = 740, gx1 = 1700, gm = 1180;
  g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(0, 560, 0, 1080); gr.addColorStop(0, 'rgba(255,200,110,.35)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(gm, 760); g.lineTo(gx1, 760); g.lineTo(gx1 + 200, 1080); g.lineTo(gm - 100, 1080); g.closePath(); g.fill(); g.restore();
  bx(g, gx0 - 30, 470, 40, 360, '#4a4a66', 4, 5); bx(g, gx1 - 10, 470, 40, 360, '#4a4a66', 4, 5);
  // брат идёт в школу
  const bo = { ...C.brother, expr: 'smile', turn: 0.6, look: 1, pack: '#e2483a', step: 1.2, pose: [[-140, -190, 1], [140, -210, -1]] };
  fig(g, 1440, 800, 0.62, bo, 1.0);
  // закрытая левая створка с решёткой
  for (let bxx = gx0 + 10; bxx < gm; bxx += 46) { ln(g, [[bxx, 520], [bxx, 800]], 14, '#05070f'); ln(g, [[bxx, 520], [bxx, 800]], 7, '#5a6488'); }
  for (const yy of [540, 780]) { ln(g, [[gx0, yy], [gm, yy]], 16, '#05070f'); ln(g, [[gx0, yy], [gm, yy]], 9, '#5a6488'); }
  // открытая створка (в перспективе)
  for (let k = 0; k < 7; k++) { const xx = gx1 - 10 + k * 22; ln(g, [[xx, 500 - k * 6], [xx, 820 + k * 8]], 12, '#05070f'); ln(g, [[xx, 500 - k * 6], [xx, 820 + k * 8]], 6, '#5a6488'); }
  chain(g, gm - 180, 620, gm, 700, 30); chain(g, gm - 180, 700, gm, 620, 30); padlock(g, gm - 90, 690, 0.8);
  redCircle(g, gm - 90, 680, 120, 110, 0.1);
  particles(g, 70, 21, '220,230,255', 0, 1080, 0, W, 3, 0.45);
  // героиня в углу
  const s = 2.45, x = 380, y = 650 + 440 * s;
  const o = { ...C.heroine, expr: 'shock', look: 0.9, lookY: -0.1, turn: 0.25, noShadow: true, pose: [[-100, -175, 1], [130, -300, -1]] };
  g.save(); g.globalCompositeOperation = 'source-over'; fig(g, x, y, s, o, 1.0); eyes(g, x, y, s, o, 1.0, { wet: true, tear: true }); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, x + 280, 620, 360, '255,170,90', 0.28); g.restore();
  vignetteDark(g, 0.5);
  T(g, 'ШКОЛА', 1330, 170, 160, '#ffffff', { ...IT, align: 'center', maxW: 900 });
  T(g, 'ТОЛЬКО ДЛЯ НЕГО', 1290, 330, 140, '#ffd43b', { ...IT, align: 'center', maxW: 1080 });
  TAG(g, 'АФГАНИСТАН', 70, 60, 56, '#e2283a', '#ffffff');
}

// F: ПРАВИЛО №1 / НЕ ПОЙ ПРИ ЧУЖИХ
function coverF(g, t) {
  sky(g, '#1a1238', '#3a2a5a', 600);
  particles(g, 40, 3, '255,255,255', 0, 300, 0, W, 2, 0.6);
  // дома вокруг двора с окнами-«глазами»
  const houses = [[-40, 420, 520, '#2a2440'], [440, 360, 560, '#241f3a'], [960, 400, 520, '#2a2440'], [1440, 340, 540, '#241f3a']];
  const wins = [];
  houses.forEach(([hx, hy, hw, c], i) => { bx(g, hx, hy, hw, 1080 - hy, c, 4, 6, 0.1); for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { const wx = hx + 60 + k * (hw - 120) / 3 + 10, wy = hy + 60 + r * 170; if ((i + r + k) % 3 === 2) { bx(g, wx, wy, 100, 110, '#141028', 4, 4); continue; } wins.push([wx, wy]); } });
  wins.forEach(([wx, wy], j) => { glow(g, wx + 50, wy + 55, 110, '255,190,90', 0.3); bx(g, wx, wy, 100, 110, '#ffc85a', 4, 4, 0.12); el(g, wx + 50, wy + 120, 0, 0, '#000', 0);
    // силуэт-«глаза» в окне
    g.save(); rr(g, wx, wy, 100, 110, 4); g.clip(); g.beginPath(); g.ellipse(wx + 50, wy + 110, 34, 46, 0, 0, Math.PI * 2); g.fillStyle = '#2a1a20'; g.fill(); g.restore(); el(g, wx + 38, wy + 84, 6, 7, '#ffffff', 0); el(g, wx + 62, wy + 84, 6, 7, '#ffffff', 0); el(g, wx + 40, wy + 85, 3, 3.5, '#000', 0); el(g, wx + 64, wy + 85, 3, 3.5, '#000', 0); });
  // двор
  g.fillStyle = '#1a1430'; g.fillRect(0, 900, W, 180); ln(g, [[0, 900], [W, 900]], 5, '#05070f');
  const [rx, ry] = wins.reduce((b, w) => Math.hypot(w[0] - 800, w[1] - 590) < Math.hypot(b[0] - 800, b[1] - 590) ? w : b); redCircle(g, rx + 50, ry + 55, 95, 100, -0.1);
  // героиня: рука закрывает рот
  const s = 2.45, x = 1420, y = 640 + 440 * s;
  glow(g, x, 600, 520, '120,140,230', 0.3);
  const o = { ...C.heroine, expr: 'shock', look: -0.7, lookY: -0.2, turn: -0.2, noShadow: true, pose: 'hush', sweat: 1 };
  fig(g, x, y, s, o, 1.0); eyes(g, x, y, s, o, 1.0, { wet: true }); mouthHand(g, x, y, s, o, 1.0, 'cover');
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, x - 300, 600, 360, '255,170,90', 0.22); g.restore();
  vignetteDark(g, 0.5);
  TAG(g, 'ПРАВИЛО №1', 70, 60, 64, '#e2283a', '#ffffff', { rot: -0.05 });
  T(g, 'НЕ ПОЙ', 80, 360, 230, '#ffffff', { ...IT, maxW: 820 });
  T(g, 'ПРИ ЧУЖИХ', 80, 560, 190, '#ff3b3b', { ...IT, maxW: 880 });
}

const K = { v3a: coverA, v3b: coverB, v3c: coverC, v4d: coverD, v4e: coverE, v4f: coverF };
for (const s of E.shots || []) { const f = K[(s.params || {}).k]; if (f) registerShot(s.id, { draw: (g, t) => f(g, t) }); }
