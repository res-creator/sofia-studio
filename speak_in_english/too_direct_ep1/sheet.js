const K = require('./hand_kit'), F = require('./folk'), CC = require('./cast_cafe'), fs = require('fs');
const ids = Object.keys(CC), W = 520 * ids.length, H = 1900, cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H);
ids.forEach((id, i) => { g.save(); g.translate(i * 520 + 260, 100); g.scale(.85, .85); g.translate(-540, 0); F.person(CC[id], {x: 540, pose: 'down', mood: 'neutral', poseK: 1}); g.restore(); K.hand(id, i * 520 + 260, 1820, 70, '#251c1a'); });
fs.mkdirSync('out', {recursive: true}); fs.writeFileSync('out/cast_sheet.png', cv.toBuffer('image/png'));
