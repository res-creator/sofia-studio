// Ep4 thumbnail 1280x720: node ep4/thumb.js [out.png]
require('../lib/fonts');
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { drawGus } = require('../lib/gus');
const { drawSofia } = require('../lib/sofia');
const { phoneProp } = require('../lib/town');
const U = require('../lib/ui');
const { paint, roundRect } = require('../lib/draw');
const G = require('./bg_green');

const W = 1280, H = 720, c = createCanvas(W, H), x = c.getContext('2d');
// Green Street around the BIG BURGER sign
x.save(); x.translate(W / 2, H / 2); x.scale(0.95, 0.95); x.translate(-2050, -560);
G.drawGreen(x);
x.restore();
// Sofia, shocked, big (right)
drawSofia(x, 1100, 735, 0.82, { turn: -0.15, look: [-0.6, 0], wide: 1, brow: { l: 0.9, r: 0.9, worry: 0.6 }, mouth: { open: 0.8, smile: -0.3, o: 0.7 },
  armL: [-110, -380], armR: [110, -380], handL: 'open', handR: 'open', armsFront: true });
// Gus panicking with the dead phone (centre)
drawGus(x, 600, 745, 0.9, { face: 1, honk: 2.2, lids: 0, neck: -0.25, wing: 0.9, look: 0.3,
  hold: (cx, f, h) => { cx.translate(h.hx + 125, h.hy + 50); cx.rotate(0.15); phoneProp(cx, 1.2, 'empty'); } });
// darken left for the title
const lg = x.createLinearGradient(0, 0, 640, 0); lg.addColorStop(0, 'rgba(25,30,60,0.8)'); lg.addColorStop(1, 'rgba(25,30,60,0)'); x.fillStyle = lg; x.fillRect(0, 0, W, H);
// title
x.save(); x.translate(270, 210); x.rotate(-0.06);
U.textOutlined(x, 'GUS IS', 0, -20, 96, '#FFFFFF', { olw: 20 });
U.textOutlined(x, 'LOST!', 0, 110, 150, '#FFD23F', { olw: 24 });
x.restore();
x.save(); x.translate(270, 470); x.rotate(-0.03); paint(x, q => roundRect(q, -230, -46, 460, 92, 24), '#2E6FD8', { lw: 7 }); U.textOutlined(x, 'ASK FOR DIRECTIONS', 0, 17, 44, '#FFFFFF', { olw: 8 }); x.restore();
x.save(); x.translate(190, 580); paint(x, q => roundRect(q, -130, -38, 260, 76, 20), '#3DAA6E', { lw: 7 }); U.textOutlined(x, 'EASY ENGLISH', 0, 16, 38, '#FFFFFF', { olw: 7 }); x.restore();
x.save(); x.translate(410, 580); paint(x, q => roundRect(q, -80, -38, 160, 76, 20), '#FF7A2F', { lw: 7 }); U.textOutlined(x, 'A1–A2', 0, 16, 42, '#FFFFFF', { olw: 8 }); x.restore();
// "0%" burst near the phone
x.save(); x.translate(800, 150); x.rotate(0.12);
paint(x, q => { const n = 12; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 60 : 88; const xx = Math.cos(a) * r * 1.4, yy = Math.sin(a) * r * 0.8; i ? q.lineTo(xx, yy) : q.moveTo(xx, yy); } q.closePath(); }, '#FFD23F', { lw: 7 });
U.textOutlined(x, '0%', 0, 20, 62, '#E5484D', { olw: 10 });
x.restore();
require('fs').writeFileSync(process.argv[2] || __dirname + '/thumbnail.png', c.toBuffer('image/png'));
