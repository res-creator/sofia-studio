// Cover for episode 10: "YOUR $5 COFFEE / COST $40?!" — the heroine (surprised), a big coffee cup with a $40 tag, the receipt.
// House rules (COVERS.md): 3-5 word headline, key word on a red strip, inside the 3:4 crop (y 240..1680), clear of the UI. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const CF = require('../tests/coffee_scene_v2/cafe2');
const WF = require('./wfkit');
const { C, F, rr } = K;
const { W, H, txt, MAYA } = WF;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// blurred cafe behind
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
CF.drawCafe(hx, 6.2, { x: -700, y: -980, z: 1.25, r: 0 }, 'back', W, H); CF.drawCafe(hx, 6.2, { x: -700, y: -980, z: 1.25, r: 0 }, 'hero', W, H, { noCust: true, flat: true }); R.LINE.dev = 1;
ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H); ctx.filter = 'blur(12px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
// the heroine, shocked, holding the cup
LT.lit(ctx, c => R.bust(c, 400, 1500, 2.5, MAYA, { face: R.expr('shocked', { look: [0.6, 0.2], turn: 0.15 }), headTilt: -0.05,
  hands: [{ side: 1, hand: [120, 20], elbow: [230, 470], grip: 'hold', item: x => { x.save(); x.translate(-4, 64); R.cup(x, 1.25); x.restore(); } }] }),
  { rim: { dir: [-1, -0.35], color: '#FFF3D8', w: 9, a: 0.9 }, tint: { x0: 420, y0: 0, x1: 1080, y1: 0, color: 'rgb(205,200,228)', a: 1 } });
// the receipt, taped, with the fee
ctx.save(); ctx.translate(770, 930); ctx.rotate(0.12); ctx.scale(0.72, 0.72); WF.receipt(ctx, 'COFFEE', '$5', { stamp: 1, red: true }); CL.tape(ctx, 0, -190, 140, 0.1); ctx.restore();
ctx.save(); ctx.translate(790, 1230); ctx.scale(1.5, 1.5); WF.feeTag(ctx, 1, -0.12); ctx.restore();
// headline
ctx.save(); ctx.translate(W / 2, 400); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -470, -120, 940, 170, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, 'YOUR $5 COFFEE', 0, 8, 100, '#171717');
ctx.translate(0, 190); CL.cutout(ctx, () => rr(ctx, -360, -110, 720, 170, 18), C.red, { elev: 1.8 }); txt(ctx, 'COST $40?!', 0, 20, 118, '#FFFDF8');
ctx.restore();
// small historical stamp (the cover must not mislead)
ctx.save(); ctx.translate(W / 2, 720); ctx.font = `30px ${F.black}`; const s = 'CALIFORNIA · 2000s · ILLUSTRATIVE EXAMPLE', w = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -w / 2, -30, w, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.28; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_5_coffee_that_cost_40_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
