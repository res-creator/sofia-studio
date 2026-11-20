// node speak/ourcast_tl/tl_sheet.js out.png  -> sheet: heroine talking, heroine smiling, Tom surprised, two-shot
const K = require('./tl_kit'); const { heroine, tom, VIS } = require('./tl_cast');
const W = 1080, H = 1920, cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
const bg = (c1, c2) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c1; g.fillRect(0, 0, W, H); g.save(); g.rotate(-0.5); g.fillStyle = c2; for (let x = -2000; x < 2000; x += 140) g.fillRect(x, -400, 70, 3200); g.restore(); };
const cam = (z, cx, cy) => { g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); };
const F = [
  () => { bg('#f9d3e2', '#f6c1d6'); cam(.62, 540, 1290); heroine({ armA: 'hips', smile: .6 }); },
  () => { bg('#dcefff', '#cbe5fb'); cam(.62, 540, 1290); tom({ armA: 'point', mo: VIS.O, browUp: 14 }); },
  () => { bg('#fff1cf', '#ffe7b0'); cam(1.3, 540, 960); heroine({ mo: VIS.A, armA: 'spread', browUp: 6 }); },
  () => { bg('#e4f4ea', '#d0ecdb'); cam(.5, 540, 1300); tom({ x: 260, armA: 'down', mo: VIS.E, look: .5, smile: .4 }); heroine({ x: 820, armA: 'wave', look: -.6, smile: .8 }); } ];
const sheet = K.createCanvas(F.length * 540, 960), sg = sheet.getContext('2d');
F.forEach((f, i) => { f(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(K.PAPER, 0, 0); sg.drawImage(cv, i * 540, 0, 540, 960); if (i === 0) require('fs').writeFileSync(process.argv[2].replace('.png', '_her.png'), cv.toBuffer('image/png')); });
require('fs').writeFileSync(process.argv[2], sheet.toBuffer('image/png')); console.log('ok');
