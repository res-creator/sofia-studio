const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas'), T = require('./toon'), C0 = require('./cast_toon');
fs.mkdirSync('sprites', {recursive: true});
const C = {hero: C0.hero,
  brit: {hair: 'short', pal: {skin: '#f6d6c4', skinS: '#e6b8a0', hair: '#c8a060', brow: '#8a6a3a', top: '#7a5a3a', topS: '#5a3e24', tie: '#2f4a7a', collar: '#ffffff', bottom: '#3a3a4a', legs: '#3a3a4a', shoe: '#2a1a14', sole: '#2a1a14'}}};
const P = {hero: {conf: {pose: 'shrug', mood: 'surprised'}, ask: {pose: 'down', mood: 'flat'}, angry: {pose: 'fists', mood: 'angry'}, shock: {pose: 'shrug', mood: 'surprised', sweat: true}, hope: {pose: 'hold', mood: 'smug'}},
  brit: {smug: {pose: 'down', mood: 'smug'}, polite: {pose: 'hold', mood: 'grin'}, shrug: {pose: 'shrug', mood: 'smug'}}};
for (const w in P) for (const [k, st] of Object.entries(P[w])) [0, .5, 1].forEach((m, i) => { const cv = createCanvas(640, 1560), g = cv.getContext('2d'); T.draw(g, {x: 320, y: 1540, s: 1, ...C[w], ...st, mouth: m}); fs.writeFileSync(`sprites/${w}_${k}_m${i}.png`, cv.toBuffer('image/png')); });
fs.writeFileSync('sprites/list.json', JSON.stringify(fs.readdirSync('sprites').filter(f => f.endsWith('.png')).map(f => f.slice(0, -4))));
console.log('ok');
