// Long-form "When Paying People Backfired" — Chapter 2 "The Free Flights" (Hoover, Britain 1992), 16:9.
// Extra props/sets for the wide re-frame of hoover_ep19 (its hoovkit.js + cast.js are reused read-only): the chapter card, the falling
// sales board, the departures board, the vacuum display, the classified ads page, the UK -> Iowa map, the "expected vs said yes" chart,
// the court files. Style: howitsrun_style (flat sets, paper plates, thin full-body profile people). No logos: brand names as plain text.
// World space: floor y = 0, up is negative.
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const HK = require('../../hoover_ep19/hoovkit');
const RK = require('../../rats_ep26/ratkit');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL, W, H } = ST;

// ---------- chapter card (screen space, 0..3 s): paper background, two icons, the card, the place/year strip ----------
function chapterCard(ctx, t, n, title, place, iconL, iconR) {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.10)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 60 + 20, W, 3);
  const z = 1 + t * 0.02; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  const ui = E.back(K.seg(t, 0.15, 0.6), 1.8);
  if (iconL && ui > 0) { ctx.save(); ctx.translate(lerp(-200, 330, ui), 560); ctx.rotate(-0.08 + Math.sin(t * 2) * 0.03); iconL(ctx, t); ctx.restore(); }
  if (iconR && ui > 0) { ctx.save(); ctx.translate(lerp(W + 200, W - 330, ui), 560); ctx.rotate(0.08 - Math.sin(t * 2) * 0.03); iconR(ctx, t); ctx.restore(); }
  const u = E.back(K.seg(t, 0, 0.35), 2);
  if (u > 0) { ctx.save(); ctx.translate(W / 2, 500); ctx.rotate(-0.015); ctx.scale(u, u);
    CL.cutout(ctx, () => rr(ctx, -470, -230, 940, 430, 26), PAL.cream, { elev: 2.2 });
    ctx.save(); ctx.translate(0, -160); ctx.font = `40px ${F.black}`; const cw = ctx.measureText(n).width + 50; CL.cutout(ctx, () => rr(ctx, -cw / 2, -34, cw, 62, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, n, 0, 14, 40, C.yellow); ctx.restore();
    fitTxt(ctx, title, 0, 30, 108, INK, 860);
    const us = K.seg(t, 0.45, 0.75); if (us > 0) { ctx.save(); ctx.translate(0, 132); ctx.rotate(0.02); const k = lerp(1.6, 1, E.out(us)); ctx.scale(k, k); ctx.globalAlpha *= clamp(us * 3);
      ctx.font = `56px ${F.black}`; const pw = ctx.measureText(place).width + 70; CL.cutout(ctx, () => rr(ctx, -pw / 2, -50, pw, 92, 12), C.red, { elev: 1.2 }); txt(ctx, place, 0, 20, 56, PAL.cream); ctx.restore(); }
    ctx.restore(); }
  ctx.restore();
}

// ---------- wall board with a falling sales line (centred, 640 x 420); u 0..1 draws the line ----------
function salesBoard(ctx, u, title = 'HOOVER UK · SALES') {
  CL.cutout(ctx, () => rr(ctx, -320, -210, 640, 420, 12), '#FFFDF8', { elev: 1.4 });
  fitTxt(ctx, title, 0, -150, 40, INK, 560);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-260, -110); ctx.lineTo(-260, 160); ctx.lineTo(270, 160); ctx.stroke();
  const pts = [[-250, -80], [-170, -60], [-90, -20], [-10, -40], [70, 30], [150, 60], [240, 130]], n = Math.max(1, Math.floor(u * (pts.length - 1) + 1e-6));
  ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i <= n; i++) ctx.lineTo(...pts[i]); const fr = u * (pts.length - 1) - n; if (n < pts.length - 1 && fr > 0) ctx.lineTo(lerp(pts[n][0], pts[n + 1][0], fr), lerp(pts[n][1], pts[n + 1][1], fr)); ctx.stroke();
  if (u > 0.97) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(262, 152); ctx.lineTo(214, 150); ctx.lineTo(246, 112); ctx.closePath(); ctx.fill(); }
}

// ---------- airport departures board (centred, 1100 x rows); rows [[city, u], ...] u = flip-in 0..1 ----------
function departures(ctx, rows, t) {
  const w = 1100, rh = 96, h = 150 + rows.length * rh;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), '#1C2340', { elev: 2 });
  txt(ctx, 'DEPARTURES', -w / 2 + 50, -h / 2 + 80, 54, C.yellow, 'left'); txt(ctx, 'FROM LONDON', w / 2 - 50, -h / 2 + 80, 34, '#BFC6D8', 'right');
  rows.forEach(([city, u, tag], i) => { const y = -h / 2 + 130 + i * rh;
    rr(ctx, -w / 2 + 40, y, w - 80, rh - 14, 8); ctx.fillStyle = '#2A3358'; ctx.fill();
    if (u <= 0) return; ctx.save(); const k = u < 1 ? Math.abs(Math.cos(u * Math.PI * 1.5)) : 1; ctx.translate(0, y + (rh - 14) / 2); ctx.scale(1, Math.max(0.05, k));
    txt(ctx, city, -w / 2 + 70, 22, 58, '#FFFDF8', 'left'); txt(ctx, tag || 'FREE', w / 2 - 70, 22, 50, tag ? C.yellow : '#7CE0A0', 'right'); ctx.restore(); });
}

// ---------- shop interior display: a row of vacuums on a low plinth, with price tags (world, base y = 0, centred) ----------
function vacDisplay(ctx, n = 4, gap = 300, tags = [], o = {}) {
  rr(ctx, -n * gap / 2 - 40, -60, n * gap + 80, 60, 8); fillStroke(ctx, '#D8D2C2', 5);
  for (let i = 0; i < n; i++) { const x = -((n - 1) / 2) * gap + i * gap; if (o.gone && o.gone(i)) { continue; }
    ctx.save(); ctx.translate(x, -60); HK.vacuum(ctx, o.s || 0.8); ctx.restore();
    const tg = tags[i]; if (tg) { ctx.save(); ctx.translate(x + 90, -150); ctx.rotate(0.08); CL.cutout(ctx, () => rr(ctx, -62, -34, 124, 68, 8), tg[1] || C.yellow, { elev: 0.8 }); fitTxt(ctx, tg[0], 0, 16, 40, INK, 110); ctx.restore(); } }
}

// ---------- newspaper classified ads page (centred, 1000 x 720); ads [[text, price, u], ...] ----------
function classifieds(ctx, ads, t) {
  const w = 1000, h = 720; ctx.save(); ctx.rotate(-0.02);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), '#F3EEDF', { elev: 2 });
  fitTxt(ctx, 'THE DAILY NEWS · CLASSIFIEDS', 0, -h / 2 + 70, 50, INK, w - 80, 'center', ST.FONT.type); ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 30, -h / 2 + 96, w - 60, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; for (let c = 0; c < 3; c++) for (let i = 0; i < 17; i++) ctx.fillRect(-w / 2 + 40 + c * 320, -h / 2 + 130 + i * 32, 270 - hash(c * 30 + i) * 90, 10);
  ads.forEach(([s, p, u], i) => { if (u <= 0) return; const x = [-150, 150, -90][i % 3], y = -130 + i * 175;
    ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate((hash(i) - 0.5) * 0.05);
    CL.cutout(ctx, () => rr(ctx, -280, -66, 560, 132, 6), '#FFFDF6', { elev: 1.2, tex: 0 }); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-266, -54, 532, 108);
    fitTxt(ctx, s, 0, -8, 44, INK, 500, 'center', ST.FONT.type); fitTxt(ctx, p, 0, 40, 38, C.red, 500); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.globalAlpha *= clamp(u * 2 - 1); ell(ctx, 0, 0, 320, 90, -0.03); ctx.stroke(); ctx.restore(); });
  ctx.restore();
}

// ---------- flat world map card with a dashed flight from London to Iowa; u 0..1 draws the route ----------
function mapRoute(ctx, u, t, from = [-0.1, 51.5], to = [-93.6, 41.6]) {
  const w = K.MAPW + 80, h = K.MAPH + 80;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 16), '#BFE0FA', { elev: 2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip(); ctx.translate(0, K.MAPH / 2); K.continents(ctx);
  const a = K.ll(...from), b = K.ll(...to), c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 150];
  const q = (s) => [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * c[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * c[1] + s * s * b[1]];
  ctx.setLineDash([16, 12]); ctx.lineWidth = 7; ctx.strokeStyle = C.red; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...a);
  for (let i = 1; i <= 40; i++) { const s = i / 40 * clamp(u); ctx.lineTo(...q(s)); } ctx.stroke(); ctx.setLineDash([]);
  for (const [p, nm, dx] of [[a, 'UK', 20], [b, 'IOWA', -20]]) { ell(ctx, p[0], p[1], 12, 12); fillStroke(ctx, C.yellow, 4); }
  txt(ctx, 'UK', a[0] + 18, a[1] - 18, 40, INK, 'left'); if (u > 0.95) txt(ctx, 'IOWA', b[0], b[1] + 52, 40, INK);
  if (u > 0 && u < 1) { const p = q(clamp(u)), p2 = q(clamp(u) - 0.02); ctx.save(); ctx.translate(...p); ctx.rotate(Math.atan2(p[1] - p2[1], p[0] - p2[0])); ctx.scale(0.09, 0.09); ctx.scale(1, 1); HK.airliner(ctx, 1, { stairs: false }); ctx.restore(); }
  ctx.restore();
}

// ---------- two-bar chart: EXPECTED vs SAID YES (centred, 760 x 560); a, b = bar heights 0..1 ----------
function yesChart(ctx, a, b) {
  CL.cutout(ctx, () => rr(ctx, -380, -280, 760, 560, 14), '#FFFDF8', { elev: 1.6 });
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-300, -220); ctx.lineTo(-300, 190); ctx.lineTo(320, 190); ctx.stroke();
  const bar = (x, v, col, s1) => { const hh = 380 * v; if (hh > 2) { rr(ctx, x - 90, 190 - hh, 180, hh, 6); fillStroke(ctx, col, 5); } fitTxt(ctx, s1, x, 245, 40, INK, 260); };
  bar(-130, a, '#BFC6D8', 'EXPECTED'); bar(170, b, C.red, 'SAID YES');
}

// ---------- court case files + gavel (world, base y = 0) ----------
function caseFiles(ctx, n, t) {
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((hash(i) - 0.5) * 30, -i * 44); ctx.rotate((hash(i * 3) - 0.5) * 0.06);
    CL.cutout(ctx, () => rr(ctx, -220, -44, 440, 44, 6), ['#E8D9A8', '#D9C48A', '#E3CF96'][i % 3], { elev: 0.6, tex: 0.4 });
    if (i === n - 1) fitTxt(ctx, 'CASE: FREE FLIGHTS', 0, -12, 26, INK, 400, 'center', ST.FONT.type); ctx.restore(); }
}
function gavel(ctx, a = 0) {
  rr(ctx, -110, -36, 220, 36, 10); fillStroke(ctx, '#6A4024', 5);
  ctx.save(); ctx.translate(40, -60); ctx.rotate(-0.5 + a); tube(ctx, [[0, 0], [-200, 0]], 22, '#8A5A34', 4); rr(ctx, -40, -46, 80, 92, 14); fillStroke(ctx, '#6A4024', 5); ctx.restore();
}

// ---------- officer's report (trading standards), centred 700 x 560 ----------
function finding(ctx, u1, u2) {
  ctx.save(); ctx.rotate(-0.02); CL.cutout(ctx, () => rr(ctx, -350, -280, 700, 560, 8), '#FBF6EA', { elev: 1.8 });
  fitTxt(ctx, 'TRADING STANDARDS', 0, -200, 50, INK, 620, 'center', ST.FONT.type); fitTxt(ctx, 'FINDINGS', 0, -150, 34, '#4A4A48', 620, 'center', ST.FONT.type);
  ctx.strokeStyle = 'rgba(80,110,160,0.2)'; ctx.lineWidth = 2; for (let y = -100; y < 260; y += 46) { ctx.beginPath(); ctx.moveTo(-320, y); ctx.lineTo(320, y); ctx.stroke(); }
  if (u1 > 0) { ctx.save(); ctx.globalAlpha *= clamp(u1 * 3); fitTxt(ctx, 'FRAUD?', -150, -40, 50, INK, 300, 'center', ST.FONT.type); ctx.restore(); ctx.save(); ctx.translate(140, -56); ST.stampWord(ctx, 'NO', 70, u1, '#1F8A5A', -0.1); ctx.restore(); }
  if (u2 > 0) { ctx.save(); ctx.globalAlpha *= clamp(u2 * 3); fitTxt(ctx, 'HOOVER HAD', 0, 70, 42, INK, 600, 'center', ST.FONT.type); ctx.restore();
    ctx.save(); ctx.translate(0, 150); const k = E.back(clamp(u2), 2); ctx.scale(k, k); ctx.rotate(-0.03); ctx.font = `62px ${F.black}`; const ww = ctx.measureText('"GROSSLY MISCALCULATED"').width + 50;
    CL.cutout(ctx, () => rr(ctx, -Math.min(ww, 640) / 2, -52, Math.min(ww, 640), 94, 12), C.red, { elev: 1.2 }); fitTxt(ctx, '"GROSSLY MISCALCULATED"', 0, 20, 62, PAL.cream, 600); ctx.restore(); }
  ctx.restore();
}

module.exports = { HK, RK, chapterCard, salesBoard, departures, vacDisplay, classifieds, mapRoute, yesChart, caseFiles, gavel, finding };
