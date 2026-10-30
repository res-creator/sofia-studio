// Cover for episode 12: "MACHINE GUNS / vs. EMUS" — one hero: the emu's deadpan stare, a Lewis gun pointing at it.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./emukit');
const { C, F, rr } = K;
const { W, H, txt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
S.land(hx, 0, { hy: 1150, rows: 7, windmill: { x: 880, s: 0.5 } }); R.LINE.dev = 1;
ctx.fillStyle = '#E9D2A0'; ctx.fillRect(0, 0, W, H); ctx.filter = 'blur(12px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.haze(ctx, 'golden', 0.1);
const RIM = { dir: [1, -0.5], color: '#FFF0C8', w: 9, a: 0.9 };
ctx.save(); ctx.translate(600, 1080); ctx.scale(2.6, 2.6); LT.lit(ctx, c => S.emuFace(c, { lid: 0.5, look: [-0.4, 0.1], tilt: 0.05 }), { rim: RIM }); ctx.restore();
ctx.save(); ctx.translate(-260, 1420); ctx.rotate(-0.08); ctx.scale(1.55, 1.55); LT.lit(ctx, c => S.lewisGun(c, {}), { rim: RIM }); ctx.restore();
// headline
ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -470, -120, 940, 170, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, 'MACHINE GUNS', 0, 10, 112, '#171717');
ctx.translate(0, 190); CL.cutout(ctx, () => rr(ctx, -340, -112, 680, 170, 18), C.red, { elev: 1.8 }); txt(ctx, 'vs. EMUS', 0, 24, 128, '#FFFDF8');
ctx.restore();
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `32px ${F.black}`; const s = 'WESTERN AUSTRALIA · 1932', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 12, 32, C.yellow); ctx.restore();
LT.grade(ctx, 'golden', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_great_emu_war_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
