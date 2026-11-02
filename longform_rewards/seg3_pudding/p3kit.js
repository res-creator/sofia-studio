// Long-form "When Paying People Backfired" — Chapter 3 "The Pudding Guy" (USA, 1999), 16:9, redrawn in howitsrun_style:
// thin full-body profile people in real places (grocery store, volunteers' table, street), flat sets, paper plates. NOT the busts/collage
// look of pudding_ep18 — only simple props are borrowed from its pudkit.js (barcode, cases, hand truck, van, check, miles counter,
// marquee, folding table, mail sack, small plane). David Phillips is a generic man (glasses), no likeness. Brands as plain text only,
// no brand colours (the cup and the flyer use neutral colours). World space: floor y = 0, up is negative.
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const P = require('../../howitsrun_style/people');
const SE = require('../../howitsrun_style/sets');
const PK = require('../../pudding_ep18/pudkit');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL, W, H } = ST;

// ---------- cast (generic re-enactment people) ----------
const DAVID = { ...P.LOOKS.casual, skin: '#EDBE98', hair: '#5A3A22', top: '#3E7C8C', cuff: '#336A78', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#2A2A2A', sole: '#C9C1B1', iris: '#4A6A8A', brow: '#4A2E18', glasses: 1 };
const EXEC = { ...P.LOOKS.office, skin: '#E8B48F', hair: '#2A1A10', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#2A1A10' };
const VOLS = [
  { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'bun', top: '#5B6E9E', cuff: '#4A5C88', apron: '#FFFDF8', pants: '#2A2A2A', shoes: '#1E1E1E', iris: '#3A2414', brow: '#1E1612', lashes: 1, lips: '#7A3434' },
  { skin: '#F0C7A6', hair: '#C9C2B8', hairStyle: 'short', top: '#8A9A4B', cuff: '#6E7C3A', apron: '#FFFDF8', pants: '#3A3A44', shoes: '#2A2A2A', iris: '#3E6A8A', brow: '#9A9590', glasses: 1 },
  { skin: '#C98E66', hair: '#3A2418', hairStyle: 'long', top: '#D9A43B', cuff: '#B88A2E', apron: '#FFFDF8', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#7A3434' },
];
const SHOPPER = { ...P.LOOKS.casual, skin: '#E3B08C', hair: '#2A1A10', hairStyle: 'long', top: '#B5304A', cuff: '#962840', pants: '#4A5578', lashes: 1, lips: '#8A3A3A' };

// ---------- the pudding cup (flat side view, base centre at 0, ~150 wide x 120 tall at s = 1): neutral label, small barcode ----------
function cup(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const w0 = 58, w1 = 74, h = 112;
  ctx.beginPath(); ctx.moveTo(-w1, -h); ctx.lineTo(-w0, 0); ctx.lineTo(w0, 0); ctx.lineTo(w1, -h); ctx.closePath(); fillStroke(ctx, '#7A4A2E', 4.5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-w1, -h); ctx.lineTo(-w0, 0); ctx.lineTo(w0, 0); ctx.lineTo(w1, -h); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(30, -h, 60, h);
  ctx.fillStyle = '#FFF6E6'; ctx.fillRect(-w1, -h * 0.78, w1 * 2, h * 0.5); ctx.fillStyle = '#C98E4A'; ctx.fillRect(-w1, -h * 0.78, w1 * 2, h * 0.07);
  fitTxt(ctx, 'PUDDING', -18, -h * 0.42, 22, '#5A3220', 80);
  if (!o.peeled) { ctx.save(); ctx.translate(40, -h * 0.52); PK.barcode(ctx, 40, 32, { digits: false, seed: o.seed || 1 }); ctx.restore(); }
  else { ctx.fillStyle = '#E8DFCB'; ctx.fillRect(20, -h * 0.68, 40, 34); }
  ctx.restore();
  rr(ctx, -w1 - 6, -h - 12, (w1 + 6) * 2, 16, 6); fillStroke(ctx, o.lid || '#D9DDE2', 4);
  ctx.restore();
}
function cupPile(ctx, rows, s = 1, o = {}) {
  const dx = 150 * s, dy = 118 * s;
  for (let r = 0; r < rows; r++) { const n = rows - r + (o.wide || 0);
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * dx, y = -r * dy; ctx.save(); ctx.translate(x, y); ctx.rotate((hash(r * 7 + i * 3) - 0.5) * 0.08); cup(ctx, s, { seed: r * 9 + i, peeled: o.peeled }); ctx.restore(); } }
}
// ---------- shopping cart (wheels at y = 0, ~560 wide); load 0..1, over: cups heaped above the basket ----------
function cart(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const bx0 = -230, bx1 = 260, by0 = -460, by1 = -190, chrome = '#C9CED6';
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(220, -40); ctx.moveTo(-200, -40); ctx.lineTo(-250, -470); ctx.moveTo(220, -40); ctx.lineTo(240, -190); ctx.stroke();
  ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 7); ctx.stroke();
  for (const x of [-180, 200]) { ell(ctx, x, -18, 22, 22); fillStroke(ctx, '#2A2A2E', 4); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.beginPath(); ctx.moveTo(-250, -470); ctx.lineTo(-300, -500); ctx.stroke(); ctx.strokeStyle = PAL.blue; ctx.lineWidth = px(ctx, 9); ctx.stroke();
  const basket = () => { ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1 + 30, by0); ctx.lineTo(bx1, by1); ctx.lineTo(bx0 + 30, by1); ctx.closePath(); };
  basket(); ctx.fillStyle = 'rgba(80,88,98,0.18)'; ctx.fill();
  const n = Math.round((o.load ?? 1) * 28), spots = [];
  for (let row = 0; row < 6; row++) for (let i = 0; i < 5 - Math.max(0, row - 2); i++) spots.push([bx0 + 60 + i * 96 + Math.max(0, row - 2) * 48 + (row % 2) * 16, by1 - 4 - row * 80]);
  for (let j = 0; j < Math.min(n, spots.length); j++) { const [x, y] = spots[j]; ctx.save(); ctx.translate(x, y); ctx.rotate((hash(j * 7) - 0.5) * 0.3); cup(ctx, 0.62, { seed: j }); ctx.restore(); }
  ctx.save(); basket(); ctx.clip(); ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 4);
  for (let x = bx0 - 40; x < bx1 + 60; x += 34) { ctx.beginPath(); ctx.moveTo(x, by0); ctx.lineTo(x - 30, by1); ctx.stroke(); }
  for (let y = by0 + 34; y < by1; y += 40) { ctx.beginPath(); ctx.moveTo(bx0 - 40, y); ctx.lineTo(bx1 + 60, y); ctx.stroke(); }
  ctx.restore(); basket(); ctx.lineWidth = px(ctx, 7); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// ---------- the promo flyer (centred, 640 x 820): neutral colours, brand name as plain text ----------
function flyer(ctx, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -320, -410, 640, 820, 14), '#FFFDF6', { elev: 2 });
  ctx.save(); rr(ctx, -320, -410, 640, 170, 14); ctx.clip(); ctx.fillStyle = PAL.navy; ctx.fillRect(-320, -410, 640, 170); ctx.restore();
  fitTxt(ctx, 'HEALTHY CHOICE', 0, -330, 56, '#FFFDF8', 560); fitTxt(ctx, 'SPECIAL OFFER · 1999', 0, -272, 34, C.yellow, 560);
  fitTxt(ctx, 'MAIL IN BARCODES', 0, -160, 58, INK, 580); fitTxt(ctx, 'GET FREE', 0, -96, 46, INK, 580); fitTxt(ctx, 'AIRLINE MILES', 0, -30, 64, C.red, 580);
  ctx.save(); ctx.translate(0, 120); ctx.rotate(-0.05); PK.plane(ctx, 0.6, PAL.blue); ctx.restore();
  ctx.save(); ctx.translate(0, 310); PK.barcode(ctx, 300, 100); ctx.restore();
  if (o.ticks) o.ticks.forEach(([s, u], i) => { if (u <= 0) return; ctx.save(); ctx.translate(-250, -160 + i * 64 + (i ? 4 : 0)); const k = E.back(clamp(u), 2.4); ctx.scale(k, k);
    ctx.strokeStyle = '#1F8A5A'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-6, 20); ctx.lineTo(30, -28); ctx.stroke(); ctx.restore(); });
}
// ---------- grocery aisle shelf with generic products (base y = 0, centred, w wide); o.tags: [[i, text, u]] price-tag pops ----------
const GOODS = ['#C9302C', '#4D8DFF', '#2FA37E', '#D9A43B', '#8A5A9A', '#E8C25A', '#5A606B'];
function aisle(ctx, w, o = {}) {
  const rows = 4, rh = 210, top = -rows * rh - 80;
  CL.cutout(ctx, () => rr(ctx, -w / 2 - 20, top, w + 40, -top, 10), '#E9E1CE', { elev: 1.2 });
  for (let r = 0; r < rows; r++) { const y = -r * rh - 80;
    for (let x = -w / 2 + 20, j = 0; x < w / 2 - 70; j++) { const bw = 70 + hash(r * 31 + j) * 50, bh = 110 + hash(r * 17 + j * 3) * 70, col = GOODS[Math.floor(hash(r * 7 + j * 11) * GOODS.length)];
      if (o.cups && r === o.cups[0] && x > o.cups[1] && x < o.cups[2]) { ctx.save(); ctx.translate(x + 60, y); cup(ctx, 0.78, { seed: j }); ctx.translate(0, -100); cup(ctx, 0.78, { seed: j + 5 }); ctx.restore(); x += 135; continue; }
      rr(ctx, x, y - bh, bw, bh, 6); fillStroke(ctx, col, 4); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x + 10, y - bh * 0.7, bw - 20, bh * 0.25); x += bw + 10; }
    rr(ctx, -w / 2 - 6, y, w + 12, 34, 4); fillStroke(ctx, '#D8D2C2', 4); }
  rr(ctx, -w / 2 - 20, -60, w + 40, 60, 6); fillStroke(ctx, '#8C8472', 4);
  if (o.tags) o.tags.forEach(([x, r, s, u, col]) => { if (u <= 0) return; ctx.save(); ctx.translate(x, -r * rh - 50); ctx.rotate(0.05); const k = E.back(clamp(u), 2.2); ctx.scale(k, k); PK.priceTag(ctx, s, { w: 200, h: 100, col: col || C.yellow }); ctx.restore(); });
}
// ---------- tax form (centred, 700 x 820) ----------
function taxForm(ctx, u) {
  ctx.save(); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -350, -410, 700, 820, 8), '#FBF6EA', { elev: 1.8 });
  fitTxt(ctx, 'TAX RETURN · 1999', 0, -320, 56, INK, 620, 'center', ST.FONT.type);
  ctx.strokeStyle = 'rgba(80,110,160,0.25)'; ctx.lineWidth = 2; for (let y = -240; y < 360; y += 60) { ctx.beginPath(); ctx.moveTo(-310, y); ctx.lineTo(310, y); ctx.stroke(); }
  fitTxt(ctx, 'CHARITY DONATION:', -300, -140, 40, INK, 420, 'left', ST.FONT.type); fitTxt(ctx, 'PUDDING', -300, -80, 46, C.red, 420, 'left', ST.FONT.type);
  ctx.save(); ctx.translate(0, 140); ST.stampWord(ctx, 'TAX WRITE-OFF', 74, u, '#1F8A5A', -0.1); ctx.restore();
  ctx.restore();
}
// ---------- quote card (typewriter quote + name), centred 980 x 420 ----------
function quoteCard(ctx, lines, who, u) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 1.8); ctx.scale(k, k); ctx.rotate(-0.015);
  CL.cutout(ctx, () => rr(ctx, -490, -210, 980, 420, 20), PAL.cream, { elev: 2 });
  txt(ctx, '“', -430, -60, 200, C.red, 'left');
  lines.forEach((s, i) => fitTxt(ctx, s, 20, -80 + i * 76, 60, INK, 820, 'center', ST.FONT.type));
  fitTxt(ctx, who, 400, 160, 36, '#4A4A48', 600, 'right'); ctx.restore();
}
// ---------- WANTED / PAID FOR board (centred, 900 x 360); u1, u2 pop the rows ----------
function wantedPaid(ctx, a, b, u1, u2) {
  CL.cutout(ctx, () => rr(ctx, -450, -180, 900, 360, 18), PAL.cream, { elev: 2 });
  const row = (lab, val, y, u, col, fg) => { if (u <= 0) return; ctx.save(); ctx.translate(0, y); const k = E.back(clamp(u), 2); ctx.scale(k, k);
    fitTxt(ctx, lab, -400, 20, 52, '#4A4A48', 300, 'left'); ctx.save(); ctx.translate(140, 0); ctx.rotate(-0.02); ctx.font = `66px ${F.black}`; const w = Math.min(ctx.measureText(val).width + 50, 560);
    CL.cutout(ctx, () => rr(ctx, -w / 2, -52, w, 96, 12), col, { elev: 1 }); fitTxt(ctx, val, 0, 24, 66, fg, w - 30); ctx.restore(); ctx.restore(); };
  row('WANTED:', a, -75, u1, '#2FA37E', PAL.cream); row('PAID FOR:', b, 80, u2, C.red, PAL.cream);
}
// ---------- the rules sign (two sides): flips at f 0..1; front = company, back = customer ----------
function flipSign(ctx, f, front, back) {
  const k = Math.max(0.03, Math.abs(Math.cos(f * Math.PI))), side = f < 0.5 ? front : back; ctx.save(); ctx.scale(k, 1);
  CL.cutout(ctx, () => rr(ctx, -440, -230, 880, 460, 24), side.col, { elev: 2 });
  fitTxt(ctx, side.top, 0, -110, 50, side.fg2 || '#4A4A48', 780); fitTxt(ctx, side.big, 0, 20, 96, side.fg || INK, 800); fitTxt(ctx, side.sub, 0, 130, 54, side.fg || INK, 780);
  ctx.restore();
}
// ---------- chapter card (screen space): same layout as the other chapters ----------
function chapterCard(ctx, t, n, title, place, iconL, iconR) {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(201,135,74,0.10)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 60 + 20, W, 3);
  const z = 1 + t * 0.02; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  const ui = E.back(K.seg(t, 0.15, 0.6), 1.8);
  if (iconL && ui > 0) { ctx.save(); ctx.translate(lerp(-200, 300, ui), 560); ctx.rotate(-0.08 + Math.sin(t * 2) * 0.03); iconL(ctx, t); ctx.restore(); }
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

module.exports = { PK, DAVID, EXEC, VOLS, SHOPPER, cup, cupPile, cart, flyer, aisle, taxForm, quoteCard, wantedPaid, flipSign, chapterCard };
