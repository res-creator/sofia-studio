// Cover for episode 12: "ONE TV JOKE / EMPTY SHELVES" — one hero object: the last roll on an empty store shelf, the late-night TV beside it.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./tpkit');
const { C, F, rr } = K;
const { W, H, txt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// the empty shelf behind (soft)
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
hx.fillStyle = '#EFE8D8'; hx.fillRect(0, 0, W, H);
S.layer(hx, { x: 0, y: -760, z: 0.95 }, 1, w => { w.fillStyle = '#E9E3D3'; w.fillRect(-2000, 0, 4000, 2000); S.shelf(w, 1200, { n: 4, stock: () => 0, price: '69¢' }); }); R.LINE.dev = 1;
ctx.filter = 'blur(6px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.haze(ctx, 'office', 0.12);
// the late-night TV, small, on the shelf at the left
ctx.save(); ctx.translate(300, 1030); ctx.rotate(-0.05); ctx.scale(0.42, 0.42); S.tvSet(ctx, 820, 620, (g, w, h) => S.studio(g, w, h, 0, { laugh: 1, face: R.expr('grin', { look: [0, 0.1] }) })); ctx.restore();
// the hero: the last roll, big, with a spotlight
LT.glow(ctx, 700, 1150, 420, 'rgba(255,248,220,1)', 0.4);
ctx.save(); ctx.translate(700, 1330); ctx.rotate(0.04); LT.lit(ctx, c => S.roll(c, 2.6, { tail: 60, wave: 0.6 }), { rim: { dir: [-1, -0.4], color: '#FFF6E0', w: 9, a: 0.9 } }); ctx.restore();
// headline: ONE TV JOKE / EMPTY SHELVES
ctx.save(); ctx.translate(W / 2, 450); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -420, -120, 840, 170, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, 'ONE TV JOKE', 0, 8, 110, '#171717');
ctx.translate(0, 190); CL.cutout(ctx, () => rr(ctx, -460, -112, 920, 170, 18), C.red, { elev: 1.8 }); S.fitTxt(ctx, 'EMPTY SHELVES', 0, 22, 112, '#FFFDF8', 840);
ctx.restore();
// small historical stamp
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `32px ${F.black}`; const s = 'USA · DEC 1973', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 12, 32, C.yellow); ctx.restore();
LT.grade(ctx, 'office', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/toilet_paper_panic_1973_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
