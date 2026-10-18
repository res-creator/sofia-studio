// Comparison sheet: top row A+, bottom row D, same moments.
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const R = require('./rig'), SC = require('./scene');
const TS = [0.45, 1.6, 7.4, 10.4, 12.1, 14.5, 15.6], sw = 480, sh = 270;
const out = createCanvas(TS.length * sw, 2 * sh + 50), o = out.getContext('2d'); o.fillStyle = '#101114'; o.fillRect(0, 0, out.width, out.height);
const c = createCanvas(1920, 1080), x = c.getContext('2d');
['A', 'D'].forEach((k, r) => TS.forEach((t, i) => { SC.frame(x, R.SKINS[k], t); o.drawImage(c, i * sw, 50 + r * sh, sw - 4, sh - 4); }));
o.fillStyle = '#fff'; o.font = '900 30px Nunito'; o.fillText('A+ (top)  vs  D (bottom)', 16, 36);
o.font = '800 22px Nunito'; TS.forEach((t, i) => o.fillText(t.toFixed(1) + 's', i * sw + sw - 70, 36));
require('fs').writeFileSync(__dirname + '/out/compare_stills.png', out.toBuffer('image/png'));
