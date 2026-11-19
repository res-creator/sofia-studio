// Фоны главы «25 лет. Зеркало под тканью» и «40 лет. Тихий голос» (версия с движением):
// офисы НКО и ООН, салон изнутри, улица салонов со ставнями, «биржа» у стены, карта Афганистана с кругом 72 км,
// остановка с маршруткой, парк, спортзал, баня, закон-документ, улица с прохожими, схема окна, дверь, календарь.
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt, scrib, fig } from './pro.js';
import { mountains, room } from './afg.js';
import { worldMap, mapProj, pin } from '/projects/remote/scenes/lib/sets.js';
import { dust, passers, flicker } from './motion.js';

const sky = (g, a, b, y1 = 700) => { const s = g.createLinearGradient(0, -300, 0, y1); s.addColorStop(0, a); s.addColorStop(1, b); g.fillStyle = s; g.fillRect(-400, -400, 2720, 1900); };
const ground = (g, y, c = '#cfc0a0') => { g.fillStyle = vg(g, y, 600, c, 0.15); g.fillRect(-400, y, 2720, 900); ln(g, [[-400, y], [2320, y]], 5); };
// бегущие облака
export function clouds(g, t, y = 160, n = 4) { const R = rng(9); for (let i = 0; i < n; i++) { const x = ((R() * 2400 + t * (14 + R() * 10)) % 2600) - 340, yy = y + R() * 120; g.save(); g.globalAlpha = 0.85; [[0, 0, 70], [60, -20, 60], [120, 0, 66], [60, 16, 70]].forEach(([dx, dy, r]) => el(g, x + dx, yy + dy, r, r * 0.6, '#ffffff', 0)); g.restore(); } }
const PASS = [[{ hair: 'none', scarf: '#3a4a7a', body: 'dress', coat: '#3a4a7a', skin: '#e2b48a' }, 100, 60, 0], [{ hair: 'side', hairC: '#2a2320', body: 'perahan', coat: '#d8d4c4', vest: '#4a4a3a', skin: '#e2b48a', beard: true }, 1300, -48, 2], [{ hair: 'none', scarf: '#6a3a2a', body: 'dress', coat: '#6a3a2a', skin: '#c98d62' }, 700, 38, 1]];

// ---------------------------------------------------------------- здание с флагом (НКО: сердце; ООН: голубой флаг)
export function office(g, t, o = {}) {
  sky(g, '#9fcbe6', '#e6f2f8'); clouds(g, t, 90, 3); mountains(g, 470); ground(g, 700, '#cfc0a0');
  bx(g, 380, 260, 1160, 440, o.wall || '#ece4d4', 6, 6, 0.08); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { if (c === 2 && r === 1) continue; bx(g, 440 + c * 216, 300 + r * 190, 150, 140, '#7aa8c8', 4, 4); ln(g, [[515 + c * 216, 300 + r * 190], [515 + c * 216, 440 + r * 190]], 4, '#ece4d4'); }
  bx(g, 862, 500, 196, 200, '#5a4a3a', 6, 5); el(g, 1030, 600, 7, 7, '#e0b33a', 2); bx(g, 820, 200, 280, 60, '#f6f1e4', 6, 4);
  // флаг на флагштоке, полощется
  const fc = o.flag || '#ffffff'; ln(g, [[1640, 700], [1640, 180]], 10, '#8a8a8a'); g.save(); g.translate(1640, 190); g.beginPath(); g.moveTo(0, 0); for (let k = 0; k <= 10; k++) g.lineTo(k * 22, Math.sin(t * 4 - k * 0.6) * 10 * (k / 10)); for (let k = 10; k >= 0; k--) g.lineTo(k * 22, 130 + Math.sin(t * 4 - k * 0.6) * 10 * (k / 10)); g.closePath(); fo(g, fc, 4);
  if (o.sym === 'heart') { g.save(); g.translate(110, 65 + Math.sin(t * 4 - 3) * 5); g.scale(1.4, 1.4); g.beginPath(); g.moveTo(0, 22); g.bezierCurveTo(-34, -2, -16, -28, 0, -10); g.bezierCurveTo(16, -28, 34, -2, 0, 22); fo(g, '#e2483a', 3); g.restore(); }
  if (o.sym === 'circle') { g.beginPath(); g.arc(110, 65 + Math.sin(t * 4 - 3) * 5, 36, 0, Math.PI * 2); g.lineWidth = 7; g.strokeStyle = '#ffffff'; g.stroke(); ln(g, [[74, 65], [146, 65]], 4, '#ffffff'); ln(g, [[110, 29], [110, 101]], 4, '#ffffff'); }
  g.restore();
  if (o.boxes) for (let k = 0; k < 4; k++) bx(g, 300 + (k % 2) * 110, 600 - Math.floor(k / 2) * 90, 100, 90, '#c8a46a', 4, 4);
}
// пункт помощи: палатка, грузовик, коробки
export function aid(g, t) { sky(g, '#9fcbe6', '#e6f2f8'); clouds(g, t, 80, 3); mountains(g, 460); ground(g, 680, '#d8c8a0');
  pg(g, [[300, 680], [620, 360], [940, 680]], vg(g, 360, 320, '#f4f4ee', 0.15), 6); pg(g, [[560, 680], [620, 470], [680, 680]], '#3a4a5a', 4); ln(g, [[620, 360], [620, 300]], 6); pg(g, [[620, 300], [700, 320], [620, 340]], '#3a8ae0', 3);
  bx(g, 1060, 470, 520, 210, '#e9e4da', 8, 6); bx(g, 1580, 520, 200, 160, '#3a8ae0', 12, 6); bx(g, 1620, 540, 110, 70, '#bfe0ee', 6, 4); el(g, 1160, 690, 48, 48, '#2a2a2a', 6); el(g, 1660, 690, 48, 48, '#2a2a2a', 6);
  for (let k = 0; k < 6; k++) { const x = 1110 + (k % 3) * 150, y = 560 - Math.floor(k / 3) * 90; bx(g, x, y, 130, 86, '#c8a46a', 4, 4); ln(g, [[x + 65, y], [x + 65, y + 86]], 4, '#a07a40'); }
}
// бейдж-пропуск
export function badge(g, x, y, s = 1, col = '#3a8ae0') { g.save(); g.translate(x, y); g.scale(s, s); ln(g, [[0, -170], [0, -110]], 8, col); bx(g, -110, -110, 220, 280, '#f6f1e4', 18, 6); bx(g, -110, -110, 220, 60, col, 18, 6); el(g, 0, 10, 46, 50, '#e2b48a', 4); g.beginPath(); g.ellipse(0, 4, 54, 58, 0, Math.PI * 1.05, Math.PI * 1.95); g.lineWidth = 16; g.strokeStyle = '#3a4a7a'; g.stroke(); ln(g, [[-60, 100], [60, 100]], 6, '#8a8aa0'); ln(g, [[-60, 130], [30, 130]], 6, '#8a8aa0'); g.restore(); }

// ---------------------------------------------------------------- салон изнутри: зеркала, кресло, полки, тёплый свет
export function salonIn(g, t, o = {}) {
  g.fillStyle = vg(g, -300, 1100, '#f2d6d6', 0.15); g.fillRect(-400, -300, 2720, 1300); for (let x = -380; x < 2320; x += 120) ln(g, [[x, -300], [x, 640]], 2, 'rgba(160,90,110,.12)');
  for (const x of [300, 860, 1420]) { bx(g, x, 150, 300, 380, '#c8a23a', 40, 6); rr(g, x + 22, 172, 256, 336, 30); fo(g, vg(g, 172, 336, '#cfe8f2', 0.2), 4); g.save(); g.globalAlpha = 0.45; ln(g, [[x + 60, 300], [x + 160, 200]], 12, '#fff'); g.restore(); bx(g, x - 20, 540, 340, 30, '#f6f1e4', 6, 4); for (let k = 0; k < 3; k++) bx(g, x + 20 + k * 50, 500, 30, 44, ['#e2483a', '#3a8ae0', '#7ab07a'][k], 8, 3); }
  ln(g, [[-400, 640], [2320, 640]], 5); g.fillStyle = vg(g, 640, 500, '#d8c0b0', 0.12); g.fillRect(-400, 640, 2720, 600); for (let x = -400; x < 2320; x += 120) for (let y = 640; y < 1100; y += 120) { g.save(); g.globalAlpha = (((x + y) / 120) & 1) ? 0.12 : 0; g.fillStyle = '#5a3a3a'; g.fillRect(x, y, 120, 120); g.restore(); }
  for (const x of [200, 800, 1400]) glow(g, x + 250, 60, 260, '255,230,180', 0.4 * flicker(t, x)); dust(g, t, 0, 0, 1920, 700, 30, 5);
}
// кресло с клиенткой (накидка, длинные волосы; волосы «колышутся» от фена)
export function client(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); bx(g, -110, -260, 220, 50, '#5a3a3a', 14, 5); bx(g, -90, -210, 30, 210, '#7a7a7a', 4, 4); bx(g, 60, -210, 30, 210, '#7a7a7a', 4, 4); el(g, 0, -10, 130, 22, '#5a5a5a', 4); g.restore();
  fig(g, x, y - 210 * s, s, { hair: 'long', hairC: o.hairC || '#3a2418', body: 'dress', coat: '#f4f4ee', shirt: '#f4f4ee', skin: o.skin || '#e2b48a', seated: true, noShadow: true, expr: o.expr || 'smile', seed: 81, look: o.look ?? 0, eyesShut: o.shut, ...o.f }, t);
  if (o.wind) { g.save(); g.translate(x, y - 210 * s); g.scale(s, s); for (let k = 0; k < 7; k++) { const ph = t * 14 + k; ln(g, [[-110 + k * 6, -520 + k * 22], [-160 - Math.sin(ph) * 30 * o.wind, -500 + k * 24 + Math.cos(ph) * 10]], 9, o.hairC || '#3a2418'); } g.restore(); }
}
// ---------------------------------------------------------------- улица салонов: ставни падают по одной (shut: [k0,k1,k2] 0..1)
export function salonRow(g, t, o = {}) {
  sky(g, '#9fcbe6', '#e6f2f8'); clouds(g, t, 70, 3); mountains(g, 420); ground(g, 690, '#bfb4a4'); const sh = o.shut || [0, 0, 0];
  [[60, '#e8a8c0'], [700, '#f2c037'], [1340, '#a8d0e8']].forEach(([x, sc], k) => {
    bx(g, x, 250, 520, 440, k === 1 ? '#e8d8c8' : '#dccab4', 4, 6); bx(g, x + 30, 270, 460, 80, sc, 6, 5); g.save(); g.globalAlpha = 0.6; scrib(g, x + 60, 310, 400, 1, 10, '#ffffff', 10, k + 2); g.restore();
    rr(g, x + 40, 380, 440, 310, 4); fo(g, vg(g, 380, 310, '#f6e2c8', 0.1), 5); g.save(); rr(g, x + 40, 380, 440, 310, 4); g.clip(); glow(g, x + 260, 480, 220, '255,220,160', 0.5); bx(g, x + 120, 420, 120, 150, '#c8a23a', 20, 4); rr(g, x + 132, 432, 96, 126, 16); fo(g, '#cfe8f2', 3);
    const kk = clamp(sh[k]); if (kk > 0) { g.fillStyle = '#6a6a6a'; g.fillRect(x + 40, 380, 440, 310 * kk); for (let j = 0; j < 15; j++) { const yy = 380 + j * 21; if (yy < 380 + 310 * kk) ln(g, [[x + 40, yy], [x + 480, yy]], 3, '#4a4a4a'); } ln(g, [[x + 40, 380 + 310 * kk], [x + 480, 380 + 310 * kk]], 8, OL); bx(g, x + 230, 380 + 310 * kk - 36, 60, 30, '#c8a23a', 8, 3); }
    g.restore(); rr(g, x + 40, 380, 440, 310, 4); fo(g, null, 5); bx(g, x + 20, 360, 480, 26, '#9a9a9a', 4, 4);
  });
}
// ---------------------------------------------------------------- стена-«биржа»: мужчины ждут работу с инструментами
export function laborWall(g, t) { sky(g, '#c8d8e6', '#eef2f6'); mountains(g, 420); ground(g, 760, '#c8b89a');
  bx(g, -400, 360, 2720, 400, '#d8c4a4', 0, 6, 0.1); for (let x = -380; x < 2320; x += 180) ln(g, [[x, 360], [x, 760]], 3, 'rgba(90,60,30,.12)'); for (let y = 420; y < 760; y += 70) ln(g, [[-400, y], [2320, y]], 2, 'rgba(90,60,30,.1)'); dust(g, t, 0, 600, 1920, 300, 20, 8); }
export const shovel = (g, x, y) => { ln(g, [[x, y + 60], [x + 10, y - 260]], 10, OL); ln(g, [[x, y + 60], [x + 10, y - 260]], 5, '#b8864a'); pg(g, [[x - 26, y + 40], [x + 26, y + 40], [x + 20, y + 120], [x, y + 140], [x - 20, y + 120]], '#9a9aa0', 4); };
// ---------------------------------------------------------------- карта Афганистана: Кабул, круг 72 км (k 0..1)
export const AFG_VIEW = [58.5, 28.6, 76.5, 39.4];
export function afgMap(g, t, o = {}) {
  worldMap(g, t, { view: AFG_VIEW, hl: { AFG: '#e9c98a' }, labels: o.labels ?? [['ПАКИСТАН', 71.0, 29.6, 52], ['ИРАН', 60.2, 33.2, 52], ['ТАДЖИКИСТАН', 71.6, 38.6, 46]] });
  const P = mapProj(AFG_VIEW), [kx, ky] = P(69.17, 34.53), [x2] = P(70.17, 34.53), [, y2] = P(69.17, 35.53), pxLon = Math.abs(x2 - kx), pxLat = Math.abs(y2 - ky);
  if (o.k > 0) { const rx = pxLon * 72 / 91.7 * o.k, ry = pxLat * 72 / 111 * o.k; g.save(); g.beginPath(); g.ellipse(kx, ky, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(226,72,58,.22)'; g.fill(); g.setLineDash([18, 12]); g.lineDashOffset = -t * 40; g.lineWidth = 7; g.strokeStyle = '#e2483a'; g.stroke(); g.restore(); if (o.k >= 1) { ln(g, [[kx, ky], [kx + rx * 0.98, ky]], 6, '#e2483a'); } }
  if (o.pinAt != null) pin(g, kx, ky, t, o.pinAt, o.pinLabel ?? 'Кабул', { size: 60, ring: true });
  return [kx, ky, pxLon * 72 / 91.7, pxLat * 72 / 111];
}
// ---------------------------------------------------------------- остановка: маршрутка (driver: фигура водителя в окне)
export function busStop(g, t, o = {}) { sky(g, '#9fcbe6', '#e6f2f8'); clouds(g, t, 80, 3); mountains(g, 430); ground(g, 760, '#c8bca8'); g.fillStyle = '#6a6a72'; g.fillRect(-400, 860, 2720, 300); for (let x = -400; x < 2320; x += 200) bx(g, x + ((t * 0) % 200), 950, 110, 14, '#f4efe2', 2, 0);
  bx(g, 1700, 420, 30, 360, '#7a7a7a', 4, 4); el(g, 1715, 420, 60, 60, '#3a8ae0', 5); htxt(g, 'A', 1715, 420, 64, '#fff');
  const bxx = o.busX ?? 760; g.save(); g.translate(bxx, 0); bx(g, -160, 470, 900, 380, '#f2f2ec', 40, 7); bx(g, -160, 700, 900, 40, '#3a8ae0', 0, 5); for (let k = 0; k < 4; k++) { rr(g, -100 + k * 190, 510, 160, 150, 12); fo(g, '#bfe0ee', 5); } bx(g, 600, 510, 120, 290, '#d8d8d0', 10, 5); el(g, 0, 860, 66, 66, '#2a2a2a', 7); el(g, 0, 860, 26, 26, '#9a9a9a', 4); el(g, 580, 860, 66, 66, '#2a2a2a', 7); el(g, 580, 860, 26, 26, '#9a9a9a', 4);
  if (o.driver) { g.save(); rr(g, 470, 510, 160, 150, 12); g.clip(); fig(g, 550, 900, 0.55, o.driver, t); g.restore(); rr(g, 470, 510, 160, 150, 12); fo(g, null, 5); } g.restore(); }
// ---------------------------------------------------------------- парк (качели качаются), спортзал, баня с паром
export function park(g, t) { sky(g, '#8fc6ea', '#e8f2f8'); clouds(g, t, 90, 3); ground(g, 700, '#7ab06a'); for (const [x, r] of [[200, 160], [1700, 190], [1450, 130]]) { ln(g, [[x, 700], [x, 480]], 26, '#6a4a2a'); el(g, x, 420, r, r * 0.8, '#5a9a4a', 5); el(g, x - r * 0.4, 380, r * 0.6, r * 0.5, '#6aaa5a', 0); }
  ln(g, [[640, 760], [760, 300], [1160, 300], [1280, 760]], 14, '#c8453a'); const a = Math.sin(t * 2.6) * 0.5; g.save(); g.translate(960, 300); g.rotate(a); ln(g, [[-60, 0], [-60, 330]], 5, OL); ln(g, [[60, 0], [60, 330]], 5, OL); bx(g, -80, 320, 160, 26, '#e0b33a', 4, 4); g.restore(); bx(g, 380, 640, 200, 30, '#b8864a', 4, 4); }
export function gym(g, t) { g.fillStyle = vg(g, -300, 1100, '#d8dce4', 0.15); g.fillRect(-400, -300, 2720, 1300); ground(g, 720, '#8a8f98'); bx(g, 300, 160, 1320, 300, '#bfe0ee', 6, 6); for (let k = 1; k < 4; k++) ln(g, [[300 + k * 330, 160], [300 + k * 330, 460]], 6, OL);
  bx(g, 260, 560, 600, 30, '#5a5a5a', 4, 4); for (let k = 0; k < 4; k++) { const x = 320 + k * 140; ln(g, [[x - 40, 540], [x + 40, 540]], 10, '#3a3a3a'); el(g, x - 44, 540, 18, 26, '#2a2a2a', 3); el(g, x + 44, 540, 18, 26, '#2a2a2a', 3); }
  const y = 520 - Math.abs(Math.sin(t * 2.2)) * 120; bx(g, 1060, 620, 520, 40, '#3a3a3a', 6, 5); ln(g, [[1100, y], [1540, y]], 12, '#9a9aa0'); for (const x of [1120, 1520]) { bx(g, x - 20, y - 70, 40, 140, '#2a2a2a', 6, 4); } ln(g, [[1180, 640], [1180, 720]], 10); ln(g, [[1480, 640], [1480, 720]], 10); }
export function baths(g, t) { sky(g, '#f2d8b0', '#f8ecd8'); ground(g, 720, '#d8c4a0'); bx(g, 360, 420, 1200, 300, '#e6d2b0', 6, 6, 0.1);
  for (const [x, r] of [[620, 170], [960, 230], [1300, 170]]) { g.beginPath(); g.arc(x, 420, r, Math.PI, 0); g.closePath(); fo(g, vg(g, 420 - r, r, '#d8c8b8', 0.15), 6); el(g, x, 420 - r - 14, 14, 14, '#c8a23a', 4); }
  g.beginPath(); g.moveTo(880, 720); g.lineTo(880, 560); g.arc(960, 560, 80, Math.PI, 0); g.lineTo(1040, 720); g.closePath(); fo(g, '#5a4a3a', 5);
  for (let k = 0; k < 8; k++) { const u = (t * 0.4 + k / 8) % 1, x = 760 + (k % 4) * 140 + Math.sin(t + k) * 20, y = 200 - u * 200; g.save(); g.globalAlpha = 0.6 * Math.sin(u * Math.PI); el(g, x, y, 40 + u * 50, 30 + u * 30, '#ffffff', 0); g.restore(); } }
// ---------------------------------------------------------------- закон: книга-документ на столе, печать
export function lawDesk(g, t, o = {}) { g.fillStyle = vg(g, -300, 1300, '#5a3a2a', 0.2); g.fillRect(-400, -300, 2720, 1500); for (let y = -300; y < 1200; y += 70) ln(g, [[-400, y], [2320, y + 30]], 3, 'rgba(0,0,0,.12)');
  blob(g, 960, 980, 820, 70, 0.4); g.save(); g.translate(960, 560); g.rotate(-0.02); bx(g, -640, -420, 1280, 860, '#f6f1e4', 10, 7, 0.06); bx(g, -640, -420, 1280, 110, '#2b6a4a', 10, 7, 0.06); for (let k = 0; k < 7; k++) ln(g, [[-540, 120 + k * 44], [-540 + 1080 * (0.6 + ((k * 37) % 40) / 100), 120 + k * 44]], 6, '#c8c0aa'); g.restore(); }
// ---------------------------------------------------------------- улица: дома, двери, прохожие на заднем плане
export function street(g, t, o = {}) { sky(g, o.dusk ? '#e8b080' : '#9fcbe6', o.dusk ? '#f6dcc0' : '#e6f2f8'); clouds(g, t, 80, 3); mountains(g, 430); ground(g, 760, '#cbbda5');
  for (const [x, w, c] of [[-200, 520, '#dcc8a8'], [360, 460, '#d2b898'], [860, 560, '#e2d0b0'], [1460, 600, '#d8c0a0']]) { bx(g, x, 330, w, 430, c, 4, 6, 0.1); bx(g, x + w / 2 - 70, 560, 140, 200, '#6a4a32', 6, 5); bx(g, x + 50, 400, 110, 100, '#7aa8c8', 4, 4); if (w > 500) bx(g, x + w - 160, 400, 110, 100, '#7aa8c8', 4, 4); }
  if (o.passers !== false) passers(g, t, PASS, 760, 0.3); dust(g, t, 0, 500, 1920, 400, 18, 4); }
// дверь дома изнутри (open 0..1) — свет с улицы
export function door(g, t, o = {}) { g.fillStyle = vg(g, -300, 1200, '#c8aa86', 0.18); g.fillRect(-400, -300, 2720, 1300); ground(g, 860, '#a07a56');
  bx(g, 700, 180, 520, 690, '#5a3a22', 8, 7); g.save(); rr(g, 730, 210, 460, 660, 4); g.clip(); sky(g, '#9fcbe6', '#f2f6f8', 800); mountains(g, 600); g.fillStyle = '#cbbda5'; g.fillRect(700, 700, 600, 300); g.restore(); const k = clamp(o.open ?? 0);
  g.save(); g.translate(730, 210); g.scale(1 - 0.85 * k, 1); bx(g, 0, 0, 460, 660, '#8a5a36', 6, 6); bx(g, 40, 40, 380, 260, shade('#8a5a36', -0.08), 6, 4); bx(g, 40, 340, 380, 280, shade('#8a5a36', -0.08), 6, 4); el(g, 400, 360, 14, 14, '#e0b33a', 3); g.restore(); if (k > 0) cone(g, 960, 300, 300 * k, 900 * k, 760, '255,240,200', 0.25); }
// календарь месяца: дни зачёркиваются по одному (n), обведены дни из circ
export function calFlip(g, t, o = {}) { g.fillStyle = vg(g, 0, 1080, '#d2b088', 0.15); g.fillRect(-900, -900, 3720, 2880); bx(g, 440, 100, 1040, 900, '#f6f1e4', 12, 7, 0.06); bx(g, 440, 100, 1040, 130, '#c23a2c', 12, 7, 0.06); htxt(g, o.title || '30 дней', 960, 166, 76, '#fff');
  const n = o.n ?? 0; for (let d = 0; d < 30; d++) { const c = d % 7, r = Math.floor(d / 7), x = 540 + c * 140, y = 310 + r * 140; bx(g, x - 56, y - 56, 112, 112, '#ece4d0', 6, 3, 0.04); htxt(g, String(d + 1), x, y, 52, '#7a6a5a'); if (d < n && !(o.circ || []).some(([dd]) => dd === d)) { g.save(); g.globalAlpha = 0.55; ln(g, [[x - 36, y - 36], [x + 36, y + 36]], 7, '#8a7a6a'); ln(g, [[x + 36, y - 36], [x - 36, y + 36]], 7, '#8a7a6a'); g.restore(); } }
  for (const [d, at] of o.circ || []) { if (t < at) continue; const c = d % 7, r = Math.floor(d / 7), x = 540 + c * 140, y = 310 + r * 140, k = ease.out(clamp((t - at) / 0.3)); g.beginPath(); g.arc(x, y, 64, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.lineWidth = 12; g.strokeStyle = '#2b8a4a'; g.stroke(); } }
// схема: окно соседа смотрит во двор и на кухню (lines 0..1 каждая), женщины во дворе
export function windowView(g, t, o = {}) { sky(g, '#9fcbe6', '#e6f2f8'); clouds(g, t, 70, 3); mountains(g, 420); ground(g, 800, '#cfc0a0');
  bx(g, 80, 160, 520, 640, '#d8c0a0', 4, 6); bx(g, 230, 280, 200, 170, '#7aa8c8', 6, 5); ln(g, [[330, 280], [330, 450]], 5, '#d8c0a0'); bx(g, 250, 600, 160, 200, '#6a4a32', 6, 5);
  bx(g, 1100, 420, 780, 380, '#e2cba6', 4, 6); bx(g, 1500, 520, 260, 180, '#f2e2c0', 6, 5); g.save(); rr(g, 1500, 520, 260, 180, 6); g.clip(); glow(g, 1630, 600, 160, '255,220,150', 0.5); bx(g, 1540, 640, 180, 30, '#8a6a42', 4, 3); el(g, 1580, 630, 28, 20, '#c8a23a', 3); g.restore(); bx(g, 1100, 760, 780, 40, '#c8b090', 4, 4);
  ln(g, [[860, 800], [860, 640]], 4, '#8a8a8a'); ln(g, [[1100, 640], [860, 640]], 3, '#8a8a8a'); for (let k = 0; k < 4; k++) { const sw = Math.sin(t * 2 + k) * 6; pg(g, [[880 + k * 52, 640], [920 + k * 52, 640], [918 + k * 52 + sw, 712], [882 + k * 52 + sw, 712]], ['#e2483a', '#3a8ae0', '#f2c037', '#7ab07a'][k], 3); }
  const L = (x0, y0, x1, y1, k, col) => { if (k <= 0) return; g.save(); g.setLineDash([20, 14]); g.lineDashOffset = -t * 40; g.lineWidth = 9; g.strokeStyle = col; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); g.stroke(); g.restore(); };
  const ex = 380, ey = 360; L(ex, ey, 930, 700, o.l1 ?? 0, '#e2483a'); L(ex, ey, 1560, 600, o.l2 ?? 0, '#e2483a'); if ((o.l1 ?? 0) > 0 || (o.l2 ?? 0) > 0) { g.save(); g.translate(ex, ey); el(g, 0, 0, 40, 26, '#ffffff', 5); el(g, 0, 0, 14, 14, '#1a1614', 0); g.restore(); } }
export { dust, passers, flicker };
