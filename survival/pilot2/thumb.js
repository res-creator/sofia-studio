// Thumbnail 1280x720 for the full pilot: DAY 1 (sunset deck, waiter) | DAY 30 (engine room, BRIDGE OVERRIDE). node thumb.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const C = require('./common'), L = C.L;
const W = 1920, H = 1080, c = createCanvas(W, H), x = c.getContext('2d');
// left: day 1 at sea
x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(1010, 0); x.lineTo(910, H); x.lineTo(0, H); x.clip();
C.outside(x, 0, { sky: 'dusk' }); C.liner(x, 620, 760, 0.8, 0, {});
x.save(); x.translate(560, 1180); L.hero(x, 0, 0, 1.7, { dir: 1, look: 0.4, grin: true, hands: { near: [90, -300] } }); x.restore(); x.restore();
// right: day 30 engine room, red alert
x.save(); x.beginPath(); x.moveTo(1010, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(910, H); x.clip();
x.save(); x.translate(-200, -80); x.scale(1.15, 1.15); C.engine(x, 0.3, { running: true, override: true, rudder: 0.8, fuel: 0.04, cctv: (q, t, X, Y, w, h) => C.cctvBridge(q, t, X, Y, w, h, 0.6) }); x.restore();
x.fillStyle = 'rgba(200,30,30,0.25)'; x.fillRect(900, 0, W, H);
L.rosa(x, 1700, 1180, 1.6, { dir: -1, lamp: true, scared: true, sweat: true, brow: 'worried' });
L.hero(x, 1380, 1200, 1.7, { dir: 1, scared: true, sweat: true, brow: 'worried', lookUp: true, hands: { near: [70, -270] }, prop: (q, hn) => L.pan(q, hn, 0.9, 150) });
x.restore();
L.stroke(x, [[1010, -10], [910, H + 10]], 26, '#111'); L.stroke(x, [[1010, -10], [910, H + 10]], 12, '#ffd23f');
const big = (t, X, col) => { x.save(); x.font = '170px Anton'; x.textAlign = 'center'; x.lineJoin = 'round'; x.lineWidth = 26; x.strokeStyle = '#111'; x.strokeText(t, X, 190); x.fillStyle = col; x.fillText(t, X, 190); x.restore(); };
big('DAY 1', 430, '#ffd23f'); big('DAY 30', 1500, '#ff4a3a');
const out = createCanvas(1280, 720); out.getContext('2d').drawImage(c, 0, 0, 1280, 720);
require('fs').writeFileSync(process.argv[2], out.toBuffer('image/png')); console.log(L.QA.join('\n') || 'QA ok');
