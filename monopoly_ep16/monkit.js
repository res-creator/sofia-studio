// Episode 16 "The Monopoly Inside Man" sets, props and cast (on hirkit; extends the episode-15 kit copy in pepsikit.js).
// Generic figures and places, no logos: McDonald's, FBI and Monopoly appear as plain text only. World space: floor y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const CK = require('../subscription_ep13/callkit');
const P = require('./pepsikit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;
const { W, H, txt, fitTxt } = CK;
const { poly, path } = P;
const CREAM = '#FFFDF8', NAVY = '#2E3A59', GOLD = '#F4C64A';

// ---------- cast ----------
const JAC = { skin: '#E3B08C', hair: '#6A6A70', hairStyle: 'short', top: '#2F4A7A', cuff: '#263E68', shirt: CREAM, pants: '#2A2F3A', shoes: '#171717', iris: '#3A2414', brow: '#4A4A50' };
const AG1 = { skin: '#C88A64', hair: '#1E1612', hairStyle: 'short', top: '#1F2430', cuff: '#171B24', shirt: CREAM, pants: '#1F2430', shoes: '#171717', iris: '#2A1A10', brow: '#1E1612' };
const AG2 = { skin: '#F0C3A2', hair: '#8A3B24', hairStyle: 'long', top: '#1F2430', cuff: '#171B24', shirt: CREAM, pants: '#1F2430', shoes: '#171717', iris: '#4E6B3C', lashes: 1, lips: '#8A4A44', brow: '#6A2A18' };
const EXEC = { skin: '#E8B48F', hair: '#3A2618', hairStyle: 'short', top: '#4A4F60', cuff: '#3E4252', shirt: CREAM, pants: '#3A3F48', shoes: '#171717', iris: '#3A2414', brow: '#2A1A10' };
const CROWD = [P.KID1, P.KID2, P.INV1, P.INV2, P.CLERKP, EXEC, AG1, AG2, P.JOHN, JAC];

// ---------- game pieces ----------
function gamePiece(ctx, s = 1, o = {}) { // a peel-off game sticker (centred, ~300 x 190); o: { gold, curl 0..1, text }
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  CL.cutout(ctx, () => rr(ctx, -150, -95, 300, 190, 14), o.gold ? GOLD : '#FFD34D', { elev: 1.2, tex: 0.3 });
  ctx.fillStyle = C.red; ctx.fillRect(-150, -95, 300, 52); fitTxt(ctx, o.top || 'INSTANT WIN', 0, -56, 40, CREAM, 270);
  fitTxt(ctx, o.text || 'GAME PIECE', 0, 52, 60, o.gold ? '#7A4A00' : INK, 270);
  if (o.gold) { ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin((o.t || 0) * 9); LT.glow(ctx, 0, 0, 220, 'rgba(255,240,150,1)', 0.7); ctx.restore(); }
  const cu = clamp(o.curl || 0); if (cu > 0) { ctx.save(); ctx.translate(150, 95); ctx.rotate(0.2 * cu); poly(ctx, [[0, 0], [-90 * cu, 0], [0, -90 * cu]], '#F2E6B0', 4); ctx.restore(); }
  ctx.restore();
}
function pieceSheet(ctx, w, h, o = {}) { // a printed sheet of pieces, one gold; o.pulled 0..1 lifts the gold one off
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#F4F1E8', { elev: 1.4 });
  const cols = 3, rows = 4, cw = w / cols, ch = h / rows, gi = o.goldIdx ?? 4;
  for (let i = 0; i < cols * rows; i++) { const x = -w / 2 + (i % cols + 0.5) * cw, y = -h / 2 + (Math.floor(i / cols) + 0.5) * ch;
    ctx.save(); ctx.translate(x, y); if (i === gi && o.pulled > 0) { ctx.translate(0, -o.pulled * 40); ctx.rotate(0.12 * o.pulled); }
    gamePiece(ctx, Math.min(cw / 320, ch / 215), { gold: i === gi, top: 'WIN', text: i === gi ? 'WINNER' : 'TRY AGAIN', t: o.t }); ctx.restore(); }
}
function cashStack(ctx, n, o = {}) { // n bills stacked with offsets
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((hash(i * 3) - 0.5) * 24, -i * (o.dy || 16)); ctx.rotate((hash(i * 7) - 0.5) * 0.08); CL.bill(ctx, o.s || 0.8, { elev: 0.3 }); ctx.restore(); }
}

// ---------- sets ----------
function counter(ctx, t, o = {}) { // a generic burger counter: red/yellow wall, menu board, tray, register. counter top at y = -380
  ctx.fillStyle = '#E8D9A8'; ctx.fillRect(-3000, -2400, 6000, 2400); ctx.fillStyle = C.red; ctx.fillRect(-3000, -1500, 6000, 220); ctx.fillStyle = GOLD; ctx.fillRect(-3000, -1280, 6000, 30);
  ctx.save(); ctx.translate(-500, -1000); CL.cutout(ctx, () => rr(ctx, -380, -200, 760, 400, 16), '#2A2A30', { elev: 1.6, tex: 0 });
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#FFD34D'; rr(ctx, -340 + i * 240, -150, 200, 120, 12); ctx.fill(); txt(ctx, ['BURGER', 'FRIES', 'SHAKE'][i], -240 + i * 240, -70, 38, '#171717'); ctx.fillStyle = CREAM; ctx.fillRect(-340 + i * 240, 40, 200, 12); ctx.fillRect(-340 + i * 240, 80, 150, 12); } ctx.restore();
  ctx.fillStyle = '#B7B1A6'; ctx.fillRect(-3000, 0, 6000, 400); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.stroke();
  rr(ctx, -900, -380, 1800, 44, 8); fillStroke(ctx, '#7A8494', 5); ctx.fillStyle = '#5E6878'; ctx.fillRect(-880, -336, 1760, 336); ctx.strokeStyle = INK; ctx.strokeRect(-880, -336, 1760, 336);
}
function secRoom(ctx, t, o = {}) { // security / handling room: monitor wall, shelves of boxes, table with sheets (table top y = -330)
  ctx.fillStyle = '#9AA6B6'; ctx.fillRect(-3000, -2400, 6000, 2400); ctx.fillStyle = '#6E7888'; ctx.fillRect(-3000, 0, 6000, 400);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.stroke();
  // monitor wall
  ctx.save(); ctx.translate(0, -1150); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = -480 + c * 320, y = -130 + r * 260; rr(ctx, x - 140, y - 100, 280, 200, 12); fillStroke(ctx, '#20232A', 5);
    ctx.fillStyle = ['#BFD4F2', '#CFE8D2', '#F2E2B8', '#D8C6F0'][(c + r * 2) % 4]; rr(ctx, x - 124, y - 84, 248, 168, 6); ctx.fill(); if ((o.win || 0) > 0.02) { ctx.save(); ctx.globalAlpha = o.win; ctx.fillStyle = GOLD; rr(ctx, x - 124, y - 84, 248, 168, 6); ctx.fill(); fitTxt(ctx, 'WINNER', x, y + 20, 56, '#7A4A00', 220); ctx.restore(); }
    ctx.fillStyle = 'rgba(30,40,70,0.35)'; ctx.fillRect(x - 110, y - 40 + ((t * 25 + c * 17) % 60), 90, 8); ctx.fillRect(x - 110, y + 10, 140, 8); } ctx.restore();
  // shelves with boxes
  for (const x of [-1150, 1150]) { ctx.save(); ctx.translate(x, -800); rr(ctx, -250, -700, 500, 760, 8); fillStroke(ctx, '#7A8494', 5);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rr(ctx, -210 + j * 210, -660 + i * 230, 190, 170, 8); fillStroke(ctx, '#C9A56A', 4); fitTxt(ctx, 'GAME PIECES', -115 + j * 210, -570 + i * 230, 28, '#5A3A18', 160); } ctx.restore(); }
  // table
  rr(ctx, -650, -330, 1300, 40, 8); fillStroke(ctx, '#C9CED6', 5); ctx.fillStyle = '#8796AA'; ctx.fillRect(-630, -290, 1260, 290); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-630, -290, 1260, 290);
}
function lot(ctx, t, o = {}) { // restaurant parking lot at dusk: asphalt, lines, lamp, cars
  P.skyFill(ctx, '#4A4A8A', '#F2A868', -2600, 0); LT.glow(ctx, 0, -300, 900, 'rgba(255,200,120,1)', 0.2);
  ctx.fillStyle = '#E8D9A8'; ctx.fillRect(-1600, -520, 1000, 520); ctx.fillStyle = C.red; ctx.fillRect(-1600, -560, 1000, 50); txt(ctx, 'BURGERS', -1100, -430, 60, '#171717');
  ctx.fillStyle = '#4A4F5A'; ctx.fillRect(-3000, 0, 6000, 800); ctx.strokeStyle = CREAM; ctx.lineWidth = 8; for (let x = -1200; x < 3000; x += 360) { ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x - 40, 400); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-3000, 0); ctx.lineTo(3000, 0); ctx.stroke();
  for (const [x, col] of [[300, '#4D8DFF'], [1300, '#C93440']]) { ctx.save(); ctx.translate(x, 0); poly(ctx, [[-260, -20], [-260, -110], [-170, -120], [-110, -200], [90, -200], [160, -120], [260, -110], [260, -20]], col); ell(ctx, -150, -10, 52, 52); fillStroke(ctx, '#2A2A30', 5); ell(ctx, 150, -10, 52, 52); fillStroke(ctx, '#2A2A30', 5); ctx.restore(); }
  ctx.save(); ctx.translate(-300, 0); R.tube(ctx, [[0, 0], [0, -900]], 34, '#4A4F5A', 5); poly(ctx, [[-140, -930], [140, -930], [100, -870], [-100, -870]], '#5A6070'); LT.glow(ctx, 0, -860, 700, 'rgba(255,230,160,1)', 0.45); ctx.restore();
}
function vanInterior(ctx, t, o = {}) { // dark van interior: screens, a map, window to the street
  ctx.fillStyle = '#1B1E2A'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(180 + i * 360, 520); rr(ctx, -150, -130, 300, 260, 14); fillStroke(ctx, '#20232A', 5);
    ctx.fillStyle = ['#2E5A4A', '#2E4A6A', '#4A3A6A'][i]; rr(ctx, -134, -114, 268, 228, 8); ctx.fill(); ctx.strokeStyle = 'rgba(180,255,220,0.5)'; ctx.lineWidth = 3; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-110, -80 + k * 44); ctx.lineTo(-110 + 80 + 100 * hash(i * 5 + k), -80 + k * 44); ctx.stroke(); } ctx.restore(); }
  LT.glow(ctx, 540, 520, 900, 'rgba(120,255,200,1)', 0.12);
}
function bars(ctx, o = {}) { // cell bars across the whole frame
  const n = 9, gap = W / (n - 1); ctx.save(); for (let i = 0; i < n; i++) { const x = i * gap, g = ctx.createLinearGradient(x - 20, 0, x + 20, 0); g.addColorStop(0, '#2A2D36'); g.addColorStop(0.5, '#9AA2B2'); g.addColorStop(1, '#2A2D36'); ctx.fillStyle = g; ctx.fillRect(x - 22, -20, 44, H + 40); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.strokeRect(x - 22, -20, 44, H + 40); }
  ctx.fillStyle = '#2A2D36'; ctx.fillRect(0, 820, W, 36); ctx.strokeStyle = INK; ctx.strokeRect(0, 820, W, 36); ctx.restore();
}
function cuffs(ctx, s = 1, o = {}) { // handcuffs: two rings and a chain (o.open 0..1)
  ctx.save(); ctx.scale(s, s); const sp = lerp(40, 150, o.open ?? 0);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(-sp, 0); for (let i = 0; i <= 8; i++) ctx.lineTo(-sp + (2 * sp) * i / 8, (i % 2 ? -10 : 10)); ctx.stroke();
  ctx.strokeStyle = '#B9C0CE'; ctx.lineWidth = px(ctx, 3); ctx.stroke();
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * (sp + 70), 0); ell(ctx, 0, 0, 78, 78); ctx.lineWidth = px(ctx, 22); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(ctx, 14); ctx.strokeStyle = '#B9C0CE'; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function evidenceBag(ctx, s = 1, o = {}) { // a clear evidence bag holding a gold game piece
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0); CL.cutout(ctx, () => rr(ctx, -150, -200, 300, 400, 14), 'rgba(235,245,255,0.85)', { elev: 1.2, tex: 0 });
  ctx.fillStyle = C.red; ctx.fillRect(-150, -200, 300, 50); fitTxt(ctx, 'EVIDENCE', 0, -160, 36, CREAM, 260);
  ctx.save(); ctx.translate(0, 20); gamePiece(ctx, 0.7, { gold: true, text: 'WINNER', top: 'WIN', t: o.t }); ctx.restore(); ctx.restore();
}
function securityBadge(ctx, s = 1) { ctx.save(); ctx.scale(s, s); poly(ctx, [[-70, -80], [70, -80], [90, 40], [0, 100], [-90, 40]], GOLD, 5); fitTxt(ctx, 'SECURITY', 0, 0, 26, '#5A3A00', 120); txt(ctx, '★', 0, -34, 40, '#7A4A00'); ctx.restore(); }

module.exports = { JAC, AG1, AG2, EXEC, CROWD, gamePiece, pieceSheet, cashStack, counter, secRoom, lot, vanInterior, bars, cuffs, evidenceBag, securityBadge, CREAM, GOLD, NAVY };
