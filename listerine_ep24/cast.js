// Episode 24 "Floor cleaner → mouthwash" (Listerine, 1880s–1920s) — cast in the channel style (howitsrun_style/).
// Generic re-enactment people (no likenesses): the janitor, the gargling man, the 1880s surgeon, the pharmacist, the boss's son (Gerard Lambert,
// generic drawing), two ad men, party friends, Edna (the 1920s ad character), the bride, the groom. Plus the amber bottle (no logo).
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const P = require('../howitsrun_style/people');
const { rr } = K;
const { INK, fillStroke, ell, tube, shade } = R;

const JANITOR = { ...P.LOOKS.work, skin: '#D9A27E', hair: '#3A2A1E', top: '#7C8F9E', cuff: '#667888', shirt: null, pants: '#4A5578', shoes: '#4A3424', sole: '#2E2018' };   // grey work shirt + cap
const GARGLER = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#2A1E16', top: '#F4EEDF', cuff: '#E2D9C4', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#171717' };       // shirt sleeves + bow tie
const SURGEON = { ...P.LOOKS.office, skin: '#E8B48F', hair: '#7A5A3A', top: '#F4F1E8', cuff: '#DCD6C8', shirt: '#FFFDF8', pants: '#2E2E34', shoes: '#171717', brow: '#5A3A22' }; // white coat + moustache
const PHARMACIST = { ...P.LOOKS.office, skin: '#E3B08C', hair: '#B8B8BE', top: '#F4F1E8', cuff: '#DCD6C8', shirt: '#FFFDF8', pants: '#3E4F78', shoes: '#171717', glasses: 1, brow: '#8A8A90' };
const LAMBERT = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#1E1612', top: '#2E3A59', cuff: '#24304A', shirt: '#FFFDF8', pants: '#2E3A59', shoes: '#171717', brow: '#1E1612' };   // young man, dark suit, red tie
const ADMAN1 = { ...P.LOOKS.office, skin: '#C98E66', hair: '#2A1A10', top: '#6A5A4A', cuff: '#574A3C', shirt: '#FFFDF8', pants: '#4A3E34', shoes: '#171717', glasses: 1 };
const ADMAN2 = { ...P.LOOKS.office, skin: '#F0C3A2', hair: '#C48A4A', top: '#4A5A4A', cuff: '#3C4A3C', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#171717' };
const EDNA = { skin: '#F0C3A2', hair: '#6A3A22', hairStyle: 'bun', top: '#E9A6B6', cuff: '#D88EA0', pants: '#E9A6B6', shoes: '#B5304A', sole: '#7A2030', iris: '#3A2414', brow: '#4A2A18', lashes: 1, lips: '#B2524A' };
const BRIDE = { skin: '#E8B48F', hair: '#D9B26A', hairStyle: 'long', top: '#FFFDF8', cuff: '#ECE6DA', pants: '#FFFDF8', shoes: '#ECE6DA', sole: '#C9C1B1', iris: '#3A2414', brow: '#8A6A3A', lashes: 1, lips: '#B2524A' };
const GROOM = { ...P.LOOKS.office, skin: '#D9A27E', hair: '#2A1E16', top: '#171717', cuff: '#2A2A30', shirt: '#FFFDF8', pants: '#171717', shoes: '#171717' };
const FRIENDS = [
  { skin: '#C98E66', hair: '#2A1A10', hairStyle: 'bun', top: '#4D8DFF', cuff: '#3E74D0', pants: '#4D8DFF', shoes: '#2E3A59', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#8A3A3A' },
  { ...P.LOOKS.office, skin: '#E8B48F', hair: '#8A5A34', top: '#8A9A4B', cuff: '#6E7C3A', shirt: '#FFFDF8', pants: '#3A3A44', shoes: '#171717' },
  { skin: '#F0C3A2', hair: '#2A1E16', hairStyle: 'curly', top: '#D9A43B', cuff: '#B88A2E', pants: '#D9A43B', shoes: '#6A4024', iris: '#3A2414', brow: '#2A1A10', lashes: 1, lips: '#B2524A' }];

// the amber bottle (generic, no logo): base centre at 0, ~300 tall at s = 1. o.name: plain text on the cream label (optional)
function bottle(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const body = () => { ctx.beginPath(); ctx.moveTo(-70, -6); ctx.quadraticCurveTo(-74, 0, -64, 0); ctx.lineTo(64, 0); ctx.quadraticCurveTo(74, 0, 70, -6); ctx.lineTo(70, -170);
    ctx.bezierCurveTo(70, -210, 26, -214, 24, -244); ctx.lineTo(24, -272); ctx.lineTo(-24, -272); ctx.lineTo(-24, -244); ctx.bezierCurveTo(-26, -214, -70, -210, -70, -170); ctx.closePath(); };
  CL.cutout(ctx, body, '#B8651E', { elev: o.elev ?? 1.0, tex: 0.3 });
  ctx.save(); body(); ctx.clip(); ctx.fillStyle = 'rgba(90,40,10,0.35)'; ctx.fillRect(30, -280, 50, 290); ctx.fillStyle = 'rgba(255,220,160,0.45)'; ctx.fillRect(-52, -190, 14, 170);
  if (o.level !== undefined) { ctx.fillStyle = 'rgba(70,30,6,0.25)'; ctx.fillRect(-80, -170 * o.level, 160, 10); } ctx.restore();
  rr(ctx, -28, -300, 56, 32, 6); fillStroke(ctx, '#3A2A1E', 4);                       // cork / cap
  rr(ctx, -56, -150, 112, 100, 6); fillStroke(ctx, '#F4EEDF', 3.5);                  // plain cream label
  if (o.name) { ctx.font = `20px TypeW, monospace`; ctx.textAlign = 'center'; ctx.fillStyle = INK; const w = ctx.measureText(o.name).width; ctx.save(); ctx.translate(0, -94); if (w > 100) ctx.scale(100 / w, 1); ctx.fillText(o.name, 0, 0); ctx.restore(); }
  ctx.strokeStyle = 'rgba(23,23,23,0.35)'; ctx.lineWidth = 3; for (const y of o.name ? [-78, -66] : [-122, -104, -86, -68]) { ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(40, y); ctx.stroke(); }
  ctx.restore();
}
// a bridesmaid / bridal dress skirt drawn over a standing person's legs (call after P.person with the same x, y, s, facing)
function skirt(ctx, x, y, s, facing, col, len = 80) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  ctx.beginPath(); ctx.moveTo(-62, -296); ctx.lineTo(62, -296); ctx.quadraticCurveTo(100, -170, 118, -len); ctx.quadraticCurveTo(0, -len + 26, -110, -len); ctx.quadraticCurveTo(-94, -170, -62, -296); ctx.closePath();
  fillStroke(ctx, col, 5); ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(-120, -260, 50, 260); ctx.restore();
  ctx.restore();
}
// a small bouquet (held item)
function bouquet(ctx, s = 1) { ctx.save(); ctx.scale(s, s); tube(ctx, [[0, 10], [0, 60]], 12, '#3E9E5A', 3);
  for (const [dx, dy, c] of [[-22, -8, '#FFFDF8'], [20, -10, '#F7B7C6'], [0, -26, '#FFC857'], [-6, 6, '#F7B7C6'], [18, 10, '#FFFDF8']]) { ell(ctx, dx, dy, 18, 18); fillStroke(ctx, c, 3); } ctx.restore(); }
// a drinking glass (held item) with amber liquid
function glass(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-24, -60); ctx.lineTo(24, -60); ctx.lineTo(18, 14); ctx.lineTo(-18, 14); ctx.closePath(); fillStroke(ctx, 'rgba(220,240,255,0.9)', 3.5);
  ctx.fillStyle = 'rgba(184,101,30,0.85)'; ctx.beginPath(); ctx.moveTo(-21, -30); ctx.lineTo(21, -30); ctx.lineTo(18, 12); ctx.lineTo(-18, 12); ctx.closePath(); ctx.fill(); ctx.restore(); }
module.exports = { JANITOR, GARGLER, SURGEON, PHARMACIST, LAMBERT, ADMAN1, ADMAN2, EDNA, BRIDE, GROOM, FRIENDS, bottle, skirt, bouquet, glass };
