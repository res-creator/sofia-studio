// Thumbnails v5 step 2: Anton stacked lines (white + yellow #FFE01B), soft shadow, curved yellow arrow. Run after covers_v5.py.
const K = require('./atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const W = 1280, H = 720, Y = '#FFE01B';
const line = (ctx, s, x, y, size, color) => { ctx.save(); ctx.font = `${size}px Anton`; ctx.letterSpacing = '0px';
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 5; ctx.fillStyle = color; ctx.fillText(s, x, y);
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.strokeText(s, x, y); ctx.fillText(s, x, y); ctx.restore(); };
const arrow = (ctx, x0, y0, cx, cy, x1, y1, color = Y) => { ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - cy, x1 - cx), L = 46; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * 18, y1 + Math.sin(a) * 18);
  ctx.lineTo(x1 + Math.cos(a + 2.55) * L, y1 + Math.sin(a + 2.55) * L); ctx.lineTo(x1 + Math.cos(a - 2.55) * L, y1 + Math.sin(a - 2.55) * L); ctx.closePath(); ctx.fill(); ctx.restore(); };
const make = async (base, out, lines, arr) => { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); ctx.drawImage(await loadImage(base), 0, 0, W, H);
  for (const [s, y, size, c] of lines) line(ctx, s, 56, y, size, c); if (arr) arrow(ctx, ...arr); fs.writeFileSync(out, cv.toBuffer('image/jpeg', 93)); console.log(out); };
(async () => {
  await make('covers_v5_base/singapore.jpg', 'ep14_singapore/singapore_cover_I.jpg', [['SINGAPORE', 230, 132, '#FFFFFF'], ['THIS LAND', 360, 124, Y], ['WAS SEA', 520, 168, Y]], [540, 290, 720, 250, 800, 420]);
  await make('covers_v5_base/dubai.jpg', 'ep15_dubai/dubai_cover_I.jpg', [['DUBAI', 220, 132, '#FFFFFF'], ['DRINKS', 360, 132, Y], ['THE SEA', 530, 176, Y]], [620, 470, 650, 620, 860, 610]);
  await make('covers_v5_base/tokyo.jpg', 'ep16_tokyo/tokyo_cover_I.jpg', [['TOKYO', 220, 132, '#FFFFFF'], ['20 SECONDS', 360, 124, Y], ['EARLY', 530, 176, Y]], [470, 470, 560, 560, 640, 470]);
  await make('covers_v5_base/aleutians.jpg', 'ep11_aleutians/aleutians_cover_I.jpg', [['ALASKA', 220, 132, '#FFFFFF'], ['JAPAN LEFT', 360, 132, Y], ['THIS', 540, 190, Y]], [400, 470, 620, 620, 840, 470]);
})();
// Singapore v2 (CTR 1.3% on the first cover): before/after split, Hong Kong typography
(async () => {
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); ctx.drawImage(await loadImage('covers_v5_base/singapore_split.jpg'), 0, 0, W, H);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(W / 2 - 5, 0, 10, H);
  line(ctx, '1964', 120, 690, 64, '#FFFFFF'); line(ctx, 'TODAY', 1060, 690, 64, Y);
  line(ctx, 'SINGAPORE', 56, 150, 120, '#FFFFFF'); line(ctx, '+28% LAND', 56, 300, 150, Y); line(ctx, 'FROM THE SEA', 56, 450, 130, Y);
  arrow(ctx, 860, 470, 900, 600, 960, 600);
  fs.writeFileSync('ep14_singapore/singapore_cover_J.jpg', cv.toBuffer('image/jpeg', 93)); console.log('J');
})();
