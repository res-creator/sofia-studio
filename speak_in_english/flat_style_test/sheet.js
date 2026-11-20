const fs = require('fs'), K = require('./flat'); const W = 2160, H = 1300, cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
g.fillStyle = '#f6e7c8'; g.fillRect(0, 0, W, H);
const ANNA = {skin: '#fcd2b4', skinS: '#efb08c', hair: '#9a4a24', hairS: '#7a3418', hairL: '#c06a3a', hairStyle: 'part', top: '#8e7cc3', topS: '#6f5ca8', collar: '#fffaf0', pendant: '#ffcc12', freckles: true, brow: '#5a2a14'};
const st = [{mood: 'smile'}, {mood: 'o', wide: true, brows: 'up'}, {mood: 'flat', sweat: true, arms: 'face', wide: true}, {mouth: .8, brows: 'angry'}];
st.forEach((s, i) => K.person(ANNA, {x: 290 + i * 530, y: 420, arms: 'desk', ...s}));
g.fillStyle = '#b8794a'; g.fillRect(0, 900, W, 60); fs.writeFileSync('out/anna_sheet.png', cv.toBuffer('image/png'));
