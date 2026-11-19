// Фоны выпуска «Девочка в Афганистане»: класс, школьные ворота, двор с абрикосом и горами, комната, дастархан, еда.
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt, scrib } from './pro.js';

const sky = (g, a, b, y1 = 700) => { const s = g.createLinearGradient(0, -300, 0, y1); s.addColorStop(0, a); s.addColorStop(1, b); g.fillStyle = s; g.fillRect(-400, -400, 2720, 1900); };
// горы вокруг Кабула со снегом
export function mountains(g, y0 = 560, night) { const R = rng(31); [['#8a94a8', 0], ['#a4aec0', 1]].forEach(([c, L]) => { g.beginPath(); g.moveTo(-400, y0 + 80); let x = -400; const pk = []; while (x < 2400) { const h = 160 + R() * 220 - L * 60, w = 180 + R() * 160; pk.push([x + w / 2, y0 - h + L * 40]); g.lineTo(x + w / 2, y0 - h + L * 40); x += w; g.lineTo(x, y0 + 20 - R() * 60 + L * 40); } g.lineTo(2400, y0 + 400); g.lineTo(-400, y0 + 400); g.closePath(); fo(g, vg(g, y0 - 380, 500, night ? shade(c, -0.45) : c, 0.15), L ? 4 : 0);
    pk.forEach(([px, py]) => { g.beginPath(); g.moveTo(px, py); g.lineTo(px - 55, py + 70); g.quadraticCurveTo(px - 20, py + 56, px, py + 76); g.quadraticCurveTo(px + 22, py + 56, px + 55, py + 70); g.closePath(); fo(g, night ? '#c8d0e0' : '#f6f8fb', L ? 3 : 0); }); }); }
// ------------------------------------------------------------------ класс
export function classroom(g, t, o = {}) {
  g.fillStyle = vg(g, 0, 860, '#cfe0cf', 0.16); g.fillRect(-400, -300, 2720, 1200); g.fillStyle = vg(g, 600, 260, '#9ab89a', 0.1); g.fillRect(-400, 600, 2720, 260); ln(g, [[-400, 600], [2320, 600]], 5);
  // окно с горами
  bx(g, 1400, 150, 420, 380, '#e9e4da', 6, 6); g.save(); rr(g, 1422, 172, 376, 336, 4); g.clip(); sky(g, '#9fcbe6', '#e6f2f8', 500); mountains(g, 480); g.restore(); rr(g, 1422, 172, 376, 336, 4); fo(g, null, 4); ln(g, [[1610, 172], [1610, 508]], 7, '#e9e4da'); cone(g, 1610, 330, 380, 900, 640, '255,236,190', 0.12);
  // доска
  bx(g, 260, 120, 1000, 440, '#7a5236', 8, 6); rr(g, 284, 144, 952, 392, 4); fo(g, vg(g, 144, 392, '#2f5a46', 0.1), 4);
  const lines = o.board || []; g.save(); g.font = `700 76px "Caveat"`; g.textBaseline = 'middle'; lines.forEach((L, i) => { const a = L.at ?? 0, n = Math.max(0, Math.min(L.t.length, Math.floor((t - a) * (L.cps ?? 12)))); if (n <= 0) return; g.fillStyle = L.col || 'rgba(245,245,235,.92)'; g.fillText(L.t.slice(0, n), 330, 220 + i * 100); }); g.restore();
  if (!o.board) scrib(g, 320, 210, 860, 4, 80, 'rgba(240,240,230,.8)', 5, 7);
  bx(g, 300, 540, 160, 16, '#9a7a56', 3, 3); el(g, 340, 536, 18, 8, '#f4f4ee', 2);
  // плакат с картой и часы
  bx(g, 60, 180, 160, 220, '#f4efe2', 4, 4); g.save(); g.globalAlpha = 0.7; el(g, 140, 270, 50, 40, '#9ab87a', 0); el(g, 120, 330, 30, 20, '#9ab87a', 0); g.restore(); el(g, 1330, 90, 40, 40, '#f4efe2', 5); ln(g, [[1330, 90], [1330, 64]], 4); ln(g, [[1330, 90], [1350, 98]], 4);
  g.fillStyle = vg(g, 860, 400, '#a07a56', 0.2); g.fillRect(-400, 860, 2720, 500); ln(g, [[-400, 860], [2320, 860]], 6); for (let x = -400; x < 2320; x += 140) ln(g, [[x, 862], [x - 50, 1200]], 3, 'rgba(0,0,0,.15)');
}
export function deskRow(g, xs, y = 860) { xs.forEach((x) => { bx(g, x - 150, y - 110, 300, 34, '#b8875a', 6, 5); bx(g, x - 136, y - 76, 20, 160, '#8a5a36', 3, 4); bx(g, x + 116, y - 76, 20, 160, '#8a5a36', 3, 4); g.save(); g.translate(x - 40, y - 122); g.rotate(-0.05); bx(g, -60, -10, 120, 14, '#f4efe2', 2, 3); g.restore(); }); }
// ------------------------------------------------------------------ ворота школы (вечер)
export function gate(g, t, o = {}) {
  sky(g, o.dusk ? '#e8a26a' : '#9fcbe6', o.dusk ? '#f6d8b0' : '#e6f2f8'); mountains(g, 520, false);
  g.fillStyle = vg(g, 520, 600, '#d8b88a', 0.15); g.fillRect(-400, 640, 2720, 900);
  bx(g, 120, 380, 1680, 300, '#e6d2b0', 6, 6, 0.1); for (let x = 140; x < 1800; x += 200) ln(g, [[x, 380], [x, 680]], 3, 'rgba(0,0,0,.1)'); bx(g, 100, 360, 1720, 30, '#c8b090', 4, 5);
  bx(g, 760, 300, 400, 380, '#c8b090', 6, 6); const k = o.close != null ? ease.inOut(clamp((t - o.close) / 1.6)) : 1;
  g.fillStyle = '#2a2a33'; g.fillRect(790, 340, 340, 340); cone(g, 960, 340, 60, 320, 340, '255,220,150', 0.2 * (1 - k));
  const w = 30 + 140 * k; bx(g, 790, 340, w, 340, '#3a7a9a', 4, 5); bx(g, 1130 - w, 340, w, 340, '#3a7a9a', 4, 5); el(g, 790 + w - 16, 520, 6, 6, '#e0b33a', 2); el(g, 1130 - w + 16, 520, 6, 6, '#e0b33a', 2);
  bx(g, 820, 250, 280, 70, '#f4efe2', 6, 5); scrib(g, 850, 285, 220, 1, 10, '#3a5a7a', 6, 2);
  for (const x of [400, 1500]) { ln(g, [[x, 680], [x, 470]], 14, '#6a4a2a'); el(g, x, 420, 90, 80, '#5f8a4a', 5); }
}
// ------------------------------------------------------------------ двор: глиняный дом с плоской крышей, абрикос, горы
export function courtyard(g, t, o = {}) {
  sky(g, o.night ? '#16224a' : '#8fc6ea', o.night ? '#3a3f6e' : '#e8f2f8'); if (o.night) { const R = rng(5); for (let i = 0; i < 90; i++) el(g, R() * 1920, R() * 420, 1.6, 1.6, 'rgba(255,255,255,.8)', 0); el(g, 1600, 160, 50, 50, '#f6f0d6', 0); }
  mountains(g, 470, o.night);
  // дувал (стена двора)
  g.fillStyle = vg(g, 520, 120, '#c9a77c', 0.15); g.fillRect(-400, 520, 2720, 140); ln(g, [[-400, 520], [2320, 520]], 5); for (let x = -380; x < 2320; x += 160) ln(g, [[x, 530], [x + 20, 650]], 2, 'rgba(90,60,30,.25)');
  // дом
  bx(g, 820, 300, 900, 380, o.night ? '#8a7258' : '#d2b088', 10, 6, 0.12); bx(g, 800, 286, 940, 34, o.night ? '#6a5640' : '#b8946a', 6, 5); for (let k = 0; k < 6; k++) bx(g, 840 + k * 150, 290, 20, 26, '#7a5236', 2, 3);
  for (const [x, w] of [[900, 150], [1460, 150]]) { bx(g, x, 400, w, 130, o.night ? '#ffd76a' : '#7fc0ea', 30, 5); ln(g, [[x + w / 2, 400], [x + w / 2, 530]], 4); if (o.night) glow(g, x + w / 2, 465, 220, '255,210,120', 0.5); }
  bx(g, 1170, 420, 190, 260, '#3a7a9a', 8, 6); el(g, 1320, 560, 8, 8, '#e0b33a', 3); bx(g, 1150, 400, 230, 30, '#b8946a', 4, 4);
  // абрикосовое дерево
  ln(g, [[400, 900], [420, 560], [360, 440]], 26, '#5a3a22'); ln(g, [[420, 600], [520, 470]], 18, '#5a3a22'); [[300, 380, 160], [470, 360, 170], [380, 300, 150], [560, 440, 120]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); fo(g, vg(g, y - r, r * 2, '#6aa04a', 0.2), 5); });
  const RA = rng(8); for (let i = 0; i < 26; i++) { const x = 220 + RA() * 420, y = 260 + RA() * 220; el(g, x, y, 11, 11, o.blossom ? '#fbe0e8' : '#f2a23a', 3); }
  // земля двора, тандыр, ковёр на верёвке
  g.fillStyle = vg(g, 660, 600, o.night ? '#7a6248' : '#d8c09a', 0.15); g.fillRect(-400, 660, 2720, 900); ln(g, [[-400, 680], [2320, 680]], 4, 'rgba(0,0,0,.2)');
  g.beginPath(); g.ellipse(1830, 760, 90, 40, 0, 0, Math.PI * 2); fo(g, '#b8946a', 5); bx(g, 1740, 760, 180, 120, '#b8946a', 30, 5);
  // змеи рисуются ПОСЛЕ дома и дерева: летят в открытом небе перед домом; o.khx/o.khy — рука, держащая нитку жёлтого змея
  if (o.kites) [[500, 170, '#e2483a', 0], [1500, 130, '#3a8ae0', 1], [o.khx != null ? (o.kx ?? 1080) : 1000, o.khx != null ? (o.ky ?? 200) : 200, '#f2c037', 2]].forEach(([x, y, c, i]) => { const xx = x + Math.sin(t * 0.8 + i) * 30, yy = y + Math.cos(t * 0.6 + i) * 18; g.save(); g.beginPath(); g.moveTo(xx, yy + 60); const held = i === 2 && o.khx != null, ex = held ? o.khx : xx + 60 - i * 40, ey = held ? o.khy : 900; g.quadraticCurveTo(xx - 40, (yy + ey) / 2 + 60, ex, ey); g.lineWidth = held ? 5 : 2; g.strokeStyle = held ? '#2a2321' : 'rgba(40,40,40,.75)'; g.stroke(); for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(xx, yy + 60 + k * 26); g.lineTo(xx + (k % 2 ? 14 : -14), yy + 72 + k * 26); g.lineWidth = 5; g.strokeStyle = c; g.stroke(); } g.restore(); g.save(); g.translate(xx, yy); g.rotate(Math.sin(t + i) * 0.15); pg(g, [[0, -60], [44, 0], [0, 60], [-44, 0]], c, 4); ln(g, [[0, -60], [0, 60]], 3); ln(g, [[-44, 0], [44, 0]], 3); g.restore(); });
}
// ------------------------------------------------------------------ комната: ниши, ковёр, тошаки (подушки вдоль стены), окно, лампа
export function room(g, t, o = {}) {
  const wall = o.night ? '#a88a68' : '#e2cba6'; g.fillStyle = vg(g, -300, 1160, wall, 0.18); g.fillRect(-400, -300, 2720, 1200);
  for (const x of [200, 520]) { rr(g, x, 220, 200, 260, 90); fo(g, shade(wall, -0.15), 5); bx(g, x + 40, 400, 60, 70, '#c8453a', 20, 4); el(g, x + 140, 440, 30, 32, '#3a8ae0', 4); }
  bx(g, 1300, 160, 420, 340, '#7a5236', 8, 6); g.save(); rr(g, 1322, 182, 376, 296, 4); g.clip(); sky(g, o.night ? '#16224a' : '#9fcbe6', o.night ? '#3a3f6e' : '#e6f2f8', 480); mountains(g, 450, o.night); g.restore(); rr(g, 1322, 182, 376, 296, 4); fo(g, null, 4); ln(g, [[1510, 182], [1510, 478]], 7, '#7a5236');
  pg(g, [[1280, 140], [1340, 140], [1320, 520], [1270, 520]], vg(g, 140, 380, '#c84a6a', 0.15)); pg(g, [[1680, 140], [1740, 140], [1750, 520], [1700, 520]], vg(g, 140, 380, '#c84a6a', 0.15));
  if (!o.night) cone(g, 1510, 330, 360, 980, 680, '255,236,190', 0.14);
  // лампа
  ln(g, [[960, -100], [960, 120]], 4); g.beginPath(); g.moveTo(900, 170); g.lineTo(930, 120); g.lineTo(990, 120); g.lineTo(1020, 170); g.closePath(); fo(g, '#e0b33a'); el(g, 960, 172, 50, 10, '#fff3c4', 3); if (o.night) { cone(g, 960, 172, 100, 900, 760, '255,220,140', 0.25); glow(g, 960, 176, 160, '255,230,170', 0.6); }
  // тошаки
  g.fillStyle = vg(g, 860, 300, '#9a3a3a', 0.2); g.fillRect(-400, 860, 2720, 500); for (let x = -380; x < 2320; x += 120) { g.save(); g.globalAlpha = 0.35; pg(g, [[x, 900], [x + 60, 940], [x, 980], [x - 60, 940]], '#e0b33a', 0); g.restore(); } ln(g, [[-400, 860], [2320, 860]], 6);
  for (let x = -300; x < 2300; x += 330) { bx(g, x, 760, 300, 110, '#2b4a8a', 30, 5, 0.18); for (let k = 0; k < 3; k++) ln(g, [[x + 40 + k * 90, 790], [x + 80 + k * 90, 840]], 3, '#e0b33a'); }
  if (o.night) { g.save(); g.fillStyle = 'rgba(20,20,60,.25)'; g.fillRect(-400, -300, 2720, 1700); g.restore(); }
}
// дастархан на полу (передний план) с блюдами
export function dastarkhan(g, t) {
  g.beginPath(); g.moveTo(140, 900); g.lineTo(1780, 900); g.lineTo(1920, 1100); g.lineTo(0, 1100); g.closePath(); fo(g, vg(g, 900, 200, '#f4ead2', 0.1)); for (let x = 180; x < 1760; x += 60) ln(g, [[x, 906], [x + 10, 920]], 3, '#c8453a');
  plate(g, 960, 960, 1.0, 'palau'); plate(g, 640, 980, 0.7, 'bolani'); plate(g, 1280, 980, 0.7, 'bolani');
  for (const x of [420, 1500]) { el(g, x, 990, 70, 30, '#e9e4da', 4); for (let k = 0; k < 6; k++) el(g, x - 40 + k * 16, 985, 9, 9, ['#c8453a', '#f2a23a', '#4fa04a'][k % 3], 2); }
  for (const x of [520, 820, 1100, 1400]) { pg(g, [[x - 16, 950], [x + 16, 950], [x + 12, 990], [x - 12, 990]], 'rgba(180,90,40,.75)', 3); }
}
export function plate(g, x, y, s, kind) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.ellipse(0, 0, 200, 70, 0, 0, Math.PI * 2); fo(g, '#e9e4da', 5); g.beginPath(); g.ellipse(0, -6, 180, 58, 0, 0, Math.PI * 2); fo(g, '#2b6a8a', 3);
  if (kind === 'palau') { g.beginPath(); g.ellipse(0, -30, 150, 70, 0, Math.PI, 0); g.closePath(); fo(g, vg(g, -100, 80, '#e8c88a', 0.15), 4); const R = rng(3); for (let i = 0; i < 26; i++) { const a = R() * Math.PI, r = R() * 120; ln(g, [[Math.cos(a) * r - 10, -30 - Math.sin(a) * r * 0.5], [Math.cos(a) * r + 10, -34 - Math.sin(a) * r * 0.5]], 6, '#f28a2a'); } for (let i = 0; i < 18; i++) el(g, (R() - 0.5) * 220, -40 - R() * 50, 6, 5, '#4a2a3a', 0); el(g, 0, -86, 34, 22, '#8a4a2a', 4); }
  else { for (let k = -1; k <= 1; k++) { g.beginPath(); g.ellipse(k * 90, -24, 80, 40, 0, Math.PI, 0); g.closePath(); fo(g, vg(g, -64, 40, '#e0a85a', 0.2), 4); for (let d = -2; d <= 2; d++) el(g, k * 90 + d * 22, -40, 4, 4, '#4f8a3a', 0); } }
  g.restore(); }
export function foodInsert(g, t, kind) { g.fillStyle = vg(g, 0, 1080, '#b8323a', 0.25); g.fillRect(-100, -100, 2120, 1280); g.save(); g.globalAlpha = 0.3; for (let x = -100; x < 2020; x += 160) for (let y = -100; y < 1180; y += 160) pg(g, [[x, y - 50], [x + 50, y], [x, y + 50], [x - 50, y]], '#e0b33a', 0); g.restore(); blob(g, 960, 760, 760, 120, 0.4); plate(g, 960, 680, 3.2, kind); for (let i = 0; i < 3; i++) { const k = (t * 0.4 + i / 3) % 1; g.save(); g.globalAlpha = 0.5 * (1 - k); ln(g, [[860 + i * 100, 420 - k * 200], [880 + i * 100 + Math.sin(t * 2 + i) * 20, 360 - k * 200]], 8, '#ffffff'); g.restore(); } }
// ночь: часы и свеча
export function clockNight(g, t) { g.fillStyle = vg(g, 0, 1080, '#1e2236', 0.2); g.fillRect(-100, -100, 2120, 1280); glow(g, 1300, 640, 420, '255,200,120', 0.45);
  el(g, 760, 480, 220, 220, '#f4efe2', 8); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ln(g, [[760 + Math.cos(a) * 180, 480 + Math.sin(a) * 180], [760 + Math.cos(a) * 205, 480 + Math.sin(a) * 205]], 7); } const s = -Math.PI / 2 + Math.floor(t * 1) * Math.PI / 30, m = -Math.PI / 2 + t * 0.03; ln(g, [[760, 480], [760 + Math.cos(-1.2) * 110, 480 + Math.sin(-1.2) * 110]], 12); ln(g, [[760, 480], [760 + Math.cos(m) * 170, 480 + Math.sin(m) * 170]], 8); ln(g, [[760, 480], [760 + Math.cos(s) * 190, 480 + Math.sin(s) * 190]], 4, '#c23a2c'); el(g, 760, 480, 14, 14, OL, 0);
  bx(g, 1250, 640, 100, 240, '#f4efe2', 10, 5); const fl = Math.sin(t * 12) * 4; g.beginPath(); g.moveTo(1300, 560 + fl); g.quadraticCurveTo(1330, 610, 1300, 636); g.quadraticCurveTo(1270, 610, 1300, 560 + fl); fo(g, '#ffcf4a', 3); bx(g, 1200, 870, 200, 30, '#8a6a42', 6, 5); }
