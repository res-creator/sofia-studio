// Episode 15 "The Pepsi Fighter Jet" sets, props and cast (on hirkit): the 1996-style ad (a school with a Harrier hovering over it),
// John Leonard (generic figure, no likeness), his den, the catalog page and its rules, Pepsi Points, the check, the order form,
// the mailbox, the Pepsi mailroom, the courtroom, the courthouse. Generic places and no logos: brand names appear as plain text only.
// World space: floor at y = 0, up is negative. Helpers (layer, txt, fitTxt, sheet) come from the episode-13 call kit (read-only use).
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const CK = require('../subscription_ep13/callkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;
const { W, H, layer, txt, fitTxt, sheet } = CK;

const NAVY = '#2E3A59', CREAM = '#FFFDF8', PBLUE = '#2C5DB8';

// ---------- cast (generic figures) ----------
const JOHN = { skin: '#E8B48F', hair: '#4A2E1C', hairStyle: 'short', top: '#C9873A', cuff: '#B07430', shirt: CREAM, pants: NAVY, shoes: '#5A3A28', iris: '#3A2414', brow: '#2A1A10' };
const KID1 = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'short', top: C.red, cuff: '#C93440', pants: '#3A3F48', shoes: '#F7F5F0', sole: '#C9C1B1', iris: '#2A1A10', brow: '#1E1612' };
const KID2 = { skin: '#F0C3A2', hair: '#8A3B24', hairStyle: 'long', top: '#3E9E8A', cuff: '#2F8574', shirt: CREAM, pants: '#4A5A8A', shoes: '#3A2A22', iris: '#4E6B3C', lashes: 1, lips: '#B0504A', brow: '#6A2A18' };
const INV1 = { skin: '#D9A27E', hair: '#B8B8BE', hairStyle: 'short', top: '#4A5060', cuff: '#3E4452', shirt: CREAM, pants: '#3A3F48', shoes: '#171717', iris: '#3A2414', brow: '#8A8A90' };
const INV2 = { skin: '#C88A64', hair: '#1E1612', hairStyle: 'bun', top: '#7A2E3A', cuff: '#662632', shirt: CREAM, pants: '#3A3F48', shoes: '#171717', iris: '#3A2414', lashes: 1, lips: '#7A3434' };
const CLERKP = { skin: '#F0C3A2', hair: '#2A1E16', hairStyle: 'short', top: '#BFD4F2', cuff: '#A9C2E4', shirt: CREAM, pants: '#4A4F57', shoes: '#171717', iris: '#4E6B3C', brow: '#2A1A10' };
const JUDGE = { skin: '#C88A64', hair: '#C9C9CF', hairStyle: 'short', top: '#1E1E24', cuff: '#15151A', shirt: CREAM, pants: '#1E1E24', shoes: '#171717', iris: '#3A2414', brow: '#9A9AA0' };

// ---------- small helpers ----------
const path = (ctx, fn, fill, lw = 5) => { ctx.beginPath(); fn(ctx); ctx.closePath(); fillStroke(ctx, fill, lw); };
const poly = (ctx, pts, fill, lw = 5) => path(ctx, c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }, fill, lw);
function cloud(ctx, x, y, s, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#FFFFFF';
  for (const [dx, dy, r] of [[-90, 10, 60], [-30, -20, 80], [40, -10, 70], [100, 14, 54], [0, 24, 90]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); } ctx.restore(); }
function skyFill(ctx, c0, c1, y0 = -3200, y1 = 0) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(-4000, y0, 8000, y1 - y0 + 2); }
function flag(ctx, x, y, w, h, t, o = {}) { // US-style flag on a pole at (x, y) (top of pole), waving; o.hang 0..1 droops it
  ctx.save(); ctx.translate(x, y); const n = 14;
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, wv = a => Math.sin(a * 5 - t * 6) * 10 * a * (1 - (o.hang || 0)) + (o.hang || 0) * a * h * 0.6;
    ctx.beginPath(); ctx.moveTo(u0 * w, wv(u0)); ctx.lineTo(u1 * w + 1, wv(u1)); ctx.lineTo(u1 * w + 1, wv(u1) + h); ctx.lineTo(u0 * w, wv(u0) + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h); for (let s = 0; s < 7; s++) { g.addColorStop(s / 7, s % 2 ? '#FFFDF8' : '#D33A46'); g.addColorStop((s + 1) / 7 - 0.001, s % 2 ? '#FFFDF8' : '#D33A46'); }
    ctx.fillStyle = g; ctx.translate(0, 0); ctx.fill(); if (u0 < 0.42) { ctx.fillStyle = '#2E3A8A'; ctx.beginPath(); ctx.moveTo(u0 * w, wv(u0)); ctx.lineTo(Math.min(u1, 0.42) * w + 1, wv(u1)); ctx.lineTo(Math.min(u1, 0.42) * w + 1, wv(u1) + h * 0.55); ctx.lineTo(u0 * w, wv(u0) + h * 0.55); ctx.closePath(); ctx.fill(); } }
  ctx.restore(); ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y + (o.pole || 700)); ctx.stroke(); ctx.restore();
}

// ---------- the Harrier (paper cutout, side view facing right; ~1100 wide at s = 1). o: { noz 0..1 (0 back, 1 down), flame 0..1, plate: 'text' } ----------
function harrier(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const body = '#8E9AAE', dk = '#5E6A7E', lt = '#B9C3D3', t = o.t || 0;
  const nozzle = (px0, py0) => { ctx.save(); ctx.translate(px0, py0); ctx.rotate(-(o.noz || 0) * Math.PI / 2);
    if ((o.flame || 0) > 0.02) { const L = 150 * o.flame * (0.85 + 0.15 * Math.sin(t * 40 + px0)), g = ctx.createLinearGradient(-60, 0, -60 - L, 0); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(255,214,120,0.9)'); g.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-58, -22); ctx.lineTo(-60 - L, 0); ctx.lineTo(-58, 22); ctx.closePath(); ctx.fill(); }
    rr(ctx, -62, -24, 100, 48, 14); fillStroke(ctx, dk); ctx.restore(); };
  // tail fin + stabiliser (behind the body)
  poly(ctx, [[-360, -90], [-500, -330], [-410, -334], [-230, -110]], lt);
  poly(ctx, [[-480, -60], [-560, -30], [-420, -20], [-340, -50]], lt, 4);
  nozzle(-215, 52); nozzle(25, 62);
  // far wing sliver
  poly(ctx, [[120, 0], [-100, 6], [-250, 96], [-170, 104]], shade(lt, -0.2), 4);
  // fuselage
  path(ctx, c => { c.moveTo(560, -20); c.bezierCurveTo(480, -52, 380, -72, 300, -80); c.lineTo(-60, -102); c.bezierCurveTo(-200, -102, -330, -98, -440, -88); c.lineTo(-480, -34); c.bezierCurveTo(-330, 8, -200, 40, -80, 64); c.bezierCurveTo(60, 76, 200, 62, 300, 36); c.bezierCurveTo(400, 12, 490, -6, 560, -20); }, body);
  ctx.save(); ctx.beginPath(); ctx.moveTo(560, -20); ctx.bezierCurveTo(480, -52, 380, -72, 300, -80); ctx.lineTo(-60, -102); ctx.lineTo(-440, -88); ctx.lineTo(-480, -34); ctx.bezierCurveTo(-330, 8, -200, 40, -80, 64); ctx.bezierCurveTo(60, 76, 200, 62, 300, 36); ctx.bezierCurveTo(400, 12, 490, -6, 560, -20); ctx.clip();
  const g = ctx.createLinearGradient(0, -100, 0, 70); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(20,20,40,0.3)'); ctx.fillStyle = g; ctx.fillRect(-600, -120, 1200, 220);
  ctx.fillStyle = C.yellow; ctx.fillRect(-470, -70, 60, 10); ctx.fillStyle = C.red; ctx.fillRect(-470, -56, 60, 10); ctx.restore();
  // canopy + intake
  path(ctx, c => { c.moveTo(335, -74); c.bezierCurveTo(310, -160, 200, -170, 120, -100); c.lineTo(160, -90); }, '#BFE3FF');
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.moveTo(300, -100); ctx.quadraticCurveTo(260, -140, 220, -128); ctx.lineTo(250, -100); ctx.closePath(); ctx.fill(); ctx.restore();
  rr(ctx, 60, -66, 120, 90, 34); fillStroke(ctx, dk);
  // near wing
  poly(ctx, [[160, 8], [-110, 12], [-300, 112], [-190, 118]], lt);
  // pylon missiles-free belly line, pitot
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(560, -20); ctx.lineTo(640, -22); ctx.stroke();
  if (o.plate) { ctx.save(); ctx.translate(-120, -22); CL.cutout(ctx, () => rr(ctx, -250, -28, 500, 56, 8), CREAM, { elev: 0.4, tex: 0 }); fitTxt(ctx, o.plate, 0, 14, 40, C.red, 470); ctx.restore(); }
  ctx.restore();
}

// ---------- the school (the ad): brick building, flag, bus, lawn. o: { wind 0..1 } ----------
function school(ctx, t, o = {}) {
  skyFill(ctx, '#7FB6F2', '#D6ECFF'); LT.glow(ctx, 1500, -1800, 900, 'rgba(255,245,200,1)', 0.35);
  cloud(ctx, -1400 + t * 10, -1500, 1.5, 0.95); cloud(ctx, 900 + t * 8, -1850, 1.2, 0.9); cloud(ctx, -300 + t * 6, -2100, 0.9, 0.85);
  for (const x of [-1700, -1450, 1650, 1900]) { ell(ctx, x, -330, 190, 260); fillStroke(ctx, '#58A85A', 4); R.tube(ctx, [[x, -80], [x, 0]], 36, '#7A4A2A', 4); }
  // main building
  ctx.save(); rr(ctx, -1000, -560, 2000, 560, 8); fillStroke(ctx, '#B5533C', 5); ctx.clip(); ctx.strokeStyle = 'rgba(80,20,10,0.22)'; ctx.lineWidth = 3;
  for (let y = -540; y < 0; y += 28) { ctx.beginPath(); ctx.moveTo(-1000, y); ctx.lineTo(1000, y); ctx.stroke(); } ctx.restore();
  ctx.fillStyle = '#8E3B2A'; ctx.fillRect(-1010, -590, 2020, 40); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-1010, -590, 2020, 40);
  for (const x of [-800, -560, -320, 320, 560, 800]) for (const y of [-440, -240]) { rr(ctx, x - 70, y - 60, 140, 120, 8); fillStroke(ctx, '#E8F4FF', 5); ctx.fillStyle = 'rgba(120,170,220,0.5)'; ctx.fillRect(x - 62, y - 52, 124, 104);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x, y + 60); ctx.moveTo(x - 70, y); ctx.lineTo(x + 70, y); ctx.stroke(); }
  // entrance block
  rr(ctx, -230, -720, 460, 720, 8); fillStroke(ctx, '#D9C4A0', 5); poly(ctx, [[-260, -720], [0, -860], [260, -720]], '#C9B28A');
  for (const x of [-170, -60, 60, 170]) { rr(ctx, x - 22, -640, 44, 640, 6); fillStroke(ctx, CREAM, 4); }
  rr(ctx, -120, -330, 240, 330, 8); fillStroke(ctx, '#3A5A8A', 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(0, 0); ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, -200, -790, 400, 66, 8), '#171717', { elev: 0.5, tex: 0 }); txt(ctx, 'HIGH SCHOOL', 0, -742, 44, C.yellow);
  // lawn, walk, bus, flag
  ctx.fillStyle = '#7BC96F'; ctx.fillRect(-4000, 0, 8000, 700); ctx.fillStyle = '#D9D4C8'; ctx.fillRect(-4000, 0, 8000, 70); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-4000, 0); ctx.lineTo(4000, 0); ctx.stroke();
  ctx.fillStyle = '#6BB75F'; for (let x = -3000; x < 3000; x += 160) ctx.fillRect(x, 120 + hash(x) * 300, 60, 8);
  ctx.save(); ctx.translate(-1450, 0); rr(ctx, -250, -230, 500, 230, 24); fillStroke(ctx, '#FFC857', 5); for (let i = 0; i < 5; i++) { rr(ctx, -220 + i * 86, -190, 66, 70, 8); fillStroke(ctx, '#BFE3FF', 4); }
  for (const x of [-140, 140]) { ell(ctx, x, 0, 44, 44); fillStroke(ctx, '#2A2A30', 5); } ctx.restore();
  flag(ctx, 640, -1180, 280, 170, t, { hang: o.wind ? 0 : 0.35, pole: 1180 });
}

// ---------- TV (front), screen content drawn by fn(ctx, w, h) in a clipped local box ----------
function tv(ctx, w, h, fn, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -w / 2 - 40, -h / 2 - 40, w + 80, h + 80, 40), '#3A3F48', { elev: 2, tex: 0.1 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.clip(); ctx.translate(-w / 2, -h / 2); fn(ctx, w, h); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#000'; for (let y = -h / 2; y < h / 2; y += 6) ctx.fillRect(-w / 2, y, w, 2); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(-w / 2 + w * 0.5, -h / 2); ctx.lineTo(-w / 2 + w * 0.2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------- John's den (world): wall, window at dusk, shelf with cans, desk with lamp. Desk top at y = -400, centred x = 0. o: { lamp 0..1 } ----------
function can(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -34, -110, 68, 110, 12); fillStroke(ctx, PBLUE, 4); ctx.fillStyle = CREAM; ctx.fillRect(-34, -68, 68, 22); ctx.fillStyle = C.red; ctx.fillRect(-34, -46, 68, 12); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-30, -118, 60, 10); ctx.restore(); }
function den(ctx, t, o = {}) {
  ctx.fillStyle = '#D8C6A6'; ctx.fillRect(-3000, -2400, 6000, 2400); ctx.fillStyle = 'rgba(120,90,60,0.12)'; for (let x = -3000; x < 3000; x += 120) ctx.fillRect(x, -2400, 40, 2400);
  ctx.fillStyle = '#9A7650'; ctx.fillRect(-3000, -260, 6000, 260); ctx.fillStyle = '#7A5636'; ctx.fillRect(-3000, 0, 6000, 400); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.moveTo(-3000, -260); ctx.lineTo(3000, -260); ctx.stroke();
  // window
  ctx.save(); ctx.translate(-560, -900); rr(ctx, -230, -280, 460, 560, 10); fillStroke(ctx, CREAM, 6); const g = ctx.createLinearGradient(0, -260, 0, 260); g.addColorStop(0, '#3A4A8A'); g.addColorStop(1, '#F0A868'); ctx.fillStyle = g; ctx.fillRect(-210, -260, 420, 520);
  ctx.fillStyle = '#FFF4C0'; for (let i = 0; i < 7; i++) ctx.fillRect(-190 + hash(i) * 380, -240 + hash(i + 9) * 200, 5, 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(0, -280); ctx.lineTo(0, 280); ctx.moveTo(-230, 0); ctx.lineTo(230, 0); ctx.stroke(); ctx.restore();
  // shelf with cans
  ctx.save(); ctx.translate(560, -1180); rr(ctx, -300, 0, 600, 30, 6); fillStroke(ctx, '#7A4A2A', 5); for (let i = 0; i < 5; i++) can(ctx, -220 + i * 110, 0, 1); can(ctx, -110, -110, 1); can(ctx, 0, -110, 1); can(ctx, -55, -220, 1); ctx.restore();
  // desk
  rr(ctx, -520, -400, 1040, 44, 8); fillStroke(ctx, '#8A5A34', 5); ctx.fillStyle = '#6E4630'; ctx.fillRect(-500, -356, 1000, 356); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-500, -356, 1000, 356);
  ctx.beginPath(); ctx.moveTo(0, -356); ctx.lineTo(0, 0); ctx.stroke(); for (const x of [-250, 250]) { ctx.fillStyle = '#C9A24A'; ctx.fillRect(x - 24, -250, 48, 12); }
  // lamp
  ctx.save(); ctx.translate(370, -400); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, -150); ctx.lineTo(-30, -300); ctx.stroke(); ctx.strokeStyle = '#5A5F68'; ctx.lineWidth = px(ctx, 6); ctx.stroke();
  poly(ctx, [[-110, -290], [50, -330], [90, -250], [-60, -230]], C.yellow); ctx.restore();
  LT.glow(ctx, 320, -200, 700, 'rgba(255,225,150,1)', 0.38 * (o.lamp ?? 1)); LT.glow(ctx, -560, -900, 600, 'rgba(255,170,100,1)', 0.12);
}

// ---------- paper props ----------
function catalog(ctx, w, h, o = {}) { // open Pepsi Stuff catalog page (rules page): w x h centred. o.hl 0..1 highlight on the 10-cent line, o.t
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FFFDF8', { elev: 1.4 });
  ctx.fillStyle = PBLUE; ctx.fillRect(-w / 2, -h / 2, w, h * 0.13); fitTxt(ctx, 'PEPSI STUFF · THE RULES', 0, -h / 2 + h * 0.092, h * 0.07, CREAM, w * 0.9);
  const lines = 9, y0 = -h / 2 + h * 0.2, dy = (h * 0.74) / lines;
  for (let i = 0; i < lines; i++) { const y = y0 + i * dy, hot = i === 5; if (hot) continue; ctx.fillStyle = 'rgba(40,40,60,0.22)'; ctx.fillRect(-w * 0.43, y - 5, w * 0.86 * (0.55 + 0.4 * hash(i * 3 + 1)), 10); }
  const y = y0 + 5 * dy, u = clamp(o.hl ?? 0);
  if (u > 0) { ctx.fillStyle = 'rgba(255,200,87,0.95)'; rr(ctx, -w * 0.45, y - dy * 0.55, w * 0.9 * u, dy * 1.1, 8); ctx.fill(); }
  fitTxt(ctx, 'EXTRA POINTS · 10¢ EACH', 0, y + dy * 0.2, dy * 0.8, INK, w * 0.84);
}
function ptsTag(ctx, s = 1, o = {}) { // one Pepsi Point (paper tag)
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0); CL.cutout(ctx, () => rr(ctx, -64, -44, 128, 88, 12), o.col || CREAM, { elev: 0.8, tex: 0.3 });
  ctx.fillStyle = PBLUE; ctx.fillRect(-64, -44, 128, 24); ctx.save(); rr(ctx, -64, -44, 128, 88, 12); ctx.restore(); txt(ctx, 'PEPSI', 0, -25, 22, CREAM); txt(ctx, 'POINT', 0, 26, 34, PBLUE); ctx.restore();
}
function checkSlip(ctx, s = 1, o = {}) { // the check (to Pepsi, $700,008.50)
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0); CL.cutout(ctx, () => rr(ctx, -330, -150, 660, 300, 14), '#E3F1E0', { elev: o.elev ?? 1.4 });
  ctx.strokeStyle = '#3D8C6A'; ctx.lineWidth = px(ctx, 3); rr(ctx, -310, -130, 620, 260, 8); ctx.stroke();
  txt(ctx, 'CHECK', -250, -88, 40, '#2F7A58', 'left'); txt(ctx, 'PAY TO: PEPSI', -300, -20, 34, INK, 'left'); ctx.fillStyle = '#2F7A58'; ctx.fillRect(-300, -4, 340, 3);
  rr(ctx, 70, -62, 230, 70, 8); ctx.fillStyle = CREAM; ctx.fill(); ctx.stroke(); fitTxt(ctx, o.amount ?? '$700,008.50', 185, -12, 40, INK, 210);
  ctx.fillStyle = '#2F7A58'; ctx.fillRect(-300, 90, 330, 3); ctx.save(); ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = px(ctx, 4); ctx.beginPath();
  const sg = o.sign ?? 1, N = 30; ctx.moveTo(-280, 76); for (let i = 1; i <= N * sg; i++) { const u = i / N; ctx.lineTo(-280 + u * 240, 76 - Math.sin(u * 17) * 22 * (1 - u * 0.4)); } ctx.stroke(); ctx.restore();
  ctx.restore();
}
function orderForm(ctx, w, h, o = {}) { // order form with the item line; o.write 0..1 (item written in), o.ring 0..1
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FFFDF8', { elev: 1.6 });
  ctx.fillStyle = PBLUE; ctx.fillRect(-w / 2, -h / 2, w, h * 0.14); fitTxt(ctx, 'ORDER FORM', 0, -h / 2 + h * 0.1, h * 0.085, CREAM, w * 0.8);
  const y0 = -h * 0.22; txt(ctx, 'QTY', -w * 0.38, y0 - 10, h * 0.045, '#5A5450'); txt(ctx, 'ITEM', -w * 0.02, y0 - 10, h * 0.045, '#5A5450', 'left');
  for (let i = 0; i < 4; i++) { const y = y0 + i * h * 0.17; ctx.fillStyle = 'rgba(40,40,60,0.5)'; ctx.fillRect(-w * 0.44, y + 6, w * 0.88, 3); }
  const wr = clamp(o.write ?? 1); ctx.save(); ctx.beginPath(); ctx.rect(-w * 0.5, y0 - 30, w * (0.18 + 0.82 * wr), h); ctx.clip();
  txt(ctx, '1', -w * 0.38, y0 + h * 0.105, h * 0.1, '#1F3FA8'); txt(ctx, 'HARRIER JET', -w * 0.02, y0 + h * 0.105, h * 0.1, '#1F3FA8', 'left'); ctx.restore();
  const rg = clamp(o.ring ?? 0); if (rg > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 8); ctx.beginPath(); ctx.ellipse(-w * 0.02 + w * 0.26, y0 + h * 0.07, w * 0.4, h * 0.09, -0.03, -Math.PI * 0.6, -Math.PI * 0.6 + Math.PI * 2 * rg); ctx.stroke(); ctx.restore(); }
}
function adPoster(ctx, w, h, t = 0) { // the ad: Harrier on sky blue, a banner with the points
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#8EC5F5', { elev: 1.6 }); ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.clip();
  cloud(ctx, -w * 0.25, -h * 0.1, w / 700, 0.9); cloud(ctx, w * 0.3, h * 0.12, w / 900, 0.8);
  ctx.save(); ctx.translate(0, -h * 0.08); ctx.rotate(-0.08); harrier(ctx, w / 1500, { noz: 0.6, flame: 0.8, t }); ctx.restore(); ctx.restore();
  ctx.fillStyle = C.red; rr(ctx, -w * 0.5, h * 0.24, w, h * 0.2, 4); ctx.fill(); fitTxt(ctx, '7,000,000 PEPSI POINTS', 0, h * 0.24 + h * 0.135, h * 0.095, CREAM, w * 0.92);
}
function mark(ctx, text, o = {}) { // an ink stamp mark (transparent, red double border), centred; o.a alpha
  ctx.save(); ctx.rotate(o.rot ?? -0.08); ctx.globalAlpha *= (o.a ?? 1); const col = o.col || C.red, size = o.size || 80; ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(text).width + 70, h = size * 1.5;
  ctx.strokeStyle = col; ctx.lineWidth = 10; rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.stroke(); ctx.lineWidth = 3; rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); ctx.stroke();
  txt(ctx, text, 0, size * 0.34, size, col); ctx.restore();
}
function envelope(ctx, s = 1, o = {}) { // envelope: front with address lines and a stamp; o.open flap, o.label (return), o.rot
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0); CL.cutout(ctx, () => rr(ctx, -250, -160, 500, 320, 12), '#EFE3C4', { elev: o.elev ?? 1.4 });
  ctx.strokeStyle = 'rgba(120,90,50,0.55)'; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-250, -160); ctx.lineTo(0, 20); ctx.lineTo(250, -160); ctx.stroke();
  ctx.fillStyle = 'rgba(40,40,60,0.4)'; for (let i = 0; i < 3; i++) ctx.fillRect(-90, 50 + i * 28, 240 - i * 40, 8);
  rr(ctx, 160, -140, 70, 84, 6); fillStroke(ctx, C.yellow, 3.5); txt(ctx, '★', 195, -84, 40, C.red);
  if (o.label) { ctx.save(); ctx.translate(-120, -70); ctx.rotate(-0.06); mark(ctx, o.label, { size: 40, col: C.red, rot: 0 }); ctx.restore(); }
  ctx.restore();
}
function mailbox(ctx, x, y, s = 1, o = {}) { // blue street mailbox, base at (x, y); o.flap 0..1 (door open), o.flag
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); R.tube(ctx, [[0, 0], [0, -260]], 54, '#5A5F68', 5); ctx.translate(0, -260);
  path(ctx, c => { c.moveTo(-170, 0); c.lineTo(-170, -260); c.bezierCurveTo(-170, -360, 170, -360, 170, -260); c.lineTo(170, 0); }, PBLUE);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-150, -300, 40, 280);
  ctx.save(); ctx.translate(0, -120 - (o.flap || 0) * 0); rr(ctx, -120, -26, 240, 52, 10); fillStroke(ctx, '#0E2A6A', 5); ctx.fillStyle = '#05122E'; ctx.fillRect(-100, -6, 200, 12); ctx.restore();
  txt(ctx, 'U.S. MAIL', 0, -210, 38, CREAM); ctx.restore();
}

// ---------- the Pepsi mailroom (world): wall art in waves (no logo), pigeonholes, the mail desk top at y = -300 ----------
function mailroom(ctx, t, o = {}) {
  ctx.fillStyle = '#E6EAF0'; ctx.fillRect(-3000, -2400, 6000, 2400);
  ctx.save(); ctx.translate(0, -1080); for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-3000, 90); for (let x = -3000; x <= 3000; x += 40) ctx.lineTo(x, 90 + Math.sin(x / 140 + k * 1.4) * 38 - k * 80); ctx.lineTo(3000, 500); ctx.lineTo(-3000, 500); ctx.closePath(); ctx.fillStyle = [C.red, CREAM, PBLUE][k]; ctx.fill(); } ctx.restore();
  ctx.fillStyle = '#8A93A3'; ctx.fillRect(-3000, 0, 6000, 400); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.stroke();
  // pigeonholes (left)
  ctx.save(); ctx.translate(-760, -470); rr(ctx, -300, -480, 600, 480, 8); fillStroke(ctx, '#9A7650', 5);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -270 + c * 140, y = -450 + r * 150; ctx.fillStyle = '#6E4630'; ctx.fillRect(x, y, 120, 130); ctx.fillStyle = '#EFE3C4'; if (hash(r * 5 + c) > 0.35) { ctx.save(); ctx.translate(x + 60, y + 100); ctx.rotate((hash(c + r) - 0.5) * 0.4); ctx.fillRect(-45, -50, 90, 50); ctx.restore(); } }
  ctx.restore();
  // window
  ctx.save(); ctx.translate(800, -1000); rr(ctx, -240, -300, 480, 600, 10); fillStroke(ctx, CREAM, 6); skyFillBox(ctx, -220, -280, 440, 560, '#9CCBF5', '#E6F3FF'); cloud(ctx, 40, -90, 0.8, 0.9); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, 300); ctx.moveTo(-240, 0); ctx.lineTo(240, 0); ctx.stroke(); ctx.restore();
  // desk (front panel + top), tray, letter opener
  rr(ctx, -520, -300, 1040, 40, 8); fillStroke(ctx, '#C9CED6', 5); ctx.fillStyle = '#9AA6B6'; ctx.fillRect(-500, -260, 1000, 260); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-500, -260, 1000, 260);
  ctx.save(); ctx.translate(-330, -300); rr(ctx, -110, -40, 220, 40, 6); fillStroke(ctx, '#6E7888', 4); for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(-70 + i * 40, -42); ctx.rotate(-0.1 + i * 0.07); ctx.fillStyle = '#EFE3C4'; ctx.fillRect(-30, -64, 60, 70); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.strokeRect(-30, -64, 60, 70); ctx.restore(); } ctx.restore();
  LT.glow(ctx, 800, -1000, 900, 'rgba(255,255,255,1)', 0.18);
}
function skyFillBox(ctx, x, y, w, h, c0, c1) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }

// ---------- the courtroom (world): panelled wall, flags, seal, the bench at x = 0 (top y = -470), two tables (tops y = -250), rail ----------
function courtroom(ctx, t, o = {}) {
  ctx.fillStyle = '#C8B48C'; ctx.fillRect(-3000, -2600, 6000, 2600); ctx.fillStyle = '#9A6A42'; ctx.fillRect(-3000, -1000, 6000, 1000);
  ctx.strokeStyle = 'rgba(60,30,10,0.45)'; ctx.lineWidth = 5; for (let x = -3000; x < 3000; x += 240) { ctx.strokeRect(x + 20, -940, 200, 780); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-3000, -1000); ctx.lineTo(3000, -1000); ctx.stroke();
  // floor
  ctx.fillStyle = '#8C6A4A'; ctx.fillRect(-3000, 0, 6000, 700); ctx.strokeStyle = 'rgba(40,20,10,0.35)'; ctx.lineWidth = 4; for (let x = -3000; x < 3000; x += 150) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x * 1.6, 700); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.stroke();
  // flags and seal
  flag(ctx, -840, -1500, 260, 170, t, { hang: 0.55, pole: 1500 }); flag(ctx, 840 - 260, -1500, 260, 170, t + 1, { hang: 0.55, pole: 1500 });
  ctx.save(); ctx.translate(0, -1380); ell(ctx, 0, 0, 170, 170); fillStroke(ctx, '#C9A24A', 6); ell(ctx, 0, 0, 130, 130); fillStroke(ctx, '#E6C46A', 4);
  ctx.fillStyle = '#7A5A1E'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 40 : 90; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
  // dais + bench
  rr(ctx, -560, -70, 1120, 70, 6); fillStroke(ctx, '#6E4630', 5);
  o.judge?.(ctx);
  rr(ctx, -430, -470, 860, 400, 8); fillStroke(ctx, '#7A4A2A', 5); ctx.fillStyle = 'rgba(40,20,10,0.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(-380 + i * 200, -420, 160, 300);
  rr(ctx, -480, -500, 960, 44, 8); fillStroke(ctx, '#5A3320', 5);
  // tables: plaintiff left, defendant right
  for (const x of [-860, 860]) { rr(ctx, x - 300, -250, 600, 36, 6); fillStroke(ctx, '#8A5A34', 5); ctx.fillStyle = '#6E4630'; ctx.fillRect(x - 280, -214, 560, 214); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(x - 280, -214, 560, 214); }
}
function gavel(ctx, s = 1, o = {}) { ctx.save(); ctx.scale(s, s); R.tube(ctx, [[0, 0], [0, 190]], 26, '#8A5A34', 5); rr(ctx, -80, -50, 160, 90, 14); fillStroke(ctx, '#5A3320', 5); ctx.restore(); }

// ---------- the courthouse (world): steps, columns, pediment, flags; floor y = 0 ----------
function courthouse(ctx, t, o = {}) {
  skyFill(ctx, '#9CCBF5', '#F2E2C0'); LT.glow(ctx, -1300, -1900, 1000, 'rgba(255,240,190,1)', 0.35); cloud(ctx, 700 + t * 8, -2000, 1.3, 0.9); cloud(ctx, -900 + t * 6, -1700, 1, 0.85);
  ctx.fillStyle = '#D9D2C2'; ctx.fillRect(-1300, -980, 2600, 980); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-1300, -980, 2600, 980);
  poly(ctx, [[-1380, -980], [0, -1380], [1380, -980]], '#C8BFAA'); ctx.fillStyle = '#B7AE98'; ctx.beginPath(); ctx.moveTo(-1000, -1004); ctx.lineTo(0, -1290); ctx.lineTo(1000, -1004); ctx.closePath(); ctx.fill();
  for (let i = -5; i <= 5; i++) { const x = i * 220; rr(ctx, x - 48, -940, 96, 940, 10); fillStroke(ctx, '#F2EEE2', 5); ctx.fillStyle = 'rgba(40,30,10,0.14)'; ctx.fillRect(x + 12, -930, 30, 920); rr(ctx, x - 62, -980, 124, 36, 6); fillStroke(ctx, '#E4DECF', 4); }
  CL.cutout(ctx, () => rr(ctx, -420, -1180, 840, 90, 8), '#171717', { elev: 0.5, tex: 0 }); fitTxt(ctx, 'U.S. COURTHOUSE', 0, -1118, 64, C.yellow, 780);
  rr(ctx, -130, -520, 260, 520, 10); fillStroke(ctx, '#5A3A28', 5); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, -520); ctx.lineTo(0, 0); ctx.stroke();
  for (let i = 0; i < 5; i++) { const y = 20 + i * 36; rr(ctx, -1500 + i * 70, y, 3000 - i * 140, 38, 4); fillStroke(ctx, i % 2 ? '#CFC8B6' : '#DDD6C6', 4); }
  flag(ctx, -1500, -1500, 280, 170, t, { hang: 0.2, pole: 1500 }); flag(ctx, 1220, -1500, 280, 170, t + 1, { hang: 0.2, pole: 1500 });
  ctx.fillStyle = '#B9B2A2'; ctx.fillRect(-4000, 210, 8000, 800);
}

// ---------- thought bubble with a ghost jet: tail circles from (0,0) to the bubble at (dx, dy) ----------
function thought(ctx, dx, dy, w, h, inner) {
  ctx.save(); for (let i = 0; i < 3; i++) { const u = (i + 1) / 4.2; ell(ctx, dx * u * 0.7, dy * u * 0.7, 14 + i * 10, 14 + i * 10); fillStroke(ctx, '#FFFDF8', 4); }
  ctx.translate(dx, dy); CL.cutout(ctx, () => { const n = 12; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.moveTo(0, 0); ctx.ellipse(Math.cos(a) * w * 0.38, Math.sin(a) * h * 0.38, w * 0.2, h * 0.2, 0, 0, 7); } ctx.moveTo(w / 2, 0); ctx.ellipse(0, 0, w * 0.46, h * 0.44, 0, 0, 7); }, '#FFFDF8', { elev: 1.2, tex: 0.1 });
  inner?.(ctx); ctx.restore();
}

module.exports = { NAVY, CREAM, PBLUE, JOHN, KID1, KID2, INV1, INV2, CLERKP, JUDGE, harrier, school, flag, tv, den, can, catalog, ptsTag, checkSlip, orderForm, adPoster, mark, envelope, mailbox, mailroom, courtroom, gavel, courthouse, thought, cloud, skyFill, poly, path };
