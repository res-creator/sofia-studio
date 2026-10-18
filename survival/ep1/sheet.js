// Character sheet for Ep1 cast (QA): node sheet.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const K = require('./lib/cast'), { R } = K;
const W = 3000, H = 1500, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = '#7e64a8'; x.fillRect(0, 0, W, H); x.fillStyle = '#3f7d70'; x.fillRect(0, 640, W, 110); x.fillRect(0, 1380, W, 120);
const G1 = 650, G2 = 1390, t = 0.4;
K.person(x, K.HERO, { pose: { x: 250, ground: G1 }, e: { eyes: 'open', mouth: 'smile' }, pack: true, packDuck: true, radio: true, radioOn: true, t }, 'hero');
K.person(x, K.HERO, { pose: { x: 560, ground: G1 }, e: { eyes: 'wide', brow: 'worried', mouth: 'o' }, bite: true, flip: true, t }, 'hero bite');
K.person(x, K.GARY, { pose: { x: 860, ground: G1 }, e: { eyes: 'open', brow: 'up', mouth: 'biggrin', blood: 1 }, neckBite: true, t }, 'gary');
K.person(x, K.SARAH, { pose: { x: 1160, ground: G1 }, e: { eyes: 'open', brow: 'neutral', mouth: 'smile' }, t }, 'sarah');
K.person(x, K.SARAH, { pose: { x: 1440, ground: G1 }, e: { eyes: 'wide', brow: 'worried', mouth: 'wide', open: 0.8 }, flip: true, t }, 'sarah2');
let i = 0; for (const k of ['office', 'jogger', 'big']) { const ch = K.ZB[k], X = 1800 + i * 380; K.person(x, ch, { pose: K.zombiePose(ch, X, G1, t + i, { u: 0.3 * i, seed: i }), e: K.ZFACE(t, i), t, seed: i }, 'z ' + k); i++; }
// sitting tests
K.person(x, K.HERO, { pose: { x: 2900 - 40, ground: G1, hop: 150, footN: [2900 - 210, G1 - 12], footF: [2900 - 180, G1 - 12], lean: -0.05 }, e: { eyes: 'half', mouth: 'flat' }, pack: false, t }, 'sit');
// animals row
const poses = ['sit', 'stalk', 'run', 'pounce', 'hiss']; poses.forEach((p, j) => K.cat(x, 260 + j * 420, G2, 1, t, p, p === 'sit' ? { eye: '#9be35a' } : { eye: '#ff3b30', glow: true, mouth: p === 'hiss' ? 'hiss' : 'closed', angry: true, puff: p === 'hiss' ? 1 : 0, u: 0.2 }));
K.cat(x, 2280, G2, 1, t, 'sit', { eye: '#ff3b30', glow: true, turn: 1, mouth: 'hiss', angry: true });
K.rat(x, 2560, G2, 1, t); K.pigeon(x, 2850, G2, 1, t); K.duck(x, 2700, 1000, 1.2);
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
console.log([...new Set(R.QA)].join('\n') || 'QA ok');
