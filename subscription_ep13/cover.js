// Cover for episode 13: "18 MINUTES / TO CANCEL INTERNET?!" — Ryan with the phone at his ear, a huge 18:00 call timer, paper WHY? bubbles around.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./callkit');
const { C, F, rr } = K;
const { W, H, txt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// soft dusk apartment behind
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
S.layer(hx, { x: -700, y: -950, z: 1.0 }, 1, w => S.apartment(w, 0, { clock: 18, desk: false })); R.LINE.dev = 1;
ctx.fillStyle = '#E9DCC6'; ctx.fillRect(0, 0, W, H); ctx.filter = 'blur(14px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.haze(ctx, 'evening', 0.16);
// WHY? bubbles around
const B = [[150, 1010, 0.85, -0.2], [930, 980, 0.75, 0.18], [120, 1330, 0.7, 0.1], [960, 1300, 0.8, -0.12], [210, 1590, 0.6, 0.15], [870, 1600, 0.65, -0.1]];
B.forEach(([x, y, s, r], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); S.whyBubble(ctx, { s, col: i === 1 ? C.red : undefined, fg: i === 1 ? '#FFFDF8' : undefined }); ctx.restore(); });
// Ryan, phone at his ear, deadpan
LT.lit(ctx, c => R.bust(c, 540, 1600, 2.4, S.RYAN, { face: R.expr('tired', { look: [0, 0.05], lid: [0.42, 0.42], brow: [-0.15, 0.3] }), headTilt: -0.04,
  hands: [{ side: 1, hand: [104, -66], elbow: [232, 320], grip: 'hold', item: c2 => { c2.save(); c2.translate(-14, -22); c2.rotate(0.15); S.phone(c2, 0.22, { back: true }); c2.restore(); } }] }),
  { rim: { dir: [-1, -0.35], color: '#FFD9A0', w: 9, a: 0.9 } });
// the huge call timer
ctx.save(); ctx.translate(W / 2, 830); ctx.rotate(-0.03);
CL.cutout(ctx, () => rr(ctx, -360, -120, 720, 220, 110), '#171717', { elev: 2, tex: 0 });
ctx.save(); ctx.translate(-250, -10); ctx.rotate(-0.7); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 32, -1.0, 1.0); ctx.stroke(); ctx.restore();
txt(ctx, '18:00', 60, 52, 170, '#FFFDF8'); R.ell(ctx, 290, -70, 16, 16); ctx.fillStyle = C.red; ctx.fill();
ctx.restore();
// headline: 18 MINUTES / TO CANCEL INTERNET?!
ctx.save(); ctx.translate(W / 2, 430); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -380, -112, 760, 160, 18), C.red, { elev: 1.8 }); S.fitTxt(ctx, '18 MINUTES', 0, 14, 118, '#FFFDF8', 700);
ctx.translate(0, 175); CL.cutout(ctx, () => rr(ctx, -470, -92, 940, 136, 18), '#FFFDF8', { elev: 1.8 }); S.fitTxt(ctx, 'TO CANCEL INTERNET?!', 0, 8, 92, '#171717', 880);
ctx.restore();
// small honesty stamp (the cover must not mislead)
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `30px ${F.black}`; const s = 'REAL STORY · JULY 2014', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 56, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
LT.grade(ctx, 'evening', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_comcast_call_that_wouldnt_end_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
