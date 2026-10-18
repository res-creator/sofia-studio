// Location sheet (QA): node setsheet.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const SE = require('./lib/sets'), K = require('./lib/cast');
const W = 1920, H = 1080, cols = 3, sw = 960, sh = 540, views = [
  ['apt left', c => { c.scale(0.5, 0.5); c.translate(-100, 0); SE.apartment(c, 1, {}); SE.chain(c, [645, 469]); }],
  ['apt right', c => { c.scale(0.5, 0.5); c.translate(-1700, 0); SE.apartment(c, 1, {}); }],
  ['apt night', c => { c.scale(0.5, 0.5); c.translate(-1500, 0); SE.apartment(c, 1, { night: true, clock: [3, 12] }); SE.aptNight(c, { tv: true }); }],
  ['market', c => { c.scale(0.5, 0.5); c.translate(-200, 0); SE.market(c, 1); SE.crowd(c, 1, 0, 2000, 6); SE.cartDraw(c, 900, SE.FLOOR, [(x, a, b) => SE.ITEMS.water(x, a + 40, b), (x, a, b) => SE.ITEMS.can(x, a + 40, b)]); }],
  ['stairs', c => { c.scale(0.33, 0.33); c.translate(700, 600); SE.stairwell(c, 1, { graffiti: { 1: 1 } }); for (let i = 0; i < 3; i++) { const p = SE.climbPose(K.HERO, i, 100 + i * 150); K.person(c, K.HERO, { pose: p.pose, flip: p.flip, e: {}, t: 1 }, 'climb'); } }],
  ['roof day', c => { c.scale(0.4, 0.4); c.translate(200, 400); SE.roof(c, 1, 'day', { pipe: true }); }],
  ['roof night', c => { c.scale(0.4, 0.4); c.translate(200, 400); SE.roof(c, 1, 'night'); }],
  ['facade', c => { c.scale(0.2, 0.2); c.translate(1500, -300); SE.facade(c, 1); }],
  ['tech room', c => { c.scale(0.5, 0.5); c.translate(100, 0); SE.techRoom(c, 1, { feet: true }); SE.aidKit(c, 700, 860, 0.8); SE.bandaid(c, 1100, 800, 1); }],
];
const out = createCanvas(sw * cols, sh * Math.ceil(views.length / cols)), o = out.getContext('2d');
views.forEach(([n, f], i) => { const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); f(x); o.drawImage(c, (i % cols) * sw, Math.floor(i / cols) * sh, sw, sh); o.fillStyle = '#ff0'; o.font = '30px Anton'; o.fillText(n, (i % cols) * sw + 10, Math.floor(i / cols) * sh + 36); });
require('fs').writeFileSync(process.argv[2], out.toBuffer('image/png')); console.log([...new Set(K.R.QA)].join('\n') || 'QA ok');
