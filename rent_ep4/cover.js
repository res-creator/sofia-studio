// Cover 1080x1920 for "Your Landlord's Secret Algorithm" (TikTok-safe: title + hero inside the 3:4 grid crop, nothing under the right rail, no logos).
// Usage: node cover.js -> your_landlords_secret_algorithm_cover.png
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, flat, contact, hash } = K;
const { R4, text, building, server } = require('./rentkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 14; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
x.fillStyle = C.yellow; x.beginPath(); x.arc(520, 1130, 430, 0, 7); x.fill();
x.textAlign = 'center'; x.fillStyle = C.ink; x.font = `130px ${F.black}`; x.fillText('WHO SETS', 520, 400);
x.font = `140px ${F.black}`; const tw = x.measureText('YOUR RENT?').width + 80;
x.save(); x.translate(520, 535); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -92, tw, 168, 12), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.fillText('YOUR RENT?', 0, 50); x.restore();
// shared system in the middle, wires from both rivals
const SY = 900;
x.save(); x.lineCap = 'round';
for (const [x0, y0] of [[250, 1080], [790, 1080]]) { x.lineWidth = 30; x.strokeStyle = C.ink; x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(x0, SY, 520 + (x0 < 520 ? -70 : 70), SY + 10); x.stroke(); x.lineWidth = 17; x.strokeStyle = C.yellow; x.stroke(); }
x.restore();
x.save(); x.translate(520, SY); x.scale(0.62, 0.62); server(x, 0.3, { on: 1, lights: 8 }); x.restore();
contact(x, 250, 1462, 190, 16, 0.25); contact(x, 790, 1462, 190, 16, 0.25);
building(x, { x: 250, y: 1460, s: 0.62, style: 'A', side: 1, seed: 1, price: { text: '$???', u: 1, bg: C.red } });
building(x, { x: 790, y: 1460, s: 0.62, style: 'B', side: -1, seed: 5, price: { text: '$???', u: 1, bg: C.ink } });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/your_landlords_secret_algorithm_cover.png', c.toBuffer('image/png'));
