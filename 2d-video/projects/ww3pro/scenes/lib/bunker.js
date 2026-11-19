// Детальные фоны для пилота «Петров»: ночь у бункера, зал дежурных, пульт, вставки крупно.
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt, scrib } from './pro.js';

const WALL = '#5b6863', FLOOR = '#2f3634';
// мигание тревоги 0..1
export const alarmK = (t, a0) => (t < a0 ? 0 : 0.5 + 0.5 * Math.sin((t - a0) * 7.5));

// ------------------------------------------------------------------ зал: стена (всё за персонажами)
export function room(g, t, o = {}) {
  const al = o.alarm ?? -1, ak = al >= 0 ? alarmK(t, al) : 0, on = al >= 0 && t >= al;
  // стена: бетонные панели
  g.fillStyle = vg(g, 0, 900, WALL, 0.22); g.fillRect(-400, -200, 2720, 1100);
  g.save(); g.strokeStyle = 'rgba(25,30,28,.35)'; g.lineWidth = 3; for (let y = 230; y < 900; y += 170) { g.beginPath(); g.moveTo(-400, y); g.lineTo(2320, y); g.stroke(); } for (let r = 0; r < 5; r++) for (let x = -400 + (r % 2) * 170; x < 2320; x += 340) { g.beginPath(); g.moveTo(x, 230 + r * 170); g.lineTo(x, 400 + r * 170); g.stroke(); } g.restore();
  const R = rng(5); g.save(); g.fillStyle = 'rgba(20,24,22,.18)'; for (let i = 0; i < 260; i++) { g.beginPath(); g.arc(-300 + R() * 2500, 120 + R() * 760, 1 + R() * 3, 0, 7); g.fill(); } g.restore();
  for (let i = 0; i < 14; i++) for (let r = 0; r < 4; r++) el(g, -330 + i * 170 + 12, 244 + r * 170, 4, 4, 'rgba(30,34,32,.5)', 0);
  // потолок, трубы, кабельный лоток
  g.fillStyle = vg(g, -200, 300, '#3a4441', 0.2); g.fillRect(-400, -200, 2720, 300);
  [[52, 34, '#8c9590'], [118, 24, '#a07a4a']].forEach(([y, r, c]) => { g.beginPath(); g.rect(-400, y - r, 2720, r * 2); const gr = g.createLinearGradient(0, y - r, 0, y + r); gr.addColorStop(0, shade(c, 0.25)); gr.addColorStop(0.45, c); gr.addColorStop(1, shade(c, -0.35)); fo(g, gr, 4); for (let x = -300; x < 2320; x += 420) bx(g, x, y - r - 6, 22, r * 2 + 12, '#555d59', 3, 3); });
  ln(g, [[-400, 168], [2320, 168]], 8, '#2a302e'); for (let x = -380; x < 2320; x += 60) ln(g, [[x, 162], [x + 20, 176]], 3, '#2a302e');
  g.save(); g.lineWidth = 6; ['#1f2422', '#7a2a24', '#2b3a6a', '#1f2422'].forEach((c, i) => { g.strokeStyle = c; g.beginPath(); g.moveTo(-400, 178 + i * 7); for (let x = -400; x < 2320; x += 120) g.quadraticCurveTo(x + 60, 192 + i * 7, x + 120, 178 + i * 7); g.stroke(); }); g.restore();
  // табло «СТАРТ»
  bx(g, 820, 220, 280, 92, '#2a1513', 8, 5, 0.1); g.save(); g.font = `900 64px "Nunito"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = on ? `rgba(255,${60 + ak * 40},50,${0.65 + ak * 0.35})` : '#4a2420'; g.fillText('СТАРТ', 960, 268); g.restore(); if (on) glow(g, 960, 266, 260, '255,60,40', 0.25 + ak * 0.35);
  // большой экран-карта
  bx(g, 360, 340, 1200, 400, '#3a403d', 10, 5, 0.1); rr(g, 384, 362, 1152, 356, 6); fo(g, '#0f2a26', 4);
  g.save(); rr(g, 384, 362, 1152, 356, 6); g.clip(); g.strokeStyle = 'rgba(90,200,160,.18)'; g.lineWidth = 2; for (let x = 400; x < 1540; x += 64) { g.beginPath(); g.moveTo(x, 362); g.lineTo(x, 720); g.stroke(); } for (let y = 380; y < 720; y += 48) { g.beginPath(); g.moveTo(384, y); g.lineTo(1536, y); g.stroke(); }
  g.strokeStyle = 'rgba(120,230,180,.55)'; g.lineWidth = 4; g.fillStyle = 'rgba(70,170,130,.18)';
  [[[470, 420], [560, 400], [640, 440], [660, 520], [610, 600], [560, 640], [520, 600], [480, 520]], [[900, 400], [1060, 380], [1260, 400], [1420, 430], [1480, 500], [1380, 560], [1200, 580], [1050, 560], [940, 520], [900, 460]], [[620, 640], [660, 690], [640, 715]]].forEach((p) => { g.beginPath(); g.moveTo(p[0][0], p[0][1]); p.slice(1).forEach((q) => g.lineTo(q[0], q[1])); g.closePath(); g.fill(); g.stroke(); });
  if (on) { for (let i = 0; i < 5; i++) { const k = clamp((t - al - 0.4 - i * 0.25) / 6); if (k <= 0) continue; const x0 = 560 + i * 14, y0 = 470 + i * 12, x1 = 1150 + i * 20, y1 = 470 - i * 6, mx = (x0 + x1) / 2, my = 360; g.strokeStyle = 'rgba(255,90,70,.9)'; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); for (let j = 0; j <= 20 * k; j++) { const u = j / 20, x = (1 - u) ** 2 * x0 + 2 * u * (1 - u) * mx + u * u * x1, y = (1 - u) ** 2 * y0 + 2 * u * (1 - u) * my + u * u * y1; j ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]); } }
  const R2 = rng(9); for (let i = 0; i < 18; i++) { const x = 420 + R2() * 1080, y = 390 + R2() * 300; el(g, x, y, 4, 4, ((t * 1.3 + i * 0.37) % 1) < 0.5 ? 'rgba(160,255,200,.9)' : 'rgba(160,255,200,.25)', 0); }
  g.restore(); glow(g, 960, 540, 620, '90,220,170', 0.08);
  // слева: гермодверь
  bx(g, 40, 330, 250, 520, '#6e7773', 14, 5, 0.18); bx(g, 64, 352, 202, 476, '#7d8682', 10, 4, 0.12); [380, 790].forEach((y) => bx(g, 250, y, 34, 30, '#4b524f', 4, 4));
  g.beginPath(); g.arc(165, 590, 62, 0, Math.PI * 2); g.lineWidth = 13; g.strokeStyle = OL; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#b8402f'; g.stroke(); for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.3; ln(g, [[165, 590], [165 + Math.cos(a) * 62, 590 + Math.sin(a) * 62]], 8); } el(g, 165, 590, 14, 14, '#9a9f9b', 4);
  bx(g, 92, 380, 146, 40, '#e8e2cf', 4, 3); htxt(g, 'ГЕРМОДВЕРЬ', 165, 401, 26, '#7a2a24');
  // огнетушитель
  bx(g, 304, 700, 40, 120, '#c23a2c', 16, 4, 0.2); bx(g, 312, 680, 24, 24, '#2a2a2a', 4, 3); ln(g, [[336, 690], [356, 720], [350, 790]], 6);
  // часы
  el(g, 1290, 270, 52, 52, '#f2eee3', 5); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ln(g, [[1290 + Math.cos(a) * 40, 270 + Math.sin(a) * 40], [1290 + Math.cos(a) * 46, 270 + Math.sin(a) * 46]], 3); }
  const hh = -Math.PI / 2 + 0.3 * 2 * Math.PI / 12 * 0 + 0.2, mm = -Math.PI / 2 + (t * 0.05 + 2.4), ss = -Math.PI / 2 + Math.floor(t) * Math.PI / 30;
  ln(g, [[1290, 270], [1290 + Math.cos(hh) * 24, 270 + Math.sin(hh) * 24]], 6); ln(g, [[1290, 270], [1290 + Math.cos(mm) * 36, 270 + Math.sin(mm) * 36]], 4); ln(g, [[1290, 270], [1290 + Math.cos(ss) * 40, 270 + Math.sin(ss) * 40]], 2, '#c23a2c');
  // справа: календарь и стойки ЭВМ
  calendarSmall(g, 1640, 330);
  for (let i = 0; i < 2; i++) { const x = 1760 + i * 210; bx(g, x, 300, 200, 560, '#8c938f', 6, 5, 0.18); bx(g, x + 20, 330, 160, 130, '#6f7672', 4, 4); [0, 1].forEach((j) => { el(g, x + 60 + j * 80, 395, 34, 34, '#3a3f3d', 4); g.save(); g.translate(x + 60 + j * 80, 395); g.rotate(t * (j ? -1.4 : 1.1)); for (let k = 0; k < 3; k++) { g.rotate(2.094); el(g, 18, 0, 7, 7, '#9aa09d', 2); } g.restore(); });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { const blinkOn = ((t * (0.7 + ((r * 7 + c * 3) % 5) * 0.2) + r * 0.3 + c * 0.17) % 1) < 0.5; el(g, x + 34 + c * 26, 500 + r * 30, 6, 6, blinkOn ? ['#ff5a3a', '#ffd04a', '#6dff9a'][(r + c) % 3] : '#3d3a34', 2); }
    bx(g, x + 20, 690, 160, 140, '#7a817d', 4, 4); for (let k = 0; k < 6; k++) ln(g, [[x + 34, 708 + k * 20], [x + 166, 708 + k * 20]], 3, '#555b58'); }
  // сигнальная лампа
  el(g, 1150, 196, 26, 20, on ? `rgb(${200 + ak * 55},40,30)` : '#6a2420', 4); bx(g, 1124, 210, 52, 12, '#3a3a3a', 3, 3); if (on) glow(g, 1150, 200, 120 + ak * 60, '255,40,30', 0.6);
  // пол
  g.fillStyle = vg(g, 860, 300, FLOOR, 0.2); g.fillRect(-400, 858, 2720, 400); ln(g, [[-400, 860], [2320, 860]], 5);
  g.save(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; for (let x = -800; x < 2800; x += 180) { g.beginPath(); g.moveTo(960 + (x - 960) * 0.55, 862); g.lineTo(x, 1260); g.stroke(); } for (let y = 900; y < 1260; y += 60 + (y - 900) * 0.4) { g.beginPath(); g.moveTo(-400, y); g.lineTo(2320, y); g.stroke(); } g.restore();
  // лампы под потолком
  [560, 1360].forEach((x) => { ln(g, [[x, 140], [x, 182]], 4); g.beginPath(); g.moveTo(x - 50, 222); g.lineTo(x - 22, 182); g.lineTo(x + 22, 182); g.lineTo(x + 50, 222); g.closePath(); fo(g, '#3d4a44'); el(g, x, 224, 30, 9, '#fff3c4', 3); });
}
export function lamps(g, t, o = {}) { [560, 1360].forEach((x) => { cone(g, x, 224, 90, 760, 760, '255,228,160', 0.16); glow(g, x, 226, 90, '255,240,190', 0.5); }); }
export function alarmWash(g, t, a0) { if (a0 == null || t < a0) return; const k = alarmK(t, a0); g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(255,${212 - k * 40},${200 - k * 40},1)`; g.fillRect(0, 0, E.W, E.H); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(140,10,0,${0.03 + k * 0.07})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }

export function calendarSmall(g, x, y) { bx(g, x - 62, y, 124, 150, '#f4efe2', 4, 4); bx(g, x - 62, y, 124, 34, '#c23a2c', 4, 4); htxt(g, 'СЕНТЯБРЬ', x, y + 18, 22, '#fff'); htxt(g, '26', x, y + 82, 70, OL); htxt(g, '1983', x, y + 132, 24, OL); el(g, x - 30, y - 4, 5, 5, '#888', 2); el(g, x + 30, y - 4, 5, 5, '#888', 2); }

// ------------------------------------------------------------------ пульт (перед персонажами)
export function desk(g, t, o = {}) {
  const al = o.alarm ?? -1, on = al >= 0 && t >= al, ak = on ? alarmK(t, al) : 0;
  // столешница
  pg(g, [[120, 770], [1800, 770], [1880, 850], [40, 850]], vg(g, 770, 80, '#a4ada8', 0.18)); bx(g, 40, 846, 1840, 300, '#6e7874', 6, 5, 0.25);
  for (let i = 0; i < 9; i++) { const x = 120 + i * 200; bx(g, x, 880, 160, 110, '#5d6763', 4, 4); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) el(g, x + 26 + c * 36, 912 + r * 40, 10, 10, (on && (r + c + i) % 4 === 0) ? (ak > 0.5 ? '#ff5040' : '#7a2a22') : ['#e6d27a', '#7ec27a', '#e0e0d6', '#d0605a'][(r + c + i) % 4], 3); }
  // тумблеры и кнопки на столе
  for (let i = 0; i < 26; i++) { const x = 200 + i * 58; if (x > 620 && x < 1320) continue; ln(g, [[x, 812], [x + 6, 794]], 5); el(g, x + 6, 792, 6, 6, '#d8d8d0', 3); }
  // мониторы
  crtSmall(g, 470, 610, t, on, ak); crtSmall(g, 1450, 610, t, on, ak, 2);
  // журнал, ручка
  g.save(); g.translate(760, 806); g.rotate(-0.05); bx(g, -110, -26, 220, 52, '#efe8d4', 3, 4); ln(g, [[0, -26], [0, 26]], 3); scrib(g, -96, -12, 80, 3, 11, '#5a5a6a', 2, 3); scrib(g, 12, -12, 80, 3, 11, '#5a5a6a', 2, 4); g.restore();
  // стакан в подстаканнике
  if (!o.noTea) { g.save(); g.translate(1060, 792); pg(g, [[-20, -58], [20, -58], [16, 6], [-16, 6]], 'rgba(190,110,55,.8)', 3); bx(g, -22, -18, 44, 30, '#b8a06a', 6, 3); for (let i = -12; i <= 12; i += 8) ln(g, [[i, -14], [i, 10]], 2, '#7c6634'); ln(g, [[22, -12], [36, -8], [34, 8], [20, 8]], 4); ln(g, [[6, -56], [14, -90]], 3, '#b0b0a8'); g.restore(); if (!on) for (let i = 0; i < 2; i++) { const k = (t * 0.4 + i * 0.5) % 1; g.save(); g.globalAlpha = 0.35 * (1 - k); ln(g, [[1060 + i * 8, 726 - k * 60], [1066 + i * 8 + Math.sin(t * 2 + i) * 8, 700 - k * 60]], 4, '#ffffff'); g.restore(); } }
  // телефон
  if (!o.noPhone) phone(g, 1250, 800, o.lifted);
}
export function phone(g, x, y, lifted) { g.save(); g.translate(x, y); pg(g, [[-70, -40], [70, -40], [90, 14], [-90, 14]], vg(g, -40, 54, '#e6ddc6', 0.2)); el(g, 0, -10, 34, 20, '#cfc5ad', 4); for (let i = 0; i < 10; i++) { const a = i * 0.55 + 0.6; el(g, Math.cos(a) * 22, -10 + Math.sin(a) * 12, 4, 3, '#8a826e', 2); }
  if (!lifted) { bx(g, -84, -66, 168, 30, '#e6ddc6', 14, 4); el(g, -76, -54, 22, 18, '#e6ddc6', 4); el(g, 76, -54, 22, 18, '#e6ddc6', 4); }
  g.beginPath(); g.moveTo(90, 0); g.bezierCurveTo(140, 20, 120, 60, 170, 50); g.lineWidth = 4; g.strokeStyle = OL; g.stroke(); g.restore(); }
function crtSmall(g, x, y, t, on, ak, seed = 1) { bx(g, x - 130, y - 110, 260, 200, '#b9b29c', 14, 5, 0.2); rr(g, x - 106, y - 90, 212, 150, 18); fo(g, on ? '#1a0806' : '#0b1f16', 4); g.save(); rr(g, x - 106, y - 90, 212, 150, 18); g.clip();
  if (on) { g.font = `900 ${34}px "Nunito"`; g.textAlign = 'center'; g.fillStyle = `rgba(255,80,60,${0.6 + ak * 0.4})`; g.fillText('СТАРТ', x, y - 6); } else scrib(g, x - 90, y - 70, 170, 6, 20, 'rgba(120,255,170,.75)', 3, seed);
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let yy = y - 90; yy < y + 60; yy += 6) g.fillRect(x - 110, yy, 220, 2); g.restore(); glow(g, x, y - 16, 160, on ? '255,70,50' : '90,255,160', on ? 0.25 + ak * 0.2 : 0.14);
  bx(g, x - 60, y + 90, 120, 30, '#8f8874', 4, 4); el(g, x + 90, y + 70, 9, 9, '#3a3a3a', 3); }
// кресло (за персонажем)
export function chair(g, x, y) { bx(g, x - 95, y - 330, 190, 250, '#4a3a33', 30, 5, 0.25); bx(g, x - 110, y - 110, 220, 46, '#3c2f29', 14, 5); }

// ------------------------------------------------------------------ экстерьер: ночь, снег, вход в бункер
export function night(g, t) {
  const sk = g.createLinearGradient(0, -200, 0, 900); sk.addColorStop(0, '#0b1230'); sk.addColorStop(0.6, '#1d2c55'); sk.addColorStop(1, '#3a4a72'); g.fillStyle = sk; g.fillRect(-400, -300, 2720, 1400);
  const R = rng(3); for (let i = 0; i < 160; i++) { const x = -300 + R() * 2500, y = -200 + R() * 620, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); el(g, x, y, 1.6 + R() * 1.6, 1.6 + R() * 1.6, `rgba(255,255,240,${0.35 + tw * 0.5})`, 0); }
  el(g, 1640, 140, 64, 64, '#f4f0dc', 0); el(g, 1622, 128, 12, 12, 'rgba(0,0,0,.08)', 0); el(g, 1660, 160, 9, 9, 'rgba(0,0,0,.08)', 0); glow(g, 1640, 140, 260, '230,230,255', 0.25);
  // дальние холмы и лес
  g.fillStyle = '#26345a'; g.beginPath(); g.moveTo(-400, 640); for (let x = -400; x <= 2320; x += 80) g.lineTo(x, 600 - Math.sin(x * 0.004) * 50 - Math.sin(x * 0.011) * 18); g.lineTo(2320, 1200); g.lineTo(-400, 1200); g.fill();
  const R2 = rng(7); for (let i = 0; i < 46; i++) { const x = -360 + i * 60 + R2() * 30, y = 610 - Math.sin(x * 0.004) * 50 + R2() * 20, h = 70 + R2() * 60; pg(g, [[x, y - h], [x + h * 0.32, y], [x - h * 0.32, y]], '#16213e', 0); }
  // радар и мачта
  ln(g, [[1480, 640], [1480, 330]], 10, '#1a2238'); for (let y = 360; y < 640; y += 40) ln(g, [[1462, y], [1498, y + 30]], 4, '#1a2238'); g.save(); g.translate(1480, 320); g.rotate(-0.4 + Math.sin(t * 0.6) * 0.25); g.beginPath(); g.ellipse(0, 0, 110, 34, 0, 0, Math.PI); fo(g, '#3a4466', 5); ln(g, [[0, 0], [0, -50]], 6); g.restore(); el(g, 1480, 310, 8, 8, ((t * 1.2) % 1) < 0.5 ? '#ff4a3a' : '#5a1a14', 0); if (((t * 1.2) % 1) < 0.5) glow(g, 1480, 310, 60, '255,60,40', 0.5);
  // холм-бункер
  g.beginPath(); g.moveTo(300, 900); g.bezierCurveTo(420, 560, 1500, 540, 1640, 900); g.closePath(); fo(g, vg(g, 560, 340, '#e8eef8', 0.12)); g.save(); g.clip(); g.fillStyle = 'rgba(120,140,190,.25)'; g.beginPath(); g.ellipse(1300, 820, 420, 200, 0, 0, Math.PI * 2); g.fill(); g.restore();
  // портал
  pg(g, [[760, 900], [770, 640], [1150, 640], [1160, 900]], vg(g, 640, 260, '#8d949a', 0.2)); bx(g, 740, 616, 440, 48, '#a2a8ad', 4, 5); pg(g, [[740, 616], [1180, 616], [1160, 596], [760, 596]], '#f2f5fb', 4);
  bx(g, 830, 680, 260, 220, '#5b6268', 6, 5, 0.2); ln(g, [[960, 680], [960, 900]], 4); g.beginPath(); g.arc(960, 790, 40, 0, Math.PI * 2); g.lineWidth = 10; g.strokeStyle = OL; g.stroke(); g.lineWidth = 5; g.strokeStyle = '#b8402f'; g.stroke();
  bx(g, 870, 652, 180, 26, '#e8e2cf', 3, 3); htxt(g, 'СЕРПУХОВ-15', 960, 665, 22, '#7a2a24');
  el(g, 960, 630, 16, 10, '#fff4c8', 3); cone(g, 960, 636, 30, 380, 280, '255,230,160', 0.25); glow(g, 960, 632, 90, '255,240,190', 0.6);
  // забор
  for (let x = -380; x < 2320; x += 120) { if (x > 700 && x < 1220) continue; ln(g, [[x, 880], [x, 760]], 7, '#2a3046'); } ln(g, [[-380, 780], [690, 780]], 3, '#2a3046'); ln(g, [[1230, 780], [2320, 780]], 3, '#2a3046'); ln(g, [[-380, 820], [690, 820]], 3, '#2a3046'); ln(g, [[1230, 820], [2320, 820]], 3, '#2a3046');
  // снег на земле
  g.fillStyle = vg(g, 860, 300, '#dfe6f4', 0.1); g.beginPath(); g.moveTo(-400, 880); for (let x = -400; x <= 2320; x += 60) g.lineTo(x, 880 + Math.sin(x * 0.01) * 10); g.lineTo(2320, 1300); g.lineTo(-400, 1300); g.fill(); ln(g, [[-400, 882], [2320, 882]], 4, 'rgba(40,50,80,.4)');
  // ёлки на переднем плане
  [[160, 1000, 320], [1800, 1010, 360], [-60, 1020, 260]].forEach(([x, y, h]) => { ln(g, [[x, y], [x, y - 40]], 18, '#2a1e18'); for (let k = 0; k < 3; k++) { const yy = y - 40 - k * h * 0.26, w = h * (0.42 - k * 0.1); pg(g, [[x, yy - h * 0.42], [x + w, yy], [x - w, yy]], '#1c3a34', 5); g.beginPath(); g.moveTo(x - w * 0.7, yy - 6); g.quadraticCurveTo(x, yy - h * 0.18, x + w * 0.7, yy - 6); g.lineWidth = 9; g.strokeStyle = '#eef3fb'; g.stroke(); } });
}
export function snow(g, t, n = 140, seed = 2) { const R = rng(seed); g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); for (let i = 0; i < n; i++) { const x0 = R() * 2100 - 90, sp = 40 + R() * 70, r = 1.5 + R() * 3.5, y = ((R() * 1100 + t * sp) % 1160) - 40, x = x0 + Math.sin(t * 0.8 + i) * 20; el(g, x, y, r, r, `rgba(255,255,255,${0.5 + R() * 0.4})`, 0); } g.restore(); }

// ------------------------------------------------------------------ вставки
export function crtBig(g, t, n, o = {}) {
  g.fillStyle = '#2b2622'; g.fillRect(-100, -100, 2120, 1280); blob(g, 960, 1000, 900, 200, 0.4);
  bx(g, 330, 70, 1260, 900, '#c3bba2', 50, 7, 0.2); for (let i = 0; i < 9; i++) ln(g, [[420 + i * 24, 920], [432 + i * 24, 940]], 5, '#8f8874');
  rr(g, 420, 140, 1080, 700, 70); fo(g, '#170504', 7); g.save(); rr(g, 420, 140, 1080, 700, 70); g.clip();
  const lines = n; g.font = `900 120px "Nunito"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) { const t0 = lines[i]; if (t < t0) continue; const fl = ((t - t0) * 3) % 1 < 0.8 ? 1 : 0.45; g.fillStyle = `rgba(255,${70 + i * 10},55,${fl})`; g.shadowColor = 'rgba(255,60,40,.9)'; g.shadowBlur = 30; g.fillText('СТАРТ', 960, 300 + i * 190); }
  g.shadowBlur = 0; g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 140; y < 840; y += 7) g.fillRect(420, y, 1080, 3);
  const rg = g.createRadialGradient(960, 490, 200, 960, 490, 700); rg.addColorStop(0, 'rgba(255,255,255,.06)'); rg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = rg; g.fillRect(420, 140, 1080, 700);
  g.restore(); g.save(); g.globalAlpha = 0.15; g.beginPath(); g.ellipse(700, 260, 220, 70, -0.3, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.restore();
}
export function calendarBig(g, t, a0) {
  g.fillStyle = vg(g, 0, 1080, WALL, 0.22); g.fillRect(-100, -100, 2120, 1280); g.save(); g.strokeStyle = 'rgba(25,30,28,.35)'; g.lineWidth = 4; [300, 820].forEach((y) => { g.beginPath(); g.moveTo(-100, y); g.lineTo(2020, y); g.stroke(); }); g.restore();
  blob(g, 990, 560, 520, 420, 0.35); ln(g, [[960, 90], [960, 140]], 5); el(g, 960, 86, 12, 12, '#999', 4);
  bx(g, 620, 140, 680, 820, '#f6f1e4', 10, 7, 0.08); bx(g, 620, 140, 680, 170, '#c23a2c', 10, 7, 0.1); htxt(g, 'СЕНТЯБРЬ', 960, 228, 96, '#fff');
  htxt(g, '26', 960, 560, 380, OL); htxt(g, '1983', 960, 820, 110, OL); htxt(g, 'понедельник', 960, 900, 54, '#7a6a5a');
  g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 3; i++) ln(g, [[630 + i * 4, 950 + i * 6], [1290 - i * 4, 950 + i * 6]], 3, '#c8c0aa'); g.restore();
}
export function radar(g, t, a0, info) {
  g.fillStyle = '#0a1210'; g.fillRect(-100, -100, 2120, 1280); bx(g, 120, 40, 1680, 1000, '#3a403d', 30, 7, 0.12); rr(g, 170, 90, 1580, 900, 20); fo(g, '#0d2420', 5);
  g.save(); rr(g, 170, 90, 1580, 900, 20); g.clip();
  g.strokeStyle = 'rgba(90,220,170,.2)'; g.lineWidth = 2; for (let r = 120; r < 900; r += 120) { g.beginPath(); g.arc(960, 540, r, 0, Math.PI * 2); g.stroke(); } for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(960, 540); g.lineTo(960 + Math.cos(a * 0.5236) * 900, 540 + Math.sin(a * 0.5236) * 900); g.stroke(); }
  // материки (вид на полюс)
  g.lineWidth = 5; g.strokeStyle = 'rgba(120,240,180,.75)'; g.fillStyle = 'rgba(70,170,130,.22)';
  const shape = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke(); };
  shape([[260, 860], [340, 620], [480, 520], [640, 560], [720, 700], [660, 840], [520, 960], [300, 990]]); // США
  shape([[1060, 260], [1280, 180], [1560, 200], [1720, 320], [1700, 520], [1520, 600], [1300, 560], [1120, 480], [1020, 380]]); // СССР
  htxt(g, 'США', 520, 780, 70, 'rgba(160,255,200,.9)'); htxt(g, 'СССР', 1390, 390, 80, 'rgba(160,255,200,.9)');
  // развёртка
  const sw = t * 1.4; g.save(); g.translate(960, 540); g.rotate(sw); const gr = g.createLinearGradient(0, 0, 900, 0); gr.addColorStop(0, 'rgba(120,255,190,.35)'); gr.addColorStop(1, 'rgba(120,255,190,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1000, -0.35, 0); g.closePath(); g.fill(); g.restore();
  // 5 ракет
  for (let i = 0; i < 5; i++) { const t0 = (a0[i] ?? 0); if (t < t0) continue; const k = clamp((t - t0) / 3.2), x0 = 340 + i * 90, y0 = 900 - i * 80, x1 = 1120 + i * 120, y1 = 470 - i * 55, mx = 640 + i * 110, my = 300 - i * 30;
    g.strokeStyle = 'rgba(255,90,70,.95)'; g.lineWidth = 6; g.setLineDash([16, 12]); g.beginPath(); let px, py; for (let j = 0; j <= 30; j++) { const u = j / 30 * k; px = (1 - u) ** 2 * x0 + 2 * u * (1 - u) * mx + u * u * x1; py = (1 - u) ** 2 * y0 + 2 * u * (1 - u) * my + u * u * y1; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.setLineDash([]);
    el(g, px, py, 12, 12, '#ff5a3a', 3); glow(g, px, py, 50, '255,70,50', 0.7); htxt(g, String(i + 1), px + 24, py - 30, 44, '#ffb0a0'); }
  g.restore(); glow(g, 960, 540, 900, '90,220,170', 0.06);
}
export function phoneClose(g, t, o = {}) {
  g.fillStyle = vg(g, 300, 800, '#9aa39e', 0.2); g.fillRect(-100, -100, 2120, 1280); for (let i = 0; i < 8; i++) ln(g, [[-100, 300 + i * 110], [2020, 300 + i * 110]], 2, 'rgba(0,0,0,.08)');
  g.fillStyle = '#5d6763'; g.fillRect(-100, -100, 2120, 300); ln(g, [[-100, 200], [2020, 200]], 6);
  for (let i = 0; i < 8; i++) { ln(g, [[160 + i * 70, 160], [168 + i * 70, 120]], 8); el(g, 168 + i * 70, 116, 11, 11, '#e0e0d8', 4); }
  g.save(); g.translate(960, 640); g.scale(2.6, 2.6); phone(g, 0, 0, false); g.restore();
  blob(g, 960, 760, 560, 90, 0.3);
}
export function space(g, t) {
  g.fillStyle = '#04060f'; g.fillRect(-100, -100, 2120, 1280); const R = rng(11); for (let i = 0; i < 220; i++) el(g, R() * 1920, R() * 1080, 1 + R() * 1.8, 1 + R() * 1.8, `rgba(255,255,255,${0.3 + R() * 0.6})`, 0);
  // Земля
  g.save(); g.beginPath(); g.arc(760, 2150, 1500, 0, Math.PI * 2); const eg = g.createRadialGradient(760, 2150, 1300, 760, 2150, 1520); eg.addColorStop(0, '#2b5fa8'); eg.addColorStop(1, '#5aa0e0'); g.fillStyle = eg; g.fill(); g.clip();
  g.fillStyle = '#4f8a4a'; g.beginPath(); g.ellipse(300, 900, 420, 160, -0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(1200, 860, 300, 110, 0.15, 0, Math.PI * 2); g.fill();
  const R2 = rng(4); for (let i = 0; i < 26; i++) { const x = -100 + R2() * 1800 + t * 6, y = 700 + R2() * 340; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(x, y, 60 + R2() * 90, 18 + R2() * 20, 0, 0, Math.PI * 2); g.fill(); }
  g.restore(); g.save(); g.beginPath(); g.arc(760, 2150, 1500, 0, Math.PI * 2); g.lineWidth = 26; g.strokeStyle = 'rgba(120,190,255,.35)'; g.stroke(); g.restore();
  // солнце
  glow(g, 1780, 120, 380, '255,240,190', 0.9); el(g, 1780, 120, 70, 70, '#fffbe8', 0);
}
export function satellite(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 0.5) * 0.05); [-1, 1].forEach((d) => { bx(g, d > 0 ? 70 : -250, -50, 180, 100, '#2b4a8a', 4, 5); for (let i = 1; i < 4; i++) ln(g, [[(d > 0 ? 70 : -250) + i * 45, -50], [(d > 0 ? 70 : -250) + i * 45, 50]], 3, '#6a8ad0'); ln(g, [[d * 70, 0], [d * 40, 0]], 8); }); bx(g, -50, -80, 100, 160, '#d8c070', 10, 5, 0.25); el(g, 0, 92, 34, 18, '#9aa0a6', 4); g.restore(); }
