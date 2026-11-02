// How It's Run — people, drawn the way emu_ep12 and lawnchair_ep17 draw them (the channel's style reference).
//  * Full body, in PROFILE (R.figure), standing in the scene — the default shot. Height ≈ 600·s px (feet at y, head top ≈ y − 600·s).
//    Typical s: 0.9–1.5 in wide/medium shots (the person fills 30–55 % of the frame height), never a giant head.
//  * Ink outline from the rig (R.LINE, ~5 px), flat fills + one shade on the far side, warm rim light from the left (LT.lit, RIM.day).
//  * Faces: R.expr(...) presets (neutral, smile, grin, surprised, shocked, worried, skeptical, squint, tired, smug, thinking) with look [x, y]
//    and blink; reactions are shown by expression + a small headTilt/lean, not by zooming into a huge face.
//  * Front bust (personBust) only for a short reaction/punch-line close-up, framed chest-up and with the face above y ≈ 1450 (subtitles below).
//  * Identity comes from clothes and ONE accessory (hat, cap, moustache, tie, glasses, badge), not from big heads or busy collage.
//  * Generic re-enactment people: never a portrait of a real person; say "re-enactment" on screen (stampLabel).
// Use: const P = require('../howitsrun_style/people');  P.person(ctx, x, footY, s, facing, P.LOOKS.office, pose, { tie: '#E63946' })
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const { C, lerp, rr } = K;
const { INK, shade, fillStroke, ell, px } = R;
const RIM_DAY = { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 };

// ---------- looks (clothes palettes); copy one and change colours per character ----------
const SKIN = ['#F0C3A2', '#E8B48F', '#E3B08C', '#D9A27E', '#C98E66', '#8D5A3C'];
const LOOKS = {
  casual: { skin: '#E8B48F', hair: '#5A3A22', hairStyle: 'short', top: '#5B8DD6', cuff: '#4A78BA', pants: '#3E4F78', shoes: '#F4F1E8', sole: '#C9C1B1', iris: '#3A2414', brow: '#3A2414' }, // Larry
  office: { skin: '#F0C3A2', hair: '#2A1E16', hairStyle: 'short', top: '#BFD4F2', cuff: '#A9C2E4', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#171717', iris: '#4E6B3C', brow: '#2A1A10' }, // FAA official
  uniform: { skin: '#D9A27E', hair: '#B8B8BE', hairStyle: 'short', top: '#F4F1E8', cuff: '#2E3A59', pants: '#2E3A59', shoes: '#171717', iris: '#3A2414', brow: '#8A8A90' }, // pilot
  work: { skin: '#E0A47C', hair: '#7A4A2A', hairStyle: 'short', top: '#E7DCC4', shirt: '#F4EEDF', cuff: '#D3C6A8', pants: '#4D5F86', shoes: '#5A3A22', sole: '#2E2018', iris: '#4A6A8A', brow: '#5A3418' }, // farmer
  khaki: { skin: '#E3B08C', hair: '#5A3A24', hairStyle: 'short', top: '#8E7F52', cuff: '#76683F', pants: '#7A6B44', shoes: '#4A3424', sole: '#2E2018', iris: '#4E6B3C', brow: '#3A2416' }, // soldier
};

// ---------- accessories (drawn in head space: head centre at (0, 0), radius 78, facing +x) ----------
function hatSlouch(ctx, col = '#C4A66A', band = '#6A4A2A') { // emu: slouch / farmer hat, side view
  ctx.beginPath(); ctx.moveTo(-70, -62); ctx.bezierCurveTo(-74, -150, 70, -158, 72, -62); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-70, -62); ctx.bezierCurveTo(-74, -150, 70, -158, 72, -62); ctx.closePath(); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(-90, -84, 180, 22); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-136, -58); ctx.quadraticCurveTo(0, -80, 140, -54); ctx.quadraticCurveTo(150, -46, 136, -42); ctx.quadraticCurveTo(0, -60, -132, -46); ctx.quadraticCurveTo(-146, -50, -136, -58); ctx.closePath(); fillStroke(ctx, shade(col, -0.08), 5);
}
function capPeaked(ctx, col = '#2E3A59', badge = C.yellow) { // lawnchair: pilot / official cap, side view
  ctx.save(); ctx.translate(8, -74); ctx.beginPath(); ctx.moveTo(-70, 10); ctx.bezierCurveTo(-72, -36, 66, -40, 70, 10); ctx.closePath(); fillStroke(ctx, col, 4.5);
  rr(ctx, -68, 2, 150, 16, 6); fillStroke(ctx, '#171717', 3.5); if (badge) { ell(ctx, 8, -10, 13, 11); fillStroke(ctx, badge, 3); } ctx.restore();
}
function stache(ctx, col = '#7A7A78') { ctx.beginPath(); ctx.moveTo(52, 30); ctx.quadraticCurveTo(80, 18, 100, 34); ctx.quadraticCurveTo(80, 44, 52, 38); ctx.closePath(); fillStroke(ctx, col, 4); }

// ---------- the full figure (profile) + accessories ----------
// acc: { hat: [col, band] | true, cap: [col, badge] | true, stache: col, tie: col, badge: 'TEXT', item }
function person(ctx, x, y, s, facing, L, P = {}, acc = {}) {
  let r; LT.lit(ctx, c => { r = R.figure(c, x, y, s, facing, L, P); }, { rim: P.rim || RIM_DAY });
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  const lean = P.lean || 0;
  if (acc.tie) { ctx.save(); ctx.translate(r.neck[0], r.neck[1]); ctx.rotate(lean); ctx.beginPath(); ctx.moveTo(38, -2); ctx.lineTo(54, -2); ctx.lineTo(60, 92); ctx.lineTo(50, 112); ctx.lineTo(40, 92); ctx.closePath(); fillStroke(ctx, acc.tie, 4); ctx.restore(); }
  if (acc.badge) { ctx.save(); ctx.translate(r.neck[0], r.neck[1]); ctx.rotate(lean); ctx.translate(18, 70); rr(ctx, -30, -14, 60, 28, 6); fillStroke(ctx, '#FFFDF8', 3); ctx.scale(facing, 1); ctx.font = `16px ${K.F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(acc.badge, 0, 6); ctx.restore(); }
  ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((P.headTilt || 0) + lean * 0.3);
  if (acc.stache) stache(ctx, acc.stache);
  if (acc.hat) hatSlouch(ctx, ...(Array.isArray(acc.hat) ? acc.hat : []));
  if (acc.cap) capPeaked(ctx, ...(Array.isArray(acc.cap) ? acc.cap : []));
  ctx.restore(); return r;
}
// front bust for a short reaction close-up (chest-up). acc: { tie, stache }
function personBust(ctx, x, y, s, L, P = {}, acc = {}) {
  LT.lit(ctx, c => R.bust(c, x, y, s, L, P), { rim: P.rim || RIM_DAY });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(P.lean || 0);
  if (acc.tie) { ctx.save(); ctx.scale(0.92, 1); ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(14, -12); ctx.lineTo(9, 10); ctx.lineTo(-9, 10); ctx.closePath(); fillStroke(ctx, acc.tie, 3.5);
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(9, 10); ctx.lineTo(18, 84); ctx.lineTo(0, 100); ctx.lineTo(-18, 84); ctx.closePath(); fillStroke(ctx, acc.tie, 3.5); ctx.restore(); }
  ctx.translate(0, -112); ctx.rotate(P.headTilt || 0);
  if (acc.stache) { ctx.beginPath(); ctx.moveTo(-6, 26); ctx.quadraticCurveTo(-40, 16, -58, 40); ctx.quadraticCurveTo(-30, 44, -4, 36); ctx.quadraticCurveTo(0, 30, 4, 36); ctx.quadraticCurveTo(30, 44, 58, 40); ctx.quadraticCurveTo(40, 16, 6, 26); ctx.closePath(); fillStroke(ctx, acc.stache, 4); }
  ctx.restore();
}
// seated in profile on a chair, feet on the floor at y (floor), seat height seatH (local units); chair drawn behind
function seated(ctx, x, y, s, facing, L, P = {}, acc = {}, seatH = 210) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  if (P.chair !== false) { const cc = P.chairCol || '#4A4F57'; rr(ctx, -120, -seatH - 300, 70, 300, 24); fillStroke(ctx, cc, 5); rr(ctx, -120, -seatH - 10, 230, 40, 14); fillStroke(ctx, cc, 5); R.tube(ctx, [[-10, -seatH + 30], [-10, 0]], 18, '#2A2A30', 4); R.tube(ctx, [[-90, 0], [70, 0]], 14, '#2A2A30', 4); }
  ctx.restore();
  return person(ctx, x, y, s, facing, L, { hip: [0, -seatH], noShadow: true, legN: { foot: [150, 0] }, legF: { foot: [124, 0] }, armN: { hand: [120, -seatH - 60], grip: 'fist' }, armF: { hand: [100, -seatH - 58], grip: 'fist' }, ...P }, acc);
}
// common poses (local units, facing +x): pass as P to person()
const POSE = {
  stand: (face) => ({ face }),
  point: (face) => ({ face, armN: { hand: [150, -360], grip: 'point' } }),
  shrug: (face) => ({ face, armN: { hand: [110, -330], grip: 'open' }, armF: { hand: [70, -330], grip: 'open' } }),
  phone: (face, item) => ({ face, armF: { hand: [16, -505], grip: 'hold', item } }),   // the far hand holds the phone at the ear, behind the head
  read: (face, item) => ({ face, armN: { hand: [130, -330], grip: 'hold', item }, armF: { hand: [110, -330], grip: 'hold' } }),
  hold: (face, item) => ({ face, armN: { hand: [110, -250], grip: 'hold', item }, armF: { hand: [90, -250], grip: 'hold' } }),
  walk: (face, phase) => ({ face, ...R.walk(phase) }),
};

module.exports = { SKIN, LOOKS, RIM_DAY, person, personBust, seated, POSE, hatSlouch, capPeaked, stache };
