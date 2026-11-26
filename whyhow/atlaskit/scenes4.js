// atlaskit scenes, set 4 (EP12 Vostok): temperature ladder, the Vostok year, the 1982 drip stove, the night of the fire.
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, hexA, rr, text, navyBg, hash, snow, arrow } = K;
const fade = (t, at, dur = 0.4) => E.out(clamp(seg(t, at, at + dur)));
const pop = process.env.SMOOTH === '1' ? (t, at, dur = 0.6) => 0.94 + 0.06 * E.out(clamp(seg(t, at, at + dur))) : (t, at, dur = 0.45) => E.back(clamp(seg(t, at, at + dur)));
const tag = (ctx, s) => text(ctx, s, 48, H - 24, { size: 20, font: F.monoB, color: hexA(C.cream, 0.55) });
const src = (ctx, s) => s && text(ctx, s, W - 40, H - 24, { size: 20, font: F.reg, align: 'right', color: 'rgba(255,255,255,0.55)' });

// Temperature ladder: a vertical thermometer, rungs pop in at p.items[i].at; mercury falls to the lowest shown rung.
// p.items: [{v (°C), label, sub, at, color, dash}], p.title, p.min, p.max
function ladder(ctx, t, d, p) {
  navyBg(ctx, t, true); if (!p.nosnow) snow(ctx, t, 50, 0.35, 20);
  text(ctx, p.title || 'HOW COLD IS VOSTOK?', W / 2, 110, { size: 60, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const vmax = p.max != null ? p.max : 0, vmin = p.min != null ? p.min : -100, y0 = 210, y1 = 950, X = 420;
  const Y = v => lerp(y0, y1, (vmax - v) / (vmax - vmin));
  // tube
  ctx.save(); ctx.fillStyle = hexA(C.frost, 0.12); rr(ctx, X - 26, y0 - 20, 52, y1 - y0 + 40, 26); ctx.fill(); ctx.strokeStyle = hexA(C.frost, 0.5); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  for (let v = vmax; v >= vmin; v -= (p.step || 10)) { ctx.fillStyle = hexA(C.frost, 0.5); ctx.fillRect(X - 60, Y(v) - 1, 22, 2); text(ctx, v + (p.unit != null ? p.unit.trim() : '°'), X - 72, Y(v) + 9, { size: 24, font: F.mono, align: 'right', color: hexA(C.frost, 0.6) }); }
  const items = p.items || []; let low = vmax;
  for (const it of items) { const u = clamp(seg(t, it.at || 0, (it.at || 0) + 0.9)); if (u > 0 && !it.dash) low = Math.min(low, lerp(low === vmax ? vmax : low, it.v, 1)); }
  // mercury falls smoothly toward the lowest revealed solid rung
  const mm = p.rise ? Math.max : Math.min; let target = p.rise ? vmin : vmax, cur = target; for (const it of items) { if (it.dash) continue; const u = E.inOut(clamp(seg(t, it.at || 0, (it.at || 0) + 0.9))); if (u > 0) { cur = lerp(target, mm(target, it.v), u); target = mm(target, it.v); } }
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, C.iceL); g.addColorStop(1, C.ice);
  ctx.save(); ctx.fillStyle = g; ctx.shadowColor = hexA(C.ice, 0.9); ctx.shadowBlur = 24; rr(ctx, X - 14, Y(cur), 28, y1 + 10 - Y(cur), 14); ctx.fill(); ctx.restore();
  // rungs
  let side = 0;
  for (const it of items) { const a = fade(t, it.at || 0, 0.35); if (a <= 0) continue; const y0r = Y(it.v), y = y0r + (it.dy || 0), s = pop(t, it.at || 0);
    const col = it.color || (it.v <= -85 ? C.ice : C.cream);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 4; if (it.dash) ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(X + 34, y0r); ctx.lineTo(X + 70, y0r); ctx.lineTo(X + 34 + 90 * s, y); ctx.stroke(); ctx.restore();
    const big = (it.big != null ? it.big : it.v.toFixed(it.v % 1 ? (Math.abs(it.v * 10 % 1) > 0.01 ? 2 : 1) : 0).replace('-', '−') + (p.unit != null ? p.unit : '°C'));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(X + 150, y); ctx.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
    const w = text(ctx, big, 0, 30, { size: it.hl ? 110 : 80, font: F.head, color: it.hl ? C.yellow : col });
    text(ctx, it.label, w + 30, 10, { size: it.hl ? 54 : 46, font: F.head, color: C.cream });
    if (it.sub) text(ctx, it.sub, w + 30, 56, { size: 32, font: F.bold, color: hexA(C.iceL, 0.95) });
    ctx.restore(); side++; }
  src(ctx, p.source);
}

// The Vostok year: Jan..Dec bar; bands for polar night and 'no planes' (below -55); markers with dates.
// p.bands: [{from, to (day of year), label, color, row, at}], p.marks: [{day, label, at, color}], p.title
function yearbar(ctx, t, d, p) {
  navyBg(ctx, t, false);
  text(ctx, p.title || 'A YEAR AT VOSTOK', W / 2, 140, { size: 60, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const x0 = 160, x1 = 1760, y = 560, X = dd => lerp(x0, x1, dd / 365);
  const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], md = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  const gr = clamp(seg(t, 0.2, 1.0));
  ctx.save(); ctx.globalAlpha = gr; ctx.fillStyle = hexA(C.frost, 0.1); rr(ctx, x0, y - 40, x1 - x0, 80, 12); ctx.fill(); ctx.restore();
  for (let i = 0; i < 12; i++) { const a = fade(t, 0.2 + i * 0.05); text(ctx, M[i], (X(md[i]) + X(md[i + 1])) / 2, y + 12, { size: 30, font: F.monoB, align: 'center', color: hexA(C.cream, 0.75), alpha: a });
    ctx.fillStyle = hexA(C.cream, 0.25 * a); ctx.fillRect(X(md[i]), y - 40, 2, 80); }
  for (const b of p.bands || []) { const u = E.out(clamp(seg(t, b.at || 0, (b.at || 0) + 0.9))); if (u <= 0) continue;
    const yy = y + (b.row || -1) * 120, xa = X(b.from), xb = lerp(xa, X(b.to), u);
    ctx.save(); ctx.fillStyle = hexA(b.color || C.ice, 0.85); ctx.shadowColor = hexA(b.color || C.ice, 0.7); ctx.shadowBlur = 18; rr(ctx, xa, yy - 30, xb - xa, 60, 30); ctx.fill(); ctx.restore();
    text(ctx, b.label, (xa + X(b.to)) / 2, yy + 13, { size: 34, font: F.head, align: 'center', color: b.dark ? C.navy : C.cream, alpha: fade(t, (b.at || 0) + 0.6) }); }
  for (const m of p.marks || []) { const a = fade(t, m.at || 0); if (a <= 0) continue; const x = X(m.day), s = pop(t, m.at || 0);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = m.color || C.yellow; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x, y + 60 + (m.low ? 230 : 0)); ctx.stroke();
    ctx.fillStyle = m.color || C.yellow; ctx.beginPath(); ctx.arc(x, y, 12 * s, 0, 7); ctx.fill(); ctx.restore();
    text(ctx, m.label, x, m.low ? y + 330 : y - 300, { size: 34, font: F.head, align: 'center', color: m.color || C.yellow, alpha: a });
    if (m.sub) text(ctx, m.sub, x, m.low ? y + 370 : y - 262, { size: 26, font: F.bold, align: 'center', color: C.cream, alpha: a }); }
  src(ctx, p.source);
}

// The 1982 drip stove in a room: stove left, warm air rises; thermometers at head height (+25) and at the wall (0).
// keys: p.flameAt, p.hotAt, p.coldAt, p.candleAt
function stove(ctx, t, d, p) {
  const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#120C0A'); g0.addColorStop(1, '#060810'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
  text(ctx, p.title || 'APRIL 1982: HEAT FROM A GAS CYLINDER', W / 2, 100, { size: 54, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  const fl = 880, ceil = 210, wx = 1700, sx = 560;
  // room
  ctx.save(); ctx.strokeStyle = hexA(C.cream, 0.5); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(160, ceil); ctx.lineTo(wx, ceil); ctx.lineTo(wx, fl); ctx.lineTo(160, fl); ctx.stroke(); ctx.restore();
  // frost on the far wall
  const ca = fade(t, p.coldAt || 2.4, 0.8);
  ctx.save(); const gw = ctx.createLinearGradient(wx - 320, 0, wx, 0); gw.addColorStop(0, hexA(C.ice, 0)); gw.addColorStop(1, hexA(C.ice, 0.45 * ca)); ctx.fillStyle = gw; ctx.fillRect(wx - 320, ceil, 320, fl - ceil); ctx.restore();
  for (let i = 0; i < 40; i++) { ctx.fillStyle = hexA(C.frost, 0.6 * ca); ctx.beginPath(); ctx.arc(wx - 6 - hash(i) * 30, ceil + hash(i + 4) * (fl - ceil), 2 + hash(i + 9) * 4, 0, 7); ctx.fill(); }
  // warm glow
  const fa = fade(t, p.flameAt || 0.6, 0.8), flick = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
  ctx.save(); const gr = ctx.createRadialGradient(sx, fl - 200, 20, sx, fl - 260, 760); gr.addColorStop(0, hexA(C.orange, 0.55 * fa * flick)); gr.addColorStop(0.5, hexA(C.orange, 0.16 * fa)); gr.addColorStop(1, hexA(C.orange, 0)); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  // stove: a gas cylinder on its side with a chimney
  ctx.save(); ctx.fillStyle = '#5A5F66'; rr(ctx, sx - 90, fl - 190, 180, 190, 40); ctx.fill(); ctx.strokeStyle = '#2B2E33'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#3D4045'; ctx.fillRect(sx - 18, ceil, 36, fl - 190 - ceil);
  ctx.fillStyle = hexA(C.orange, fa * flick); rr(ctx, sx - 50, fl - 110, 100, 46, 12); ctx.fill(); ctx.restore();
  // diesel drip
  const da = fade(t, p.flameAt || 0.6); ctx.save(); ctx.strokeStyle = hexA(C.concrete, da); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx + 230, fl - 330); ctx.lineTo(sx + 230, fl - 260); ctx.lineTo(sx + 70, fl - 160); ctx.stroke();
  ctx.fillStyle = hexA('#8E6A2E', da); rr(ctx, sx + 180, fl - 440, 100, 110, 10); ctx.fill(); text(ctx, 'DIESEL', sx + 230, fl - 375, { size: 24, font: F.monoB, align: 'center', color: C.cream, alpha: da });
  const dp = (t * 1.6) % 1; ctx.fillStyle = hexA('#C9A24A', da); ctx.beginPath(); ctx.arc(lerp(sx + 230, sx + 70, clamp(dp * 2 - 1)), dp < 0.5 ? lerp(fl - 330, fl - 260, dp * 2) : lerp(fl - 260, fl - 160, dp * 2 - 1), 7, 0, 7); ctx.fill(); ctx.restore();
  text(ctx, 'DRIP STOVE FROM A GAS CYLINDER', sx + 40, fl + 60, { size: 30, font: F.head, align: 'center', color: C.orange, alpha: fa });
  // rising warm air
  for (let i = 0; i < 9; i++) { const u = ((t * 0.35 + i / 9) % 1); const x = sx + 120 + u * 700 * (0.4 + hash(i) * 0.6), y = lerp(fl - 260, ceil + 40, Math.sqrt(u));
    ctx.fillStyle = hexA(C.orange, 0.35 * fa * (1 - u)); ctx.beginPath(); ctx.arc(x, y, 10 + 10 * u, 0, 7); ctx.fill(); }
  // thermometers
  const th = (x, y, v, col, at, lab) => { const a = fade(t, at, 0.4); if (a <= 0) return; const s = pop(t, at);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = hexA(C.navy, 0.85); rr(ctx, -150, -70, 300, 140, 20); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    text(ctx, v, x, y + 22, { size: 72, font: F.head, align: 'center', color: col, alpha: a }); text(ctx, lab, x, y + 110, { size: 28, font: F.head, align: 'center', color: C.cream, alpha: a }); };
  th(sx + 560, 360, '+25°C', C.orange, p.hotAt || 1.4, 'NEXT TO THE STOVE, HEAD HEIGHT');
  th(wx - 230, 600, '0°C', C.iceL, p.coldAt || 2.4, 'TWO METRES AWAY, BY THE WALL');
  // candles
  const cna = fade(t, p.candleAt || 99, 0.5);
  if (cna > 0) for (let i = 0; i < 3; i++) { const x = 1040 + i * 90, y = fl; ctx.fillStyle = hexA(C.cream, cna); ctx.fillRect(x - 12, y - 90, 24, 90); const fy = y - 104 + Math.sin(t * 9 + i) * 3;
    ctx.fillStyle = hexA(C.yellow, cna); ctx.beginPath(); ctx.ellipse(x, fy, 9, 18, 0, 0, 7); ctx.fill(); }
  if (cna > 0) text(ctx, 'CANDLES: PARAFFIN, ASBESTOS-CORD WICKS', 1130, fl + 60, { size: 28, font: F.head, align: 'center', color: C.yellow, alpha: cna });
  tag(ctx, 'DIAGRAM · NOT TO SCALE · BASED ON CREW ACCOUNTS');
  src(ctx, p.source || 'Sources: RT (2022), Nauka i Zhizn (2001), crew accounts');
}

// The night of the fire: station plan, power station burns, wind turns, flames miss the fuel store.
// keys: p.fireAt, p.spreadAt, p.windAt, p.saveAt
function firemap(ctx, t, d, p) {
  navyBg(ctx, t, false);
  text(ctx, p.title || 'VOSTOK, 12 APRIL 1982, ABOUT 4 A.M.', W / 2, 100, { size: 54, font: F.head, align: 'center', color: C.cream, alpha: fade(t, 0.1) });
  // snow ground
  ctx.save(); ctx.fillStyle = hexA(C.frost, 0.06); rr(ctx, 120, 170, W - 240, 820, 30); ctx.fill(); ctx.restore();
  const fire = clamp(seg(t, p.fireAt || 0.5, (p.fireAt || 0.5) + 1.2)), spread = clamp(seg(t, p.spreadAt || 2, (p.spreadAt || 2) + 1.5));
  const B = (x, y, w, h, lab, col) => { ctx.save(); ctx.fillStyle = col; rr(ctx, x, y, w, h, 10); ctx.fill(); ctx.strokeStyle = hexA(C.cream, 0.6); ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); text(ctx, lab, x + w / 2, y + h + 40, { size: 28, font: F.head, align: 'center', color: C.cream }); };
  B(300, 420, 300, 200, 'LIVING QUARTERS', C.navy3);
  B(300, 700, 220, 140, 'MESS ROOM', C.navy3);
  B(800, 400, 380, 240, 'POWER STATION', K.lerpCol('#26406B', '#5A1E14', spread));
  B(1180, 470, 120, 110, 'ANNEX', K.lerpCol('#26406B', '#5A1E14', fire));
  // fuel barrels
  const bx = 1420, by = 720;
  for (let i = 0; i < 18; i++) { const x = bx + (i % 6) * 48, y = by + Math.floor(i / 6) * 48; ctx.fillStyle = '#8E6A2E'; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fill(); ctx.strokeStyle = '#4A3410'; ctx.lineWidth = 3; ctx.stroke(); }
  text(ctx, 'FUEL STORE', bx + 120, by + 175, { size: 28, font: F.head, align: 'center', color: C.yellow });
  // flames
  const flame = (cx, cy, r, a) => { if (a <= 0) return; for (let i = 0; i < 14; i++) { const u = ((t * 1.3 + hash(i)) % 1), x = cx + (hash(i + 3) - 0.5) * r * 1.6, y = cy - u * r * 1.4;
      ctx.fillStyle = hexA(i % 3 ? C.orange : C.yellow, a * (1 - u) * 0.9); ctx.beginPath(); ctx.arc(x, y, r * 0.22 * (1 - u * 0.6), 0, 7); ctx.fill(); }
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 2.4); g.addColorStop(0, hexA(C.orange, 0.45 * a)); g.addColorStop(1, hexA(C.orange, 0)); ctx.fillStyle = g; ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6); };
  flame(1240, 500, 70, fire); flame(990, 480, 150, spread);
  if (fire > 0) text(ctx, 'FIRE STARTS IN THE ANNEX (PROBABLY THE WIRING)', 1240, 300, { size: 26, font: F.bold, align: 'center', color: C.orange, alpha: fade(t, (p.fireAt || 0.5) + 0.4) });
  if (spread > 0.3) text(ctx, '~15 MIN: THE WHOLE POWER STATION BURNS', 990, 760, { size: 30, font: F.head, align: 'center', color: C.red, alpha: fade(t, (p.spreadAt || 2) + 0.8) });
  // wind
  const wa = fade(t, p.windAt || 99, 0.5);
  if (wa > 0) { const ang = lerp(0.55, -0.9, E.inOut(clamp(seg(t, p.windAt, p.windAt + 1.2)))); ctx.save(); ctx.globalAlpha = wa; ctx.translate(1600, 300); ctx.rotate(ang);
    for (let k = -1; k <= 1; k++) arrow(ctx, -110, k * 40, 110, k * 40, { color: C.iceL, w: 6, head: 22 }); ctx.restore();
    text(ctx, 'THE WIND CHANGES', 1600, 220, { size: 32, font: F.head, align: 'center', color: C.iceL, alpha: wa }); }
  const sa = fade(t, p.saveAt || 99, 0.5);
  if (sa > 0) { ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = '#7CD992'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx + 120, by + 48, 190, 0, 7); ctx.stroke(); ctx.restore();
    text(ctx, 'THE FUEL SURVIVES', bx + 120, by - 170, { size: 36, font: F.head, align: 'center', color: '#7CD992', alpha: sa }); }
  tag(ctx, 'DIAGRAM · LAYOUT SIMPLIFIED · BASED ON CREW ACCOUNTS');
  src(ctx, p.source || 'Sources: AARI (2017), RT (2022), Meduza (2020)');
}

module.exports = { ladder, yearbar, stove, firemap };
