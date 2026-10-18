const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const R = require('./rig'), P = require('./props');
const c = createCanvas(1920, 1080), x = c.getContext('2d'); x.fillStyle = '#56657a'; x.fillRect(0, 0, 1920, 1080); x.fillStyle = '#6b5544'; x.fillRect(0, 900, 1920, 180);
for (const [i, sk] of [[0, 'A'], [1, 'D']]) {
  const S = R.SKINS[sk], ox = i * 960;
  // hero holding a bat, ready
  const b = P.bat([ox + 240, 560], -2.2, 300 * (sk === 'D' ? 0.85 : 1));
  const J = R.solveGrip(S, { x: ox + 300, ground: 900, crouch: 0.3, lean: 0.12 }, { near: b.high, far: b.low }, sk + ' hero');
  R.drawChar(x, S, R.CAST.hero[sk], J, { eyes: 'wide', brow: 'worried', mouth: 'frown', sweat: 1 }, { farFront: true, hold: ctx => P.drawBat(ctx, S, b) });
  // gary with mug + wave
  const m = P.mug([ox + 590, 560]);
  const G = R.solveGrip(S, { x: ox + 720, ground: 900 }, { near: m.grip, far: [ox + 640, 360] }, sk + ' gary');
  R.drawChar(x, S, R.CAST.gary[sk], G, { eyes: 'open', brow: 'up', mouth: 'grin', blood: 1, look: [-0.6, 0] }, { farFront: true, farHand: 'wave', holdNear: ctx => P.drawMug(ctx, S, m), t: 0.2 });
}
console.log(R.QA.join('\n') || 'QA ok');
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
