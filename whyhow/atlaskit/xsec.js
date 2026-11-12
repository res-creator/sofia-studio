// Cross-section of frozen ground with buildings — the channel's signature "cutaway" graphic.
// xsec(ctx, t, d, p). Animated values are keyframes [[t,v],...] or numbers; all 0..1 unless noted.
// p.house: 'none' | 'stone' | 'block';  keys: season (0 winter..1 summer), activeThaw, thaw (bulb under house), sink, crack,
// piles (0..1 driven), frost, gap (0..1 visible gap), wind, heat, pipes, drift, leak, talik, siph, warm (whole permafrost warms), probe, zoom, fx, fy
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, key, hexA, lerpCol, rr, text, chip, arrow, hash, snow } = K;
const G = 610, AL = 78; // ground surface y, active layer thickness (px)
const v = (p, n, t, def = 0) => (p[n] == null ? def : clamp(key(p[n], t), -10, 10));
function sky(ctx, t, season) {
  const g = ctx.createLinearGradient(0, 0, 0, G); g.addColorStop(0, lerpCol('#0A1222', '#4F7FB8', season)); g.addColorStop(1, lerpCol('#22385E', '#A9C6E6', season));
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, G + 400);
  if (season < 0.5) { // stars + aurora hint
    ctx.save(); ctx.globalAlpha = 1 - season * 2; for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + hash(i) * 0.5})`; ctx.fillRect(hash(i + 1) * W, hash(i + 2) * 330, 2, 2); }
    const a = ctx.createLinearGradient(0, 60, 0, 300); a.addColorStop(0, 'rgba(80,255,180,0)'); a.addColorStop(0.5, 'rgba(80,255,180,0.10)'); a.addColorStop(1, 'rgba(80,255,180,0)');
    ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(0, 200); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 150 + Math.sin(x / 210 + t * 0.3) * 50); ctx.lineTo(W, 330); ctx.lineTo(0, 330); ctx.fill(); ctx.restore(); }
}
function ground(ctx, t, p) {
  const season = v(p, 'season', t), warm = v(p, 'warm', t), at = v(p, 'activeThaw', t, season);
  // permafrost
  const g = ctx.createLinearGradient(0, G + AL, 0, H + 300); g.addColorStop(0, lerpCol(C.permaL, '#7C8FB8', warm)); g.addColorStop(1, lerpCol(C.permaD, '#3E4E78', warm));
  ctx.fillStyle = g; ctx.fillRect(-400, G + AL, W + 800, H + 400);
  // ice lenses
  ctx.fillStyle = hexA(C.frost, 0.35 * (1 - warm * 0.6)); for (let i = 0; i < 90; i++) { const x = hash(i) * (W + 400) - 200, y = G + AL + 20 + hash(i + 9) * 600; ctx.beginPath(); ctx.ellipse(x, y, 18 + hash(i + 3) * 40, 4 + hash(i + 4) * 5, 0, 0, 7); ctx.fill(); }
  // active layer
  ctx.fillStyle = lerpCol('#5D6F8F', C.soil, at); ctx.fillRect(-400, G, W + 800, AL);
  ctx.fillStyle = hexA('#000', 0.15); for (let i = 0; i < 160; i++) ctx.fillRect(hash(i + 50) * (W + 400) - 200, G + hash(i + 51) * AL, 4, 3);
  // surface: snow (winter) / tundra (summer)
  ctx.fillStyle = lerpCol(C.snow, '#6F7B4A', season); ctx.fillRect(-400, G - 10, W + 800, 14);
}
function depthRuler(ctx, p, t) {
  if (p.ruler === false) return; const a = p.rulerA == null ? 1 : key(p.rulerA, t);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(70, G); ctx.lineTo(70, 1010); ctx.stroke();
  for (const [y, s, dy] of [[G, '0 m', -14], [G + AL, '~1 m', 30], [990, '10 m', 9]]) { ctx.beginPath(); ctx.moveTo(62, y); ctx.lineTo(78, y); ctx.stroke(); text(ctx, s, 90, y + dy, { size: 24, font: F.monoB, color: C.cream, shadow: 8 }); }
  ctx.restore();
  text(ctx, 'ACTIVE LAYER', W - 40, G + AL / 2 + 10, { size: 26, font: F.monoB, align: 'right', color: C.cream, alpha: a * 0.9, shadow: 6 });
  text(ctx, 'PERMAFROST', W - 40, G + AL + 70, { size: 30, font: F.monoB, align: 'right', color: C.frost, alpha: a * 0.9, shadow: 6 });
  text(ctx, 'NOT TO SCALE', W - 40, H - 24, { size: 18, font: F.monoB, align: 'right', color: hexA(C.cream, 0.5) });
}
function stoneHouse(ctx, t, p) {
  const thaw = v(p, 'thaw', t), sink = v(p, 'sink', t), crack = v(p, 'crack', t); const cx = 960, w = 560, h = 230;
  if (thaw > 0) { const g = ctx.createRadialGradient(cx, G, 20, cx, G, 380 * thaw + 20); g.addColorStop(0, '#9B6B45'); g.addColorStop(0.7, hexA('#8A5E3D', 0.85)); g.addColorStop(1, hexA('#8A5E3D', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, G, 420 * thaw + 20, 300 * thaw + 10, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = hexA('#9CC3FF', 0.25 * thaw); for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(cx - 300 * thaw + hash(i) * 600 * thaw, G + 40 + hash(i + 2) * 200 * thaw, 22, 6, 0, 0, 7); ctx.fill(); } }
  // heat arrows down
  const heat = v(p, 'heat', t); if (heat > 0) for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1; ctx.save(); ctx.globalAlpha = heat * (1 - ph); arrow(ctx, cx - 180 + i * 120, G - 40 + ph * 40, cx - 180 + i * 120, G + 40 + ph * 120, { color: C.orange, w: 6 }); ctx.restore(); }
  ctx.save(); ctx.translate(cx + w / 2, G); ctx.rotate(sink * 0.06); ctx.translate(-w / 2, sink * 40);
  ctx.fillStyle = C.wall; ctx.fillRect(0, -h, w, h); ctx.fillStyle = C.wallD; ctx.fillRect(0, -h, w, 18); ctx.fillRect(0, -10, w, 10);
  ctx.fillStyle = '#5A4A3A'; ctx.beginPath(); ctx.moveTo(-30, -h); ctx.lineTo(w / 2, -h - 110); ctx.lineTo(w + 30, -h); ctx.closePath(); ctx.fill();
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = C.window; ctx.fillRect(40 + c * 105, -h + 40 + r * 95, 56, 60); ctx.strokeStyle = C.wallD; ctx.lineWidth = 3; ctx.strokeRect(40 + c * 105, -h + 40 + r * 95, 56, 60); }
  if (crack > 0) { ctx.strokeStyle = '#2B2118'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath(); const pts = [[300, -h + 6], [280, -h + 50], [318, -h + 92], [290, -h + 140], [326, -h + 185], [300, -10]]; const n = Math.max(1, Math.floor(crack * pts.length));
    ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  ctx.restore();
}
function block(ctx, t, p) {
  const cx = p.cx || 960, w = 700, floors = 5, fh = 70, gapA = v(p, 'gap', t, 1), gap = 60 + 30 * gapA, piles = v(p, 'piles', t, 1), frost = v(p, 'frost', t), drift = v(p, 'drift', t), leak = v(p, 'leak', t), talik = v(p, 'talik', t);
  const by = G - gap; const bodyH = floors * fh;
  // talik (warm pocket)
  if (talik > 0) { const g = ctx.createRadialGradient(cx, G + 60, 10, cx, G + 60, 360 * talik); g.addColorStop(0, hexA(C.orange, 0.85)); g.addColorStop(0.6, hexA('#B5653A', 0.6)); g.addColorStop(1, hexA('#B5653A', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, G + 40, 380 * talik, 260 * talik, 0, 0, Math.PI); ctx.fill(); }
  // piles
  const n = 7, depth = 330; for (let i = 0; i < n; i++) { const x = cx - w / 2 + 40 + i * (w - 80) / (n - 1); const bottom = lerp(by, G + depth, E.out(piles));
    if (frost > 0) { ctx.fillStyle = hexA(C.frost, 0.55 * frost); rr(ctx, x - 22, G + AL, 44, Math.max(0, bottom - G - AL), 18); ctx.fill(); }
    ctx.fillStyle = C.concrete; ctx.fillRect(x - 11, by, 22, bottom - by); ctx.fillStyle = C.concreteD; ctx.fillRect(x + 4, by, 7, bottom - by);
    if (frost > 0) { ctx.fillStyle = hexA('#FFFFFF', 0.8 * frost); for (let k = 0; k < 8; k++) { const yy = G + AL + 20 + hash(i * 9 + k) * (bottom - G - AL - 30); ctx.beginPath(); ctx.arc(x + (hash(k + i) > 0.5 ? 16 : -16), yy, 3, 0, 7); ctx.fill(); } } }
  // building body
  ctx.fillStyle = '#C9C2B6'; ctx.fillRect(cx - w / 2, by - bodyH, w, bodyH); ctx.fillStyle = '#A9A195'; ctx.fillRect(cx - w / 2, by - 14, w, 14); ctx.fillRect(cx - w / 2 - 10, by - bodyH - 16, w + 20, 16);
  for (let f = 0; f < floors; f++) for (let c = 0; c < 8; c++) { const lit = hash(f * 8 + c) > 0.3; ctx.fillStyle = lit ? C.window : '#3C4A63'; ctx.fillRect(cx - w / 2 + 34 + c * 83, by - bodyH + 18 + f * fh, 46, 40); }
  // heat out sideways/up (not down)
  const heat = v(p, 'heat', t); if (heat > 0) for (let i = 0; i < 6; i++) { const ph = (t * 0.5 + i / 6) % 1, side = i % 2 ? 1 : -1; ctx.save(); ctx.globalAlpha = heat * (1 - ph);
    arrow(ctx, cx + side * (w / 2 - 10), by - 80 - (i * 50) % 260, cx + side * (w / 2 + 60 + ph * 90), by - 120 - (i * 50) % 260 - ph * 50, { color: C.orange, w: 5, head: 14 }); ctx.restore(); }
  // winter wind through the gap
  const wind = v(p, 'wind', t); if (wind > 0) for (let i = 0; i < 9; i++) { const ph = (t * 0.7 + hash(i) ) % 1; const y = by + 10 + (i % 3) * (gap - 20) / 2; const x = lerp(cx - w / 2 - 260, cx + w / 2 + 160, ph);
    if (drift > 0.6 && x > cx - w / 2 - 60) continue; ctx.save(); ctx.globalAlpha = wind * Math.sin(ph * Math.PI); arrow(ctx, x, y, x + 110, y, { color: C.iceL, w: 4, head: 12 }); ctx.restore(); }
  // snowdrift blocking the gap
  if (drift > 0) { ctx.fillStyle = C.snow; ctx.beginPath(); ctx.moveTo(cx - w / 2 - 380, G - 4); ctx.quadraticCurveTo(cx - w / 2 - 120, G - (gap + 50) * drift, cx - w / 2 + 40, G - (gap + 10) * drift); ctx.lineTo(cx - w / 2 + 40, G); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + w / 2 + 380, G - 4); ctx.quadraticCurveTo(cx + w / 2 + 120, G - (gap + 50) * drift, cx + w / 2 - 40, G - (gap + 10) * drift); ctx.lineTo(cx + w / 2 - 40, G); ctx.closePath(); ctx.fill(); }
  // leaking pipe under the building
  if (leak > 0) { const py = by + 22; ctx.fillStyle = '#7F8A99'; ctx.fillRect(cx - w / 2 + 20, py - 9, w - 40, 18);
    for (let i = 0; i < 6; i++) { const ph = (t * 1.3 + i / 6) % 1; ctx.fillStyle = hexA('#FFB27A', leak); ctx.beginPath(); ctx.ellipse(cx + 60, py + 14 + ph * (G - py), 5, 8, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = hexA('#C98A5E', 0.8 * leak); ctx.beginPath(); ctx.ellipse(cx + 60, G + 6, 160 * leak, 18 * leak, 0, 0, 7); ctx.fill(); }
}
function pipesAbove(ctx, t, a) { if (a <= 0) return; const y = G - 46; ctx.save(); ctx.globalAlpha = a;
  for (let x = 40; x < 560; x += 110) { ctx.fillStyle = C.concreteD; ctx.fillRect(x, y + 12, 12, 40); }
  ctx.fillStyle = '#C8CCD2'; rr(ctx, 0, y - 18, 600, 32, 16); ctx.fill(); ctx.fillStyle = '#A7ADB6'; ctx.fillRect(0, y + 2, 600, 8); ctx.restore(); }
function siphons(ctx, t, p) {
  const a = v(p, 'siph', t); if (a <= 0) return; const cold = v(p, 'cold', t, a); const xs = [p.cx ? p.cx - 470 : 490, p.cx ? p.cx + 470 : 1430];
  for (const x of xs) {
    const g = ctx.createRadialGradient(x, G + 230, 20, x, G + 230, 260 * cold); g.addColorStop(0, hexA('#0E2C66', 0.75)); g.addColorStop(1, hexA('#0E2C66', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, G + 230, 180 * cold, 280 * cold, 0, 0, 7); ctx.fill();
    const top = G - 190, bot = lerp(G - 190, G + 420, E.out(a)); ctx.fillStyle = '#B9C3CF'; ctx.fillRect(x - 9, top, 18, bot - top);
    for (let k = 0; k < 7; k++) { ctx.fillStyle = '#E3E8EE'; ctx.fillRect(x - 32, top + 10 + k * 16, 64, 6); }
    for (let i = 0; i < 8; i++) { const ph = (t * 0.45 + i / 8) % 1; ctx.fillStyle = hexA(C.orange, 0.9 * a); ctx.beginPath(); ctx.arc(x - 3, lerp(bot - 10, top + 20, ph), 4, 0, 7); ctx.fill();
      ctx.fillStyle = hexA(C.iceL, 0.9 * a); ctx.beginPath(); ctx.arc(x + 4, lerp(top + 20, bot - 10, ph), 4, 0, 7); ctx.fill(); } }
}
function probe(ctx, t, p) { const a = v(p, 'probe', t); if (a <= 0) return; const x = 1700, yb = lerp(G, 990, E.out(a));
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, G - 30); ctx.lineTo(x, yb); ctx.stroke(); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(x, yb, 10, 0, 7); ctx.fill();
  if (p.probeText && a > 0.9) chip(ctx, key(p.probeText, t), x - 20, yb - 24, { size: 40, align: 'right' }); }
function xsec(ctx, t, d, p) {
  const drift = p.zoom == null ? 1 + 0.05 * E.sine(clamp(t / Math.max(d, 0.1))) : 1; const z = v(p, 'zoom', t, 1) * drift, fx = (p.fx == null ? W / 2 : key(p.fx, t)) + (p.zoom == null ? 30 * Math.sin(t * 0.25) : 0), fy = p.fy == null ? H / 2 : key(p.fy, t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx, -fy);
  sky(ctx, t, v(p, 'season', t)); ground(ctx, t, p); siphons(ctx, t, p);
  if (p.house === 'stone') stoneHouse(ctx, t, p); if (p.house === 'block') block(ctx, t, p);
  pipesAbove(ctx, t, v(p, 'pipes', t)); probe(ctx, t, p);
  if (v(p, 'season', t) < 0.4 && p.snowfall !== false) snow(ctx, t, 60, 0.6 * (1 - v(p, 'season', t) * 2.5));
  ctx.restore(); depthRuler(ctx, p, t);
  if (p.seasonTag !== false) { const s = v(p, 'season', t); chip(ctx, s > 0.5 ? 'SUMMER' : 'WINTER', 48, 82, { size: 34, bg: s > 0.5 ? C.yellow : C.iceL }); }
  require('./scenes').overlays(ctx, t, d, p);
}
// standalone thermosiphon close-up
function siphonCloseup(ctx, t, d, p) {
  const season = v(p, 'season', t); sky(ctx, t, season); ground(ctx, t, { season, warm: 0 }); const x = 960, top = 180, bot = 1000;
  const g = ctx.createRadialGradient(x, 820, 20, x, 820, 420); g.addColorStop(0, hexA('#0E2C66', 0.8 * (1 - season))); g.addColorStop(1, hexA('#0E2C66', 0)); ctx.fillStyle = g; ctx.fillRect(0, G, W, H);
  ctx.fillStyle = '#9FA9B6'; rr(ctx, x - 34, top, 68, bot - top, 30); ctx.fill(); ctx.fillStyle = '#C9D1DB'; rr(ctx, x - 26, top + 8, 52, bot - top - 16, 26); ctx.fill();
  for (let k = 0; k < 10; k++) { ctx.fillStyle = '#E5EAF0'; rr(ctx, x - 110, top + 30 + k * 26, 220, 10, 4); ctx.fill(); }
  ctx.fillStyle = hexA(C.ice, 0.9); rr(ctx, x - 22, bot - 120, 44, 104, 20); ctx.fill(); // liquid pool
  const run = 1 - season; for (let i = 0; i < 14; i++) { const ph = (t * 0.35 + i / 14) % 1; ctx.globalAlpha = run;
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x - 8, lerp(bot - 120, top + 60, ph), 7, 0, 7); ctx.fill();
    ctx.fillStyle = C.iceL; ctx.beginPath(); ctx.arc(x + 10, lerp(top + 300, bot - 120, ph), 6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  // heat arrows from soil into the pipe (winter only)
  for (let i = 0; i < 6; i++) { const ph = (t * 0.6 + i / 6) % 1, side = i % 2 ? 1 : -1, y = 700 + (i % 3) * 90; ctx.save(); ctx.globalAlpha = run * Math.sin(ph * Math.PI);
    arrow(ctx, x + side * (300 - ph * 200), y, x + side * (200 - ph * 150), y, { color: C.orange, w: 5, head: 14 }); ctx.restore(); }
  for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i / 5) % 1; ctx.save(); ctx.globalAlpha = run * Math.sin(ph * Math.PI); arrow(ctx, x + 120, top + 80 + i * 40, x + 200 + ph * 120, top + 50 + i * 40 - ph * 40, { color: C.orange, w: 4, head: 12 }); ctx.restore(); }
  chip(ctx, season > 0.5 ? 'SUMMER: CYCLE STOPS' : 'WINTER: PUMPS HEAT OUT', 48, 82, { size: 36, bg: season > 0.5 ? C.yellow : C.iceL });
  require('./scenes').overlays(ctx, t, d, p);
  text(ctx, 'NOT TO SCALE', W - 40, H - 24, { size: 18, font: F.monoB, align: 'right', color: hexA(C.cream, 0.5) });
}
// two engineering examples drawn by us: pipeline support with fins / railway embankment
function examples(ctx, t, d, p) {
  K.navyBg(ctx, t, false); const half = W / 2;
  const a1 = K.E.out(clamp(seg(t, 0.2, 0.8))), a2 = K.E.out(clamp(seg(t, p.second || 3, (p.second || 3) + 0.6)));
  // left: Trans-Alaska Pipeline support
  ctx.save(); ctx.globalAlpha = a1; const gy = 760; ctx.fillStyle = C.permaD; ctx.fillRect(60, gy, half - 120, 260); ctx.fillStyle = C.snow; ctx.fillRect(60, gy - 8, half - 120, 10);
  for (const x of [330, 630]) { ctx.fillStyle = '#B9C3CF'; ctx.fillRect(x - 12, 420, 24, 560); for (let k = 0; k < 8; k++) { ctx.fillStyle = '#E3E8EE'; ctx.fillRect(x - 34, 300 + k * 14, 68, 6); } ctx.fillStyle = '#B9C3CF'; ctx.fillRect(x - 12, 300, 24, 130); }
  ctx.fillStyle = '#9FA9B6'; ctx.fillRect(250, 470, 460, 20); ctx.fillStyle = '#D6DCE3'; rr(ctx, 120, 400, 720, 76, 38); ctx.fill();
  text(ctx, 'TRANS-ALASKA PIPELINE', half / 2, 170, { size: 52, font: F.head, align: 'center', color: C.cream });
  text(ctx, '> 120,000 heat pipes in its supports', half / 2, 230, { size: 34, font: F.bold, align: 'center', color: C.yellow }); ctx.restore();
  // right: Qinghai–Tibet railway embankment
  ctx.save(); ctx.globalAlpha = a2; const ox = half; ctx.fillStyle = C.permaD; ctx.fillRect(ox + 60, gy, half - 120, 260); ctx.fillStyle = '#6F7B4A'; ctx.fillRect(ox + 60, gy - 8, half - 120, 10);
  ctx.fillStyle = '#7D7A74'; ctx.beginPath(); ctx.moveTo(ox + 140, gy); ctx.lineTo(ox + 360, 520); ctx.lineTo(ox + 600, 520); ctx.lineTo(ox + 820, gy); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 160; i++) { const u = hash(i), vv = hash(i + 1); const y = lerp(520, gy, vv); const half2 = lerp(120, 340, vv); ctx.fillStyle = hash(i + 2) > 0.5 ? '#9A968E' : '#5E5B56'; ctx.beginPath(); ctx.arc(ox + 480 - half2 + u * half2 * 2, y, 6 + hash(i + 3) * 6, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#3A3A3A'; ctx.fillRect(ox + 380, 500, 200, 20); ctx.fillStyle = '#B0B0B0'; ctx.fillRect(ox + 400, 490, 10, 10); ctx.fillRect(ox + 550, 490, 10, 10);
  for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1; ctx.save(); ctx.globalAlpha = a2 * Math.sin(ph * Math.PI); arrow(ctx, ox + 300 + ph * 80, 600 + i * 25, ox + 380 + ph * 80, 640 + i * 25, { color: C.iceL, w: 4, head: 12 }); ctx.restore(); }
  text(ctx, 'QINGHAI–TIBET RAILWAY', ox + half / 2, 170, { size: 52, font: F.head, align: 'center', color: C.cream });
  text(ctx, '~550 km on permafrost · crushed-rock embankments', ox + half / 2, 230, { size: 32, font: F.bold, align: 'center', color: C.yellow, maxW: 860 }); ctx.restore();
  ctx.fillStyle = hexA(C.iceL, 0.3); ctx.fillRect(half - 1, 120, 2, 880);
  text(ctx, 'ILLUSTRATIONS · NOT TO SCALE', W - 40, H - 24, { size: 18, font: F.monoB, align: 'right', color: hexA(C.cream, 0.5) });
}
module.exports = { xsec, siphonCloseup, examples, G, AL };
