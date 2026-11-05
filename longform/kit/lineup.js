// Cast & expression sheet for the long-form kit: node lineup.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const L = require('./look'), { toon, LOOKS } = require('./toon');
const cv = createCanvas(1920, 1080), ctx = cv.getContext('2d');
L.skyGrad(ctx, 0, 0, 1920, 1080, L.ERA.sepia.sky); L.planks(ctx, 0, 820, 1920, 260, L.ERA.sepia.floor);
const names = Object.keys(LOOKS), ex = ['neutral', 'happy', 'grin', 'shock', 'angry', 'sad', 'worried', 'smug', 'think', 'laugh', 'determined', 'wink', 'sleepy', 'disgust'];
const poses = ['stand', 'wave', 'point', 'cheer', 'shrug', 'hold', 'think', 'facepalm', 'shock', 'walk', 'run', 'arms', 'fist', 'carry'];
names.forEach((n, i) => { const x = 80 + (i % 14) * 132; toon(ctx, x, 800, 0.62, LOOKS[n], poses[i % poses.length], ex[i % ex.length], { t: i * 0.3 }); L.fitText(ctx, n, x, 830, 20, L.INK, 130); });
ex.forEach((e, i) => { const x = 80 + i * 132; toon(ctx, x, 1060, 0.5, LOOKS[Object.keys(LOOKS)[i % names.length]], 'stand', e, { t: 1 }); });
toon(ctx, 1400, 420, 1.2, LOOKS.pemberton, 'present', 'happy', { t: 1 });
toon(ctx, 1700, 420, 1.2, LOOKS.candler, 'point', 'smug', { t: 1 });
L.finish(ctx, 'sepia'); fs.writeFileSync(process.argv[2], cv.toBuffer('image/png'));
