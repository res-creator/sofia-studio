// atlaskit scenes, set 3 (EP03 Venice): pile foundation cross-section, MOSE gate, tide sirens.
const K = require('./core');
const { W, H, C, F, clamp, lerp, seg, E, key, hexA, rr, text, chip, navyBg, hash } = K;
const S = require('./scenes');
const fade = (t, at, dur = 0.4) => E.out(clamp(seg(t, at, at + dur)));
const kv = (p, n, t, d = 0) => (p[n] == null ? d : key(p[n], t));

// Venetian foundation: water / soft mud / caranto clay; piles driven, platform, Istrian stone, brick.
// keys (0..1, keyframable): drive, platform, stone, brick, worm (bricola in open water vs pile in mud), rot (outer-layer bacterial softening), pack (mud compaction)
function piles(ctx, t, d, p) {
  const z = kv(p, 'zoom', t, 1), fx = p.fx == null ? W / 2 : key(p.fx, t), fy = p.fy == null ? H / 2 : key(p.fy, t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx, -fy);
  const WL = 330, MUD = 470, CAR = 800; // water line, mud top, caranto top
  // sky + water
  let g = ctx.createLinearGradient(0, 0, 0, WL); g.addColorStop(0, '#1C2E50'); g.addColorStop(1, '#3B5C8C'); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, WL + 400);
  g = ctx.createLinearGradient(0, WL, 0, MUD); g.addColorStop(0, '#2E6E8E'); g.addColorStop(1, '#1D4A63'); ctx.fillStyle = g; ctx.fillRect(-400, WL, W + 800, MUD - WL);
  for (let i = 0; i < 26; i++) { const x = ((hash(i) * W * 1.4 + t * 30 * (0.5 + hash(i + 7))) % (W + 400)) - 200; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, WL + 6 + (i % 4) * 4); ctx.lineTo(x + 40, WL + 6 + (i % 4) * 4); ctx.stroke(); }
  // mud
  const pack = kv(p, 'pack', t);
  g = ctx.createLinearGradient(0, MUD, 0, CAR); g.addColorStop(0, '#5B4A3A'); g.addColorStop(1, '#46392D'); ctx.fillStyle = g; ctx.fillRect(-400, MUD, W + 800, CAR - MUD);
  for (let i = 0; i < 120; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.arc(hash(i + 11) * W, MUD + hash(i + 3) * (CAR - MUD), 2 + hash(i) * 3, 0, 7); ctx.fill(); }
  // caranto
  g = ctx.createLinearGradient(0, CAR, 0, H + 400); g.addColorStop(0, '#8A6F4D'); g.addColorStop(1, '#6B543A'); ctx.fillStyle = g; ctx.fillRect(-400, CAR, W + 800, H + 400 - CAR);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; for (let y = CAR + 30; y < H + 300; y += 34) { ctx.beginPath(); ctx.moveTo(-400, y); for (let x = -400; x < W + 400; x += 80) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 4); ctx.stroke(); }
  // piles
  const drive = kv(p, 'drive', t, 1), n = 15, x0 = 610, x1 = 1310, pw = 26, plen = 470, rot = kv(p, 'rot', t);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)); const di = clamp(drive * n - i, 0, 1); const top = lerp(WL - 260, MUD - 10, E.out(di));
    if (di <= 0) continue;
    ctx.fillStyle = '#B88A55'; ctx.fillRect(x - pw / 2, top, pw, plen); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + pw / 2 - 7, top, 7, plen);
    ctx.beginPath(); ctx.moveTo(x - pw / 2, top + plen); ctx.lineTo(x, top + plen + 30); ctx.lineTo(x + pw / 2, top + plen); ctx.fillStyle = '#B88A55'; ctx.fill();
    if (rot > 0.01) { ctx.strokeStyle = hexA('#3D2B1A', 0.7 * rot); ctx.lineWidth = 6; ctx.strokeRect(x - pw / 2 + 3, top + 40, pw - 6, plen - 40); } }
  // pack: compaction shading between piles
  if (pack > 0.01) { ctx.fillStyle = hexA('#2A2119', 0.45 * pack); ctx.fillRect(x0 - 20, MUD, x1 - x0 + 40, CAR - MUD + 40); }
  // drop weight animation for the next pile
  if (drive > 0 && drive < 1) { const i = Math.min(n - 1, Math.floor(drive * n)); const x = lerp(x0, x1, i / (n - 1)); const b = Math.abs(Math.sin(t * 6)); ctx.fillStyle = '#444'; ctx.fillRect(x - 40, WL - 330 - 60 * b, 80, 50); ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x, WL - 330 - 60 * b); ctx.stroke(); }
  // platform
  const pl = kv(p, 'platform', t); if (pl > 0) { ctx.globalAlpha = pl; ctx.fillStyle = '#8C6239'; ctx.fillRect(x0 - 50, MUD - 34, (x1 - x0 + 100), 30); ctx.strokeStyle = '#5E4026'; ctx.lineWidth = 2; for (let x = x0 - 50; x < x1 + 50; x += 60) { ctx.beginPath(); ctx.moveTo(x, MUD - 34); ctx.lineTo(x, MUD - 4); ctx.stroke(); } ctx.globalAlpha = 1; }
  // Istrian stone
  const st = kv(p, 'stone', t); if (st > 0) { const h = 190 * E.out(st); ctx.fillStyle = '#E9E4D8'; ctx.fillRect(x0 - 40, MUD - 34 - h, x1 - x0 + 80, h); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; for (let y = MUD - 34 - h + 38; y < MUD - 34; y += 38) { ctx.beginPath(); ctx.moveTo(x0 - 40, y); ctx.lineTo(x1 + 40, y); ctx.stroke(); } }
  // brick
  const br = kv(p, 'brick', t); if (br > 0) { const base = MUD - 34 - 190, h = 520 * E.out(br); ctx.fillStyle = '#B5583B'; ctx.fillRect(x0 - 40, base - h, x1 - x0 + 80, h); ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 2;
    for (let y = base - 22, r = 0; y > base - h; y -= 22, r++) { ctx.beginPath(); ctx.moveTo(x0 - 40, y); ctx.lineTo(x1 + 40, y); ctx.stroke(); for (let x = x0 - 40 + (r % 2) * 30; x < x1 + 40; x += 60) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke(); } }
    if (br > 0.6) { ctx.globalAlpha = fade(br, 0.6, 0.3); for (let i = 0; i < 5; i++) { const wx = x0 + 40 + i * 150; ctx.fillStyle = '#F2D59A'; ctx.fillRect(wx, base - h + 80, 60, 100); ctx.fillRect(wx, base - h + 260, 60, 100); } ctx.globalAlpha = 1; } }
  // bricola in open water (worm)
  const wo = kv(p, 'worm', t); if (wo > 0) { const x = 250; ctx.globalAlpha = wo; ctx.fillStyle = '#9C7A50'; ctx.fillRect(x - 22, WL - 160, 44, MUD - WL + 200); for (let i = 0; i < 26; i++) { ctx.fillStyle = '#3B2A1A'; ctx.beginPath(); ctx.arc(x - 16 + hash(i) * 32, WL + 10 + hash(i + 5) * (MUD - WL - 20), 3 + hash(i + 2) * 3, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  ctx.restore();
  // labels (screen space, no zoom)
  const L = (s, x, y, a, col) => { if (a > 0) text(ctx, s, x, y, { size: 34, font: F.monoB, color: col || C.cream, alpha: a, shadow: 8 }); };
  if (p.labels !== false) { L('WATER', 40, 400, fade(t, 0.3)); L('SOFT MUD', 40, 640, fade(t, 0.6)); L('CARANTO · HARD CLAY', 40, 900, fade(t, 0.9), C.yellow); }
  text(ctx, 'ILLUSTRATION · NOT TO SCALE', W - 40, H - 24, { size: 22, font: F.monoB, align: 'right', color: hexA(C.cream, 0.6) });
  S.overlays(ctx, t, d, p);
}

// MOSE gate: sea (left) / lagoon (right); gate hinged on the seabed caisson; keys: raise (0 flat & water-filled → 1 raised & air-filled), sea (sea level rise 0..1), air (bubbles)
function mose(ctx, t, d, p) {
  navyBg(ctx, t, false);
  const bed = 820, hx = 960, L = 430; const raise = kv(p, 'raise', t), sea = kv(p, 'sea', t), air = kv(p, 'air', t, raise > 0 && raise < 1 ? 1 : 0);
  const lagoonY = 520, seaY = lagoonY - 150 * sea;
  // water
  ctx.fillStyle = '#2E6E8E'; ctx.fillRect(0, seaY, hx, bed - seaY); ctx.fillStyle = '#3A7FA0'; ctx.fillRect(hx, (raise > 0.85 ? lagoonY : seaY), W - hx, bed - (raise > 0.85 ? lagoonY : seaY));
  ctx.fillStyle = '#5B4A3A'; ctx.fillRect(0, bed, W, H - bed);
  // caisson
  ctx.fillStyle = '#7D8A99'; ctx.fillRect(hx - 520, bed, 560, 90);
  // gate: hinge at hx, bed; lies toward the left on the seabed when flat, rotates up to ~50°
  const ang = lerp(Math.PI, Math.PI * 0.72, E.inOut(raise)); ctx.save(); ctx.translate(hx, bed); ctx.rotate(ang);
  ctx.fillStyle = '#D9A441'; rr(ctx, 0, -32, L, 64, 6); ctx.fill(); ctx.fillStyle = raise > 0.05 ? hexA('#FFFFFF', 0.35 * raise) : hexA('#2E6E8E', 0.9); rr(ctx, 12, -22, L - 24, 44, 4); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(hx, bed, 14, 0, 7); ctx.fill();
  if (air > 0) for (let i = 0; i < 18; i++) { const u = ((t * 0.6 + hash(i)) % 1); const x = hx - 60 - hash(i + 3) * 300, y = bed - 30 - u * 260; ctx.fillStyle = hexA('#FFFFFF', 0.6 * air * (1 - u)); ctx.beginPath(); ctx.arc(x, y, 5 + hash(i) * 6, 0, 7); ctx.fill(); }
  text(ctx, 'ADRIATIC SEA', 240, seaY - 30, { size: 40, font: F.head, color: C.cream });
  text(ctx, 'LAGOON', W - 260, (raise > 0.85 ? lagoonY : seaY) - 30, { size: 40, font: F.head, color: C.cream, align: 'center' });
  text(ctx, raise < 0.05 ? 'GATE FULL OF WATER · LYING ON THE SEABED' : raise > 0.95 ? 'AIR PUMPED IN → GATE FLOATS UP' : 'AIR IN, WATER OUT…', W / 2, 150, { size: 44, font: F.head, align: 'center', color: C.yellow });
  text(ctx, p.title || 'MOSE · 78 GATES AT 3 LAGOON INLETS', W / 2, 90, { size: 36, font: F.monoB, align: 'center', color: C.iceL });
  text(ctx, 'ILLUSTRATION · NOT TO SCALE', W - 40, H - 24, { size: 22, font: F.monoB, align: 'right', color: hexA(C.cream, 0.6) });
  S.overlays(ctx, t, d, p);
}

// tide sirens: vertical tide scale; St Mark's floods ~80 cm; tones 110/120/130/140
function sirens(ctx, t, d, p) {
  navyBg(ctx, t, false); const y0 = 940, s = 4.2, X = 300; const Y = cm => y0 - (cm - 60) * s;
  text(ctx, p.title || 'THE ACQUA ALTA SIRENS', W / 2, 110, { size: 60, font: F.head, align: 'center', color: C.cream });
  ctx.strokeStyle = hexA(C.cream, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, Y(60)); ctx.lineTo(X, Y(200)); ctx.stroke();
  for (let cm = 60; cm <= 200; cm += 20) text(ctx, cm + ' cm', X - 20, Y(cm) + 10, { size: 26, font: F.monoB, align: 'right', color: hexA(C.cream, 0.7) });
  const lvl = kv(p, 'level', t, 60); ctx.fillStyle = hexA('#3A7FA0', 0.55); ctx.fillRect(X + 10, Y(lvl), 1500, y0 - Y(lvl));
  const sm = fade(t, p.smAt || 0.5); ctx.strokeStyle = hexA(C.orange, sm); ctx.setLineDash([12, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, Y(80)); ctx.lineTo(X + 1500, Y(80)); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, "~80 cm · ST MARK'S SQUARE STARTS TO FLOOD", X + 30, Y(80) - 14, { size: 30, font: F.bold, color: C.orange, alpha: sm });
  [[110, 1], [120, 2], [130, 3], [140, 4]].forEach(([cm, n], i) => { const at = (p.toneAt || [1.5, 3, 4.5, 6])[i]; const a = fade(t, at); if (a <= 0) return;
    ctx.strokeStyle = hexA(C.yellow, a); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, Y(cm)); ctx.lineTo(X + 1500, Y(cm)); ctx.stroke();
    for (let k = 0; k < n; k++) { const pulse = 0.6 + 0.4 * Math.abs(Math.sin((t - at) * 4 - k)); ctx.fillStyle = hexA(C.yellow, a * pulse); ctx.beginPath(); ctx.arc(X + 900 + k * 60, Y(cm), 18, 0, 7); ctx.fill(); }
    text(ctx, n + (n === 1 ? ' TONE' : ' TONES') + ' → ' + cm + (cm === 140 ? '+' : '') + ' cm', X + 1180, Y(cm) + 12, { size: 34, font: F.head, color: C.cream, alpha: a }); });
  if (p.records) { const a = fade(t, p.recAt || 7); [[194, '1966 · 194 cm'], [187, '2019 · 187 cm']].forEach(([cm, s2], i) => { ctx.strokeStyle = hexA(C.red, a); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X, Y(cm)); ctx.lineTo(X + 1500, Y(cm)); ctx.stroke(); text(ctx, s2, X + 30 + i * 420, Y(cm) - 14, { size: 34, font: F.head, color: C.red, alpha: a }); }); }
  text(ctx, 'Source: Comune di Venezia tide centre; ISPRA', W / 2, H - 30, { size: 22, font: F.reg, align: 'center', color: 'rgba(255,255,255,0.6)' });
  S.overlays(ctx, t, d, p);
}
module.exports = { piles, mose, sirens };
