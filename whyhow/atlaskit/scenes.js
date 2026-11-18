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
    else if (o.type === 'timer') { const u = clamp(seg(t, at, at + (o.dur || 3))); const sec = lerp(o.from || 0, o.to, o.lin ? u : E.inOut(u)); const mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(11,20,38,0.78)'; rr(ctx, W - 330, 40, 290, 86, 8); ctx.fill(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(W - 296, 83, 12 * (0.6 + 0.4 * Math.abs(Math.sin(t * 3))), 0, 7); ctx.fill();
      text(ctx, String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), W - 60, 104, { size: 60, font: F.monoB, align: 'right', color: C.cream }); ctx.restore(); }
    else if (o.type === 'thermo') { const v = o.v; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(11,20,38,0.78)'; rr(ctx, 40, 40, 250, 86, 8); ctx.fill();
      ctx.fillStyle = C.cream; rr(ctx, 64, 54, 18, 58, 9); ctx.fill(); ctx.fillStyle = v < 0 ? C.ice : C.red; rr(ctx, 67, 54 + 58 * (v < 0 ? 0.65 : 0.2), 12, 58 * (v < 0 ? 0.35 : 0.8), 6); ctx.fill(); ctx.beginPath(); ctx.arc(73, 112, 14, 0, 7); ctx.fill();
      text(ctx, (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '°C', 270, 104, { size: 54, font: F.head, align: 'right', color: C.cream }); ctx.restore(); }
    else if (o.type === 'note') { const sz = o.size || 24, nx = o.x || 48, ny = o.y || 60, nw = K.measure(ctx, o.text, sz, F.monoB) + 28; const bx = o.align === 'center' ? nx - nw / 2 : o.align === 'right' ? nx - nw + 14 : nx - 14;
      ctx.save(); ctx.globalAlpha = a * 0.78; ctx.fillStyle = 'rgba(8,14,28,1)'; rr(ctx, bx, ny - sz - 8, nw, sz + 20, 6); ctx.fill(); ctx.restore();
      text(ctx, o.text, nx, ny, { size: sz, font: F.monoB, color: o.color || C.cream, alpha: a, align: o.align }); }
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
  p.items.forEach((it, i) => { const at = it.at != null ? it.at : 0.3 + i * 0.5; if (t < at) return; const u = E.out(clamp(seg(t, at, at + (it.cnt || 1.4))));
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
  for (const [x, lab] of [[200, 'WATCH NEXT'], [1000, p.right || 'MORE PLACES EXPLAINED']]) { ctx.save(); ctx.globalAlpha = fade(t, 0.8); ctx.strokeStyle = hexA(C.iceL, 0.5); ctx.lineWidth = 3; ctx.setLineDash([10, 8]); rr(ctx, x, 380, 720, 405, 12); ctx.stroke(); ctx.restore();
    text(ctx, lab, x + 360, 850, { size: 34, font: F.monoB, align: 'center', color: C.yellow, alpha: fade(t, 0.8) }); }
}
// ---------- satellite / labelled image ----------
function sat(ctx, t, d, p) {
  ctx.save(); punch(ctx, p); const img = IMG[p.img]; if (p.crop) { const [sx, sy, sw, sh] = p.crop; const z = key(p.z || [[0, 1], [d, 1.08]], t);
    const s = Math.max(W / sw, H / sh) * z; const cx = sx + sw / 2, cy = sy + sh / 2; ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.drawImage(img, -cx, -cy); }
  else kenBurns(ctx, img, t, d, p.kb); ctx.restore();
  if (p.dark) darken(ctx, p.dark); vignette(ctx, 0.45); overlays(ctx, t, d, p); if (p.credit) credit(ctx, p.credit);
}

// ---------- aqueduct profile: spring -> tunnel -> arches -> (siphon) -> city ----------
function slope(ctx, t, d, p) {
  navyBg(ctx, t);
  if (p.title) text(ctx, p.title, W / 2, 140, { size: 56, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  if (p.sub) text(ctx, p.sub, W / 2, 196, { size: 30, font: F.bold, align: 'center', color: C.iceL, alpha: fade(t, 0.3) });
  const TP = p.under ? [[120, 430], [260, 420], [400, 300], [560, 260], [700, 330], [820, 390], [880, 520], [960, 545], [1040, 520], [1100, 400], [1200, 330], [1320, 300], [1460, 360], [1560, 430], [1620, 560], [1800, 565]] : [[120, 430], [260, 432], [380, 380], [520, 300], [660, 370], [760, 500], [850, 690], [950, 720], [1040, 620], [1120, 470], [1200, 400], [1290, 470], [1370, 640], [1455, 860], [1545, 700], [1610, 565], [1800, 565]];
  const ty = x => { for (let i = 1; i < TP.length; i++) if (x <= TP[i][0]) { const a = TP[i - 1], b = TP[i]; const u = (x - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], 0.5 - Math.cos(Math.PI * u) / 2); } return TP[TP.length - 1][1]; };
  const ly = x => 425 + (x - 200) * 95 / 1520; // the channel: a gentle, steady drop
  // ground
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, ty(120)); for (let x = 120; x <= 1800; x += 6) ctx.lineTo(x, ty(x)); ctx.lineTo(W, ty(1800)); ctx.lineTo(W, H); ctx.closePath();
  const g = ctx.createLinearGradient(0, 300, 0, H); g.addColorStop(0, '#6E5A3E'); g.addColorStop(1, '#3A2E20'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#8FB36A'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = 120; x <= 1800; x += 6) (x === 120 ? ctx.moveTo(x, ty(x)) : ctx.lineTo(x, ty(x))); ctx.stroke(); ctx.restore();
  const x0 = 200, x1 = 1720; const rev = E.out(clamp(seg(t, 0.3, 0.3 + (p.dur || 3.2)))); const xr = lerp(x0, x1, rev);
  const siph = !!p.siphon, sA = 1372, sB = 1545;
  const hl = p.hl || '';
  const col = k => (hl && hl === k ? C.yellow : C.iceL);
  // arches where the channel is above ground
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xr, H); ctx.clip();
  for (let x = x0; x < x1; x += 40) { const top = ly(x) + 8, gr = Math.min(ty(x), ty(x + 40)); if (gr - top < 18) continue; if (siph && x > sA - 30 && x < sB) continue;
    const c = hexA(col('arches'), 0.9); ctx.fillStyle = c; ctx.fillRect(x - 4, top, 9, ty(x) - top); ctx.fillRect(x + 36, top, 9, ty(x + 40) - top);
    ctx.strokeStyle = c; ctx.lineWidth = 6; for (let y = top; y < gr - 30; y += 110) { ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + 40, y + 4); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 20, y + 24, 20, Math.PI, 0); ctx.stroke(); } }
  // channel line: solid above ground, dashed underground
  for (let x = x0; x < Math.min(xr, x1); x += 8) { if (siph && x > sA && x < sB) continue; const under = ty(x) < ly(x) - 4;
    ctx.strokeStyle = under ? col('tunnel') : C.ice; ctx.lineWidth = under ? 8 : 12; ctx.setLineDash(under ? [14, 10] : []); ctx.beginPath(); ctx.moveTo(x, ly(x)); ctx.lineTo(x + 8, ly(x + 8)); ctx.stroke(); }
  ctx.setLineDash([]);
  if (siph && xr > sA) { const u = clamp((xr - sA) / (sB - sA)); ctx.strokeStyle = col('siphon'); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(sA, ly(sA));
    const n = 40; for (let i = 1; i <= n * u; i++) { const x = lerp(sA, sB, i / n); const y = Math.min(ly(x) + 40 + 400 * Math.sin(Math.PI * i / n), ty(x) - 18); ctx.lineTo(x, y); } ctx.stroke();
    ctx.fillStyle = C.cream; for (const x of [sA, sB]) { rr(ctx, x - 22, ly(x) - 26, 44, 40, 4); ctx.fill(); } }
  // flowing water dots
  if (rev > 0.98) for (let i = 0; i < 26; i++) { const u = ((t * 0.09) + i / 26) % 1; const x = lerp(x0, x1, u); if (siph && x > sA && x < sB) continue; ctx.fillStyle = hexA('#FFFFFF', 0.85); ctx.beginPath(); ctx.arc(x, ly(x), 5, 0, 7); ctx.fill(); }
  ctx.restore();
  // spring + city
  ctx.fillStyle = C.ice; ctx.beginPath(); ctx.ellipse(x0, ly(x0) + 8, 40, 14, 0, 0, 7); ctx.fill();
  text(ctx, 'SPRING', x0, ly(x0) - 40, { size: 38, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.3) });
  if (rev > 0.95) { ctx.fillStyle = C.cream; for (let i = 0; i < 5; i++) { const bx = 1655 + i * 34, bh = 50 + hash(i + 7) * 60; ctx.globalAlpha = fade(t, 0.3 + (p.dur || 3.2)); ctx.fillRect(bx, 565 - bh, 28, bh); } ctx.globalAlpha = 1;
    text(ctx, 'CITY', 1730, 440, { size: 38, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.3 + (p.dur || 3.2)) }); }
  const lab = (k, s, x, y, at) => { if (xr < x) return; const big = hl === k; chip(ctx, s, x, y, { size: big ? 40 : 30, align: 'center', bg: big ? C.yellow : hexA(C.navy3, 0.95), color: big ? C.ink : C.cream, alpha: fade(t, at || 0) }); };
  if (p.labels !== false && p.under) { lab('tunnel', 'LONG TUNNEL', 560, 210); lab('arches', 'ARCHES', 960, 620); lab('tunnel', 'LONG TUNNEL', 1320, 250); }
  else if (p.labels !== false) { lab('tunnel', 'TUNNEL', 520, 250); lab('arches', 'ARCHES', 950, 800); lab('tunnel', 'TUNNEL', 1200, 360); if (siph) lab('siphon', 'INVERTED SIPHON', 1458, 950); else lab('arches', 'ARCHES', 1458, 950); }
  if (p.tag) text(ctx, p.tag, W / 2, H - 70, { size: 34, font: F.bold, align: 'center', color: C.yellow, alpha: fade(t, p.tagAt || 2.5) });
  text(ctx, 'DIAGRAM · NOT TO SCALE', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}

// ---------- the one-inch drop: a long bridge whose channel tilts (exaggerated) ----------
function inch(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, p.title || 'THE CHANNEL ON TOP OF THE PONT DU GARD', W / 2, 140, { size: 52, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const x0 = 140, x1 = 1780, yb = 760; const u = E.inOut(clamp(seg(t, 0.6, 2.2)));
  const ex = lerp(0, 120, u); // exaggerated tilt in px
  const top = x => 430 + ex * (x - x0) / (x1 - x0);
  // water under the bridge
  ctx.fillStyle = hexA(C.ice, 0.22); ctx.fillRect(0, yb + 40, W, 40);
  // three tiers of arches
  const tiers = [[yb, 230, 160], [yb - 230, 120, 80], [null, 70, 40]];
  ctx.fillStyle = '#C9A46A';
  for (let x = x0; x < x1; x += 40) { const tp = top(x); ctx.fillRect(x, tp, 40, yb + 40 - tp); }
  ctx.fillStyle = C.navy2;
  for (let x = x0 + 20; x < x1 - 60; x += 160) { ctx.beginPath(); ctx.moveTo(x, yb + 40); ctx.lineTo(x, yb - 100); ctx.arc(x + 60, yb - 100, 60, Math.PI, 0); ctx.lineTo(x + 120, yb + 40); ctx.fill(); }
  for (let x = x0 + 10; x < x1 - 30; x += 54) { const b = top(x + 20) + 90; ctx.beginPath(); ctx.moveTo(x, b); ctx.lineTo(x, b - 30); ctx.arc(x + 18, b - 30, 18, Math.PI, 0); ctx.lineTo(x + 36, b); ctx.fill(); }
  // water channel on top
  ctx.strokeStyle = C.ice; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(x0, top(x0) - 8); ctx.lineTo(x1, top(x1) - 8); ctx.stroke();
  for (let i = 0; i < 24; i++) { const v = ((t * 0.12) + i / 24) % 1; const x = lerp(x0, x1, v); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, top(x) - 8, 5, 0, 7); ctx.fill(); }
  // level line and the drop marker
  ctx.setLineDash([12, 10]); ctx.strokeStyle = hexA(C.cream, 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, top(x0) - 8); ctx.lineTo(x1 + 20, top(x0) - 8); ctx.stroke(); ctx.setLineDash([]);
  if (u > 0.05) { arrow(ctx, x1 + 40, top(x0) - 8, x1 + 40, top(x1) - 8, { color: C.yellow, w: 5 });
    text(ctx, '1 INCH', x1 + 40, top(x0) - 40, { size: 54, font: F.head, align: 'center', color: C.yellow, alpha: u }); }
  text(ctx, '← ABOUT 1,500 FT (~456 M) →', W / 2, yb + 120, { size: 40, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.4) });
  text(ctx, 'TILT EXAGGERATED: THE REAL SLOPE IS INVISIBLE TO THE EYE', W / 2, H - 60, { size: 30, font: F.bold, align: 'center', color: C.iceL, alpha: fade(t, 1.6) });
  text(ctx, 'DIAGRAM · NOT TO SCALE', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}

// ---------- Mexico City: clay squeezed by pumping (sponge) ----------
function clay(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, p.title || 'PUMP THE WATER OUT, THE CLAY SQUEEZES FLAT', W / 2, 130, { size: 52, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const u = E.inOut(clamp(seg(t, p.at || 0.8, (p.at || 0.8) + (p.dur || 2.6))));
  const x0 = 200, x1 = 1720, top0 = 420, clayH0 = 300, drop = 120 * u;
  const clayTop = top0 + drop, clayBot = top0 + clayH0;
  // aquifer (gravel)
  ctx.fillStyle = '#5E5A52'; ctx.fillRect(x0, clayBot, x1 - x0, 230);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = hexA('#9C978C', 0.8); ctx.beginPath(); ctx.arc(x0 + hash(i) * (x1 - x0), clayBot + 10 + hash(i + 3) * 210, 5 + hash(i + 7) * 7, 0, 7); ctx.fill(); }
  text(ctx, 'AQUIFER: WATER IN SAND AND GRAVEL', x1 - 20, clayBot + 210, { size: 26, font: F.bold, align: 'right', color: C.cream });
  // clay
  const g = ctx.createLinearGradient(0, clayTop, 0, clayBot); g.addColorStop(0, '#8C6A4C'); g.addColorStop(1, '#6E523A');
  ctx.fillStyle = g; ctx.fillRect(x0, clayTop, x1 - x0, clayBot - clayTop);
  const nw = Math.round(90 * (1 - 0.75 * u));
  for (let i = 0; i < nw; i++) { ctx.fillStyle = hexA('#7FB2FF', 0.85); ctx.beginPath(); ctx.ellipse(x0 + 20 + hash(i + 11) * (x1 - x0 - 40), clayTop + 12 + hash(i + 13) * (clayBot - clayTop - 24), 12, 5, 0, 0, 7); ctx.fill(); }
  text(ctx, 'LAKE CLAY: ~70% WATER', x0 + 20, clayTop + 44, { size: 30, font: F.head, color: C.cream });
  // city on top
  ctx.fillStyle = C.cream; for (let i = 0; i < 14; i++) { const bx = x0 + 60 + i * 105, bh = 60 + hash(i + 21) * 110; ctx.fillRect(bx, clayTop - bh, 70, bh); }
  // original ground line
  ctx.setLineDash([12, 10]); ctx.strokeStyle = hexA(C.yellow, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 40, top0); ctx.lineTo(x1 + 40, top0); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'STREET LEVEL, BEFORE', x0 - 40, top0 - 14, { size: 24, font: F.bold, color: C.yellow });
  // pump + well
  const px = 1560; ctx.fillStyle = '#C9D3E0'; ctx.fillRect(px, clayTop - 120, 16, clayBot + 120 - clayTop + 120);
  for (let i = 0; i < 6; i++) { const v = ((t * 0.8) + i / 6) % 1; ctx.fillStyle = '#7FB2FF'; ctx.beginPath(); ctx.arc(px + 8, clayBot + 110 - v * (clayBot + 230 - clayTop), 6, 0, 7); ctx.fill(); }
  text(ctx, 'WELLS', px + 8, clayTop - 140, { size: 30, font: F.head, align: 'center', color: C.iceL });
  if (u > 0.1) { arrow(ctx, x1 + 60, top0, x1 + 60, clayTop, { color: C.yellow, w: 5 }); text(ctx, 'SINKS', x1 + 60, clayTop + 40, { size: 30, font: F.head, align: 'center', color: C.yellow, alpha: u }); }
  text(ctx, 'DIAGRAM · NOT TO SCALE', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}
// ---------- Mexico City: falling below the old lake level, 1910 -> 1959 ----------
function lakelevel(ctx, t, d, p) {
  navyBg(ctx, t);
  const u = E.inOut(clamp(seg(t, 0.8, 3.2)));
  const yr = Math.round(lerp(1910, 1959, u));
  text(ctx, 'THE CITY CENTER VS. THE OLD LAKE LEVEL', W / 2, 130, { size: 52, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  text(ctx, String(yr), W / 2, 230, { size: 90, font: F.head, align: 'center', color: C.yellow });
  const scale = 52, lakeY = 520; // px per meter
  const rel = lerp(1.9, -5.5, u); const groundY = lakeY - rel * scale;
  // lake level line (where the lake surface stood)
  ctx.fillStyle = hexA(C.ice, 0.25); ctx.fillRect(0, lakeY, 560, H - lakeY);
  ctx.strokeStyle = C.ice; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.beginPath(); ctx.moveTo(0, lakeY); ctx.lineTo(W, lakeY); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'LAKE TEXCOCO LEVEL', 40, lakeY - 16, { size: 30, font: F.head, color: C.iceL });
  // city block
  ctx.fillStyle = '#6E5A3E'; ctx.fillRect(700, groundY, 1220, H - groundY);
  ctx.fillStyle = C.cream; for (let i = 0; i < 10; i++) { const bx = 740 + i * 115, bh = 70 + hash(i + 5) * 120; ctx.fillRect(bx, groundY - bh, 80, bh); }
  text(ctx, 'CITY CENTER', 1310, groundY + 50, { size: 34, font: F.head, align: 'center', color: C.cream });
  // dimension
  const lab = (rel >= 0 ? '+' : '−') + Math.abs(rel).toFixed(1) + ' M';
  arrow(ctx, 640, lakeY, 640, groundY, { color: C.yellow, w: 5 });
  text(ctx, lab, 620, (lakeY + groundY) / 2 + 20, { size: 60, font: F.head, align: 'right', color: C.yellow });
  if (u > 0.98) text(ctx, 'THE CITY SANK BELOW ITS OWN LAKE', W / 2, 330, { size: 40, font: F.head, align: 'center', color: C.yellow, alpha: fade(t, 3.3) });
  text(ctx, 'Source: SACMEX, "El gran reto del agua en la Ciudad de México"', W - 40, H - 20, { size: 20, font: F.reg, align: 'right', color: 'rgba(255,255,255,0.55)' });
}

// ---------- Mexico City cathedral: lowering the high side (under-excavation) ----------
function cathedral(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, p.title || 'LOWER THE HIGH SIDE', W / 2, 130, { size: 52, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const u = E.inOut(clamp(seg(t, 0.8, 0.8 + (p.dur || 3))));
  const gy = 640, x0 = 560, x1 = 1360;
  // tilt: left low; right side lowered toward level
  const yl = gy + 60, yr = gy + 60 - lerp(140, 40, u);
  const hb = 300;
  ctx.fillStyle = '#E9E2D0'; ctx.beginPath(); ctx.moveTo(x0, yl); ctx.lineTo(x1, yr); ctx.lineTo(x1, yr - hb); ctx.lineTo(x0, yl - hb); ctx.closePath(); ctx.fill();
  // towers
  ctx.fillRect(x0, yl - hb - 160, 90, 160); ctx.fillRect(x1 - 90, yr - hb - 160, 90, 160);
  ctx.fillStyle = '#7A5C40'; ctx.beginPath(); ctx.moveTo(0, yl); ctx.lineTo(x0, yl); ctx.lineTo(x1, yr); ctx.lineTo(W, yr); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  // level line
  ctx.setLineDash([12, 10]); ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 80, yl); ctx.lineTo(x1 + 80, yl); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'LEVEL', x0 - 90, yl + 8, { size: 26, font: F.bold, align: 'right', color: C.yellow });
  // shafts on the high side
  for (let i = 0; i < 5; i++) { const sx = x1 - 300 + i * 70; ctx.fillStyle = '#2A2016'; ctx.fillRect(sx, lerp(yl, yr, (sx - x0) / (x1 - x0)) + 6, 22, 260); }
  // clay pulled out sideways (small bits moving into shafts)
  for (let i = 0; i < 30; i++) { const v = ((t * 0.7) + i / 30) % 1; const sx = x1 - 300 + (i % 5) * 70 + 11; const bx = sx + (1 - v) * 40 * (i % 2 ? 1 : -1); const by = gy + 140 + (i % 7) * 18 - v * 120; ctx.fillStyle = '#C9A06E'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, 7); ctx.fill(); }
  text(ctx, '32 SHAFTS · CLAY PULLED OUT ~1.5 MILLION TIMES', W / 2, H - 120, { size: 36, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.6) });
  text(ctx, 'HIGH SIDE LOWERED BY UP TO ~92 CM (1993–1998)', W / 2, H - 70, { size: 30, font: F.bold, align: 'center', color: C.yellow, alpha: fade(t, 2.0) });
  text(ctx, 'DIAGRAM · NOT TO SCALE · TILT EXAGGERATED', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}

// ---------- New Orleans: the bowl deepening (1895 -> today) ----------
function bowl(ctx, t, d, p) {
  navyBg(ctx, t);
  const u = p.hold != null ? p.hold : E.inOut(clamp(seg(t, 0.8, 0.8 + (p.dur || 3))));
  text(ctx, p.title || 'NEW ORLEANS, CROSS-SECTION: RIVER TO LAKE', W / 2, 120, { size: 48, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  text(ctx, u < 0.5 ? '1895' : 'TODAY', W / 2, 205, { size: 70, font: F.head, align: 'center', color: C.yellow });
  const sea = 560, ft = 22; // px per foot
  // sea level line
  ctx.setLineDash([16, 10]); ctx.strokeStyle = C.ice; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, sea); ctx.lineTo(W, sea); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'SEA LEVEL', W - 40, sea - 14, { size: 28, font: F.head, align: 'right', color: C.iceL });
  // profile: x positions: river(left) -> natural levee/French Quarter -> backswamp -> lakefront -> lake(right)
  const deep = lerp(1.26, 6.5, u), east = lerp(1.26, 13, u);
  const pts = [[0, sea - 2 * ft], [260, sea - 2 * ft], [300, sea - 16 * ft], [520, sea - lerp(14, 11, u) * ft], [800, sea + deep * ft], [1150, sea + lerp(1.26, 7, u) * ft], [1450, sea + east * ft], [1640, sea - 3 * ft], [1700, sea + 1 * ft], [W, sea + 1 * ft]];
  ctx.fillStyle = '#6E5A3E'; ctx.beginPath(); ctx.moveTo(0, H); for (const [x, y] of pts) ctx.lineTo(x, y); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8FB36A'; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  // river and lake water
  ctx.fillStyle = hexA(C.ice, 0.55); ctx.fillRect(0, sea - 8 * ft, 250, 8 * ft + 6); ctx.fillRect(1700, sea, W - 1700, 3 * ft);
  text(ctx, 'MISSISSIPPI', 125, sea - 8 * ft - 16, { size: 28, font: F.head, align: 'center', color: C.cream });
  text(ctx, 'LAKE PONTCHARTRAIN', 1800, sea + 3 * ft + 40, { size: 24, font: F.head, align: 'center', color: C.cream });
  // houses on the ground
  for (const x of [380, 460, 700, 760, 860, 1080, 1180, 1380, 1460, 1520]) { let y = sea; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; y = lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); break; } ctx.fillStyle = C.cream; ctx.fillRect(x - 18, y - 34, 36, 34); }
  text(ctx, 'FRENCH QUARTER (NATURAL RIDGE)', 420, sea - 16 * ft - 24, { size: 24, font: F.bold, align: 'center', color: C.yellow });
  const lab = (x, v, s2) => text(ctx, '−' + v.toFixed(v < 2 ? 1 : 0) + ' FT', x, sea + v * ft + 60, { size: 40, font: F.head, align: 'center', color: C.yellow });
  lab(800, deep); lab(1450, east);
  text(ctx, 'OLD SWAMPS', 800, sea + deep * ft + 100, { size: 24, font: F.bold, align: 'center', color: C.cream });
  text(ctx, 'EASTERN NEW ORLEANS', 1450, sea + east * ft + 100, { size: 24, font: F.bold, align: 'center', color: C.cream, alpha: u });
  text(ctx, 'DIAGRAM · HEIGHTS EXAGGERATED', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
  text(ctx, 'Sources: R. Campanella (Tulane); 1895 drainage map', W - 40, H - 20, { size: 20, font: F.reg, align: 'right', color: 'rgba(255,255,255,0.55)' });
}
// ---------- New Orleans: rain to lake ----------
function raintolake(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, 'WHERE THE RAIN GOES', W / 2, 120, { size: 52, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const sea = 520;
  ctx.fillStyle = '#6E5A3E'; ctx.fillRect(0, 640, 1250, H - 640);
  // street, drains, pipes, canal, pump, lift, outfall canal, lake
  ctx.fillStyle = '#3A3F4A'; ctx.fillRect(0, 630, 1250, 14);
  for (let i = 0; i < 40; i++) { const x = (hash(i) * 1200 + t * 300 * (0.6 + hash(i + 9))) % 1200; const y = ((t * 500 + hash(i + 3) * 600) % 520) + 100; if (y < 620) { ctx.strokeStyle = hexA('#9CC3FF', 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 18); ctx.stroke(); } }
  ctx.strokeStyle = C.ice; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(80, 700); ctx.lineTo(900, 760); ctx.stroke();
  for (const x of [150, 400, 650]) { ctx.fillStyle = '#222'; ctx.fillRect(x, 630, 40, 14); ctx.strokeStyle = C.ice; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 20, 644); ctx.lineTo(x + 20, 705); ctx.stroke(); }
  ctx.fillStyle = hexA(C.ice, 0.7); ctx.fillRect(900, 720, 200, 80);
  // pump station
  ctx.fillStyle = '#C9B48A'; ctx.fillRect(1080, 560, 150, 180); text(ctx, 'PUMP', 1155, 660, { size: 30, font: F.head, align: 'center', color: C.ink });
  // lift pipe up over levee into outfall canal
  ctx.strokeStyle = C.ice; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(1230, 700); ctx.lineTo(1300, 700); ctx.lineTo(1300, 470); ctx.lineTo(1380, 470); ctx.stroke();
  ctx.fillStyle = '#7A6A50'; ctx.beginPath(); ctx.moveTo(1260, H); ctx.lineTo(1340, 440); ctx.lineTo(1400, 440); ctx.lineTo(1400, H); ctx.fill();
  ctx.fillStyle = hexA(C.ice, 0.7); ctx.fillRect(1400, 470, 380, 60); ctx.fillStyle = '#7A6A50'; ctx.fillRect(1400, 530, 520, H - 530);
  ctx.fillStyle = hexA(C.ice, 0.6); ctx.fillRect(1780, 480, W - 1780, 60);
  ctx.setLineDash([14, 10]); ctx.strokeStyle = hexA(C.iceL, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, sea); ctx.lineTo(W, sea); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'SEA LEVEL', 20, sea - 12, { size: 24, font: F.head, color: C.iceL });
  // flowing dots
  const path = [[160, 650], [170, 700], [900, 760], [1080, 740], [1300, 700], [1300, 470], [1400, 480], [1900, 500]];
  for (let k = 0; k < 18; k++) { const v = ((t * 0.18) + k / 18) % 1; const L = path.length - 1; const f = v * L; const i = Math.min(L - 1, Math.floor(f)); const a = path[i], b = path[i + 1], w = f - i; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(lerp(a[0], b[0], w), lerp(a[1], b[1], w), 6, 0, 7); ctx.fill(); }
  const L2 = (s2, x, y, at) => chip(ctx, s2, x, y, { size: 28, align: 'center', bg: hexA(C.navy3, 0.95), color: C.cream, alpha: fade(t, at) });
  L2('68,000 STREET DRAINS', 400, 600, 0.4); L2('1,500 MILES OF PIPES', 500, 830, 1.0); L2('~200 MILES OF CANALS', 1000, 850, 1.6); L2('PUMPED UP & OUT', 1300, 400, 2.2); L2('LAKE PONTCHARTRAIN', 1760, 610, 2.8);
  text(ctx, 'DIAGRAM · NOT TO SCALE · Source: Sewerage & Water Board of New Orleans', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}
// ---------- Old River: the 70/30 split ----------
function riversplit(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, 'OLD RIVER CONTROL', W / 2, 120, { size: 54, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const u = E.out(clamp(seg(t, 0.5, 2.0)));
  ctx.lineCap = 'round';
  const mis = [[960, 200], [960, 420], [1100, 600], [1150, 800], [1300, 1000]], atc = [[960, 420], [760, 600], [640, 800], [560, 1000]];
  const draw = (pts, w, c, a) => { ctx.strokeStyle = c; ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.globalAlpha = 1; };
  draw(mis.slice(0, 2), 60, C.ice, 1); draw(mis.slice(1), lerp(60, 44, u), C.ice, 1); draw(atc, lerp(60, 22, u), '#5FA8D3', 1);
  ctx.fillStyle = C.yellow; ctx.fillRect(900, 405, 120, 30); text(ctx, 'FLOODGATES', 1040, 430, { size: 30, font: F.head, color: C.yellow });
  text(ctx, 'MISSISSIPPI', 1180, 300, { size: 34, font: F.head, color: C.cream });
  text(ctx, '70%', 1250, 700, { size: 90, font: F.head, color: C.cream, alpha: u });
  text(ctx, '→ BATON ROUGE, NEW ORLEANS', 1210, 760, { size: 28, font: F.bold, color: C.iceL, alpha: u });
  text(ctx, 'ATCHAFALAYA', 500, 560, { size: 34, font: F.head, align: 'right', color: C.cream });
  text(ctx, '30%', 560, 720, { size: 90, font: F.head, align: 'right', color: C.cream, alpha: u });
  text(ctx, 'SHORTER, STEEPER PATH TO THE GULF', 600, 780, { size: 26, font: F.bold, align: 'right', color: C.iceL, alpha: u });
  text(ctx, 'DIAGRAM · NOT TO SCALE · Source: US Army Corps of Engineers', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}
// ---------- Katrina: I-wall failure ----------
function iwall(ctx, t, d, p) {
  navyBg(ctx, t);
  text(ctx, 'HOW THE CANAL WALLS FAILED (2005)', W / 2, 120, { size: 50, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const rise = E.out(clamp(seg(t, 0.4, 1.8))), lean = E.inOut(clamp(seg(t, 1.8, 3.2))), fail = E.in(clamp(seg(t, 3.2, 4.2)));
  const gy = 760, wx = 900, top = 360;
  // levee
  ctx.fillStyle = '#7A6A50'; ctx.beginPath(); ctx.moveTo(500, gy); ctx.lineTo(820, 560); ctx.lineTo(980, 560); ctx.lineTo(1400, gy); ctx.lineTo(1400, H); ctx.lineTo(500, H); ctx.fill();
  ctx.fillStyle = '#6E5A3E'; ctx.fillRect(0, gy, W, H - gy);
  // canal water (left), rising
  const wl = lerp(620, 470, rise); ctx.fillStyle = hexA(C.ice, 0.6); ctx.beginPath(); ctx.moveTo(0, wl); ctx.lineTo(lerp(700, 840, rise), wl); ctx.lineTo(500, gy); ctx.lineTo(0, gy); ctx.fill();
  text(ctx, 'CANAL', 200, wl - 20, { size: 34, font: F.head, color: C.cream });
  text(ctx, 'CITY', 1650, gy - 30, { size: 34, font: F.head, color: C.cream });
  // gap
  if (lean > 0) { ctx.fillStyle = hexA(C.ice, 0.85); ctx.beginPath(); ctx.moveTo(wx - 8, 560); ctx.lineTo(wx - 8 + 40 * lean, 560); ctx.lineTo(wx - 8, 900); ctx.fill(); }
  // I-wall + sheet pile, leaning then sliding
  ctx.save(); ctx.translate(wx + 260 * fail, 560); ctx.rotate(0.12 * lean + 0.3 * fail); ctx.fillStyle = '#B9C0C8'; ctx.fillRect(-10, top - 560, 20, 560 - top + 10); ctx.fillStyle = '#7F8790'; ctx.fillRect(-5, 0, 10, 300); ctx.restore();
  // top-of-wall line
  ctx.setLineDash([12, 10]); ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(600, top); ctx.lineTo(1200, top); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'TOP OF THE WALL', 1210, top + 10, { size: 26, font: F.bold, color: C.yellow });
  if (fail > 0.3) { ctx.fillStyle = hexA(C.ice, 0.7 * fail); ctx.beginPath(); ctx.moveTo(980, 560); ctx.lineTo(1400 + 400 * fail, gy); ctx.lineTo(980, gy); ctx.fill(); }
  const cap = t < 1.8 ? 'THE WATER RISES — BUT STAYS BELOW THE TOP' : t < 3.2 ? 'IT PUSHES THE WALL AWAY · A GAP OPENS' : 'THE GROUND GIVES OUT · THE WALL FAILS';
  chip(ctx, cap, W / 2, H - 70, { size: 36, align: 'center' });
  text(ctx, 'DIAGRAM · NOT TO SCALE · Source: USACE IPET report', 48, 60, { size: 22, font: F.monoB, color: hexA(C.cream, 0.6) });
}
module.exports = { bowl, raintolake, riversplit, iwall, cathedral, clay, lakelevel, inch, slope, video, photo, overlays, title, chapter, stats, calendar, split, bars, thermo, ratio, myth, versus, endq, endscreen, sat, globe, pop, fade, fadeOut };
