// Location sheet for Cruise Ship (QA): node setsheet.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const SH = require('./lib/ship'), K = require('./lib/cast'), C = require('./lib/core');
const W = 1920, H = 1080, sw = 960, sh = 540, t = 3;
const views = [
  ['pool deck', c => { C.cam(c, t, [[0, 1500, 560, 0.55]], { drift: 0 }); SH.poolDeck(c, t); }],
  ['corridor (night)', c => { C.cam(c, t, [[0, 1400, 560, 0.7]], { drift: 0 }); SH.corridor(c, t, { emergency: true }); SH.corridorLight(c, t); }],
  ['lobby', c => { C.cam(c, t, [[0, 900, 540, 0.75]], { drift: 0 }); SH.lobby(c, t); }],
  ['lifeboats', c => { C.cam(c, t, [[0, 1500, 600, 0.5]], { drift: 0 }); SH.lifeboats(c, t); }],
  ['galley', c => { C.cam(c, t, [[0, 1500, 540, 0.55]], { drift: 0 }); SH.galley(c, t, { cart: 140, tally: 7, swing: 0.1, porthole: q => SH.lighthouse(q, 1990, 340, t, 0.3) }); SH.darkness(c, 0.5, [{ x: 1300, y: 300, r: 900 }]); }],
  ['cold room open', c => { C.cam(c, t, [[0, 2900, 560, 1.0]], { drift: 0 }); SH.galley(c, t, { coldOpen: true, bread: 0.5, hatchOpen: true }); }],
  ['crew mess', c => { C.cam(c, t, [[0, 1100, 560, 0.7]], { drift: 0 }); SH.crewMess(c, t, { iceOn: true }); SH.darkness(c, 0.55, [{ x: 1800, y: 500, r: 700 }]); }],
  ['POV corridor', c => SH.pov(c, t, 300, 'corridor', { lights: [{ x: 960, y: 540, r: 700 }] })],
  ['POV tunnel', c => SH.pov(c, t, 300, 'tunnel', { lights: [{ cone: [960, 900, -Math.PI / 2, 0.5, 900] }] })],
  ['engine room', c => { C.cam(c, t, [[0, 1600, 500, 0.6]], { drift: 0 }); SH.engineRoom(c, t, { running: true, tally: 22, stove: true, cctv: (q, tt, x, y, w, h) => SH.cctvBridge(q, tt, x, y, w, h, { turn: 0.5 }) }); SH.tint(c, '#d8a0a0'); }],
  ['liner at night', c => { C.cam(c, t, [[0, 1500, 500, 0.5]], { drift: 0 }); SH.sky(c, 'night', t); SH.sea(c, 700, 'night', t); SH.liner(c, 300, 900, t, { wake: 1 }); SH.lighthouse(c, -600, 700, t, 0.6); }],
];
const out = createCanvas(sw * 3, sh * Math.ceil(views.length / 3)), o = out.getContext('2d');
views.forEach(([n, f], i) => { const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.save(); f(x); x.restore(); o.drawImage(c, (i % 3) * sw, Math.floor(i / 3) * sh, sw, sh); o.fillStyle = '#ff0'; o.font = '30px Anton'; o.fillText(n, (i % 3) * sw + 10, Math.floor(i / 3) * sh + 36); });
require('fs').writeFileSync(process.argv[2], out.toBuffer('image/png')); console.log('ok');
