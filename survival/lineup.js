// Character check: node lineup.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const L = require('./lib');
const c = createCanvas(1920, 1080), x = c.getContext('2d'); x.fillStyle = '#2b3442'; x.fillRect(0, 0, 1920, 1080); x.fillStyle = '#3a4556'; x.fillRect(0, 760, 1920, 320);
L.hero(x, 260, 860, 1.2, {}); L.hero(x, 560, 860, 1.2, { dir: -1, arms: 'phone', scared: true, sweat: true }); L.hero(x, 860, 860, 1.2, { arms: 'push', walk: 0.8 }); L.hero(x, 1140, 860, 1.2, { arms: 'shush', dir: -1, look: -1 });
for (let i = 0; i < 3; i++) L.zombie(x, 1420 + i * 200, 860, 1.1, i, { dir: -1, walk: i, t: i });
require('fs').writeFileSync(process.argv[2] || 'lineup.png', c.toBuffer('image/png'));
