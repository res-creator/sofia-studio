// Episode 23 "Who said breakfast matters?" cast in the channel style (howitsrun_style/): generic re-enactment people (no likenesses)
// + the cereal-box mascot in a suit (a prop with a simple face). 1917 Good Health magazine / 1920s bacon campaign.
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people');
const { C, rr, clamp } = K;
const { INK, fillStroke, ell, px, shade } = R;
// ---------- people (one accessory each) ----------
const DAD = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#6A4A2A', top: '#8FB89A', cuff: '#7AA286', shirt: '#FFFDF8', pants: '#5A5F6A', shoes: '#5A3A22', glasses: 1 };   // 1950s dad, cardigan + glasses
const SANMAN = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#E6E6E2', top: '#F4F1E8', cuff: '#E1DDD2', shirt: '#FFFFFF', pants: '#EDE9DE', shoes: '#F4F1E8', sole: '#C9C1B1', brow: '#BDBDB8' }; // the corn-flakes man: all-white suit
const PACKER = { ...P.LOOKS.office, skin: '#E3B08C', hair: '#3A2A1E', top: '#7A5A3A', cuff: '#654A30', shirt: '#F4EEDF', pants: '#6A4E34', shoes: '#3A2416', brow: '#3A2416' };      // the bacon seller: brown suit + hat
const PRMAN = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#1E1612', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#1E1612' };     // the PR man: navy suit + red tie
const DOCTOR = { ...P.LOOKS.office, skin: '#D9A27E', hair: '#8A8A88', top: '#FFFFFF', cuff: '#E9EEF2', shirt: '#BFD4F2', pants: '#5A606B', shoes: '#171717', brow: '#6A6A68', glasses: 1 }; // white coat + glasses
const NEWSBOY = { ...P.LOOKS.casual, skin: '#E8B48F', hair: '#7A4A2A', top: '#C9A35A', cuff: '#B08C48', pants: '#5A4A3A', shoes: '#3A2A1E', sole: '#2E2018' };                      // newsboy cap
const ACC = { DAD: {}, SANMAN: { tie: '#171717' }, PACKER: { hat: ['#6A4E34', '#2A1E16'] }, PRMAN: { tie: C.red }, DOCTOR: { badge: 'MD' }, NEWSBOY: { cap: ['#6A4E34', null] } };

// ---------- the cereal box in a suit (a prop with a simple face), base centre at (0, 0), ~470 tall ----------
// o: { talk 0..1, face: 'smile'|'smug'|'grin'|'wide', look: [x, y], blink 0|1, suit: true }
function cerealBox(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const w = 300, h = 470, d = 70;
  // side + top (3D)
  ctx.beginPath(); ctx.moveTo(w / 2, -h); ctx.lineTo(w / 2 + d, -h - 40); ctx.lineTo(w / 2 + d, -40); ctx.lineTo(w / 2, 0); ctx.closePath(); fillStroke(ctx, '#D98E22', 5);
  ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(-w / 2 + d, -h - 40); ctx.lineTo(w / 2 + d, -h - 40); ctx.lineTo(w / 2, -h); ctx.closePath(); fillStroke(ctx, '#F7C65A', 5);
  // front
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h, w, h, 8), '#F2B33D', { elev: 1.2 });
  ctx.save(); rr(ctx, -w / 2, -h, w, h, 8); ctx.clip();
  ctx.fillStyle = C.red; ctx.fillRect(-w / 2, -h, w, 96); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-w / 2, -h + 96, w, 8);
  ctx.restore(); rr(ctx, -w / 2, -h, w, h, 8); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ST.fitTxt(ctx, 'CORN FLAKES', 0, -h + 64, 50, '#FFFDF8', w - 40);
  // face
  const fy = -h + 190, lk = o.look || [0, 0], bl = o.blink ? 1 : 0, face = o.face || 'smile';
  for (const ex of [-56, 56]) {
    if (bl) { ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.beginPath(); ctx.moveTo(ex - 18, fy); ctx.lineTo(ex + 18, fy); ctx.stroke(); }
    else { ell(ctx, ex, fy, 24, face === 'wide' ? 30 : 26); fillStroke(ctx, '#FFFDF8', 4.5); ell(ctx, ex + lk[0] * 9, fy + lk[1] * 9 + 2, 11, 12); ctx.fillStyle = INK; ctx.fill();
      if (face === 'smug') { ctx.save(); ell(ctx, ex, fy, 24, 26); ctx.clip(); ctx.fillStyle = '#F2B33D'; ctx.fillRect(ex - 30, fy - 30, 60, 26); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4.5); ctx.beginPath(); ctx.moveTo(ex - 24, fy - 4); ctx.lineTo(ex + 24, fy - 4); ctx.stroke(); } }
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.lineCap = 'round'; ctx.beginPath(); const br = face === 'wide' ? -12 : face === 'smug' ? 4 : -4; ctx.moveTo(ex - 22, fy - 40 + br + (ex < 0 ? 0 : -3)); ctx.lineTo(ex + 22, fy - 44 + br + (ex < 0 ? -3 : 0)); ctx.stroke(); }
  ell(ctx, -96, fy + 40, 20, 11); ctx.fillStyle = 'rgba(230,57,70,0.35)'; ctx.fill(); ell(ctx, 96, fy + 40, 20, 11); ctx.fill();
  const talk = clamp(o.talk || 0), my = fy + 62;
  if (talk > 0.05 || face === 'grin' || face === 'wide') { const op = face === 'wide' ? 0.9 : Math.max(talk, face === 'grin' ? 0.55 : 0);
    ctx.beginPath(); ctx.moveTo(-46, my - 6); ctx.quadraticCurveTo(0, my + 2, 46, my - 6); ctx.quadraticCurveTo(36, my + 50 * op, 0, my + 54 * op); ctx.quadraticCurveTo(-36, my + 50 * op, -46, my - 6); ctx.closePath(); fillStroke(ctx, '#6B2A2A', 4.5);
    ctx.save(); ctx.clip(); ell(ctx, 0, my + 52 * op, 24, 14); ctx.fillStyle = '#E86A6A'; ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-40, my - 10, 80, 12); ctx.restore(); }
  else { ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 6); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, my - 6); ctx.quadraticCurveTo(0, my + (face === 'smug' ? 10 : 26), 44, my - (face === 'smug' ? 16 : 8)); ctx.stroke(); }
  // the suit: jacket over the lower front, white shirt V, red tie, lapels
  if (o.suit !== false) {
    const jy = -h + 300, sw = '#2E3A59';
    ctx.save(); rr(ctx, -w / 2, -h, w, h, 8); ctx.clip();
    ctx.beginPath(); ctx.moveTo(-w / 2 - 4, jy - 10); ctx.lineTo(-34, jy - 10); ctx.lineTo(0, jy + 120); ctx.lineTo(34, jy - 10); ctx.lineTo(w / 2 + 4, jy - 10); ctx.lineTo(w / 2 + 4, 4); ctx.lineTo(-w / 2 - 4, 4); ctx.closePath(); fillStroke(ctx, sw, 5);
    ctx.beginPath(); ctx.moveTo(-34, jy - 10); ctx.lineTo(0, jy + 120); ctx.lineTo(34, jy - 10); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 4);
    ctx.beginPath(); ctx.moveTo(-12, jy - 8); ctx.lineTo(12, jy - 8); ctx.lineTo(16, jy + 80); ctx.lineTo(0, jy + 104); ctx.lineTo(-16, jy + 80); ctx.closePath(); fillStroke(ctx, C.red, 4);
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 34, jy - 10); ctx.lineTo(sx * 74, jy - 10); ctx.lineTo(sx * 40, jy + 60); ctx.lineTo(sx * 8, jy + 128); ctx.closePath(); fillStroke(ctx, shade(sw, -0.25), 4); }
    ell(ctx, 0, jy + 150, 8, 8); fillStroke(ctx, '#C9A06A', 3); ell(ctx, 0, jy + 186, 8, 8); fillStroke(ctx, '#C9A06A', 3);
    rr(ctx, 70, jy + 30, 46, 12, 3); fillStroke(ctx, '#FFFDF8', 3);
    ctx.restore(); rr(ctx, -w / 2, -h, w, h, 8); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.restore();
}
// box arm: a navy sleeve from the box side to a white-gloved hand at local (hx, hy) (box scale s)
function boxArm(ctx, s, side, hx, hy) {
  ctx.save(); ctx.scale(s, s); const sx = side * 150, sy = -150;
  R.tube(ctx, [[sx, sy], [lerpN(sx, hx, 0.55) + side * 30, lerpN(sy, hy, 0.5) + 20], [hx, hy]], 40, '#2E3A59', 5);
  ell(ctx, hx, hy, 30, 26); fillStroke(ctx, '#FFFDF8', 5); ctx.restore();
}
const lerpN = (a, b, u) => a + (b - a) * u;
module.exports = { DAD, SANMAN, PACKER, PRMAN, DOCTOR, NEWSBOY, ACC, cerealBox, boxArm };
