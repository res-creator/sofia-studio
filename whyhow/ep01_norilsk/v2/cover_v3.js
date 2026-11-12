// Thumbnails with NORILSK (1280x720). node cover_v3.js OUT_A.jpg OUT_B.jpg
const K = require('../../atlaskit/core'); const X = require('../../atlaskit/xsec'); const fs = require('fs');
const { C, F, text, chip } = K; const W = 1280, H = 720;
function base() { const big = K.createCanvas(1920, 1080), b = big.getContext('2d');
  X.xsec(b, 3, 6, { house: 'block', cx: 1300, season: 0, frost: 0.4, talik: 1, warm: 0.35, ruler: false, seasonTag: false, snowfall: true, zoom: 1 });
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); ctx.drawImage(big, 0, 0, 1920, 1080, -120, -70, 1920 * 0.78, 1080 * 0.78);
  const g = ctx.createRadialGradient(950, 480, 40, 950, 480, 420); g.addColorStop(0, 'rgba(255,140,60,0.35)'); g.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sh = ctx.createLinearGradient(0, 0, 640, 0); sh.addColorStop(0, 'rgba(6,12,24,0.75)'); sh.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, 700, H);
  return [cv, ctx]; }
// A: NORILSK + BUILT ON ICE, small −53°C badge
{ const [cv, ctx] = base();
  text(ctx, 'NORILSK', 50, 190, { size: 150, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
  text(ctx, 'BUILT', 50, 520, { size: 130, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 660); chip(ctx, 'ON ICE', 0, 0, { size: 116, bg: C.yellow, color: C.ink }); ctx.restore();
  ctx.save(); ctx.translate(55, 300); chip(ctx, '−53°C', 0, 0, { size: 70, bg: C.ice, color: C.cream }); ctx.restore();
  fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
// B: NORILSK + question
{ const [cv, ctx] = base();
  text(ctx, 'NORILSK', 50, 190, { size: 150, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
  text(ctx, "WHY DON'T", 50, 520, { size: 110, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 660); chip(ctx, 'THEY SINK?', 0, 0, { size: 110, bg: C.yellow, color: C.ink }); ctx.restore();
  ctx.save(); ctx.translate(55, 300); chip(ctx, '−53°C', 0, 0, { size: 70, bg: C.ice, color: C.cream }); ctx.restore();
  fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
