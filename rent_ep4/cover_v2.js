// Cover 1080x1920 for v2 (the new ending): IS THAT REALLY COMPETITION? — two rival buildings, one system recommending prices, the tenant paying.
// TikTok-safe: title + hero inside the 3:4 grid crop (y 240..1680), nothing under the right rail, no logos. Usage: node cover_v2.js
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, flat, contact, hash, bill } = K;
const { R4, text, building, realpageCard, recCard, tenant } = require('./rentkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 14; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
x.fillStyle = C.yellow; x.beginPath(); x.arc(520, 1180, 440, 0, 7); x.fill();
// title
x.textAlign = 'center'; x.font = `112px ${F.black}`; x.lineWidth = 20; x.lineJoin = 'round'; x.strokeStyle = R4.paper; x.strokeText('IS THAT REALLY', 520, 380); x.fillStyle = C.ink; x.fillText('IS THAT REALLY', 520, 380);
x.font = `128px ${F.black}`; const tw = Math.min(980, x.measureText('COMPETITION?').width + 70);
x.save(); x.translate(520, 515); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -86, tw, 158, 12), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(x, 'COMPETITION?', 0, 46, 128, '#FFFFFF', F.black, 'center', tw - 60); x.restore();
// one system above, recommending a price to each building
x.save(); x.setLineDash([16, 12]); x.lineWidth = 8; x.strokeStyle = C.ink; for (const bx of [270, 770]) { x.beginPath(); x.moveTo(520 + (bx - 520) * 0.45, 780); x.lineTo(bx, 905); x.stroke(); } x.restore();
x.save(); x.translate(520, 720); x.scale(0.62, 0.62); realpageCard(x, { lit: 4 }); x.restore();
for (const [bx, r] of [[270, -0.05], [770, 0.05]]) { x.save(); x.translate(bx, 950); x.rotate(r); x.scale(0.5, 0.5); recCard(x); x.restore(); }
contact(x, 270, 1502, 190, 16, 0.25); contact(x, 770, 1502, 190, 16, 0.25);
building(x, { x: 270, y: 1500, s: 0.72, h: 640, style: 'A', side: 1, seed: 1, price: { text: '$$$', u: 1, bg: C.red } });
building(x, { x: 770, y: 1500, s: 0.72, h: 640, style: 'B', side: -1, seed: 5, price: { text: '$$$', u: 1, bg: C.ink } });
// the tenant between them, money leaving the wallet
for (const [bx, by, r] of [[450, 1250, -0.4], [600, 1200, 0.5], [380, 1330, 0.2], [660, 1300, -0.3]]) bill(x, bx, by, 0.6, r);
tenant(x, 520, 1640, 0.7, { up: 1, sad: true });
x.save(); x.translate(500, 1640 - 120); x.rotate(-0.15); x.scale(0.7, 0.7); cut(x, () => rr(x, -60, -40, 120, 80, 12), '#5B3A29', { sb: 10, sy: 5, lw: 3.5 }); flat(x, () => rr(x, -50, -52, 100, 20, 4), C.bill); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/your_landlords_secret_algorithm_v2_cover.png', c.toBuffer('image/png'));
