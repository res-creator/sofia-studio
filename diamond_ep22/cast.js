// Episode 22 "Your ring is an ad" (De Beers / N.W. Ayer, "A Diamond Is Forever") — the cast in the channel style (howitsrun_style/).
// Generic re-enactment people, no likenesses: the boyfriend (proposes, later tries to sell the ring), the girlfriend, the ad man (megaphone),
// the diamond boss (moustache), the copywriter (bun, 1940s), the pawn-shop dealer (glasses), and a bride (white dress + veil).
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people');
const { C, rr } = K; const { INK, fillStroke, ell, tube, shade } = R;

const GUY = { ...P.LOOKS.casual, skin: '#E3B08C', hair: '#3A2414', top: '#3E5C8A', cuff: '#324C74', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#5A3A22', sole: '#2E2018' };   // blazer, the boyfriend
const GIRL = { skin: '#C98E66', hair: '#2A1A10', hairStyle: 'long', top: '#E07A8A', cuff: '#C9687A', pants: '#E07A8A', shoes: '#B5304A', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#9A3A4A' }; // pink dress
const ADMAN = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#2A1E16', top: '#8A8F98', cuff: '#767B84', shirt: '#FFFDF8', pants: '#6E737C', shoes: '#171717', glasses: 1 };  // grey suit + glasses
const BOSS = { ...P.LOOKS.office, skin: '#EBC09C', hair: '#B8B8BE', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#8A8A90' };   // dark suit, moustache
const WRITER = { skin: '#F0C3A2', hair: '#8A4A2A', hairStyle: 'bun', top: '#2FA37E', cuff: '#25876A', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#5A3A22', iris: '#3A5A2A', brow: '#6A3A1A', lashes: 1, lips: '#B2524A' }; // 1940s blouse
const DEALER = { skin: '#D9A27E', hair: '#8A8A88', hairStyle: 'short', top: '#8A5A34', cuff: '#74492A', shirt: '#F4EEDF', pants: '#4A4F57', shoes: '#3A2A22', iris: '#3A2414', brow: '#6A6A68', glasses: 1 }; // cardigan + glasses
const BRIDE = { skin: '#F0C3A2', hair: '#D9B26A', hairStyle: 'long', top: '#FFFDF8', cuff: '#ECE6DA', pants: '#FFFDF8', shoes: '#ECE6DA', iris: '#3A5A7A', brow: '#9A7A4A', lashes: 1, lips: '#C0505A' };
const BRIDES = [BRIDE,
  { ...BRIDE, skin: '#8D5A3C', hair: '#1E1612' }, { ...BRIDE, skin: '#E3B08C', hair: '#5A3A22', hairStyle: 'bun' }, { ...BRIDE, skin: '#C98E66', hair: '#2A1A10' },
  { ...BRIDE, skin: '#F0C3A2', hair: '#B8501E', hairStyle: 'bun' }, { ...BRIDE, skin: '#D9A27E', hair: '#3A2414' }, { ...BRIDE, skin: '#E8B48F', hair: '#D9B26A', hairStyle: 'bun' },
  { ...BRIDE, skin: '#A86E4A', hair: '#1E1612', hairStyle: 'bun' }, { ...BRIDE, skin: '#F0C3A2', hair: '#2A1E16' }, { ...BRIDE, skin: '#E3B08C', hair: '#7A4A2A', hairStyle: 'bun' }];

// a dress skirt over the legs (local figure space, hip at hy), drawn after the figure
function skirt(ctx, x, y, s, f, col, hy = -256) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  ctx.beginPath(); ctx.moveTo(-58, hy - 34); ctx.lineTo(62, hy - 34); ctx.quadraticCurveTo(100, hy + 120, 118, -40); ctx.quadraticCurveTo(10, -18, -104, -40); ctx.quadraticCurveTo(-90, hy + 120, -58, hy - 34); ctx.closePath();
  fillStroke(ctx, col, 5); ctx.save(); ctx.clip(); ctx.fillStyle = shade(col, -0.12); ctx.beginPath(); ctx.ellipse(-110, -110, 50, 200, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
}
// a woman in a dress: person() + skirt; o.veil draws a bridal veil behind the head
function lady(ctx, x, y, s, f, L, Pz = {}, o = {}) {
  let r; if (o.veil) { ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s); ctx.beginPath(); ctx.moveTo(-30, -600); ctx.quadraticCurveTo(-120, -420, -110, -260); ctx.lineTo(-20, -280); ctx.quadraticCurveTo(-30, -420, 20, -590); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  Pz = { armN: { hand: [70, -300], grip: 'relax' }, armF: { hand: [50, -300], grip: 'relax' }, ...Pz };
  r = P.person(ctx, x, y, s, f, L, Pz);
  skirt(ctx, x, y, s, f, o.dress || L.pants, (Pz.hip || [0, -256])[1]);
  if (o.veil) { ctx.save(); ctx.translate(x + r.hd[0] * s * f, y + r.hd[1] * s); ctx.scale(s * f, s); ell(ctx, -10, -72, 54, 16, -0.15); fillStroke(ctx, '#FFFDF8', 4); for (let i = 0; i < 3; i++) { ell(ctx, -36 + i * 26, -84, 12, 12); fillStroke(ctx, ['#F4B6C2', '#FFFDF8', '#F4B6C2'][i], 3); } ctx.restore(); }
  return r;
}
// the megaphone, held in the hand (drawn upright in figure space; points +x)
function megaphone(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(-0.12);
  tube(ctx, [[-6, 10], [-6, 50]], 16, '#2A2A30', 4);
  ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(40, -26); ctx.lineTo(150, -78); ctx.lineTo(150, 62); ctx.lineTo(40, 14); ctx.lineTo(-30, 10); ctx.closePath(); fillStroke(ctx, C.red, 5);
  ell(ctx, 150, -8, 22, 70); fillStroke(ctx, '#FFFDF8', 5); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(40, -30, 80, 10);
  ctx.restore();
}
module.exports = { GUY, GIRL, ADMAN, BOSS, WRITER, DEALER, BRIDE, BRIDES, skirt, lady, megaphone };
