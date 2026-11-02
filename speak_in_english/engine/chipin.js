// "Chip in £50 for Chloe" episode renderer (hard_cut camera): node chipin.js start end out.mp4 | --png=f1,f2
// Open-plan office: Chloe's desk on the left (she sits there all along, back to the heroine), the heroine's desk in the middle
// (monitor + phone), Priya standing over her on the right with the envelope and the greeting card. Priya's own standing desk
// with the PRIYA cake is further right and only framed in the C2 twist. Contribution counter (coin + £) bottom-left.
// Shots tagged 'ui:<view>' (office chat, help chat, card, list) replace the world with a full-screen insert. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/chipin/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast in office clothes
const HER = { ...BASE.her_lift, top: { type: 'cardigan', col: '#EF7FAA', col2: '#FFFFFF' }, bottom: { type: 'trousers', col: '#3B3550' }, shoes: { col: '#3A2A20', acc: null } };
const PRI = { ...BASE.priya, top: { type: 'blazer', col: '#2F8C82', col2: '#FFFFFF' }, bottom: { type: 'trousers', col: '#2E3A4A' }, shoes: { col: '#2B2F3A', acc: null } };
const PRI_B = { ...PRI, blush: '#E8506A', blushA: 0.95 };
const CHL = { ...BASE.chloe, top: { type: 'longsleeve', col: '#B9A2E6' }, bottom: { type: 'skirt', col: '#5E4E8A' }, shoes: { col: '#5E4E8A', acc: null } };
const CHL_B = { ...CHL, blushA: 0.95 };
const G = { her: geom(HER), organiser: geom(PRI), colleague: geom(CHL) };
const HX = -420, CX = -1100, PX = 220, CAKEX = 980, HF = 420, DESK = -400, SDESK = -900;   // seated: feet HF below the floor line (hidden by the desk)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- small drawn icons (the fonts have no emoji / no heart glyph)
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); c.closePath(); }
function brokenHeart(c, x, y, s, col = '#E0474C') { for (const sd of [-1, 1]) { c.save(); c.translate(x + sd * s * 0.12, y); c.rotate(sd * 0.12); c.translate(-x, -y); c.beginPath(); c.rect(sd < 0 ? x - s * 2 : x, y - s * 2, s * 2, s * 4); c.clip();
    heartPath(c, x, y, s); c.fillStyle = col; c.fill(); c.restore(); }
  c.strokeStyle = '#FFFDF8'; c.lineWidth = s * 0.16; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x, y - s * 0.4); c.lineTo(x - s * 0.18, y - s * 0.05); c.lineTo(x + s * 0.16, y + s * 0.25); c.lineTo(x - s * 0.05, y + s * 0.8); c.stroke(); }
function giftIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#EE5E9A'; rr(c, -40, -20, 80, 60, 8); c.fill(); c.fillStyle = '#F06FA5'; rr(c, -46, -36, 92, 22, 6); c.fill();
  c.fillStyle = '#FFD21F'; c.fillRect(-7, -36, 14, 76); c.strokeStyle = '#FFD21F'; c.lineWidth = 8; c.beginPath(); c.ellipse(-14, -46, 15, 10, 0.5, 0, TAU); c.ellipse(14, -46, 15, 10, -0.5, 0, TAU); c.stroke(); c.restore(); }
function check(c, x, y, s, col = '#2E9E4A') { c.strokeStyle = col; c.lineWidth = s * 0.28; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - s * 0.5, y); c.lineTo(x - s * 0.1, y + s * 0.4); c.lineTo(x + s * 0.6, y - s * 0.45); c.stroke(); }
function coin(c, x, y, r) { c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#B8862A'; c.lineWidth = r * 0.16; c.stroke(); fitTxt(c, '£', x, y + r * 0.06, r * 1.15, '#8A5A1A', r * 1.4); }
function herFace(c, x, y, r) { c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#3A2820'; c.beginPath(); c.arc(x, y - r * 0.1, r * 1.08, Math.PI * 1.02, Math.PI * 1.98); c.fill();
  c.fillRect(x - r * 1.08, y - r * 0.15, r * 0.32, r * 0.9); c.fillRect(x + r * 0.76, y - r * 0.15, r * 0.32, r * 0.9); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x - r * 0.33, y + r * 0.15, r * 0.11, 0, TAU); c.arc(x + r * 0.33, y + r * 0.15, r * 0.11, 0, TAU); c.fill();
  c.strokeStyle = '#D9607A'; c.lineWidth = r * 0.1; c.beginPath(); c.arc(x, y + r * 0.35, r * 0.25, 0.3, Math.PI - 0.3); c.stroke(); c.fillStyle = '#EF7FAA'; c.beginPath(); c.arc(x, y + r * 1.9, r * 0.95, Math.PI * 1.15, Math.PI * 1.85); c.fill(); }
function face(c, x, y, r, skin, hair) { c.fillStyle = skin; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = hair; c.beginPath(); c.arc(x, y - r * 0.15, r * 1.05, Math.PI * 1.05, Math.PI * 1.95); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x - r * 0.33, y + r * 0.15, r * 0.11, 0, TAU); c.arc(x + r * 0.33, y + r * 0.15, r * 0.11, 0, TAU); c.fill(); }
function sweat(c, hd, k, side = 1) { if (k <= 0) return; const x = hd.x + side * hd.hh * 0.75, y = hd.y - hd.hh * 0.55; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- props (hand-local coords: y up = negative)
const glowAt = t => (t > 0.08 && t < hev('cu') + 0.6) || (sceneAt(t).id === 'A1' && t > ev('A1', 'chat') - 0.1 && t < ev('A1', 'chat') + 1.8);
const phoneItem = t => ctx => { ctx.save(); ctx.rotate(-0.12); ctx.fillStyle = '#2B2F3A'; rr(ctx, -36, -150, 72, 132, 12); ctx.fill(); ctx.fillStyle = glowAt(t) ? '#9FE3D9' : '#5A7A9A'; rr(ctx, -30, -142, 60, 116, 8); ctx.fill();
  if (glowAt(t)) { ctx.fillStyle = '#FFFDF8'; rr(ctx, -24, -132, 48, 22, 6); ctx.fill(); } ctx.restore(); };
function cardDraw(c, s = 1, open = false) { c.save(); c.scale(s, s);
  if (open) { c.fillStyle = '#FFF4F8'; rr(c, -130, -90, 260, 170, 8); c.fill(); c.strokeStyle = '#E57C9C'; c.lineWidth = 4; c.stroke(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.moveTo(0, -90); c.lineTo(0, 80); c.stroke();
    c.fillStyle = '#EE5E9A'; c.beginPath(); c.ellipse(-60, -20, 26, 32, 0, 0, TAU); c.fill(); c.fillStyle = '#7FB0D8'; c.beginPath(); c.ellipse(-25, -35, 22, 28, 0, 0, TAU); c.fill(); c.strokeStyle = '#8A8480'; c.lineWidth = 2; c.beginPath(); c.moveTo(-60, 12); c.lineTo(-45, 60); c.moveTo(-25, -7); c.lineTo(-40, 60); c.stroke();
    c.fillStyle = 'rgba(40,40,60,.45)'; for (let k = 0; k < 4; k++) c.fillRect(20, -60 + k * 30, 90 - (k % 2) * 25, 6); c.restore(); return; }
  c.fillStyle = '#EE5E9A'; rr(c, -60, -170, 120, 160, 8); c.fill(); c.strokeStyle = '#C8508A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#FFD21F'; c.beginPath(); c.ellipse(-12, -110, 22, 28, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(18, -95, 18, 24, 0, 0, TAU); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -82); c.lineTo(0, -40); c.moveTo(18, -71); c.lineTo(4, -40); c.stroke(); c.restore(); }
function envDraw(c, s = 1, open = false) { c.save(); c.scale(s, s);
  if (open) { c.fillStyle = '#7CC08A'; c.save(); c.translate(-10, -90); c.rotate(-0.15); rr(c, -60, -40, 120, 70, 6); c.fill(); fitTxt(c, '£', 0, -4, 40, '#2E6B3A', 60); c.restore(); }
  else { c.fillStyle = '#7CC08A'; c.save(); c.translate(-20, -84); c.rotate(-0.1); rr(c, -50, -24, 100, 40, 4); c.fill(); c.restore(); }
  c.fillStyle = '#FFFDF8'; rr(c, -90, -110, 180, 115, 8); c.fill(); c.strokeStyle = '#C9C3B4'; c.lineWidth = 4; c.stroke();
  c.beginPath(); if (open) { c.moveTo(-90, -110); c.lineTo(0, -170); c.lineTo(90, -110); } else { c.moveTo(-90, -110); c.lineTo(0, -50); c.lineTo(90, -110); } c.stroke();
  fitTxt(c, 'Chloe', 10, -30, 36, '#C8508A', 150, 'Cav7'); c.restore(); }
const cardItem = ctx => { ctx.save(); ctx.translate(0, 40); ctx.rotate(0.12); cardDraw(ctx, 0.9); ctx.restore(); };
const envItem = ctx => { ctx.save(); ctx.translate(0, 50); ctx.rotate(-0.1); envDraw(ctx, 0.85); ctx.restore(); };
const openEnvItem = ctx => { ctx.save(); ctx.translate(0, 40); envDraw(ctx, 0.95, true); ctx.restore(); };
const openCardItem = ctx => { ctx.save(); ctx.translate(30, -40); cardDraw(ctx, 0.75, true); ctx.restore(); };
const clipItem = ctx => { ctx.save(); ctx.translate(0, 40); ctx.rotate(0.08); ctx.fillStyle = '#8A5A3A'; rr(ctx, -70, -190, 140, 190, 8); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -60, -176, 120, 168, 4); ctx.fill(); ctx.fillStyle = '#B8BDC6'; rr(ctx, -26, -200, 52, 26, 5); ctx.fill();
  ctx.fillStyle = 'rgba(40,40,60,.5)'; for (let k = 0; k < 6; k++) ctx.fillRect(-46, -150 + k * 24, 80, 6); ctx.restore(); };
const penItem = ctx => { ctx.save(); ctx.rotate(0.5); ctx.fillStyle = '#2F5A9E'; rr(ctx, -7, -110, 14, 110, 6); ctx.fill(); ctx.fillStyle = '#2B2F3A'; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(0, 18); ctx.fill(); ctx.restore(); };

// ---------------- the office (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3400, BW = 4800, BH = 4800, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#E8EBEF'; c.fillRect(BX0, BY0, BW, BH);
  for (const wx of [-2300, -1150, 0, 1150]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2700, 860, 1150, 14); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, wx + 24, -2676, 812, 1102, 8); c.fill();
    c.fillStyle = '#9FB8CC'; for (let i = 0; i < 5; i++) { const bh = 280 + hash(wx + i * 7) * 420; c.fillRect(wx + 50 + i * 155, -1574 - bh, 110, bh); } c.fillStyle = '#FFFDF8'; c.fillRect(wx + 422, -2676, 16, 1102); }
  c.fillStyle = '#D9DEE6'; c.fillRect(BX0, -1450, BW, 1200); c.fillStyle = '#C9CFD8'; c.fillRect(BX0, -1450, BW, 18);
  // whiteboard + wall clock + pin board
  c.fillStyle = '#FFFFFF'; rr(c, -560, -1380, 760, 430, 14); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 10; c.stroke(); fitTxt(c, 'TEAM GOALS', -180, -1310, 54, '#2F5A9E', 680);
  c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.moveTo(-500, -1080); c.lineTo(-380, -1150); c.lineTo(-260, -1110); c.lineTo(-120, -1230); c.lineTo(80, -1190); c.stroke();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-1650, -1250, 120, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.stroke(); c.beginPath(); c.moveTo(-1650, -1250); c.lineTo(-1650, -1340); c.moveTo(-1650, -1250); c.lineTo(-1590, -1220); c.stroke();
  c.fillStyle = '#C98B5A'; rr(c, 600, -1400, 520, 380, 12); c.fill(); for (const [x, y, col] of [[650, -1360, '#FFE15A'], [800, -1340, '#9FE3D9'], [950, -1370, '#F7B6CF'], [700, -1200, '#FFFDF8'], [880, -1190, '#FFE15A']]) { c.fillStyle = col; c.fillRect(x, y, 110, 110); }
  // far plants and a water cooler
  c.fillStyle = '#C98B5A'; rr(c, -2150, -620, 220, 400, 20); c.fill(); c.fillStyle = '#4CAF6A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2120 + i * 32, -700 - (i % 2) * 80, 60, 130, (i - 2.5) * 0.25, 0, TAU); c.fill(); }
  c.fillStyle = '#B8D8F0'; rr(c, 1700, -1100, 220, 300, 30); c.fill(); c.fillStyle = '#F4F6F8'; rr(c, 1680, -800, 260, 560, 16); c.fill();
  c.fillStyle = '#AEB5BF'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -260, 6, 1700);
}
const BGK = (() => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawOffice(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; })();

// ---------------- desks, monitors, Priya's standing desk with the cake
function monitor(c, x, col) { c.fillStyle = '#5A606E'; c.fillRect(x - 16, DESK - 100, 32, 100); rr(c, x - 90, DESK - 20, 180, 20, 6); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, x - 200, DESK - 420, 400, 320, 18); c.fill(); c.fillStyle = col; rr(c, x - 184, DESK - 404, 368, 288, 10); c.fill();
  c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 5; k++) c.fillRect(x - 160, DESK - 370 + k * 50, 240 - (k % 3) * 50, 18); }
function deskFront(c, x0, x1) { paint(c, q => { q.m(x0, DESK); q.l(x1, DESK); q.l(x1, DESK + 50); q.l(x0, DESK + 50); q.z(); }, '#E7D3B6', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(x0 + 20, DESK + 50); q.l(x1 - 20, DESK + 50); q.l(x1 - 20, 900); q.l(x0 + 20, 900); q.z(); }, '#C9A880', { sd: 10, hd: 4, lw: 4 }); }
function desks(c, t, L) {
  deskFront(c, -1560, -770); deskFront(c, -750, 70);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-765, DESK + 50, 10, 850);
  // Chloe's desk: keyboard, mug, small plant, a photo frame
  c.fillStyle = '#E9ECF1'; rr(c, -1330, DESK - 26, 300, 28, 8); c.fill();
  c.fillStyle = '#FFFDF8'; rr(c, -900, DESK - 90, 64, 90, 10); c.fill(); c.strokeStyle = '#B9A2E6'; c.lineWidth = 8; c.beginPath(); c.arc(-836, DESK - 50, 20, -1.3, 1.3); c.stroke();
  c.fillStyle = '#C98B5A'; rr(c, -1520, DESK - 80, 80, 80, 10); c.fill(); c.fillStyle = '#4CAF6A'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(-1495 + i * 12, -510 - (i % 2) * 20, 18, 46, (i - 1.5) * 0.4, 0, TAU); c.fill(); }
  // her desk: keyboard, papers, mug
  c.fillStyle = '#E9ECF1'; rr(c, -640, DESK - 26, 300, 28, 8); c.fill();
  c.fillStyle = '#FFFDF8'; rr(c, -160, DESK - 22, 170, 22, 4); c.fill(); c.fillStyle = '#F1EDE2'; rr(c, -150, DESK - 40, 160, 20, 4); c.fill();
  c.fillStyle = '#EF7FAA'; rr(c, -260, DESK - 86, 60, 86, 10); c.fill();
  if (L === 'C1' && t > ev('C1', 'sign') - 0.05) { c.save(); c.translate(-120, DESK - 4); cardDraw(c, 0.8, true); c.restore(); }
  if (idx(L) > idx('C1')) { c.save(); c.translate(-120, DESK - 4); c.rotate(0.05); cardDraw(c, 0.6, false); c.restore(); } }
function cake(c, x, y, t, lit) { c.save(); c.translate(x, y);
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, 0, 230, 34, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9CFD8'; c.lineWidth = 5; c.stroke();
  paint(c, q => { q.m(-190, 0); q.l(190, 0); q.l(190, -150); q.l(-190, -150); q.z(); }, '#F7B6CF', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(-120, -150); q.l(120, -150); q.l(120, -250); q.l(-120, -250); q.z(); }, '#FFF4F8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#FFFDF8'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-176 + i * 44, -150, 22, 0, Math.PI); c.fill(); }
  c.fillStyle = '#EE5E9A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-100 + i * 40, -250, 16, 0, Math.PI); c.fill(); }
  fitTxt(c, 'PRIYA', 0, -72, 92, '#2F8C82', 340);
  for (let i = 0; i < 5; i++) { const cx = -80 + i * 40; c.fillStyle = ['#7FB0D8', '#FFD21F', '#EE5E9A', '#9FE3D9', '#FFD21F'][i]; rr(c, cx - 7, -330, 14, 80, 4); c.fill();
    if (lit) { const f = 1 + 0.15 * Math.sin(t * 20 + i * 2); c.fillStyle = '#FFB020'; c.beginPath(); c.ellipse(cx, -350, 10 * f, 20 * f, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF3A0'; c.beginPath(); c.ellipse(cx, -346, 5, 10, 0, 0, TAU); c.fill(); } }
  c.restore(); }
function priyaDesk(c, t, L) { const x0 = CAKEX - 260, x1 = CAKEX + 280;
  c.fillStyle = '#5A606E'; c.fillRect(x0 + 40, SDESK + 40, 26, 900 - SDESK); c.fillRect(x1 - 66, SDESK + 40, 26, 900 - SDESK);
  paint(c, q => { q.m(x0, SDESK); q.l(x1, SDESK); q.l(x1, SDESK + 45); q.l(x0, SDESK + 45); q.z(); }, '#E7D3B6', { sd: 6, hd: 3, lw: 4 });
  if (L === 'C2' || L === 'outro') { const lit = L !== 'C2' || t > ev('C2', 'cake') - 0.02; cake(c, CAKEX + 10, SDESK, t, lit);
    // little party hats + balloons tied to the desk
    for (const [bx, col, ph] of [[x0 + 30, '#EE5E9A', 0], [x1 - 20, '#7FB0D8', 1.3]]) { const by = SDESK - 620 + Math.sin(t * 2 + ph) * 12; c.strokeStyle = '#8A8480'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, SDESK); c.lineTo(bx + 10, by + 90); c.stroke(); c.fillStyle = col; c.beginPath(); c.ellipse(bx + 10, by, 70, 88, 0, 0, TAU); c.fill(); } }
  else { c.fillStyle = '#E9ECF1'; rr(c, CAKEX - 120, SDESK - 26, 260, 26, 8); c.fill(); } }

// ---------------- characters
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const onDesk = (g, side, x) => reach(g, side, x, DESK - HF - 40);   // hand on the desk top (local x)
function herPhone(st, g, t) { st.items = { R: phoneItem(t) }; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 210); st.armL = reach(g, -1, -g.sw * 0.05, g.ySh + 225); st.lookY = 0.35; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: onDesk(g, -1, -160), armR: onDesk(g, 1, 120), items: {} };
  if (L === 'hook') { herPhone(st, g, t); st.mood = 'neutral'; if (t > hev('cu') - 0.05) { st.mood = 'surprised'; st.blink = 0; } if (speaking('hook_h', t, 0.05, 0.3)) { st.mood = 'worried'; st.lookY = 0; st.turn = 0.35; st.look = 0.8; }
    if (t > hev('cover') + 0.2) { st.mood = 'worried'; st.lookY = 0.35; } }
  if (L === 'A1') { herPhone(st, g, t); st.lookY = 0; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'worried'; st.armL = open(g, -1, 1.5, 150); st.items = { R: phoneItem(t) }; }
    if (t > SP.a1_p.t + 0.2) { st.mood = 'shock'; st.blink = 0; } if (t > e('chat') - 0.1) { herPhone(st, g, t); st.mood = 'sad'; } }
  if (L === 'A2') { st.mood = 'neutral'; if (speaking('a2_h', t, 0.05, 0.3)) { st.armL = open(g, -1, 1.6, 170); st.armR = open(g, 1, 1.6, 170); st.mood = 'skeptical'; }
    if (t > SP.a2_p.t + 0.3) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('wave') - 0.05) { st.turn = -0.45; st.look = -0.9; st.mood = 'shock'; st.blink = 0; st.armL = onDesk(g, -1, -160); st.armR = chest(g, 1, 0.3); }
    if (t > SP.a2_nar.t - 0.1) { st.mood = 'worried'; st.turn = 0.1; st.look = 0.2; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 170); }
    if (t > SP.b1_p.t + 0.3) st.mood = 'happy'; if (t > e('card') - 0.05) { st.mood = 'worried'; st.items = { R: penItem }; st.armR = onDesk(g, 1, 260); } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.25); st.armR = chest(g, 1, 0.25); }
    if (t > SP.b2_p.t + 0.3) st.mood = 'skeptical'; if (t > e('list') - 0.05) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, 1, 170);
    if (t > e('sign') - 0.05) { st.mood = 'happy'; st.lookY = 0.5; st.items = { R: penItem }; st.armR = reach(g, 1, 300 + Math.sin(t * 14) * 18, DESK - HF - 30); } }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = 0.35; st.look = 0.7;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.sin(t * 2) * 30); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.turn = -0.3; st.look = -0.7; } if (t > e('stare') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.3; st.look = 0.8; }
    if (t > e('cake') - 0.05) { st.mood = 'happy'; st.laugh = true; } }
  return st; }
function priState(t, L) { const g = G.organiser, e = k => ev(L, k), st = { t, talk: talk('organiser', t), mood: 'happy', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 1.2, g.ySh + 200), armR: chest(g, 1, 0.7), items: { L: cardItem, R: envItem } };
  if (L === 'hook') { st.mood = 'happy'; st.lookY = 0.3; }
  if (L === 'A1') { if (t > SP.a1_p.t - 0.05 && t < SP.a1_p.t + 1.6) { st.mood = 'shock'; st.blink = 0; st.headFirst = true; st.items = { R: envItem }; st.armL = reach(g, -1, -g.hw * 0.55, g.headY + g.hh * 0.8, { planar: true }); }
    else if (speaking('a1_p', t, 0, 0.3)) { st.mood = 'happy'; st.items = { R: envItem }; st.armL = open(g, -1, 2.0, 130); } }
  if (L === 'A2') { st.items = { R: envItem }; if (speaking('a2_p', t, 0.05, 0.4) || (t > e('wave') && t < SP.a2_nar.t)) { st.mood = 'surprised'; st.armL = open(g, -1, 2.1, 70); } }
  if (L === 'B1') { if (speaking('b1_p', t, 0.05, 0.3)) { st.mood = 'happy'; st.items = { L: cardItem, R: envItem }; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 140); } }
  if (L === 'B2') { if (speaking('b2_p', t, 0.05, 0.2)) { const u = t - SP.b2_p.t, b = Math.sin(u * 7) * 18; st.items = {}; st.mood = u < 2.6 ? 'happy' : 'surprised'; st.lookY = u < 2.6 ? 0.25 : 0;
      st.armL = reach(g, -1, -g.sw * 1.35, g.ySh + 40 + b, { planar: true }); st.armR = reach(g, 1, g.sw * 1.35, g.ySh + 40 - b, { planar: true }); if (u > 3.2) { st.laugh = true; st.armL = open(g, -1, 1.8, 120); } }
    if (t > e('list') - 0.05) { st.items = { L: clipItem, R: penItem }; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 200); st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 180); st.lookY = 0.4; st.mood = 'happy'; } }
  if (L === 'C1') { if (speaking('c1_p', t, 0.05, 0.3)) { st.mood = 'happy'; st.blink = t > SP.c1_p.t + 1.2 ? 1 : undefined; st.items = { R: envItem }; st.armL = reach(g, -1, -g.sw * 0.35, g.ySh + 150); }
    if (t > e('sign') - 0.05) { st.items = { R: envItem }; st.armL = open(g, -1, 1.6, 130); st.lookY = 0.4; } }
  if (L === 'C2') { st.mood = 'happy'; st.items = { R: envItem }; if (t > e('open') - 0.3) st.items = {};
    if (t > e('open') - 0.3) { st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('stare') - 0.05) { st.mood = 'worried'; st.blink = 0; }
    if (speaking('c2_p', t, 0.05, 0.1)) { st.mood = 'happy'; st.blink = 1; st.armL = chest(g, -1, 0.2); st.armR = chest(g, 1, 0.2); }
    if (t > e('cake') - 0.05) { st.mood = 'happy'; st.laugh = true; st.blink = undefined; st.turn = 0.2; st.look = 0.4; st.armR = open(g, 1, 2.0, 60); st.armL = open(g, -1, 1.5, 120); } }
  return st; }
function chlState(t, L) { const g = G.colleague, e = k => ev(L, k), u = t * 16, kx = -230, st = { t, talk: talk('colleague', t), mood: 'happy', turn: -0.35, look: -0.8, items: {},
    armL: reach(g, -1, kx - 80 + Math.sin(u) * 14, DESK - HF - 40 - Math.max(0, Math.sin(u)) * 26), armR: reach(g, 1, kx + 80 + Math.sin(u + 2) * 14, DESK - HF - 40 - Math.max(0, Math.sin(u + 2)) * 26) };
  const watching = idx(L) > idx('A2') || (L === 'A2' && t > e('wave') - 0.05);
  if (watching) { st.turn = 0.3; st.look = 0.75; st.armL = onDesk(g, -1, -150); st.armR = onDesk(g, 1, 90); }
  if (L === 'A2' && t > e('wave') - 0.05 && t < SP.a2_nar.t + 0.4) { const w = Math.sin((t - e('wave')) * 11); st.mood = 'happy'; st.laugh = true; st.turn = 0.4; st.look = 0.9; st.armR = reach(g, 1, g.sw * 1.7 + w * 50, g.ySh - 300 - Math.abs(w) * 20, { planar: true }); }
  if (L === 'B2' && t > e('list')) st.mood = 'surprised';
  if (L === 'C2') { st.mood = 'neutral';
    if (t > e('open') - 0.05) { st.mood = 'worried'; st.lookY = 0.3; st.items = { L: openEnvItem, R: openCardItem }; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 200); st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 170); }
    if (speaking('c2_c', t, 0.05, 0.2)) { st.lookY = 0; st.mood = 'worried'; }
    if (t > e('stare') - 0.05) { st.mood = 'worried'; st.blink = 0; st.lookY = 0; }
    if (t > e('cake') - 0.05) { st.mood = 'happy'; st.laugh = true; st.blink = undefined; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'organiser', 'colleague'], cover: ['her', 'organiser', 'colleague'], card: ['her', 'organiser'], two: ['her', 'organiser'], her: ['her'], organiser: ['organiser'], colleague: ['colleague'], herc: ['her', 'colleague'], cake: ['organiser'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  priyaDesk(c, t, L);
  if (who.includes('organiser')) { const blush = (L === 'C2' && t > SP.c2_p.t - 0.1) ; heads.organiser = K.put(c, blush ? PRI_B : PRI, priState(t, L), PX, 0); }
  monitor(c, -1330, '#7FB0D8'); monitor(c, -620, '#9FE3D9');
  if (who.includes('colleague')) heads.colleague = K.put(c, L === 'C2' && t > ev('C2', 'open') ? CHL_B : CHL, chlState(t, L), CX, HF);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, HF);
  desks(c, t, L);
  if (L === 'C2' && t > ev('C2', 'stare') - 0.05 && t < ev('C2', 'cake') && heads.organiser) sweat(c, heads.organiser, clamp((t - ev('C2', 'stare')) / 0.3), 1);
  if (L === 'C2' && t > ev('C2', 'open') && t < ev('C2', 'cake') && heads.colleague) sweat(c, heads.colleague, clamp((t - ev('C2', 'open') - 0.6) / 0.3), -1);
  K.mark(c, 'envelope', PX + 120, -1000, 120);
  if (!heads.organiser) heads.organiser = OFF; if (!heads.colleague) heads.colleague = OFFL; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- full-screen inserts on a solid backdrop
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function msgBubble(c, x, y, w, h, who, col, lines, k) { if (k <= 0) return; c.save(); c.translate(x, y + h / 2); c.scale(k, k); c.translate(-x, -(y + h / 2));
  face(c, x - 26, y + 22, 18, who === 'Priya' ? '#B07A56' : who === 'Tom' ? '#F2C9A8' : '#E8B896', who === 'Priya' ? '#1A1210' : who === 'Tom' ? '#8A5A3A' : '#2A1E16');
  c.fillStyle = '#FFFFFF'; rr(c, x, y, w, h, 16); c.fill(); fitTxt(c, who, x + 14, y + 20, 18, col, w - 28, 'Nun9', 'left');
  lines.forEach((s, i) => fitTxt(c, s, x + 14, y + 52 + i * 33, 27, '#2B2F3A', w - 28, 'Nun9', 'left')); c.restore(); }
function chatScreen(c, w, h, mode, t, t0) { const a = k => eBack(P(t, t0 + k, t0 + k + 0.25), 1.8);
  c.fillStyle = '#ECE5DD'; c.fillRect(0, 0, w, h);
  const help = mode === 'help'; c.fillStyle = help ? '#C23C4A' : '#2F8C82'; c.fillRect(0, 0, w, 96);
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(52, 58, 26, 0, TAU); c.fill(); if (help) brokenHeart(c, 52, 58, 14); else giftIcon(c, 52, 64, 0.32);
  fitTxt(c, help ? 'Help for our colleague' : 'Office Team', 90, 48, 24, '#FFFFFF', w - 110, 'Nun9', 'left'); fitTxt(c, help ? '13 members' : '14 members', 90, 76, 16, 'rgba(255,255,255,.8)', w - 110, 'Nun8', 'left');
  if (!help) {
    msgBubble(c, 50, 120, 340, 150, 'Priya', '#2F8C82', ['Hi all! £50 each', "for Chloe's birthday", 'gift'], a(0)); if (a(0) > 0) { c.save(); c.globalAlpha = clamp(a(0)); giftIcon(c, 150, 240, 0.42); c.restore(); }
    msgBubble(c, 50, 290, 220, 80, 'Tom', '#C23C4A', ['Done!'], a(1.3)); msgBubble(c, 50, 390, 260, 80, 'Ben', '#2F5A9E', ['Sent £50'], a(2.0));
    msgBubble(c, 50, 490, 300, 80, 'Lucy', '#8E5BD6', ['Love her!'], a(2.6)); }
  else {
    c.fillStyle = 'rgba(0,0,0,.12)'; rr(c, 80, 112, w - 160, 34, 17); c.fill(); fitTxt(c, 'Priya created this group', w / 2, 130, 17, '#5A606E', w - 180, 'Nun8');
    msgBubble(c, 50, 166, 340, 210, 'Priya', '#2F8C82', ['Our colleague has', 'NO MONEY.', "Let's help her!"], a(0)); if (a(0) > 0) { c.save(); c.globalAlpha = clamp(a(0)); brokenHeart(c, 300, 330, 34); c.restore(); }
    msgBubble(c, 50, 396, 240, 80, 'Tom', '#C23C4A', ['Oh no!'], a(0.5)); msgBubble(c, 50, 496, 280, 80, 'Ben', '#2F5A9E', ['Sent £5'], a(0.95)); }
  c.fillStyle = '#FFFFFF'; c.fillRect(0, h - 64, w, 64); c.fillStyle = '#ECE5DD'; rr(c, 16, h - 52, w - 90, 40, 20); c.fill(); c.fillStyle = help ? '#C23C4A' : '#2F8C82'; c.beginPath(); c.arc(w - 38, h - 32, 22, 0, TAU); c.fill(); }
function chatView(c, t, mode) { backdrop(c, 'chat'); const t0 = mode === 'help' ? ev('A1', 'chat') : (t < hev('cover') ? 0.05 : hev('cover') + 0.6);
  const k = mode === 'help' ? eBack(P(t, ev('A1', 'chat'), ev('A1', 'chat') + 0.22), 1.5) : 1; c.save(); c.translate(540, 880); c.scale(k, k); K.phone(c, 0, 0, 1.55, (cc, w, h) => chatScreen(cc, w, h, mode, t, t0)); c.restore(); }
function cardView(c, t) { backdrop(c, 'card'); const a = ev('B1', 'card'), k = eBack(P(t, a, a + 0.3), 1.6); c.save(); c.translate(540, 860); c.rotate(-0.03); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -470 + 12, -360 + 16, 940, 720, 20); c.fill();
  c.fillStyle = '#FFF4F8'; rr(c, -470, -360, 470, 720, 16); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, 0, -360, 470, 720, 16); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -350); c.lineTo(0, 350); c.stroke();
  fitTxt(c, 'HAPPY', -235, -250, 70, '#EE5E9A', 420); fitTxt(c, 'BIRTHDAY,', -235, -170, 62, '#EE5E9A', 420); fitTxt(c, 'CHLOE!', -235, -90, 70, '#2F8C82', 420);
  for (const [x, y, col] of [[-330, 90, '#EE5E9A'], [-235, 40, '#FFD21F'], [-140, 100, '#7FB0D8']]) { c.strokeStyle = '#8A8480'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 70); c.lineTo(x + 10, 300); c.stroke(); c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 54, 68, 0, 0, TAU); c.fill(); }
  fitTxt(c, 'Have a great day! - Tom', 30, -300, 40, '#2F5A9E', 420, 'Cav7', 'left'); fitTxt(c, 'Best wishes! - Ben', 30, -230, 40, '#C23C4A', 420, 'Cav7', 'left'); fitTxt(c, 'Love, Lucy', 30, -160, 40, '#8E5BD6', 420, 'Cav7', 'left');
  const pulse = 0.5 + 0.5 * Math.sin(t * 6); c.fillStyle = `rgba(255,225,90,${0.55 + 0.3 * pulse})`; rr(c, 14, -60, 444, 210, 14); c.fill();
  fitTxt(c, 'Gave less', 236, -18, 54, '#2B2F3A', 400, 'Unb9'); fitTxt(c, 'because:', 236, 50, 54, '#2B2F3A', 400, 'Unb9');
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.setLineDash([26, 14]); c.beginPath(); c.moveTo(50, 120); c.lineTo(430, 120); c.stroke(); c.setLineDash([]);
  // her pen hovering, nervous
  const px = 400 + Math.sin(t * 9) * 20, py = 205 + Math.cos(t * 7) * 10; c.save(); c.translate(px, py); c.rotate(0.6); c.fillStyle = '#2F5A9E'; rr(c, -14, -230, 28, 230, 12); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(0, 34); c.fill(); c.restore();
  c.restore(); }
function listView(c, t) { backdrop(c, 'list'); const a = ev('B2', 'list'), k = eBack(P(t, a, a + 0.3), 1.6); c.save(); c.translate(540, 950); c.rotate(0.03); c.scale(k * 0.95, k * 0.95);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -400 + 12, -540 + 16, 800, 1080, 24); c.fill(); c.fillStyle = '#8A5A3A'; rr(c, -400, -540, 800, 1080, 24); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -370, -500, 740, 1010, 10); c.fill();
  c.fillStyle = '#B8BDC6'; rr(c, -120, -575, 240, 80, 14); c.fill();
  fitTxt(c, "CHLOE'S GIFT", 0, -430, 64, '#2F8C82', 660); fitTxt(c, '£50 EACH', 0, -360, 48, '#EE5E9A', 660);
  const rows = [['Tom', '#F2C9A8', '#8A5A3A'], ['Ben', '#E8B896', '#2A1E16'], ['Lucy', '#F4D0B8', '#C9A13A'], ['Priya', '#B07A56', '#1A1210']];
  rows.forEach(([n, sk, hr], i) => { const y = -260 + i * 118; c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-330, y + 52, 660, 3); face(c, -270, y, 36, sk, hr); fitTxt(c, n, -210, y + 4, 52, '#2B2F3A', 260, 'Cav7', 'left'); fitTxt(c, '£50', 170, y + 4, 52, '#2B2F3A', 160, 'Cav7', 'left'); check(c, 300, y, 44); });
  // her face, written in twice (the pen is still moving)
  for (let j = 0; j < 2; j++) { const w0 = a + 0.3 + j * 0.6, kk = clamp((t - w0) / 0.45); if (kk <= 0) continue; const y = -260 + (4 + j) * 118;
    c.save(); c.beginPath(); c.rect(-340, y - 60, 680 * kk, 120); c.clip(); herFace(c, -270, y, 36); fitTxt(c, '£50', 170, y + 4, 52, '#2F5A9E', 160, 'Cav7', 'left'); c.restore(); }
  const ck = eBack(P(t, a + 1.45, a + 1.75), 2); if (ck > 0) { const y = -260 + 4.5 * 118; c.save(); c.translate(-40, y); c.scale(ck, ck); c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 0, 300, 125, -0.03, 0, TAU); c.stroke(); c.restore();
    c.save(); c.translate(320, y + 10); c.rotate(-0.15); c.scale(ck, ck); fitTxt(c, 'x2', 0, 0, 96, '#E0474C', 200, 'Unb9'); c.restore(); }
  const pk = clamp((t - a - 0.3) / 1.2); if (pk > 0 && pk < 1) { const j = pk < 0.5 ? 0 : 1, y = -260 + (4 + j) * 118, x = -300 + ((pk * 2) % 1) * 560; c.save(); c.translate(x, y + 10 + Math.sin(t * 30) * 8); c.rotate(0.6); c.fillStyle = '#2F5A9E'; rr(c, -12, -200, 24, 200, 10); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.lineTo(0, 30); c.fill(); c.restore(); }
  c.restore(); }
function insert(c, t, view) { if (view === 'office' || view === 'help') return chatView(c, t, view); if (view === 'card') return cardView(c, t); if (view === 'list') return listView(c, t); }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + HF, pHY = G.organiser.headY, cHY = G.colleague.headY + HF;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-420, -1060, 0.56, 'cover'), WIDE: S(-450, -1000, 0.5, 'wide'), CARD: S(-100, fy(pHY, 0.57, 905), 0.57, 'card'), TWO: S(-100, fy(pHY, 0.7, 860), 0.7, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 40, fy(hHY, 1.25, 1150), 1.25, 'her'), HERC: S(-760, fy(hHY, 0.9, 1000), 0.9, 'herc'), HERC_H: S(-730, fy(hHY, 0.95, 1020), 0.95, 'herc'),
  PRI: S(PX - 20, fy(pHY, 1.0), 1.0, 'organiser'), PRI_CU: S(PX - 20, fy(pHY, 1.5, 960), 1.5, 'organiser'),
  CHL: S(CX + 30, fy(cHY, 1.0), 1.0, 'colleague'), CHL_CU: S(CX + 30, fy(cHY, 1.3, 940), 1.3, 'colleague'), CHL_H: S(CX + 30, fy(cHY, 1.1, 1000), 1.1, 'colleague'),
  CAKE: S(600, fy(pHY, 0.75, 1050), 0.75, 'cake'),
  OFFICE: U('office', 1), HELP: U('help', 2), CARDV: U('card', 3), LIST: U('list', 4) };
const C2Z = [1.0, 1.15, 1.3, 1.45].map(z => S(HX + 40, fy(hHY, z, 940), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('phone')) return SH.COVER; if (t < hev('cu')) return f(SH.OFFICE); if (t < hev('cover')) return f(SH.HERC_H);
    const h = t - hev('cover'); if (h < 1.0) return f(SH.COVER); if (h < 3.4) return f(SH.OFFICE); if (h < 5.3) return f(SH.CHL_H); if (h < 7.0) return f(SH.COVER); if (h < 8.4) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('cake') - 0.05) return f(SH.CAKE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('chat') - 0.05) return f(SH.HELP);
  if (L === 'A2' && t > e('wave') - 0.05) return f(SH.HERC);
  if (L === 'B1' && t > e('card') - 0.05) return f(SH.CARDV);
  if (L === 'B2' && t > e('list') - 0.05) return f(SH.LIST);
  if (L === 'C1' && t > e('sign') - 0.05) return f(SH.TWO);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0), chars = ch.map(([en]) => en.length), ctot = chars.reduce((a, b) => a + b, 0); let wi = 0, ci = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * ci / ctot; if (t >= a - 0.05) i = k; wi += cnt[k]; ci += chars[k]; }); return f(C2Z[i] || SH.HER); }
    if (t >= e('open') - 0.05 && t < e('stare') - 0.05) return f(SH.CHL_CU);
    if (t >= e('stare') - 0.05 && t < SP.c2_p.t - 0.1) return f(SH.WIDE);
    if (t >= SP.c2_p.t - 0.1) return f(SH.PRI_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'colleague' ? SH.CHL : SH.PRI;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon (big pink line), cover badge, contribution counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 70, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -280 + 6, -60 + 10, 560, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -280, -60, 560, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -280, -60, 560, 120, 60); c.stroke();
  fitTxt(c, '£50 EACH?!', 0, 4, 60, '#E0474C', 500); c.restore(); }
// her contribution: £50 -> £20 (B1, gave less) -> £100 (B2, counted twice) -> £0 (C1, over budget)
const STEPS = () => [[-1, 50], [ev('B1', 'card') + 0.6, 20], [ev('B2', 'list') + 1.45, 100], [ev('C1', 'sign') + 0.3, 0]];
function counter(c, t, sc) { return; /* owner: no corner counter/icons in the video */ const L = sc.id; if (L === 'outro' || L === 'hook') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (u < 1.2 || (nar && t > nar.t - 0.2)) return; if (L === 'C2') return;
  let n = 50, ch = -1; for (const [a, v] of STEPS()) if (t >= a) { n = v; ch = a; }
  const bubble = TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.35);
  const since = t - ch, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, label = since > 0.1 && since < 2.1 && !bubble;
  const k = eBack(P(u, 1.2, 1.5), 1.6) * bump; const w = label ? 330 : 210, h = label ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 88 : 42; coin(c, 44, iy, 26); UI.font(c, 'Unb9', 46); c.fillStyle = n === 0 ? C.green : n > 50 ? '#C23C4A' : C.oliveD; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('£' + n, 84, iy + 2);
  if (label) { UI.textFit(c, 'Unb9', 30, 'ТВОЙ ВЗНОС', w - 40); c.fillStyle = C.pink; c.fillText('ТВОЙ ВЗНОС', 22, 34); }
  c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No money! Sorry!'], ['B1', 'Could I give a bit less?'], ['B2', 'Count me out this time.'], ['C1', "It's a bit over my budget."]];
    K.outro(c, t, { q: ['А ТЫ СКИДЫВАЕШЬСЯ', 'НА ПОДАРКИ КОЛЛЕГАМ?'], rows, cta: ['ОТПРАВЬ КОЛЛЕГЕ, КОТОРАЯ', 'СОБИРАЕТ ДЕНЬГИ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.organiser; K.put(cc, PRI, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: chest(gd, 1, 0.7), items: { R: envItem } }, 640, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    // A1 phrase greyed out and struck through
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { insert(c, t, tag.slice(3)); heads = {}; proj = p => ({ x: -1e5, y: 0 }); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { organiser: ['PRIYA', '#2F8C82'], colleague: ['CHLOE', '#8E5BD6'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_h.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    if (!tag.startsWith('ui:')) K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_h: 0.15 } }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.02, a1_p: 0.02, a2_h: 0.02, a2_p: 0.02, b1_h: 0.02, b1_p: 0.02, b2_h: 0.02, b2_p: 0.02, c1_h: 0.02, c1_p: 0.3, c2_h: 0.02, c2_c: 0.02, c2_p: 0.02 } });
  counter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('chipin', NF, renderFrame);
