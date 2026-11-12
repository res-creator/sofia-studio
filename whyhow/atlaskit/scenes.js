// atlaskit scenes. Every scene: fn(ctx, t, d, p) — t = local time (s), d = shot duration (s), p = params (keyframes allowed where noted).
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, key, hexA, lerpCol, rr, text, measure, wrap, chip, IMG, kenBurns, cover, vignette, darken, coldGrade,
  credit, coordTag, navyBg, snow, arrow, fmtNum, hash } = K;
const G0 = require('./globe');
function globe(ctx, t, d, p) { G0.globe(ctx, t, d, p); overlays(ctx, t, d, p); }
const pop = (t, at, dur = 0.45) => E.back(clamp(seg(t, at, at + dur)));
const fade = (t, at, dur = 0.4) => E.out(clamp(seg(t, at, at + dur)));
const fadeOut = (t, d, dur = 0.35) => 1 - clamp(seg(t, d - dur, d));

// ---------- photo with Ken Burns + overlays ----------
function photo(ctx, t, d, p) {
  const img = IMG[p.img]; ctx.save(); if (p.filter) ctx.filter = p.filter; punch(ctx, p); kenBurns(ctx, img, t, d, p.kb); ctx.restore();
  coldGrade(ctx, p.cold == null ? 0.1 : p.cold); if (p.dark) darken(ctx, typeof p.dark === 'number' ? p.dark : key(p.dark, t)); vignette(ctx, 0.5);
  if (p.snow) snow(ctx, t, p.snow, 0.75);
  overlays(ctx, t, d, p);
  if (p.credit) credit(ctx, p.credit);
}
// punch-in for auto-split parts
function punch(ctx, p) { const z = p._punch || 1; if (z === 1) return; const fx = (p._fx || 0.5) * W, fy = (p._fy || 0.5) * H; ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
// real footage clip (frames supplied by video.js into p._cv) with a gentle zoom, grade and overlays
function video(ctx, t, d, p) {
  if (p._cv) { const z = K.lerp(p.z0 || 1.0, p.z1 || 1.06, E.sine(clamp(t / Math.max(d, 0.1)))); ctx.save(); punch(ctx, p); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(p._cv, -W / 2, -H / 2); ctx.restore(); }
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  coldGrade(ctx, p.cold == null ? 0.06 : p.cold); if (p.dark) darken(ctx, p.dark); vignette(ctx, 0.4);
  if (p.snow) snow(ctx, t, p.snow, 0.7); overlays(ctx, t, d, p); if (p.credit) credit(ctx, p.credit);
}
// lower-third fact tag
function lower(ctx, t, o, a) {
  const x = o.x || 80, y = o.y || 900, u = E.out(clamp(seg(t, o.at || 0, (o.at || 0) + 0.5)));
  ctx.save(); ctx.globalAlpha = a; const w1 = K.measure(ctx, o.text, o.size || 58, F.head) + 60; const w2 = o.sub ? K.measure(ctx, o.sub, 30, F.bold) + 60 : 0; const w = Math.max(w1, w2) * u;
  ctx.fillStyle = 'rgba(11,20,38,0.82)'; rr(ctx, x, y - (o.size || 58) - 18, w, (o.size || 58) + (o.sub ? 70 : 34), 6); ctx.fill(); ctx.fillStyle = C.yellow; ctx.fillRect(x, y - (o.size || 58) - 18, 10, (o.size || 58) + (o.sub ? 70 : 34));
  ctx.beginPath(); ctx.rect(x, 0, w, H); ctx.clip(); text(ctx, o.text, x + 34, y, { size: o.size || 58, font: F.head, color: C.cream });
  if (o.sub) text(ctx, o.sub, x + 34, y + 44, { size: 30, font: F.bold, color: C.yellow }); ctx.restore();
}
// shared overlays: headline, chips, counters, labels/arrows, coord tag
function overlays(ctx, t, d, p) {
  for (const o of p.over || []) {
    const at = o.at || 0; if (t < at || (o.until && t > o.until)) continue; const a = fade(t, at) * (o.until ? 1 - clamp(seg(t, o.until - 0.3, o.until)) : 1);
    if (o.type === 'head') { const s = pop(t, at, 0.5); ctx.save(); ctx.translate(o.x || W / 2, o.y || 200); ctx.scale(s, s); ctx.globalAlpha = a;
      text(ctx, o.text, 0, 0, { size: o.size || 110, font: F.head, align: o.align || 'center', color: o.color || C.cream, stroke: 10, strokeColor: 'rgba(8,14,28,0.85)', shadow: 20, maxW: o.maxW || 1700 });
      if (o.sub) text(ctx, o.sub, 0, (o.size || 110) * 0.62, { size: o.subSize || 40, font: F.bold, align: o.align || 'center', color: C.yellow, shadow: 12 }); ctx.restore(); }
    else if (o.type === 'chip') { const s = pop(t, at); ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s, s); chip(ctx, o.text, 0, 0, { size: o.size || 46, align: o.align, alpha: a, bg: o.bg, color: o.color }); ctx.restore(); }
    else if (o.type === 'count') { const u = E.out(clamp(seg(t, at, at + (o.dur || 1.6)))); const v = lerp(o.from || 0, o.to, u);
      ctx.save(); ctx.globalAlpha = a; const s = pop(t, at, 0.4); ctx.translate(o.x || W / 2, o.y || H / 2); ctx.scale(s, s);
      text(ctx, (o.pre || '') + fmtNum(v, o.dec || 0) + (o.suf || ''), 0, 0, { size: o.size || 170, font: F.head, align: o.align || 'center', color: o.color || C.cream, stroke: 12, strokeColor: 'rgba(8,14,28,0.9)', shadow: 24 });
      if (o.label) text(ctx, o.label, 0, 62, { size: o.labelSize || 40, font: F.bold, align: o.align || 'center', color: C.yellow, shadow: 12, maxW: 1400 }); ctx.restore(); }
    else if (o.type === 'label') { ctx.save(); ctx.globalAlpha = a; if (o.to) { const u = E.out(clamp(seg(t, at, at + 0.6))); arrow(ctx, o.x, o.y + 14, lerp(o.x, o.to[0], u), lerp(o.y + 14, o.to[1], u), { color: o.color || C.yellow, w: 5 }); }
      chip(ctx, o.text, o.x, o.y, { size: o.size || 38, align: o.align || 'center', bg: o.bg, color: o.color2 }); ctx.restore(); }
    else if (o.type === 'tag') coordTag(ctx, o.text, o.x, o.y, a);
    else if (o.type === 'lower') lower(ctx, t, o, a);
    else if (o.type === 'timer') { const u = clamp(seg(t, at, at + (o.dur || 3))); const sec = lerp(o.from || 0, o.to, E.inOut(u)); const mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(11,20,38,0.78)'; rr(ctx, W - 330, 40, 290, 86, 8); ctx.fill(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(W - 296, 83, 12 * (0.6 + 0.4 * Math.abs(Math.sin(t * 3))), 0, 7); ctx.fill();
      text(ctx, String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), W - 60, 104, { size: 60, font: F.monoB, align: 'right', color: C.cream }); ctx.restore(); }
    else if (o.type === 'thermo') { const v = o.v; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(11,20,38,0.78)'; rr(ctx, 40, 40, 250, 86, 8); ctx.fill();
      ctx.fillStyle = C.cream; rr(ctx, 64, 54, 18, 58, 9); ctx.fill(); ctx.fillStyle = v < 0 ? C.ice : C.red; rr(ctx, 67, 54 + 58 * (v < 0 ? 0.65 : 0.2), 12, 58 * (v < 0 ? 0.35 : 0.8), 6); ctx.fill(); ctx.beginPath(); ctx.arc(73, 112, 14, 0, 7); ctx.fill();
      text(ctx, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '°C', 270, 104, { size: 54, font: F.head, align: 'right', color: C.cream }); ctx.restore(); }
    else if (o.type === 'note') text(ctx, o.text, o.x || 48, o.y || 60, { size: o.size || 24, font: F.monoB, color: o.color || C.cream, alpha: a * 0.9, shadow: 8, align: o.align });
    else if (o.type === 'ring') { const u = E.out(clamp(seg(t, at, at + 0.7))); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = o.color || C.yellow; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.rx, o.ry, 0, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); ctx.stroke(); ctx.restore(); }
  }
}
// ---------- title / chapter ----------
function title(ctx, t, d, p) {
  if (p.img) { kenBurns(ctx, IMG[p.img], t, d, p.kb || { z: [1.12, 1.2] }); darken(ctx, 0.62); coldGrade(ctx, 0.2); vignette(ctx, 0.6); } else navyBg(ctx, t);
  snow(ctx, t, 120, 0.6);
  const a = fade(t, 0.2, 0.6) * fadeOut(t, d, 0.5); const s = lerp(0.94, 1.0, E.out(clamp(t / 2)));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.globalAlpha = a;
  const lines = p.lines; const size = p.size || 128; lines.forEach((l, i) => text(ctx, l, 0, -((lines.length - 1) * size * 0.98) / 2 + i * size * 0.98 + size * 0.35, { size, font: F.head, align: 'center', color: i === p.hl ? C.yellow : C.cream, stroke: 8, strokeColor: 'rgba(8,14,28,0.8)', shadow: 24 }));
  ctx.restore();
  if (p.brand) { const b = fade(t, 1.2, 0.6) * fadeOut(t, d, 0.5); text(ctx, "HOW IT'S RUN", W / 2, H - 120, { size: 30, font: F.monoB, color: C.iceL, align: 'center', alpha: b, ls: 6 }); }
  if (p.credit) credit(ctx, p.credit);
}
function chapter(ctx, t, d, p) {
  navyBg(ctx, t); snow(ctx, t, 50, 0.35);
  const a = fade(t, 0.1, 0.5) * fadeOut(t, d, 0.4); const x = 260;
  ctx.save(); ctx.globalAlpha = a;
  text(ctx, String(p.n).padStart(2, '0'), x, 520, { size: 300, font: F.head, color: hexA(C.ice, 0.9) });
  const w = E.out(clamp(seg(t, 0.25, 0.9))); ctx.fillStyle = C.yellow; ctx.fillRect(x, 580, 560 * w, 8);
  const lines = wrap(ctx, p.title, 92, F.head, 1300); lines.forEach((l, i) => text(ctx, l, x, 700 + i * 100, { size: 92, font: F.head, color: C.cream, alpha: fade(t, 0.35 + i * 0.12, 0.5) }));
  ctx.restore();
}
// ---------- stats row (big numbers) ----------
function stats(ctx, t, d, p) {
  if (p.img) { kenBurns(ctx, IMG[p.img], t, d, p.kb || { z: [1.08, 1.16] }); darken(ctx, p.dark || 0.66); coldGrade(ctx, 0.15); vignette(ctx, 0.6); } else navyBg(ctx, t);
  if (p.head) text(ctx, p.head, W / 2, 200, { size: 56, font: F.head, align: 'center', color: C.iceL, alpha: fade(t, 0.1), ls: 2 });
  const n = p.items.length, gap = W / (n + 0.0);
  p.items.forEach((it, i) => { const at = it.at != null ? it.at : 0.3 + i * 0.5; if (t < at) return; const u = E.out(clamp(seg(t, at, at + 1.4)));
    const cx = gap * (i + 0.5); const v = lerp(it.from || 0, it.v, u); const s = pop(t, at, 0.4);
    ctx.save(); ctx.translate(cx, H / 2 + 40); ctx.scale(s, s);
    text(ctx, (it.pre || '') + fmtNum(v, it.dec || 0) + (it.suf || ''), 0, 0, { size: it.size || 150, font: F.head, align: 'center', color: it.color || C.cream, shadow: 20, maxW: gap - 60 });
    const ls = wrap(ctx, it.label, 36, F.bold, gap - 90); ls.forEach((l, j) => text(ctx, l, 0, 70 + j * 46, { size: 36, font: F.bold, align: 'center', color: C.yellow }));
    ctx.restore(); });
  if (p.source) text(ctx, p.source, W / 2, H - 60, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.65)' });
  if (p.credit) credit(ctx, p.credit);
}
// ---------- polar night calendar ----------
function calendar(ctx, t, d, p) {
  navyBg(ctx, t, false); snow(ctx, t, 70, 0.4);
  const x0 = 200, x1 = 1720, y = 560, days = 153; // Oct 1 .. Mar 2
  const months = [['OCT', 0], ['NOV', 31], ['DEC', 61], ['JAN', 92], ['FEB', 123]];
  const X = dd => lerp(x0, x1, dd / days);
  ctx.fillStyle = hexA(C.iceL, 0.18); rr(ctx, x0, y - 40, x1 - x0, 80, 10); ctx.fill();
  months.forEach(([m, dd]) => { text(ctx, m, X(dd) + 10, y + 100, { size: 34, font: F.monoB, color: C.iceL }); ctx.fillStyle = hexA(C.iceL, 0.5); ctx.fillRect(X(dd), y - 50, 2, 100); });
  const u = E.inOut(clamp(seg(t, 0.6, 2.4))); const a0 = 60, a1 = 60 + (104 - 60) * u; // Nov 30 = day 60, Jan 13 = day 104
  ctx.fillStyle = '#05070D'; rr(ctx, X(a0), y - 40, X(a1) - X(a0), 80, 6); ctx.fill(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.stroke();
  // sun icons outside
  for (const dd of [20, 45, 120, 140]) { ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(X(dd), y - 120, 16, 0, 7); ctx.fill(); }
  text(ctx, 'POLAR NIGHT', (X(60) + X(104)) / 2, y - 100, { size: 64, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 2.2) });
  text(ctx, '~30 NOV – 13 JAN  ·  ABOUT 6 WEEKS WITHOUT SUNRISE', W / 2, y + 220, { size: 36, font: F.monoB, align: 'center', color: C.yellow, alpha: fade(t, 2.6) });
  text(ctx, 'Norilsk, 69°N', W / 2, 200, { size: 44, font: F.bold, align: 'center', color: C.iceL, alpha: fade(t, 0.2) });
}
// ---------- frozen vs thawed (split) ----------
function split(ctx, t, d, p) {
  navyBg(ctx, t, false);
  const cols = [{ x: 520, frozen: true, lab: 'FROZEN CLAY' }, { x: 1400, frozen: false, lab: 'THAWED CLAY' }];
  const drop = E.in(clamp(seg(t, 1.0, 1.6)));
  for (const c of cols) {
    const top = 560, w = 520, h = 300; const sink = c.frozen ? 0 : E.out(clamp(seg(t, 1.6, 3.2))) * 120;
    // block
    ctx.save(); ctx.beginPath(); if (c.frozen) ctx.rect(c.x - w / 2, top, w, h); else { ctx.moveTo(c.x - w / 2, top + 10); ctx.bezierCurveTo(c.x - 120, top + sink * 0.9, c.x + 120, top + sink * 0.9, c.x + w / 2, top + 10); ctx.lineTo(c.x + w / 2, top + h); ctx.lineTo(c.x - w / 2, top + h); ctx.closePath(); }
    const g = ctx.createLinearGradient(0, top, 0, top + h); if (c.frozen) { g.addColorStop(0, C.permaL); g.addColorStop(1, C.permaD); } else { g.addColorStop(0, '#8C6A4C'); g.addColorStop(1, '#5A4030'); }
    ctx.fillStyle = g; ctx.fill(); ctx.clip();
    for (let i = 0; i < 70; i++) { ctx.fillStyle = c.frozen ? hexA(C.frost, 0.55) : hexA('#3B2A1E', 0.5); const r = 3 + hash(i) * 8; ctx.beginPath(); ctx.arc(c.x - w / 2 + hash(i + 1) * w, top + hash(i + 2) * h, r, 0, 7); ctx.fill(); }
    if (!c.frozen) { ctx.fillStyle = hexA('#9CC3FF', 0.25); for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(c.x - w / 2 + hash(i + 40) * w, top + 40 + hash(i + 41) * h, 30, 8, 0, 0, 7); ctx.fill(); } }
    ctx.restore();
    // weight
    const wy = lerp(170, top - 120, drop) + (c.frozen ? 0 : sink * 0.9);
    ctx.fillStyle = '#3A3F4A'; rr(ctx, c.x - 110, wy, 220, 120, 10); ctx.fill(); text(ctx, '1,000 T', c.x, wy + 76, { size: 46, font: F.head, align: 'center', color: C.cream });
    text(ctx, c.lab, c.x, top + h + 80, { size: 48, font: F.head, align: 'center', color: c.frozen ? C.iceL : '#D9A77A' });
    if (t > 3.2 && !c.frozen) text(ctx, 'SINKS', c.x, top - 170, { size: 60, font: F.head, align: 'center', color: C.red, alpha: fade(t, 3.2) });
    if (t > 1.8 && c.frozen) text(ctx, 'HOLDS', c.x, top - 170, { size: 60, font: F.head, align: 'center', color: C.yellow, alpha: fade(t, 1.8) });
  }
  text(ctx, 'ILLUSTRATION', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}
// ---------- bars (chart) ----------
function bars(ctx, t, d, p) {
  navyBg(ctx, t); text(ctx, p.title, 160, 170, { size: 60, font: F.head, color: C.cream, alpha: fade(t, 0.1) });
  if (p.sub) text(ctx, p.sub, 160, 225, { size: 30, font: F.reg, color: C.iceL, alpha: fade(t, 0.3) });
  const x0 = 160, y0 = 330, bw = 1500, bh = 120, gap = 70;
  p.items.forEach((it, i) => { const at = it.at != null ? it.at : 0.6 + i * 0.7; const u = E.out(clamp(seg(t, at, at + 1.2))); const y = y0 + i * (bh + gap);
    text(ctx, it.label, x0, y - 14, { size: 34, font: F.bold, color: C.cream, alpha: fade(t, at - 0.3) });
    ctx.fillStyle = hexA(C.iceL, 0.12); rr(ctx, x0, y, bw, bh, 8); ctx.fill();
    const wv = bw * Math.abs(it.v) / p.max * u; ctx.fillStyle = it.color || C.red; rr(ctx, x0, y, Math.max(wv, 2), bh, 8); ctx.fill();
    if (it.err) { ctx.save(); ctx.globalAlpha = u; ctx.strokeStyle = C.cream; ctx.lineWidth = 3; const xe0 = x0 + bw * (Math.abs(it.v) - it.err) / p.max, xe1 = x0 + bw * (Math.abs(it.v) + it.err) / p.max;
      ctx.beginPath(); ctx.moveTo(xe0, y + bh / 2); ctx.lineTo(xe1, y + bh / 2); ctx.moveTo(xe0, y + 30); ctx.lineTo(xe0, y + bh - 30); ctx.moveTo(xe1, y + 30); ctx.lineTo(xe1, y + bh - 30); ctx.stroke(); ctx.restore(); }
    if (u > 0) text(ctx, it.text || ('−' + Math.round(Math.abs(it.v) * u) + '%'), x0 + Math.max(wv, 2) + (it.err ? bw * it.err / p.max : 0) + 24, y + bh / 2 + 22, { size: 64, font: F.head, color: C.cream, alpha: u });
  });
  if (p.source) text(ctx, p.source, 160, H - 60, { size: 22, font: F.reg, color: 'rgba(255,255,255,0.6)' });
}
// ---------- thermometer at depth (before/after) ----------
function thermo(ctx, t, d, p) {
  navyBg(ctx, t, false);
  text(ctx, 'GROUND TEMPERATURE AT 10 M DEPTH', W / 2, 150, { size: 54, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const yT = v => lerp(820, 300, (v + 8) / 9); // -8..+1
  const zx = 1720; ctx.save(); ctx.strokeStyle = hexA(C.iceL, 0.35); ctx.lineWidth = 2;
  for (let v = -8; v <= 1; v++) { const y = yT(v); ctx.beginPath(); ctx.moveTo(220, y); ctx.lineTo(zx, y); ctx.stroke(); text(ctx, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '°C', 200, y + 10, { size: 26, font: F.monoB, align: 'right', color: v === 0 ? C.yellow : C.iceL }); }
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(220, yT(0)); ctx.lineTo(zx, yT(0)); ctx.stroke(); ctx.restore();
  text(ctx, '0°C — ICE STARTS TO MELT', zx, yT(0) - 16, { size: 26, font: F.monoB, align: 'right', color: C.yellow });
  const cols = [{ x: 650, lo: -7, hi: -0.5, lab: 'BEFORE MASS CONSTRUCTION', at: 0.8, col: C.ice }, { x: 1300, lo: -2.5, hi: 0.5, lab: 'IN THE 2000s (PARTS OF THE CITY)', at: 2.6, col: C.orange }];
  for (const c of cols) { const u = E.out(clamp(seg(t, c.at, c.at + 1.0))); if (u <= 0) continue; const y0 = yT(c.lo), y1 = lerp(y0, yT(c.hi), u);
    ctx.fillStyle = c.col; rr(ctx, c.x - 90, y1, 180, y0 - y1, 10); ctx.fill();
    text(ctx, (c.lo < 0 ? '−' : '+') + Math.abs(c.lo) + '…' + (c.hi < 0 ? '−' : '+') + Math.abs(c.hi) + '°C', c.x, y1 - 24, { size: 50, font: F.head, align: 'center', color: C.cream, alpha: u });
    text(ctx, c.lab, c.x, 900, { size: 30, font: F.bold, align: 'center', color: C.iceL, alpha: u, maxW: 560 }); }
  if (p.extra && t > p.extra.at) text(ctx, p.extra.text, W / 2, 990, { size: 40, font: F.head, align: 'center', color: C.yellow, alpha: fade(t, p.extra.at) });
  text(ctx, 'Source: Streletskiy et al. 2015', W - 40, H - 24, { size: 20, font: F.reg, align: 'right', color: 'rgba(255,255,255,0.55)' });
}
// ---------- Arctic vs global warming ----------
function ratio(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, 'WARMING SINCE 1979', W / 2, 170, { size: 64, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const base = 860, unit = 120; const items = [{ x: 700, n: 1, lab: 'WHOLE PLANET', col: C.iceL, at: 0.6 }, { x: 1220, n: 4, lab: 'ARCTIC', col: C.red, at: 1.4 }];
  for (const it of items) { const u = E.out(clamp(seg(t, it.at, it.at + 1.6))); const hgt = unit * it.n * u;
    ctx.fillStyle = it.col; rr(ctx, it.x - 110, base - hgt, 220, hgt, [10, 10, 0, 0]); ctx.fill();
    text(ctx, it.lab, it.x, base + 60, { size: 40, font: F.head, align: 'center', color: C.cream });
    if (u > 0.95) text(ctx, it.n === 1 ? '×1' : '×4', it.x, base - hgt - 30, { size: 90, font: F.head, align: 'center', color: it.n === 1 ? C.cream : C.yellow, alpha: fade(t, it.at + 1.4) }); }
  text(ctx, 'Arctic warmed nearly 4 times faster than the global average, 1979–2021', W / 2, H - 110, { size: 30, font: F.bold, align: 'center', color: C.iceL, alpha: fade(t, 3) });
  text(ctx, 'Source: Rantanen et al. 2022, Communications Earth & Environment', W / 2, H - 60, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.55)' });
}
// ---------- myth check ----------
function myth(ctx, t, d, p) {
  navyBg(ctx, t);
  const s1 = pop(t, 0.3, 0.5); ctx.save(); ctx.translate(560, 470); ctx.scale(s1, s1);
  text(ctx, '"60%"', 0, 0, { size: 230, font: F.head, align: 'center', color: C.cream }); text(ctx, 'OF BUILDINGS DEFORMED?', 0, 90, { size: 40, font: F.bold, align: 'center', color: C.iceL });
  text(ctx, 'one official, 2016 · method unknown', 0, 150, { size: 30, font: F.reg, align: 'center', color: hexA(C.cream, 0.7), alpha: fade(t, 2.5) }); ctx.restore();
  const xu = E.out(clamp(seg(t, p.crossAt || 4, (p.crossAt || 4) + 0.4))); if (xu > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(340, 300); ctx.lineTo(lerp(340, 780, xu), lerp(300, 520, xu)); ctx.stroke(); ctx.restore(); }
  const at = p.realAt || 6; const s2 = pop(t, at, 0.5); if (t > at) { ctx.save(); ctx.translate(1380, 470); ctx.scale(s2, s2);
    text(ctx, '~35%', 0, 0, { size: 230, font: F.head, align: 'center', color: C.yellow }); text(ctx, 'NORILSK + TALNAKH, PERMAFROST SURVEY', 0, 90, { size: 36, font: F.bold, align: 'center', color: C.iceL });
    text(ctx, 'still about 1 building in 3', 0, 150, { size: 34, font: F.bold, align: 'center', color: C.cream, alpha: fade(t, at + 1.5) }); ctx.restore(); }
  text(ctx, 'MYTH CHECK', 48, 72, { size: 40, font: F.head, color: C.red, ls: 3 });
  text(ctx, 'Sources: Newsweek 2016 (official\'s claim); Grebenets & Streletskiy, AGU 2015', W / 2, H - 50, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.55)' });
}
// ---------- two claims side by side ----------
function versus(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, p.title, W / 2, 150, { size: 60, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  p.cards.forEach((c, i) => { const at = c.at; if (t < at) return; const x = i ? 1000 : 160, y = 250, w = 760, h = 640; const s = pop(t, at, 0.5);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = hexA(C.navy3, 0.95); rr(ctx, 0, 0, w, h, 16); ctx.fill(); ctx.strokeStyle = c.color; ctx.lineWidth = 4; ctx.stroke();
    chip(ctx, c.who, 40, 80, { size: 44, bg: c.color, color: C.ink });
    wrap(ctx, c.text, 46, F.bold, w - 80).forEach((l, j) => text(ctx, l, 40, 190 + j * 62, { size: 46, font: F.bold, color: C.cream }));
    if (c.src) text(ctx, c.src, 40, h - 36, { size: 22, font: F.reg, color: hexA(C.cream, 0.6) }); ctx.restore(); });
}
// ---------- question card / end screen ----------
function endq(ctx, t, d, p) {
  if (p.img) { kenBurns(ctx, IMG[p.img], t, d, { z: [1.1, 1.16] }); darken(ctx, 0.7); vignette(ctx, 0.6); } else navyBg(ctx, t);
  snow(ctx, t, 100, 0.55); const s = pop(t, 0.2, 0.6);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); p.lines.forEach((l, i) => text(ctx, l, 0, -60 + i * 120, { size: 104, font: F.head, align: 'center', color: i === p.hl ? C.yellow : C.cream, shadow: 20 }));
  if (p.sub) text(ctx, p.sub, 0, -60 + p.lines.length * 120 + 10, { size: 40, font: F.bold, align: 'center', color: C.iceL }); ctx.restore();
  if (p.credit) credit(ctx, p.credit);
}
function endscreen(ctx, t, d, p) {
  navyBg(ctx, t); snow(ctx, t, 60, 0.35);
  // YouTube end-screen element slots (left video 2 slots), channel name
  text(ctx, "HOW IT'S RUN", W / 2, 190, { size: 90, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.2) });
  text(ctx, 'Why the hardest places on Earth still work', W / 2, 250, { size: 36, font: F.bold, align: 'center', color: C.iceL, alpha: fade(t, 0.5) });
  for (const [x, lab] of [[200, 'WATCH NEXT'], [1000, 'MORE FROM THE ARCTIC']]) { ctx.save(); ctx.globalAlpha = fade(t, 0.8); ctx.strokeStyle = hexA(C.iceL, 0.5); ctx.lineWidth = 3; ctx.setLineDash([10, 8]); rr(ctx, x, 380, 720, 405, 12); ctx.stroke(); ctx.restore();
    text(ctx, lab, x + 360, 850, { size: 34, font: F.monoB, align: 'center', color: C.yellow, alpha: fade(t, 0.8) }); }
}
// ---------- satellite / labelled image ----------
function sat(ctx, t, d, p) {
  ctx.save(); punch(ctx, p); const img = IMG[p.img]; if (p.crop) { const [sx, sy, sw, sh] = p.crop; const z = key(p.z || [[0, 1], [d, 1.08]], t);
    const s = Math.max(W / sw, H / sh) * z; const cx = sx + sw / 2, cy = sy + sh / 2; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.drawImage(img, -cx, -cy); }
  else kenBurns(ctx, img, t, d, p.kb); ctx.restore();
  if (p.dark) darken(ctx, p.dark); vignette(ctx, 0.45); overlays(ctx, t, d, p); if (p.credit) credit(ctx, p.credit);
}
module.exports = { video, photo, overlays, title, chapter, stats, calendar, split, bars, thermo, ratio, myth, versus, endq, endscreen, sat, globe, pop, fade, fadeOut };
