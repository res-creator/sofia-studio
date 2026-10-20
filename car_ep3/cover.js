// Cover 1080x1920: title + data file + the car on yellow. Usage: node cover.js cover.png
require('../mcd_ep1/engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { F, C, cut, rr } = K;
const { car, folder, page } = require('./carkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.yellow; x.fillRect(0, 0, W, H);
x.textAlign = 'center'; x.fillStyle = C.ink; x.font = `118px ${F.black}`; x.fillText('YOUR CAR', 540, 330); x.fillText('WAS', 540, 450);
x.save(); x.translate(540, 560); x.rotate(-0.03); cut(x, () => rr(x, -430, -80, 860, 150, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.font = `124px ${F.black}`; x.fillText('REPORTING', 0, 44); x.restore();
x.fillStyle = C.ink; x.font = `118px ${F.black}`; x.fillText('ON YOU', 540, 760);
x.save(); x.translate(560, 1010); x.rotate(0.04); x.scale(0.62, 0.62); folder(x, { open: 0.25, label: 'DRIVING RECORDS', inside: y => { for (let k = 0; k < 4; k++) { y.save(); y.translate(-120 + k * 80, -150 - k * 8); y.rotate((k - 1.5) * 0.08); page(y, k); y.restore(); } } }); x.restore();
x.save(); x.translate(540, 1460); x.scale(0.96, 0.96); car(x, { glass: '#12151F' }); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
