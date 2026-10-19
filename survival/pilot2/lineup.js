// Pose/prop check sheet for the full pilot cast: node lineup.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const L = require('./lib');
const c = createCanvas(2400, 1100), x = c.getContext('2d'); x.fillStyle = '#5d6b78'; x.fillRect(0, 0, 2400, 1100); x.fillStyle = '#3d4650'; x.fillRect(0, 900, 2400, 200);
const F = 900, s = 1.0;
L.hero(x, 150, F, s, { dir: 1 });
L.hero(x, 400, F, s, { dir: 1, walk: 1.2 });
L.crate(x, 660, F, 140, 100); L.hero(x, 640, F, s, { dir: 1, pose: 'sit', seat: 100, hands: { near: [60, -250], far: [40, -215] }, prop: (q, hn, hf) => { L.can(q, hf); L.spoon(q, hn, -1.0); }, chew: true, t: 0.4 });
L.hero(x, 900, F, s, { dir: 1, pose: 'crouch', crouch: 0.6, hands: { near: [90, -230] }, prop: (q, hn) => L.flashlight(q, hn, 0, true, 300) });
L.hero(x, 1140, F, s, { dir: 1, hands: { near: [70, -420], far: [-20, -400] }, scared: true });
L.hero(x, 1380, F, s, { dir: -1, hands: { near: [80, -236] }, prop: (q, hn) => L.bottle(q, [hn[0], hn[1] + 10]) });
L.rosa(x, 1640, F, s, { dir: -1, lamp: true, brow: 'angry', hands: { near: [120, -262], far: [104, -250] }, prop: (q, hn) => L.flareGun(q, [hn[0] + 8, hn[1] + 4], 0, -1) });
L.crate(x, 1900, F, 140, 100); L.rosa(x, 1880, F, s, { dir: 1, pose: 'sit', seat: 100, hands: { near: [70, -240], far: [56, -232] }, prop: (q, hn) => L.plate(q, hn[0] + 10, hn[1] - 2, 1) , smile: true });
L.zombie(x, 2180, F, s, 0, { dir: -1, walk: 2, t: 1 });
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png')); console.log(L.QA.join('\n') || 'QA ok');
