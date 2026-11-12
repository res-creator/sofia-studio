// YouTube thumbnail 1280x720, "Cutaway" style. node cover.js OUT_A.jpg OUT_B.jpg
const K = require('../atlaskit/core'); const fs = require('fs');
const { C, F, text, chip, hexA, rr, hash } = K; const W = 1280, H = 720;
async function make(out, variant) {
  if (variant === 'B') { const X = require('../atlaskit/xsec'); const big = K.createCanvas(1920, 1080), b = big.getContext('2d');
    X.xsec(b, 3, 6, { house: 'block', cx: 1240, season: 0, frost: 1, talik: 0.8, heat: 0, ruler: false, seasonTag: false, snowfall: false });
    const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
    ctx.drawImage(big, 0, 0, 1920, 1080, -40, -58, 1920 * 0.72, 1080 * 0.72);
    text(ctx, 'BUILT', 60, 548, { size: 150, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 18 });
    ctx.save(); ctx.translate(60, 700); chip(ctx, 'ON ICE', 0, 0, { size: 130, bg: C.yellow, color: C.ink }); ctx.restore();
    K.coordTag(ctx, 'NORILSK · 69°N 88°E', 26, 60); fs.writeFileSync(out, cv.toBuffer('image/jpeg', 92)); return; }
  const img = await K.loadImage(__dirname + '/assets/' + (variant === 'B' ? 'kirova.jpg' : 'house1.jpg'));
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const cut = 400;
  // photo on top
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, cut); ctx.clip();
  const s = Math.max(W / img.width, cut / img.height) * (variant === 'B' ? 1.05 : 1.25); const dw = img.width * s, dh = img.height * s;
  ctx.drawImage(img, W - dw * 0.86, cut - dh * 0.86, dw, dh);
  ctx.fillStyle = 'rgba(20,40,90,0.18)'; ctx.fillRect(0, 0, W, cut); ctx.restore();
  // cross-section below
  const g = ctx.createLinearGradient(0, cut, 0, H); g.addColorStop(0, C.permaL); g.addColorStop(1, C.permaD); ctx.fillStyle = g; ctx.fillRect(0, cut, W, H - cut);
  ctx.fillStyle = '#5D6F8F'; ctx.fillRect(0, cut, W, 34); ctx.fillStyle = C.snow; ctx.fillRect(0, cut - 6, W, 8);
  ctx.fillStyle = hexA(C.frost, 0.45); for (let i = 0; i < 50; i++) { ctx.beginPath(); ctx.ellipse(hash(i) * W, cut + 60 + hash(i + 9) * 260, 14 + hash(i + 3) * 26, 3 + hash(i + 4) * 3, 0, 0, 7); ctx.fill(); }
  const px = [760, 850, 940, 1030, 1120, 1210];
  for (const x of px) { ctx.fillStyle = hexA(C.frost, 0.6); rr(ctx, x - 16, cut + 34, 32, 230, 12); ctx.fill(); ctx.fillStyle = C.concrete; ctx.fillRect(x - 8, cut - 30, 16, 290); ctx.fillStyle = C.concreteD; ctx.fillRect(x + 3, cut - 30, 5, 290); }
  // jagged "cut" edge line
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, cut + 2); ctx.lineTo(W, cut + 2); ctx.stroke();
  // headline
  const tx = 60;
  text(ctx, 'BUILT', tx, 548, { size: 150, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(tx, 700); chip(ctx, 'ON ICE', 0, 0, { size: 130, bg: C.yellow, color: C.ink }); ctx.restore();
  K.coordTag(ctx, 'NORILSK · 69°N 88°E', 26, 60);
  fs.writeFileSync(out, cv.toBuffer('image/jpeg', 92));
}
(async () => { await make(process.argv[2], 'A'); if (process.argv[3]) await make(process.argv[3], 'B'); })();
