// Episode 4 thumbnail 1280x720: Gus swallowing the key card, shocked Carmen, "KEY CARD GONE?!"
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { drawGus } = require('../lib/gus');
const { drawCrew } = require('../lib/crew');
const U = require('../lib/ui');
const { paint, roundRect } = require('../lib/draw');
const B4 = require('./bg4');
const W = 1280, H = 720, c = createCanvas(W, H), x = c.getContext('2d');
x.save(); x.translate(W / 2 + 120, H / 2 + 60); x.scale(0.8, 0.8); x.translate(-1900, -1180);
x.drawImage(B4.lobby(), 0, 0, B4.WW, B4.HH);
drawCrew(x, 2250, 1436 - 280 * 0.82, 0.82, { turn: -0.3, look: [-0.8, 0.2], surprise: 1, browL: 1, browR: 1, wide: 0.7, mouth: { open: 0.7, smile: 0, w: 1.2 }, armL: [-110, -300], armR: [110, -300], handL: 'open', handR: 'open', armsFront: true }, 'carmen');
B4.desk4(x, {});
// key card in the beak
drawGus(x, 1700, 1560, 1.1, { face: 1, lids: 0, neck: -0.2, honk: 0.5, wing: 0.7, look: 0.4, squash: 1.04, hold: (c, f, h) => { c.translate(h.hx + 130, h.hy + 20); c.rotate(0.4); paint(c, q => roundRect(q, -50, -32, 100, 64, 8), '#2E6FD8', { lw: 6 }); c.fillStyle = '#F2C744'; c.fillRect(-36, -18, 22, 18); } });
x.restore();
const lg = x.createLinearGradient(0, 0, 700, 0); lg.addColorStop(0, 'rgba(60,15,25,0.8)'); lg.addColorStop(1, 'rgba(60,15,25,0)'); x.fillStyle = lg; x.fillRect(0, 0, W, H);
x.save(); x.translate(300, 190); x.rotate(-0.06);
U.textOutlined(x, 'KEY CARD', 0, -20, 104, '#FFFFFF', { olw: 22 });
U.textOutlined(x, 'GONE?!', 0, 100, 128, '#FFD23F', { olw: 24 });
x.restore();
x.save(); x.translate(275, 470); x.rotate(-0.03); paint(x, q => roundRect(q, -215, -46, 430, 92, 24), '#7A2432', { lw: 7 }); U.textOutlined(x, 'AT THE HOTEL', 0, 18, 48, '#FFFFFF', { olw: 9 }); x.restore();
x.save(); x.translate(190, 580); paint(x, q => roundRect(q, -130, -38, 260, 76, 20), '#3DAA6E', { lw: 7 }); U.textOutlined(x, 'EASY ENGLISH', 0, 16, 38, '#FFFFFF', { olw: 7 }); x.restore();
x.save(); x.translate(410, 580); paint(x, q => roundRect(q, -80, -38, 160, 76, 20), '#FF7A2F', { lw: 7 }); U.textOutlined(x, 'A1–A2', 0, 16, 42, '#FFFFFF', { olw: 8 }); x.restore();
require('fs').writeFileSync(process.argv[2] || 'ep4/thumbnail.png', c.toBuffer('image/png'));
