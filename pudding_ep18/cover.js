// Cover for episode 18: "12,000 PUDDINGS / = 1,000,000 MILES" — one hero: David buried in the pudding mountain, holding a boarding pass.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the
// right-hand buttons. No logos (brand names as text only); generic drawing, not a portrait.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./pudkit');
const { C, F, rr } = K;
const { W, H, txt, fitTxt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
ctx.fillStyle = '#F1E3C8'; ctx.fillRect(0, 0, W, H);
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
hx.save(); hx.translate(540, 1300); S.cupPile(hx, 10, 1.05, { wide: 2 }); hx.restore(); R.LINE.dev = 1;
ctx.filter = 'blur(4px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.glow(ctx, 540, 1200, 520, 'rgba(255,248,220,1)', 0.35);
LT.lit(ctx, c => R.bust(c, 520, 1560, 2.6, S.DAVID, { face: R.expr('grin', { look: [0, 0.05] }),
  hands: [
          { side: -1, hand: [-190, -90], grip: 'hold', item: g => { g.save(); g.rotate(1.57); g.translate(0, 60); S.cup(g, 1.1); g.restore(); } }] }),
  { rim: { dir: [-1, -0.4], color: '#FFF6E0', w: 9, a: 0.9 } });
ctx.save(); ctx.translate(540, 1920); S.cupPile(ctx, 4, 1.3, { wide: 4 }); ctx.restore();
ctx.save(); ctx.translate(760, 1080); ctx.rotate(-0.12); ctx.scale(0.62, 0.62); S.boardingPass(ctx); ctx.restore();
// headline
ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -430, -110, 860, 150, 18), '#FFFDF8', { elev: 1.8 }); fitTxt(ctx, '12,000 PUDDINGS', 0, 2, 100, '#171717', 800);
ctx.translate(0, 180); CL.cutout(ctx, () => rr(ctx, -470, -112, 940, 170, 18), C.red, { elev: 1.8 }); fitTxt(ctx, '= 1,000,000+ MILES', 0, 8, 100, '#FFFDF8', 860);
ctx.restore();
ctx.save(); ctx.translate(W / 2, 300); ctx.font = `34px ${F.black}`; const s = 'TRUE STORY · USA 1999', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -32, sw, 60, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 12, 34, C.yellow); ctx.restore();
LT.grade(ctx, 'golden', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_pudding_guy_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
