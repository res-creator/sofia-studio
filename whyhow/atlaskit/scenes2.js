// atlaskit scenes, set 2 (EP02 Yakutsk): countdown, myth quiz, city compare, ring calendar, river crossing map,
// district heating, Shergin's shaft, frostbite chart, vapour capacity; overlays 'timer' and 'thermo' live in scenes.js overlays via hook.
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, key, hexA, rr, text, measure, wrap, chip, navyBg, snow, arrow, fmtNum, hash } = K;
const S = require('./scenes');
const pop = (t, at, dur = 0.45) => E.back(clamp(seg(t, at, at + dur)));
const fade = (t, at, dur = 0.4) => E.out(clamp(seg(t, at, at + dur)));

// big countdown number "7 … 1" with a ring that fills, then the trick title
function countdown(ctx, t, d, p) {
  navyBg(ctx, t); snow(ctx, t, 70, 0.4);
  const cx = W / 2 - 330, cy = H / 2, r = 230; const u = E.out(clamp(seg(t, 0.05, 0.9)));
  ctx.save(); ctx.lineWidth = 18; ctx.strokeStyle = hexA(C.iceL, 0.18); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = C.yellow; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + u * 2 * Math.PI * (8 - p.n) / 7); ctx.stroke(); ctx.restore();
  const s = 0.6 + 0.4 * E.back(clamp(seg(t, 0, 0.5)), 2.2); ctx.save(); ctx.translate(cx, cy + 105); ctx.scale(s, s);
  text(ctx, String(p.n), 0, 0, { size: 330, font: F.head, align: 'center', color: C.cream, shadow: 30 }); ctx.restore();
  text(ctx, 'TRICK', cx + r + 90, cy - 70, { size: 40, font: F.monoB, color: C.iceL, alpha: fade(t, 0.3), ls: 6 });
  wrap(ctx, p.title.toUpperCase(), 92, F.head, 820).forEach((l, i) => text(ctx, l, cx + r + 90, cy + 30 + i * 96, { size: 92, font: F.head, color: C.cream, alpha: fade(t, 0.4 + i * 0.1) }));
}
// MYTH OR TRUE quiz card
function mythq(ctx, t, d, p) {
  if (p.img && K.IMG[p.img]) { K.kenBurns(ctx, K.IMG[p.img], t, d, p.kb || { z: [1.1, 1.2] }); K.darken(ctx, 0.72); K.vignette(ctx, 0.6); } else navyBg(ctx, t);
  chip(ctx, 'MYTH OR TRUE?', W / 2, 200, { size: 64, align: 'center', bg: C.ice, color: C.cream, alpha: fade(t, 0.1) });
  const lines = wrap(ctx, '"' + p.q + '"', 72, F.bold, 1500); lines.forEach((l, i) => text(ctx, l, W / 2, 400 + i * 92, { size: 72, font: F.bold, align: 'center', color: C.cream, alpha: fade(t, 0.3 + i * 0.1), shadow: 12 }));
  const at = p.answerAt || 3; if (t > at) { const s = pop(t, at, 0.4) * 1; ctx.save(); ctx.translate(W / 2, 400 + lines.length * 92 + 150); ctx.rotate(-0.06); ctx.scale(s * 1.0, s * 1.0);
    const col = p.verdict === 'TRUE' ? '#3FB27F' : C.red; ctx.strokeStyle = col; ctx.lineWidth = 12; rr(ctx, -260, -100, 520, 150, 16); ctx.stroke();
    text(ctx, p.verdict, 0, 10, { size: 120, font: F.head, align: 'center', color: col }); ctx.restore();
    if (p.note) text(ctx, p.note, W / 2, H - 110, { size: 38, font: F.bold, align: 'center', color: C.yellow, alpha: fade(t, at + 0.6), maxW: 1700 }); }
  if (p.source) text(ctx, p.source, W / 2, H - 45, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
}
// city thermometers: vertical bars from 0 line (negative go down)
function compare(ctx, t, d, p) {
  navyBg(ctx, t); text(ctx, p.title, W / 2, 150, { size: 60, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const n = p.items.length, gap = 1500 / n, x0 = 210 + gap / 2, zero = p.zeroY || 380, scale = p.scale || 11;
  ctx.strokeStyle = hexA(C.cream, 0.5); ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(180, zero); ctx.lineTo(1740, zero); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, '0' + (p.unit || '°C'), 170, zero + 10, { size: 28, font: F.monoB, align: 'right', color: C.cream });
  p.items.forEach((it, i) => { const at = it.at != null ? it.at : 0.5 + i * 0.7; const u = E.out(clamp(seg(t, at, at + 1.2))); const x = x0 + i * gap; const v = it.v * u;
    const hgt = -v * scale; ctx.fillStyle = it.color || (it.v < -20 ? C.ice : C.iceL); rr(ctx, x - 70, Math.min(zero, zero + hgt), 140, Math.abs(hgt), 10); ctx.fill();
    if (u > 0) text(ctx, (it.v > 0 ? '+' : it.v < 0 ? '−' : '') + fmtNum(Math.abs(v), it.dec || 0) + (p.unit || '°C'), x, it.v < 0 ? zero + hgt + 70 : zero + hgt - 24, { size: 58, font: F.head, align: 'center', color: it.hl ? C.yellow : C.cream, alpha: u });
    text(ctx, it.label, x, it.v < 0 ? zero - 24 : zero + 54, { size: 34, font: F.bold, align: 'center', color: it.hl ? C.yellow : C.iceL, alpha: fade(t, at - 0.2), maxW: gap - 20 }); });
  if (p.note) text(ctx, p.note, W / 2, H - 100, { size: 34, font: F.bold, align: 'center', color: C.yellow, alpha: fade(t, p.noteAt || 3) });
  if (p.source) text(ctx, p.source, W / 2, H - 45, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
}
// year ring: 12 months, highlighted arc (e.g. heating season Sep→May)
function ring(ctx, t, d, p) {
  navyBg(ctx, t, false); const cx = W / 2, cy = H / 2 + 30, r = 300; const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const ang = m => -Math.PI / 2 + m / 12 * 2 * Math.PI;
  ctx.lineWidth = 60; ctx.strokeStyle = hexA(C.iceL, 0.15); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
  const u = E.inOut(clamp(seg(t, 0.6, 3))); let a0 = p.from, a1 = p.to < p.from ? p.to + 12 : p.to; a1 = a0 + (a1 - a0) * u;
  ctx.strokeStyle = p.color || C.orange; ctx.beginPath(); ctx.arc(cx, cy, r, ang(a0), ang(a1)); ctx.stroke();
  M.forEach((m, i) => { const a = ang(i + 0.5); text(ctx, m, cx + Math.cos(a) * (r + 80), cy + Math.sin(a) * (r + 80) + 10, { size: 30, font: F.monoB, align: 'center', color: C.iceL }); });
  text(ctx, p.big, cx, cy + 20, { size: 110, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 2.2) });
  text(ctx, p.sub, cx, cy + 80, { size: 30, font: F.bold, align: 'center', color: C.yellow, alpha: fade(t, 2.5), maxW: 400 });
  text(ctx, p.title, W / 2, 110, { size: 56, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
}
// river crossing: mode keyframes 0 = summer ferry, 1 = winter ice road, 2 = cut off (thin ice / break-up)
function river(ctx, t, d, p) {
  const mode = Math.round(key(p.mode || 0, t));
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mode === 1 ? '#DDE7F1' : mode === 2 ? '#C9D3DC' : '#5E7D4F'); g.addColorStop(1, mode === 1 ? '#C6D3E0' : mode === 2 ? '#AEB9C4' : '#4A6640');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // river band
  ctx.save(); ctx.beginPath(); ctx.moveTo(760, -20); ctx.bezierCurveTo(700, 300, 900, 600, 820, H + 20); ctx.lineTo(1180, H + 20); ctx.bezierCurveTo(1240, 600, 1060, 300, 1120, -20); ctx.closePath();
  ctx.fillStyle = mode === 1 ? '#EEF4FA' : '#3C6E9C'; ctx.fill(); ctx.clip();
  if (mode === 2) for (let i = 0; i < 40; i++) { const x = 700 + hash(i) * 560, y = ((hash(i + 3) * H + t * 40) % (H + 80)) - 40; ctx.fillStyle = '#E8EEF4'; ctx.beginPath(); ctx.ellipse(x, y, 30 + hash(i + 5) * 40, 14 + hash(i + 6) * 18, hash(i) * 3, 0, 7); ctx.fill(); }
  if (mode === 1) { ctx.strokeStyle = '#9AA8B6'; ctx.lineWidth = 26; ctx.setLineDash([2, 0]); ctx.beginPath(); ctx.moveTo(600, 540); ctx.lineTo(1300, 540); ctx.stroke();
    for (let i = 0; i < 3; i++) { const x = lerp(620, 1280, ((t * 0.12) + i / 3) % 1); ctx.fillStyle = '#C0392B'; rr(ctx, x - 28, 528, 56, 24, 4); ctx.fill(); } }
  if (mode === 0) { const x = lerp(820, 1080, 0.5 + 0.5 * Math.sin(t * 0.5)); ctx.fillStyle = '#F2F2F2'; rr(ctx, x - 50, 520, 100, 40, 8); ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 60, 548); ctx.lineTo(x - 140, 560); ctx.stroke(); }
  ctx.restore();
  // banks, city, road
  ctx.fillStyle = '#2B2B2B'; for (let i = 0; i < 14; i++) { const x = 150 + (i % 5) * 90, y = 380 + Math.floor(i / 5) * 90; ctx.fillRect(x, y, 60, 50); }
  chip(ctx, 'YAKUTSK', 140, 330, { size: 46 }); ctx.strokeStyle = '#555'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(1300, 540); ctx.lineTo(1860, 520); ctx.stroke();
  text(ctx, 'ROAD TO THE REST OF RUSSIA', 1840, 490, { size: 26, font: F.monoB, align: 'right', color: C.ink });
  text(ctx, 'LENA', 980, 140, { size: 60, font: F.head, align: 'center', color: mode === 1 ? '#7A8EA2' : C.cream });
  const lab = mode === 0 ? 'SUMMER: FERRY' : mode === 1 ? 'WINTER: ICE ROAD' : 'AUTUMN & SPRING: CUT OFF';
  chip(ctx, lab, W / 2, 1000, { size: 56, align: 'center', bg: mode === 2 ? C.red : C.yellow, color: mode === 2 ? C.cream : C.ink });
  if (mode === 2) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round'; const s = pop(t, 0.2); ctx.translate(980, 540); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-80, -80); ctx.lineTo(80, 80); ctx.moveTo(80, -80); ctx.lineTo(-80, 80); ctx.stroke(); ctx.restore(); }
  text(ctx, 'ILLUSTRATION', 40, H - 30, { size: 22, font: F.monoB, color: hexA(C.ink, 0.6) });
}
// district heating: plant → hot pipes → blocks; flowing dots
function district(ctx, t, d, p) {
  navyBg(ctx, t, false); snow(ctx, t, 50, 0.35); const gy = 760;
  ctx.fillStyle = C.snow; ctx.fillRect(0, gy, W, H - gy);
  // plant
  ctx.fillStyle = '#5B6475'; ctx.fillRect(120, gy - 240, 300, 240); ctx.fillRect(330, gy - 420, 50, 180); ctx.fillRect(250, gy - 380, 45, 140);
  for (let i = 0; i < 6; i++) { const ph = (t * 0.3 + i / 6) % 1; ctx.fillStyle = `rgba(230,236,245,${0.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(355 + ph * 80, gy - 430 - ph * 160, 30 + ph * 50, 0, 7); ctx.fill(); }
  text(ctx, 'POWER STATION (GAS)', 270, gy + 60, { size: 30, font: F.bold, align: 'center', color: C.ink });
  // pipes
  const py = gy - 60; ctx.fillStyle = '#C8CCD2'; rr(ctx, 420, py - 22, 1100, 30, 15); ctx.fill(); rr(ctx, 420, py + 20, 1100, 30, 15); ctx.fill();
  for (let i = 0; i < 24; i++) { const ph = (t * 0.25 + i / 24) % 1; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(lerp(430, 1510, ph), py - 7, 7, 0, 7); ctx.fill(); ctx.fillStyle = C.iceL; ctx.beginPath(); ctx.arc(lerp(1510, 430, ph), py + 35, 7, 0, 7); ctx.fill(); }
  for (let x = 480; x < 1520; x += 140) { ctx.fillStyle = '#8E897F'; ctx.fillRect(x, py + 50, 14, gy - py - 50); }
  // blocks
  for (const [x, h] of [[1500, 330], [1680, 420]]) { ctx.fillStyle = '#C9C2B6'; ctx.fillRect(x, gy - 80 - h, 160, h); ctx.fillStyle = '#8E897F'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 10 + k * 40, gy - 80, 12, 80);
    for (let r = 0; r < Math.floor(h / 60); r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = C.window; ctx.fillRect(x + 20 + c * 48, gy - 80 - h + 20 + r * 60, 28, 34); } }
  text(ctx, 'HOT WATER OUT', 960, py - 40, { size: 30, font: F.monoB, align: 'center', color: C.orange });
  text(ctx, 'COOLED WATER BACK', 960, py + 100, { size: 30, font: F.monoB, align: 'center', color: C.iceL });
  text(ctx, p.title || 'DISTRICT HEATING', W / 2, 110, { size: 60, font: F.head, align: 'center', color: C.cream });
  text(ctx, 'ILLUSTRATION', 40, H - 30, { size: 20, font: F.monoB, color: hexA(C.ink, 0.6) });
}
// Shergin's shaft: depth & year counters while the shaft deepens; Middendorff readings later
function shaft(ctx, t, d, p) {
  const top = 260, maxD = 116.6, px = 4.6; const dig = E.inOut(clamp(seg(t, p.digFrom || 0.5, p.digTo || 8)));
  const g = ctx.createLinearGradient(0, 0, 0, top); g.addColorStop(0, '#0A1222'); g.addColorStop(1, '#22385E'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, top);
  const gg = ctx.createLinearGradient(0, top, 0, H); gg.addColorStop(0, C.permaL); gg.addColorStop(1, C.permaD); ctx.fillStyle = gg; ctx.fillRect(0, top, W, H - top);
  ctx.fillStyle = hexA(C.frost, 0.35); for (let i = 0; i < 80; i++) { ctx.beginPath(); ctx.ellipse(hash(i) * W, top + 30 + hash(i + 9) * 800, 16 + hash(i + 3) * 36, 4 + hash(i + 4) * 4, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = C.snow; ctx.fillRect(0, top - 8, W, 10);
  // hut
  ctx.fillStyle = '#5A4A3A'; ctx.fillRect(900, top - 110, 120, 110); ctx.beginPath(); ctx.moveTo(885, top - 110); ctx.lineTo(960, top - 170); ctx.lineTo(1035, top - 110); ctx.fill();
  const depth = maxD * dig, dy = Math.min(depth * px, H - top - 20); ctx.fillStyle = '#0E1A2C'; ctx.fillRect(940, top, 40, dy);
  // scale
  ctx.strokeStyle = C.cream; ctx.lineWidth = 2; for (let m = 0; m <= 120; m += 20) { const y = top + Math.min(m * px, H - top - 20); ctx.beginPath(); ctx.moveTo(1060, y); ctx.lineTo(1090, y); ctx.stroke(); text(ctx, m + ' m', 1100, y + 9, { size: 24, font: F.monoB, color: C.cream }); }
  const yr = Math.round(lerp(1828, 1837, dig)); text(ctx, String(yr), 300, 420, { size: 150, font: F.head, align: 'center', color: C.cream, shadow: 20 });
  text(ctx, fmtNum(depth, 1) + ' m', 300, 560, { size: 90, font: F.head, align: 'center', color: C.yellow, shadow: 20 });
  text(ctx, 'STILL FROZEN', 300, 640, { size: 40, font: F.bold, align: 'center', color: C.frost, alpha: fade(t, (p.digTo || 8) - 1) });
  if (p.temps) { const a = fade(t, p.temps.at || 9); const pts = [[10, '−11°C'], [60, '−6°C'], [116, '−3°C']];
    for (const [m, s] of pts) { const y = top + Math.min(m * px, H - top - 30); ctx.save(); ctx.globalAlpha = a; chip(ctx, s, 760, y + 14, { size: 36, align: 'right', bg: C.ice, color: C.cream }); ctx.restore(); }
    text(ctx, 'Middendorff, 1844–46', 760, H - 40, { size: 26, font: F.monoB, align: 'right', color: C.cream, alpha: a }); }
  text(ctx, "SHERGIN'S SHAFT · YAKUTSK", W / 2, 200, { size: 34, font: F.monoB, align: 'center', color: C.cream });
  text(ctx, 'ILLUSTRATION · NOT TO SCALE', W - 40, H - 24, { size: 18, font: F.monoB, align: 'right', color: hexA(C.cream, 0.5) });
}
// frostbite chart: horizontal minutes bars for wind-chill bands
function frost(ctx, t, d, p) {
  navyBg(ctx, t); text(ctx, 'HOW FAST BARE SKIN FREEZES', W / 2, 150, { size: 60, font: F.head, align: 'center', color: C.cream });
  const rows = [['−40 to −47', 10, '5–10 MIN'], ['−48 to −54', 5, '2–5 MIN'], ['−55 and colder', 2, 'UNDER 2 MIN']];
  rows.forEach(([lab, m, s], i) => { const at = 0.6 + i * 0.8, u = E.out(clamp(seg(t, at, at + 1))); const y = 330 + i * 190;
    text(ctx, lab + ' (wind chill)', 200, y - 20, { size: 36, font: F.bold, color: C.iceL, alpha: fade(t, at - 0.2) });
    ctx.fillStyle = hexA(C.iceL, 0.12); rr(ctx, 200, y, 1300, 90, 8); ctx.fill(); ctx.fillStyle = i === 2 ? C.red : i === 1 ? C.orange : C.yellow; rr(ctx, 200, y, 1300 * m / 10 * u, 90, 8); ctx.fill();
    text(ctx, s, 200 + 1300 * m / 10 * u + 24, y + 64, { size: 54, font: F.head, color: C.cream, alpha: u }); });
  text(ctx, 'Source: Environment Canada wind-chill table', W / 2, H - 45, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
}
// water vapour capacity: room vs −40
function vapour(ctx, t, d, p) {
  navyBg(ctx, t); text(ctx, 'HOW MUCH WATER VAPOUR AIR CAN HOLD', W / 2, 150, { size: 56, font: F.head, align: 'center', color: C.cream });
  const items = [{ x: 640, v: 20, lab: 'WARM ROOM (+20°C)', s: '~20 g per m³', c: C.iceL }, { x: 1280, v: 0.1, lab: 'AIR AT −40°C', s: '~0.1 g per m³', c: C.yellow }];
  items.forEach((it, i) => { const at = 0.6 + i * 1.2, u = E.out(clamp(seg(t, at, at + 1.2))); const h = Math.max(4, 560 * it.v / 20 * u);
    ctx.fillStyle = hexA(C.iceL, 0.12); rr(ctx, it.x - 130, 300, 260, 560, 12); ctx.fill(); ctx.fillStyle = it.c; rr(ctx, it.x - 130, 860 - h, 260, h, 12); ctx.fill();
    text(ctx, it.lab, it.x, 920, { size: 34, font: F.bold, align: 'center', color: C.cream }); text(ctx, it.s, it.x, 980, { size: 44, font: F.head, align: 'center', color: it.c, alpha: u }); });
  if (t > 3.2) text(ctx, '200× LESS → THE REST FREEZES INTO ICE FOG', W / 2, 250, { size: 44, font: F.head, align: 'center', color: C.yellow, alpha: fade(t, 3.2) });
  text(ctx, 'Source: University of Alaska Fairbanks, Geophysical Institute', W / 2, H - 30, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
}
module.exports = { countdown, mythq, compare, ring, river, district, shaft, frost, vapour };
