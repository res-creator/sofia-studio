// Props for "Why Her Medical Bill Doubled" (Bold Editorial Collage). Reuses the 2.5D building from rent_ep4/rentkit.js
// (new styles are added to its style table at runtime only; that file is unchanged). No medical cross symbols, no logos,
// generic cartoon people (not portraits of the real patient or doctor).
const K = require('../tests/mcd_collage/kit');
const RK = require('../rent_ep4/rentkit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat } = K;
const { R4, text, building, STY } = RK;

Object.assign(STY, {
  HS: { front: '#FFFDF8', side: '#D9D2C3', roof: '#C9C1B1', trim: R4.blue, win: '#9EC0F2', lit: '#FFF3D6', frame: '#FFFFFF' },   // the first hospital
  OF: { front: C.yellow, side: '#E2A23A', roof: '#D99A30', trim: C.ink, win: '#2B2B2B', lit: '#FFFDF8', frame: '#FFFDF8' },     // the doctor's office
  SC: { front: R4.blue, side: R4.blueD, roof: '#3F72D6', trim: '#FFFDF8', win: '#CFE0FF', lit: '#FFFFFF', frame: R4.blueD },     // the surgery center
  HQ: { front: '#262A36', side: '#171A22', roof: '#3A3F4F', trim: C.red, win: '#4A5064', lit: C.yellow, frame: '#1B1D24' },      // the hospital system
});

// a flat sign with text that always fits inside it
function sign(ctx, x, y, s, label, bg, fg, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  const size = o.size || 54; ctx.font = `${size}px ${F.black}`; const tw = Math.min(o.maxW || 2000, ctx.measureText(label).width) + size * 1.1;
  cut(ctx, () => rr(ctx, -tw / 2, -size * 0.82, tw, size * 1.64, 12), bg, { sb: 18, sy: 8, lw: 4 });
  if (o.badge) { flat(ctx, () => { ctx.beginPath(); ctx.arc(-tw / 2 - 10, 0, size * 0.78, 0, 7); }, R4.blue, 4); text(ctx, 'H', -tw / 2 - 10, size * 0.36, size, '#FFFFFF', F.black, 'center'); }
  text(ctx, label, 0, size * 0.36, size, fg, F.black, 'center', tw - size * 0.9); ctx.restore();
}
// building + its sign on the roof; returns the roof height (world units) for anchoring lines
function place(ctx, o, label, bg, fg, extra) {
  const g = o.grow ?? 1; if (g <= 0.001) return 0;
  building(ctx, o); const top = (o.h ?? 640) * (o.s ?? 1) * g * (1 - 0.55 * (o.tilt || 0));
  if (extra) { ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s ?? 1, (o.s ?? 1) * g); extra(ctx); ctx.restore(); }
  if (label && g > 0.6) sign(ctx, o.x, o.y - top - 52 * (o.s ?? 1), (o.s ?? 1) * clamp((g - 0.6) * 2.5), label, bg, fg, o.signO || {});
  return top;
}
function officeWindows(ctx) { // two big street windows with blinds (doctor's office front, local coords)
  for (const x0 of [-150, 62]) { flat(ctx, () => rr(ctx, x0 - 6, -236, 100, 104, 8), '#FFFDF8', 3); flat(ctx, () => rr(ctx, x0, -230, 88, 92, 6), '#BFD4F5');
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(x0, -224 + i * 22, 88, 8); }
}

// ---------- the heroine (generic cartoon, feet at 0,0, ~360 tall) ----------
// o: look -1..1, up 0..1, eyes 1..2 (surprise), mood 'smile'|'flat'|'o'|'frown', phone 0 none / 1 in front / 2 at ear, ring 0..1,
//    walk phase, exhale 0..1 (relief puff), hold (fn drawing an item in her left hand)
function heroine(ctx, x, y, s, o = {}) {
  const look = o.look || 0, up = o.up || 0, ph = o.walk || 0, bob = Math.abs(Math.sin(ph)) * 8, ex = clamp(o.exhale || 0), eyes = o.eyes || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 100, 15, 0, 0, 7); ctx.fill();
  const leg = (dx, a) => { ctx.save(); ctx.translate(dx, -128); ctx.rotate(a); cut(ctx, () => rr(ctx, -16, 0, 32, 128, 14), '#2D3142', { sb: 10, sy: 6, lw: 3 }); ctx.restore(); };
  leg(-20, Math.sin(ph) * 0.25); leg(20, -Math.sin(ph) * 0.25);
  ctx.translate(0, -bob + Math.sin(ex * Math.PI) * 10);
  const hx = look * 6, hy = -350 - up * 4;
  // hair behind the head + bun
  flat(ctx, () => { ctx.beginPath(); ctx.arc(hx, hy + 6, 58, 0, 7); }, '#2B1B14');
  cut(ctx, () => rr(ctx, -62, -292, 124, 176, [44, 44, 14, 14]), C.red, { sb: 12, sy: 6, lw: 3.5 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-20, -292); ctx.lineTo(0, -262); ctx.lineTo(20, -292); ctx.closePath(); }, '#C68642');
  // left arm (holding something) and right arm (phone)
  if (o.hold) { ctx.save(); ctx.translate(-70, -275); ctx.rotate(0.9); cut(ctx, () => rr(ctx, -15, 0, 30, 120, 15), C.red, { sb: 8, sy: 4, lw: 3 }); ctx.restore();
    ctx.save(); ctx.translate(-150, -225); o.hold(ctx); ctx.restore(); }
  else cut(ctx, () => rr(ctx, -90, -282, 30, 150, 15), C.red, { sb: 8, sy: 4, lw: 3 });
  const pa = o.phone || 0;
  if (pa === 2) { ctx.save(); ctx.translate(60, -282); ctx.rotate(-2.5); cut(ctx, () => rr(ctx, -15, 0, 30, 110, 15), C.red, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); }
  else if (pa === 1) { ctx.save(); ctx.translate(66, -280); ctx.rotate(-0.6); cut(ctx, () => rr(ctx, -15, 0, 30, 110, 15), C.red, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); }
  else cut(ctx, () => rr(ctx, 60, -282, 30, 150, 15), C.red, { sb: 8, sy: 4, lw: 3 });
  // head
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(look * 0.1 - up * 0.08);
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); }, '#C68642', { sb: 10, sy: 5, lw: 3.5 });
  ctx.fillStyle = '#2B1B14'; ctx.beginPath(); ctx.arc(0, -10, 51, Math.PI * 1.0, Math.PI * 2.0); ctx.fill(); ctx.beginPath(); ctx.arc(0, -62, 26, 0, 7); ctx.fill();
  const ey = -up * 12 + 4, exo = look * 15;
  for (const sx of [-17, 17]) { if (eyes > 1.15) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(sx + exo, ey, 7 * eyes, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sx + exo, ey, 5.5, 0, 7); ctx.fill(); }
  if (o.blush) { ctx.fillStyle = 'rgba(230,57,70,0.35)'; ctx.beginPath(); ctx.arc(-30, 16, 9, 0, 7); ctx.arc(30, 16, 9, 0, 7); ctx.fill(); }
  ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; const m = o.mood || 'smile', mx = exo * 0.8, my = 24 - up * 6;
  ctx.beginPath(); if (m === 'smile') { ctx.arc(mx, my - 10, 12, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); } else if (m === 'frown') { ctx.arc(mx, my + 8, 11, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (m === 'o') { ctx.ellipse(mx, my, 7, 10, 0, 0, 7); ctx.fill(); } else { ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my); ctx.stroke(); }
  ctx.restore();
  if (pa) { ctx.save(); const ps = pa === 2 ? 0.3 : 0.5; if (pa === 2) { ctx.translate(hx + 62, hy + 4); ctx.rotate(-0.2); } else { ctx.translate(110, -330); ctx.rotate(-0.08); } ctx.scale(ps, ps); phone(ctx, { ring: o.ring || 0, t: o.t || 0, off: pa === 2 }); ctx.restore(); }
  if (ex > 0 && ex < 1) for (let i = 0; i < 4; i++) { const u = clamp(ex * 1.3 - i * 0.1); if (u <= 0 || u >= 1) continue; ctx.save(); ctx.globalAlpha = 0.6 * (1 - u); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#C9C1B1'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(hx + 60 + u * 120, hy + 30 - u * 40 + i * 6, 16 + u * 26, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
// ---------- the doctor (generic cartoon) ----------
function doctor(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const ph = o.walk || 0, bob = Math.abs(Math.sin(ph)) * 7;
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 90, 14, 0, 0, 7); ctx.fill();
  for (const [dx, a] of [[-20, Math.sin(ph) * 0.22], [20, -Math.sin(ph) * 0.22]]) { ctx.save(); ctx.translate(dx, -130); ctx.rotate(a); cut(ctx, () => rr(ctx, -16, 0, 32, 130, 12), '#3F72D6', { sb: 8, sy: 5, lw: 3 }); ctx.restore(); }
  ctx.translate(0, -bob);
  cut(ctx, () => rr(ctx, -66, -300, 132, 200, [40, 40, 10, 10]), '#FFFFFF', { sb: 12, sy: 6, lw: 3.5 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-22, -300); ctx.lineTo(0, -230); ctx.lineTo(22, -300); ctx.closePath(); }, '#4D8DFF', 3);
  ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-26, -296); ctx.quadraticCurveTo(-34, -220, 0, -205); ctx.quadraticCurveTo(34, -220, 26, -296); ctx.stroke();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, -203, 10, 0, 7); }, '#9AA0AA', 3);
  for (const sx of [-92, 62]) cut(ctx, () => rr(ctx, sx, -292, 30, 156, 15), '#FFFFFF', { sb: 8, sy: 4, lw: 3 });
  if (o.clip) { ctx.save(); ctx.translate(-94, -170); ctx.rotate(-0.15); flat(ctx, () => rr(ctx, -40, -54, 80, 108, 8), '#B5653A', 3); flat(ctx, () => rr(ctx, -32, -44, 64, 90, 4), '#FFFDF8', 2); ctx.restore(); }
  ctx.save(); ctx.translate(0, -352);
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 48, 0, 7); }, '#F1C9A5', { sb: 10, sy: 5, lw: 3.5 });
  ctx.fillStyle = '#8A8A8A'; ctx.beginPath(); ctx.arc(0, -8, 49, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(-30, -10, 24, 18); ctx.strokeRect(6, -10, 24, 18); ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-18, -1, 4, 0, 7); ctx.arc(18, -1, 4, 0, 7); ctx.fill();
  ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, 18, 10, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); ctx.restore();
  ctx.restore();
}

// ---------- paper ----------
// a bill / estimate, 620 x 420 centre origin: o.head ('ESTIMATE' | 'FINAL BILL'), o.amount, o.where (small line), o.col (header colour)
function billDoc(ctx, o = {}) {
  cut(ctx, () => rr(ctx, -310, -210, 620, 420, 22), R4.paper, { sb: 34, sy: 18, lw: 4 });
  flat(ctx, () => rr(ctx, -310, -210, 620, 92, [22, 22, 0, 0]), o.col || C.ink);
  text(ctx, o.head || 'ESTIMATE', -270, -148, 44, '#FFFFFF', F.black, 'left', 380);
  for (let i = 0; i < 3; i++) flat(ctx, () => rr(ctx, 180 + i * 36, -172, 22, 22, 11), 'rgba(255,255,255,0.35)');
  text(ctx, o.amount || '$18,000', 0, 64, 168, o.amtCol || C.ink, F.black, 'center', 560);
  if (o.where) text(ctx, o.where, 0, 128, 32, '#7A7A7A', F.xb, 'center', 540);
  for (let i = 0; i < 2; i++) flat(ctx, () => rr(ctx, -260, 150 + i * 26, 520 - i * 160, 12, 6), '#D9D2C3');
}
// the same paper folding shut (u 0..1): squashes along its middle with a crease shadow
function folded(ctx, u, draw) { const k = Math.cos(clamp(u) * Math.PI / 2); if (k <= 0.02) return; ctx.save(); ctx.scale(1, k); draw(ctx); ctx.fillStyle = `rgba(23,23,23,${(0.35 * (1 - k)).toFixed(3)})`; ctx.fillRect(-310, -210, 620, 420); ctx.restore(); }
function procCard(ctx) { // clipboard: "PROCEDURE"
  flat(ctx, () => rr(ctx, -120, -150, 240, 300, 16), '#B5653A', 4); cut(ctx, () => rr(ctx, -100, -128, 200, 262, 8), R4.paper, { sb: 10, sy: 5, lw: 3 });
  flat(ctx, () => rr(ctx, -46, -166, 92, 40, 10), '#9AA0AA', 3); text(ctx, 'PROCEDURE', 0, -70, 32, C.ink, F.black, 'center', 180);
  for (let i = 0; i < 5; i++) flat(ctx, () => rr(ctx, -76, -40 + i * 34, 152 - (i % 2) * 50, 12, 6), '#D9D2C3');
}
// ---------- phone ----------
function phone(ctx, o = {}) { // 220 x 440, centre origin
  const r = o.ring || 0, sh = r > 0 ? Math.sin((o.t || 0) * 60) * 6 * r : 0;
  ctx.save(); ctx.translate(sh, 0); ctx.rotate(sh * 0.01);
  cut(ctx, () => rr(ctx, -110, -220, 220, 440, 34), '#1B1D24', { sb: 18, sy: 9, lw: 4 });
  flat(ctx, () => rr(ctx, -96, -200, 192, 400, 24), o.off ? '#2A2D38' : '#FFFDF8');
  if (!o.off) {
    flat(ctx, () => rr(ctx, -96, -200, 192, 120, [24, 24, 0, 0]), R4.blue);
    text(ctx, 'APPOINTMENT', 0, -138, 30, '#FFFFFF', F.black, 'center', 172); text(ctx, 'UPDATE', 0, -100, 30, '#FFFFFF', F.black, 'center', 172);
    flat(ctx, () => rr(ctx, -70, -60, 140, 110, 12), '#FFFFFF', 3); flat(ctx, () => rr(ctx, -70, -60, 140, 32, [12, 12, 0, 0]), C.red);
    text(ctx, 'TOMORROW', 0, 10, 28, C.ink, F.black, 'center', 130); text(ctx, 'NEW LOCATION', 0, 38, 16, '#7A7A7A', F.xb, 'center', 130);
    flat(ctx, () => { ctx.beginPath(); ctx.arc(-46, 140, 28, 0, 7); }, C.red); flat(ctx, () => { ctx.beginPath(); ctx.arc(46, 140, 28, 0, 7); }, '#26A69A');
  }
  ctx.restore();
  if (r > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = r;
    for (const g of [-1, 1]) for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(0, -40, 150 + i * 36, -Math.PI / 2 + g * 0.6 - 0.25, -Math.PI / 2 + g * 0.6 + 0.25); ctx.stroke(); } ctx.restore(); }
}
// ---------- the giant hand (from above). Origin = the pinch point; g 0 open .. 1 closed ----------
function giantHand(ctx, g = 0) {
  cut(ctx, () => rr(ctx, -110, -1500, 220, 1260, 30), C.ink, { sb: 30, sy: 16, lw: 0 });
  flat(ctx, () => rr(ctx, -128, -290, 256, 70, 20), '#FFFDF8', 4);
  cut(ctx, () => rr(ctx, -120, -240, 240, 220, [60, 60, 80, 80]), '#F1C9A5', { sb: 20, sy: 10, lw: 4 });
  const sp = lerp(1, 0.25, g);
  for (const [dx, len, a] of [[-90, 150, -0.5], [-35, 175, -0.2], [25, 170, 0.15], [80, 140, 0.45]]) { ctx.save(); ctx.translate(dx * 0.8, -40); ctx.rotate(a * sp); cut(ctx, () => rr(ctx, -24, 0, 48, len * lerp(1, 0.75, g), 24), '#F1C9A5', { sb: 10, sy: 6, lw: 4 }); ctx.restore(); }
}
// ownership line drawn on from (x0,y0) to (x1,y1), u 0..1
function ownLine(ctx, x0, y0, x1, y1, u, t) { if (u <= 0) return; const x = lerp(x0, x1, u), y = lerp(y0, y1, u);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.stroke();
  if (u >= 1) { const ph = (t * 0.8) % 1; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(lerp(x0, x1, ph), lerp(y0, y1, ph), 11, 0, 7); ctx.fill(); flat(ctx, () => { ctx.beginPath(); ctx.arc(x1, y1, 24, 0, 7); }, C.red, 5); }
  ctx.restore(); }

module.exports = { sign, place, officeWindows, heroine, doctor, billDoc, folded, procCard, phone, giantHand, ownLine };
