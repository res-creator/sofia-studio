// Cover 1080x1920 for "How McDonald's Really Makes Money" (TikTok-safe: key content inside the 3:4 grid crop, no brand logos).
// Usage: node cover.js cover.png   (uses the same kit as the video; the video itself is unchanged)
require('./engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, restaurant, slab, burgerMoney, coin, contact } = K;
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
x.fillStyle = C.yellow; x.beginPath(); x.arc(540, 1120, 420, 0, 7); x.fill();
// title inside the 3:4 profile-grid crop (y 240..1680) and away from the right-hand buttons
x.textAlign = 'center'; x.fillStyle = C.ink; x.font = `100px ${F.black}`; x.fillText("HOW McDONALD'S", 540, 390); x.fillText('REALLY MAKES', 540, 500);
x.save(); x.translate(540, 612); x.rotate(-0.03); cut(x, () => rr(x, -300, -80, 600, 150, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.font = `130px ${F.black}`; x.fillText('MONEY', 0, 46); x.restore();
// restaurant on its land, coins buried in the soil; logos replaced (sign "$", roof "BURGERS") so the cover never looks like brand artwork
const G = 1250, S = 1.0;
slab(x, 540, G, S, { w: 640, depth: 230, top: 64, coins: 1, plot: 1 });
contact(x, 540, G - 29 + 2, 250 * S, 18, 0.25); restaurant(x, 540, G - 29, S);
x.save(); x.translate(540, G - 29); x.scale(S, S);
cut(x, () => rr(x, 114, -500, 124, 116, 22), C.red, { sb: 18 }); x.fillStyle = C.yellow; x.font = `92px ${F.black}`; x.textAlign = 'center'; x.fillText('$', 176, -408);
cut(x, () => rr(x, -212, -296, 424, 64, 14), C.yellow, { sb: 14 }); x.fillStyle = C.ink; x.font = `40px ${F.black}`; x.fillText('BURGERS', 0, -250);
x.restore();
x.save(); x.translate(235, 1430); x.rotate(-0.08); burgerMoney(x, 0, 0, 0.55, 0); x.restore();
for (let i = 0; i < 5; i++) coin(x, 850, 1440 - i * 22, 48, 0.02, { flat: i > 0 });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
