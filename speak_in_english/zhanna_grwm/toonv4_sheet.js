// toon v4 test sheet: hand shapes, hip pose, pointing, arm raised in front of the face — 2 outfits, v3 vs v4 side by side.
// node toonv4_sheet.js [out.png] [v3 toon.js]
const fs = require('fs'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const T4 = require('./toon'), T3 = require(process.argv[3] || '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/toon_v3.js');
GlobalFonts.registerFromPath(__dirname + '/fonts/nunito-latin-900-normal.woff2', 'NB');
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, seated: true, nails: '#d63a8a', pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}};
const CW = 260, CH = 380, cols = 8, rows = 4, cv = createCanvas(CW * cols, CH * rows + 50), g = cv.getContext('2d');
g.fillStyle = '#f6eef0'; g.fillRect(0, 0, cv.width, cv.height);
const REST = s => [[s * 78, -860], [s * 150, -720], [s * 100, -625]];
const P = {
  hips: s => [[s * 78, -860], [s * 175, -745], [s * 98, -640]],
  point: s => s > 0 ? [[78, -860], [230, -880], [360, -930]] : [[-78, -860], [-175, -745], [-98, -640]],
  face: s => s > 0 ? [[78, -860], [235, -900], [105, -1012]] : [[-78, -860], [-175, -745], [-98, -640]],
  up: s => s > 0 ? [[78, -860], [220, -960], [250, -1110]] : REST(s),
};
function cell(i, j, label, T, st, pose, hands, raise) { const x0 = i * CW, y0 = j * CH + 50; g.save(); g.beginPath(); g.rect(x0 + 3, y0 + 3, CW - 6, CH - 6); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(x0, y0, CW, CH);
  const s = .27, cx = x0 + CW / 2, fy = y0 + 330 + 560 * s, arms = T.ik ? T.ik(pose) : pose;
  T.draw(g, {...ZH, ...st, x: cx, y: fy, s, arms, ik: false, front: true, hands});
  if (raise) { g.save(); g.translate(cx, fy); g.scale(s, s); T.drawArm(g, {...ZH, ...st}, 1, arms(1), null, hands ? hands[1] : undefined); g.restore(); }   // renderer's raised-arm pass
  g.restore(); g.fillStyle = '#2a2230'; g.font = '19px NB'; g.textAlign = 'center'; g.fillText(label, x0 + CW / 2, y0 + CH - 12); }
g.fillStyle = '#2a2230'; g.font = '26px NB'; g.textAlign = 'left'; g.fillText('toon v3 (left of each pair) vs v4 (right): one-silhouette arms, sleeves, hand shapes', 14, 34);
const rowsDef = [['leopard', 0], ['gold', 1]];
for (const [o, r] of rowsDef) {
  const st = {outfit: o, mood: 'smug'};
  const tests = [['hips', P.hips, {1: 'fist', '-1': 'fist'}, false], ['point', P.point, {1: 'point', '-1': 'fist'}, false], ['hand at face', P.face, {1: 'open', '-1': 'fist'}, true], ['wave up', P.up, {1: 'open', '-1': 'open'}, true]];
  tests.forEach(([n, pose, hands, raise], k) => { cell(k * 2, r, `v3 ${o} ${n}`, T3, st, pose, null, raise); cell(k * 2 + 1, r, `v4 ${o} ${n}`, T4, st, pose, hands, raise); }); }
// hand shapes (v4), big
const shapes = ['open', 'fist', 'point', 'indexUp', 'thumbsUp', 'open'];
for (let k = 0; k < 8; k++) { const x0 = k * CW, y0 = 2 * CH + 50; g.fillStyle = '#ffffff'; g.fillRect(x0 + 3, y0 + 3, CW - 6, CH * 2 - 6); }
shapes.slice(0, 5).forEach((sh, k) => { const x0 = k * CW, y0 = 2 * CH + 50; for (const [sd, yy] of [[1, 160], [-1, 340]]) T4.drawHand(g, sh, x0 + CW / 2 - 30, y0 + yy, sd > 0 ? 0 : Math.PI, 2.0, '#f4c8a8', '#d63a8a', sd);
  g.fillStyle = '#2a2230'; g.font = '22px NB'; g.textAlign = 'center'; g.fillText(sh + ' (R / L)', x0 + CW / 2, y0 + 420); });
// shush pose + sequins hips + fitness point (v4)
const extra = [['v4 shush (leopard)', {outfit: 'leopard', mood: 'smugside', sh: 1}, s => s > 0 ? [[78, -860], [128, -812], [108, -774]] : [[-78, -860], [-175, -745], [-98, -640]], {1: 'indexUp', '-1': 'fist'}],
  ['v4 sequins hips', {outfit: 'sequins', mood: 'proud'}, P.hips, {1: 'fist', '-1': 'fist'}], ['v4 fitness thumbs-up', {outfit: 'fitness', mood: 'grin'}, s => s > 0 ? [[78, -860], [190, -780], [210, -880]] : [[-78, -860], [-175, -745], [-98, -640]], {1: 'thumbsUp', '-1': 'fist'}]];
extra.forEach(([n, st, pose, hands], k) => { const i = 5 + k, x0 = i * CW, y0 = 2 * CH + 50; g.save(); g.beginPath(); g.rect(x0 + 3, y0 + 3, CW - 6, CH * 2 - 6); g.clip();
  const s = .42, cx = x0 + CW / 2, fy = y0 + 560 + 560 * s; T4.draw(g, {...ZH, ...st, x: cx, y: fy, s, arms: T4.ik(pose), ik: false, front: true, hands}); g.restore();
  g.fillStyle = '#2a2230'; g.font = '19px NB'; g.textAlign = 'center'; g.fillText(n, x0 + CW / 2, y0 + 2 * CH - 14); });
fs.mkdirSync(__dirname + '/out', {recursive: true}); fs.writeFileSync(process.argv[2] || __dirname + '/out/toonv4_sheet.png', cv.toBuffer('image/png'));
