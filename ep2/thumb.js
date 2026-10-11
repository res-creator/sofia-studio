// Episode 2 YouTube thumbnail 1280x720: Gus with a HUGE open beak on the exam table, shocked Dr. Max, big "5 BURGERS?!" text.
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { drawGus } = require('../lib/gus');
const { drawDrMax } = require('../lib/drmax');
const U = require('../lib/ui');
const { paint, roundRect, OL, line } = require('../lib/draw');
const B2 = require('./bg2');
const W = 1280, H = 720, c = createCanvas(W, H), x = c.getContext('2d');

// background: exam room, framed on Gus + Dr. Max
const bg = B2.exam();
x.save(); x.translate(W / 2, H / 2); x.scale(0.8, 0.8); x.translate(-800, -914);
x.drawImage(bg, 0, 0, B2.WW, B2.HH);
B2.examTable(x);
drawGus(x, 860, B2.TABLE.top, 0.98, { face: 1, honk: 2.3, lids: 0, neck: -0.2, wing: 0.7, look: 0.5 });
drawDrMax(x, 1330, 1500 - 280 * 0.74, 0.74, { surprise: 1, lean: 0.08, browL: 1, browR: 1, wide: 0.6, mouth: { open: 0.6, smile: 0, w: 1.2 }, turn: -0.3, look: [-0.8, -0.3], clipboard: false, armL: [-130, -230], armR: [130, -230], handL: 'open', handR: 'open', armsFront: true });
x.restore();
// darken the left third for the title
const lg = x.createLinearGradient(0, 0, 620, 0); lg.addColorStop(0, 'rgba(25,30,60,0.75)'); lg.addColorStop(1, 'rgba(25,30,60,0)'); x.fillStyle = lg; x.fillRect(0, 0, W, H);
// burger wrappers flying around
function wrapper(X, Y, s, r) { x.save(); x.translate(X, Y); x.rotate(r); x.scale(s, s); paint(x, q => { q.moveTo(-58, -10); q.lineTo(-30, -38); q.lineTo(20, -36); q.lineTo(58, -8); q.lineTo(44, 30); q.lineTo(-10, 38); q.lineTo(-52, 22); q.closePath(); }, '#FFE07A', { shade: '#E8B640', sx: 6, sy: 6, lw: 5 }); x.fillStyle = '#E5484D'; x.fillRect(-56, -6, 112, 14); x.restore(); }
[[600, 80, 0.8, -0.4], [640, 660, 0.8, 0.5], [900, 70, 0.7, 0.3], [1230, 640, 0.75, 0.8], [1240, 300, 0.6, -0.6]].forEach(a => wrapper(...a));
// title
x.save(); x.translate(285, 200); x.rotate(-0.06);
U.textOutlined(x, '5 BURGERS', 0, -10, 104, '#FFFFFF', { olw: 22 });
U.textOutlined(x, 'FOR', 0, 75, 64, '#FFD23F', { olw: 14 });
U.textOutlined(x, 'BREAKFAST?!', 0, 160, 86, '#FFD23F', { olw: 18 });
x.restore();
// red-cross doctor badge + level badges
x.save(); x.translate(270, 470); x.rotate(-0.03); paint(x, q => roundRect(q, -205, -46, 410, 92, 24), '#2E6FD8', { lw: 7 }); U.textOutlined(x, 'AT THE DOCTOR', 0, 18, 50, '#FFFFFF', { olw: 9 }); x.restore();
x.save(); x.translate(190, 580); paint(x, q => roundRect(q, -130, -38, 260, 76, 20), '#3DAA6E', { lw: 7 }); U.textOutlined(x, 'EASY ENGLISH', 0, 16, 38, '#FFFFFF', { olw: 7 }); x.restore();
x.save(); x.translate(410, 580); paint(x, q => roundRect(q, -80, -38, 160, 76, 20), '#FF7A2F', { lw: 7 }); U.textOutlined(x, 'A1–A2', 0, 16, 42, '#FFFFFF', { olw: 8 }); x.restore();
// "AAAH!" burst near the beak
x.save(); x.translate(1110, 110); x.rotate(0.12);
paint(x, q => { const n = 12; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 70 : 100; const xx = Math.cos(a) * r * 1.5, yy = Math.sin(a) * r * 0.8; i ? q.lineTo(xx, yy) : q.moveTo(xx, yy); } q.closePath(); }, '#FFD23F', { lw: 7 });
U.textOutlined(x, 'AAAH!', 0, 22, 62, '#E5484D', { olw: 10 });
x.restore();
require('fs').writeFileSync(process.argv[2] || 'ep2/thumbnail.png', c.toBuffer('image/png'));
