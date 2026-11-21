// 2D cartoon characters (toon.js) exported as transparent PNG cutouts for the 3D world.
const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas'), T = require('./toon'), C = require('./cast_toon');
const INK = '#3a2f3a';
function save(name, w, h, fn) { const cv = createCanvas(w, h), g = cv.getContext('2d'); fn(g); fs.writeFileSync(`sprites/${name}.png`, cv.toBuffer('image/png')); }
// front view, feet at the bottom edge
for (const [n, who, st] of [['teacher', 'teacher', {pose: 'hips', mood: 'smug'}], ['teacher_talk', 'teacher', {pose: 'hips', mouth: .7}], ['teacher_angry', 'teacher', {pose: 'hips', mood: 'angry', mouth: .5}]])
  save(n, 640, 1440, g => T.draw(g, {x: 320, y: 1420, s: 1, ...C[who], ...st}));
// back view of a seated student (head + torso + arms), bottom edge = seat level
function back(g, pal, hair, x, y, s) { const P = () => g.beginPath(); const fill = (c, lw = 6) => { if (c) { g.fillStyle = c; g.fill(); } g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); };
  g.save(); g.translate(x, y); g.scale(s, s);
  P(); g.moveTo(-120, 250); g.lineTo(120, 250); g.lineTo(155, 500); g.lineTo(-155, 500); g.closePath(); fill(pal.top);
  g.save(); P(); g.moveTo(-120, 250); g.lineTo(120, 250); g.lineTo(155, 500); g.lineTo(-155, 500); g.closePath(); g.clip(); g.fillStyle = pal.topS; g.fillRect(95, 240, 80, 270); g.restore();
  P(); g.moveTo(-120, 250); g.lineTo(120, 250); g.lineTo(155, 500); g.lineTo(-155, 500); g.closePath(); fill(null);
  P(); g.roundRect(-34, 200, 68, 70, 12); fill(pal.skinS);
  for (const q of [-1, 1]) { P(); g.ellipse(q * 142, 130, 20, 34, 0, 0, 7); fill(pal.skin); }
  if (hair === 'spiky') { P(); for (let k = 0; k <= 16; k++) { const a = Math.PI * (1 + k / 16), r = k % 2 ? 175 : 145; const px = Math.cos(a) * r, py = 120 + Math.sin(a) * r * 1.05; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineTo(150, 205); g.lineTo(-150, 205); g.closePath(); fill(pal.hair); }
  else if (hair === 'ponytail') { P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); fill(pal.hair); P(); g.ellipse(0, 90, 34, 30, 0, 0, 7); fill('#e05a2a'); P(); g.moveTo(-30, 100); g.quadraticCurveTo(0, 300, 30, 100); fill(pal.hair); }
  else { P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); fill(pal.hair); }
  g.restore(); }
for (const [n, who, hair] of [['back_hero', 'hero', 'spiky'], ['back_sasha', 'sasha', 'short'], ['back_lena', 'lena', 'ponytail'], ['back_vova', 'vova', 'short']])
  save(n, 420, 620, g => back(g, C[who].pal, hair, 210, 40, 1.08));
console.log('sprites ok');
