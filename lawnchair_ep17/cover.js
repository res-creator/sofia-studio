// Cover for episode 17: "A LAWN CHAIR / 16,000 FEET" — Larry in the chair under 42 balloons in open sky. COVERS.md: inside the 3:4 crop, clear of the caption area and buttons, no logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const R = require('../hirkit/rig');
const LK = require('./lawnkit');
const { C, F, rr } = K;
const { W, H, txt, fitTxt } = LK;
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
ctx.save(); ctx.translate(0, 300); LK.sky(ctx, 2, { n: 6, y0: -1500, span: 1400 }); ctx.restore();
LT.glow(ctx, 540, 1000, 900, 'rgba(255,246,205,1)', 0.3);
// hero: the chair, Larry and the balloons (chair seat at ~y 1230, balloons above)
ctx.save(); ctx.translate(540, 930); ctx.scale(0.8, 0.8);
const ROPE = [10, -560];
LK.balloons(ctx, -4 + ROPE[0], 34 + ROPE[1], { t: 1, s: 0.5, n: 42, pop: {} });
LK.larrySeated(ctx, 0, 0, { t: 1, ropes: ROPE, dangle: 1, jugs: 13, lean: -0.04, face: R.expr('shocked', { look: [1, 0.2] }), sw: 0, armN: { hand: [96, -150], grip: 'fist' }, armF: { hand: [78, -148], grip: 'fist' } });
ctx.restore();
ctx.save(); ctx.translate(W / 2, 1265); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -440, -88, 880, 150, 18), '#FFFDF8', { elev: 1.8 }); fitTxt(ctx, 'A LAWN CHAIR', 0, 14, 118, '#171717', 820);
ctx.translate(0, 150); CL.cutout(ctx, () => rr(ctx, -440, -70, 880, 140, 18), C.red, { elev: 1.8 }); fitTxt(ctx, '16,000 FEET', 0, 20, 108, '#FFFDF8', 820); ctx.restore();
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `30px ${F.black}`; const s = 'REAL STORY · RE-ENACTMENT', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 56, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
LT.grade(ctx, 'day', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_man_who_flew_in_a_lawn_chair_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
