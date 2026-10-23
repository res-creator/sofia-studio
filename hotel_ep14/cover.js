// Cover for episode 14: "PREPAID ROOM / $1,400 NIGHT" — one hero object: the red suitcase with a huge $1,400 tag, on the night street in Nassau.
// House rules (COVERS.md): short headline, key words on a red strip, inside the 3:4 crop (y 240..1680), clear of the caption area and the right-hand buttons. No logos.
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const S = require('./hotelkit');
const { C, F, rr } = K;
const { W, H, txt } = S;

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
// soft night street behind
const half = createCanvas(W / 2, H / 2), hx = half.getContext('2d'); hx.scale(0.5, 0.5); R.LINE.dev = 0.5;
S.layer(hx, { x: 200, y: -800, z: 0.55 }, 1, w => S.street(w, 1, { moonAt: [700, -1900] })); R.LINE.dev = 1;
ctx.fillStyle = '#141B36'; ctx.fillRect(0, 0, W, H); ctx.filter = 'blur(10px)'; ctx.drawImage(half, 0, 0, W, H); ctx.filter = 'none';
LT.haze(ctx, 'dark', 0.12);
// the suitcase + the tag on a string from its handle
ctx.save(); ctx.translate(430, 1560); ctx.rotate(0.12);
LT.lit(ctx, c => S.suitcase(c, 2.4, C.red), { rim: { dir: [1, -0.5], color: '#CFE0FF', w: 9, a: 0.9 } });
ctx.restore();
ctx.save(); ctx.strokeStyle = '#171717'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(560, 640); ctx.quadraticCurveTo(700, 860, 640, 1000); ctx.stroke(); ctx.restore();
ctx.save(); ctx.translate(560, 1110); ctx.rotate(-0.1); const size = 150; ctx.font = `${size}px ${F.black}`; const tw = ctx.measureText('$1,400').width + size * 1.1, th = size * 1.55;
CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(tw / 2 - th * 0.34, -th / 2); ctx.lineTo(-tw / 2, -th / 2); ctx.lineTo(-tw / 2, th / 2); ctx.lineTo(tw / 2 - th * 0.34, th / 2); ctx.lineTo(tw / 2, 0); ctx.closePath(); }, '#FFFDF8', { elev: 1.8 });
txt(ctx, '$1,400', -size * 0.25, size * 0.35, size, C.red); ctx.restore();
// headline
ctx.save(); ctx.translate(W / 2, 420); ctx.rotate(-0.02);
CL.cutout(ctx, () => rr(ctx, -440, -110, 880, 160, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, 'PREPAID ROOM.', 0, 8, 100, '#171717');
ctx.translate(0, 180); CL.cutout(ctx, () => rr(ctx, -380, -105, 760, 160, 18), C.red, { elev: 1.8 }); txt(ctx, 'SOLD OUT.', 0, 20, 116, '#FFFDF8');
ctx.restore();
// small honesty stamp
ctx.save(); ctx.translate(W / 2, 278); ctx.font = `30px ${F.black}`; const s = 'REAL STORY · NASSAU · REPORTED MAR 2026', sw = ctx.measureText(s).width + 50;
CL.cutout(ctx, () => rr(ctx, -sw / 2, -30, sw, 58, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
LT.grade(ctx, 'dark', { vignette: 0.2 });
ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(K.paperTexture(W, H), 0, 0); ctx.restore();
fs.writeFileSync(`${__dirname}/the_1400_hotel_room_cover.png`, cv.toBuffer('image/png')); console.log('cover ok');
