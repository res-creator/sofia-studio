// Фоны выпуска «Бумажные сыновья»: барак, залив ночью, китайская деревня, дом с дверью и компасом, Вашингтон,
// железная дорога, горящий Сан-Франциско, горящий архив. Все функции (g, t, o), логические 1920x1080, рисуют с запасом по краям.
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt } from './pro.js';

const sky = (g, a, b, y1 = 700) => { const s = g.createLinearGradient(0, -300, 0, y1); s.addColorStop(0, a); s.addColorStop(1, b); g.fillStyle = s; g.fillRect(-400, -400, 2720, 1900); };
const ground = (g, y, c) => { g.fillStyle = vg(g, y, 600, c, 0.15); g.fillRect(-400, y, 2720, 900); ln(g, [[-400, y], [2320, y]], 5); };

// ---------------------------------------------------------------- барак на острове (ночь)
export function barrack(g, t, o = {}) {
  g.fillStyle = vg(g, -300, 1300, '#3a2c24', 0.25); g.fillRect(-400, -300, 2720, 1500);
  for (let x = -400; x < 2320; x += 96) { ln(g, [[x, -300], [x, 860]], 3, 'rgba(10,6,4,.55)'); }
  for (let y = 120; y < 860; y += 210) ln(g, [[-400, y], [2320, y]], 2, 'rgba(10,6,4,.35)');
  g.fillStyle = vg(g, 860, 300, '#2a1f19', 0.3); g.fillRect(-400, 860, 2720, 600); ln(g, [[-400, 860], [2320, 860]], 6);
  // окно с решёткой и лунный свет
  bx(g, 1180, 150, 330, 330, '#1d2a52', 8, 8, 0.2); el(g, 1360, 260, 46, 46, '#e8eefc', 0); glow(g, 1360, 260, 160, '190,210,255', 0.35);
  for (const x of [1262, 1345, 1428]) ln(g, [[x, 150], [x, 480]], 10); ln(g, [[1180, 315], [1510, 315]], 10);
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(150,175,230,.14)'; g.beginPath(); g.moveTo(1180, 480); g.lineTo(1510, 480); g.lineTo(1780, 900); g.lineTo(900, 900); g.closePath(); g.fill(); g.restore();
  // нары в три яруса слева и справа
  const bunk = (x0, flip) => {
    g.save(); g.translate(x0, 0); if (flip) g.scale(-1, 1);
    for (const x of [0, 380]) bx(g, x - 10, 130, 20, 740, '#2a1d14', 4, 5, 0.1);
    [[300, '#6a5a4a'], [510, '#5a6a6a'], [720, '#6a4a4a']].forEach(([y, c], k) => { bx(g, -10, y, 400, 22, '#2a1d14', 4, 5); bx(g, 8, y - 46, 350, 46, c, 14, 4, 0.1); el(g, 330, y - 56, 36, 20, '#cfc7b4', 3); if (k !== 1) { g.beginPath(); g.ellipse(120, y - 60, 60, 24, 0, Math.PI, 0); fo(g, shade(c, 0.1), 3); } });
    g.restore();
  };
  if (!o.noBunks) { bunk(-40, false); bunk(1960, true); }
  // лампа
  const sw = Math.sin(t * 1.3) * 0.04; g.save(); g.translate(760, -20); g.rotate(sw); ln(g, [[0, 0], [0, 190]], 5); pg(g, [[-30, 190], [30, 190], [48, 236], [-48, 236]], '#8a6a2a', 4); g.restore();
  const fl = 0.85 + noise(t * 6, 3) * 0.15; glow(g, 760 + Math.sin(sw) * 190, 240, 520 * fl, '255,200,120', 0.42);
  cone(g, 760, 236, 80, 520, 640, '255,214,150', 0.16 * fl);
  if (o.dim) { g.fillStyle = `rgba(6,6,16,${o.dim})`; g.fillRect(-400, -300, 2720, 1500); }
}

// ---------------------------------------------------------------- залив ночью: остров с бараком, огни Сан-Франциско, лодка
export function bayNight(g, t, o = {}) {
  const day = !!o.day;
  sky(g, day ? '#8fc6ea' : '#0c1030', day ? '#e6f2f8' : '#3a3a6a', 640);
  if (!day) { const R = rng(4); for (let i = 0; i < 90; i++) el(g, R() * 1920, R() * 520, 2, 2, `rgba(255,255,255,${0.3 + R() * 0.5})`, 0); el(g, 1500, 180, 52, 52, '#f0f0e0', 0); glow(g, 1500, 180, 200, '200,215,255', 0.3); }
  // вода
  g.fillStyle = vg(g, 640, 500, day ? '#5a9ac0' : '#16224a', 0.25); g.fillRect(-400, 640, 2720, 600); ln(g, [[-400, 640], [2320, 640]], 4);
  const R = rng(8); for (let i = 0; i < 36; i++) { const x = ((R() * 2200 + t * 18 * (0.4 + R())) % 2300) - 200, y = 680 + R() * 340; ln(g, [[x, y], [x + 70 + R() * 50, y]], 3, day ? 'rgba(255,255,255,.5)' : 'rgba(150,170,255,.35)'); }
  // дальний берег с огнями города
  g.fillStyle = day ? '#6a7a8a' : '#0a0d22'; g.beginPath(); g.moveTo(-400, 640); for (let x = -400; x <= 2320; x += 60) g.lineTo(x, 600 - 30 * Math.abs(Math.sin(x * 0.01)) - ((x * 7) % 5) * 4); g.lineTo(2320, 640); g.closePath(); g.fill();
  if (!day) for (let i = 0; i < 70; i++) { const x = 1000 + ((i * 53) % 900), y = 580 + ((i * 31) % 50); el(g, x, y, 3, 3, noise(t * 3 + i, 2) > -0.2 ? '#ffd88a' : '#7a6a3a', 0); }
  // остров с бараками
  g.fillStyle = day ? '#4a6a3a' : '#0c1a14'; g.beginPath(); g.moveTo(-200, 700); g.quadraticCurveTo(300, 470, 900, 700); g.closePath(); g.fill(); ln(g, [[-200, 700], [900, 700]], 4);
  bx(g, 220, 520, 360, 100, day ? '#c8b690' : '#2a2018', 6, 5); pg(g, [[200, 520], [400, 450], [600, 520]], day ? '#8a5a3a' : '#1a120c', 5);
  if (!day) for (const x of [270, 360, 450, 540]) { bx(g, x - 14, 548, 28, 36, '#ffd88a', 3, 3); glow(g, x, 566, 50, '255,214,140', 0.35); }
  // лодка
  if (o.boat) { const u = clamp((t - (o.boat.at || 0)) / (o.boat.dur || 6)), bx0 = lerp(o.boat.x0 ?? 1900, o.boat.x1 ?? 900, ease.inOut(u)), by = 800 + Math.sin(t * 2) * 6;
    g.save(); g.translate(bx0, by); g.rotate(Math.sin(t * 2) * 0.03); pg(g, [[-160, 0], [160, 0], [120, 60], [-120, 60]], '#6a3a2a', 5); bx(g, -60, -70, 120, 70, '#e8e0d0', 6, 5); ln(g, [[0, -70], [0, -150]], 6); pg(g, [[0, -150], [70, -110], [0, -110]], '#c84a3a', 3); glow(g, 0, -20, 130, '255,214,150', day ? 0 : 0.3); g.restore(); }
}

// ---------------------------------------------------------------- китайская деревня: три ряда домов; o.hi = [ряд, дом] подсвечивает дом
const house = (g, x, y, s, c, roof, hi) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  bx(g, -80, -110, 160, 110, c, 4, 5); pg(g, [[-120, -108], [-80, -170], [80, -170], [120, -108]], roof, 5); ln(g, [[-120, -108], [-132, -116]], 5); ln(g, [[120, -108], [132, -116]], 5);
  bx(g, -18, -72, 36, 72, '#7a2a22', 3, 4); bx(g, 38, -88, 30, 30, '#2a1d14', 3, 3);
  if (hi) { g.save(); g.strokeStyle = '#ffd43b'; g.lineWidth = 9; g.shadowColor = '#ffd43b'; g.shadowBlur = 30; rr(g, -130, -180, 260, 190, 12); g.stroke(); g.restore(); }
  g.restore();
};
export function village(g, t, o = {}) {
  sky(g, o.dusk ? '#e8b080' : '#9fcbe6', o.dusk ? '#f6dcc0' : '#e6f2f8', 520);
  g.fillStyle = '#7a9a7a'; g.beginPath(); g.moveTo(-400, 520); for (let x = -400; x <= 2320; x += 120) g.lineTo(x, 420 - 70 * Math.abs(Math.sin(x * 0.006 + 1))); g.lineTo(2320, 520); g.closePath(); g.fill();
  ground(g, 520, o.dry ? '#c8b080' : '#a8b878');
  if (!o.dry) for (let x = 100; x < 1900; x += 90) ln(g, [[x, 520 + (x % 3) * 4], [x + 30, 540]], 3, '#6a8a4a');
  const rows = [[600, 0.5, 5], [760, 0.7, 4], [940, 0.95, 3]];
  rows.forEach(([y, s, n], r) => { for (let k = 0; k < n; k++) { const x = (k + 0.5) * (1920 / n); const hi = o.hi && o.hi[0] === r && o.hi[1] === k; house(g, x, y, s, ['#d8c8a0', '#c8b890', '#d4c49a'][(r + k) % 3], '#5a5a62', hi); } });
  if (o.fog) { g.fillStyle = `rgba(230,236,244,${o.fog})`; g.fillRect(-400, -400, 2720, 1900); }
}

// ---------------------------------------------------------------- дом с дверью и компасом; o.open: 0..1 дверь открыта
export function doorHouse(g, t, o = {}) {
  sky(g, '#9fcbe6', '#e6f2f8', 640); g.fillStyle = '#8a9a7a'; g.beginPath(); g.moveTo(-400, 600); for (let x = -400; x <= 2320; x += 150) g.lineTo(x, 520 - 60 * Math.abs(Math.sin(x * 0.005))); g.lineTo(2320, 600); g.closePath(); g.fill();
  ground(g, 760, '#b8a480');
  bx(g, 260, 330, 760, 430, '#d8c8a0', 6, 6, 0.12); pg(g, [[190, 340], [330, 210], [950, 210], [1090, 340]], '#5a5a62', 6); for (let x = 340; x < 960; x += 52) ln(g, [[x, 215], [x - 10, 338]], 3, 'rgba(20,20,26,.45)');
  bx(g, 700, 430, 190, 180, '#2a1d14', 6, 5); ln(g, [[795, 430], [795, 610]], 5, '#7a5a3a'); ln(g, [[700, 520], [890, 520]], 5, '#7a5a3a');
  const op = clamp(o.open ?? 0); bx(g, 520, 460, 150, 300, '#3a2218', 4, 5);
  g.save(); g.beginPath(); g.rect(520, 460, 150, 300); g.clip(); g.translate(520 + 150 * (1 - 0.15 * op), 0); g.scale(1 - 0.85 * op, 1); g.translate(-520, 0);
  if (!(op > 0.97)) { bx(g, 520, 460, 150, 300, '#8a2a22', 4, 6, 0.1); for (const y of [520, 600, 680]) ln(g, [[535, y], [655, y]], 3, 'rgba(0,0,0,.35)'); el(g, 640, 610, 9, 9, '#e0b33a', 3); } g.restore();
  if (o.compass) { const [cx, cy, r] = o.compass; compass(g, cx, cy, r, t, o); }
}
// компас: стрелка крутится и останавливается на o.stop (0=С, 90=В, 180=Ю, 270=З) в момент o.stopAt
export function compass(g, cx, cy, r, t, o = {}) {
  g.save(); g.translate(cx, cy); el(g, 0, 0, r, r, '#f6f1e4', 8); el(g, 0, 0, r * 0.86, r * 0.86, '#ece4cc', 3);
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([s, a]) => { const rad = (a - 90) * Math.PI / 180; g.save(); g.font = `800 ${r * 0.26}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = a === 180 && o.hlS ? '#e2483a' : OL; g.fillText(s, Math.cos(rad) * r * 0.68, Math.sin(rad) * r * 0.68); g.restore(); });
  const stop = o.stop ?? 180, at = o.stopAt ?? 3, u = clamp((t - at) / 0.9); const ang = t < at ? t * 460 + Math.sin(t * 5) * 20 : lerp(at * 460, 0, 0) + 0; const final = t < at ? ang : stop + Math.sin((t - at) * 14) * 12 * (1 - u) * (1 - u);
  g.rotate(final * Math.PI / 180); pg(g, [[-r * 0.1, 0], [0, -r * 0.8], [r * 0.1, 0]], '#e2483a', 4); pg(g, [[-r * 0.1, 0], [0, r * 0.8], [r * 0.1, 0]], '#4a4a56', 4); el(g, 0, 0, r * 0.07, r * 0.07, '#e0b33a', 3); g.restore();
}

// ---------------------------------------------------------------- Вашингтон: белое здание с куполом, ступени, флаг
export function capitol(g, t, o = {}) {
  sky(g, '#a8d0ea', '#f2f6f8', 640); for (const [x, y, s] of [[300, 160, 1], [1500, 120, 0.8], [900, 220, 0.6]]) { g.save(); g.globalAlpha = 0.85; for (const [dx, dy, r] of [[0, 0, 60], [55, -18, 52], [110, 0, 58]]) el(g, x + dx * s + ((t * 12) % 60), y + dy * s, r * s, r * s * 0.7, '#ffffff', 0); g.restore(); }
  ground(g, 800, '#b8c4a0');
  g.save(); g.translate(960, 0);
  bx(g, -520, 560, 1040, 260, '#efece4', 6, 6); for (let x = -480; x <= 480; x += 80) bx(g, x - 16, 580, 32, 210, '#f8f6f0', 4, 4);
  pg(g, [[-560, 560], [0, 480], [560, 560]], '#e4e0d4', 6); bx(g, -240, 360, 480, 130, '#efece4', 6, 6); for (let x = -210; x <= 210; x += 60) bx(g, x - 10, 372, 20, 106, '#f8f6f0', 3, 3);
  g.beginPath(); g.ellipse(0, 360, 230, 130, 0, Math.PI, 0); fo(g, '#f6f3ec', 6); ln(g, [[-110, 330], [-110, 250]], 3, 'rgba(0,0,0,.25)'); ln(g, [[110, 330], [110, 250]], 3, 'rgba(0,0,0,.25)'); bx(g, -30, 230, 60, 60, '#f0ede6', 4, 5);
  g.beginPath(); g.ellipse(0, 240, 70, 78, 0, Math.PI, 0); fo(g, '#f6f3ec', 5); ln(g, [[0, 164], [0, 90]], 5); pg(g, [[0, 92], [64, 108 + Math.sin(t * 4) * 6], [0, 130]], '#d84a42', 3);
  for (let i = 0; i < 6; i++) bx(g, -540 + i * 8, 818 + i * 14, 1080 - i * 16, 14, '#d8d4c8', 3, 3);
  g.restore();
}

// ---------------------------------------------------------------- железная дорога в горах (рабочие рисуются отдельно)
export function railroad(g, t, o = {}) {
  sky(g, '#a8c8e0', '#f0eadc', 560); g.fillStyle = '#7a8aa0'; g.beginPath(); g.moveTo(-400, 560); const R = rng(14); let x = -400; while (x < 2320) { g.lineTo(x, 560 - 160 - R() * 160); x += 140 + R() * 80; g.lineTo(x, 560); x += 40; } g.lineTo(2320, 560); g.closePath(); g.fill();
  g.fillStyle = '#e8eef4'; g.beginPath(); g.moveTo(-400, 560); for (let xx = -400; xx < 2320; xx += 200) { g.lineTo(xx + 100, 360 - ((xx * 7) % 90)); g.lineTo(xx + 200, 560); } g.closePath(); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1;
  ground(g, 700, '#9a8a6a');
  // рельсы: перспектива
  for (const off of [-150, 150]) ln(g, [[960 + off * 0.2, 700], [960 + off * 3.2, 1150]], 12, '#5a5a62');
  for (let i = 0; i < 12; i++) { const k = (i / 12 + (o.move ? (t * 0.2) % (1 / 12) : 0)); const y = 700 + k * 450, w = 90 + k * 560; ln(g, [[960 - w, y], [960 + w, y]], 10 + k * 8, '#6a4a2a'); }
  if (o.sleepers) for (let i = 0; i < 10; i++) ln(g, [[100 + i * 190, 1000], [150 + i * 190, 1000]], 8, '#6a4a2a');
}

// ---------------------------------------------------------------- Сан-Франциско в огне (o.k сила пожара 0..1)
export function sfFire(g, t, o = {}) {
  const k = o.k ?? 1; sky(g, '#1a0c10', '#d8602a', 760); glow(g, 960, 700, 1100 * (0.7 + 0.3 * k), '255,120,40', 0.45 * k);
  const R = rng(21);
  for (let layer = 0; layer < 2; layer++) { const yb = 760 + layer * 40, sh = layer ? 0.5 : 0.8; for (let i = 0; i < 18; i++) { const w = 90 + R() * 80, h = 140 + R() * 260 * (layer ? 0.7 : 1), x = i * 120 - 40 + layer * 50; g.fillStyle = layer ? '#2a1418' : '#1a0e12'; g.fillRect(x, yb - h, w, h); ln(g, [[x, yb - h], [x + w, yb - h]], 3, '#0a0608'); for (let wy = yb - h + 24; wy < yb - 30; wy += 46) for (let wx = x + 14; wx < x + w - 20; wx += 30) { const on = noise(t * 2 + wx + wy, 4) > 0.35 * (1 - k * 0.6) ? 0 : 1; if (on) el(g, wx, wy, 6, 8, `rgba(255,${160 + R() * 60},60,${0.5 + 0.5 * k})`, 0); } } }
  for (let i = 0; i < 22; i++) { const x = 60 + i * 86, h = (80 + noise(i * 1.7, 5) * 90 + Math.sin(t * 7 + i) * 24) * k; const y = 760 - ((i * 37) % 200); pg(g, [[x - 38, y], [x - 8, y - h * 1.25], [x + 4, y - h * 0.55], [x + 22, y - h * 1.1], [x + 40, y]], '#ff6a1c', 0); pg(g, [[x - 20, y], [x - 2, y - h * 0.8], [x + 24, y]], '#ffd24a', 0); }
  g.fillStyle = vg(g, 760, 400, '#2a1a1a', 0.3); g.fillRect(-400, 760, 2720, 500); ln(g, [[-400, 760], [2320, 760]], 5);
  for (let i = 0; i < 6; i++) { const x = 160 + i * 300 + Math.sin(t * 0.7 + i) * 40; g.save(); g.globalAlpha = 0.35; for (let j = 0; j < 5; j++) el(g, x + Math.sin(t + j) * 18, 560 - j * 120 - ((t * 60) % 120), 70 + j * 24, 54 + j * 12, '#3a3036', 0); g.restore(); }
  const E2 = rng(5); for (let i = 0; i < 50; i++) { const x = (E2() * 2000 + Math.sin(t * 1.5 + i) * 40) % 1920, y = 800 - ((E2() * 900 + t * (60 + E2() * 140)) % 900); el(g, x, y, 3, 3, '#ffb040', 0); }
}

// ---------------------------------------------------------------- архив: стеллажи с бухгалтерскими книгами; o.burn 0..1 огонь по полкам, o.empty выгоревшая комната
export function archive(g, t, o = {}) {
  g.fillStyle = vg(g, -300, 1300, '#4a3a2c', 0.2); g.fillRect(-400, -300, 2720, 1500); g.fillStyle = vg(g, 860, 300, '#2a2018', 0.3); g.fillRect(-400, 860, 2720, 500); ln(g, [[-400, 860], [2320, 860]], 6);
  const burn = o.burn ?? 0, empty = o.empty ? 1 : 0;
  for (const x0 of [140, 700, 1260]) { bx(g, x0, 150, 520, 700, empty ? '#2a1e18' : '#6a4a2e', 6, 6); for (let r = 0; r < 4; r++) { const y = 190 + r * 170; bx(g, x0 + 14, y + 130, 492, 16, '#3a2a1a', 3, 4);
    if (!empty) { const R = rng(r * 13 + x0); let x = x0 + 24; while (x < x0 + 480) { const w = 30 + R() * 26, h = 90 + R() * 36; const c = ['#8a2a22', '#2a4a7a', '#4a6a3a', '#d8c8a0', '#5a3a6a'][Math.floor(R() * 5)]; bx(g, x, y + 130 - h, w, h, burn > 0.4 && R() < burn ? '#1a1210' : c, 3, 3); x += w + 4; } } } }
  if (burn > 0) { const R2 = rng(7); for (let i = 0; i < 40; i++) { const x = 160 + R2() * 1600, y = 760 - R2() * 600 * Math.min(1, burn * 1.2); const h = (40 + R2() * 90) * burn + Math.sin(t * 9 + i) * 10; if (h < 6) continue; pg(g, [[x - 26, y], [x - 4, y - h * 1.2], [x + 6, y - h * 0.5], [x + 24, y - h], [x + 30, y]], '#ff6a1c', 0); pg(g, [[x - 12, y], [x + 2, y - h * 0.7], [x + 16, y]], '#ffd24a', 0); } glow(g, 960, 520, 900, '255,120,40', 0.4 * burn); }
  if (o.dim) { g.fillStyle = `rgba(6,6,16,${o.dim})`; g.fillRect(-400, -300, 2720, 1500); }
}

// ---------------------------------------------------------------- кабинет: стена, окно, флаг, стол посередине с бумагами
export function deskRoom(g, t, o = {}) {
  g.fillStyle = vg(g, -300, 1300, o.col || '#c8b898', 0.2); g.fillRect(-400, -300, 2720, 1500); g.fillStyle = vg(g, 880, 300, '#6a5238', 0.25); g.fillRect(-400, 880, 2720, 500); ln(g, [[-400, 880], [2320, 880]], 6);
  for (let y = 120; y < 880; y += 150) ln(g, [[-400, y], [2320, y]], 2, 'rgba(60,40,20,.18)');
  bx(g, 1300, 160, 340, 420, '#bfe0ee', 8, 8, 0.1); ln(g, [[1470, 160], [1470, 580]], 8); ln(g, [[1300, 370], [1640, 370]], 8);
  bx(g, 330, 200, 160, 110, '#f6f1e4', 6, 5); ln(g, [[350, 235], [470, 235]], 3, '#5a5a6a'); ln(g, [[350, 265], [450, 265]], 3, '#5a5a6a');
  const cx = o.tx ?? 960; bx(g, cx - 290, 800, 580, 36, '#7a5236', 6, 5); bx(g, cx - 260, 836, 520, 220, '#8a6242', 6, 5);
  bx(g, cx - 140, 770, 180, 30, '#f4efe2', 3, 4); bx(g, cx + 60, 760, 110, 40, '#2a4a7a', 3, 4);
  if (o.dim) { g.fillStyle = `rgba(6,6,16,${o.dim})`; g.fillRect(-400, -300, 2720, 1500); }
}
