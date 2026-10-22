// Cover for episode 11: "1-INCH SCRATCH / $440 BILL?!" — one hero object: a big alloy wheel with a tiny scuff, the scanner's red box, a huge $440 tag.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./scankit');
const { C, F, rr } = K;
const { W, H, txt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// soft garage + arch light behind
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
S.layer(hx, { x: 0, y: -900, z: 0.75 }, 1, w => { S.garage(w, 0, { sign: false }); S.archFront(w, { on: 1 }); }); R.LINE.dev = 1;
ctx.fillStyle = '#D9D3C6'; ctx.fillRect(0, 0, W, H); ctx.filter = 'blur(14px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.haze(ctx, 'office', 0.18);
// the wheel in its arch (car body edge above)
const cx = 400, cy = 1080, sc = 3.4;
ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
LT.lit(ctx, c => { c.save(); c.translate(300, 92); S.carSide(c, { rot: 0.25, scuff: 1 }); c.restore(); }, { rim: { dir: [-1, -0.4], color: '#FFF6E0', w: 9, a: 0.9 } });
S.detectBox(ctx, 92 * 0.7, 1, '≈ 1 INCH', 1.35, 1.25);
ctx.restore();
// red scan line across the wheel
ctx.save(); ctx.fillStyle = 'rgba(230,57,70,0.8)'; ctx.fillRect(0, 1255, W, 7); LT.glow(ctx, 760, 1258, 260, 'rgba(255,80,90,1)', 0.3); ctx.restore();
// the huge $440 tag on a string from the box
const bx = cx + 0.62 * 64.4 * sc, by = cy + 0.42 * 64.4 * sc;
ctx.save(); ctx.strokeStyle = '#171717'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx - 20, by + 10); ctx.quadraticCurveTo(640, 1470, 560, 1400); ctx.stroke(); ctx.restore();
ctx.save(); ctx.translate(420, 1400); ctx.rotate(-0.08); ctx.scale(2.4, 2.4);
ctx.font = `64px ${F.black}`; const w = ctx.measureText('$440').width + 70;
CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 - 34, -50); ctx.lineTo(-w / 2, -50); ctx.lineTo(-w / 2, 50); ctx.lineTo(w / 2 - 34, 50); ctx.lineTo(w / 2, 0); ctx.closePath(); }, C.red, { elev: 1.6 });
R.ell(ctx, w / 2 - 30, 0, 9, 9); ctx.fillStyle = 'rgba(40,25,10,0.5)'; ctx.fill(); txt(ctx, '$440', -16, 22, 64, '#FFFDF8'); ctx.restore();
// headline: 1-INCH SCRATCH / $440 BILL?!
ctx.save(); ctx.translate(W / 2, 420); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -470, -120, 940, 170, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, '1-INCH SCRATCH', 0, 8, 104, '#171717');
ctx.translate(0, 190); CL.cutout(ctx, () => rr(ctx, -380, -112, 760, 170, 18), C.red, { elev: 1.8 }); txt(ctx, '$440 BILL?!', 0, 22, 124, '#FFFDF8');
ctx.restore();
// small historical stamp (the cover must not mislead)
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `32px ${F.black}`; const s = 'ATLANTA AIRPORT · 2025', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 12, 32, C.yellow); ctx.restore();
LT.grade(ctx, 'office', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_440_scratch_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
