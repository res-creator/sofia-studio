// Cover 1080x1920 for the final airline cut (TikTok-safe: key content inside the 3:4 grid crop, nothing in the caption zone).
require('../mcd_ep1/engine');
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr } = K;
const { A2, ticket, stamp, airliner } = require('./airkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A2.sky1); g.addColorStop(1, A2.sky2); x.fillStyle = g; x.fillRect(0, 0, W, H);
const back = createCanvas(W, H), b = back.getContext('2d'); b.translate(600, 860); b.rotate(-0.1); b.scale(0.7, 0.7); airliner(b);
x.save(); x.filter = 'blur(3px)'; x.drawImage(back, 0, 0); x.restore();
x.textAlign = 'center'; x.fillStyle = '#FFFFFF'; x.font = `104px ${F.black}`; x.fillText('WHY AIRLINES', 540, 390);
x.save(); x.translate(540, 505); x.rotate(-0.03); cut(x, () => rr(x, -360, -80, 720, 150, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); x.fillStyle = '#FFFFFF'; x.font = `122px ${F.black}`; x.fillText('OVERSELL', 0, 44); x.restore();
x.fillStyle = '#FFFFFF'; x.font = `104px ${F.black}`; x.fillText('SEATS', 540, 690);
x.save(); x.translate(520, 1160); x.rotate(-0.05); x.scale(0.6, 0.6); ticket(x, { bg: A2.sky2, seat: '14C' }); stamp(x, 'CONFIRMED', 10, 150, 0.72, 1, 0.1, '#1E9E6A'); stamp(x, 'NO SEAT?!', 0, 20, 1.08, 1, -0.2, C.red); x.restore();
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.6; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(process.argv[2] || 'cover.png', c.toBuffer('image/png'));
