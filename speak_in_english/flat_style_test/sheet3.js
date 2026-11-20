const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas'), A = require('./anna');
const cv = createCanvas(2400, 1100), g = cv.getContext('2d'); g.fillStyle = '#f3e3c3'; g.fillRect(0, 0, 2400, 1100); g.fillStyle = '#d9b483'; g.fillRect(0, 980, 2400, 120);
const S = [{pose: 'down', mood: 'smile'}, {pose: 'wave', mouth: .7, brows: 'up'}, {pose: 'hips', mood: 'sleepy'}, {pose: 'face', mood: 'o', wide: true, sweat: true}, {pose: 'phone', mood: 'flat'}];
S.forEach((s, i) => A.draw(g, {x: 240 + i * 480, y: 1000, s: .72, ...s}));
fs.writeFileSync('out/anna_v3.png', cv.toBuffer('image/png'));
