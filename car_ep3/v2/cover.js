// Cover 1080x1920 for the v2 car cut (TikTok-safe: key content inside the 3:4 grid crop, nothing in the caption zone).
require('../../mcd_ep1/engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../../tests/mcd_collage/kit');
const { C, F, cut, rr } = K;
const { page } = require('../carkit');
const { roadScene, carTurn } = require('./car3d');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = '#0E1326'; x.fillRect(0, 0, W, H);
x.save(); x.translate(540, 1030); x.scale(1.25, 1.25); roadScene(x, 2.0, { speed: 1, car: false }); x.restore();
x.textAlign = 'center'; x.fillStyle = '#FFFFFF'; x.font = `108px ${F.black}`; x.fillText('YOUR CAR WAS', 540, 390);
x.save(); x.translate(540, 505); x.rotate(-0.03); cut(x, () => rr(x, -400, -80, 800, 150, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.font = `122px ${F.black}`; x.fillText('REPORTING', 0, 44); x.restore();
x.fillStyle = '#FFFFFF'; x.font = `108px ${F.black}`; x.fillText('ON YOU', 540, 690);
for (let i = 0; i < 5; i++) { x.save(); x.translate(470 + i * 70 - (i % 2) * 40, 1060 - i * 70); x.rotate((i - 2) * 0.18); x.scale(0.42 - i * 0.04, 0.42 - i * 0.04); page(x, i); x.restore(); } // records leaving the car
x.save(); x.translate(505, 1440); x.scale(0.78, 0.78); carTurn(x, 0.75, { glass: '#12151F', lights: true }); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
