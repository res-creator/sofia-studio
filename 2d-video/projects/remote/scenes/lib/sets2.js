// Фоны второй половины выпуска: Буве, пустыни, Антарктида, Девон, полюс, точка Немо, космос.
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt, scrib, fig } from './pro.js';
import { tag, big, pop, sea, ship, house, moonSpace, capsule } from './sets.js';

const sky = (g, a, b, y1 = 700) => { const s = g.createLinearGradient(0, -300, 0, y1); s.addColorStop(0, a); s.addColorStop(1, b); g.fillStyle = s; g.fillRect(-400, -400, 2720, 1900); };
const fog = (g, t, a = 0.35, y = 300) => { for (let i = 0; i < 6; i++) { const x = ((i * 420 + t * 40) % 2600) - 400; g.save(); g.globalAlpha = a; el(g, x, y + (i % 3) * 120, 360, 70, '#ffffff', 0); g.restore(); } };

// ------------------------------------------------------------------ Буве: ледяной остров, высадка, шлюпка
export function bouvet(g, t, o = {}) {
  sky(g, '#7d8ea0', '#c9d3dc'); fog(g, t, 0.25, 160);
  sea(g, t, { sky: false, mid: () => {
    g.beginPath(); g.moveTo(280, 760); g.lineTo(360, 470); g.bezierCurveTo(420, 380, 560, 330, 700, 330); g.lineTo(1240, 320); g.bezierCurveTo(1400, 330, 1500, 380, 1560, 470); g.lineTo(1640, 760); g.closePath(); fo(g, vg(g, 320, 440, '#4e4a46', 0.2));
    for (let x = 340; x < 1620; x += 64) ln(g, [[x, 520 + Math.sin(x) * 20], [x + 14, 760]], 4, 'rgba(0,0,0,.22)');
    g.beginPath(); g.moveTo(372, 460); g.bezierCurveTo(430, 370, 560, 322, 700, 320); g.lineTo(1240, 310); g.bezierCurveTo(1400, 320, 1500, 372, 1548, 460); g.bezierCurveTo(1460, 500, 1400, 470, 1320, 520); g.bezierCurveTo(1200, 470, 1080, 530, 960, 490); g.bezierCurveTo(840, 540, 720, 470, 600, 520); g.bezierCurveTo(500, 480, 440, 510, 372, 460); g.closePath(); fo(g, vg(g, 310, 220, '#f2f7fb', 0.1));
    for (const [x, y] of [[620, 400], [860, 360], [1100, 362], [1320, 400]]) ln(g, [[x, y], [x + 26, y + 60]], 4, 'rgba(90,140,190,.6)');
    fog(g, t, 0.4, 560); } });
  if (o.boat) { const bx0 = 1260, by = 820 + Math.sin(t * 2) * 10; g.save(); g.translate(bx0, by); g.rotate(Math.sin(t * 1.6) * 0.15); pg(g, [[-90, -20], [90, -20], [70, 20], [-70, 20]], '#e86a2a'); [[-40, -20], [0, -20], [40, -20]].forEach(([x, y], k) => fig(g, x, y + 4, 0.18, { body: 'parka', coat: '#c8453a', hair: 'beanie', hatC: '#2a3a5a', seed: 40 + k, noShadow: true, seated: true, expr: 'worried' }, t)); g.restore(); for (let i = 0; i < 4; i++) { const k = (t * 0.9 + i * 0.25) % 1; g.save(); g.globalAlpha = 1 - k; el(g, 1100 + i * 90, 780 - k * 60, 40 + k * 50, 16, '#fff', 0); g.restore(); } }
}
export function lagoon(g, t, o = {}) {
  sky(g, '#8b98a6', '#d4dbe2'); g.fillStyle = vg(g, 300, 400, '#5b5852', 0.2); g.fillRect(-400, 300, 2720, 1300);
  pg(g, [[-400, 360], [300, 250], [700, 330], [1200, 240], [1700, 320], [2320, 260], [2320, 520], [-400, 520]], vg(g, 240, 280, '#eef4f8', 0.1));
  g.beginPath(); g.ellipse(960, 760, 820, 230, 0, 0, Math.PI * 2); fo(g, vg(g, 530, 460, '#5f8aa6', 0.2)); g.save(); g.globalAlpha = 0.4; for (let i = 0; i < 8; i++) ln(g, [[500 + i * 110, 700 + (i % 3) * 40], [560 + i * 110, 700 + (i % 3) * 40]], 4, '#fff'); g.restore();
  const R = rng(4); for (let i = 0; i < 30; i++) el(g, R() * 1920, 960 + R() * 120, 30 + R() * 40, 16 + R() * 14, '#77736a', 4);
  // шлюпка
  g.save(); g.translate(900, 760 + Math.sin(t * 1.3) * 4); g.rotate(-0.04); g.beginPath(); g.moveTo(-260, -40); g.quadraticCurveTo(0, 70, 260, -40); g.lineTo(230, -70); g.lineTo(-230, -70); g.closePath(); fo(g, vg(g, -70, 110, '#a8885a', 0.25)); ln(g, [[-230, -66], [230, -66]], 8, '#6a5236'); for (const x of [-120, 0, 120]) ln(g, [[x, -66], [x, 0]], 6, '#6a5236'); g.restore();
  // вёсла и бочка на берегу
  ln(g, [[260, 1000], [520, 930]], 12, '#8a6a42'); el(g, 540, 924, 34, 18, '#8a6a42', 4); ln(g, [[300, 1030], [560, 980]], 12, '#8a6a42'); bx(g, 1460, 900, 120, 150, '#7a5236', 20, 5, 0.25); [930, 1000].forEach((y) => ln(g, [[1460, y], [1580, y]], 7, '#3a3a3a'));
  if (o.q) big(g, '?', 900, 420, 280, pop(t, o.q), '#ffd43b', 0.08);
}
// ------------------------------------------------------------------ Австралия / Сахара-оазис / Якутия
export function outback(g, t) {
  sky(g, '#8fc6ea', '#f6e2bc'); el(g, 1550, 200, 90, 90, '#fff2c0', 0); glow(g, 1550, 200, 340, '255,240,190', 0.5);
  g.fillStyle = vg(g, 560, 700, '#c8643a', 0.2); g.fillRect(-400, 560, 2720, 1000);
  pg(g, [[300, 560], [420, 430], [760, 420], [880, 560]], vg(g, 420, 140, '#b3502c', 0.2)); for (let i = 0; i < 4; i++) ln(g, [[440 + i * 90, 440], [430 + i * 90, 560]], 3, 'rgba(0,0,0,.2)');
  const R = rng(6); for (let i = 0; i < 18; i++) { const x = R() * 2000 - 40, y = 640 + R() * 380; el(g, x, y, 40, 18, '#9a8a3a', 4); }
  // ветряк-насос и бак
  ln(g, [[1300, 900], [1340, 520], [1380, 900]], 8); for (let y = 600; y < 900; y += 80) ln(g, [[1320, y], [1362, y + 40]], 4); g.save(); g.translate(1340, 510); g.rotate(t * 2); for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); pg(g, [[0, 0], [90, -12], [90, 12]], '#d8d4ca', 3); } g.restore(); el(g, 1340, 510, 16, 16, '#5a5a5a', 4); bx(g, 1420, 780, 180, 120, '#9aa0a6', 10, 5);
  // кенгуру
  [[600, 920, 1], [820, 900, 0.8]].forEach(([x, y, s], i) => { const h = Math.abs(Math.sin(t * 3 + i)) * 40; g.save(); g.translate(x, y - h); g.scale(s, s); g.beginPath(); g.moveTo(-60, 0); g.quadraticCurveTo(-170, -20, -200, 20); g.lineWidth = 16; g.strokeStyle = OL; g.stroke(); g.lineWidth = 9; g.strokeStyle = '#b8743a'; g.stroke(); g.beginPath(); g.ellipse(0, -60, 70, 90, -0.3, 0, Math.PI * 2); fo(g, '#c8844a', 5); el(g, 50, -170, 34, 30, '#c8844a', 5); pg(g, [[40, -196], [52, -250], [64, -196]], '#c8844a', 4); el(g, 66, -176, 5, 5, OL, 0); el(g, 20, 20, 50, 14, '#a8643a', 4); g.restore(); });
}
export function oasis(g, t) {
  sky(g, '#f2b25a', '#fde6b0'); el(g, 400, 230, 90, 90, '#fff4c8', 0); glow(g, 400, 230, 360, '255,240,180', 0.5);
  [['#e7b56a', 600, 0.004], ['#dca55a', 760, 0.006]].forEach(([c, y, f]) => { g.beginPath(); g.moveTo(-400, y); for (let x = -400; x <= 2320; x += 40) g.lineTo(x, y - Math.sin(x * f + y) * 70); g.lineTo(2320, 1500); g.lineTo(-400, 1500); g.closePath(); fo(g, c, 5); });
  g.beginPath(); g.ellipse(1400, 860, 260, 50, 0, 0, Math.PI * 2); fo(g, '#5aa0c8', 4);
  [[1220, 850, 1], [1560, 840, 0.85], [1380, 820, 0.7]].forEach(([x, y, s]) => { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, -150, 10, -300); g.lineWidth = 26; g.strokeStyle = OL; g.stroke(); g.lineWidth = 16; g.strokeStyle = '#8a6a42'; g.stroke(); for (let k = 0; k < 6; k++) { g.save(); g.translate(10, -300); g.rotate(-2.6 + k * 0.9 + Math.sin(t + k) * 0.05); g.beginPath(); g.ellipse(70, 0, 80, 18, 0.2, 0, Math.PI * 2); fo(g, '#4f8a3a', 4); g.restore(); } g.restore(); });
  // верблюд вдалеке
  g.save(); g.translate(500 + t * 20, 700); g.scale(0.6, 0.6); el(g, 0, -100, 90, 50, '#c8944a', 5); el(g, -20, -150, 30, 30, '#c8944a', 5); ln(g, [[80, -110], [130, -170]], 18); el(g, 140, -176, 26, 16, '#c8944a', 4); [-60, -20, 30, 60].forEach((x) => ln(g, [[x, -60], [x, 0]], 10)); g.restore();
}
export function yakutia(g, t) {
  sky(g, '#b9cfe2', '#eef3f8'); g.fillStyle = '#f4f7fb'; g.fillRect(-400, 640, 2720, 900);
  const R = rng(9); for (let i = 0; i < 30; i++) { const x = -360 + i * 85 + R() * 30, y = 660 + R() * 30, h = 120 + R() * 80; ln(g, [[x, y], [x, y - 20]], 8, '#3a2a20'); for (let k = 0; k < 3; k++) { const yy = y - 20 - k * h * 0.25, w = h * (0.28 - k * 0.07); pg(g, [[x, yy - h * 0.4], [x + w, yy], [x - w, yy]], '#2f5a44', 3); ln(g, [[x - w * 0.6, yy - 3], [x + w * 0.6, yy - 3]], 5, '#fff'); } }
  // избушка-метеостанция с дымом
  g.save(); g.translate(1200, 880); bx(g, -150, -150, 300, 150, '#8a5a36', 6, 5); for (let y = -130; y < 0; y += 26) ln(g, [[-150, y], [150, y]], 3, 'rgba(0,0,0,.25)'); pg(g, [[-180, -146], [0, -250], [180, -146]], '#eef3f8'); bx(g, -40, -110, 80, 60, '#ffd76a', 3, 4); ln(g, [[100, -230], [100, -290]], 18, '#5a5a5a'); g.restore();
  for (let i = 0; i < 4; i++) { const k = (t * 0.4 + i * 0.25) % 1; g.save(); g.globalAlpha = 0.6 * (1 - k); el(g, 1300 + k * 40, 570 - k * 200, 30 + k * 40, 22 + k * 20, '#e9edf2', 0); g.restore(); }
  ln(g, [[1500, 880], [1500, 620]], 8); g.save(); g.translate(1500, 620); g.rotate(t * 6); for (let k = 0; k < 3; k++) { g.rotate(2.094); ln(g, [[0, 0], [36, 0]], 4); el(g, 36, 0, 10, 8, '#e9e4da', 3); } g.restore();
  for (let i = 0; i < 80; i++) { const x = (R() * 2100 + t * 30) % 2100 - 90, y = (R() * 1100 + t * 60) % 1100; el(g, x, y, 3, 3, 'rgba(255,255,255,.8)', 0); }
}
// таблица рекордов
export function board(g, t, rows, o = {}) {
  g.fillStyle = vg(g, 0, 1080, '#3a4a3e', 0.25); g.fillRect(-100, -100, 2120, 1280); bx(g, 360, 130, 1200, 820, '#2d4a3a', 16, 10, 0.08); rr(g, 360, 130, 1200, 820, 16); g.lineWidth = 22; g.strokeStyle = '#8a5a36'; g.stroke();
  htxt(g, o.title || 'Рекорд одиночества', 960, 220, 76, '#f4f1ea');
  rows.forEach(([name, km, at, hl], i) => { const k = pop(t, at ?? 0.2 + i * 0.3); if (k <= 0) return; const y = 340 + i * 120; g.save(); g.globalAlpha = Math.min(1, k); htxt(g, `${i + 1}. ${name}`, 440, y, 64, hl ? '#ffd43b' : '#f4f1ea', 'left'); htxt(g, km, 1480, y, 64, hl ? '#ffd43b' : '#f4f1ea', 'right'); g.restore(); if (hl) { g.save(); g.strokeStyle = '#ffd43b'; g.lineWidth = 4; g.beginPath(); g.ellipse(960, y, 540, 52, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } });
  ln(g, [[700, 960], [760, 940]], 10, '#f4f1ea');
}
// кнопка «Подписаться»
export function subscribe(g, t, a = 0.3) { const k = pop(t, a, 0.5); if (k <= 0) return; g.save(); g.translate(1420, 820); g.scale(k, k); g.rotate(-0.03); rr(g, -260, -70, 520, 140, 30); fo(g, '#e23a2a', 6); htxt(g, 'Подписаться', -30, 4, 72, '#ffffff'); g.save(); g.translate(200, -4); g.rotate(Math.sin(t * 10) * 0.25); g.beginPath(); g.moveTo(-26, 20); g.quadraticCurveTo(-26, -34, 0, -34); g.quadraticCurveTo(26, -34, 26, 20); g.closePath(); fo(g, '#ffd43b', 4); el(g, 0, 26, 8, 8, '#ffd43b', 3); g.restore(); g.restore(); }

// ------------------------------------------------------------------ Антарктида: станция Восток, термометр
export function vostok(g, t, o = {}) {
  sky(g, '#1d2c55', '#6a7fa8'); const R = rng(2); for (let i = 0; i < 80; i++) el(g, R() * 1920, R() * 500, 1.5, 1.5, 'rgba(255,255,255,.7)', 0);
  g.save(); g.globalAlpha = 0.35; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-200, 200 + i * 30); for (let x = -200; x <= 2120; x += 60) g.lineTo(x, 200 + i * 30 + Math.sin(x * 0.004 + t * 0.6 + i) * 60); g.lineWidth = 26; g.strokeStyle = i % 2 ? '#7fe0b0' : '#5ad0a0'; g.stroke(); } g.restore();
  g.fillStyle = vg(g, 680, 500, '#e6eef8', 0.12); g.fillRect(-400, 680, 2720, 900);
  // корпуса на сваях
  [[520, 600, 380, '#c8453a'], [980, 620, 320, '#e0a83a'], [1380, 610, 260, '#3a6aa8']].forEach(([x, y, w, c]) => { bx(g, x - w / 2, y, w, 110, c, 8, 5); for (let k = 0; k < 4; k++) bx(g, x - w / 2 + 30 + k * (w - 60) / 3 - 16, y + 30, 32, 26, '#ffd76a', 3, 3); for (const dx of [-w / 2 + 30, w / 2 - 30]) ln(g, [[x + dx, y + 110], [x + dx, 700]], 10); });
  ln(g, [[1640, 700], [1640, 420]], 8); for (let k = 0; k < 3; k++) el(g, 1640, 440 + k * 60, 30, 10, '#e9e4da', 3); el(g, 1700, 520, 40, 40, '#e9e4da', 4);
  if (o.thermo) { const k = clamp((t - 0.3) / 1.2); g.save(); g.translate(1720, 560); bx(g, -50, -330, 100, 520, '#f6f4ee', 40, 5); el(g, 0, 160, 54, 54, '#3a8ae0', 5); bx(g, -16, 160 - 440 * (0.1 + 0.0 * k), 32, 440 * (0.1), '#3a8ae0', 10, 0); g.restore(); tag(g, '−89,2 °C', 1460, 260, pop(t, 0.5), { size: 90, bg: '#bfe0ff' }); }
}
// антарктический глобус-вид сверху рисует globe(); здесь — участок Земли Мэри Бэрд (пустой лёд)
export function iceDesert(g, t) { sky(g, '#6f9fd0', '#e8f2fb'); const R = rng(12); g.fillStyle = vg(g, 520, 700, '#f2f7fb', 0.08); g.fillRect(-400, 520, 2720, 1100); for (let i = 0; i < 26; i++) { const x = R() * 2000 - 40, y = 560 + R() * 460; g.save(); g.globalAlpha = 0.5; ln(g, [[x, y], [x + 60 + R() * 120, y + 4]], 4, '#b8cde0'); g.restore(); } for (let i = 0; i < 6; i++) { const x = ((i * 380 + t * 160) % 2400) - 300; g.save(); g.globalAlpha = 0.5; ln(g, [[x, 600 + i * 60], [x + 240, 600 + i * 60]], 6, '#ffffff'); g.restore(); } }

// ------------------------------------------------------------------ Девон: «Марс на Земле»
export function devon(g, t, o = {}) {
  sky(g, '#c9b8a6', '#efe2d2'); g.fillStyle = vg(g, 560, 700, '#9a6a4a', 0.2); g.fillRect(-400, 560, 2720, 1000);
  pg(g, [[-400, 600], [200, 470], [600, 540], [1000, 480], [1500, 560], [2320, 500], [2320, 620], [-400, 640]], vg(g, 470, 170, '#7a5a42', 0.2));
  g.beginPath(); g.ellipse(980, 740, 520, 90, 0, 0, Math.PI * 2); fo(g, vg(g, 650, 180, '#7a5038', 0.25)); g.beginPath(); g.ellipse(980, 750, 430, 62, 0, 0, Math.PI * 2); fo(g, '#6a4430', 3);
  const R = rng(3); for (let i = 0; i < 40; i++) el(g, R() * 2000 - 40, 820 + R() * 240, 12 + R() * 26, 7 + R() * 12, '#6a4a36', 3);
  // жилой модуль
  g.save(); g.translate(400, 760); g.beginPath(); g.ellipse(0, 0, 200, 140, 0, Math.PI, 0); fo(g, vg(g, -140, 140, '#e9e4da', 0.15)); ln(g, [[-200, 0], [200, 0]], 5); bx(g, -40, -80, 80, 80, '#7fc0ea', 30, 4); g.restore();
  // марсоход
  const rx = 1300 + Math.sin(t * 0.4) * 60; g.save(); g.translate(rx, 870); bx(g, -140, -110, 280, 70, '#e9e4da', 10, 5); for (const x of [-110, 0, 110]) { el(g, x, -10, 36, 36, '#3a3a3a', 5); g.save(); g.translate(x, -10); g.rotate(t * 2); ln(g, [[-24, 0], [24, 0]], 4, '#888'); g.restore(); } ln(g, [[60, -110], [60, -200]], 6); bx(g, 30, -240, 70, 44, '#5a6068', 6, 4); el(g, 70, -218, 12, 12, '#7fd0ff', 3); bx(g, -130, -140, 120, 30, '#2b4a8a', 4, 4); g.restore();
  if (o.suit) fig(g, 800, 1000, 0.9, { body: 'tee', coat: '#e9e4da', hair: 'helmet', skin: '#f1c8a2', seed: 60, pose: 'point', look: 1, pack: '#d8d4ca' }, t);
}
// ------------------------------------------------------------------ Северный полюс, торосы
export function arctic(g, t, o = {}) {
  sky(g, '#7fa8d8', '#e6f1fb'); g.fillStyle = vg(g, 560, 700, '#eef5fb', 0.08); g.fillRect(-400, 560, 2720, 1000);
  const R = rng(7); for (let i = 0; i < 12; i++) { const x = R() * 2100 - 90, y = 600 + R() * 200, w = 60 + R() * 120; pg(g, [[x - w, y + 40], [x - w * 0.3, y - 60 - R() * 50], [x + w * 0.5, y - 20], [x + w, y + 40]], vg(g, y - 110, 150, '#dbe9f6', 0.15)); }
  g.save(); g.beginPath(); g.moveTo(-400, 900); g.lineTo(2320, 860); g.lineTo(2320, 920); g.lineTo(-400, 960); g.closePath(); g.fillStyle = '#5f8aa6'; g.fill(); g.restore();
  if (o.pole) { ln(g, [[960, 900], [960, 600]], 12, '#c8453a'); for (let y = 620; y < 900; y += 50) ln(g, [[954, y], [966, y + 25]], 10, '#f4f4f0'); pg(g, [[966, 610], [1110, 640], [966, 676]], '#ffd43b'); htxt(g, 'N', 1030, 643, 44, OL); }
  if (o.bear) { g.save(); g.translate(1480 + t * 25, 820); el(g, 0, -70, 140, 70, '#f4f1e6', 5); el(g, 130, -110, 50, 42, '#f4f1e6', 5); el(g, 172, -104, 8, 6, OL, 0); el(g, 120, -150, 14, 12, '#f4f1e6', 4); for (const x of [-90, -40, 50, 100]) bx(g, x - 18, -30, 36, 60, '#f4f1e6', 10, 4); g.restore(); }
}
// ------------------------------------------------------------------ 1992: инженер за компьютером
export function office92(g, t) {
  g.fillStyle = vg(g, 0, 860, '#7a8a8a', 0.18); g.fillRect(-400, -300, 2720, 1200); g.fillStyle = vg(g, 860, 300, '#5a4a3a', 0.2); g.fillRect(-400, 860, 2720, 400); ln(g, [[-400, 860], [2320, 860]], 6);
  bx(g, 1300, 160, 420, 300, '#e9e2cf', 6, 5); htxt(g, 'МИР', 1510, 220, 54, OL); for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha = 0.7; el(g, 1400 + i * 100, 340, 40, 26, '#9ab87a', 0); g.restore(); }
  el(g, 400, 220, 60, 60, '#f2eee3', 5); htxt(g, '1992', 400, 340, 70, '#3a3a3a');
}
export function crtDesk(g, t, o = {}) { bx(g, 360, 760, 1200, 40, '#8a6a4a', 6, 5); g.save(); g.translate(960, 760); bx(g, -240, -400, 480, 380, '#d8d0b8', 24, 6, 0.2); rr(g, -200, -360, 400, 290, 30); fo(g, '#0d1a14', 5); g.save(); rr(g, -200, -360, 400, 290, 30); g.clip(); g.strokeStyle = 'rgba(120,255,170,.85)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(-60 + k * 70, -220 + (k % 2) * 40, 90, 0, Math.PI * 2); g.stroke(); } el(g, 10, -200, 8, 8, '#ff5a3a', 0); htxt(g, '48°52′ ю.ш.  123°23′ з.д.', 0, -100, 30, '#7fffaa'); g.restore(); bx(g, -60, -20, 120, 20, '#b8b09a', 4, 4); bx(g, -260, 10, 520, 40, '#e9e4da', 6, 4); g.restore(); glow(g, 960, 560, 260, '120,255,170', 0.15); }

// ------------------------------------------------------------------ океан: разрез глубины, станция, кладбище
export function depth(g, t, o = {}) {
  sky(g, '#9fd0f0', '#e2f2fb', 300); const sea2 = g.createLinearGradient(0, 300, 0, 1080); sea2.addColorStop(0, '#3f8fc8'); sea2.addColorStop(0.5, '#1d4a7a'); sea2.addColorStop(1, '#0a1a30'); g.fillStyle = sea2; g.fillRect(-400, 300, 2720, 1300);
  g.beginPath(); g.moveTo(-400, 300); for (let x = -400; x <= 2320; x += 30) g.lineTo(x, 300 + Math.sin(x * 0.01 + t * 1.5) * 10); g.lineWidth = 6; g.strokeStyle = OL; g.stroke();
  g.fillStyle = '#3a3428'; g.beginPath(); g.moveTo(-400, 1020); for (let x = -400; x <= 2320; x += 80) g.lineTo(x, 1010 + Math.sin(x * 0.01) * 14); g.lineTo(2320, 1300); g.lineTo(-400, 1300); g.fill();
  if (o.ruler) { ln(g, [[1500, 310], [1500, 1000]], 8, '#ffd43b'); for (let k = 0; k <= 4; k++) { const y = 310 + k * 172; ln(g, [[1480, y], [1520, y]], 6, '#ffd43b'); } tag(g, '≈ 4 км', 1700, 650, pop(t, 0.4), { size: 80, bg: '#ffd43b' }); }
  if (o.raft) { g.save(); g.translate(700, 300 + Math.sin(t * 1.5) * 8); bx(g, -120, -16, 240, 30, '#a8885a', 6, 4); fig(g, 0, -12, 0.35, { hair: 'side', hairC: '#4a3020', body: 'sweater', coat: '#3f8f8a', pack: '#d9822b', seed: 2, expr: 'worried', look: 0.5, noShadow: true }, t); g.restore(); }
}
export function cemetery(g, t) {
  const sea2 = g.createLinearGradient(0, 0, 0, 1080); sea2.addColorStop(0, '#16385a'); sea2.addColorStop(1, '#060e1c'); g.fillStyle = sea2; g.fillRect(-400, -300, 2720, 1700);
  for (let i = 0; i < 6; i++) { g.save(); g.globalAlpha = 0.12; g.beginPath(); g.moveTo(300 + i * 280, -300); g.lineTo(200 + i * 280 - 200, 1100); g.lineTo(300 + i * 280 - 100, 1100); g.closePath(); g.fillStyle = '#9fd0ff'; g.fill(); g.restore(); }
  g.fillStyle = '#2a2a24'; g.beginPath(); g.moveTo(-400, 860); for (let x = -400; x <= 2320; x += 70) g.lineTo(x, 850 + Math.sin(x * 0.013) * 22); g.lineTo(2320, 1500); g.lineTo(-400, 1500); g.fill();
  // обломки: модуль «Мира», панель, бак, сопло
  g.save(); g.translate(700, 820); g.rotate(-0.2); bx(g, -260, -90, 520, 180, '#7a7a72', 60, 6, 0.25); for (let k = -200; k < 260; k += 80) ln(g, [[k, -90], [k, 90]], 4, 'rgba(0,0,0,.25)'); el(g, 260, 0, 30, 90, '#5a5a52', 5); bx(g, -120, -150, 140, 60, '#4a4a42', 6, 4); g.restore(); htxt(g, 'МИР', 640, 800, 60, 'rgba(220,220,210,.75)', 'center', -0.2);
  g.save(); g.translate(1360, 880); g.rotate(0.3); bx(g, -180, -50, 360, 100, '#2b4a8a', 4, 5); for (let k = 1; k < 4; k++) ln(g, [[-180 + k * 90, -50], [-180 + k * 90, 50]], 3, '#6a8ad0'); g.restore();
  g.save(); g.translate(1700, 860); pg(g, [[-60, 0], [60, 0], [100, -110], [-100, -110]], '#5a5048'); g.restore(); el(g, 280, 900, 70, 60, '#6a6a62', 5);
  // рыбки и пузыри
  for (let i = 0; i < 5; i++) { const x = ((i * 430 + t * 60) % 2300) - 200, y = 300 + i * 90; g.save(); g.translate(x, y); el(g, 0, 0, 30, 14, '#7ab0c8', 3); pg(g, [[-28, 0], [-46, -12], [-46, 12]], '#7ab0c8', 3); g.restore(); }
  const R = rng(5); for (let i = 0; i < 20; i++) { const x = R() * 1920, y = 1000 - ((t * 60 + R() * 1000) % 1000); el(g, x, y, 5, 5, 'rgba(200,230,255,.6)', 2); }
}
export function iss(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 0.3) * 0.05); ln(g, [[-420, 0], [420, 0]], 14); for (const dx of [-380, -250, 250, 380]) { bx(g, dx - 50, -170, 100, 140, '#2b4a8a', 4, 4); bx(g, dx - 50, 30, 100, 140, '#2b4a8a', 4, 4); ln(g, [[dx, -30], [dx, 30]], 6); } bx(g, -150, -40, 300, 80, '#d8d4ca', 30, 5); bx(g, -40, -110, 80, 220, '#e9e4da', 26, 5); bx(g, 150, -30, 120, 60, '#c8c2b4', 26, 4); g.restore(); }
export function orbitEarth(g, t, o = {}) { g.fillStyle = '#04060f'; g.fillRect(-400, -400, 2720, 1900); const R = rng(14); for (let i = 0; i < 200; i++) el(g, R() * 1920, R() * 1080, 1 + R() * 1.6, 1 + R() * 1.6, `rgba(255,255,255,${0.3 + R() * 0.6})`, 0);
  g.save(); g.beginPath(); g.arc(960, 2300, 1700, 0, Math.PI * 2); g.fillStyle = '#2b6cb0'; g.fill(); g.clip(); const R2 = rng(2); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(R2() * 2000 - 40 + t * 8, 640 + R2() * 400, 80 + R2() * 90, 20 + R2() * 16, 0, 0, Math.PI * 2); g.fill(); } g.restore(); g.beginPath(); g.arc(960, 2300, 1700, 0, Math.PI * 2); g.lineWidth = 30; g.strokeStyle = 'rgba(120,190,255,.35)'; g.stroke();
  if (o.falling) { const k = clamp((t - 0.4) / 2.2); g.save(); g.translate(lerp(1500, 1000, k), lerp(200, 720, k)); g.rotate(0.6); for (let i = 0; i < 6; i++) { g.save(); g.globalAlpha = 0.5 - i * 0.07; el(g, -i * 40, 0, 50 - i * 5, 20, '#ffb04a', 0); g.restore(); } g.restore(); iss(g, lerp(1500, 1000, k), lerp(200, 720, k), 0.25, t); }
}
// ------------------------------------------------------------------ Луна вблизи: лунный модуль и двое
export function moonSurface(g, t) { g.fillStyle = '#04060f'; g.fillRect(-400, -400, 2720, 1900); const R = rng(17); for (let i = 0; i < 160; i++) el(g, R() * 1920, R() * 600, 1.4, 1.4, 'rgba(255,255,255,.7)', 0); el(g, 1500, 200, 70, 70, '#3f7fd0', 4); g.save(); g.globalAlpha = 0.8; el(g, 1488, 186, 30, 18, '#5aa04a', 0); g.restore();
  g.fillStyle = vg(g, 640, 500, '#b9b6ad', 0.22); g.beginPath(); g.moveTo(-400, 680); for (let x = -400; x <= 2320; x += 80) g.lineTo(x, 660 + Math.sin(x * 0.005) * 40); g.lineTo(2320, 1500); g.lineTo(-400, 1500); g.fill(); const R2 = rng(6); for (let i = 0; i < 18; i++) { const x = R2() * 2000, y = 760 + R2() * 280, r = 20 + R2() * 60; el(g, x, y, r, r * 0.3, 'rgba(110,105,96,.4)', 3); }
  // лунный модуль
  g.save(); g.translate(1150, 820); for (const dx of [-150, 150]) ln(g, [[dx * 0.6, -100], [dx, 30]], 8); bx(g, -130, -160, 260, 100, '#d6b23a', 8, 5); pg(g, [[-100, -160], [100, -160], [80, -300], [-80, -300]], '#d8d4ca'); el(g, 0, -240, 30, 24, '#3a3a3a', 4); g.restore();
  [[700, 920], [880, 930]].forEach(([x, y], k) => fig(g, x, y, 0.5, { body: 'tee', coat: '#e9e4da', hair: 'helmet', seed: 70 + k, pose: k ? 'point' : 'idle', look: 1, pack: '#d8d4ca' }, t));
}
// ------------------------------------------------------------------ Земля–Марс: орбиты
export function orbits(g, t, o = {}) { g.fillStyle = '#050712'; g.fillRect(-400, -400, 2720, 1900); const R = rng(21); for (let i = 0; i < 180; i++) el(g, R() * 1920, R() * 1080, 1.2, 1.2, 'rgba(255,255,255,.6)', 0);
  const cx = 960, cy = 560; el(g, cx, cy, 70, 70, '#ffd34a', 0); glow(g, cx, cy, 260, '255,220,120', 0.6);
  g.save(); g.setLineDash([10, 12]); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(cx, cy, 260, 240, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(cx, cy, 420, 380, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  const ae = (o.near ? -0.2 : 0) + t * 0.25, am = o.near ? -0.2 + t * 0.13 : Math.PI + t * 0.13; const ex = cx + Math.cos(ae) * 260, ey = cy + Math.sin(ae) * 240, mx = cx + Math.cos(am) * 420, my = cy + Math.sin(am) * 380; el(g, ex, ey, 30, 30, '#3f7fd0', 4); el(g, mx, my, 24, 24, '#c8643a', 4); htxt(g, 'Земля', ex, ey - 56, 52, '#bfe0ff'); htxt(g, 'Марс', mx, my - 50, 52, '#ffc0a0');
  g.save(); g.setLineDash([16, 12]); ln(g, [[ex, ey], [mx, my]], 5, '#ffd43b'); g.restore(); tag(g, o.label, (ex + mx) / 2, (ey + my) / 2 - 70, pop(t, 0.5), { size: 70, bg: '#ffd43b' }); }
export function marsShip(g, t) { g.fillStyle = '#04060f'; g.fillRect(-400, -400, 2720, 1900); const R = rng(23); for (let i = 0; i < 220; i++) { const x = (R() * 2000 - t * 40 * (0.5 + R())) % 2000; el(g, x < -40 ? x + 2000 : x, R() * 1080, 1.4, 1.4, 'rgba(255,255,255,.7)', 0); } el(g, 1650, 860, 120, 120, '#c8643a', 5); g.save(); g.globalAlpha = 0.4; el(g, 1620, 830, 40, 20, '#8a3a2a', 0); g.restore();
  g.save(); g.translate(760, 480); g.rotate(-0.15); bx(g, -300, -60, 520, 120, '#e9e4da', 50, 6, 0.2); pg(g, [[220, -60], [380, 0], [220, 60]], '#d8d4ca'); for (let k = -240; k < 200; k += 60) ln(g, [[k, -60], [k, 60]], 3, 'rgba(0,0,0,.18)'); bx(g, -360, -40, 70, 80, '#6a6e74', 10, 5); glow(g, -380, 0, 120, '120,180,255', 0.6); for (let k = 0; k < 3; k++) el(g, 60 + k * 50, -10, 12, 10, '#7fd0ff', 3); bx(g, -200, -230, 120, 170, '#2b4a8a', 4, 4); bx(g, -200, 60, 120, 170, '#2b4a8a', 4, 4); g.restore(); }
// карточка-цитата
export function quote(g, t, text, who) { g.fillStyle = '#0b0b10'; g.fillRect(-100, -100, 2120, 1280); const n = Math.min(text.length, Math.floor(t * 22) + 1); g.save(); g.font = `700 92px "Caveat"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f4f1ea'; g.fillText(text.slice(0, n), 960, 480); g.restore(); if (n >= text.length) htxt(g, who, 960, 620, 60, '#ffd43b'); }

export function spacewalk(g, t) { moonSpace(g, t); capsule(g, 1000, 420, 1.1, t); const x = 700 + Math.sin(t * 0.6) * 20, y = 520 + Math.cos(t * 0.5) * 16; g.save(); g.beginPath(); g.moveTo(860, 430); g.bezierCurveTo(800, 520, 760, 400, x, y - 120); g.lineWidth = 5; g.strokeStyle = '#e9e4da'; g.stroke(); g.restore(); g.save(); g.translate(x, y); g.rotate(-0.4 + Math.sin(t * 0.4) * 0.1); fig(g, 0, 0, 0.42, { body: 'tee', coat: '#e9e4da', hair: 'helmet', seed: 80, pose: 'shrug', pack: '#d8d4ca', noShadow: true }, t); g.restore(); }
