// Cover 1080x1920 for "Why Her Medical Bill Doubled": $3,000 -> $6,000 / SAME PROCEDURE?! — the bill, the heroine, the office and the surgery center.
// TikTok-safe: title + hero inside the 3:4 grid crop (y 240..1680), nothing under the right rail, no logos. Usage: node cover.js
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, contact, hash } = K;
const { R4, text } = require('../rent_ep4/rentkit');
const { place, officeWindows, heroine, billDoc } = require('./medkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 14; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
x.fillStyle = C.yellow; x.beginPath(); x.arc(520, 1220, 430, 0, 7); x.fill();
// title: $3,000 -> $6,000 / SAME PROCEDURE?!
x.textAlign = 'center'; x.lineJoin = 'round';
const big = (s, cx, col) => { x.font = `124px ${F.black}`; x.lineWidth = 20; x.strokeStyle = R4.paper; x.strokeText(s, cx, 420); x.fillStyle = col; x.fillText(s, cx, 420); };
big('$3,000', 255, C.ink); big('$6,000', 785, C.red);
x.save(); x.translate(515, 378); x.scale(0.8, 0.8); x.fillStyle = C.ink; x.beginPath(); x.moveTo(-40, -22); x.lineTo(10, -22); x.lineTo(10, -50); x.lineTo(56, 0); x.lineTo(10, 50); x.lineTo(10, 22); x.lineTo(-40, 22); x.closePath(); x.fill(); x.restore();
x.font = `112px ${F.black}`; const tw = Math.min(980, x.measureText('SAME PROCEDURE?!').width + 70);
x.save(); x.translate(520, 560); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -78, tw, 142, 12), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(x, 'SAME PROCEDURE?!', 0, 40, 112, '#FFFFFF', F.black, 'center', tw - 50); x.restore();
// the two kinds of buildings
contact(x, 250, 1502, 160, 16, 0.25); contact(x, 735, 1502, 180, 16, 0.25);
place(x, { x: 250, y: 1500, s: 0.9, w: 340, h: 300, style: 'OF', side: 1, seed: 3 }, "DOCTOR'S OFFICE", C.ink, '#FFFFFF', officeWindows);
place(x, { x: 735, y: 1500, s: 0.7, w: 440, h: 620, style: 'SC', side: -1, seed: 7 }, 'SURGERY CENTER', '#FFFFFF', C.ink);
// the final bill and her
x.save(); x.translate(500, 800); x.rotate(-0.05); x.scale(0.7, 0.7); billDoc(x, { head: 'FINAL BILL', amount: '~$6,000', where: 'SURGERY CENTER', col: C.red, amtCol: C.red }); x.restore();
heroine(x, 500, 1650, 0.95, { up: 1, eyes: 1.8, mood: 'o' });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/medical_bill_doubled_cover.png', c.toBuffer('image/png'));
