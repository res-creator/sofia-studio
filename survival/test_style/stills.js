// Comparison sheet: top row A+, bottom row D, same moments.
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const R = require('./rig'), SC = require('./scene');
const [ka, kb, file, title] = process.argv.length > 2 ? process.argv.slice(2) : ['A', 'D', 'compare_stills.png', 'A+ (top)  vs  D (bottom)'];
const TS = kb === 'D2' ? [0.45, 1.6, 7.4, 12.1, 14.5, 15.45, 16.2] : [0.45, 1.6, 7.4, 10.4, 12.1, 14.5, 15.6], sw = 480, sh = 270;
const out = createCanvas(TS.length * sw, 2 * sh + 50), o = out.getContext('2d'); o.fillStyle = '#101114'; o.fillRect(0, 0, out.width, out.height);
const c = createCanvas(1920, 1080), x = c.getContext('2d');
[ka, kb].forEach((k, r) => TS.forEach((t, i) => { SC.frame(x, Object.assign({}, R.SKINS[k], { garyVar: '20' }), t); o.drawImage(c, i * sw, 50 + r * sh, sw - 4, sh - 4); }));
o.fillStyle = '#fff'; o.font = '900 30px Nunito'; o.fillText(title, 16, 36);
o.font = '800 22px Nunito'; TS.forEach((t, i) => { if (i) o.fillText(t.toFixed(1) + 's', i * sw + sw - 70, 36); });
require('fs').writeFileSync(__dirname + '/out/' + file, out.toBuffer('image/png'));
