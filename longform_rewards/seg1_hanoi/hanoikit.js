// Long-form "When Paying People Backfired" — Hanoi 1902 kit (16:9). Reuses the drawn world of rats_ep26 (ratkit.js, cast.js, read-only)
// and adds what the wide chapter needs: the chapter card, the hand with scissors (cold open), the bounty-table exchange re-framed wide,
// the police station, the ledger, the archive room + a generic historian (no likeness), the quote card and the WANTED / PAID FOR board.
// World space like ratkit: floor y = 0, up is negative. Requires HIR_WIDE=1 before loading (style.js reads it).
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const P = require('../../howitsrun_style/people');
const S = require('../../rats_ep26/ratkit');
const CS = S.CS;
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { W, H, PAL, txt, fitTxt, label } = ST;

const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: ST.blink(t, 3.2, o) });
const coinItem = (t, r = 34) => g => { g.save(); g.translate(18, -20); S.coin(g, r, '1¢', { spin: t * 3 }); g.restore(); };
const tailItem = (t, len = 170) => g => { g.save(); g.translate(14, -6); S.tail(g, len, t * 4, 13); g.restore(); };

// ---------- chapter card (segments 1–6): paper card, small "CHAPTER n", big title, place/year on a red strip; u = pop 0..1 ----------
function chapterCard(ctx, t, n, title, place, u) {
  ST.bg(ctx, '#EADFC6'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 18; i++) ctx.fillRect(0, i * 64, W, 3);
  if (u <= 0) return; ctx.save(); ctx.translate(W / 2, 470); const k = E.back(clamp(u), 1.8); ctx.scale(k, k); ctx.rotate(-0.015 + Math.sin(t * 0.8) * 0.004);
  CL.cutout(ctx, () => rr(ctx, -560, -250, 1120, 500, 22), PAL.cream, { elev: 2.2 });
  ctx.save(); ctx.translate(0, -165); ctx.font = `40px ${F.black}`; const w = ctx.measureText(n).width + 50; CL.cutout(ctx, () => rr(ctx, -w / 2, -34, w, 62, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, n, 0, 14, 40, C.yellow); ctx.restore();
  fitTxt(ctx, title, 0, 30, 132, INK, 1000);
  ctx.save(); ctx.translate(0, 150); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -330, -50, 660, 92, 12), C.red, { elev: 1.2 }); fitTxt(ctx, place, 0, 20, 60, PAL.cream, 600); ctx.restore();
  ctx.restore();
}

// ---------- the cold-open table: plaster wall with a shuttered window, a wooden table; tabletop line at y = 0 ----------
function tableSet(ctx, t) {
  ctx.fillStyle = '#E9D6AE'; ctx.fillRect(-3000, -2400, 6000, 2400);
  ctx.fillStyle = 'rgba(150,110,60,0.10)'; for (let i = 0; i < 40; i++) { ell(ctx, (hash(i) - 0.5) * 3600, -200 - hash(i + 2) * 1400, 40 + hash(i + 4) * 80, 18); ctx.fill(); }
  ctx.save(); ctx.translate(820, -620); rr(ctx, -230, -260, 460, 420, 8); fillStroke(ctx, '#F4EAD2', 6);
  ctx.save(); rr(ctx, -206, -236, 412, 372, 4); ctx.clip(); SE.skyFill(ctx, '#F2CF8E', '#F9EBCB', -240, 140); S.tree(ctx, 60, 0.45); ctx.restore();
  for (const sx of [-1, 1]) { rr(ctx, sx < 0 ? -330 : 230, -260, 100, 420, 6); fillStroke(ctx, '#5C7A5A', 5); ctx.strokeStyle = 'rgba(20,40,20,0.4)'; ctx.lineWidth = 3; for (let y = -240; y < 150; y += 30) { ctx.beginPath(); ctx.moveTo(sx < 0 ? -320 : 240, y); ctx.lineTo(sx < 0 ? -240 : 320, y); ctx.stroke(); } }
  ctx.restore();
  // table: top surface band + front board
  ctx.fillStyle = '#A8784C'; ctx.fillRect(-3000, -150, 6000, 160); ctx.fillStyle = 'rgba(70,40,20,0.15)'; for (let y = -130; y < 0; y += 34) ctx.fillRect(-3000, y, 6000, 4);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-3000, -150); ctx.lineTo(3000, -150); ctx.stroke();
  ctx.fillStyle = '#7E5532'; ctx.fillRect(-3000, 10, 6000, 1400); ctx.beginPath(); ctx.moveTo(-3000, 10); ctx.lineTo(3000, 10); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,210,0.18)'; ctx.fillRect(-3000, 10, 6000, 14);
}
// a hand gripping the scissors, coming in from the upper left: pivot of the scissors at (0, 0), blades along +x; open 0..1
function handScissors(ctx, s, open, sleeve = '#7A5A3C', skin = '#D9A27E') {
  ctx.save(); ctx.scale(s, s);
  tube(ctx, [[-110, -10], [-260, -140], [-520, -330]], 74, sleeve, 5);                       // sleeve (brown tunic)
  tube(ctx, [[-120, -6], [-150, -30]], 76, shade(sleeve, -0.1), 5);                            // cuff
  S.scissors(ctx, 1, open);
  ctx.save(); ctx.translate(-82, 4); ctx.rotate(0.2);                                          // the fist around the handles
  ell(ctx, 0, 0, 52, 40); fillStroke(ctx, skin, 5);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3.5); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 12, -34 + i * 4); ctx.quadraticCurveTo(24 + i * 10, -6, 12 + i * 12, 30 - i * 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,220,0.35)'; ell(ctx, -16, -16, 18, 10, -0.5); ctx.fill();
  ctx.restore(); ctx.restore();
}

// ---------- the bounty exchange re-framed for 16:9: hunter (left) hands a tail, the official (right) pays a coin ----------
function exchangeWide(w, t, o = {}) {
  S.street(w, t, { n: 14, x0: -2800, trees: false }); S.tree(w, -1650, 1.05); S.tree(w, 1600, 1.0);
  CS.cast(w, -1150 + ((t * 60) % 300), 0, 0.95, 1, 'woman', { ...R.walk(t * 4), face: FACE('smile', [1, 0], t, 1), armN: { hand: [110, -230], grip: 'hold', item: g => S.basket(g, 0.55, 8, 3) }, armF: { hand: [90, -225], grip: 'hold' } });
  CS.cast(w, 1150, 0, 0.95, -1, 'elder', { face: FACE('neutral', [1, 0], t, 2) });
  const pay = o.pay ?? 0;   // 0..1 the coin travels from the official to the hunter
  CS.cast(w, 330, 0, 1.12, -1, 'official', { face: FACE(o.offFace || 'smile', [1, -0.1], t, 0.7), lean: 0.05, armN: { hand: [lerp(150, 230, pay), -330], grip: 'pinch', item: coinItem(t) } });
  S.bountyTable(w, 70, { sign: o.sign });
  w.save(); w.translate(130, 60); w.scale(-1, 1); S.rat(w, { s: 1.0, mood: 'shock', look: [0.6, -0.4], up: 0.25 }); w.restore();
  CS.cast(w, -330, 0, 1.12, 1, 'hunter', { face: FACE(o.huntFace || 'grin', [1, -0.2], t), armN: { hand: [150, -400], grip: 'pinch', item: tailItem(t) }, lean: 0.04 });
}
// the queue at the bounty table (wide): official right, people with baskets lined up to the left
function queueWide(w, t, o = {}) {
  S.street(w, t, { n: 16, x0: -3400 });
  CS.cast(w, 820, 0, 1.05, -1, 'official', { face: FACE(o.offFace || 'surprised', [1, 0], t), armN: { hand: [150, -330], grip: 'pinch', item: coinItem(t, 30) } });
  S.bountyTable(w, 590, { sign: 'BOUNTY' });
  for (let i = 0; i < 7; i++) { const [who, oo] = CS.CROWD[i % CS.CROWD.length], x = 230 - i * 300 + Math.sin(t * 2 + i) * 8;
    CS.cast(w, x, 0, 1.0, 1, who, { face: FACE(i % 2 ? 'smile' : 'grin', [1, 0], t, i), armN: { hand: [120, -220], grip: 'hold', item: g => S.basket(g, 0.55, 9, i) }, armF: { hand: [96, -215], grip: 'hold' } }, oo); }
}

// ---------- the police station front (plain English sign), centre x, base 0 ----------
function policeStation(ctx, x, t) {
  ctx.save(); ctx.translate(x, 0);
  rr(ctx, -620, -760, 1240, 760, 6); fillStroke(ctx, '#EFE0BE', 5);
  SE.poly(ctx, [[-680, -760], [0, -930], [680, -760]], '#A8553A', 5);
  rr(ctx, -660, -790, 1320, 40, 6); fillStroke(ctx, '#FFFDF8', 4);
  for (const cx of [-520, -260, 260, 520]) { rr(ctx, cx - 26, -740, 52, 740, 8); fillStroke(ctx, '#FBF6EA', 4); }
  for (const wx of [-390, 390]) { rr(ctx, wx - 70, -620, 140, 200, 8); fillStroke(ctx, '#BFE0FA', 4); for (const sx of [-1, 1]) { rr(ctx, wx + (sx < 0 ? -110 : 70), -620, 40, 200, 4); fillStroke(ctx, '#3E7A5A', 4); } }
  rr(ctx, -130, -420, 260, 420, 8); fillStroke(ctx, '#6E4528', 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, -420); ctx.lineTo(0, 0); ctx.stroke();
  ctx.save(); ctx.translate(0, -640); CL.cutout(ctx, () => rr(ctx, -220, -50, 440, 96, 10), '#2E3A59', { elev: 1 }); fitTxt(ctx, 'POLICE STATION', 0, 16, 46, PAL.cream, 400); ctx.restore();
  ctx.restore();
}
// a heap of rats lying still (cartoon, eyes shut, no gore) inside a thought bubble, centred; u = pop
function ratPileBubble(ctx, t, u) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 1.8); ctx.scale(k, k);
  for (const [x, y, r] of [[-250, 230, 18], [-215, 190, 26]]) { ell(ctx, x, y, r, r); fillStroke(ctx, '#FFFDF8', 4); }
  ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = 200 + (i % 2) * 22; ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.75); } ctx.closePath(); fillStroke(ctx, '#FFFDF8', 5);
  for (let i = 0; i < 7; i++) { const row = i < 4 ? 0 : 1, x = row ? -90 + (i - 4) * 90 : -150 + i * 100, y = row ? -10 : 60;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI + (hash(i) - 0.5) * 0.4); ctx.scale(0.42, 0.42); S.rat(ctx, { s: 1, tail: true, mood: 'happy' }); ctx.restore(); }
  ctx.restore();
}

// ---------- the ledger (open book seen from above), centred ~1000 x 600; n tally groups drawn ----------
function ledger(ctx, n, t) {
  ctx.save(); ctx.rotate(-0.03);
  CL.cutout(ctx, () => rr(ctx, -520, -320, 1040, 640, 14), '#5A3A24', { elev: 2 });
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 252, 0); rr(ctx, -238, -295, 476, 590, 6); fillStroke(ctx, '#FBF3DE', 4);
    ctx.strokeStyle = 'rgba(80,110,160,0.25)'; ctx.lineWidth = 2; for (let y = -230; y < 280; y += 44) { ctx.beginPath(); ctx.moveTo(-210, y); ctx.lineTo(210, y); ctx.stroke(); } ctx.restore(); }
  fitTxt(ctx, 'RAT TAILS', -252, -250, 40, INK, 400, 'center', ST.FONT.type); fitTxt(ctx, 'PAID', 252, -250, 40, INK, 400, 'center', ST.FONT.type);
  ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = px(ctx, 5); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const page = i < 30 ? -1 : 1, j = i % 30, gx = page * 252 - 190 + (j % 5) * 80, gy = -190 + Math.floor(j / 5) * 80;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(gx + k * 12, gy); ctx.lineTo(gx + k * 12 + 2, gy + 50); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(gx - 8, gy + 40); ctx.lineTo(gx + 52, gy + 8); ctx.stroke(); }
  ctx.restore();
}

// ---------- the archive room + a generic historian (no likeness: clothes + glasses only) ----------
const HISTORIAN = { skin: '#F0C3A2', hair: '#8A6A4A', hairStyle: 'short', top: '#6A7A5A', cuff: '#5A6A4C', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#4A3424', sole: '#2E2018', iris: '#3A5A7A', brow: '#6A4A2A', glasses: 1 };
function archiveBox(ctx, x, y, w, h, seed) { rr(ctx, x, y, w, h, 4); fillStroke(ctx, ['#C9A06A', '#BC9460', '#D2AE78'][seed % 3], 4); rr(ctx, x + w * 0.25, y + h * 0.3, w * 0.5, h * 0.3, 3); fillStroke(ctx, '#FBF6EA', 2.5); }
function archive(ctx, t) {
  SE.room(ctx, t, { wall: '#E4D6BA', floor: 'wood' });
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 1150, 0);
    rr(ctx, -520, -1180, 1040, 1180, 6); fillStroke(ctx, '#6E4528', 5);
    for (let r = 0; r < 4; r++) { const y = -1140 + r * 285; rr(ctx, -490, y, 980, 250, 4); ctx.fillStyle = '#3A2618'; ctx.fill(); rr(ctx, -500, y + 250, 1000, 24, 4); fillStroke(ctx, '#8A5A34', 4);
      for (let i = 0; i < 6; i++) { const h = 150 + hash(i + r * 7 + sx) * 70; archiveBox(ctx, -470 + i * 160, y + 250 - h, 140, h, i + r); } }
    ctx.restore(); }
  // a hanging lamp
  tube(ctx, [[0, -1500], [0, -1100]], 6, '#2A2A30', 2); ctx.beginPath(); ctx.moveTo(-90, -1040); ctx.lineTo(90, -1040); ctx.lineTo(40, -1110); ctx.lineTo(-40, -1110); ctx.closePath(); fillStroke(ctx, '#2E5A4A', 4);
}
// an old file folder (held), dust puff u
function fileFolder(ctx, s = 1, label2 = 'HANOI 1902') {
  ctx.save(); ctx.scale(s, s); ctx.rotate(-0.08);
  rr(ctx, -110, -150, 220, 150, 6); fillStroke(ctx, '#D9B57A', 4); rr(ctx, -110, -168, 80, 24, 6); fillStroke(ctx, '#D9B57A', 4);
  rr(ctx, -80, -120, 160, 40, 4); fillStroke(ctx, '#FBF6EA', 3); fitTxt(ctx, label2, 0, -92, 22, INK, 150, 'center', ST.FONT.type);
  ctx.restore();
}
function dust(ctx, u, x, y) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha *= (1 - u) * 0.8; for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 40 + u * 160; ell(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6 - u * 40, 30 + u * 30, 22 + u * 20); ctx.fillStyle = '#D8CDB8'; ctx.fill(); } ctx.restore(); }

// ---------- quote card (typewriter attribution), centred; u pop ----------
function quoteCard(ctx, q, who, u, o = {}) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 1.8); ctx.scale(k, k); ctx.rotate(o.rot ?? -0.02);
  const w = o.w || 1180, h = o.h || 340;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 18), '#FBF6EA', { elev: 2 });
  txt(ctx, '“', -w / 2 + 70, -h / 2 + 140, 200, C.red, 'center', F.black);
  fitTxt(ctx, q, 20, 10, 100, INK, w - 200);
  fitTxt(ctx, who, 0, h / 2 - 50, 38, '#4A4A48', w - 120, 'center', ST.FONT.type);
  ctx.restore();
}
// WANTED / PAID FOR board: rows [[left, right, u, col]], centred, row height 130
function wantBoard(ctx, rows, o = {}) {
  const w = o.w || 820;
  rows.forEach(([a, b, u, col], i) => { if (u <= 0) return; ctx.save(); ctx.translate(0, i * 150); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate(i % 2 ? 0.015 : -0.02);
    CL.cutout(ctx, () => rr(ctx, -w / 2, -60, w, 116, 14), PAL.cream, { elev: 1.4 });
    fitTxt(ctx, a, -w / 2 + 30, 20, 50, '#4A4A48', w * 0.42, 'left', F.black);
    ctx.font = `66px ${F.black}`; const bw = Math.min(ctx.measureText(b).width + 40, w * 0.55);
    ctx.save(); ctx.translate(w / 2 - bw / 2 - 20, 0); CL.cutout(ctx, () => rr(ctx, -bw / 2, -50, bw, 96, 10), col || C.yellow, { elev: 0.8 }); fitTxt(ctx, b, 0, 24, 66, col === C.red ? PAL.cream : INK, bw - 30); ctx.restore();
    ctx.restore(); });
}
// a paper tick mark (green) or cross, centred, u pop
function tick(ctx, r, u) { if (u <= 0) return; ctx.save(); const s = E.back(clamp(u), 2); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(-r * 0.3, r * 0.7); ctx.lineTo(r, -r * 0.8); ctx.lineWidth = r * 0.34; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = r * 0.24; ctx.strokeStyle = PAL.green; ctx.stroke(); ctx.restore(); }
function glowAt(ctx, x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,220,140,1)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
function heart(ctx, x, y, s, u) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.translate(x, y - u * 40); const k = s * E.back(clamp(u * 3), 2); ctx.scale(k, k); ctx.globalAlpha *= 1 - clamp((u - 0.7) / 0.3);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -30, -60, 0, -26); ctx.bezierCurveTo(30, -60, 60, -10, 0, 30); ctx.closePath(); fillStroke(ctx, C.red, 4); ctx.restore(); }
// a little light bulb idea icon, u pop
function bulb(ctx, u, t) { if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 2); ctx.scale(k, k); glowAt(ctx, 0, -10, 140, 0.5 + 0.1 * Math.sin(t * 8));
  ell(ctx, 0, -20, 52, 56); fillStroke(ctx, C.yellow, 5); rr(ctx, -26, 30, 52, 40, 6); fillStroke(ctx, '#B9BEC2', 4);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 78, -20 + Math.sin(a) * 78); ctx.lineTo(Math.cos(a) * 104, -20 + Math.sin(a) * 104); ctx.stroke(); } ctx.restore(); }

module.exports = { S, CS, FACE, coinItem, tailItem, chapterCard, tableSet, handScissors, exchangeWide, queueWide, policeStation, ratPileBubble, ledger, HISTORIAN, archive, fileFolder, dust, quoteCard, wantBoard, tick, glowAt, heart, bulb };
