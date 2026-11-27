// EP19 thumbnails (owner's Hong Kong look): node ep19_kiruna/cover.js after cover_base.py
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
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
  process.chdir(__dirname + '/..');
  await make('covers_v5_base/kiruna_church.jpg', 'ep19_kiruna/kiruna_cover_A.jpg', [['SWEDEN', 200, 120, '#FFFFFF'], ['THEY MOVED', 340, 130, Y], ['A CHURCH', 520, 180, Y]], [600, 580, 640, 680, 830, 655]);
  await make('covers_v5_base/kiruna_mine.jpg', 'ep19_kiruna/kiruna_cover_B.jpg', [['KIRUNA', 200, 120, '#FFFFFF'], ['THE GROUND', 340, 130, Y], ['IS CAVING IN', 520, 170, Y]], [700, 300, 850, 150, 1050, 200]);
})();
