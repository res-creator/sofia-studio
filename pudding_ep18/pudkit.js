// Episode 18 "The Pudding Guy" — sets, props and cast (on hirkit): the pudding cup with its barcode, cup mountains, the store shelf,
// the shopping cart full of cups, the promo flyer, the airliner, price tags, cases on a hand truck, the volunteers' table, the donation van,
// the check, the miles counter, the cinema marquee, the balance scale, the boarding pass. Generic drawings, no logos: names as plain text only.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, E, rr } = K;
const { INK, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center', font = F.black) { ctx.font = `${size}px ${font}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align, font); return size; }
const hash = K.hash;

// ---------- cast ----------
const DAVID = { skin: '#EDBE98', hair: '#5A3A22', hairStyle: 'short', top: '#3E8C8C', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#2A2A2A', iris: '#4A6A8A', brow: '#4A2E18', glasses: 1 };
const VOLS = [
  { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'bun', top: C.red, apron: '#FFFDF8', pants: '#2A2A2A', shoes: '#1E1E1E', iris: '#3A2414', brow: '#1E1612', lashes: 1, lips: '#7A3434' },
  { skin: '#F0C7A6', hair: '#C9C2B8', hairStyle: 'short', top: C.red, apron: '#FFFDF8', pants: '#3A3A44', shoes: '#2A2A2A', iris: '#3E6A8A', brow: '#9A9590', glasses: 1 },
  { skin: '#C98E66', hair: '#3A2418', hairStyle: 'long', top: C.red, apron: '#FFFDF8', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#7A3434' },
];
const MANAGER = { skin: '#E8B48F', hair: '#2A1A10', hairStyle: 'short', top: '#2E3A59', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#1E1E22', iris: '#3A2414', brow: '#2A1A10', beard: 1 };

// ---------- barcode (centred, w x h) ----------
function barcode(ctx, w, h, o = {}) {
  ctx.save(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = INK; let x = -w / 2 + w * 0.08; const x1 = w / 2 - w * 0.08; let i = 0;
  while (x < x1) { const bw = (1 + Math.floor(hash(i * 3.7 + (o.seed || 0)) * 3)) * w / 95; if (i % 2 === 0) ctx.fillRect(x, -h / 2 + h * 0.08, bw, h * (o.digits === false ? 0.84 : 0.66)); x += bw; i++; }
  if (o.digits !== false) { ctx.font = `${Math.round(h * 0.2)}px ${F.xb}`; ctx.textAlign = 'center'; ctx.fillText('0 72655 00151 3', 0, h / 2 - h * 0.05); }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore();
}
// ---------- the pudding cup (front 3/4 view, base centre at 0, ~150 wide x 120 tall at s = 1) ----------
// o: peeled (barcode cut off), lid (foil colour), tilt
function cup(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const w0 = 62, w1 = 76, h = 112, ry = 16;
  ctx.beginPath(); ctx.moveTo(-w1, -h); ctx.lineTo(-w0, 0); ctx.ellipse(0, 0, w0, ry * 0.8, 0, Math.PI, 0, true); ctx.lineTo(w1, -h); ctx.closePath();
  const g = ctx.createLinearGradient(-w1, 0, w1, 0); g.addColorStop(0, '#5A3220'); g.addColorStop(0.35, '#8A5434'); g.addColorStop(1, '#4A281A'); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  // the white label band
  ctx.save(); ctx.clip(); ctx.fillStyle = '#FFFDF6'; ctx.fillRect(-w1, -h * 0.72, w1 * 2, h * 0.42); ctx.fillStyle = '#2FA37E'; ctx.fillRect(-w1, -h * 0.72, w1 * 2, h * 0.08);
  fitTxt(ctx, 'CHOCOLATE', -16, -h * 0.42, 20, '#5A3220', 84); fitTxt(ctx, 'PUDDING', -16, -h * 0.36 + 4, 15, '#5A3220', 70, 'center', F.xb);
  if (!o.peeled) { ctx.save(); ctx.translate(46, -h * 0.5); ctx.rotate(-0.04); barcode(ctx, 40, 34, { digits: false, seed: o.seed || 1 }); ctx.restore(); }
  else { ctx.fillStyle = '#E8DFCB'; ctx.fillRect(26, -h * 0.66, 40, 36); }
  ctx.restore();
  // foil lid
  ell(ctx, 0, -h, w1, ry); fillStroke(ctx, o.lid || '#D9DDE2', 4.5); ell(ctx, -14, -h - 3, w1 * 0.5, ry * 0.4); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  ctx.restore();
}
// a mountain of cups (pyramid), base centre at 0; n rows; f 0..1 how many are there (top rows first to vanish)
function cupPile(ctx, rows, s = 1, o = {}) {
  const dx = 132 * s, dy = 92 * s;
  for (let r = 0; r < rows; r++) { const n = rows - r + (o.wide || 0);
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * dx + (hash(r * 13 + i) - 0.5) * 20 * s, y = -r * dy;
      ctx.save(); ctx.translate(x, y); ctx.rotate((hash(r * 7 + i * 3) - 0.5) * 0.18); cup(ctx, s, { seed: r * 9 + i, peeled: o.peeled }); ctx.restore(); } }
}
// ---------- store shelf with cups (base at 0, centred, w wide); stock(r, i) 0..1; price label ----------
function shelf(ctx, w, o = {}) {
  const rows = o.rows || 4, rh = o.rh || 200, top = -rows * rh - 100, n = o.n || Math.max(1, Math.floor(w / 160));
  CL.cutout(ctx, () => rr(ctx, -w / 2 - 20, top, w + 40, -top, 10), o.back || '#E9E1CE', { elev: 1.2 });
  ctx.fillStyle = 'rgba(140,120,90,0.25)'; for (let y = top + 40; y < -30; y += 34) for (let x = -w / 2 + 10; x < w / 2; x += 34) { ell(ctx, x, y, 3.2, 3.2); ctx.fill(); }
  if (o.sign) { ctx.save(); ctx.translate(0, top - 6); CL.cutout(ctx, () => rr(ctx, -w * 0.36, -90, w * 0.72, 100, 12), C.red, { elev: 1.2 }); fitTxt(ctx, o.sign, 0, -22, 60, '#FFFDF8', w * 0.66); ctx.restore(); }
  for (let r = 0; r < rows; r++) { const y = -r * rh - 80;
    for (let i = 0; i < n; i++) { const u = o.stock ? o.stock(r, i) : 1; if (u <= 0.02) continue; const x = -w / 2 + (i + 0.5) * w / n;
      ctx.save(); ctx.translate(x, y + (1 - u) * -60); ctx.rotate((hash(r * 17 + i) - 0.5) * 0.06); ctx.globalAlpha *= clamp(u * 2); cup(ctx, 0.85, { seed: r * 5 + i }); ctx.save(); ctx.translate(14, -96); cup(ctx, 0.85, { seed: r * 5 + i + 50 }); ctx.restore(); ctx.restore(); }
    rr(ctx, -w / 2 - 6, y, w + 12, 34, 4); fillStroke(ctx, '#D8D2C2', 4); ctx.fillStyle = C.yellow; ctx.fillRect(-w / 2, y + 6, w, 22);
    for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; ctx.fillStyle = '#FFFDF8'; ctx.fillRect(x - 36, y + 4, 72, 26); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 2.5); ctx.strokeRect(x - 36, y + 4, 72, 26); txt(ctx, o.price || '25¢', x, y + 26, 22, INK); }
  }
  rr(ctx, -w / 2 - 20, -60, w + 40, 60, 6); fillStroke(ctx, '#8C8472', 4);
}
// ---------- shopping cart full of cups (wheels on y = 0, ~560 wide); load 0..1 ----------
function cart(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const bx0 = -230, bx1 = 260, by0 = -460, by1 = -190, chrome = '#C9CED6', chromeD = '#8E959E';
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(220, -40); ctx.moveTo(-200, -40); ctx.lineTo(-250, -470); ctx.moveTo(220, -40); ctx.lineTo(240, -190); ctx.stroke();
  ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 7); ctx.stroke();
  for (const x of [-180, 200]) { ell(ctx, x, -18, 22, 22); fillStroke(ctx, '#2A2A2E', 4); ell(ctx, x, -18, 8, 8); ctx.fillStyle = chromeD; ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.beginPath(); ctx.moveTo(-250, -470); ctx.lineTo(-300, -500); ctx.stroke(); ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 9); ctx.stroke();
  const basket = () => { ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1 + 30, by0); ctx.lineTo(bx1, by1); ctx.lineTo(bx0 + 30, by1); ctx.closePath(); };
  basket(); ctx.fillStyle = 'rgba(80,88,98,0.18)'; ctx.fill();
  const n = Math.round((o.load ?? 1) * 22), spots = [];
  for (let row = 0; row < 6; row++) for (let i = 0; i < 5 - Math.max(0, row - 1); i++) spots.push([bx0 + 60 + i * 100 + Math.max(0, row - 1) * 50 + (row % 2) * 16, by1 - 4 - row * 74]);
  for (let j = 0; j < Math.min(n, spots.length); j++) { const [x, y] = spots[j]; ctx.save(); ctx.translate(x, y); ctx.rotate((hash(j * 7) - 0.5) * 0.3); cup(ctx, 0.62, { seed: j }); ctx.restore(); }
  ctx.save(); basket(); ctx.clip(); ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 4);
  for (let x = bx0 - 40; x < bx1 + 60; x += 34) { ctx.beginPath(); ctx.moveTo(x, by0); ctx.lineTo(x - 30, by1); ctx.stroke(); }
  for (let y = by0 + 34; y < by1; y += 40) { ctx.beginPath(); ctx.moveTo(bx0 - 40, y); ctx.lineTo(bx1 + 60, y); ctx.stroke(); }
  ctx.restore();
  basket(); ctx.lineWidth = px(ctx, 7); ctx.strokeStyle = INK; ctx.stroke(); basket(); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = chrome; ctx.stroke();
  ctx.restore();
}
// ---------- airliner (side, nose to +x, centred, ~600 long at s = 1) ----------
function plane(ctx, s = 1, col = '#4D8DFF') {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-150, -10); ctx.lineTo(-40, -140); ctx.lineTo(10, -140); ctx.lineTo(-30, -10); ctx.closePath(); fillStroke(ctx, shadeC(col), 5); // far wing
  ctx.beginPath(); ctx.moveTo(-300, -20); ctx.lineTo(-330, -130); ctx.lineTo(-270, -130); ctx.lineTo(-210, -30); ctx.closePath(); fillStroke(ctx, col, 5); // tail fin
  rr(ctx, -310, -40, 610, 80, 40); fillStroke(ctx, '#FFFDF8', 5);
  ctx.beginPath(); ctx.moveTo(250, -38); ctx.quadraticCurveTo(320, -30, 310, 0); ctx.lineTo(250, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(-300, 8, 560, 12);
  for (let i = 0; i < 9; i++) { ell(ctx, -200 + i * 46, -12, 9, 11); fillStroke(ctx, '#9FC3E8', 3); }
  ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(-170, 150); ctx.lineTo(-110, 150); ctx.lineTo(40, 10); ctx.closePath(); fillStroke(ctx, col, 5); // near wing
  rr(ctx, -150, 60, 90, 40, 18); fillStroke(ctx, '#C9CED6', 4);
  ctx.restore();
}
const shadeC = c => R.shade(c, -0.25);
// ---------- promo flyer (centred, ~640 x 820) ----------
function flyer(ctx, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -320, -410, 640, 820, 14), '#FFFDF6', { elev: 2 });
  ctx.save(); rr(ctx, -320, -410, 640, 180, 14); ctx.clip(); ctx.fillStyle = '#2FA37E'; ctx.fillRect(-320, -410, 640, 180); ctx.restore();
  fitTxt(ctx, 'HEALTHY CHOICE', 0, -340, 50, '#FFFDF8', 560); fitTxt(ctx, 'SPECIAL OFFER · 1999', 0, -270, 34, '#FFFDF8', 560, 'center', F.xb);
  fitTxt(ctx, 'MAIL IN BARCODES', 0, -150, 58, INK, 580); fitTxt(ctx, 'GET FREE', 0, -80, 50, INK, 580); fitTxt(ctx, 'AIRLINE MILES', 0, -14, 64, C.red, 580);
  ctx.save(); ctx.translate(0, 150); ctx.rotate(-0.05); plane(ctx, 0.62, '#4D8DFF'); ctx.restore();
  ctx.save(); ctx.translate(0, 320); barcode(ctx, 300, 90); ctx.restore();
}
// ---------- price tag (centred) ----------
function priceTag(ctx, s, o = {}) {
  ctx.save(); const w = o.w || 260, h = o.h || 150;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2 + 50, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath();
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2 + 50, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath(); }, o.col || C.yellow, { elev: 1.4 });
  ell(ctx, -w / 2 + 40, 0, 12, 12); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = INK; ctx.stroke();
  fitTxt(ctx, s, 22, h * 0.2, h * 0.62, o.fg || INK, w - 90); ctx.restore();
}
// ---------- a cardboard case of cups (base centre at 0) ----------
function caseBox(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -130, -140, 260, 140, 8), '#C9A06A', { elev: 1, tex: 0.6 });
  ctx.fillStyle = 'rgba(90,60,30,0.3)'; ctx.fillRect(-130, -80, 260, 10); txt(ctx, 'PUDDING', 0, -30, 34, '#5A3220'); txt(ctx, '× 48 CUPS', 0, -100, 26, '#5A3220'); ctx.restore();
}
// ---------- hand truck with a stack of cases (wheels at 0) ----------
function handTruck(ctx, n, s = 1) {
  ctx.save(); ctx.scale(s, s);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((hash(i) - 0.5) * 12, -20 - i * 140); caseBox(ctx, 1); ctx.restore(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-150, -20 - n * 140 - 60); ctx.lineTo(-150, 0); ctx.lineTo(140, 0); ctx.stroke();
  ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 7); ctx.stroke(); ell(ctx, -150, 10, 34, 34); fillStroke(ctx, '#2A2A2E', 5); ctx.restore();
}
// ---------- the donation van (side, faces +x, wheels on y = 0, ~700 long) ----------
function van(ctx, label = 'DONATION', o = {}) {
  ctx.save();
  rr(ctx, -360, -360, 520, 320, 24); fillStroke(ctx, '#FFFDF8', 6);
  ctx.beginPath(); ctx.moveTo(160, -300); ctx.lineTo(280, -300); ctx.lineTo(350, -170); ctx.lineTo(350, -40); ctx.lineTo(160, -40); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 6);
  ctx.beginPath(); ctx.moveTo(190, -280); ctx.lineTo(270, -280); ctx.lineTo(320, -180); ctx.lineTo(190, -180); ctx.closePath(); fillStroke(ctx, '#9FC3E8', 4);
  ctx.fillStyle = C.red; ctx.fillRect(-360, -120, 710, 30);
  fitTxt(ctx, label, -100, -210, 64, C.red, 460); fitTxt(ctx, 'FOR PEOPLE IN NEED', -100, -150, 30, INK, 460, 'center', F.xb);
  for (const x of [-230, 240]) { ell(ctx, x, -30, 60, 60); fillStroke(ctx, '#2A2A2E', 6); ell(ctx, x, -30, 24, 24); ctx.fillStyle = '#C9CED6'; ctx.fill(); }
  ctx.restore();
}
// ---------- bank check (centred, ~820 x 380) ----------
function check(ctx, amount, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -410, -190, 820, 380, 14), '#E8F1EA', { elev: 2 });
  ctx.strokeStyle = 'rgba(47,163,126,0.3)'; ctx.lineWidth = 2; for (let i = -400; i < 400; i += 18) { ctx.beginPath(); ctx.moveTo(i, -190); ctx.lineTo(i + 60, 190); ctx.stroke(); }
  txt(ctx, 'PAY TO THE ORDER OF', -370, -100, 26, '#3A3A40', 'left', F.xb); ctx.fillStyle = INK; ctx.fillRect(-370, -60, 480, 4); txt(ctx, 'GROCERY STORES', -360, -70, 34, '#2E3A59', 'left');
  CL.cutout(ctx, () => rr(ctx, 130, -130, 250, 90, 10), '#FFFDF8', { elev: 0.6, tex: 0 }); fitTxt(ctx, amount, 255, -66, 56, INK, 230);
  txt(ctx, 'FOR: PUDDING', -370, 40, 30, '#3A3A40', 'left', F.xb); ctx.fillStyle = INK; ctx.fillRect(-370, 54, 360, 3);
  ctx.save(); ctx.translate(230, 70); ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-110, 10); ctx.bezierCurveTo(-60, -50, -40, 40, 0, -10); ctx.bezierCurveTo(30, -40, 60, 30, 110, -20); ctx.stroke(); ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(10, 90, 360, 3);
}
// ---------- miles counter (odometer, centred, ~880 x 260); value shown with commas ----------
function milesCounter(ctx, value, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -440, -150, 880, 300, 24), '#1C2340', { elev: 2 });
  const s = Math.round(value).toLocaleString('en-US').padStart(9, ' ');
  ctx.font = `120px ${F.black}`; const cw = 88; ctx.textAlign = 'center';
  for (let i = 0; i < s.length; i++) { const x = -((s.length - 1) / 2) * cw + i * cw, ch = s[i];
    if (ch !== ',' && ch !== ' ') { rr(ctx, x - 38, -80, 76, 120, 10); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.fillStyle = INK; ctx.fillText(ch, x, 22); }
    else if (ch === ',') { ctx.fillStyle = C.yellow; ctx.fillText(',', x, 30); } }
  txt(ctx, o.label || 'FREQUENT-FLYER MILES', 0, 112, 40, C.yellow);
}
// ---------- cinema marquee (centred, ~900 wide) ----------
function marquee(ctx, t, lines) {
  CL.cutout(ctx, () => rr(ctx, -450, -230, 900, 400, 20), '#2A2A30', { elev: 2 });
  for (let i = 0; i < 26; i++) { const a = i / 26, x = -430 + (i % 13) * 71.6, y = i < 13 ? -212 : 152; ell(ctx, x + 18, y, 11, 11); ctx.fillStyle = (Math.floor(t * 6) + i) % 3 ? '#FFE9A0' : '#8A7A50'; ctx.fill(); }
  rr(ctx, -400, -180, 800, 300, 10); ctx.fillStyle = '#FFFDF6'; ctx.fill();
  lines.forEach((s, i) => fitTxt(ctx, s[0], 0, -100 + i * 100, s[1] || 70, s[2] || INK, 740));
}
// ---------- balance scale (pivot at 0; tilt -1..1, + = right pan down) ----------
function balance(ctx, tilt, left, right) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 520); ctx.stroke(); ctx.strokeStyle = '#C9A06A'; ctx.lineWidth = px(ctx, 8); ctx.stroke();
  rr(ctx, -150, 510, 300, 40, 12); fillStroke(ctx, '#C9A06A', 5);
  const a = tilt * 0.28; ctx.save(); ctx.rotate(a); rr(ctx, -380, -14, 760, 28, 14); fillStroke(ctx, '#C9A06A', 5);
  for (const [sx, draw] of [[-1, left], [1, right]]) { ctx.save(); ctx.translate(sx * 360, 0); ctx.rotate(-a);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, 220); ctx.moveTo(0, 0); ctx.lineTo(120, 220); ctx.stroke();
    ell(ctx, 0, 226, 150, 30); fillStroke(ctx, '#D8D2C2', 5); ctx.save(); ctx.translate(0, 216); draw(ctx); ctx.restore(); ctx.restore(); }
  ctx.restore(); ell(ctx, 0, 0, 24, 24); fillStroke(ctx, C.red, 5); ctx.restore();
}
// ---------- boarding pass (centred, ~560 x 240) ----------
function boardingPass(ctx) {
  CL.cutout(ctx, () => rr(ctx, -280, -120, 560, 240, 16), '#FFFDF8', { elev: 1.4 });
  ctx.save(); rr(ctx, -280, -120, 560, 64, 16); ctx.clip(); ctx.fillStyle = '#4D8DFF'; ctx.fillRect(-280, -120, 560, 64); ctx.restore();
  txt(ctx, 'BOARDING PASS', -40, -74, 34, '#FFFDF8'); txt(ctx, 'FREE', -120, 40, 70, C.red); txt(ctx, 'SEAT 1A', 150, 30, 40, INK);
  ctx.save(); ctx.translate(170, -70); ctx.scale(0.12, 0.12); plane(ctx, 1, '#FFFDF8'); ctx.restore();
  ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, -56); ctx.lineTo(60, 110); ctx.stroke(); ctx.setLineDash([]);
}
// ---------- the folding table of the volunteers (top at y = 0, centred, w wide) ----------
function table(ctx, w) {
  rr(ctx, -w / 2, -10, w, 34, 8); fillStroke(ctx, '#E9E1CE', 5); ctx.fillStyle = '#B9AE98'; ctx.fillRect(-w / 2 + 10, 24, w - 20, 16);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 10); for (const x of [-w / 2 + 50, w / 2 - 50]) { ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 330); ctx.stroke(); }
}
// the mail sack for the barcodes (base at 0)
function sack(ctx, s = 1, fill = 1) {
  ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(-170, -160 * fill - 40, -60, -220 * fill - 40); ctx.lineTo(60, -220 * fill - 40); ctx.quadraticCurveTo(170, -160 * fill - 40, 120, 0); ctx.closePath(); fillStroke(ctx, '#D9C9A0', 5);
  txt(ctx, 'BARCODES', 0, -60 * fill - 30, 34, '#5A3220'); txt(ctx, 'U.S. MAIL', 0, -20, 26, '#2E3A59'); ctx.restore();
}

module.exports = { W, H, layer, txt, fitTxt, DAVID, VOLS, MANAGER, barcode, cup, cupPile, shelf, cart, plane, flyer, priceTag, caseBox, handTruck, van, check, milesCounter, marquee, balance, boardingPass, table, sack };
