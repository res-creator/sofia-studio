// Props for "Your Landlord's Secret Algorithm" (Bold Editorial Collage), built on tests/mcd_collage/kit.js primitives.
// Buildings are 2.5D (front + side + roof in oblique projection); brands appear as text only (no logos).
const K = require('../tests/mcd_collage/kit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat, lerpCol } = K;
const R4 = { cream: C.paper, ink: C.ink, red: C.red, yellow: C.yellow, blue: '#4D8DFF', blueD: '#2F64C8', paper: '#FFFDF8', grey: '#8E95A6', line: '#C9C1B1' };
const text = (ctx, s, x, y, size, col, font = F.black, align = 'left') => { ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); };

// ---------- apartment building: origin at the bottom centre of the front face ----------
const STY = {
  A: { front: '#F1E6CF', side: '#D8C7A6', roof: '#C9B38C', trim: C.red, win: '#2B3A55', lit: '#FFE3A0', frame: '#FFFDF8' },
  B: { front: R4.blue, side: R4.blueD, roof: '#3F72D6', trim: C.yellow, win: '#1E3E86', lit: '#FFF3D6', frame: C.yellow },
  C: { front: '#3A3F4F', side: '#262A36', roof: '#4A5064', trim: '#FFFDF8', win: '#5B6378', lit: C.yellow, frame: '#2A2E3A' },
  D: { front: C.yellow, side: '#E2A23A', roof: '#D99A30', trim: C.ink, win: '#2B2B2B', lit: '#FFFDF8', frame: '#FFFDF8' },
  E: { front: '#E7DED0', side: '#C9BCA8', roof: '#B9AA93', trim: R4.blue, win: '#3B4660', lit: '#FFE3A0', frame: '#FFFDF8' },
};
const WIN = { cols: 4, top: 70, rowH: 92, mx: 46, gap: 22 };
function winRect(o, i) { const w = o.w ?? 360, h = o.h ?? 640, ww = (w - WIN.mx * 2 - WIN.gap * 3) / 4, c = i % 4, r = Math.floor(i / 4);
  return [-w / 2 + WIN.mx + c * (ww + WIN.gap), -h + WIN.top + r * WIN.rowH, ww, 56]; }
const winRows = o => Math.floor(((o.h ?? 640) - WIN.top - 150) / WIN.rowH);
// world position of window i (centre), for windows that fly out as data
function winPos(o, i) { const [x, y, ww, wh] = winRect(o, i), k = 1 - 0.55 * (o.tilt || 0), s = o.s ?? 1; return [o.x + (x + ww / 2) * s, o.y + (y + wh / 2) * k * s]; }
function building(ctx, o = {}) {
  const S = STY[o.style || 'A'], w = o.w ?? 360, h = o.h ?? 640, tilt = o.tilt || 0, side = o.side ?? 1, grow = o.grow ?? 1;
  if (grow <= 0.001) return;
  const k = 1 - 0.55 * tilt, fh = h * k, dx = o.flat ? 0 : side * 70 * (1 - 0.35 * tilt), dy = o.flat ? 0 : -(14 + 240 * tilt);
  ctx.save(); ctx.translate(o.x || 0, o.y || 0); ctx.scale(o.s ?? 1, (o.s ?? 1) * grow); ctx.transform(1, 0, -(o.lean || 0), 1, 0, 0);
  const sx = side * w / 2;
  if (!o.flat) { // side + roof (drawn first, the front face covers the seams)
    cut(ctx, () => { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + dx, dy); ctx.lineTo(sx + dx, -fh + dy); ctx.lineTo(sx, -fh); ctx.closePath(); }, S.side, { sb: 26, sy: 12, lw: 3.5 });
    cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -fh); ctx.lineTo(w / 2, -fh); ctx.lineTo(w / 2 + dx, -fh + dy); ctx.lineTo(-w / 2 + dx, -fh + dy); ctx.closePath(); }, S.roof, { shadow: false, lw: 3.5 });
    if (tilt > 0.3) { ctx.save(); ctx.globalAlpha = clamp((tilt - 0.3) * 2); // rooftop details seen from above
      flat(ctx, () => rr(ctx, -w * 0.3 + dx * 0.5, -fh + dy * 0.6, 80, 50, 6), S.side, 3); flat(ctx, () => rr(ctx, w * 0.08 + dx * 0.5, -fh + dy * 0.45, 60, 40, 20), S.trim, 3); ctx.restore(); }
    // side windows (narrow, in perspective)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let r = 0; r < winRows(o); r++) { const y = -h + WIN.top + r * WIN.rowH; ctx.beginPath(); ctx.moveTo(sx + dx * 0.25, (y + 6) * k + dy * 0.25); ctx.lineTo(sx + dx * 0.7, (y + 6) * k + dy * 0.7); ctx.lineTo(sx + dx * 0.7, (y + 50) * k + dy * 0.7); ctx.lineTo(sx + dx * 0.25, (y + 50) * k + dy * 0.25); ctx.closePath(); ctx.fill(); }
  }
  cut(ctx, () => rr(ctx, -w / 2, -fh, w, fh, 4), S.front, { sb: o.flat ? 16 : 26, sy: 12, lw: 4 });
  ctx.save(); ctx.scale(1, k);
  flat(ctx, () => rr(ctx, -w / 2 - 10, -h - 6, w + 20, 26, 6), S.trim, 3);             // cornice
  const rows = winRows(o), out = o.out || {};
  for (let i = 0; i < rows * 4; i++) { const [x, y, ww, wh] = winRect(o, i); if (out[i]) { flat(ctx, () => rr(ctx, x, y, ww, wh, 6), 'rgba(0,0,0,0.35)'); continue; }
    flat(ctx, () => rr(ctx, x - 5, y - 5, ww + 10, wh + 10, 8), S.frame); flat(ctx, () => rr(ctx, x, y, ww, wh, 5), hash(i * 7 + (o.seed || 0)) > 0.62 ? S.lit : S.win);
    if (o.style === 'A' && i % 4 === 1 && Math.floor(i / 4) % 2 === 0) flat(ctx, () => rr(ctx, x - 12, y + wh - 2, ww + 24, 12, 4), S.trim); } // little red balconies
  // entrance + awning
  flat(ctx, () => rr(ctx, -46, -118, 92, 118, [10, 10, 0, 0]), o.style === 'C' ? '#171717' : '#2B2B2B', 3);
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-74, -122); ctx.lineTo(74, -122); ctx.lineTo(88, -150); ctx.lineTo(-88, -150); ctx.closePath(); }, S.trim, 3);
  if (o.label) { flat(ctx, () => rr(ctx, -w / 2 + 30, -196, w - 60, 52, 8), C.ink); text(ctx, o.label, 0, -158, 34, '#FFFFFF', F.black, 'center'); }
  if (o.price && o.price.u > 0) { const u = o.price.u, kk = lerp(1.8, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(0, -h * 0.5); ctx.scale(kk, kk); ctx.globalAlpha *= clamp(u * 3); ctx.rotate(-0.03 * side);
    cut(ctx, () => rr(ctx, -150, -62, 300, 124, 14), o.price.bg || C.ink, { sb: 18, sy: 8, edgeW: 10, lw: 0 }); text(ctx, o.price.text, -8, 26, 74, '#FFFFFF', F.black, 'center'); text(ctx, '/mo', 112, 26, 26, 'rgba(255,255,255,0.7)', F.xb, 'center'); ctx.restore(); }
  ctx.restore();
  ctx.restore();
}
// a sign on posts above the roof (AVAILABLE / MOVE IN); u = pop-in, b = bounce
function roofSign(ctx, x, y, label, bg, fg, u, b = 0) { if (u <= 0) return; const k = E.back(clamp(u), 2.2);
  ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(b * Math.PI * 2)) * 34 * (b > 0 ? 1 : 0)); ctx.scale(k, k); ctx.rotate(Math.sin(b * Math.PI * 2) * 0.06);
  flat(ctx, () => rr(ctx, -110, -10, 14, 70, 4), '#4A4A4A'); flat(ctx, () => rr(ctx, 96, -10, 14, 70, 4), '#4A4A4A');
  ctx.font = `60px ${F.black}`; const tw = ctx.measureText(label).width + 70; cut(ctx, () => rr(ctx, -tw / 2, -100, tw, 100, 12), bg, { sb: 18, sy: 8, lw: 4 }); text(ctx, label, 0, -28, 60, fg, F.black, 'center'); ctx.restore(); }

// ---------- people ----------
// tenant with a suitcase, feet at (0,0), ~330 tall. o.look -1..1 (head turn), o.up 0..1 (looks up), o.walk phase, o.pull -1..1 (tugged sideways)
function tenant(ctx, x, y, s, o = {}) {
  const look = o.look || 0, up = o.up || 0, ph = o.walk || 0, bob = Math.abs(Math.sin(ph)) * 8;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((o.pull || 0) * 0.12);
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(10, 4, 110, 16, 0, 0, 7); ctx.fill();
  const leg = (dx, a) => { ctx.save(); ctx.translate(dx, -130); ctx.rotate(a); cut(ctx, () => rr(ctx, -17, 0, 34, 130, 14), '#2D3142', { sb: 10, sy: 6, lw: 3 }); ctx.restore(); };
  leg(-22, Math.sin(ph) * 0.25); leg(22, -Math.sin(ph) * 0.25);
  ctx.translate(0, -bob);
  // suitcase (held in the right hand)
  ctx.save(); ctx.translate(96, -118); ctx.rotate(Math.sin(ph) * 0.05);
  flat(ctx, () => rr(ctx, -18, -44, 36, 28, 10), C.ink); cut(ctx, () => rr(ctx, -56, -22, 112, 130, 14), C.red, { sb: 12, sy: 6, lw: 3.5 });
  flat(ctx, () => rr(ctx, -56, 22, 112, 14, 2), '#B52A36'); flat(ctx, () => rr(ctx, -30, -22, 12, 130, 2), 'rgba(255,255,255,0.35)'); ctx.restore();
  cut(ctx, () => rr(ctx, -60, -290, 120, 170, [40, 40, 14, 14]), C.green, { sb: 12, sy: 6, lw: 3.5 });
  cut(ctx, () => rr(ctx, -86, -280, 30, 140, 15), C.green, { sb: 8, sy: 4, lw: 3 });
  cut(ctx, () => rr(ctx, 56, -280, 30, 172, 15), C.green, { sb: 8, sy: 4, lw: 3 });
  ctx.save(); ctx.translate(look * 6, -340 - up * 4); ctx.rotate(look * 0.12 - up * 0.08);
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); }, '#E0AC69', { sb: 10, sy: 5, lw: 3.5 });
  ctx.fillStyle = '#3B2A20'; ctx.beginPath(); ctx.arc(0, -8, 51, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); ctx.fillRect(-51, -12, 14, 18);
  const ex = look * 16, ey = -up * 12 + 4; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-16 + ex, ey, 5.5, 0, 7); ctx.arc(16 + ex, ey, 5.5, 0, 7); ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(ex * 0.8, 22 - up * 6, 12, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.restore(); ctx.restore();
}
// owner portrait badge (two clearly different landlords)
function owner(ctx, kind, u) { if (u <= 0) return; const k = E.back(clamp(u), 2.2); ctx.save(); ctx.scale(k, k);
  const bg = kind ? C.yellow : C.red, tie = kind ? R4.blue : C.yellow, hair = kind ? '#8A8A8A' : '#171717';
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 92, 0, 7); }, bg, { sb: 20, sy: 10, lw: 4 });
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 88, 0, 7); ctx.clip();
  flat(ctx, () => rr(ctx, -70, 40, 140, 90, 40), '#2D3142'); flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-14, 42); ctx.lineTo(14, 42); ctx.lineTo(8, 96); ctx.lineTo(-8, 96); ctx.closePath(); }, tie);
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, -8, 42, 0, 7); }, kind ? '#C68642' : '#F1C9A5', 3);
  ctx.fillStyle = hair; if (kind) { ctx.beginPath(); ctx.arc(0, -16, 43, Math.PI * 1.1, Math.PI * 1.9); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(-30, -16, 24, 16); ctx.strokeRect(6, -16, 24, 16); }
  else { ctx.beginPath(); ctx.arc(0, -20, 43, Math.PI, Math.PI * 2); ctx.fill(); flat(ctx, () => rr(ctx, -20, 6, 40, 10, 5), C.ink); }
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-14, -8, 4.5, 0, 7); ctx.arc(14, -8, 4.5, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore(); }

// ---------- data ----------
const DATA_LABELS = ['RENT', 'VACANCY', 'LEASES'];
function dataChip(ctx, label, col) { // 330 x 120
  cut(ctx, () => rr(ctx, -165, -60, 330, 120, 18), R4.paper, { sb: 18, sy: 9, lw: 3.5 });
  flat(ctx, () => rr(ctx, -150, -45, 90, 90, 14), col);
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  if (label === 'RENT') { text(ctx, '$', -105, 28, 70, '#FFFFFF', F.black, 'center'); }
  else if (label === 'VACANCY') { ctx.strokeRect(-128, -24, 46, 50); ctx.beginPath(); ctx.moveTo(-116, -10); ctx.lineTo(-94, 12); ctx.moveTo(-94, -10); ctx.lineTo(-116, 12); ctx.stroke(); }
  else { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-128, -18 + i * 18); ctx.lineTo(-82, -18 + i * 18); ctx.stroke(); } }
  ctx.lineCap = 'butt'; text(ctx, label, -40, 20, label.length > 5 ? 46 : 54, C.ink, F.black);
}
// the pricing server: a black box with two inlets on top; on = 0..1, lights = number of LEDs lit
function server(ctx, t, o = {}) { // ~420 x 300, centre origin
  const on = o.on || 0;
  if (on > 0) { ctx.save(); ctx.globalAlpha = on * (0.5 + 0.1 * Math.sin(t * 6)); const g = ctx.createRadialGradient(0, 0, 60, 0, 0, 380); g.addColorStop(0, 'rgba(255,200,87,0.55)'); g.addColorStop(1, 'rgba(255,200,87,0)'); ctx.fillStyle = g; ctx.fillRect(-400, -400, 800, 800); ctx.restore(); }
  cut(ctx, () => rr(ctx, -210, -150, 420, 300, 26), '#1B1D24', { sb: 30, sy: 16, lw: 4 });
  flat(ctx, () => rr(ctx, -210, -150, 420, 40, [26, 26, 0, 0]), '#2A2D38');
  for (const sx of [-60, 60]) flat(ctx, () => rr(ctx, sx - 70, -142, 140, 18, 8), '#07080B');           // card slots
  for (let i = 0; i < 8; i++) { const lit = i < (o.lights || 0); ctx.fillStyle = lit ? (i % 2 ? C.yellow : R4.blue) : '#3A3E4C';
    if (lit && Math.floor(t * 7 + i * 1.7) % 5 === 0) ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-160 + i * 30, -70, 9, 0, 7); ctx.fill(); }
  flat(ctx, () => rr(ctx, -170, -40, 340, 150, 14), '#0E1016', 3);                                      // glass panel
  if (o.inside) { ctx.save(); rr(ctx, -166, -36, 332, 142, 12); ctx.clip(); o.inside(ctx); ctx.restore(); }
  else if (on > 0) { ctx.strokeStyle = 'rgba(77,141,255,0.6)'; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-150, 0 + i * 20); for (let x = -150; x <= 150; x += 20) ctx.lineTo(x, 0 + i * 20 + Math.sin(x * 0.05 + t * 8 + i) * 8 * on); ctx.stroke(); } }
  for (let i = 0; i < 6; i++) flat(ctx, () => rr(ctx, 130, -96 + i * 0, 0, 0, 0), '#000');
  text(ctx, 'PRICING SOFTWARE', 0, 136, 22, on > 0.5 ? C.yellow : '#7A7F8E', F.xb, 'center');
}
// a price recommendation card: it SUGGESTS a price (illustrative "$$$", never a real figure)
function recCard(ctx, o = {}) { // 280 x 170
  cut(ctx, () => rr(ctx, -140, -85, 280, 170, 16), C.yellow, { sb: 20, sy: 10, lw: 4 });
  flat(ctx, () => rr(ctx, -140, -85, 280, 50, [16, 16, 0, 0]), C.ink); text(ctx, o.label || 'RECOMMENDED', 0, -50, 28, '#FFFFFF', F.black, 'center');
  text(ctx, o.price || '$$$', 0, 58, 86, C.ink, F.black, 'center');
}
function realpageCard(ctx, o = {}) { // 700 x 280
  cut(ctx, () => rr(ctx, -350, -140, 700, 280, 26), R4.paper, { sb: 36, sy: 18, lw: 5 });
  text(ctx, 'REALPAGE', 0, 22, 136, C.ink, F.black, 'center');
  ctx.save(); ctx.translate(0, 82); ctx.rotate(-0.015); flat(ctx, () => rr(ctx, -210, -30, 420, 62, 8), C.red); text(ctx, 'PRICING SOFTWARE', 0, 16, 40, '#FFFFFF', F.black, 'center'); ctx.restore();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = (o.lit || 0) > i ? C.yellow : '#D9D2C3'; ctx.beginPath(); ctx.arc(-300 + i * 30, -104, 9, 0, 7); ctx.fill(); }
}
// stylised illustration of a lawsuit (no seal, no quotes, not a copy of the filing)
function lawsuitDoc(ctx) { // 760 x 980
  cut(ctx, () => rr(ctx, -380, -490, 760, 980, 18), R4.paper, { sb: 40, sy: 20, lw: 4 });
  flat(ctx, () => rr(ctx, -380, -490, 760, 150, [18, 18, 0, 0]), C.ink);
  text(ctx, 'U.S. DEPARTMENT', 0, -420, 54, '#FFFFFF', F.black, 'center'); text(ctx, 'OF JUSTICE', 0, -366, 54, C.yellow, F.black, 'center');
  text(ctx, 'CIVIL ANTITRUST LAWSUIT', 0, -270, 30, '#7A7A7A', F.xb, 'center');
  text(ctx, 'v.', 0, -190, 44, C.ink, F.xb, 'center'); text(ctx, 'REALPAGE', 0, -90, 120, C.ink, F.black, 'center');
  flat(ctx, () => rr(ctx, -310, -50, 620, 6, 3), C.ink);
  for (let i = 0; i < 8; i++) flat(ctx, () => rr(ctx, -310, 0 + i * 50, 620 - (i % 4 === 3 ? 240 : hash(i * 5) * 120), 16, 8), '#D9D2C3');
  flat(ctx, () => rr(ctx, 120, 400, 200, 52, 8), C.red); text(ctx, 'AUG 2024', 220, 438, 32, '#FFFFFF', F.black, 'center');
}

module.exports = { R4, STY, text, building, winPos, winRows, roofSign, tenant, owner, DATA_LABELS, dataChip, server, recCard, realpageCard, lawsuitDoc };
