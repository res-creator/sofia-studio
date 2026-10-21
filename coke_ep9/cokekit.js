// Prop kit for "Coca-Cola's Impossible Coin" (ep 9): the 2.5D coin (7½¢ proposal / nickel / penny), the contour bottle,
// the 1950s coin-op cooler with a face, the price sign with rolling digits, the open palm, blueprint, envelope, the White House,
// rubber stamps, the price tag. Brand names as text only (no logos). All props are drawn in local units around a base point.
const K = require('../tests/mcd_collage/kit');
const { text } = require('../rent_ep4/rentkit');
const { C, F, clamp, lerp, E, rr, cut, flat, hash } = K;
const SKIN = '#F1C9A5', BLUE = '#4D8DFF', BLUED = '#2F64C8';

// ---------- coins ----------
// faces: 'half' = the proposed 7½¢ (silver, "PROPOSED" ring text — never a real coin), 'nickel' 5¢, 'penny' 1¢
const METAL = { half: ['#F2F3F5', '#C3C8CF', '#8E959E'], nickel: ['#E6E8EB', '#B4BAC2', '#80878F'], penny: ['#F0A877', '#C8733F', '#8F4C25'] };
const RING = { half: 'PROPOSED  ·  SEVEN AND A HALF CENTS  ·  ', nickel: 'FIVE CENTS  ·  FIVE CENTS  ·  ', penny: 'ONE CENT  ·  ONE CENT  ·  ' };
const MARK = { half: '7½¢', nickel: '5¢', penny: '1¢' };
function ringText(ctx, s, r, size, col) {
  ctx.save(); ctx.font = `${size}px ${F.black}`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const total = [...s].reduce((a, ch) => a + ctx.measureText(ch).width, 0), k = (Math.PI * 2 * r) / total; let a = -Math.PI / 2;
  for (const ch of s) { const w = ctx.measureText(ch).width * k, th = w / r; ctx.save(); ctx.rotate(a + th / 2 + Math.PI / 2); ctx.translate(0, -r); ctx.scale(k, 1); ctx.fillText(ch, 0, 0); ctx.restore(); a += th; }
  ctx.restore();
}
// r radius, o.spin (radians around the vertical axis), o.tilt (0..0.7 squash toward the viewer's floor view), o.face, o.pulse7 / o.pulseH (bounce of the 7 / the ½)
function coin(ctx, r, o = {}) {
  const face = o.face || 'half', M = METAL[face], sp = o.spin || 0, cs = Math.cos(sp), sn = Math.sin(sp), sx = Math.max(0.035, Math.abs(cs)), sy = 1 - (o.tilt || 0);
  const th = r * 0.13, dx = -sn * th * (cs >= 0 ? 1 : -1), dy = (o.tilt || 0) * th * 1.4;
  ctx.save();
  if (o.shadow !== false) { ctx.save(); ctx.fillStyle = 'rgba(60,40,20,0.20)'; ctx.filter = `blur(${Math.max(2, r * 0.06).toFixed(1)}px)`; ctx.beginPath(); ctx.ellipse(r * 0.12, r * 0.16, r * sx + Math.abs(dx), r * sy, 0, 0, 7); ctx.fill(); ctx.restore(); }
  // paper rim (cutout look)
  ctx.fillStyle = C.rim; ctx.beginPath(); ctx.ellipse(dx / 2, dy / 2, r * sx + Math.abs(dx) / 2 + r * 0.045, r * sy + Math.abs(dy) / 2 + r * 0.045, 0, 0, 7); ctx.fill();
  // the edge (reeded): back ellipse + band
  ctx.fillStyle = M[2]; ctx.beginPath(); ctx.ellipse(dx, dy, r * sx, r * sy, 0, 0, 7); ctx.fill();
  if (Math.abs(dx) > 0.5) { ctx.beginPath(); ctx.rect(Math.min(0, dx), -r * sy, Math.abs(dx), 2 * r * sy); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(dx, dy, r * sx, r * sy, 0, 0, 7); ctx.rect(Math.min(0, dx), -r * sy, Math.abs(dx), 2 * r * sy); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, r * 0.012); for (let i = -20; i <= 20; i++) { const y = (i / 20) * r * sy; ctx.beginPath(); ctx.moveTo(Math.min(0, dx) - r, y); ctx.lineTo(Math.max(0, dx) + r, y); ctx.stroke(); } ctx.restore(); }
  if (Math.abs(dy) > 0.5) { ctx.beginPath(); ctx.rect(-r * sx, 0, 2 * r * sx, dy); ctx.fill(); }
  ctx.lineWidth = Math.max(2, r * 0.022); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.ellipse(dx, dy, r * sx, r * sy, 0, 0, 7); ctx.stroke();
  // the face
  ctx.save(); ctx.scale(sx, sy);
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, M[0]); g.addColorStop(0.55, M[1]); g.addColorStop(1, M[2]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.025); ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.lineWidth = r * 0.035; ctx.strokeStyle = 'rgba(23,23,23,0.35)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, 7); ctx.stroke();
  ctx.lineWidth = r * 0.02; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.stroke();
  if (r > 30) ringText(ctx, RING[face], r * 0.78, Math.round(r * 0.105), 'rgba(23,23,23,0.72)');
  // the mark: 7½¢ (the ½ can bounce on its own), 5¢, 1¢
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const ink = face === 'penny' ? '#4A2410' : C.ink;
  if (face === 'half') {
    const sz = r * 0.62; ctx.font = `${sz}px ${F.black}`; const w7 = ctx.measureText('7').width, wh = ctx.measureText('½').width, wc = ctx.measureText('¢').width, x0 = -(w7 + wh + wc) / 2, base = sz * 0.36;
    const pr = (s, x, k, col) => { ctx.save(); ctx.translate(x, base - sz * 0.35); ctx.scale(k, k); ctx.fillStyle = col; ctx.lineJoin = 'round'; ctx.lineWidth = r * 0.03; ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.strokeText(s, 0, sz * 0.35); ctx.fillText(s, 0, sz * 0.35); ctx.restore(); };
    pr('7', x0 + w7 / 2, 1 + (o.pulse7 || 0) * 0.25, ink); pr('½', x0 + w7 + wh / 2, 1 + (o.pulseH || 0) * 0.45, (o.pulseH || 0) > 0.05 ? C.red : ink); pr('¢', x0 + w7 + wh + wc / 2, 1, ink);
  } else { const sz = r * 0.8; ctx.font = `${sz}px ${F.black}`; ctx.fillStyle = ink; ctx.lineWidth = r * 0.03; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.strokeText(MARK[face], 0, sz * 0.36); ctx.fillText(MARK[face], 0, sz * 0.36); }
  // shine sweep
  const sh = o.shine ?? ((sp * 0.5) % 1);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); ctx.rotate(-0.6); const sxp = lerp(-r * 1.6, r * 1.6, ((sh % 1) + 1) % 1);
  const sg = ctx.createLinearGradient(sxp - r * 0.25, 0, sxp + r * 0.25, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg; ctx.fillRect(-r * 2, -r * 2, r * 4, r * 4); ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ---------- the contour bottle (origin = bottom centre, height 760) ----------
const PROF = [[60, 0], [74, -16], [86, -80], [90, -170], [80, -255], [72, -320], [84, -405], [86, -470], [68, -555], [40, -630], [29, -690], [31, -730], [33, -748]];
function profile(ctx) {
  const P = [...PROF.map(([x, y]) => [x, y]), ...PROF.slice().reverse().map(([x, y]) => [-x, y])];
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    if (i === PROF.length - 1) { ctx.lineTo(p2[0], p2[1]); continue; }
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
  ctx.closePath();
}
function bottle(ctx, o = {}) {
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(14, 4, 110, 18, 0, 0, 7); ctx.fill(); }
  cut(ctx, () => profile(ctx), '#7FA88F', { sb: 26, sy: 12, lw: 0, edgeW: 16 });
  ctx.save(); profile(ctx); ctx.clip();
  const lv = -560 + (o.empty || 0) * 560;                                                              // the cola level
  ctx.fillStyle = '#3A1C12'; ctx.fillRect(-120, lv, 240, 800);
  ctx.fillStyle = 'rgba(160,210,180,0.35)'; ctx.fillRect(-120, -800, 240, lv + 800);                   // empty glass part
  for (let i = -3; i <= 3; i++) { ctx.strokeStyle = `rgba(255,255,255,${i === -2 ? 0.45 : 0.16})`; ctx.lineWidth = i === -2 ? 10 : 5; ctx.beginPath(); ctx.moveTo(i * 22, -20); ctx.bezierCurveTo(i * 26, -200, i * 20, -330, i * 25, -470); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = 4.5; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; profile(ctx); ctx.stroke();
  // the red label band (brand as plain text)
  ctx.save(); ctx.translate(0, -300); ctx.rotate(-0.06);
  cut(ctx, () => rr(ctx, -98, -46, 196, 92, 10), C.red, { sb: 10, sy: 5, lw: 3.5, edgeW: 8 });
  text(ctx, o.label || 'COCA-COLA', 0, 14, 36, '#FFFFFF', F.black, 'center', 170); ctx.restore();
  // the crown cap
  cut(ctx, () => { ctx.beginPath(); for (let i = 0; i <= 10; i++) { const x = -38 + i * 7.6; ctx.lineTo(x, -748 + (i % 2) * 6); } ctx.lineTo(36, -778); ctx.lineTo(-36, -778); ctx.closePath(); }, C.red, { sb: 6, sy: 3, lw: 3.5, edgeW: 6 });
}

// ---------- the 1950s coin-op cooler (origin = floor centre, 520 x 1300, 2.5D side) ----------
// o.price string on the sign, o.roll {from, to, u} rolling digits, o.eyes {look:[x,y], open, mood:'calm'|'wide'|'annoyed'|'happy'}, o.inside (fn: draws bottles in the window),
// o.slotGlow 0..1, o.shake (px)
const MW = 520, MH = 1300, MDX = 64, MDY = -46;
const SLOT = [170, -205], SIGN = [-20, -890], WIN = [-215, -720, 305, 470];
function machine(ctx, o = {}) {
  ctx.save(); if (o.shake) ctx.translate(Math.sin(o.t * 70) * o.shake, 0);
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(MDX * 0.4, 6, MW * 0.66, 24, 0, 0, 7); ctx.fill();
  // side
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(MW / 2, 0); ctx.lineTo(MW / 2 + MDX, MDY); ctx.lineTo(MW / 2 + MDX, MDY - MH + 60); ctx.quadraticCurveTo(MW / 2 + MDX, MDY - MH, MW / 2 + MDX - 40, MDY - MH); ctx.lineTo(MW / 2 - 40, -MH); ctx.closePath(); }, C.redD, { sb: 22, sy: 10, lw: 4 });
  // top
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-MW / 2 + 60, -MH); ctx.lineTo(MW / 2 - 40, -MH); ctx.lineTo(MW / 2 - 40 + MDX, -MH + MDY); ctx.lineTo(-MW / 2 + 60 + MDX, -MH + MDY); ctx.closePath(); }, '#F0606B', 4);
  // front
  cut(ctx, () => rr(ctx, -MW / 2, -MH, MW, MH, [60, 60, 8, 8]), C.red, { sb: 26, sy: 12, lw: 4.5 });
  // base / feet
  flat(ctx, () => rr(ctx, -MW / 2, -70, MW, 70, [0, 0, 8, 8]), '#3B3B3B', 4);
  // crest: brand as text
  cut(ctx, () => rr(ctx, -MW / 2 + 40, -MH + 40, MW - 80, 96, 48), '#FFFDF8', { sb: 8, sy: 4, lw: 3.5, edgeW: 0 });
  text(ctx, 'COCA-COLA', 0, -MH + 108, 58, C.red, F.black, 'center', MW - 130);
  // eyes
  const ey = o.eyes || {}, op = ey.open ?? 1, lk = ey.look || [0, 0], md = ey.mood || 'calm';
  for (const sx of [-1, 1]) { const ex = sx * 92, eyY = -MH + 228, er = md === 'wide' ? 52 : 44, eh = er * (md === 'annoyed' ? 0.55 : 1) * op;
    flat(ctx, () => { ctx.beginPath(); ctx.ellipse(ex, eyY, er, Math.max(3, eh), 0, 0, 7); }, '#FFFFFF', 4);
    if (op > 0.2) { ctx.save(); ctx.beginPath(); ctx.ellipse(ex, eyY, er, Math.max(3, eh), 0, 0, 7); ctx.clip(); flat(ctx, () => { ctx.beginPath(); ctx.arc(ex + lk[0] * er * 0.45, eyY + lk[1] * er * 0.4, er * (md === 'wide' ? 0.32 : 0.42), 0, 7); }, C.ink); ctx.restore(); }
    // brows
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath();
    const by = eyY - er - 18 - (md === 'wide' ? 16 : 0), tilt = md === 'annoyed' ? 16 : md === 'happy' ? -8 : 0;
    ctx.moveTo(ex - 40 * sx, by - tilt * 0); ctx.lineTo(ex + 38 * sx, by + tilt); ctx.stroke(); ctx.restore();
    if (md === 'happy') { ctx.save(); ctx.fillStyle = C.red; ctx.fillRect(ex - er - 4, eyY + 4, er * 2 + 8, er + 6); ctx.restore(); }
  }
  // the price sign (white box, rolling digits)
  ctx.save(); ctx.translate(SIGN[0], SIGN[1]); const ss = o.signScale || 1; ctx.scale(ss, ss);
  cut(ctx, () => rr(ctx, -150, -80, 300, 160, 14), '#FFFDF8', { sb: 10, sy: 5, lw: 4, edgeW: 0 });
  ctx.save(); rr(ctx, -146, -76, 292, 152, 12); ctx.clip();
  const R = o.roll; const fs = 128;
  if (R && R.u > 0 && R.u < 1) { const u = E.inOut(R.u); text(ctx, R.from, 0, 46 - u * 160, fs, C.ink, F.black, 'center', 270); text(ctx, R.to, 0, 46 + (1 - u) * 160, fs, o.priceCol || C.ink, F.black, 'center', 270); }
  else text(ctx, R && R.u >= 1 ? R.to : (o.price || '5¢'), 0, 46, fs, o.priceCol || C.ink, F.black, 'center', 270);
  ctx.restore(); ctx.restore();
  text(ctx, 'ICE COLD', -20, -740, 46, '#FFFDF8', F.black, 'center', 300);
  // bottle window
  const [wx, wy, ww, wh] = WIN;
  flat(ctx, () => rr(ctx, wx - 10, wy + 40, ww + 20, wh + 20, 18), '#B32B37');
  ctx.save(); rr(ctx, wx, wy + 50, ww, wh, 12); ctx.fillStyle = '#2A2F3A'; ctx.fill(); ctx.clip(); if (o.inside) o.inside(ctx); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.moveTo(wx, wy + 50); ctx.lineTo(wx + 120, wy + 50); ctx.lineTo(wx + 40, wy + 520); ctx.lineTo(wx, wy + 520); ctx.fill(); ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink; rr(ctx, wx, wy + 50, ww, wh, 12); ctx.stroke();
  // the coin plate: "5¢ ONLY"
  ctx.save(); ctx.translate(SLOT[0], SLOT[1]);
  cut(ctx, () => rr(ctx, -62, -120, 124, 220, 14), '#D8DCE2', { sb: 8, sy: 4, lw: 4, edgeW: 0 });
  flat(ctx, () => rr(ctx, -50, -108, 100, 40, 6), C.ink); text(ctx, o.plate || '5¢ ONLY', 0, -78, 26, '#FFFFFF', F.black, 'center', 92);
  const gl = o.slotGlow || 0; if (gl > 0) { ctx.save(); ctx.shadowColor = `rgba(255,200,87,${gl})`; ctx.shadowBlur = 40; flat(ctx, () => rr(ctx, -10, -44, 20, 92, 10), C.yellow); ctx.restore(); }
  flat(ctx, () => rr(ctx, -8, -42, 16, 88, 8), '#101010'); flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 76, 18, 0, 7); }, '#9AA0A8', 3);
  ctx.restore();
  // delivery door
  flat(ctx, () => rr(ctx, -200, -175, 300, 92, 14), '#1E1E1E', 4); flat(ctx, () => rr(ctx, -190, -168, 280, 30, 10), '#3A3A3A');
  ctx.restore();
}
// bottles standing in the window (machine-local coordinates)
function windowBottles(ctx, o = {}) { const [wx, wy, ww] = WIN; const s = 0.52, base = wy + 50 + 470 - 6;
  for (const [i, dx] of [[0, -100], [1, 100]]) { ctx.save(); ctx.translate(wx + ww / 2 + dx, base + 4); ctx.scale(s * 0.92, s * 0.92); ctx.globalAlpha *= 0.85; bottle(ctx, { shadow: false }); ctx.restore(); }
}

// ---------- the open palm from below (origin = palm centre), coins drawn by the caller ----------
function palm(ctx) {
  cut(ctx, () => rr(ctx, -95, 120, 190, 900, 30), BLUE, { sb: 24, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -104, 110, 208, 50, 16), BLUED, 4);
  cut(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 20, 150, 130, 0, 0, 7); }, SKIN, { sb: 18, sy: 9, lw: 4 });
  for (const [dx, a, l] of [[-112, -0.15, 120], [-48, -0.04, 140], [16, 0.04, 140], [80, 0.15, 120]]) { ctx.save(); ctx.translate(dx + 16, -82); ctx.rotate(a); cut(ctx, () => rr(ctx, -27, -l, 54, l + 30, 27), SKIN, { sb: 8, sy: 4, lw: 4, edgeW: 6 }); ctx.restore(); }
  ctx.save(); ctx.translate(150, 40); ctx.rotate(0.9); cut(ctx, () => rr(ctx, -28, -130, 56, 150, 28), SKIN, { sb: 8, sy: 4, lw: 4, edgeW: 6 }); ctx.restore();
  ctx.strokeStyle = '#D9A47E'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-80, 40); ctx.quadraticCurveTo(0, 90, 90, 20); ctx.stroke();
}

// ---------- blueprint sheet (origin = centre); u 0..1 unroll from the top ----------
function blueprint(ctx, w, h, u, t = 0) {
  if (u <= 0) return; const hh = h * E.out(u);
  cut(ctx, () => rr(ctx, -w / 2, -h / 2, w, hh, 10), BLUED, { sb: 30, sy: 14, lw: 4 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, hh, 10); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 2; for (let x = -w / 2; x < w / 2; x += 50) { ctx.beginPath(); ctx.moveTo(x, -h / 2); ctx.lineTo(x, h / 2); ctx.stroke(); }
  for (let y = -h / 2; y < h / 2; y += 50) { ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; rr(ctx, -w / 2 + 24, -h / 2 + 24, w - 48, h - 48, 4); ctx.stroke();
  text(ctx, 'PROPOSAL: A NEW U.S. COIN', -w / 2 + 50, -h / 2 + 88, 40, '#FFFFFF', F.black, 'left', w - 100);
  ctx.restore();
  if (u < 1) { ctx.save(); ctx.translate(0, -h / 2 + hh); cut(ctx, () => rr(ctx, -w / 2 - 10, -26, w + 20, 52, 26), '#5E8EE0', { sb: 12, sy: 6, lw: 4 }); ctx.restore(); }
}
// a dimension line with arrows + label (blueprint style)
function dim(ctx, x0, y0, x1, y1, label, u = 1) {
  if (u <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(u * 2); ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 4;
  const x = lerp(x0, x1, E.out(u)), y = lerp(y0, y1, E.out(u)); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0); for (const [px, py, aa] of [[x0, y0, a + Math.PI], [x, y, a]]) { ctx.save(); ctx.translate(px, py); ctx.rotate(aa); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-22, -11); ctx.lineTo(-22, 11); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (label && u > 0.6) text(ctx, label, (x0 + x1) / 2, (y0 + y1) / 2 - 18, 34, '#FFFFFF', F.black, 'center');
  ctx.restore();
}

// ---------- envelope (origin = centre, 640 x 400); o.flap 0 closed .. 1 open; o.front(fn) draws on the front ----------
function envelopeBack(ctx, o = {}) {
  cut(ctx, () => rr(ctx, -320, -200, 640, 400, 12), '#EFE6D2', { sb: 28, sy: 14, lw: 4 });
  const f = o.flap ?? 0; if (f > 0.5) flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-320, -200); ctx.lineTo(0, -200 - 220 * (f - 0.5) * 2); ctx.lineTo(320, -200); ctx.closePath(); }, '#E3D7BE', 4);
}
function envelopeFront(ctx, o = {}) {
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-320, -200); ctx.lineTo(0, 30); ctx.lineTo(320, -200); ctx.lineTo(320, 200); ctx.lineTo(-320, 200); ctx.closePath(); }, '#F7F0E0', 4);
  const f = o.flap ?? 0; if (f <= 0.5) flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-320, -200); ctx.lineTo(0, -200 + 230 * (1 - f * 2)); ctx.lineTo(320, -200); ctx.closePath(); }, '#E9DEC6', 4);
  ctx.strokeStyle = 'rgba(23,23,23,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-320, 200); ctx.lineTo(-40, 10); ctx.moveTo(320, 200); ctx.lineTo(40, 10); ctx.stroke();
  if (o.front) o.front(ctx);
}

// ---------- the White House (paper cutout, origin = ground centre, ~1000 wide) ----------
function whiteHouse(ctx, t = 0) {
  const wall = '#FFFDF8', sh = '#E4DED2';
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(20, 8, 560, 30, 0, 0, 7); ctx.fill();
  for (const s of [-1, 1]) { cut(ctx, () => rr(ctx, s > 0 ? 210 : -500, -250, 290, 250, 4), wall, { sb: 20, sy: 10, lw: 4 }); flat(ctx, () => rr(ctx, s > 0 ? 200 : -510, -272, 310, 26, 4), sh, 4);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) flat(ctx, () => rr(ctx, (s > 0 ? 232 : -478) + c * 66, -218 + r * 110, 36, 64, 3), '#9FB4CC', 3); }
  cut(ctx, () => rr(ctx, -230, -380, 460, 380, 4), wall, { sb: 24, sy: 12, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-160, -380); ctx.lineTo(0, -470); ctx.lineTo(160, -380); ctx.closePath(); }, wall, 4);
  flat(ctx, () => rr(ctx, -175, -392, 350, 22, 3), sh, 4);
  for (let i = 0; i < 6; i++) { const x = -140 + i * 56; flat(ctx, () => rr(ctx, x - 13, -370, 26, 330, 6), '#F4F0E8', 3); }
  flat(ctx, () => rr(ctx, -190, -40, 380, 40, 3), sh, 4);
  flat(ctx, () => rr(ctx, -30, -150, 60, 110, [30, 30, 0, 0]), '#7B8EA6', 3);
  // the flag
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -470); ctx.lineTo(0, -600); ctx.stroke();
  ctx.save(); ctx.translate(3, -598); for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#FFFFFF' : C.red; ctx.beginPath(); for (let x = 0; x <= 110; x += 10) ctx.lineTo(x, i * 12 + Math.sin(t * 6 + x * 0.06) * 4); for (let x = 110; x >= 0; x -= 10) ctx.lineTo(x, i * 12 + 12 + Math.sin(t * 6 + x * 0.06) * 4); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = BLUED; ctx.fillRect(0, 0, 44, 36); ctx.restore();
}

// ---------- rubber stamp (origin = centre); u 0..1 slam ----------
function stamp(ctx, lines, col, u, o = {}) {
  if (u <= 0) return; const k = lerp(2.2, 1, E.out5(clamp(u))); ctx.save(); ctx.rotate(o.rot ?? -0.12); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3) * (o.a ?? 0.92);
  const size = o.size || 70; ctx.font = `${size}px ${F.black}`; const tw = Math.max(...lines.map(s => ctx.measureText(s).width)) + size * 0.9, th = size * (lines.length * 1.05 + 0.6);
  ctx.strokeStyle = col; ctx.lineWidth = size * 0.11; rr(ctx, -tw / 2, -th / 2, tw, th, size * 0.18); ctx.stroke();
  lines.forEach((s, i) => text(ctx, s, 0, -th / 2 + size * (0.3 + 1.05 * (i + 1)) - size * 0.12, size, col, F.black, 'center'));
  ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-tw / 2 + hash(i) * tw, -th / 2 + hash(i + 7) * th, 3 + hash(i + 3) * 14, 2 + hash(i + 5) * 5); }
  ctx.restore();
}

// ---------- the price tag (origin = the hole); o.label header, o.value, o.roll {from,to,u} ----------
function priceTag(ctx, o = {}) {
  const w = o.w || 360, h = o.h || 250;
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2 + 70, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2 + 70, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath(); }, o.bg || '#FFFDF8', { sb: 20, sy: 10, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-w / 2 + 52, 0, 15, 0, 7); }, C.paper, 4);
  if (o.label) text(ctx, o.label, 30, -h / 2 + 52, 36, o.labelCol || '#7A7A7A', F.black, 'center', w - 120);
  const R = o.roll, cy = o.label ? 62 : 46, fs = o.fs || 130;
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 80, -h / 2 + (o.label ? 64 : 8), w - 90, h - (o.label ? 70 : 16)); ctx.clip();
  if (R && R.u > 0 && R.u < 1) { const u = E.inOut(R.u); text(ctx, R.from, 34, cy - u * 190, fs, o.col || C.ink, F.black, 'center', w - 110); text(ctx, R.to, 34, cy + (1 - u) * 190, fs, o.col || C.ink, F.black, 'center', w - 110); }
  else text(ctx, R && R.u >= 1 ? R.to : o.value, 34, cy, fs, o.col || C.ink, F.black, 'center', w - 110);
  ctx.restore();
}

// ---------- a calendar / year card (origin = centre) ----------
function yearCard(ctx, year, o = {}) {
  cut(ctx, () => rr(ctx, -150, -115, 300, 230, 16), '#FFFDF8', { sb: 20, sy: 10, lw: 4 });
  flat(ctx, () => rr(ctx, -150, -115, 300, 66, [16, 16, 0, 0]), o.head || C.ink);
  for (const x of [-80, 80]) flat(ctx, () => rr(ctx, x - 9, -136, 18, 46, 9), '#9A9A9A', 3);
  text(ctx, o.label || 'YEAR', 0, -68, 34, '#FFFFFF', F.black, 'center', 260);
  text(ctx, String(year), 0, 78, 104, o.col || C.ink, F.black, 'center', 270);
}
// thick ink arrow from (x0,y0) to (x1,y1), u draws it on
function arrow(ctx, x0, y0, x1, y1, u = 1, col = C.ink, w = 26) {
  if (u <= 0) return; const x = lerp(x0, x1, E.out(u)), y = lerp(y0, y1, E.out(u)), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * w, y - Math.sin(a) * w); ctx.stroke();
  ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(w * 0.6, 0); ctx.lineTo(-w * 1.9, -w * 1.6); ctx.lineTo(-w * 1.9, w * 1.6); ctx.closePath(); ctx.fill(); ctx.restore();
}

module.exports = { SKIN, BLUE, BLUED, coin, bottle, machine, windowBottles, MW, MH, SLOT, SIGN, WIN, palm, blueprint, dim, envelopeBack, envelopeFront, whiteHouse, stamp, priceTag, yearCard, arrow };
