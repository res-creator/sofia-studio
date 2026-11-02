// Cover for episode 13: "THE ICE CREAM MACHINE / WHY IT'S ALWAYS BROKEN" — one hero object: the soft-serve machine with the OUT OF ORDER note
// and the padlock, the annoyed customer peeking in from the side. House rules (COVERS.md): short headline, key words on a red strip,
// inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos (brand names as text only).
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./mcfkit');
const { C, F, rr } = K;
const { W, H, txt, fitTxt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// the counter behind (soft)
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
hx.fillStyle = '#F1E3C8'; hx.fillRect(0, 0, W, H);
S.layer(hx, { x: 0, y: -700, z: 0.95 }, 1, w => S.counter(w, 0, { machine: false })); R.LINE.dev = 1;
ctx.filter = 'blur(7px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
// the hero: the machine, big, OUT OF ORDER + padlock, red LED
LT.glow(ctx, 600, 1150, 520, 'rgba(255,248,220,1)', 0.4);
ctx.save(); ctx.translate(620, 1640); ctx.scale(1.15, 1.15); LT.lit(ctx, c => S.machine(c, { led: C.red, sign: 1, lock: 0, screen: S.scr.text(['ERROR'], '#FF6B6B', 50) }), { rim: { dir: [-1, -0.4], color: '#FFF6E0', w: 9, a: 0.9 } }); ctx.restore();
// the annoyed customer at the left edge
LT.lit(ctx, c => R.bust(c, 170, 1700, 2.0, S.CUST, { face: { ...S.ANGRY, look: [0.8, -0.2] } }), { rim: { dir: [1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 } });
// headline
ctx.save(); ctx.translate(W / 2, 470); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -440, -110, 880, 150, 18), '#FFFDF8', { elev: 1.8 }); fitTxt(ctx, 'THE ICE CREAM MACHINE', 0, 0, 80, '#171717', 820);
ctx.translate(0, 180); CL.cutout(ctx, () => rr(ctx, -470, -112, 940, 170, 18), C.red, { elev: 1.8 }); fitTxt(ctx, "WHY IT'S ALWAYS BROKEN", 0, 6, 86, '#FFFDF8', 860);
ctx.restore();
// small label
ctx.save(); ctx.translate(W / 2, 300); ctx.font = `34px ${F.black}`; const s = "McDONALD'S · USA", sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -32, sw, 60, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 12, 34, C.yellow); ctx.restore();
LT.grade(ctx, 'office', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/mcflurry_machine_broken_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
