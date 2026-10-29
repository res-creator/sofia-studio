// Cover for episode 15: "PEPSI FIGHTER JET" — the Harrier over a school, key words on a red strip. House rules (COVERS.md): inside the 3:4 crop (y 240..1680),
// clear of the caption area and the right-hand buttons, no logos (brand name as plain text only), matches the video.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const CK = require('../subscription_ep13/callkit');
const P = require('./pepsikit');
const { C, F, rr } = K;
const { W, H, txt, fitTxt, layer } = CK;
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
ctx.fillStyle = '#7FB6F2'; ctx.fillRect(0, 0, W, H);
layer(ctx, { x: 0, y: -520, z: 0.8 }, 1, w => P.school(w, 1, { wind: 1 }));
LT.glow(ctx, 540, 1000, 900, 'rgba(255,255,255,1)', 0.25);
ctx.save(); ctx.translate(540, 1010); ctx.rotate(-0.06); ctx.scale(1.0, 1.0); P.harrier(ctx, 1, { noz: 1, flame: 1, t: 0.4 }); ctx.restore();
ctx.save(); ctx.translate(W / 2, 430); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -330, -112, 660, 160, 18), '#FFFDF8', { elev: 1.8 }); fitTxt(ctx, 'PEPSI', 0, 14, 124, '#171717', 600);
ctx.translate(0, 175); CL.cutout(ctx, () => rr(ctx, -450, -92, 900, 150, 18), C.red, { elev: 1.8 }); fitTxt(ctx, 'FIGHTER JET?!', 0, 20, 112, '#FFFDF8', 840); ctx.restore();
ctx.save(); ctx.translate(W / 2, 1420); ctx.rotate(0.02); CL.cutout(ctx, () => rr(ctx, -430, -70, 860, 130, 18), '#171717', { elev: 1.6, tex: 0 }); fitTxt(ctx, '7,000,000 POINTS', 0, 28, 84, C.yellow, 800); ctx.restore();
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `30px ${F.black}`; const s = 'REAL STORY · AD RE-ENACTED', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 56, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
LT.grade(ctx, 'day', { vignette: 0.18 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_pepsi_fighter_jet_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
