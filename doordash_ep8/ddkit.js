// Props for "Your Tip Wasn't Extra" (Bold Editorial Collage, 2.5D). Colour code of the money: customer = yellow, DoorDash = red,
// the driver = blue. Brand as plain text only (no logos). Built on tests/mcd_collage/kit.js + the text helper of rent_ep4/rentkit.js.
const K = require('../tests/mcd_collage/kit');
const RK = require('../rent_ep4/rentkit');
const { C, F, clamp, lerp, E, rr, cut, flat } = K;
const { R4, text } = RK;
const BLUE = '#4D8DFF', BLUED = '#2F64C8', SKIN = '#F1C9A5', SKIN2 = '#C68642';
const BR = { w: 200, h: 46 };                         // one $1 brick

// ---------- a $1 brick: 'y' = the customer's money (yellow), 'r' = DoorDash's money (red); centre origin ----------
function brick(ctx, kind, o = {}) {
  const w = BR.w, h = BR.h, y = kind === 'y';
  if (o.glow) { ctx.save(); ctx.globalAlpha *= 0.55 * o.glow; ctx.fillStyle = C.yellow; rr(ctx, -w / 2 - 16, -h / 2 - 12, w + 32, h + 24, 22); ctx.fill(); ctx.restore(); }
  if (o.ghost) { ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 5; ctx.strokeStyle = y ? C.yellowD : C.red; rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.stroke(); ctx.restore();
    text(ctx, '$1', 0, 13, 36, y ? C.yellowD : C.red, F.black, 'center'); return; }
  cut(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), y ? C.yellow : C.red, { sb: 12, sy: 6, lw: 3.5, edgeW: 8 });
  ctx.strokeStyle = y ? 'rgba(160,100,10,0.45)' : 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; rr(ctx, -w / 2 + 9, -h / 2 + 8, w - 18, h - 16, 6); ctx.stroke();
  text(ctx, '$1', 0, 13, 36, y ? C.ink : '#FFFFFF', F.black, 'center');
}

// ---------- the pay column ("DRIVER PAY"): glass tube, 10 slots; origin = bottom centre; slot i centre y = slotY(i) ----------
const COL = { w: 236, slot: 52, n: 10 };
const slotY = i => -COL.slot * (i + 0.5) - 8;
function columnBack(ctx, o = {}) {
  const w = COL.w, h = COL.slot * COL.n + 16;
  cut(ctx, () => rr(ctx, -w / 2, -h - 10, w, h + 10, 18), '#E9F0FB', { sb: 26, sy: 12, lw: 4 });
  ctx.strokeStyle = 'rgba(77,141,255,0.18)'; ctx.lineWidth = 2; for (let i = 1; i < COL.n; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -8 - i * COL.slot); ctx.lineTo(w / 2 - 8, -8 - i * COL.slot); ctx.stroke(); }
  for (let i = 0; i < COL.n; i++) text(ctx, '$' + (i + 1), -w / 2 - 14, slotY(i) + 9, 26, 'rgba(23,23,23,0.45)', F.black, 'right');   // scale on the side
  const g = o.guar ?? 1; if (g > 0) { ctx.save(); ctx.globalAlpha *= g; const y = -h - 4; ctx.setLineDash([18, 12]); ctx.lineWidth = 7; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(-w / 2 - 40, y); ctx.lineTo(w / 2 + 40, y); ctx.stroke(); ctx.restore(); }
  flat(ctx, () => rr(ctx, -w / 2 - 22, -6, w + 44, 30, 10), C.ink);
}
function columnFront(ctx) {
  const w = COL.w, h = COL.slot * COL.n + 16;
  ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = '#FFFFFF'; rr(ctx, -w / 2 + 14, -h + 4, 16, h - 24, 8); ctx.fill(); ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = C.ink; rr(ctx, -w / 2, -h - 10, w, h + 10, 18); ctx.stroke();
}
const COLH = COL.slot * COL.n + 26;

// ---------- the customer's phone: the TIP button; 300 x 560, centre origin. o.tip ('$9' | '$3' | '$0'), o.press 0..1, o.flash 0..1 ----------
function tipPhone(ctx, o = {}) {
  cut(ctx, () => rr(ctx, -150, -280, 300, 560, 42), '#1B1D24', { sb: 26, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -134, -258, 268, 516, 30), '#FFFDF8');
  flat(ctx, () => rr(ctx, -134, -258, 268, 92, [30, 30, 0, 0]), C.ink); text(ctx, 'YOUR ORDER', 0, -198, 30, '#FFFFFF', F.black, 'center', 230);
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-74, -104, 30, 0, 7); }, BLUE, 3);                                    // the driver's avatar
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-74, -112, 11, 0, 7); }, '#FFFDF8'); flat(ctx, () => { ctx.beginPath(); ctx.arc(-74, -86, 17, Math.PI, 0); }, '#FFFDF8');
  text(ctx, 'DRIVER', -30, -110, 28, C.ink, F.black, 'left', 150); text(ctx, 'on the way', -30, -80, 22, '#8A8A8A', F.xb, 'left', 150);
  text(ctx, 'ADD A TIP', 0, -10, 30, '#7A7A7A', F.black, 'center', 230);
  const tip = o.tip || '$9', none = tip === '$0', pr = clamp(o.press || 0), k = 1 - 0.08 * pr;
  ctx.save(); ctx.translate(0, 80); ctx.scale(k, k);
  if (o.flash) { ctx.save(); ctx.globalAlpha *= o.flash; ctx.fillStyle = C.yellow; rr(ctx, -136, -86, 272, 172, 40); ctx.fill(); ctx.restore(); }
  cut(ctx, () => rr(ctx, -118, -70, 236, 140, 28), none ? '#D8D2C6' : C.yellow, { sb: 16 * (1 - pr), sy: 8 * (1 - pr), lw: 4.5 });
  text(ctx, none ? 'NO TIP' : 'TIP ' + tip, 0, 26, 66, C.ink, F.black, 'center', 206); ctx.restore();
  flat(ctx, () => rr(ctx, -100, 196, 200, 14, 7), '#D9D2C3');
}

// ---------- the customer's hand (yellow sleeve) coming from below; origin = the fingertip; rot > 0 = the arm comes from the lower left ----------
function pointer(ctx, rot = 0.55) {
  ctx.save(); ctx.rotate(rot);
  cut(ctx, () => rr(ctx, -70, 250, 140, 600, 40), C.yellow, { sb: 26, sy: 14, lw: 4 });
  flat(ctx, () => rr(ctx, -78, 236, 156, 46, 18), C.yellowD, 4);
  cut(ctx, () => rr(ctx, -64, 96, 128, 160, [36, 36, 50, 50]), SKIN, { sb: 18, sy: 9, lw: 4 });
  cut(ctx, () => rr(ctx, -20, 0, 40, 130, 20), SKIN, { sb: 10, sy: 5, lw: 4 });                                // the index finger
  for (const dx of [-44, 16, 40]) flat(ctx, () => rr(ctx, dx - 4, 104, 30, 64, 15), '#E7B58E', 3);
  ctx.restore();
}

// ---------- DoorDash's safe (2.5D, red), origin = bottom centre; o.door 0..1 open, o.stock (red bricks visible inside 0..10) ----------
function vault(ctx, o = {}) {
  const w = 300, h = 330, dx = 60, dy = -44;
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; ctx.beginPath(); ctx.ellipse(dx * 0.4, 6, w * 0.62, 18, 0, 0, 7); ctx.fill();
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + dx, dy); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(w / 2, -h); ctx.closePath(); }, C.redD, { sb: 22, sy: 10, lw: 4 });
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -h); ctx.lineTo(w / 2 + dx, dy - h); ctx.lineTo(-w / 2 + dx, dy - h); ctx.closePath(); }, '#F0606B', { shadow: false, lw: 4 });
  cut(ctx, () => rr(ctx, -w / 2, -h, w, h, 10), C.red, { sb: 22, sy: 10, lw: 4 });
  flat(ctx, () => rr(ctx, -w / 2 + 22, -h + 20, w - 44, 56, 10), '#FFFDF8', 3); text(ctx, 'DOORDASH', 0, -h + 62, 40, C.ink, F.black, 'center', w - 70);
  const ox = -112, oy = -h + 98, ow = 224, oh = 196;                                                                // the door opening
  flat(ctx, () => rr(ctx, ox, oy, ow, oh, 12), '#3A1418', 3.5);
  const st = Math.round(o.stock ?? 0); for (let i = 0; i < st; i++) { ctx.save(); ctx.translate(ox + ow / 2 + (i % 2 ? 6 : -6), oy + oh - 24 - i * 17); ctx.scale(0.86, 0.6); brick(ctx, 'r'); ctx.restore(); }
  const op = clamp(o.door ?? 0), sx = Math.cos(op * 1.5);                                                           // the door swings to the left
  if (sx > 0.03) { ctx.save(); ctx.translate(ox, 0); ctx.scale(sx, 1);
    cut(ctx, () => rr(ctx, 0, oy, ow, oh, 12), '#D0323F', { shadow: op > 0.05, lw: 4 });
    flat(ctx, () => { ctx.beginPath(); ctx.arc(ow / 2, oy + oh / 2, 54, 0, 7); }, '#FFFDF8', 4); flat(ctx, () => { ctx.beginPath(); ctx.arc(ow / 2, oy + oh / 2, 16, 0, 7); }, C.ink);
    ctx.save(); ctx.translate(ow / 2, oy + oh / 2); ctx.rotate(o.dial || 0); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, 44); ctx.stroke(); } ctx.restore();
    ctx.restore(); }
  for (const fx of [-w / 2 + 40, w / 2 - 40]) flat(ctx, () => rr(ctx, fx - 22, -8, 44, 22, 6), C.ink);
}

// ---------- a card: coloured header + big amount (centre origin, w x h) ----------
function card(ctx, head, amount, col, o = {}) {
  const w = o.w || 300, h = o.h || 190, hh = o.hh || 54;
  cut(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 20), o.bg || R4.paper, { sb: 22, sy: 10, lw: 4 });
  flat(ctx, () => rr(ctx, -w / 2, -h / 2, w, hh, [20, 20, 0, 0]), col);
  text(ctx, head, 0, -h / 2 + hh * 0.72, o.hs || 30, o.hc || '#FFFFFF', F.black, 'center', w - 30);
  text(ctx, amount, 0, h / 2 - (o.ay ?? 24), o.as || 110, o.ac || C.ink, F.black, 'center', w - 34);
}
// a pay result: TIP $n on top, a 10-cell bar (yellow n + red 10-n), the driver's $10 (centre origin, 300 x 330)
function payCard(ctx, n, o = {}) {
  cut(ctx, () => rr(ctx, -150, -165, 300, 330, 22), R4.paper, { sb: 24, sy: 12, lw: 4 });
  flat(ctx, () => rr(ctx, -150, -165, 300, 64, [22, 22, 0, 0]), n ? C.yellow : '#D8D2C6');
  text(ctx, n ? 'TIP $' + n : 'NO TIP', 0, -118, 40, C.ink, F.black, 'center', 260);
  for (let i = 0; i < 10; i++) flat(ctx, () => rr(ctx, -125 + i * 25, -84, 22, 40, 5), i < n ? C.yellow : C.red, 2.5);
  text(ctx, 'DRIVER', 0, -2, 30, BLUED, F.black, 'center', 260);
  text(ctx, '$10', 0, 128, 128, C.ink, F.black, 'center', 270);
}

// ---------- the driver (generic cartoon courier, blue jacket + cap, delivery bag), feet at 0,0, ~380 tall ----------
// o: look -1..1, eyes 1..2, mood 'neutral'|'smile'|'grin'|'o'|'frown'|'flat'|'side', arms 'down'|'shrug'|'cheer'|'hips', sweat 0..1, bag, walk, tilt, squash
function driver(ctx, x, y, s, o = {}) {
  const look = o.look || 0, eyes = o.eyes || 1, arms = o.arms || 'down', ph = o.walk || 0, bob = Math.abs(Math.sin(ph)) * 8, sq = o.squash || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + sq * 0.06), s * (1 - sq * 0.06));
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 104, 15, 0, 0, 7); ctx.fill();
  for (const [dx, a] of [[-22, Math.sin(ph) * 0.25], [22, -Math.sin(ph) * 0.25]]) { ctx.save(); ctx.translate(dx, -130); ctx.rotate(a); cut(ctx, () => rr(ctx, -17, 0, 34, 130, 14), '#2D3142', { sb: 10, sy: 6, lw: 3 });
    flat(ctx, () => rr(ctx, -20, 118, 44, 18, 8), C.ink); ctx.restore(); }
  ctx.translate(0, -bob);
  if (o.bag !== false) { ctx.save(); ctx.translate(-70, -250); ctx.rotate(-0.08); cut(ctx, () => rr(ctx, -70, 0, 120, 120, 14), '#2A2D38', { sb: 12, sy: 6, lw: 3.5 }); flat(ctx, () => rr(ctx, -60, 14, 100, 16, 6), '#5A6070'); ctx.restore(); }
  cut(ctx, () => rr(ctx, -66, -296, 132, 180, [46, 46, 16, 16]), BLUE, { sb: 12, sy: 6, lw: 3.5 });                       // jacket
  flat(ctx, () => rr(ctx, -4, -290, 8, 170, 3), BLUED); flat(ctx, () => rr(ctx, -66, -150, 132, 14, 0), BLUED);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -226); ctx.lineTo(60, -226); ctx.stroke(); flat(ctx, () => rr(ctx, -66, -230, 132, 8, 0), '#2A2D38');   // bag strap
  const arm = (px, py, rot, len = 150) => { ctx.save(); ctx.translate(px, py); ctx.rotate(rot); cut(ctx, () => rr(ctx, -16, 0, 32, len, 16), BLUE, { sb: 8, sy: 4, lw: 3 });
    flat(ctx, () => { ctx.beginPath(); ctx.arc(0, len + 4, 19, 0, 7); }, SKIN, 3); ctx.restore(); };
  if (arms === 'shrug') { for (const g of [-1, 1]) { ctx.save(); ctx.translate(g * 74, -280); ctx.rotate(-g * 0.9); cut(ctx, () => rr(ctx, -16, 0, 32, 84, 16), BLUE, { sb: 8, sy: 4, lw: 3 }); ctx.translate(0, 80); ctx.rotate(g * 2.3);
      cut(ctx, () => rr(ctx, -15, 0, 30, 74, 15), BLUE, { sb: 8, sy: 4, lw: 3 }); flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 80, 18, 0, 7); }, SKIN, 3); ctx.restore(); } }
  else if (arms === 'cheer') { arm(-74, -284, 2.6, 150); arm(74, -284, -2.6, 150); }
  else if (arms === 'hips') { for (const g of [-1, 1]) { ctx.save(); ctx.translate(g * 74, -280); ctx.rotate(-g * 0.5); cut(ctx, () => rr(ctx, -16, 0, 32, 80, 16), BLUE, { sb: 8, sy: 4, lw: 3 }); ctx.translate(0, 76); ctx.rotate(g * 1.4);
      cut(ctx, () => rr(ctx, -15, 0, 30, 70, 15), BLUE, { sb: 8, sy: 4, lw: 3 }); ctx.restore(); } }
  else { arm(-80, -284, 0.06); arm(80, -284, -0.06); }
  // head
  const hx = look * 6, hy = -352;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(look * 0.1 + (o.tilt || 0));
  cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); }, SKIN2, { sb: 10, sy: 5, lw: 3.5 });
  flat(ctx, () => { ctx.beginPath(); ctx.arc(-54, 8, 10, 0, 7); ctx.arc(54, 8, 10, 0, 7); }, SKIN2, 3);
  // cap (blue, peak to his front-right)
  flat(ctx, () => { ctx.beginPath(); ctx.arc(0, -12, 54, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); }, BLUE, 3.5);
  flat(ctx, () => rr(ctx, 6 + look * 6, -22, 72, 16, 8), BLUED, 3);
  const ey = 8, exo = look * 15, m = o.mood || 'neutral';
  for (const sx of [-18, 18]) { if (eyes > 1.15) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(sx + exo, ey, 7 * eyes, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    if (m === 'flat') { ctx.fillStyle = C.ink; ctx.fillRect(sx + exo - 9, ey - 2, 18, 6); } else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sx + exo, ey, 5.5, 0, 7); ctx.fill(); } }
  const by = ey - 18 - (eyes - 1) * 12; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = '#2B1A10';
  for (const sx of [-18, 18]) { const tl = m === 'frown' ? (sx < 0 ? 0.35 : -0.35) : m === 'o' ? (sx < 0 ? -0.25 : 0.25) : m === 'flat' ? (sx < 0 ? -0.12 : 0.12) : 0, c0 = sx + exo, ddx = Math.cos(tl) * 12, ddy = Math.sin(tl) * 12;
    ctx.beginPath(); ctx.moveTo(c0 - ddx, by - ddy); ctx.lineTo(c0 + ddx, by + ddy); ctx.stroke(); }
  ctx.lineCap = 'butt'; ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; const mx = exo * 0.8, my = 30;
  ctx.beginPath();
  if (m === 'smile') { ctx.arc(mx, my - 10, 12, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else if (m === 'grin') { ctx.moveTo(mx - 18, my - 4); ctx.quadraticCurveTo(mx, my + 22, mx + 18, my - 4); ctx.closePath(); ctx.fill(); }
  else if (m === 'frown') { ctx.arc(mx, my + 8, 11, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (m === 'o') { ctx.ellipse(mx, my, 8, 11, 0, 0, 7); ctx.fill(); }
  else if (m === 'side') { ctx.moveTo(mx - 10, my + 2); ctx.quadraticCurveTo(mx + 4, my + 2, mx + 12, my - 6); ctx.stroke(); }
  else if (m === 'flat') { ctx.moveTo(mx - 14, my); ctx.lineTo(mx + 14, my); ctx.lineWidth = 5; ctx.stroke(); }
  else { ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my); ctx.stroke(); }
  if ((o.sweat || 0) > 0) { ctx.save(); ctx.globalAlpha *= o.sweat; ctx.translate(48, -28 + (1 - o.sweat) * -10); flat(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(13, 4, 0, 10); ctx.quadraticCurveTo(-13, 4, 0, -18); }, '#9EC0F2', 3); ctx.restore(); }
  ctx.restore();
  ctx.restore();
}

module.exports = { BLUE, BLUED, BR, brick, COL, COLH, slotY, columnBack, columnFront, tipPhone, pointer, vault, card, payCard, driver };
