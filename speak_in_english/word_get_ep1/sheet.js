const K = require('./hand_kit'), F = require('./folk'), CC = require('./cast_get'), fs = require('fs');
const ids = Object.keys(CC), W = 460 * ids.length, H = 1900, cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H);
ids.forEach((id, i) => { g.save(); g.translate(i * 460 + 230, 100); g.scale(.8, .8); g.translate(-540, 0); F.person(CC[id], {x: 540, pose: 'down', mood: 'neutral', poseK: 1}); g.restore(); K.hand(id, i * 460 + 230, 1820, 64, '#251c1a'); });
fs.mkdirSync('out', {recursive: true}); fs.writeFileSync('out/cast_sheet.png', cv.toBuffer('image/png'));
