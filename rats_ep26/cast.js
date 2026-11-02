// Episode 26 "Paid per rat tail" (Hanoi, 1902) — cast in the channel style (howitsrun_style/): generic re-enactment people, no likenesses.
// Vietnamese townspeople in normal proportions and period clothes (long tunic colours, loose light trousers, sandals); a conical hat for
// some, a black turban for one, bare head for others. The French colonial official (white uniform + sun helmet) and the sanitary
// inspector (khaki + sun helmet). Accessories are drawn in head space (head centre 0,0, radius 78, facing +x), like people.js.
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const P = require('../howitsrun_style/people');
const { rr } = K; const { fillStroke, ell, px, INK, shade } = R;

// ---------- looks ----------
const HUNTER = { skin: '#D9A27E', hair: '#1E1612', hairStyle: 'short', top: '#7A5A3C', cuff: '#664A30', pants: '#E9E1CE', shoes: '#6A4A2A', sole: '#3A2A1A', iris: '#2A1A10', brow: '#1E1612' };   // brown tunic, conical hat
const ELDER = { skin: '#C98E66', hair: '#3A3A3A', hairStyle: 'short', top: '#2E3348', cuff: '#252A3C', pants: '#EFE8D8', shoes: '#4A3424', sole: '#2E2018', iris: '#2A1A10', brow: '#8A8A88' };    // dark tunic, black turban
const WOMAN = { skin: '#E3B08C', hair: '#1A1210', hairStyle: 'bun', top: '#3E5C8A', cuff: '#334D75', pants: '#1F1F24', shoes: '#5A3A22', sole: '#2E2018', iris: '#2A1A10', brow: '#1A1210', lashes: 1, lips: '#9A4A42' }; // indigo tunic
const YOUTH = { skin: '#D9A27E', hair: '#1A1210', hairStyle: 'short', top: '#EDE6D6', cuff: '#D8CFBC', pants: '#5A4A3A', shoes: '#6A4A2A', sole: '#3A2A1A', iris: '#2A1A10', brow: '#1A1210' };        // white tunic, bare head
const OFFICIAL = { skin: '#F0C3A2', hair: '#6A4A2A', hairStyle: 'short', top: '#F4F1E8', cuff: '#E2DCCD', shirt: '#FFFDF8', pants: '#ECE7DA', shoes: '#171717', iris: '#3A5A7A', brow: '#5A3A22' }; // white uniform
const INSPECTOR = { skin: '#EBC09C', hair: '#8A6A4A', hairStyle: 'short', top: '#B8A57A', cuff: '#A08E64', pants: '#A99670', shoes: '#4A3424', sole: '#2E2018', iris: '#4E6B3C', brow: '#6A4A2A', glasses: 1 }; // khaki

// ---------- head-space accessories ----------
function conicalHat(ctx, col = '#E6D29A') { // non la, side view: a wide shallow cone sitting on the head, chin strap
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-30, -40); ctx.quadraticCurveTo(-10, 60, 40, 74); ctx.stroke();
  ctx.save(); ctx.rotate(-0.05);
  ctx.beginPath(); ctx.moveTo(-178, -40); ctx.lineTo(4, -168); ctx.lineTo(186, -40); ctx.quadraticCurveTo(4, -22, -178, -40); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = shade(col, -0.22); ctx.lineWidth = px(ctx, 2.5); for (let i = 1; i < 5; i++) { const y = -168 + i * 28; ctx.beginPath(); ctx.moveTo(-200, y + 4); ctx.lineTo(200, y + 4); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(4, -168); ctx.lineTo(-178, -40); ctx.lineTo(-60, -36); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
}
function sunHelmet(ctx, col = '#F4F1E8') { // colonial sun helmet (pith helmet), side view
  ctx.save(); ctx.translate(4, -52);
  ctx.beginPath(); ctx.moveTo(-82, 0); ctx.bezierCurveTo(-86, -108, 84, -112, 82, 0); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.save(); ctx.clip(); ctx.fillStyle = shade(col, -0.12); ctx.fillRect(-90, -12, 180, 14); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-122, 14); ctx.quadraticCurveTo(0, -18, 130, 18); ctx.quadraticCurveTo(140, 28, 124, 30); ctx.quadraticCurveTo(0, 4, -118, 28); ctx.quadraticCurveTo(-134, 24, -122, 14); ctx.closePath(); fillStroke(ctx, shade(col, -0.06), 5);
  ell(ctx, 0, -96, 12, 7); fillStroke(ctx, shade(col, -0.1), 3);
  ctx.restore();
}
function turban(ctx, col = '#24242A') { // khan xep, a wrapped black turban
  ctx.beginPath(); ctx.moveTo(-84, -14); ctx.bezierCurveTo(-92, -96, 86, -104, 84, -20); ctx.quadraticCurveTo(0, -46, -84, -14); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-84, -14); ctx.bezierCurveTo(-92, -96, 86, -104, 84, -20); ctx.quadraticCurveTo(0, -46, -84, -14); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = shade(col, 0.35); ctx.lineWidth = px(ctx, 3); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -26 - i * 14); ctx.quadraticCurveTo(0, -56 - i * 14, 80, -32 - i * 14); ctx.stroke(); } ctx.restore();
}
const ACC = { hunter: { hat: conicalHat }, elder: { hat: turban }, woman: {}, youth: {}, official: { hat: sunHelmet, stache: '#5A3A22' }, inspector: { hat: sunHelmet, hatCol: '#C9B98A' } };
const LOOK = { hunter: HUNTER, elder: ELDER, woman: WOMAN, youth: YOUTH, official: OFFICIAL, inspector: INSPECTOR };

// cast(ctx, x, footY, s, facing, who, pose, o) -> full-body profile person + the character's accessory. o.L overrides the look, o.hat: false hides the hat
function cast(ctx, x, y, s, facing, who, Pz = {}, o = {}) {
  const a = ACC[who] || {}, L = o.L || LOOK[who];
  const r = P.person(ctx, x, y, s, facing, L, Pz, { stache: a.stache, tie: o.tie });
  if (a.hat && o.hat !== false) { ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(r.hd[0], r.hd[1]); ctx.rotate((Pz.headTilt || 0) + (Pz.lean || 0) * 0.3);
    if (a.hatCol) a.hat(ctx, a.hatCol); else a.hat(ctx); ctx.restore(); }
  return r;
}
// crowd variations (clothes colours only), each with its own accessory
const CROWD = [
  ['hunter', {}], ['woman', {}], ['elder', {}], ['youth', {}],
  ['hunter', { L: { ...HUNTER, skin: '#C98E66', top: '#4A5A44', cuff: '#3C4A38' } }],
  ['woman', { L: { ...WOMAN, skin: '#D9A27E', top: '#7A3A34', cuff: '#64302A', hairStyle: 'long' } }],
];
module.exports = { HUNTER, ELDER, WOMAN, YOUTH, OFFICIAL, INSPECTOR, LOOK, cast, CROWD, conicalHat, sunHelmet, turban };
