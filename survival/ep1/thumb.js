// Thumbnail 1280x720: DAY 1 (happy, duck, bright) | DAY 5 (grey, red eyes, bitten, dark). node thumb.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const C = require('./lib/core'), K = require('./lib/cast'), SE = require('./lib/sets'), A = require('./lib/act'), R = K.R;
const W = 1920, H = 1080, c = createCanvas(W, H), x = c.getContext('2d'), F = SE.FLOOR;
// left half: day 1
x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(1010, 0); x.lineTo(910, H); x.lineTo(0, H); x.clip();
x.save(); x.translate(480, 560); x.scale(1.9, 1.9); x.translate(-1500, -560); SE.market(x, 1); 
{ const pose = { x: 1560, ground: F, lean: 0.02 }, J0 = R.solve(K.HERO.S, pose), dp = [J0.head[0] - 150, J0.head[1] + 60];
  A.hero(x, { pose, grips: { near: [dp[0] + 30, dp[1] + 40] }, e: { eyes: 'happy', brow: 'up', mouth: 'biggrin' }, pack: true, holdNear: q => K.duck(q, dp[0], dp[1], 1.0, -0.1) }); }
x.restore(); x.restore();
// right half: day 5
x.save(); x.beginPath(); x.moveTo(1010, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(910, H); x.clip();
x.save(); x.translate(1420, 560); x.scale(1.9, 1.9); x.translate(-1100, -560); SE.techRoom(x, 1, {});
{ const pose = { x: 1150, ground: F, lean: 0.02, tilt: 0.08 }, J0 = R.solve(K.HERO.S, pose);
  A.hero(x, { pose, grips: { near: [J0.head[0] - 160, J0.head[1] + 150] }, e: { eyes: 'wide', brow: 'angry', mouth: 'teeth', look: [0.9, 0], blood: 1 }, gray: 0.65, redEyes: 1, bite: true, pack: true, radio: true }); }
x.restore(); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(200,110,120,0.5)'; x.beginPath(); x.moveTo(1010, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(910, H); x.fill(); x.restore();
// divider + labels
R.line(x, [[1010, -10], [910, H + 10]], 26, '#111'); R.line(x, [[1010, -10], [910, H + 10]], 12, '#ffd23f');
C.outlined(x, 'DAY 1', 250, 130, 190, '#ffd23f', { lw: 26 }); C.outlined(x, 'DAY 5', 1670, 130, 190, '#ff4a3a', { lw: 26 });
C.outlined(x, 'BITTEN?', 1650, 930, 120, '#f4efe4', { lw: 20 });
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
