// Props for "Why Amazon Sometimes Pays You to Keep Your Order" (Bold Editorial Collage, 2.5D).
// Brand as plain text only (no logos). Built on tests/mcd_collage/kit.js primitives + the text helper / signs of earlier episodes.
const K = require('../tests/mcd_collage/kit');
const RK = require('../rent_ep4/rentkit');
const MK = require('../med_ep5/medkit');
const { C, F, clamp, lerp, E, hash, rr, cut, flat } = K;
const { R4, text } = RK;
const { sign } = MK;
const BOX = { front: '#C98E5F', side: '#A76E46', top: '#DBA676', tape: '#EBCB9C', line: C.ink };

// ---------- the package (2.5D: front + side + top), origin = bottom centre of the front face ----------
function box(ctx, o = {}) {
  const w = o.w || 300, h = o.h || 210, dx = w * 0.26, dy = -w * 0.2;
  ctx.save(); if (o.rot) ctx.rotate(o.rot);
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(dx * 0.4, 6, w * 0.62, 16, 0, 0, 7); ctx.fill();
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + dx, dy); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(w / 2, -h); ctx.closePath(); }, BOX.side, { sb: 18, sy: 9, lw: 3.5 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -h); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(-w / 2 + dx, dy - h); ctx.closePath(); }, BOX.top, { shadow: false, lw: 3.5 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-14, -h); ctx.lineTo(14, -h); ctx.lineTo(14 + dx, dy - h); ctx.lineTo(-14 + dx, dy - h); ctx.closePath(); }, BOX.tape);   // tape on the lid
  cut(ctx, () => rr(ctx, -w / 2, -h, w, h, 3), BOX.front, { sb: 18, sy: 9, lw: 4 });
  flat(ctx, () => rr(ctx, -14, -h, 28, h * 0.45, 0), BOX.tape);
  text(ctx, 'AMAZON', -w / 2 + 18, -h + 44, 32, C.ink, F.black, 'left', w * 0.42);
  flat(ctx, () => rr(ctx, -w / 2 + 18, -h * 0.5, w * 0.36, h * 0.38, 6), '#FFFDF8', 2.5);                      // shipping label
  ctx.fillStyle = C.ink; for (let i = 0; i < 12; i++) ctx.fillRect(-w / 2 + 28 + i * (w * 0.026), -h * 0.24, (i % 3) + 1.5, h * 0.12);
  if (o.tag) { const u = o.tagU ?? 1; if (u > 0) { const k = E.back(clamp(u), 2.2); ctx.save(); ctx.translate(w * 0.22, -h * 0.42); ctx.rotate(0.06); ctx.scale(k, k);
    ctx.font = `46px ${F.black}`; const tw = ctx.measureText(o.tag).width + 34; cut(ctx, () => rr(ctx, -tw / 2, -34, tw, 68, 10), C.yellow, { sb: 10, sy: 5, lw: 3 }); text(ctx, o.tag, 0, 16, 46, C.ink, F.black, 'center'); ctx.restore(); } }
  if (o.stamp) { ctx.save(); ctx.translate(0, -h * 0.5); ctx.rotate(-0.15); ctx.globalAlpha *= clamp(o.stampU ?? 1); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.font = `40px ${F.black}`; const tw = ctx.measureText(o.stamp).width + 30;
    rr(ctx, -tw / 2, -32, tw, 60, 8); ctx.stroke(); text(ctx, o.stamp, 0, 14, 40, C.red, F.black, 'center'); ctx.restore(); }
  ctx.restore();
}

// ---------- the buyer (generic adult cartoon), feet at 0,0, ~360 tall ----------
// o: look -1..1, up 0..1, eyes 1..2, mood 'neutral'|'smile'|'grin'|'o'|'frown'|'side', arms 'down'|'box'|'door', box (fn), walk, scratch (hand on head)
function buyer(ctx, x, y, s, o = {}) {
  const look = o.look || 0, up = o.up || 0, ph = o.walk || 0, bob = Math.abs(Math.sin(ph)) * 8, eyes = o.eyes || 1, arms = o.arms || 'down';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 104, 15, 0, 0, 7); ctx.fill();
  for (const [dx, a] of [[-22, Math.sin(ph) * 0.25], [22, -Math.sin(ph) * 0.25]]) { ctx.save(); ctx.translate(dx, -130); ctx.rotate(a); cut(ctx, () => rr(ctx, -17, 0, 34, 130, 14), '#2D3142', { sb: 10, sy: 6, lw: 3 });
    flat(ctx, () => rr(ctx, -20, 118, 44, 18, 8), C.ink); ctx.restore(); }
  ctx.translate(0, -bob);
  cut(ctx, () => rr(ctx, -66, -296, 132, 180, [46, 46, 16, 16]), C.yellow, { sb: 12, sy: 6, lw: 3.5 });                    // hoodie
  flat(ctx, () => rr(ctx, -40, -190, 80, 44, 12), '#E9A93A', 3);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -290); ctx.lineTo(-14, -250); ctx.moveTo(12, -290); ctx.lineTo(14, -250); ctx.stroke();
  if (arms === 'down' || arms === 'door') { cut(ctx, () => rr(ctx, -96, -284, 32, 156, 16), C.yellow, { sb: 8, sy: 4, lw: 3 });
    if (o.scratch) { ctx.save(); ctx.translate(66, -280); ctx.rotate(-2.7); cut(ctx, () => rr(ctx, -16, 0, 32, 130, 16), C.yellow, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); }
    else if (arms === 'door') { ctx.save(); ctx.translate(66, -280); ctx.rotate(-1.2); cut(ctx, () => rr(ctx, -16, 0, 32, 120, 16), C.yellow, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); }
    else cut(ctx, () => rr(ctx, 64, -284, 32, 156, 16), C.yellow, { sb: 8, sy: 4, lw: 3 }); }
  else { for (const g of [-1, 1]) { ctx.save(); ctx.translate(g * 72, -278); ctx.rotate(-g * 0.55); cut(ctx, () => rr(ctx, -16, 0, 32, 110, 16), C.yellow, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); } }
  // head
  const hx = look * 6, hy = -350 - up * 4;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(look * 0.1 - up * 0.08 + (o.tilt || 0));
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); }, '#F1C9A5', { sb: 10, sy: 5, lw: 3.5 });
  ctx.fillStyle = '#4A2E1F'; ctx.beginPath(); ctx.arc(0, -8, 53, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); ctx.fillRect(-53, -14, 12, 16); ctx.fillRect(41, -14, 12, 16);
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-54, 6, 10, 0, 7); ctx.arc(54, 6, 10, 0, 7); }, '#F1C9A5', 3);                // ears
  const ey = -up * 12 + 6, exo = look * 15, m = o.mood || 'neutral';
  for (const sx of [-18, 18]) { if (eyes > 1.15) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(sx + exo, ey, 7 * eyes, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sx + exo, ey, 5.5, 0, 7); ctx.fill(); }
  const by = ey - 18 - (eyes - 1) * 12; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = '#4A2E1F';                 // brows follow the mood
  for (const sx of [-18, 18]) { const tl = m === 'frown' || m === 'side' ? (sx < 0 ? 0.35 : -0.35) * (m === 'side' && sx > 0 ? -0.6 : 1) : m === 'o' ? (sx < 0 ? -0.2 : 0.2) : 0, c0 = sx + exo, ddx = Math.cos(tl) * 12, ddy = Math.sin(tl) * 12;
    ctx.beginPath(); ctx.moveTo(c0 - ddx, by - ddy - (m === 'grin' ? 3 : 0)); ctx.lineTo(c0 + ddx, by + ddy - (m === 'grin' ? 3 : 0)); ctx.stroke(); }
  ctx.lineCap = 'butt'; ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; const mx = exo * 0.8, my = 26 - up * 6;
  ctx.beginPath();
  if (m === 'smile') { ctx.arc(mx, my - 10, 12, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (m === 'grin') { ctx.moveTo(mx - 16, my - 4); ctx.quadraticCurveTo(mx, my + 20, mx + 16, my - 4); ctx.closePath(); ctx.fill(); }
  else if (m === 'frown') { ctx.arc(mx, my + 8, 11, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (m === 'o') { ctx.ellipse(mx, my, 7, 10, 0, 0, 7); ctx.fill(); }
  else if (m === 'side') { ctx.moveTo(mx - 10, my + 2); ctx.quadraticCurveTo(mx + 4, my + 2, mx + 12, my - 6); ctx.stroke(); }
  else { ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my); ctx.stroke(); }
  ctx.restore();
  if (arms === 'box' && o.box) { ctx.save(); ctx.translate(0, -150); o.box(ctx); ctx.restore();                          // hands on the box sides (drawn over it)
    for (const g of [-1, 1]) flat(ctx, () => { ctx.beginPath(); ctx.arc(g * (o.boxW || 150), -230, 20, 0, 7); }, '#F1C9A5', 3.5); }
  if (o.scratch) flat(ctx, () => { ctx.beginPath(); ctx.arc(hx + 30, hy - 56, 20, 0, 7); }, '#F1C9A5', 3.5);
  ctx.restore();
}

// ---------- phone with order messages, 300 x 560 centre origin; lines: [{t, col, size, k}] ----------
function phoneA(ctx, lines, o = {}) {
  cut(ctx, () => rr(ctx, -150, -280, 300, 560, 42), '#1B1D24', { sb: 26, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -134, -258, 268, 516, 30), '#FFFDF8');
  flat(ctx, () => rr(ctx, -134, -258, 268, 96, [30, 30, 0, 0]), C.ink); text(ctx, o.head || 'AMAZON ORDER', 0, -196, 30, '#FFFFFF', F.black, 'center', 230);
  let y = -100; for (const L of lines) { if (!L || (L.u ?? 1) <= 0) continue; const k = (L.k || 1) * E.back(clamp(L.u ?? 1), 2.4), sz = L.size || 40;
    ctx.save(); ctx.translate(0, y + sz * 0.5); ctx.scale(k, k); if (L.bg) { ctx.font = `${sz}px ${F.black}`; const tw = Math.min(250, ctx.measureText(L.t).width) + 26; flat(ctx, () => rr(ctx, -tw / 2, -sz * 0.95, tw, sz * 1.35, 10), L.bg); }
    text(ctx, L.t, 0, 0, sz, L.col || C.ink, F.black, 'center', 236); ctx.restore(); y += sz * 1.7 * Math.max(1, (L.k || 1) * 0.8); }
  if (o.check) { flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 180, 40, 0, 7); }, '#26A69A', 3); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, 180); ctx.lineTo(-4, 194); ctx.lineTo(20, 166); ctx.stroke(); ctx.lineCap = 'butt'; }
}

// ---------- conveyor (2.5D top surface + front band + moving rollers) ----------
function conveyor(ctx, x0, x1, y, t, v = 600, o = {}) {
  const d = o.depth || 70, dx = d * 0.5;
  for (let x = x0 + 60; x < x1; x += 320) { flat(ctx, () => rr(ctx, x - 10, y + 40, 20, o.leg ?? 200, 4), '#5A6070', 3); }
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 + dx, y - d); ctx.lineTo(x0 + dx, y - d); ctx.closePath(); }, '#3A3F4F', 3.5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 + dx, y - d); ctx.lineTo(x0 + dx, y - d); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 6; const off = ((t * v) % 60 + 60) % 60;
  for (let x = x0 - 60 + off; x < x1 + dx; x += 60) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - d); ctx.stroke(); } ctx.restore();
  cut(ctx, () => rr(ctx, x0, y, x1 - x0, 40, 6), o.col || R4.blue, { sb: 14, sy: 7, lw: 3.5 });
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = x0 + 20; x < x1 - 10; x += 60) { ctx.beginPath(); ctx.arc(x + ((t * v) % 60) * 0, y + 20, 7, 0, 7); ctx.fill(); }
}

// ---------- the return truck (side view, facing right), origin ground centre; o.door 0..1 (rear door), spin ----------
function truck(ctx, o = {}) {
  const sp = o.spin || 0;
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(0, 8, 420, 22, 0, 0, 7); ctx.fill();
  cut(ctx, () => rr(ctx, -380, -360, 560, 300, 14), '#FFFDF8', { sb: 26, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -380, -170, 560, 46, 0), R4.blue); text(ctx, 'RETURNS', -100, -232, 74, C.ink, F.black, 'center', 480);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(190, -60); ctx.lineTo(190, -290); ctx.lineTo(300, -290); ctx.lineTo(370, -180); ctx.lineTo(380, -60); ctx.closePath(); }, R4.blue, { sb: 20, sy: 10, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(214, -180); ctx.lineTo(214, -268); ctx.lineTo(290, -268); ctx.lineTo(342, -180); ctx.closePath(); }, '#CFE0FF', 3);
  flat(ctx, () => rr(ctx, -390, -66, 780, 22, 8), '#2A2D38', 3);
  for (const wx of [-250, 250]) { ctx.save(); ctx.translate(wx, -40); cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); }, '#1B1D24', { sb: 10, sy: 5, lw: 3 }); flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); }, '#9AA0AA', 3);
    ctx.rotate(sp); ctx.strokeStyle = '#5A6070'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 24); ctx.stroke(); } ctx.restore(); }
  const dr = clamp(o.door || 0); if (dr > 0) { flat(ctx, () => rr(ctx, -380, -350, 40, 280, 0), '#2A2D38'); ctx.save(); ctx.translate(-380, -205); ctx.scale(Math.cos(dr * 1.4), 1); cut(ctx, () => rr(ctx, -150, -145, 150, 290, 8), '#E8E1D2', { shadow: false, lw: 3.5 }); ctx.restore(); }
}

// ---------- warehouse facade (2.5D), origin bottom centre; o.door 0..1 (main door rolls up) ----------
function warehouse(ctx, o = {}) {
  const w = o.w || 1200, h = o.h || 640, dx = 150, dy = -80;
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + dx, dy); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(w / 2, -h); ctx.closePath(); }, '#6E819E', { sb: 30, sy: 14, lw: 4 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -h); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(-w / 2 + dx, dy - h); ctx.closePath(); }, '#9AAAC2', { shadow: false, lw: 4 });
  cut(ctx, () => rr(ctx, -w / 2, -h, w, h, 4), '#B9C6DA', { sb: 30, sy: 14, lw: 4 });
  ctx.strokeStyle = 'rgba(23,23,23,0.12)'; ctx.lineWidth = 4; for (let x = -w / 2 + 30; x < w / 2; x += 40) { ctx.beginPath(); ctx.moveTo(x, -h + 30); ctx.lineTo(x, 0); ctx.stroke(); }
  flat(ctx, () => rr(ctx, -w / 2 - 10, -h - 6, w + 20, 30, 6), C.ink, 3);
  for (const [cx, main] of [[-w * 0.3, 0], [0, 1], [w * 0.3, 0]]) { const dw = main ? 300 : 220, dh = main ? 330 : 280, u = main ? clamp(o.door || 0) : 0;
    flat(ctx, () => rr(ctx, cx - dw / 2, -dh, dw, dh, 4), '#1B1D24', 3);
    if (u < 1) { flat(ctx, () => rr(ctx, cx - dw / 2, -dh, dw, dh * (1 - u), 4), '#E4E8F0', 3); ctx.strokeStyle = 'rgba(23,23,23,0.2)'; ctx.lineWidth = 3; for (let yy = -dh + 24; yy < -dh * u; yy += 24) { ctx.beginPath(); ctx.moveTo(cx - dw / 2, yy); ctx.lineTo(cx + dw / 2, yy); ctx.stroke(); } } }
}
// warehouse interior back wall (shelves, depth layers), origin floor centre
function interiorWall(ctx, w) {
  flat(ctx, () => rr(ctx, -w / 2, -900, w, 900, 0), '#DDE3EC');
  for (let i = 0; i < Math.ceil(w / 260); i++) { const x = -w / 2 + 30 + i * 260; flat(ctx, () => rr(ctx, x, -820, 220, 700, 6), '#C3CCDA', 3);
    for (let r = 0; r < 4; r++) { flat(ctx, () => rr(ctx, x, -820 + r * 175 + 150, 220, 14, 2), '#8EA3C2'); for (let k = 0; k < 3; k++) if (hash(i * 13 + r * 5 + k) > 0.35) flat(ctx, () => rr(ctx, x + 14 + k * 68, -820 + r * 175 + 90, 56, 60, 4), k % 2 ? BOX.front : BOX.top, 2.5); } }
  flat(ctx, () => rr(ctx, -w / 2, -40, w, 340, 0), '#9AA3B2');
}
function scannerArch(ctx, u, t) { // over the belt; u = laser sweep 0..1
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-230, 20); ctx.lineTo(-230, -420); ctx.quadraticCurveTo(-230, -470, -180, -470); ctx.lineTo(180, -470); ctx.quadraticCurveTo(230, -470, 230, -420); ctx.lineTo(230, 20); ctx.lineTo(180, 20); ctx.lineTo(180, -420); ctx.lineTo(-180, -420); ctx.lineTo(-180, 20); ctx.closePath(); }, C.ink, { sb: 20, sy: 10, lw: 0 });
  for (let i = 0; i < 5; i++) { ctx.fillStyle = Math.floor(t * 6 + i) % 2 ? C.red : '#5A1018'; ctx.beginPath(); ctx.arc(-120 + i * 60, -446, 8, 0, 7); ctx.fill(); }
  if (u > 0 && u < 1) { const y = lerp(-400, -20, u); ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = 'rgba(230,57,70,0.25)'; ctx.fillRect(-180, y - 30, 360, 60); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-180, y); ctx.lineTo(180, y); ctx.stroke(); ctx.restore(); }
}
function pusher(ctx, u) { // sorter arm; u 0..1 pushes out (to the right)
  flat(ctx, () => rr(ctx, -60, -560, 120, 200, 14), '#5A6070', 4); flat(ctx, () => rr(ctx, -16, -380, 32, 120 + u * 140, 8), '#9AA0AA', 3);
  cut(ctx, () => rr(ctx, -110, -270 + u * 140, 220, 40, 10), C.yellow, { sb: 12, sy: 6, lw: 3.5 }); for (let i = 0; i < 3; i++) flat(ctx, () => rr(ctx, -80 + i * 60, -530, 40, 14, 4), C.red);
}
// value card for the math scene: title + big amount
function valueCard(ctx, title, amount, col) { // 380 x 260
  cut(ctx, () => rr(ctx, -190, -130, 380, 260, 22), R4.paper, { sb: 26, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -190, -130, 380, 70, [22, 22, 0, 0]), col); text(ctx, title, 0, -84, 30, '#FFFFFF', F.black, 'center', 340);
  text(ctx, amount, 0, 82, 128, col === C.ink ? C.ink : col, F.black, 'center', 340);
}
function balance(ctx, tilt, left, right) { // post + beam + two pans; left/right draw fns (at the pans)
  flat(ctx, () => rr(ctx, -150, 330, 300, 40, 12), C.ink, 3); flat(ctx, () => rr(ctx, -18, -20, 36, 360, 10), '#5A6070', 3.5);
  ctx.save(); ctx.rotate(tilt); flat(ctx, () => rr(ctx, -380, -16, 760, 32, 14), C.ink, 3); ctx.restore();
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); }, C.yellow, 4);
  for (const g of [-1, 1]) { const px = Math.cos(tilt) * 350 * g, py = Math.sin(tilt) * 350 * g;
    ctx.save(); ctx.translate(px, py); ctx.strokeStyle = '#5A6070'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-110, 150); ctx.moveTo(0, 0); ctx.lineTo(110, 150); ctx.stroke();
    flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-140, 150); ctx.lineTo(140, 150); ctx.quadraticCurveTo(110, 205, 0, 205); ctx.quadraticCurveTo(-110, 205, -140, 150); ctx.closePath(); }, '#9AA0AA', 3.5);
    ctx.translate(0, 150); (g < 0 ? left : right)(ctx); ctx.restore(); }
}
// ---------- the buyer's house (front), origin bottom centre; door 0..1 open; returns nothing ----------
const HOUSE = { w: 560, h: 420, door: [-70, -250, 140, 250] };
function house(ctx, o = {}) {
  const w = HOUSE.w, h = HOUSE.h;
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + 90, -50); ctx.lineTo(w / 2 + 90, -h - 50); ctx.lineTo(w / 2, -h); ctx.closePath(); }, '#C9B38C', { sb: 26, sy: 12, lw: 4 });
  cut(ctx, () => rr(ctx, -w / 2, -h, w, h, 4), '#F1E6CF', { sb: 26, sy: 12, lw: 4 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2 - 50, -h); ctx.lineTo(0, -h - 240); ctx.lineTo(w / 2 + 50, -h); ctx.closePath(); }, C.red, { sb: 22, sy: 10, lw: 4 });
  flat(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 + 50, -h); ctx.lineTo(0, -h - 240); ctx.lineTo(90, -h - 290); ctx.lineTo(w / 2 + 140, -h - 50); ctx.closePath(); }, '#B52A36', 4);
  for (const wx of [-190, 190]) { flat(ctx, () => rr(ctx, wx - 66, -330, 132, 120, 8), '#FFFDF8', 3); flat(ctx, () => rr(ctx, wx - 56, -320, 112, 100, 6), '#BFD4F5'); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx, -320); ctx.lineTo(wx, -220); ctx.stroke(); }
  const [dx0, dy0, dw, dh] = HOUSE.door; flat(ctx, () => rr(ctx, dx0 - 10, dy0 - 10, dw + 20, dh + 10, 8), '#FFFDF8', 3);
  flat(ctx, () => rr(ctx, dx0, dy0, dw, dh, 4), '#2B2B2B');
  if (o.inside) { ctx.save(); rr(ctx, dx0, dy0, dw, dh, 4); ctx.clip(); o.inside(ctx); ctx.restore(); }
  const op = clamp(o.door || 0); ctx.save(); ctx.translate(dx0 + dw, 0); ctx.scale(Math.cos(op * 1.45), 1); cut(ctx, () => rr(ctx, -dw, dy0, dw, dh, 4), R4.blue, { shadow: op > 0.05, lw: 3.5 });
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-dw + 22, dy0 + 130, 9, 0, 7); }, C.yellow, 2.5); ctx.restore();
  flat(ctx, () => rr(ctx, -130, -6, 260, 26, 6), '#BFB6A3', 3);
}

module.exports = { BOX, box, buyer, phoneA, conveyor, truck, warehouse, interiorWall, scannerArch, pusher, valueCard, balance, HOUSE, house, sign };
