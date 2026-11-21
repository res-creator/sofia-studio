// 2D cartoon characters (toon.js) exported as transparent PNG cutouts for the 3D world.
// front standing: 640x1440 (feet at bottom). front seated: 560x640 (torso bottom at bottom). back seated: 420x620.
const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas'), T = require('./toon'), C = require('./cast_toon');
const INK = '#3a2f3a'; fs.mkdirSync('sprites', {recursive: true});
const X = { // extra classmates (palette variants)
  kid1: {hair: 'curly', pal: {skin: '#7a4a30', skinS: '#643a24', hair: '#1e1410', brow: '#1e1410', top: '#e05a6a', topS: '#c03a4a', bottom: '#2f3a55', legs: '#2f3a55', shoe: '#fff', sole: '#e05a6a'}},
  kid2: {hair: 'long', skirt: true, pal: {skin: '#f8d6b8', skinS: '#e8b898', hair: '#e8b04a', hairS: '#c8902a', brow: '#a07028', top: '#7ac0e0', topS: '#5aa0c0', bottom: '#3a4a6a', skirt: '#3a4a6a', legs: '#f8d6b8', shoe: '#fff', sole: '#7ac0e0'}},
  kid3: {hair: 'spiky', pal: {skin: '#f0c49c', skinS: '#dca47c', hair: '#c8642a', brow: '#8a3a10', top: '#f0a030', topS: '#d08010', bottom: '#4a5a7a', legs: '#4a5a7a', shoe: '#fff', sole: '#f0a030'}},
};
const ALL = {...C, ...X};
function save(name, w, h, fn) { const cv = createCanvas(w, h), g = cv.getContext('2d'); fn(g); fs.writeFileSync(`sprites/${name}.png`, cv.toBuffer('image/png')); }
const MOUTHS = [0, .5, 1];
const front = (name, who, st) => MOUTHS.forEach((m, i) => save(`${name}_m${i}`, 640, 1560, g => T.draw(g, {x: 320, y: 1540, s: 1, ...ALL[who], ...st, mouth: m})));
const seat = (name, who, st) => MOUTHS.forEach((m, i) => save(`${name}_m${i}`, 560, 640, g => T.draw(g, {x: 280, y: 640 + 520 * .7, s: .7, seated: true, pose: 'desk', ...ALL[who], ...st, mouth: m})));
// teacher (standing) in four moods
for (const [k, st] of Object.entries({smug: {mood: 'smug'}, angry: {mood: 'angry'}, pain: {mood: 'sad', blink: true}, sweet: {mood: 'smug', brows: 'up'}})) front(`teacher_${k}`, 'teacher', {pose: 'hips', ...st});
// standing kids
front('vova_wipe', 'vova', {pose: 'wave', mood: 'surprised', sweat: true});
front('sasha_stand', 'sasha', {pose: 'down', mood: 'smug'}); front('sasha_win', 'sasha', {pose: 'wave', mood: 'grin'});
front('hero_sad', 'hero', {pose: 'down', mood: 'sad'}); front('hero_shrug', 'hero', {pose: 'shrug', mood: 'surprised'});
// seated, facing the board (we see faces from the front)
const SEATED = {hero_n: ['hero', {mood: 'flat'}], hero_o: ['hero', {mood: 'surprised'}], hero_sad: ['hero', {mood: 'sad'}], hero_sleep: ['hero', {mood: 'sleepy', blink: true}],
  hero_hold: ['hero', {pose: 'hold', mood: 'surprised', sweat: true}], hero_proud: ['hero', {pose: 'hold', mood: 'grin'}], hero_sweat: ['hero', {mood: 'surprised', sweat: true}],
  vova_n: ['vova', {mood: 'flat'}], vova_o: ['vova', {mood: 'surprised'}], sasha_n: ['sasha', {mood: 'smug'}], lena_n: ['lena', {mood: 'flat'}],
  kid1_n: ['kid1', {mood: 'flat'}], kid2_n: ['kid2', {mood: 'flat'}], kid3_n: ['kid3', {mood: 'flat'}]};
for (const [n, [who, st]] of Object.entries(SEATED)) seat(n, who, st);
for (const who of ['vova', 'sasha', 'lena', 'kid1', 'kid2', 'kid3']) { seat(`${who}_bored`, who, {mood: 'sleepy'}); seat(`${who}_sad`, who, {mood: 'sad'}); }
seat('hero_bored', 'hero', {mood: 'sleepy'}); seat('lena_tongue', 'lena', {tongue: true}); seat('vova_tongue', 'vova', {tongue: true}); seat('kid1_tongue', 'kid1', {tongue: true}); seat('kid2_tongue', 'kid2', {tongue: true}); seat('kid3_tongue', 'kid3', {tongue: true}); seat('sasha_tongue', 'sasha', {tongue: true}); seat('hero_tongue', 'hero', {tongue: true});
// back view of a seated student
function back(g, pal, hair, x, y, s, raise) { const P = () => g.beginPath(); const fill = (c, lw = 6) => { if (c) { g.fillStyle = c; g.fill(); } g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); };
  g.save(); g.translate(x, y); g.scale(s, s);
  if (raise) { g.lineCap = 'round'; for (const [w, c] of [[50, INK], [36, pal.top]]) { P(); g.moveTo(110, 300); g.lineTo(150, 120); g.lineTo(170, -60); g.strokeStyle = c; g.lineWidth = w; g.stroke(); } P(); g.ellipse(172, -84, 28, 32, 0, 0, 7); fill(pal.skin); }
  const torso = () => { P(); g.moveTo(-120, 250); g.lineTo(120, 250); g.lineTo(155, 500); g.lineTo(-155, 500); g.closePath(); };
  torso(); fill(pal.top); g.save(); torso(); g.clip(); g.fillStyle = pal.topS; g.fillRect(95, 240, 80, 270); g.restore(); torso(); fill(null);
  P(); g.roundRect(-34, 200, 68, 70, 12); fill(pal.skinS);
  for (const q of [-1, 1]) { P(); g.ellipse(q * 142, 130, 20, 34, 0, 0, 7); fill(pal.skin); }
  if (hair === 'spiky') { P(); for (let k = 0; k <= 16; k++) { const a = Math.PI * (1 + k / 16), r = k % 2 ? 175 : 145; const px = Math.cos(a) * r, py = 120 + Math.sin(a) * r * 1.05; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineTo(150, 205); g.lineTo(-150, 205); g.closePath(); fill(pal.hair); }
  else if (hair === 'ponytail') { P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); fill(pal.hair); P(); g.moveTo(-30, 100); g.quadraticCurveTo(0, 300, 30, 100); fill(pal.hair); P(); g.ellipse(0, 90, 34, 30, 0, 0, 7); fill('#e05a2a'); }
  else if (hair === 'long') { P(); g.moveTo(-150, 120); g.lineTo(-160, 330); g.lineTo(160, 330); g.lineTo(150, 120); g.closePath(); fill(pal.hair); P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); fill(pal.hair); }
  else if (hair === 'curly') { for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; P(); g.arc(Math.cos(a) * 110, 120 + Math.sin(a) * 110, 50, 0, 7); fill(pal.hair, 5); } P(); g.arc(0, 120, 110, 0, 7); g.fillStyle = pal.hair; g.fill(); }
  else { P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); fill(pal.hair); }
  g.restore(); }
const HAIR = {hero: 'spiky', sasha: 'short', lena: 'ponytail', vova: 'short', kid1: 'curly', kid2: 'long', kid3: 'spiky'};
for (const who in HAIR) save(`back_${who}`, 420, 760, g => back(g, ALL[who].pal, HAIR[who], 210, 180, 1.08));
save('back_hero_raise', 420, 760, g => back(g, ALL.hero.pal, 'spiky', 210, 180, 1.08, true));
console.log('sprites', fs.readdirSync('sprites').length);
