// Model sheet of the crash-test dummy: node whatif/sheet.js out.png
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { drawDummy, drawDummyFx } = require('../lib/dummy');
const c = createCanvas(1800, 1100), x = c.getContext('2d');
x.fillStyle = '#16213E'; x.fillRect(0, 0, 1800, 1100);
const P = [
  { mouth: { open: 0.5, smile: 0.6 } },
  { eyes: 'wide', mouth: { open: 0.8, o: 1 }, brow: { l: -1, r: -1 }, armL: [-150, -330], armR: [150, -330], legs: 'flail' },
  { eyes: 'happy', mouth: { open: 0.6, smile: 1, teeth: 1 }, armR: [130, -360] },
  { shades: 1, mouth: { smile: 0.8 }, armL: [-60, -60] },
  { eyes: 'swirl', t: 0.3, mouth: { open: 0.3, o: 1 }, rot: 0.5, legs: 'tuck' },
  { eyes: 'x', mouth: { open: 0.2 }, squash: 0.6 },
  { glow: 1, eyes: 'wide', mouth: { open: 0.9 }, brow: { l: -1, r: -1 }, legs: 'flail', armL: [-160, -300], armR: [160, -300] },
  { frost: 1, eyes: 'shut', mouth: { open: 0.3, teeth: 1 }, armL: [40, -110], armR: [-40, -110] },
  { bandages: 2, eyes: 'happy', mouth: { open: 0.4, smile: 1 } },
];
P.forEach((p, i) => drawDummyFx(x, 130 + i * 192, 520 + (i % 2) * 520, 0.42 * 1.0, p));
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
