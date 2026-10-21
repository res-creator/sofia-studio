// Cover 1080x1920: big boarding pass + NO SEAT?! stamp, airliner behind, sky. Usage: node cover.js cover.png
require('../mcd_ep1/engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { A2, ticket, airliner } = require('./airkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A2.sky1); g.addColorStop(1, A2.sky2); x.fillStyle = g; x.fillRect(0, 0, W, H);
const back = createCanvas(W, H), b = back.getContext('2d'); // airliner on the back plane, slightly out of focus
b.translate(560, 470); b.rotate(-0.12); b.scale(0.78, 0.78); airliner(b);
x.save(); x.filter = 'blur(3px)'; x.drawImage(back, 0, 0); x.restore();
x.save(); x.translate(520, 1060); x.rotate(-0.05); x.scale(0.94, 0.94); ticket(x, { bg: A2.sky2, stamp: 1 }); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
