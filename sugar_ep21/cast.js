// Episode 21 "Sugar paid scientists" cast in the channel style (howitsrun_style/): generic re-enactment people, no likenesses.
// EXEC = a 1960s sugar-industry man (brown suit + red tie), SCI = a 1960s university scientist (white lab coat + glasses),
// RESEARCHER = a 2016 researcher in the archives (badge), READER = a 1967 journal reader (moustache).
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const P = require('../howitsrun_style/people');
const { rr } = K;
const EXEC = { ...P.LOOKS.office, skin: '#EBC09C', hair: '#2A1E16', top: '#6A4A2E', cuff: '#573B24', shirt: '#FFFDF8', pants: '#5A3E28', shoes: '#171717', brow: '#2A1A10', iris: '#3A2414' };
const SCI = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#A8A8A6', top: '#F4F6F8', cuff: '#DDE3E8', shirt: '#BFD4F2', pants: '#55606E', shoes: '#3A2A22', brow: '#7A7A78', iris: '#4E6B3C', glasses: 1 };
const RESEARCHER = { skin: '#D9A27E', hair: '#2A1A10', hairStyle: 'bun', top: '#3E8C6E', cuff: '#2F7058', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#5A3A22', sole: '#2E2018', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#9A4A42' };
const READER = { ...P.LOOKS.casual, skin: '#E3B08C', hair: '#7A4A2A', top: '#C9A06A', cuff: '#B08A54', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#5A3A22', sole: '#2E2018' };
const ACC = { EXEC: { tie: '#E63946' }, SCI: {}, RESEARCHER: { badge: 'VISITOR' }, READER: { stache: '#6A4024' } };
// the lab coat's skirt (drawn BEFORE the figure, so it hangs behind the legs): same transform as P.person, hip from the pose
function coatTail(ctx, x, y, s, facing, Pz = {}) {
  const hip = Pz.hip || [0, -256], lean = Pz.lean || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(hip[0], hip[1]); ctx.rotate(lean * 0.6);
  ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(-84, 150); ctx.quadraticCurveTo(0, 168, 80, 146); ctx.lineTo(62, -10); ctx.closePath(); R.fillStroke(ctx, '#E6EBEF', 5);
  ctx.restore();
}
// the scientist: coat skirt + figure
function scientist(ctx, x, y, s, facing, Pz = {}, acc = {}) { if (!Pz.hip || Pz.hip[1] < -235) coatTail(ctx, x, y, s, facing, Pz); return P.person(ctx, x, y, s, facing, SCI, Pz, acc); }
const PHONE = g => { rr(g, -14, -60, 28, 100, 8); R.fillStroke(g, '#2A2A30', 4); };
module.exports = { EXEC, SCI, RESEARCHER, READER, ACC, coatTail, scientist, PHONE };
