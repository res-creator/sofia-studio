// Character sheet: node sheet.js -> out/cast_sheet.png
const K = require('./hand_kit'), PE = require('./people'), fs = require('fs');
const W = 2400, H = 2000, cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H);
const items = [['Аня', PE.anya, {pose: 'down', mood: 'happy'}], ['Макс', PE.max, {pose: 'hips', mood: 'smug'}], ['Курьер', PE.courier, {pose: 'presentR', mood: 'happy', mouth: .6}], ['Продавщица', PE.seller, {pose: 'presentL', mood: 'neutral'}]];
items.forEach(([n, fn, st], i) => { g.save(); g.translate(i * 600 + 300, 160); g.scale(.95, .95); g.translate(-540, 0); fn({x: 540, ...st, poseK: 1}); g.restore(); K.hand(n, i * 600 + 300, 1900, 80, '#251c1a'); });
g.drawImage(K.PAPER, 0, 0); g.drawImage(K.PAPER, 1080, 0); g.drawImage(K.PAPER, 2160, 0);
fs.mkdirSync(__dirname + '/out', {recursive: true}); fs.writeFileSync(__dirname + '/out/cast_sheet.png', cv.toBuffer('image/png'));
