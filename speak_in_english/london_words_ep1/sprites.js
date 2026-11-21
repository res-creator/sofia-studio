// Character cutouts (toon.js) for the London episode: standing 640x1560 (feet at bottom), 3 mouth frames each.
const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas'), T = require('./toon'), C0 = require('./cast_toon');
fs.mkdirSync('sprites', {recursive: true});
const C = {...C0,
  granny: {hair: 'bun', glasses: true, skirt: true, pal: {skin: '#f6d6c4', skinS: '#e6b8a0', hair: '#d8d8e0', hairS: '#b8b8c4', brow: '#a0a0b0', top: '#8a5ab0', topS: '#6a3a90', collar: '#ffffff', bottom: '#5a6a8a', skirt: '#5a6a8a', legs: '#f6d6c4', shoe: '#5a3a3a', sole: '#5a3a3a'}},
  officer: {hair: 'short', pal: {skin: '#f2c6a2', skinS: '#d89a72', hair: '#3a2a20', brow: '#2a1a10', top: '#2f3a5a', topS: '#1f2840', tie: '#c0283a', collar: '#ffffff', bottom: '#2f3a5a', legs: '#2f3a5a', shoe: '#1a1a20', sole: '#1a1a20'}},
  barista: {hair: 'ponytail', pal: {skin: '#f8d0b0', skinS: '#e8b090', hair: '#c8642a', brow: '#8a3a10', top: '#2f8a5a', topS: '#1f6a40', pocket: true, bottom: '#3a3a4a', legs: '#3a3a4a', shoe: '#fff', sole: '#2f8a5a'}},
  guard: {hair: 'short', pal: {skin: '#efc29c', skinS: '#dca47c', hair: '#1e1614', brow: '#1e1614', top: '#5a6a4a', topS: '#4a5a3a', tie: '#2a3a2a', collar: '#e8f0e0', bottom: '#3a4a3a', legs: '#3a4a3a', shoe: '#1a1a20', sole: '#1a1a20'}},
  brit1: {hair: 'short', pal: {skin: '#f2c6a2', skinS: '#d89a72', hair: '#8a6a4a', brow: '#5a4030', top: '#c84a3a', topS: '#a83a2a', bottom: '#3a3f55', legs: '#3a3f55', shoe: '#2b2b33', sole: '#2b2b33'}},
  brit2: {hair: 'long', skirt: true, pal: {skin: '#8a5434', skinS: '#734228', hair: '#2a1a10', hairS: '#1a100a', brow: '#1a100a', top: '#e0b040', topS: '#c09020', bottom: '#4a5a7a', skirt: '#4a5a7a', legs: '#8a5434', shoe: '#fff', sole: '#e0b040'}},
  brit3: {hair: 'curly', pal: {skin: '#f8d6b8', skinS: '#e8b898', hair: '#c8642a', brow: '#8a3a10', top: '#4a7ab8', topS: '#3a5a98', bottom: '#5a5a5a', legs: '#5a5a5a', shoe: '#fff', sole: '#4a7ab8'}},
  brit4: {hair: 'spiky', pal: {skin: '#c98d64', skinS: '#a86c44', hair: '#1e1614', brow: '#1e1614', top: '#7a5ad0', topS: '#5a3ab0', bottom: '#2f3a55', legs: '#2f3a55', shoe: '#fff', sole: '#7a5ad0'}},
};
function save(name, fn) { const cv = createCanvas(640, 1560), g = cv.getContext('2d'); fn(g); fs.writeFileSync(`sprites/${name}.png`, cv.toBuffer('image/png')); }
const POSES = {
  hero: {book: {pose: 'hold', mood: 'smug'}, conf: {pose: 'shrug', mood: 'surprised'}, talk: {pose: 'shrug'}, think: {pose: 'down', mood: 'surprised', sweat: true}, dance: {pose: 'fists', mood: 'surprised', sweat: true},
    shock: {pose: 'shrug', mood: 'surprised', sweat: true}, run: {pose: 'cheer', mood: 'surprised', sweat: true}, proud: {pose: 'hips', mood: 'smug'}, cheers: {pose: 'wave', mood: 'grin'}, home: {pose: 'wave', mood: 'grin'}, stare: {pose: 'down', mood: 'sad', sweat: true}},
  granny: {sweet: {pose: 'down', mood: 'smug'}, hold: {pose: 'hold', mood: 'smug'}, wave: {pose: 'wave', mood: 'smug'}},
  officer: {n: {pose: 'down', mood: 'smug'}, look: {pose: 'shrug', mood: 'surprised'}},
  barista: {n: {pose: 'hips', mood: 'grin'}, awk: {pose: 'shrug', mood: 'sad'}, old: {pose: 'down', mood: 'sleepy'}},
  guard: {n: {pose: 'down', mood: 'flat'}, look: {pose: 'shrug', mood: 'surprised'}},
  brit1: {n: {pose: 'down', mood: 'flat'}, glare: {pose: 'down', mood: 'angry'}, cheer: {pose: 'cheer', mood: 'grin'}},
  brit2: {n: {pose: 'down', mood: 'flat'}, glare: {pose: 'hips', mood: 'angry'}, cheer: {pose: 'cheer', mood: 'grin'}},
  brit3: {n: {pose: 'down', mood: 'flat'}, glare: {pose: 'down', mood: 'angry'}, cheer: {pose: 'cheer', mood: 'grin'}},
  brit4: {n: {pose: 'down', mood: 'flat'}, glare: {pose: 'hips', mood: 'angry'}, cheer: {pose: 'cheer', mood: 'grin'}},
};
for (const who in POSES) for (const [k, st] of Object.entries(POSES[who])) [0, .5, 1].forEach((m, i) => save(`${who}_${k}_m${i}`, g => T.draw(g, {x: 320, y: 1540, s: 1, ...C[who], ...st, mouth: m})));
fs.writeFileSync('sprites/list.json', JSON.stringify(fs.readdirSync('sprites').filter(f => f.endsWith('.png')).map(f => f.slice(0, -4))));
console.log('sprites', fs.readdirSync('sprites').length);
