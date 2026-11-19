// Фоны и вставки выпуска «Где на Земле дальше всего от людей» (детальный стиль pro).
import { E, ease, clamp, lerp, noise, shade, rng, OL, fo, rr, vg, hg, bx, el, ln, pg, blob, cone, glow, htxt, scrib, fig } from './pro.js';
import { GEO } from '/projects/ww3toon/scenes/geo.js';

const pop = (t, a, d = 0.4) => (t < a ? 0 : ease.outBack(clamp((t - a) / d)));
// бумажная бирка
export function tag(g, s, x, y, k = 1, o = {}) {
  if (k <= 0) return; const size = o.size ?? 54; g.save(); g.font = `700 ${size}px "Caveat"`; const w = g.measureText(s).width + size * 0.9, h = size * 1.3;
  g.translate(x, y); g.rotate(o.rot ?? -0.03); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, -w / 2 + 6, -h / 2 + 7, w, h, 8); g.fill(); rr(g, -w / 2, -h / 2, w, h, 8); fo(g, o.bg || '#f6efdc', 4);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.col || OL; g.fillText(s, 0, 3); g.restore();
}
// крупный текст с контуром
export function big(g, s, x, y, size, k = 1, col = '#ffffff', rot = -0.03) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `700 ${size}px "Caveat"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = '#141212'; g.strokeText(s, 0, 0); g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); }
export { pop };

// ------------------------------------------------------------------ карта (равнопромежуточная) и глобус
const LAND = '#ecdfbd', SEA = '#86b9d6';
export function mapProj(view) { const [a, b, c, d] = view, sx = 1920 / (c - a), sy = 1080 / (d - b), s = Math.min(sx, sy); const cx = (a + c) / 2, cy = (b + d) / 2; return (lon, lat) => [960 + (lon - cx) * s, 540 - (lat - cy) * s]; }
export function worldMap(g, t, o) {
  const P = mapProj(o.view); const sea = g.createLinearGradient(0, 0, 0, 1080); sea.addColorStop(0, shade(SEA, 0.08)); sea.addColorStop(1, shade(SEA, -0.12)); g.fillStyle = sea; g.fillRect(-500, -500, 2920, 2080);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; for (let lon = -180; lon <= 180; lon += 15) { const [x] = P(lon, 0); g.beginPath(); g.moveTo(x, -500); g.lineTo(x, 1600); g.stroke(); } for (let lat = -90; lat <= 90; lat += 15) { const [, y] = P(0, lat); g.beginPath(); g.moveTo(-500, y); g.lineTo(2500, y); g.stroke(); } g.restore();
  // волны-штрихи
  const R = rng(3); g.save(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = R() * 1920, y = R() * 1080; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y - 8, x + 24, y); g.quadraticCurveTo(x + 36, y + 8, x + 48, y); g.stroke(); } g.restore();
  // суша: тень, заливка, контур
  const draw = (fill, lw, dx = 0, dy = 0, col) => { for (const k in GEO) { const hl = o.hl && o.hl[k]; for (const poly of GEO[k]) { g.beginPath(); poly.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); }); g.closePath(); if (fill) { g.fillStyle = col || (hl ? hl : fill); g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke(); } } } };
  draw('rgba(20,40,60,.25)', 0, 8, 10, 'rgba(20,40,60,.22)'); draw(LAND, 3.5);
  if (o.labels) o.labels.forEach(([s, lo, la, size = 52, col = '#6a5a40']) => { const [x, y] = P(lo, la); htxt(g, s, x, y, size, col); });
}
// метка-«капля» с биркой
export function pin(g, x, y, t, a, label, o = {}) { const k = pop(t, a, 0.45); if (k <= 0) return; g.save(); g.translate(x, y); blob(g, 0, 4, 30, 8, 0.35); g.scale(k, k); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-26, -40, -30, -62, 0, -78); g.bezierCurveTo(30, -62, 26, -40, 0, 0); fo(g, o.col || '#e2483a', 5); el(g, 0, -54, 10, 10, '#fff', 3); g.restore(); if (label) tag(g, label, x + (o.dx ?? 0), y - 120 + (o.dy ?? 0), pop(t, a + 0.15, 0.4), { size: Math.max(56, o.size ?? 56), bg: o.bg }); if (o.ring) { const r = ((t - a) * 0.8) % 1; g.save(); g.globalAlpha = 1 - r; g.beginPath(); g.ellipse(x, y, 30 + r * 90, (30 + r * 90) * 0.35, 0, 0, Math.PI * 2); g.lineWidth = 4; g.strokeStyle = o.col || '#e2483a'; g.stroke(); g.restore(); } }
// пунктир-дуга с подписью расстояния
export function route(g, x0, y0, x1, y1, t, a, d, label, o = {}) { const k = clamp((t - a) / d); if (k <= 0) return; const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * (o.arc ?? 0.18); g.save(); g.setLineDash([18, 14]); g.lineDashOffset = -t * 30; g.lineWidth = 8; g.strokeStyle = o.col || '#e2483a'; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 40 * k; i++) { const u = i / 40, x = (1 - u) ** 2 * x0 + 2 * u * (1 - u) * mx + u * u * x1, y = (1 - u) ** 2 * y0 + 2 * u * (1 - u) * my + u * u * y1; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); if (label && k >= 1) tag(g, label, mx, (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * (o.arc ?? 0.18) * 0.5 - 20, pop(t, a + d, 0.4), { size: o.size ?? 64, bg: '#ffd43b' }); }

// глобус (ортографическая проекция)
export function globe(g, cx, cy, R, lon0, lat0, o = {}) {
  const l0 = lon0 * Math.PI / 180, p0 = lat0 * Math.PI / 180;
  const pr = (lo, la) => { const l = lo * Math.PI / 180, p = la * Math.PI / 180; const c = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0); let x = Math.cos(p) * Math.sin(l - l0), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0); if (c < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; } return [cx + x * R, cy - y * R, c]; };
  blob(g, cx + R * 0.1, cy + R * 1.06, R * 0.9, R * 0.15, 0.35);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); const sg = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); sg.addColorStop(0, shade(SEA, 0.15)); sg.addColorStop(1, shade(SEA, -0.2)); g.fillStyle = sg; g.fill(); g.clip();
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; for (let lo = -180; lo < 180; lo += 30) { g.beginPath(); let st = false; for (let la = -90; la <= 90; la += 5) { const [x, y, c] = pr(lo, la); if (c < 0) { st = false; continue; } st ? g.lineTo(x, y) : g.moveTo(x, y); st = true; } g.stroke(); }
  for (let la = -60; la <= 60; la += 30) { g.beginPath(); let st = false; for (let lo = -180; lo <= 180; lo += 5) { const [x, y, c] = pr(lo, la); if (c < 0) { st = false; continue; } st ? g.lineTo(x, y) : g.moveTo(x, y); st = true; } g.stroke(); }
  for (const k in GEO) for (const poly of GEO[k]) { const pts = poly.map(([lo, la]) => pr(lo, la)); if (pts.every((p) => p[2] < 0)) continue; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = (o.hl && o.hl[k]) || LAND; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OL; g.stroke(); }
  const sh = g.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.2, cx, cy, R * 1.05); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,20,40,.45)'); g.fillStyle = sh; g.fillRect(cx - R, cy - R, R * 2, R * 2);
  g.restore(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.lineWidth = 6; g.strokeStyle = OL; g.stroke();
  return pr;
}

// ------------------------------------------------------------------ квартира героя
export function apartment(g, t, o = {}) {
  g.fillStyle = vg(g, 0, 900, '#c9b89a', 0.18); g.fillRect(-400, -300, 2720, 1300);
  g.save(); g.globalAlpha = 0.12; for (let x = -380; x < 2320; x += 90) { ln(g, [[x, -300], [x, 860]], 14, '#8a6a4a'); } g.restore();
  // окно с ночным городом
  bx(g, 1180, 150, 520, 470, '#6c4e36', 8, 6); rr(g, 1206, 176, 468, 418, 4); const sk = g.createLinearGradient(0, 176, 0, 594); sk.addColorStop(0, '#16224a'); sk.addColorStop(1, '#3a3f6e'); fo(g, sk, 4);
  g.save(); rr(g, 1206, 176, 468, 418, 4); g.clip(); const R = rng(8); for (let i = 0; i < 9; i++) { const x = 1200 + i * 56, h = 140 + R() * 200; g.fillStyle = '#20264a'; g.fillRect(x, 594 - h, 50, h); for (let r = 0; r < h / 26 - 1; r++) for (let c = 0; c < 3; c++) if (R() < 0.45) { g.fillStyle = R() < 0.5 ? '#ffd76a' : '#ffe9a8'; g.fillRect(x + 6 + c * 15, 600 - h + r * 26, 8, 12); } } el(g, 1590, 240, 26, 26, '#f6f0d6', 0); g.restore();
  ln(g, [[1440, 176], [1440, 594]], 8, '#6c4e36'); ln(g, [[1206, 385], [1674, 385]], 8, '#6c4e36'); bx(g, 1160, 612, 560, 26, '#e9e0ce', 4, 5);
  // занавески
  pg(g, [[1150, 130], [1230, 130], [1200, 660], [1130, 660]], vg(g, 130, 530, '#b44a3c', 0.15)); pg(g, [[1650, 130], [1730, 130], [1750, 660], [1680, 660]], vg(g, 130, 530, '#b44a3c', 0.15)); ln(g, [[1120, 128], [1760, 128]], 10);
  // полка с книгами
  bx(g, 120, 260, 560, 22, '#7a5236', 4, 5); bx(g, 120, 440, 560, 22, '#7a5236', 4, 5); const RB = rng(4); let x = 140; while (x < 650) { const w = 22 + RB() * 18, h = 110 + RB() * 50; bx(g, x, 260 - h, w, h, ['#c8453a', '#3a6aa8', '#e0b33a', '#5a8a4a', '#8a5a9a', '#e8e2cf'][Math.floor(RB() * 6)], 3, 3, 0.1); x += w + 3; } x = 140; while (x < 650) { const w = 22 + RB() * 18, h = 100 + RB() * 50; if (RB() < 0.15) { el(g, x + 30, 440 - 30, 30, 30, '#5f8a4a', 4); x += 70; continue; } bx(g, x, 440 - h, w, h, ['#c8453a', '#3a6aa8', '#e0b33a', '#5a8a4a', '#e8e2cf'][Math.floor(RB() * 5)], 3, 3, 0.1); x += w + 3; }
  // рамка с картой мира
  bx(g, 760, 220, 300, 210, '#3a2a20', 6, 5); rr(g, 778, 238, 264, 174, 3); fo(g, '#e9dcb8', 3); g.save(); g.globalAlpha = 0.7; el(g, 850, 320, 40, 50, '#9ab87a', 0); el(g, 960, 300, 60, 34, '#9ab87a', 0); el(g, 1000, 360, 26, 20, '#9ab87a', 0); g.restore();
  // часы
  el(g, 900, 120, 46, 46, '#f2eee3', 5); ln(g, [[900, 120], [900, 92]], 5); ln(g, [[900, 120], [920 + Math.sin(t) * 0, 132]], 4);
  // пол, плинтус
  g.fillStyle = vg(g, 860, 300, '#8a6446', 0.2); g.fillRect(-400, 860, 2720, 400); ln(g, [[-400, 860], [2320, 860]], 6); for (let x2 = -400; x2 < 2320; x2 += 160) ln(g, [[x2, 862], [x2 - 60, 1200]], 3, 'rgba(0,0,0,.18)');
  // батарея
  bx(g, 1240, 690, 400, 150, '#e9e4da', 10, 5, 0.2); for (let i = 0; i < 9; i++) ln(g, [[1270 + i * 42, 700], [1270 + i * 42, 830]], 4, 'rgba(0,0,0,.18)');
  // растение
  if (!o.noPlant) { pg(g, [[1780, 860], [1880, 860], [1860, 760], [1800, 760]], '#c8653a'); [[-0.6, 1], [-0.2, 1.2], [0.3, 1.1], [0.7, 0.9]].forEach(([a, l]) => { g.save(); g.translate(1830, 760); g.rotate(a + Math.sin(t + a) * 0.03); g.beginPath(); g.ellipse(0, -90 * l, 26, 90 * l, 0, 0, Math.PI * 2); fo(g, '#4f8a4a', 4); ln(g, [[0, 0], [0, -170 * l]], 3, '#2f5a2a'); g.restore(); }); }
}
export function deskFront(g, t, o = {}) {
  // стол с ноутбуком и лампой (перед героем)
  bx(g, 260, 760, 980, 40, '#9a6a44', 6, 5); bx(g, 300, 800, 40, 260, '#7a5236', 4, 5); bx(g, 1160, 800, 40, 260, '#7a5236', 4, 5);
  g.save(); g.translate(640, 760); pg(g, [[-150, 0], [150, 0], [130, -14], [-130, -14]], '#9aa0a6', 4); pg(g, [[-130, -14], [130, -14], [150, -190], [-110, -190]], '#4a4f56', 5); pg(g, [[-112, -28], [118, -28], [134, -176], [-96, -176]], o.glow ? '#cfe8ff' : '#2a3a5a', 3); g.restore(); if (o.glow) glow(g, 660, 680, 260, '160,210,255', 0.25);
  ln(g, [[1060, 760], [1100, 600], [1010, 540]], 9, '#2a2a2a'); g.beginPath(); g.moveTo(960, 520); g.lineTo(1060, 500); g.lineTo(1050, 580); g.closePath(); fo(g, '#3a6aa8'); cone(g, 1010, 560, 60, 360, 220, '255,230,160', 0.22);
  // кружка и бумаги
  bx(g, 860, 700, 56, 62, '#e9e4da', 10, 4); ln(g, [[916, 716], [936, 724], [934, 746], [914, 748]], 5); g.save(); g.translate(400, 752); g.rotate(-0.08); bx(g, -70, -14, 140, 18, '#f4efe2', 2, 3); g.restore();
}

// ------------------------------------------------------------------ вставки: телефон
export function phoneHand(g, t, o = {}) {
  g.fillStyle = vg(g, 0, 1080, o.bg || '#3a3f4a', 0.25); g.fillRect(-100, -100, 2120, 1280); blob(g, 960, 980, 600, 120, 0.4);
  const sh = Math.sin(t * 50) * (o.ring ? 6 : 0); g.save(); g.translate(960 + sh, 560); g.rotate(-0.06);
  rr(g, -230, -420, 460, 840, 60); fo(g, '#1d1f24', 7); rr(g, -205, -390, 410, 780, 40); fo(g, o.screen || '#f4f6fb', 4);
  if (o.call) { el(g, 0, -170, 90, 90, '#c9d3e6', 4); fig(g, 0, -40, 0.26, { hair: 'bald', hairC: '#6a5a4a', body: 'uniform', coat: '#3a3f4a', boards: false, expr: 'angry', noShadow: true, seed: 9 }, t); htxt(g, 'Начальник', 0, 40, 72, OL); htxt(g, 'входящий вызов', 0, 100, 40, '#7a7f8a'); el(g, -110, 270, 50, 50, '#e2483a', 4); el(g, 110, 270, 50, 50, '#4fb85a', 4); }
  if (o.notes) { const n = Math.min(6, Math.floor(t * 3.2) + 1); for (let i = 0; i < n; i++) { const y = -330 + i * 118; bx(g, -185, y, 370, 100, '#ffffff', 16, 3, 0.05); el(g, -140, y + 50, 26, 26, ['#4fb85a', '#3a8ae0', '#e2483a', '#e0b33a'][i % 4], 3); scrib(g, -100, y + 32, 250, 2, 30, '#7a7f8a', 4, i + 2); } const c = Math.min(99, Math.floor(t * 40) + 3); el(g, 190, -400, 64, 64, '#e2483a', 5); htxt(g, c >= 99 ? '99+' : String(c), 190, -398, 54, '#fff'); }
  g.restore();
  // кисть
  g.save(); g.translate(960 + sh, 560); g.beginPath(); g.ellipse(-250, 160, 70, 120, 0.3, 0, Math.PI * 2); fo(g, '#f1c8a2', 6); g.beginPath(); g.ellipse(250, 120, 44, 70, -0.4, 0, Math.PI * 2); fo(g, '#f1c8a2', 6); g.beginPath(); g.ellipse(255, 230, 40, 60, -0.3, 0, Math.PI * 2); fo(g, '#f1c8a2', 6); g.restore();
  if (o.ring) for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha = 0.6; g.beginPath(); g.arc(960, 560, 520 + i * 40 + ((t * 120) % 40), -0.5, 0.5); g.lineWidth = 6; g.strokeStyle = '#ffd43b'; g.stroke(); g.beginPath(); g.arc(960, 560, 520 + i * 40 + ((t * 120) % 40), Math.PI - 0.5, Math.PI + 0.5); g.stroke(); g.restore(); }
}

// ------------------------------------------------------------------ природа: тайга / пустыня / Антарктида
export function taiga(g, t) { const sk = g.createLinearGradient(0, 0, 0, 800); sk.addColorStop(0, '#9fc3dd'); sk.addColorStop(1, '#e8eef4'); g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400); g.fillStyle = '#c7d3df'; g.beginPath(); g.moveTo(-300, 620); for (let x = -300; x <= 2220; x += 100) g.lineTo(x, 560 - Math.sin(x * 0.005) * 60); g.lineTo(2220, 1300); g.lineTo(-300, 1300); g.fill();
  const R = rng(5); for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) { const x = -260 + i * 90 + R() * 40 + row * 30, y = 640 + row * 150, h = 160 + R() * 80 + row * 60; ln(g, [[x, y], [x, y - 30]], 12, '#3a2a20'); for (let k = 0; k < 3; k++) { const yy = y - 30 - k * h * 0.25, w = h * (0.3 - k * 0.07); pg(g, [[x, yy - h * 0.4], [x + w, yy], [x - w, yy]], shade('#2f5a44', -row * 0.06), 4); ln(g, [[x - w * 0.6, yy - 4], [x + w * 0.6, yy - 4]], 7, '#f4f7fb'); } }
  g.fillStyle = '#f4f7fb'; g.fillRect(-300, 1000, 2520, 300); }
export function desert(g, t) { const sk = g.createLinearGradient(0, 0, 0, 700); sk.addColorStop(0, '#f2b25a'); sk.addColorStop(1, '#fbe2a8'); g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400); el(g, 1500, 260, 110, 110, '#fff4c8', 0); glow(g, 1500, 260, 420, '255,240,180', 0.5);
  [['#e7b56a', 640, 0.004], ['#dca55a', 760, 0.006], ['#cf944a', 900, 0.003]].forEach(([c, y, f]) => { g.beginPath(); g.moveTo(-300, y); for (let x = -300; x <= 2220; x += 40) g.lineTo(x, y - Math.sin(x * f + y) * 70); g.lineTo(2220, 1300); g.lineTo(-300, 1300); g.closePath(); fo(g, c, 5); });
const k = (t * 0.5) % 1; g.save(); g.globalAlpha = 0.3; ln(g, [[200, 700 + k * 30], [1700, 680 + k * 30]], 3, '#fff'); g.restore(); }
export function antarctic(g, t) { const sk = g.createLinearGradient(0, 0, 0, 700); sk.addColorStop(0, '#7fb2e6'); sk.addColorStop(1, '#dff0fb'); g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400);
  pg(g, [[-300, 700], [200, 420], [520, 560], [900, 380], [1300, 600], [1700, 440], [2220, 640], [2220, 1300], [-300, 1300]], vg(g, 380, 900, '#eef6fc', 0.08)); ln(g, [[200, 420], [260, 600]], 4, 'rgba(90,140,190,.5)'); ln(g, [[900, 380], [960, 560]], 4, 'rgba(90,140,190,.5)');
  g.fillStyle = '#ffffff'; g.fillRect(-300, 860, 2520, 400); ln(g, [[-300, 860], [2220, 860]], 4, 'rgba(90,140,190,.6)');
  [[700, 900], [790, 920], [860, 896]].forEach(([x, y], i) => { g.save(); g.translate(x, y + Math.abs(Math.sin(t * 4 + i)) * -6); el(g, 0, -60, 34, 62, '#1d1f24', 4); el(g, 6, -54, 22, 46, '#ffffff', 0); el(g, 0, -126, 26, 26, '#1d1f24', 4); pg(g, [[18, -128], [40, -122], [18, -118]], '#f2a23a', 2); el(g, 8, -132, 4, 4, '#fff', 0); el(g, -12, 0, 14, 6, '#f2a23a', 2); el(g, 14, 0, 14, 6, '#f2a23a', 2); g.restore(); }); }

// ------------------------------------------------------------------ космос и Луна
export function moonSpace(g, t, o = {}) { g.fillStyle = '#050712'; g.fillRect(-300, -300, 2520, 1700); const R = rng(9); for (let i = 0; i < 260; i++) el(g, -200 + R() * 2320, -200 + R() * 1480, 1 + R() * 2, 1 + R() * 2, `rgba(255,255,255,${0.3 + R() * 0.6})`, 0);
  el(g, 1650, 200, 50, 50, '#3f7fd0', 4); g.save(); g.globalAlpha = 0.8; el(g, 1640, 190, 22, 14, '#5aa04a', 0); g.restore();
  g.save(); g.beginPath(); g.arc(760, 1260, 760, 0, Math.PI * 2); g.fillStyle = vg(g, 500, 1500, '#c9c6bd', 0.25); g.fill(); g.clip(); const RC = rng(2); for (let i = 0; i < 40; i++) { const x = 100 + RC() * 1400, y = 520 + RC() * 900, r = 14 + RC() * 60; el(g, x, y, r, r * 0.6, 'rgba(120,115,105,.35)', 3); } const sh = g.createLinearGradient(0, 0, 1520, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.55)'); g.fillStyle = sh; g.fillRect(0, 500, 1520, 1500); g.restore(); g.beginPath(); g.arc(760, 1260, 760, 0, Math.PI * 2); g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); }
export function capsule(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.15 + Math.sin(t * 0.5) * 0.03); pg(g, [[-140, -60], [-140, 60], [60, 60], [60, -60]], hg(g, -140, 200, '#d6d8dc', 0.2)); pg(g, [[60, -60], [60, 60], [190, 26], [190, -26]], hg(g, 60, 130, '#e9e4d6', 0.15)); pg(g, [[-140, -46], [-200, -66], [-200, 66], [-140, 46]], '#6a6e74'); for (let i = -110; i < 50; i += 40) ln(g, [[i, -60], [i, 60]], 3, 'rgba(0,0,0,.2)'); el(g, 140, -6, 10, 8, '#7fd0ff', 3); bx(g, -70, -92, 90, 30, '#c8a24a', 4, 3); glow(g, -210, 0, 70, '255,180,90', 0.4); g.restore(); }

// ------------------------------------------------------------------ море, корабль, шторм
export function sea(g, t, o = {}) { const storm = o.storm; if (o.sky !== false) { const sk = g.createLinearGradient(0, 0, 0, 640); if (storm) { sk.addColorStop(0, '#2a3040'); sk.addColorStop(1, '#5a6070'); } else { sk.addColorStop(0, '#8fc6ea'); sk.addColorStop(1, '#dcefff'); } g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400); }
  if (o.mid) o.mid();
  if (o.sky === false) {} else if (!storm) { el(g, 1600, 180, 70, 70, '#fff6d0', 0); glow(g, 1600, 180, 300, '255,240,200', 0.4); [[300, 160], [900, 120], [1300, 240]].forEach(([x, y], i) => { const xx = x + Math.sin(t * 0.2 + i) * 20; el(g, xx, y, 110, 34, '#ffffff', 0); el(g, xx + 60, y - 20, 70, 30, '#ffffff', 0); }); }
  else { const R = rng(4); for (let i = 0; i < 6; i++) el(g, i * 380 - 100, 120 + R() * 80, 260, 90, '#3a4152', 0); g.save(); g.globalAlpha = 0.5; g.strokeStyle = '#c9d3e6'; g.lineWidth = 3; for (let i = 0; i < 120; i++) { const x = (R() * 2300 + t * 300) % 2300 - 200, y = (R() * 1200 + t * 900) % 1200 - 100; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 18, y + 46); g.stroke(); } g.restore(); if ((t * 0.9) % 2 < 0.08) { g.save(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-300, -300, 2520, 1400); g.restore(); pg(g, [[1400, 0], [1360, 180], [1420, 180], [1370, 380]], '#fff8c0', 0); } }
  const base = 620; for (let L = 0; L < 4; L++) { const y = base + L * 110, amp = (storm ? 40 : 14) + L * 6, col = shade(storm ? '#2f4a66' : '#3f7fb8', -L * 0.06); g.beginPath(); g.moveTo(-300, 1400); for (let x = -300; x <= 2220; x += 30) g.lineTo(x, y + Math.sin(x * 0.008 + t * (1.2 + L * 0.2) + L) * amp); g.lineTo(2220, 1400); g.closePath(); fo(g, col, 4); if (L < 3) { g.save(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4; for (let x = -280; x < 2200; x += 260) { const yy = y + Math.sin(x * 0.008 + t * (1.2 + L * 0.2) + L) * amp; g.beginPath(); g.moveTo(x, yy + 14); g.lineTo(x + 50, yy + 14); g.stroke(); } g.restore(); } if (L === 1 && o.ship) o.ship(); } }
export function ship(g, x, y, s, t, o = {}) { const roll = Math.sin(t * (o.storm ? 2.2 : 1.1)) * (o.storm ? 0.12 : 0.03), bob = Math.sin(t * 1.4) * (o.storm ? 18 : 6); g.save(); g.translate(x, y + bob); g.rotate(roll); g.scale(s, s);
  pg(g, [[-300, -40], [320, -40], [260, 70], [-260, 70]], vg(g, -40, 110, '#c8453a', 0.2)); ln(g, [[-290, -10], [300, -10]], 6, '#f2ece0'); bx(g, -120, -170, 240, 130, '#f2ece0', 8, 5); for (let i = 0; i < 4; i++) bx(g, -100 + i * 55, -140, 34, 30, '#7fc0ea', 4, 3); bx(g, -60, -240, 120, 70, '#e9e4da', 6, 5); bx(g, 40, -300, 46, 80, '#2a2a2a', 4, 4); ln(g, [[180, -40], [180, -260]], 8); ln(g, [[180, -230], [-180, -40]], 3); bx(g, 160, -100, 140, 60, '#2b5a9a', 4, 4);
  for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i * 0.33) % 1; g.save(); g.globalAlpha = 0.6 * (1 - k); el(g, 63 - k * 120, -320 - k * 160, 30 + k * 40, 22 + k * 30, '#d8dde4', 0); g.restore(); }
  g.restore(); }
export function calendarDays(g, x, y, n) { bx(g, x - 120, y - 140, 240, 280, '#f6f1e4', 10, 6); bx(g, x - 120, y - 140, 240, 70, '#c8453a', 10, 6); htxt(g, 'день', x, y - 104, 50, '#fff'); htxt(g, String(n), x, y + 30, 170, OL); }

// ------------------------------------------------------------------ Тристан: вид острова сверху/сбоку и деревня
export function islandWide(g, t, o = {}) { sea(g, t, {}); const cx = 960, cy = 640;
  g.beginPath(); g.ellipse(cx, cy + 40, 640, 120, 0, 0, Math.PI * 2); fo(g, 'rgba(255,255,255,.5)', 0);
  g.beginPath(); g.moveTo(cx - 640, cy + 40); g.bezierCurveTo(cx - 520, cy - 60, cx - 200, cy - 330, cx - 40, cy - 380); g.lineTo(cx + 40, cy - 380); g.bezierCurveTo(cx + 200, cy - 330, cx + 520, cy - 60, cx + 640, cy + 40); g.closePath(); fo(g, vg(g, cy - 380, 420, '#5f8a4a', 0.25));
  g.beginPath(); g.moveTo(cx - 130, cy - 300); g.lineTo(cx - 40, cy - 380); g.lineTo(cx + 40, cy - 380); g.lineTo(cx + 130, cy - 300); g.quadraticCurveTo(cx + 60, cy - 280, cx, cy - 320); g.quadraticCurveTo(cx - 60, cy - 280, cx - 130, cy - 300); g.closePath(); fo(g, '#f4f7fb', 4);
  [[cx - 420, cy - 70], [cx + 300, cy - 120]].forEach(([x, y]) => ln(g, [[x, y], [x + 40, y + 60]], 4, 'rgba(40,60,30,.4)'));
  if (o.erupt) { for (let i = 0; i < 9; i++) { const k = (t * 0.35 + i / 9) % 1; g.save(); g.globalAlpha = 0.85 * (1 - k); el(g, cx + Math.sin(i * 2.1) * 60 * k + k * 120, cy - 400 - k * 380, 70 + k * 160, 50 + k * 110, i % 2 ? '#5a5652' : '#77726c', 0); g.restore(); } glow(g, cx, cy - 380, 160, '255,120,40', 0.7); [[-40, -360, -120, -200], [30, -360, 140, -180]].forEach(([a, b, c, d]) => ln(g, [[cx + a, cy + b], [cx + (a + c) / 2, cy + (b + d) / 2 + 10], [cx + c, cy + d]], 14, '#ff7a2a')); }
  // облако на вершине
  const cxx = cx + Math.sin(t * 0.3) * 30; [[-90, -400, 120, 40], [30, -420, 140, 46], [140, -396, 90, 32]].forEach(([dx, dy, rx, ry]) => el(g, cxx + dx, cy + dy, rx, ry, 'rgba(255,255,255,.92)', 0));
  // деревня на плато
  const R = rng(6); for (let i = 0; i < 12; i++) { const x = cx - 470 + i * 26 + R() * 10, y = cy - 30 - R() * 26; bx(g, x, y, 20, 14, '#f2ece0', 2, 2); pg(g, [[x - 3, y], [x + 10, y - 10], [x + 23, y]], ['#c8453a', '#3a8a5a', '#3a6aa8'][i % 3], 2); }
  if (o.noRunway) { tag(g, '✈', cx + 380, cy - 230, pop(t, o.noRunway, 0.4), { size: 90 }); const k = clamp((t - o.noRunway - 0.3) / 0.3); if (k > 0) { ln(g, [[cx + 320, cy - 290], [cx + 320 + 120 * k, cy - 290 + 120 * k]], 14, '#e2483a'); if (k >= 1) ln(g, [[cx + 440, cy - 290], [cx + 440 - 120 * clamp((t - o.noRunway - 0.6) / 0.3), cy - 290 + 120 * clamp((t - o.noRunway - 0.6) / 0.3)]], 14, '#e2483a'); } }
}
// деревня крупнее: домики, каменные изгороди, коровы, картофельные грядки, вулкан за ними
export function village(g, t, o = {}) {
  const sk = g.createLinearGradient(0, 0, 0, 600); sk.addColorStop(0, '#9fcbe6'); sk.addColorStop(1, '#e6f2f8'); g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400);
  g.beginPath(); g.moveTo(-300, 640); g.bezierCurveTo(200, 300, 700, -40, 1100, -60); g.bezierCurveTo(1500, -40, 1900, 200, 2220, 480); g.lineTo(2220, 1300); g.lineTo(-300, 1300); g.closePath(); fo(g, vg(g, -60, 800, '#4f7a42', 0.25));
  [[900, -40, 260, 70], [1180, -60, 240, 64], [1040, -110, 200, 60]].forEach(([x, y, rx, ry]) => el(g, x + Math.sin(t * 0.3) * 20, y, rx, ry, 'rgba(255,255,255,.95)', 0));
  for (let i = 0; i < 6; i++) ln(g, [[200 + i * 300, 440 - i * 20], [260 + i * 300, 640]], 4, 'rgba(30,50,20,.25)');
  g.fillStyle = vg(g, 600, 700, '#7fb05a', 0.2); g.fillRect(-300, 620, 2520, 700); ln(g, [[-300, 622], [2220, 622]], 4);
  // картофельные грядки
  for (let r = 0; r < 4; r++) { const y = 660 + r * 26; g.save(); g.fillStyle = '#7a5a3a'; g.fillRect(1500, y, 520, 14); g.restore(); for (let x = 1510; x < 2010; x += 34) el(g, x, y - 2, 12, 9, '#4f8a3a', 2); }
  // каменные изгороди
  for (const [x0, y0, x1] of [[-200, 760, 700], [900, 740, 1420]]) for (let x = x0; x < x1; x += 46) el(g, x, y0 + Math.sin(x) * 4, 26, 16, '#9a9488', 3);
  // домики
  const H = o.houses || [[120, 720], [380, 690], [640, 715], [1060, 700], [1300, 720]]; H.forEach(([x, y], i) => house(g, x, y, ['#c8453a', '#3a8a5a', '#3a6aa8', '#e0a83a', '#8a4a7a'][i % 5], i));
  // табличка
  if (o.sign) { g.save(); g.translate(860, 860); ln(g, [[0, 0], [0, -150]], 10, '#5a3a22'); bx(g, -210, -230, 420, 96, '#f6efdc', 6, 5); htxt(g, 'Эдинбург семи морей', 0, -181, 46, OL); g.restore(); }
  // коровы
  [[1720, 900, 1], [520, 900, -1]].forEach(([x, y, f], i) => { g.save(); g.translate(x + Math.sin(t * 0.3 + i) * 10, y); g.scale(f, 1); ln(g, [[-50, 0], [-50, -50]], 10); ln(g, [[50, 0], [50, -50]], 10); bx(g, -80, -110, 160, 70, '#f4efe4', 30, 5); el(g, -20, -90, 22, 16, '#2a2a2a', 0); el(g, 30, -76, 16, 12, '#2a2a2a', 0); el(g, 96, -110, 34, 30, '#f4efe4', 5); el(g, 112, -102, 14, 10, '#e8a0a0', 2); g.restore(); });
  g.fillStyle = vg(g, 1000, 120, '#6aa04a', 0.2); g.fillRect(-300, 1000, 2520, 300);
}
export function house(g, x, y, roof, i = 0) { blob(g, x + 10, y + 100, 150, 20, 0.25); bx(g, x - 110, y - 10, 220, 110, '#f4efe4', 4, 5, 0.12); pg(g, [[x - 130, y - 6], [x, y - 90], [x + 130, y - 6]], vg(g, y - 90, 84, roof, 0.2)); for (let k = -1; k <= 1; k += 2) bx(g, x + k * 60 - 20, y + 20, 40, 36, '#7fc0ea', 3, 4); bx(g, x - 18, y + 30, 36, 70, '#7a5236', 3, 4); bx(g, x + 50, y - 80, 22, 40, '#7a6a5a', 2, 3); }

// ------------------------------------------------------------------ метеостанция на острове Гоф
export function station(g, t, o = {}) {
  const sk = g.createLinearGradient(0, 0, 0, 640); sk.addColorStop(0, '#93b7cf'); sk.addColorStop(1, '#dfeaf0'); g.fillStyle = sk; g.fillRect(-300, -300, 2520, 1400);
  [[300, 140], [1100, 90], [1700, 170]].forEach(([x, y], i) => el(g, x + Math.sin(t * 0.25 + i) * 30, y, 180, 50, 'rgba(255,255,255,.8)', 0));
  // альбатрос
  { const bx0 = (t * 120) % 2600 - 300, by = 260 + Math.sin(t) * 20, w = Math.sin(t * 3) * 10; ln(g, [[bx0 - 120, by - w], [bx0 - 30, by], [bx0, by + 6], [bx0 + 30, by], [bx0 + 120, by - w]], 7); el(g, bx0, by + 6, 22, 9, '#f4f4f0', 3); }
  // море и утёс
  g.fillStyle = vg(g, 640, 500, '#3f6f9a', 0.25); g.fillRect(-300, 640, 2520, 700);
  g.beginPath(); g.moveTo(-300, 520); g.lineTo(1300, 470); g.bezierCurveTo(1500, 470, 1560, 520, 1600, 640); g.lineTo(1660, 1300); g.lineTo(-300, 1300); g.closePath(); fo(g, vg(g, 470, 830, '#6a6a5e', 0.25)); g.beginPath(); g.moveTo(-300, 520); g.lineTo(1300, 470); g.bezierCurveTo(1450, 470, 1520, 500, 1560, 560); g.lineTo(-300, 600); g.closePath(); fo(g, '#7a9a4a', 4);
  for (let i = 0; i < 40; i++) { const x = -260 + i * 46, y = 560 + (i % 3) * 8; ln(g, [[x, y], [x - 10, y - 34]], 4, '#5f7a3a'); ln(g, [[x, y], [x + 8, y - 30]], 4, '#5f7a3a'); }
  for (let i = 0; i < 5; i++) { const k = (t * 0.5 + i * 0.2) % 1; g.save(); g.globalAlpha = 1 - k; el(g, 1640 + i * 30, 900 - k * 120, 40 + k * 60, 16, '#ffffff', 0); g.restore(); }
  // домик станции, мачта, будка, тарелка
  bx(g, 420, 360, 560, 220, '#e9e4da', 6, 6, 0.14); pg(g, [[400, 364], [700, 270], [1000, 364]], vg(g, 270, 94, '#3a6aa8', 0.2)); for (let i = 0; i < 4; i++) bx(g, 460 + i * 130, 410, 80, 64, '#7fc0ea', 4, 4); bx(g, 880, 470, 60, 110, '#7a5236', 3, 4);
  ln(g, [[1120, 580], [1120, 120]], 12); for (let y = 160; y < 580; y += 60) ln(g, [[1100, y], [1140, y + 40]], 4); g.save(); g.translate(1120, 120); const a = t * 9; for (let k = 0; k < 3; k++) { const an = a + k * 2.094; ln(g, [[0, 0], [Math.cos(an) * 46, Math.sin(an) * 14]], 5); el(g, Math.cos(an) * 46, Math.sin(an) * 14, 12, 9, '#e9e4da', 3); } g.restore(); g.save(); g.translate(1200, 150); g.rotate(Math.sin(t) * 0.3); pg(g, [[0, -14], [70, 0], [0, 14]], '#e2483a'); g.restore();
  bx(g, 1220, 470, 110, 110, '#f6f4ee', 4, 5); for (let k = 0; k < 6; k++) ln(g, [[1230, 486 + k * 16], [1320, 486 + k * 16]], 3, '#b8b4aa'); ln(g, [[1250, 580], [1250, 620]], 6); ln(g, [[1300, 580], [1300, 620]], 6);
  g.save(); g.translate(300, 470); g.beginPath(); g.ellipse(0, 0, 70, 70, -0.5, -1.2, 1.9); fo(g, '#e9e4da'); ln(g, [[0, 0], [40, -40]], 5); ln(g, [[0, 60], [0, 110]], 8); g.restore();
}
