// Test sheet for toon v2: outfits, emotions, mouth/jaw sequence.   node toonv2_sheet.js [out/toonv2_sheet.png] [toon module]
const fs = require('fs'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const T = require(process.argv[3] || './toon');
GlobalFonts.registerFromPath(__dirname + '/fonts/nunito-latin-900-normal.woff2', 'NB');
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, seated: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}};
const CW = 300, CH = 360, cols = 6, rows = 4, cv = createCanvas(CW * cols, CH * rows + 40), g = cv.getContext('2d');
g.fillStyle = '#f6eef0'; g.fillRect(0, 0, cv.width, cv.height);
const REST = s => [[s * 78, -860], [s * 150, -720], [s * 100, -625]], WAVE = s => s > 0 ? [[78, -860], [210, -960], [240, -1110]] : REST(s), HIP = s => [[s * 78, -860], [s * 170, -740], [s * 96, -640]];
function star(x, y, r) { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * .42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = '#f2c820'; g.fill(); g.strokeStyle = '#2a2230'; g.lineWidth = 3; g.stroke(); }
function cell(i, j, label, st, head) { const x0 = i * CW, y0 = j * CH + 40; g.save(); g.beginPath(); g.rect(x0 + 4, y0 + 4, CW - 8, CH - 8); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(x0, y0, CW, CH);
  const s = head ? .42 : .25, cx = x0 + CW / 2, fy = head ? y0 + 210 + 1062 * s : y0 + 340 + 600 * s;
  T.draw(g, {...ZH, x: cx, y: fy, s, ...st}); if (!head) star(cx - 40 * s, fy - 790 * s, 12);
  g.restore(); g.fillStyle = '#2a2230'; g.font = '22px NB'; g.textAlign = 'center'; g.fillText(label, x0 + CW / 2, y0 + CH - 14); }
g.fillStyle = '#2a2230'; g.font = '28px NB'; g.textAlign = 'left'; g.fillText('toon v2 — outfits / emotions / mouth + jaw', 16, 30);
const OUT = [['sequins', REST, 'smug'], ['leopard', WAVE, 'grin'], ['gold', HIP, 'dreamy'], ['blazer', REST, 'smugside'], ['fitness', WAVE, 'proud'], ['leopard', HIP, 'flirty']];
OUT.forEach(([o, a, m], i) => cell(i, 0, o, {outfit: o, arms: a, mood: m, front: true}, false));
const EM = ['laugh', 'shocked', 'disgusted', 'flirty', 'eyeroll', 'smugside', 'cryinglaugh', 'dreamy', 'proud', 'angry', 'worried', 'surprised'];
EM.forEach((m, k) => cell(k % 6, 1 + Math.floor(k / 6), m, {mood: m, outfit: 'leopard', arms: REST, front: true, t: .3}, true));
const MO = [[0, .5, 'closed'], [.2, .2, 'small o'], [.25, .8, 'e'], [.5, .2, 'o'], [.55, .7, 'a'], [.95, .5, 'wide A']];
MO.forEach(([m, v, l], k) => cell(k, 3, `${l} (${m})`, {mood: 'neutral', mouth: m, vis: v, outfit: 'leopard', arms: REST, front: true}, true));
fs.mkdirSync(__dirname + '/out', {recursive: true}); fs.writeFileSync(process.argv[2] || __dirname + '/out/toonv2_sheet.png', cv.toBuffer('image/png'));
