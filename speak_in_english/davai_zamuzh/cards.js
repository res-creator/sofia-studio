// Title cards for audio previews delivered as MP4: node cards.js spec.json outdir  (spec: [{big, sub, note}])
const fs = require('fs'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const [spec, out] = process.argv.slice(2), S = JSON.parse(fs.readFileSync(spec, 'utf8')), W = 1080, H = 1920; fs.mkdirSync(out, {recursive: true});
S.forEach((c, i) => { const cv = createCanvas(W, H), g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a1f5a'); gr.addColorStop(1, '#7a3a8a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(255,246,192,.6)'; g.beginPath(); g.arc((Math.sin(k * 91.7) * .5 + .5) * W, (Math.sin(k * 47.3 + 1) * .5 + .5) * H, 3, 0, 7); g.fill(); }
  g.fillStyle = '#fffaf0'; g.strokeStyle = '#2a2230'; g.lineWidth = 10; g.beginPath(); g.roundRect(80, 560, 920, 760, 50); g.fill(); g.stroke();
  T.fitText(g, c.big, {x: 120, y: 620, w: 840, h: 260}, {maxSize: 220, pad: 6, color: '#d63a8a', font: 'NBL, NBC'});
  T.fitText(g, c.sub, {x: 120, y: 900, w: 840, h: 250}, {maxSize: 80, pad: 6, lines: 3, color: '#2a2230', font: 'NBL, NBC'});
  if (c.note) T.fitText(g, c.note, {x: 120, y: 1160, w: 840, h: 120}, {maxSize: 46, pad: 6, lines: 2, color: '#6a5a70', font: 'NBL, NBC'});
  if (c.head) T.fitText(g, c.head, {x: 80, y: 250, w: 920, h: 200}, {maxSize: 84, pad: 6, lines: 2, color: '#ffffff', font: 'NBL, NBC'});
  fs.writeFileSync(`${out}/card${String(i).padStart(2, '0')}.png`, cv.toBuffer('image/png')); });
console.log('cards', S.length);
