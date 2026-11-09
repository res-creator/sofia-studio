require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const T = require('./toon');
const c = createCanvas(1600, 1200), x = c.getContext('2d');
x.fillStyle = '#E9D9B8'; x.fillRect(0, 0, 1600, 1200);
T.drawEarl(x, 330, 1150, 1, { mouth: { open: 0.6 }, armR: [190, -330], armL: [-190,-330] });
T.drawFridge(x, 850, 1150, { mode: 'face', mood: 'happy', talk: 0.4 });
T.drawPenny(x, 1350, 1150, 1, { mouth: { open: 0.3 }, holdR: c2 => T.iceCream(c2, 1) });
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
