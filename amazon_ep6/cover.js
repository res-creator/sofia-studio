// Cover 1080x1920 for "Why Amazon Sometimes Pays You to Keep Your Order": AMAZON SAID / KEEP IT?! — the box, the phone, the buyer.
// TikTok-safe: title + hero inside the 3:4 grid crop (y 240..1680), nothing under the right rail, brand as text only. Usage: node cover.js
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, hash } = K;
const { R4, text } = require('../rent_ep4/rentkit');
const { box, buyer, phoneA } = require('./amazonkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 14; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
x.fillStyle = C.yellow; x.beginPath(); x.arc(500, 1200, 430, 0, 7); x.fill();
x.textAlign = 'center'; x.lineJoin = 'round'; x.font = `120px ${F.black}`; x.lineWidth = 20; x.strokeStyle = R4.paper; x.strokeText('AMAZON SAID', 510, 380); x.fillStyle = C.ink; x.fillText('AMAZON SAID', 510, 380);
x.font = `150px ${F.black}`; const tw = Math.min(960, x.measureText('KEEP IT?!').width + 80);
x.save(); x.translate(510, 535); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -96, tw, 176, 14), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(x, 'KEEP IT?!', 0, 52, 150, '#FFFFFF', F.black, 'center', tw - 60); x.restore();
// the phone (REFUND APPROVED), the big box, the surprised buyer
x.save(); x.translate(250, 960); x.rotate(-0.07); x.scale(0.9, 0.9); phoneA(x, [{ t: 'REFUND', size: 44 }, { t: 'APPROVED', size: 44, col: '#1C8A80' }, { t: 'KEEP THE ITEM', size: 40, col: '#FFFFFF', bg: C.red, k: 1.15 }], { check: true }); x.restore();
x.save(); x.translate(590, 1500); x.scale(1.28, 1.28); box(x, { w: 300, h: 210, tag: '$5 ITEM' }); x.restore();
buyer(x, 330, 1660, 0.95, { arms: 'down', look: 0.8, mood: 'o', eyes: 1.75 });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/amazon_keep_it_cover.png', c.toBuffer('image/png'));
