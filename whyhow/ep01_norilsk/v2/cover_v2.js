// Thumbnail v2 (1280x720): night block on piles, warm windows, thawing (orange) ground, "−53°C" + "BUILT ON ICE".
const K = require('../../atlaskit/core'); const X = require('../../atlaskit/xsec'); const fs = require('fs');
const { C, F, text, chip } = K; const W = 1280, H = 720;
const big = K.createCanvas(1920, 1080), b = big.getContext('2d');
X.xsec(b, 3, 6, { house: 'block', cx: 1300, season: 0, frost: 0.4, talik: 1, warm: 0.35, ruler: false, seasonTag: false, snowfall: true, zoom: 1 });
const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
ctx.drawImage(big, 0, 0, 1920, 1080, -120, -70, 1920 * 0.78, 1080 * 0.78);
const g = ctx.createRadialGradient(950, 480, 40, 950, 480, 420); g.addColorStop(0, 'rgba(255,140,60,0.35)'); g.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
text(ctx, '−53°C', 50, 200, { size: 170, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
text(ctx, 'BUILT', 50, 520, { size: 130, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
ctx.save(); ctx.translate(50, 660); chip(ctx, 'ON ICE', 0, 0, { size: 116, bg: C.yellow, color: C.ink }); ctx.restore();
fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92));
