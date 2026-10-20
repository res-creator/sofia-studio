// Cover 1080x1920 for "How McDonald's Really Makes Money": title + restaurant on its land (coins in the soil) + the burger.
// Usage: node cover.js cover.png   (uses the same kit as the video; the video itself is unchanged)
require('./engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, restaurant, slab, burgerMoney, coin, contact } = K;
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
x.fillStyle = C.yellow; x.beginPath(); x.arc(540, 1110, 430, 0, 7); x.fill();
// title
x.textAlign = 'center'; x.fillStyle = C.ink; x.font = `96px ${F.black}`; x.fillText("HOW McDONALD'S", 540, 290); x.fillText('REALLY MAKES', 540, 395);
x.save(); x.translate(540, 505); x.rotate(-0.03); cut(x, () => rr(x, -300, -80, 600, 150, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.font = `130px ${F.black}`; x.fillText('MONEY', 0, 46); x.restore();
// restaurant on its land, coins buried in the soil
slab(x, 540, 1225, 1.05, { w: 640, depth: 330, top: 64, coins: 1, plot: 1 });
contact(x, 540, 1225 - 30 + 2, 250 * 1.05, 18, 0.25); restaurant(x, 540, 1225 - 30, 1.05);
// the burger in front, and a little stack of coins
x.save(); x.translate(250, 1640); x.rotate(-0.08); burgerMoney(x, 0, 0, 0.62, 0); x.restore();
for (let i = 0; i < 5; i++) coin(x, 850, 1630 - i * 22, 52, 0.02, { flat: i > 0 });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
