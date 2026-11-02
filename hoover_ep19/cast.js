// Episode 19 approved cast (owner, Nov 2026) in the channel style (howitsrun_style/): the customer, the Hoover manager, the travel agent + the vacuum box.
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people');
const { rr } = K;
// ---------- cast (UK, 1992) ----------
const CUSTOMER = { ...P.LOOKS.casual, skin: '#EBC09C', hair: '#7A4A2A', top: '#3E8C6E', cuff: '#2F7058', pants: '#4A5578', shoes: '#F4F1E8', sole: '#C9C1B1', zip: 1 };   // 90s windbreaker
const MANAGER = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#8A8A88', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#6A6A68' }; // dark suit
const AGENT = { skin: '#C98E66', hair: '#2A1A10', hairStyle: 'bun', top: '#B5304A', cuff: '#962840', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#8A3A3A' }; // blazer
// the vacuum-cleaner box (generic, brand name as plain text only), base centre at 0
function vacBox(ctx, s = 1, flip = 1) {
  ctx.save(); ctx.scale(s * flip, s); CL.cutout(ctx, () => rr(ctx, -110, -300, 220, 300, 10), '#E9E1CE', { elev: 1 });
  ctx.fillStyle = '#C9302C'; ctx.fillRect(-110, -300, 220, 70); ST.fitTxt(ctx, 'HOOVER', 0, -250, 44, '#FFFDF8', 190);
  ctx.save(); ctx.translate(0, -40); R.tube(ctx, [[0, 0], [0, -150]], 16, '#8A8F98', 4); rr(ctx, -40, -10, 80, 34, 8); R.fillStroke(ctx, '#5A606B', 4); rr(ctx, -28, -120, 56, 90, 14); R.fillStroke(ctx, '#C9302C', 4); ctx.restore();
  ctx.restore();
}
const PHONE = g => { rr(g, -14, -60, 28, 100, 8); R.fillStroke(g, '#2A2A30', 4); };
module.exports = { CUSTOMER, MANAGER, AGENT, vacBox, PHONE };
